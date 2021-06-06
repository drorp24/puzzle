/** @jsxImportSource @emotion/react */
import { memo } from 'react'
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
  entityStyle,
  entityIconStyle,
  entityTextStyle,
} from '../editor/entityTypes'
import { styles } from './Relations'

const Node = ({ data: { id, inputs, outputs, type, text, subTypes } }) => {
  const { relations, connections } = useSelector(store => store.app.view)
  const { direction, capitalAntiPlacement } = useLocale()
  const relationsHandlesVisibility =
    relations || connections ? 'visible' : 'hidden'
  const extraHandlesVisibility = connections ? 'visible' : 'hidden'
  const { icon } = entityTypes[type]
  const role = 'node'
  const element = 'span'

  const data = { id, subTypes }
  const entity = { type, data }

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
            position="bottom"
            style={{
              ...styles.handleStyle,
              backgroundColor: green[500],
              visibility: relationsHandlesVisibility,
            }}
          />
        ))}
      <Handle
        type="source"
        id="extraSource"
        key="extraSource"
        position="right"
        style={{
          ...styles.handleStyle,
          backgroundColor: green[500],
          visibility: extraHandlesVisibility,
        }}
      />
      <Tooltip
        title={<EntityDetails {...{ entity }} />}
        arrow
        TransitionComponent={Zoom}
        disableFocusListener={true}
        placement="left"
        PopperProps={{ style: { width: '15rem' } }}
      >
        <span className={classes.entity}>
          <span className={classes.icon}>{icon}</span>
          <span className={classes.text} style={{ direction }}>
            {text}
          </span>
        </span>
      </Tooltip>
      {inputs &&
        inputs.map(({ source, target, type }) => (
          <Handle
            type="target"
            id={`${target}-${source}-${type}`}
            key={source}
            position="top"
            style={{
              ...styles.handleStyle,
              backgroundColor: red[500],
              visibility: relationsHandlesVisibility,
            }}
          />
        ))}
      <Handle
        type="target"
        id="extraTarget"
        key="extraTarget"
        position="left"
        style={{
          ...styles.handleStyle,
          backgroundColor: red[500],
          visibility: extraHandlesVisibility,
        }}
      />
    </>
  )
}

export default memo(Node)
