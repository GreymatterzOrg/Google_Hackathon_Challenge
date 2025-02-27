import { useEffect, useRef, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { BsSend } from "react-icons/bs";
import { FaCircleUser } from "react-icons/fa6";
import apiClient from "../services/apiClient";

const ChatSection = ({ fileId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!localStorage.getItem("user")) return;
    const user = JSON.parse(localStorage.getItem("user"));

    if (input.trim()) {
      const newMessage = {
        role: "user",
        message: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput("");

      if (!fileId) {
        const newMessage = {
          role: "bot",
          message: "Please process video first.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };

        setMessages((prev) => [...prev, newMessage]);
        return;
      }

      setLoading(true);

      try {
        const payload = {
          file_id: fileId,
          user_id: user?._id,
          prompt: input,
        };

        const response = await apiClient.post("/query", payload);
        const botMessage = {
          role: "bot",
          message: response?.response || "No response from the bot.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            message: "Error processing request.",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col rounded-lg bg-[#F6FAFD] border border-solid border-[#EAEEF4] overflow-hidden border-1 border-solid border-[#E0DCDC]">
      {/* Chat Header */}
      <h4
        className="text-lg text-[#092C4C] font-semibold py-4 px-5"
        style={{ borderBottom: "1px solid #EAEEF4" }}
      >
        Chat Section
      </h4>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-grow h-75 overflow-y-auto p-4 space-y-4">
        {messages.length ? (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              <div className={`flex`}>
                {msg.role === "user" ? (
                  <FaCircleUser size="40" className="mr-2 text-[#708A87]" />
                ) : (
                  ""
                )}
                <div
                  className={`rounded-lg px-3 py-2 w-full bg-white border border-solid border-[#E0DCDC] text-[#25293B]`}
                >
                  {msg?.message}
                </div>
              </div>
              <span className="text-xs text-gray-400 text-right mt-1">{msg.time}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-900">
            <img className="m-auto" src="../images/conversation.png" />
            <h3 className="text-xl font-medium text-[#092C4C]">No Chat Available</h3>
            <p>Upload video and the continue chat</p>
          </div>
        )}
        {loading && (
          <div className="flex justify-center">
            <TailSpin height="30" width="30" color="#00BFFF" ariaLabel="loading" />
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-3 items-center relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="rounded-full w-full h-[50px] px-4 py-2 text-gray-900 bg-white border border-solid border-[#E0DCDC] focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-[#708A87] h-[41px] w-[41px] text-white rounded-full flex justify-center items-center absolute top-[17px] right-[18px]"
          disabled={loading}
        >
          <BsSend size="22" />
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
