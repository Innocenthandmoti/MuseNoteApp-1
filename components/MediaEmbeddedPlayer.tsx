"use client";

interface MediaEmbeddedPlayerProps {
  audioUrl?: string | null;
  videoUrl?: string | null;
}

export default function MediaEmbeddedPlayer({
  audioUrl,
  videoUrl,
}: MediaEmbeddedPlayerProps) {
  // Helper to extract clean embed URLs for YouTube and Vimeo links
  const getEmbedUrl = (url: string) => {
    if (!url) return null;

    // Handle YouTube Links
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=0&rel=0`;
      }
    }

    // Handle Vimeo Links
    if (url.includes("vimeo.com")) {
      const regExp = /vimeo\.com\/(?:.*#|.*)\/?([\d]+)/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }

    // Direct Video File Link (.mp4, etc.) or pre-formatted embed link
    return url;
  };

  const videoEmbedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  const isVideoIframe =
    videoEmbedUrl?.includes("youtube") || videoEmbedUrl?.includes("vimeo");

  return (
    <div className="space-y-4 w-full mt-3">
      {/* 🎵 Embedded Audio Player */}
      {audioUrl && (
        <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-900/15 space-y-1.5">
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold text-amber-900 uppercase tracking-wider block">
            Audio Recording
          </span>
          <audio
            controls
            preload="metadata"
            className="w-full h-8 rounded accent-amber-900"
          >
            <source src={audioUrl} />
            Your browser does not support inline audio playback.
          </audio>
        </div>
      )}

      {/* 🎬 Embedded Video Player */}
      {videoUrl && (
        <div className="bg-stone-900 p-2 rounded-lg border border-stone-800 space-y-1.5">
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold text-amber-200 uppercase tracking-wider block px-1">
            Video Performance
          </span>

          {isVideoIframe ? (
            <div className="relative w-full aspect-video rounded overflow-hidden bg-black">
              <iframe
                src={videoEmbedUrl!}
                title="Sacred Video Performance"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            </div>
          ) : (
            /* Direct MP4 / WebM Video file */
            <video
              controls
              preload="metadata"
              className="w-full aspect-video rounded bg-black"
            >
              <source src={videoUrl} />
              Your browser does not support inline video playback.
            </video>
          )}
        </div>
      )}
    </div>
  );
}
