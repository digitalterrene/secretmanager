"use client";
import React, { useState } from "react";
import Aichat from "../ui/aichat";
import Terminal from "../ui/terminal";
import Form from "../ui/form";
import Responsehistory from "../ui/responsehistory";

export default function Homepage() {
  return (
    <div className="w-full lg:flex space-y-10 lg:space-y-0 block items-start justify-between">
      <div className="w-full lg:w-1/2 lg:p-10 ">
        <div className="flex justify-start  mt-8 lg:mt-0 ">
          <div className="flex bg-gray-100 hover:bg-gray-200 rounded-lg transition p-1 dark:bg-neutral-700 dark:hover:bg-neutral-600">
            <nav
              className="flex gap-x-1"
              aria-label="Tabs"
              role="tablist"
              aria-orientation="horizontal"
            >
              <button
                type="button"
                className="hs-tab-active:bg-white hs-tab-active:text-gray-700 hs-tab-active:dark:bg-neutral-800 hs-tab-active:dark:text-neutral-400 dark:hs-tab-active:bg-[#040918] py-1.5 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 font-medium rounded-lg hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:focus:text-white active"
                id="segment-item-1"
                aria-selected="true"
                data-hs-tab="#segment-1"
                aria-controls="segment-1"
                role="tab"
              >
                Form
              </button>
              <button
                type="button"
                className="hs-tab-active:bg-white hs-tab-active:text-gray-700 hs-tab-active:dark:bg-neutral-800 hs-tab-active:dark:text-neutral-400 dark:hs-tab-active:bg-[#040918] py-1.5 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 font-medium rounded-lg hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:focus:text-white"
                id="segment-item-2"
                aria-selected="false"
                data-hs-tab="#segment-2"
                aria-controls="segment-2"
                role="tab"
              >
                Terminal
              </button>
              <button
                type="button"
                className="hs-tab-active:bg-white hs-tab-active:text-gray-700 hs-tab-active:dark:bg-neutral-800 hs-tab-active:dark:text-neutral-400 dark:hs-tab-active:bg-[#040918] py-1.5 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 font-medium rounded-lg hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-white dark:focus:text-white"
                id="segment-item-3"
                aria-selected="false"
                data-hs-tab="#segment-3"
                aria-controls="segment-3"
                role="tab"
              >
                AI Chat
              </button>
            </nav>
          </div>
        </div>
        <div className="mt-3 h-[70vh] dark:bg-[#0B0D0D]  w-full">
          <div
            className="h-full"
            id="segment-1"
            role="tabpanel"
            aria-labelledby="segment-item-1"
          >
            <Form />
          </div>
          <div
            id="segment-2"
            className="hidden h-full"
            role="tabpanel"
            aria-labelledby="segment-item-2"
          >
            <Terminal />
          </div>
          <div
            id="segment-3"
            className="hidden h-full"
            role="tabpanel"
            aria-labelledby="segment-item-3"
          >
            <Aichat />
          </div>
        </div>
      </div>
      {/* History Section */}
      <div className="w-full lg:w-1/2 lg:p-10 ">
        <Responsehistory />
      </div>
    </div>
  );
}
