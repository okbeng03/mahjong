import * as _ from 'lodash';
import Bonus from '../bonus';
import Round from '../round';
import Player from '../playerDetail';
import { MeldDetail } from '../meld';
import { ClaimType, sortTiles, Card } from '../tile';
import { groupByType, groupSize } from './basic';

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

export function calculate(round: Round): Bonus[] {
  const players = round.players;
  const winner = round.winner;
  const bonus: Bonus[] = _.fill(Array(players.length), {
    score: 0,
    selfDraw: 0,
    win: 0,
    expose: 0,
    concealedKong: 0,
    cannon: 0
  });

  players.forEach(function(player, i) {
    checkKong(player, bonus);

    if (winner === i) {
      checkWin(player, bonus);
    }
    
    checkFlower(player, bonus);
  });

  return bonus;
}

function checkWin(player: Player, bonus: Bonus[]): void {
  const { win, winFrom, chowTiles, handTiles, pick } = player;
  let base = 1;

  // 检查牌型
  let tiles = handTiles;
  chowTiles.forEach(function(meld: MeldDetail) {
    tiles = tiles.concat(meld.tiles);
  });
  
  // 清一色
  if (checkOneType(tiles)) {
    base += 1;
  }

  const size = groupSize(handTiles);

  // 碰碰胡
  if (checkAllPong(chowTiles, size)) {
    base += 1;
  }

  if (handTiles.length === 14) {
    if (checkPair(size)) {
      // 七小对
      base += 1;
    } else if (checkLuxuryPair(size)) {
      // 豪华七小对
      base += 2;
    } else if (checkUniq(handTiles)) {
      // 十三幺
      base += 12;
    }
  }

  if (winFrom > -1) {
    bonus[winFrom].score -= 1;
    bonus[winFrom].cannon = 1;
  }

  switch(win) {
    case ClaimType.Win:
      bonus[pick].score *= 1;
      break;
    case ClaimType.SelfDraw:
      bonus[pick].score *= 2;
      break;
    case ClaimType.Kong: 
      bonus[pick].score *= 3;
      break;
  }
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

  return !_.pull(size.toString().split(''), '3').length;
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
function checkFlower(player: Player, bonus: Bonus[]): void {
  if (player.flowerWin) {
    bonus[player.pick].win = 1;
    bonus[player.pick].score += player.flowerWin;
  }
}

// 杠
function checkKong(player: Player, bonus: Bonus[]): void {
  player.chowTiles.forEach(function(meld: MeldDetail) {
    const pick = player.pick;

    if (meld.type === ClaimType.Expose) {
      bonus[pick].expose++;
      bonus[pick].score += 1;
      bonus[meld.from].score -= 1;
      bonus[meld.from].cannon = 1;
    }

    if (meld.type === ClaimType.ConcealedKong) {
      bonus[pick].concealedKong++;
      bonus[pick].score += 2;
    }
  });
}
