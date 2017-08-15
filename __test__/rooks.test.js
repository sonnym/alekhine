import Board from '../lib/alekhine'

describe("rook moves", () => {
  const board = new Board()

  it("returns expected values for white to play", () => {
    board.setFen("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1")

    expect(board.getValidLocations("d1").sort())
      .toEqual(["a1", "b1", "c1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "e1", "f1", "g1", "h1"])
  })

  it("move prevents caslting", () => {
    board.setFen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1")

    board.move("a1", "b1");
    expect(board.getCastlingAvailability()).toBe("Kkq")

    board.move("a8", "b8");
    expect(board.getCastlingAvailability()).toBe("Kk")

    board.move("h1", "g1");
    expect(board.getCastlingAvailability()).toBe("k")

    board.move("h8", "g8");
    expect(board.getCastlingAvailability()).toBe("-")
  })
})
