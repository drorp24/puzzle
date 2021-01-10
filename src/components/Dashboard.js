/** @jsxImportSource @emotion/react */
import Page from '../layout/Page'
import Drawer from './Drawer'

const styles = {
  root: theme => ({
    display: 'grid',
    width: '100%',
    height: '100%',
    backgroundColor: 'pink',
    gridTemplateRows: '10fr 40fr 50fr',
    gridTemplateColumns: '15fr 60fr 25fr',
    gridTemplateAreas: `
      "menu appBar appBar"
      "drawer chart stat"
      "drawer list list";
    `,
    gap: '10px 10px',
  }),
  menu: {
    gridArea: 'menu',
    backgroundColor: 'orange',
  },
  appBar: {
    gridArea: 'appBar',
    backgroundColor: 'green',
  },
  drawer: {
    gridArea: 'drawer',
    backgroundColor: 'yellow',
  },
  chart: {
    gridArea: 'chart',
    backgroundColor: 'blue',
  },
  stat: {
    gridArea: 'stat',
    backgroundColor: 'grey',
  },
  list: {
    gridArea: 'list',
    backgroundColor: 'purple',
  },
}

const Dashboard = () => (
  <Page>
    <div css={styles.root}>
      <div css={styles.menu} />
      <div css={styles.appBar} />
      <div css={styles.drawer}>
        <Drawer />
      </div>
      <div css={styles.chart} />
      <div css={styles.stat} />
      <div css={styles.list} />
    </div>
  </Page>
)

export default Dashboard
