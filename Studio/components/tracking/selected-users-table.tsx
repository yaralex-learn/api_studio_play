"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from "lucide-react"

interface UserData {
  id: number
  name: string
  email: string
  avatar: string
  accuracy: number
  progress?: number
  timeSpent: number
  lastActive: string
}

interface SelectedUsersTableProps {
  users: UserData[]
  onClear: () => void
  selectionSource?: string | null
}

export function SelectedUsersTable({ users, onClear, selectionSource }: SelectedUsersTableProps) {
  if (users.length === 0) {
    return null
  }

  const getSelectionSourceLabel = () => {
    switch (selectionSource) {
      case "scatter":
        return "Scatter Plot"
      case "accuracy":
        return "Accuracy Distribution"
      case "progress":
        return "Progress Distribution"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Selected Users {selectionSource && `(from ${getSelectionSourceLabel()})`}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead className="text-right">Progress</TableHead>
              <TableHead className="text-right">Time Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={`${user.name}'s avatar`}
                      className="h-8 w-8 rounded-full"
                    />
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">{user.accuracy}%</TableCell>
                <TableCell className="text-right">{user.progress || 0}</TableCell>
                <TableCell className="text-right">{user.timeSpent} min</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
