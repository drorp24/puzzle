/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { fetchContent, error, changes } from '../redux/content'

import { Editor, EditorState, RichUtils, convertFromRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'
import Relations from '../flow/Relations'

import Selector, { emptyUserData } from './Selector'
import { createEntityFromSelection } from './entities'
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

  const dispatch = useDispatch()

  useEffect(() => {
    const convertContent = rawContent => convertFromRaw(rawContent)

    const showContent = content =>
      setEditorState(EditorState.createWithContent(content, decorator))

    dispatch(fetchContent({ convertContent, showContent }))
      .then(unwrapResult)
      .catch(serializedError => {
        console.error(serializedError)
        dispatch(error('content'))
      })
  }, [dispatch])

  const [userData, setUserData] = useState(emptyUserData)
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Todo: find if these useCallbacks are effective
  const uSetSelectorOpen = useCallback(setSelectorOpen, [setSelectorOpen])
  const uSetUserData = useCallback(setUserData, [setUserData])

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      setEditorState(newState)
      return 'handled'
    }

    return 'not-handled'
  }

  const handleChange = newEditorState => {
    // only report changes that have the potential to change entities positions
    // contentState immutability enables using referntial equality for comparison
    const oldContent = editorState.getCurrentContent()
    const newContent = newEditorState.getCurrentContent()
    const contentChanged = newContent !== oldContent
    if (contentChanged) dispatch(changes())

    setEditorState(newEditorState)

    const { selectionExists } = parseSelection(newEditorState)
    if (selectionExists) setSelectorOpen(true)
  }

  const handleFocus = e => {
    e.preventDefault()
  }

  const handleBlur = e => {
    e.preventDefault()
  }

  useEffect(() => {
    const { selectionExists, selectionSpansBlocks } = parseSelection(
      editorState
    )
    if (selectionExists && selectionSpansBlocks) {
      alert('Please select inside a single block') // ToDo: replace alert with a snackbar
      return
    }
    if (selectionExists && userData.entityType) {
      const newEditorState = createEntityFromSelection({
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
        <Selector
          {...{
            selectorOpen,
            uSetSelectorOpen,
            uSetUserData,
          }}
        />
        {/* <Relations /> */}
      </div>
    </Page>
  )
}
export default MyEditor
