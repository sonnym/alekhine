import { fen2array, array2fen } from './fen'
import * as helpers from './helpers'

const white_pieces = ["K", "Q", "R", "B", "N", "P"];
const black_pieces = ["k", "q", "r", "b", "n", "p"];

/* do not check for check when checking for check, lest check for check ad infinitum */
function valid_locations(fen, start, check_for_check) {
  const fen_parts = fen.split(" ");
  const state = fen2array(fen);
  const turn = fen_parts[1];
  const castle = fen_parts[2];
  const en_passant = (!fen_parts[3] || fen_parts[3] === "-") ? null : helpers.square2position(fen_parts[3]);
  const piece = state[start];

  if (piece === "" || (turn === "w" && !white_pieces.includes(piece)) || turn === "b" && !black_pieces.includes(piece)) return [];

  if (["P", "p"].includes(piece)) {
    return pawn_check(state, turn, start, en_passant, check_for_check);

  } else if (["N", "n"].includes(piece)) {
    if (check_for_check) {
      const test_state = state.slice();
      test_state[start] = "";  // knight move opens all lines through a point

      if (is_check(test_state, turn)) {
        return [];
      } else {
        return mult_check(state, turn, start, [6, 10], 1, 1).concat(mult_check(state, turn, start, [15, 17], 2, 1));
      }
    } else return mult_check(state, turn, start, [6, 10], 1, 1).concat(mult_check(state, turn, start, [15, 17], 2, 1));

  } else if (["B", "b"].includes(piece)) {
    if (check_for_check) return exclude_blocking_check(state, turn, start, [7, 9]);
    else return mult_check(state, turn, start, [7, 9], 1);

  } else if (["R", "r"].includes(piece)) {
    if (check_for_check) return exclude_blocking_check(state, turn, start, [1, 8]);
    else return mult_check(state, turn, start, [1], 0).concat(mult_check(state, turn, start, [8], 1));

  } else if (["Q", "q"].includes(piece)) {
    if (check_for_check) return exclude_blocking_check(state, turn, start, [1, 7, 8, 9]);
    else return mult_check(state, turn, start, [1], 0).concat(mult_check(state, turn, start, [7, 8, 9], 1));

  } else if (["K", "k"].includes(piece)) {
    const gross_valid = mult_check(state, turn, start, [1], 0, 1).concat(mult_check(state, turn, start, [7, 8, 9], 1, 1));
    let test_state_a;
    let test_state_b;
    const valid = [];

    // castling
    if (castle) {
      if (piece === "k" && start === 4) {
        if (castle.includes("k")) {
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
        if (castle.includes("q")) {
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
        if (castle.includes("K")) {
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
        if (castle.includes("Q")) {
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

    // filter out checks
    if (check_for_check) {
      for (let i = 0, l = gross_valid.length; i < l; i++) {
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
 * @private
 *
 * check if moving a piece along a path results in check
 * unlike mult_check, encapsulates its own wrap conditions
 */
function exclude_blocking_check(state, turn, start, paths) {
  const piece = state[start];
  let valid = [];

  for (const p in paths) {
    const valid_d = mult_check(state, turn, start, [paths[p]], (paths[p] === 1 ? 0 : 1));

    if (valid_d.length > 0) {
      const state_d = state.slice(); // assign by value
      state_d[valid_d[0]] = piece;
      state_d[start] = "";

      if (!is_check(state_d, turn)) {
        valid = valid.concat(valid_d);
      }
    }
  }

  return valid;
}

// handles edge cases for pawn movement
function pawn_check(state, turn, start, ep, check_for_check) {
  const gross_valid = [];

  if (turn === "b") {
    var comp = (a, b) => parseInt(a) + parseInt(b);
    var pieces = black_pieces;
    var start_rank = [7, 16];
  } else if (turn === "w") {
    var comp = (a, b) => a - b;
    var pieces = white_pieces;
    var start_rank = [47, 56];
  }

  // forward movement
  if (!state[comp(start, 8)]) gross_valid.push(comp(start, 8));
  if (start > start_rank[0] && start < start_rank[1] && !state[comp(start, 8)] && !state[comp(start, 16)]) gross_valid.push(comp(start, 16));

  // capture
  if (state[comp(start, 7)] && !pieces.includes(state[comp(start, 7)]) && Math.abs(helpers.position2row(start) - helpers.position2row(comp(start, 7))) === 1) gross_valid.push(comp(start, 7));
  if (state[comp(start, 9)] && !pieces.includes(state[comp(start, 9)]) && Math.abs(helpers.position2row(start) - helpers.position2row(comp(start, 9))) === 1) gross_valid.push(comp(start, 9));

  // en passant
  if (ep && (comp(start, 7) === ep || comp(start, 9) === ep)) gross_valid.push(ep);

  // filter out checks
  if (check_for_check) {
    const valid = [];

    for (let i = 0, l = gross_valid.length; i < l; i++) {
      const test_state = state.slice();
      test_state[gross_valid[i]] = test_state[start];
      test_state[start] = "";

      if (!is_check(test_state, turn)) valid.push(gross_valid[i])
    }

    return valid;
  } else return gross_valid;
}

/**
 * @private
 * @function mult_check
 *
 * returns valid indices from the board array to which a piece can move
 *
 * takes into account the need for a knight to travel multiple ranks in a given move,
 * blocking by other pieces, en prise for any move with a regular pattern
 *
 * mult here stands for multiplicative, since, by default, the search will search at all multiples of a distance within array bounds
 *
 * the main idea here is:  when numbering the pieces of a chess board from 0 to 63, all pieces move multiples of certain integers from their starting position,
 * and cannot wrap around the board, except in the case of the knight which *must* appear to wrap into the next rank or the one after
 */
function mult_check(state, turn, start, distances, wrap, depth) {
  const valid = [];
  const iter = (start < 32) ? (cur, dist) => start + (dist * cur) < 64
                          : (cur, dist) => start - (dist * cur) >= 0;

  for (const d in distances) {
    const distance = distances[d];
    const blocked = [false, false];
    let current = 1;

    do {
      // traversing an array; indices is literal; equidistant from start position; target locations
      const indices = [start + (distance * current), start - (distance * current)]; // do: [start, start]

      const prev_indices = [start + (distance * (current - 1)), start - (distance * (current - 1))];

      for (const i in indices) {
        const index = indices[i];
        const prev_index = prev_indices[i];
        const row_diff = Math.abs(helpers.position2row(prev_index) - helpers.position2row(index));

        if (index < 64 && index >= 0 && !blocked[i]) {
          // if exact number of wraps is not met, ignore location (accounts for edge wrapping and knight minimums)
          if (row_diff !== wrap) blocked[i] = true;

          if (!blocked[i]) {
            const piece_in_target = state[index];

            if (!piece_in_target) valid.push(index);
            else  {
              // allow capture on first block if opposing piece in way
              if (turn === "w" && black_pieces.includes(piece_in_target) || turn === "b" && white_pieces.includes(piece_in_target)) valid.push(index);
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

/**
 * @private
 * @method find_pieces
 *
 * finds all the pieces for a givne player, and passes the piece ascii value
 * and position to a callback.
 *
 * - state Array state array
 * - player String "w" or "b"
 * - callback Function
 *   - piece String ascii representation of the piece
 *   - position Number the position of the piece in the state array
 */
function find_pieces(state, player, callback) {
  const piece_checker = piece => {
    const ascii = piece.charCodeAt(0);
    return (player === "w" && ascii > 64 && ascii < 91) ||
           (player === "b" && ascii > 96 && ascii < 123);
  };

  for (let i = 0; i < 64; i++) {
    const piece = state[i];

    if (piece !== "" && piece_checker(piece)) {
      callback(piece, i);
    }
  }
}

/**
 * @private
 * @method is_check
 *
 * determine whether the given state is check for the player
 *
 * - state Array state array
 * - whom String "w" or "b" - player whose possibility of check is in question
 *
 * returns Boolean
 */
function is_check(state, whom) {
  const turn = (whom === "w") ? "b" : "w";
  let king_position = null;

  for (let i = 0; i < 64 && !king_position; i++) {
    if ((whom === "b" && state[i] === "k") || (whom === "w" && state[i] === "K")) {
      king_position = i;
    }
  }

  let is_check = false;

  find_pieces(state, turn, (piece, position) => {
    const valid = valid_locations(`${array2fen(state)} ${turn}`, position, false);

    if (valid.includes(king_position)) {
      is_check = true;
    }
  });

  return is_check;
}

module.exports = { valid_locations, find_pieces, is_check }