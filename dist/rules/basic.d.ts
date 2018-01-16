import Player from '../playerDetail';
import { Meld } from '../meld';
export declare function canWin(player: Player): boolean;
export declare function canReadyHand(player: Player): void;
export declare function canClaim(tiles: number[], tile: number): Meld[];
export declare function canPong(tiles: number[], tile: number): Meld[];
export declare function canKong(tiles: number[], tile: number): Meld[];
export declare function canChow(tiles: number[], tile: number): Meld[];
