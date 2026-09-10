import { Outlet } from "react-router-dom";
import HomeNavbar from "../components/HomeNavbar";
import Footer from "../components/Footer";

const HomeLayout = () => {
  return (
    <>
      <HomeNavbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default HomeLayout;
