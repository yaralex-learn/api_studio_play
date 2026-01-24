"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Sample data for filters
const channels = ["All Channels", "Web", "Mobile", "Desktop"]
const sections = [
  "All Sections",
  "Web Development Fundamentals",
  "JavaScript Essentials",
  "React Fundamentals",
  "Node.js Basics",
]

const unitsBySection = {
  "All Sections": ["All Units"],
  "Web Development Fundamentals": ["All Units", "HTML Basics", "CSS Basics", "Responsive Design"],
  "JavaScript Essentials": ["All Units", "Variables and Data Types", "Control Flow", "Functions"],
  "React Fundamentals": ["All Units", "Components", "State Management", "Hooks"],
  "Node.js Basics": ["All Units", "Introduction to Node.js", "NPM", "Express Framework"],
}

const stepsByUnit = {
  "All Units": ["All Steps"],
  "HTML Basics": ["All Steps", "Introduction to HTML", "HTML Elements", "HTML Forms"],
  "CSS Basics": ["All Steps", "Introduction to CSS", "CSS Selectors", "CSS Box Model"],
  "Variables and Data Types": ["All Steps", "Introduction to Variables", "Data Types Overview", "Type Conversion"],
  Functions: ["All Steps", "Function Basics", "Function Parameters", "Arrow Functions"],
  Components: ["All Steps", "Functional Components", "Class Components", "Component Lifecycle"],
  "State Management": ["All Steps", "useState Hook", "useReducer Hook", "Context API"],
  "Introduction to Node.js": ["All Steps", "Node.js Architecture", "Event Loop", "Modules"],
  NPM: ["All Steps", "Package Management", "Package.json", "Creating Packages"],
}

interface FilterControlsProps {
  onFilterChange: (filters: {
    channel: string
    section: string
    unit: string
    step: string
  }) => void
}

export function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [channel, setChannel] = useState("All Channels")
  const [section, setSection] = useState("All Sections")
  const [unit, setUnit] = useState("All Units")
  const [step, setStep] = useState("All Steps")

  const [availableUnits, setAvailableUnits] = useState<string[]>(["All Units"])
  const [availableSteps, setAvailableSteps] = useState<string[]>(["All Steps"])

  // Update available units when section changes
  useEffect(() => {
    if (section in unitsBySection) {
      setAvailableUnits(unitsBySection[section])
      setUnit("All Units")
    } else {
      setAvailableUnits(["All Units"])
      setUnit("All Units")
    }
  }, [section])

  // Update available steps when unit changes
  useEffect(() => {
    if (unit in stepsByUnit) {
      setAvailableSteps(stepsByUnit[unit])
      setStep("All Steps")
    } else {
      setAvailableSteps(["All Steps"])
      setStep("All Steps")
    }
  }, [unit])

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange({ channel, section, unit, step })
  }, [channel, section, unit, step, onFilterChange])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="channel-filter">Channel</Label>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger id="channel-filter">
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((ch) => (
              <SelectItem key={ch} value={ch}>
                {ch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="section-filter">Section</Label>
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger id="section-filter">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((sec) => (
              <SelectItem key={sec} value={sec}>
                {sec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit-filter">Unit</Label>
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger id="unit-filter">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {availableUnits.map((un) => (
              <SelectItem key={un} value={un}>
                {un}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="step-filter">Step</Label>
        <Select value={step} onValueChange={setStep}>
          <SelectTrigger id="step-filter">
            <SelectValue placeholder="Select step" />
          </SelectTrigger>
          <SelectContent>
            {availableSteps.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
