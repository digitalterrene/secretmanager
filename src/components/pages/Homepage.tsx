"use client";
import React, { useState } from "react";
import Form from "../ui/form";
import Responsehistory from "../ui/responsehistory";
import TerminalIndex from "./terminal/Index";
import { AIChat } from "../ai-chat";

export default function Homepage() {
  const [currentTab, setCurrentTab] = useState("form-tab");

  return (
    <div className="w-full  container mx-auto">
      <div
        className={`w-full ${
          currentTab === "form-tab" ? "lg:flex space-y-20 lg:space-y-0" : ""
        } items-start justify-between`}
      >
        <div
          className={`${
            currentTab === "form-tab" ? "lg:w-1/2" : "w-full"
          } lg:py-10`}
        >
          <div className="flex justify-start mt-8 lg:mt-0">
            <div className="flex bg-gray-100 hover:bg-gray-200 rounded-lg transition p-1 dark:bg-neutral-700 dark:hover:bg-neutral-600">
              <nav
                className="flex gap-x-1"
                aria-label="Tabs"
                role="tablist"
                aria-orientation="horizontal"
              >
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 hs-tab-active:dark:bg-neutral-800 hs-tab-active:dark:text-neutral-400 dark:hs-tab-active:bg-[#040918] py-1.5 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 font-medium rounded-lg hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:focus:text-white ${
                    currentTab === "form-tab" ? "active" : ""
                  }`}
                  id="form-tab"
                  onClick={() => setCurrentTab("form-tab")}
                  aria-selected={currentTab === "form-tab"}
                  data-hs-tab="#form-tab"
                  aria-controls="form-tab"
                  role="tab"
                >
                  Form
                </button>
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 hs-tab-active:dark:bg-neutral-800 hs-tab-active:dark:text-neutral-400 dark:hs-tab-active:bg-[#040918] py-1.5 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 font-medium rounded-lg hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:focus:text-white ${
                    currentTab === "terminal-tab" ? "active" : ""
                  }`}
                  id="terminal-tab"
                  onClick={() => setCurrentTab("terminal-tab")}
                  aria-selected={currentTab === "terminal-tab"}
                  data-hs-tab="#terminal-tab"
                  aria-controls="terminal-tab"
                  role="tab"
                >
                  Terminal
                </button>
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 hs-tab-active:dark:bg-neutral-800 hs-tab-active:dark:text-neutral-400 dark:hs-tab-active:bg-[#040918] py-1.5 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 font-medium rounded-lg hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:focus:text-white ${
                    currentTab === "ai-chat-tab" ? "active" : ""
                  }`}
                  id="ai-chat-tab"
                  onClick={() => setCurrentTab("ai-chat-tab")}
                  aria-selected={currentTab === "ai-chat-tab"}
                  data-hs-tab="#ai-chat-tab"
                  aria-controls="ai-chat-tab"
                  role="tab"
                >
                  AI Chat
                </button>
              </nav>
            </div>
          </div>
          <div className="mt-3 h-[70vh] dark:bg-[#0B0D0D] w-full">
            <div
              className={`h-full ${currentTab !== "form-tab" ? "hidden" : ""}`}
              id="form-tab"
              role="tabpanel"
              aria-labelledby="form-tab"
            >
              <Form />
            </div>
            <div
              id="terminal-tab"
              className={`h-full ${
                currentTab !== "terminal-tab" ? "hidden" : ""
              }`}
              role="tabpanel"
              aria-labelledby="terminal-tab"
            >
              <TerminalIndex />
            </div>
            <div
              id="ai-chat-tab"
              className={`h-full  ${
                currentTab !== "ai-chat-tab" ? "hidden" : ""
              }`}
              role="tabpanel"
              aria-labelledby="ai-chat-tab"
            >
              <AIChat onClose={() => setCurrentTab("form-tab")} />
            </div>
          </div>
        </div>
        {/* History Section */}
        {currentTab === "form-tab" && (
          <div className="w-full lg:w-1/2 lg:mt-0 lg:pl-10 lg:py-10">
            <Responsehistory />
          </div>
        )}
      </div>
    </div>
  );
}
