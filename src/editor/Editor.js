/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Editor, EditorState, RichUtils, convertFromRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'
import { getContent } from '../api/fakeEditorApi'

import { fetchContent } from '../redux/content'

import { emptyUserData } from './SpeedDial'
import { applyEntityToSelection } from './entities'
import decorator from './decorator'
import parseSelection from './selection'
import Page from '../layout/Page'
import SpeedDial from './SpeedDial'

const styles = {
  container: theme => ({
    display: 'grid',
    gridTemplateColumns: '9fr 1fr',
    padding: '1rem',
  }),
}

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  const contentRef = useRef()
  console.log('contentRef: ', contentRef)

  const dispatch = useDispatch()

  useEffect(() => {
    if (contentRef.current?.fetched) return

    dispatch(fetchContent())

    const oldFetchContent = async () => {
      const rawContent = await getContent()
      console.log('rawContent: ', rawContent)
      setEditorState(
        EditorState.createWithContent(convertFromRaw(rawContent), decorator)
      )
      contentRef.current = { fetched: true }
    }

    oldFetchContent()
  }, [editorState])

  const [userData, setUserData] = useState(emptyUserData)
  const [sdOpen, setSdOpen] = useState(false)

  // Todo: find if these useCallbacks are effective
  const uSetSdOpen = useCallback(setSdOpen, [setSdOpen])
  const uSetUserData = useCallback(setUserData, [setUserData])

  const handleChange = editor => {
    setEditorState(editor)

    const { selectionExists } = parseSelection(editor)
    if (selectionExists) setSdOpen(true)
  }

  const handleKeyCommand = (command, editorState) => {
    console.log('key command: ', command)
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      setEditorState(newState)
      return 'handled'
    }

    return 'not-handled'
  }

  const handleFocus = e => {
    e.preventDefault()
  }

  const handleBlur = e => {
    e.preventDefault()
  }

  useEffect(() => {
    console.log('useEffect entered')

    const { selectionExists } = parseSelection(editorState)
    if (selectionExists && userData.entityType) {
      const newEditorState = applyEntityToSelection({
        editorState,
        userData,
      })
      setEditorState(newEditorState)
      setUserData(emptyUserData)
    }
  }, [editorState, userData])

  return (
    <Page>
      <div css={styles.container}>
        <Editor
          editorState={editorState}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          handleKeyCommand={handleKeyCommand}
        />
        <SpeedDial {...{ sdOpen, uSetSdOpen, uSetUserData }} />
      </div>
    </Page>
  )
}
export default MyEditor
