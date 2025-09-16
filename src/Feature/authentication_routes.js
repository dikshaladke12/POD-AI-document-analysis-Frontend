import Login from "./Authentication/Login/Login";
import Signup from "./Authentication/Signup/Signup";

const AuthenticationRoute = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path:"/sign-up",
    element:<Signup/>
  }
];

export default AuthenticationRoute;
