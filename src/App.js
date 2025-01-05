import React, { useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);

  const canvasWidth = 800;
  const canvasHeight = 400;
  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballRadius = 10;
  const paddleSpeed = 4;  // Speed of paddle movement
  const ballSpeed = 10;  // Slower ball speed

  // Ref to track paddle and ball positions
  const leftPaddleY = useRef(canvasHeight / 2 - paddleHeight / 2);
  const rightPaddleY = useRef(canvasHeight / 2 - paddleHeight / 2);
  const ballX = useRef(canvasWidth / 2);
  const ballY = useRef(canvasHeight / 2);
  const ballSpeedX = useRef(ballSpeed);
  const ballSpeedY = useRef(ballSpeed);

  // Flags to track paddle movement
  const leftUp = useRef(false);
  const leftDown = useRef(false);
  const rightUp = useRef(false);
  const rightDown = useRef(false);

  // Move paddles based on user input
  const movePaddles = () => {
    if (leftUp.current && leftPaddleY.current > 0) {
      leftPaddleY.current -= paddleSpeed;
    }
    if (leftDown.current && leftPaddleY.current < canvasHeight - paddleHeight) {
      leftPaddleY.current += paddleSpeed;
    }
    if (rightUp.current && rightPaddleY.current > 0) {
      rightPaddleY.current -= paddleSpeed;
    }
    if (rightDown.current && rightPaddleY.current < canvasHeight - paddleHeight) {
      rightPaddleY.current += paddleSpeed;
    }
  };

  // Move the ball and handle bouncing
  const moveBall = () => {
    ballX.current += ballSpeedX.current;
    ballY.current += ballSpeedY.current;

    // Ball bouncing off the top and bottom walls
    if (ballY.current - ballRadius <= 0 || ballY.current + ballRadius >= canvasHeight) {
      ballSpeedY.current = -ballSpeedY.current;
    }

    // Ball bouncing off the paddles
    if (ballX.current - ballRadius <= paddleWidth && ballY.current >= leftPaddleY.current && ballY.current <= leftPaddleY.current + paddleHeight) {
      ballSpeedX.current = -ballSpeedX.current;
    }
    if (ballX.current + ballRadius >= canvasWidth - paddleWidth && ballY.current >= rightPaddleY.current && ballY.current <= rightPaddleY.current + paddleHeight) {
      ballSpeedX.current = -ballSpeedX.current;
    }

    // Ball out of bounds (resetting)
    if (ballX.current - ballRadius <= 0 || ballX.current + ballRadius >= canvasWidth) {
      ballX.current = canvasWidth / 2;
      ballY.current = canvasHeight / 2;
      ballSpeedX.current = -ballSpeedX.current;
      ballSpeedY.current = ballSpeed;
    }
  };

  // Draw everything to the canvas
  const renderGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw paddles
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, leftPaddleY.current, paddleWidth, paddleHeight); // Left paddle
    ctx.fillRect(canvasWidth - paddleWidth, rightPaddleY.current, paddleWidth, paddleHeight); // Right paddle

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.closePath();
  };

  // Game loop
  const gameLoop = () => {
    movePaddles();
    moveBall();
    renderGame();
    requestAnimationFrame(gameLoop);
  };

  // Keydown events for paddle control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "w") leftUp.current = true;
      if (e.key === "s") leftDown.current = true;
      if (e.key === "ArrowUp") rightUp.current = true;
      if (e.key === "ArrowDown") rightDown.current = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === "w") leftUp.current = false;
      if (e.key === "s") leftDown.current = false;
      if (e.key === "ArrowUp") rightUp.current = false;
      if (e.key === "ArrowDown") rightDown.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    gameLoop();
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
    </div>
  );
};

export default App;
