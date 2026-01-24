import Image from "next/image"

interface ImageTextItem {
  type: "image-text"
  imageUrl: string
  text: string
}

export function ImageTextTemplate({ item }: { item: ImageTextItem }) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-3xl w-full">
      <Image src={item.imageUrl || "/placeholder.svg"} alt="Lesson image" className="w-full rounded-lg object-cover" />
      <p className="text-lg text-white w-full">{item.text}</p>
    </div>
  )
}
