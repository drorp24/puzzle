/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { view } from '../redux/app'

import ToggleButton from '@material-ui/core/ToggleButton'

import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import AccountTreeIcon from '@material-ui/icons/AccountTreeOutlined'
import LabelIcon from '@material-ui/icons/LabelOutlined'
import TextIcon from '@material-ui/icons/DescriptionOutlined'
import Tooltip from '@material-ui/core/Tooltip'

const styles = {
  root: theme => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  buttonGroup: theme => ({
    border: `3px solid rgba(0, 0, 0, 0.15)`,
  }),
  button: {
    '& svg': {
      fontSize: '1.2rem',
    },
  },
  off: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  on: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderColor: 'white',
  },
  disabled: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.1)',
    pointerEvents: 'none',
  },
}

// ToDo: find out why leaving 'editor' alone in the initial state makes reactflow's edges wrongly positioned
const EditorControl = () => {
  const [selected, setSelected] = useState(['editor', 'tags'])

  // const editorSelected = selected.includes('editor')
  // const tagsSelected = selected.includes('tags')
  // const relationsSelected = selected.includes('relations')
  // const connectionsSelected = selected.includes('connections')
  const dispatch = useDispatch()

  const [editorDisabled] = useState(false)
  const [tagsDisabled] = useState(false)
  const [relationsDisabled, setRelationsDisabled] = useState(false)
  const [connectionsDisabled, setConnectionsDisabled] = useState(false)

  const dispatchSelected = useCallback(
    selected => {
      dispatch(
        view({
          editor: selected.includes('editor'),
          tags: selected.includes('tags'),
          relations: selected.includes('relations'),
          connections: selected.includes('connections'),
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    const unSelect = view =>
      setSelected(selected => selected.filter(i => i !== view))

    setRelationsDisabled(!selected.includes('tags'))
    if (selected.includes('relations') && !selected.includes('tags'))
      unSelect('relations')

    setConnectionsDisabled(!selected.includes('relations'))
    if (selected.includes('connections') && !selected.includes('relations'))
      unSelect('connections')
  }, [selected])

  const handleDisplay = (event, newSelected) => {
    setSelected(newSelected)
    dispatchSelected(newSelected)
  }

  const { on, off, disabled } = styles

  return (
    <div css={styles.root}>
      <ToggleButtonGroup
        orientation="vertical"
        size="small"
        css={styles.buttonGroup}
        value={selected}
        onChange={handleDisplay}
      >
        <Tooltip title="Show text" placement="left">
          <ToggleButton
            value="editor"
            selected={selected.includes('relations')}
            css={styles.button}
            style={
              editorDisabled ? disabled : selected.includes('editor') ? on : off
            }
          >
            <TextIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show tags" placement="left">
          <ToggleButton
            value="tags"
            selected={selected.includes('tags')}
            css={styles.button}
            style={
              tagsDisabled ? disabled : selected.includes('tags') ? on : off
            }
          >
            <LabelIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show relations" placement="left">
          <ToggleButton
            value="relations"
            selected={selected.includes('relations')}
            css={styles.button}
            style={
              relationsDisabled
                ? disabled
                : selected.includes('relations')
                ? on
                : off
            }
          >
            <AccountTreeIcon />
          </ToggleButton>
        </Tooltip>

        {/* <Tooltip title="Edit relations" placement="left">
          <ToggleButton
            value="connections"
            selected={connectionsSelected}
            css={styles.button}
            style={
              connectionsDisabled ? disabled : connectionsSelected ? on : off
            }
          >
            <BorderColorOutlinedIcon />
          </ToggleButton>
        </Tooltip> */}
      </ToggleButtonGroup>
    </div>
  )
}

export default memo(EditorControl)
