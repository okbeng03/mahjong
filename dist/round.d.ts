import Game from './game';
import Player from './playerDetail';
import Wall from './wall';
import { ClaimType } from './tile';
export default class Round {
    game: Game;
    players: Player[];
    player: number;
    winner: number;
    wall: Wall;
    claims: ClaimType[];
    canClaims: number[];
    firstFlow: number;
    constructor(game: Game);
    addPlayer(id: number, name: string, pick: number): void;
    start(): void;
    finish(player: number): void;
    draw(): void;
    check(tile: number): void;
    claim(player: number, claim: ClaimType): void;
    next(): void;
    private checkFirstFlow(tile);
    private getNext();
}
