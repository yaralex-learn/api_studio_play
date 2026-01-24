interface TextOnlyItem {
  type: "text-only"
  text: string
}

export function TextOnlyTemplate({ item }: { item: TextOnlyItem }) {
  return (
    <div className="flex flex-col items-center max-w-3xl w-full">
      <p className="text-xl text-white text-center w-full">{item.text}</p>
    </div>
  )
}
