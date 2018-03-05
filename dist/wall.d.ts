export default class Wall {
    tiles: number[];
    constructor(hasWind?: boolean, hasDragon?: boolean, hasFlower?: boolean);
    openHand(isBanker: boolean): number[];
    isDead(): boolean;
    willDead(): boolean;
    deal(): number;
    draw(): number;
}
