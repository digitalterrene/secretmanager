"use client";
import React, { useEffect, useState } from "react";
import { useHistory } from "@/context/HistoryContext";
import { MdOutlineContentCopy } from "react-icons/md";

export default function Responsehistory() {
  const { history, removeFromHistory } = useHistory();
  const [notifications, setNotifications] = useState<any>([]);

  const addNotification = (message: string, type: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev: any) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: any) => {
    setNotifications((prev: any) =>
      prev.filter((notification: any) => notification.id !== id)
    );
  };
  // Function to handle copying text to the clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => console.error("Failed to copy: ", err)
    );
  };

  // Function to handle deleting an entry
  const handleDelete = (timestamp: string) => {
    removeFromHistory(timestamp); // Remove the entry based on timestamp
  };
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set `isMounted` to true only after the component mounts to avoid SSR mismatches
    setIsMounted(true);
  }, []);

  if (typeof window === undefined) {
    // Prevent rendering until mounted to avoid hydration mismatch
    return null;
  }

  return (
    <div className="w-full  ">
      <div className="py-1  px-4 w-fit  items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-100 text-blue-800 disabled:opacity-50 disabled:pointer-events-none      ">
        <p>Response</p>
      </div>
      <div className="flex flex-col mt-5 dark:bg-[#0B0D0D]  bg-white border shadow-sm rounded-xl   dark:border-neutral-700 dark:shadow-neutral-700/70">
        <div className="h-[70vh] overflow-y-auto p-4 md:p-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            History
          </h3>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div>
                {" "}
                <div className="  flex justify-end">
                  <button
                    onClick={() => handleDelete(entry.timestamp)}
                    className="py-1.5 ml-auto px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:bg-red-600 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Delete
                  </button>
                </div>
                <div
                  key={index}
                  className="mt-1 bg-gray-50 w-full rounded-lg border p-2"
                >
                  <div className="text-gray-500 w-full dark:text-neutral-400">
                    <div>
                      <div className=" items-center gap-x-2 py-1   text-sm   text-gray-800 -mt-px  first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
                        <div className="flex items-start justify-between w-full">
                          <p className="text-sm leading-6 text-gray-900   font-semibold select-none">
                            Timestamp:{" "}
                            <span className="text-gray-600 font-normal">
                              {entry.timestamp}
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(entry.timestamp)}
                            className="p-1 px-1.5   inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <MdOutlineContentCopy />
                          </button>
                        </div>
                      </div>
                      <div className=" items-center gap-x-2 py-1  text-sm   text-gray-800 -mt-px  first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
                        <div className="flex items-start justify-between w-full">
                          <p className="text-sm leading-6 text-gray-900  font-semibold select-none">
                            Phrase:{" "}
                            <span className="text-gray-600 font-normal">
                              {entry.phrase}
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(entry.phrase)}
                            className="p-1 px-1.5   inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <MdOutlineContentCopy />
                          </button>
                        </div>
                      </div>
                      <div className="items-center gap-x-2 py-1 w-full  text-sm text-gray-800 lg:-mt-px first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
                        <div className="flex items-start justify-between w-full">
                          <div className="lg:w-full w-1/2 flex items-center gap-2">
                            <p className="text-sm leading-6  text-gray-900 font-semibold select-none">
                              Secret:
                            </p>{" "}
                            <p className="text-gray-600 lg:w-10/12    font-normal  truncate overflow-hidden text-ellipsis whitespace-nowrap">
                              {entry.secret}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(entry.secret)}
                            className="p-1 px-1.5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <MdOutlineContentCopy />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
