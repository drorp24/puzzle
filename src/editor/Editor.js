/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { Editor, EditorState, RichUtils, convertFromRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { fetchContent } from '../redux/content'

import Selector, { emptyUserData } from './Selector'
import { applyEntityToSelection } from './entities'
import decorator from './decorator'
import parseSelection from './selection'
import Page from '../layout/Page'

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
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('Editor fetch useEffect entered')
    if (contentRef.current?.fetched) return
    console.log('Editor fetch survived the contentRef if')

    const callback = rawContent =>
      setEditorState(
        EditorState.createWithContent(convertFromRaw(rawContent), decorator)
      )

    dispatch(fetchContent(callback))

    contentRef.current = { fetched: true } // ToDo: remove if unnecessary
  }, [dispatch])

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
    const { selectionExists } = parseSelection(editorState)
    if (selectionExists && userData.entityType) {
      const newEditorState = applyEntityToSelection({
        editorState,
        userData,
        dispatch,
      })
      setEditorState(newEditorState)
      setUserData(emptyUserData)
    }
  }, [dispatch, editorState, userData])

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
        <Selector {...{ sdOpen, uSetSdOpen, uSetUserData }} />
      </div>
    </Page>
  )
}
export default MyEditor
