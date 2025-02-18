export const withDisposal = <T extends { [Symbol.dispose]?: () => void }>(
  resource: T,
  fn: (resource: T) => void,
) => {
  try {
    return fn(resource)
  } finally {
    resource?.[Symbol.dispose]?.()
  }
}
