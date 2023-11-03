import React from 'react'
import { Button, Col, Form, Input, Row, TimePicker,InputNumber } from "antd";
import moment from "moment";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { Table } from "antd";

import axios from "axios";
import { useNavigate } from "react-router-dom";


import {useState, useEffect} from 'react';
import "../../AddBoards.css"

const AddBoards = () => {
  const [boardId, setBoardId] = useState('');
  const [boardName, setBoardName] = useState('');
  const [listItems, setListItems] = useState([]);
  const [camPort, setCamPort] = useState('');

  // const [isUpdating, setIsUpdating] = useState('');
  // const [updateItemText, setUpdateItemText] = useState('');

  //Create function to fetch all todo items from database -- we will use useEffect hook
  // useEffect(()=>{
    const getBoards = async () => {
      try{
        const res = await axios.get(`${window.location.protocol}//${window.location.hostname}/api/admin/get-boards`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setListItems(res.data);
        // console.log('render')
      }catch(err){
        console.log(err);
      }
    }
    useEffect(() => {
      getBoards();
    }, []);
  
    // getBoards();
  // },[]);
  //add new todo item to database
  const addBoard = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/admin/add-board`, {boardId:boardId, boardName:boardName, camPort:camPort}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setListItems(prev => [...prev, res.data]);
      setBoardId('');
      setBoardName('');
      setCamPort('')
      if(res.data.success)
        toast.success(res.data.message);
      else{
        toast.error(res.data.message);
      }  
      getBoards();
    }catch(err){
      console.log(err);
    }
  }

  

  // Delete item when click on delete
  const deleteBoard = async (id) => {
    try{
      const res = await axios.delete(`${window.location.protocol}//${window.location.hostname}/api/admin/delete-board/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const newListItems = listItems.filter(item=> item._id !== id);
      setListItems(newListItems);
      if(res.data.success)
        toast.success(res.data.message);
      else{
        toast.error(res.data.message);
      }  
    }catch(err){
      console.log(err);
    }
  }

  // //Update item
  // const updateBoard = async (e) => {
  //   e.preventDefault()
  //   try{
  //     const res = await axios.put(`${window.location.protocol}//${window.location.hostname}/api/admin/update-board/${isUpdating}`, {item: updateItemText}, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     })
  //     console.log(res.data)
  //     const updatedItemIndex = listItems.findIndex(item => item._id === isUpdating);
  //     const updatedItem = listItems[updatedItemIndex].item = updateItemText;
  //     setUpdateItemText('');
  //     setIsUpdating('');
  //   }catch(err){
  //     console.log(err);
  //   }
  // }
  // //before updating item we need to show input field where we will create our updated item
  // const renderUpdateForm = () => (
  //   <form className="update-form" onSubmit={(e)=>{updateBoard(e)}} >
  //     <input className="update-new-input" type="text" placeholder="New Item" onChange={e=>{setUpdateItemText(e.target.value)}} value={updateItemText} />
  //     <button className="update-new-btn" type="submit">Update</button>
  //   </form>
  // )


  const columns = [
    
    {
      title: "Board-Id",
      dataIndex: "boardId",
      render: (text, record) => <span>{record.boardId}</span>,
    },
    {
      title: "Board-Name",
      dataIndex: "boardName",
      render: (text, record) => (
        <span>
          {record.boardName}
        </span>
      ),
    },
    {
      title: "Camera Port Number",
      dataIndex: "camPort",
      render: (text, record) => (
        <span>
          {record.camPort}
        </span>
      ),
    },
    {
      title: "Availability",
      dataIndex: "boardAvailable",
      render: (text, record) => (
        <span>
          {record.boardAvailable === true ? "Available" : "Not Available"}
        </span>
      ),
    },
   
    {
      title: "Action",
      dataIndex: "Delete",
      
      render: (text, record) => (
        <button className="delete-item" onClick={()=>{deleteBoard(record._id)}}>Delete</button>

      ),
    },
  ];




  return (
    <Layout>
      <h1>Add Board</h1>

      <form className="form" onSubmit={e => addBoard(e)}>
        <input type="text" placeholder='Add Board ID[Board ID should be unique]' name="boardId" onChange={e => {setBoardId(e.target.value)} } value={boardId} />
        <input type="text" placeholder='Add Board Name' name="boardName" onChange={e => {setBoardName(e.target.value)} } value={boardName} />
        <input type="text" placeholder='Camera Name' name="camPort" onChange={e => {setCamPort(e.target.value)} } value={camPort} />

        <button type="submit">Add</button>
      </form>

      <Table columns={columns} dataSource={listItems} />
     
    </Layout>
  );
}

export default AddBoards