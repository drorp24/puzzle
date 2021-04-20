/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchContent, error, changes } from '../redux/content'
import { setAppProp /* , scrolling */ } from '../redux/app'
import { useLocale, capitalize } from '../utility/appUtilities'

import {
  Editor,
  EditorState,
  convertFromRaw,
  RichUtils,
  getDefaultKeyBinding,
} from 'draft-js'
import 'draft-js/dist/Draft.css'

import CircularProgress from '@material-ui/core/CircularProgress'

import Relations from '../relations/Relations'
import Selector, { emptyData } from './Selector'
import { createEntityFromSelection } from './entities'
import decorator from './decorator'
import parseSelection from './selection'
import EditorControl from './EditorControl'
import noScrollbar from '../styling/noScrollbar'
import Scroller from './Scroller'
import { throttleByFrame } from '../utility/debounce'

const MyEditor = () => {
  const file = useSelector(store => store.content.file)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [data, setData] = useState(emptyData)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const ref = useRef()

  const { view, hide, drawerOpen, locale, mode } = useSelector(
    store => store.app
  )
  const { placement, antiPlacement } = useLocale()

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

  // const reportScrolling = () => {
  //   dispatch(scrolling())
  // }

  const styles = {
    container: theme => ({
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '85% 5% 10%',
      gridTemplateRows: '50% 50%',
      gridTemplateAreas: `
      "editor space selector"
      "editor space control"
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
      justifyContent: 'flex-end',
      paddingBottom: '0.5rem',
      [`padding${capitalize(placement)}`]: '0.5rem',
      zIndex: '1',
    },

    scroller: {
      position: 'absolute',
      bottom: '1rem',
      [`${antiPlacement}`]: '0.5rem',
      outline: 'none',
      display: 'flex',
      borderRadius: '50%',
      '&:focus': {
        outline: 'none',
      },
    },
    circularProgress: theme => ({
      position: 'fixed',
      top: '50%',
      left: locale === 'en' ? '30%' : '65%',
      '& > span': {
        color:
          mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : theme.palette.grey[500],
      },
    }),
  }

  // conversion
  useEffect(() => {
    if (!file) return
    const convertContent = rawContent => convertFromRaw(rawContent)

    const showContent = content =>
      setEditorState(EditorState.createWithContent(content, decorator))

    dispatch(fetchContent({ file, convertContent, showContent }))
  }, [dispatch, file])

  // selection & entity creation
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

  // editor position
  useEffect(() => {
    const { x, y, width, height } = ref.current?.getBoundingClientRect() || {}
    const position = { x, y, width, height /* , scrolling: 0  */ }
    dispatch(setAppProp({ editor: position }))
  }, [dispatch, drawerOpen])

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
        <Selector
          {...{
            selectorOpen,
            uSetSelectorOpen,
            uSetData,
          }}
        />
      </div>
      <div css={styles.control}>
        <EditorControl />
      </div>
      <div css={styles.scroller}>
        <Scroller textRef={ref} />
      </div>
    </div>
  )
}
export default MyEditor
