import { httpClient } from './httpClient';

interface ICreateImageResponse {
  message: string;
}

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
) {

  const url = await httpClient.post<ICreateImageResponse>('/create-image', {
    filename: file.name,
  });

  const preSignedUrl = url.data.message;

  await httpClient.put(preSignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress({ total, loaded }) {
      const percentCompleted = Math.floor((loaded * 100) / (total ?? 1));
      onProgress?.(percentCompleted);
    },
  });
}
