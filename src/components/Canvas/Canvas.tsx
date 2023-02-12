// A canvas for drawing individual glyphs.

import {Dispatch, SetStateAction, useState} from 'react'
import styles from './Canvas.module.scss'
import Cell from '../Cell/Cell'

export type TCanvasState = boolean[] | undefined;

const Canvas = ({
  glyphSet,
  setGlyphSet,
  activeGlyph,
}: {
  glyphSet: Map<string, boolean[]>;
  setGlyphSet: Dispatch<SetStateAction<Map<string, boolean[]>>>;
  activeGlyph: string;
}) => {
  const [mouseDownFlag, setMouseDownFlag] = useState(false)
  const [drawFlag, setDrawFlag] = useState(true)

  const canvas = glyphSet.get(activeGlyph);

  if (canvas)
    return (
      <>
        <div
          className={styles.canvas}
          onMouseOver={(e) => {
            if (e.buttons === 1) setMouseDownFlag(true);
          }}
          onMouseLeave={() => setMouseDownFlag(false)}
        >
          {canvas.map((isFilled, index) => (
            <Cell
              key={index}
              filled={isFilled}
              toggleCell={() => {
                setGlyphSet((oldGlyphSet) => {
                  const newGlyphSet = new Map(oldGlyphSet);
                  const newCanvas = [...canvas];
                  newCanvas[index] = !canvas[index];
                  newGlyphSet.set(activeGlyph, newCanvas);
                  return newGlyphSet;
                });
              }}
              mouseDownFlag={mouseDownFlag}
              setMouseDownFlag={setMouseDownFlag}
              drawFlag={drawFlag}
              setDrawFlag={setDrawFlag}
            />
          ))}
        </div>
      </>
    );
  else return <div />;
};

export default Canvas
