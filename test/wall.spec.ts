import { expect } from 'chai';
import Wall from '../src/wall';

describe('constructor', () => {
  it('all', function() {
    const wall = new Wall();

    expect(wall.tiles.length).to.equal(144);
  });

  it('has some', function() {
    let wall = new Wall(true, false, false);
    expect(wall.tiles.length).to.equal(124);

    wall = new Wall(false, true, false);
    expect(wall.tiles.length).to.equal(120);
  });

  it('has none', function() {
    const wall = new Wall(false, false, false);

    expect(wall.tiles.length).to.equal(108);
  });
});

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
  let wall: Wall;
  let tiles: number[];

  beforeEach(() => {
    wall = new Wall();
    tiles = wall.tiles.slice();
  });

  describe('deal card', function() {
    it('deal card', function() {
      const result = wall.deal();

      expect(result).to.equal(tiles[0]);
    });

    it('deal card go dead', function() {
      wall.tiles.length = 15;
      const result = wall.deal();

      expect(result).to.equal(-1);
    });
  });

  describe('draw card', function() {
    it('draw card', function() {
      const result = wall.draw();

      expect(result).to.equal(tiles[tiles.length - 1]);
    });

    it('draw card go dead', function() {
      wall.tiles.length = 15;
      const result = wall.draw();

      expect(result).to.equal(-1);
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

describe('will dead', () => {
  it('will dead', function() {
    const wall = new Wall();
    wall.tiles.length = 19;

    expect(wall.willDead()).to.be.ok;
  });

  it('is not dead', function() {
    const wall = new Wall();
    wall.tiles.length = 20;

    expect(wall.willDead()).to.not.be.ok;
  });
});
