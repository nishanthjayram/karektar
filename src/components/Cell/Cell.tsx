import styles from "./Cell.module.scss";
import classnames from "classnames";
import { Dispatch, SetStateAction, useState } from "react";

const Cell = (props: {
  filled: boolean;
  toggleCell: () => void;
  mouseDownFlag: boolean;
  setMouseDownFlag: Dispatch<SetStateAction<boolean>>;
  drawFlag: boolean;
  setDrawFlag: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    filled,
    toggleCell,
    mouseDownFlag,
    setMouseDownFlag,
    drawFlag,
    setDrawFlag,
  } = props;
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
        if (e.button != 0) return;
        setMouseDownFlag(true);
        setDrawFlag(!filled ? true : false);
        updateCell();
      }}
      onMouseUp={() => {
        setMouseDownFlag(false);
        setDrawFlag(true);
      }}
      onMouseMove={(e) => {
        if (mouseDownFlag && drawFlag != filled && !alreadyToggledFlag) {
          updateCell();
        }
      }}
    />
  );
};

export default Cell;
