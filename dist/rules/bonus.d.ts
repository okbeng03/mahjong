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
    Win = 1,
    SelfDraw = 2,
    Kong = 3,
    Sky = 4,
    Land = 5,
    FlowerSeason = 6,
    FlowerBotany = 7,
    Expose = 8,
    ConcealedKong = 9,
    BaoPai = 10,
    Cannon = 11,
    FirstFollow = 12,
}
export declare function calculate(round: Round): void;
