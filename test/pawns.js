var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.pawn_moves = function(test) {
  board.set_fen("8/7p/4K2P/8/4k3/8/8/8 w - - 0 1");
  test.equal(board.get_valid_locations(15).length, 0);

  board.set_fen("8/7p/4K2P/8/4k3/8/8/8 b - - 0 1");
  test.equal(board.get_valid_locations(23).length, 0);

  board.set_fen("8/8/4K3/pP6/4k3/8/8/8 w - a6 0 1");
  test.deepEqual(board.get_valid_locations(25).sort(), [16, 17]);

  board.set_fen("8/8/4K3/6Pp/4k3/8/8/8 w - h6 0 1");
  test.deepEqual(board.get_valid_locations(30).sort(), [22, 23]);

  board.set_fen("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
  test.deepEqual(board.get_valid_locations(36).sort(), [27, 28]);

  test.done();
}

exports.en_passant_square_is_a_valid_move = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  board.move("e2", "e4");
  test.deepEqual(board.get_valid_locations(11).sort(), [19, 27].sort());

  test.done();
}

exports.pawn_can_promote_upon_reaching_back_rank = function(test) {
  board.set_fen("8/P7/8/8/8/8/1K3k2/8 w - - 0 1");
  board.move("a7", "a8", function(error, data) {
    test.equal(null, error)

    if (data.promote) {
      data.promote("Q");
    }

  });

  test.equal(board.get_fen(), "Q7/8/8/8/8/8/1K3k2/8 b - - 1 1");
  test.done();
}

exports.pawn_can_promote_while_capturing = function(test) {
  board.set_fen("1b6/P7/8/8/8/8/1K3k2/8 w - - 0 1");
  board.move("a7", "b8", function(error, data) {
    test.equal(null, error)

    if (data.promote) {
      data.promote("Q");
    }

    if (data.captured) {
      test.equal(data.captured, "b");
    }
  });

  test.equal(board.get_fen(), "1Q6/8/8/8/8/8/1K3k2/8 b - - 0 1");
  test.done();
}

exports.pawn_move_cannot_reveal_check = function(test) {
  board.set_fen("8/8/k7/q1P1K3/8/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(26).length, 0);

  board.set_fen("8/q7/k7/2P5/8/4K3/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(26).length, 0);

  test.done();
}
