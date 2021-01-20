import { useSelector } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'

import { Helmet } from 'react-helmet'
import { IntlProvider } from 'react-intl'
import he from './i18n/he'
import en from './i18n/en'

import ProtectedRoute from './auth/ProtectedRoute'
import Dashboard from './components/Dashboard'
import Login from './auth/Login'
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
  const direction = locale === 'he' ? 'rtl' : 'ltr'
  const theme = useTheme({ mode, direction })
  const messages = { he, en }

  window.theme = theme // ToDo: remove

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
          onError={() => console.log('IntlProvider Error')}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <Router>
                <Switch>
                  <Route exact path="/">
                    <Redirect to="/editor" />
                  </Route>
                  <Route path="/dashboard">
                    <Dashboard />
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
