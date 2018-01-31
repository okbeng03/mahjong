import * as _ from 'lodash';
import Game from './game';
import Player from './playerDetail';
import Wall from './wall';
import { calculate } from './rules/bonus';
import { ClaimType } from './tile';

const defaultOrder = [0, 1, 2, 3];

// 局
export default class Round {
  game: Game;         // 桌     
  players: Player[];  // 玩家
  player: number;     // 当前出牌的玩家
  winner: number;     // 赢家
  wall: Wall;         // 牌
  claims: ClaimType[]; // 每个玩家提出的行动
  canClaims: number[]; // 每个玩家是否能行动, 0不能行动，1可以行动

  constructor(game: Game) {
    this.game = game;
    this.players = game.players;
    this.claims = [-1, -1, -1, -1];
    this.canClaims = [0, 0, 0, 0];
  }

  // 开局
  start() {
    this.wall = new Wall();
    const banker = this.game.banker;
    const order = defaultOrder.slice(banker).concat(defaultOrder.slice(0, banker));

    order.forEach((pick, i) => {
      this.players[pick].start(this, !i);
    });

    this.player = banker;
  }

  // 结束
  finish(player: number) {
    this.winner = player;
    calculate(this);
    this.game.finish();
  }

  // 流局
  draw() {
    this.winner = this.game.banker;
    this.game.finish();
  }

  // 上家出牌，检查哪个玩家能行动
  check(tile: number) {
    this.players.forEach((player, i) => {
      if (this.player === i) {
        return;
      }

      this.canClaims[i] = player.checkClaim(tile, i === this.getNext()) ? 1 : 0;
    });

    // 大家都不能行动，直接下家
    // 大家能行动，等待行动指令
    if (this.canClaims.join('') === '0000') {
      this.next();
    }
  }

  // 玩家行动
  claim(player: number, claim: ClaimType) {
    this.claims[player] = claim;

    // 所有玩家都行动完，检查谁可以行动
    if (_.pull(this.canClaims, 0).length === _.pull(this.claims, -1).length) {
      player = _.findIndex(this.claims, _.max(this.claims));
      this.players[player].action(this.player);
      this.player = player;

      this.claims = [-1, -1, -1, -1];
      this.canClaims = [0, 0, 0, 0];
    }
  }

  // 谁行动
  next() {
    this.player = this.getNext();
    this.players[this.player].deal();
  }

  private getNext(): number {
    return (this.player + 1) % 4;
  }
};
