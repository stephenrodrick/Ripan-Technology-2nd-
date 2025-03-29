export interface Task {
    id: string
    title: string
    description?: string
    priority: string
    category: string
    deadline: Date | null
    completed: boolean
    completedAt: Date | null
    createdAt: Date
  }
  
  export interface TaskFilter {
    status: string
    priority: string
    category: string
    searchQuery: string
  }
  
  export type TaskAction =
    | { type: "LOAD_TASKS"; payload: Task[] }
    | { type: "ADD_TASK"; payload: Task }
    | { type: "UPDATE_TASK"; payload: Task }
    | { type: "DELETE_TASK"; payload: string }
    | { type: "TOGGLE_COMPLETE"; payload: string }
    | { type: "SET_FILTER"; payload: Partial<TaskFilter> }
    | { type: "SET_EDITING"; payload: Task }
    | { type: "CLEAR_EDITING" }
  
  