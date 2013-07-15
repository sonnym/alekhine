var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.fen_updates_and_moves = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  board.move(52, 36);
  test.equal(board.get_fen(), "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  board.move(52, 36);
  test.equal(board.get_fen(), "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

  board.move(10, 26); // sicilian
  test.equal(board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2");

  board.move(62, 45);
  test.equal(board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2");

  test.done();
}

exports.move_works_identically_with_integer_and_string_input = function(test) {
  board.set_fen("rnbq1bnr/p1pppk2/8/Pp1P4/5ppp/1PN4N/1BP1PPPP/R2QKBR1 b KQkq - 1 11");
  board.move(7, 31, function(result) {
    test.equal(result, "complete")
  });

  board.set_fen("rnbq1bnr/p1pppk2/8/Pp1P4/5ppp/1PN4N/1BP1PPPP/R2QKBR1 b KQkq - 1 11");
  board.move("7", "31", function(result) {
    test.equal(result, "complete")
  });

  test.done();
}

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
  board.move(52, 36);
  test.deepEqual(board.get_valid_locations(11).sort(), [19, 27].sort());

  test.done();
}

exports.pawn_move_cannot_reveal_check = function(test) {
  board.set_fen("8/8/k7/q1P1K3/8/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(26).length, 0);

  board.set_fen("8/q7/k7/2P5/8/4K3/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(26).length, 0);

  test.done();
}

exports.knight_moves = function(test) {
  board.set_fen("7k/8/8/8/8/8/8/1N5K w - - 0 1");
  test.deepEqual(board.get_valid_locations(57).sort(), [40, 42, 51]);

  board.set_fen("7k/8/8/8/N7/8/8/7K w - - 0 1");
  test.deepEqual(board.get_valid_locations(32).sort(), [17, 26, 42, 49]);

  test.done();
}

exports.knight_move_cannot_reveal_check = function(test) {
  board.set_fen("8/3k4/2q5/8/4N3/8/6K1/8 w - - 0 1");
  test.equal(board.get_valid_locations(36).length, 0);
  
  test.done();
}

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

exports.rook_moves = function(test) {
  board.set_fen("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1");
  test.deepEqual(board.get_valid_locations(59).sort(), [3, 11, 19, 27, 35, 43, 51, 56, 57, 58, 60, 61, 62, 63].sort());

  test.done();
}

exports.queen_moves = function(test) {
  board.set_fen("8/8/4K3/2Q5/4k3/8/8/8 w - - 0 1");
  test.deepEqual(board.get_valid_locations(26).sort(), [2, 5, 8, 10, 12, 17, 18, 19, 24, 25, 27, 28, 29, 30, 31, 33, 34, 35, 40, 42, 44, 50, 53, 58, 62].sort());

  test.done();
}

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
