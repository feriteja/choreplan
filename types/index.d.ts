declare type TodoStateType =
  | "planning"
  | "progress"
  | "pause"
  | "finish"
  | "canceled";

// Define the structure of a to-do item
declare type TodoType = {
  id: string; // Unique identifier for the to-do item
  title: string; // Title of the to-do item
  content: string; // Detailed description of the task
  important: boolean; // Whether the task is marked as important
  state: TodoStateType; // The current state of the to-do item
  revisionCount: number; // Number of times the task has been revised
};
