export default class Player {
  readonly id: number;
  readonly name: string;
  readonly pick: number;
  readonly isAI: boolean;

  constructor(id: number, name: string, pick: number, isAI: boolean = false) {
    this.id = id;
    this.name = name;
    this.pick = pick;
    this.isAI = isAI;
  }
};
