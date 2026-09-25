export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const CLOUD_NAME = "z1awtcu6"; // Ganti dengan cloud name lu
  const UPLOAD_PRESET = "taskflow_profil"; // Ganti dengan preset lu

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Gagal upload:", error);
    return null;
  }
};

export const getOptimizedImageUrl = (url: string, format = "f_avif"): string => {
  if (!url) return "";
  
  // c_thumb  = Crop gambar jadi thumbnail
  // g_face   = Fokuskan potongan otomatis ke wajah (Face Detection AI)
  // w_400, h_400 = Ubah ukuran fix jadi 400x400 pixel (biar ringan banget)
  const optimizationParams = `c_thumb,g_face,w_400,h_400,${format}`;
  
  return url.replace("/upload/", `/upload/${optimizationParams}/`);
};
