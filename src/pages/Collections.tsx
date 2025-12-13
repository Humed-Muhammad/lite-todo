import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

interface Collection {
  id: number;
  name: string;
  description: string;
  count: number;
}

const COLLECTIONS_KEY = "collections";

const Collections: React.FC = () => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? true
      : false;
  });
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (stored) setCollections(JSON.parse(stored));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (collections.length) {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    }
  }, [collections]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setCollections((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newName,
        description: newDesc,
        count: 0,
      },
    ]);
    setNewName("");
    setNewDesc("");
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  // Edit handlers
  const handleEdit = (col: Collection) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditDesc(col.description);
  };

  const handleEditSave = (id: number) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name: editName, description: editDesc } : c
      )
    );
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const collectionTodoCount = useMemo(() => {
    const todos = localStorage.getItem("todos");
    const todoList = todos ? JSON.parse(todos) : [];
    const countMap: Record<number, number> = {};
    todoList.forEach((todo: { collection: number }) => {
      if (countMap[todo.collection]) {
        countMap[todo.collection]++;
      } else {
        countMap[todo.collection] = 1;
      }
    });
    return countMap;
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="border-b border-stone-300 pb-2 w-full max-w-3xl mb-3 flex justify-end">
        <label className="flex items-center gap-1 cursor-pointer text-xs md:text-sm text-gray-500 dark:text-gray-300">
          <Switch
            checked={dark}
            onCheckedChange={() => setDark((d) => !d)}
            // className="scale-90"
          />
          Dark
        </label>
      </div>
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-400 dark:from-gray-200 dark:to-gray-500 bg-clip-text text-transparent">
          Collections
        </h1>
        <Button
          className="bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-500 text-white dark:text-gray-900 text-sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {showForm && (
        <div className="w-full max-w-3xl mb-6 bg-white/90 dark:bg-gray-900/90 rounded-lg p-4 shadow">
          <div className="flex flex-col gap-2">
            <input
              className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-transparent text-gray-800 dark:text-gray-100"
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-transparent text-gray-800 dark:text-gray-100"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Button
                className="bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-500 text-white dark:text-gray-900"
                onClick={handleAdd}
              >
                Add
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {collections.length >= 0 ? (
        <div className="flex p-2 flex-col items-center justify-center h-64 w-full max-w-2xl bg-white/80 dark:bg-gray-900/80 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Folder className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
          <span className="text-gray-400 dark:text-gray-600 text-lg text-center">
            No collections yet. Click "New Collection" to add one.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {collections.map((col) => (
            <Card
              key={col.id}
              className="bg-white/90 dark:bg-gray-900/90 border-0 shadow-md hover:shadow-xl transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center gap-3 px-6 py-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-700 dark:to-gray-500 text-white dark:text-gray-200">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  {editingId === col.id ? (
                    <>
                      <input
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 mb-1 bg-transparent text-gray-800 dark:text-gray-100 text-base font-semibold"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Collection name"
                        autoFocus
                      />
                      <input
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-transparent text-gray-800 dark:text-gray-100 text-xs mt-1"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-500 text-white dark:text-gray-900"
                          onClick={() => handleEditSave(col.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {col.name}
                      </CardTitle>
                      <div className="text-xs text-gray-400 dark:text-gray-400">
                        {col.description}
                      </div>
                    </>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {collectionTodoCount[col.id]} todos
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    title="Delete collection"
                    onClick={() => handleDelete(col.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {editingId !== col.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                      title="Edit collection"
                      onClick={() => handleEdit(col)}
                    >
                      ✏️
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => navigate(`/todos/${col.id}`)}
                  disabled={editingId === col.id}
                >
                  View Todos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collections;
