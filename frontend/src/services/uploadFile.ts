import { httpClient } from './httpClient';

interface ICreateImageResponse {
  message: string;
}

export async function uploadFile(file: File) {

  const url = await httpClient.post<ICreateImageResponse>('/create-image', {
    filename: file.name,
  });

  const preSignedUrl = url.data.message;

  await httpClient.put(preSignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
}
