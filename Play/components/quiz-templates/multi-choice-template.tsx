"use client"

interface MultiChoiceItem {
  type: "multi-choice"
  question: string
  options: string[]
  correctAnswer: string
  points: number
}

interface MultiChoiceTemplateProps {
  item: MultiChoiceItem
  selectedAnswer: string | null
  isCorrect: boolean | null
  onSelectAnswer: (answer: string) => void
}

export function MultiChoiceTemplate({ item, selectedAnswer, isCorrect, onSelectAnswer }: MultiChoiceTemplateProps) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-white">{item.question}</h2>

      <div className="space-y-3 w-full">
        {item.options.map((option: string) => {
          // Determine button styling based on state
          let buttonStyle = "border-white/20 text-white hover:border-white/40"

          if (selectedAnswer === option) {
            if (isCorrect === null) {
              // Selected but not checked yet
              buttonStyle = "border-yaralex-blue bg-yaralex-blue/20 text-white"
            } else if (option === item.correctAnswer) {
              // Correct answer after checking
              buttonStyle = "border-yaralex-green bg-yaralex-green/20 text-white"
            } else {
              // Wrong answer after checking
              buttonStyle = "border-red-500 bg-red-500/20 text-white"
            }
          } else if (isCorrect !== null && option === item.correctAnswer) {
            // Show correct answer after checking
            buttonStyle = "border-yaralex-green bg-yaralex-green/20 text-white"
          }

          return (
            <button
              key={option}
              className={`w-full rounded-lg border-2 p-3 text-left transition-all ${buttonStyle}`}
              onClick={() => onSelectAnswer(option)}
              disabled={isCorrect !== null} // Only disable after checking
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
