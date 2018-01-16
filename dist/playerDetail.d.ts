/// <reference types="lodash" />
import * as _ from 'lodash';
import Player from './player';
import { MeldDetail } from './meld';
import Wall from './wall';
export default class PlayerDetail extends Player {
    handTiles: number[];
    discardTiles: number[];
    flowerTiles: number[];
    chowTiles: MeldDetail[];
    wall: Wall;
    readyHand: _.Dictionary<number[]>;
    canWin: boolean;
    eye: number[][];
    remainTiles: number[];
    constructor(id: number, name: string, pick: number, wall: Wall);
    openHand(isBanker: boolean): void;
    deal(): void;
    discard(pos: number): void;
    draw(): void;
    private sort();
}
