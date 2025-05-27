import React, { useState, useEffect } from "react";
import { useRef } from "react";

import { apiRequest } from "../../utils/apiReq";
import { proxy } from "../../utils/deployment.js";

import moment from "moment";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import clsx from "clsx";

const AssistantChat = ({ task }) => {
  const params = useParams();

  const { currentUser } = useSelector((state) => state.user);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  console.log("INPUT: ", input);

  const fetcHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiRequest(
        `${proxy}/backend/utils/get-chat-history/${task._id}/${currentUser._id}`
      );
      if (!res) return;

      const data = await res.json();

      console.log(data);

      if (data.messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: `Hi ${
              currentUser.first_name + " " + currentUser.last_name
            }! How can I help you with ${task.title}?`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages(data.messages);
      }
      setError(null);
      setLoadingHistory(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoadingHistory(false);
      return;
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetcHistory();
  }, [task, currentUser]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      setLoading(true);

      const res = await apiRequest(`${proxy}/backend/utils/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id.toString(),
          userId: currentUser._id.toString(),
          messages: newMessages,
        }),
      });

      if (!res) return;

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);

      setError(null);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="flex flex-col h-[650px] sm:h-[400px] border rounded-lg p-4 bg-white">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col max-w-[75%]">
            <span
              className={clsx(
                "text-xs text-gray-500 mb-1",
                msg.role === "user" ? "self-end text-right" : "self-start"
              )}
            >
              {msg.role === "user" ? "User" : "Assistant"} (
              {moment(msg.timestamp).fromNow()})
            </span>
            <div
              className={clsx(
                `px-4 py-2 rounded-xl whitespace-pre-wrap`,
                msg.role === "user"
                  ? "bg-blue-100 self-end text-right"
                  : "bg-gray-100 self-start"
              )}
            >
              <p className="text-sm text-gray-800">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-400">Assistant is typing...</div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Scrie un mesaj..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          onClick={sendMessage}
        >
          Trimite
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-4xl">Something went wrong! {error}</p>
      )}
    </div>
  );
};

export default AssistantChat;
