export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const CLOUD_NAME = "z1awtcu6"; // Ganti dengan cloud name kamu
  const UPLOAD_PRESET = "taskflow_profil"; // Ganti dengan preset kamu

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status: ${res.status}`);
    }

    const data = await res.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("Gagal upload ke Cloudinary:", error);
    return null;
  }
};

export const getOptimizedImageUrl = (
  url: string, 
  width = 400, 
  height = 400, 
  format = "f_auto,q_auto"
): string => {
  if (!url || !url.includes("/upload/")) return url || "";
  
  // c_fill   = Memotong gambar dengan fokus pada area target tanpa distorsi
  // g_faces  = Deteksi khusus wajah manusia (g_faces mendeteksi banyak/semua wajah)
  // f_auto   = Format otomatis paling optimal (WebP, AVIF, dll. tergantung browser)
  // q_auto   = Kompresi kualitas gambar otomatis tanpa merusak visual
  const optimizationParams = `c_fill,g_faces,w_${width},h_${height},${format}`;
  
  return url.replace("/upload/", `/upload/${optimizationParams}/`);
};
