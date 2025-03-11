
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export default function Focus() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Focus Session</h1>
          <p className="text-muted-foreground">
            Stay focused and track your productivity.
          </p>
        </div>

        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="space-y-8">
            <div className="text-6xl font-bold">
              {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
            </div>
            
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Focus Session
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
