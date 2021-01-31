// ToDo: match Shay's format to what createEntityAdapter can work with
// I want an ordered list of IDs (order kept after each CRUD operation on the array)
// as well as the ability to directly access any entity by its ID
// these 2 call for createEntityAdapter
// looks like I can use it to normazlie only a part of a payload if needed
//
// The thing is, even if I fixed Shay's format to match exactly what convertFromRaw requires (the split b/w blocks and entities),
// it then wouldn't match what createEntityAdapter needs
//
// So I'd anyway need to build a convert function to normalize the API:
// - once, to match 'draft - js' raw format
//   that format should only affect 'editorState' for text display; it should not sit in redux.
//   The action dispatched should get as parameter 'setEditorState' so it can populate 'editorState' once api is fetched.
// - then, another format to match createEntityAdapter's normalized format
//   that one would sit in redux, and serve the editor, list and map components.
//
// Editor.js should not feel the difference after that change, as it would still get its data from 'editorState' as before.
// It should only take more data from each entity to display in the tooltip.

const timeout = 100

const rawContent = {
  blocks: [
    {
      text:
        'This is an "immutable" entity: Superman. Deleting any ' +
        'characters will delete the entire entity. Adding characters ' +
        'will remove the entity from the range.',
      type: 'unstyled',
      entityRanges: [
        {
          offset: 31,
          length: 8,
          key: 'first',
        },
      ],
    },
    {
      text: '',
      type: 'unstyled',
    },
    {
      text:
        'This is a "mutable" entity: Batman. Characters may be added ' +
        'and removed.',
      type: 'unstyled',
      entityRanges: [{ offset: 28, length: 6, key: 'second' }],
    },
    {
      text: '',
      type: 'unstyled',
    },
    {
      text:
        'This is a "segmented" entity: Green Lantern. Deleting any ' +
        'characters will delete @the #current "segment" from the range. ' +
        'Adding characters will remove the entire entity from the range.',
      type: 'unstyled',
      entityRanges: [{ offset: 30, length: 13, key: 'third' }],
    },
  ],

  entityMap: {
    first: {
      id: 'first',
      type: 'TOKEN',
      mutability: 'IMMUTABLE',
      data: {
        userData: {
          score: 9.99,
          subTypes: ['A', 'B', 'C'],
          location: 'Tel aviv',
        },
      },
    },
    second: {
      id: 'second',
      type: 'TOKEN',
      mutability: 'MUTABLE',
      data: {
        userData: {
          score: 10.99,
          subTypes: ['A', 'B'],
        },
      },
    },
    third: {
      id: 'third',
      type: 'TOKEN',
      mutability: 'SEGMENTED',
      data: {
        userData: {
          score: 8.99,
          subTypes: [],
        },
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
