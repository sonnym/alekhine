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

exports.result_identifies_unwon_postiion = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  test.equal(board.result(), null);
  test.done();
}

exports.result_identifies_won_position = function(test) {
  board.set_fen("1K5r/8/1k6/8/8/8/8/8 w - - 0 1");
  test.equal(board.result(), "0-1");
  test.done();
}

exports.result_identifies_stalemate_position = function(test) {
  board.set_fen("8/2r5/1q6/3K1k2/8/8/8/8 w - - 0 1");
  test.equal(board.result(), "1/2-1/2");
  test.done();
}
