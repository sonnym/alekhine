function fen2array(fen) {
  const position = fen.split(" ")[0].replace(/\//g, "")
  const state = []
  let offset = 0

  for (let i = 0, l = position.length; i < l; i++) {
    const char = position.charAt(i)

    if (isNaN(char)) state[i + offset] = char
    else for (let j = 0; j < char; j++) state[i + ((j === char - 1) ? offset : offset++)] = ""
  }

  return state
}

function array2fen(state) {
  let ret = ""

  for (let i = 0, l = state.length; i < l; i++) {
    const piece = state[i]

    if (i > 0 && i % 8 === 0) ret += '/'

    if (piece === "") {
      let count = 1
      for (; state[i + 1] === "" && (i + 1) % 8 !== 0; count++) i++
      ret += parseInt(count)
    } else ret += piece
  }

  return ret
}

export { fen2array, array2fen }
