"use client"

import { useTasks } from "./task-context"
import TaskItem from "./task-item"
import { useEffect, useState } from "react"
import type { Task } from "@/types/task"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TaskList() {
  const { tasks, filter } = useTasks()
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  // Apply filters whenever tasks or filter criteria change
  useEffect(() => {
    let result = [...tasks]

    // Filter by status
    if (filter.status === "completed") {
      result = result.filter((task) => task.completed)
    } else if (filter.status === "active") {
      result = result.filter((task) => !task.completed)
    } else if (filter.status === "overdue") {
      const now = new Date()
      result = result.filter((task) => !task.completed && task.deadline && new Date(task.deadline) < now)
    }

    // Filter by priority
    if (filter.priority !== "all") {
      result = result.filter((task) => task.priority === filter.priority)
    }

    // Filter by category
    if (filter.category !== "all") {
      result = result.filter((task) => task.category === filter.category)
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
    }

    // Sort tasks: overdue first, then by deadline, then by priority
    result.sort((a, b) => {
      // Overdue tasks first
      const now = new Date()
      const aOverdue = a.deadline && new Date(a.deadline) < now && !a.completed
      const bOverdue = b.deadline && new Date(b.deadline) < now && !b.completed

      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      // Then by deadline
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (a.deadline) return -1
      if (b.deadline) return 1

      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      )
    })

    setFilteredTasks(result)
  }, [tasks, filter])

  // Check if there are any overdue tasks
  const hasOverdueTasks = tasks.some((task) => !task.completed && task.deadline && new Date(task.deadline) < new Date())

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Tasks {filteredTasks.length > 0 && `(${filteredTasks.length})`}
      </h2>

      {hasOverdueTasks && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>You have overdue tasks that need your attention.</AlertDescription>
        </Alert>
      )}

      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {filter.searchQuery || filter.status !== "all" || filter.priority !== "all" || filter.category !== "all" ? (
            <p>No tasks match your current filters.</p>
          ) : (
            <p>No tasks yet. Add a new task to get started!</p>
          )}
        </div>
      )}
    </div>
  )
}

