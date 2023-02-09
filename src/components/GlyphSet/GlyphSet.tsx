import styles from "./GlyphSet.module.scss";
import { Dispatch, SetStateAction } from "react";
import Glyph from "../Glyph/Glyph";

const GlyphSet = ({
  canvasSize,
  glyphSet,
  activeGlyph,
  setActiveGlyph,
}: {
  canvasSize: number;
  glyphSet: Map<string, boolean[]>;
  activeGlyph: string | undefined;
  setActiveGlyph: Dispatch<SetStateAction<string | undefined>>;
}) => {
  return (
    <div className={styles.glyphSet}>
      {[...glyphSet.entries()].map(([symbol, glyphCanvas]) => (
        <Glyph
          key={symbol}
          canvasSize={canvasSize}
          glyph={symbol}
          glyphCanvas={glyphCanvas}
          activeGlyph={activeGlyph}
          setActiveGlyph={setActiveGlyph}
        />
      ))}
    </div>
  );
};

export default GlyphSet;
