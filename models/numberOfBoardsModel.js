// This Model is for allocating the baords to the experiments
//The boards will be added by the admin
//The booking of an experiment for a time slot will subtract the boards for that time, 
//This procedure will be done when the admin approves the experiment
//Here there will be date and time. 

const mongoose = require("mongoose");
const numOfBoardsSchema = new mongoose.Schema(
  {
    
     numOfBoads: {
        type: Number,
        required:true,
        default:1,
      }
  },
  {
    timestamps: true,
  }
);

const numberOfBoardsModel = mongoose.model("numberOfBoardsSchema", numOfBoardsSchema);
module.exports = numberOfBoardsModel;
