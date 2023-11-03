import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import axios from "axios";
import { Table } from "antd";
import moment from "moment";
import { toast } from "react-hot-toast";
moment().utcOffset("+05:30").format()

function ExperimentsList() {


  const [experiments, setExperiments] = useState([]);
  const dispatch = useDispatch();




  const getExperimentsData = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get(`${window.location.protocol}//${window.location.hostname}/api/admin/get-all-experiments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (resposne.data.success) {
        setExperiments(resposne.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getExperimentsData();
  }, []);


  const deleteExperiment = async (record) => {
    try {
      dispatch(showLoading());
      const resposne = await axios.post(
        `${window.location.protocol}//${window.location.hostname}/api/admin/delete-experiment`,
        { experimentId : record._id},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (resposne.data.success) {
        toast.success(resposne.data.message);
        getExperimentsData();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting experiment");
      dispatch(hideLoading());
    }
  };

  const columns = [
    {
      title: "Experiment-Id",
      dataIndex: "_id",
    },
    {
      title: "Experiment-Title",
      dataIndex: "experimentName",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (record , text) => moment(record.createdAt).format("DD-MM-YYYY"),
    },
    {
      title: "From Time",
      dataIndex: "timings",
      render: (record , text) => moment(record.timings).format("HH:mm"),
    },
    {
      title: "To Time",
      dataIndex: "timings",
      render: (record , text) => moment(record.timings).add(0.916667, "hours").format("HH:mm"),
    }
    ,
    {
      title: "Number of Boards Left",
      dataIndex: "numOfBoards",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {(
            <div className="d-flex">
              <h1
                className="anchor px-2"
                onClick={() => deleteExperiment(record)}
              >
                Delete
              </h1>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="page-header">Experiments List</h1>
      <hr />
      <Table columns={columns} dataSource={experiments}/>
    </Layout>
  );
}

export default ExperimentsList;
