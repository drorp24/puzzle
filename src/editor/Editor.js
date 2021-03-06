/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { fetchContent, changes, selectContent, clear } from '../redux/content'
import { setAppProp, setView } from '../redux/app'
import { useLocale, capitalize } from '../utility/appUtilities'

import {
  Editor,
  EditorState,
  convertFromRaw,
  RichUtils,
  getDefaultKeyBinding,
} from 'draft-js'
import 'draft-js/dist/Draft.css'

import Relations from '../relations/Relations'
import Selector, { emptyData } from './Selector'
import { createEntityFromSelection } from './entities'
import decorator from './decorator'
import parseSelection from './selection'
import EditorControl from './EditorControl'
import noScrollbar from '../styling/noScrollbar'
import Spinner from '../layout/Spinner'

const MyEditor = () => {
  const { file, isLoading, error, refresh } = useSelector(selectContent)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [data, setData] = useState(emptyData)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const ref = useRef()

  const { view, drawerOpen } = useSelector(store => store.app)

  const { placement } = useLocale()

  const dispatch = useDispatch()

  const uSetSelectorOpen = useCallback(setSelectorOpen, [setSelectorOpen])
  const uSetData = useCallback(setData, [setData])

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

  // ! No editing
  // Editing is probably not required.
  // However if it is ever required, then every key stroke would have to update all entityRanges in redux, or alternatively
  // decoratorComponents (dc) would have to find another way to find the index of the proper entityRange to update.
  // That update is required to keep reactflow's nodes on the same x/y coordinates as draft-js' entities.
  //
  // Failing to update their up-to-date offsets in redux will make cd's 'find' return -1 and content.js to throw,
  // since offsets *will* change in strategies.js.
  const myKeyBindingFn = e => {
    if (e.keyCode < 90) return 'editing'
    return getDefaultKeyBinding(e)
  }
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      this.onChange(newState)
      return 'handled'
    }

    return 'not-handled'
  }

  const styles = {
    container: theme => ({
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '85% 5% 10%',
      gridTemplateRows: '50% 50%',
      gridTemplateAreas: `
      "editor space control"
      "editor space selector"
      `,
      overflow: 'hidden',
      color: theme.palette.text.contrast,
      position: 'relative',
    }),
    editor: {
      gridArea: 'editor',
      overflow: 'scroll',
      position: 'relative',
      ...noScrollbar,
    },
    relations: {
      position: 'absolute',
      top: '0',
      width: '100%',
      height: '100%',
    },
    space: {
      gridArea: 'space',
    },
    selector: {
      gridArea: 'selector',
    },
    control: {
      gridArea: 'control',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingTop: '1rem',
      [`padding${capitalize(placement)}`]: '0.5rem',
      zIndex: '1',
    },
  }

  // conversion
  useEffect(() => {
    if (!file) return
    const convertContent = rawContent => convertFromRaw(rawContent)

    const showContent = content =>
      setEditorState(EditorState.createWithContent(content, decorator))

    const emptyContent = () => setEditorState(EditorState.createEmpty())

    // ! error catching
    // redux-toolkit's thunks always return a promise with an action object (either fulfilled or rejected).
    // If anyone requires that promise to instead return the original payload, or (more importantly) the error,
    // then unwrapResult must be chained right after the dispatch.
    //
    // Failing to call unwrapResult will make an error reaching the reject reducer get swallowed there,
    // and the flow to consequently reach the '.then' clause here rather than the '.catch'.
    //
    // I think the convention should be the following:
    // If an error during a dispatched action should trigger the caller to do some other activity or dispatch in response,
    // then the caller (e.g. here) should be notified, so it can perform the other activity or dispatch.
    dispatch(setView({ editor: true, tags: true, relations: false }))

    dispatch(fetchContent({ file, convertContent, showContent }))
      .then(unwrapResult)
      .catch(error => {
        console.error('Editor: error returned:', error)
        dispatch(clear())
        emptyContent()
      })
  }, [dispatch, file, refresh])

  // selection & entity creation
  useEffect(() => {
    const { selectionExists, selectionSpansBlocks } =
      parseSelection(editorState)
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

  // editor position
  useEffect(() => {
    const { x, y, width, height } = ref.current?.getBoundingClientRect() || {}
    const position = { x, y, width, height /* , scrolling: 0  */ }
    dispatch(setAppProp({ editor: position }))
  }, [dispatch, drawerOpen])

  if (isLoading) return <Spinner top />
  if (error?.status === 404) {
    return null
  }
  return (
    <div css={styles.container}>
      <div css={styles.editor} ref={ref}>
        <div
          style={{
            visibility: view.editor ? 'visible' : 'hidden',
            position: 'relative',
          }}
        >
          <Editor
            editorState={editorState}
            onChange={handleChange}
            keyBindingFn={myKeyBindingFn}
            handleKeyCommand={handleKeyCommand}
            css={styles.editor}
          />
          <div css={styles.relations}>
            <Relations />
          </div>
        </div>
      </div>

      <div css={styles.space} />
      <div css={styles.selector}>
        {/* <Selector
          {...{
            selectorOpen,
            uSetSelectorOpen,
            uSetData,
          }}
        /> */}
      </div>
      <div css={styles.control}>
        <EditorControl />
      </div>
    </div>
  )
}
export default MyEditor
