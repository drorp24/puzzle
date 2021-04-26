import { useEffect, memo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocale } from '../utility/appUtilities'

import { Handle } from 'react-flow-renderer'

import { EntityDetails } from '../editor/EntityDetails'

import { makeStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import red from '@material-ui/core/colors/red'
import green from '@material-ui/core/colors/green'

import entityTypes, {
  relationTypes,
  entityStyle,
  entityIconStyle,
  entityTextStyle,
} from '../editor/entityTypes'
import { styles } from './Relations'

const Node = ({ data: { id, inputs, outputs, type, text, subTypes } }) => {
  const { editor, connections } = useSelector(store => store.app.view)
  const { direction, capitalAntiPlacement } = useLocale()
  const handlesVisibility = connections ? 'visible' : 'hidden'
  const { icon } = entityTypes[type]
  const role = 'node'
  const element = 'span'

  const [tooltipOpen, setTooltipOpen] = useState(false)
  const data = { id, subTypes }
  const entity = { type, data }

  // if (editor) is to prevent tooltip from appearing
  // at the end of a node drag-and-drop
  const openTooltip = () => {
    if (editor) setTooltipOpen(true)
  }
  const closeTooltip = () => {
    if (editor) setTooltipOpen(false)
  }
  useEffect(() => {
    console.log('Node is rendered')
  }, [])

  const useStyles = makeStyles(theme => ({
    entity: entityStyle({ type, role, element }),
    icon: entityIconStyle({ type, role }),
    text: entityTextStyle({ capitalAntiPlacement }),
  }))
  const classes = useStyles()

  return (
    <>
      {outputs &&
        outputs.map(({ source, target, type }) => (
          <Handle
            type="source"
            id={`${source}-${target}-${type}`}
            key={target}
            position="right"
            style={{
              ...styles.handleStyle,
              backgroundColor: entityTypes[relationTypes[type].entity].color,
              visibility: handlesVisibility,
            }}
          />
        ))}
      <Handle
        type="source"
        id="extraSource"
        key="extraSource"
        position="bottom"
        style={{
          ...styles.handleStyle,
          backgroundColor: green[500],
          visibility: handlesVisibility,
        }}
      />
      <ClickAwayListener onClickAway={closeTooltip}>
        <Tooltip
          open={tooltipOpen}
          title={<EntityDetails {...{ entity }} />}
          arrow
          TransitionComponent={Zoom}
          disableFocusListener={true}
          placement="left"
        >
          <span className={classes.entity} onClick={openTooltip}>
            <span className={classes.icon}>{icon}</span>
            <span className={classes.text} style={{ direction }}>
              {text}
            </span>
          </span>
        </Tooltip>
      </ClickAwayListener>
      {inputs &&
        inputs.map(({ source, target, type }) => (
          <Handle
            type="target"
            id={`${target}-${source}-${type}`}
            key={source}
            position="left"
            style={{
              ...styles.handleStyle,
              backgroundColor: entityTypes[relationTypes[type].entity].color,
              visibility: handlesVisibility,
            }}
          />
        ))}
      <Handle
        type="target"
        id="extraTarget"
        key="extraTarget"
        position="top"
        style={{
          ...styles.handleStyle,
          backgroundColor: red[500],
          visibility: handlesVisibility,
        }}
      />
    </>
  )
}

export default memo(Node)
