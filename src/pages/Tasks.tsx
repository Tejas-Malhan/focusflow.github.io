
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
      setNewTask("");
      toast.success("Task added successfully");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success("Task removed");
  };

  const clearAllTasks = () => {
    if (tasks.length === 0) {
      toast.info("No tasks to clear");
      return;
    }
    setTasks([]);
    toast.success("All tasks cleared");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your daily tasks and stay organized.
          </p>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 py-2 px-2 hover:bg-accent/50 rounded-md group"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeTask(task.id)}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button variant="destructive" onClick={clearAllTasks}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Tasks
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
