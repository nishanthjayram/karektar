// A canvas for drawing individual glyphs.

import styles from "./Canvas.module.scss";
import { Dispatch, SetStateAction, useState } from "react";
import Cell from "../Cell/Cell";

export type TCanvasState = boolean[];

const Canvas = (props: {
  canvas: TCanvasState;
  setCanvas: Dispatch<SetStateAction<TCanvasState>>;
}) => {
  const { canvas, setCanvas } = props;
  const [mouseDownFlag, setMouseDownFlag] = useState(false);

  return (
    <>
      <div
        className={styles.canvas}
        onMouseDown={() => setMouseDownFlag(true)}
        onMouseUp={() => setMouseDownFlag(false)}
        onMouseLeave={() => setMouseDownFlag(false)}
      >
        {canvas.map((isFilled, index) => (
          <Cell
            filled={isFilled}
            toggleCell={() => {
              setCanvas((oldCanvas: TCanvasState) => {
                const newCanvas = [...oldCanvas];
                newCanvas[index] = !oldCanvas[index];
                return newCanvas;
              });
            }}
            mouseDownFlag={mouseDownFlag}
          />
        ))}
      </div>
    </>
  );
};

export default Canvas;
