import styles from "./Cell.module.scss";
import classnames from "classnames";

const Cell = (props: { filled: boolean; toggleCell: () => void }) => {
  const { filled, toggleCell } = props;

  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell
      )}
      onClick={toggleCell}
    />
  );
};

export default Cell;
