var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.queen_moves = function(test) {
  board.set_fen("8/8/4K3/2Q5/4k3/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(26).sort(), [2, 5, 8, 10, 12, 17, 18, 19, 24, 25, 27, 28, 29, 30, 31, 33, 34, 35, 40, 42, 44, 50, 53, 58, 62].sort());

  test.done();
}
