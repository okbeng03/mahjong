/// <reference types="lodash" />
import * as _ from 'lodash';
export declare enum Card {
    CharacterOne = 1,
    CharacterTwo = 2,
    CharacterThree = 3,
    CharacterFour = 4,
    CharacterFive = 5,
    CharacterSix = 6,
    CharacterSeven = 7,
    CharacterEight = 8,
    CharacterNight = 9,
    DotOne = 11,
    DotTwo = 12,
    DotThree = 13,
    DotFour = 14,
    DotFive = 15,
    DotSix = 16,
    DotSeven = 17,
    DotEight = 18,
    DotNight = 19,
    BambooOne = 21,
    BambooTwo = 22,
    BambooThree = 23,
    BambooFour = 24,
    BambooFive = 25,
    BambooSix = 26,
    BambooSeven = 27,
    BambooEight = 28,
    BambooNight = 29,
    East = 31,
    South = 33,
    West = 35,
    North = 37,
    Green = 41,
    Red = 43,
    White = 45,
    Spring = 51,
    Summer = 52,
    Autumn = 53,
    Winter = 54,
    Plum = 55,
    Orchid = 56,
    Bamboo = 57,
    Chrysanthemum = 58,
}
export declare enum ClaimType {
    None = 0,
    Chow = 1,
    Pong = 2,
    Expose = 3,
    ExposeSelfDraw = 4,
    ConcealedKong = 5,
    Flower = 6,
    Win = 7,
    SelfDraw = 8,
    Kong = 9,
    FirstFollow = 10,
    BaoPai = 11,
}
export declare enum Pick {
    East = 1,
    South = 2,
    West = 3,
    North = 4,
}
/**
 * 获取默认牌
 * @param hasWind 是否有风牌
 * @param hasDragon 是否有箭牌
 * @param hasFlower 是否有花
 */
export declare let getTiles: (hasWind?: boolean, hasDragon?: boolean, hasFlower?: boolean) => number[];
export declare const cardMaps: _.Dictionary<string>;
export declare const cardSuitMaps: _.Dictionary<string>;
export declare let shuffleTiles: (tiles: number[]) => number[];
export declare let getTileSuit: (tile: number) => string;
export declare let getTileId: (suit: string) => number;
export declare let sortTiles: (tiles: number[]) => number[];
export declare let batchTilesSuit: (tiles: number[], s?: string) => string;
export declare let batchTilesId: (suit: string, s?: string) => number[];
