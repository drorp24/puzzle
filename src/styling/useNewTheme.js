import { useMemo } from 'react'
import { createMuiTheme } from '@material-ui/core/styles'

const useTheme = ({ mode, direction }) =>
  useMemo(() => {
    const colors = {
      light: {
        paper: '#fff',
        backdrop: 'rgba(0, 0, 0, 0.05)',
        border: 'rgba(0, 0, 0, 0.2)',
        text: 'rgba(0, 0, 0, 0.87)',
        contrast: '#000',
        icon: 'rgba(0, 0, 0, 0.54)',
      },
      dark: {
        paper: '#3b3b3b',
        backdrop: 'rgba(0, 0, 0, 0.05)',
        border: 'rgba(256, 256, 256, 0.15)',
        text: '#9e9e9e',
        contrast: '#fff',
        icon: '#9e9e9e',
      },
    }

    return createMuiTheme({
      direction,
      palette: {
        mode,
        background: {
          paper: colors[mode].paper,
          backdrop: colors[mode].backdrop,
        },
        border: `1px solid ${colors[mode].border}`,
        text: {
          primary: colors[mode].text,
          contrast: colors[mode].contrast,
        },
        action: {
          active: colors[mode].icon,
        },
      },
    })
  }, [mode, direction])

export default useTheme
