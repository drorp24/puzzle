// ? input structure
// draft - js('draft') is a famous library by Facebook that fits our needs perfectly.
// To be able to do its job, draft requires the following JSON structure, defined using Flow here:
// https://github.com/facebook/draft-js/blob/master/src/model/encoding/RawDraftContentState.js
//
// That input structure is normalized, so that the only data pertaining to entities' occurrences
// in the text is their offsets and lengths there,
// and the foreign key to the respective entity record, where the entity data is held.
//
// Thus draft implements the many-to-one relationship b/w entity occurrences in the text (e.g., "Moshe", "he")
// and their respective entity records.
//
// Accordingly, the structure has two main keys:
// - blocks: an array of text blocks. Each block has an array with entity occurrences ("entityRanges").
//   To keep it normalized, each occurrence has only 'offset', 'length' and 'key', pointing to 'entityMap's key.
// - entityMap: an object whose every key is an entity record, keyed by that referenced 'key'.
//
// draft ignores (= doesn't convert) any key in an entity record other than
// 'type', 'mutability' and 'data'. Even Id gets ignored!
// Hence anything we want to survive draft's conversion must sit in the 'data' object.
// One field we must include in the 'data' is the original key. Here's why.
//
// ? draft conversion
// To do its thing, draft has to convert the input JSON ("rawContent") into
// its own different (Immutable.js - based) structure.
// Oddly, the original 'keys' never make it into draft's converted structure.
// Instead they are replaced during conversion by ad-hoc generated IDs called 'entityKey's.
//
// In places where we use the draft's functionlity (e.g., decoratorComponents),
// what this means is we're getting draft's entityKeys rather than our original 'keys'.
//
// As the following paragrpha explain, we mostly need the original key rather than draft's entityKey,
// and that's why we need the original keys recorded on the entity's 'data' part.
//
// We will want the original keys whenever we are to retrieve or update an entity,
// since entities in redux are keyed by the original keys.
//
// One reason why redux keys entities by their original keys is the rendering of the relationship graph.
// To render it, we traverse the relations graph by nodes, which are identified by their original keys
// and update every such referenced entity node with the list of input and output nodes.
// This definitely calls for direct access by the original 'keys'.
//
// Another reason would be the need to click or hover a point on the map and get details about the
// entity represented by that point, using the original key again.
// I am sure there will be several more use cases going forward for this kind of keying.
//
const timeout = 100

const rawContent = {
  blocks: [
    {
      key: 'firstBlock',
      text:
        'Uri went to Metzitzim beach. ' +
        'He brought his brother Danny with him and his father Moshe.',
      type: 'unstyled',
      entityRanges: [
        {
          offset: 0,
          length: 3,
          key: 'firstEntity',
        },
        {
          offset: 12,
          length: 15,
          key: 'secondEntity',
        },
        {
          offset: 29,
          length: 2,
          key: 'firstEntity',
        },
        {
          offset: 40,
          length: 17,
          key: 'thirdEntity',
        },
        {
          offset: 71,
          length: 16,
          key: 'fourthEntity',
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
        'This is an "immutable" entity: Superman. Deleting any ' +
        'characters will delete the entire entity. Adding characters ' +
        'will remove the entity from the range.',
      type: 'unstyled',
      entityRanges: [
        {
          offset: 31,
          length: 8,
          key: 'fifthEntity',
        },
      ],
    },
    {
      key: 'fourthBlock',
      text: '',
      type: 'unstyled',
    },
    {
      key: 'fifthBlock',
      text:
        'This is a "mutable" entity: Uri. Characters may be added ' +
        'and removed. This is the same person mentioned above.',
      type: 'unstyled',
      entityRanges: [{ offset: 28, length: 3, key: 'firstEntity' }],
    },
    {
      key: 'sixthBlock',
      text: '',
      type: 'unstyled',
    },
    {
      key: 'sebenthBlock',
      text:
        'This is a "segmented" entity: Green Lantern. Deleting any ' +
        'characters will delete @the #current "segment" from the range. ' +
        'Adding characters will remove the entire entity from the range.',
      type: 'unstyled',
      entityRanges: [{ offset: 30, length: 13, key: 'seventhEntity' }],
    },
  ],

  entityMap: {
    firstEntity: {
      type: 'Person',
      mutability: 'IMMUTABLE',
      data: {
        id: 'firstEntity',
        name: 'Uri',
        score: 9.99,
        subTypes: ['A', 'B', 'C'],
        location: 'Tel aviv',
      },
    },
    secondEntity: {
      type: 'Place',
      mutability: 'IMMUTABLE',
      data: {
        id: 'secondEntity',
        name: 'Metzitzim',
        score: 9.99,
        subTypes: ['A', 'B', 'C'],
        location: 'Tel aviv',
      },
    },
    thirdEntity: {
      type: 'Person',
      mutability: 'IMMUTABLE',
      data: {
        id: 'thirdEntity',
        name: 'Danny',
        score: 9.99,
        subTypes: ['A', 'B', 'C'],
        location: 'Tel aviv',
      },
    },
    fourthEntity: {
      willbeIgnored: 'youWillSee',
      type: 'Person',
      mutability: 'IMMUTABLE',
      data: {
        id: 'fourthEntity',
        name: 'Moshe',
        score: 9.99,
        subTypes: ['A', 'B', 'C'],
        location: 'Tel aviv',
      },
    },
    fifthEntity: {
      type: 'Time',
      mutability: 'MUTABLE',
      data: {
        id: 'fifthEntity',
        name: 'Superman',
        score: 10.99,
        subTypes: ['A', 'B'],
      },
    },

    seventhEntity: {
      type: 'Unrecognized',
      mutability: 'SEGMENTED',
      data: {
        id: 'sixthEntity',
        name: 'Green Lantern',
        score: 8.99,
        subTypes: [],
      },
    },
  },
  relations: [
    // assumptions:
    // - graph is unidirectional
    {
      from: 'firstEntity',
      to: 'fourthEntity',
      type: 'son',
    },
    {
      from: 'secondEntity',
      to: 'fourthEntity',
      type: 'son',
    },
    {
      from: 'firstEntity',
      to: 'thirdEntity',
      type: 'brother',
    },
  ],
}

export const getContent = () =>
  new Promise((resolve, reject) => {
    if (!rawContent) {
      return setTimeout(() => reject(new Error('Content unavailable')), timeout)
    }

    setTimeout(() => resolve(rawContent), timeout)
  })
