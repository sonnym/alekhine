import Board from '../lib/alekhine'

describe("queen moves", () => {
  const board = new Board()

  it("are numerous", () => {
    board.setFen("8/8/4K3/2Q5/4k3/8/8/8 w - - 0 1")

    expect(board.getValidLocations("c5").sort())
      .toEqual(["a3", "a5", "a7", "b4", "b5", "b6", "c1", "c2", "c3", "c4", "c6", "c7",
                "c8", "d4", "d5", "d6", "e3", "e5", "e7", "f2", "f5", "f8", "g1", "g5", "h5"])
  })
})
