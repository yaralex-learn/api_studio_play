"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackIcon } from "@/components/learn-icons"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { MultiChoiceTemplate } from "@/components/quiz-templates/multi-choice-template"
import { TrueFalseTemplate } from "@/components/quiz-templates/true-false-template"
import { MatchingItemsTemplate } from "@/components/quiz-templates/matching-items-template"
import { FillBlankTemplate } from "@/components/quiz-templates/fill-blank-template"
import { ShortAnswerTemplate } from "@/components/quiz-templates/short-answer-template"
import Progress from "react-circle-progress-bar"
import { FaRegStar } from "react-icons/fa"

// Define the types of quiz items
type QuizItemType = "multi-choice" | "true-false" | "matching-items" | "fill-blank" | "short-answer"

// Define the structure for different quiz item types
interface BaseQuizItem {
  type: QuizItemType
  id: number
  question: string
  points: number
  timeLimit: number // Time limit in seconds
}

interface MultiChoiceItem extends BaseQuizItem {
  type: "multi-choice"
  options: string[]
  correctAnswer: string
}

interface TrueFalseItem extends BaseQuizItem {
  type: "true-false"
  correctAnswer: boolean
}

interface MatchingItemsItem extends BaseQuizItem {
  type: "matching-items"
  leftItems: { id: string; text: string }[]
  rightItems: { id: string; text: string }[]
  correctPairs: { left: string; right: string }[]
}

interface FillBlankItem extends BaseQuizItem {
  type: "fill-blank"
  text: string
  blanks: { id: string; answer: string }[]
}

interface ShortAnswerItem extends BaseQuizItem {
  type: "short-answer"
  correctAnswer: string
  acceptableAnswers?: string[] // Alternative correct answers
}

type QuizItem = MultiChoiceItem | TrueFalseItem | MatchingItemsItem | FillBlankItem | ShortAnswerItem

// Mock quiz data
const quizData = {
  1: {
    id: 1,
    title: "Basic Greetings Quiz",
    sectionId: 1,
    items: [
      {
        id: 1,
        type: "multi-choice",
        question: "What does 'Hola' mean?",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        correctAnswer: "Hello",
        points: 5,
        timeLimit: 20, // 20 seconds
      },
      {
        id: 2,
        type: "true-false",
        question: "In Spanish, 'Buenos días' means 'Good night'.",
        correctAnswer: false,
        points: 3,
        timeLimit: 15, // 15 seconds
      },
      {
        id: 3,
        type: "matching-items",
        question: "Match the Spanish greetings with their English translations.",
        leftItems: [
          { id: "l1", text: "Hola" },
          { id: "l2", text: "Adiós" },
          { id: "l3", text: "Buenos días" },
        ],
        rightItems: [
          { id: "r1", text: "Hello" },
          { id: "r2", text: "Goodbye" },
          { id: "r3", text: "Good morning" },
        ],
        correctPairs: [
          { left: "l1", right: "r1" },
          { left: "l2", right: "r2" },
          { left: "l3", right: "r3" },
        ],
        points: 10,
        timeLimit: 30, // 30 seconds
      },
      {
        id: 4,
        type: "fill-blank",
        question: "Complete the sentence with the correct Spanish words.",
        text: "In Spanish, ___ means hello and ___ means goodbye.",
        blanks: [
          { id: "b1", answer: "Hola" },
          { id: "b2", answer: "Adiós" },
        ],
        points: 8,
        timeLimit: 25, // 25 seconds
      },
      {
        id: 5,
        type: "short-answer",
        question: "Write a short greeting in Spanish that you would use in the morning.",
        correctAnswer: "Buenos días",
        acceptableAnswers: ["Buen día", "Buenas", "Hola"],
        points: 7,
        timeLimit: 20, // 20 seconds
      },
    ],
  },
  3: {
    id: 3,
    title: "Basic Phrases Quiz",
    sectionId: 1,
    items: [
      {
        id: 1,
        type: "multi-choice",
        question: "What does 'Gracias' mean?",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        correctAnswer: "Thank you",
        points: 5,
        timeLimit: 20, // 20 seconds
      },
      {
        id: 2,
        type: "true-false",
        question: "In Spanish, 'Por favor' means 'Thank you'.",
        correctAnswer: false,
        points: 3,
        timeLimit: 15, // 15 seconds
      },
      {
        id: 3,
        type: "matching-items",
        question: "Match the Spanish phrases with their English translations.",
        leftItems: [
          { id: "l1", text: "Gracias" },
          { id: "l2", text: "Por favor" },
          { id: "l3", text: "De nada" },
        ],
        rightItems: [
          { id: "r1", text: "Thank you" },
          { id: "r2", text: "Please" },
          { id: "r3", text: "You're welcome" },
        ],
        correctPairs: [
          { left: "l1", right: "r1" },
          { left: "l2", right: "r2" },
          { left: "l3", right: "r3" },
        ],
        points: 10,
        timeLimit: 30, // 30 seconds
      },
      {
        id: 4,
        type: "fill-blank",
        question: "Complete the sentence with the correct Spanish words.",
        text: "In Spanish, ___ means thank you and ___ means please.",
        blanks: [
          { id: "b1", answer: "Gracias" },
          { id: "b2", answer: "Por favor" },
        ],
        points: 8,
        timeLimit: 25, // 25 seconds
      },
      {
        id: 5,
        type: "short-answer",
        question: "How would you say 'You're welcome' in Spanish?",
        correctAnswer: "De nada",
        acceptableAnswers: ["No hay de qué", "Con gusto", "No hay problema"],
        points: 7,
        timeLimit: 20, // 20 seconds
      },
    ],
  },
}

// Feedback messages
const positiveFeedback = [
  "Nicely done!",
  "Great job!",
  "Perfect!",
  "Well done!",
  "Amazing!",
  "Fantastic!",
  "Brilliant!",
  "Superb!",
  "Outstanding!",
  "Wonderful!",
]

const negativeFeedback = [
  "Correct solution:",
  "The answer is:",
  "The correct answer is:",
  "It should be:",
  "The solution is:",
]

// Mock leaderboard data with avatars
const mockLeaderboard = [
  { name: "Emma S.", points: 32, avatar: "/elemental-bending.png" },
  { name: "Carlos M.", points: 29, avatar: "/bioluminescent-forest.png" },
  { name: "Sophie L.", points: 27, avatar: "/diverse-group-meeting.png" },
  { name: "Aiden T.", points: 25, avatar: "/diverse-group-meeting.png" },
  { name: "Olivia P.", points: 23, avatar: "/diverse-group-meeting.png" },
  { name: "Noah K.", points: 21, avatar: "/blue-abstract-flow.png" },
  { name: "Isabella R.", points: 19, avatar: "/blue-abstract-flow.png" },
]

// Performance rating based on score percentage
const getPerformanceRating = (percentage: number): string => {
  if (percentage >= 90) return "Excellent!"
  if (percentage >= 75) return "Great!"
  if (percentage >= 60) return "Good"
  if (percentage >= 40) return "Fair"
  return "Keep practicing"
}

export default function QuizPage({ params }: { params: { id: string; sectionId: string } }) {
  const router = useRouter()
  const quizId = Number.parseInt(params.id)
  const sectionId = Number.parseInt(params.sectionId)
  const [currentQuiz, setCurrentQuiz] = useState<any>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [hearts, setHearts] = useState(5) // Number of hearts/lives
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [earnedXP, setEarnedXP] = useState(0)

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [timePercentage, setTimePercentage] = useState<number>(100)
  const [timerActive, setTimerActive] = useState<boolean>(false)

  // State for different question types
  const [selectedMultiChoice, setSelectedMultiChoice] = useState<string | null>(null)
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null)
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([])
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<string, string>>({})
  const [shortAnswer, setShortAnswer] = useState("")

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [correctAnswerText, setCorrectAnswerText] = useState<string>("")

  const [quizTime, setQuizTime] = useState(0)

  useEffect(() => {
    // Fetch quiz data based on ID
    const quiz = quizData[quizId as keyof typeof quizData]
    if (quiz) {
      setCurrentQuiz(quiz)
      // Calculate total possible points
      const total = quiz.items.reduce((sum, item) => sum + item.points, 0)
      setTotalPoints(total)
    } else {
      // Redirect to section page if quiz not found
      router.push(`/learn/section/${params.sectionId}`)
    }
  }, [quizId, params.sectionId, router])

  useEffect(() => {
    // Reset states when changing questions
    setSelectedMultiChoice(null)
    setSelectedTrueFalse(null)
    setMatchingPairs([])
    setFillBlankAnswers({})
    setShortAnswer("")
    setIsCorrect(null)
    setFeedbackMessage("")
    setCorrectAnswerText("")

    // Reset and start timer for the new question
    if (currentQuiz && currentQuiz.items[currentItemIndex]) {
      const timeLimit = currentQuiz.items[currentItemIndex].timeLimit
      setTimeRemaining(timeLimit)
      setTimePercentage(100)
      setTimerActive(true)
    }
  }, [currentItemIndex, currentQuiz])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (timerActive && timeRemaining > 0 && isCorrect === null) {
      timer = setTimeout(() => {
        const newTimeRemaining = timeRemaining - 0.1
        setTimeRemaining(newTimeRemaining)

        if (currentQuiz && currentQuiz.items[currentItemIndex]) {
          const timeLimit = currentQuiz.items[currentItemIndex].timeLimit
          const percentage = (newTimeRemaining / timeLimit) * 100
          setTimePercentage(percentage)

          // Auto-check answer when time runs out
          if (newTimeRemaining <= 0) {
            setTimerActive(false)
            // Only auto-check if an answer has been provided
            if (hasAnswer()) {
              checkAnswer()
            } else {
              // If no answer provided, treat as incorrect
              setHearts((prev) => Math.max(0, prev - 1))
              setIsCorrect(false)
              setFeedbackMessage("Time's up!")
              setWrongAnswers(wrongAnswers + 1)
              if (currentQuiz && currentQuiz.items[currentItemIndex]) {
                setCorrectAnswerText(getCorrectAnswerText(currentQuiz.items[currentItemIndex]))
              }
            }
          }
        }
      }, 100) // Update every 100ms for smoother animation
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timerActive, timeRemaining, isCorrect, currentItemIndex, currentQuiz, wrongAnswers])

  // Track total quiz time
  useEffect(() => {
    if (!quizCompleted) {
      const timer = setInterval(() => {
        setQuizTime((prevTime) => prevTime + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizCompleted])

  // Get timer bar color based on percentage
  const getTimerColor = (percentage: number): string => {
    if (percentage >= 70) return "bg-yaralex-green"
    if (percentage >= 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (!currentQuiz) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <div className="text-xl text-white">Loading quiz...</div>
      </div>
    )
  }

  const currentItem = currentQuiz.items[currentItemIndex] as QuizItem
  const progress = ((currentItemIndex + 1) / currentQuiz.items.length) * 100
  const isFirstItem = currentItemIndex === 0
  const isLastItem = currentItemIndex === currentQuiz.items.length - 1

  const handleMultiChoiceSelect = (answer: string) => {
    setSelectedMultiChoice(answer)
  }

  const handleTrueFalseSelect = (answer: boolean) => {
    setSelectedTrueFalse(answer)
  }

  const handleMatchingPairSelect = (leftId: string, rightId: string) => {
    // Check if we already have a pair with this leftId
    const existingPairIndex = matchingPairs.findIndex((pair) => pair.left === leftId)

    if (existingPairIndex !== -1) {
      // Replace the existing pair
      const newPairs = [...matchingPairs]
      newPairs[existingPairIndex] = { left: leftId, right: rightId }
      setMatchingPairs(newPairs)
    } else {
      // Add a new pair
      setMatchingPairs([...matchingPairs, { left: leftId, right: rightId }])
    }
  }

  const handleFillBlankUpdate = (blankId: string, value: string) => {
    setFillBlankAnswers({ ...fillBlankAnswers, [blankId]: value })
  }

  const handleShortAnswerUpdate = (value: string) => {
    setShortAnswer(value)
  }

  const getCorrectAnswerText = (item: QuizItem): string => {
    switch (item.type) {
      case "multi-choice":
        return item.correctAnswer
      case "true-false":
        return item.correctAnswer ? "True" : "False"
      case "matching-items":
        // For matching items, we'll just indicate it's a matching exercise
        return "See highlighted correct matches"
      case "fill-blank":
        // For fill-blank, join all the correct answers
        return item.blanks.map((blank) => blank.answer).join(", ")
      case "short-answer":
        return item.correctAnswer
      default:
        return ""
    }
  }

  const checkAnswer = () => {
    // Stop the timer
    setTimerActive(false)

    let correct = false

    switch (currentItem.type) {
      case "multi-choice":
        correct = selectedMultiChoice === currentItem.correctAnswer
        break
      case "true-false":
        correct = selectedTrueFalse === currentItem.correctAnswer
        break
      case "matching-items":
        correct =
          matchingPairs.length === currentItem.correctPairs.length &&
          currentItem.correctPairs.every((pair) =>
            matchingPairs.some((p) => p.left === pair.left && p.right === pair.right),
          )
        break
      case "fill-blank":
        correct = currentItem.blanks.every(
          (blank) => fillBlankAnswers[blank.id]?.toLowerCase() === blank.answer.toLowerCase(),
        )
        break
      case "short-answer":
        const normalizedAnswer = shortAnswer.trim().toLowerCase()
        const correctAnswer = currentItem.correctAnswer.toLowerCase()
        const acceptableAnswers = currentItem.acceptableAnswers?.map((a) => a.toLowerCase()) || []
        correct = normalizedAnswer === correctAnswer || acceptableAnswers.includes(normalizedAnswer)
        break
    }

    setIsCorrect(correct)

    if (correct) {
      setScore(score + 1)
      setEarnedPoints(earnedPoints + currentItem.points)
      setCorrectAnswers(correctAnswers + 1)
      setFeedbackMessage(positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)])
      setCorrectAnswerText("") // No need to show correct answer if the user got it right
    } else {
      setHearts((prev) => Math.max(0, prev - 1))
      setWrongAnswers(wrongAnswers + 1)
      setFeedbackMessage(negativeFeedback[Math.floor(Math.random() * negativeFeedback.length)])
      setCorrectAnswerText(getCorrectAnswerText(currentItem))
    }
  }

  const handleNext = () => {
    if (currentItemIndex < currentQuiz.items.length - 1) {
      setDirection("next")
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      // Quiz completed
      completeQuiz()
    }
  }

  const handleSkip = () => {
    // Stop the timer
    setTimerActive(false)
    // Skip the current question without checking the answer
    handleNext()
  }

  const completeQuiz = () => {
    // Calculate XP based on earned points (10x points)
    const xp = earnedPoints * 10
    setEarnedXP(xp)
    setQuizCompleted(true)
  }

  // Jump to results with random data (for testing - to be removed later)
  const jumpToResults = () => {
    // Generate random results
    const randomCorrect = Math.floor(Math.random() * (currentQuiz.items.length + 1))
    const randomWrong = currentQuiz.items.length - randomCorrect
    const randomPoints = Math.floor(Math.random() * totalPoints)

    setCorrectAnswers(randomCorrect)
    setWrongAnswers(randomWrong)
    setEarnedPoints(randomPoints)
    setEarnedXP(randomPoints * 10)

    // Complete the quiz
    setQuizCompleted(true)
  }

  const handleFinish = () => {
    // Quiz completed, redirect back to section
    router.push(`/learn/section/${params.sectionId}`)
  }

  // Check if an answer has been provided
  const hasAnswer = () => {
    switch (currentItem.type) {
      case "multi-choice":
        return selectedMultiChoice !== null
      case "true-false":
        return selectedTrueFalse !== null
      case "matching-items":
        return matchingPairs.length === currentItem.leftItems.length
      case "fill-blank":
        return currentItem.blanks.every((blank) => fillBlankAnswers[blank.id]?.trim() !== "")
      case "short-answer":
        return shortAnswer.trim() !== ""
      default:
        return false
    }
  }

  // Render the appropriate component based on the item type
  const renderItem = (item: QuizItem) => {
    const remainTime = Math.ceil(timeRemaining)

    return (
      <div className="w-full max-w-3xl mb-1">
        {/* Points badge with timer */}
        <div className="mb-4 flex justify-start items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-gray-500/20 px-3 py-1">
            <span className="text-sm font-bold text-gray-400">{item.points} points</span>
          </div>

          {/* Timer progress bar - updated with equal height, increased width, and time text */}
          <div className="relative h-7 w-40 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ${getTimerColor(timePercentage)}`}
              style={{ width: `${timePercentage}%`, opacity: remainTime === 0 ? 0 : 1 }}
            ></div>
            {/* Time remaining text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold text-white z-10 ${remainTime === 0 ? "text-red-500" : ""}`}>
                {remainTime === 0 ? "Time's up!" : `${remainTime} ${remainTime === 1 ? "Second" : "Seconds"}`}
              </span>
            </div>
          </div>
        </div>

        {/* Question content */}
        {item.type === "multi-choice" && (
          <MultiChoiceTemplate
            item={item}
            selectedAnswer={selectedMultiChoice}
            isCorrect={isCorrect}
            onSelectAnswer={handleMultiChoiceSelect}
          />
        )}
        {item.type === "true-false" && (
          <TrueFalseTemplate
            item={item}
            selectedAnswer={selectedTrueFalse}
            isCorrect={isCorrect}
            onSelectAnswer={handleTrueFalseSelect}
          />
        )}
        {item.type === "matching-items" && (
          <MatchingItemsTemplate
            item={item}
            selectedPairs={matchingPairs}
            isCorrect={isCorrect}
            onSelectPair={handleMatchingPairSelect}
          />
        )}
        {item.type === "fill-blank" && (
          <FillBlankTemplate
            item={item}
            answers={fillBlankAnswers}
            isCorrect={isCorrect}
            onUpdateAnswer={handleFillBlankUpdate}
          />
        )}
        {item.type === "short-answer" && (
          <ShortAnswerTemplate
            item={item}
            answer={shortAnswer}
            isCorrect={isCorrect}
            onUpdateAnswer={handleShortAnswerUpdate}
          />
        )}
      </div>
    )
  }

  // Calculate performance metrics for the results page
  const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const performanceRating = getPerformanceRating(scorePercentage)

  return (
    <div className="min-h-screen bg-yaralex-background pb-20">
      {/* Top progress bar with back button and hearts */}
      <div className="sticky top-0 z-30 bg-yaralex-background pt-6 pb-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4 py-3 px-4">
          <Link
            href={`/learn/section/${params.sectionId}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <BackIcon className="h-6 w-6 text-white" />
          </Link>

          <div className="relative flex-1 h-3">
            <div className="absolute inset-0 rounded-full bg-[#1E2B31]" style={{ height: "12px" }}></div>
            <motion.div
              className="absolute inset-0 rounded-full bg-yaralex-green origin-left"
              initial={{ width: `${(currentItemIndex / currentQuiz.items.length) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ height: "12px" }}
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center">
              <Image src="/images/heart.png" alt="Hearts" width={24} height={24} />
            </div>
            <span className="text-lg font-bold text-white">{hearts}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      {quizCompleted ? (
        <div className="max-w-5xl mx-auto py-12 px-4">
          <h1 className="mb-8 text-3xl font-bold text-white text-center">Quiz Completed!</h1>

          {/* Custom Arc Progress Bar with score and max score */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Progress
                className="w-[16rem] h-[16rem]"
                progress={scorePercentage}
                reduction={0.3}
                strokeWidth={12}
                background="#1E2B31"
                gradient={[
                  { stop: 0.0, color: "#58CC02" },
                  { stop: 1, color: "#58CC02" },
                ]}
                hideValue
                hideBall
              />

              <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-2">
                <FaRegStar className="fill-white opacity-[0.3]" size={21} />
                <span className="text-sm text-white opacity-[0.3]">POINTS</span>
                <span className="text-6xl font-bold text-white">{earnedPoints}</span>
                <span className="text-md font-bold text-white">MAX: {totalPoints}</span>
              </div>
            </div>

            {/* Cards with additional information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              {/* Correct Answers Card */}
              <div className="bg-[#1E2B31] rounded-lg p-4 text-center">
                <h3 className="text-white/70 text-xs uppercase mb-1">Correct Answers</h3>
                <p className="text-3xl font-bold text-white">{correctAnswers}</p>
              </div>

              {/* Wrong Answers Card */}
              <div className="bg-[#1E2B31] rounded-lg p-4 text-center">
                <h3 className="text-white/70 text-xs uppercase mb-1">Wrong Answers</h3>
                <p className="text-3xl font-bold text-white">{wrongAnswers}</p>
              </div>

              {/* Quiz Time Card */}
              <div className="bg-[#1E2B31] rounded-lg p-4 text-center">
                <h3 className="text-white/70 text-xs uppercase mb-1">Time</h3>
                <p className="text-3xl font-bold text-white">
                  {Math.floor(quizTime / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(quizTime % 60).toString().padStart(2, "0")}
                </p>
              </div>

              {/* XP Earned Card */}
              <div className="bg-[#1E2B31] rounded-lg p-4 text-center">
                <h3 className="text-white/70 text-xs uppercase mb-1">XP Earned</h3>
                <p className="text-3xl font-bold text-white">{earnedXP}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handleFinish}
                className="bg-yaralex-green px-8 py-3 text-black font-bold hover:bg-yaralex-green/90"
              >
                Return to Section
              </Button>
              <Button
                onClick={() => router.push(`/learn/section/${params.sectionId}/lesson/${Number(params.id) + 1}`)}
                className="bg-yaralex-blue px-8 py-3 text-black font-bold hover:bg-yaralex-blue/90"
              >
                Go to Next Step
              </Button>
            </div>

            {/* Leaderboard */}
            <div className="mt-12 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Top Students</h2>
              <div className="bg-[#1E2B31] rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 border-b border-white/10 text-sm font-medium text-white/70">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-7">Student</div>
                  <div className="col-span-4 text-right">Points</div>
                </div>
                {mockLeaderboard.slice(0, 10).map((student, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-12 gap-2 p-3 items-center ${
                      index < mockLeaderboard.length - 1 ? "border-b border-white/10" : ""
                    } hover:bg-white/5 transition-colors`}
                  >
                    <div className="col-span-1 font-bold text-white">{index + 1}</div>
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={student.avatar || "/placeholder.svg"}
                          alt={student.name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <span className="text-white">{student.name}</span>
                    </div>
                    <div className="col-span-4 text-right font-bold text-white">{student.points} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto py-12 px-4 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentItemIndex}
              initial={{
                opacity: 0,
                x: direction === "next" ? 54 : -54,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.1, ease: ["easeOut", "easeIn"] }}
              className="flex justify-center items-center min-h-[50vh] w-full"
            >
              {renderItem(currentItem)}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Fixed bottom bar with Check/Skip buttons */}
      {!quizCompleted && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-20 border-t-2 transition-all duration-300 ${
            isCorrect !== null ? "bg-[#202f36] border-[#202f36]" : "bg-yaralex-background border-[#4B4B4B]"
          }`}
        >
          <div className="max-w-5xl mx-auto flex justify-between items-center py-8">
            {/* Left side: Skip button or feedback */}
            <div>
              {isCorrect === null ? (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="bg-transparent hover:bg-black/10 border-2 border-[#4B4B4B] !text-[#4B4B4B] text-[1rem] font-bold px-[2.5rem] py-6 rounded-xl"
                >
                  SKIP
                </Button>
              ) : (
                <div className="flex items-center">
                  {/* Feedback icon and message */}
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#131f24] me-6">
                      {isCorrect ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="3rem"
                          height="3rem"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-yaralex-green"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="3rem"
                          height="3rem"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-[1.5rem] ${isCorrect ? "text-yaralex-green" : "text-red-500"}`}>
                        {feedbackMessage}
                      </span>
                      {!isCorrect && correctAnswerText && <span className="text-red-500">{correctAnswerText}</span>}
                      <button className="mt-4 text-sm text-white/60 hover:text-white/80 flex items-center gap-1 text-left">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                          <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                        REPORT
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Check button or Next button */}
            <div>
              {isCorrect === null ? (
                <Button
                  onClick={checkAnswer}
                  disabled={!hasAnswer()}
                  className={`${
                    hasAnswer()
                      ? "bg-yaralex-green hover:bg-yaralex-green/90 text-[#131F24]"
                      : "bg-yaralex-green/50 text-[#131F24]/50 cursor-not-allowed"
                  } text-[1rem] font-bold px-[2.5rem] py-6 rounded-xl`}
                >
                  CHECK
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-yaralex-green border-2 border-yaralex-green hover:bg-yaralex-green/90 text-[#131F24] text-[1rem] font-bold px-[2.5rem] py-6 rounded-xl"
                >
                  {isLastItem ? "COMPLETE" : "NEXT"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
