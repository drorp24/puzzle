import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import { setDimensions } from './redux/app'
import { debounce } from './utility/debounce'

import { Helmet } from 'react-helmet'
import { IntlProvider } from 'react-intl'
import he from './i18n/he'
import en from './i18n/en'
import { directionByLocale } from './utility/appUtilities'

import ProtectedRoute from './auth/ProtectedRoute'
import Login from './auth/Login'
import Home from './components/Home'
import Editor from './editor/Editor'

import Direction from './layout/Direction'
import Snackbar from './communication/Snackbar'
import SimulateError from './utility/SimulateError'
import ErrorBoundary from './utility/ErrorBoundary'

import { StylesProvider } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import useTheme from './styling/useTheme'

export default function App() {
  const { mode, locale } = useSelector(store => store.app)
  const direction = directionByLocale(locale)
  const theme = useTheme({ mode, direction })
  const messages = { he, en }
  const dispatch = useDispatch()

  useEffect(() => {
    window.theme = theme // ToDo: remove

    function handleResize() {
      dispatch(
        setDimensions({
          height: window.innerHeight,
          width: window.innerWidth,
        })
      )
    }
    // ToDo: try replacing debounce with requestAnimationFrame
    window.addEventListener('resize', debounce(handleResize, 300))
    return () => {
      window.removeEventListener('resize', debounce(handleResize, 300))
    }
  }, [dispatch, theme])

  return (
    <StylesProvider injectFirst>
      <Helmet>
        <html lang={locale} />
        <body dir={direction} />
      </Helmet>
      <Direction locale={locale}>
        <IntlProvider
          messages={messages[locale]}
          locale={locale}
          defaultLocale="en"
          onError={() => console.error('IntlProvider Error')}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <Router>
                <Switch>
                  <ProtectedRoute exact path="/">
                    <Redirect to="/home" />
                  </ProtectedRoute>
                  <Route path="/home">
                    <Home />
                  </Route>
                  <Route path="/login">
                    <Login />
                  </Route>
                  <Route path="/editor">
                    <Editor />
                  </Route>
                  <Route path="/simulateerror">
                    <SimulateError />
                  </Route>
                </Switch>
                <Snackbar />
              </Router>
            </ErrorBoundary>
          </ThemeProvider>
        </IntlProvider>
      </Direction>
    </StylesProvider>
  )
}
