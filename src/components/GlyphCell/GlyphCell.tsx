import styles from "./GlyphCell.module.scss";
import classnames from "classnames";

const GlyphCell = ({ filled }: { filled: boolean }) => {
  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell
      )}
    />
  );
};

export default GlyphCell;
