import Board from '../lib/alekhine'

describe("king moves", () => {
  const board = new Board()

  it("can move to all surrounding squares", () => {
    board.setFen("8/8/1K6/8/4k3/8/8/8 w - - 0 1")
    expect(board.getValidLocations("b6").sort())
      .toEqual(["a5", "a6", "a7", "b5", "b7", "c5", "c6", "c7"])

    board.setFen("8/8/1K6/8/4k3/8/8/8 b - - 0 1")
    expect(board.getValidLocations("e4").sort())
      .toEqual(["d3", "d4", "d5", "e3", "e5", "f3", "f4", "f5"])
  })

  it("cannot move anywhere when surrounded by checks", () => {
    board.setFen("8/8/8/1q6/3K1k2/8/8/2r5 w - - 0 1")
    expect(board.getValidLocations("b4").length).toBe(0)
  })

  it("can castle king or queen side", () => {
    board.setFen("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1")
    expect(board.getValidLocations("e1").length).toBe(7)

    board.setFen("r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1")
    expect(board.getValidLocations("e8").length).toBe(7)
  })

  it("cannot castle through or into check", () => {
    board.setFen("4k3/8/8/2q5/8/8/8/R3K2R w KQ - 0 1")
    expect(board.getValidLocations("e1").length).toBe(4)

    board.setFen("r3k2r/8/8/5Q2/8/8/8/4K3 b kq - 0 1")
    expect(board.getValidLocations("e8").length).toBe(2)
  })

  it("king move prevents castling", () => {
    board.setFen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1")

    board.move("e1", "f1")
    expect(board.getCastlingAvailability()).toBe("kq")

    board.move("e8", "f8")
    expect(board.getCastlingAvailability()).toBe("-")
  })

  it("castle squares are not valid if castling unavailable", () => {
    board.setFen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1")
    expect(board.getValidLocations("e1").length).toBe(2)

    board.setFen("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b - - 0 1")
    expect(board.getValidLocations("e8").length).toBe(2)
  })
})
