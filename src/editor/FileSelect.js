/** @jsxImportSource @emotion/react */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFile } from '../redux/content'

import { useForm } from 'react-hook-form'

import useTranslation from '../i18n/useTranslation'

import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Folder from '@material-ui/icons/FolderOpenOutlined'

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
  textField: {
    height: '100%',
    display: 'block',
  },
  input: {
    height: '100%',
  },
}

const FileSelect = () => {
  const t = useTranslation()
  const { register, handleSubmit, setError, formState, getValues } = useForm()
  const noSuchFile = useSelector(store => !!store.content?.error)
  const dispatch = useDispatch()

  const onSubmit = async ({ file }) => {
    dispatch(setFile({ file }))
  }

  useEffect(() => {
    if (noSuchFile) setError('file', { message: t('noSuchFile') })
  }, [noSuchFile, setError, t])

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
          inputRef={register({ required: true })}
          error={!!formState.errors?.file?.message}
          helperText={formState.errors?.file && t('noSuchFile')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Folder />
              </InputAdornment>
            ),
            style: styles.input,
          }}
          style={styles.textField}
        />
      </form>
    </div>
  )
}

export default FileSelect
