/// <reference types="lodash" />
import * as _ from 'lodash';
import Player from './player';
import { MeldDetail, Meld } from './meld';
import Round from './round';
import Wall from './wall';
export default class PlayerDetail extends Player {
    handTiles: number[];
    discardTiles: number[];
    flowerTiles: number[];
    chowTiles: MeldDetail[];
    readyHand: _.Dictionary<number[]>;
    readyHandTiles: number[];
    canWin: boolean;
    eye: number[][];
    remainTiles: number[];
    round: Round;
    wall: Wall;
    win: number;
    winFrom: number;
    flowerWin: number;
    meld: Meld;
    melds: Meld[];
    discardClaim: boolean;
    isBanker: boolean;
    constructor(id: number, name: string, pick: number);
    start(round: Round, isBanker: boolean): void;
    openHand(): void;
    deal(): void;
    draw(): void;
    discard(tile: number): void;
    checkClaim(tile: number, canChow: boolean): boolean;
    claim(idx: number): void;
    action(from: number): void;
    private check(tile, isDraw);
    private checkWin(tile);
    private sort();
}
