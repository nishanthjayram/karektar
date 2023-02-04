// A canvas for drawing individual glyphs.

import styles from "./Canvas.module.scss";
import { Dispatch, SetStateAction, useState } from "react";
import Cell from "../Cell/Cell";

export type TCanvasState = boolean[];

const Canvas = ({
  canvas,
  setCanvas,
}: {
  canvas: TCanvasState;
  setCanvas: Dispatch<SetStateAction<TCanvasState>>;
}) => {
  const [mouseDownFlag, setMouseDownFlag] = useState(false);
  const [drawFlag, setDrawFlag] = useState(true);

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
              setCanvas((oldCanvas: TCanvasState) => {
                const newCanvas = [...oldCanvas];
                newCanvas[index] = !oldCanvas[index];
                return newCanvas;
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
};

export default Canvas;
