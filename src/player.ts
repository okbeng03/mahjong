export default class Player {
  readonly id: number;
  readonly name: string;
  readonly pick: number;

  constructor(id: number, name: string, pick: number) {
    this.id = id;
    this.name = name;
    this.pick = pick;
  }
};
