import Player from './playerDetail';
import Round from './round';
import Bonus from './bonus';
export default class Game {
    players: Player[];
    rounds: Round[];
    order: number;
    banker: number;
    bankerCount: number;
    bonus: Bonus[];
    constructor();
    addPlayer(id: number, name: string): void;
    start(): void;
    finish(): void;
    end(): void;
}
