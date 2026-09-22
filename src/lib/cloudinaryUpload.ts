import {
  auth,
} from "@/lib/firebase/client";

export type UploadedMenuImage = {
  secureUrl: string;
  publicId: string;
};

async function getAdminToken() {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Admin is not signed in."
    );
  }

  return user.getIdToken();
}

export async function uploadMenuImage(
  file: File
): Promise<UploadedMenuImage> {
  const token =
    await getAdminToken();

  const signatureResponse =
    await fetch(
      "/api/admin/cloudinary-signature",
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  if (
    !signatureResponse.ok
  ) {
    throw new Error(
      "Unable to authorize image upload."
    );
  }

  const {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  } =
    await signatureResponse.json();

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "api_key",
    apiKey
  );

  formData.append(
    "timestamp",
    String(timestamp)
  );

  formData.append(
    "folder",
    folder
  );

  formData.append(
    "signature",
    signature
  );

  const uploadResponse =
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method:
          "POST",

        body:
          formData,
      }
    );

  if (
    !uploadResponse.ok
  ) {
    const responseText =
      await uploadResponse.text();

    console.error(
      "Cloudinary upload failed:",
      responseText
    );

    throw new Error(
      "Image upload failed."
    );
  }

  const result =
    await uploadResponse.json();

  if (
    !result.secure_url ||
    !result.public_id
  ) {
    throw new Error(
      "Cloudinary did not return the expected image information."
    );
  }

  return {
    secureUrl:
      result.secure_url,

    publicId:
      result.public_id,
  };
}

export async function deleteMenuImage(
  publicId: string
) {
  if (!publicId) {
    return;
  }

  const token =
    await getAdminToken();

  const response =
    await fetch(
      "/api/admin/cloudinary-delete",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            publicId,
          }),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Unable to remove previous image."
    );
  }
}
