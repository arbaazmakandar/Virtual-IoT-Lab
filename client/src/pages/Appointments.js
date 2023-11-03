import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Table } from "antd";
import moment from "moment";
import ReactModal from 'react-modal';

moment().utcOffset("+05:30").format();

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const startExperiment = async (record, status) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        `${window.location.protocol}//${window.location.hostname}/api/user/create-container`,
        {
          record: record,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.status === 200) {
        try {
          const res = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/get-board`, { boardId: record.allocatedBoard }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          localStorage.setItem("CamPort", res.data.data.camPort);
          localStorage.setItem("containerId", `${record._id}Container`);
        } catch (err) {
          console.log(err);
        }

        localStorage.setItem("TerminalPort", response.data.message.split("=")[1]);
        navigate("/ceditor");
      }
    } catch (error) {
      console.log(error);
      dispatch(hideLoading());
    }
  };

  const getAppointmentsData = useCallback(async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(`${window.location.protocol}//${window.location.hostname}/api/user/get-appointments-by-user-id`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        // Update each appointment with an "isButtonEnabled" property
        const updatedAppointments = response.data.data.map((appointment) => {
          const startTime = moment(appointment.time);
          const endTime = moment(appointment.time).add(1, "hour");
          const currentTime = moment();
          const isWithinTimeSlot = currentTime.isBetween(startTime, endTime);

          return {
            ...appointment,
            isButtonEnabled: isWithinTimeSlot,
          };
        });

        setAppointments(updatedAppointments);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  }, [dispatch]);

  useEffect(() => {
    getAppointmentsData();
  }, [getAppointmentsData]);

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Experiment-Title",
      dataIndex: "experimentName",
      render: (text, record) => (
        <span>
          {record.experimentName}
        </span>
      ),
    },
    {
      title: "User-Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.userInfo.name}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")}
        </span>
      ),
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {moment(record.time).format("HH:mm")} {" - "}
          {moment(record.time).add(0.916667, "hours").format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "status",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "approved" ? (
            <div className="d-flex">
              <h1
                className={`anchor px-2 ${
                  record.isButtonEnabled ? "active" : "inactive"
                }`}
                onClick={() =>
                  record.isButtonEnabled
                    ? startExperiment(record, "approved")
                    : null
                }
              >
                {record.isButtonEnabled ? "Start" : "Over"}
              </h1>
            </div>
          ) : (
            <div className="d-flex">
              <h1 className="anchor px-2 inactive">Start</h1>
            </div>
          )}
        </div>
      )
    }
    
  ];

  return (
    <Layout>
      <h1 className="page-title">Appointments</h1>
      <hr />
      <Table columns={columns} dataSource={appointments} />
    </Layout>
  );
}

export default Appointments;
