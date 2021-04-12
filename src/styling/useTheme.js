import { useMemo } from 'react'
import { useMode, useLocale } from '../utility/appUtilities'
import { createMuiTheme } from '@material-ui/core/styles'

const useTheme = ({ mode, direction } = {}) => {
  const { mode: currentMode } = useMode()
  const { direction: currentDirection } = useLocale()

  mode = mode || currentMode
  direction = direction || currentDirection

  return useMemo(() => {
    const colors = {
      light: {
        primary: '#97B0F8',
        paper: '#fff',
        backdrop: 'rgba(0, 0, 0, 0.05)',
        prominent: 'rgba(0, 0, 0, 0.5)',
        border: 'rgba(0, 0, 0, 0.2)',
        text: 'rgba(0, 0, 0, 0.87)',
        distinct: '#000',
        contrast: '#000',
        icon: 'rgba(0, 0, 0, 0.54)',
        active: 'rgba(0, 0, 0, 0.8)',
        inactive: '#757575',
      },
      dark: {
        primary: '#D5DDF6',
        paper: '#3b3b3b',
        backdrop: 'rgba(0, 0, 0, 0.05)',
        prominent: 'rgba(0, 0, 0, 0.5)',
        border: 'rgba(256, 256, 256, 0.15)',
        text: '#9e9e9e',
        distinct: '#bdbdbd',
        contrast: '#fff',
        icon: '#9e9e9e',
        active: '#e0e0e0',
        inactive: '#757575',
      },
    }

    return createMuiTheme({
      direction,
      palette: {
        mode,
        primary: {
          light: colors.light.primary,
          dark: colors.dark.primary,
          main: colors.light.primary,
        },
        background: {
          paper: colors[mode].paper,
          backdrop: colors[mode].backdrop,
          prominent: colors[mode].prominent,
        },
        border: `1px solid ${colors[mode].border}`,
        text: {
          primary: colors[mode].text,
          distinct: colors[mode].distinct,
          contrast: colors[mode].contrast,
        },
        action: {
          active: colors[mode].icon,
        },
        menu: {
          active: colors[mode].active,
          inactive: colors[mode].inactive,
        },
      },
    })
  }, [mode, direction])
}

export default useTheme
