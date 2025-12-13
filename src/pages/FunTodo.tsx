import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

import { Trash2, Plus, XCircle, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link, useParams } from "react-router-dom";

interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

interface Todo {
  id: number;
  collection: number;
  text: string;
  status: "active" | "completed" | "cancelled";
  subtasks?: Subtask[];
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
  const { collectionId } = useParams<{ collectionId: string }>();
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
    // add collectionId filter
    if (collectionId) {
      if (saved) {
        const allTodos: Todo[] = JSON.parse(saved);
        return allTodos.filter((todo) =>
          todo?.collection?.toString().startsWith(collectionId)
        );
      } else {
        return [];
      }
    } else {
      return saved ? JSON.parse(saved) : [];
    }
  });

  // Subtask UI state
  const [subtaskInput, setSubtaskInput] = useState<{ [key: number]: string }>(
    {}
  );
  const [showSubtaskInput, setShowSubtaskInput] = useState<{
    [key: number]: boolean;
  }>({});

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
  useEffect(() => {
    if (todos.length) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos]);

  // Add todo
  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        collection: Number(collectionId),
        text: input.trim(),
        status: "active",
        subtasks: [],
      },
    ]);
    setInput("");
  };

  // Subtask handlers
  const handleShowSubtaskInput = (todoId: number) => {
    setShowSubtaskInput((prev) => ({ ...prev, [todoId]: !prev[todoId] }));
    setSubtaskInput((prev) => ({ ...prev, [todoId]: "" }));
  };

  const handleSubtaskInputChange = (todoId: number, value: string) => {
    setSubtaskInput((prev) => ({ ...prev, [todoId]: value }));
  };

  const addSubtask = (todoId: number) => {
    const value = subtaskInput[todoId]?.trim();
    if (!value) return;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                ...(todo.subtasks || []),
                { id: Date.now(), text: value, completed: false },
              ],
            }
          : todo
      )
    );
    setSubtaskInput((prev) => ({ ...prev, [todoId]: "" }));
    setShowSubtaskInput((prev) => ({ ...prev, [todoId]: false }));
  };

  const toggleSubtask = (todoId: number, subtaskId: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks?.map((sub) =>
                sub.id === subtaskId
                  ? { ...sub, completed: !sub.completed }
                  : sub
              ),
            }
          : todo
      )
    );
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

  // Remove subtask
  const removeSubtask = (todoId: number, subtaskId: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks?.filter((sub) => sub.id !== subtaskId),
            }
          : todo
      )
    );
  };

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
        // Add collectionId to imported todos
        imported.forEach((todo: Todo) => {
          todo.collection = Number(collectionId);
        });
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

  // Drag and drop handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;
    if (sourceIdx === destIdx) return;
    const newTodos = Array.from(todos);
    const [removed] = newTodos.splice(sourceIdx, 1);
    newTodos.splice(destIdx, 0, removed);
    setTodos(newTodos);
  };

  return (
    <div className="flex-col gap-3 min-h-screen h-auto flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 grayscale p-3">
      <Card
        className={`w-full h-auto lg:h-auto max-w-xl ${shadow} border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg`}
      >
        <CardHeader className="flex flex-col gap-3 px-4 py-3 bg-transparent">
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center">
              <div className="flex absolute left-0 top-0">
                <Link to="/">
                  <Button
                    size="icon"
                    className="rounded-none rounded-tl-md"
                    variant="ghost"
                  >
                    <ArrowLeft />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <img
                  width={36}
                  src="/to-do-list.png"
                  className="rounded shadow-sm bg-white/70 dark:bg-gray-800/70 p-1"
                />
                <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-400 bg-clip-text text-transparent">
                  Todo List
                </CardTitle>
              </div>
            </div>
            <label className="flex items-center gap-1 cursor-pointer text-xs md:text-sm text-gray-500 dark:text-gray-300">
              <Switch
                checked={dark}
                onCheckedChange={() => setDark((d) => !d)}
                className="scale-90"
              />
              Dark
            </label>
          </div>

          <div className="flex items-center justify-between w-full text-xs md:text-sm text-gray-400 mb-2">
            <span>{grouped.active.length} active</span>
            <span>{todos.length} total</span>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="flex flex-1 gap-2">
              <Select value={shadow} onValueChange={setShadow}>
                <SelectTrigger className="h-7 text-xs md:text-sm min-w-20">
                  <SelectValue placeholder="Shadow" />
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
                <SelectTrigger className="h-7 text-xs md:text-sm min-w-24">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  {FILTERS.map((f) => (
                    <SelectItem value={f.value} key={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 gap-2 justify-end">
              <Button
                onClick={exportTodos}
                className="h-7 px-3 text-xs md:text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Export
              </Button>
              <label className="h-7 px-3 text-xs md:text-sm font-medium flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Import
                <input
                  type="file"
                  accept="application/json"
                  onChange={importTodos}
                  className="hidden"
                />
              </label>
            </div>
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
                <DragDropContext key={groupName} onDragEnd={onDragEnd}>
                  <Droppable droppableId={`droppable-${groupName}`}>
                    {(provided) => (
                      <ul
                        className="space-y-3"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {(groupTodos as Todo[]).map((todo, idx) => (
                          <Draggable
                            key={todo.id}
                            draggableId={todo?.id?.toString()}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm flex-wrap ${
                                  snapshot.isDragging
                                    ? "ring-2 ring-blue-400"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-37.5">
                                  <Checkbox
                                    checked={todo.status === "completed"}
                                    onCheckedChange={() => toggleTodo(todo.id)}
                                  />
                                  {editingId === todo.id ? (
                                    <Input
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && saveEdit()
                                      }
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
                                <div className="flex gap-2 items-center">
                                  {/* Subtask add button */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleShowSubtaskInput(todo.id)
                                    }
                                    className="text-green-500"
                                    title="Add subtask"
                                  >
                                    <Plus className="w-5 h-5" />
                                  </Button>

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
                                          onClick={() =>
                                            revertCancelled(todo.id)
                                          }
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
                                {/* Subtask input UI */}
                                {showSubtaskInput[todo.id] && (
                                  <div className="ml-8 gap-2 flex items-center rounded  w-full">
                                    <Input
                                      value={subtaskInput[todo.id] || ""}
                                      onChange={(e) =>
                                        handleSubtaskInputChange(
                                          todo.id,
                                          e.target.value
                                        )
                                      }
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && addSubtask(todo.id)
                                      }
                                      className="h-9 text-xs w-28 grow bg-white dark:bg-gray-800"
                                      placeholder="Subtask..."
                                      autoFocus
                                    />
                                    <Button
                                      size="icon"
                                      className="h-7 w-7 text-xs"
                                      onClick={() => addSubtask(todo.id)}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      className="h-7 w-7 text-xs text-red-500"
                                      onClick={() =>
                                        handleShowSubtaskInput(todo.id)
                                      }
                                    >
                                      <XCircle className="w-4 h-4 text-white dark:text-gray-800" />
                                    </Button>
                                  </div>
                                )}
                                {/* Subtasks list */}
                                {todo.subtasks && todo.subtasks.length > 0 && (
                                  <ul className="w-full pl-8 mt-2 space-y-1 group">
                                    {todo.subtasks.map((sub) => (
                                      <li
                                        key={sub.id}
                                        className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-slate-700 rounded px-2 py-1 w-full justify-between"
                                      >
                                        <div className="flex gap-2 flex-1">
                                          <Checkbox
                                            checked={sub.completed}
                                            onCheckedChange={() =>
                                              toggleSubtask(todo.id, sub.id)
                                            }
                                            className="scale-75 mt-1"
                                          />
                                          <span
                                            className={
                                              sub.completed
                                                ? "line-through text-gray-400"
                                                : "text-gray-700 dark:text-gray-200"
                                            }
                                          >
                                            {sub.text}
                                          </span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-gray-400 hover:text-red-500 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() =>
                                            removeSubtask(todo.id, sub.id)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : null
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunTodo;
