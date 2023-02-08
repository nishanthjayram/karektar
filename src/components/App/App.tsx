import { useEffect, useMemo, useState } from "react";
import {
  RX_LETTERS,
  RX_NUMBERS,
  RX_NON_ALPHANUMERIC,
} from "../../constants/regex";
import Canvas from "../Canvas/Canvas";
import GlyphSet from "../GlyphSet/GlyphSet";
import "./App.css";

const App = ({ canvasSize }: { canvasSize: number }) => {
  const [inputText, setInputText] = useState("");
  const [query, setQuery] = useState("");
  const [glyphSet, setGlyphSet] = useState(() => new Map<string, boolean[]>());
  const [canvas, setCanvas] = useState(new Array<boolean>());

  const symbolSet = useMemo(() => getUniqueCharacters(query), [query.length]);
  const [activeGlyph, setActiveGlyph] = useState(symbolSet[0]);

  useEffect(() => {
    setGlyphSet((oldGlyphSet) => {
      const newGlyphSet = new Map<string, boolean[]>();
      symbolSet.forEach((symbol) => {
        if (!oldGlyphSet.has(symbol)) {
          newGlyphSet.set(symbol, new Array(canvasSize ** 2).fill(false));
        } else {
          newGlyphSet.set(symbol, oldGlyphSet.get(symbol)!);
        }
      });
      return newGlyphSet;
    });
  }, [symbolSet.length]);

  return (
    <>
      <h1>Karektar</h1>
      <div>
        <label htmlFor="queryField">Enter prompt: </label>
        <input
          type="text"
          id="queryField"
          name="queryField"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button onClick={() => setQuery(inputText)}>Submit</button>
        <button
          onClick={() => {
            setInputText("");
            setQuery("");
            setCanvas([]!);
          }}
        >
          Clear
        </button>
      </div>
      <br />
      <div className="App">
        <Canvas
          canvas={canvas}
          setCanvas={setCanvas}
          activeGlyph={activeGlyph}
          toggleGlyph={() => {
            setGlyphSet((oldGlyphSet) => {
              const newGlyphSet = new Map(oldGlyphSet);
              newGlyphSet.set(activeGlyph, canvas);
              return newGlyphSet;
            });
          }}
        />
        <GlyphSet
          glyphSet={glyphSet}
          canvas={canvas}
          setCanvas={setCanvas}
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
