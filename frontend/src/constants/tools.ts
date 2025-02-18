import { Circle, Eraser, PaintBucket, Pen, Slash, Square } from 'lucide-react'
import type { TTool } from '@/types/common'

type TToolInfo = {
  icon: typeof Pen
  label: string
  shortcut?: string
  cursor?: string
}

type TToolRecord = Record<TTool, TToolInfo>

export const tools: TToolRecord = {
  pen: {
    icon: Pen,
    label: 'Pen Tool',
    shortcut: 'P',
    cursor: 'crosshair',
  },
  eraser: {
    icon: Eraser,
    label: 'Eraser',
    shortcut: 'E',
    cursor: 'crosshair',
  },
  line: {
    icon: Slash,
    label: 'Line',
    shortcut: 'L',
    cursor: 'crosshair',
  },
  rectangle: {
    icon: Square,
    label: 'Rectangle',
    shortcut: 'R',
    cursor: 'crosshair',
  },
  ellipse: {
    icon: Circle,
    label: 'Ellipse',
    shortcut: 'E',
    cursor: 'crosshair',
  },
  fill: {
    icon: PaintBucket,
    label: 'Fill Tool',
    shortcut: 'F',
    cursor: 'pointer',
  },
}
