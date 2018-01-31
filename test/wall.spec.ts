import { expect } from 'chai';
import Wall from '../src/wall';

describe('open Hand', function() {
  describe('open hand by banker', function() {
    it('open hand by hourse', function() {
      const wall = new Wall();
      const result = wall.openHand(true);

      expect(result.length).to.equal(14);
    });
  });

  describe('open hand by not banker', function() {
    it('open hand by not banker', function() {
      const wall = new Wall();
      const result = wall.openHand(false);

      expect(result.length).to.equal(13);
    });
  });
});

describe('get card', function() {
  const wall = new Wall();
  let tiles = wall.tiles.slice();

  describe('deal card', function() {
    it('deal card', function() {
      const result = wall.deal();

      expect(result).to.equal(tiles[0]);
    });
  });

  describe('draw card', function() {
    it('draw card', function() {
      const result = wall.draw();

      expect(result).to.equal(tiles[tiles.length - 1]);
    });
  });
});

describe('is dead', () => {
  it('is dead', function() {
    const wall = new Wall();
    wall.tiles.length = 15;

    expect(wall.isDead()).to.be.ok;
  });

  it('is not dead', function() {
    const wall = new Wall();
    wall.tiles.length = 16;

    expect(wall.isDead()).to.not.be.ok;
  });
});
