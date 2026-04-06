import { registerElement } from '../registry'
import { CodeCluster } from './CodeCluster'
import { CodeClusterPreview } from './CodeClusterPreview'
import { CodeClusterLoading } from './CodeClusterLoading'
import Icon from './Icon'
import { codeClusterExample } from './example'
import { codeClusterDocs } from './docs'

export { CodeCluster } from './CodeCluster'
export { CodeClusterPreview } from './CodeClusterPreview'
export { CodeClusterLoading } from './CodeClusterLoading'
export { codeClusterExample } from './example'

registerElement('code_cluster', {
  component: CodeCluster,
  preview: CodeClusterPreview,
  loading: CodeClusterLoading,
  icon: Icon,
  example: codeClusterExample,
  docs: codeClusterDocs,
})
