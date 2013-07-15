var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.king_moves = function(test) {
  board.set_fen("8/8/1K6/8/4k3/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(17).sort(), [8, 9, 10, 16, 18, 24, 25, 26].sort());

  board.set_fen("8/8/1K6/8/4k3/8/8/8 b - - 0 1");
  test.deepEqual(board.get_valid_locations(36).sort(), [27, 28, 29, 35, 37, 43, 44, 45]);

  // diagonal and lateral checks with rook and queen
  board.set_fen("8/8/8/1q6/3K1k2/8/8/2r5 w - - 0 1");
  test.equal(board.get_valid_locations(33).length, 0);

  test.done();
}

exports.king_can_castle_king_or_queen_side = function(test) {
  board.set_fen("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  test.equal(board.get_valid_locations(60).length, 7);

  board.set_fen("r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1");
  test.equal(board.get_valid_locations(4).length, 7);

  test.done();
}

exports.king_cannot_castle_through_or_into_check = function(test) {
  board.set_fen("4k3/8/8/2q5/8/8/8/R3K2R w KQ - 0 1");
  test.equal(board.get_valid_locations(60).length, 4);

  board.set_fen("r3k2r/8/8/5Q2/8/8/8/4K3 b kq - 0 1");
  test.equal(board.get_valid_locations(4).length, 2);

  test.done();
}
