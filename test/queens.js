var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.queen_moves = function(test) {
  board.set_fen("8/8/4K3/2Q5/4k3/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations("c5").sort(),
                 ["a3", "a5", "a7", "b4", "b5", "b6", "c1", "c2", "c3", "c4", "c6", "c7",
                  "c8", "d4", "d5", "d6", "e3", "e5", "e7", "f2", "f5", "f8", "g1", "g5", "h5"]);
  test.done();
}
