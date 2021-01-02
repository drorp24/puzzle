/* eslint-disable react/react-in-jsx-scope */
import { FormattedMessage } from 'react-intl'
import Page from '../layout/Page'

const Dashboard = () => (
  <Page>
    <FormattedMessage id="test" defaultMessage="default message" />
  </Page>
)

export default Dashboard
