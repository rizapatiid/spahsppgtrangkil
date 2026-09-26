export async function uploadToCloudinaryClient(
  file: File,
  folder: string = "sppg_trangkil",
  onProgress?: (progress: number) => void
): Promise<string> {
  // 1. Get Signature
  const res = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get upload signature');
  }
  
  const { timestamp, signature, apiKey, cloudName } = await res.json();

  // 2. Upload via XMLHttpRequest to get progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    xhr.open("POST", url, true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch(e) {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.error?.message || "Upload failed"));
        } catch(e) {
          reject(new Error("Upload failed with status: " + xhr.status));
        }
      }
    };
    
    xhr.onerror = () => reject(new Error("Network error during upload"));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    xhr.send(formData);
  });
}
