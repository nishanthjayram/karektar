// A canvas for drawing individual glyphs.
import {Dispatch, SetStateAction, useState} from 'react'
import styles from './Canvas.module.scss'
import {ReactComponent as Delete} from '../../assets/delete.svg'
import Cell from '../Cell/Cell'

const Canvas = ({
  canvasSize,
  glyphSet,
  setGlyphSet,
  activeGlyph,
}: {
  canvasSize: number
  glyphSet: Map<string, boolean[]>
  setGlyphSet: Dispatch<SetStateAction<Map<string, boolean[]>>>
  activeGlyph: string | undefined
}) => {
  const [mouseDownFlag, setMouseDownFlag] = useState(false)
  const [drawFlag, setDrawFlag] = useState(true)

  const canvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined

  if (canvas) {
    return (
      <div>
        <div className={styles.header}>
          <div className={styles.text}>{activeGlyph}</div>
          <div className={styles.separator} />
          <Delete
            className={styles.deleteIcon}
            onClick={() =>
              setGlyphSet(oldGlyphSet => {
                const newGlyphSet = new Map(oldGlyphSet)
                const newCanvas = new Array<boolean>(canvasSize ** 2).fill(false)
                if (activeGlyph) {
                  newGlyphSet.set(activeGlyph, newCanvas)
                }
                return newGlyphSet
              })
            }
          />
        </div>
        <div
          className={styles.canvas}
          onMouseOver={e => {
            if (e.buttons === 1) {
              setMouseDownFlag(true)
            }
          }}
          onMouseLeave={() => setMouseDownFlag(false)}
        >
          {canvas.map((isFilled, index) => (
            <Cell
              key={index}
              canvasSize={canvasSize}
              filled={isFilled}
              toggleCell={() => {
                setGlyphSet(oldGlyphSet => {
                  const newGlyphSet = new Map(oldGlyphSet)
                  const newCanvas = [...canvas]
                  newCanvas[index] = !canvas[index]
                  if (activeGlyph) {
                    newGlyphSet.set(activeGlyph, newCanvas)
                  }
                  return newGlyphSet
                })
              }}
              mouseDownFlag={mouseDownFlag}
              setMouseDownFlag={setMouseDownFlag}
              drawFlag={drawFlag}
              setDrawFlag={setDrawFlag}
            />
          ))}
        </div>
      </div>
    )
  }
  return <div />
}

export default Canvas
