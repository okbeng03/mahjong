import * as _ from 'lodash';
// import Bonus from '../bonus';
import Round from '../round';
import Player from '../playerDetail';
import { MeldDetail } from '../meld';
import { ClaimType, sortTiles, Card } from '../tile';
import { groupByType, groupSize } from './basic';

// 胡牌类型
export enum WinType {
  CommonHand = 1, // 平胡
  Uniform,        // 清一色
  Pong,           // 碰碰胡
  Pair,           // 七小对
  LuxuryPair,     // 豪华七小对
  Uniq            // 十三幺
};

// 奖励类型
export enum BonusType {
  Win,            // 胡
  SelfDraw,       // 自摸
  Kong,           // 杠上开花
  Sky,            // 天胡
  Land,           // 地胡
  FlowerSeason,   // 花胡
  FlowerBotany,   // 花胡
  Expose,         // 明杠
  ConcealedKong,  // 暗杠
  BaoPai,         // 包牌
  Cannon,         // 放炮
  FirstFollow     // 首张被跟
};

const thirteenOrphans = [
  Card.CharacterOne,
  Card.CharacterNight,
  Card.DotOne,
  Card.DotNight,
  Card.BambooOne,
  Card.BambooNight,
  Card.East,
  Card.South,
  Card.West,
  Card.North,
  Card.Green,
  Card.Red,
  Card.White
];

export function calculate(round: Round): void {
  const players = round.players;
  const winner = players[round.winner];
  const banker = round.game.banker;
  const bankerCount = round.game.bankerCount + 1;
  const cannons: number[] = _.fill(Array(players.length), 0); // 放炮、接炮

  players.forEach(function(player) {
    checkKong(player, players, cannons);
    checkFlower(player);
  });

  const winScore = checkWin(winner);

  if (winner.winFrom > -1) {
    players[winner.winFrom].bonus.push(BonusType.Cannon);
    cannons[winner.pick] += 1;
    cannons[winner.winFrom] -= 1;
  }

  let isBaoPai = winner.fourMeld;

  if (winner.threeMeld > -1 && winner.winFrom === winner.threeMeld) {
    isBaoPai = winner.threeMeld;
  }

  // 包牌
  if (isBaoPai > -1) {
    compute(players, banker, bankerCount);
    players[isBaoPai].bonus.push(BonusType.BaoPai);
    let base = 1;
    let score = 0;

    if (winner.pick === banker) {
      base = bankerCount;
    }

    for (let i = 0, len = players.length; i < len; i++) {
      if (i === winner.pick) {
        continue;
      }

      if (i === banker) {
        base = bankerCount;
      }

      score += winScore * base;
    }

    winner.score += score;
    players[isBaoPai].score -= score;
  } else {
    winner.score += winScore;
    compute(players, banker, bankerCount);
  }

  addCannon(players, cannons);

  // 首张被跟
  if (_.indexOf(players[banker].bonus, BonusType.FirstFollow) > -1) {
    players.forEach(function(player, i) {
      if (i === banker) {
        player.score -= 3;
        return;
      }

      player.score += 1;
    });
  }
}

// 计算分数
function compute(players: Player[], banker: number, bankerCount: number) {
  const len = players.length;
  const bonus: number[] = _.fill(Array(len), 0); // 计算得分

  for (let i = 0; i < len; i++) {
    const player = players[i];

    if (player.score <= 0) {
      continue;
    }

    let base = 1;
    
    if (i === banker) {
      base = bankerCount;
    }

    for (let j = 0; j < len; j++) {
      let b = base;

      if (j === i) {
        continue;
      }

      if (j === banker) {
        b = bankerCount;
      }

      let s = player.score * b;
      bonus[i] += s;
      bonus[j] -= s;
    }
  }

  for (let i = 0; i < len; i++) {
    players[i].score = bonus[i];
  }
}

// 添加放炮、接炮得分
function addCannon(players: Player[], cannons: number[]): void {
  players.forEach(function(player, i) {
    player.score += cannons[i];
  });
}

// 计算胡的牌型和分数
function checkWin(player: Player): number {
  const { bonus, chowTiles, handTiles } = player;
  const winType = bonus.slice().sort(function(a: number, b: number): number {
    return a - b;
  })[0];
  let base = 1;

  // 检查牌型
  let tiles = handTiles;
  chowTiles.forEach(function(meld: MeldDetail) {
    tiles = tiles.concat(meld.tiles);
  });
  
  // 清一色
  if (checkOneType(tiles)) {
    base += 1;
    player.winType.push(WinType.Uniform);
  }

  const size = groupSize(handTiles);

  // 碰碰胡
  if (checkAllPong(chowTiles, size)) {
    base += 1;
    player.winType.push(WinType.Pong);
  }

  if (handTiles.length === 14) {
    if (checkPair(size)) {
      // 七小对
      base += 1;
      player.winType.push(WinType.Pair);
    } else if (checkLuxuryPair(size)) {
      // 豪华七小对
      base += 2;
      player.winType.push(WinType.LuxuryPair);
    } else if (checkUniq(handTiles)) {
      // 十三幺
      base += 12;
      player.winType.push(WinType.Uniq);
    }
  }

  if (!player.winType.length) {
    player.winType.push(WinType.CommonHand);
  }

  switch(winType) {
    case BonusType.Win:
      base *= 1;
      break;
    case BonusType.SelfDraw:
      base *= 2;
      break;
    case BonusType.Kong: 
      base *= 3;
      break;
    case BonusType.Sky:
      base *= 3;
      break;
    case BonusType.Land:
      base *= 3;
      break;
  }

  return base;
}

// 清一色
function checkOneType(tiles: number[]): boolean {
  const typeGroups = Object.keys(groupByType(tiles));

  return typeGroups.length === 1;
}

// 碰碰胡
function checkAllPong(chowTiles: MeldDetail[], size: number): boolean {
  for (let i = 0, len = chowTiles.length; i < len; i++) {
    if (chowTiles[i].type < ClaimType.Pong) {
      return false;
    }
  }

  return _.pull(size.toString().split(''), '3').length === 1;
}

// 七小对
function checkPair(size: number): boolean {
  return !_.pull(size.toString().split(''), '2').length;
}

// 豪华七小对
function checkLuxuryPair(size: number): boolean {
  const remain = _.pull(size.toString().split(''), '2');

  return remain.length === 1 && remain[0] === '4';
}

// 十三幺
function checkUniq(tiles: number[]): boolean {
  const uniqTiles = _.uniq(sortTiles(tiles.slice()));

  return uniqTiles.length === 13 && _.isEqual(uniqTiles, thirteenOrphans);
}

// 花胡
function checkFlower(player: Player): void {
  if (_.indexOf(player.bonus, BonusType.FlowerSeason) > -1) {
    player.score += 1;
  }

  if (_.indexOf(player.bonus, BonusType.FlowerBotany) > -1) {
    player.score += 1;
  }
}

// 杠
function checkKong(player: Player, players: Player[], cannons: number[]): void {
  player.chowTiles.forEach(function(meld: MeldDetail) {
    if (meld.type === ClaimType.Expose) {
      player.score += 1;
      player.bonus.push(BonusType.Expose);
      players[meld.from].bonus.push(BonusType.Cannon);
      cannons[player.pick] += 1;
      cannons[meld.from] -= 1;
    }

    if (meld.type === ClaimType.ConcealedKong) {
      player.score += 2;
      player.bonus.push(BonusType.ConcealedKong);
    }
  });
}
