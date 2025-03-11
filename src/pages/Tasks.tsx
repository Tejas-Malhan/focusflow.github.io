
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // Load tasks from database on component mount
  useEffect(() => {
    const savedTasks = db.getTasks();
    if (savedTasks.length) {
      setTasks(savedTasks);
    }
  }, []);

  // Save tasks to database whenever tasks change
  useEffect(() => {
    db.saveTasks(tasks);
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
      setNewTask("");
      toast.success("Task added successfully");
    }
  };

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const wasCompleted = task.completed;
        const newTask = { ...task, completed: !wasCompleted };
        
        // If task is being marked as completed, update stats
        if (!wasCompleted) {
          const stats = db.getStats();
          db.updateStats({ tasksCompleted: stats.tasksCompleted + 1 });
        }
        
        return newTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
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
      <div className="space-y-8 animate-fade-up">
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
              className="transition-all focus:ring-2 focus:ring-primary/50"
            />
            <Button 
              onClick={addTask}
              className="transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 py-2 px-2 hover:bg-accent/50 rounded-md group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="transition-transform hover:scale-110"
                  />
                  <span className={task.completed ? "line-through text-muted-foreground transition-colors" : "transition-colors"}>
                    {task.title}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => removeTask(task.id)}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button 
                variant="destructive" 
                onClick={clearAllTasks}
                className="transition-transform hover:scale-105"
              >
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
