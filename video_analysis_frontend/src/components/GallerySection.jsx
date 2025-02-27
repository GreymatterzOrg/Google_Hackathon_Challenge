import { useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { HiOutlineDownload } from "react-icons/hi";
import { IoIosCut } from "react-icons/io";
import toast from "react-hot-toast";
import axios from "axios";
import MediaPreview from "./MediaPreview";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const GallerySection = ({ trimmedVideos, clips, screenshots }) => {

  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [name, setName] = useState("");

  const handleSaveToPlaylist = async () => {
    if (!localStorage.getItem("user")) return;
    const user = JSON.parse(localStorage.getItem("user"));

    // await handleSaveScreenshot();

    const payload = {
      file_id: localStorage.getItem("fileId"),
      screenshot_paths: selectedImages,
      clips_paths: selectedVideos,
      original_path: "",
      playlist: name,
      user_id: user._id,
    };



    setLoadingSave(true);

    try {
      await apiClient.post("/playlist", payload);

      toast.success("Saved !");
    } catch (error) {
      console.error("Error saving screenshots:", error);
      toast.success("Error Saving !");
    } finally {
      setLoadingSave(false);
    }
  };

  const downloadFiles = async () => {
    const downloadFile = async (path) => {
      try {
        const response = await apiClient.get(
          `/${path}`,
          {},
          {
            responseType: "blob",
          }
        );
        const fileName = path.split("/").pop();
        const url = URL.createObjectURL(response);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    };

    const allFiles = [...selectedImages, ...selectedVideos];
    for (const file of allFiles) {
      await downloadFile(file);
    }
    toast.success("Videos Downloaded!");
  };

  const handleSelectVideos = (path) => {
    if (selectedVideos.includes(path)) {
      setSelectedVideos(selectedVideos.filter((selected) => selected !== path));
    } else {
      setSelectedVideos([...selectedVideos, path]);
    }
  };

  const handleSelectedImage = (path) => {
    if (selectedImages.includes(path)) selectedImages.filter((image) => image !== path);
    else setSelectedImages((prev) => [...prev, path]);
  };

  const handleVideoDragStart = (event, video) => {
    event.dataTransfer.setData("video", JSON.stringify({ src: BASE_URL + "/" + video }));
  };

  return (
    <div className="flex flex-col rounded-lg bg-white overflow-hidden mb-5 border-1 border-solid border-[#E0DCDC]">
      {/* Header */}
      <div
        className="flex justify-between items-center"
        style={{ borderBottom: "1px solid #EAEEF4" }}
      >
        <h4 className="text-lg text-[#092C4C] font-semibold py-4 px-5">Media Gallery</h4>
        <div className="flex gap-2">
          {/* <button className="text-sm hover:bg-blue-600 text-gray-100 font-bold py-2 px-4 rounded inline-flex items-center">
            <TfiReload />
            <span className="ml-2">Process</span>
          </button> */}
          <button
            className="flex text-md text-gray-900 px-5 cursor-pointer"
            onClick={() => downloadFiles()}
          >
            <HiOutlineDownload size="22" />
            <span className="ml-2">Download</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-white overflow-y-auto p-4 max-h-[650px]">
        {/* Trimmed Videos Section */}
        {!trimmedVideos.length && !clips.length && !screenshots.length && (
          <div className="flex flex-col items-center justify-center">
            <div className="text-center text-gray-900 py-20">
              <img className="mx-auto w-[80px]" src="../images/image-gallery 1.png" />
              <h2 className="text-xl font-medium text-[#092C4C]">No image / Video Available</h2>
              <p>Upload video and then continue chat</p>
            </div>
          </div>
        )}

        {/* Trimmed Videos Section */}
        {trimmedVideos?.length ? (
          <div className="mb-4">
            <h2 className="text-[#092C4C] text-md font-semibold mb-2">Trimmed Videos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trimmedVideos.map((video, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300`}
                  onClick={() => setMediaFile({ mediaType: "video", mediaUrl: video })}
                  draggable
                  onDragStart={(event) => handleVideoDragStart(event, video)}
                >
                  <video
                    src={`${BASE_URL}/` + video}
                    // onClick={() => handleSelectVideos(video)}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                  >
                    <input
                      type="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVideos(video);
                      }}
                      className="absolute top-2 right-2 h-4 w-4 z-10"
                    />
                    <FaPlayCircle size={26} />
                    <IoIosCut size={26} className="absolute bottom-2 right-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        {/* Clips Section */}
        {clips?.length ? (
          <div className="mb-4">
            <h2 className="text-[#092C4C] text-md font-semibold mb-2">Clips</h2>
            <div className="grid grid-cols-3 gap-4">
              {clips.map((clip, index) => (
                <div
                  key={index}
                  className={`${
                    selectedVideos.includes(clip) ? "border-1 border-blue-700 " : ""
                  }relative overflow-hidden rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300`}
                  onClick={() => setMediaFile({ mediaType: "video", mediaUrl: clip })}
                  draggable
                  onDragStart={(event) => handleVideoDragStart(event, clip)}
                >
                  <video
                    src={`${BASE_URL}/` + clip}
                    onClick={() => handleSelectVideos(clip)}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                  >
                    <input
                      type="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVideos(clip);
                      }}
                      className="absolute top-2 right-2 h-4 w-4"
                    />
                    <FaPlayCircle size={26} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        {/* Screenshots Section */}
        {screenshots?.length ? (
          <div className="mb-4">
            <h2 className="text-[#092C4C] text-md font-semibold mb-2">Screenshots</h2>
            <div className="grid grid-cols-3 gap-4">
              {screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer`}
                  onClick={() => setMediaFile({ mediaType: "image", mediaUrl: screenshot })}
                >
                  <img
                    src={`${BASE_URL}/` + screenshot}
                    alt={`Screenshot ${index}`}
                    className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                  <input
                    type="checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectedImage(screenshot);
                    }}
                    className="absolute top-2 right-2 h-4 w-4"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        {selectedImages.length || selectedVideos.length ? (
          <>
            <div className="h-0.5 bg-gray-100" />
            <div className="flex flex-col md:flex-row items-center mt-3">
              <input
                type="text"
                placeholder="Enter playlist name"
                className="text-gray-800 mb-4 md:mb-0 md:mr-4 w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                onClick={() => handleSaveToPlaylist()}
                className="w-full md:w-auto cursor-pointer bg-gray-600 disabled:bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                disabled={!selectedVideos.length && !selectedImages.length}
              >
                {loadingSave ? "Saving..." : "Save to playlist"}
              </button>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>

      <MediaPreview
        isOpen={mediaFile?.mediaUrl}
        onClose={() => setMediaFile(null)}
        mediaUrl={mediaFile?.mediaUrl}
        mediaType={mediaFile?.mediaType}
      />
    </div>
  );
};

export default GallerySection;
