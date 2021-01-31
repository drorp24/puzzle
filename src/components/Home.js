/** @jsxImportSource @emotion/react */

// ToDo: look at the 'Responsive Routes' example at the react-router documentation and do what they do
// https://reactrouter.com/web/guides/philosophy/responsive-routes

import { Switch, Route, NavLink } from 'react-router-dom'

import Dashboard from './Dashboard'
import Editor from '../editor/Editor'

const styles = {
  root: {
    display: 'grid',
    gridTemplateColumns: '[menu] 3fr [dmz] 1fr [info] 6fr',
  },
  dmz: {
    gridArea: 'dmz',
    backgroundColor: 'pink',
  },
  menu: {
    gridArea: 'menu',
  },
  info: {
    gridArea: 'info',
  },
}

const Home = () => (
  <div css={styles.root}>
    <div css={styles.menu}>
      <nav>
        <p>
          <NavLink to="/home/editor" activeStyle={{ color: 'red' }}>
            Editor
          </NavLink>
        </p>
        <p>
          <NavLink to="/home/dashboard" activeStyle={{ color: 'red' }}>
            Dashboard
          </NavLink>
        </p>
      </nav>
    </div>
    <div draggable="true" />
    <div css={styles.info}>
      <Switch>
        <Route path="/home/dashboard">
          <Dashboard />
        </Route>
        <Route path="/home/editor">
          <Editor />
        </Route>
      </Switch>
    </div>
  </div>
)

export default Home
