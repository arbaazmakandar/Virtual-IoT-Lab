const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Experiment = require("../models/experimentsModel");
const authMiddleware = require("../middlewares/authMiddleware");
const AdminAppointments = require("../models/appointmentModel");
const numOfBoards = require("../models/numberOfBoardsModel");
const timingsModel = require("../models/timingsModel");
const boardModel = require("../models/boardModel");


const moment = require( 'moment');

var cors = require('cors');
router.use(cors());

// get-num-of-boards
router.get(
  "/get-num-of-boards",
  authMiddleware,
  async (req, res) => {
    try {
      const numOfBoard = await numOfBoards.find({});
      // console.log(numOfBoard[0].numOfBoads);
      res.status(200).send({
        message: "Number of Boards fetched successfully",
        success: true,
        data: numOfBoard[0]
      });
    } catch (error) {
      // console.log(error);
      res.status(500).send({
        message: "Error fetching number of boards",
        success: false,
        error,
      });
    }
  }
);

//Get All users -> GET
router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting all users",
      success: false,
      error,
    });
  }
});

//Get All Experiments ->GET
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



//Add Experiments ->POST
router.post("/add-experiments-to-db",authMiddleware, async(req,res)=>{
  try { /*
    const experimentExists = await Experiment.findOne({ experimentName: req.body.experimentName });
    if (experimentExists) {
      return res
        .status(200)
        .send({ message: "Experiment already exists", success: false });
    }*/
    const newExperiment = new Experiment(req.body);
    // newExperiment['timings.0'] = moment(newExperiment['timings.0'], "HH:mm"),
    // newExperiment['timings.1'] = moment(newExperiment['timings.1'], "HH:mm"),
    // console.log(newExperiment[timings.0]);

    await newExperiment.save();
    res
      .status(200)
      .send({ message: "Experiment created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating experiment", success: false, error });
  }
})


//Approve Appointment for user -> POST

router.post("/approve-experiment-for-user",
  authMiddleware,
  async (req, res) => {
    try {
      const { appointmentId, status, allocatedBoard } = req.body;
      const appointment = await AdminAppointments.findByIdAndUpdate(appointmentId, {
        status, allocatedBoard
      });
      console.log(allocatedBoard);
      const board = await boardModel.findOne({boardId:allocatedBoard});
      board.boardAvailable = false;
      await board.save();

      const user = await User.findOne({ _id: appointment.userId });
      const unseenNotifications = user.unseenNotifications;
      unseenNotifications.push({
        type: "appointment-status-changed",
        message: `Your appointment for ${appointment.experimentName} on ${moment(appointment.date).format("DD-MM-YYYY")} at ${moment(appointment.time).format("HH:mm")} has been ${status}`,
        onClickPath: "/appointments",
      });


      await user.save();

      res.status(200).send({
        message: "Appointment status updated successfully",
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error changing appointment status",
        success: false,
        error,
      });
    }
  }
);


//get All Appointments ->GET
router.get(
  "/get-all-appointments",
  authMiddleware,
  async (req, res) => {
    try {
      const appointments = await AdminAppointments.find({});
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
  }
);
//Delete experiment
router.post("/delete-experiment",authMiddleware, async (req, res) => {
  try {
    const { experimentId } = req.body;

    const expt = await Experiment.deleteOne({_id:experimentId});
    res.status(200).send({
      message: `Experiment deleted successfully`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error deleting Experiment",
      success: false,
      error,
    });
  }
}
);


//Minus Boards for timeslot
router.post(
  "/minus-boards-for-timeslot",
  authMiddleware,
  async (req, res) => {
    try {
      const appointment = await AdminAppointments.findById({ _id: req.body.appointmentId});
      // console.log(appointment);

      const timings = await timingsModel.find({date:appointment.date, time:appointment.time});
      // console.log(timings);
      const numOfBoard = await numOfBoards.find({});
      // console.log("This is numofboards")
      // console.log(numOfBoard)
      //if slots are empty
      if(timings.length == 0){
        //form a timings model and save
        const newuser = new timingsModel({date:appointment.date,time:appointment.time, numOfBoads:numOfBoard[0].numOfBoads });
        // console.log("THis is new user")
        // console.log(newuser);
        await newuser.save();
        return res.status(200).send({
          message: "Timings slots updated successfully",
          success: true,
        });
      }

      //If slots are full
      // if(timings.numOfBoads == 0)
      // { // this is in user route-> check booking availability
      // }
      else if (timings[0].numOfBoads==0) {
        // console.log("I am in IF");ß
        return res.status(200).send({
          message: "Appointments not available",
          success: false,
        });
      }

      //if slots are not empty
      else{
          // console.log("I am inside else")
          timings[0].numOfBoads = timings[0].numOfBoads - 1;
          // console.log(timings[0]);
          timings[0].save();
          return res.status(200).send({
            message: "Timings slots updated successfully",
            success: true,
          });
      }


    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error updating timings slots",
        success: false,
        error,
      });
    }
  }
);

// router.post("/approve-experiment-for-user",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const { appointmentId, status } = req.body;
//       const appointment = await AdminAppointments.findByIdAndUpdate(appointmentId, {
//         status,allocatedBoard
//       });
//       console.log(allocatedBoard);

//       const user = await User.findOne({ _id: appointment.userId });
//       const unseenNotifications = user.unseenNotifications;
//       unseenNotifications.push({
//         type: "appointment-status-changed",
//         message: `Your appointment status has been ${status}`,
//         onClickPath: "/appointments",
//       });

//       await user.save();

//       res.status(200).send({
//         message: "Appointment status updated successfully",
//         success: true
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         message: "Error changing appointment status",
//         success: false,
//         error,
//       });
//     }
//   }

//   );


//Change Num of Boards

router.post("/change-num-of-boards",
  authMiddleware,
  async (req, res) => {
    try {
      const { numOfBds} = req.body;
      const num = await numOfBoards.findOne({
      });
      num.numOfBoads = numOfBds;
      // console.log(num);
      await num.save();

      // const user = await User.findOne({ _id: appointment.userId });
      // const unseenNotifications = user.unseenNotifications;
      // unseenNotifications.push({
      //   type: "appointment-status-changed",
      //   message: `Your appointment status has been ${status}`,
      //   onClickPath: "/appointments",
      // });

      // await user.save();

      res.status(200).send({
        message: "Boards updated successfully",
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error changing number of Boards",
        success: false,
        error,

      });
    }
  }
);

// These APIs are for adding arduino boards to the website
//and operations on them


//create first route --add Todo Item to database
router.post('/add-board',authMiddleware, async (req, res)=>{
  try{
    const newBoard  = new boardModel(
      req.body
    );
    //save this item in database
    const saveBoard = await newBoard.save();
    res
      .status(200)
      .send({ message: "Added Board successfully", success: true });
  }catch(err){
    console.log(err);
    res
    .status(500)
    .send({ message: "Error Adding Board", success: false, err });
  }
});

//create second route -- get data from database
router.get('/get-boards',authMiddleware, async (req, res)=>{
  try{
    const allBoards = await boardModel.find({});
    res.status(200).json(allBoards)
  }catch(err){
    console.log(err);
    res.json(err);
  }
});


// //update item
// router.put('/update-board/:id',authMiddleware, async (req, res)=>{
//   try{
//     //find the item by its id and update it
//     const updateBoard = await boardModel.findByIdAndUpdate(req.params.id, {$set: req.body});
//     res.status(200).json(updateBoard);
//   }catch(err){
//     console.log(err);
//     res.json(err);
//   }
// })


//Delete item from database
router.delete('/delete-board/:id',authMiddleware, async (req, res)=>{
  try{
    //find the item by its id and delete it
    const deleteBoard = await boardModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ message: " Board deleted successfully", success: true });
  }catch(err){
    console.log(err);
    res
    .status(500)
    .send({ message: "Error Deleting Board", success: false, err });
  }
});

//get all available boards from database
router.get('/get-available-boards',authMiddleware, async (req, res)=>{
  try{
    const availableBoards = await boardModel.find({boardAvailable:true});
    res.status(200).json(availableBoards)
  }catch(err){
    console.log(err);
    res.json(err);
  }
});



module.exports = router;
