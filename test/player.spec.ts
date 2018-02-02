import { expect } from 'chai';
import Game from '../src/game';
import Round from '../src/round';
import Player from '../src/playerDetail';

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
  let game: Game;
  let round: Round;

  describe('start', () => {
    
  });

  describe('deal', () => {
    
  });

  describe('draw', () => {
    
  });

  describe('transfer', () => {
    
  });
});
