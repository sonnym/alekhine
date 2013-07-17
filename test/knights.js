var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.knight_moves = function(test) {
  board.set_fen("7k/8/8/8/8/8/8/1N5K w - - 0 1");
  test.deepEqual(board.get_valid_locations("b1").sort(), ["a3", "c3", "d2"]);

  board.set_fen("7k/8/8/8/N7/8/8/7K w - - 0 1");
  test.deepEqual(board.get_valid_locations("a4").sort(), ["b2", "b6", "c3", "c5"]);

  test.done();
}

exports.knight_move_cannot_reveal_check = function(test) {
  board.set_fen("8/3k4/2q5/8/4N3/8/6K1/8 w - - 0 1");
  test.equal(board.get_valid_locations("e4").length, 0);

  test.done();
}
