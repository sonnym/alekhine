var Board = require("./../lib/alekhine.js");
var board = new Board();

exports.fen_updates_and_moves = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  board.move("e2", "e4");
  test.equal(board.get_fen(), "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

  board.move("c7", "c5");
  test.equal(board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2");

  board.move("g1", "f3");
  test.equal(board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2");

  test.done();
}

exports.move_callback_error_for_invalid_move = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  board.move("h1", "g1", function(err, data) {
    test.equal(err.message, "invalid move");
  });

  test.done();
};

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

exports.can_get_structure_of_all_available_moves = function(test) {
  board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  test.deepEqual(board.all_moves(),
    { "a2": { piece: "P", valid: [ "a3", "a4" ] },
      "b2": { piece: "P", valid: [ "b3", "b4" ] },
      "c2": { piece: "P", valid: [ "c3", "c4" ] },
      "d2": { piece: "P", valid: [ "d3", "d4" ] },
      "e2": { piece: "P", valid: [ "e3", "e4" ] },
      "f2": { piece: "P", valid: [ "f3", "f4" ] },
      "g2": { piece: "P", valid: [ "g3", "g4" ] },
      "h2": { piece: "P", valid: [ "h3", "h4" ] },
      "b1": { piece: "N", valid: [ "c3", "a3" ] },
      "g1": { piece: "N", valid: [ "h3", "f3" ] }
    });

  test.done();
}
