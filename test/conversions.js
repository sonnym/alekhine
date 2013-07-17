var sandbox = require("nodeunit").utils.sandbox;
var board = sandbox("lib/alekhine.js", { module: { exports: {} } });

exports.position_to_row_conversions = function(test) {
  test.equal(board.position2row(0), 1);
  test.equal(board.position2row(7), 1);

  test.equal(board.position2row(56), 8);
  test.equal(board.position2row(63), 8);

  test.done();
}

exports.position_to_rank_conversions = function(test) {
  test.equal(board.position2rank(0), 8);
  test.equal(board.position2rank(7), 8);

  test.equal(board.position2rank(56), 1);
  test.equal(board.position2rank(63), 1);

  test.done();
}

exports.position_to_column_conversions = function(test) {
  test.equal(board.position2col(0), 0);
  test.equal(board.position2col(7), 7);

  test.equal(board.position2col(56), 0);
  test.equal(board.position2col(63), 7);

  test.done();
}

exports.position_to_file_conversions = function(test) {
  test.equal(board.position2file(0), 'a');
  test.equal(board.position2file(7), 'h');

  test.equal(board.position2file(56), 'a');
  test.equal(board.position2file(63), 'h');

  test.done();
}

exports.position_to_square_conversions = function(test) {
  test.equal(board.position2square(0), 'a8');
  test.equal(board.position2square(7), 'h8');

  test.equal(board.position2square(56), 'a1');
  test.equal(board.position2square(63), 'h1');

  test.done();
}

exports.square_to_position_conversions = function(test) {
  test.equal(board.square2position('a8'), 0);
  test.equal(board.square2position('h8'), 7);

  test.equal(board.square2position('a1'), 56);
  test.equal(board.square2position('h1'), 63);

  test.done();
}
