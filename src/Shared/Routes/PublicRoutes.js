import FaxRoutes from "../../Feature/Routes";
import AuthenticationRoute from "../../Feature/authentication_routes";

const PublicRoute = [
  ...AuthenticationRoute,
  ...FaxRoutes,
];

export default PublicRoute;
