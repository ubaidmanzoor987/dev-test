/**
 * Options for creating a new Mux upload URL
 */
export type MuxUploadOptions = {
  /** User ID associated with this upload */
  userId: string;
  /** CORS origin allowed for the upload, defaults to "*" */
  corsOrigin?: string;
};

/**
 * Response from creating a Mux upload URL
 */
export type MuxUploadResponse = {
  /** The unique ID of the upload */
  uploadId: string;
  /** The URL where the client can upload the video */
  uploadUrl: string;
};

/**
 * Types of signed URLs that can be generated for Mux assets
 */
export type SignedUrlTypes =
  | "video"
  | "thumbnail"
  | "gif"
  | "storyboard"
  | "stats"
  | "drm_license";
