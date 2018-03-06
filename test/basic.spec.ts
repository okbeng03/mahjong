import { expect } from 'chai';
const rewire = require('rewire');
import { batchTilesId, batchTilesSuit, ClaimType } from '../src/tile';
const basicRule = rewire('../src/rules/basic');
import Game from '../src/game';
import Round from '../src/round';
import Player from '../src/playerDetail';
import { canClaim, canKong, groupSize, groupByType, groupByOrder, canReadyHand, canFlowerWin, canWin, hasPoint } from '../src/rules/basic';

describe('remain02', () => {
  const remain02 = basicRule.__get__('remain02');

  it('remain02', function() {
    expect(remain02(8)).to.be.ok;
    expect(remain02(9)).to.be.ok;
    expect(remain02(4)).to.not.be.ok;
  });
});

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

describe('group size', () => {
  it('group size', function() {
    expect(groupSize(batchTilesId('一万,四万,五万,七万,九万'))).to.eql(11111);
    expect(groupSize(batchTilesId('一万,一万,五万,五万,五万'))).to.eql(23);
  });
});

describe('group size length', () => {
  const getSizeLength = basicRule.__get__('getSizeLength');

  it('group size length', function() {
    expect(getSizeLength(131)).to.equal(5);
    expect(getSizeLength(31112213)).to.equal(14);
  });
});

describe('group by order', () => {
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

describe('group by type', () => {
  it('group by type', function() {
    expect(groupByType(batchTilesId('一万,三万,八万,八万,二筒,三筒,四筒,九条,九条,东风,红中'))).to.eql({
      character: [1, 3, 8, 8],
      dot: [12, 13, 14],
      bamboo: [29, 29],
      word: [31, 43]
    });

    expect(groupByType(batchTilesId('一万,三万,八万,八万,二筒,三筒,四筒,东风,红中'))).to.eql({
      character: [1, 3, 8, 8],
      dot: [12, 13, 14],
      word: [31, 43]
    });
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

describe('can kong', () => {
  const tiles = batchTilesId('二万,三万,三万,三万,四万,九筒,九筒,四条,五条,七条,北风,北风,北风');

  describe('can kong ', () => {
    it('can kong', function() {
      tiles.push(37);
      const result = canKong(tiles, 37);
      
      expect(result.length).to.equal(1);
      expect(result[0].type).to.equal(ClaimType.ConcealedKong);
      expect(batchTilesSuit(result[0].tiles)).to.equal('北风,北风,北风,北风');
    });
  });

  describe('can not kong', () => {
    it('can not kont', function() {
      tiles.push(19);
      const result = canKong(tiles, 19);
      
      expect(result.length).to.equal(0);
    });
  });
});

describe('can ready hand', () => {
  describe('check ready hand when has one remain', () => {
    it('check ready hand when has one remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,二万,三万,五万,九万,九万,东风,东风');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        5: [31, 9]
      });
    });

    it('check ready hand when has one remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,三万,四万,五万,九万,九万,东风,东风');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        1: [31, 9]
      });
    });
  });

  describe('check ready hand when has two remain', () => {
    it('check ready hand when has two remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,三万,四万,五万,九万,九万,九万,东风');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        1: [31],
        31: [1]
      });
    });
  });

  describe('check ready hand when has more remain', () => {
    it('check ready hand when has three remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('二万,三万,三万,九万,九万');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        2: [3, 9],
        3: [1, 4]
      });
    });

    it('check ready hand when has three remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('二万,三万,九万,九万,八条');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        28: [1, 4]
      });
    });

    it('check ready hand when has five remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('二万,三万,四万,五万,三筒,三筒,三筒,八条');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        2: [28],
        5: [28],
        28: [2, 5]
      });
    });

    it('check ready hand when has five remain', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('二万,三万,三万,三筒,三筒,三筒,八条,九条');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        2: [27]
      });
    });
  });

  describe('check ready hand when seven pair', () => {
    it('check ready hand when seven pair', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('二万,二万,三万,三万,四万,四万,九万,三筒,三筒,九条,九条,东风,东风,白板');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        9: [45],
        45: [9]
      });
    });
  });

  describe('check ready hand when luxury seven pair', () => {
    it('check ready hand when luxury seven pair', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('二万,二万,三万,三万,四万,四万,九万,三筒,三筒,九条,九条,东风,东风,东风');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        9: [31],
        31: [9]
      });
    });
  });

  describe('check ready hand when thirteen orphans', () => {
    it('check ready hand when luxury seven pair', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,九万,一筒,三筒,九筒,一条,九条,东风,南风,西风,北风,发财,白板,红中');
      canReadyHand(player);

      expect(player.readyHand).to.eql({
        13: [1, 9, 11, 19, 21, 29, 31, 33, 35, 37, 41, 43 ,45]
      });
    });
  });

  describe('check ready hand when no ready', () => {
    it('word tile length gt 2', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,二万,三万,四万,五万,五万,白板,红中');
      canReadyHand(player);

      expect(player.readyHand).to.eql({});
    });

    it('word tile type gt 2', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,二万,三万,五万,五万,一筒,四条,白板');
      canReadyHand(player);

      expect(player.readyHand).to.eql({});
    });

    it('check ready hand when no ready', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,三万,四万,三筒,三筒,三筒,八条,九条');
      canReadyHand(player);

      expect(player.readyHand).to.eql({});
    });

    it('check ready hand when no ready', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,二万,四万,六万,六万,六万,八万,九万');
      canReadyHand(player);

      expect(player.readyHand).to.eql({});
    });
  });
});

describe('can flower win', () => {
  it('can flower win', function() {
    expect(canFlowerWin(batchTilesId('春,夏,秋,冬'), 54)).to.equal(1);
    expect(canFlowerWin(batchTilesId('春,夏,秋,冬,菊'), 52)).to.equal(1);
    expect(canFlowerWin(batchTilesId('梅,兰,竹,菊'), 57)).to.equal(2);
    expect(canFlowerWin(batchTilesId('夏,秋,梅,兰,竹,菊'), 55)).to.equal(2);
    expect(canFlowerWin(batchTilesId('春,夏,秋,冬,梅,兰,竹,菊'), 51)).to.equal(1);
  });

  it('not can flower win', function() {
    expect(canFlowerWin(batchTilesId('春'), 51)).to.equal(0);
    expect(canFlowerWin(batchTilesId('春,夏,秋'), 52)).to.equal(0);
    expect(canFlowerWin(batchTilesId('春,秋,冬,菊'), 58)).to.equal(0);
    expect(canFlowerWin(batchTilesId('春,秋,冬,梅,兰,竹'), 51)).to.equal(0);
  });
});

describe('can win', () => {
  describe('can win', () => {
    it('can win', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,二万,三万,九万,九万,九万,东风,东风');

      expect(canWin(player)).to.be.ok;
    });
  });

  describe('can not win', () => {
    it('can not win', function() {
      const player = new Player(1, 'AI', 0);
      player.handTiles = batchTilesId('一万,二万,三万,五万,九万,九万,东风,东风');

      expect(canWin(player)).to.not.be.ok;
    });
  });
});

describe('check point', () => {
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
  });

  describe('has point', () => {
    it('门前清', function() {
      expect(hasPoint(players[0])).to.be.ok;
      round.draw();
    });

    it('只吃不碰，对子不是翻牌', function() {
      players[0].handTiles = [2, 3, 4, 9, 9, 14, 15, 16];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [21, 22, 23],
          from: 3
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.be.ok;
    });

    it('258', function() {
      players[0].handTiles = [2, 3, 4, 8, 8, 14, 15, 16];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Pong,
          tiles: [22, 22, 22],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.be.ok;
    });

    it('碰的牌有翻牌', function() {
      players[0].handTiles = [2, 3, 4, 9, 9, 14, 15, 16];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Pong,
          tiles: [22, 22, 22],
          from: 2
        },
        {
          type: ClaimType.Pong,
          tiles: [31, 31, 31],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.be.ok;
    });

    it('手牌有翻牌', function() {
      players[0].handTiles = [2, 3, 4, 9, 9, 43, 43, 43];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Pong,
          tiles: [22, 22, 22],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.be.ok;
    });

    it('有花', function() {
      players[0].handTiles = [2, 3, 4, 9, 9, 14, 15, 16];
      players[0].flowerTiles = [51];
      players[0].chowTiles = [
        {
          type: ClaimType.Pong,
          tiles: [22, 22, 22],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];

      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.be.ok;
    });

    it('手里有三张，但做眼了', function() {
      players[0].handTiles = [7, 8, 9, 9, 9, 14, 15, 16];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [21, 22, 23],
          from: 3
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.be.ok;
    });
  });

  describe('has no point', () => {
    it('碰，没番', function() {
      players[0].handTiles = [2, 3, 4, 9, 9, 14, 15, 16];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Pong,
          tiles: [22, 22, 22],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];

      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.not.be.ok;
    });

    it('手里有三张，没番', function() {
      players[0].handTiles = [2, 3, 4, 9, 9, 33, 33, 33];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [21, 22, 23],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.not.be.ok;
    });

    it('只吃不碰，对子是翻牌', function() {
      players[0].handTiles = [2, 3, 4, 16, 17, 18, 45, 45];
      players[0].flowerTiles = [];
      players[0].chowTiles = [
        {
          type: ClaimType.Chow,
          tiles: [21, 22, 23],
          from: 2
        },
        {
          type: ClaimType.Chow,
          tiles: [22, 23, 24],
          from: 3
        }
      ];
      
      expect(canWin(players[0])).to.be.ok;
      expect(hasPoint(players[0])).to.not.be.ok;
    });
  });
});
