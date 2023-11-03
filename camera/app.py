from flask import Flask,render_template,Response
import cv2


app = Flask(__name__)
camera = cv2.VideoCapture(0)

def generate_frames():
    while(True):
        #read the camera frame
        success,frame = camera.read()
        if not success:
            break
        else:
            #frame = cv2.resize(frame, (256, 144))
            #frame = cv2.resize(frame, (426, 240))
            #frame = cv2.resize(frame, (640, 360))
            frame = cv2.resize(frame, (854, 480))
            #frame = cv2.resize(frame, (1280, 720))
            #frame = cv2.resize(frame, (1920, 1080))
            ret,buffer = cv2.imencode('.jpg',frame)
            frame = buffer.tobytes()
        yield(b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')




@app.route('/camera/cam1')
def index1():
    return render_template('index1.html')

@app.route('/camera/cam2')
def index2():
    return render_template('index2.html')

@app.route('/camera/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if( __name__ == "__main__"):
    app.run(host='0.0.0.0', port=9000, threaded=True)
