import styles from "./GlyphSet.module.scss";
import { Dispatch, SetStateAction } from "react";
import Glyph from "../Glyph/Glyph";

const GlyphSet = ({
  glyphSet,
  canvas,
  setCanvas,
  activeGlyph,
  setActiveGlyph,
}: {
  glyphSet: Map<string, boolean[]>;
  canvas: boolean[];
  setCanvas: Dispatch<SetStateAction<boolean[]>>;
  activeGlyph: string;
  setActiveGlyph: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className={styles.glyphSet}>
      {[...glyphSet.keys()].map((symbol, index) => (
        <Glyph
          key={index}
          glyph={symbol}
          glyphCanvas={symbol == activeGlyph ? canvas : glyphSet.get(symbol)!}
          setCanvas={setCanvas}
          setActiveGlyph={setActiveGlyph}
        />
      ))}
    </div>
  );
};

export default GlyphSet;
