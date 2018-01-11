export declare enum Card {
    CharacterOne = 0,
    CharacterTwo = 1,
    CharacterThree = 2,
    CharacterFour = 3,
    CharacterFive = 4,
    CharacterSix = 5,
    CharacterSeven = 6,
    CharacterEight = 7,
    CharacterNight = 8,
    DotOne = 9,
    DotTwo = 10,
    DotThree = 11,
    DotFour = 12,
    DotFive = 13,
    DotSix = 14,
    DotSeven = 15,
    DotEight = 16,
    DotNight = 17,
    BambooOne = 18,
    BambooTwo = 19,
    BambooThree = 20,
    BambooFour = 21,
    BambooFive = 22,
    BambooSix = 23,
    BambooSeven = 24,
    BambooEight = 25,
    BambooNight = 26,
    East = 27,
    South = 28,
    West = 29,
    North = 30,
    Green = 31,
    Red = 32,
    White = 33,
    Spring = 34,
    Summer = 35,
    Autumn = 36,
    Winter = 37,
    Plum = 38,
    Orchid = 39,
    Bamboo = 40,
    Chrysanthemum = 41,
}
export declare enum ClaimType {
    SelfDraw = 0,
    Win = 1,
    Kong = 2,
    ConcealedKong = 3,
    Expose = 4,
    Pong = 5,
    Chow = 6,
}
/**
 * 获取默认牌
 * @param hasWind 是否有风牌
 * @param hasDragon 是否有箭牌
 * @param hasFlower 是否有花
 */
export declare let getTiles: (hasWind?: boolean, hasDragon?: boolean, hasFlower?: boolean) => number[];
export interface StringMap {
    [key: string]: string;
}
export declare const cardMaps: StringMap;
export declare const cardSuitMaps: StringMap;
export declare let shuffleTiles: (tiles: number[]) => number[];
export declare let getTileSuit: (tile: number) => string;
export declare let getTileId: (suit: string) => number;
export declare let sortTiles: (tiles: number[]) => number[];
export declare let batchTilesSuit: (tiles: number[], s?: string) => string;
export declare let batchTilesId: (suit: string, s?: string) => number[];
