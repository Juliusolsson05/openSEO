export class PublishingService {
  // TODO: Publishing + company/auth related endpoints
  // Company: get, update credentials, metadata, settings
  async getCompany(_companyId: number) { throw new Error('TODO: implement getCompany') }
  async updateCompanyCredentials(_companyId: number, _payload: unknown) { throw new Error('TODO: implement updateCompanyCredentials') }
  async updateCompanyMetadata(_companyId: number, _payload: unknown) { throw new Error('TODO: implement updateCompanyMetadata') }
  async updateCompanySettings(_companyId: number, _payload: unknown) { throw new Error('TODO: implement updateCompanySettings') }

  // Blog publishing actions
  async publishPost(_companyId: number, _postId: number) { throw new Error('TODO: implement publishPost') }
  async unpublishPost(_companyId: number, _postId: number) { throw new Error('TODO: implement unpublishPost') }
}

export const publishingService = new PublishingService()
