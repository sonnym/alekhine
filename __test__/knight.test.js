import Board from "../lib/alekhine"

describe("knight moves", () => {
  const board = new Board.default();

  it("returns the expected values for white to play", () => {
    board.setFen("7k/8/8/8/8/8/8/1N5K w - - 0 1");
    expect(board.getValidLocations("b1").sort()).toEqual(["a3", "c3", "d2"])

    board.setFen("7k/8/8/8/N7/8/8/7K w - - 0 1");
    expect(board.getValidLocations("a4").sort()).toEqual(["b2", "b6", "c3", "c5"])
  })

  it("cannot move to reveal check", () => {
    board.setFen("8/3k4/2q5/8/4N3/8/6K1/8 w - - 0 1");
    expect(board.getValidLocations("e4").length, 0);
  })
})
