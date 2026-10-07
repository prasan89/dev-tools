import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// UTF-8 encoder — compatible with both browser and Node/jsdom test envs
// ---------------------------------------------------------------------------
function strToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  // Node.js Buffer fallback (available in jest/jsdom test env)
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(str, 'utf8');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  // Manual UTF-8 encoding as last resort
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        bytes.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f),
        );
        i++;
        continue;
      }
      bytes.push(0xef, 0xbf, 0xbd); // replacement char
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

// ---------------------------------------------------------------------------
// Pure-JS MD5 (RFC 1321) — crypto.subtle doesn't support MD5
// ---------------------------------------------------------------------------
function md5(input: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function str2binl(str: string): number[] {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  }

  function binl2hex(binarray: number[]): string {
    const hexTab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str +=
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
    }
    return str;
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    let i, olda, oldb, oldc, oldd;
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;

    for (i = 0; i < x.length; i += 16) {
      olda = a; oldb = b; oldc = c; oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda); b = safeAdd(b, oldb);
      c = safeAdd(c, oldc); d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }

  const encoded = unescape(encodeURIComponent(input));
  return binl2hex(binlMD5(str2binl(encoded), encoded.length * 8));
}

// ---------------------------------------------------------------------------
// SHA-1 (pure JS)
// ---------------------------------------------------------------------------
function sha1(message: string): string {
  const bytes = strToBytes(message);
  const msgLen = bytes.length;
  const bitLen = msgLen * 8;

  const padLen = ((msgLen + 9 + 63) & ~63);
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[msgLen] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;

  for (let i = 0; i < padLen; i += 64) {
    const w = new Uint32Array(80);
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false);
    for (let j = 16; j < 80; j++) {
      const v = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (v << 1) | (v >>> 31);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f: number, k: number;
      if (j < 20)      { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (j < 40) { f = b ^ c ^ d;           k = 0x6ed9eba1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else             { f = b ^ c ^ d;           k = 0xca62c1d6; }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = ((b << 30) | (b >>> 2)) >>> 0; b = a; a = temp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map((h) => h.toString(16).padStart(8, '0')).join('');
}

// ---------------------------------------------------------------------------
// SHA-256 (pure JS)
// ---------------------------------------------------------------------------
const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr32(n: number, k: number): number {
  return (n >>> k) | (n << (32 - k));
}

function sha256(message: string): string {
  const bytes = strToBytes(message);
  const msgLen = bytes.length;
  const bitLen = msgLen * 8;

  const padLen = ((msgLen + 9 + 63) & ~63);
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[msgLen] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let i = 0; i < padLen; i += 64) {
    const w = new Uint32Array(64);
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = rotr32(w[j - 15], 7) ^ rotr32(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rotr32(w[j - 2], 17) ^ rotr32(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
    for (let j = 0; j < 64; j++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + K256[j] + w[j]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + hh) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((v) => v.toString(16).padStart(8, '0')).join('');
}

// ---------------------------------------------------------------------------
// SHA-512 (pure JS — 64-bit arithmetic via [hi, lo] pairs)
// ---------------------------------------------------------------------------
type Hi32 = [number, number];

function add64(a: Hi32, b: Hi32): Hi32 {
  const lo = ((a[1] >>> 0) + (b[1] >>> 0)) >>> 0;
  const carry = ((a[1] >>> 0) + (b[1] >>> 0)) >= 0x100000000 ? 1 : 0;
  const hi = ((a[0] >>> 0) + (b[0] >>> 0) + carry) >>> 0;
  return [hi, lo];
}
function rotr64(x: Hi32, n: number): Hi32 {
  if (n === 32) return [x[1], x[0]];
  if (n < 32) return [((x[0] >>> n) | (x[1] << (32 - n))) >>> 0, ((x[1] >>> n) | (x[0] << (32 - n))) >>> 0];
  n -= 32;
  return [((x[1] >>> n) | (x[0] << (32 - n))) >>> 0, ((x[0] >>> n) | (x[1] << (32 - n))) >>> 0];
}
function shr64(x: Hi32, n: number): Hi32 {
  if (n >= 32) return [0, x[0] >>> (n - 32)];
  return [(x[0] >>> n), ((x[1] >>> n) | (x[0] << (32 - n))) >>> 0];
}
function xor64(a: Hi32, b: Hi32): Hi32 { return [(a[0] ^ b[0]) >>> 0, (a[1] ^ b[1]) >>> 0]; }
function and64(a: Hi32, b: Hi32): Hi32 { return [(a[0] & b[0]) >>> 0, (a[1] & b[1]) >>> 0]; }
function not64(a: Hi32): Hi32 { return [(~a[0]) >>> 0, (~a[1]) >>> 0]; }

const K512: Hi32[] = [
  [0x428a2f98,0xd728ae22],[0x71374491,0x23ef65cd],[0xb5c0fbcf,0xec4d3b2f],[0xe9b5dba5,0x8189dbbc],
  [0x3956c25b,0xf348b538],[0x59f111f1,0xb605d019],[0x923f82a4,0xaf194f9b],[0xab1c5ed5,0xda6d8118],
  [0xd807aa98,0xa3030242],[0x12835b01,0x45706fbe],[0x243185be,0x4ee4b28c],[0x550c7dc3,0xd5ffb4e2],
  [0x72be5d74,0xf27b896f],[0x80deb1fe,0x3b1696b1],[0x9bdc06a7,0x25c71235],[0xc19bf174,0xcf692694],
  [0xe49b69c1,0x9ef14ad2],[0xefbe4786,0x384f25e3],[0x0fc19dc6,0x8b8cd5b5],[0x240ca1cc,0x77ac9c65],
  [0x2de92c6f,0x592b0275],[0x4a7484aa,0x6ea6e483],[0x5cb0a9dc,0xbd41fbd4],[0x76f988da,0x831153b5],
  [0x983e5152,0xee66dfab],[0xa831c66d,0x2db43210],[0xb00327c8,0x98fb213f],[0xbf597fc7,0xbeef0ee4],
  [0xc6e00bf3,0x3da88fc2],[0xd5a79147,0x930aa725],[0x06ca6351,0xe003826f],[0x14292967,0x0a0e6e70],
  [0x27b70a85,0x46d22ffc],[0x2e1b2138,0x5c26c926],[0x4d2c6dfc,0x5ac42aed],[0x53380d13,0x9d95b3df],
  [0x650a7354,0x8baf63de],[0x766a0abb,0x3c77b2a8],[0x81c2c92e,0x47edaee6],[0x92722c85,0x1482353b],
  [0xa2bfe8a1,0x4cf10364],[0xa81a664b,0xbc423001],[0xc24b8b70,0xd0f89791],[0xc76c51a3,0x0654be30],
  [0xd192e819,0xd6ef5218],[0xd6990624,0x5565a910],[0xf40e3585,0x5771202a],[0x106aa070,0x32bbd1b8],
  [0x19a4c116,0xb8d2d0c8],[0x1e376c08,0x5141ab53],[0x2748774c,0xdf8eeb99],[0x34b0bcb5,0xe19b48a8],
  [0x391c0cb3,0xc5c95a63],[0x4ed8aa4a,0xe3418acb],[0x5b9cca4f,0x7763e373],[0x682e6ff3,0xd6b2b8a3],
  [0x748f82ee,0x5defb2fc],[0x78a5636f,0x43172f60],[0x84c87814,0xa1f0ab72],[0x8cc70208,0x1a6439ec],
  [0x90befffa,0x23631e28],[0xa4506ceb,0xde82bde9],[0xbef9a3f7,0xb2c67915],[0xc67178f2,0xe372532b],
  [0xca273ece,0xea26619c],[0xd186b8c7,0x21c0c207],[0xeada7dd6,0xcde0eb1e],[0xf57d4f7f,0xee6ed178],
  [0x06f067aa,0x72176fba],[0x0a637dc5,0xa2c898a6],[0x113f9804,0xbef90dae],[0x1b710b35,0x131c471b],
  [0x28db77f5,0x23047d84],[0x32caab7b,0x40c72493],[0x3c9ebe0a,0x15c9bebc],[0x431d67c4,0x9c100d4c],
  [0x4cc5d4be,0xcb3e42b6],[0x597f299c,0xfc657e2a],[0x5fcb6fab,0x3ad6faec],[0x6c44198c,0x4a475817],
];

function sha512(message: string): string {
  const bytes = strToBytes(message);
  const msgLen = bytes.length;
  const bitLenLo = (msgLen * 8) >>> 0;
  const bitLenHi = Math.floor(msgLen / 0x20000000) >>> 0;

  const padLen = ((msgLen + 17 + 127) & ~127);
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[msgLen] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLenLo, false);
  dv.setUint32(padLen - 8, bitLenHi, false);

  let h: Hi32[] = [
    [0x6a09e667,0xf3bcc908],[0xbb67ae85,0x84caa73b],
    [0x3c6ef372,0xfe94f82b],[0xa54ff53a,0x5f1d36f1],
    [0x510e527f,0xade682d1],[0x9b05688c,0x2b3e6c1f],
    [0x1f83d9ab,0xfb41bd6b],[0x5be0cd19,0x137e2179],
  ];

  for (let i = 0; i < padLen; i += 128) {
    const w: Hi32[] = new Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] = [dv.getUint32(i + j * 8, false), dv.getUint32(i + j * 8 + 4, false)];
    }
    for (let j = 16; j < 80; j++) {
      const s0 = xor64(xor64(rotr64(w[j - 15], 1), rotr64(w[j - 15], 8)), shr64(w[j - 15], 7));
      const s1 = xor64(xor64(rotr64(w[j - 2], 19), rotr64(w[j - 2], 61)), shr64(w[j - 2], 6));
      w[j] = add64(add64(w[j - 16], s0), add64(w[j - 7], s1));
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let j = 0; j < 80; j++) {
      const S1 = xor64(xor64(rotr64(e, 14), rotr64(e, 18)), rotr64(e, 41));
      const ch = xor64(and64(e, f), and64(not64(e), g));
      const temp1 = add64(add64(hh, S1), add64(ch, add64(K512[j], w[j])));
      const S0 = xor64(xor64(rotr64(a, 28), rotr64(a, 34)), rotr64(a, 39));
      const maj = xor64(xor64(and64(a, b), and64(a, c)), and64(b, c));
      const temp2 = add64(S0, maj);
      hh = g; g = f; f = e; e = add64(d, temp1);
      d = c; c = b; b = a; a = add64(temp1, temp2);
    }
    h[0] = add64(h[0], a); h[1] = add64(h[1], b);
    h[2] = add64(h[2], c); h[3] = add64(h[3], d);
    h[4] = add64(h[4], e); h[5] = add64(h[5], f);
    h[6] = add64(h[6], g); h[7] = add64(h[7], hh);
  }
  return h.map(([hi, lo]) => hi.toString(16).padStart(8, '0') + lo.toString(16).padStart(8, '0')).join('');
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------
function syncHash(algorithm: string, input: string): string {
  if (algorithm === 'MD5')    return md5(input);
  if (algorithm === 'SHA-1')  return sha1(input);
  if (algorithm === 'SHA-256') return sha256(input);
  if (algorithm === 'SHA-512') return sha512(input);
  throw new Error(`Unknown algorithm: ${algorithm}`);
}

export const hashGeneratorProcessor: ToolProcessor = {
  inputLabel: 'Input Text',
  inputPlaceholder: 'Enter text to hash…',
  autoProcess: false,
  exampleInput: 'Hello, World!',

  optionControls: [
    {
      key: 'algorithm',
      type: 'select',
      label: 'Algorithm',
      defaultValue: 'SHA-256',
      options: [
        { value: 'MD5',    label: 'MD5' },
        { value: 'SHA-1',  label: 'SHA-1' },
        { value: 'SHA-256', label: 'SHA-256' },
        { value: 'SHA-512', label: 'SHA-512' },
      ],
    },
    {
      key: 'uppercase',
      type: 'checkbox',
      label: 'Uppercase output',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to hash.' };

    const algorithm = String(input.options?.['algorithm'] ?? 'SHA-256');
    const uppercase = Boolean(input.options?.['uppercase']);

    let hash: string;
    try {
      hash = syncHash(algorithm, raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Hash error';
      return { error: msg };
    }

    if (uppercase) hash = hash.toUpperCase();

    return {
      output: {
        value: hash,
        type: 'text',
        label: `${algorithm} Hash`,
        copyable: true,
        downloadFilename: 'hash.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        algorithm,
        'input bytes': raw.length,
        'hash length': `${hash.length} hex chars (${hash.length / 2} bytes)`,
      },
    };
  },
};
