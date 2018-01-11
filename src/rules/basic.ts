// 基础规则
import * as _ from 'lodash';
import { Meld } from '../meld';
import { Card, ClaimType, sortTiles } from '../tile';

interface WinCard {
  sole: number,
  tiles: number[]
};

export function readyHand(tiles: number[]): boolean {
  tiles = sortTiles(tiles);
  const groups = groupBy(tiles);
  const orderGroups = getOrderGroup(tiles);
  const soleTiles: number[] = checkSoleTiles(groups, orderGroups);

  if (soleTiles.length > 2) {
    return false;
  }

  const pairs: number[][] = []; // 保存成组的牌
  let melds: Meld[] = []; // 保存对子
  
  // 找出大字是不是能凑成组
  checkWordTiles(groups, melds, pairs);

  // 找出剩余单排，是不是能凑成组
  checkSingleTile(groups, orderGroups, melds, pairs);

  // 检查剩余可能成组的数字牌
  let numberalMelds: Meld[] = checkCertainMelds(groups, orderGroups);

  if (numberalMelds.length) {
    melds = melds.concat(numberalMelds);
  }

  // 检查听的牌
  let leftTiles: number[] = [];
  orderGroups.forEach(function(group) {
    if (group.length) {
      leftTiles = leftTiles.concat(group);
    }
  });
  let leftOrderGroups = groupByOrder(leftTiles, 2);
  let pLen = pairs.length;
  let sLen = soleTiles.length;
  let gLen = leftOrderGroups.length;

  // 长度超过两个，不可能听牌
  // if (pLen + sLen + gLen > 2) {
  //   return false;
  // }

  // 胡牌了
  if (pLen === 1 && !sLen && !gLen) {
    return true;
  }

  // 有可能叫牌
  let winCards: WinCard[] = [];

  // 只有单排，单调
  if (sLen === 2) {
    soleTiles.forEach(function(tile, i) {
      winCards.push({
        sole: tile,
        tiles: [soleTiles[1 - i]]
      });
    });
  }

  // 两对子，出单排，对碰
  if (pLen === 2) {
    if (sLen === 1 && !gLen) {
      winCards.push({
        sole: soleTiles[0],
        tiles: [pairs[0][0], pairs[1][0]]
      });
    }

    // 找单排4，7，10
    if (gLen === 1 && !sLen) {

    }
  }

  // 只要有未成组，都要找最合适的组合

  // 

  // 1单排 + 1未成组，出单排
  if (sLen === 1 && gLen === 1) {

  }  

  // 七小对

  return true;
};

// 检查剩余可能成组的数字牌
function checkCertainMelds(groups: _.Dictionary<number[]>, orderGroups: number[][]): Meld[] {
  let melds: Meld[] = [];

  orderGroups.forEach(function(orderGroup) {
    if (!orderGroup.length) {
      return;
    }

    let tiles: number[] = concatOrder(groups, orderGroup);

    // 找出这个顺序牌总共有多少牌，能不能成为3的倍数，能可能成组，否则不能成组
    if (tiles.length % 3 > 0) {
      return;
    }
  
    // 先找出能成组的
    // 找连续的成组
    let sequenceGroups: number[][] = groupByOrder(orderGroup, 1);
    let tempMelds: Meld[] = []; // 临时成组
    let flag = true;
    checkSingleTile(groups, sequenceGroups, tempMelds);    

    sequenceGroups.forEach(function(group) {
      let len = group.length;

      if (!len) {
        flag = false;
        return;
      }

      let tiles: number[] = concatOrder(groups, group);

      if (tiles.length % 3 > 0) {
        flag = false;
        return;
      }

      let leastTwoTiles: number[] = [];
      let leastThreeTiles: number[] = [];

      group.forEach(function(tile) {
        let groupTiles = groups[tile];

        // 检查有没有2个以上的，这个待会会重点检查，没有2个以上，那必须是顺子
        if (groupTiles.length > 1) {
          leastTwoTiles.push(tile);
        } 
        if (groupTiles.length > 2) {
          leastThreeTiles.push(tile);
        }
      });

      // 没有2个以上，必然是顺子
      if (!leastTwoTiles.length) {
        _.chunk(group, 3).forEach(function(tiles) {
          tempMelds.push({
            tiles: tiles,
            type: ClaimType.Chow
          });
        });

        return;
      }

      // 都是碰子
      if (leastThreeTiles.length === len) {
        _.chunk(tiles, 3).forEach(function(tiles) {
          tempMelds.push({
            tiles: tiles,
            type: ClaimType.Pong
          });
        });

        return;
      }

      // 非上面两种情况的，最起码成两组，最多4组
      // 223344
      // 左右都是对子，必须都成对子
      // 左右只要是三个，先成碰子
      // 有四个的，只取3
      // 左边是对子，接下来两个必须是对子
      if (len >= 3) {
        let meldList: Meld[] = [];

        while(group.length && flag) {
          let tempGroups: _.Dictionary<number[]> = groupBy(tiles);
          let left = _.take(group)[0];
          let leftTiles = tempGroups[left];
          let lLen = leftTiles.length;

          if (lLen >= 3) {
            meldList.push({
              tiles: [left, left, left],
              type: ClaimType.Pong
            });

            tiles.splice(0, 3);

            if (lLen === 4) {
              lLen = 1;
            } else {
              group.splice(0, 1);
              continue;
            }
          }

          if (lLen === 1) {
            let meld = canChow(group, left);

            if (meld.length) {
              let meldTiles = meld[0].tiles;
              meldTiles = sortTiles(meldTiles);
              meld[0].tiles = meldTiles;
              meldList = meldList.concat(meld);
              
              let i = 1

              for (; i < 3; i++) {
                if (tempGroups[group[i]].length > 1) {
                  break;
                }
              }

              group.splice(0, i);
              meldTiles.forEach(function(tile) {
                tiles.splice(_.indexOf(tiles, tile), 1);
              });
            } else {
              flag = false;
              return;
            }
          }

          if (lLen === 2) {
            let _flag = true;
            let size = 3;

            for (let i = 2; i >= 1; i--) {
              let tile = group[i];

              if (tempGroups[tile].length < 2) {
                _flag = false;
                break;
              }

              if (tempGroups[tile].length > 2)  {
                size = i + 1;
              }
            }

            if (_flag) {
              let meld = {
                tiles: [left, left + 1, left + 2],
                type: ClaimType.Chow
              };

              meldList.push(meld);
              meldList.push(meld);

              tiles.splice(0, 6);
              group.splice(0, size);
            } else {
              flag = _flag;
              return;
            }
          }
        }

        if (flag) {
          tempMelds = tempMelds.concat(meldList);
        }

        return;
      }

      flag = false;
    });

    if (flag) {
      melds = melds.concat(tempMelds);
      orderGroup.length = 0;
    }
  });

  return melds;
}

// 去掉确定成组的组
function excludeGroup(groups: _.Dictionary<number[]>, group: number[]): void {
  group.forEach(function(tile) {
    delete groups[tile];
  });

  group.length = 0;
}

// 检查大字
function checkWordTiles(groups: _.Dictionary<number[]>, melds: Meld[], pairs: number[][]): void {
  for (let key in groups) {
    if (parseInt(key) >= Card.East) {
      const tiles = groups[key];
      const len = tiles.length;

      if (len === 2) {
        pairs.push(tiles);
      } else {
        melds.push({
          tiles: tiles,
          type: len === 3 ? ClaimType.Pong : ClaimType.Kong
        });
      }

      delete groups[key];
    }
  }
}

// 找出剩余的单排，是不是能凑成组
function checkSingleTile(groups: _.Dictionary<number[]>, orderGroups: number[][], melds: Meld[], pairs?: number[][]): void {
  orderGroups.forEach(function(group) {
    if (group.length === 1) {
      const tiles = groups[group[0]];
      const len = tiles.length;

      if (pairs && len === 2) {
        pairs.push(tiles);
        group.length = 0;
      } else {
        melds.push({
          tiles: tiles,
          type: len === 3 ? ClaimType.Pong : ClaimType.Kong
        });
        group.length = 0;
      }
    }
  });
}

// 检查不可能成组的牌
function checkSoleTiles(groups: _.Dictionary<number[]>, orderGroups: number[][]): number[] {
  const soleTiles: number[] = [];

  // 数字牌
  orderGroups.forEach(function(group) {
    if (group.length === 1 && groups[group[0]].length === 1) {
      soleTiles.push(group[0]);
      excludeGroup(groups, group);
    }
  });

  // 大字
  const keys = Object.keys(groups);
  const idx = _.findIndex(keys, function(key) {
    return parseInt(key) >= Card.East;
  });

  if (idx > -1) {
    keys.slice(idx).forEach(function(key) {
      if (groups[key].length === 1) {
        soleTiles.push(parseInt(key));
        delete groups[key];
      }
    });
  }

  return soleTiles;
}

function getOrderGroup(tiles: number[]): number[][] {
  let characterTiles: number[] = [];
  let dotTiles: number[] = [];
  let bambooTiles: number[] = [];

  tiles.forEach(function(tile) {
    if (tile < Card.DotOne) {
      characterTiles.push(tile);
    } else if (tile < Card.BambooOne) {
      dotTiles.push(tile);
    } else if (tile < Card.East) {
      bambooTiles.push(tile);
    }
  });

  let orderGroups: number[][] = [];

  if (characterTiles.length) {
    orderGroups = orderGroups.concat(groupByOrder(_.uniq(characterTiles), 2));
  }

  if (dotTiles.length) {
    orderGroups = orderGroups.concat(groupByOrder(_.uniq(dotTiles), 2));
  }

  if (bambooTiles.length) {
    orderGroups = orderGroups.concat(groupByOrder(_.uniq(bambooTiles), 2));
  }

  return orderGroups;
};

// 找到顺序分组
function groupByOrder(tiles: number[], gap: number): number[][] {
  let groups: number[][] = [];
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

// 反序列化得到实际的牌
function concatOrder(groups: _.Dictionary<number[]>, group: number[]): number[] {
  let tiles: number[] = [];

  group.forEach(function(tile) {
    let groupTiles = groups[tile];
    tiles = tiles.concat(groupTiles);
  });

  return tiles;
}

// 找出对子或者单牌
// function getNotSomeTile(groups: _.Dictionary<number[]>, soleTiles: number[], pairTiles: number[][]): void {
//   for (let i in groups) {
//     const group = groups[i];
//     const len = group.length;

//     if (len === 1) {
//       soleTiles.push(group[0]);
//     } else if (len === 2) {
//       pairTiles.push(group);
//     }
//   }
// }

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
  const remainder = tile % 9;
  let left = remainder - 2;
  left = left >= 2 ?
    tile - 2 :
    tile - remainder;
  let right = 8 - (remainder + 2);
  right = right >= 0 ?
    tile + 2 :
    tile + 8 - remainder;

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
