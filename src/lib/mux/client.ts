import Mux from "@mux/mux-node";
import type {
  MuxUploadOptions,
  MuxUploadResponse,
  SignedUrlTypes,
} from "./types";
import type { HeadersLike } from "@mux/mux-node/core.mjs";
import { clientOptions } from "@/config/mux";

/**
 * Get a Mux client instance configured with the environment variables.
 * Avoids singletons to ensure fresh instances in serverless environments.
 * @returns A Mux client instance
 */
const getMuxClient = (): Mux => new Mux(clientOptions);

/**
 * A client for interacting with the Mux API
 */
export const muxClient = {
  /**
   * Create a new upload URL for direct uploads to Mux
   *
   * @param userId - The ID of the user uploading the video
   * @param corsOrigin - The CORS origin allowed for this upload
   * @returns An object containing the upload ID and URL
   */
  async createUploadUrl({
    userId,
    corsOrigin = "*",
  }: MuxUploadOptions): Promise<MuxUploadResponse> {
    try {
      const mux = getMuxClient();

      // Create a direct upload URL using the Mux API
      const upload = await mux.video.uploads.create({
        cors_origin: corsOrigin,
        new_asset_settings: {
          playback_policy: ["signed"],
          passthrough: JSON.stringify({
            userId,
          }),
        },
      });

      return { uploadId: upload.id, uploadUrl: upload.url };
    } catch (error) {
      console.error("Failed to create Mux upload:", error);
      throw new Error(
        error instanceof Error
          ? `Mux upload creation failed: ${error.message}`
          : "Mux upload creation failed",
      );
    }
  },

  /**
   * Generate a signed playback URL with an expiration
   *
   * @param playbackId - The Mux playback ID
   * @param expiresInSeconds - How long the token should be valid
   * @param type - Type of token (video, thumbnail, gif)
   * @param params - Parameters to include in the JWT token
   */
  async getSignedPlaybackUrl(
    playbackId: string,
    expiresInSeconds = 3600,
    type: SignedUrlTypes = "video",
    params?: Record<string, string>,
  ): Promise<string> {
    try {
      const mux = getMuxClient();

      // Create a signed JWT token for the playback
      const jwt = await mux.jwt.signPlaybackId(playbackId, {
        expiration: `${Math.floor(Date.now() / 1000) + expiresInSeconds}`,
        type: [type],
        // Include any parameters in the token, not the URL
        ...(params ? { params } : {}),
      });

      const jwtToken =
        typeof jwt === "string"
          ? jwt
          : typeof jwt === "object" && jwt && "token" in jwt
            ? String(jwt.token)
            : "";

      // Ensure we have a valid JWT token
      if (!jwtToken) {
        throw new Error("Failed to generate JWT token for playback ID");
      }

      // Construct the correct signed URL format
      let baseUrl: string;
      if (type === "video") {
        baseUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      } else if (type === "thumbnail") {
        baseUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      } else if (type === "gif") {
        baseUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      } else {
        baseUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      }

      return `${baseUrl}?token=${jwtToken}`;
    } catch (error) {
      console.error(`Failed to generate signed URL for ${playbackId}:`, error);
      throw new Error(
        error instanceof Error
          ? `Failed to generate signed URL: ${error.message}`
          : "Failed to generate signed URL",
      );
    }
  },

  /**
   * Generate a signed thumbnail URL for a video at a specific time
   *
   * @param playbackId - The Mux playback ID
   * @param options - Options for the thumbnail URL
   * @returns The signed thumbnail URL
   */
  getSignedThumbnailUrl(
    playbackId: string,
    options?: {
      time?: number;
      width?: number;
      height?: number;
      fit?: "crop" | "cover" | "fill";
      expiresInSeconds?: number;
    },
  ): Promise<string> {
    const {
      time = 0,
      width,
      height,
      fit = "crop",
      expiresInSeconds = 3600,
    } = options ?? {};

    // Collect parameters for the JWT
    const params: Record<string, string> = { time: `${time}` };
    if (width) params.width = `${width}`;
    if (height) params.height = `${height}`;
    if (fit) params.fit_mode = fit;

    // Create a signed URL with parameters included in the JWT
    return this.getSignedPlaybackUrl(
      playbackId,
      expiresInSeconds,
      "thumbnail",
      params,
    );
  },

  /**
   * Generate a thumbnail URL for a video at a specific time
   *
   * @param playbackId - The Mux playback ID
   * @param options - Options for the thumbnail URL
   * @returns The thumbnail URL
   */
  getThumbnailUrl(
    playbackId: string,
    options?: {
      time?: number;
      width?: number;
      height?: number;
      fit?: "crop" | "cover" | "fill";
    },
  ): string {
    const { time = 0, width, height, fit = "crop" } = options ?? {};

    let url = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}`;

    if (width) url += `&width=${width}`;
    if (height) url += `&height=${height}`;
    if (fit) url += `&fit_mode=${fit}`;

    return url;
  },

  /**
   * Errors if the Mux webhook signature is invalid
   *
   * @param signature Signature to validate
   * @param headers Headers from the request
   * @returns true if the signature is valid
   * @throws Error if the signature is invalid
   */
  verifyWebhookSignature(signature: string, headers: HeadersLike): boolean {
    const mux = getMuxClient();

    try {
      // Pass the webhook secret from config
      mux.webhooks.verifySignature(signature, headers);

      return true;
    } catch (error: unknown) {
      console.error("Failed to verify Mux webhook signature:", error);
      throw new Error(
        error instanceof Error
          ? `Mux webhook verification failed: ${error.message}`
          : "Mux webhook verification failed",
      );
    }
  },

  /**
   * Unwraps a Mux webhook payload
   *
   * @param body The raw body of the webhook request
   * @param headers Headers from the request
   * @returns The unwrapped webhook payload
   */
  unwrapWebhook(body: string, headers: HeadersLike) {
    const mux = getMuxClient();
    const event = mux.webhooks.unwrap(body, headers);

    if (!event) {
      throw new Error("Failed to unwrap Mux webhook payload");
    }

    return event;
  },
};
