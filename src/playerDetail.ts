import * as _ from 'lodash';
import Player from './player';
import { MeldDetail, Meld } from './meld';
import Round from './round';
import Wall from './wall';
import { sortTiles, ClaimType, Card } from './tile';
import { canWin, canReadyHand, canClaim, canKong, canFlowerWin } from './rules/basic';
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

  constructor(id: number, name: string, pick: number) {
    super(id, name, pick);

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

    this.discardClaim = false;
  }

  // 开始
  start(round: Round, isBanker: boolean): void {
    this.round = round;
    this.wall = round.wall;
    this.isBanker = isBanker;
    this.discardClaim = isBanker;
    this.openHand();
  }

  // 起牌
  openHand(): void {
    this.handTiles = this.wall.openHand(this.isBanker);
    this.sort();
  }

  // 抽牌
  deal(): void {
    const tile = this.wall.deal();

    if (tile === -1) {
      this.round.draw();
      return;
    }

    this.handTiles.push(tile);
    this.check(tile, false);
  }

  // 后面抽牌
  draw(): void {
    const tile = this.wall.draw();

    if (tile === -1) {
      this.round.draw();
      return;
    }

    this.handTiles.push(tile);
    this.check(tile, true);
  }

  // 出牌
  discard(tile: number): void {
    const i = _.findIndex(this.handTiles, tile);
    this.discardClaim = false;
    this.handTiles.splice(i, 1)[0];
    this.discardTiles.push(tile);
    this.sort();
    this.round.check(tile);
    this.hasDiscard = true;
  }

  // 出的牌被别人吃的，要移交给别人
  tranfer(): void {
    this.discardTiles.pop();
  }

  // 其他玩家出牌回合，检查自己是否需要这张牌
  checkClaim(tile: number, canChow: boolean): boolean {
    this.melds = [];
    const melds = canClaim(this.handTiles, tile, canChow);

    if (this.canWin && this.checkWin(tile)) {
      melds.push({
        type: ClaimType.Win,
        tiles: []
      });
    }

    if (melds.length) {
      melds.push({
        type: ClaimType.None,
        tiles: []
      });
      this.melds = melds;
    }

    return !!melds.length;
  }

  // 玩家选择行动
  claim(idx: number) {
    this.meld = this.melds[idx];

    if (this.pick === this.round.player) {
      this.action(-1);
    } else {
      this.round.claim(this.pick, this.meld.type);
    }
  }

  // 真正的行动
  action(from: number) {
    const meld: MeldDetail = {
      ...this.meld,
      from: from  // -1表示自己
    };

    switch(meld.type) {
      // 胡牌，结束
      case ClaimType.Win:
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
        this.chowTiles.push(meld);
        this.checkBaoPai();
        this.draw();
        break;
      // 碰、胡
      default:
        this.chowTiles.push(meld);
        this.checkBaoPai();
        this.discardClaim = true;
        break;
    }
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

  private win(type: keyof typeof BonusType): void {
    if (!this.hasDiscard && !this.flowerTiles.length) {
      // 手牌胡
      type = this.isBanker ? 'Sky' : 'Land';
    }

    this.bonus.push(BonusType[type]);
  }

  private check(tile: number, isDraw: boolean): void {
    if (tile >= Card.Spring) {
      this.flowerTiles.push(tile);
      this.flowerTiles = sortTiles(this.flowerTiles);
      this.draw();
      const count = canFlowerWin(this.flowerTiles, tile);

      if (count) {
        count === 1 ? this.bonus.push(BonusType.FlowerSeason) : this.bonus.push(BonusType.FlowerBotany);
      }

      return;
    }

    const melds = canKong(this.handTiles, tile);
    
    if (this.checkWin(tile)) {
      melds.push({
        type: isDraw ? ClaimType.Kong : ClaimType.SelfDraw,
        tiles: []
      });
    }

    if (melds.length) {
      this.melds = melds;
      return;
    }

    canReadyHand(this);
  }

  private checkWin(tile: number): boolean {
    if (this.hasDiscard) {
      if (this.readyHandTiles.length && _.indexOf(this.readyHandTiles, tile) > -1) {
        // 再检查下是否能胡
        return canWin(this);
      }
    } else {
      return canWin(this, tile);
    }

    return false;
  }

  private sort(): void {
    this.handTiles = sortTiles(this.handTiles);
  }
};
