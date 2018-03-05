import Player from '../playerDetail';
import Round from '../round';
export default class PlayerAIBasic extends Player {
    constructor(id: number, name: string, pick: number);
    start(round: Round, isBanker: boolean): void;
    deal(): void;
    draw(): void;
    checkClaim(tile: number, canChow: boolean): boolean;
    private claimByAI();
    private discardByAI();
    private probabilityCalculate(tiles, addHandTile?);
}
