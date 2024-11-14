import React, { useEffect, useState } from "react";

const Notification = ({
  message,
  type = "loading",
  duration = 5000,
  onClose,
}: {
  message: string;
  type: string;
  duration: number;
  onClose: any;
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Progress and timeout for auto-dismiss
    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 100 / (duration / 100) : 0));
    }, 100);

    const timeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  // Function to get the background color based on the notification type
  const getColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "loading":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  // Function to get an icon based on the notification type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✔️";
      case "error":
        return "❌";
      case "loading":
      default:
        return "⏳";
    }
  };

  return (
    <div className="max-w-sm w-full z-50">
      <div
        className={`relative flex items-center p-4 rounded-lg shadow-lg text-white ${getColor()}`}
      >
        <span className="mr-2 text-xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-1 text-white hover:text-gray-300 focus:outline-none"
        >
          ✖
        </button>
        <div
          className="absolute bottom-0 left-0 h-1 bg-white"
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>
    </div>
  );
};

export default Notification;
