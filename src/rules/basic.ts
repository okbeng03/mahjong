// 基础规则
import * as _ from 'lodash';
import Player from '../playerDetail';
import { Meld, MeldDetail } from '../meld';
import { Card, ClaimType, sortTiles } from '../tile';
import { assembly, eyeAssembly } from '../table/data';

const thirteenOrphans = [
  Card.CharacterOne,
  Card.CharacterNight,
  Card.DotOne,
  Card.DotNight,
  Card.BambooOne,
  Card.BambooNight,
  Card.East,
  Card.South,
  Card.West,
  Card.North,
  Card.Green,
  Card.Red,
  Card.White
];

// 检查是否胡牌
export function canWin(player: Player, tile: number = 0): boolean {
  let tiles
  
  if (tile > 0) {
    tiles = sortTiles(player.handTiles.slice().concat([tile]));
  } else {
    tiles = sortTiles(player.handTiles.slice());
  }
  
  const remainTiles = checkMelds(tiles, player);

  if (remainTiles.length && player.handTiles.length === 14) {
    // 七小对，十三幺
    const readyTiles = checkPair(player.handTiles);

    if (!readyTiles.length) {
      return true;
    }

    const readyTile = checkUniq(player.handTiles);

    if (readyTile === 0) {
      return true;
    }
  }

  player.remainTiles = remainTiles;

  return !remainTiles.length;
}

// 检查是否可以听牌
export function canReadyHand(player: Player): void {
  const tiles = sortTiles(player.handTiles.slice());
  const remainTiles = checkMelds(tiles, player);

  // 找出剩余的牌
  if (remainTiles.length) {
    // 找出是否可以听牌、听什么牌
    player.remainTiles = remainTiles;
    checkReadyHand(player);
  }
}

// 花胡
export function canFlowerWin(tiles: number[], tile: number): number {
  const len = tiles.length;

  if (len >= 4) {
    tiles = sortTiles(tiles);

    if (tile < Card.Plum && tiles.slice(0, 4).join('') === [Card.Spring, Card.Summer, Card.Autumn, Card.Winter].join('')) {
      return 1;
    }
    
    if (tile > Card.Winter && tiles.slice(len - 4).join('') === [Card.Plum, Card.Orchid, Card.Bamboo, Card.Chrysanthemum].join('')) {
      return 2;
    }
  }

  return 0;
}

const dragon = [Card.Green, Card.Red, Card.White];
const pointEye = [2, 5, 8];

// 是否有番
export function hasPoint(player: Player): boolean {
  if (player.hasPoint) {
    return true;
  }

  // 判断门前清
  if (!player.chowTiles.length) {
    return true;
  }

  const pick = player.pick;
  const order = player.round.game.order;
  const banker = player.round.game.banker;
  const point = (pick + 4 - banker) % 4 + 1;

  // 判断花
  if (player.flowerTiles.length && _.findIndex(player.flowerTiles, tile => (tile - 50) % 4 === point) > -1) {
    player.hasPoint = true;
    return true;
  }

  const dragonTiles = dragon.slice().concat([(point - 1) * 2 + 31, (order - 1) * 2 + 31]);
  let needPoint = false;
  let len = player.chowTiles.length;

  // 判断吃的牌是否有三张相同的红中、发财、白板或者令牌，四条有番
  if (len) {
    for (let i = 0; i < len; i++) {
      const meld: MeldDetail = player.chowTiles[i];

      if (meld.type === ClaimType.Pong && dragonTiles.indexOf(meld.tiles[0]) > -1) {
        player.hasPoint = true;
        break;
      }

      if (meld.type === ClaimType.ConcealedKong || meld.type === ClaimType.Expose) {
        player.hasPoint = true;
        break;
      }

      // 有碰，需要番
      if (meld.type === ClaimType.Pong) {
        needPoint = true;
      }
    }

    if (player.hasPoint) {
      return true;
    }
  }

  const eye = player.eye[0][0];
  const groups = _.groupBy(player.handTiles, function(tile) {
    return tile / 1;
  });
  
  // 对子是中、发、白，需要番
  if (!needPoint) {
    if (dragonTiles.indexOf(eye) > -1) {
      needPoint = true;
    }
  }

  let hasPoint = false;
  const keys = Object.keys(groups);

  // 手牌有三张相同的，需要番
  if (!needPoint) {  
    for (let j = 0, kLen = keys.length; j < kLen; j++) {
      const group = groups[keys[j]];

      if (group.length === 3 && group[0] !== eye) {
        needPoint = true;
        continue;
      }

      if (group.length === 3 && dragonTiles.indexOf(group[0]) > -1) {
        hasPoint = true;
      }
    }
  }

  if (needPoint) {
    for (let j = 0, kLen = keys.length; j < kLen; j++) {
      const group = groups[keys[j]];

      if (group.length === 3 && dragonTiles.indexOf(group[0]) > -1) {
        hasPoint = true;
        break;
      }
    }

    // 258
    // 手牌有三张相同的红中、发财、白板或者令牌
    if ((eye < Card.East && pointEye.indexOf(eye % 10) > -1) || hasPoint) {
      return true;
    }
  } else {
    return true;
  }

  return false;
}

// 检查牌成组的牌
function checkMelds(tiles: number[], player?: Player): number[] {
  const orderGroups = groupByOrder(tiles, 1);
  let remainTiles: number[] = [];

  if (player) {
    player.eye = [];
  }

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

  player.readyHand = {};

  if (player.handTiles.length === 14) {
    // 七小对，十三幺
    const readyTiles = checkPair(player.handTiles);

    if (readyTiles.length === 2) {
      player.readyHand[readyTiles[0]] = [readyTiles[1]];
      player.readyHand[readyTiles[1]] = [readyTiles[0]];
      return;
    }

    const readyTile = checkUniq(player.handTiles);

    if (readyTile > 0) {
      player.readyHand[readyTile] = thirteenOrphans;
      return;
    }
  }

  if (eyeLen > 2) {
    return;
  }

  if (len === 1) {
    if (eyeLen === 2) {
      // 对碰
      player.readyHand[remainTiles[0]] = [eye[0][0], eye[1][0]];
    }

    return;
  }

  if (eyeLen === 2) {
    // 对碰
    if (len === 1) {
      player.readyHand[remainTiles[0]] = [eye[0][0], eye[1][0]];
      return;
    }

    remainTiles.forEach((tile, idx) => {
      const newTiles = remainTiles.slice();
      newTiles.splice(idx, 1);

      if (!checkMelds(newTiles).length) {
        player.readyHand[tile] = [eye[0][0], eye[1][0]];
      }
    });

    if (!_.isEmpty(player.readyHand)) {
      return;
    }
  }

  if (len === 2) {
    if (eyeLen === 0) {
      // 单吊
      player.readyHand[remainTiles[0]] = [remainTiles[1]];
      player.readyHand[remainTiles[1]] = [remainTiles[0]];
    }

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
  const tiles = sortTiles(player.handTiles);
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

  // 如果只有用一个剩余分组，并且只有一个目，那还要判断是否存在对碰的情况
  if (partTiles.length === 1 && eyeLen === 1 && partTiles[0].indexOf(eye[0][0]) === -1) {
    partTiles.push(eye[0]);

    const readyHand = checkTing(partTiles);
    
    if (!_.isEmpty(readyHand)) {
      for (let key in readyHand) {
        const item = player.readyHand[key];

        if (typeof item !== 'undefined') {
          player.readyHand[key] = _.union(item, readyHand[key]);
        }
      }
    }
  }
}

// 七小对
function checkPair(tiles: number[]): number[] {
  const groups = groupBy(tiles);
  const keys = Object.keys(groups);
  const len = keys.length;
  const readyTiles = [];

  if (len >= 7) {
    for (let i = 0; i < len; i++) {
      switch(groups[keys[i]].length) {
        case 3:
          readyTiles.push(groups[keys[i]][0]);
        case 2:
          break;
        case 1:
          readyTiles.push(groups[keys[i]][0]);
          break;
      }
    }
  }

  return readyTiles;
}

// 十三幺
function checkUniq(tiles: number[]): number {
  const uniqTiles = _.uniq(sortTiles(tiles.slice()));

  if (uniqTiles.length === 14) {
    const remainTiles = _.pull(uniqTiles, ...thirteenOrphans);

    if (!remainTiles.length) {
      return 0;
    } else if (remainTiles.length === 1) {
      return remainTiles[0];
    }
  }

  return -1;
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
      const tile = newTiles.splice(i, 1)[0];

      if (tile === last) {
        continue;
      }

      const tingTiles = canTing(newTiles);

      if (tingTiles.length) {
        readyHand[tile] = tingTiles;
      }

      last = tile;
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
        const tile = newTiles.splice(i, 1)[0];

        if (tile === last) {
          continue;
        }
        
        const remainTiles = newTiles.length ? checkMelds(newTiles) : [];

        if (!remainTiles.length) {
          const tingTiles = canTing(group[1]);

          if (tingTiles.length) {
            readyHand[tile] = tingTiles;
          }
        }

        last = tile;
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
  const max = Math.min(tiles[len - 1] + 1, base + 8);

  for (let i = min; i <= max; i++) {
    const remainTiles = checkMelds(sortTiles(tiles.concat([i])));

    if (!remainTiles.length) {
      tingTiles.push(i);
    }
  }

  return tingTiles;
}

// 将牌按[万、筒、条、大字]分组
export function groupByType(tiles: number[]): _.Dictionary<number[]> {
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

// 找到指定间距的顺序分组
export function groupByOrder(allTiles: number[], g: number = 1): number[][] {
  allTiles = allTiles.slice();
  const typeGroups = groupByType(allTiles);
  const groups: number[][] = [];

  if (typeGroups.word) {
    _group(typeGroups.word);
  }

  if (typeGroups.character) {
    _group(typeGroups.character, g);
  }

  if (typeGroups.dot) {
    _group(typeGroups.dot, g);
  }

  if (typeGroups.bamboo) {
    _group(typeGroups.bamboo, g);
  }
  
  function _group(tiles: number[], gap: number = 1): void {
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
  }

  return groups;
};

// 看牌是不是能成组，条件是3 * n + 2?
function remain02(num: number): boolean {
  const remainder = num % 3;

  return remainder === 0 || remainder === 2;
}

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
export function groupSize(tiles: number[]): number {
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
export function canClaim(tiles: number[], tile: number, canChow: boolean = true): Meld[] {
  let melds: Meld[] = [];
  melds = checkPong(tiles, tile);

  if (canChow && tile < Card.East) {
    melds = melds.concat(checkChow(tiles, tile));
  }

  return melds;
};

// 杠
export function canKong(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];
  let someTiles: number[] = getSomeTile(tiles, tile);
  let len = someTiles.length;

  if (len && len >= 4) {
    melds[0] = {
      tiles: someTiles.length === 4 ? someTiles : someTiles.concat(tile),
      type: ClaimType.ConcealedKong
    };
  }

  return melds;
};

// 碰
function checkPong(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];
  let someTiles: number[] = getSomeTile(tiles, tile);
  let len = someTiles.length;

  if (len && len >= 2) {
    melds = checkKong(someTiles, tile);

    melds[melds.length] = {
      tiles: melds.length ? someTiles : someTiles.concat(tile),
      type: ClaimType.Pong
    };
  }

  return melds;
};

function checkKong(tiles: number[], tile: number): Meld[] {
  let melds: Meld[] = [];

  if (tiles.length === 3) {
    melds[0] = {
      tiles: tiles.concat(tile),
      type: ClaimType.Expose
    };
  }

  return melds;
};

// 是否可以吃
function checkChow(tiles: number[], tile: number): Meld[] {
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
