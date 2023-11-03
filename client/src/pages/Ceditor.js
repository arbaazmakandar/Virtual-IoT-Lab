import React, {useEffect, useRef, useState } from 'react';
import Split from 'react-split';
import toast from "react-hot-toast";

import { Link, useNavigate } from "react-router-dom";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { useDispatch } from "react-redux";

import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";

import FolderTree, {findTargetPathByProp, findTargetNode} from 'react-folder-tree';
import {FaCaretRight, FaCaretDown} from 'react-icons/fa';
import {AiFillFolder, AiFillCloseCircle, AiFillFolderAdd, AiFillFolderOpen, AiFillEdit, AiFillCheckCircle, AiFillFileAdd} from 'react-icons/ai';
import {BsFillTrash3Fill} from 'react-icons/bs';
import {SiArduino} from 'react-icons/si';
import '../foldertree.css';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/clike/clike';
import CodeMirror from 'codemirror';

import axios from "axios";

import 'xterm/css/xterm.css';
import 'xterm/lib/xterm.js'
import '../ceditor.css';

function Ceditor() {
  
const [seconds, setSeconds] = useState(0);
const [minutes, setMinutes] = useState(1);
const [appointmentTime,setAppointmentTime] = useState(0);
  
  
  var countdown;
  useEffect(() => {
    countdown = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        clearInterval(countdown);
        handleClose();
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [seconds, minutes]);
  
  

  const navigate = useNavigate();
  const dispatch = useDispatch();

//handlers for menu-------------------------------------------------------------------------
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = async () => {
    clearTimeout(countdown);
    
    
        //write code to handleClose here
    
        try {
          dispatch(showLoading());
          if(localStorage.getItem('CurrFileURL') !== null && localStorage.getItem('CurrFileURL') !== 'null')
          {
            var myCodeMirror = document.querySelector('.CodeMirror').CodeMirror;
            var code = '';
            if (myCodeMirror) {
              code = myCodeMirror.getValue();
            }
            await saveCodeData(localStorage.getItem('CurrFileURL'),code);
          }
//           var response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/compile-command`, {
//             containerId: localStorage.getItem("containerId"),
//             fPath: 'blank'
//           }, {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem('token')}`,
//             },
//           });
//           console.log("compile blank",response);
//           response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/upload-command`, {
//             containerId: localStorage.getItem("containerId"),
//             fPath: 'blank'
//           }, {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem('token')}`,
//             },
//           });
//           console.log("upload blank",response);
          var response = await axios.post('http://localhost:4000/api/user/destroy-container', {
            containerId: localStorage.getItem("containerId"),
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your authentication mechanism
            },
          });
          console.log("destroy container",response);
          dispatch(hideLoading());
          console.log(response.data.message); // Logs "Container destroyed successfully" if the request is successful
          navigate('/');
        } catch (error) {
          console.error(error.response.data.error); // Logs the error message if the request fails
        }
  };
  
    const getAppointmentTime = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get(
        `http://localhost:4000/api/admin/get-appointment-time`,{recordId:localStorage.getItem("recordId")},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (resposne.data.success) {
        setAppointmentTime(resposne.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const executeCommand = async (command) => {
    try {
      dispatch(showLoading());
      if(localStorage.getItem('CurrFileURL') !== null && localStorage.getItem('CurrFileURL') !== 'null')
      {
        var myCodeMirror = document.querySelector('.CodeMirror').CodeMirror;
        var code = '';
        if (myCodeMirror) {
          code = myCodeMirror.getValue();
        }
        await saveCodeData(localStorage.getItem('CurrFileURL'),code);
        const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/${command}-command`, {
          containerId: localStorage.getItem("containerId"),
          fPath: localStorage.getItem('CurrFileURL')
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        dispatch(hideLoading());
        toast.success(`${command} sucessfully executed`);
      }
    } catch (error) {
      toast.error(`${command} unsucessful`);
      console.error(error.response.data.error);
    }
    dispatch(hideLoading());
  };
  

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSaveClick = (event) => {
    const saveFileData = async () => {
      setAnchorEl(null);
      try {
        var myCodeMirror = document.querySelector('.CodeMirror').CodeMirror;
        var code = '';
        if (myCodeMirror) {
          code = myCodeMirror.getValue();
        }
        dispatch(showLoading());
        const fileurl = localStorage.getItem('CurrFileURL');
        if(fileurl !== null && fileurl !== 'null')
        {
          await saveCodeData(fileurl, code);
          dispatch(hideLoading());
        }
        else
        {
          dispatch(hideLoading());
          toast.success("Please select a file before saving");
        }
      } catch (error) {
        toast.error("Error while saving file");
        console.error(error); // Logs the error message if the request fails
      }
    };
    saveFileData();
  };

  const handleUploadClick = (event) => {
    executeCommand('upload');
    setAnchorEl(null);
  };

  const handleCompileClick = (event) => {
    executeCommand('compile');
    setAnchorEl(null);
  };
  
  const hClose = () =>{
    setAnchorEl(null);
  }

//FolderTree--------------------------------------------------------------------------------
  const testData = {
    name: 'No Connection',
    children: [
    ],
  };
  const treeRef = useRef(null);
  const [folderData, setFolderData] = useState(testData);

  const CaretRightIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <FaCaretRight onClick={ handleClick } size={iconSize}/>;
  };

  const CaretDownIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <FaCaretDown onClick={ handleClick } size={iconSize}/>;
  };

  const FileIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <SiArduino onClick={ handleClick } size={iconSize}/>;
  };

  const FolderIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <AiFillFolder onClick={ handleClick } size={iconSize}/>;
  };

  const FolderOpenIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <AiFillFolderOpen onClick={ handleClick } size={iconSize}/>;
  };

  const EditIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <AiFillEdit onClick={ handleClick } size={iconSize}/>;
  };

  const CancelIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <AiFillCloseCircle onClick={ handleClick } size={iconSize}/>;
  };

  const DeleteIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      const delfileOp = async (url, op, isFile) => {
        try {
          dispatch(showLoading());
          await fileOp(url, op, isFile);
          await getFolderData();
          toast.success(`Deleted successfully`);
          localStorage.setItem('CurrFileURL', null);
        } catch (error) {
            toast.error(`Couldnt complete ${op} operation`);
            console.log(error);
        }
        dispatch(hideLoading());
      };
      delfileOp(url, "delete", false);
    };
    return <BsFillTrash3Fill onClick={ handleClick } size={iconSize}/>;
  };

  const AddFileIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      //console.log('add file:', { path, name, url, ...restData });
      const addfileOp = async (url, op, isFile) => {
        try {
          dispatch(showLoading());
          await fileOp(url, op, isFile);
          await getFolderData();
          toast.success(`File created successfully`);
        } catch (error) {
            toast.error(`Couldnt complete ${op} file operation`);
            console.log(error);
        }
        dispatch(hideLoading());
      };
      addfileOp(url, "add", true);
    };
    return <AiFillFileAdd onClick={ handleClick } size={iconSize}/>;
  };

  const AddFolderIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      //console.log('add folder:', { path, name, url, ...restData });
      const addfolderOp = async (url, op, isFile) => {
        try {
          dispatch(showLoading());
          await fileOp(url, op, isFile);
          await getFolderData();
          toast.success(`Folder created successfully`);
        } catch (error) {
            toast.error(`Couldnt complete ${op} folder operation`);
            console.log(error);
        }
        dispatch(hideLoading());
      };
      addfolderOp(url, "add", false);
    };
    return <AiFillFolderAdd onClick={ handleClick } size={iconSize}/>;
  };

  const OKIcon = ({ onClick: defaultOnClick, nodeData }) => {
    const { path, name, checked, isOpen, url, ...restData } = nodeData;
    const handleClick = () => {
      defaultOnClick();
    };
    return <AiFillCheckCircle onClick={ handleClick } size={iconSize}/>;
  };

  const iconSize = 20;
  const customIdentPixels = 20;
  const iconComponents = {
      FileIcon,
      FolderIcon,
      FolderOpenIcon,
      EditIcon,
      DeleteIcon,
      CancelIcon,
      AddFileIcon,
      AddFolderIcon,
      CaretRightIcon,
      CaretDownIcon,
      OKIcon,
  };

  const fileOp = async (url, op, isFile) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/${op}-file`, {
          fPath: url,
          isFile: isFile,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      if (response.status === 200) {
        toast.success(`${op} sucessfull`);
        //console.log("saved sucessfully");
      }
    } catch (error) {
        toast.error(`Couldnt complete ${op} operation`);
        console.log(error);
    }
    dispatch(hideLoading());
  };

  const saveCodeData = async (url, code) => {
    try {
      console.log("saving", url);
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/set-file-data`, {
          fPath: url,
          fData: code,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      if (response.status === 200) {
        toast.success("Saved sucessfully");
        //console.log("saved sucessfully");
      }
    } catch (error) {
        toast.error("Error while saving file");
        console.log(error);
    }
  };

  const getFolderData = async () => {
    try {
      const response = await axios.get(`${window.location.protocol}//${window.location.hostname}/api/user/get-folder-data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
      setFolderData(response.data.data);
      }
    } catch (error) {
      setFolderData(testData);
            console.log(error);
    }
  };

  // custom event handler for node name click
  const onNameClick = ({ defaultOnClick, nodeData }) => {
    const {
      // internal data
      path, name, checked, isOpen,
      // custom data
      url, ...whateverRest
    } = nodeData;
    if (nodeData.hasOwnProperty('isFile')) {
      const getFileData = async () => {
          try {
            // get the CodeMirror instance
            var myCodeMirror = document.querySelector('.CodeMirror').CodeMirror;
            var code = '';
            if (myCodeMirror) {
              code = myCodeMirror.getValue();
            }

            dispatch(showLoading());
            const fileurl = localStorage.getItem('CurrFileURL');
            if(fileurl !== null && fileurl !== 'null')
            {
              await saveCodeData(fileurl, code);
            }
            localStorage.setItem("CurrFileURL", url);
            const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/get-file-data`, {
              fPath: url,
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your authentication mechanism
              },
            });

            // check if the instance is rendered
            if (myCodeMirror) {
              // set a new value for the instance
              myCodeMirror.setValue(response.data.data);
            }
            dispatch(hideLoading());
          } catch (error) {
            console.error(error); // Logs the error message if the request fails
          }
        };
        getFileData();
    }
    else {
      // do nothing for folder
    }
    defaultOnClick();
  };

  const onTreeStateChange = (state, event) => {
    if(event["type"] === 'renameNode')
    {
      var path = event["path"];
      var data = state;
      for (let i = 0; i < path.length; i++) {
        data = data["children"][path[i]];
      }
      const renameOp = async (url, newName, isFile) => {
        try {
          dispatch(showLoading());
          const response = await axios.post(`${window.location.protocol}//${window.location.hostname}/api/user/rename-file`, {
              fPath: url,
              newName: newName,
              isFile: isFile,
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
          if (response.status === 200) {
            await getFolderData();
            toast.success("Renamed successfully");
            localStorage.setItem("CurrFileURL", url.replace(/\/[^\/]+$/, `/${newName}`));
            console.log(localStorage.getItem("CurrFileURL"));
          }
        } catch (error) {
            console.log(error);
        }
        dispatch(hideLoading());
      };
      var isFile = false;
      console.log("before hasOwnProperty", data);
      if (!(data === undefined))
      {
        if (data.hasOwnProperty('isFile'))
          isFile = true;
        if(!(data["url"].split('/').pop() === event["params"][0]))
        {
          renameOp(data["url"], event["params"][0], isFile);
        }
      }
    }
    else
      console.log("other op");
//     console.log("change", folderData);
  }

  useEffect(() => {
      getFolderData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (treeRef.current) {
        const { width, height } = treeRef.current.getBoundingClientRect();
        console.log('FolderTree size:', width, height);
      }
    };

    handleResize(); // call initially to get initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

//CodeMirrorComponent----------------------------------------------------------------------
  const codeMirrorRef = useRef(null);
  useEffect(() => {
    const divElement = document.getElementById('codearea');

    const editor = CodeMirror.fromTextArea(codeMirrorRef.current, {
      mode: 'text/x-c++src',
      theme: 'material',
      matchBrackets: true,
      lineNumbers: true,
      tabSize: 4,
      value: "Code Here!!!"
    });

    editor.on('change', (instance, event) => {
      const newCode = instance.getValue();
    });

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        const { width: divWidth, height: divHeight } = entry.target.getBoundingClientRect();
        editor.setSize(width, height);
      });
    });
    resizeObserver.observe(divElement);

    localStorage.setItem("CurrFileURL", null);
    return () => {
      editor.toTextArea();
    };
  }, []);



//TTYD Teminal------------------------------------------------------------------------------

  return (
    <div className="containe">
      <div className="menurow">
          <Button
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          File
        </Button>
        <Menu
          keepMounted
          anchorEl={anchorEl}
          onClose={hClose}
          open={Boolean(anchorEl)}
        >
          <MenuItem onClick={handleSaveClick}>Save</MenuItem>
          <MenuItem onClick={handleUploadClick}>Upload</MenuItem>
          <MenuItem onClick={handleCompileClick}>Compile</MenuItem>
          <MenuItem onClick={handleClose}>End session</MenuItem>
        </Menu>

        <label>time remaining:-   </label>
        {/* <input id="timer" type="text" value="0" readonly/> */}
        <p>{minutes<10?"0"+minutes:minutes} : {seconds<10?"0"+seconds:seconds}</p>
    
      </div>
      <Split direction='vertical' sizes= {[65, 35]} style={{ height: `calc(100vh - 45px)` }}>
        <Split className="flex" sizes= {[15, 75, 20]}>
          <div className="ftree" >
            <FolderTree
                  ref={treeRef}
                  data={ folderData }
                  onChange = {onTreeStateChange}
                  iconComponents={ iconComponents }
                  indentPixels={ customIdentPixels }
                  showCheckbox={ false }
                  onNameClick={ onNameClick }
            />
          </div>
          <div id="codearea" className="codearea">
              <textarea id="codetextarea" ref={codeMirrorRef} value={"Code Here!!!!!"} />
          </div>
          <div className="camfeed">
            <iframe
                  id="camfeed"
                  title="s"
                  src={`${window.location.protocol}//${window.location.hostname}/camera/${localStorage.getItem('CamPort')}`}
                  //width={`${terminalState.width}`}
                  //height={`${terminalState.height}`}
                  scrolling="no"
                />
          </div>
        </Split>
        <div>
          <iframe
            id="ttydterminal"
            style={{ height: "100%", width: "100%" }}
            title="s"
            src={`${window.location.protocol}//${window.location.hostname}:${localStorage.getItem('TerminalPort')}`}
            //width={`${terminalState.width}`}
            //height={`${terminalState.height}`}
            scrolling="no"
          />
        </div>
      </Split>
    </div>
  );
}

export default Ceditor;
