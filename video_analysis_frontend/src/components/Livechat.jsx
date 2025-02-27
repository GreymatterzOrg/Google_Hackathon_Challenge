import { useState } from "react";

// const socket = io('http://localhost:5000');

function Livechat() {
  const [messages, setMessages] = useState([]);


  return (
    <div>
      <h4>Live Chat</h4>
      <div className="chat-feed">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
}

export default Livechat;
