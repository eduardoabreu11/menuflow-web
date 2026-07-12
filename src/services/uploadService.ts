import { apiFetch, getApiErrorMessage } from "./api";

export type UploadedMedia = {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video";
  width: number | null;
  height: number | null;
  format: string;
  bytes: number;
  duration: number | null;
  original_filename: string;
};

type UploadImageParams = {
  file: File;
  folder?: string;
};

type UploadVideoParams = {
  file: File;
  folder?: string;
};

export async function uploadImage({
  file,
  folder = "serviu/uploads",
}: UploadImageParams): Promise<UploadedMedia> {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("folder", folder);

  const response = await apiFetch("/uploads/image", {
    method: "POST",
    body: formData,
    skipJsonContentType: true,
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao fazer upload da imagem"),
    );
  }

  return response.json();
}

export async function uploadVideo({
  file,
  folder = "serviu/videos",
}: UploadVideoParams): Promise<UploadedMedia> {
  const formData = new FormData();

  formData.append("video", file);
  formData.append("folder", folder);

  const response = await apiFetch("/uploads/video", {
    method: "POST",
    body: formData,
    skipJsonContentType: true,
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao fazer upload do vídeo"),
    );
  }

  return response.json();
}