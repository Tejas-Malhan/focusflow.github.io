import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Music } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";

export default function Focus() {
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [time, setTime] = useState(customMinutes * 60);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState("");
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setTime(customMinutes * 60);
    }
  }, [customMinutes, isRunning]);

  useEffect(() => {
    if (isRunning && time > 0) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            
            const minutesSpent = Math.floor((Date.now() - startTimeRef.current!) / (1000 * 60));
            const stats = db.getStats();
            db.updateStats({ focusMinutes: stats.focusMinutes + minutesSpent });
            
            startTimeRef.current = null;
            toast.success("Focus session completed!");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      
      if (startTimeRef.current !== null) {
        const minutesSpent = Math.floor((Date.now() - startTimeRef.current) / (1000 * 60));
        if (minutesSpent > 0) {
          const stats = db.getStats();
          db.updateStats({ focusMinutes: stats.focusMinutes + minutesSpent });
        }
        startTimeRef.current = null;
      }
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
    setTime(customMinutes * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startTimeRef.current = null;
    toast.info("Timer reset");
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpotifySubmit = () => {
    if (spotifyUrl.trim() === '') {
      toast.error("Please enter a Spotify URL");
      return;
    }

    try {
      const url = new URL(spotifyUrl);
      const pathParts = url.pathname.split('/').filter(part => part !== '');
      
      let embedUrl;
      if (pathParts[0] === 'embed') {
        embedUrl = spotifyUrl;
      } else {
        const type = pathParts[0];
        const id = pathParts[1]?.split('?')[0];
        if (!type || !id) throw new Error();
        embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
      }

      setSpotifyEmbedUrl(embedUrl);
      toast.success("Spotify playlist connected");
      setShowSpotifyInput(false);
    } catch (error) {
      toast.error("Invalid Spotify URL. Please use a valid track, album, or playlist URL.");
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-up">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Focus Session</h1>
          <p className="text-muted-foreground">
            Stay focused and track your productivity.
          </p>
        </div>

        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="space-y-8">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Session Duration (minutes)
              </div>
              <Input
                type="number"
                min="1"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                disabled={isRunning}
                className="text-center mb-4"
              />
              <div className="text-6xl font-bold">
                {formatTime(time)}
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                onClick={handleStartPause}
                className="w-full transition-all hover:scale-105"
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
                className="w-full transition-all hover:scale-105"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset Timer
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Music className="mr-2 h-5 w-5" />
              Spotify Music
            </h2>
            
            {showSpotifyInput ? (
              <div className="space-y-4">
                <Input
                  placeholder="Enter Spotify URL (track, album, or playlist)"
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
                {spotifyEmbedUrl ? (
                  <div className="space-y-4">
                    <div className="w-full h-80 overflow-hidden rounded-md">
                      <iframe 
                        src={spotifyEmbedUrl} 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                        title="Spotify Player"
                      ></iframe>
                    </div>
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
      </div>
    </Layout>
  );
}
