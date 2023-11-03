import React from 'react'
import { Button, Col, Form, Input, Row, TimePicker,InputNumber } from "antd";
import moment from "moment";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";




const ChangeNumOfBoards = () => {

  const [numOfBoard, setNumOfBoard] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentNumOfBoards();
  }, []);

const getCurrentNumOfBoards = async (values) => {
  try {
    dispatch(showLoading());
    const response = await axios.get(`${window.location.protocol}//${window.location.hostname}/api/admin/get-num-of-boards`, 
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch(hideLoading());
      if (response.data.success) {
        setNumOfBoard(response.data.data.numOfBoads);
        // console.log(response.data.data);
      }
  } catch (error) {
    dispatch(hideLoading());
    toast.error("Something went wrong");
  }
};

  
  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/admin/change-num-of-boards`, 
      {
        ...values, 
       
        // experimentName:experiment.experimentName
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  
  return (
  <>
    <Layout>
      <Form
      layout="vertical"
      onFinish={onFinish}

    ><Row gutter={20}>
      <h1 className="card-title mt-3">Change Number Of Boards</h1>
      
       
      </Row>
      <Row gutter={20}>
          <Form.Item
            required
            label="Number Of Boards are"
            name="numOfBds"
            rules={[{ required: true }]}
          >
            <div> {numOfBoard}</div>
         
          </Form.Item>
       
       
      </Row>
      
      <Row gutter={20}>
          <Form.Item
            required
            label="Change Number Of Boards"
            name="numOfBds"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={10} defaultValue={numOfBoard}/>
         
          </Form.Item>
       
       
      </Row>

      <div className="d-flex justify-content-end">
        <Button className="primary-button" htmlType="submit">
          SUBMIT
        </Button>
      </div>
    </Form>
    </Layout>
    </>
  )
}

export default ChangeNumOfBoards