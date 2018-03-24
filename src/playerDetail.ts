import * as _ from 'lodash';
import Player from './player';
import { MeldDetail, Meld } from './meld';
import Game from './game';
import Round from './round';
import Wall from './wall';
import { sortTiles, ClaimType, Card, batchTilesSuit } from './tile';
import { canWin, canReadyHand, canClaim, canKong, canFlowerWin, hasPoint } from './rules/basic';
import { BonusType, WinType } from './rules/bonus';

// 玩家
export default class PlayerDetail extends Player {
  handTiles: number[];      // 手牌
  discardTiles: number[];   // 出的牌
  flowerTiles: number[];    // 花牌
  chowTiles: MeldDetail[];  // 吃的牌
  hasDiscard: boolean;  // 是否出过牌，用来判断天胡、地胡

  readyHand: _.Dictionary<number[]>; // 出什么牌听什么牌
  readyHandTiles: number[]; // 听的牌

  canWin: boolean;  // 是否可以胡牌
  eye: number[][];  // 将牌
  remainTiles: number[];  // 没成组的牌

  round: Round;
  game: Game;
  wall: Wall;

  score: number;    // 分数
  winFrom: number;  // 从谁那胡的
  winType: Array<WinType>;  // 胡牌类型
  bonus: Array<BonusType>;  // 奖励类型
  threeMeld: number; // 三道
  fourMeld: number;  // 四道
  
  meld: Meld;     // 这轮行动牌组
  melds: Meld[];  // 这轮可以行动的牌组: 前台行动使用
  discardClaim: boolean;  // 出牌行动标识: 前台行动使用
  
  isBanker: boolean;  // 是否庄家
  hasPoint: boolean;  // 是否有番

  constructor(id: number, name: string, pick: number, isAI: boolean = false) {
    super(id, name, pick, isAI);

    this.handTiles = [];
    this.discardTiles = [];
    this.flowerTiles = [];
    this.chowTiles = [];
    this.hasDiscard = false;

    this.readyHand = {};
    this.readyHandTiles = [];

    this.canWin = true;
    this.eye = [];
    this.remainTiles = [];
    
    this.score = 0;
    this.winFrom = -1;
    this.winType = [];
    this.bonus = [];
    this.threeMeld = -1;
    this.fourMeld = -1;

    this.melds = [];
    this.discardClaim = false;
    this.hasPoint = false;
  }

  // 开始
  start(round: Round, isBanker: boolean): void {
    this.round = round;
    this.game = round.game;
    this.wall = round.wall;
    this.isBanker = isBanker;
    this.discardClaim = isBanker;
    this.openHand();

    // 补花
    if (isBanker) {
      setTimeout(() => {
        this.openCheck();
      }, 0);
    }
  }

  // 起牌
  openHand(): void {
    this.handTiles = this.wall.openHand(this.isBanker);
    this.sort();
    console.log('open', this.name, batchTilesSuit(this.handTiles));
  }

  // 抽牌
  deal(): void {
    this.discardClaim = true;
    const tile = this.wall.deal();

    if (tile === -1) {
      this.round.draw();
      return;
    }

    this.handTiles.push(tile);
    this.game.action('player:deal');
    this.check(tile, false);
  }

  // 后面抽牌
  draw(): void {
    this.discardClaim = true;
    const tile = this.wall.draw();

    if (tile === -1) {
      this.round.draw();
      return;
    }

    this.handTiles.push(tile);
    this.game.action('player:draw');
    
    if (this.handTiles.length % 3 !== 2) {
      return;
    }

    this.check(tile, true);
  }

  // 出牌
  discard(tile: number): void {
    const i = this.handTiles.indexOf(tile);
    this.discardClaim = false;
    this.handTiles.splice(i, 1)[0];
    this.discardTiles.push(tile);
    this.sort();
    this.hasDiscard = true;
    this.game.action('player:discard');

    const keys = Object.keys(this.readyHand);

    if (keys.length) {
      const idx = keys.indexOf(tile.toString());

      if (idx > -1) {
        this.readyHandTiles = this.readyHand[tile];
      }
    } else {
      this.readyHandTiles = [];
    }

    this.round.check(tile);
  }

  // 出的牌被别人吃的，要移交给别人
  tranfer(): void {
    this.discardTiles.pop();
  }

  // 其他玩家出牌回合，检查自己是否需要这张牌
  checkClaim(tile: number, canChow: boolean): boolean {
    this.melds = [];
    let melds: Meld[] = [];

    if (this.checkWin(tile) && hasPoint(this)) {
      melds.push({
        type: ClaimType.Win,
        tiles: []
      });
    }

    melds = melds.concat(canClaim(this.handTiles, tile, canChow));

    if (melds.length) {
      melds.push({
        type: ClaimType.None,
        tiles: []
      });

      this.melds = melds;
      this.game.action('player:check', this.pick);
    }

    return !!melds.length;
  }

  // 玩家选择行动
  claim(idx: number) {
    this.meld = this.melds[idx];
console.log('claim', this.name, idx, this.melds);
    if (this.meld) {
      if (this.pick === this.round.player) {
        this.action(-1);
      } else {
        this.round.claim(this.pick, this.meld.type);
      }
    }
  }

  // 真正的行动
  action(from: number) {
    const meld: MeldDetail = {
      ...this.meld,
      from: from  // -1表示自己
    };
console.log('action', this.name, meld);
    switch(meld.type) {
      // 胡牌，结束
      case ClaimType.Win:
        this.handTiles.push(meld.tiles[2]);
      case ClaimType.SelfDraw:
      case ClaimType.Kong:
        let type = ClaimType[meld.type] as keyof typeof BonusType;
        this.winFrom = from;
        this.win(type);
        this.round.finish(this.pick);
        break;
      // 杠
      case ClaimType.ConcealedKong:
      case ClaimType.Expose:
        this.pull(meld);
        this.chowTiles.push(meld);
        this.checkBaoPai();
        this.game.action('player:kong');
        this.draw();
        break;
      // 碰牌杠
      case ClaimType.ExposeSelfDraw:
        this.exposeSelefDraw(meld.tiles[0]);
        this.checkBaoPai();
        this.game.action('player:kong');
        this.draw();
        break;
      // 碰、胡
      case ClaimType.Chow:
      case ClaimType.Pong:
        this.pull(meld);
        this.chowTiles.push(meld);
        this.checkBaoPai();
        this.discardClaim = true;
        this.game.action('player:chow');
        break;
    }

    // 吃完牌后检查是否听牌
    canReadyHand(this);
  }

  // 判断是否包牌
  private checkBaoPai(): void {
    const chowTiles = this.chowTiles;
    const len = chowTiles.length;

    if (len >= 3) {
      const groups = _.groupBy(chowTiles, 'from');
      const keys = Object.keys(groups);
      const kLen = keys.length;
      
      if (kLen > 2) {
        return;
      }

      if ((len === 3 && kLen === 1)) {
        this.threeMeld = parseInt(keys[0]);
        return;
      }

      if (len === 4) {
        if (kLen === 1) {
          this.fourMeld = parseInt(keys[0]);
          this.threeMeld = -1;
        } else if (kLen === 2) {
          if (groups[keys[0]].length === 3) {
            this.threeMeld = parseInt(keys[0]);
          } else {
            this.threeMeld = parseInt(keys[1]);
          }
        }

        return;
      }
    }
  }

  // 天胡、地胡
  private win(type: keyof typeof BonusType): void {
    if (!this.hasDiscard && !this.flowerTiles.length) {
      // 手牌胡
      type = this.isBanker ? 'Sky' : 'Land';
    }

    this.bonus.push(BonusType[type]);
  }

  // 自己摸牌回合检查
  private check(tile: number, isDraw: boolean): void {
    this.melds = [];

    if (sortTiles(this.handTiles.slice()).slice(-1)[0] >= Card.Spring) {
      this.checkFlower();
      return;
    }

    let melds: Meld[] = [];
    
    if (this.checkWin(tile, true)) {
      melds.push({
        type: isDraw ? ClaimType.Kong : ClaimType.SelfDraw,
        tiles: []
      });
    }

    melds = melds.concat(canKong(this.handTiles, tile));

    for (let i = 0, len = this.chowTiles.length; i < len; i++) {
      const meld = this.chowTiles[i];

      if (meld.type === ClaimType.Pong && meld.tiles[0] === tile) {
        melds.push({
          type: ClaimType.ExposeSelfDraw,
          tiles: [tile, tile, tile, tile]
        });
        
        break;
      }
    }

    if (melds.length) {
      melds.push({
        type: ClaimType.None,
        tiles: []
      });
      
      this.melds = melds;
      this.game.action('player:check', this.pick);
      return;
    }

    canReadyHand(this);
  }

  // 胡牌
  private checkWin(tile: number, bySelf: boolean = false): boolean {
    if (!this.hasDiscard || (this.readyHandTiles.length && this.readyHandTiles.indexOf(tile) > -1)) {
      // 再检查下是否能胡
      return bySelf ? canWin(this) : canWin(this, tile);
    }

    return false;
  }

  // 碰牌杠
  private exposeSelefDraw(tile: number): void {
    for (let i = 0, len = this.chowTiles.length; i < len; i++) {
      const meld = this.chowTiles[i];

      if (meld.type === ClaimType.Pong && meld.tiles[0] === tile) {
        meld.tiles = [tile, tile, tile, tile];
        meld.type = ClaimType.ExposeSelfDraw;
        this.handTiles.splice(-1, 1);
        
        break;
      }
    }
  }

  // 补花
  private checkFlower(): void {
    let tiles: number[] = [];
    const handTiles = sortTiles(this.handTiles.slice());

    let idx = _.findIndex(handTiles, tile => tile >= Card.Spring);
    
    if (idx > -1) {
      tiles = handTiles.splice(idx, handTiles.length - idx);
    }

    if (!tiles.length) {
      return;
    }

    tiles.forEach(tile => {
      this.handTiles.splice(this.handTiles.indexOf(tile), 1);
    });

    tiles.forEach(tile => {
      if (tile >= Card.Spring) {
        this.draw();
        this.flowerTiles.push(tile);
        this.flowerTiles = sortTiles(this.flowerTiles);
        const count = canFlowerWin(this.flowerTiles, tile);
  
        if (count) {
          count === 1 ? this.bonus.push(BonusType.FlowerSeason) : this.bonus.push(BonusType.FlowerBotany);
        }
      }
    });

    this.game.action('player:flower');
  }

  private openCheck(): void {
    let melds: Meld[] = [];

    if (this.checkWin(0, true)) {
      melds.push({
        type: ClaimType.SelfDraw,
        tiles: []
      });
    }

    const groups = _.groupBy(this.handTiles, function(tile) {
      return tile / 1;
    });

    Object.keys(groups).forEach(function(key) {
      const group = groups[key];

      if (group.length === 4) {
        melds.push({
          type: ClaimType.ConcealedKong,
          tiles: group
        });
      }
    });

    if (melds.length) {
      this.melds = melds;
    }

    this.checkFlower();
    canReadyHand(this);
  }

  private sort(): void {
    this.handTiles = sortTiles(this.handTiles);
  }

  private pull(meld: MeldDetail): void {
    const type = meld.type;
    const tiles = meld.tiles.slice(0, -1);
    const handTiles = this.handTiles;

    if (type === ClaimType.Expose || type === ClaimType.ConcealedKong) {
      _.pull(handTiles, ...tiles);

      return;
    }
    
    tiles.forEach(tile => {
      handTiles.splice(handTiles.indexOf(tile), 1);
    });
  }
};
