const parseSelection = editorState => {
  const selection = editorState.getSelection()
  const { anchorKey, anchorOffset, focusKey, focusOffset } = selection

  const content = editorState.getCurrentContent()
  const block = content.getBlockForKey(anchorKey)
  const blockKey = block.getKey()
  const selectedText = block.getText().slice(anchorOffset, focusOffset)
  return {
    content,
    blockKey,
    selection,
    selectedText,
    anchorKey,
    anchorOffset,
    focusKey,
    focusOffset,
    selectionExists: anchorOffset !== focusOffset,
    selectionSpansBlocks: anchorKey !== focusKey,
  }
}

export default parseSelection
