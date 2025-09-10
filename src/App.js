import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import getRoutesConfig from "./Shared/Utils/routesConfig";
import GlobalLoader from "./Shared/Components/Loader/GlobalLoader";
import { useSelector } from "react-redux";

function App() {
  const routesConfig = getRoutesConfig();

  const loggedIn = useSelector((state) => state?.auth);

  return (
    <div>
      <GlobalLoader />
      <RouterProvider router={routesConfig} />
      <ToastContainer />
    </div>
  );
}

export default App;
