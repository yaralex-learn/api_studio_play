"use client"

interface FillBlankItem {
  type: "fill-blank"
  question: string
  text: string
  blanks: { id: string; answer: string }[]
  points: number
}

interface FillBlankTemplateProps {
  item: FillBlankItem
  answers: Record<string, string>
  isCorrect: boolean | null
  onUpdateAnswer: (blankId: string, value: string) => void
}

export function FillBlankTemplate({ item, answers, isCorrect, onUpdateAnswer }: FillBlankTemplateProps) {
  // Split text by blanks and create an array of text segments and blank inputs
  const parts = item.text.split("___")

  // Function to get input style based on state
  const getInputStyle = (blankId: string) => {
    if (isCorrect === null) {
      return "border-white/50 focus:border-white"
    } else {
      const isBlankCorrect =
        answers[blankId]?.toLowerCase() === item.blanks.find((b) => b.id === blankId)?.answer.toLowerCase()
      return isBlankCorrect ? "border-yaralex-green text-yaralex-green" : "border-red-500 text-red-500"
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-white">{item.question}</h2>

      <div className="text-lg text-white">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                value={answers[item.blanks[index].id] || ""}
                onChange={(e) => onUpdateAnswer(item.blanks[index].id, e.target.value)}
                className={`mx-1 w-32 border-b-2 bg-transparent px-1 text-center focus:outline-none ${getInputStyle(
                  item.blanks[index].id,
                )}`}
                disabled={isCorrect !== null}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
