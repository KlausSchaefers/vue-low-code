export function fromRgb (/*String*/ color){
  var m = color.toLowerCase().match(/^rgba?\(([\s\\.,0-9]+)\)/);
  return m && this.fromArray(m[1].split(/\s*,\s*/));	// Color
}

export function fromHex (/*String*/ color ) {
  let t = this;
  let bits = (color.length == 4) ? 4 : 8;
  let mask = (1 << bits) - 1;
  color = Number("0x" + color.substr(1));
  if(isNaN(color)){
    return
  }
  let rgb = ["b", "g", "r"]
  rgb.forEach(x => {
      var c = color & mask;
      color >>= bits;
      t[x] = bits == 4 ? 17 * c : c;
  })
  t.a = 1;
  return t;	// Color
}

export function fromString (str) {
    if (str === 'transparent') {
        this._set(0, 0, 0, 0);
    } else {
        return this.fromRgb(str) || this.fromHex(str);
    }
}

export function toString(color) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}
