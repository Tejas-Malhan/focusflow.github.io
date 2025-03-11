
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
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState("");
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now(); // Record when we started this session
      }
      
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            
            // Calculate minutes spent and update stats
            const minutesSpent = Math.floor((Date.now() - startTimeRef.current!) / (1000 * 60));
            const stats = db.getStats();
            db.updateStats({ focusMinutes: stats.focusMinutes + minutesSpent });
            
            startTimeRef.current = null; // Reset for next session
            toast.success("Focus session completed!");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      
      // If we stopped before completion, record partial time
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
    setTime(25 * 60);
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
    if (spotifyUrl.trim() && spotifyUrl.includes('spotify')) {
      // Extract Spotify URI or ID
      let embedUrl = spotifyUrl;
      
      // Handle different Spotify URL formats
      if (spotifyUrl.includes('spotify.com')) {
        // Convert regular URL to embed URL
        embedUrl = spotifyUrl.replace('spotify.com', 'open.spotify.com/embed');
        
        // If it's already an embed URL, use it directly
        if (!embedUrl.includes('/embed')) {
          const urlParts = embedUrl.split('/');
          const type = urlParts[urlParts.length - 2]; // playlist, album, track, etc.
          const id = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
          embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
        }
      }
      
      setSpotifyEmbedUrl(embedUrl);
      toast.success("Spotify playlist connected");
      setShowSpotifyInput(false);
    } else {
      toast.error("Please enter a valid Spotify URL");
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
            <div className="text-6xl font-bold">
              {formatTime(time)}
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
