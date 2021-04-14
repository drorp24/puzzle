/** @jsxImportSource @emotion/react */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFile, selectContent } from '../redux/content'

import { useForm } from 'react-hook-form'

import useTranslation from '../i18n/useTranslation'

import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import ChatIcon from '@material-ui/icons/ChatOutlined'
import SearchIcon from '@material-ui/icons/SearchOutlined'

const FileSelect = () => {
  const t = useTranslation()
  const { register, handleSubmit, setError, formState } = useForm()
  const file = useSelector(store => store.content.file)
  console.log('file: ', file)
  const { error, loaded } = useSelector(selectContent)
  const dispatch = useDispatch()

  const styles = {
    root: {
      height: '100%',
      '& input': {
        height: '100%',
      },
      '& .MuiFormHelperText-root.Mui-error': {
        marginTop: '-0.4rem',
        fontSize: '0.7rem',
      },
      '& .MuiFormHelperText-root': {
        marginTop: '-0.4rem',
        fontSize: '0.7rem',
      },
    },
    form: {
      height: '100%',
    },
    textField: theme => ({
      height: '100%',
      display: 'block',
      color: loaded && !error ? 'deepskyblue' : 'inherit',
    }),
    input: {
      height: '100%',
      color: 'inherit',
    },
    startAdornment: theme => ({
      color: theme.palette.text.primary,
    }),
    endAdornment: {
      '& svg': {
        fontSize: '1.2rem',
      },
    },
  }

  const onSubmit = ({ file }) => {
    dispatch(setFile({ file }))
  }

  const onChange = e => {
    console.log('e: ', e.target.value)
  }

  useEffect(() => {
    if (error) setError('file', { message: t('noSuchFile') })
  }, [error, setError, t])

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
          helperText={formState.errors?.file && t('noSuchFile')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" css={styles.startAdornment}>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" css={styles.endAdornment}>
                <ChatIcon />
              </InputAdornment>
            ),
            style: styles.input,
            onChange,
          }}
          css={styles.textField}
          style={{ display: 'block' }}
        />
      </form>
    </div>
  )
}

export default FileSelect
