// import axios from "axios";
import axios from "axios";
import Slider from "rc-slider";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const VideoTrim = () => {
  const videoRef = useRef(null);
  const [range, setRange] = useState([0, 0]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState(""); // URL to play video
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trimmedVideo, setTrimmedVideo] = useState();

  // Handle file changes for video selection
  const handleFileChange = (file) => {
    setFile(file);
    setVideoUrl(URL.createObjectURL(file)); // Create a URL to preview the video
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default to allow dropping
  };

  const removeVideo = () => {
    setVideoUrl("");
    setFile(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setRange([0, videoRef.current.duration]);
    }
  };

  const handleTrim = async () => {
    const [startTime, endTime] = range;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_timestamp", startTime);
    formData.append("end_timestamp", endTime);

    setLoading(true);

    try {
      const response = await apiClient.post("/generate_clips", formData);

      setTrimmedVideo(`${BASE_URL}/` + response?.data?.clip_path); // Save the trimmed video URL

      toast.success("Trimmed");
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-gray-900 shadow-lg rounded-2xl p-6 w-full max-w-6xl flex">
        {/* Left Section: Original Video */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4">
          <div className="flex flex-col items-center">
            {videoUrl ? (
              <>
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                    onLoadedMetadata={handleLoadedMetadata}
                  />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-zinc-900 text-white p-2 rounded-full hover:bg-zinc-800 transition-all"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="w-full mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Start: {range[0].toFixed(2)}s</span>
                    <span>End: {range[1].toFixed(2)}s</span>
                  </div>
                  <Slider
                    range
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={range}
                    onChange={(newRange) => setRange(newRange)}
                    trackStyle={[{ backgroundColor: "#3b82f6" }]}
                    handleStyle={[
                      { backgroundColor: "#2563eb", borderColor: "#2563eb" },
                      { backgroundColor: "#2563eb", borderColor: "#2563eb" },
                    ]}
                    railStyle={{ backgroundColor: "#4b5563" }}
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>0s</span>
                    <span>{videoDuration.toFixed(2)}s</span>
                  </div>
                </div>
              </>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input").click()}
                className={`w-full h-48 flex items-center justify-center border-2 ${
                  videoUrl ? "border-transparent" : "border-dashed border-gray-500"
                } rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer relative`}
              >
                <p className="text-gray-300 text-center">
                  Drag and drop a video file here, or click to browse
                </p>
                <input
                  type="file"
                  id="file-input"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
            <button
              onClick={handleTrim}
              disabled={!videoUrl}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (
                <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
              ) : (
                "Trim"
              )}
            </button>
          </div>
        </div>

        {/* Right Section: Trimmed Video */}
        <div className="flex-1 ml-8 bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl text-white mb-2">Trimmed Video:</h3>
          {trimmedVideo ? (
            <video src={trimmedVideo} controls className="w-full h-auto rounded-lg" />
          ) : (
            <p className="text-gray-300 text-center">No trimmed video yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTrim;
