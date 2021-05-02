/** @jsxImportSource @emotion/react */

const styles = {
  row: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}

const Row = ({ a, b }) => (
  <div css={styles.row}>
    <span>{a}</span>
    <span>{b}</span>
  </div>
)

const FeatureDetails = ({ details = {} }) =>
  Object.entries(details).map(([a, b]) => <Row key={a} {...{ a, b }} />)

export default FeatureDetails
