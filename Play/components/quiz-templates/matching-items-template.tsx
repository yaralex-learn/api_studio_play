"use client"
import { useState } from "react"

interface MatchingItem {
  id: string
  text: string
}

interface MatchingItemsQuestion {
  type: "matching-items"
  question: string
  leftItems: MatchingItem[]
  rightItems: MatchingItem[]
  correctPairs: { left: string; right: string }[]
  points: number
}

interface MatchingItemsTemplateProps {
  item: MatchingItemsQuestion
  selectedPairs: { left: string; right: string }[]
  isCorrect: boolean | null
  onSelectPair: (leftId: string, rightId: string) => void
}

export function MatchingItemsTemplate({ item, selectedPairs, isCorrect, onSelectPair }: MatchingItemsTemplateProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)

  const handleLeftItemClick = (id: string) => {
    // If already selected, deselect it
    if (selectedLeft === id) {
      setSelectedLeft(null)
    } else {
      setSelectedLeft(id)
    }
  }

  const handleRightItemClick = (id: string) => {
    if (selectedLeft) {
      onSelectPair(selectedLeft, id)
      setSelectedLeft(null)
    }
  }

  const isPairSelected = (leftId: string, rightId: string) => {
    return selectedPairs.some((pair) => pair.left === leftId && pair.right === rightId)
  }

  const isLeftSelected = (id: string) => {
    return selectedLeft === id
  }

  const isLeftPaired = (id: string) => {
    return selectedPairs.some((pair) => pair.left === id)
  }

  const isRightPaired = (id: string) => {
    return selectedPairs.some((pair) => pair.right === id)
  }

  // Find the correct right item for a given left item
  const getCorrectRightId = (leftId: string) => {
    const correctPair = item.correctPairs.find((pair) => pair.left === leftId)
    return correctPair?.right || null
  }

  // Check if a pair is correct
  const isPairCorrect = (leftId: string, rightId: string) => {
    return item.correctPairs.some((pair) => pair.left === leftId && pair.right === rightId)
  }

  // Get the styling for a left item
  const getLeftItemStyle = (leftId: string) => {
    if (isCorrect === null) {
      if (isLeftSelected(leftId)) {
        return "border-yaralex-blue bg-yaralex-blue/20 text-white"
      } else if (isLeftPaired(leftId)) {
        return "border-yaralex-blue bg-yaralex-blue/20 text-white"
      } else {
        return "border-white/20 text-white hover:border-white/40"
      }
    } else {
      // After checking
      if (isLeftPaired(leftId)) {
        const pair = selectedPairs.find((p) => p.left === leftId)
        if (pair && isPairCorrect(leftId, pair.right)) {
          return "border-yaralex-green bg-yaralex-green/20 text-white"
        } else {
          return "border-red-500 bg-red-500/20 text-white"
        }
      } else {
        return "border-white/20 text-white"
      }
    }
  }

  // Get the styling for a right item
  const getRightItemStyle = (rightId: string) => {
    if (isCorrect === null) {
      if (isRightPaired(rightId)) {
        return "border-yaralex-blue bg-yaralex-blue/20 text-white"
      } else {
        return "border-white/20 text-white hover:border-white/40"
      }
    } else {
      // After checking
      const pair = selectedPairs.find((p) => p.right === rightId)
      if (pair && isPairCorrect(pair.left, rightId)) {
        return "border-yaralex-green bg-yaralex-green/20 text-white"
      } else if (pair) {
        return "border-red-500 bg-red-500/20 text-white"
      } else {
        return "border-white/20 text-white"
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-white">{item.question}</h2>

      <div className="flex gap-8 w-full">
        {/* Left column */}
        <div className="flex-1 space-y-3">
          {item.leftItems.map((leftItem) => (
            <button
              key={leftItem.id}
              className={`w-full rounded-lg border-2 p-3 text-left transition-all ${getLeftItemStyle(leftItem.id)}`}
              onClick={() => handleLeftItemClick(leftItem.id)}
              disabled={isCorrect !== null || (isLeftPaired(leftItem.id) && !isLeftSelected(leftItem.id))}
            >
              {leftItem.text}
            </button>
          ))}
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-3">
          {item.rightItems.map((rightItem) => (
            <button
              key={rightItem.id}
              className={`w-full rounded-lg border-2 p-3 text-left transition-all ${getRightItemStyle(rightItem.id)}`}
              onClick={() => handleRightItemClick(rightItem.id)}
              disabled={isCorrect !== null || isRightPaired(rightItem.id) || !selectedLeft}
            >
              {rightItem.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
