interface AudioTextItem {
  type: "audio-text"
  audioUrl: string
  text: string
}

export function AudioTextTemplate({ item }: { item: AudioTextItem }) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-3xl w-full">
      <div className="w-full p-4 rounded-lg bg-[#1E2B31] flex items-center justify-between">
        <button className="h-12 w-12 rounded-full bg-yaralex-green flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <div className="flex-1 mx-4 h-2 bg-white/20 rounded-full">
          <div className="h-full w-0 bg-white rounded-full"></div>
        </div>
        <span className="text-white">0:00</span>
      </div>
      <p className="text-lg text-white w-full">{item.text}</p>
    </div>
  )
}
