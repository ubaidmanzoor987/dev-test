import { getSession } from "@/features/auth";
import { muxUploadService } from "@/features/mux";
import { createServiceContext } from "@/utils/service-utils";

const { log, handleError } = createServiceContext("ReelActions");
/**
 * Server action to get a direct upload URL for a new reel
 */
export async function getUploadUrl() {
  log.info("requesting reels upload URL");

  // Check authentication
  const session = await getSession(); // Ensure you have a function to get the session
  if (!session?.user) {
    log.warn("User not authenticated when requesting upload URL");
    throw new Error("You must be signed in to upload videos");
  }

  try {
    // Use your mux client to create an upload URL
    const { uploadId, uploadUrl } = await muxUploadService.createUploadUrl(
      session.user.id,
    );

    log.info("Upload URL created successfully", {
      uploadId,
      uploadUrl,
    });

    return { uploadId, uploadUrl };
  } catch (error) {
    handleError("requesting reels upload URL", error);
  }
}
