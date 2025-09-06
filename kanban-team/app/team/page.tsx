"use client";

import type React from "react";

import { useState } from "react";
import * as Kanban from "@/components/ui/kanban";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Plus,
  MoreHorizontal,
  User,
  X,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: "low" | "medium" | "high";
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialData: Record<string, Task[]> = {
  backlog: [
    {
      id: "task-1",
      title: "Design system updates",
      description: "Update the design system with new color palette",
      assignee: "John Doe",
      priority: "medium",
      tags: ["design", "ui"],
    },
    {
      id: "task-2",
      title: "API documentation",
      description: "Write comprehensive API documentation",
      assignee: "Jane Smith",
      priority: "high",
      tags: ["docs", "api"],
    },
    {
      id: "task-3",
      title: "User testing",
      description: "Conduct user testing sessions",
      assignee: "Mike Johnson",
      priority: "low",
      tags: ["research", "ux"],
    },
  ],
  "in-progress": [
    {
      id: "task-4",
      title: "Authentication flow",
      description: "Implement OAuth authentication",
      assignee: "Sarah Wilson",
      priority: "high",
      tags: ["auth", "security"],
    },
    {
      id: "task-5",
      title: "Dashboard analytics",
      description: "Build analytics dashboard",
      assignee: "Tom Brown",
      priority: "medium",
      tags: ["analytics", "dashboard"],
    },
  ],
  done: [
    {
      id: "task-6",
      title: "Landing page redesign",
      description: "Complete redesign of the landing page",
      assignee: "Lisa Davis",
      priority: "high",
      tags: ["design", "frontend"],
    },
    {
      id: "task-7",
      title: "Database optimization",
      description: "Optimize database queries for better performance",
      assignee: "Alex Chen",
      priority: "medium",
      tags: ["backend", "performance"],
    },
  ],
};

const columnTitles = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  done: "Done",
};

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function TeamPage() {
  const [columns, setColumns] = useState<Record<string, Task[]>>(initialData);
  const [columnOrder, setColumnOrder] = useState<string[]>(
    Object.keys(initialData),
  );

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    assignee: "",
    priority: "medium",
    tags: [],
  });
  const [newColumn, setNewColumn] = useState({ id: "", title: "" });
  const [tagInput, setTagInput] = useState("");

  const addTask = () => {
    if (!newTask.title || !selectedColumn) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || "",
      assignee: newTask.assignee || "",
      priority: newTask.priority as "low" | "medium" | "high",
      tags: newTask.tags || [],
    };

    setColumns((prev) => ({
      ...prev,
      [selectedColumn]: [...(prev[selectedColumn] || []), task],
    }));

    // Reset form
    setNewTask({
      title: "",
      description: "",
      assignee: "",
      priority: "medium",
      tags: [],
    });
    setTagInput("");
    setIsAddTaskOpen(false);
  };

  const addColumn = () => {
    if (!newColumn.title || !newColumn.id) return;

    const columnId = newColumn.id.toLowerCase().replace(/\s+/g, "-");

    setColumns((prev) => ({
      ...prev,
      [columnId]: [],
    }));

    setColumnOrder((prev) => [...prev, columnId]);

    // Reset form
    setNewColumn({ id: "", title: "" });
    setIsAddColumnOpen(false);
  };

  const deleteColumn = (columnId: string) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      delete newColumns[columnId];
      return newColumns;
    });
    setColumnOrder((prev) => prev.filter((id) => id !== columnId));
  };

  const addTag = () => {
    if (tagInput.trim() && !newTask.tags?.includes(tagInput.trim())) {
      setNewTask((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTask((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleColumnReorder = (newOrder: string[]) => {
    console.log("[v0] Column reorder triggered:", newOrder);
    setColumnOrder(newOrder);
  };

  const editTask = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("[v0] Edit task triggered:", task.id);
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      tags: [...task.tags],
    });
    setIsEditTaskOpen(true);
  };

  const updateTask = () => {
    if (!editingTask || !newTask.title) return;

    const updatedTask: Task = {
      ...editingTask,
      title: newTask.title,
      description: newTask.description || "",
      assignee: newTask.assignee || "",
      priority: newTask.priority as "low" | "medium" | "high",
      tags: newTask.tags || [],
    };

    setColumns((prev) => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach((columnId) => {
        newColumns[columnId] = newColumns[columnId].map((task) =>
          task.id === editingTask.id ? updatedTask : task,
        );
      });
      return newColumns;
    });

    // Reset form
    setNewTask({
      title: "",
      description: "",
      assignee: "",
      priority: "medium",
      tags: [],
    });
    setTagInput("");
    setEditingTask(null);
    setIsEditTaskOpen(false);
  };

  const deleteTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("[v0] Delete task triggered:", taskId);
    setColumns((prev) => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach((columnId) => {
        newColumns[columnId] = newColumns[columnId].filter(
          (task) => task.id !== taskId,
        );
      });
      return newColumns;
    });
  };

  const duplicateTask = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("[v0] Duplicate task triggered:", task.id);
    const duplicatedTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
    };

    // Find which column the task belongs to
    const columnId = Object.keys(columns).find((colId) =>
      columns[colId].some((t) => t.id === task.id),
    );

    if (columnId) {
      setColumns((prev) => ({
        ...prev,
        [columnId]: [...prev[columnId], duplicatedTask],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-50 mb-2">
                Team Board
              </h1>
              <p className="text-neutral-400">
                Manage your team's tasks and projects
              </p>
            </div>

            <div className="flex gap-3">
              <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-neutral-800 hover:bg-neutral-700 text-neutral-50 border-neutral-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-50">
                  <DialogHeader>
                    <DialogTitle className="text-neutral-50">
                      Add New Column
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="column-title"
                        className="text-neutral-200"
                      >
                        Column Title
                      </Label>
                      <Input
                        id="column-title"
                        value={newColumn.title}
                        onChange={(e) =>
                          setNewColumn((prev) => ({
                            ...prev,
                            title: e.target.value,
                            id: e.target.value,
                          }))
                        }
                        placeholder="e.g., Review, Testing"
                        className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddColumnOpen(false)}
                        className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={addColumn}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add Column
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-50 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-neutral-50">
                      Add New Task
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-column" className="text-neutral-200">
                        Column
                      </Label>
                      <Select
                        value={selectedColumn}
                        onValueChange={setSelectedColumn}
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-50">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-50">
                          {columnOrder.map((columnId) => (
                            <SelectItem
                              key={columnId}
                              value={columnId}
                              className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                            >
                              {columnTitles[
                                columnId as keyof typeof columnTitles
                              ] ||
                                columnId
                                  .replace("-", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-title" className="text-neutral-200">
                        Title
                      </Label>
                      <Input
                        id="task-title"
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Task title"
                        className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="task-description"
                        className="text-neutral-200"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="task-description"
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Task description"
                        className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="task-assignee"
                        className="text-neutral-200"
                      >
                        Assignee
                      </Label>
                      <Input
                        id="task-assignee"
                        value={newTask.assignee}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            assignee: e.target.value,
                          }))
                        }
                        placeholder="Assignee name"
                        className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="task-priority"
                        className="text-neutral-200"
                      >
                        Priority
                      </Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask((prev) => ({
                            ...prev,
                            priority: value as "low" | "medium" | "high",
                          }))
                        }
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-50">
                          <SelectItem
                            value="low"
                            className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                          >
                            Low
                          </SelectItem>
                          <SelectItem
                            value="medium"
                            className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                          >
                            Medium
                          </SelectItem>
                          <SelectItem
                            value="high"
                            className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                          >
                            High
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-neutral-200">Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add tag"
                          className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          size="sm"
                          className="bg-neutral-700 hover:bg-neutral-600 text-neutral-50"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {newTask.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-neutral-800 border-neutral-600 text-neutral-300"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddTaskOpen(false)}
                        className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={addTask}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-neutral-50">Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-task-title" className="text-neutral-200">
                  Title
                </Label>
                <Input
                  id="edit-task-title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Task title"
                  className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-task-description"
                  className="text-neutral-200"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-task-description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Task description"
                  className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                  rows={3}
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-task-assignee"
                  className="text-neutral-200"
                >
                  Assignee
                </Label>
                <Input
                  id="edit-task-assignee"
                  value={newTask.assignee}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assignee: e.target.value,
                    }))
                  }
                  placeholder="Assignee name"
                  className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-task-priority"
                  className="text-neutral-200"
                >
                  Priority
                </Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: value as "low" | "medium" | "high",
                    }))
                  }
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-50">
                    <SelectItem
                      value="low"
                      className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                    >
                      Low
                    </SelectItem>
                    <SelectItem
                      value="medium"
                      className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                    >
                      Medium
                    </SelectItem>
                    <SelectItem
                      value="high"
                      className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50"
                    >
                      High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-neutral-200">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    size="sm"
                    className="bg-neutral-700 hover:bg-neutral-600 text-neutral-50"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newTask.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-neutral-800 border-neutral-600 text-neutral-300"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditTaskOpen(false)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="bg-neutral-950">
          <Kanban.Root
            value={columns}
            onValueChange={setColumns}
            getItemValue={(task) => task.id}
            onColumnReorder={handleColumnReorder}
          >
            <Kanban.Board className="flex gap-6 overflow-x-auto pb-4">
              {columnOrder.map((columnId) => (
                <Kanban.Column
                  key={columnId}
                  value={columnId}
                  className="flex-shrink-0 w-80"
                >
                  <Card className="h-full bg-neutral-900 border-neutral-800 shadow-lg">
                    <CardHeader className="pb-3 bg-neutral-900 border-b border-neutral-800">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-50 cursor-grab active:cursor-grabbing">
                          {columnTitles[
                            columnId as keyof typeof columnTitles
                          ] ||
                            columnId
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          <Badge
                            variant="secondary"
                            className="text-xs bg-neutral-800 text-neutral-300 border-neutral-700"
                          >
                            {columns[columnId]?.length || 0}
                          </Badge>
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedColumn(columnId);
                              setIsAddTaskOpen(true);
                            }}
                            className="text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          {!Object.keys(initialData).includes(columnId) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteColumn(columnId)}
                              className="text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 bg-neutral-900 p-4">
                      {columns[columnId]?.map((task) => (
                        <Kanban.Item key={task.id} value={task.id} asHandle>
                          <Card className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 bg-neutral-800 border-neutral-700 hover:bg-neutral-750 hover:border-neutral-600">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-sm leading-tight text-neutral-50">
                                  {task.title}
                                </h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-50 hover:bg-neutral-700"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="bg-neutral-800 border-neutral-700 text-neutral-50"
                                    align="end"
                                    side="bottom"
                                    sideOffset={4}
                                  >
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        editTask(task);
                                      }}
                                      className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50 cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        duplicateTask(task);
                                      }}
                                      className="text-neutral-50 focus:bg-neutral-700 focus:text-neutral-50 cursor-pointer"
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        deleteTask(task.id);
                                      }}
                                      className="text-red-400 focus:bg-red-900 focus:text-red-300 cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {task.description && (
                                <p className="text-xs text-neutral-400 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs px-2 py-0 bg-neutral-700 border-neutral-600 text-neutral-300"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge
                                  className={`text-xs px-2 py-1 ${priorityColors[task.priority]}`}
                                >
                                  {task.priority}
                                </Badge>

                                {task.assignee && (
                                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                                    <User className="h-3 w-3" />
                                    <span className="truncate max-w-20">
                                      {task.assignee}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Kanban.Item>
                      ))}
                    </CardContent>
                  </Card>
                </Kanban.Column>
              ))}
            </Kanban.Board>
            <Kanban.Overlay />
          </Kanban.Root>
        </div>
      </div>
    </div>
  );
}
