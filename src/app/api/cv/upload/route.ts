import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUserEmail } from "@/features/authentication/authService";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log(`The destination path for the blob cv upload: ${pathname}`);

        const userId = await getCurrentUserEmail();

        if (!userId) {
          throw new Error("Not authenticated");
        }

        return {
          addRandomSuffix: true,
          allowedContentTypes: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          ],
          tokenPayload: JSON.stringify({
            userId: userId,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("CV upload completed", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
