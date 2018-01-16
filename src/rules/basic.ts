// 基础规则
import * as _ from 'lodash';
import Player from '../playerDetail';
import { Meld } from '../meld';
import { Card, ClaimType, sortTiles } from '../tile';
import { assembly, eyeAssembly } from '../table/data';

// 检查是否胡牌
export function canWin(player: Player): boolean {
  const tiles = sortTiles(player.handTiles);
  const remainTiles = checkMelds(tiles, player);
  player.canWin = !!remainTiles.length;

  return player.canWin;
}

// 检查是否可以听牌
export function canReadyHand(player: Player): void {
  const tiles = sortTiles(player.handTiles);
  const remainTiles = checkMelds(tiles, player);

  // 找出剩余的牌
  if (remainTiles.length) {
    // 找出是否可以听牌、听什么牌
    player.remainTiles = remainTiles;
    checkReadyHand(player);
  }
}

// 检查牌成组的牌
function checkMelds(tiles: number[], player?: Player): number[] {
  const orderGroups = groupByOrder(tiles, 1);
  let remainTiles: number[] = [];

  orderGroups.forEach(function(group) {
    const len = group.length;
    const remainder = len % 3;

    if (remainder === 0 || remainder === 2) {
      const size = groupSize(group);
      const table = remainder === 2 ? eyeAssembly[len] : assembly[len];

      if (_.indexOf(table, size) === -1) {
        remainTiles = remainTiles.concat(group);
        return;
      }

      // 找出将
      if (remainder === 2 && player) {
        player.eye.push(getEye(group, size));
      }
    } else {
      remainTiles = remainTiles.concat(group);
    }
  });

  return remainTiles;
}

// 找出是否可以听牌，听什么牌 
function checkReadyHand(player: Player): void {
  const remainTiles = player.remainTiles;
  const eye = player.eye;
  const len = remainTiles.length;
  const eyeLen = eye.length;

  if (len === 1) {
    if (eyeLen === 2) {
      // 对碰
      player.readyHand[remainTiles[0]] = [eye[0][0], eye[1][0]];
    }

    // if (eyeLen === 5) {
    //   // 不可能听牌，不考虑
    //   // 豪华七小对
    // }

    return;
  }

  if (len === 2) {
    if (!eyeLen) {
      // 单吊
      player.readyHand[remainTiles[0]] = [remainTiles[1]];
      player.readyHand[remainTiles[1]] = [remainTiles[0]];
    }

    // if (eyeLen === 3) {
    //   // 不可能听牌，不考虑
    // }

    // if (eyeLen === 6) {
    //   // 七小对
    // }

    return;
  }

  // 复杂的来了
  // 只能存在两种类型的牌，并且还要能和其他可连续
  let typeGroups = groupByType(remainTiles);
  const wordTiles = typeGroups.word;

  // 大字超过两个，而且不是最后两个，不可能听牌
  if ( wordTiles && wordTiles.length >= 2) {
    return;
  }

  // 超过两个类型的不成组牌，不可能听牌
  const typeKeys = Object.keys(typeGroups);
  if (typeKeys.length > 2) {
    return;
  }

  // 把同花色的牌一起拿出来比较，这样找才全
  const tiles = player.handTiles;
  typeGroups = groupByType(tiles);
  let partTiles: number[][] = [];

  typeKeys.forEach(function(type) {
    if (type === 'word') {
      return;
    }

    partTiles.push(typeGroups[type]);
  });

  // 如果有大字，肯定打大字才能听牌
  if (wordTiles) {
    partTiles.unshift(wordTiles);
  }

  player.readyHand = checkTing(partTiles);
}

// 检查出一张牌，抓什么牌可以成组
function checkTing(tileGroup: number[][]): _.Dictionary<number[]> {
  const readyHand: _.Dictionary<number[]> = {};
  const gLen = tileGroup.length;

  // 只有一个组，尝试打出每一张牌，剩下的牌抓一张能不能成组
  if (gLen === 1) {
    const tiles = tileGroup[0];
    let last = 0;

    for (let i = 0, len = tiles.length; i < len; i++) {
      const newTiles = tiles.slice();
      const tile = newTiles.splice(i, 1);

      if (tile[0] === last) {
        continue;
      }

      const tingTiles = canTing(newTiles);

      if (tingTiles.length) {
        readyHand[tile[0]] = tingTiles;
      }
    }
  }

  // 两个组，判断哪组花色可以出，哪组花色可以抓
  if (gLen === 2) {
    const groups: number[][][] = [];  // [[[去掉的牌], [增加的牌]]]
    const group1 = tileGroup[0];
    const group2 = tileGroup[1];
    const group1Len = group1.length;
    const group2Len = group2.length;

    if (group1[0] >= Card.East) {
      // 如果有大字，肯定打大字才能听牌
      groups.push(tileGroup)
    } else {
      if (remain02(group1Len - 1) && remain02(group2Len + 1)) {
        groups.push([group1, group2]);
      }

      if (remain02(group2Len - 1) && remain02(group1Len + 1)) {
        groups.push([group2, group1]);
      }
    }

    groups.forEach(function(group) {
      const tiles = group[0];
      let last = 0;

      // 先看移除掉的组是否能成牌，能成牌才加牌
      for (let i = 0, len = tiles.length; i < len; i++) {
        const newTiles = tiles.slice();
        const tile = newTiles.splice(i, 1);

        if (tile[0] === last) {
          continue;
        }

        const remainTiles = checkMelds(newTiles);

        if (!remainTiles.length) {
          const tingTiles = canTing(group[1]);

          if (tingTiles) {
            readyHand[tile[0]] = tingTiles;
          }
        }
      }
    });
  }

  return readyHand;
}

// 检查抓什么牌可以成组
function canTing(tiles: number[]): number[] {
  const tingTiles: number[] = [];
  const len = tiles.length;
  const base = 10 * Math.floor(tiles[0] / 10) + 1;
  const min = Math.max(tiles[0] - 1, base);
  const max = Math.min(tiles[len - 1] + 1, base + 9);

  for (let i = min; i <= max; i++) {
    const remainTiles = checkMelds(sortTiles(tiles.concat([i])));

    if (!remainTiles.length) {
      tingTiles.push(i);
    }
  }

  return tingTiles;
}

// 找到指定间距的顺序分组
function groupByOrder(tiles: number[], gap: number = 1): number[][] {
  const groups: number[][] = [];
  let lastTile = tiles.splice(0, 1)[0];
  let group: number[] = [lastTile];
  const len = tiles.length;

  for (let i = 0; i < len; i++) {
    let tile = tiles[i];

    if (tile - lastTile <= gap) {
      group.push(tile);
    } else {
      groups.push(group);
      group = [tile];
    }

    lastTile = tile;
  }

  groups.push(group);

  return groups;
};

// 看牌是不是能成组，条件是3 * n + 2?
function remain02(num: number): boolean {
  const remainder = num % 3;

  return remainder === 0 || remainder === 2;
}

// 将牌按[万、筒、条、大字]分组
function groupByType(tiles: number[]): _.Dictionary<number[]> {
  const characterTiles: number[] = [];
  const dotTiles: number[] = [];
  const bambooTiles: number[] = [];
  const wordTiles: number[] = [];
  const typeGroups: _.Dictionary<number[]> = {};

  tiles.forEach(function(tile) {
    const i = Math.floor(tile / 10);

    switch(i) {
      case 0:
        characterTiles.push(tile);
        break;
      case 1:
        dotTiles.push(tile);
        break;
      case 2:
        bambooTiles.push(tile);
        break;
      default:
        wordTiles.push(tile);
        break;
    }
  });

  if (characterTiles.length) {
    typeGroups.character = characterTiles;
  }

  if (dotTiles.length) {
    typeGroups.dot = dotTiles;
  }

  if (bambooTiles.length) {
    typeGroups.bamboo = bambooTiles;
  }

  if (wordTiles.length) {
    typeGroups.word = wordTiles;
  }

  return typeGroups;
};

// 获取将牌
// tiles: 成组的牌, 12223; size: 每张牌的个数模型 131
// 尝试把大于2个数的牌取走，看剩下的牌能不能成组，能则说明这个就是将
function getEye(tiles: number[], size: number): number[] {
  let tilesLen = tiles.length;

  if (tilesLen === 2) {
    return tiles;
  }

  let eye: number[] = [];
  const sizes = size.toString().split('');
  const uniqTiles = _.uniq(tiles);

  for (let i = 0, len = sizes.length; i < len; i++) {
    const item = parseInt(sizes[i]);

    if (item >= 2) {
      let flag = true;
      let newSizes = sizes.slice();
      newSizes[i] = (item - 2).toString();
      newSizes = newSizes.join('').split('0');

      newSizes.forEach(function(item) {
        if (!item) {
          return;
        }

        const i = parseInt(item);
        const s = getSizeLength(i);

        if (s % 3 !== 0 || _.indexOf(assembly[s], i) === -1) {
          flag = false;
        }
      });

      if (flag) {
        eye = _.fill(Array(2), uniqTiles[i]);
        break;
      }
    }
  }

  return eye;
}

// 获取长度: 根据每张牌的个数模型; 
function getSizeLength(size: number): number {
  return size.toString().split('').reduce(function(sum, val): number {
    return sum + parseInt(val);
  }, 0);
}

// 获取每张牌个数模型
function groupSize(tiles: number[]): number {
  const groups = groupBy(tiles);
  const sides: number[] = [];

  _.values(groups).forEach(function(group) {
    sides.push(group.length);
  });

  return parseInt(sides.join(''));
}

// 分组
function groupBy(tiles: number[]): _.Dictionary<number[]> {
  return _.groupBy(tiles, function(tile) {
    return tile / 1;
  });
};

// 是否可以行动
export function canClaim(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];
  melds = canPong(tiles, tile);

  if (tile < Card.East) {
    melds = melds.concat(canChow(tiles, tile));
  }

  return melds;
};

// 碰
export function canPong(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];
  let someTiles: number[] = getSomeTile(tiles, tile);
  let len = someTiles.length;

  if (len && len >= 2) {
    melds = canKong(someTiles, tile);

    melds[melds.length] = {
      tiles: melds.length ? someTiles : someTiles.concat(tile),
      type: ClaimType.Pong
    };
  }

  return melds;
};

// 杠
export function canKong(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];

  if (tiles.length === 3) {
    melds[0] = {
      tiles: tiles.concat(tile),
      type: ClaimType.Kong
    };
  }

  return melds;
};

// 是否可以吃
export function canChow(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];
  let rangeTiles: number[] = getRangeTile(tiles, tile);
  let sequences = getSequence(rangeTiles, tile);

  melds = sequences.map(function(sequence) {
    return {
      tiles: sequence,
      type: ClaimType.Chow
    }
  });
  
  return melds;
};

// 获取相同的牌
function getSomeTile(tiles: number[], tile: number): number[] {
  let result: number[] = [];

  tiles.forEach(function(i) {
    if (i === tile) {
      result.push(i);
    }
  });

  return result;
}

// 获取指定范围的牌
function getRangeTile(tiles: number[], tile: number): number[] {
  let result: number[] = []
  const min = Math.floor(tile / 10) * 10 + 1;
  const max = min + 8;
  let left = tile - 2;
  left = Math.max(left, min);
  let right = tile + 2;
  right = Math.min(right, max);

  tiles.forEach(function(i) {
    if (i >= left && i <= right) {
      result.push(i);
    }
  });

  return result;
}

// 获取顺子
function getSequence(tiles: number[], tile: number): number[][] {
  let melds: number[][] = [];
  tiles = _.uniq(_.xor(tiles, [tile]));

  // 将牌组组成3个一起，然后判断是否是顺子
  if (tiles.length >= 2) {
    let sequences: number[][] = [];

    for (let i = 0; i < tiles.length - 1; i++) {
      sequences.push([tiles[i], tiles[i + 1], tile]);
    }

    sequences.forEach(function(meld) {
      const newMeld = sortTiles(meld);

      if (newMeld[0] === newMeld[1] - 1 && newMeld[2] === newMeld[1] + 1) {
        melds.push(meld);
      }
    });
  }

  return melds;
}
