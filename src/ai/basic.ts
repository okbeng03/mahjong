import * as _ from 'lodash';
import Player from '../playerDetail';
import Round from '../round';
import { sortTiles, Card, ClaimType, batchTilesSuit } from '../tile';
import { groupByOrder } from '../rules/basic';

export default class PlayerAIBasic extends Player {
  timer: number | null;

  constructor(id: number, name: string, pick: number) {
    super(id, name, pick, true);

    this.timer = null;
  }

  start(round: Round, isBanker: boolean): void {
    super.start(round, isBanker);

    if (isBanker && this.handTiles.slice(-1)[0] < Card.Spring) {
      setTimeout(() => {
        if (this.melds.length) {
          this.claimByAI();
        }
        
        this.discardByAI();
      }, 100);
    }
  }

  // 抽牌
  deal(): void {
    super.deal();

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if (this.melds.length) {
        this.claimByAI();
        return;
      }
  
      this.discardByAI();
    }, 2000);
  }

  // 后面抽牌
  draw(): void {
    super.draw();

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if (this.melds.length) {
        this.claimByAI();
        return;
      }
  
      this.discardByAI();
    }, 2000);
  }

  checkClaim(tile: number, canChow: boolean): boolean {
    const hasClaim = super.checkClaim(tile, canChow);

    if (hasClaim && this.melds.length) {
      // 延迟后响应
      setTimeout(() => {
        this.claimByAI();
      }, 0);
    }

    return hasClaim;
  }

  // 决定行动哪个
  private claimByAI(): void {
    // 找出行动的大小，行动最大的
    const melds = this.melds;
    const claims = melds.map(meld => meld.type);
    const claim = _.max(claims);

    if (typeof claim !== 'undefined') {
      const idx = claims.indexOf(claim);

      // 如果已听牌，不吃不碰
      if (claim <= ClaimType.Pong && !_.isEmpty(this.readyHand)) {
        super.claim(claims.length - 1);
        return;
      }

      if (claim === ClaimType.Chow) {
        // 如果这不是remainTiles的牌，不吃
        const remainTiles = _.uniq(this.remainTiles.slice());
        let flag = _.union(remainTiles, melds[idx].tiles.slice(0, -1)).length === remainTiles.length;

        if (flag) {
          // 吃牌后不能成组的数量不能增多
          flag = groupByOrder(this.remainTiles).length >= groupByOrder(pull(this.remainTiles, melds[idx].tiles)).length
        }

        if (!flag) {
          // 如果还有其他的吃牌组合，继续判断
          if (melds.length > 2) {
            melds.splice(0, 1);
            this.claimByAI();

            return;
          }

          super.claim(claims.length - 1);
          return;
        }
      }
      
      super.claim(idx);

      setTimeout(() => {
        // 如果胡牌、杠，不继续
        if (claim >= ClaimType.Expose || this.round.winner > -1) {
          return;
        }

        if (this.round.player === this.pick) {
          if (this.timer) {
            clearTimeout(this.timer);
          }

          this.timer = setTimeout(() => {
            this.discardByAI();
          }, 2000);
        }
      }, 500);
    }
  }

  // 决定出哪张牌
  private discardByAI(): void {
    let tile: number = 0;
    
    if (!_.isEmpty(this.readyHand)) {
      console.log('readyhand', JSON.stringify(this.readyHand));
      // 如果听牌，最简单
      const keys = Object.keys(this.readyHand);

      // 从牌面算概率，听哪张牌赢得概率最大
      if (keys.length > 1) {
        const tiles = keys.map(key => this.readyHand[key]);
        const probabilities = this.probabilityCalculate(_.concat([], ...tiles), true);
        let max: number = -1;

        keys.forEach(key => {
          let p: number = 0;

          this.readyHand[key].forEach(tile => {
            p += probabilities[tile];
          });

          if (p > max) {
            tile = parseInt(key);
            max = p;
          }
        });
        // TODO: 会出现叫死牌的情况
      } else {
        tile = parseInt(keys[0]);
      }
    } else {
      // 否则，找单牌出
      const remainTiles = sortTiles(this.remainTiles);
      const len = remainTiles.length;
      console.log('remain', remainTiles);
      if (len) {
        let tiles: number[] = [];

        // 优先出大字
        tiles = _.filter(remainTiles, function(item) {
          return item >= Card.East && item <= Card.Spring;
        });

        if (!tiles.length) {
          // 找到不连续的牌
          let groups = groupByOrder(remainTiles.slice(), 2);
          
          groups.forEach(group => {
            if (group.length === 1) {
              tiles.push(group[0]);
            }
          });

          if (!tiles.length) {
            groups = groupByOrder(remainTiles.slice(), 1);
            groups.forEach(group => {
              if (group.length === 1) {
                tiles.push(group[0]);
              }
            });
          }

          if (!tiles.length) {
            tiles = remainTiles;
          }

          // TODO: 算法算出最佳听牌路径

          let oneAndNightTiles = _.filter(tiles, function(item) {
            const r = item % 10;
            return r === 1 || r === 9;
          });

          if (oneAndNightTiles.length) {
            tiles = oneAndNightTiles;
          }
        }

        console.log('tiles', tiles);

        if (tiles.length === 1) {
          tile = tiles[0];
        } else {
          // 再从牌面看，优先出不会放炮的牌
          const probabilities = this.probabilityCalculate(tiles);
          let max: number = 5;

          for (let key in probabilities) {
            if (probabilities[key] < max) {
              tile = parseInt(key);
              max = probabilities[key];
            }
          }
        }
      }
    }

    if (tile) {
      // setTimeout(() => {
        console.log('discard', this.name, batchTilesSuit([tile]));

        this.timer = null;
        super.discard(tile);
      // }, 2000);
    }
  }

  private probabilityCalculate(tiles: number[], addHandTile: boolean = false): _.Dictionary<number> {
    const probabilities: _.Dictionary<number> = {};
    const players = this.round.players;
    const visibleTiles = _.concat([], ...players.map(player => {
      return player.discardTiles.concat(_.concat([], ...player.chowTiles.map(meld => meld.tiles)))
    }));

    if (addHandTile) {
      visibleTiles.splice(visibleTiles.length, 0, ...this.handTiles);
    }
    
    const groups = _.groupBy(visibleTiles, function(tile) {
      return tile / 1;
    });

    tiles.forEach(tile => {
      probabilities[tile] = 4;

      if (groups[tile]) {
        probabilities[tile] = 4 - groups[tile].length;
      }
    });

    return probabilities;
  }
};

function pull(tiles: number[], meld: number[]): number[] {
  tiles = tiles.slice();
  
  meld.forEach(tile => {
    tiles.splice(tiles.indexOf(tile), 1);
  });

  return tiles;
}
