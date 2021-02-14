import { Handle } from 'react-flow-renderer'
import entityTypes, {
  relationTypes,
  entityStyle,
  entityIconStyle,
} from '../editor/entityTypes'
import { styles } from './Relations'

export const Node = ({
  id,
  data: { name, inputs, outputs, editRelations, type },
}) => {
  const visibility = editRelations ? 'visible' : 'hidden'
  const { icon } = entityTypes[type]
  console.log('type: ', type)
  //   const css = entityStyle(type)

  return (
    <>
      {outputs &&
        outputs.map(({ source, target, type }) => (
          <Handle
            type="source"
            id={`${source}-${target}-${type}`}
            key={target}
            position="right"
            style={{
              ...styles.handleStyle,
              backgroundColor: entityTypes[relationTypes[type].entity].color,
              visibility,
            }}
          />
        ))}
      <Handle
        type="source"
        id="extraSource"
        key="extraSource"
        position="bottom"
        style={{ ...styles.handleStyle, backgroundColor: 'green', visibility }}
      />
      {!editRelations && (
        <span style={entityStyle(type)}>
          <span style={entityIconStyle(type)}>{icon}</span>
          <span>{name}</span>
        </span>
      )}
      {inputs &&
        inputs.map(({ source, target, type }) => (
          <Handle
            type="target"
            id={`${target}-${source}-${type}`}
            key={source}
            position="left"
            style={{
              ...styles.handleStyle,
              backgroundColor: entityTypes[relationTypes[type].entity].color,
              visibility,
            }}
          />
        ))}
      <Handle
        type="target"
        id="extraTarget"
        key="extraTarget"
        position="top"
        style={{ ...styles.handleStyle, backgroundColor: 'red', visibility }}
      />
    </>
  )
}
