// A canvas for drawing individual glyphs.

import { Dispatch, SetStateAction } from "react";
import Cell from "../Cell/Cell";

export type TCanvasState = boolean[];

const Canvas = (props: {
  canvas: TCanvasState;
  setCanvas: Dispatch<SetStateAction<TCanvasState>>;
}) => {
  const { canvas, setCanvas } = props;

  return (
    <>
      <div
        style={{
          width: "400px",
          height: "400px",
          display: "flex",
          flexFlow: "row wrap",
          borderColor: "black",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
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
          />
        ))}
      </div>
    </>
  );
};

export default Canvas;
