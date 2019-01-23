import { validLocations, findPieces, isCheck } from './validator'
import { fen2array, array2fen } from './fen'
import * as helpers from './helpers'

/**
 * @export
 *
 * @classdesc Class representing a chess board.
 */
export default class Board {
  /**
   * @constructor
   *
   * Create a board with default starting position.
   */
  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this._fen = fen;
    this._state = fen2array(this._fen);
  }

  /**
   * @method getValidLocations
   *
   * @param {String} from The square for which valid destinations will be generated.
   * @returns {Array} All the valid array indices to which the piece in the from index may move.
   */
  getValidLocations(from) {
    return validLocations(this._fen, helpers.square2position(from), true)
      .map(helpers.position2square);
  }

  /**
   * @method getFen
   *
   * Get the current FEN representation of the board.
   */
  getFen() {
    return this._fen;
  }

  /**
   * @method setFen
   *
   * Set the entire FEN representation of the board
   *
   * @param {String} fen A valid FEN representation of a board state.
   */
  setFen(fen) {
    this._fen = fen;
    this._state = fen2array(fen);
  }

  /**
   * @method getState
   *
   * @returns {Array} A representation of the board.
   */
  getState() {
    return this._state;
  }

  /**
   * @method getTurn
   *
   * @returns {String} the turn portion of the FEN - "w" or "b".
   */
  getTurn() {
    return this._fen.split(" ")[1];
  }

  /**
   * @method getCastlingAvailability
   *
   * @returns {String} The castling portion of the FEN, .e.g. "kq".
   */
  getCastlingAvailability() {
    return this._fen.split(" ")[2];
  }

  /**
   * @method result
   *
   * @returns {String} The result of the game - "1-0", "0-1" or "1/2-1/2" in the case of a draw.
   */
  result() {
    const allMoves = this.allMoves();
    let moveCount = 0;

    for (const position in allMoves) {
      moveCount += allMoves[position].valid.length;
    }

    if (moveCount === 0 && isCheck(this.getState(), this.getTurn())) {
      return (this.getTurn() === "w") ? "0-1" : "1-0";
    } else if (moveCount === 0) {
      return "1/2-1/2";
    }
  }

  /**
   * @method allMoves
   *
   * @returns {Object} A representation all possible moves for the current state of the game.
   *
   * @example
   * >> new Board().allMoves()
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
  allMoves() {
    const pieceMoves = {};

    const self = this;
    findPieces(this.getState(), this.getTurn(), (piece, position) => {
      const valid = self.getValidLocations(helpers.position2square(position));

      if (valid.length > 0) {
        pieceMoves[helpers.position2square(position)] = { "piece": piece, "valid": valid };
      }
    });

    return pieceMoves;
  }

  /**
   * @method move
   *
   * prepare changes to state before calling private function, allowing
   * allows messaging for pawn promotion
   *
   * @param {String} fromSquare Initial position of piece (e.g. "e2")
   * @param {String} toSquare final position of piece (e.g. "e4")
   * @param (Board~moveCallback) A callback to be fired after move is complete
   *
   * @callback Board~moveCallback
   * @param {String|null} error An error if one occurred or null.
   * @param {Object} Data representing the event - used for promotion and capture
   */
  move(fromSquare, toSquare, callback) {
    const from = helpers.square2position(fromSquare);
    const to = helpers.square2position(toSquare);

    const piece = this._state[from];
    const valid = validLocations(this._fen, from, true);
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
        self.updateState(new_piece, from, to, capture)
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
      this.updateState(piece, from, to, capture);
    }

    if (captured) {
      callback(null, { "capture": captured });
    }
  }

  /**
   * @private
   * @method updateState
   *
   * updates the state array and fen string - piece is necessary in the case
   * of pawn promotions
   */
  updateState(piece, from, to, capture) {
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

export const __useDefault = true
