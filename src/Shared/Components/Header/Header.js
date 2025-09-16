import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userlogout } from "../../Slice/AuthSlice";
import Logo from "../../../Assets/signal63.svg";
import Logout from "../../../Assets/logout-svgrepo-com.svg";
import MoreOptions from "../../../Assets/menu-svgrepo-com.svg"; // Add this icon
import ProfileIcon from "../../../Assets/profile-circle-svgrepo-com.svg"; // Add this icon

import "./Header.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = () => {
    dispatch(userlogout());
    navigate("/login");
  };

  const goToProfile = () => navigate("/profile");
  // const goToChangePassword = () => navigate("/change-password");

  return (
    <div className="header-container">
      <div className="logo-section">
        <img src={Logo} alt="Logo" className="logo-img" />
      </div>

      <div className="header-icon-container dropdown-wrapper">
        <div className="dropdown-profile">
          <img src={MoreOptions} alt="Profile" className="profile-icon" />
          <div className="dropdown-menu">
            <div onClick={goToProfile}>
              {" "}
              <img src={ProfileIcon} alt="Profile" className="logo-img-profile" />
              Profile
            </div>
            {/* <div onClick={goToChangePassword}>Change Password</div> */}
            <div onClick={logoutUser}>
              {" "}
              <img src={Logout} alt="Logout" className="logo-img-logout" />
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
