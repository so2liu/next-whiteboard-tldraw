import type { TLPointerEventHandler } from '@tldraw/core'
import { Utils } from '@tldraw/core'
import Vec from '@tldraw/vec'
import { Code } from '~state/shapes'
import { BaseTool, Status } from '~state/tools/BaseTool'
import { SessionType, TDShapeType } from '~types'

export class CodeTool extends BaseTool {
  type = TDShapeType.Code as const

  shapeId?: string

  /* ----------------- Event Handlers ----------------- */

  onPointerDown: TLPointerEventHandler = () => {
    if (this.app.readOnly) return
    if (this.status === Status.Creating) {
      this.setStatus(Status.Idle)

      if (!this.app.appState.isToolLocked) {
        this.app.selectTool('select')
      }

      return
    }

    if (this.status === Status.Idle) {
      const {
        currentPoint,
        currentGrid,
        settings: { showGrid },
        appState: { currentPageId, currentStyle },
      } = this.app

      const childIndex = this.getNextChildIndex()

      const id = Utils.uniqueId()

      this.shapeId = id

      const newShape = Code.create({
        id,
        parentId: currentPageId,
        childIndex,
        point: showGrid ? Vec.snap(currentPoint, currentGrid) : currentPoint,
        style: { ...currentStyle },
      })

      const bounds = Code.getBounds(newShape)

      newShape.point = Vec.sub(newShape.point, [bounds.width / 2, bounds.height / 2])

      this.app.patchCreate([newShape])

      this.app.startSession(SessionType.Translate)

      this.setStatus(Status.Creating)
    }
  }

  onPointerUp: TLPointerEventHandler = () => {
    if (this.app.readOnly) return
    if (this.status === Status.Creating) {
      this.setStatus(Status.Idle)
      this.app.completeSession()
      this.app.selectTool('select')
      this.app.setEditingId(this.shapeId)
    }
  }
}
