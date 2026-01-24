interface VideoTextItem {
  type: "video-text"
  videoUrl: string
  text: string
}

export function VideoTextTemplate({ item }: { item: VideoTextItem }) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-3xl w-full">
      <div className="w-full rounded-lg overflow-hidden bg-black">
        <div className="aspect-video flex items-center justify-center bg-black/50">
          <p className="text-white/60">Video placeholder</p>
        </div>
      </div>
      <p className="text-lg text-white w-full">{item.text}</p>
    </div>
  )
}
