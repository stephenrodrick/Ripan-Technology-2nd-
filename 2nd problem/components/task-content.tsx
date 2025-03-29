"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect } from "react"
import type { Task, TaskFilter, TaskAction } from "@/types/task"

// Define the initial state
type TaskState = {
  tasks: Task[]
  filter: TaskFilter
  editingTask: Task | null
}

const initialState: TaskState = {
  tasks: [],
  filter: {
    status: "all",
    priority: "all",
    category: "all",
    searchQuery: "",
  },
  editingTask: null,
}

// Create the context
const TasksContext = createContext<TaskState | null>(null)
const TasksDispatchContext = createContext<React.Dispatch<TaskAction> | null>(null)

// Reducer function to handle all task-related actions
function tasksReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "LOAD_TASKS":
      return {
        ...state,
        tasks: action.payload,
      }
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
        editingTask: null,
      }
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }
    case "TOGGLE_COMPLETE":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : null }
            : task,
        ),
      }
    case "SET_FILTER":
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      }
    case "SET_EDITING":
      return {
        ...state,
        editingTask: action.payload,
      }
    case "CLEAR_EDITING":
      return {
        ...state,
        editingTask: null,
      }
    default:
      return state
  }
}

// Provider component
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, initialState)

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        // Convert string dates back to Date objects
        const processedTasks = parsedTasks.map((task: any) => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : null,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
        }))
        dispatch({ type: "LOAD_TASKS", payload: processedTasks })
      } catch (error) {
        console.error("Error loading tasks from localStorage:", error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(state.tasks))
  }, [state.tasks])

  // Check for overdue tasks and send notifications
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date()
      state.tasks.forEach((task) => {
        if (task.deadline && !task.completed) {
          // Check if deadline is today or overdue
          const deadlineDate = new Date(task.deadline)
          if (deadlineDate <= now) {
            // Only notify if we haven't already for this task today
            const lastNotified = localStorage.getItem(`notified_${task.id}`)
            const today = now.toDateString()

            if (lastNotified !== today) {
              // Show browser notification if supported
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Task Reminder", {
                  body: `"${task.title}" is ${deadlineDate < now ? "overdue" : "due today"}!`,
                  icon: "/favicon.ico",
                })
              }

              localStorage.setItem(`notified_${task.id}`, today)
            }
          }
        }
      })
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    // Check deadlines immediately and then every hour
    checkDeadlines()
    const interval = setInterval(checkDeadlines, 3600000)

    return () => clearInterval(interval)
  }, [state.tasks])

  return (
    <TasksContext.Provider value={state}>
      <TasksDispatchContext.Provider value={dispatch}>{children}</TasksDispatchContext.Provider>
    </TasksContext.Provider>
  )
}

// Custom hooks to use the context
export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}

export function useTasksDispatch() {
  const context = useContext(TasksDispatchContext)
  if (!context) {
    throw new Error("useTasksDispatch must be used within a TaskProvider")
  }
  return context
}

