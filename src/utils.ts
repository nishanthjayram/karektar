export const compareArrays = <T>(a: T[], b: T[]) =>
  a !== undefined &&
  b !== undefined &&
  a.length === b.length &&
  a.every((v, i) => v === b[i])
