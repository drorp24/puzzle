/** @jsxImportSource @emotion/react */

import CircularProgress from '@material-ui/core/CircularProgress'

import useTranslation from '../i18n/useTranslation'

const styles = {
  root: theme => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'scale(1.5)',
  }),
  text: {
    color: 'rgba(0, 0, 0, 0.3)',
    letterSpacing: '0.3rem',
  },
}

const Spinner = () => {
  const t = useTranslation()
  return (
    <div css={styles.root}>
      <CircularProgress />
      <div css={styles.text}>{t('loading')}</div>
    </div>
  )
}

export default Spinner
