import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Col, Row } from "antd";
import Experiment from "../components/Experiment";
import { useDispatch} from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";



function Home() {

  const [experiments, setExperiments] = useState([]);
  const dispatch = useDispatch();
  const getData = async () => {
    try {
      dispatch(showLoading())
      const response = await axios.get(`${window.location.protocol}//${window.location.hostname}/api/user/get-all-experiments`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      dispatch(hideLoading())
      if (response.data.success) {
        setExperiments(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading())
    }
    
  };

  useEffect(() => {
    getData();

  }, []);
  useEffect(() => {
    const reloadCount = sessionStorage.getItem('reloadCount');
    if (reloadCount < 2) {
      sessionStorage.setItem('reloadCount', String(reloadCount + 1));
      window.location.reload();
    } else {
      sessionStorage.removeItem('reloadCount');
    }
  }, []);


  return (
    <Layout>
      <Row gutter={20}>
        {experiments.map((experiment) => (
          <Col span={8} xs={24} sm={24} lg={8}>
            <Experiment experiment={experiment} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}

export default Home;
