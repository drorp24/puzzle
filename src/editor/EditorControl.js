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

const styles = {
  root: theme => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  buttonGroup: theme => ({
    border: `3px solid rgba(0, 0, 0, 0.15)`,
  }),
  selectedButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    color: 'white',
    borderColor: 'white',
  },
}

const EditorControl = ({ setShowEditor, setShowRelations, setShowTags }) => {
  const dispatch = useDispatch()

  const [displays, setDisplays] = useState(() => ['editor', 'tags'])
  // let editorSelected, tagsSelected, relationsSelected
  // console.log(
  //   'editorSelected, tagsSelected, relationsSelected: ',
  //   editorSelected,
  //   tagsSelected,
  //   relationsSelected
  // )

  console.log('displays: ', displays)

  const handleDisplay = (event, newDisplays) => {
    console.log('handleDisplay ')
    console.log('event, newDisplays: ', event, newDisplays)

    // if (
    //   newDisplays.includes('relations') &&
    //   !newDisplays.includes('tags') &&
    //   newDisplays.includes('editor')
    // ) {
    //   setDisplays(['relations', 'tags', 'editor'])
    //   return
    // }

    if (displays.includes('tags') !== newDisplays.includes('tags'))
      dispatch(toggleTags())

    // relations requires tags to be on
    // if (!newDisplays.includes('tags')) {
    //   setShowRelations(false)
    //   newDisplays = newDisplays.filter(i => i !== 'relations')
    //   if (!relationsDisabled) setRelationsDisabled(true)
    // } else {
    //   if (relationsDisabled) setRelationsDisabled(false)
    // }

    // // tags requires editor to be on
    // if (!newDisplays.includes('editor')) {
    //   setShowEditor(false)
    //   newDisplays = newDisplays.filter(i => i !== 'tags')
    //   if (!tagsDisabled) setTagsDisabled(true)
    // } else {
    //   if (tagsDisabled) setTagsDisabled(false)
    // }

    // editorSelected = newDisplays.includes('editor')
    // tagsSelected = newDisplays.includes('tags')
    // relationsSelected = newDisplays.includes('relations')

    // console.log(
    //   'inside change: editorSelected, tagsSelected, relationsSelected: ',
    //   editorSelected,
    //   tagsSelected,
    //   relationsSelected
    // )

    setShowEditor(newDisplays.includes('editor'))
    setShowTags(newDisplays.includes('tags'))
    setShowRelations(newDisplays.includes('relations'))

    setDisplays(newDisplays)
  }
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
            style={displays.includes('editor') ? styles.selectedButton : {}}
          >
            <TextIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show tags" placement="left">
          <ToggleButton
            value="tags"
            disabled={tagsDisabled}
            selected={displays.includes('tags')}
            style={displays.includes('tags') ? styles.selectedButton : {}}
          >
            <LabelIcon />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Show relations" placement="left">
          <ToggleButton
            value="relations"
            disabled={relationsDisabled}
            selected={displays.includes('relations')}
            style={displays.includes('relations') ? styles.selectedButton : {}}
          >
            <AccountTreeIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </div>
  )
}

export default EditorControl
