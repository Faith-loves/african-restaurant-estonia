import {
  NextResponse,
} from "next/server";

import cloudinary from "@/lib/cloudinary";

import { requireAdminPermission } from "@/lib/server/requireAdmin";

export async function POST(
  request: Request
) {
  try {
    await requireAdminPermission(request, "manageImages");

    const timestamp =
      Math.round(
        Date.now() / 1000
      );

    const folder =
      "are/menu";

    const signature =
      cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        process.env
          .CLOUDINARY_API_SECRET!
      );

    return NextResponse.json({
      cloudName:
        process.env
          .CLOUDINARY_CLOUD_NAME,

      apiKey:
        process.env
          .CLOUDINARY_API_KEY,

      timestamp,
      folder,
      signature,
    });
  } catch (error) {
    console.error(
      "Cloudinary signature error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unauthorized or unable to create upload signature.",
      },
      {
        status: 401,
      }
    );
  }
}
