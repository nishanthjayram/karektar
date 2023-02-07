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
  const [rawText, setRawText] = useState("");
  const [glyphSet, setGlyphSet] = useState(() => new Map<string, boolean[]>());
  const symbolSet = useMemo(
    () => getUniqueCharacters(rawText),
    [rawText.length]
  );
  const [activeGlyph, setActiveGlyph] = useState(symbolSet[0]);
  const [canvas, setCanvas] = useState([] as boolean[]);

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

  // TODO: Implement popup in form to confirm if the user really wants to clear everything.
  return (
    <>
      <h1>Karektar</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setRawText(inputText);
        }}
        onReset={() => {
          setRawText("");
          setGlyphSet((glyphSet) => {
            glyphSet.clear();
            return glyphSet;
          });
          setCanvas((canvas) => {
            canvas = [];
            return canvas;
          });
        }}
      >
        <label htmlFor="inputField">Enter input string: </label>
        <input
          id="inputField"
          type="text"
          name="inputField"
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setInputText(target.value);
          }}
        />
        <button type="submit">Submit</button>
        <button type="reset">Clear</button>
      </form>
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
