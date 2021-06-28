/** @jsxImportSource @emotion/react */
import { useState, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleDrawer, toggleLocale, toggleMode, markDrawerTransitionDone } from '../redux/app'
import { logout } from '../redux/users'
import useUser from '../auth/useUser'

import {
  Switch,
  Route,
  Link,
  useRouteMatch,
  useLocation,
} from 'react-router-dom'

import { useLocale, useMode } from '../utility/appUtilities'
import useTheme from '../styling/useTheme'

import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined'
import SwitchRightOutlinedIcon from '@material-ui/icons/SwitchRightOutlined'
import DarkModeOutlinedIcon from '@material-ui/icons/DarkModeOutlined'
import LightModeOutlinedIcon from '@material-ui/icons/LightModeOutlined'
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import Logout from '@material-ui/icons/PowerSettingsNewOutlined'
import Button from '@material-ui/core/Button'
import UserIcon from '@material-ui/icons/PersonOutlineOutlined'

import useTranslation from '../i18n/useTranslation'
import containsHeb from '../utility/containsHeb'

import Page from '../layout/Page'
import Dashboard from './Dashboard'
import File from './File'
import Locations from './Locations'

const Home = () => {
  const { url } = useRouteMatch()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const open = useSelector(store => store.app.drawerOpen)
  const { mode } = useMode()
  const { direction, rtl, ltr } = useLocale()
  const theme = useTheme({ mode, direction })
  const { username } = useUser()
  const t = useTranslation()

  const [dir, setDir] = useState(direction)

  const drawerWidth = {}
  const routeWidth = {}
  drawerWidth.open = '12%'
  routeWidth.open = '88%'
  const menuItem = { padding: 1, icon: 1.5 }
  drawerWidth.close = `calc(2*${menuItem.padding}rem + ${menuItem.icon}rem)`
  routeWidth.close = `calc(100vw - (2*${menuItem.padding}rem + ${menuItem.icon}rem))`

  const greyShade = '600'

  const styles = {
    root: {
      display: 'flex',
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      height: '100%',
    },
    drawer: {
      width: open ? drawerWidth.open : drawerWidth.close,
      transition: 'width 0.5s',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    link: {
      textDecoration: 'none',
    },
    chevronItem: theme => ({
      display: 'flex',
      justifyContent: open ? 'flex-end' : 'center',
      borderRadius: '0',
      padding: '0',
      marginLeft: rtl ? 'inherit' : open ? '0' : '-0.5rem',
      marginRight: ltr ? 'inherit' : open ? '0' : '-0.5rem',
      '& svg': {
        fontSize: '2rem !important',
        transform: `rotate(${(open && ltr) || (!open && rtl) ? 0 : 180}deg)`,
        transition: 'transform 0.5s',
        color: theme.palette.grey[greyShade],
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        '& svg': {
          color: 'white',
        },
      },
    }),
    iconWrapper: theme => ({
      display: 'flex',
      padding: `${menuItem.padding}rem`,
      '& svg': {
        fontSize: `${menuItem.icon}rem`,
      },
      '& svg[data-testid="SwitchRightOutlinedIcon"]': {
        transform: `rotate(${dir === 'rtl' ? 180 : 0}deg)`,
        transition: 'transform 0.5s',
      },
    }),
    drawerItem: theme => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderRadius: '0',
      padding: '0',
      color: theme.palette.grey[greyShade],
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'white !important',
        '& svg': {
          color: 'white !important',
        },
      },
      '&:last-of-type': {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        color: username ? theme.palette.primary.main : 'inherit',
        '& > span': {
          display: 'flex',
          justifyContent: 'flex-start',
        },
        '&:hover': {
          backgroundColor: 'inherit',
          color: 'inherit !important',
          '& svg': {
            color: 'inherit !important',
          },
        },
      },
    }),
    title: {
      margin: '0 2px',
    },
    transformedTitle: {
      position: 'relative',
      right: '-3.3rem',
      top: '-4.5rem',
      transform: 'rotate(270deg)',
      fontSize: '1.2rem !important',
      fontWeight: '400',
    },
    route: {
      width: open ? routeWidth.open : routeWidth.close,
      transition: 'width 1s',
      zIndex: '0',
      '& > div': {
        height: '100%',
      },
    },
  }

  const routes = [
    // {
    //   path: 'file',
    //   component: <File />,
    //   icon: <Folder />,
    //   title: t('file'),
    //   color:
    //     pathname === '/home/file'
    //       ? theme.palette.menu.active
    //       : theme.palette.menu.inactive,
    // },
    {
      path: 'locations',
      component: <Locations />,
      icon: <ChatOutlinedIcon />,
      title: t('locations'),
      color:
        pathname === '/home/locations'
          ? theme.palette.menu.active
          : theme.palette.menu.inactive,
    },
    // {
    //   path: 'dashboard',
    //   component: <Dashboard />,
    //   icon: <DashboardOutlinedIcon />,
    //   title: t('dashboard'),
    //   color:
    //     pathname === '/home/dashboard'
    //       ? theme.palette.menu.active
    //       : theme.palette.menu.inactive,
    // },
  ]
  const toggles = [
    {
      key: 'lang',
      icon: <SwitchRightOutlinedIcon />,
      onClick: () => {
        setDir(dir => (dir === 'ltr' ? 'rtl' : 'ltr'))
        setTimeout(() => dispatch(toggleLocale()), 500)
      },
      title: t('lang'),
    },
    {
      key: 'mode',
      icon:
        mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />,
      onClick: () => dispatch(toggleMode()),
      title: t('mode'),
    },
    {
      key: 'logout',
      icon: <Logout />,
      onClick: () => dispatch(logout()),
      title: t('logout'),
    },
    {
      key: 'user',
      icon: <UserIcon />,
      onClick: () => {},
      title: username,
      transformed: true,
    },
  ]

  const handler = () => {
    dispatch(markDrawerTransitionDone())
  }
  
  return (
    <Page css={styles.root}>
      <div css={styles.drawer} >
        <nav css={styles.nav}>
          <Button
            fullWidth
            css={styles.chevronItem}
            onClick={() => {
              dispatch(toggleDrawer())
            }}
          >
            <div css={styles.iconWrapper}>
              <ChevronLeftIcon />
            </div>
          </Button>
          {routes.map(({ path, title, icon, color }) => (
            <Link to={`${url}/${path}`} css={styles.link} key={path}>
              <Button
                fullWidth
                css={styles.drawerItem}
                title={title}
                style={{ color }}
              >
                <div css={styles.iconWrapper} style={{ color }}>
                  {icon}
                </div>
                <div
                  css={styles.title}
                  style={{
                    fontSize: containsHeb(title) ? '1rem' : '0.75rem',
                  }}
                >
                  {title}
                </div>
              </Button>
            </Link>
          ))}
          {toggles.map(({ key, title, icon, transformed, onClick }) => (
            <Button
              fullWidth
              css={styles.drawerItem}
              {...{ key, onClick, title }}
            >
              <div css={styles.iconWrapper}>{icon}</div>
              <div
                css={transformed ? styles.transformedTitle : styles.title}
                style={{ fontSize: containsHeb(title) ? '1rem' : '0.7rem' }}
              >
                {title}
              </div>
            </Button>
          ))}
        </nav>
      </div>
      <div css={styles.route} onTransitionEnd={handler}>
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

export default memo(Home)
