var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.king_moves = function(test) {
  board.set_fen("8/8/1K6/8/4k3/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations("b6").sort(), ["a5", "a6", "a7", "b5", "b7", "c5", "c6", "c7"]);

  board.set_fen("8/8/1K6/8/4k3/8/8/8 b - - 0 1");
  test.deepEqual(board.get_valid_locations("e4").sort(), ["d3", "d4", "d5", "e3", "e5", "f3", "f4", "f5"]);

  // diagonal and lateral checks with rook and queen
  board.set_fen("8/8/8/1q6/3K1k2/8/8/2r5 w - - 0 1");
  test.equal(board.get_valid_locations("b4").length, 0);

  test.done();
}

exports.king_can_castle_king_or_queen_side = function(test) {
  board.set_fen("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  test.equal(board.get_valid_locations("e1").length, 7);

  board.set_fen("r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1");
  test.equal(board.get_valid_locations("e8").length, 7);

  test.done();
}

exports.king_cannot_castle_through_or_into_check = function(test) {
  board.set_fen("4k3/8/8/2q5/8/8/8/R3K2R w KQ - 0 1");
  test.equal(board.get_valid_locations("e1").length, 4);

  board.set_fen("r3k2r/8/8/5Q2/8/8/8/4K3 b kq - 0 1");
  test.equal(board.get_valid_locations("e8").length, 2);

  test.done();
}

exports.king_move_prevents_castling = function(test) {
  board.set_fen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1");

  board.move("e1", "f1");
  test.equal(board.get_castling_availability(), "kq");

  board.move("e8", "f8");
  test.equal(board.get_castling_availability(), "-");

  test.done();
}

exports.castle_squares_are_not_valid_if_castling_unavailable = function(test) {
  board.set_fen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1");
  test.equal(board.get_valid_locations("e1").length, 2);

  board.set_fen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b - - 0 1");
  test.equal(board.get_valid_locations("e8").length, 2);

  test.done();
}
