/** @jsxImportSource @emotion/react */

import { Switch, Route, NavLink, useRouteMatch } from 'react-router-dom'

import Page from '../layout/Page'
import Dashboard from './Dashboard'
import Locations from './Locations'

const styles = {
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr  12fr',
  },
  menu: {},
  info: {
    border: '1px solid #eee',
    '& > div': {
      height: '100%',
    },
  },
  activeStyle: {
    color: 'red',
  },
}

const routes = [
  {
    path: 'locations',
    menu: 'Locations',
    component: <Locations />,
  },
  {
    path: 'dashboard',
    menu: 'Dashboard',
    component: <Dashboard />,
  },
]

const Home = () => {
  const { url } = useRouteMatch()
  return (
    <Page css={styles.root}>
      <div css={styles.menu}>
        <nav>
          {routes.map(({ path, menu }) => (
            <p key={path}>
              <NavLink to={`${url}/${path}`} activeStyle={styles.activeStyle}>
                {menu}
              </NavLink>
            </p>
          ))}
        </nav>
      </div>
      <div css={styles.info}>
        <Switch>
          {routes.map(({ path, component }) => (
            <Route path={`${url}/${path}`} key={path}>
              {component}
            </Route>
          ))}
        </Switch>
      </div>
    </Page>
  )
}

export default Home
