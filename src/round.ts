import { getTiles, shuffleTiles } from './tile';

export default class Round {
  tiles: number[];

  constructor() {
    this.tiles = shuffleTiles(getTiles());
  }

  openHand(isHouse: boolean): number[] {
    return this.tiles.splice(0, isHouse ? 14 : 13);
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
