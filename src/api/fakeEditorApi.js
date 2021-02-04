// draft-js ('draft') is a famous library by Facebook that fits our needs quite perfectly.
// To do its job, draft requires a specific JSON structure, defined using Flow here:
//
// https://github.com/facebook/draft-js/blob/master/src/model/encoding/RawDraftContentState.js
//
// That structure is normalized, so that the only data pertaining to entities' occurrences in the text is
// their offsets and lengths there, and the (foreign) key to the respective entity record, the one holding the entity data.
//
// That allows the many-to-one relation b/w entity occurrences in the text (e.g., "Moshe", "he") to their corresponding entity record.
//
// Accordingly, the structure has two parts:
// - blocks: an array whose every item is a text block. Every block has an array of occurrences called entityRanges.
// - entityMap: an object whose every item is an entity record.
//
// To point from every occurrence to its respective entity record, draft requires that each occurrence in entityRange has a 'key'
// that references a corresponding entityMap key.
// For some reason or another, those 'keys' don't get converted into draft's internal state (they get replaced by ad-hoc generated keys).
// Oddly, they define 'key' type to be number but use strings for keys in their example. Per my experience, both do the job.
//
// Any key in an entity object other than 'type', 'mutability' and 'data' gets ignored.
// In other words, it doesn't get converted into draft's internal state. That includes 'id'.
// That means that any entity info we want the user to view (e.g., id) should sit in the 'data' key.
//
const timeout = 100

const rawContent = {
  blocks: [
    {
      key: 'firstBlock',
      text:
        'This is an "immutable" entity: Superman. Deleting any ' +
        'characters will delete the entire entity. Adding characters ' +
        'will remove the entity from the range.',
      type: 'unstyled',
      entityRanges: [
        {
          offset: 31,
          length: 8,
          key: 'firstEntity',
        },
      ],
    },
    {
      key: 'secondBlock',
      text: '',
      type: 'unstyled',
    },
    {
      key: 'thirdBlock',
      text:
        'This is a "mutable" entity: Batman. Characters may be added ' +
        'and removed.',
      type: 'unstyled',
      entityRanges: [{ offset: 28, length: 6, key: 'secondEntity' }],
    },
    {
      key: 'fourthBlock',
      text: '',
      type: 'unstyled',
    },
    {
      key: 'fifthBlock',
      text:
        'This is a "segmented" entity: Green Lantern. Deleting any ' +
        'characters will delete @the #current "segment" from the range. ' +
        'Adding characters will remove the entire entity from the range.',
      type: 'unstyled',
      entityRanges: [{ offset: 30, length: 13, key: 'thirdEntity' }],
    },
  ],

  entityMap: {
    firstEntity: {
      id: 'firstEntity',
      something: 'else',
      type: 'TOKEN',
      mutability: 'IMMUTABLE',
      data: {
        id: 'firstEntity',
        score: 9.99,
        subTypes: ['A', 'B', 'C'],
        location: 'Tel aviv',
      },
    },
    secondEntity: {
      id: 'secondEntity',
      type: 'TOKEN',
      mutability: 'MUTABLE',
      data: {
        id: 'secondEntity',
        score: 10.99,
        subTypes: ['A', 'B'],
      },
    },
    thirdEntity: {
      id: 'thirdEntity',
      type: 'TOKEN',
      mutability: 'SEGMENTED',
      data: {
        id: 'thirdEntity',
        score: 8.99,
        subTypes: [],
      },
    },
  },
}

export const getContent = () =>
  new Promise((resolve, reject) => {
    if (!rawContent) {
      return setTimeout(() => reject(new Error('Users not found')), timeout)
    }

    setTimeout(() => resolve(rawContent), timeout)
  })
