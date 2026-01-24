"use client"

interface TrueFalseItem {
  type: "true-false"
  question: string
  correctAnswer: boolean
  points: number
}

interface TrueFalseTemplateProps {
  item: TrueFalseItem
  selectedAnswer: boolean | null
  isCorrect: boolean | null
  onSelectAnswer: (answer: boolean) => void
}

export function TrueFalseTemplate({ item, selectedAnswer, isCorrect, onSelectAnswer }: TrueFalseTemplateProps) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-white">{item.question}</h2>

      <div className="flex gap-4 w-full">
        {[true, false].map((option) => {
          // Determine button styling based on state
          let buttonStyle = 'border-white/20 text-white hover:border-white/40"ext-white hover:border-white/40'

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
              key={String(option)}
              className={`flex-1 rounded-lg border-2 p-4 text-center font-bold transition-all ${buttonStyle}`}
              onClick={() => onSelectAnswer(option)}
              disabled={isCorrect !== null} // Only disable after checking
            >
              {option ? "TRUE" : "FALSE"}
            </button>
          )
        })}
      </div>
    </div>
  )
}
