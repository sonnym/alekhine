import Board from "../lib/alekhine"

describe("bishop moves", () => {
  const board = new Board.default()

  it("fen updates and moves", () => {
    board.setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

    board.move("e2", "e4")
    expect(board.getFen())
      .toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")

    board.move("c7", "c5")
    expect(board.getFen())
      .toBe("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2")

    board.move("g1", "f3")
    expect(board.getFen())
      .toBe("rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2")
  })

  it("move callback error for invalid move", () => {
    board.setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

    board.move("h1", "g1", function(err, data) {
      expect(err.message).toBe("invalid move")
    })
  })

  it("result identifies unwon position", () => {
    board.setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    expect(board.result()).toBe(undefined)
  })

  it("result identifies won position", () => {
    board.setFen("1K5r/8/1k6/8/8/8/8/8 w - - 0 1")
    expect(board.result()).toBe("0-1")
  })

  it("result identifies stalemate position", () => {
    board.setFen("8/2r5/1q6/3K1k2/8/8/8/8 w - - 0 1")
    expect(board.result()).toEqual("1/2-1/2")
  })

  it("can get a structure of all available moves", () => {
    board.setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    expect(board.allMoves()).toEqual(
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
      }
    )
  })
})
