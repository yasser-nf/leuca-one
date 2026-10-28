import imageCompression from "browser-image-compression";

const MAX_WIDTH_OR_HEIGHT = 1600;
const MAX_SIZE_MB = 0.3;

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    maxSizeMB: MAX_SIZE_MB,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.8,
  });
  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([compressed], name, { type: "image/jpeg" });
}
