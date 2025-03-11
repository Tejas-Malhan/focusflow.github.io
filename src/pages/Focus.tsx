
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Music, CalendarRange } from "lucide-react";
import { toast } from "sonner";

export default function Focus() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            toast.success("Focus session completed!");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const handleStartPause = () => {
    if (time === 0) {
      resetTimer();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(25 * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast.info("Timer reset");
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpotifySubmit = () => {
    if (spotifyUrl.trim() && spotifyUrl.includes('spotify')) {
      toast.success("Spotify playlist connected");
      setShowSpotifyInput(false);
    } else {
      toast.error("Please enter a valid Spotify URL");
    }
  };

  const openCalendar = () => {
    toast.info("Google Calendar integration coming soon");
  };

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
              {formatTime(time)}
            </div>
            
            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                onClick={handleStartPause}
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
                    {time === 0 ? "Start New Session" : "Start Focus Session"}
                  </>
                )}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset Timer
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Music className="mr-2 h-5 w-5" />
                Spotify Music
              </h2>
              
              {showSpotifyInput ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter Spotify playlist URL"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSpotifySubmit} className="flex-1">
                      Connect
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSpotifyInput(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {spotifyUrl ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Playlist connected! Add an embed player here in production.
                      </p>
                      <Button onClick={() => setShowSpotifyInput(true)}>
                        Change Playlist
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowSpotifyInput(true)}>
                      Connect Spotify Playlist
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CalendarRange className="mr-2 h-5 w-5" />
                Google Calendar
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Google Calendar to sync your focus sessions and tasks.
                </p>
                <Button onClick={openCalendar}>
                  Connect Google Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
