import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { DropdownMenuIconTriggerButton } from '../shared'
import {
  DashDrawIcon,
  DashDottedIcon,
  DashSolidIcon,
  DashDashedIcon,
  dropdownContent,
  dropdownItem,
} from './styled'
import { useTLDrawContext } from '~hooks'
import { DashStyle, Data } from '~types'

const dashes = {
  [DashStyle.Draw]: <DashDrawIcon />,
  [DashStyle.Solid]: <DashSolidIcon />,
  [DashStyle.Dashed]: <DashDashedIcon />,
  [DashStyle.Dotted]: <DashDottedIcon />,
}

const selectDash = (s: Data) => s.appState.selectedStyle.dash

export const QuickDashSelect = React.memo((): JSX.Element => {
  const { tlstate, useSelector } = useTLDrawContext()

  const dash = useSelector(selectDash)

  const changeDashStyle = React.useCallback(
    (dash) => tlstate.style({ dash: dash as DashStyle }),
    [tlstate]
  )

  return (
    <DropdownMenu.Root dir="ltr">
      <DropdownMenuIconTriggerButton label="Dash">{dashes[dash]}</DropdownMenuIconTriggerButton>
      <DropdownMenu.Content sideOffset={8}>
        <DropdownMenu.DropdownMenuRadioGroup
          className={dropdownContent({ direction: 'vertical' })}
          value={dash}
          onValueChange={changeDashStyle}
        >
          {Object.keys(DashStyle).map((dashStyle: string) => (
            <DropdownMenu.DropdownMenuRadioItem
              className={dropdownItem({ isActive: dash === dashStyle })}
              key={dashStyle}
              value={dashStyle}
            >
              {dashes[dashStyle as DashStyle]}
            </DropdownMenu.DropdownMenuRadioItem>
          ))}
        </DropdownMenu.DropdownMenuRadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
})