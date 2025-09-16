import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../Header/Header";
import Sidebar from "../../Sidebar/Sidebar";
import "./PrivateLayout.css";

const PrivateLayout = () => {
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    <div className="layout-container">
      <div className="layout-header">
        <Header />
      </div>
      <div className="layout-body">
        <Sidebar />
        <div className={`layout-outlet ${isSidebarOpen ? "expanded" : "collapsed"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PrivateLayout;
