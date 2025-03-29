"use client"
import TaskForm from "@/components/task-form"
import TaskList from "@/components/task-list"
import FilterBar from "@/components/filter-bar"
import ProgressTracker from "@/components/progress-tracker"
import { TaskProvider } from "@/components/task-context"

export default function TaskManager() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Task Manager</h1>
            <p className="text-gray-600 dark:text-gray-400">Organize your tasks efficiently</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <TaskForm />
              <FilterBar />
              <TaskList />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <ProgressTracker />
            </div>
          </div>
        </div>
      </div>
    </TaskProvider>
  )
}

