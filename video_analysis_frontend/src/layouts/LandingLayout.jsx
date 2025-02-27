import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const LandingLayout = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* <Sidebar /> */}
        <div className="flex flex-col flex-grow">
          {/* <Header /> */}
          <main className="flex-grow">
            <Outlet />
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </>
  );
};

export default LandingLayout;
