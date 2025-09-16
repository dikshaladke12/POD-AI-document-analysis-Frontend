import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { toggleSidebar } from "../../Slice/SidebarSlice";
import { FaTachometerAlt, FaXbox, FaRegFolder } from "react-icons/fa";

const Sidebar = () => {
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: "Upload Document",
      path: "/fax-upload",
      icon: <FaTachometerAlt />,
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={() => dispatch(toggleSidebar())}>
        {isOpen ? "❮" : "❯"}
      </button>
      <div className="nav-links">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {isOpen && <span className="sidebar-label">{item.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
