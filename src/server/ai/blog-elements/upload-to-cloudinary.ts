export async function uploadToCloudinary(imageUrl: string): Promise<string | null> {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) return null;

    const body = new URLSearchParams({ file: imageUrl, upload_preset: uploadPreset, folder: 'company_logos' });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { secure_url?: string };
    return json.secure_url ?? null;
  } catch {
    return null;
  }
}
