"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Trophy, Target, ChevronLeft, ChevronRight } from "lucide-react";

interface BreakoutLoadingGameProps {
  isLoading?: boolean;
  loadingText?: string;
  onGameComplete?: () => void;
  className?: string;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  status: number;
  color: string;
}

const BreakoutLoadingGame: React.FC<BreakoutLoadingGameProps> = ({
  isLoading = true,
  loadingText = "Yükleniyor...",
  onGameComplete,
  className = "",
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver" | "won">("menu");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Game objects
  const [ball, setBall] = useState<Ball>({
    x: 0,
    y: 0,
    dx: 3,
    dy: -3,
    radius: 5,
  });

  const [paddle, setPaddle] = useState<Paddle>({
    x: 0,
    y: 0,
    width: 75,
    height: 10,
  });

  const [bricks, setBricks] = useState<Brick[]>([]);
  const [rightPressed, setRightPressed] = useState(false);
  const [leftPressed, setLeftPressed] = useState(false);

  // Initialize game
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      // Set canvas size
      canvas.width = 480;
      canvas.height = 320;

             // Draw initial background
       ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#1f2937" : "#f0f0f0";
       ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Initialize game objects
      initializeGame();
    } else {
      //do nothing
    }
  }, []);

  // Initialize game objects
  const initializeGame = () => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Initialize ball
    setBall({
      x: canvas.width / 2,
      y: canvas.height - 30,
      dx: 3,
      dy: -3,
      radius: 5,
    });

    // Initialize paddle
    setPaddle({
      x: (canvas.width - 75) / 2,
      y: canvas.height - 10,
      width: 75,
      height: 10,
    });

    // Initialize bricks
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;

    const newBricks: Brick[] = [];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        newBricks.push({
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          width: brickWidth,
          height: brickHeight,
          status: 1,
          color: colors[r % colors.length]!,
        });
      }
    }

    setBricks(newBricks);
    setScore(0);
    setLives(3);
    setGameState("menu");
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameState !== "playing") {
      return;
    }

    const gameLoop = setInterval(() => {
      if (!canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

             // Clear canvas and draw background
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#1f2937" : "#f0f0f0";
       ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      drawBricks(ctx);

      // Draw ball
      drawBall(ctx);

      // Draw paddle
      drawPaddle(ctx);

      // Draw score
      drawScore(ctx);

      // Draw lives
      drawLives(ctx);

      // Collision detection
      collisionDetection();

      // Move ball
      moveBall();

      // Move paddle
      movePaddle();
      // Check win condition
       if (bricks.every((brick) => brick.status === 0)) {
         setGameState("won");
         setIsPlaying(false);
         setTimeout(() => {
           toast({
             title: "🎉 Oyun Kazanıldı!",
             description: `Skor: ${score}`,
           });
         }, 100);
         onGameComplete?.();
       }

       // Check lose condition
       if (ball.y + ball.dy < ball.radius) {
         ball.dy = -ball.dy;
       } else if (ball.y + ball.dy > canvas.height - ball.radius) {
         if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
           ball.dy = -ball.dy;
         } else {
           setLives((prev) => {
             if (prev - 1 === 0) {
               setGameState("gameOver");
               setIsPlaying(false);
               setTimeout(() => {
                 toast({
                   title: "💥 Oyun Bitti!",
                   description: `Final Skor: ${score}`,
                 });
               }, 100);
               return 0;
             }
             return prev - 1;
           });
           setBall({
             x: canvas.width / 2,
             y: canvas.height - 30,
             dx: 3,
             dy: -3,
             radius: 5,
           });
         }
       }

      // Wall collision
      if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
      }
    }, 16);

    return () => clearInterval(gameLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, gameState, ball, paddle, bricks, score, lives, onGameComplete, toast]);

     // Draw functions
   const drawBall = (ctx: CanvasRenderingContext2D) => {
     ctx.beginPath();
     ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
     ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#60a5fa" : "#0095DD";
     ctx.fill();
     ctx.closePath();
   };

   const drawPaddle = (ctx: CanvasRenderingContext2D) => {
     ctx.beginPath();
     ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
     ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#60a5fa" : "#0095DD";
     ctx.fill();
     ctx.closePath();
   };

  const drawBricks = (ctx: CanvasRenderingContext2D) => {
    bricks.forEach((brick) => {
      if (brick.status === 1) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        ctx.fillStyle = brick.color;
        ctx.fill();
        ctx.closePath();
      }
    });
  };

     const drawScore = (ctx: CanvasRenderingContext2D) => {
     ctx.font = "16px Arial";
     ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#60a5fa" : "#0095DD";
     ctx.fillText(`Skor: ${score}`, 8, 20);
   };

   const drawLives = (ctx: CanvasRenderingContext2D) => {
     ctx.font = "16px Arial";
     ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#60a5fa" : "#0095DD";
     if (canvasRef.current) {
       ctx.fillText(`Can: ${lives}`, canvasRef.current.width - 65, 20);
     }
   };

  // Collision detection
  const collisionDetection = () => {
    bricks.forEach((brick) => {
      if (brick.status === 1) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brick.width &&
          ball.y > brick.y &&
          ball.y < brick.y + brick.height
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          setScore((prev) => prev + 10);
        }
      }
    });
  };

  // Move ball
  const moveBall = () => {
    setBall((prev) => ({
      ...prev,
      x: prev.x + prev.dx,
      y: prev.y + prev.dy,
    }));
  };

  // Move paddle
  const movePaddle = () => {
    if (rightPressed && paddle.x < canvasRef.current!.width - paddle.width) {
      setPaddle((prev) => ({ ...prev, x: prev.x + 7 }));
    } else if (leftPressed && paddle.x > 0) {
      setPaddle((prev) => ({ ...prev, x: prev.x - 7 }));
    }
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        setRightPressed(true);
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        setLeftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        setRightPressed(false);
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        setLeftPressed(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Loading progress simulation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isLoading]);

  // Start game
  const startGame = () => {
    setGameState("playing");
    setIsPlaying(true);

    // Initialize game objects without resetting game state
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Initialize ball
    setBall({
      x: canvas.width / 2,
      y: canvas.height - 30,
      dx: 3,
      dy: -3,
      radius: 5,
    });

    // Initialize paddle
    setPaddle({
      x: (canvas.width - 75) / 2,
      y: canvas.height - 10,
      width: 75,
      height: 10,
    });

    // Initialize bricks
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;

    const newBricks: Brick[] = [];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        newBricks.push({
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          width: brickWidth,
          height: brickHeight,
          status: 1,
          color: colors[r % colors.length]!,
        });
      }
    }

    setBricks(newBricks);
    setScore(0);
    setLives(3);

    // Force immediate canvas redraw
    setTimeout(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = document.documentElement.classList.contains('dark') ? "#1f2937" : "#f0f0f0";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          drawBricks(ctx);
          drawBall(ctx);
          drawPaddle(ctx);
          drawScore(ctx);
          drawLives(ctx);
        }
      }
    }, 100);
  };

  // Pause game
  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset game
  const resetGame = () => {
    setIsPlaying(false);
    initializeGame();
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Atari Breakout Loading Game
          </div>
          {isLoading && (
            <Badge variant="secondary" className="animate-pulse">
              {loadingText}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Yükleniyor...</span>
              <span>{Math.round(loadingProgress)}%</span>
            </div>
            <Progress value={loadingProgress} className="w-full" />
          </div>
        )}

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 w-full max-w-md md:max-w-lg lg:max-w-xl"
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "3/2",
              maxWidth: "480px",
              maxHeight: "320px",
            }}
          />
        </div>

                 {/* Game Controls */}
         <div className="flex items-center justify-center gap-2">
           {gameState === "menu" && (
             <Button
               onClick={() => {
                 startGame();
               }}
               className="flex items-center gap-2"
             >
               <Play className="w-4 h-4" />
               Oyunu Başlat
             </Button>
           )}

          {gameState === "playing" && (
            <>
              <Button onClick={pauseGame} variant="outline" className="flex items-center gap-2">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Duraklat" : "Devam Et"}
              </Button>
              <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Yeniden Başlat
              </Button>
            </>
          )}

          {(gameState === "gameOver" || gameState === "won") && (
            <Button onClick={resetGame} className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Tekrar Oyna
            </Button>
          )}
        </div>

                 {/* Game Instructions */}
         <div className="text-center text-sm text-gray-600 dark:text-gray-400">
           <p className="hidden md:block">Klavyeden ok tuşlarıyla paddle&apos;ı kontrol edin</p>
           <p className="block md:hidden">Aşağıdaki butonları kullanın</p>
           <p>Topu kaçırmamaya çalışın ve tüm tuğlaları kırın!</p>
         </div>

         {/* Mobile Controls */}
         <div className="block md:hidden">
           <div className="flex justify-center gap-4">
             <Button
               variant="outline"
               size="lg"
               className="w-16 h-16 flex items-center justify-center"
               onTouchStart={() => setLeftPressed(true)}
               onTouchEnd={() => setLeftPressed(false)}
               onMouseDown={() => setLeftPressed(true)}
               onMouseUp={() => setLeftPressed(false)}
               onMouseLeave={() => setLeftPressed(false)}
             >
               <ChevronLeft className="w-6 h-6" />
             </Button>
             <Button
               variant="outline"
               size="lg"
               className="w-16 h-16 flex items-center justify-center"
               onTouchStart={() => setRightPressed(true)}
               onTouchEnd={() => setRightPressed(false)}
               onMouseDown={() => setRightPressed(true)}
               onMouseUp={() => setRightPressed(false)}
               onMouseLeave={() => setRightPressed(false)}
             >
               <ChevronRight className="w-6 h-6" />
             </Button>
           </div>
         </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-4 text-sm">
          <Badge variant="outline">Skor: {score}</Badge>
          <Badge variant="outline">Can: {lives}</Badge>
          <Badge variant="outline">
            Durum: {gameState === "menu" ? "Menü" : gameState === "playing" ? "Oynuyor" : gameState === "won" ? "Kazandı" : "Kaybetti"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakoutLoadingGame;
