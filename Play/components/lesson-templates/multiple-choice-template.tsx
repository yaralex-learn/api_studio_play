"use client"

interface MultipleChoiceItem {
  type: "multiple-choice"
  question: string
  options: string[]
  correctAnswer: string
}

interface MultipleChoiceTemplateProps {
  item: MultipleChoiceItem
  selectedAnswer: string | null
  isCorrect: boolean | null
  onSelectAnswer: (answer: string) => void
}

export function MultipleChoiceTemplate({
  item,
  selectedAnswer,
  isCorrect,
  onSelectAnswer,
}: MultipleChoiceTemplateProps) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-white">{item.question}</h2>

      <div className="space-y-3 w-full">
        {item.options.map((option: string) => (
          <button
            key={option}
            className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
              selectedAnswer === option
                ? option === item.correctAnswer
                  ? "border-yaralex-green bg-yaralex-green/20 text-white"
                  : "border-red-500 bg-red-500/20 text-white"
                : "border-white/20 text-white hover:border-white/40"
            }`}
            onClick={() => onSelectAnswer(option)}
            disabled={selectedAnswer !== null}
          >
            {option}
          </button>
        ))}
      </div>

      {selectedAnswer && (
        <div className={`mt-4 rounded-lg p-3 w-full ${isCorrect ? "bg-yaralex-green/20" : "bg-red-500/20"}`}>
          <p className={`font-bold ${isCorrect ? "text-yaralex-green" : "text-red-500"}`}>
            {isCorrect ? "Correct!" : "Incorrect!"}
          </p>
          <p className="text-white/80">
            {isCorrect ? "Great job! Let's continue." : `The correct answer is: ${item.correctAnswer}`}
          </p>
        </div>
      )}
    </div>
  )
}
