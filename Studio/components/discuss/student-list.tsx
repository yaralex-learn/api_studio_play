"use client"
import type { Student } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface StudentListProps {
  students: Student[]
  selectedStudent: Student | null
  onSelectStudent: (student: Student) => void
}

export function StudentList({ students, selectedStudent, onSelectStudent }: StudentListProps) {
  // Remove the searchQuery state and filtering logic

  return (
    <div className="flex flex-col">
      {/* Remove the search bar */}

      {/* Student list */}
      <div className="overflow-y-auto">
        {students.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No students found</div>
        ) : (
          <ul>
            {students.map((student) => (
              <li key={student.id}>
                <button
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors",
                    selectedStudent?.id === student.id && "bg-accent",
                  )}
                  onClick={() => onSelectStudent(student)}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                    <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {student.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {student.unreadCount}
                        </span>
                      )}
                      <h3 className="font-medium truncate">{student.name}</h3>
                    </div>

                    <div className="flex flex-col">
                      {student.lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {student.lastMessage.sender.id === "instructor" ? "You: " : ""}
                          {student.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No messages yet</p>
                      )}

                      {student.lastMessage && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(student.lastMessage.timestamp), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
