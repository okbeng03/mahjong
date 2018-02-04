import { getTiles, shuffleTiles } from './tile';

export default class Wall {
  tiles: number[];

  constructor(hasWind = true, hasDragon = true, hasFlower = true) {
    this.tiles = shuffleTiles(getTiles(hasWind, hasDragon, hasFlower));
  }

  openHand(isBanker: boolean): number[] {
    return this.tiles.splice(0, isBanker ? 14 : 13);
  }

  isDead(): boolean {
    return this.tiles.length < 16;
  }

  // 海底包牌
  willDead(): boolean {
    return this.tiles.length >= 16 && this.tiles.length <= 19;
  }

  // 摸牌
  deal(): number {
    if (this.isDead()) {
      return -1;
    }

    return this.tiles.shift();
  }

  // 花杠
  draw(): number {
    if (this.isDead()) {
      return -1;
    }

    return this.tiles.pop();
  }
};
