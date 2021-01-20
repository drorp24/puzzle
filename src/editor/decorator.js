import { CompositeDecorator } from 'draft-js'

import { mentionStrategy, hashtagStrategy, entityStrategy } from './strategies'
import {
  HandleSpan as MentionSpan,
  HashtagSpan,
  EntitySpan,
} from './decoratorComponents'

const decorator = new CompositeDecorator([
  {
    strategy: entityStrategy,
    component: EntitySpan,
  },
  {
    strategy: mentionStrategy,
    component: MentionSpan,
  },
  {
    strategy: hashtagStrategy,
    component: HashtagSpan,
  },
])

export default decorator
