import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Trash2, Plus, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Todo {
  id: number;
  text: string;
  status: "active" | "completed" | "cancelled";
}

const SHADOWS = [
  { label: "None", value: "shadow-none" },
  { label: "Small", value: "shadow-sm" },
  { label: "Medium", value: "shadow-md" },
  { label: "Large", value: "shadow-lg" },
  { label: "Extra", value: "shadow-2xl" },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const FunTodo: React.FC = () => {
  // Dark mode
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? true
      : false;
  });

  // UI states
  const [shadow, setShadow] = useState(
    () => localStorage.getItem("shadow") || "shadow-sm"
  );
  const [filter, setFilter] = useState(
    () => localStorage.getItem("filter") || "all"
  );

  // Todos
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Persist theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Persist UI states & todos
  useEffect(() => localStorage.setItem("shadow", shadow), [shadow]);
  useEffect(() => localStorage.setItem("filter", filter), [filter]);
  useEffect(
    () => localStorage.setItem("todos", JSON.stringify(todos)),
    [todos]
  );

  // Add todo
  const addTodo = () => {
    if (!input.trim()) return;

    setTodos([
      ...todos,
      { id: Date.now(), text: input.trim(), status: "active" },
    ]);
    setInput("");
  };

  // Toggle completion
  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status: todo.status === "completed" ? "active" : "completed",
            }
          : todo
      )
    );
  };

  // Cancel todo
  const cancelTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, status: "cancelled" } : todo
      )
    );
  };

  // Revert cancelled → active
  const revertCancelled = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, status: "active" } : todo
      )
    );
  };

  // Remove todo
  const removeTodo = (id: number) =>
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

  // Edit handlers
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = () => {
    if (!editingText.trim()) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
      )
    );

    setEditingId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Import / export
  const importTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (Array.isArray(imported)) setTodos(imported);
      } catch (error) {
        alert(`Error importing todos: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const exportTodos = () => {
    const blob = new Blob([JSON.stringify(todos)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Grouped todos
  const grouped = {
    active: todos.filter((t) => t.status === "active"),
    completed: todos.filter((t) => t.status === "completed"),
    cancelled: todos.filter((t) => t.status === "cancelled"),
  };

  const filteredGroups =
    filter === "all"
      ? grouped
      : { [filter]: grouped[filter as keyof typeof grouped] };

  return (
    <div className="flex-col gap-3 h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 grayscale p-3">
      <img width={80} src="/to-do-list.png" />
      <Card
        className={`w-full h-full lg:h-auto max-w-xl ${shadow} border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg`}
      >
        <CardHeader className="text-center flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-700 to-gray-400 bg-clip-text text-transparent">
              Todo List
            </CardTitle>
            <label className="flex items-center gap-1 cursor-pointer text-sm">
              <Switch
                checked={dark}
                onCheckedChange={() => setDark((d) => !d)}
              />
              Dark
            </label>
          </div>

          {/* Controls */}
          <div className="flex  gap-2 justify-center items-center mt-1">
            <Select value={shadow} onValueChange={setShadow}>
              <SelectTrigger className="h-7 text-sm w-24 sm:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHADOWS.map((s) => (
                  <SelectItem value={s.value} key={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-7 text-sm w-24 sm:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.map((f) => (
                  <SelectItem value={f.value} key={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={exportTodos}
              className="h-7 px-2 text-sm whitespace-nowrap"
            >
              Export
            </Button>

            <label className="h-7 px-2 text-sm flex items-center bg-gray-200 dark:bg-gray-700 border rounded cursor-pointer whitespace-nowrap">
              Import
              <input
                type="file"
                accept="application/json"
                onChange={importTodos}
                className="hidden"
              />
            </label>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="bg-gray-100 dark:bg-gray-800 border-0 flex-1"
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <Button
              onClick={addTodo}
              className="bg-linear-to-r from-gray-700 to-gray-400 text-white shadow"
              size="icon"
            >
              <Plus />
            </Button>
          </div>

          {/* Grouped Todos */}
          {Object.entries(filteredGroups).map(([groupName, groupTodos]) =>
            groupTodos.length > 0 ? (
              <div key={groupName} className="mb-6">
                <h3 className="text-sm font-semibold mb-2 capitalize text-gray-500">
                  {groupName}
                </h3>

                <ul className="space-y-3">
                  {(groupTodos as Todo[]).map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm flex-wrap"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-37.5">
                        <Checkbox
                          checked={todo.status === "completed"}
                          onCheckedChange={() => toggleTodo(todo.id)}
                        />

                        {/* EDITING MODE */}
                        {editingId === todo.id ? (
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`text-base break-words ${
                              todo.status === "completed"
                                ? "line-through text-gray-400"
                                : todo.status === "cancelled"
                                ? "text-red-400 line-through"
                                : "text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {todo.text}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {/* Save / Cancel edit */}
                        {editingId === todo.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={saveEdit}
                              className="text-green-500"
                            >
                              ✔
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="text-red-500"
                            >
                              ✖
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Edit */}
                            {todo.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(todo)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                ✎
                              </Button>
                            )}

                            {/* Revert Cancelled */}
                            {todo.status === "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => revertCancelled(todo.id)}
                                className="text-yellow-500 hover:text-yellow-600"
                              >
                                ↺
                              </Button>
                            )}

                            {/* Cancel */}
                            {todo.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => cancelTodo(todo.id)}
                                className="text-gray-400 hover:text-orange-500"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            )}

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTodo(todo.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </CardContent>

        <CardFooter className="justify-between text-sm text-gray-400 px-4 py-3">
          <span>{grouped.active.length} active</span>
          <span>{todos.length} total</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FunTodo;
