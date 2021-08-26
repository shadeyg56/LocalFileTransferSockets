from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit, join_room, leave_room


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=5000)
clients = []


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("connect")
def connected():
    print("Client connected")
    join_room(request.remote_addr)
    if request.remote_addr not in clients:
        emit("load_clients", clients)
        socketio.emit("client_connect", request.remote_addr)
        clients.append(request.remote_addr)


@socketio.on("disconnect")
def disconnect():
    if request.remote_addr in clients:
        clients.remove(request.remote_addr)
    print("Client disconnected")
    socketio.emit("client_disconnect", request.remote_addr)


@socketio.on("message_sent")
def message_handler(msg):
    msg = f"{request.remote_addr}: {msg}"
    socketio.emit("message_received", msg)


@socketio.on("file_sent")
def file_handler(data):
    clients = data["clients"]
    bytes = data["bytes"]
    type = data["ext"]
    _send = {"url": bytes, "sender": request.remote_addr, "ext": type}
    for client in clients:    
        emit("file_received", _send, to=client)


if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
