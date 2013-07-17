var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.rook_moves = function(test) {
  board.set_fen("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1");
  test.deepEqual(board.get_valid_locations(59).sort(), [3, 11, 19, 27, 35, 43, 51, 56, 57, 58, 60, 61, 62, 63].sort());

  test.done();
}

exports.rook_move_prevents_castling = function(test) {
  board.set_fen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1");

  board.move("a1", "b1");
  test.equal(board.get_castling_availability(), "Kkq");

  board.move("a8", "b8");
  test.equal(board.get_castling_availability(), "Kk");

  board.move("h1", "g1");
  test.equal(board.get_castling_availability(), "k");

  board.move("h8", "g8");
  test.equal(board.get_castling_availability(), "-");

  test.done();
}
