import Bonus from './bonus';

export default class Player {
  readonly id: number;
  readonly name: string;
  readonly pick: number;
  bonus: Bonus;

  constructor(id: number, name: string, pick: number) {
    this.id = id;
    this.name = name;
    this.pick = pick;
    this.bonus = {
      score: 0,
      selfDraw: 0,
      win: 0,
      expose: 0,
      concealedKong: 0,
      cannon: 0
    };
  }
};
