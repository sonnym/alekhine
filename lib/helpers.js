function position2row(p) {
  return Math.floor(p / 8) + 1;
}

function position2rank(p) {
  return 9 - position2row(p);
}

function position2col(p) {
  return (p % 8);
}

function position2file(p) {
  return String.fromCharCode(97 + position2col(p));
}

function position2square(p) {
  return position2file(p) + position2rank(p);
}

function square2position(s) {
  return ((8 - parseInt(s.charAt(1))) * 8) + (s.charCodeAt(0) - 97);
}

export {
  position2row,
  position2rank,
  position2col,
  position2file,
  position2square,
  square2position
}
