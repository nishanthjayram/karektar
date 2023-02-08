import { useEffect, useMemo, useState } from "react";
import {
  RX_LETTERS,
  RX_NUMBERS,
  RX_NON_ALPHANUMERIC,
} from "../../constants/regex";
import Canvas from "../Canvas/Canvas";
import GlyphSet from "../GlyphSet/GlyphSet";
import styles from "./App.module.scss";

const DEFAULT_PROMPT = "sphinx of black quartz, judge my vow";

const App = ({ canvasSize }: { canvasSize: number }) => {
  const [inputText, setInputText] = useState(DEFAULT_PROMPT);
  const [query, setQuery] = useState(DEFAULT_PROMPT);
  const [glyphSet, setGlyphSet] = useState(() => new Map<string, boolean[]>());
  const symbolSet = useMemo(() => getUniqueCharacters(query), [query.length]);
  const [activeGlyph, setActiveGlyph] = useState(symbolSet[0]);

  useEffect(() => {
    setGlyphSet((oldGlyphSet) => {
      const newGlyphSet = new Map<string, boolean[]>();
      symbolSet.forEach((symbol) =>
        newGlyphSet.set(
          symbol,
          oldGlyphSet.get(symbol) ?? new Array(canvasSize ** 2).fill(false)
        )
      );
      return newGlyphSet;
    });
  }, [symbolSet.length]);

  return (
    <>
      <h1>Karektar</h1>
      <div>
        <textarea
          id="queryField"
          name="queryField"
          value={inputText}
          placeholder={"Enter prompt"}
          onChange={(e) => setInputText(e.target.value)}
          className={styles.input}
        />
        <div className={styles.buttonRow}>
          <button onClick={() => setQuery(inputText)}>Submit</button>
          <button
            onClick={() => {
              setInputText("");
              setQuery("");
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <br />
      <div className="App">
        <Canvas
          glyphSet={glyphSet}
          setGlyphSet={setGlyphSet}
          activeGlyph={activeGlyph}
        />
        <GlyphSet
          glyphSet={glyphSet}
          activeGlyph={activeGlyph}
          setActiveGlyph={setActiveGlyph}
        />
      </div>
    </>
  );
};

const getUniqueCharacters = (input: string) => {
  const uniqueCharacters = [...new Set<string>(input)];

  const letters = uniqueCharacters.flatMap((c) => c.match(RX_LETTERS) ?? []);
  const numbers = uniqueCharacters.flatMap((c) => c.match(RX_NUMBERS) ?? []);
  const nonAlphaNum = uniqueCharacters.flatMap(
    (c) => c.match(RX_NON_ALPHANUMERIC) ?? []
  );

  return [letters, numbers, nonAlphaNum].flatMap((c) => c.sort());
};

export default App;
