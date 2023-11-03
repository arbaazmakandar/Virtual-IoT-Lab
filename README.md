# Remote IoT Lab

Before working on the project each time, run

### `git fetch origin master`
### `git merge origin/master`

Command to run node.js in production made(port 4000)
### `export NODE_ENV=production`
### `node server.js`

Command to run react in production made(port 3000)
### `serve -s build`

## Available Scripts

In the ceditor and sheduler folders run:

### `npm install`

before running

### `npm start`

### `arduino-cli compile --fqbn arduino:avr:diecimila led_change`

### `arduino-cli upload --port /dev/ttyUSB0 --fqbn arduino:avr:diecimila led_change`
