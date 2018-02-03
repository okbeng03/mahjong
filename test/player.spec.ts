import { expect } from 'chai';
import Game from '../src/game';
import Round from '../src/round';
import Player from '../src/playerDetail';
import { ClaimType } from '../src/tile';
import { BonusType } from '../src/rules/bonus';

describe('player', () => {
  it('contructor', function() {
    const player = new Player(0, 'test', 1);

    expect(player.id).to.equal(0);
    expect(player.name).to.equal('test');
    expect(player.pick).to.equal(1);
    expect(player.handTiles).to.be.empty;
    expect(player.discardTiles).to.be.empty;
    expect(player.flowerTiles).to.be.empty;
    expect(player.chowTiles).to.be.empty;
    expect(player.hasDiscard).to.be.false;
    expect(player.readyHand).to.be.empty;
    expect(player.chowTiles).to.be.empty;
    expect(player.readyHandTiles).to.be.empty;
    expect(player.canWin).to.be.true;
    expect(player.eye).to.be.empty;
    expect(player.remainTiles).to.be.empty;
    expect(player.score).to.equal(0);
    expect(player.winFrom).to.equal(-1);
    expect(player.winType).to.be.empty;
    expect(player.bonus).to.be.empty;
    expect(player.threeMeld).to.equal(-1);
    expect(player.fourMeld).to.equal(-1);
    expect(player.discardClaim).to.be.false;
  });
});

describe('player props', () => {
  let game;
  let round;
  let players;
  let wall;

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
    wall = round.wall;
  });

  describe('start', () => {
    it('start', function() {
      expect(players[0].handTiles.length).to.equal(14);
      expect(players[0].isBanker).to.be.ok;
      expect(players[0].discardClaim).to.be.ok;
      expect(players[1].handTiles.length).to.equal(13);
      expect(players[2].handTiles.length).to.equal(13);
      expect(players[3].handTiles.length).to.equal(13);

      const tiles = players[0].handTiles.sort((a, b) => a - b);
      expect(players[0].handTiles).to.eql(tiles);

      round.draw();
    });
  });

  describe('deal', () => {
    it('deal', function() {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31, 41];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 32];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
      players[0].discard(41);
      expect(players[0].handTiles.length).to.equal(13);
      expect(players[0].discardClaim).to.not.be.ok;
      expect(players[1].handTiles.length).to.equal(14);
      expect(players[1].discardClaim).to.be.ok;
      expect(players[2].handTiles.length).to.equal(13);
      expect(players[3].handTiles.length).to.equal(13);
      round.draw();
    });
  });

  describe('draw', () => {
    it('flower draw', function() {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31, 41];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 32];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
      wall.tiles[0] = 53;
      const len = players[1].flowerTiles.length;
      players[0].discard(41);
      expect(players[1].flowerTiles.length).to.above(len);
      expect(players[1].handTiles.length).to.equal(14);
      round.draw();
    });

    it('expose draw', function() {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31, 33];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 31];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
      wall.tiles[0] = 43;
      players[0].discard(33);
      players[2].claim(0);
      expect(players[2].handTiles.length).to.equal(11);
      expect(players[2].discardClaim).to.be.ok;
      expect(players[2].chowTiles).to.eql([
        {
          type: ClaimType.Expose,
          tiles: [33, 33, 33, 33],
          from: 0
        }
      ]);
      round.draw();
    });

    it('concealed kong draw', function() {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31, 41];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 32];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
      wall.tiles[0] = 18;
      players[0].discard(41);
      players[1].claim(0);
      expect(players[1].handTiles.length).to.equal(11);
      expect(players[1].discardClaim).to.be.ok;
      expect(players[1].chowTiles).to.eql([
        {
          type: ClaimType.ConcealedKong,
          tiles: [18, 18, 18, 18],
          from: -1
        }
      ]);
      round.draw();
    });
  });

  describe('transfer', () => {
    it('has transfer', function() {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31, 41];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 32];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
      wall.tiles[0] = 43;
      players[0].discard(5);
      players[1].claim(0);
      expect(players[0].discardTiles.length).to.equal(0);
      expect(players[1].handTiles.length).to.equal(11);
      expect(players[1].discardClaim).to.be.ok;
      round.draw();
    });

    it('has not transfer', function() {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31, 41];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 32];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 17, 19, 24, 25, 26, 29, 29];
      wall.tiles[0] = 43;
      players[0].discard(41);
      expect(players[0].discardTiles.length).to.equal(1);
      expect(players[1].handTiles.length).to.equal(14);
      expect(players[1].discardClaim).to.be.ok;
      round.draw();
    });
  });

  describe('action', () => {
    beforeEach(() => {
      players[0].handTiles = [1, 2, 3, 4, 5, 12, 12, 23, 25, 29, 31, 31, 31];
      players[1].handTiles = [1, 4, 6, 7, 8, 18, 18, 18, 24, 24, 26, 27, 35];
      players[2].handTiles = [2, 3, 4, 6, 6, 16, 17, 22, 23, 24, 33, 33, 33];
      players[3].handTiles = [2, 3, 4, 7, 8, 9, 19, 19, 24, 25, 26, 29, 29];
    });

    it('win', function() {
      players[0].handTiles.push(41);
      wall.tiles[0] = 43;
      players[0].discard(41);
      wall.tiles[0] = 43;
      players[1].discard(43);
      wall.tiles[0] = 43;
      players[2].discard(43);
      wall.tiles[0] = 45;
      players[3].discard(43);
      players[0].discard(15);
      players[2].claim(0);
      
      expect(players[2].winFrom).to.equal(0);
      expect(players[2].bonus).to.eql([BonusType.Win]);
      expect(round.winner).to.equal(2);
      expect(game.banker).to.equal(1);
    });

    it('self draw', function() {
      players[1].handTiles.push(41);
      wall.tiles[0] = 43;
      players[1].discard(41);
      wall.tiles[0] = 43;
      players[2].discard(43);
      wall.tiles[0] = 43;
      players[3].discard(43);
      wall.tiles[0] = 45;
      players[0].discard(43);
      wall.tiles[0] = 15;
      players[1].discard(45);
      players[2].claim(0);
      
      expect(players[2].winFrom).to.equal(-1);
      expect(players[2].bonus).to.eql([BonusType.SelfDraw]);
      expect(round.winner).to.equal(2);
      expect(game.banker).to.equal(2);
    });

    it('kong', function() {
      players[2].handTiles.push(41);
      wall.tiles[0] = 53;
      wall.tiles.splice(-1, 1, 19);
      players[2].discard(41);
      players[3].claim(0);
      
      expect(players[3].winFrom).to.equal(-1);
      expect(players[3].bonus).to.eql([BonusType.Kong]);
      expect(round.winner).to.equal(3);
      expect(game.banker).to.equal(3);
    });

    it('concealed kong', function() {
      players[3].handTiles.push(41);
      wall.tiles[0] = 31;
      players[3].discard(41);
      players[0].claim(0);
      round.finish(2);

      expect(players[0].bonus).to.eql([BonusType.ConcealedKong]);
      expect(round.player).to.equal(0);
    });

    it('expose', function() {
      players[0].handTiles.push(41);
      players[3].discard(33);
      players[2].claim(0);
      round.finish(2);

      expect(players[2].bonus).to.eql([BonusType.Expose]);
      expect(round.player).to.equal(2);
    });

    it('chow', function() {
      players[1].handTiles.push(41);
      players[1].discard(2);
      players[2].claim(0);

      expect(players[2].chowTiles).to.eql([
        {
          type: ClaimType.Chow,
          tiles: [3, 4, 2],
          from: 1
        }
      ]);
      expect(round.player).to.equal(2);
      round.draw();
    });

    it('baopai', function() {
      players[1].handTiles.push(41);
      players[1].discard(4);
      players[2].claim(0);
      players[2].discard(4);
      players[3].claim(1);
      players[3].discard(9);
      wall.tiles[0] = 33;
      players[0].discard(1);
      wall.tiles.splice(-1, 1, 43);
      players[1].discard(33);
      players[2].claim(0);
      players[2].discard(43);
      players[3].discard(29);
      players[0].discard(31);
      players[1].discard(22);
      players[2].claim(0);

      expect(players[2].threeMeld).to.equal(1);
      round.draw();
    });

    it('baopai three', function() {   
      players[1].handTiles.push(41);
      players[1].discard(4);
      players[2].claim(0);
      players[2].discard(4);
      players[3].claim(1);
      wall.tiles[0] = 33;
      players[3].discard(9);
      wall.tiles.splice(-1, 1, 43);
      players[0].discard(33);
      players[2].claim(0);
      players[2].discard(43);
      players[3].discard(29);
      players[0].discard(31);
      players[1].discard(22);
      players[2].claim(0);
      players[2].discard(22);
      players[3].discard(29);
      players[0].discard(31);
      players[1].discard(6);
      players[2].claim(0);

      expect(players[2].threeMeld).to.equal(1);
      round.draw();
    });

    it('baopai four', function() {
      players[1].handTiles.push(41);
      players[1].discard(4);
      players[2].claim(0);
      players[2].discard(4);
      players[3].claim(1);
      players[3].discard(9);
      wall.tiles[0] = 33;
      players[0].discard(1);
      wall.tiles.splice(-1, 1, 43);
      players[1].discard(33);
      players[2].claim(0);
      players[2].discard(43);
      players[3].discard(9);
      players[0].discard(31);
      players[1].discard(22);
      players[2].claim(0);
      players[2].discard(22);
      players[3].discard(29);
      players[0].discard(31);
      players[1].discard(6);
      players[2].claim(0);

      expect(players[2].fourMeld).to.equal(1);
      round.draw();
    });

    it('not baopai', function() {
      players[1].handTiles.push(41);
      players[1].discard(4);
      players[2].claim(0);
      players[2].discard(4);
      players[3].claim(1);
      wall.tiles[0] = 33;
      players[3].discard(9);
      wall.tiles.splice(-1, 1, 43);
      players[0].discard(33);
      players[2].claim(0);
      players[2].discard(43);
      players[3].discard(29);
      players[0].discard(31);
      players[1].discard(22);
      players[2].claim(0);

      expect(players[2].threeMeld).to.equal(-1);
      round.draw();
    });

    it('land', function() {
      players[1].handTiles.push(41);
      players[1].discard(18);
      players[2].claim(0);
      
      expect(players[2].winFrom).to.equal(1);
      expect(players[2].bonus).to.eql([BonusType.Land]);
      expect(round.winner).to.equal(2);
      expect(game.banker).to.equal(2);
    });

    it('land self draw', function() {
      players[2].handTiles.push(41);
      wall.tiles[0] = 19;
      players[2].discard(41);
      players[3].claim(0);
      
      expect(players[3].winFrom).to.equal(-1);
      expect(players[3].bonus).to.eql([BonusType.Land]);
      expect(round.winner).to.equal(3);
      expect(game.banker).to.equal(3);
    });

    it('sky', function() {
      // players[3].handTiles.push(19);
      // players[3].openCheck();
      // players[3].claim(0);
      
      // expect(players[2].winFrom).to.equal(-1);
      // expect(players[2].bonus).to.eql([BonusType.Sky]);
      // expect(round.winner).to.equal(3);
      // expect(game.banker).to.equal(3);
    });
  });
});
