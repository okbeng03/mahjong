import * as _ from 'lodash';

export enum Card {
  // 万
  CharacterOne = 1,
  CharacterTwo,
  CharacterThree,
  CharacterFour,
  CharacterFive,
  CharacterSix,
  CharacterSeven,
  CharacterEight,
  CharacterNight,
  // 筒
  DotOne = 11,
  DotTwo,
  DotThree,
  DotFour,
  DotFive,
  DotSix,
  DotSeven,
  DotEight,
  DotNight,
  // 条
  BambooOne = 21,
  BambooTwo,
  BambooThree,
  BambooFour,
  BambooFive,
  BambooSix,
  BambooSeven,
  BambooEight,
  BambooNight,
  // 风牌
  East = 31,
  South = 33,
  West = 35,
  North = 37,
  // 箭牌
  Green = 41, // 发财
  Red = 43,   // 红中
  White = 45, // 白板
  // 花
  Spring = 51,
  Summer,
  Autumn,
  Winter,
  Plum,
  Orchid,
  Bamboo,
  Chrysanthemum
};

export enum ClaimType {
  None,
  Chow,           // 吃
  Pong,           // 碰
  Expose,         // 明杠
  ConcealedKong,  // 暗杠
  Flower,         // 花胡
  Win,            // 胡
  SelfDraw,       // 自摸
  Kong            // 杠上开花
};

export enum Pick {
  East = 1,
  South,
  West,
  North
};

const NumberCard = [
  Card.CharacterOne,
  Card.CharacterTwo,
  Card.CharacterThree,
  Card.CharacterFour,
  Card.CharacterFive,
  Card.CharacterSix,
  Card.CharacterSeven,
  Card.CharacterEight,
  Card.CharacterNight,
  Card.DotOne,
  Card.DotTwo,
  Card.DotThree,
  Card.DotFour,
  Card.DotFive,
  Card.DotSix,
  Card.DotSeven,
  Card.DotEight,
  Card.DotNight,
  Card.BambooOne,
  Card.BambooTwo,
  Card.BambooThree,
  Card.BambooFour,
  Card.BambooFive,
  Card.BambooSix,
  Card.BambooSeven,
  Card.BambooEight,
  Card.BambooNight
];
const WindCard = [
  Card.East,
  Card.South,
  Card.West,
  Card.North
];
const DragonCard = [
  Card.Green,
  Card.Red,
  Card.White
];
const FlowerCard = [
  Card.Spring,
  Card.Summer,
  Card.Autumn,
  Card.Winter,
  Card.Plum,
  Card.Orchid,
  Card.Bamboo,
  Card.Chrysanthemum
];

// 拼接
function concatTiles(cards: number[], tiles: number[]): number[] {
  for (let i of cards) {
    tiles = tiles.concat([i, i, i, i]);
  }

  return tiles;
}

/**
 * 获取默认牌
 * @param hasWind 是否有风牌
 * @param hasDragon 是否有箭牌
 * @param hasFlower 是否有花
 */
export let getTiles = function(hasWind = true, hasDragon = true, hasFlower = true): number[] {
  let tiles: number[] = [];

  tiles = concatTiles(NumberCard, tiles);

  if (hasWind) {
    tiles = concatTiles(WindCard, tiles);
  }

  if (hasDragon) {
    tiles = concatTiles(DragonCard, tiles);
  }

  if (hasFlower) {
    for (let i of FlowerCard) {
      tiles.push(i);
    }
  }

  return tiles;
}

export interface StringMap {
  [key: string]: string
};
export const cardMaps: StringMap = {
  // 万
  CharacterOne: '一万',
  CharacterTwo: '二万',
  CharacterThree: '三万',
  CharacterFour: '四万',
  CharacterFive: '五万',
  CharacterSix: '六万',
  CharacterSeven: '七万',
  CharacterEight: '八万',
  CharacterNight: '九万',
  // 筒
  DotOne: '一筒',
  DotTwo: '二筒',
  DotThree: '三筒',
  DotFour: '四筒',
  DotFive: '五筒',
  DotSix: '六筒',
  DotSeven: '七筒',
  DotEight: '八筒',
  DotNight: '九筒',
  // 条
  BambooOne: '一条',
  BambooTwo: '二条',
  BambooThree: '三条',
  BambooFour: '四条',
  BambooFive: '五条',
  BambooSix: '六条',
  BambooSeven: '七条',
  BambooEight: '八条',
  BambooNight: '九条',
  // 风牌
  East: '东风',
  South: '南风',
  West: '西风',
  North: '北风',
  // 箭牌
  Green: '发财', // 发财
  Red: '红中',   // 红中
  White: '白板', // 白板
  // 花
  Spring: '春',
  Summer: '夏',
  Autumn: '秋',
  Winter: '冬',
  Plum: '梅',
  Orchid: '兰',
  Chrysanthemum: '菊',
  Bamboo: '竹'
};
export const cardSuitMaps: StringMap = (function(): StringMap {
  const maps: StringMap = {};

  for (var i in cardMaps) {
    maps[cardMaps[i]] = i;
  }

  return maps;
})();

// 洗牌：随机打乱顺序
export let shuffleTiles = function(tiles: number[]): number[] {
  return _.shuffle(_.shuffle(_.shuffle(tiles)));
};

// 通过id获取麻将名
export let getTileSuit = function(tile: number): string {
  return cardMaps[Card[tile]];
};

// 通过麻将名获取id
export let getTileId = function(suit: string): number {
  return Card[cardSuitMaps[suit] as keyof typeof Card];
};

// 排序
export let sortTiles = function(tiles: number[]): number[] {
  return tiles.slice().sort(function(a: number, b: number): number {
    return a - b;
  });
};

// 批量导出麻将名
export let batchTilesSuit = function(tiles: number[], s: string = ','): string {
  const suits = tiles.map(getTileSuit);

  return suits.join(s);
};

// 批量导出id
export let batchTilesId = function(suit: string, s: string = ','): number[] {
  const suits = suit.split(s);

  return suits.map(getTileId);
};
