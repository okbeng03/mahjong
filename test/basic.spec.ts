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
      expect(batchTilesSuit(getRangeTile(tiles, 1))).to.equal('二万,三万,三万');
      expect(batchTilesSuit(getRangeTile(tiles, 2))).to.equal('二万,三万,三万,四万');
      expect(batchTilesSuit(getRangeTile(tiles, 24))).to.equal('四条,五条');
      expect(batchTilesSuit(getRangeTile(tiles, 23))).to.equal('四条,五条');
      expect(batchTilesSuit(getRangeTile(tiles, 22))).to.equal('四条');
    });

    it('get range by right side', function() {
      expect(batchTilesSuit(getRangeTile(tiles, 29))).to.equal('七条,八条,九条');
      expect(batchTilesSuit(getRangeTile(tiles, 7))).to.equal('五万');
      expect(batchTilesSuit(getRangeTile(tiles, 6))).to.equal('四万,五万');
      expect(batchTilesSuit(getRangeTile(tiles, 5))).to.equal('三万,三万,四万,五万');
    });

    it('get range by center side', function() {
      expect(batchTilesSuit(getRangeTile(tiles, 3))).to.equal('二万,三万,三万,四万,五万');
      expect(batchTilesSuit(getRangeTile(tiles, 4))).to.equal('二万,三万,三万,四万,五万');
      expect(batchTilesSuit(getRangeTile(tiles, 25))).to.equal('四条,五条,七条');
      expect(batchTilesSuit(getRangeTile(tiles, 26))).to.equal('四条,五条,七条,八条');
      expect(batchTilesSuit(getRangeTile(tiles, 27))).to.equal('五条,七条,八条,九条');
      expect(batchTilesSuit(getRangeTile(tiles, 28))).to.equal('七条,八条,九条');
    });
  });

  describe('get range tile when has not range', () => {
    it('get range has not range', function() {
      expect(getRangeTile(tiles, 8).length).to.equal(0);
      expect(getRangeTile(tiles, 9).length).to.equal(0);
      expect(getRangeTile(tiles, 11).length).to.equal(0);
      expect(getRangeTile(tiles, 13).length).to.equal(0);
      expect(getRangeTile(tiles, 21).length).to.equal(0);
    });
  });
});

describe('get some tile', () => {
  const tiles = batchTilesId('二万,三万,三万,四万,五条,七条,八条,北风,北风,北风,发财,发财,白板');
  const getSomeTile = basicRule.__get__('getSomeTile');

  describe('get some tile when has some', () => {
    it('get some tile when has some', function() {
      expect(batchTilesSuit(getSomeTile(tiles, 2))).to.equal('二万');
      expect(batchTilesSuit(getSomeTile(tiles, 3))).to.equal('三万,三万');
      expect(batchTilesSuit(getSomeTile(tiles, 37))).to.equal('北风,北风,北风');
      expect(batchTilesSuit(getSomeTile(tiles, 41))).to.equal('发财,发财');
    });
  });

  describe('get some tile when has not some', () => {
    it('get some tile when has not some', function() {
      expect(getSomeTile(tiles, 1).length).to.equal(0);
      expect(getSomeTile(tiles, 11).length).to.equal(0);
    });
  });
});

describe('get sequence', () => {
  const getSequence = basicRule.__get__('getSequence');

  describe('get sequences when has sequence', () => {
    it('get sequences when has sequnce', function() {
      const result1 = getSequence(batchTilesId('二万,三万'), 1);
      expect(result1.length).to.equal(1);
      expect(batchTilesSuit(result1[0])).to.equal('二万,三万,一万');

      const result2 = getSequence(batchTilesId('二万,三万,三万,三万,四万'), 2);
      expect(result2.length).to.equal(1);
      expect(batchTilesSuit(result2[0])).to.equal('三万,四万,二万');

      const result3 = getSequence(batchTilesId('二万,三万,三万,三万,四万'), 3);
      expect(result3.length).to.equal(1);
      expect(batchTilesSuit(result3[0])).to.equal('二万,四万,三万');

      const result4 = getSequence(batchTilesId('四条,五条,七条,八条'), 26);
      expect(result4.length).to.equal(3);
      expect(batchTilesSuit(result4[0])).to.equal('四条,五条,六条');
      expect(batchTilesSuit(result4[1])).to.equal('五条,七条,六条');
      expect(batchTilesSuit(result4[2])).to.equal('七条,八条,六条');
    });
  });

  describe('get sequences when has not sequnce', () => {
    const result1 = getSequence(batchTilesId('五万'), 7);
    expect(result1.length).to.equal(0);

    const result2 = getSequence(batchTilesId('四条,五条,七条'), 25);
    expect(result2.length).to.equal(0);
  });
});

describe('group by', () => {
  const groupBy = basicRule.__get__('groupBy');

  it('group by', function() {
    const tiles = batchTilesId('一万,二万,二万,九万,北风,北风,北风');
    const result = groupBy(tiles);
    
    expect(result).to.eql({
      '1': [1],
      '2': [2, 2],
      '9': [9],
      '37': [37, 37, 37]
    });
  });
});

describe('group by order', () => {
  const groupByOrder = basicRule.__get__('groupByOrder');

  it ('group by order', function() {
    expect(groupByOrder(batchTilesId('一万,四万,五万,七万,九万'), 1)).to.eql([
      [1],
      [4, 5],
      [7],
      [9]
    ]);
    expect(groupByOrder(batchTilesId('一万,二万,五万,七万,九万'), 2)).to.eql([
      [1, 2],
      [5, 7, 9]
    ]);
    expect(groupByOrder(batchTilesId('一万')), 2).to.eql([
      [1]
    ]);
  });
});

describe('get eye', () => {
  const getEye = basicRule.__get__('getEye');

  describe('2 length', () => {
    it('2 length', function() {
      expect(getEye(batchTilesId('北风,北风'), 2)).to.eql([37, 37]);
    });
  });

  describe('5 length', () => {
    it('5 length', function() {
      expect(getEye(batchTilesId('二万,二万,二万,三万,四万'), 311)).to.eql([2, 2]);
      expect(getEye(batchTilesId('一万,二万,二万,二万,三万'), 131)).to.eql([2, 2]);
      expect(getEye(batchTilesId('一万,一万,一万,二万,二万'), 32)).to.eql([2, 2]);
      expect(getEye(batchTilesId('二万,三万,四万,五万,五万'), 1112)).to.eql([5, 5]);
    });
  });

  describe('8 length', () => {
    it('8 length', function() {
      expect(getEye(batchTilesId('二万,二万,二万,三万,三万,四万,四万,五万'), 3221)).to.eql([2, 2]);
      expect(getEye(batchTilesId('二万,二万,三万,四万,五万,六万,七万,八万'), 2111111)).to.eql([2, 2]);
      expect(getEye(batchTilesId('一万,二万,三万,四万,四万,四万,五万,六万'), 111311)).to.eql([4, 4]);
      expect(getEye(batchTilesId('一万,二万,二万,三万,三万,四万,五万,五万'), 12212)).to.eql([5, 5]);
      expect(getEye(batchTilesId('二万,三万,四万,五万,六万,七万,八万,八万'), 1111112)).to.eql([8, 8]);
    });
  });

  describe('11 length', () => {
    it('11 length', function() {
      expect(getEye(batchTilesId('二万,二万,三万,四万,五万,六万,六万,六万,七万,七万,七万'), 211133)).to.eql([2, 2]);
      expect(getEye(batchTilesId('二万,二万,二万,三万,四万,四万,四万,五万,六万,六万,六万'), 31313)).to.eql([4, 4]);
      expect(getEye(batchTilesId('一万,二万,三万,四万,五万,五万,六万,六万,六万,六万,七万'), 1111241)).to.eql([6, 6]);
      expect(getEye(batchTilesId('一万,二万,三万,四万,五万,六万,六万,七万,八万,九万,九万'), 111112112)).to.eql([9, 9]);
      expect(getEye(batchTilesId('二万,二万,二万,三万,三万,四万,五万,五万,五万,五万,六万'), 32141)).to.eql([3, 3]);
    });
  });

  describe('14 length', () => {
    it('14 length', function() {
      expect(getEye(batchTilesId('二万,二万,三万,四万,四万,五万,五万,六万,六万,七万,八万,九万,九万,九万'), 21222113)).to.eql([2, 2]);
      expect(getEye(batchTilesId('一万,二万,二万,二万,二万,三万,三万,三万,四万,四万,五万,五万,六万,七万'), 1432211)).to.eql([2, 2]);
      expect(getEye(batchTilesId('一万,一万,一万,二万,二万,三万,四万,四万,五万,五万,六万,七万,八万,九万'), 321221111)).to.eql([2, 2]);
      expect(getEye(batchTilesId('一万,二万,二万,三万,三万,四万,四万,四万,五万,五万,五万,五万,六万,六万'), 122342)).to.eql([5, 5]);
      expect(getEye(batchTilesId('一万,二万,二万,二万,二万,三万,四万,五万,六万,七万,七万,七万,八万,八万'), 14111132)).to.eql([8, 8]);
    });
  });
});

describe('check melds', () => {
  const checkMelds = basicRule.__get__('checkMelds');

  describe('check melds when all get meld', () => {
    it('check melds when all get meld', function() {
      expect(checkMelds(batchTilesId('二万,二万,二万,三万,四万')).length).to.equal(0);
      expect(checkMelds(batchTilesId('一万,二万,二万,二万,二万,三万,四万,五万,六万,七万,七万,七万,八万,八万')).length).to.equal(0);
    });
  });

  describe('check melds when not all get meld', () => {
    it('check melds when not all get meld', function() {
      expect(checkMelds(batchTilesId('二万,二万,二万,三万,四万,五万,六万,八万')).length).to.equal(8);
      expect(checkMelds(batchTilesId('二万,二万,二万,三万,四万,六万,八万,八万')).length).to.equal(1);
      expect(checkMelds(batchTilesId('二万,二万,二万,三万,四万,七万,八万,八万')).length).to.equal(3);
    });
  });
});

describe('check ting', () => {
  const checkTing = basicRule.__get__('checkTing');

  describe('check ting one group', () => {
    it('check ting one group', function() {
      expect(checkTing([batchTilesId('一万,二万,四万')])).to.eql({
        '1': [3],
        '4': [3]
      });

      expect(checkTing([batchTilesId('二万,三万,四万,五万,六万,九万')])).to.eql({
        '9': [1, 4, 7]
      });
    });
  });

  describe('check ting two group', () => {
    it('check ting two group', function() {
      expect(checkTing([batchTilesId('一万,三筒,四筒')])).to.eql({
        '1': [12, 15]
      });

      expect(checkTing([batchTilesId('二万,三筒,四筒,五筒,六筒')])).to.eql({
        '2': [13, 16],
        '13': [2],
        '16': [2]
      });
    });
  });
});

describe('can claim', () => {
  const tiles = batchTilesId('二万,三万,三万,三万,四万,九筒,九筒,四条,五条,七条,北风,北风,北风');

  describe('can kong', () => {
    const result = canClaim(tiles, 37);
    
    expect(result.length).to.equal(2);
    expect(result[0].type).to.equal(ClaimType.Expose);
    expect(batchTilesSuit(result[0].tiles)).to.equal('北风,北风,北风,北风');
    expect(result[1].type).to.equal(ClaimType.Pong);
    expect(batchTilesSuit(result[1].tiles)).to.equal('北风,北风,北风');
  });

  describe('can pong', () => {
    const result = canClaim(tiles, 19);
    
    expect(result.length).to.equal(1);
    expect(result[0].type).to.equal(ClaimType.Pong);
    expect(batchTilesSuit(result[0].tiles)).to.equal('九筒,九筒,九筒');
  });

  describe('can chow', () => {
    const result = canClaim(tiles, 26);
    
    expect(result.length).to.equal(2);
    expect(result[0].type).to.equal(ClaimType.Chow);
    expect(batchTilesSuit(result[0].tiles)).to.equal('四条,五条,六条');
    expect(result[1].type).to.equal(ClaimType.Chow);
    expect(batchTilesSuit(result[1].tiles)).to.equal('五条,七条,六条');
  });

  describe('can pong & chow', () => {
    const result = canClaim(tiles, 3);
    
    expect(result.length).to.equal(3);
    expect(result[0].type).to.equal(ClaimType.Expose);
    expect(batchTilesSuit(result[0].tiles)).to.equal('三万,三万,三万,三万');
    expect(result[1].type).to.equal(ClaimType.Pong);
    expect(batchTilesSuit(result[1].tiles)).to.equal('三万,三万,三万');
    expect(result[2].type).to.equal(ClaimType.Chow);
    expect(batchTilesSuit(result[2].tiles)).to.equal('二万,四万,三万');
  });

  describe('do nothing', () => {
    const result = canClaim(tiles, 9);

    expect(result.length).to.equal(0);
  });
});
