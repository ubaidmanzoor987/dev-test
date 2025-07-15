import { type NextRequest } from "next/server";
import { headers } from "next/headers";
import { muxWebhookService } from "@/features/mux";

/**
 * Handles incoming Mux webhook events
 * This endpoint processes video-related events from Mux's webhook system
 *
 * @param request The incoming HTTP request from Mux's servers
 * @returns HTTP response indicating success or failure
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const body = await request.text();
    const event = await muxWebhookService.verifyWebhookEvent(body, headersList);

    switch (event.type) {
      // Upload-related events
      case "video.upload.created":
      case "video.upload.asset_created":
      case "video.upload.cancelled":
      case "video.upload.errored":
        // TODO: Handle upload events
        console.info(`Upload event: ${event.type}`, event.data);
        break;

      // Asset-related events
      case "video.asset.created":
      case "video.asset.updated":
      case "video.asset.ready":
        // TODO: Handle asset ready for playback
        console.info(`Asset ready event: ${event.type}`, event.data);
        break;

      case "video.asset.deleted":
      case "video.asset.errored":
        // TODO: Handle asset problems
        console.info(`Asset issue event: ${event.type}`, event.data);
        break;

      // For any unhandled event types
      default:
        console.warn(`Unhandled webhook type: ${event.type}`, event.data);
        break;
    }

    return Response.json({ message: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Error processing Mux webhook:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
