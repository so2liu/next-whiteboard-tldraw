import Vec from '@tldraw/vec'
import Utils from '~../../core/src/utils'
import { TLDrawState } from '~state'
import { mockDocument } from '~test'
import { TLDrawStatus } from '~types'

describe('Rotate session', () => {
  const tlstate = new TLDrawState()

  it('begins, updates and completes session', () => {
    tlstate.loadDocument(mockDocument)

    expect(tlstate.getShape('rect1').rotation).toBe(undefined)

    tlstate
      .select('rect1')
      .startTransformSession([50, 0], 'rotate')
      .updateTransformSession([100, 50])

    expect(tlstate.getShape('rect1').rotation).toBe(Math.PI / 2)

    tlstate.updateTransformSession([50, 100])

    expect(tlstate.getShape('rect1').rotation).toBe(Math.PI)

    tlstate.updateTransformSession([0, 50])

    expect(tlstate.getShape('rect1').rotation).toBe((Math.PI * 3) / 2)

    tlstate.updateTransformSession([50, 0])

    expect(tlstate.getShape('rect1').rotation).toBe(0)

    tlstate.updateTransformSession([0, 50])

    expect(tlstate.getShape('rect1').rotation).toBe((Math.PI * 3) / 2)

    tlstate.completeSession()

    expect(tlstate.appState.status.current).toBe(TLDrawStatus.Idle)

    tlstate.undo()

    expect(tlstate.getShape('rect1').rotation).toBe(undefined)

    tlstate.redo()

    expect(tlstate.getShape('rect1').rotation).toBe((Math.PI * 3) / 2)
  })

  it('cancels session', () => {
    tlstate
      .loadDocument(mockDocument)
      .select('rect1')
      .startTransformSession([50, 0], 'rotate')
      .updateTransformSession([100, 50])
      .cancel()

    expect(tlstate.getShape('rect1').point).toStrictEqual([0, 0])
  })

  it.todo('rotates handles only on shapes with handles')

  describe('when rotating multiple shapes', () => {
    it('keeps the center', () => {
      tlstate.loadDocument(mockDocument).select('rect1', 'rect2')

      const centerBefore = Vec.round(
        Utils.getBoundsCenter(
          Utils.getCommonBounds(tlstate.selectedIds.map((id) => tlstate.getShapeBounds(id)))
        )
      )

      tlstate.startTransformSession([50, 0], 'rotate').updateTransformSession([100, 50])

      const centerAfter = Vec.round(
        Utils.getBoundsCenter(
          Utils.getCommonBounds(tlstate.selectedIds.map((id) => tlstate.getShapeBounds(id)))
        )
      )

      expect(tlstate.getShape('rect1').rotation)
      expect(centerBefore).toStrictEqual(centerAfter)
    })
  })
})