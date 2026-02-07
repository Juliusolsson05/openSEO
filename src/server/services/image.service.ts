export class ImageService {
  // TODO: Image endpoints: generate, regenerate, upload, stock photo search
  async generateImage(_companyId: number, _payload: unknown) { throw new Error('TODO: implement generateImage') }
  async regenerateImage(_companyId: number, _imageId: number) { throw new Error('TODO: implement regenerateImage') }
  async uploadImage(_companyId: number, _payload: unknown) { throw new Error('TODO: implement uploadImage') }
  async searchStockPhotos(_companyId: number, _query: string) { throw new Error('TODO: implement searchStockPhotos') }
}

export const imageService = new ImageService()
