import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      {/* No navbar OR very minimal one */}
      <Outlet />
    </>
  );
};

export default AuthLayout;
