import React, { useState } from "react";
import "../layout.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge } from "antd";

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();

  const userMenu = [
    {
      name: "Home",
      path: "/",
      icon: "ri-home-line",
    },
    {
      name: " View Appointments",
      path: "/appointments",
      icon: "ri-file-list-line",
    },
    // {
    //   name: "Book Appointments",
    //   path: "/book-appointments",
    //   icon: "ri-cpu-line",
    // },
    {
      name: "Profile[WIP]",
      path: `/profile/${user?._id}`,
      icon: "ri-shield-user-line",
    },
  ];


  const adminMenu = [
    {
      name: "Home",
      path: "/",
      icon: "ri-home-line",
    },
    {
      name: "View All Users",
      path: "/admin/userslist",
      icon: "ri-user-line",
    },
    {
      name: "View All Appointments",
      path: "/admin/appointmentList",
      icon: "ri-user-line",
    },
    {
      name: "Add Boards",
      path: "/admin/addBoards",
      icon: "ri-user-line",
    },
    // {
    //   name: "Change Number of Boards (per time slot)",
    //   path: "/admin/changeNumOfBoards",
    //   icon: "ri-user-line",
    // },
    {
      name: "Add Experiments",
      path: "/admin/addExperiments",
      icon: "ri-add-circle-line",
    },
    {
      name: "View All Experiments",
      path: "/admin/experimentsList",
      icon: "ri-add-circle-line",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "ri-shield-user-line",
    },
  ];

  const menuToBeRendered = user?.isAdmin ? adminMenu : userMenu;
  const role = user?.isAdmin ? "Admin" : "User";
  return (
    <div className="main">
      <div className="d-flex layout">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1 className="logo">VLabsIoT</h1>
            <h1 className="role">{role}</h1>
          </div>

          <div className="menu">
            {menuToBeRendered.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div
                  className={`d-flex menu-item ${
                    isActive && "active-menu-item"
                  }`}
                >
                  <i className={menu.icon}></i>
                  {!collapsed && <Link to={menu.path}>{menu.name}</Link>}
                </div>
              );
            })}
            
            <div
              className={`d-flex menu-item `}
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              <i className="ri-logout-circle-line"></i>
              {!collapsed && <Link to="/login">Logout</Link>}
            </div>

          </div>
        </div>

        <div className="content">
          <div className="header">
            {collapsed ? (
              <i
                className="ri-menu-2-fill header-action-icon"
                onClick={() => setCollapsed(false)}
              ></i>
            ) : (
              <i
                className="ri-close-fill header-action-icon"
                onClick={() => setCollapsed(true)}
              ></i>
            )}

            <div className="d-flex align-items-center px-4">
              <Badge
                count={user?.unseenNotifications.length}
                onClick={() => navigate("/notifications")}
              >
                <i className="ri-notification-line header-action-icon px-3"></i>
              </Badge>

              <h4>
                {user?.name}
              </h4>
            </div>
          </div>

          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
