import Game from './game';
import Player from './playerDetail';
import Wall from './wall';
import Bonus from './bonus';
import { ClaimType } from './tile';
export default class Round {
    game: Game;
    players: Player[];
    player: number;
    winner: number;
    wall: Wall;
    claims: ClaimType[];
    canClaims: number[];
    bonus: Bonus[];
    constructor(game: Game);
    start(): void;
    finish(player: number): void;
    draw(): void;
    check(tile: number): void;
    claim(player: number, claim: ClaimType): void;
    next(): void;
    private getNext();
}
