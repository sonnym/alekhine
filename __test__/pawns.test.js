import Board from '../lib/alekhine'

describe("pawn moves", () => {
  const board = new Board()

  it("basics", () => {
    board.setFen("8/7p/4K2P/8/4k3/8/8/8 w - - 0 1")
    expect(board.getValidLocations("h7").length).toBe(0)

    board.setFen("8/7p/4K2P/8/4k3/8/8/8 b - - 0 1")
    expect(board.getValidLocations("h6").length).toBe(0)

    board.setFen("8/8/4K3/pP6/4k3/8/8/8 w - a6 0 1")
    expect(board.getValidLocations("b5").sort()).toEqual(["a6", "b6"])

    board.setFen("8/8/4K3/6Pp/4k3/8/8/8 w - h6 0 1")
    expect(board.getValidLocations("g5").sort()).toEqual(["g6", "h6"])

    board.setFen("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1")
    expect(board.getValidLocations("e4").sort()).toEqual(["d5", "e5"])
  })

  it("en passant square is a valid move", () => {
    board.setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    board.move("e2", "e4")

    expect(board.getValidLocations("d7").sort()).toEqual(["d5", "d6"])
  })

  it("can promote upon reaching back rank", () => {
    board.setFen("8/P7/8/8/8/8/1K3k2/8 w - - 0 1")

    board.move("a7", "a8", function(error, data) {
      expect(error).toBe(null)

      if (data.promote) {
        data.promote("Q")
      }
    })

    expect(board.getFen()).toBe("Q7/8/8/8/8/8/1K3k2/8 b - - 1 1")
  })

  it("can promote while capturing", () => {
    board.setFen("1b6/P7/8/8/8/8/1K3k2/8 w - - 0 1")

    board.move("a7", "b8", function(error, data) {
      expect(error).toBe(null)

      if (data.promote) {
        data.promote("Q")
      }

      if (data.captured) {
        test.equal(data.captured, "b")
      }
    })

    expect(board.getFen()).toBe("1Q6/8/8/8/8/8/1K3k2/8 b - - 0 1")
  })

  it("cannot move to reveal check", () => {
    board.setFen("8/8/k7/q1P1K3/8/8/8/8 w - - 0 1")
    expect(board.getValidLocations("c5").length).toBe(0)

    board.setFen("8/q7/k7/2P5/8/4K3/8/8 w - - 0 1")
    expect(board.getValidLocations("c5").length).toBe(0)
  })
})
