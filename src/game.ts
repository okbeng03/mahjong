import Player from './playerDetail';
import Round from './round';
import Bonus from './bonus';
import { Pick } from './tile';

// 桌
export default class Game {
  players: Player[];  // 玩家
  rounds: Round[];    // 局
  order: number;      // 令
  banker: number;     // 庄家
  bankerCount: number;// 庄数
  bonus: Bonus[];     // 分数

  constructor() {
    this.order = Pick.East;
    this.banker = 0;
    this.bankerCount = 1;
    this.bonus = [];
  }

  // 添加玩家
  addPlayer(id: number, name: string): void {
    const len = this.players.length;

    if (len >= 4) {
      console.log('座位已满!');
      return;
    }

    const player = new Player(id, name, len + 1);
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
  }

  // 本局结束，进入下一局
  finish() {
    const len = this.rounds.length;

    if (len) {
      // 换庄
      const round = this.rounds[len - 1];

      if (round.winner !== this.banker) {
        this.banker++;
        this.bankerCount = 1;

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

      // 下一局
      this.start();
    }
  }
  
  // TODO: 游戏结束，统计分数
  end() {
    this.rounds.forEach((round) => {

    });
  }
};
