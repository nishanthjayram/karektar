import { memo } from "react";
import { Dispatch, SetStateAction } from "react";
import GlyphCell from "../GlyphCell/GlyphCell";
import classnames from "classnames";
import styles from "./Glyph.module.scss";

export type TGlyphState = boolean[];

const Glyph = ({
  canvasSize,
  glyph,
  glyphCanvas,
  activeGlyph,
  setActiveGlyph,
}: {
  canvasSize: number;
  glyph: string;
  glyphCanvas: boolean[];
  activeGlyph: string | undefined;
  setActiveGlyph: Dispatch<SetStateAction<string | undefined>>;
}) => {
  return (
    <div className={styles.glyph}>
      <div className={styles.symbol}>{glyph}</div>
      <div className={styles.canvas} onClick={() => setActiveGlyph(glyph)}>
        {glyphCanvas.map((isFilled, index) => (
          <GlyphCell key={index} canvasSize={canvasSize} filled={isFilled} />
        ))}
      </div>
    </div>
  );
};

export default memo(Glyph, (prevProps, nextProps) =>
  prevProps.glyphCanvas.every(
    (value, index) => value === nextProps.glyphCanvas[index]
  )
);
