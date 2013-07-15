var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.bishop_moves = function(test) {
  board.set_fen("3BB3/8/4K3/8/4k3/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(3).sort(), [10, 12, 17, 21, 24, 30, 39]);
  test.deepEqual(board.get_valid_locations(4).sort(), [11, 13, 18, 22, 25, 31, 32]);

  board.set_fen("8/8/4K3/8/4k3/8/8/3bb3 b - - 0 1");
  test.deepEqual(board.get_valid_locations(59).sort(), [31, 32, 38, 41, 45, 50, 52]);
  test.deepEqual(board.get_valid_locations(60).sort(), [24, 33, 39, 42, 46, 51, 53]);

  // capture
  board.set_fen("8/8/8/8/8/8/1K1bk3/2B5 w KQkq - 0 1");
  test.deepEqual(board.get_valid_locations(58), [51]);

  board.set_fen("8/8/5b2/8/6k1/2B5/1K6/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(42).sort(), [21, 28, 35]);

  test.done();
}
