import { EditorState, Modifier, convertToRaw, SelectionState } from 'draft-js'

import decorator from './decorator'
import entityTypes from './entityTypes'
import parseSelection from './selection'

export const applyEntityToSelection = ({ editorState, userData }) => {
  const { content, selection, blockKey, selectedText } = parseSelection(
    editorState
  )
  const { entityType } = userData
  const { mutability } = entityTypes[entityType]
  const created = new Date()
  const entityData = { blockKey, selectedText, userData, created }

  const contentWithNewEntity = content.createEntity(
    entityType,
    mutability,
    entityData
  )
  const entityKey = contentWithNewEntity.getLastCreatedEntityKey()

  const contentWithAppliedEntity = Modifier.applyEntity(
    contentWithNewEntity,
    selection,
    entityKey
  )

  const newEditorState = EditorState.set(editorState, {
    currentContent: contentWithAppliedEntity,
    decorator,
    selection: SelectionState.createEmpty(blockKey),
  })

  console.log('raw content: ', convertToRaw(contentWithAppliedEntity))
  console.log(' ')

  return newEditorState
}

export const getEntityType = ({ contentState, entityKey }) => {
  const entity = contentState.getEntity(entityKey)
  return entity?.type
}
