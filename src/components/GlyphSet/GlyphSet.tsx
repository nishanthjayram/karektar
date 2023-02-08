import styles from "./GlyphSet.module.scss";
import { Dispatch, SetStateAction } from "react";
import Glyph from "../Glyph/Glyph";

const GlyphSet = ({
  glyphSet,
  setActiveGlyph,
}: {
  glyphSet: Map<string, boolean[]>;
  setActiveGlyph: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className={styles.glyphSet}>
      {[...glyphSet.entries()].map(([symbol, glyphCanvas]) => (
        <Glyph
          key={symbol}
          glyph={symbol}
          glyphCanvas={glyphCanvas}
          setActiveGlyph={setActiveGlyph}
        />
      ))}
    </div>
  );
};

export default GlyphSet;
