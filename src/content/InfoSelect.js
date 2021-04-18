/** @jsxImportSource @emotion/react */
import useTranslation from '../i18n/useTranslation'

import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import TextIcon from '@material-ui/icons/ChatOutlined'
import TableIcon from '@material-ui/icons/TableChartOutlined'

const styles = {
  infoSelection: {
    height: '75%',
  },
  buttonGroup: {
    height: '100%',
  },
  button: {
    '& svg': {
      fontSize: '1.2rem',
    },
  },
}

const InfoSelect = ({ info, setInfo }) => {
  const t = useTranslation()

  const handleInfoSelection = (event, newInfo) => {
    setInfo(newInfo)
  }

  return (
    <div css={styles.infoSelection}>
      <ToggleButtonGroup
        value={info}
        onChange={handleInfoSelection}
        size="small"
        css={styles.buttonGroup}
      >
        {/* <ToggleButton value="map" css={styles.button}>
            <MapIcon css={styles.mapIcon} />
          </ToggleButton> */}
        <ToggleButton value="text" css={styles.button} title={t('text')}>
          <TextIcon css={styles.textIcon} />
        </ToggleButton>
        <ToggleButton value="table" css={styles.button} title={t('table')}>
          <TableIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
}

export default InfoSelect