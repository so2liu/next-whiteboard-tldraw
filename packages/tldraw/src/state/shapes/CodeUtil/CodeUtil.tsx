import { HTMLContainer, TLBounds, Utils } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import * as React from 'react'
import { stopPropagation } from '~components/stopPropagation'
import { GHOSTED_OPACITY, LETTER_SPACING } from '~constants'
import { TLDR } from '~state/TLDR'
import { TDShapeUtil } from '~state/shapes/TDShapeUtil'
import {
  TextAreaUtils,
  defaultTextStyle,
  getBoundsRectangle,
  getFontFace,
  getStickyFontSize,
  getStickyFontStyle,
  getStickyShapeStyle,
  getTextSvgElement,
} from '~state/shapes/shared'
import { styled } from '~styles'
import { Drawer, Button } from 'antd'
import { AlignStyle, CodeShape, TDMeta, TDShapeType, TransformInfo } from '~types'
import Editor from "./editor";
import './index.css';

type T = CodeShape
type E = HTMLDivElement

export class CodeUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Code as const

  canBind = true

  canEdit = true

  canClone = true

  hideResizeHandles = true

  showCloneHandles = true

  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'id',
        type: TDShapeType.Code,
        name: 'Code',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        size: [200, 100],
		text: 'javascript',
        data: {
			lang: 'javascript',
			code: '',
			result: []
		},
        rotation: 0,
        style: defaultTextStyle,
      },
      props
    )
  }

  Component = TDShapeUtil.Component<T, E, TDMeta>(
    ({ shape, meta, events, isGhost, isBinding, isEditing, isSelected, onShapeChange }, ref) => {
		const font = getStickyFontStyle(shape.style)
      const { color, fill } = getStickyShapeStyle(shape.style, meta.isDarkMode)

      const rContainer = React.useRef<HTMLDivElement>(null)

      const rText = React.useRef<HTMLDivElement>(null)

      const [open, setOpen] = React.useState(false);

	const [startTime, setStartTime] = React.useState(0);

      const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
		console.log(isSelected)
		setOpen(true)
        e.stopPropagation()
      }, [])

	//   const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
	// 	console.log(e)
	// 	console.log('click2', e.timeStamp);
	// 	if(e.timeStamp - startTime > 2000) {
	// 		console.log(e.timeStamp - startTime)
	// 		console.log('drag')
	// 		events.onPointerDown(e)
	// 	} else {
	// 		console.log('open')
	// 		setOpen(true)
	// 	}
    //     e.stopPropagation()
    //   }, [])

      const onChange = React.useCallback(
        (lang: string, code: string | undefined, result: string[]) => {
          onShapeChange?.({
            id: shape.id,
            type: shape.type,
			text: lang,
            data: {
				lang, code, result
			},
          })
        },
        [shape.id]
      )

      const style = {
        font,
        color,
        textShadow: meta.isDarkMode
          ? `0.5px 0.5px 2px rgba(255, 255, 255,.25)`
          : `0.5px 0.5px 2px rgba(255, 255, 255,.5)`,
      }

      const handleTextChange = React.useCallback(
        (lang: string, code: string | undefined, result: string[]) => {
          onChange(lang, code, result)
        },
        [onShapeChange, onChange]
      )

		const onClose = () => {
			setOpen(false);
		};

		const textClick = (e: any) => {
			console.log('aaa');
			e.stopPropagation()
		}
      return (
		<>
        <HTMLContainer ref={ref} {...events}>
          <StyledStickyContainer
            ref={rContainer}
            isDarkMode={meta.isDarkMode}
            isGhost={isGhost}
            style={{ backgroundColor: 'rgba(241,148,138,0.5)', ...style }}
          >
			<div style={{width: '200px', backgroundColor: '#000'}}></div>
            {isBinding && (
              <div
                className="tl-binding-indicator"
                style={{
                  position: 'absolute',
                  top: -this.bindingDistance,
                  left: -this.bindingDistance,
                  width: `calc(100% + ${this.bindingDistance * 2}px)`,
                  height: `calc(100% + ${this.bindingDistance * 2}px)`,
                  backgroundColor: 'var(--tl-selectFill)',
                }}
              />
            )}
            <StyledText ref={rText} isEditing={isEditing} alignment={shape.style.textAlign}>
              {shape.text}&#8203;
            </StyledText>
			{/* <Button>编辑</Button>
			<Drawer className='editor-drawer' title="代码编辑器" width={1000} placement="right" onClose={onClose} open={open}>
				<Editor onChange={handleTextChange} data={shape.data}/>
			</Drawer> */}
          </StyledStickyContainer>
        </HTMLContainer>
		</>
      )
    }
  )

  Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
    const {
      size: [width, height],
    } = shape

    return (
      <rect x={0} y={0} rx={3} ry={3} width={Math.max(1, width)} height={Math.max(1, height)} />
    )
  })

  getBounds = (shape: T) => {
    return getBoundsRectangle(shape, this.boundsCache)
  }

  shouldRender = (prev: T, next: T) => {
    return next.size !== prev.size || next.style !== prev.style || next.text !== prev.text
  }

  transform = (
    shape: T,
    bounds: TLBounds,
    { scaleX, scaleY, transformOrigin }: TransformInfo<T>
  ): Partial<T> => {
    const point = Vec.toFixed([
      bounds.minX +
        (bounds.width - shape.size[0]) * (scaleX < 0 ? 1 - transformOrigin[0] : transformOrigin[0]),
      bounds.minY +
        (bounds.height - shape.size[1]) *
          (scaleY < 0 ? 1 - transformOrigin[1] : transformOrigin[1]),
    ])

    return {
      point,
    }
  }

  transformSingle = (shape: T): Partial<T> => {
    return shape
  }

  getSvgElement = (shape: T, isDarkMode: boolean): SVGElement | void => {
    const bounds = this.getBounds(shape)

    const style = getStickyShapeStyle(shape.style, isDarkMode)

    const fontSize = getStickyFontSize(shape.style.size) * (shape.style.scale ?? 1)
    const fontFamily = getFontFace(shape.style.font).slice(1, -1)
    const textAlign = shape.style.textAlign ?? AlignStyle.Start

    const textElm = getTextSvgElement(
      shape.text,
      fontSize,
      fontFamily,
      textAlign,
      bounds.width - PADDING * 2,
      true
    )

    textElm.setAttribute('fill', style.color)
    textElm.setAttribute('transform', `translate(${PADDING}, ${PADDING})`)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', bounds.width + '')
    rect.setAttribute('height', bounds.height + '')
    rect.setAttribute('fill', style.fill)
    rect.setAttribute('rx', '3')
    rect.setAttribute('ry', '3')

    g.appendChild(rect)
    g.appendChild(textElm)

    return g
  }
}

/* -------------------------------------------------- */
/*                       Helpers                      */
/* -------------------------------------------------- */

const PADDING = 16
const MIN_CONTAINER_HEIGHT = 200

const StyledStickyContainer = styled('div', {
  pointerEvents: 'all',
  position: 'relative',
  backgroundColor: 'rgba(255, 220, 100)',
  fontFamily: 'sans-serif',
  height: '100%',
  width: '100%',
  padding: PADDING + 'px',
  borderRadius: '3px',
  perspective: '800px',
  variants: {
    isGhost: {
      false: { opacity: 1 },
      true: { transition: 'opacity .2s', opacity: GHOSTED_OPACITY },
    },
    isDarkMode: {
      true: {
        boxShadow:
          '2px 3px 12px -2px rgba(0,0,0,.3), 1px 1px 4px rgba(0,0,0,.3), 1px 1px 2px rgba(0,0,0,.3)',
      },
      false: {
        boxShadow:
          '2px 3px 12px -2px rgba(0,0,0,.2), 1px 1px 4px rgba(0,0,0,.16),  1px 1px 2px rgba(0,0,0,.16)',
      },
    },
  },
})

const commonTextWrapping = {
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  letterSpacing: LETTER_SPACING,
}

const StyledText = styled('div', {
  position: 'absolute',
  top: PADDING,
  left: PADDING,
  width: `calc(100% - ${PADDING * 2}px)`,
  height: 'fit-content',
  font: 'inherit',
  pointerEvents: 'none',
  userSelect: 'none',
  variants: {
    isEditing: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 1,
      },
    },
    alignment: {
      [AlignStyle.Start]: {
        textAlign: 'left',
      },
      [AlignStyle.Middle]: {
        textAlign: 'center',
      },
      [AlignStyle.End]: {
        textAlign: 'right',
      },
      [AlignStyle.Justify]: {
        textAlign: 'justify',
      },
    },
  },
  ...commonTextWrapping,
})

const StyledTextArea = styled('textarea', {
  width: '100%',
  height: '100%',
  border: 'none',
  overflow: 'hidden',
  background: 'none',
  outline: 'none',
  textAlign: 'left',
  font: 'inherit',
  padding: 0,
  color: 'transparent',
  verticalAlign: 'top',
  resize: 'none',
  caretColor: 'black',
  ...commonTextWrapping,
  variants: {
    alignment: {
      [AlignStyle.Start]: {
        textAlign: 'left',
      },
      [AlignStyle.Middle]: {
        textAlign: 'center',
      },
      [AlignStyle.End]: {
        textAlign: 'right',
      },
      [AlignStyle.Justify]: {
        textAlign: 'justify',
      },
    },
  },
  '&:focus': {
    outline: 'none',
    border: 'none',
  },
})
