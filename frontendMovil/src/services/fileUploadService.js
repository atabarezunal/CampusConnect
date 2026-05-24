import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadFile(uri, folder, fileName, onProgress) {
  const response = await fetch(uri);
  const blob     = await response.blob();
  const storageRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob);
    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path: task.snapshot.ref.fullPath });
      }
    );
  });
}

export function getFileType(fileName = '') {
  const ext = fileName.split('.').pop().toUpperCase();
  const map  = { PDF: 'PDF', DOC: 'DOC', DOCX: 'DOC',
                 PNG: 'IMG', JPG: 'IMG', JPEG: 'IMG',
                 GIF: 'IMG', MP4: 'VIDEO' };
  return map[ext] ?? 'FILE';
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}