"use client"

interface ShortAnswerItem {
  type: "short-answer"
  question: string
  correctAnswer: string
  points: number
  acceptableAnswers?: string[]
}

interface ShortAnswerTemplateProps {
  item: ShortAnswerItem
  answer: string
  isCorrect: boolean | null
  onUpdateAnswer: (value: string) => void
}

export function ShortAnswerTemplate({ item, answer, isCorrect, onUpdateAnswer }: ShortAnswerTemplateProps) {
  // Function to get textarea style based on state
  const getTextareaStyle = () => {
    if (isCorrect === null) {
      return "border-white/20 focus:border-white/40"
    } else {
      return isCorrect ? "border-yaralex-green bg-yaralex-green/10" : "border-red-500 bg-red-500/10"
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-white">{item.question}</h2>

      <textarea
        value={answer}
        onChange={(e) => onUpdateAnswer(e.target.value)}
        className={`w-full rounded-lg border-2 bg-[#1E2B31] p-4 text-white focus:outline-none ${getTextareaStyle()}`}
        rows={5}
        placeholder="Type your answer here..."
        disabled={isCorrect !== null}
      />
    </div>
  )
}
