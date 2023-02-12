import { Dispatch, SetStateAction, useState, useMemo } from "react";
import { ReactComponent as Previous } from "../../assets/previous.svg";
import { ReactComponent as Next } from "../../assets/next.svg";
import { PAGE_LENGTH } from "../../constants";
import Glyph from "../Glyph/Glyph";
import styles from "./GlyphSet.module.scss";
import classnames from "classnames";

const GlyphSet = ({
  canvasSize,
  glyphSet,
  activeGlyph,
  setActiveGlyph,
}: {
  canvasSize: number;
  glyphSet: Map<string, boolean[]>;
  activeGlyph: string | undefined;
  setActiveGlyph: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const [page, setPage] = useState(0);
  const minPage = 0;
  const maxPage = Math.floor(glyphSet.size / PAGE_LENGTH);

  return (
    <div className={styles.glyphSet}>
      <div className={styles.navBar}>
        <div className={styles.page}>{`${page + 1}/${maxPage + 1}`}</div>
        <div className={styles.navControls}>
          <Previous
            className={classnames(
              page === minPage && styles.navButtonDisabled,
              styles.navButton
            )}
            onClick={() => {
              if (page > minPage) setPage(page - 1);
            }}
          />
          <Next
            className={classnames(
              page === maxPage && styles.navButtonDisabled,
              styles.navButton
            )}
            onClick={() => {
              if (page < maxPage) setPage(page + 1);
            }}
          />
        </div>
      </div>
      <div className={styles.gallery}>
        {[...glyphSet.entries()]
          .slice(page * PAGE_LENGTH, page * PAGE_LENGTH + PAGE_LENGTH)
          .map(([symbol, glyphCanvas]) => (
            <Glyph
              key={symbol}
              canvasSize={canvasSize}
              glyph={symbol}
              glyphCanvas={glyphCanvas}
              active={activeGlyph === symbol}
              setActiveGlyph={setActiveGlyph}
            />
          ))}
      </div>
    </div>
  );
};

export default GlyphSet;
