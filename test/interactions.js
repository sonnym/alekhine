var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.fen_updates_and_moves = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  board.move("e2", "e4");
  test.equal(board.get_fen(), "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

  board.move("c7", "c5");
  test.equal(board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2");

  board.move("g1", "f3");
  test.equal(board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2");

  test.done();
}

exports.move_callback_error_for_invalid_move = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  board.move("h1", "g1", function(err, data) {
    test.equal(err.message, "invalid move");
  });

  test.done();
};

exports.result_identifies_unwon_postiion = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  test.equal(board.result(), null);
  test.done();
}

exports.result_identifies_won_position = function(test) {
  board.set_fen("1K5r/8/1k6/8/8/8/8/8 w - - 0 1");
  test.equal(board.result(), "0-1");
  test.done();
}

exports.result_identifies_stalemate_position = function(test) {
  board.set_fen("8/2r5/1q6/3K1k2/8/8/8/8 w - - 0 1");
  test.equal(board.result(), "1/2-1/2");
  test.done();
}

exports.can_get_structure_of_all_available_moves = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  test.deepEqual(board.all_moves(),
    { '48': { piece: 'P', valid: [ 40, 32 ] },
      '49': { piece: 'P', valid: [ 41, 33 ] },
      '50': { piece: 'P', valid: [ 42, 34 ] },
      '51': { piece: 'P', valid: [ 43, 35 ] },
      '52': { piece: 'P', valid: [ 44, 36 ] },
      '53': { piece: 'P', valid: [ 45, 37 ] },
      '54': { piece: 'P', valid: [ 46, 38 ] },
      '55': { piece: 'P', valid: [ 47, 39 ] },
      '57': { piece: 'N', valid: [ 42, 40 ] },
      '62': { piece: 'N', valid: [ 47, 45 ] }
  });
  test.done();
}
