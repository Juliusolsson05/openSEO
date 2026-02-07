export class QuilloService {
  // TODO: Quillo AI endpoints: analyze post, chat, analyze company, autopilot, facebook post
  async analyzePost(_companyId: number, _postId: number) { throw new Error('TODO: implement analyzePost') }
  async chat(_companyId: number, _payload: unknown) { throw new Error('TODO: implement chat') }
  async analyzeCompany(_companyId: number) { throw new Error('TODO: implement analyzeCompany') }
  async runAutopilot(_companyId: number, _payload: unknown) { throw new Error('TODO: implement runAutopilot') }
  async generateFacebookPost(_companyId: number, _postId: number) { throw new Error('TODO: implement generateFacebookPost') }
}

export const quilloService = new QuilloService()
