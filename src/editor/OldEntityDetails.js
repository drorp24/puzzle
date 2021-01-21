/** @jsxImportSource @emotion/react */

import Typography from '@material-ui/core/Typography'
import entityTypes from './entityTypes'
import Avatar from '@material-ui/core/Avatar'

export const EntityDetails = ({ entity }) => {
  const { name, icon, color } = entityTypes[entity.type]
  const comment = entity.data.userData?.comment

  const styles = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      color,
      height: '1.2rem',
    },
    name: {
      color,
      fontSize: '0.9rem',
      marginBottom: '0.5rem',
    },
    details: {
      fontWeight: '100',
      fontSize: '0.8rem',
      textAlign: 'center',
    },
  }

  return (
    <div css={styles.root}>
      <div css={styles.icon}>{icon}</div>
      <div>
        <Typography css={styles.name}>{name}</Typography>
      </div>
      <div>
        <Typography css={styles.details}>
          {comment || 'No information'}
        </Typography>
      </div>
    </div>
  )
}
