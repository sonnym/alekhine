var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.rook_moves = function(test) {
  board.set_fen("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1");
  test.deepEqual(board.get_valid_locations(59).sort(), [3, 11, 19, 27, 35, 43, 51, 56, 57, 58, 60, 61, 62, 63].sort());

  test.done();
}
