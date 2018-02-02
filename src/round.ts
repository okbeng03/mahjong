import * as _ from 'lodash';
import Game from './game';
import Player from './playerDetail';
import Wall from './wall';
import { calculate, BonusType } from './rules/bonus';
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
  firstFlow: number;

  constructor(game: Game) {
    this.game = game;
    this.players = [];
    game.players.forEach((player) => {
      this.addPlayer(player.id, player.name, player.pick);
    });
    this.claims = [-1, -1, -1, -1];
    this.canClaims = [0, 0, 0, 0];
    this.firstFlow = 4;
    this.winner = -1;
  }

  addPlayer(id: number, name: string, pick: number): void {
    const player = new Player(id, name, pick);
    this.players.push(player);
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
    this.checkFirstFlow(tile);

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
    this.firstFlow = 0; // 有人行动，就不会形成首张被跟
    this.claims[player] = claim;

    // 所有玩家都行动完，检查谁可以行动
    if (_.pull(this.canClaims.slice(), 0).length === _.pull(this.claims.slice(), -1).length) {
      // 如果大家都不行动
      if (_.uniq(_.pull(this.claims.slice(), -1)).join('') === '0') {
        this.claims = [-1, -1, -1, -1];
        this.canClaims = [0, 0, 0, 0];
        this.next();
      } else {
        player = this.claims.indexOf(_.max(this.claims));
        this.players[this.player].tranfer();
        this.players[player].action(this.player);
        this.player = player;

        this.claims = [-1, -1, -1, -1];
        this.canClaims = [0, 0, 0, 0];
      }
    }
  }

  // 谁行动
  next() {
    this.player = this.getNext();
    this.players[this.player].deal();
  }

  // 检查首张被跟
  private checkFirstFlow(tile: number): void {
    // 第4轮检查大家手牌，看是不是首张被跟
    if (!this.firstFlow) {
      return;
    } else {
      let flag = true;

      for (let i = 0, len = this.players.length; i < len; i++) {
        if (i === this.player) {
          continue;
        }

        const player = this.players[i];

        if (player.discardTiles.length && player.discardTiles[0] !== tile) {
          flag = false;
          break;
        }
      }

      if (flag) {
        if (this.firstFlow === 1) {
          this.players[this.game.banker].bonus.push(BonusType.FirstFollow);
        }

        this.firstFlow--;
      } else {
        this.firstFlow = 0;
      }
    }
  }

  private getNext(): number {
    return (this.player + 1) % 4;
  }
};
