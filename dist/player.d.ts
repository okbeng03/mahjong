import Bonus from './bonus';
export default class Player {
    readonly id: number;
    readonly name: string;
    readonly pick: number;
    bonus: Bonus;
    constructor(id: number, name: string, pick: number);
}
