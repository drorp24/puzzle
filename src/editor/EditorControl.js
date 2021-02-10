/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { view } from '../redux/app'

import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import AccountTreeIcon from '@material-ui/icons/AccountTreeOutlined'
import LabelIcon from '@material-ui/icons/LabelOutlined'
import TextIcon from '@material-ui/icons/DescriptionOutlined'
import Tooltip from '@material-ui/core/Tooltip'
import BorderColorOutlinedIcon from '@material-ui/icons/BorderColorOutlined'

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
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  selected: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderColor: 'white',
  },
  disabled: {
    color: 'rgba(0, 0, 0, 0.2)',
  },
}

const EditorControl = () => {
  const [selected, setSelected] = useState(['editor', 'tags'])
  const dispatch = useDispatch()

  const [editorDisabled, setEditorDisabled] = useState(false)
  const [tagsDisabled, setTagsDisabled] = useState(false)
  const [relationsDisabled, setRelationsDisabled] = useState(false)
  const [connectionsDisabled, setConnectionsDisabled] = useState(false)

  const editorSelected = useMemo(() => selected.includes('editor'), [selected])
  const tagsSelected = useMemo(() => selected.includes('tags'), [selected])
  const relationsSelected = useMemo(() => selected.includes('relations'), [
    selected,
  ])
  const connectionsSelected = useMemo(() => selected.includes('connections'), [
    selected,
  ])

  const dispatchSelected = useCallback(() => {
    dispatch(
      view({
        editor: editorSelected,
        tags: tagsSelected,
        relations: relationsSelected,
        connections: connectionsSelected,
      })
    )
    setConnectionsDisabled(!relationsSelected)
  }, [
    editorSelected,
    tagsSelected,
    relationsSelected,
    connectionsSelected,
    dispatch,
  ])

  useEffect(() => {
    dispatchSelected()
  }, [dispatchSelected])

  const handleDisplay = (event, newSelected) => {
    setSelected(newSelected)
    dispatchSelected()
  }

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
            disabled={editorDisabled}
            selected={editorSelected}
            style={
              editorSelected
                ? styles.selected
                : editorDisabled
                ? styles.disabled
                : styles.button
            }
          >
            <TextIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show tags" placement="left">
          <ToggleButton
            value="tags"
            disabled={tagsDisabled}
            selected={tagsSelected}
            style={
              tagsSelected
                ? styles.selected
                : tagsDisabled
                ? styles.diabled
                : styles.button
            }
          >
            <LabelIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show relations" placement="left">
          <ToggleButton
            value="relations"
            disabled={relationsDisabled}
            selected={relationsSelected}
            style={
              relationsSelected
                ? styles.selected
                : relationsDisabled
                ? styles.disabled
                : styles.button
            }
          >
            <AccountTreeIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Edit relations" placement="left">
          <ToggleButton
            value="connections"
            disabled={connectionsDisabled}
            selected={connectionsSelected}
            style={
              connectionsSelected
                ? styles.selected
                : connectionsDisabled
                ? styles.disabled
                : styles.button
            }
          >
            <BorderColorOutlinedIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </div>
  )
}

export default EditorControl
