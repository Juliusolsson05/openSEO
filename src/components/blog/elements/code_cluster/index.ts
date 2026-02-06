import { registerElement } from '../registry'
import { CodeCluster } from './CodeCluster'
import { CodeClusterPreview } from './CodeClusterPreview'
import { CodeClusterLoading } from './CodeClusterLoading'

export { CodeCluster } from './CodeCluster'
export { CodeClusterPreview } from './CodeClusterPreview'
export { CodeClusterLoading } from './CodeClusterLoading'

registerElement('code_cluster', {
  component: CodeCluster,
  preview: CodeClusterPreview,
  loading: CodeClusterLoading,
})
