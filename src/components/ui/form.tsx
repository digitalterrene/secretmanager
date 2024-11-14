"use client";
import React, { useEffect, useState } from "react";
import { generateSecret } from "@/utils/generate-secret";
import { useRouter } from "next/navigation";
import { useHistory } from "@/context/HistoryContext";
import Notification from "@/utils/notifications";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Form() {
  const [phrase, setPhrase] = React.useState("");
  const [timestamp, setTimestamp] = React.useState("");
  const { addToHistory } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notifications, setNotifications] = useState<any>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const addNotification = (message: string, type: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev: any) => [...prev, { id, message, type }]);
  };

  // Phrase strength requirements
  const hasMinLength = phrase.length >= 8;
  const hasUpperCase = /[A-Z]/.test(phrase);
  const hasLowerCase = /[a-z]/.test(phrase);
  const hasNumber = /\d/.test(phrase);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(phrase);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    addNotification("Creating secret...", "loading");
    setResult(null);
    setError(null);

    const response = await generateSecret({ phrase, timestamp });

    if ("secret" in response) {
      setSuccessMessage("Secret created successfully!");
      setTimeout(() => {
        setSuccessMessage(""); // Clear the message after 6 seconds
      }, 6000);
      // Get the current cached history from localStorage, or default to an empty array if none exists
      const cachedHistoryString = localStorage.getItem("secret-history");
      const cachedHistory = cachedHistoryString
        ? JSON.parse(cachedHistoryString)
        : [];

      // Create the new entry to add to the history
      const newEntry = { timestamp, phrase, secret: response.secret };

      // Update the history by prepending the new entry
      const updatedHistory = [newEntry, ...cachedHistory];

      // Save the updated history back to localStorage
      localStorage.setItem("secret-history", JSON.stringify(updatedHistory));

      // Manually update the history state
      addToHistory(newEntry); // Update history through the context

      // Optional: You can update the UI state with the new history here
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    } else {
      setError(response.error);
      addNotification("Failed to create secret.", "error");
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 8000);
  };

  const captureTimestamp = () => {
    const currentTimestamp = Date.now().toString();
    setCapturedTimestamp(currentTimestamp);
  };

  const insertTimestamp = () => {
    setTimestamp(capturedTimestamp);
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
  const displaySuccessMessage = () => {
    setSuccessMessage("Secret created successfully!");
    setTimeout(() => {
      setSuccessMessage(""); // Clear the message after 6 seconds
    }, 6000);
  };
  return (
    <div className="max-w-4xl h-full mx-auto border  rounded-xl   ">
      <div className="  bg-white   border-gray-200 rounded-xl shadow-sm  dark:bg-[#0B0D0D]  dark:border-neutral-700">
        <div className="p-4 sm:p-7">
          <div className=" ">
            <div className="flex justify-between w-full items-start  ">
              <h1 className="block text-2xl  font-bold text-gray-800 dark:text-white">
                Generate Secret
              </h1>
            </div>
            <div className="  my-2">
              {error ? (
                <p className="w-full line-clamp text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : (
                successMessage && (
                  <p className="mt-4 text-green-600 dark:text-green-400">
                    {successMessage}
                  </p>
                )
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-white">
              Enter your phrase and timestamp to generate a secure secret.
            </p>
          </div>

          <div className="mt-5">
            <form onSubmit={handleGenerate}>
              <div className="grid gap-y-4">
                {/* Phrase Field */}
                <div>
                  <label
                    htmlFor="phrase"
                    className="block text-sm mb-2 dark:text-white"
                  >
                    Phrase
                  </label>
                  <input
                    type="text"
                    id="phrase"
                    name="phrase"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    required
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    placeholder="Enter your phrase"
                  />
                  {/* Phrase Strength Indicator */}
                  <div className="mt-2 flex flex-col text-sm">
                    <span
                      className={`mr-2 ${
                        hasMinLength ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      • At least 8 characters
                    </span>
                    <span
                      className={`mr-2 ${
                        hasUpperCase ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      • One uppercase letter
                    </span>
                    <span
                      className={`mr-2 ${
                        hasLowerCase ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      • One lowercase letter
                    </span>
                    <span
                      className={`mr-2 ${
                        hasNumber ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      • One number
                    </span>
                    <span
                      className={`${
                        hasSpecialChar ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      • One special character
                    </span>
                  </div>
                </div>

                {/* Timestamp Field */}
                <div>
                  <label
                    htmlFor="timestamp"
                    className="block text-sm mb-2 dark:text-white"
                  >
                    Timestamp
                  </label>
                  <input
                    type="text"
                    id="timestamp"
                    name="timestamp"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    required
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    placeholder="Enter or insert your timestamp"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={captureTimestamp}
                      className="py-2 px-4 bg-gray-200 rounded-lg text-sm font-medium dark:bg-neutral-700 dark:text-white"
                    >
                      Capture Timestamp
                    </button>
                    <button
                      type="button"
                      onClick={insertTimestamp}
                      disabled={!capturedTimestamp}
                      className="py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Insert
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <>
                      {" "}
                      <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 mr-3" />
                      Loading...
                    </>
                  ) : (
                    <>Generate Secret</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
