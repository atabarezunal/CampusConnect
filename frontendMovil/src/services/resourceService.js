import { ref, push, onValue, set, query, orderByChild, equalTo } from 'firebase/database'; // Añadidas nuevas importaciones
import { database } from '../config/firebase';
import { uploadFile, getFileType, formatBytes } from './fileUploadService';

export const resourceService = {
  /** Sube archivo y guarda metadatos en Realtime DB */
  async upload(uri, fileName, fileSize, userId, onProgress) {
    const type        = getFileType(fileName);
    const { url }     = await uploadFile(uri, 'resources', fileName, onProgress);
    const resourceRef = push(ref(database, 'resources'));

    const resource = {
      id:          resourceRef.key,
      title:       fileName,
      type,
      url,
      size:        formatBytes(fileSize),
      uploaded_by: userId,
      created_at: new Date().toISOString(),
    };

    await set(resourceRef, resource);
    return resource;
  },

  /** Escucha recursos en tiempo real filtrados por usuario */
  subscribe(userId, callback) {
    const resourcesRef = ref(database, 'resources');
    
    // Creamos una consulta para traer solo los del usuario actual
    const userResourcesQuery = query(
      resourcesRef,
      orderByChild('uploaded_by'),
      equalTo(userId)
    );

    // Escuchamos la consulta (userResourcesQuery) en lugar de la referencia completa
    return onValue(userResourcesQuery, (snap) => {
      if (!snap.exists()) return callback([]);
      const items = Object.values(snap.val()).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      callback(items);
    });
  },
};