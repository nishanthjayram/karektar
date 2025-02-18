const RX_LETTERS = /[a-zA-Z]/g
const RX_NUMBERS = /[0-9]/g
const RX_NON_ALPHANUMERIC = /[^a-zA-Z0-9]/g

const getUniqueCharacters = (input: string) => {
  const SPACE_SYMBOL = '␣'
  const uniqueCharacters = [...new Set<string>(input)].map(c =>
    c === ' ' ? SPACE_SYMBOL : c,
  )

  const letters = uniqueCharacters.flatMap(c => c.match(RX_LETTERS) ?? [])
  const numbers = uniqueCharacters.flatMap(c => c.match(RX_NUMBERS) ?? [])
  const nonAlphaNum = uniqueCharacters.flatMap(
    c => c.match(RX_NON_ALPHANUMERIC) ?? [],
  )

  // replace any characters that will not render validly otherwise (e.g. spaces)

  return [letters, numbers, nonAlphaNum].flatMap(c => c.sort())
}

export default getUniqueCharacters
