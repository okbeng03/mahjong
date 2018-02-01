import Round from '../round';
export declare enum WinType {
    CommonHand = 1,
    Uniform = 2,
    Pong = 3,
    Pair = 4,
    LuxuryPair = 5,
    Uniq = 6,
}
export declare enum BonusType {
    Win = 0,
    SelfDraw = 1,
    Kong = 2,
    Sky = 3,
    Land = 4,
    FlowerSeason = 5,
    FlowerBotany = 6,
    Expose = 7,
    ConcealedKong = 8,
    BaoPai = 9,
    Cannon = 10,
    FirstFollow = 11,
}
export declare function calculate(round: Round): void;
