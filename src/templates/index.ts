import type { ComponentType } from 'react'
import type { TemplateId } from '../types'
import type { TemplateProps } from './shared'
import ModernTemplate from './ModernTemplate'
import ClassicTemplate from './ClassicTemplate'
import MinimalTemplate from './MinimalTemplate'

export const TEMPLATE_COMPONENTS: Record<
  TemplateId,
  ComponentType<TemplateProps>
> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
}
