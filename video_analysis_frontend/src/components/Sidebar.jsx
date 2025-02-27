

import React, { useEffect, useState } from "react";
import { FaHome, FaCog, FaPhotoVideo } from "react-icons/fa";
import { IoImagesOutline, IoSettingsOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { RiGalleryFill } from "react-icons/ri";
import { Link, NavLink } from "react-router-dom";

function Sidebar() {

  return (
    <div className="sidebarMenu h-[calc(100%)] w-[calc(90px)] bg-[#F6FAFD] top-0 flex flex-col items-center shadow-lg text-center fixed">
      <Link className="logo">
        <img src="../images/logo.png" />
      </Link>
      <NavLink title="Home" className="sidebar-icon" to={"/"}>
        <MdDashboard size="25" />
      </NavLink>
      <NavLink title="Gallery" className="sidebar-icon" to={"/gallery"}>
        <IoImagesOutline size="25" />
      </NavLink>
      {/* <NavLink title="Trim" className="sidebar-icon" to={"/trim"}>
        <FaPhotoVideo size="25" />
      </NavLink> */}
      {/* <NavLink title="Settings" className="sidebar-icon" to={"/setting"}>
        <IoSettingsOutline size="25" />
      </NavLink> */}
    </div>
  );
}

export default Sidebar;
