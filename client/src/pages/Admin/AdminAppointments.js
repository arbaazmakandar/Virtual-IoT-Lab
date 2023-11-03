import React from "react"
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Table, Select, Space } from "antd";
import moment from "moment";
moment().utcOffset("+05:30").format()

const AdminAppointments = () =>{
  const [appointments, setAppointments] = useState([]);
  const [availableBoards, setAvailableBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");


  const dispatch = useDispatch();
  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get(
        `${window.location.protocol}//${window.location.hostname}/api/admin/get-all-appointments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (resposne.data.success) {
        setAppointments(resposne.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };
  useEffect(() => {
    const getAvailableBoards = async () => {
      try {
        dispatch(showLoading());
        const resposne = await axios.get(
          `${window.location.protocol}//${window.location.hostname}/api/admin/get-available-boards`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        dispatch(hideLoading());
        // console.log(resposne)
        if (resposne.status==200) {
          console.log(resposne.data)

          setAvailableBoards(resposne.data);
        }
      } catch (error) {
        dispatch(hideLoading());
      }
    };
  
    getAvailableBoards();
  }, []);
  


  const changeAppointmentStatus = async (record, status, allocatedBoard) => {
    try {
      dispatch(showLoading());
      const resposne = await axios.post(
        `${window.location.protocol}//${window.location.hostname}/api/admin/approve-experiment-for-user`,
        { appointmentId : record._id, status: status, allocatedBoard:allocatedBoard },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
//       const resposne2 = await axios.post(
//         `${window.location.protocol}//${window.location.hostname}/admin/minus-boards-for-timeslot`,
//         { appointmentId : record._id },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//
      dispatch(hideLoading());
      if (resposne.data.success) {
        toast.success(resposne.data.message);
        getAppointmentsData();
      }
//       if (resposne2.data.success) {
//         toast.success(resposne.data.message);
//       }
    } catch (error) {
      toast.error("Error changing status");
      dispatch(hideLoading());
    }
  };
  const columns = [
    // {
    //   title: "Id",
    //   dataIndex: "_id",
    // },
    {
      title: "Experiment-Name",
      dataIndex: "experimentName",
      render: (text, record) => <span>{record.experimentName}</span>,
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
      title: "Allocated Board ID",
      dataIndex: "allocatedBoard",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" && (
            <div className="d-flex">
              <Space direction="horizontal">
              <Select 
              style={{ width: 250 }}
                  placeholder="select board" 
                  options={availableBoards.map(board => {
                    return {
                      label:`${board.boardId}. ${board.boardName}`,
                      value: `${board.boardId}`
                    }
                  })}
                  value={selectedBoard}
                  onChange={(value) => setSelectedBoard(value)}
                />
              </Space>
            </div>
          )}{
            record.status === "approved" && (
              record.allocatedBoard
            )
            
          }
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" && (
            <div className="d-flex">
              <h1
                className="anchor px-2"
                onClick={() => changeAppointmentStatus(record, "approved",selectedBoard)}
              >
                Approve
              </h1>
              <h1
                className="anchor"
                onClick={() => changeAppointmentStatus(record, "rejected",selectedBoard)}
              >
                Reject
              </h1>
            </div>
          )}
        </div>
      ),
    },
  ];
  useEffect(() => {
    getAppointmentsData();
  }, []);
  return (
    <Layout>
      <h1 className="page-header">All Appointments</h1>
      <hr />
      <Table columns={columns} dataSource={appointments} />
    </Layout>
  );
}

export default AdminAppointments;



