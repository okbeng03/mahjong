import * as _ from 'lodash';
import Player from './player';
import { MeldDetail } from './meld';
import Wall from './wall';
import { sortTiles } from './tile';

export default class PlayerDetail extends Player {
  handTiles: number[];  // 手牌
  discardTiles: number[];  // 出的牌
  flowerTiles: number[];  // 花牌
  chowTiles: MeldDetail[];  // 吃的牌
  wall: Wall;
  readyHand: _.Dictionary<number[]>; // 听的牌
  canWin: boolean;  // 是否胡牌
  eye: number[][];  // 将牌
  remainTiles: number[];  // 没成组的牌

  constructor(id: number, name: string, pick: number, wall: Wall) {
    super(id, name, pick);

    this.wall = wall;
    this.eye = [];
    this.remainTiles = [];
    this.canWin = false;
    this.readyHand = {};
  }

  // 起牌
  openHand(isBanker: boolean): void {
    this.handTiles = this.wall.openHand(isBanker);
  }

  // 抽牌
  deal(): void {
    this.handTiles.push(this.wall.deal());
    this.sort();
  }

  // 出牌
  discard(pos: number): void {
    const tile = this.handTiles.splice(pos, 1)[0];
    this.discardTiles.push(tile); 
  }

  // 后面抽牌
  draw(): void {
    this.handTiles.push(this.wall.draw());
    this.sort();
  }

  // 其他玩家出牌回合，检查自己是否需要这张牌
  // check(tile: number): void {

  // }

  private sort(): void {
    this.handTiles = sortTiles(this.handTiles);
  }
};
