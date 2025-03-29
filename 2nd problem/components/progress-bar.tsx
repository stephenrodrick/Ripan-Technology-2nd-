"use client"

import type React from "react"

import { useTasks } from "./task-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, CheckCircle, Clock, Calendar, AlertTriangle } from "lucide-react"

export default function ProgressTracker() {
  const { tasks } = useTasks()
  const [timeframe, setTimeframe] = useState("daily")
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    upcoming: 0,
    completionRate: 0,
  })

  useEffect(() => {
    calculateStats()
  }, [tasks, timeframe])

  const calculateStats = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Define time ranges based on selected timeframe
    let startDate: Date
    const endDate = new Date(now)

    switch (timeframe) {
      case "daily":
        startDate = today
        break
      case "weekly":
        // Start of current week (Sunday)
        startDate = new Date(today)
        startDate.setDate(today.getDate() - today.getDay())
        break
      case "monthly":
        // Start of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      default:
        startDate = today
    }

    // Filter tasks based on timeframe
    const relevantTasks = tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= startDate && taskDate <= endDate
    })

    // Calculate statistics
    const total = relevantTasks.length
    const completed = relevantTasks.filter((task) => task.completed).length

    // Overdue tasks (deadline in the past and not completed)
    const overdue = tasks.filter((task) => !task.completed && task.deadline && new Date(task.deadline) < now).length

    // Upcoming tasks with deadlines in the next 3 days
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(now.getDate() + 3)

    const upcoming = tasks.filter(
      (task) =>
        !task.completed &&
        task.deadline &&
        new Date(task.deadline) > now &&
        new Date(task.deadline) <= threeDaysFromNow,
    ).length

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    setStats({
      total,
      completed,
      overdue,
      upcoming,
      completionRate,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-primary" />
            Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-0">
              <ProgressStats stats={stats} />
            </TabsContent>
            <TabsContent value="weekly" className="mt-0">
              <ProgressStats stats={stats} />
            </TabsContent>
            <TabsContent value="monthly" className="mt-0">
              <ProgressStats stats={stats} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TaskSummary />
    </div>
  )
}

function ProgressStats({ stats }: { stats: any }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1 text-sm">
          <span>Completion Rate</span>
          <span>{stats.completionRate}%</span>
        </div>
        <Progress value={stats.completionRate} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="flex flex-col items-center p-3 bg-muted rounded-md">
          <div className="text-2xl font-bold">{stats.completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted rounded-md">
          <div className="text-2xl font-bold">{stats.total - stats.completed}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>
    </div>
  )
}

function TaskSummary() {
  const { tasks } = useTasks()
  const now = new Date()

  // Calculate summary stats
  const overdueTasks = tasks.filter((task) => !task.completed && task.deadline && new Date(task.deadline) < now)

  const todayTasks = tasks.filter(
    (task) => !task.completed && task.deadline && new Date(task.deadline).toDateString() === now.toDateString(),
  )

  const upcomingTasks = tasks.filter((task) => {
    if (task.completed || !task.deadline) return false
    const deadlineDate = new Date(task.deadline)
    const isUpcoming =
      deadlineDate > now &&
      deadlineDate.toDateString() !== now.toDateString() &&
      deadlineDate <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
    return isUpcoming
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Task Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SummaryItem
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
            title="Overdue"
            count={overdueTasks.length}
            color="text-red-500"
          />

          <SummaryItem
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            title="Due Today"
            count={todayTasks.length}
            color="text-amber-500"
          />

          <SummaryItem
            icon={<Calendar className="h-5 w-5 text-blue-500" />}
            title="Upcoming (7 days)"
            count={upcomingTasks.length}
            color="text-blue-500"
          />

          <SummaryItem
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Completed"
            count={tasks.filter((task) => task.completed).length}
            color="text-green-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryItem({
  icon,
  title,
  count,
  color,
}: { icon: React.ReactNode; title: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <span className="ml-2 text-sm font-medium">{title}</span>
      </div>
      <span className={`font-bold ${color}`}>{count}</span>
    </div>
  )
}

