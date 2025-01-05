import asyncio
import websockets
import json

# Constants for the game (dimensions)
canvasWidth = 800
canvasHeight = 400
paddleWidth = 10
paddleHeight = 100

# List of active WebSocket connections
connected_clients = set()

# Game state: Player positions and ball state
game_state = {
    "player1": {"y": 200},  # y-position of player 1
    "player2": {"y": 200},  # y-position of player 2
    "ball": {"x": 400, "y": 200, "speed_x": 2, "speed_y": 2}  # Ball position and speed
}

async def handle_client(websocket):
    """Handles each new WebSocket client connection."""
    connected_clients.add(websocket)
    try:
        print(f"New connection: {websocket.remote_address}")

        # Send the initial game state to the new client
        await websocket.send(json.dumps(game_state))

        # Listen for messages from the client (keyboard events)
        async for message in websocket:
            print(f"Message from client: {message}")
            # Update the game state based on the player's movement (e.g., "w", "s")
            try:
                data = json.loads(message)
                player = data.get("player")
                direction = data.get("direction")

                if player == "player1":
                    if direction == "up" and game_state["player1"]["y"] > 0:
                        game_state["player1"]["y"] -= 10
                    elif direction == "down" and game_state["player1"]["y"] < canvasHeight - paddleHeight:
                        game_state["player1"]["y"] += 10

                elif player == "player2":
                    if direction == "up" and game_state["player2"]["y"] > 0:
                        game_state["player2"]["y"] -= 10
                    elif direction == "down" and game_state["player2"]["y"] < canvasHeight - paddleHeight:
                        game_state["player2"]["y"] += 10

                # Broadcast the updated game state to all clients
                for client in connected_clients:
                    if client != websocket:
                        try:
                            await client.send(json.dumps(game_state))
                        except websockets.exceptions.ConnectionClosed:
                            connected_clients.remove(client)

            except json.JSONDecodeError:
                print("Received invalid JSON data.")

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {websocket.remote_address}")
    finally:
        # Unregister the client when they disconnect
        connected_clients.remove(websocket)

async def game_loop():
    """Runs a game loop to update the ball's position and broadcast the game state."""
    global game_state
    while True:
        # Update ball position
        game_state['ball']['x'] += game_state['ball']['speed_x']
        game_state['ball']['y'] += game_state['ball']['speed_y']

        # Ball collision with top and bottom walls
        if game_state['ball']['y'] <= 0 or game_state['ball']['y'] >= canvasHeight:
            game_state['ball']['speed_y'] = -game_state['ball']['speed_y']

        # Ball collision with paddles
        if game_state['ball']['x'] <= paddleWidth and (
            game_state['ball']['y'] >= game_state['player1']['y'] and
            game_state['ball']['y'] <= game_state['player1']['y'] + paddleHeight):
            game_state['ball']['speed_x'] = -game_state['ball']['speed_x']

        if game_state['ball']['x'] >= canvasWidth - paddleWidth and (
            game_state['ball']['y'] >= game_state['player2']['y'] and
            game_state['ball']['y'] <= game_state['player2']['y'] + paddleHeight):
            game_state['ball']['speed_x'] = -game_state['ball']['speed_x']

        # Broadcast updated game state to all connected clients
        for client in connected_clients:
            try:
                await client.send(json.dumps(game_state))
            except websockets.exceptions.ConnectionClosed:
                connected_clients.remove(client)

        await asyncio.sleep(0.02)  # ~50 FPS

async def main():
    # Set up the WebSocket server to listen on ws://localhost:8765
    async with websockets.serve(handle_client, "localhost", 8765):
        print("WebSocket server is running on ws://localhost:8765")
        # Run the game loop in the background
        asyncio.create_task(game_loop())
        await asyncio.Future()  # Keep the server running indefinitely

# Start the WebSocket server
if __name__ == "__main__":
    asyncio.run(main())
