import { Dispatch, SetStateAction } from "react";
import GlyphCell from "../GlyphCell/GlyphCell";
import styles from "./Glyph.module.scss";

export type TGlyphState = boolean[];

const Glyph = ({
  glyph,
  glyphCanvas,
  setCanvas,
  setActiveGlyph,
}: {
  glyph: string;
  glyphCanvas: boolean[];
  setCanvas: Dispatch<SetStateAction<boolean[]>>;
  setActiveGlyph: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className={styles.glyph}>
      <div className={styles.symbol}>{glyph}</div>
      <div
        className={styles.canvas}
        onClick={() => {
          setCanvas(glyphCanvas);
          setActiveGlyph(glyph);
        }}
      >
        {glyphCanvas.map((isFilled, index) => (
          <GlyphCell key={index} filled={isFilled} />
        ))}
      </div>
    </div>
  );
};

export default Glyph;
