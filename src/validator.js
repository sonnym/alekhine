import { fen2array, array2fen } from './fen'
import * as helpers from './helpers'

const whitePieces = ["K", "Q", "R", "B", "N", "P"];
const blackPieces = ["k", "q", "r", "b", "n", "p"];

/* do not check for check when checking for check, lest check for check ad infinitum */
function validLocations(fen, start, checkForCheck) {
  const fenParts = fen.split(" ");
  const state = fen2array(fen);
  const turn = fenParts[1];
  const castle = fenParts[2];
  const enPassant = (!fenParts[3] || fenParts[3] === "-") ? null : helpers.square2position(fenParts[3]);
  const piece = state[start];

  if (piece === "" || (turn === "w" && !whitePieces.includes(piece)) || turn === "b" && !blackPieces.includes(piece)) return [];

  if (["P", "p"].includes(piece)) {
    return pawnCheck(state, turn, start, enPassant, checkForCheck);

  } else if (["N", "n"].includes(piece)) {
    if (checkForCheck) {
      const testState = state.slice();
      testState[start] = "";  // knight move opens all lines through a point

      if (isCheck(testState, turn)) {
        return [];
      } else {
        return multiplicativeCheck(state, turn, start, [6, 10], 1, 1).concat(multiplicativeCheck(state, turn, start, [15, 17], 2, 1));
      }
    } else return multiplicativeCheck(state, turn, start, [6, 10], 1, 1).concat(multiplicativeCheck(state, turn, start, [15, 17], 2, 1));

  } else if (["B", "b"].includes(piece)) {
    if (checkForCheck) return excludeBlockingCheck(state, turn, start, [7, 9]);
    else return multiplicativeCheck(state, turn, start, [7, 9], 1);

  } else if (["R", "r"].includes(piece)) {
    if (checkForCheck) return excludeBlockingCheck(state, turn, start, [1, 8]);
    else return multiplicativeCheck(state, turn, start, [1], 0).concat(multiplicativeCheck(state, turn, start, [8], 1));

  } else if (["Q", "q"].includes(piece)) {
    if (checkForCheck) return excludeBlockingCheck(state, turn, start, [1, 7, 8, 9]);
    else return multiplicativeCheck(state, turn, start, [1], 0).concat(multiplicativeCheck(state, turn, start, [7, 8, 9], 1));

  } else if (["K", "k"].includes(piece)) {
    const grossValid = multiplicativeCheck(state, turn, start, [1], 0, 1).concat(multiplicativeCheck(state, turn, start, [7, 8, 9], 1, 1));
    let testStateA;
    let testStateB;
    const valid = [];

    // castling
    if (castle) {
      if (piece === "k" && start === 4) {
        if (castle.includes("k")) {
          if (state[5] === "" && state[6] === "") {
            testStateA = state.slice();
            testStateA[4] = "";
            testStateA[5] = "k";

            testStateB = state.slice();
            testStateB[4] = "";
            testStateB[6] = "k";

            if (!isCheck(testStateA, turn) && !isCheck(testStateB, turn)) valid.push(6);
          }
        }
        if (castle.includes("q")) {
          if (state[3] === "" && state[2] === "" && state[1] === "") {
            testStateA = state.slice();
            testStateA[4] = "";
            testStateA[3] = "k";

            testStateB = state.slice();
            testStateB[4] = "";
            testStateB[2] = "k";

            if (!isCheck(testStateA, turn) && !isCheck(testStateB, turn)) valid.push(2);
          }
        }
      } else if (piece === "K" && start === 60) {
        if (castle.includes("K")) {
          if (state[61] === "" && state[62] === "") {
            testStateA = state.slice();
            testStateA[60] = "";
            testStateA[61] = "K";

            testStateB = state.slice();
            testStateB[60] = "";
            testStateB[62] = "K";

            if (!isCheck(testStateA, turn) && !isCheck(testStateB, turn)) valid.push(62);
          }
        }
        if (castle.includes("Q")) {
          if (state[59] === "" && state[58] === "" && state[57] === "") {
            testStateA = state.slice();
            testStateA[60] = "";
            testStateA[59] = "K";

            testStateB = state.slice();
            testStateB[60] = "";
            testStateB[58] = "K";

            if (!isCheck(testStateA, turn) && !isCheck(testStateB, turn)) valid.push(58);
          }
        }
      }
    }

    // filter out checks
    if (checkForCheck) {
      for (let i = 0, l = grossValid.length; i < l; i++) {
        testStateA = state.slice();
        testStateA[start] = "";
        testStateA[grossValid[i]] = piece;

        if (!isCheck(testStateA, turn)) valid.push(grossValid[i])
      }

      return valid;
    } else return grossValid;
  }
}

/**
 * @private
 *
 * check if moving a piece along a path results in check
 * unlike multiplicativeCheck, encapsulates its own wrap conditions
 */
function excludeBlockingCheck(state, turn, start, paths) {
  const piece = state[start];
  let valid = [];

  for (const p in paths) {
    const destinations = multiplicativeCheck(state, turn, start, [paths[p]], (paths[p] === 1 ? 0 : 1));

    if (destinations.length > 0) {
      const testState = state.slice(); // assign by value
      testState[destinations[0]] = piece;
      testState[start] = "";

      if (!isCheck(testState, turn)) {
        valid = valid.concat(destinations);
      }
    }
  }

  return valid;
}

// handles edge cases for pawn movement
function pawnCheck(state, turn, start, ep, checkForCheck) {
  const grossValid = [];

  if (turn === "b") {
    var comp = (a, b) => parseInt(a) + parseInt(b);
    var pieces = blackPieces;
    var startRank = [7, 16];
  } else if (turn === "w") {
    var comp = (a, b) => a - b;
    var pieces = whitePieces;
    var startRank = [47, 56];
  }

  // forward movement
  if (!state[comp(start, 8)]) grossValid.push(comp(start, 8));
  if (start > startRank[0] && start < startRank[1] && !state[comp(start, 8)] && !state[comp(start, 16)]) grossValid.push(comp(start, 16));

  // capture
  if (state[comp(start, 7)] && !pieces.includes(state[comp(start, 7)]) && Math.abs(helpers.position2row(start) - helpers.position2row(comp(start, 7))) === 1) grossValid.push(comp(start, 7));
  if (state[comp(start, 9)] && !pieces.includes(state[comp(start, 9)]) && Math.abs(helpers.position2row(start) - helpers.position2row(comp(start, 9))) === 1) grossValid.push(comp(start, 9));

  // en passant
  if (ep && (comp(start, 7) === ep || comp(start, 9) === ep)) grossValid.push(ep);

  // filter out checks
  if (checkForCheck) {
    const valid = [];

    for (let i = 0, l = grossValid.length; i < l; i++) {
      const testState = state.slice();
      testState[grossValid[i]] = testState[start];
      testState[start] = "";

      if (!isCheck(testState, turn)) valid.push(grossValid[i])
    }

    return valid;
  } else return grossValid;
}

/**
 * @private
 * @function multiplicativeCheck
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
function multiplicativeCheck(state, turn, start, distances, wrap, depth) {
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

      const prevIndices = [start + (distance * (current - 1)), start - (distance * (current - 1))];

      for (const i in indices) {
        const index = indices[i];
        const prevIndex = prevIndices[i];
        const rowDiff = Math.abs(helpers.position2row(prevIndex) - helpers.position2row(index));

        if (index < 64 && index >= 0 && !blocked[i]) {
          // if exact number of wraps is not met, ignore location (accounts for edge wrapping and knight minimums)
          if (rowDiff !== wrap) blocked[i] = true;

          if (!blocked[i]) {
            const targetPiece = state[index];

            if (!targetPiece) valid.push(index);
            else  {
              // allow capture on first block if opposing piece in way
              if (turn === "w" && blackPieces.includes(targetPiece) || turn === "b" && whitePieces.includes(targetPiece)) valid.push(index);
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
 * @method findPieces
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
function findPieces(state, player, callback) {
  const pieceChecker = piece => {
    const ascii = piece.charCodeAt(0);
    return (player === "w" && ascii > 64 && ascii < 91) ||
           (player === "b" && ascii > 96 && ascii < 123);
  };

  for (let i = 0; i < 64; i++) {
    const piece = state[i];

    if (piece !== "" && pieceChecker(piece)) {
      callback(piece, i);
    }
  }
}

/**
 * @private
 * @method isCheck
 *
 * determine whether the given state is check for the player
 *
 * - state Array state array
 * - whom String "w" or "b" - player whose possibility of check is in question
 *
 * returns Boolean
 */
function isCheck(state, whom) {
  const turn = (whom === "w") ? "b" : "w";
  let kingPosition = null;

  for (let i = 0; i < 64 && !kingPosition; i++) {
    if ((whom === "b" && state[i] === "k") || (whom === "w" && state[i] === "K")) {
      kingPosition = i;
    }
  }

  let isCheck = false;

  findPieces(state, turn, (piece, position) => {
    const valid = validLocations(`${array2fen(state)} ${turn}`, position, false);

    if (valid.includes(kingPosition)) {
      isCheck = true;
    }
  });

  return isCheck;
}

export { validLocations, findPieces, isCheck }
