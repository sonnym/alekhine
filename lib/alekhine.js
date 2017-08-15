import { valid_locations, find_pieces, is_check } from './validator'
import { fen2array, array2fen } from './fen'
import * as helpers from './helpers'

/**
 * Alekhine
 *
 * @summary Generate valid moves and validate moves.
 */

/**
 * @classdesc Class representing a chess board.
 */
class Board {
  /**
   * Create a board with default starting position.
   * @constructor
   */
  constructor() {
    this._fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this._state = fen2array(this._fen);
  }

  /**
   * @method get_valid_locations
   *
   * @param {String} from The square for which valid destinations will be generated.
   * @returns {Array} All the valid array indices to which the piece in the from index may move.
   */
  get_valid_locations(from) {
    return valid_locations(this._fen, helpers.square2position(from), true)
      .map(helpers.position2square);
  }

  /**
   * @method get_fen
   *
   * Get the current FEN representation of the board.
   */
  get_fen() {
    return this._fen;
  }

  /**
   * @method set_fen
   *
   * Set the entire FEN representation of the board
   *
   * @param {String} fen A valid FEN representation of a board state.
   */
  set_fen(fen) {
    this._fen = fen;
    this._state = fen2array(fen);
  }

  /**
   * @method get_state
   *
   * @returns {Array} A representation of the board.
   */
  get_state() {
    return this._state;
  }

  /**
   * @method get_turn
   *
   * @returns {String} the turn portion of the FEN - "w" or "b".
   */
  get_turn() {
    return this._fen.split(" ")[1];
  }

  /**
   * @method get_castling_availability
   *
   * @returns {String} The castling portion of the FEN, .e.g. "kq".
   */
  get_castling_availability() {
    return this._fen.split(" ")[2];
  }

  /**
   * @method result
   *
   * @returns {String} The result of the game - "1-0", "0-1" or "1/2-1/2" in the case of a draw.
   */
  result() {
    const all_moves = this.all_moves();
    let move_count = 0;

    for (const position in all_moves) {
      move_count += all_moves[position].valid.length;
    }

    if (move_count === 0 && is_check(this.get_state(), this.get_turn())) {
      return (this.get_turn() === "w") ? "0-1" : "1-0";
    } else if (move_count === 0) {
      return "1/2-1/2";
    }
  }

  /**
   * @method all_moves
   *
   * @returns {Object} A representation all possible moves for the current state of the game.
   *
   * @example
   * >> new Board().all_moves()
   * >> { "a2": { piece: "P", valid: [ "a3", "a4" ] },
   *      "b2": { piece: "P", valid: [ "b3", "b4" ] },
   *      "c2": { piece: "P", valid: [ "c3", "c4" ] },
   *      "d2": { piece: "P", valid: [ "d3", "d4" ] },
   *      "e2": { piece: "P", valid: [ "e3", "e4" ] },
   *      "f2": { piece: "P", valid: [ "f3", "f4" ] },
   *      "g2": { piece: "P", valid: [ "g3", "g4" ] },
   *      "h2": { piece: "P", valid: [ "h3", "h4" ] },
   *      "b1": { piece: "N", valid: [ "c3", "a3" ] },
   *      "g1": { piece: "N", valid: [ "h3", "f3" ] } }
   */
  all_moves() {
    const piece_moves = {};

    const self = this;
    find_pieces(this.get_state(), this.get_turn(), (piece, position) => {
      const valid = self.get_valid_locations(helpers.position2square(position));

      if (valid.length > 0) {
        piece_moves[helpers.position2square(position)] = { "piece": piece, "valid": valid };
      }
    });

    return piece_moves;
  }

  /**
   * @method move
   *
   * prepare changes to state before calling private function, allowing
   * allows messaging for pawn promotion
   *
   * @param {String} from_square Initial position of piece (e.g. "e2")
   * @param {String} to_square final position of piece (e.g. "e4")
   * @param (Board~moveCallback) A callback to be fired after move is complete
   *
   * @callback Board~moveCallback
   * @param {String|null} error An error if one occurred or null.
   * @param {Object} Data representing the event - used for promotion and capture
   */
  move(from_square, to_square, callback) {
    const from = helpers.square2position(from_square);
    const to = helpers.square2position(to_square);

    const piece = this._state[from];
    const valid = valid_locations(this._fen, from, true);
    const capture = (this._state[to] !== "");
    const captured = capture ? this._state[to] : null;

    if (!valid.includes(to)) {
      callback(new Error("invalid move"));
      return;
    }

    // en passant
    if (["p", "P"].includes(piece) && [7, 9].includes(Math.abs(from - to)) && this._state[to] === "") {
      if (from > to) this._state[to + 8] = "";
      else if (from < to) this._state[to - 8] = "";
    }

    // pawn promotion
    if ((piece === "p" && to > 55 && to < 64) || (piece === "P" && to >= 0 && to < 8)) {
      const self = this;

      callback(null, { "promote": function(new_piece) {
        self.update_state(new_piece, from, to, capture)
      }});

    // castling
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

    // regular pawn moves
    } else {
      this.update_state(piece, from, to, capture);
    }

    if (captured) {
      callback(null, { "capture": captured });
    }
  }

  /**
   * @private
   * @method update_state
   *
   * updates the state array and fen string - piece is necessary in the case
   * of pawn promotions
   */
  update_state(piece, from, to, capture) {
    this._state[to] = piece;
    this._state[from] = "";

    const fen_parts = this._fen.split(" ");

    // position
    fen_parts[0] = array2fen(this._state);

    // turn
    fen_parts[1] = (fen_parts[1] === "w") ? "b" : "w";

    // castling
    if (fen_parts[2] !== "-" && ["R", "r", "K", "k"].includes(piece)) {
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

    // en passant
    if (["p", "P"].includes(piece) && Math.abs(from - to) === 16) {
      fen_parts[3] = helpers.position2file(from);
      if (from > to) fen_parts[3] += helpers.position2rank(from - 8);
      else fen_parts[3] += helpers.position2rank(from + 8);
    } else fen_parts[3] = "-";

    // half move number
    fen_parts[4] = (["p", "P"].includes(piece) || capture) ? 0 : parseInt(fen_parts[4]) + 1;

    // full move number
    if (fen_parts[1] === "w") fen_parts[5]++;

    this._fen = fen_parts.join(" ");
  }
}

/* @export */
module.exports = Board;
