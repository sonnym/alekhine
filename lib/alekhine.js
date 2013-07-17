// # Alekhine
//
// Generate valid moves and validate moves.

var white_pieces = ["K", "Q", "R", "B", "N", "P"];
var black_pieces = ["k", "q", "r", "b", "n", "p"];

// ## constructor
//
// initialize a board with the startning position of the game
function Board() {
  this._fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  this._state = fen2array(this._fen);
}

module.exports = Board;

// ## get\_valid\_locations
//
// - from String the square for which valid destinations will be generated
//
// returns all the valid array indices to which the piece in the from index
// may move
Board.prototype.get_valid_locations = function(from) {
  return valid_locations(this._fen, square2position(from), true).map(position2square);
}

// ## get_fen
//
// get the current FEN representation of the board
Board.prototype.get_fen = function() {
  return this._fen;
}

// ## set_fen
//
// set the entire FEN representation of the board
Board.prototype.set_fen = function(fen) {
  this._fen = fen;
  this._state = fen2array(fen);
}

// ## get_state
//
// returns an array representation of the board
Board.prototype.get_state = function() {
  return this._state;
}

// ## get_turn
//
// returns the turn portion of the FEN - "w" or "b"
Board.prototype.get_turn = function() {
  return this._fen.split(" ")[1];
}

// ## get\_castling\_availability
//
// returns the castling portion of the FEN
Board.prototype.get_castling_availability = function() {
  return this._fen.split(" ")[2];
}

// ## result
//
// returns the result of the game - "1-0", "0-1" or "1/2-1/2" in the case of stalemate
Board.prototype.result = function() {
  var all_moves = this.all_moves();
  var move_count = 0;

  for (var position in all_moves) {
    move_count += all_moves[position].valid.length;
  }

  if (move_count === 0 && is_check(this.get_state(), this.get_turn())) {
    return (this.get_turn() === "w") ? "0-1" : "1-0";
  } else if (move_count === 0) {
    return "1/2-1/2";
  }
}

// ## all_moves
//
// returns an object with all possible moves for the current state of the game,
// of the form:
//
//     { "a2": { piece: "P", valid: [ "a3", "a4" ] },
//       "b2": { piece: "P", valid: [ "b3", "b4" ] },
//       "c2": { piece: "P", valid: [ "c3", "c4" ] },
//       "d2": { piece: "P", valid: [ "d3", "d4" ] },
//       "e2": { piece: "P", valid: [ "e3", "e4" ] },
//       "f2": { piece: "P", valid: [ "f3", "f4" ] },
//       "g2": { piece: "P", valid: [ "g3", "g4" ] },
//       "h2": { piece: "P", valid: [ "h3", "h4" ] },
//       "b1": { piece: "N", valid: [ "c3", "a3" ] },
//       "g1": { piece: "N", valid: [ "h3", "f3" ] } }
Board.prototype.all_moves = function() {
  var piece_moves = {};

  var self = this;
  find_pieces(this.get_state(), this.get_turn(), function(piece, position) {
    var valid = self.get_valid_locations(position2square(position));

    if (valid.length > 0) {
      piece_moves[position2square(position)] = { "piece": piece, "valid": valid };
    }
  });

  return piece_moves;
}

// ## move
//
// prepare changes to state before calling private function, allowing
// allows messaging for pawn promotion
//
// - from_square String initial position of piece (e.g. "e2")
// - to_square String final position of piece (e.g. "e4")
// - callback Function 
//    - error String|Null an error if one occurred or null
//    - event Object data representing the event - used for promotion and capture
Board.prototype.move = function(from_square, to_square, callback) {
  var from = square2position(from_square);
  var to = square2position(to_square);

  var piece = this._state[from];
  var valid = valid_locations(this._fen, from, true);
  var capture = (this._state[to] !== "");
  var captured = capture ? this._state[to] : null;

  if (!in_array(to, valid)) {
    callback(new Error("invalid move"));
    return;
  }

  /* en passant */
  if (in_array(piece, ["p", "P"]) && in_array(Math.abs(from - to), [7, 9]) && this._state[to] === "") {
    if (from > to) this._state[to + 8] = "";
    else if (from < to) this._state[to - 8] = "";
  }

  /* pawn promotion */
  if ((piece === "p" && to > 55 && to < 64) || (piece === "P" && to >= 0 && to < 8)) {
    var self = this;

    callback(null, { "promote": function(new_piece) {
      self.update_state(new_piece, from, to, capture)
    }});

  /* castling */
  } else if (piece === "k" && from === 4 && Math.abs(from - to) === 2) {
    if (to === 2) {
      this._state[0] = "";
      this._state[2] = "k";
      this._state[3] = "r";
    } else if (to === 6) {
      this._state[7] = "";
      this._state[6] = "k";
      this._state[5] = "r";
    }
  } else if (piece === "K" && from === 60 && Math.abs(from - to) === 2) {
    if (to === 58) {
      this._state[56] = "";
      this._state[58] = "K";
      this._state[59] = "R";
    } else if (to === 62) {
      this._state[63] = "";
      this._state[62] = "K";
      this._state[61] = "R";
    }

  /* regular pawn moves */
  } else {
    this.update_state(piece, from, to, capture);
  }

  if (captured) {
    callback(null, { "capture": captured });
  }
}

// ## update_state
//
// updates the state array and fen string - piece is necessary in the case
// of pawn promotions
Board.prototype.update_state = function(piece, from, to, capture) {
  this._state[to] = piece;
  this._state[from] = "";

  var fen_parts = this._fen.split(" ");

  /* position */
  fen_parts[0] = array2fen(this._state);

  /* turn */
  fen_parts[1] = (fen_parts[1] === "w") ? "b" : "w";

  /* castling */
  if (fen_parts[2] !== "-" && in_array(piece, ["R", "r", "K", "k"])) {
    if (piece === "k") {
      fen_parts[2] = fen_parts[2].replace(/[kq]/g, "");
    } else if (piece === "K") {
      fen_parts[2] = fen_parts[2].replace(/[KQ]/g, "");
    } else if (piece === "r") {
      if (from === 0) {
        fen_parts[2] = fen_parts[2].replace(/[q]/g, "");
      } else if (from === 7) {
        fen_parts[2] = fen_parts[2].replace(/[k]/g, "");
      }
    } else if (piece === "R") {
      if (from === 56) {
        fen_parts[2] = fen_parts[2].replace(/[Q]/g, "");
      } else if (from === 63) {
        fen_parts[2] = fen_parts[2].replace(/[K]/g, "");
      }
    }

    if (fen_parts[2].length === 0) {
      fen_parts[2] = "-";
    }
  }

  /* en passant */
  if (in_array(piece, ["p", "P"]) && Math.abs(from - to) === 16) {
    fen_parts[3] = position2file(from);
    if (from > to) fen_parts[3] += position2rank(from - 8);
    else fen_parts[3] += position2rank(from + 8);
  } else fen_parts[3] = "-";

  /* half move number */
  fen_parts[4] = (in_array(piece, ["p", "P"]) || capture) ? 0 : parseInt(fen_parts[4]) + 1;

  /* full move number */
  if (fen_parts[1] === "w") fen_parts[5]++;

  this._fen = fen_parts.join(" ");
}

/* do not check for check when checking for check, lest check for check ad infinitum */
function valid_locations(fen, start, check_for_check) {
  var fen_parts = fen.split(" ");
  var state = fen2array(fen);
  var turn = fen_parts[1];
  var castle = fen_parts[2];
  var en_passant = (!fen_parts[3] || fen_parts[3] === "-") ? null : square2position(fen_parts[3]);
  var piece = state[start];

  if (piece === "" || (turn === "w" && !in_array(piece, white_pieces)) || turn === "b" && !in_array(piece, black_pieces)) return [];

  if (in_array(piece, ["P", "p"])) {
    return pawn_check(state, turn, start, en_passant, check_for_check);

  } else if (in_array(piece, ["N", "n"])) {
    if (check_for_check) {
      var test_state = state.slice();
      test_state[start] = "";  // knight move opens all lines through a point

      if (is_check(test_state, turn)) {
        return [];
      } else {
        return mult_check(state, turn, start, [6, 10], 1, 1).concat(mult_check(state, turn, start, [15, 17], 2, 1));
      }
    } else return mult_check(state, turn, start, [6, 10], 1, 1).concat(mult_check(state, turn, start, [15, 17], 2, 1));

  } else if (in_array(piece, ["B", "b"])) {
    if (check_for_check) return exclude_blocking_check(state, turn, start, [7, 9]);
    else return mult_check(state, turn, start, [7, 9], 1);

  } else if (in_array(piece, ["R", "r"])) {
    if (check_for_check) return exclude_blocking_check(state, turn, start, [1, 8]);
    else return mult_check(state, turn, start, [1], 0).concat(mult_check(state, turn, start, [8], 1));

  } else if (in_array(piece, ["Q", "q"])) {
    if (check_for_check) return exclude_blocking_check(state, turn, start, [1, 7, 8, 9]);
    else return mult_check(state, turn, start, [1], 0).concat(mult_check(state, turn, start, [7, 8, 9], 1));

  } else if (in_array(piece, ["K", "k"])) {
    var gross_valid = mult_check(state, turn, start, [1], 0, 1).concat(mult_check(state, turn, start, [7, 8, 9], 1, 1));
    var test_state_a
    var test_state_b
    var valid = [];

    /* castling */
    if (castle) {
      if (piece === "k" && start === 4) {
        if (castle.indexOf("k") > -1) {
          if (state[5] === "" && state[6] === "") {
            test_state_a = state.slice();
            test_state_a[4] = "";
            test_state_a[5] = "k";

            test_state_b = state.slice();
            test_state_b[4] = "";
            test_state_b[6] = "k";

            if (!is_check(test_state_a, turn) && !is_check(test_state_b, turn)) valid.push(6);
          }
        }
        if (castle.indexOf("q") > -1) {
          if (state[3] === "" && state[2] === "" && state[1] === "") {
            test_state_a = state.slice();
            test_state_a[4] = "";
            test_state_a[3] = "k";

            test_state_b = state.slice();
            test_state_b[4] = "";
            test_state_b[2] = "k";

            if (!is_check(test_state_a, turn) && !is_check(test_state_b, turn)) valid.push(2);
          }
        }
      } else if (piece === "K" && start === 60) {
        if (castle.indexOf("K") > -1) {
          if (state[61] === "" && state[62] === "") {
            test_state_a = state.slice();
            test_state_a[60] = "";
            test_state_a[61] = "K";

            test_state_b = state.slice();
            test_state_b[60] = "";
            test_state_b[62] = "K";

            if (!is_check(test_state_a, turn) && !is_check(test_state_b, turn)) valid.push(62);
          }
        }
        if (castle.indexOf("Q") > -1) {
          if (state[59] === "" && state[58] === "" && state[57] === "") {
            test_state_a = state.slice();
            test_state_a[60] = "";
            test_state_a[59] = "K";

            test_state_b = state.slice();
            test_state_b[60] = "";
            test_state_b[58] = "K";

            if (!is_check(test_state_a, turn) && !is_check(test_state_b, turn)) valid.push(58);
          }
        }
      }
    }

    /* filter out checks */
    if (check_for_check) {
      for (var i = 0, l = gross_valid.length; i < l; i++) {
        test_state_a = state.slice();
        test_state_a[start] = "";
        test_state_a[gross_valid[i]] = piece;

        if (!is_check(test_state_a, turn)) valid.push(gross_valid[i])
      }

      return valid;
    } else return gross_valid;
  }
}

/**
 * check if moving a piece along a path results in check
 * unlike mult_check, encapsulates its own wrap conditions
 */
function exclude_blocking_check(state, turn, start, paths) {
  var piece = state[start];
  var valid = [];

  for (var p in paths) {
    var valid_d = mult_check(state, turn, start, [paths[p]], (paths[p] === 1 ? 0 : 1));

    if (valid_d.length > 0) {
      var state_d = state.slice(); // assign by value
      state_d[valid_d[0]] = piece;
      state_d[start] = "";

      if (!is_check(state_d, turn)) {
        valid = valid.concat(valid_d);
      }
    }
  }

  return valid;
}

/* handles edge cases for pawn movement */
function pawn_check(state, turn, start, ep, check_for_check) {
  var gross_valid = [];

  if (turn === "b") {
    var comp = function(a, b) { return parseInt(a) + parseInt(b); };
    var pieces = black_pieces;
    var start_rank = [7, 16];
  } else if (turn === "w") {
    var comp = function(a, b) { return a - b; };
    var pieces = white_pieces;
    var start_rank = [47, 56];
  }

  /* forward movement */
  if (!state[comp(start, 8)]) gross_valid.push(comp(start, 8));
  if (start > start_rank[0] && start < start_rank[1] && !state[comp(start, 8)] && !state[comp(start, 16)]) gross_valid.push(comp(start, 16));

  /* capture */
  if (state[comp(start, 7)] && !in_array(state[comp(start, 7)], pieces) && Math.abs(position2row(start) - position2row(comp(start, 7))) === 1) gross_valid.push(comp(start, 7));
  if (state[comp(start, 9)] && !in_array(state[comp(start, 9)], pieces) && Math.abs(position2row(start) - position2row(comp(start, 9))) === 1) gross_valid.push(comp(start, 9));

  /* en passant */
  if (ep && (comp(start, 7) === ep || comp(start, 9) === ep)) gross_valid.push(ep);

  /* filter out checks */
  if (check_for_check) {
    var valid = [];

    for (var i = 0, l = gross_valid.length; i < l; i++) {
      var test_state = state.slice();
      test_state[gross_valid[i]] = test_state[start];
      test_state[start] = "";

      if (!is_check(test_state, turn)) valid.push(gross_valid[i])
    }

    return valid;
  } else return gross_valid;
}

// ## mult_check
//
// returns valid indices from the board array to which a piece can move
//
// takes into account the need for a knight to travel multiple ranks in a given move,
// blocking by other pieces, en prise for any move with a regular pattern
//
// mult here stands for multiplicative, since, by default, the search will search at all multiples of a distance within array bounds
//
// the main idea here is:  when numbering the pieces of a chess board from 0 to 63, all pieces move multiples of certain integers from their starting position,
// and cannot wrap around the board, except in the case of the knight which *must* appear to wrap into the next rank or the one after
function mult_check(state, turn, start, distances, wrap, depth) {
  var valid = [];
  var iter = (start < 32) ? function(cur, dist) { return start + (dist * cur) < 64 }
                          : function(cur, dist) { return start - (dist * cur) >= 0 };

  for (var d in distances) {
    var distance = distances[d];
    var blocked = [false, false];
    var current = 1;

    do {
      // traversing an array; indices is literal; equidistant from start position; target locations
      var indices = [start + (distance * current), start - (distance * current)]
        , prev_indices = [start + (distance * (current - 1)), start - (distance * (current - 1))]; // do: [start, start]

      for (var i in indices) {
        var index = indices[i]
          , prev_index = prev_indices[i]
          , row_diff = Math.abs(position2row(prev_index) - position2row(index));

        if (index < 64 && index >= 0 && !blocked[i]) {
          // if exact number of wraps is not met, ignore location (accounts for edge wrapping and knight minimums)
          if (row_diff !== wrap) blocked[i] = true;

          if (!blocked[i]) {
            var piece_in_target = state[index];

            if (!piece_in_target) valid.push(index);
            else  {
              // allow capture on first block if opposing piece in way
              if (turn === "w" && in_array(piece_in_target, black_pieces) || turn === "b" && in_array(piece_in_target, white_pieces)) valid.push(index);
              blocked[i] = true;
            }
          }
        }
      }

      current++;
    } while(iter(current, distance) && (!depth || current <= depth) && !(blocked[0] && blocked[1]))
  }

  return valid;
}

// ## find_pieces
//
// finds all the pieces for a givne player, and passes the piece ascii value
// and position to a callback.
//
// - state Array state array
// - player String "w" or "b"
// - callback Function
//   - piece String ascii representation of the piece
//   - position Number the position of the piece in the state array
function find_pieces(state, player, callback) {
  var piece_checker = function(piece) {
    var ascii = piece.charCodeAt(0);
    return (player === "w" && ascii > 64 && ascii < 91) ||
           (player === "b" && ascii > 96 && ascii < 123);
  };

  for (var i = 0; i < 64; i++) {
    var piece = state[i];

    if (piece !== "" && piece_checker(piece)) {
      callback(piece, i);
    }
  }
}

// ## is_check
//
// determine whether the given state is check for the player
//
// - state Array state array
// - whom String "w" or "b" - player whose possibility of check is in question
//
// returns Boolean
function is_check(state, whom) {
  var turn = (whom === "w") ? "b" : "w"
  var king_position = null;

  for (var i = 0; i < 64 && !king_position; i++) {
    if ((whom === "b" && state[i] === "k") || (whom === "w" && state[i] === "K")) {
      king_position = i;
    }
  }

  var is_check = false;

  find_pieces(state, turn, function(piece, position) {
    var valid = valid_locations(array2fen(state) + " " + turn, position, false);

    if (in_array(king_position, valid)) {
      is_check = true;
    }
  });

  return is_check;
}

/* fen conversions */

function fen2array(fen) {
  var position = fen.split(" ")[0].replace(/\//g, "");
  var state = [];
  var offset = 0;

  for (var i = 0, l = position.length; i < l; i++) {
    var char = position.charAt(i);

    if (isNaN(char)) state[i + offset] = char;
    else for (var j = 0; j < char; j++) state[i + ((j === char - 1) ? offset : offset++)] = "";
  }

  return state;
}

function array2fen(state) {
  var ret = "";

  for (var i = 0, l = state.length; i < l; i++) {
    var piece = state[i];

    if (i > 0 && i % 8 === 0) ret += '/';

    if (piece === "") {
      var count = 1;
      for (; state[i + 1] === "" && (i + 1) % 8 !== 0; count++) i++;
      ret += parseInt(count);
    } else ret += piece;
  }

  return ret;
}

/* helpers */
function position2row(p) {
  return Math.floor(p / 8) + 1;
}

function position2rank(p) {
  return 9 - position2row(p);
}

function position2col(p) {
  return (p % 8);
}

function position2file(p) {
  return String.fromCharCode(97 + position2col(p));
}

function position2square(p) {
  return position2file(p) + position2rank(p);
}

function square2position(s) {
  return ((8 - parseInt(s.charAt(1))) * 8) + (s.charCodeAt(0) - 97);
}

function in_array(needle, haystack) {
  for (var i = 0, l = haystack.length; i < l; i++) {
    if (haystack[i] === needle) return true;
  }
  return false;
}
