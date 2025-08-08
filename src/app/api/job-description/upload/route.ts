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
        console.log(`The destination path for the blob jd upload: ${pathname}`);
        const userId = await getCurrentUserEmail();

        if (!userId) {
          throw new Error("Not authenticated");
        }

        return {
          addRandomSuffix: true,
          allowedContentTypes: ["application/pdf"],
          tokenPayload: JSON.stringify({
            userId: userId,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Job Description File upload completed", blob.url);
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
