import { getUploadUrl, UploadReel } from "@/features/reels";

const ReelsUploadPage = async () => {
  const result = await getUploadUrl();

  return result?.uploadUrl ? (
    <UploadReel uploadUrl={result.uploadUrl} />
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-gray-500">Failed to get upload URL</p>
    </div>
  );
};

export default ReelsUploadPage;
