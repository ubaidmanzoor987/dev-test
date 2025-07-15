import { muxClient } from "@/lib/mux/client";

export const muxUploadService = {
  createUploadUrl: async (userId: string) => {
    const result = await muxClient.createUploadUrl({
      userId: userId,
      corsOrigin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    });

    return {
      uploadId: result.uploadId,
      uploadUrl: result.uploadUrl,
    };
  },
};
