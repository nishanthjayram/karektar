// A canvas for drawing individual glyphs.

import { Dispatch, SetStateAction } from "react";
import Cell from "../Cell/Cell";

export type TCanvasState = boolean[];

const Canvas = (props: {
  canvasState: TCanvasState;
  setCanvasState: Dispatch<SetStateAction<TCanvasState>>;
}) => {
  const { canvasState, setCanvasState } = props;

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
        {canvasState.map((isFilled, index) => (
          <Cell
            filled={isFilled}
            toggleCell={() => {
              setCanvasState((oldCanvasState: TCanvasState) => {
                const newCanvasState = [...oldCanvasState];
                newCanvasState[index] = !newCanvasState[index];
                return newCanvasState;
              });
            }}
          />
        ))}
      </div>
    </>
  );
};

export default Canvas;
