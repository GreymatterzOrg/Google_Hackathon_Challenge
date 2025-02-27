
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="w-full ml-24">
          <main className="flex-grow">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
