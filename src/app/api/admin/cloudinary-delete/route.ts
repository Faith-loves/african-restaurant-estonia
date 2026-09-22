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

    const body =
      await request.json();

    const publicId =
      typeof body.publicId ===
      "string"
        ? body.publicId
        : "";

    if (
      !publicId.startsWith(
        "are/menu/"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid menu image.",
        },
        {
          status: 400,
        }
      );
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          "image",

        invalidate:
          true,
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete image.",
      },
      {
        status: 401,
      }
    );
  }
}
