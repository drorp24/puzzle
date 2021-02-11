import { add } from '../redux/content'

import { EditorState, Modifier, SelectionState } from 'draft-js'

import decorator from './decorator'
import entityTypes from './entityTypes'
import parseSelection from './selection'

export const createEntityFromSelection = ({ editorState, data, dispatch }) => {
  const { entityType: type } = data
  const { mutability } = entityTypes[type]

  const {
    content,
    selection,
    anchorKey,
    anchorOffset,
    focusOffset,
  } = parseSelection(editorState)

  const blockKey = anchorKey
  const offset = anchorOffset
  const length = focusOffset - anchorOffset
  const position = {}
  const entityRanges = [
    {
      blockKey,
      offset,
      length,
      position,
    },
  ]

  const contentWithNewEntity = content.createEntity(type, mutability, data)

  const entityKey = contentWithNewEntity.getLastCreatedEntityKey()
  const contentWithUpdatedEntity = contentWithNewEntity.mergeEntityData(
    entityKey,
    { id: entityKey }
  )

  const contentWithAppliedEntity = Modifier.applyEntity(
    contentWithUpdatedEntity,
    selection,
    entityKey
  )

  const newEditorState = EditorState.set(editorState, {
    currentContent: contentWithAppliedEntity,
    decorator,
    selection: SelectionState.createEmpty(anchorKey),
  })

  dispatch(
    add({
      type,
      mutability,
      data: { ...data, id: entityKey },
      entityRanges,
    })
  )

  return newEditorState
}


export const createEntitiesFromContent = content => {
  const entities = {}

  let entity, entityKey

  content.getBlockMap().forEach(block => {
    const blockKey = block.getKey()
    block.findEntityRanges(
      character => {
        entityKey = character.getEntity()

        if (entityKey) {
          entity = content.getEntity(entityKey)
          return true
        }
      },
      (from, to) => {
        const entityRange = {
          blockKey,
          offset: from,
          length: to - from,
        }

        if (!entities[entityKey]) {
          const entityToJs = entity.toJS()
          entityToJs.entityKey = entityKey
          entityToJs.entityRanges = []
          entities[entityKey] = entityToJs
        }

        entities[entityKey].entityRanges.push(entityRange)
      }
    )
  })
  return Object.values(entities)
}
