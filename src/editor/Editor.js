/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { fetchContent, error, changes } from '../redux/content'

import { Editor, EditorState, RichUtils, convertFromRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'
import Relations from '../relations/Relations'

import Selector, { emptyData } from './Selector'
import { createEntityFromSelection } from './entities'
import decorator from './decorator'
import parseSelection from './selection'
import Page from '../layout/Page'
import EditorControl from './EditorControl'

const styles = {
  container: theme => ({
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '8.5fr 1.5fr',
    gridTemplateRows: '8.5fr 1.5fr',
    gridTemplateAreas: `
      "editor selector"
      "editor control"
      `,
    padding: '1rem',
  }),
  editor: {
    gridArea: 'editor',
  },
  selector: {
    gridArea: 'selector',
  },
  control: {
    gridArea: 'control',
  },
  relations: {},
}

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [showEditor, setShowEditor] = useState(true)
  const [showTags, setShowTags] = useState(false)
  const [showRelations, setShowRelations] = useState(false)
  const [editRelations, setEditRelations] = useState(false)

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

  const [data, setData] = useState(emptyData)
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Todo: find if these useCallbacks are effective
  const uSetSelectorOpen = useCallback(setSelectorOpen, [setSelectorOpen])
  const uSetData = useCallback(setData, [setData])

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
      // alert('Please select inside a single block') // ToDo: replace alert with a snackbar
      return
    }
    if (selectionExists && data.entityType) {
      const newEditorState = createEntityFromSelection({
        editorState,
        data,
        dispatch,
      })
      setEditorState(newEditorState)
      setData(emptyData)
    }
  }, [dispatch, editorState, data])

  return (
    <Page>
      <div css={styles.container}>
        <div
          css={styles.editor}
          style={{ visibility: showEditor ? 'visible' : 'hidden' }}
        >
          <Editor
            editorState={editorState}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            handleKeyCommand={handleKeyCommand}
            css={styles.editor}
          />
        </div>
        <div css={styles.selector}>
          <Selector
            {...{
              selectorOpen,
              uSetSelectorOpen,
              uSetData,
            }}
            css={styles.selector}
          />
        </div>
        <div css={styles.relations}>
          <Relations {...{ showRelations, editRelations }} />
        </div>
        <div css={styles.control}>
          <EditorControl
            {...{
              setShowEditor,
              setShowRelations,
              setShowTags,
              setEditRelations,
            }}
          />
        </div>
      </div>
    </Page>
  )
}
export default MyEditor
