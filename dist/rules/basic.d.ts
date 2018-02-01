/// <reference types="lodash" />
import * as _ from 'lodash';
import Player from '../playerDetail';
import { Meld } from '../meld';
export declare function canWin(player: Player): boolean;
export declare function canReadyHand(player: Player): void;
export declare function canFlowerWin(tiles: number[], tile: number): number;
export declare function groupByType(tiles: number[]): _.Dictionary<number[]>;
export declare function groupSize(tiles: number[]): number;
export declare function canClaim(tiles: number[], tile: number, canChow?: boolean): Meld[];
export declare function canKong(tiles: number[], tile: number): Meld[];
