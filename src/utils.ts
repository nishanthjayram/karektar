export const assertUnreachable = (x: never): never => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Default case should not be reachable. ${x}`)
}
export const compareArrays = <T>(a: T[], b: T[]) =>
  a !== undefined &&
  b !== undefined &&
  a.length === b.length &&
  a.every((v, i) => v === b[i])
