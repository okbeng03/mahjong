// import { expect } from 'chai';
// import Game from '../src/game';
// import Round from '../src/round';
// import Player from '../src/ai/basic';
// import { ClaimType } from '../src/tile';

// describe('ai', () => {
//   let game;
//   let round;
//   let players;

//   before(() => {
//     game = new Game();
//     game.addPlayer(1, 'test1', true);
//     game.addPlayer(2, 'test2', true);
//     game.addPlayer(3, 'test3', true);
//     game.addPlayer(4, 'test4', true);
//   });

//   beforeEach(() => {
//     game.start();
//     // round = game.rounds[game.rounds.length - 1];
//     // round = new Round(game);
//     // players = round.players;

//     // players[0].handTiles = [2, 4, 6, 8, 9, 9, 13, 13, 13, 15, 17, 23, 27];
//     // players[0].discardTiles = [31, 45, 1, 17];
//     // players[0].chowTiles = [
//     //   {
//     //     type: ClaimType.Chow,
//     //     from: 3,
//     //     tiles: [5, 6, 7]
//     //   }
//     // ];
//     // players[1].discardTiles = [43, 19, 22, 47];
//     // players[2].discardTiles = [19, 1, 13, 27];
//     // players[3].discardTiles = [31, 41, 2];
//     // players[0].round = round;
//     // players[1].round = round;
//     // players[2].round = round;
//     // players[3].round = round;
//   });

//   describe('probability calculate', () => {
//     it('probability calculate', function() {
//       // const probabilities = players[0].probabilityCalculate([1, 3, 19, 47]);

//       // console.log(probabilities);
//     });
//   });

//   // describe('discard', () => {
//   //   it('discard', function() {
//   //     players[0].openCheck();
//   //     players[0].discardByAI();

//   //     // players[0].handTiles = [1, 1, 4, 5, 14, 19, 22, 23, 28];
//   //     // players[0].openCheck();
//   //     // players[0].discardByAI();

//   //     // players[0].handTiles = [1, 1, 4, 5, 14, 22, 23, 28];
//   //     // players[0].openCheck();
//   //     // players[0].discardByAI();

//   //     // players[0].handTiles = [1, 1, 4, 5, 22, 23, 28];
//   //     // players[0].openCheck();
//   //     // players[0].discardByAI();

//   //     // players[0].handTiles = [1, 1, 4, 5, 22, 23];
//   //     // players[0].openCheck();
//   //     // players[0].discardByAI();

//   //     // players[0].handTiles = [1, 1, 4, 22, 23];
//   //     // players[0].openCheck();
//   //     // players[0].discardByAI();
//   //   });
//   // });
// });
