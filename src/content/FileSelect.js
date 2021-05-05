/** @jsxImportSource @emotion/react */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFile, selectContent } from '../redux/content'

import { useForm } from 'react-hook-form'

import useTranslation from '../i18n/useTranslation'
import statusToText from './statusToText'

import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import CheckIcon from '@material-ui/icons/CheckOutlined'
import SearchIcon from '@material-ui/icons/SearchOutlined'

const FileSelect = () => {
  const t = useTranslation()
  const { register, handleSubmit, setError, formState } = useForm()
  const { error, loaded } = useSelector(selectContent)
  const dispatch = useDispatch()

  const styles = {
    root: {
      height: '100%',
      flex: '1',
      '& input': {
        height: '100%',
      },
      '& .MuiFormHelperText-root.Mui-error': {
        marginTop: '0',
        // The max space is 2vh. In a 13'' laptop, it's quite small, whereas in desktop it's too big
        fontSize: 'max(1.5vh, 0.75rem)',
        lineHeight: '2vh',
      },
      '& .MuiFormHelperText-root': {
        marginTop: '0',
        fontSize: 'max(1.5vh, 1rem)',
        lineHeight: '2vh',
      },
    },
    form: {
      height: '100%',
    },
    textField: theme => ({
      height: '100%',
      display: 'block',
      color: loaded && !error ? 'green' : error ? 'red' : 'inherit',
      '& input': {
        fontWeight: loaded && !error ? 900 : 'inherit',
      },
    }),
    Input: {
      height: '100%',
      color: 'inherit',
    },
    startAdornment: theme => ({
      color: theme.palette.text.primary,
    }),
    endAdornment: {
      '& svg': {
        fontSize: '1.2rem',
        margin: '0 0.3rem',
      },
    },
    searchIcon: theme => ({
      color: theme.palette.action.active,
    }),
  }

  const onSubmit = ({ file }) => {
    dispatch(setFile({ file }))
  }

  const onChange = e => {}

  useEffect(() => {
    if (error) {
      const { status } = error
      setError('file', { message: t(statusToText(status)) })
    }
  }, [error, formState.errors, setError, t])

  return (
    <div css={styles.root}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        autoComplete="off"
        css={styles.form}
      >
        <TextField
          variant="standard"
          margin="none"
          required
          fullWidth
          id="file"
          placeholder={t('fileSelect')}
          name="file"
          autoComplete={t('fileSelect')}
          autoFocus
          inputRef={register({ required: true, onChange })}
          error={!!formState.errors?.file?.message}
          helperText={formState.errors?.file && formState.errors?.file?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" css={styles.startAdornment}>
                <SearchIcon css={styles.searchIcon} />
              </InputAdornment>
            ),
            endAdornment: loaded && !error && (
              <InputAdornment position="end" css={styles.endAdornment}>
                <CheckIcon />
              </InputAdornment>
            ),
            style: styles.Input,
            onChange,
            inputProps: { style: { padding: 0 } },
          }}
          css={styles.textField}
          style={{ display: 'block' }}
        />
      </form>
    </div>
  )
}

export default FileSelect
