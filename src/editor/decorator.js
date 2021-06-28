import { CompositeDecorator } from 'draft-js'

import { mentionStrategy, hashtagStrategy, entityStrategy } from './strategies'
import { TextSpan, EntitySpan } from './decoratorComponents'

// const decorator = new CompositeDecorator([
//   {
//     strategy: entityStrategy,
//     component: EntitySpan,
//   },
//   {
//     strategy: mentionStrategy,
//     component: TextSpan('Mention'),
//   },
//   {
//     strategy: hashtagStrategy,
//     component: TextSpan('Hashtag'),
//   },
// ])

const decorator = (entitySpan, textSpan) => new CompositeDecorator([
  {
    strategy: entityStrategy,
    component: entitySpan,
  },
  {
    strategy: mentionStrategy,
    component: textSpan('Mention'),
  },
  {
    strategy: hashtagStrategy,
    component: textSpan('Hashtag'),
  },
])

export default decorator
