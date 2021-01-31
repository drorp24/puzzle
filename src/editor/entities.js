import { EditorState, Modifier, convertToRaw, SelectionState } from 'draft-js'

import { add } from '../redux/content'

import decorator from './decorator'
import entityTypes from './entityTypes'
import parseSelection from './selection'

export const applyEntityToSelection = ({ editorState, userData, dispatch }) => {
  const { entityType: type } = userData
  const { mutability } = entityTypes[type]

  const {
    content,
    selection,
    selectedText,
    anchorKey,
    anchorOffset,
    focusKey,
    focusOffset,
  } = parseSelection(editorState)
  const editorData = {
    anchorKey,
    anchorOffset,
    focusKey,
    focusOffset,
    selectedText,
  }
  const data = {
    editorData,
    userData,
  }

  const contentWithNewEntity = content.createEntity(type, mutability, data)

  const entityKey = contentWithNewEntity.getLastCreatedEntityKey()

  const id = entityKey

  dispatch(
    add({
      id,
      type,
      mutability,
      data,
    })
  )

  const contentWithAppliedEntity = Modifier.applyEntity(
    contentWithNewEntity,
    selection,
    entityKey
  )

  const newEditorState = EditorState.set(editorState, {
    currentContent: contentWithAppliedEntity,
    decorator,
    selection: SelectionState.createEmpty(anchorKey),
  })

  console.log(' ')
  console.log('raw content: ', convertToRaw(contentWithAppliedEntity))
  console.log(' ')

  return newEditorState
}
