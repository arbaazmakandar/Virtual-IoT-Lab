import { Button, Col, Form, Input, Row, TimePicker,InputNumber } from "antd";
import moment from "moment";
import React from "react";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddExperiments = () => {

    const dispatch = useDispatch();
    const experiment = useSelector(state=>state.user) 
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/admin/add-experiments-to-db`, 
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
    <Layout>
      <h1 className="page-title">Add Experiment</h1>
      <Form
      layout="vertical"
      onFinish={onFinish}

    >
      <h1 className="card-title mt-3">Experiment Information</h1>
      <Row gutter={20}>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Experiment Name"
            name="experimentName"
            rules={[{ required: true }]}
          >
            <Input placeholder="Experiment Name" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Experiment Details"
            name="experimentDetails"
            rules={[{ required: true }]}
          >
            <Input placeholder="Experiment Details" />
          </Form.Item>
        </Col>
        
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Timings"
            name="timings"
            rules={[{ required: true }]}
          >
            <TimePicker.RangePicker format="HH" />
          </Form.Item>
        </Col>
      </Row>
      

      <div className="d-flex justify-content-end">
        <Button className="primary-button" htmlType="submit">
          SUBMIT
        </Button>
      </div>
    </Form>
    </Layout>
  )
}

export default AddExperiments