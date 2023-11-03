const mongoose = require("mongoose");
const boardSchema = new mongoose.Schema(
  {
      boardId: {
      type: String,
      // required: false,
    },
    boardName: {
      type: String,
      required: true,
    },
    boardAvailable:{
      type:Boolean,
      default:true
    },
    camPort:{
      type:String,
      required:true
    }
   
  }
);

const boardModel = mongoose.model("boards", boardSchema);
module.exports = boardModel;
