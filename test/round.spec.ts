import { expect } from 'chai';
import Game from '../src/game';
import Round from '../src/round';
import Player from '../src/playerDetail';
import Wall from '../src/wall';
import { ClaimType } from '../src/tile';
import { canReadyHand } from '../src/rules/basic';
import { BonusType } from '../src/rules/bonus';

describe('round', () => {
  let game;

  before(() => {
    game = new Game();
    game.banker = 1;
    game.addPlayer(1, 'test1');
    game.addPlayer(2, 'test2');
    game.addPlayer(3, 'test3');
    game.addPlayer(4, 'test4');
    game.start();
  });
  
  it('constructor', function() {
    const round = game.rounds[game.rounds.length - 1];

    expect(round.game).to.eql(game);
    expect(round.players.length).to.equal(4);
    expect(round.players[2].name).to.equal('test3');
    expect(round.players[2] instanceof Player).to.be.ok;
    expect(round.claims).to.eql([-1, -1, -1, -1]);
    expect(round.canClaims).to.eql([0, 0, 0, 0]);
    expect(round.firstFlow).to.equal(4);
    expect(round.winner).to.equal(-1);
  });

  it('start', function() {
    const round = game.rounds[game.rounds.length - 1];

    expect(round.wall instanceof Wall).to.be.ok;
    expect(round.player).to.be.equal(1);
    expect(round.players[0].handTiles.length).to.be.equal(13);
    expect(round.players[1].handTiles.length).to.be.equal(14);
    expect(round.players[2].handTiles.length).to.be.equal(13);
    expect(round.players[3].handTiles.length).to.be.equal(13);
  });
});

describe('check', () => {
  let game;
  let round;
  let players;

  before(() => {
    game = new Game();
    game.addPlayer(1, 'test1');
    game.addPlayer(2, 'test2');
    game.addPlayer(3, 'test3');
    game.addPlayer(4, 'test4');
  });

  beforeEach(() => {
    game.start();
    round = game.rounds[game.rounds.length - 1];
    players = round.players;
    players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31];
    players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 32];
    players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 34, 34, 34];
    players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
  });

  describe('check', () => {
    it('no body check go next', function() {
      round.check(19);

      expect(round.canClaims).to.eql([0, 0, 0, 0]);
      round.draw();
    });

    it('one check', function() {
      round.check(5);

      expect(round.canClaims).to.eql([0, 1, 0, 0]);
      round.draw();
    });

    it('more check', function() {
      round.check(18);

      expect(round.canClaims).to.eql([0, 1, 1, 1]);
      round.draw();
    });

    it('first flow', function() {
      players[0].discard(41);
      expect(round.firstFlow).to.equal(3);
      players[1].discard(41);
      expect(round.firstFlow).to.equal(2);
      players[2].discard(41);
      expect(round.firstFlow).to.equal(1);
      players[3].discard(41);
      expect(round.firstFlow).to.equal(0);

      expect(players[0].bonus).to.eql([BonusType.FirstFollow]);
      round.draw();
    });

    it('no first flow', function() {
      players[0].discard(41);
      expect(round.firstFlow).to.equal(3);
      players[1].discard(41);
      expect(round.firstFlow).to.equal(2);
      players[2].discard(42);
      expect(round.firstFlow).to.equal(0);
      players[3].discard(41);
      expect(round.firstFlow).to.equal(0);
      round.draw();
    });

    it('no first flow though four some tile', function() {
      players[0].discard(9);
      expect(round.firstFlow).to.equal(3);
      expect(round.canClaims).to.eql([0, 1, 0, 0]);
      round.claim(1, ClaimType.Chow);
      expect(round.firstFlow).to.equal(0);
      players[1].discard(41);
      expect(round.firstFlow).to.equal(0);
      players[2].discard(41);
      expect(round.firstFlow).to.equal(0);
      players[3].discard(41);
      expect(round.firstFlow).to.equal(0);
      players[0].discard(41);
      expect(round.firstFlow).to.equal(0);
      round.draw();
    });

    it('next', function() {
      players[0].discard(41);
      expect(round.player).to.equal(1);
      players[0].discard(43);
      expect(round.player).to.equal(2);
      players[0].discard(45);
      expect(round.player).to.equal(3);
      players[0].discard(47);
      expect(round.player).to.equal(0);
      round.draw();
    });
  });

  describe('claim', () => {
    it('one claim', function() {
      players[0].discard(5);
      expect(round.canClaims).to.eql([0, 1, 0, 0]);
      expect(players[1].melds).to.eql([
        {
          type: ClaimType.Chow,
          tiles: [4, 6, 5]
        },
        {
          type: ClaimType.Chow,
          tiles: [6, 7, 5]
        },
        {
          type: ClaimType.None,
          tiles: []
        }
      ]);
      players[1].claim(0);
      expect(round.canClaims).to.eql([0, 0, 0, 0]);
      expect(round.claims).to.eql([-1, -1, -1, -1]);
      expect(round.player).to.eql(1);
      expect(players[1].chowTiles).to.eql([
        {
          type: ClaimType.Chow,
          tiles: [4, 6, 5],
          from: 0
        }
      ]);
      round.draw();
    });

    it('one check, bug not claim', function() {
      players[0].discard(8);
      expect(round.canClaims).to.eql([0, 1, 0, 0]);
      expect(players[1].melds).to.eql([
        {
          type: ClaimType.Chow,
          tiles: [6, 7, 8]
        },
        {
          type: ClaimType.None,
          tiles: []
        }
      ]);
      players[1].claim(1);
      expect(round.canClaims).to.eql([0, 0, 0, 0]);
      expect(round.claims).to.eql([-1, -1, -1, -1]);
      expect(round.player).to.eql(1);
      expect(players[1].chowTiles).to.eql([]);
      round.draw();
    });

    it('more claim, pong great than chow', function() {
      players[0].discard(41);
      players[1].discard(41);
      players[2].discard(41);
      players[3].discard(24);
      expect(round.canClaims).to.eql([1, 1, 0, 0]);
      
      players[0].claim(0);
      players[1].claim(0);
      expect(round.canClaims).to.eql([0, 0, 0, 0]);
      expect(round.claims).to.eql([-1, -1, -1, -1]);
      expect(round.player).to.equal(1);
      expect(players[0].chowTiles.length).to.equal(0);
      expect(players[1].chowTiles.length).to.equal(1);
      round.draw();
    });

    it('more check, one claim', function() {
      players[0].discard(41);
      players[1].discard(41);
      players[2].discard(41);
      players[3].discard(6);
      expect(round.canClaims).to.eql([1, 0, 1, 0]);
      
      players[0].claim(0);
      players[2].claim(1);
      expect(round.canClaims).to.eql([0, 0, 0, 0]);
      expect(round.claims).to.eql([-1, -1, -1, -1]);
      expect(round.player).to.equal(0);
      expect(players[0].chowTiles.length).to.equal(1);
      expect(players[2].chowTiles.length).to.equal(0);
      round.draw();
    });

    it('jie hu', function() {
      players[0].discard(18);
      expect(round.canClaims).to.eql([0, 1, 1, 1]);

      players[1].claim(0);
      players[2].claim(0);
      expect(round.claims).to.eql([-1, ClaimType.Expose, ClaimType.Win, -1]);
      players[3].claim(0);
      expect(round.canClaims).to.eql([0, 0, 0, 0]);
      expect(round.claims).to.eql([-1, -1, -1, -1]);
      expect(round.player).to.equal(2);
      expect(round.winner).to.equal(2);
    });
  });
});
