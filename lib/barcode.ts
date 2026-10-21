const CODE128_B_PATTERNS = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112",
] as const;

const START_B = 104;
const STOP = 106;
const QUIET_ZONE = 10;

export type BarcodeBar = { x: number; width: number };

export type BarcodeEncoded = {
  bars: BarcodeBar[];
  totalWidth: number;
  checkDigit: number;
};

export function encodeCode128(input: string): BarcodeEncoded {
  for (const char of input) {
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      throw new Error(`Code 128 no puede codificar el carácter "${char}"`);
    }
  }

  const symbols: number[] = [START_B];
  for (const char of input) {
    symbols.push(char.charCodeAt(0) - 32);
  }

  let checksum = symbols[0];
  for (let i = 1; i < symbols.length; i++) {
    checksum += symbols[i] * i;
  }
  const checkDigit = checksum % 103;
  symbols.push(checkDigit);
  symbols.push(STOP);

  const bars: BarcodeBar[] = [];
  let x = QUIET_ZONE;
  for (const symbol of symbols) {
    const pattern = CODE128_B_PATTERNS[symbol];
    let isBar = true;
    for (const width of pattern) {
      if (isBar) bars.push({ x, width: Number(width) });
      x += Number(width);
      isBar = !isBar;
    }
  }

  return { bars, totalWidth: x + QUIET_ZONE, checkDigit };
}

export function isValidCode128Value(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) return false;
  }
  return true;
}

const EAN13_L = [
  "0001101", "0011001", "0010011", "0111101", "0100011", "0110001",
  "0101111", "0111011", "0110111", "0001011",
];
const EAN13_G = [
  "0100111", "0110011", "0011011", "0100001", "0011101", "0111001",
  "0000101", "0010001", "0001001", "0010111",
];
const EAN13_R = [
  "1110010", "1100110", "1101100", "1000010", "1011100", "1001110",
  "1010000", "1000100", "1001000", "1110100",
];
const EAN13_PARIDAD = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL",
];
const EAN13_QUIET_ZONE = 11;

function calcularDigitoEAN13(digitos: string): number {
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    suma += (digitos.charCodeAt(i) - 48) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (suma % 10)) % 10;
}

export function completarEAN13(input: string): string | null {
  const limpio = input.replace(/\D/g, "");
  if (limpio.length === 12) return limpio + calcularDigitoEAN13(limpio);
  if (limpio.length === 13) return isValidEAN13(limpio) ? limpio : null;
  return null;
}

export function isValidEAN13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  return calcularDigitoEAN13(value.slice(0, 12)) === Number(value[12]);
}

export function encodeEAN13(value: string): BarcodeEncoded {
  if (!isValidEAN13(value)) {
    throw new Error("EAN-13 inválido");
  }

  const digits = value.split("").map((c) => c.charCodeAt(0) - 48);
  const paridad = EAN13_PARIDAD[digits[0]];

  const bits: number[] = [];
  const push = (pattern: string) => {
    for (const bit of pattern) bits.push(bit === "1" ? 1 : 0);
  };

  push("101");
  for (let i = 0; i < 6; i++) {
    push(paridad[i] === "L" ? EAN13_L[digits[i + 1]] : EAN13_G[digits[i + 1]]);
  }
  push("01010");
  for (let i = 0; i < 6; i++) {
    push(EAN13_R[digits[i + 7]]);
  }
  push("101");

  const bars: BarcodeBar[] = [];
  let x = EAN13_QUIET_ZONE;
  let run = 0;
  for (const bit of bits) {
    if (bit === 1) {
      run += 1;
    } else if (run > 0) {
      bars.push({ x: x - run, width: run });
      run = 0;
    }
    x += 1;
  }
  if (run > 0) {
    bars.push({ x: x - run, width: run });
  }

  return {
    bars,
    totalWidth: bits.length + EAN13_QUIET_ZONE * 2,
    checkDigit: digits[12],
  };
}
