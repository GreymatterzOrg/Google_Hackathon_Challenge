import { useEffect, useRef, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import Tooltip from "./ToolTip";
import { GrGallery } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import PlayersInfo from "./PlayersInfo";
import { TailSpin } from "react-loader-spinner";

const InsightTabs = ({
  handleProcessVideo,
  players,
  insights,
  activeTab,
  setActiveTab,
  loading,
  insightStatus,
}) => {
  // const [insights, setInsights] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [clipDuration, setClipDuration] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");

  const insightsEndRef = useRef(null);

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0 && insightStatus) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, insightStatus]);

  // Auto-scroll to bottom smoothly when new message appears
  useEffect(() => {
    if (insightsEndRef.current) {
      insightsEndRef.current.scrollTo({
        top: insightsEndRef.current.scrollHeight,
        behavior: "smooth",
      });
      // setCountdown(10);
    }
  }, [insights]);

  return (
    <>
      <div className="flex flex-col bg-[#E9F5F4] text-gray-200 rounded-lg overflow-hidden border border-solid border-[#A8BFBD] mt-8 p-5">
        {activeTab === "BEST_MOMENT" ? (
          <>
            <div className="bestmoment flex justify-between mb-3 font-medium text-[#303030]">
              <div className="flex items-center">
                <GrGallery />
                <h3 className="ml-2">Best Moments</h3>
              </div>

              <IoMdClose className="cursor-pointer" onClick={() => setActiveTab("INSIGHTS")} />
            </div>
            <div className="px-8 py-8 flex flex-col bg-white rounded-b-lg border border-solid border-[#D1D1D1]">
              <label className="mb-2 text-[#303030]">
                Enter Prompt for the desired best moments
              </label>
              <div className="flex items-center mb-5 text-gray-900">
                <input
                  type="text"
                  placeholder="Enter prompt here"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-100 bg-white p-2 rounded-md border border-solid border-[#E0DCDC] text-gray-900"
                />
                <Tooltip
                  content={
                    <div className="rounded-xl border-gray-500">
                      <div className="my-2">
                        <p className="text-xs mx-4">Give best moments of home run</p>
                        <hr className="my-2 border-gray-200" />
                      </div>
                      <div className="my-2">
                        <p className="text-xs mx-4">Give moments of the best catches</p>
                        <hr className="my-2 border-gray-200" />
                      </div>
                      <div className="my-2">
                        <p className="text-xs mx-4">Give moments of the pitcher</p>
                      </div>
                    </div>
                  }
                >
                  <FaRegQuestionCircle className="ml-4" />
                </Tooltip>
                <span className="text-[#092C4C] ml-1">Help</span>
              </div>
              <label className="mb-2 text-[#303030]">Enter your desired clip duration</label>
              <input
                type="text"
                placeholder="Clip Duration (e.g. 30s)"
                value={clipDuration}
                onChange={(e) => setClipDuration(e.target.value)}
                className="w-100 bg-white p-2 rounded-md border border-solid border-[#E0DCDC] text-gray-900"
              />
              <button
                onClick={() => handleProcessVideo(prompt, clipDuration)}
                className="w-75 flex justify-center items-center bg-[#708A87] text-white p-3 rounded-full mt-10"
              >
                {loading?.best_moment ? (
                  <>
                    <TailSpin height="20" width="20" color="#ffffff" ariaLabel="loading" />
                    <span className="mx-4">Generating</span>
                  </>
                ) : (
                  <>
                    {/* <IoIosCut size="25" className="mr-2" /> */}
                    <span className="mx-2">Generate</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="tabBtnCst">
              <button
                className={activeTab === "INSIGHTS" ? "active " : ""}
                onClick={() => setActiveTab("INSIGHTS")}
              >
                Real time Insights
              </button>
              <button
                className={activeTab === "PLAYERS" ? "active " : ""}
                onClick={() => setActiveTab("PLAYERS")}
              >
                Players
              </button>
            </div>

            <div className="bg-white rounded-b-lg overflow-hidden border border-solid border-[#D1D1D1]">
              {activeTab === "INSIGHTS" && (
                <div
                  ref={insightsEndRef}
                  className="items-center justify-center max-h-75 p-4 overflow-y-auto"
                >
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <div key={index} className="text-[#303030] mb-4 p-2 rounded-lg">
                        <p className="font-medium mb-1">At 00:00:{insight.timestamp}</p>
                        <p className="text-sm">{insight.tooltip}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      {insightStatus ? (
                        <div className="text-center text-gray-900 py-20">
                          <h3 className="text-xl font-medium text-[#092C4C]">
                            Your Insight will be there in {countdown} seconds
                          </h3>
                          {/* <p>Upload video and click on show insights</p> */}
                        </div>
                      ) : (
                        <div className="text-center text-gray-900 py-20">
                          <h3 className="text-xl font-medium text-[#092C4C]">
                            No Real time Insights Available
                          </h3>
                          <p>Upload video and click on show insights</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "PLAYERS" && (
                <div className="flex flex-col">
                  {players?.length > 0 ? (
                    <ul className="mx-5 my-8">
                      {players.map((player, index) => (
                        <li
                          key={index}
                          className="group px-4 py-2 cursor-pointer flex items-center justify-between transition-transform duration-300 transform hover:bg-gray-100 border-t border-t-solid border-t-[#A8BFBD] first:border-t-0"
                          onClick={() => setCurrentPlayer(player)}
                        >
                          <span className="text-lg text-gray-900 font-medium">{player}</span>
                          <button className="bg-[#708a87] text-white px-6 py-2 rounded-full text-sm transition-colors duration-300 text-gray-900 group-hover:bg-[#092c4c]">
                            Click to view
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-900 py-20">
                      <h3 className="text-xl font-medium text-[#092C4C]">
                        Players Info not available
                      </h3>
                      <p>Upload video and click on show players</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Players Name Modal */}
      {currentPlayer.length !== 0 && (
        <PlayersInfo playerName={currentPlayer} onClose={() => setCurrentPlayer("")} />
      )}

      {/* TAB OPTION */}
      <div className="h-full flex flex-col rounded-lg shadow-md bg-gray-900 overflow-hidden mt-10 hidden">
        {/* Tabs Header */}
        <div className="flex bg-gray-800">
          <button
            className={`flex-1 p-3 text-center ${
              activeTab === "insight"
                ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("insight")}
          >
            Get Insight
          </button>
          <button
            className={`flex-1 p-3 text-center ${
              activeTab === "best-moments"
                ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("best-moments")}
          >
            Best Moments
          </button>
        </div>
      </div>
    </>
  );
};

export default InsightTabs;
