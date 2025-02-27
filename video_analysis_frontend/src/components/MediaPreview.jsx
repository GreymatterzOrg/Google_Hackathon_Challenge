import React from "react";
import { IoMdClose } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MediaPreview = ({ isOpen, onClose, mediaUrl, mediaType }) => {
  if (!isOpen) return <></>;

  console.log("hello");

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{ backgroundColor: "#000000cc" }}
    >
      <div className="relative">
        <button className="absolute top-[0px] right-[0px] bg-gray-400 hover:bg-gray-500 z-9 rounded-full p-1" onClick={onClose}>
          <IoMdClose size={24} />
        </button>
        <div className="relative overflow-hidden shadow-lg max-w-3xl w-full p-4">
          <div className="flex justify-center items-center">
            {mediaType === "image" ? (
              <img
                src={mediaUrl.includes("://") ? mediaUrl : `${BASE_URL}/` + mediaUrl}
                alt="Preview"
                className="max-w-full max-h-[80vh] rounded"
              />
            ) : mediaType === "video" ? (
              <video controls className="max-w-full max-h-[80vh] rounded">
                <source
                  src={mediaUrl.includes("://") ? mediaUrl : `${BASE_URL}/` + mediaUrl}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-red-500">Unsupported media type</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
