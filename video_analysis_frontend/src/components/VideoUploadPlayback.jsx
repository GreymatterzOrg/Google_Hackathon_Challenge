import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { ProgressBar, TailSpin } from "react-loader-spinner";
// import io from "socket.io-client";
import Slider from "rc-slider";
import toast from "react-hot-toast";
import { RiExchangeBoxLine } from "react-icons/ri";
import { IoIosCut } from "react-icons/io";
import { MdInsights } from "react-icons/md";
import { TfiReload } from "react-icons/tfi";
import { TbRefresh } from "react-icons/tb";
import { GrGallery } from "react-icons/gr";
import { FaCheckCircle, FaPlayCircle } from "react-icons/fa";
import MediaPreview from "./MediaPreview";

const sampleVideos = [
  {
    id: 1,
    src: "https://sporty-clips.mlb.com/YUs5d0RfWGw0TUFRPT1fVWdnRVUxd0JWVkFBWGdNREJ3QUFBd0pUQUZoV1YxY0FWRlpRVWxWWFVBSlFVZ3RX.mp4",
    title: "Video 1",
  },
  {
    id: 2,
    src: "https://sporty-clips.mlb.com/OVpCVlZfV0ZRVkV3dEdEUT09X1UxSlNWRllOWHdzQVhWVUVWd0FBVWdjQUFBQlhCUU1BQWxBQUExWlVCVkVFVkFNRA==.mp4",
    title: "Video 2",
  },
  {
    id: 3,
    src: "https://sporty-clips.mlb.com/MDNES05fWGw0TUFRPT1fVndRQVhWQUdWbFlBQ0FBQVhnQUFWd0ZVQUFOV1ZsRUFBZ0VDQlZFTkNBc0VVMVFB.mp4",
    title: "Video 3",
  },
  {
    id: 4,
    src: "https://sporty-clips.mlb.com/OGdZZzdfV0ZRVkV3dEdEUT09X1ZBaFlCbDBEVkFJQUFWVUVBd0FBVlE5ZUFBQlFWZ01BQkZ4UUNWRlhDQVJYVWxCVg==.mp4",
    title: "Video 3",
  },
  {
    id: 5,
    src: "https://sporty-clips.mlb.com/MDNEYjdfWGw0TUFRPT1fQUFCVFVGY0dBd2NBV1FZR0FBQUFDQUJTQUFBTVZsQUFCRlZYVmdGUkJncFNBd0Zl.mp4",
    title: "Video 3",
  },
  {
    id: 6,
    src: "https://sporty-clips.mlb.com/WGczMjlfWGw0TUFRPT1fQWdOUkJnVUdBZ2NBQzFFQ1VRQUFCZ2RSQUFCUUFGVUFBRnhYVlFBTVV3SlNBUXBR.mp4",
    title: "Video 3",
  },
];

const VideoUploadPlayback = ({
  setScreenshot,
  setFileId,
  handleOriginalVideoFile,
  handleTooltips,
  handleUpload,
  handleTrim,
  handleBestMoment,
  loading,
  fileId,
}) => {
  const [selectedFile, setSelectedFile] = useState(null); // Store selected file
  const [videoUrl, setVideoUrl] = useState(""); // URL to play video
  const [uploadStatus, setUploadStatus] = useState(""); // Upload status message
  // const [loading, setLoading] = useState({
  //   trim: false,
  //   tooltip: false,
  //   process: false,
  // }); // Loading state
  const [tooltips, setTooltips] = useState([]); // Tooltips from WebSocket
  const videoRef = useRef(null);

  const [videoDuration, setVideoDuration] = useState(0);

  const [trimmedVideo, setTrimmedVideo] = useState();
  const [trimmedVideoFile, setTrimmedVideoFile] = useState();
  const [mediaFile, setMediaFile] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [originalVideo, setOriginalVideo] = useState(false);

  const [range, setRange] = useState([0, 0]);

  const handleFileChange = (file) => {
    handleOriginalVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setOriginalVideo(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleVideoDragStart = (event, video) => {
    event.dataTransfer.setData("video", JSON.stringify(video));
  };

  const handleVideoDrop = async (event) => {
    event.preventDefault();
    const videoData = event.dataTransfer.getData("video");
    console.log("droped", videoData);
    if (videoData) {
      const video = JSON.parse(videoData);
      setVideoLoading(true);
    
      try {
        const response = await axios.get(video?.src, {
          responseType: "blob",
        });
        setVideoUrl(video.src);
        handleOriginalVideoFile(response?.data);
        setOriginalVideo(true);
      } catch (err) {
        console.log(err);
      } finally {
        setVideoLoading(false);
      }
    } else {
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    }
  };

  const removeVideo = () => {
    handleOriginalVideoFile(null);
    setVideoUrl("");
    setUploadStatus("");
    setTrimmedVideo("");
    setFileId("");
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setRange([0, videoRef.current.duration]);
    }
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);

    if (videoRef?.current) {
      const [start, end] = newRange;
      const currentTime = videoRef.current.currentTime;

      // Determine which handle was moved
      const movedStart = Math.abs(currentTime - start) < Math.abs(currentTime - end);

      if (movedStart) {
        videoRef.current.currentTime = start; // Seek to start if the start handle was moved
      } else {
        videoRef.current.currentTime = end; // Seek to end if the end handle was moved
      }
    }
  };

  const handleAfterChange = (newRange) => {
  
  };

  return (
    <>
      <div className="flex flex-col bg-[#E9F5F4] text-gray-200 rounded-lg overflow-hidden border border-solid border-[#A8BFBD] mb-4">
        {/* Header */}
        <h4 className="text-lg font-semibold bg-[#E9F5F4] text-[#092C4C] pt-5 px-5">
          Sample Videos
        </h4>
        <div className="px-5 pt-3 pb-5">
          <div className="flex overflow-x-auto rounded-lg gap-4 bg-white p-4 border border-solid border-[#D1D1D1]">
            {sampleVideos.map((video) => (
              <div
                key={video.id}
                className="relative overflow-hidden rounded-lg cursor-pointer transition-transform duration-300"
                draggable
                onDragStart={(event) => handleVideoDragStart(event, video)}
                onClick={() => setMediaFile({ mediaType: "video", mediaUrl: video.src })}
              >
                <video className="w-[125px] h-[110px] object-cover rounded-lg">
                  <source src={video.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                >
                  <FaPlayCircle size={26} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-[#E9F5F4] text-gray-200 rounded-lg overflow-hidden border border-solid border-[#A8BFBD] my-4">
        {/* Header */}
        <h4 className="text-lg font-semibold bg-[#E9F5F4] text-[#092C4C] pt-5 px-5">
          Upload Video
        </h4>

        <div className="p-5 relative">
          {/* Video Preview or Drop Area */}
          {videoLoading && (
            <div className="absolute top-0 left-0 z-9 p-5 w-full h-full">
              <div className="w-full h-full flex items-center flex-col justify-center border-1 border-dashed border-[#708A87] rounded-lg bg-white">
                <ProgressBar
                  visible={true}
                  height="80"
                  width="80"
                  barColor="#A8BFBD"
                  borderColor="#A8BFBD"
                  ariaLabel="progress-bar-loading"
                />
                <span className="text-[#092C4C] font-bold">Loading</span>
              </div>
            </div>
          )}
          {videoUrl ? (
            <>
              <div className="relative w-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={originalVideo ? videoUrl : trimmedVideo}
                  controls
                  className="w-full object-cover shadow-lg rounded-lg"
                  onLoadedMetadata={handleLoadedMetadata}
                />

                <button
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-zinc-900 text-white p-2 rounded-full hover:bg-zinc-800 transition-all"
                >
                  <FiX size={20} />
                </button>
                {trimmedVideo && (
                  <button
                    onClick={() => setOriginalVideo(!originalVideo)}
                    title={originalVideo ? "trimmed Video" : "Original video"}
                    className="absolute top-2 left-2 bg-zinc-900 text-white p-2 rounded-full hover:bg-zinc-800 transition-all"
                  >
                    <RiExchangeBoxLine size={20} />
                  </button>
                )}
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between text-[#303030] mb-2">
                  <span>Start: {range[0].toFixed(2)}s</span>
                  <span>End: {range[1].toFixed(2)}s</span>
                </div>
                <Slider
                  range
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={range}
                  onChange={handleRangeChange}
                  allowCross={false}
                  trackStyle={[{ backgroundColor: "#616665" }]}
                  handleStyle={[
                    { backgroundColor: "#616665", borderColor: "#616665" },
                    { backgroundColor: "#616665", borderColor: "#616665" },
                  ]}
                  railStyle={{ backgroundColor: "#C9C8C8" }}
                />
                <div className="flex justify-between text-[#303030] mt-2">
                  <span>0s</span>
                  <span>{videoDuration.toFixed(2)}s</span>
                </div>
              </div>

              <div className="videoBtn flex flex-wrap justify-center mt-5 gap-5">
                {/* Trim Button */}
                <button onClick={() => handleTrim(range)} className="" disabled={loading?.trim}>
                  {loading?.trim ? (
                    <>
                      <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
                      <span className="mx-2">Trimming</span>
                    </>
                  ) : (
                    <>
                      <IoIosCut size="25" className="mr-2" />
                      <span className="mx-2">Trim</span>
                    </>
                  )}
                </button>

                {/* Get Insights Button */}
                <button onClick={handleTooltips} className="" disabled={loading?.tooltip}>
                  {/* <MdInsights size="25" className="mr-2" />
                {loading?.tooltip ? (
                  <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
                ) : (
                  "Insights"
                )} */}
                  {loading?.insight ? (
                    <>
                      <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
                      <span className="mx-2">Getting Insights</span>
                    </>
                  ) : (
                    <>
                      <MdInsights size="25" className="mr-2" />
                      <span className="mx-2">Insights</span>
                    </>
                  )}
                </button>

                {/* Best Moment */}
                <button
                  onClick={() => handleBestMoment()}
                  className=""
                  disabled={loading?.best_moment}
                >
                  {/* {loading?.best_moment ? (
                    <>
                      <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
                      <span className="mx-2">Generating</span>
                    </>
                  ) : ( */}
                  <>
                    <GrGallery size="25" className="mr-2" />
                    <span className="mx-2">Best Moments</span>
                  </>
                  {/* )} */}
                </button>

                {/* Process Button */}
                {originalVideo &&
                  (fileId ? (
                    <div className="flex items-center justify-center p-4">
                      <FaCheckCircle className="text-[#708A87] text-md mr-2" />
                      <p className="text-[#708A87] text-md font-medium">
                        Your file has been processed successfully!
                      </p>
                    </div>
                  ) : (
                    <button onClick={handleUpload} className="" disabled={loading?.process}>
                      {loading?.process ? (
                        <>
                          <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
                          <span className="mx-2">Processing</span>
                        </>
                      ) : (
                        <>
                          <TbRefresh size="25" className="mr-2" />
                          <span className="mx-2">Process Video for Q & A</span>
                        </>
                      )}
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleVideoDrop}
              onClick={() => document.getElementById("file-input").click()}
              className={`w-full h-full flex items-center justify-center border-1 ${
                videoUrl ? "border-transparent" : "border-dashed border-[#708A87]"
              } rounded-lg bg-white hover:bg-gray-200 transition-colors cursor-pointer relative`}
            >
              <div className="text-center text-gray-900 py-35">
                <h3 className="text-xl font-medium text-[#092C4C]">Click to Upload</h3>
                <p>Drag and drop or click to upload your files.</p>
              </div>
              {/* <p className="text-gray-900 text-center">Drag and drop a video file here, or click to browse</p> */}
              <input
                type="file"
                id="file-input"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && <p className="mt-4 text-gray-300 text-center">{uploadStatus}</p>}

          {/* Real-Time Tooltips Section */}
          {}
        </div>
      </div>
      <MediaPreview
        isOpen={mediaFile?.mediaUrl}
        onClose={() => setMediaFile(null)}
        mediaUrl={mediaFile?.mediaUrl}
        mediaType={mediaFile?.mediaType}
      />
    </>
  );
};

export default VideoUploadPlayback;
