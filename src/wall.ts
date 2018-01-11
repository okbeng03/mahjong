import { getTiles, shuffleTiles } from './tile';

export default class Wall {
  tiles: number[];

  constructor() {
    this.tiles = shuffleTiles(getTiles());
  }

  openHand(isBanker: boolean): number[] {
    return this.tiles.splice(0, isBanker ? 14 : 13);
  }

  // 摸牌
  deal(): number {
    return this.tiles.shift();
  }

  // 花杠
  draw(): number {
    return this.tiles.pop();
  }
};
