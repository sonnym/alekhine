var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.rook_moves = function(test) {
  board.set_fen("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1");
  test.deepEqual(board.get_valid_locations("d1").sort(),
                 ["a1", "b1", "c1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "e1", "f1", "g1", "h1"]);
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
