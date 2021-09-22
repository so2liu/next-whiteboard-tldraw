/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from 'react'
import { useShapeEvents } from '+hooks'
import type { IShapeTreeNode, TLShape, TLShapeUtil } from '+types'
import { RenderedShape } from './rendered-shape'
import { Container } from '+components/container'
import { useTLContext } from '+hooks'
import { useForceUpdate } from '+hooks/useForceUpdate'

interface ShapeProps<T extends TLShape, E extends Element, M> extends IShapeTreeNode<T, M> {
  utils: TLShapeUtil<T, E, M>
}

export const Shape = React.memo(
  <T extends TLShape, E extends Element, M>({
    shape,
    utils,
    isEditing,
    isBinding,
    isHovered,
    isSelected,
    isCurrentParent,
    meta,
  }: ShapeProps<T, E, M>) => {
    const { callbacks } = useTLContext()
    const bounds = utils.getBounds(shape)
    const events = useShapeEvents(shape.id, isCurrentParent)

    useForceUpdate()

    return (
      <Container id={shape.id} className="tl-shape" bounds={bounds} rotation={shape.rotation}>
        <RenderedShape
          shape={shape}
          isBinding={isBinding}
          isCurrentParent={isCurrentParent}
          isEditing={isEditing}
          isHovered={isHovered}
          isSelected={isSelected}
          utils={utils as any}
          meta={meta}
          events={events}
          onShapeChange={callbacks.onShapeChange}
        />
      </Container>
    )
  }
)