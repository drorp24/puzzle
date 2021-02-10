/** @jsxImportSource @emotion/react */
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toggleTags } from '../redux/app'

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
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },
  selectedButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderColor: 'white',
  },
}

const EditorControl = ({
  setShowEditor,
  setShowRelations,
  setShowTags,
  setEditRelations,
}) => {
  const dispatch = useDispatch()
  const [displays, setDisplays] = useState(() => ['editor', 'tags'])

  const handleDisplay = (event, newDisplays) => {
    if (displays.includes('tags') !== newDisplays.includes('tags'))
      dispatch(toggleTags())

    setShowEditor(newDisplays.includes('editor'))
    setShowTags(newDisplays.includes('tags'))
    setShowRelations(newDisplays.includes('relations'))
    setEditRelations(newDisplays.includes('edit'))

    setDisplays(newDisplays)
  }

  // ToDo: use button disables to prevent undesired states (e.g., relations & text on, tags off)
  const [relationsDisabled, setRelationsDisabled] = useState(false)
  const [tagsDisabled, setTagsDisabled] = useState(false)
  const [editorDisabled, setEditorDisabled] = useState(false)

  return (
    <div css={styles.root}>
      <ToggleButtonGroup
        orientation="vertical"
        size="small"
        css={styles.buttonGroup}
        value={displays}
        onChange={handleDisplay}
      >
        <Tooltip title="Show document" placement="left">
          <ToggleButton
            value="editor"
            disabled={editorDisabled}
            selected={displays.includes('editor')}
            style={
              displays.includes('editor')
                ? styles.selectedButton
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
            selected={displays.includes('tags')}
            style={
              displays.includes('tags') ? styles.selectedButton : styles.button
            }
          >
            <LabelIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show relations" placement="left">
          <ToggleButton
            value="relations"
            disabled={relationsDisabled}
            selected={displays.includes('relations')}
            style={
              displays.includes('relations')
                ? styles.selectedButton
                : styles.button
            }
          >
            <AccountTreeIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Edit relations" placement="left">
          <ToggleButton
            value="edit"
            disabled={relationsDisabled}
            selected={displays.includes('edit')}
            style={
              displays.includes('edit') ? styles.selectedButton : styles.button
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
