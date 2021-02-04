import { add } from '../redux/content'

import { EditorState, Modifier, SelectionState } from 'draft-js'

import decorator from './decorator'
import entityTypes from './entityTypes'
import parseSelection from './selection'

export const applyEntityToSelection = ({ editorState, userData, dispatch }) => {
  const { entityType: type } = userData
  const { mutability } = entityTypes[type]

  const { content, selection, anchorKey } = parseSelection(editorState)

  // const key = anchorKey
  // const offset = anchorOffset
  // const length = focusOffset - anchorOffset
  // const range = {
  //   key,
  //   offset,
  //   length,
  // }

  const data = {
    // range,
    userData,
  }

  const contentWithNewEntity = content.createEntity(type, mutability, data)

  const entityKey = contentWithNewEntity.getLastCreatedEntityKey()

  dispatch(
    add({
      entityKey,
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

  return newEditorState
}

// This function has the following purpose/s:
// ? Update redux with the imported entities - draft's IDs
//   While this could be achieved by simply throwing raw input as is into redux (contentAdapter.setAll),
//   I'm capturing draft's assigned IDs, using findEntityRanges on the converted content,
//   and key the entities in redux by their draft's IDs rather than the API's range 'key's;
//   This is required since draft replaces the input api's 'key's with some ad-hoc generated entityKey's
//   and since EntitySpan's need to report their changed positions (rect) into redux,
//   which calls for using direct access, but EntitySpans know about their draft IDs, not the original key.
//
// ? Update redux with the imported entities - ranges
//   Ranges (= entities' offsets & lengths) are stored somewhere in draft's state, but I currently don't need this info.
//   If I ever need them, I'll add a 'range' key in the 'data' key of the entry, both here and at applyEntityToSelection.
//   This relates to the next potential issue: if I see that draft doesnt convert ranges back into JSON
//   then I will place this data in the part (probably 'data' key) that does get converted.
//
// ToDo: Check by conertToRaw and remove comment when done
// ? Update draft state's with the imported entities
//   We want to persist everything the user does in the session. That requires draft to know about every change the user makes.
//   Knowing that will guarantee that every such change would be included in the exported raw which will be persisted.
//   At that point it looks like convertFromRaw converts the entire entities meta data in draft's state, that every newly created entity
//   properly updates draft's state (by applyEntityToSelection above) so everything seems good
//   (position changes updated in redux by EntitySpan shouldnt be persisted).
//
//   However, if I find that some meta data doesn't get converted by draft back into raw, then I should either try to update draft's state
//   manually (using things like content.mergeEntityData) hoping it flows into the exported raw, or record things in redux and export
//   them out in a separate api.
//
export const createEntitiesFromContent = content => {
  const entities = []

  let entity, entityKey
  content.getBlockMap().forEach(block => {
    // const blockKey = block.getKey()
    block.findEntityRanges(
      character => {
        entityKey = character.getEntity()

        if (entityKey) {
          entity = content.getEntity(entityKey)
          return true
        }
      },
      (from, to) => {
        // const range = {
        //   key: blockKey,
        //   offset: from,
        //   length: to - from,
        // }

        const entityToJs = entity.toJS()
        entityToJs.entityKey = entityKey
        entities.push(entityToJs)
      }
    )
  })

  return entities
}
