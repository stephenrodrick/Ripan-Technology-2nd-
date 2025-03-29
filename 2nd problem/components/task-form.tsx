"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTasks, useTasksDispatch } from "./task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"

export default function TaskForm() {
  const { editingTask } = useTasks()
  const dispatch = useTasksDispatch()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [category, setCategory] = useState("personal")
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Reset form or populate with editing task data
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || "")
      setPriority(editingTask.priority)
      setCategory(editingTask.category)
      setDeadline(editingTask.deadline)
    } else {
      resetForm()
    }
  }, [editingTask])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("medium")
    setCategory("personal")
    setDeadline(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const taskData: Omit<Task, "id" | "completed" | "completedAt" | "createdAt"> = {
      title,
      description,
      priority,
      category,
      deadline,
    }

    if (editingTask) {
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          ...taskData,
          id: editingTask.id,
          completed: editingTask.completed,
          completedAt: editingTask.completedAt,
          createdAt: editingTask.createdAt,
        },
      })
    } else {
      dispatch({
        type: "ADD_TASK",
        payload: {
          ...taskData,
          id: Date.now().toString(),
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        },
      })
    }

    resetForm()
  }

  const handleCancel = () => {
    dispatch({ type: "CLEAR_EDITING" })
    resetForm()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        {editingTask ? "Edit Task" : "Add New Task"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Set deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline || undefined}
                  onSelect={(date) => {
                    setDeadline(date)
                    setIsOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          {editingTask && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{editingTask ? "Update Task" : "Add Task"}</Button>
        </div>
      </form>
    </div>
  )
}

