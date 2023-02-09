import styles from "./GlyphCell.module.scss";
import classnames from "classnames";

const GlyphCell = ({
  canvasSize,
  filled,
}: {
  canvasSize: number;
  filled: boolean;
}) => {
  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell
      )}
      style={{
        width: `${48 / canvasSize}px`,
        height: `${48 / canvasSize}px`,
      }}
    />
  );
};

export default GlyphCell;
