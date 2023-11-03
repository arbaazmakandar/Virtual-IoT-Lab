const express = require("express");
const os = require('os');

const Docker = require('dockerode');
const DockerodeCompose = require('dockerode-compose');
const { exec } = require('child_process');


const router = express.Router();
const User = require("../models/userModel");
const Experiment = require("../models/experimentsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const timingsModel = require("../models/timingsModel");
const boardModel = require("../models/boardModel");

const moment = require("moment");

var cors = require('cors');
const homeDir = os.homedir();
router.use(cors()); 
const docker = new Docker();

//Start container here on clicking start
// router.post('/start-container', (req, res) => {
//   const docker = new Docker();
//   const container = docker.getContainer(req.body.containerId);
//   container.start((err, data) => {
//     if (err) {
//       res.status(500).send({ message: 'Failed to start container', error: err });
//     } else {
//       res.status(200).send({ message: 'Container started successfully' });
//     }
//   });
// });




// Define a function to start the Arduino monitor and connect it to pty









//Create/Join container and start here on clicking start/join session
router.post('/create-container', authMiddleware , async (req, res) => {
  console.log("% create - container start");
  const options = {
    Image: "arduino",
    name: `${req.body.record._id}Container`,
    HostConfig :{
            Binds: [`${homeDir}/Desktop/volumes/myhome/bin:/home/rluser/bin`],
            PortBindings: {
              '7681/tcp': [{ "HostPort": ''}]
            },
            Devices: [
              {
                PathOnHost: `/dev/${req.body.record.allocatedBoard}`,
                PathInContainer: `/dev/${req.body.record.allocatedBoard}`,
                CgroupPermissions: 'rwm'
              }
            ],
            // CapAdd: ['NET_ADMIN']
            AutoRemove: true
          },
    ExposedPorts:{"7681/tcp":{}},
    TaskTemplate:{
            ContainerSpec:{
              Mounts:[{
                  Source: "./volumes/myhome",
            Destination: "/home/rluser",
          Type:"bind"}
              ]
            }
          },
    Detach: true // <-- Add this line to start the container in detached mode
    
  };

    // Check if the container already exists
    docker.listContainers({ all: true }, (err, containers) => {
      if (err) {
        res.status(500).send({ message: 'Failed to list containers', error: err });
      } else {
        const containerFound = containers.find((container) => container.Names.includes(`/${options.name}`) &&
        container.State === 'running');
        if (containerFound) {
          // Join the existing container
          const command = `docker exec -d ${options.name} /bin/sh`;
          exec(command, (err, stdout, stderr) => {
            if (err) {
              res.status(500).send({ message: 'Failed to join container', error: err });
            } else {
              const inspectOptions = {
                format: '{{json .NetworkSettings.Ports}}'
              };
              const container = docker.getContainer(containerFound.Id);

              container.inspect(inspectOptions, (err, data) => {
                if (err) {
                  console.log('Error inspecting container: ', err);
                } else {
                  const hostPort = data['NetworkSettings']['Ports']['7681/tcp'][0]['HostPort'];
                  res.status(200).send({ message: `Container joined successfully on port=${hostPort}`, output: stdout });
                  console.log(data['NetworkSettings']['Ports']['7681/tcp'][0]['HostPort']);
                  console.log(`Container port 7681 is exposed on host port ${hostPort}`);
                }
              });

            }
          });
        } else {
          // Create and start the new container
  docker.createContainer(options, (err, container) => {
    if (err) {
      res.status(500).send({ message: 'Failed to create container', error: err });
    } else {

      container.start((err, data) => {
        if (err) {
          // console.log('Error starting container: ', err);
          res.status(500).send({ message: 'Failed to start container', error: err });
        } else {
          const inspectOptions = {
            format: '{{json .NetworkSettings.Ports}}'
          };
          container.inspect(inspectOptions, (err, data) => {
            if (err) {
              console.log('Error inspecting container: ', err);
            } else {
              const hostPort = data['NetworkSettings']['Ports']['7681/tcp'][0]['HostPort'];
              res.status(200).send({ message: `Container created and started successfully on port=${hostPort}` });
              // console.log(data['NetworkSettings']['Ports']['7681/tcp'][0]['HostPort']);
              // console.log(`Container port 7681 is exposed on host port ${hostPort}`);
            }
          });
        }
      });
    }
  });
}
}
});
console.log("% create - container finish");
});

router.post('/upload-command', (req, res) => {
  console.log("% upload-command start");
  const containerId = req.body.containerId;
  const fPath = '/home/rluser/bin/' + req.body.fPath;
  const command = ['/usr/bin/arduino-cli', 'upload', '--port', '/dev/ttyUSB0', '--fqbn', 'arduino:avr:diecimila', fPath];
  const container = docker.getContainer(containerId);
  container.exec({ Cmd: command, User: 'rluser', WorkingDir: '/home/rluser/bin', AttachStdout: true, AttachStderr: true }, (err, exec) => {
    if (err) {
      res.status(500).send(err);
      console.log("error1");
    }
    else {
      exec.start((err, stream) => {
        if (err) {
          console.log("error2");
          res.status(500).send(err);
        }
        else {
          container.modem.demuxStream(stream, process.stdout, process.stderr);
          exec.inspect(function(err, data) {
            if (err) {
              console.log("error3");
              res.status(500).send(err);
            }
            //console.log(data);
            res.status(200).send({ output: `${data}`, message: "compiled sucessfully" });
          });
        }
      });
    }
  });
  console.log("% upload-command finish");
});

router.post('/compile-command', (req, res) => {

/*
  docker.listContainers((err, containers) => {
    if (err) {
      console.log(err);
      return;
    }
    containers.forEach((container) => {
      console.log(container.Names[0]);
    });
  });
*/

console.log("% compile-command start");

  const containerId = req.body.containerId;
  const fPath = '/home/rluser/bin/' + req.body.fPath;
  const command = ['arduino-cli', 'compile', '--fqbn', 'arduino:avr:diecimila', fPath];
//   const command = ['ls','-l'];
  const container = docker.getContainer(containerId);
  container.exec({ Cmd: command, User: 'rluser', WorkingDir: '/home/rluser/bin', AttachStdout: true, AttachStderr: true }, (err, exec) => {
    if (err) {
      console.log("error11");
      res.status(500).send(err);
    }
    else {
      exec.start((err, stream) => {
        if (err) {
          console.log("error12");
          res.status(500).send(err);
        }
        else {
          container.modem.demuxStream(stream, process.stdout, process.stderr);
          exec.inspect(function(err, data) {
            if (err)
            {
              console.log("error13");
              res.status(500).send(err);
            }
            //console.log(data);
            res.status(200).send({ output: `${data}`, message: "compiled sucessfully" });
          });
        }
      });
    }
  });
  console.log("% compile-command stop");
});




router.post('/get-board',authMiddleware, async (req, res)=>{
  console.log("% get-board start");
  try{
    const boardId = req.body.boardId;
    const board = await boardModel.findOne({boardId:boardId});
    
    // console.log(board);
    res.status(200).send({
      message: "Board fetched successfully",
      success: true,
      data: board
    });
    
  }catch(err){
    console.log(err);
    res.status(500).send({ message: 'Failed to get Board', error: err });
  }
  
  console.log("% get-board stop");
});



//Delete Container when click End
router.post('/destroy-container', authMiddleware , async (req, res) => {
  console.log("% destroy-container start");
  const container = docker.getContainer(req.body.containerId);
  container.remove({ force: true }, (removeErr) => {
    if (removeErr) {
      console.log("Failed to destroy container");
      res.status(500).send({ message: 'Failed to destroy container', error: removeErr });
    } else {
      console.log("Container destroyed successfully");
      res.status(200).send({ message: 'Container destroyed successfully' });
    }
  });
  console.log("% destroy-container stop");
});

function generateFolderData(folderPath, rootPath = folderPath) {
  console.log("% get-folderdata function start");
  const fs = require('fs');
  const path = require('path');

  const folderName = path.basename(folderPath);
  const folder = { name: folderName, children: [], url: path.relative(rootPath, folderPath) };

  const items = fs.readdirSync(folderPath);

  // sort items by file first, then by directory
  items.sort((a, b) => {
    const aPath = path.join(folderPath, a);
    const bPath = path.join(folderPath, b);
    const aStats = fs.statSync(aPath);
    const bStats = fs.statSync(bPath);
    if (!aStats.isDirectory() && bStats.isDirectory()) {
      return -1;
    } else if (aStats.isDirectory() && !bStats.isDirectory()) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  items.forEach((item) => {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory() && item !== 'blank') {
      // check if this directory should be displayed as a file
      const isArduinoFile = fs.readdirSync(itemPath).some((file) => {
        return path.extname(file) === '.ino';
      });
      if (isArduinoFile) {
        const file = { name: item, isFile: true, url: path.relative(rootPath, itemPath) };
        folder.children.push(file);
      } else {
        const subFolder = generateFolderData(itemPath, rootPath);
        folder.children.push(subFolder);
      }
    } else if (stats.isFile()) {
      // do nothing
    }
  });
  console.log("% get-folderdata function stop");
  return folder;
}

router.get("/get-folder-data", authMiddleware, async (req, res) => {
  console.log("% get-folder start");
  try {
    const fPath = `${homeDir}/Desktop/volumes/myhome/bin/`;
    const folderData = generateFolderData(fPath);
//     console.log(folderData);
    res.status(200).send({ message:"Data generated sucessfully",
     data: folderData
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting folder data",
      success: false,
      error,
    });
  }
  console.log("% get-folder end");
});

router.post("/get-file-data", authMiddleware, async (req, res) => {
  console.log("** get-file-data function start");
  try {
    const fs = require('fs');
    async function getFileData(fPath) {
      try {
        const data = await fs.promises.readFile(fPath, 'utf8');
        return data;
      } catch (err) {
        throw err;
      }
    }

    const fPath = `${homeDir}/Desktop/volumes/myhome/bin/` + req.body.fPath + '/' + req.body.fPath.split('/').pop() + '.ino';
    const fileData = await getFileData(fPath);
    res.status(200).send({ message:"Data read sucessfully",
     data: fileData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting file data",
      success: false,
      error,
    });
  }
  console.log("** get-file-data function stop");
  
});

router.post("/set-file-data", authMiddleware, async (req, res) => {
  console.log("** SET-file-data request start");
  try {
    const fs = require('fs');
    const fPath = `${homeDir}/Desktop/volumes/myhome/bin/` + req.body.fPath + '/' + req.body.fPath.split('/').pop() + '.ino';
    fs.writeFileSync(fPath, req.body.fData, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.status(200).send({ message:"Data written sucessfully",});
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error writing file data",
      success: false,
      error,
    });
  }
  console.log("** SET-file-data request stop");
});

router.post("/delete-file", authMiddleware, async (req, res) => {
  console.log("** DELETE-file-data function start");
  try {
    const fs = require('fs');
    const fPath = `${homeDir}/Desktop/volumes/myhome/bin/` + req.body.fPath;
    fs.rmSync(fPath, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.status(200).send({ message:`Deleted successfully`});
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error deleting file",
      success: false,
      error,
    });
  }
  console.log("** DELETE-file-data function stop");
});

router.post("/rename-file", authMiddleware, async (req, res) => {
  console.log("** rename-file-data start");
  try {
    const fs = require('fs');
    var fPath = `${homeDir}/Desktop/volumes/myhome/bin/` + req.body.fPath;
    var newFPath = `${homeDir}/Desktop/volumes/myhome/bin/` + req.body.fPath.split("/").slice(0, -1).join("/") + "/" + req.body.newName;
    console.log(newFPath);
    if(fs.existsSync(newFPath))
    {
        res.status(409).send({
          message: "File/folder with the same name already exists",
          success: false,
        });
        return;
    }
    else
    {
      try {
        fs.renameSync(fPath, newFPath);
        if(req.body.isFile) {
          fPath = newFPath + '/' + ("/"+fPath).split('/').pop() + '.ino';
          newFPath = newFPath + '/' + newFPath.split('/').pop() + '.ino';
          fs.renameSync(fPath, newFPath);
        }
      } catch (err) {
        console.log("Error Renaming", err);
        res.status(500).send({
          message: "Error Renaming",
          success: false,
          err,
        });
        return;
      }
    }
    res.status(200).send({ message:`Renamed successfully`});
  }
  catch (error)
  {
    console.log("436", error);
    res.status(500).send({
      message: "Error renaming file",
      success: false,
      error,
    });
    return;
  }
  console.log("** rename-file-data stop");
});

router.post("/add-file", authMiddleware, async (req, res) => {
  console.log("** add-file-data start");
  try {
    const fs = require('fs');
    var fPath = `${homeDir}/Desktop/volumes/myhome/bin/` + req.body.fPath;
    var fName = "newfolder";
    if(req.body.isFile)
      fName = "newfile";
    fPath = fPath + "/" + fName;
    if (fs.existsSync(fPath)) {
      // If it exists, create a new folder with a different name
      let count = 1;
      do {
        count++;
      } while (fs.existsSync(`${fPath}${count}`));
      fPath = `${fPath}${count}`;
    }
    if(req.body.isFile)
    {
      fs.mkdirSync(fPath, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      fPath = fPath + '/' + fPath.split('/').pop() + '.ino';
      fs.writeFileSync(fPath, `${fPath.split('/').pop()}`, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    else
    {
      fs.mkdirSync(fPath, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    res.status(200).send({ message:`Created successfully`});
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error creating file",
      success: false,
      error,
    });
  }
});

router.post("/register", async (req, res) => {
  console.log("** register on post req start");
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating user", success: false, error });
  }
  console.log("** register on post req start");
});

router.post("/update-user-profile", authMiddleware, async (req, res) => {
  console.log("** update-user-profile on post req start");
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
  console.log("** update-user-profile on post req start");
});


router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});


router.post("/get-experiment-info-by-id", authMiddleware, async (req, res) => {
  try {
    const expt = await Experiment.findOne({ _id: req.body.experimentId });
    res.status(200).send({
      success: true,
      message: "Experiment info fetched successfully",
      data: expt,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting experiment info", success: false, error });
  }
});

router.post("/mark-all-notifications-as-seen",authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      const unseenNotifications = user.unseenNotifications;
      const seenNotifications = user.seenNotifications;
      seenNotifications.push(...unseenNotifications);
      user.unseenNotifications = [];
      user.seenNotifications = seenNotifications;
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All notifications marked as seen",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
  }
);

router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications cleared",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying doctor account",
      success: false,
      error,
    });
  }
});

router.get("/get-all-experiments", authMiddleware, async (req, res) => {
  try {
    const expts = await Experiment.find({});
    res.status(200).send({
      message: "Experiments fetched successfully",
      success: true,
      data: expts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting all experiments",
      success: false,
      error,
    });
  }
});

router.post("/book-appointment", authMiddleware, async (req, res) => {
  console.log("book-appointment start on post request");
  try {
    req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();

    


              
    const newAppointment = new Appointment(req.body);
    // const exp = await Experiment.findOne({
    //   _id:req.body.experimentId
    // });
    await newAppointment.save();
    //pushing notification to admin based on his userid
    const user = await User.findOne({ isAdmin: true });
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name} for ${req.body.experimentName}`,
      onClickPath: "/admin/appointmentList",
    });
  
    await user.save();
    
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
    

    // exp.numOfBoards = exp.numOfBoards - 1;
    // console.log(exp);
    // exp.save(function(){});

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
  console.log("book-appointment stop on post request");
});

router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
  console.log("check-booking-avilability start on post request");
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1.5, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1.5, "hours").toISOString();
    const experimentId = req.body.experimentId;
    const appointments = await Appointment.find({
      experimentId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });

    // const exp = await Experiment.find({
    //   _id:experimentId,
    // });
    // console.log(fromTime);
    // console.log("/n");
    // console.log(appointments.length);
    // console.log(appointments[0].status);
    // console.log(exp.length);
    // console.log(moment(req.body.date, "DD-MM-YYYY").toISOString())
    // console.log(moment(req.body.time, "HH:mm").toISOString())

    const timings = await timingsModel.find({date:moment(req.body.date, "DD-MM-YYYY").toISOString(),
                                             time:moment(req.body.time, "HH:mm").toISOString()});

    //If slots are full => timings.numOfBoads==0
    // console.log("I am inside user")
    //  console.log(timings);

    if ((appointments.length > 0 && appointments[0].status == "approved") && (timings.length!=0 && timings[0].numOfBoads==0)) {
      // console.log("I am in IF");ß
      return res.status(200).send({
        message: "Appointments not available",
        success: false,
      });
      
    }
     else{
      // console.log("I am in Else");
      return res.status(200).send({
        message: "Appointments available",
        success: true,
      });
      
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
  console.log("check-booking-avilability stop on post request");
});

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
    res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error,
    });
  }
});
module.exports = router;
