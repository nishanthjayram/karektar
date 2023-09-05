export const SCREEN_BREAKPOINTS = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
}
export const DEFAULT_FONT_NAME = 'Karektar Regular'
export const DEFAULT_PROMPT = 'sphinx of black quartz judge my vow'
export const DEFAULT_SYMBOLS = 'abcdefghijklmnopqrstuvwxyz'.split('')
export const EXPORT_ALERT =
  'You are about to export with empty glyphs in your glyph set. Are you sure you want to continue?'
export const EXPORT_PROMPT =
  'Enter your font family name and style name, separated by space. (Default style is "Regular".)'
export const RESET_ALERT =
  'You are about to reset all progress from your glyph set. Are you sure you want to continue?'
export const RX_LETTERS = /[A-Za-z]/g
export const RX_NON_ALPHANUMERIC = /[^A-Za-z0-9\s]/g
export const RX_NUMBERS = /[0-9]/g
export const SUBMIT_ALERT =
  'You are about to remove some of the existing glyphs in your set. Are you sure you want to continue?'
export const WIKI_LINK = 'https://en.wikipedia.org/wiki/Susan_Kare'
export const UNITS_PER_EM = 1024

export const HELP_MESSAGE =
  'Edit the input field and click "Submit" to generate your own glyphset. Drag across ' +
  'the canvas to draw, or perform other operations by selecting one of the given tools. ' +
  "Use the gallery on the right to change to editing other glyphs. When you're done, " +
  'click "Export" to save your work to an OTF file!'

export const MOBILE_HELP_MESSAGE =
  'Edit the input field and click "Submit" to generate your own glyphset. Drag across ' +
  'the canvas to draw, or tap on the pencil icon to select another tool. You can also ' +
  'tap on the icon of the current glyph on the top right to view the gallery, where you ' +
  "can switch to editing other glyphs. When you're done, " +
  'click "Export" to save your work to an OTF file!'
