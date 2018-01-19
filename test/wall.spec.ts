// import { expect } from 'chai';
// import Round from '../src/round';

// describe('open Hand', function() {
//   describe('open hand by hourse', function() {
//     it('open hand by hourse', function() {
//       const round = new Round();
//       const result = round.openHand(true);

//       expect(result.length).to.equal(14);
//     });
//   });

//   describe('open hand by not hourse', function() {
//     it('open hand by not hourse', function() {
//       const round = new Round();
//       const result = round.openHand(false);

//       expect(result.length).to.equal(13);
//     });
//   });
// });

// describe('get card', function() {
//   const round = new Round();
//   let tiles = round.tiles.slice();

//   describe('deal card', function() {
//     it('deal card', function() {
//       const result = round.deal();

//       expect(result).to.equal(tiles[0]);
//     });
//   });

//   describe('draw card', function() {
//     it('draw card', function() {
//       const result = round.draw();

//       expect(result).to.equal(tiles[tiles.length - 1]);
//     });
//   });
// });
