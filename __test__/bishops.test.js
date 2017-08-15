import Board from '../lib/alekhine'

describe("bishop moves", () => {
  const board = new Board();

  it("returns expected values for white to play", () => {
    board.set_fen("3BB3/8/4K3/8/4k3/8/8/8 w - - 0 1")

    expect(board.get_valid_locations("d8").sort())
      .toEqual(["a5", "b6", "c7", "e7", "f6", "g5", "h4"])

    expect(board.get_valid_locations("e8").sort())
      .toEqual(["a4", "b5", "c6", "d7", "f7", "g6", "h5"])
  })

  it("returns expected values for black to play", () => {
    board.set_fen("8/8/4K3/8/4k3/8/8/3bb3 b - - 0 1");

    expect(board.get_valid_locations("d1").sort())
      .toEqual(["a4", "b3", "c2", "e2", "f3", "g4", "h5"])

    expect(board.get_valid_locations("e1").sort())
      .toEqual(["a5", "b4", "c3", "d2", "f2", "g3", "h4"])
  })

  it("appropriately handles captures", () => {
    board.set_fen("8/8/8/8/8/8/1K1bk3/2B5 w KQkq - 0 1")
    expect(board.get_valid_locations("c1")).toEqual(["d2"])

    board.set_fen("8/8/5b2/8/6k1/2B5/1K6/8 w - - 0 1")
    expect(board.get_valid_locations("c3")).toEqual(["d4", "e5", "f6"])
  })
})
