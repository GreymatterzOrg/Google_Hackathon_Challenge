import React, { useState, useEffect, useRef } from "react";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  const handleClickOutside = (event) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={tooltipRef}>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      {isVisible && (
        <div className="w-48 absolute left-5 top-6 border border-gray-300 bg-white text-[#092C4C] text-sm rounded-lg">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
