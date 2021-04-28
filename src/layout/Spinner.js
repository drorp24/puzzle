/** @jsxImportSource @emotion/react */

import { memo } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

import useTranslation from '../i18n/useTranslation'

const Spinner = ({ top = false }) => {
  const t = useTranslation()

  const styles = {
    root: theme => ({
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transform: 'scale(1.5)',
      ...(top && { position: 'relative' }),
      ...(top && { top: '-20vh' }),
    }),
    text: theme => ({
      color: theme.palette.primary.main,
      letterSpacing: '0.3rem',
    }),
  }

  return (
    <div css={styles.root}>
      <CircularProgress />
      <div css={styles.text}>{t('loading')}</div>
    </div>
  )
}

export default memo(Spinner)
