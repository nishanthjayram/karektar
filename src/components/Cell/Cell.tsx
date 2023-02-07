import styles from "./Cell.module.scss";
import classnames from "classnames";
import { Dispatch, SetStateAction, useState } from "react";

const Cell = ({
  filled,
  toggleCell,
  toggleGlyph,
  mouseDownFlag,
  setMouseDownFlag,
  drawFlag,
  setDrawFlag,
}: {
  filled: boolean;
  toggleCell: () => void;
  toggleGlyph: () => void;
  mouseDownFlag: boolean;
  setMouseDownFlag: Dispatch<SetStateAction<boolean>>;
  drawFlag: boolean;
  setDrawFlag: Dispatch<SetStateAction<boolean>>;
}) => {
  const [alreadyToggledFlag, setAlreadyToggledFlag] = useState(false);

  if (!mouseDownFlag && alreadyToggledFlag) setAlreadyToggledFlag(false);

  const updateCell = () => {
    toggleCell();
    setAlreadyToggledFlag(true);
  };

  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell
      )}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        setMouseDownFlag(true);
        setDrawFlag(!filled);
        updateCell();
      }}
      onMouseUp={() => {
        setMouseDownFlag(false);
        setDrawFlag(true);
        toggleGlyph();
      }}
      onMouseMove={(e) => {
        if (mouseDownFlag && drawFlag !== filled && !alreadyToggledFlag) {
          updateCell();
        }
      }}
    />
  );
};

export default Cell;
