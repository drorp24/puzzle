/** @jsxImportSource @emotion/react */
import { memo, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { selectContent, selectIds, updateFeedback } from '../redux/content'
import { postFeedback } from '../redux/feedback'

import { useDirection } from '../utility/appUtilities'

import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import Yes from '@material-ui/icons/ThumbUpOutlined'
import Maybe from '@material-ui/icons/HelpOutlineOutlined'
import No from '@material-ui/icons/ThumbDownOutlined'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import Info from '@material-ui/icons/InfoOutlined'
import IconButton from '@material-ui/core/IconButton'

import { useIntl } from 'react-intl'

import entityTypes from '../editor/entityTypes'
import { EntityDetails } from '../editor/EntityDetails'

import usePixels from '../utility/usePixels'
import noScrollbar from '../styling/noScrollbar'
import Spinner from '../layout/Spinner'

const styles = {
  autoSizer: {
    width: '100%',
  },
  header: {
    fontWeight: '400',
    padding: '0 1rem',
    color: '#9e9e9e',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  lightEven: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  darkEven: {
    backgroundColor: 'rgba(256, 256, 256, 0.05)',
  },
  odd: {},
  rowHover: {
    border: '3px solid rgba(0, 0, 0, 0.2)',
  },
  cell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: '1',
    // border: '1px solid',
  },
  icon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '3rem',
    width: '3rem',
    alignSelf: 'center',
  },

  selectedInfo: {
    color: '#fff',
  },
  typeIcon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '0 1rem',
  },
  tagHeader: {
    textAlign: 'center',
  },
  buttonGroup: {
    height: '2rem',
    justifySelf: 'end',
    alignSelf: 'center',
    padding: '0 1rem',
    // border: '1px solid',
  },
  selected: {
    backgroundColor: 'rgba(0, 0, 0, 0.6) !important',
    color: '#fff !important',
  },
  on: {
    backgroundColor: 'rgba(0, 0, 0, 0.6) !important',
    color: '#fff !important',
  },
  off: {
    color: 'rgba(0, 0, 0, 0.1) !important',
  },
  tagIcon: {
    fontSize: '1rem !important',
  },
  selectedTagIcon: {
    color: 'rgba(256, 256, 256, 0.2)',
  },
  selectedTagIconOn: {
    color: 'white !important',
  },
  dimText: {
    color: '#9e9e9e',
  },
  centered: {
    textAlign: 'center',
  },
}

// ToDo: make ToggleButtonGroup responsive

const Table = () => {
  // the 'entities' selector maintains entities' sort order
  const { entities, selectedId, error, isLoading } = useSelector(selectContent)
  const ids = useSelector(selectIds)
  const itemCount = entities.length
  const itemSize = usePixels(4)
  const direction = useDirection()
  const outerRef = useRef()

  useEffect(() => {
    const scrollTo = entityId => {
      if (!outerRef || !outerRef.current) return

      const index = ids.findIndex(id => id === entityId)
      const top = index * itemSize
      outerRef.current.scrollTo({ top, behavior: 'smooth' })
    }
    if (selectedId) scrollTo(selectedId)
  }, [ids, itemSize, selectedId])

  if (error?.status === 404) {
    return null
  }

  if (isLoading) return <Spinner top />

  return (
    <AutoSizer style={styles.autoSizer}>
      {({ height, width }) => {
        height -= itemSize
        return (
          <>
            <Header
              style={{ ...styles.row, ...styles.header, height: itemSize }}
            />
            <List
              overscanCount="10"
              outerRef={outerRef}
              css={noScrollbar}
              style={{ width: '100%' }}
              {...{ height, width, itemCount, itemSize, direction }}
            >
              {Row}
            </List>
          </>
        )
      }}
    </AutoSizer>
  )
}

// ToDo: style tag buttons properly when row is selected

const Row = memo(({ index, style }) => {
  const { entities, selectedId, doc_id } = useSelector(selectContent)
  const { mode } = useSelector(store => store.app)
  const dispatch = useDispatch()

  const entity = entities[index]
  const {
    type,
    data: {
      id,
      score,
      geoLocation: {
        properties: { feedback, entity_location_id },
      },
    },
    entityRanges,
  } = entity

  const { icon, color } = entityTypes[type]
  const { text } = entityRanges[0]
  // const place = geoLocation?.properties?.name || ''
  const bg =
    index % 2
      ? styles.odd
      : mode === 'light'
      ? styles.lightEven
      : styles.darkEven
  const line = { lineHeight: `${style.height}px` }

  const selectedRow = id === selectedId ? styles.selected : {}
  const selectedTagIcon = id === selectedId ? styles.selectedTagIcon : {}
  const selectedInfo = id === selectedId ? styles.selectedInfo : {}

  const tagState = {
    correct: 'off',
    not_sure: 'off',
    wrong: 'off',
  }
  tagState[feedback] = 'on'

  const tagClick = id => (e, tag) => {
    const data = {
      username: 'user_x',
      document_id: doc_id,
      entity_id: id,
      entity_location_id,
      feedback: tag,
    }

    dispatch(postFeedback(data))
      .then(unwrapResult)
      .then(() => {
        dispatch(updateFeedback(data))
      })
      .catch(error => {
        console.error(error)
      })
  }

  return (
    <div
      css={{
        ...style,
        ...styles.row,
        ...bg,
        ...line,
        ...selectedRow,
      }}
      style={style}
    >
      <Cell
        value={type}
        icon={icon}
        cellStyle={{ ...styles.cell, ...styles.typeIcon, color }}
      />
      <Cell value={text} cellStyle={{ ...styles.cell, ...styles.left }} />
      {/* <Cell value={place} /> */}
      <Cell value={score} cellStyle={{ ...styles.cell, ...styles.dimText }} />
      <Tooltip
        title={<EntityDetails {...{ entity }} />}
        arrow
        TransitionComponent={Zoom}
        disableFocusListener={true}
        placement="right"
        PopperProps={{ style: { width: '15rem' } }}
      >
        <IconButton
          style={{ ...styles.icon, ...selectedInfo, ...styles.dimText }}
        >
          <Info />
        </IconButton>
      </Tooltip>

      <ToggleButtonGroup
        value={feedback}
        exclusive
        onChange={tagClick(id)}
        size="small"
        css={styles.buttonGroup}
      >
        <ToggleButton
          value="correct"
          title="Correct"
          css={styles[tagState['correct']]}
        >
          <Yes css={{ ...styles.tagIcon, ...selectedTagIcon }} />
        </ToggleButton>
        <ToggleButton
          value="not_sure"
          title="Not_sure"
          css={styles[tagState['not_sure']]}
        >
          <Maybe css={{ ...styles.tagIcon, ...selectedTagIcon }} />
        </ToggleButton>
        <ToggleButton
          value="wrong"
          title="Wrong"
          css={styles[tagState['wrong']]}
        >
          <No css={{ ...styles.tagIcon, ...selectedTagIcon }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
})

const Header = memo(({ style }) => {
  const intl = useIntl()
  const line = { lineHeight: `${style.height}px` }

  return (
    <div style={{ ...style, ...line, ...styles.row }}>
      <Cell value={intl.formatMessage({ id: 'type' })} />
      <Cell
        value={intl.formatMessage({ id: 'entity' })}
        cellStyle={{ textAlign: 'center' }}
      />
      {/* <Cell value={intl.formatMessage({ id: 'place' })} /> */}
      <Cell
        value={intl.formatMessage({ id: 'score' })}
        cellStyle={{ textAlign: 'center' }}
      />
      <Cell
        value={intl.formatMessage({ id: 'info' })}
        cellStyle={{ textAlign: 'center' }}
      />
      <Cell
        value={intl.formatMessage({ id: 'tag' })}
        cellStyle={styles.tagHeader}
      />
    </div>
  )
})

const Cell = ({ value, icon, cellStyle }) => {
  // const alignment = typeof value === 'number' ? { textAlign: 'right' } : {}
  return (
    <div
      style={{ ...styles.cell, ...cellStyle /* ...alignment  */ }}
      title={value}
    >
      {icon || value}
    </div>
  )
}

export default Table
