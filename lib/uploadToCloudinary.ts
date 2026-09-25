// export async function uploadToCloudinary(file: File): Promise<string> {
//   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
//   const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('upload_preset', uploadPreset);
//   formData.append('folder', 'undangan-digital/themes');

//   const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });

//   if (!res.ok) throw new Error('Upload ke Cloudinary gagal');

//   const data = await res.json();
//   return data.secure_url;
// }

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'undangan-digital/themes');

  // Tentukan resource type berdasarkan jenis file
  const resourceType = file.type.startsWith('video') ? 'video' : 'image';

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error('Cloudinary error:', errorData);
    throw new Error('Upload ke Cloudinary gagal');
  }

  const data = await res.json();

  return data.secure_url;
}
