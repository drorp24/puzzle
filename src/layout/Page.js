/** @jsxImportSource @emotion/react */
import Paper from '@material-ui/core/Paper'

const styles = {
  root: {
    height: '100vh',
  },
}

const Page = ({ children, ...rest }) => (
  <Paper square css={styles.root} {...rest}>
    {children}
  </Paper>
)

export default Page
