import Paper from '@material-ui/core/Paper'

const Page = ({ children, ...rest }) => (
  <Paper square style={{ height: '100vh' }} {...rest}>
    {children}
  </Paper>
)

export default Page
