"use client"

import { useState } from "react"
import { useTasksDispatch } from "./task-context"
import type { Task } from "@/types/task"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronDown, ChevronUp, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
}

export default function TaskItem({ task }: TaskItemProps) {
  const dispatch = useTasksDispatch()
  const [expanded, setExpanded] = useState(false)

  const handleToggleComplete = () => {
    dispatch({ type: "TOGGLE_COMPLETE", payload: task.id })
  }

  const handleEdit = () => {
    dispatch({ type: "SET_EDITING", payload: task })
    // Scroll to the form
    document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      dispatch({ type: "DELETE_TASK", payload: task.id })
    }
  }

  // Check if task is overdue
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed

  // Check if task is due today
  const isToday =
    task.deadline && new Date(task.deadline).toDateString() === new Date().toDateString() && !task.completed

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Get category color
  const getCategoryColor = () => {
    switch (task.category) {
      case "work":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "personal":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "fitness":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "shopping":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      case "education":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md",
        task.completed ? "opacity-75" : "",
        isOverdue ? "border-red-500 dark:border-red-700" : "",
      )}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} className="mt-1" />
          <div className="flex-1">
            <CardTitle
              className={cn(
                "text-lg font-medium transition-all",
                task.completed ? "line-through text-gray-500 dark:text-gray-400" : "",
              )}
            >
              {task.title}
            </CardTitle>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={getPriorityColor()}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>

              <Badge variant="outline" className={getCategoryColor()}>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Badge>

              {isOverdue && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}

              {isToday && !isOverdue && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Today
                </Badge>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="ml-2">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-3">
          {task.description && (
            <CardDescription className="mt-2 text-sm whitespace-pre-wrap">{task.description}</CardDescription>
          )}

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            {task.deadline && (
              <div>
                <span className="font-medium">Deadline:</span> {format(new Date(task.deadline), "PPP")}
              </div>
            )}

            <div>
              <span className="font-medium">Created:</span> {format(new Date(task.createdAt), "PPP")}
            </div>

            {task.completed && task.completedAt && (
              <div>
                <span className="font-medium">Completed:</span> {format(new Date(task.completedAt), "PPP")}
              </div>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleEdit} disabled={task.completed}>
          <Edit size={16} className="mr-1" />
          Edit
        </Button>

        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 size={16} className="mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

