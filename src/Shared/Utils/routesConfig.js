import { createBrowserRouter } from "react-router-dom";
import ErrorComponent from "../Components/ErrorPage/ErrorComponent";
import { ProtectedOutlet, PublicOutlet } from "./ProtectedRoutes";
import PublicRoute from "../Routes/PublicRoutes";
import PublicLayout from "../Components/Layouts/Public/PublicLayout";
import PrivateLayout from "../Components/Layouts/Private/PrivateLayout";
import PrivateRoute from "../Routes/PrivateRoute";

const getRoutesConfig = () => {
  return createBrowserRouter([
    {
      path: "/",
      element: <PublicOutlet />,
      errorElement: <ErrorComponent />,
      children: [
        {
          element: <PublicLayout />,
          children: PublicRoute,
        },
      ],
    },
    {
      path: "/",
      element: <ProtectedOutlet />,
      errorElement: <ErrorComponent />,
      children: [
        {
          element: <PrivateLayout />,
          // children: PrivateRoute,
        },
      ],
    },
  ]);
};

export default getRoutesConfig;
