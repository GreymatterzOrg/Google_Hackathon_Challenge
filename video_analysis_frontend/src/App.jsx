import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./layouts/Layout";

import "./App.css";
import "rc-slider/assets/index.css";

// import "react-slider/style.css";
import Login from "./pages/Login";
import LandingLayout from "./layouts/LandingLayout";
import Signup from "./pages/Signup";
import Gallery from "./pages/Gallery";
import VideoSocket from "./components/VideoSocket";
import { Toaster } from "react-hot-toast";
import VideoTrim from "./pages/VideoTrim";
import Playlist from "./pages/Playlist";
import PrivateRoutes from "./components/PrivateRoutes";

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoutes element={<Layout />} />, // Component to render,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "gallery",
        element: <Gallery />,
      },
      {
        path: "trim",
        element: <VideoTrim />,
      },
      {
        path: "playlist/:id",
        element: <Playlist />,
      },
      {
        path: "videoSocket",
        element: <VideoSocket />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
  {
    path: "/",
    element: <LandingLayout />, // Component to render,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
    ],
  },
  {
    path: "*", // Catch-all for unmatched routes
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            background: "#fff",
            color: "#092C4C",
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
