import { expect } from 'chai';
import { getTiles, shuffleTiles, getTileSuit, getTileId, sortTiles, batchTilesSuit, batchTilesId } from '../src/tile';

function concatTiles(begin: number, end: number): number[] {
  let tiles = [];

  for (let i = begin; i <= end; i++) {
    tiles = tiles.concat([i, i, i, i]);
  }

  return tiles;
}

function getWordTiles(): number[] {
  let tiles = [];

  for (let i = 31; i <= 37; i = i + 2) {
    tiles = tiles.concat([i, i, i, i]);
  }

  for (let i = 41; i <= 45; i = i + 2) {
    tiles = tiles.concat([i, i, i, i]);
  }

  return tiles;
}

function getFlowerTiles(): number[] {
  let tiles = [];

  for (let i = 51; i <= 58; i++) {
    tiles.push(i);
  }

  return tiles;
}

let numberCards = concatTiles(1, 9);
numberCards = numberCards.concat(concatTiles(11, 19));
numberCards = numberCards.concat(concatTiles(21, 29));

describe('tiles', function() {
  let tiles = [];

  beforeEach(function() {
    tiles = numberCards;
  });

  describe('get default tiles', function() {
    it('default tiles has all tiles', function() {
      const result = getTiles();
      tiles = tiles.concat(getWordTiles());
      tiles = tiles.concat(getFlowerTiles());

      expect(result).to.eql(tiles);
    });
  });

  describe('get tiles without wind dragon flower', function() {
    it('tiles without wind dragon flower has 108 card', function() {
      const result = getTiles(false, false, false);
      
      expect(result.length).to.equal(108);
      expect(result).to.eql(tiles);
    });
  });
});

describe('tiles shuffle', function() {
  it('tiles shuffle will random sort', function() {
    const tiles = getTiles();
    const result = shuffleTiles(tiles);

    expect(result.length).to.equal(144);
    expect(result.sort(function(a, b) {
      return a - b;
    })).to.eql(tiles);
  });
});

describe('get tile suit & id', function() {
  describe('get tile suit by id', function() {
    it('get tile real name', function() {
      expect(getTileSuit(8)).to.equal('八万');
      expect(getTileSuit(33)).to.equal('南风');
    });
  });

  describe('get tile id by suit', function() {
    it('get tile id', function() {
      expect(getTileId('六筒')).to.equal(16);
      expect(getTileId('菊')).to.equal(58);
    });
  });
});

describe('sort tiles', function() {
  it('sort tiles', function() {
    const tiles = [0, 20, 2, 15, 40, 11, 2, 1, 2, 14, 16, 32, 8, 12];
    const result = sortTiles(tiles);

    expect(result).to.eql([0, 1, 2, 2, 2, 8, 11, 12, 14, 15, 16, 20, 32, 40]);
  });
});

describe('batch get tiles suit & id', function() {
  describe('batch get tiles suit by ids', function() {
    it('batch get tiles suit', function() {
      const tiles = [1, 23, 2, 15, 51, 11, 2, 1, 2, 14, 16, 33, 8, 12];
      const result = batchTilesSuit(sortTiles(tiles));
  
      expect(result).to.equal('一万,一万,二万,二万,二万,八万,一筒,二筒,四筒,五筒,六筒,三条,南风,春');
    });
  });
  
  describe('batch get tiles ids by suit', function() {
    it('batch get tiles ids', function() {
      const suit = '三万,三万,四万,五万,五万,六万,一筒,八筒,三条,五条,东风,发财,春,夏';
      const result = batchTilesId(suit);

      expect(result).to.eql([3, 3, 4, 5, 5, 6, 11, 18, 23, 25, 31, 41, 51, 52]);
    });
  });
});
