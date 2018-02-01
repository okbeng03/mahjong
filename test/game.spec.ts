import { expect } from 'chai';
import Game from '../src/game';
// import Round from '../src/round';
import { Pick } from '../src/tile';

describe('game', function() {
  it('construct', function() {
    const game = new Game();

    expect(game.order).to.equal(Pick.East);
    expect(game.banker).to.equal(0);
    expect(game.bankerCount).to.equal(0);
    expect(game.bonus).to.be.empty;
    expect(game.players).to.be.empty;
    expect(game.rounds).to.be.empty;
  });
});

describe('add player', () => {
  const game = new Game;

  it('add one player', function() {
    game.addPlayer(1, 'test1');
    const player = game.players[0];

    expect(game.players.length).to.equal(1);
    expect(player.name).to.equal('test1');
    expect(player.id).to.equal(1);
    expect(player.pick).to.equal(0);
  });

  it('add two player', function() {
    game.addPlayer(2, 'test2');

    expect(game.players.length).to.equal(2);
  });

  it('add three player', function() {
    game.addPlayer(3, 'test3');

    expect(game.players.length).to.equal(3);
  });

  it('add four player', function() {
    game.addPlayer(4, 'test4');

    expect(game.players.length).to.equal(4);
  });

  it('add more player', function() {
    game.addPlayer(5, 'test5');

    expect(game.players.length).to.equal(4);
  });
});

describe('start', () => {
  const game = new Game();

  it('can not start when less than 4 player', function() {
    game.start();
    expect(game.rounds).to.be.empty;
    
    game.addPlayer(1, 'test1');
    game.start();
    expect(game.rounds).to.be.empty;

    game.addPlayer(2, 'test2');
    game.start();
    expect(game.rounds).to.be.empty;

    game.addPlayer(3, 'test3');
    game.start();
    expect(game.rounds).to.be.empty;
  });

  it('can start when 4 player', function() {
    game.addPlayer(4, 'test4');
    game.start();
    expect(game.rounds.length).to.equal(1);
  });
});

describe('finish', () => {
  let game;

  before(() => {
    game = new Game();
    game.addPlayer(1, 'test1');
    game.addPlayer(2, 'test2');
    game.addPlayer(3, 'test3');
    game.addPlayer(4, 'test4');
    game.start();
  });

  it('banker win', function() {
    const round = game.rounds[game.rounds.length - 1];
    round.winner = 0;
    game.finish();

    expect(game.banker).to.equal(0);
    expect(game.bankerCount).to.equal(1);
    expect(game.order).to.equal(Pick.East);
  });

  it('banker loss', function() {
    const round = game.rounds[game.rounds.length - 1];
    round.winner = 2;
    game.finish();

    expect(game.banker).to.equal(1);
    expect(game.bankerCount).to.equal(0);
    expect(game.order).to.equal(Pick.East);
  });

  it('next order', function() {
    game.banker = 3;
    const round = game.rounds[game.rounds.length - 1];
    round.winner = 0;
    game.finish();
    
    expect(game.banker).to.equal(0);
    expect(game.bankerCount).to.equal(0);
    expect(game.order).to.equal(Pick.South);
  });

  it('next game', function() {
    game.banker = 3;
    game.order = Pick.North;
    const round = game.rounds[game.rounds.length - 1];
    round.winner = 0;
    game.finish();
    
    expect(game.banker).to.equal(0);
    expect(game.bankerCount).to.equal(0);
    expect(game.order).to.equal(Pick.East);
  });
});

describe('end', () => {
  let game;

  before(() => {
    game = new Game();
    game.addPlayer(1, 'test1');
    game.addPlayer(2, 'test2');
    game.addPlayer(3, 'test3');
    game.addPlayer(4, 'test4');
    game.start();
  });

  it('one round', () => {
    const round = game.rounds[game.rounds.length - 1];
    round.players[0].score = -1;
    round.players[1].score = 4;
    round.players[2].score = -2;
    round.players[3].score = -1;

    game.finish();
    game.end();

    expect(game.bonus).to.eql([-1, 4, -2, -1]);
  });

  it('more round', () => {
    const round = game.rounds[game.rounds.length - 1];
    round.players[0].score = 6;
    round.players[1].score = -2;
    round.players[2].score = -2;
    round.players[3].score = -2;

    game.finish();

    const round = game.rounds[game.rounds.length - 1];
    round.players[0].score = -4;
    round.players[1].score = -4;
    round.players[2].score = 11;
    round.players[3].score = -3;

    game.finish();
    game.end();

    expect(game.bonus).to.eql([1, -2, 7, -6]);
  });
});
