import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons'
import {
  faEraser,
  faFill,
  faGear,
  faPen,
  faShapes,
  faSlash,
} from '@fortawesome/free-solid-svg-icons'
import { TMenuHeader, TTool } from '.@/.@/types'

export const GLYPH_TEXT_WIDTH = 30
export const GRIDLINE_COLOR = '#ffffff'
export const GUIDELINE_COLOR = '#ffa500'
export const EMPTY_CELL = '#efefef'
export const FILLED_CELL = '#2b2b2b'

export const DRAW_TOOLS: TTool[] = [
  {
    type: 'tool',
    label: 'DRAW',
    icon: faPen,
  },
  {
    type: 'tool',
    label: 'ERASE',
    icon: faEraser,
  },
  {
    type: 'tool',
    label: 'FILL',
    icon: faFill,
  },
]

export const SHAPE_TOOLS: TTool[] = [
  {
    type: 'tool',
    label: 'LINE',
    icon: faSlash,
  },
  {
    type: 'tool',
    label: 'RECTANGLE',
    icon: faSquare,
  },
  {
    type: 'tool',
    label: 'ELLIPSE',
    icon: faCircle,
  },
]

export const SHAPES_MENU_HEADER: TMenuHeader = {
  defaultLabel: 'SHAPES',
  defaultIcon: faShapes,
}

export const OPTIONS_MENU_HEADER: TMenuHeader = {
  defaultLabel: 'OPTIONS',
  defaultIcon: faGear,
}
