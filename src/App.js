import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const canvasWidth = 800;
  const canvasHeight = 400;
  const paddleWidth = 10;
  const paddleHeight = 100;

  // Initialize WebSocket connection to the server
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8765");

    socketRef.current.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    socketRef.current.onmessage = (event) => {
      const newGameState = JSON.parse(event.data);
      setGameState(newGameState); // Update the game state with the data received from the server
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  // Key event handling for player movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!player || !gameState) return;
      let direction = "";
      if (player === "player1") {
        if (e.key === "w") direction = "up";
        if (e.key === "s") direction = "down";
      } else if (player === "player2") {
        if (e.key === "ArrowUp") direction = "up";
        if (e.key === "ArrowDown") direction = "down";
      }

      if (direction) {
        // Send player movement to the server
        socketRef.current.send(
          JSON.stringify({ player, direction })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, gameState]);

  // Handle player selection
  const startGame = (selectedPlayer) => {
    setPlayer(selectedPlayer);
  };

  // Draw game state on the canvas
  const renderGame = () => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw paddles
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, gameState.player1.y, paddleWidth, paddleHeight); // Left paddle
    ctx.fillRect(canvasWidth - paddleWidth, gameState.player2.y, paddleWidth, paddleHeight); // Right paddle

    // Draw ball
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.closePath();
  };

  // Select player and start the game
  const selectPlayer = (selectedPlayer) => {
    setPlayer(selectedPlayer);
  };

  // Display the game or player selection screen
  return (
    <div className="App">
      {player === null ? (
        <div className="player-selection">
          <h2>Select Your Player</h2>
          <button onClick={() => startGame("player1")}>Player 1 (W/S)</button>
          <button onClick={() => startGame("player2")}>Player 2 (Arrow Up/Down)</button>
        </div>
      ) : (
        <div>
          <h2>Player Selected: {player === "player1" ? "Player 1" : "Player 2"}</h2>
          <p>Controls: {player === "player1" ? "W/S" : "Arrow Up/Down"}</p>
          <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
          {/* Render the game on the canvas */}
          {gameState && renderGame()}
        </div>
      )}
    </div>
  );
};

export default App;
