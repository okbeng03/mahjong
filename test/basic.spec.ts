import { expect } from 'chai';
const rewire = require('rewire');
import { batchTilesId, batchTilesSuit, ClaimType } from '../src/tile';
const basicRule = rewire('../src/rules/basic');
import { canClaim, readyHand } from '../src/rules/basic';

describe('get range tile', () => {
  const tiles = batchTilesId('二万,三万,三万,四万,五万,四条,五条,七条,八条,九条');
  const getRangeTile = basicRule.__get__('getRangeTile');

  describe('get range tile when has range', () => {
    it('get range by left side', function() {
      expect(batchTilesSuit(getRangeTile(tiles, 0))).to.equal('二万,三万,三万');
      expect(batchTilesSuit(getRangeTile(tiles, 1))).to.equal('二万,三万,三万,四万');
      expect(batchTilesSuit(getRangeTile(tiles, 21))).to.equal('四条,五条');
      expect(batchTilesSuit(getRangeTile(tiles, 20))).to.equal('四条,五条');
      expect(batchTilesSuit(getRangeTile(tiles, 19))).to.equal('四条');
    });

    it('get range by right side', function() {
      expect(batchTilesSuit(getRangeTile(tiles, 26))).to.equal('七条,八条,九条');
      expect(batchTilesSuit(getRangeTile(tiles, 6))).to.equal('五万');
      expect(batchTilesSuit(getRangeTile(tiles, 5))).to.equal('四万,五万');
      expect(batchTilesSuit(getRangeTile(tiles, 4))).to.equal('三万,三万,四万,五万');
    });

    it('get range by center side', function() {
      expect(batchTilesSuit(getRangeTile(tiles, 2))).to.equal('二万,三万,三万,四万,五万');
      expect(batchTilesSuit(getRangeTile(tiles, 3))).to.equal('二万,三万,三万,四万,五万');
      expect(batchTilesSuit(getRangeTile(tiles, 22))).to.equal('四条,五条,七条');
      expect(batchTilesSuit(getRangeTile(tiles, 23))).to.equal('四条,五条,七条,八条');
      expect(batchTilesSuit(getRangeTile(tiles, 24))).to.equal('五条,七条,八条,九条');
      expect(batchTilesSuit(getRangeTile(tiles, 25))).to.equal('七条,八条,九条');
    });
  });

  describe('get range tile when has not range', () => {
    it('get range has not range', function() {
      expect(getRangeTile(tiles, 7).length).to.equal(0);
      expect(getRangeTile(tiles, 8).length).to.equal(0);
      expect(getRangeTile(tiles, 9).length).to.equal(0);
      expect(getRangeTile(tiles, 13).length).to.equal(0);
      expect(getRangeTile(tiles, 17).length).to.equal(0);
      expect(getRangeTile(tiles, 18).length).to.equal(0);
    });
  });
});

describe('get some tile', () => {
  const tiles = batchTilesId('二万,三万,三万,四万,五条,七条,八条,北风,北风,北风,发财,发财,白板');
  const getSomeTile = basicRule.__get__('getSomeTile');

  describe('get some tile when has some', () => {
    it('get some tile when has some', function() {
      expect(batchTilesSuit(getSomeTile(tiles, 1))).to.equal('二万');
      expect(batchTilesSuit(getSomeTile(tiles, 2))).to.equal('三万,三万');
      expect(batchTilesSuit(getSomeTile(tiles, 30))).to.equal('北风,北风,北风');
      expect(batchTilesSuit(getSomeTile(tiles, 31))).to.equal('发财,发财');
    });
  });

  describe('get some tile when has not some', () => {
    it('get some tile when has not some', function() {
      expect(getSomeTile(tiles, 0).length).to.equal(0);
      expect(getSomeTile(tiles, 8).length).to.equal(0);
    });
  });
});

describe('get sequence', () => {
  const getSequence = basicRule.__get__('getSequence');

  describe('get sequences when has sequence', () => {
    it('get sequences when has sequnce', function() {
      const result1 = getSequence(batchTilesId('二万,三万'), 0);
      expect(result1.length).to.equal(1);
      expect(batchTilesSuit(result1[0])).to.equal('二万,三万,一万');

      const result2 = getSequence(batchTilesId('二万,三万,三万,三万,四万'), 1);
      expect(result2.length).to.equal(1);
      expect(batchTilesSuit(result2[0])).to.equal('三万,四万,二万');

      const result2 = getSequence(batchTilesId('二万,三万,三万,三万,四万'), 2);
      expect(result2.length).to.equal(1);
      expect(batchTilesSuit(result2[0])).to.equal('二万,四万,三万');

      const result3 = getSequence(batchTilesId('四条,五条,七条,八条'), 23);
      expect(result3.length).to.equal(3);
      expect(batchTilesSuit(result3[0])).to.equal('四条,五条,六条');
      expect(batchTilesSuit(result3[1])).to.equal('五条,七条,六条');
      expect(batchTilesSuit(result3[2])).to.equal('七条,八条,六条');
    });
  });

  describe('get sequences when has not sequnce', () => {
    const result1 = getSequence(batchTilesId('五万'), 6);
    expect(result1.length).to.equal(0);

    const result2 = getSequence(batchTilesId('四条,五条,七条'), 22);
    expect(result2.length).to.equal(0);
  });
});

describe('group by', () => {
  const groupBy = basicRule.__get__('groupBy');

  it('group by', function() {
    const tiles = batchTilesId('一万,二万,二万,九万,北风,北风,北风');
    const result = groupBy(tiles);
    
    expect(result).to.eql({
      '0': [0],
      '1': [1, 1],
      '8': [8],
      '30': [30, 30, 30]
    });
  });
});

describe('group by order', () => {
  const groupByOrder = basicRule.__get__('groupByOrder');

  it ('group by order', function() {
    expect(groupByOrder(batchTilesId('一万,四万,五万,六万,九万'), 2)).to.eql([
      [0],
      [3, 4, 5],
      [8]
    ]);
    expect(groupByOrder(batchTilesId('一万,二万,五万,七万,九万'), 2)).to.eql([
      [0, 1],
      [4, 6, 8]
    ]);
    expect(groupByOrder(batchTilesId('一万')), 2).to.eql([
      [0]
    ]);
  });
});

describe('check sole tiles', () => {
  const groupBy = basicRule.__get__('groupBy');
  const getOrderGroup = basicRule.__get__('getOrderGroup');
  const checkSoleTiles = basicRule.__get__('checkSoleTiles');

  describe('check sole tiles when has', () => {
    it('check solt tiles when has', function() {
      const tiles = batchTilesId('二万,三万,三万,三万,四万,九筒,九筒,一条,五条,七条,北风,北风,北风,红中');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkSoleTiles(groups, orderGroups);
      expect(result.length).to.equal(2);
      expect(result).to.eql([18, 32]);
      expect(orderGroups[2].length).to.be.equal(0);
      expect(groups['18']).to.not.be.ok;
      expect(groups['32']).to.not.be.ok;
    });
  });

  describe('check sole tiles when has not', () => {
    it('check sole tiles when has not', function() {
      const tiles = batchTilesId('二万,三万,三万,三万,四万,九筒,九筒,四条,五条,七条,北风,北风,北风');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      expect(checkSoleTiles(groups, orderGroups).length).to.equal(0);
    });
  });
});

describe('check numberal tiles certainly melds', () => {
  const groupBy = basicRule.__get__('groupBy');
  const getOrderGroup = basicRule.__get__('getOrderGroup');
  const checkCertainMelds = basicRule.__get__('checkCertainMelds');

  describe('check all sequence', () => {
    it('check all sequence when 3 tiles', function() {
      const tiles = batchTilesId('二万,三万,四万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(1);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        }
      ]);
    });

    it('check all sequence when more than 3 tiles', function() {
      const tiles = batchTilesId('二万,三万,四万,五万,六万,七万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(2);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [4, 5, 6],
          type: ClaimType.Chow
        }
      ]);
    });
  });

  describe('check all pong', () => {
    it('check all pong', function() {
      const tiles = batchTilesId('二万,二万,二万,三万,三万,三万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(2);
      expect(result).to.eql([
        {
          tiles: [1, 1, 1],
          type: ClaimType.Pong
        },
        {
          tiles: [2, 2, 2],
          type: ClaimType.Pong
        }
      ]);
    });
  });

  describe('check complex tiles', () => {
    it('223344', function() {
      const tiles = batchTilesId('二万,二万,三万,三万,四万,四万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(2);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        }
      ]);
    });

    it('233445', function() {
      const tiles = batchTilesId('二万,三万,三万,四万,四万,五万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(2);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [2, 3, 4],
          type: ClaimType.Chow
        }
      ]);
    });

    it('234456', function() {
      const tiles = batchTilesId('二万,三万,四万,四万,五万,六万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(2);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [3, 4, 5],
          type: ClaimType.Chow
        }
      ]);
    });

    it('2334455667', function() {
      const tiles = batchTilesId('二万,三万,三万,四万,四万,五万,五万,六万,七万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(3);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [2, 3, 4],
          type: ClaimType.Chow
        },
        {
          tiles: [4, 5, 6],
          type: ClaimType.Chow
        }
      ]);
    });

    it('222345, 345666', function() {
      const tiles = batchTilesId('二万,二万,二万,三万,四万,五万,三筒,四筒,五筒,六筒,六筒,六筒');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(4);
      expect(result).to.eql([
        {
          tiles: [1, 1, 1],
          type: ClaimType.Pong
        },
        {
          tiles: [2, 3, 4],
          type: ClaimType.Chow
        },
        {
          tiles: [11, 12, 13],
          type: ClaimType.Chow
        },
        {
          tiles: [14, 14, 14],
          type: ClaimType.Pong
        }
      ]);
    });

    it('233344455', function() {
      const tiles = batchTilesId('二万,三万,三万,三万,四万,四万,四万,五万,五万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(3);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [2, 3, 4],
          type: ClaimType.Chow
        },
        {
          tiles: [2, 3, 4],
          type: ClaimType.Chow
        }
      ]);
    });

    it('234445566', function() {
      const tiles = batchTilesId('二万,三万,四万,四万,四万,五万,五万,六万,六万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(3);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [3, 4, 5],
          type: ClaimType.Chow
        },
        {
          tiles: [3, 4, 5],
          type: ClaimType.Chow
        }
      ]);
    });

    it('234555678', function() {
      const tiles = batchTilesId('二万,三万,四万,五万,五万,五万,六万,七万,八万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(3);
      expect(result).to.eql([
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        },
        {
          tiles: [4, 4, 4],
          type: ClaimType.Pong
        },
        {
          tiles: [5, 6, 7],
          type: ClaimType.Chow
        }
      ]);
    });

    it('222234', function() {
      const tiles = batchTilesId('二万,二万,二万,二万,三万,四万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(2);
      expect(result).to.eql([
        {
          tiles: [1, 1, 1],
          type: ClaimType.Pong
        },
        {
          tiles: [1, 2, 3],
          type: ClaimType.Chow
        }
      ]);
    });
  });

  describe('check no melds', () => {
    it('2344455', function() {
      const tiles = batchTilesId('二万,三万,四万,四万,四万,五万,五万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(0);
    });

    it('235678', function() {
      const tiles = batchTilesId('二万,三万,五万,六万,七万,八万');
      const groups = groupBy(tiles);
      const orderGroups = getOrderGroup(tiles);
      const result = checkCertainMelds(groups, orderGroups);

      expect(result.length).to.equal(0);
    });
  });
});

// describe('get not some tile', () => {
//   const groupBy = basicRule.__get__('groupBy');
//   const getNotSomeTile = basicRule.__get__('getNotSomeTile');

//   it('group by', function() {
//     const tiles = batchTilesId('一万,二万,二万,九万,北风,北风,北风');
//     const groups = groupBy(tiles);
//     const soleTiles = [];
//     const pairTiles = [];

//     getNotSomeTile(groups, soleTiles, pairTiles);
//     expect(soleTiles.length).to.equal(2);
//     expect(pairTiles.length).to.equal(1);
//   });
// });

describe('can claim', () => {
  const tiles = batchTilesId('二万,三万,三万,三万,四万,九筒,九筒,四条,五条,七条,北风,北风,北风');

  describe('can kong', () => {
    const result = canClaim(tiles, 30);
    
    expect(result.length).to.equal(2);
    expect(result[0].type).to.equal(ClaimType.Kong);
    expect(batchTilesSuit(result[0].tiles)).to.equal('北风,北风,北风,北风');
    expect(result[1].type).to.equal(ClaimType.Pong);
    expect(batchTilesSuit(result[1].tiles)).to.equal('北风,北风,北风');
  });

  describe('can pong', () => {
    const result = canClaim(tiles, 17);
    
    expect(result.length).to.equal(1);
    expect(result[0].type).to.equal(ClaimType.Pong);
    expect(batchTilesSuit(result[0].tiles)).to.equal('九筒,九筒,九筒');
  });

  describe('can chow', () => {
    const result = canClaim(tiles, 23);
    
    expect(result.length).to.equal(2);
    expect(result[0].type).to.equal(ClaimType.Chow);
    expect(batchTilesSuit(result[0].tiles)).to.equal('四条,五条,六条');
    expect(result[1].type).to.equal(ClaimType.Chow);
    expect(batchTilesSuit(result[1].tiles)).to.equal('五条,七条,六条');
  });

  describe('can pong & chow', () => {
    const result = canClaim(tiles, 2);
    
    expect(result.length).to.equal(3);
    expect(result[0].type).to.equal(ClaimType.Kong);
    expect(batchTilesSuit(result[0].tiles)).to.equal('三万,三万,三万,三万');
    expect(result[1].type).to.equal(ClaimType.Pong);
    expect(batchTilesSuit(result[1].tiles)).to.equal('三万,三万,三万');
    expect(result[2].type).to.equal(ClaimType.Chow);
    expect(batchTilesSuit(result[2].tiles)).to.equal('二万,四万,三万');
  });

  describe('do nothing', () => {
    const result = canClaim(tiles, 8);

    expect(result.length).to.equal(0);
  });
});
