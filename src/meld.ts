export interface Meld {
  tiles: number[],
  type: number
};

export interface MeldDetail extends Meld {
  from: number
};
