import styles from "./Cell.module.scss";
import classnames from "classnames";
import { Dispatch, SetStateAction, useState } from "react";

const Cell = (props: {
  filled: boolean;
  toggleCell: () => void;
  mouseDownFlag: boolean;
}) => {
  const { filled, toggleCell, mouseDownFlag } = props;
  const [alreadyToggledFlag, setAlreadyToggledFlag] = useState(false);

  if (!mouseDownFlag && alreadyToggledFlag) setAlreadyToggledFlag(false);

  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell
      )}
      onMouseMove={() => {
        if (mouseDownFlag && !alreadyToggledFlag) {
          toggleCell();
          setAlreadyToggledFlag(true);
        }
      }}
    />
  );
};

export default Cell;
