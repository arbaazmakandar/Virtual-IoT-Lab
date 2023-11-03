import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
moment().utcOffset("+05:30").format()

//THIS IS Experiment CARD

function Experiment({ experiment }) {
  const navigate = useNavigate();
  return (
    <div
      className="card p-2 cursor-pointer"
      onClick={() => navigate(`/book-appointments/${experiment._id}`)}
    >
      <h1 className="card-title">
        {experiment.experimentName}
      </h1>
      <hr />
      <p>
        <b>Experiment Details: </b>
        {experiment.experimentDetails}
      </p>
      <p>
        <b>Timings : </b>
        { moment(experiment.timings[0]).format("HH:mm")} - {moment(experiment.timings[1]).format("HH:mm")}
      </p>
    </div>
  );
}

export default Experiment;
