import Player from './player';
import Round from './round';
import { Pick } from './tile';

// 桌
export default class Game {
  players: Player[];  // 玩家
  rounds: Round[];    // 局
  order: number;      // 令
  banker: number;     // 庄家
  bankerCount: number;// 庄数
  bonus: number[];     // 分数
  mutation: Function = function() {};

  constructor() {
    this.order = Pick.East;
    this.banker = 0;
    this.bankerCount = 0;
    this.bonus = [];
    this.players = [];
    this.rounds = [];
  }

  // 添加玩家
  addPlayer(id: number, name: string, isAI: boolean = false): void {
    const len = this.players.length;

    if (len >= 4) {
      console.log('座位已满!');
      return;
    }

    const player = new Player(id, name, len, isAI);
    this.players.push(player);
  }

  // 开局
  start() {
    if (this.players.length < 4) {
      console.log('人数不够，不能开始!');
      return;
    }

    const round = new Round(this);
    round.start();
    this.rounds.push(round);

    this.action('game:start');
  }

  // 本局结束，进入下一局
  finish() {
    const len = this.rounds.length;

    if (len) {
      // 换庄
      const round = this.rounds[len - 1];

      if (round.winner !== this.banker) {
        this.banker++;
        this.bankerCount = 0;

        if (this.banker > 3) {
          this.banker = 0;
          this.order++;
        }

        if (this.order > 4) {
          this.order = Pick.East;
        }
      } else {
        this.bankerCount++;
      }

      this.end();

      // 下一局
      // this.start();
    }
  }
  
  end() {
    for (let i = 0, len = this.players.length; i < len; i++) {
      this.bonus[i] = 0;
    }

    const bonus = this.bonus;

    this.rounds.forEach(round => {
      round.players.forEach((player, i) => {
        bonus[i] += player.score;
      });
    });

    // this.action('game:end');
  }

  action(type: string, data?: any) {
    this.mutation(type, data);
  }

  subscribe(cb: Function): void {
    this.mutation = cb;
  }
};
