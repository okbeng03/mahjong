import Player from './player';
import { MeldDetail } from './meld';
import Wall from './wall';
export default class PlayerDetail extends Player {
    handTiles: number[];
    discardTiles: number[];
    flowerTiles: number[];
    chowTiles: MeldDetail[];
    wall: Wall;
    readyHand: boolean;
    constructor(id: number, name: string, pick: number, wall: Wall);
    openHand(isBanker: boolean): void;
    deal(): void;
    discard(pos: number): void;
    draw(): void;
    private sort();
}
