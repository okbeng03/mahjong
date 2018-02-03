import Player from './player';
import Round from './round';
export default class Game {
    players: Player[];
    rounds: Round[];
    order: number;
    banker: number;
    bankerCount: number;
    bonus: number[];
    constructor();
    addPlayer(id: number, name: string): void;
    start(): void;
    finish(): void;
    end(): void;
}
