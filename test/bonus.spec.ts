import { expect } from 'chai';
const rewire = require('rewire');
import { batchTilesId, ClaimType } from '../src/tile';
const bonusRule = rewire('../src/rules/bonus');
import Game from '../src/game';
import Round from '../src/round';
import Player from '../src/playerDetail';
import { calculate, BonusType, WinType } from '../src/rules/bonus';

describe('check win', () => {
  const checkWin = bonusRule.__get__('checkWin');
  let player: Player;

  beforeEach(() => {
    player = new Player(0, 'test', 0);
    player.winFrom = -1;
  });

  describe('check win type', () => {
    it('normal', function() {
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      const score = checkWin(player);

      expect(score).to.equal(1);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });

    it('uniform', function() {
      player.handTiles = batchTilesId('一万,二万,二万,三万,三万,四万,五万,五万,六万,七万,八万,九万,九万,九万');
      const score = checkWin(player);

      expect(score).to.equal(2);
      expect(player.winType).to.eql([WinType.Uniform]);
    });

    it('pong', function() {
      player.handTiles = batchTilesId('二万,二万,二万,三万,三万,三万,五万,五万,五万,九万,九万,九万,二条,二条');
      const score = checkWin(player);

      expect(score).to.equal(2);
      expect(player.winType).to.eql([WinType.Pong]);
    });

    it('uniform and pong', function() {
      player.handTiles = batchTilesId('二万,二万,二万,三万,三万,三万,五万,五万,五万,七万,七万,九万,九万,九万');
      const score = checkWin(player);

      expect(score).to.equal(3);
      expect(player.winType).to.eql([WinType.Uniform, WinType.Pong]);
    });

    it('pair', function() {
      player.handTiles = batchTilesId('二万,二万,三万,三万,五万,五万,九万,九万,二条,二条,东风,东风,发财,发财');
      const score = checkWin(player);

      expect(score).to.equal(2);
      expect(player.winType).to.eql([WinType.Pair]);
    });

    it('luxury pair', function() {
      player.handTiles = batchTilesId('二万,二万,三万,三万,五万,五万,九万,九万,二条,二条,东风,东风,东风,东风');
      const score = checkWin(player);

      expect(score).to.equal(3);
      expect(player.winType).to.eql([WinType.LuxuryPair]);
    });

    it('uniq', function() {
      player.handTiles = batchTilesId('一万,九万,一筒,九筒,一条,九条,东风,东风,南风,西风,北风,发财,红中,白板');
      const score = checkWin(player);

      expect(score).to.equal(13);
      expect(player.winType).to.eql([WinType.Uniq]);
    });

    it('has chow', function() {
      player.chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: batchTilesId('一万,二万,三万'),
          from: 3
        }
      ]
      player.handTiles = batchTilesId('九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      const score = checkWin(player);

      expect(score).to.equal(1);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });
  });

  describe('check bonus type', () => {
    it('win', function() {
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      player.bonus = [BonusType.Win];
      const score = checkWin(player);

      expect(score).to.equal(1);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });

    it('self draw', function() {
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      player.bonus = [BonusType.SelfDraw];
      const score = checkWin(player);

      expect(score).to.equal(2);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });

    it('kong', function() {
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      player.bonus = [BonusType.Kong];
      const score = checkWin(player);

      expect(score).to.equal(3);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });

    it('sky', function() {
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      player.bonus = [BonusType.Sky];
      const score = checkWin(player);

      expect(score).to.equal(3);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });

    it('land', function() {
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      player.bonus = [BonusType.Land];
      const score = checkWin(player);

      expect(score).to.equal(3);
      expect(player.winType).to.eql([WinType.CommonHand]);
    });
  });
});

describe('check flower', () => {
  const checkFlower = bonusRule.__get__('checkFlower');
  let player: Player;

  beforeEach(() => {
    player = new Player(0, 'test', 0);
    player.winFrom = -1;
  });

  it('check one flower', function() {
    player.flowerTiles = [51, 52, 53, 54];
    player.bonus = [BonusType.FlowerSeason];
    checkFlower(player);

    expect(player.score).to.equal(1);
  });

  it('check two flower', function() {
    player.flowerTiles = [51, 52, 53, 54, 55, 56, 57, 58];
    player.bonus = [BonusType.FlowerSeason, BonusType.FlowerBotany];
    checkFlower(player);

    expect(player.score).to.equal(2);
  });

  it('check none flower', function() {
    it('check two flower', function() {
      player.flowerTiles = [52, 53];
      player.bonus = [];
      checkFlower(player);
  
      expect(player.score).to.equal(0);
    });
  });
});

describe('caculate', () => {
  let game: Game;
  let round: Round;

  before(() => {
    game = new Game();
    game.addPlayer(1, 'test1');
    game.addPlayer(2, 'test2');
    game.addPlayer(3, 'test3');
    game.addPlayer(4, 'test4');
  });

  beforeEach(() => {
    game.banker = 0;
    game.rounds = [];
    game.start();
    round = game.rounds[0];
  });

  describe('only win', () => {
    it('win', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(4);
      expect(players[1].score).to.equal(-1);
      expect(players[2].score).to.equal(-2);
      expect(players[3].score).to.equal(-1);
    });

    it('self draw', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.SelfDraw];
      players[0].winFrom = -1;
      round.finish(0);

      expect(players[0].score).to.equal(6);
      expect(players[1].score).to.equal(-2);
      expect(players[2].score).to.equal(-2);
      expect(players[3].score).to.equal(-2);
    });

    it('kong', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Kong];
      players[0].winFrom = -1;
      round.finish(0);

      expect(players[0].score).to.equal(9);
      expect(players[1].score).to.equal(-3);
      expect(players[2].score).to.equal(-3);
      expect(players[3].score).to.equal(-3);
    });
  });

  describe('has kong', () => {
    it('expose', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,五筒,六筒,七筒,二条,二条');
      players[0].chowTiles = [
        {
          type: ClaimType.Expose,
          tiles: [9, 9, 9, 9],
          from: 1
        },
        {
          type: ClaimType.Expose,
          tiles: [24, 24, 24, 24],
          from: 3
        }
      ];
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(12);
      expect(players[1].score).to.equal(-4);
      expect(players[2].score).to.equal(-4);
      expect(players[3].score).to.equal(-4);
    });

    it('concealed kong', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      players[1].chowTiles = [
        {
          type: ClaimType.ConcealedKong,
          tiles: [31, 31, 31, 31],
          from: -1
        }
      ];
      round.finish(0);

      expect(players[0].score).to.equal(2);
      expect(players[1].score).to.equal(5);
      expect(players[2].score).to.equal(-4);
      expect(players[3].score).to.equal(-3);
    });

    it('compose', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].chowTiles = [
        {
          type: ClaimType.Expose,
          tiles: [9, 9, 9, 9],
          from: 1
        }
      ]
      players[0].bonus = [BonusType.SelfDraw];
      players[0].winFrom = -1;
      players[1].chowTiles = [
        {
          type: ClaimType.ConcealedKong,
          tiles: [31, 31, 31, 31],
          from: -1
        }
      ];
      round.finish(0);

      expect(players[0].score).to.equal(8);
      expect(players[1].score).to.equal(2);
      expect(players[2].score).to.equal(-5);
      expect(players[3].score).to.equal(-5);
    });
  });

  describe('has flower', () => {
    it('winner has flower', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].flowerTiles = [51, 52, 53, 54, 56];
      players[0].bonus = [BonusType.Win, BonusType.FlowerSeason];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(7);
      expect(players[1].score).to.equal(-2);
      expect(players[2].score).to.equal(-3);
      expect(players[3].score).to.equal(-2);
    });
    
    it('other has flower', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      players[3].flowerTiles = [51, 55, 56, 57, 58];
      players[3].bonus = [BonusType.FlowerBotany];
      round.finish(0);

      expect(players[0].score).to.equal(3);
      expect(players[1].score).to.equal(-2);
      expect(players[2].score).to.equal(-3);
      expect(players[3].score).to.equal(2);
    });

    it('compose', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].flowerTiles = [51, 52, 53, 54];
      players[0].bonus = [BonusType.Win, BonusType.FlowerSeason];
      players[0].winFrom = 2;
      players[3].flowerTiles = [55, 56, 57, 58];
      players[3].bonus = [BonusType.FlowerBotany];
      round.finish(0);

      expect(players[0].score).to.equal(6);
      expect(players[1].score).to.equal(-3);
      expect(players[2].score).to.equal(-4);
      expect(players[3].score).to.equal(1);
    });
  });

  describe('first flow', () => {
    it('winner first flow', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Win, BonusType.FirstFollow];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(1);
      expect(players[1].score).to.equal(0);
      expect(players[2].score).to.equal(-1);
      expect(players[3].score).to.equal(0);
    });

    it('other first flow', function() {
      game.banker = 2;
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      players[2].bonus = [BonusType.FirstFollow];
      round.finish(0);

      expect(players[0].score).to.equal(5);
      expect(players[1].score).to.equal(0);
      expect(players[2].score).to.equal(-5);
      expect(players[3].score).to.equal(0);
    });
  });

  describe('has bao pai', () => {
    it('only win bao pai', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('二条,三条,四条,四条,四条');
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [1, 2, 3],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [9, 9, 9],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [15, 16, 17],
          from: 2
        }
      ];
      players[0].threeMeld = 2;
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(4);
      expect(players[1].score).to.equal(0);
      expect(players[2].score).to.equal(-4);
      expect(players[3].score).to.equal(0);
    });

    it('compose bao pai', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('二条,二条');
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [1, 2, 3],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [9, 9, 9],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [15, 16, 17],
          from: 2
        },
        {
          type: ClaimType.Expose,
          tiles: [24, 24, 24, 24],
          from: 1
        }
      ];
      players[0].threeMeld = 2;
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(8);
      expect(players[1].score).to.equal(-2);
      expect(players[2].score).to.equal(-5);
      expect(players[3].score).to.equal(-1);
    });

    it('four pair bao pai', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('二条,二条');
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [1, 2, 3],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [9, 9, 9],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [15, 16, 17],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [24, 24, 24],
          from: 2
        }
      ];
      players[0].fourMeld = 2;
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      round.finish(0);

      expect(players[0].score).to.equal(4);
      expect(players[1].score).to.equal(0);
      expect(players[2].score).to.equal(-4);
      expect(players[3].score).to.equal(0);
    });

    it('four pair bao pai from others', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('二条,二条');
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [1, 2, 3],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [9, 9, 9],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [15, 16, 17],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [24, 24, 24],
          from: 2
        }
      ];
      players[0].fourMeld = 2;
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 1;
      round.finish(0);

      expect(players[0].score).to.equal(4);
      expect(players[1].score).to.equal(-1);
      expect(players[2].score).to.equal(-3);
      expect(players[3].score).to.equal(0);
    });

    it('four pair bao pai by self draw', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('二条,二条');
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [1, 2, 3],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [9, 9, 9],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [15, 16, 17],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [24, 24, 24],
          from: 2
        }
      ];
      players[0].fourMeld = 2;
      players[0].bonus = [BonusType.SelfDraw];
      players[0].winFrom = -1;
      round.finish(0);

      expect(players[0].score).to.equal(6);
      expect(players[1].score).to.equal(0);
      expect(players[2].score).to.equal(-6);
      expect(players[3].score).to.equal(0);
    });

    it('not bao pai', function() {
      game.bankerCount = 0;
      const players = round.players;
      players[0].handTiles = batchTilesId('二条,三条,四条,四条,四条');
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [1, 2, 3],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [9, 9, 9],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [15, 16, 17],
          from: 2
        }
      ];
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 1;
      round.finish(0);

      expect(players[0].score).to.equal(4);
      expect(players[1].score).to.equal(-2);
      expect(players[2].score).to.equal(-1);
      expect(players[3].score).to.equal(-1);
    });
  });

  describe('banker count', () => {
    it('banker count 1', function() {
      game.bankerCount = 1;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.SelfDraw];
      players[0].winFrom = -1;
      round.finish(0);

      expect(players[0].score).to.equal(12);
      expect(players[1].score).to.equal(-4);
      expect(players[2].score).to.equal(-4);
      expect(players[3].score).to.equal(-4);
    });

    it('banker count 2', function() {
      game.bankerCount = 2;
      const players = round.players;
      players[0].handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,五筒,六筒,七筒,二条,三条,四条,四条,四条');
      players[0].bonus = [BonusType.Win];
      players[0].winFrom = 2;
      players[1].chowTiles = [
        {
          type: ClaimType.ConcealedKong,
          tiles: [31, 31, 31, 31],
          from: -1
        }
      ];
      round.finish(0);

      expect(players[0].score).to.equal(4);
      expect(players[1].score).to.equal(7);
      expect(players[2].score).to.equal(-6);
      expect(players[3].score).to.equal(-5);
    });
  });
});
