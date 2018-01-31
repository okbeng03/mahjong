import * as _ from 'lodash';
import Player from './player';
import { MeldDetail, Meld } from './meld';
import Round from './round';
import Wall from './wall';
import { sortTiles, ClaimType, Card } from './tile';
import { canWin, canReadyHand, canClaim, canKong, canFlowerWin } from './rules/basic';

// 玩家
export default class PlayerDetail extends Player {
  handTiles: number[];      // 手牌
  discardTiles: number[];   // 出的牌
  flowerTiles: number[];    // 花牌
  chowTiles: MeldDetail[];  // 吃的牌

  readyHand: _.Dictionary<number[]>; // 出什么牌听什么牌
  readyHandTiles: number[]; // 听的牌

  canWin: boolean;  // 是否可以胡牌
  eye: number[][];  // 将牌
  remainTiles: number[];  // 没成组的牌

  round: Round;
  wall: Wall;

  win: number;  // 赢的方式
  winFrom: number;  // 从谁那胡的
  flowerWin: number;  // 花胡次数
  meld: Meld;     // 这轮行动牌组
  melds: Meld[];  // 这轮可以行动的牌组: 前台行动使用
  discardClaim: boolean;  // 出牌行动标识: 前台行动使用
  isBanker: boolean;  // 是否庄家

  constructor(id: number, name: string, pick: number) {
    super(id, name, pick);

    this.eye = [];
    this.remainTiles = [];
    this.canWin = true;
    this.readyHand = {};
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

    this.melds = melds;
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
        this.win = meld.type;
        this.winFrom = from;
        this.round.finish(this.pick);
        break;
      // 杠
      case ClaimType.ConcealedKong:
      case ClaimType.Expose:
        this.chowTiles.push(meld);
        this.draw();
        break;
      // 碰、胡
      default:
        this.chowTiles.push(meld);
        this.discardClaim = true;
        break;
    }
  }

  private check(tile: number, isDraw: boolean): void {
    if (tile >= Card.Spring) {
      this.flowerTiles.push(tile);
      this.flowerTiles = sortTiles(this.flowerTiles);
      this.draw();

      if (canFlowerWin(this.flowerTiles).length) {
        this.flowerWin++;
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
    if (this.readyHandTiles.length && _.indexOf(this.readyHandTiles, tile) > -1) {
      // 再检查下是否能胡
      return canWin(this);
    }

    return false;
  }

  private sort(): void {
    this.handTiles = sortTiles(this.handTiles);
  }
};