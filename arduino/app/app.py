from flask import Flask, render_template
from flask_socketio import SocketIO
from serial import Serial
from flask_cors import CORS

import time
from threading import Thread

app = Flask(__name__)
socketio = SocketIO(app)
CORS(app, resources={r"/socket.io/*": {"origins": "*"}})
# Replace 'COM14' with the appropriate serial port for your Arduino
arduino_port = 'COM14'
arduino_baud_rate = 9600
arduino_serial = Serial(arduino_port, arduino_baud_rate)

def read_serial():
    while True:
        if arduino_serial.in_waiting > 0:
            data = arduino_serial.readline().decode('utf-8').strip()
            socketio.emit('arduinoData', data)
            print( data)
            time.sleep(0.1)  # Add a small delay to control the rate of data transmission

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    print('Client connected')

if __name__ == '__main__':
    arduino_thread = Thread(target=read_serial)
    arduino_thread.daemon = True
    arduino_thread.start()
    socketio.run(app, host='0.0.0.0', port=5000)
