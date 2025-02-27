import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { GrLogin, GrLogout } from "react-icons/gr";
import { TbLogin2, TbLogout2 } from "react-icons/tb";

const Header = () => {
  const navigate = useNavigate();
  // const user = localStorage.getItem("user");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : "";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from localStorage
    navigate("/login"); // Redirect to login page
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full bg-[#F6FAFD] text-end py-3 px-6">
      {/* Login/Logout Button */}
      <div className="topHeadBtn relative inline-block text-left">
        {/* <button className="border border-[#A8BFBD]">
          <IoNotificationsOutline size="24" />
        </button>
        <button className="border border-[#A8BFBD]">
          <FiSearch size="24" />
        </button> */}

        {user ? (
          <div className="flex items-center gap-5">
            <p className="text-lg text-gray-700">{user?.name + ""}</p>
            <button className="border border-[#A8BFBD]" onClick={handleLogout}>
              <TbLogout2 size="22" />
            </button>
          </div>
        ) : (
          <button className="border border-[#A8BFBD]" onClick={() => navigate("login")}>
            <TbLogin2 size="22" />
          </button>
        )}

        {}
      </div>
    </header>
  );
};

export default Header;
