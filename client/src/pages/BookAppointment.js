import { Button, Col, DatePicker, Form, Input, Row, TimePicker } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
moment().utcOffset("+05:30").format()


function BookAppointment() {
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();

  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [startTime,setStartTime] = useState();
  const [endTime,setEndTime] = useState();
  const { user } = useSelector((state) => state.user);
  const [experiment, setExperiment] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  function getDisabledHours() {
    var hours = [];
    for (let i = parseInt(moment().startOf('day').format("HH"));i < moment(experiment.timings[0]).format("HH"); i++) {
      hours.push(i);
    }

    if(parseInt(moment(experiment.timings[1]).format("HH")) != 23){
      for (let i = parseInt(moment(experiment.timings[1]).add(1, "hours").format("HH"));i <= parseInt(moment().endOf('day').format("HH")); i++) {
        hours.push(i);
      }
    } 
    else{
      hours.push(24);
    }
    // console.log(hours);
    return hours;
  }
 

  const getExperimentData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${window.location.protocol}//${window.location.hostname}/api/user/get-experiment-info-by-id`,
        {
          experimentId : params.experimentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        setExperiment(response.data.data);
      }
    } catch (error) {
      console.log(error);
      dispatch(hideLoading());
    }
  };

  const checkAvailability = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${window.location.protocol}//${window.location.hostname}/api/user/check-booking-avilability`,
        {
          experimentId : params.experimentId,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        setIsAvailable(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error booking appointment");
      dispatch(hideLoading());
    }
  };

  const bookNow = async () => {
    setIsAvailable(false);
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${window.location.protocol}//${window.location.hostname}/api/user/book-appointment`,
        {
          experimentId: params.experimentId,
          userId: user._id,
          experimentName: experiment.experimentName,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        
        toast.success(response.data.message);
        navigate('/appointments')
      }
    } catch (error) {
      toast.error("Error booking appointment");
      dispatch(hideLoading());
    }
  };
 
  useEffect(() => {
    getExperimentData();
  }, []);
  return (
    
    <Layout>
      {experiment && (
        <div>
          <h1 className="page-title">
            {experiment.experimentName}
          </h1>
          <hr />
          <Row gutter={20} className="mt-5" align="middle">

            <Col span={8} sm={24} xs={24} lg={8}>
              <img
                src="https://thumbs.dreamstime.com/b/finger-press-book-now-button-booking-reservation-icon-online-149789867.jpg"
                alt=""
                width="100%"
                height='400'
              />
            </Col>
            <Col span={8} sm={24} xs={24} lg={8}>
              <h1 className="normal-text">
                <b>Timings :</b> { moment(experiment.timings[0]).format("HH:mm")} - {moment(experiment.timings[1]).format("HH:mm")}
              </h1>
              <p>
                <b>Experiment Details : </b>
                <br/>
                {experiment.experimentDetails}
              </p>
              <div className="d-flex flex-column pt-2 mt-2">
                    <DatePicker
                        format="DD-MM-YYYY"
                        disabledDate={(current) =>
                          current && !(moment(current).isSameOrAfter(moment(), "day") && moment(current).isSameOrBefore(moment().add(1, "day"), "day"))
                        }
                        onChange={(value) => {
                          setDate(moment(value).format("DD-MM-YYYY"));
                          setIsAvailable(false);
                        }}
                      />
                      <TimePicker
                  format="HH"
                  className="mt-3"
                  disabledHours={getDisabledHours}
                  // disabledTime={(current) => {
                  //   let fromTime= moment(experiment.timings[0]).format("HH:mm");
                  //   let toTime= moment(experiment.timings[1]).format("HH:mm");

                  //   return current>fromTime && current < toTime;
                  // }}
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime( moment(value).format("HH:mm"));
                    setStartTime(moment(value).format("HH:mm"))
                    setEndTime(moment(value).add(0.916667, "hours").format("HH:mm"))
                  }}
                />
                <br/>
                <h5>Time duration:- {startTime} - {endTime}</h5>
              {!isAvailable &&   <Button
                  className="primary-button mt-3 full-width-button"
                  onClick={checkAvailability}
                >
                  Check Availability
                </Button>}

                {isAvailable && (
                  <Button
                    className="primary-button mt-3 full-width-button"
                    onClick={bookNow}
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </Col>
           
          </Row>
        </div>
      )}
      
    </Layout>
  );
}

export default BookAppointment;
