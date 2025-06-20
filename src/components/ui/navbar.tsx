"use client";
import { useTheme } from "next-themes";
import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FiMoon } from "react-icons/fi";
import { MdOutlineClear, MdOutlineWbSunny } from "react-icons/md";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mx-auto">
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap container mx-auto w-full rounded-lg py-2 bg-[#040918] text-sm  dark:bg-white">
        <nav className=" w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <a
              className="flex-none text-xl font-semibold text-white focus:outline-none focus:opacity-80 dark:text-neutral-800"
              href="#"
            >
              Secret Key Generator
            </a>
            <div className="sm:hidden">
              <button
                type="button"
                className="hs-collapse-toggle relative size-7 flex justify-center dark:text-gray-800 text-white items-center gap-2 rounded-lg border border-gray-700 font-medium bg-gray-800   shadow-sm align-middle hover:bg-gray-700/20 focus:outline-none focus:bg-gray-700/20 text-sm  "
                id="hs-navbar-dark-collapse"
                aria-expanded="false"
                aria-controls="hs-navbar-dark"
                aria-label="Toggle navigation"
                data-hs-collapse="#hs-navbar-dark"
              >
                <AiOutlineMenu className="text-lg  hs-collapse-open:hidden shrink-0 size-4" />
                <MdOutlineClear className="hs-collapse-open:block text-xl   hidden shrink-0 " />
                <span className="sr-only">Toggle</span>
              </button>
            </div>
          </div>
          <div
            id="hs-navbar-dark"
            className="hidden hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block"
            aria-labelledby="hs-navbar-dark-collapse"
          >
            <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
              <a
                className="font-medium text-white focus:outline-none dark:text-black"
                href="https://larrykingstonedocs.vercel.app"
                target="_blank"
                aria-current="page"
              >
                Documentation
              </a>
              <a
                className="font-medium text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 dark:text-neutral-500 dark:hover:text-neutral-400 dark:focus:text-neutral-400"
                href="https://github.com/digitalterrene"
                target="_blank"
              >
                Github
              </a>
              <a
                className="font-medium text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 dark:text-neutral-500 dark:hover:text-neutral-400 dark:focus:text-neutral-400"
                href="https://larrykingstone.com"
                target="_blank"
              >
                Developer
              </a>
              <div className="p-2">
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked === true) {
                        setTheme("dark");
                      } else {
                        setTheme("light");
                      }
                    }}
                    id="hs-default-switch-with-icons"
                    className="peer relative w-[3.25rem] h-7 p-px bg-gray-100 dark:bg-[#040918] border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200   disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-[#040918] checked:border-[#040918] focus:checked:border-[#040918]   dark:border-[#040918] dark:checked:bg-[#040918]  dark:focus:ring-offset-[#040918]
                    before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-neutral-400 dark:checked:before:bg-blue-200"
                  />
                  <label
                    htmlFor="hs-default-switch-with-icons"
                    className="sr-only"
                  >
                    Switch
                  </label>
                  <span className="peer-checked:text-white text-gray-500 size-6 absolute top-0.5 start-0.5 flex justify-center items-center pointer-events-none transition-colors ease-in-out duration-200 dark:text-neutral-500">
                    <MdOutlineWbSunny />
                  </span>
                  <span className="peer-checked:text-blue-600 text-gray-500 size-6 absolute top-0.5 end-0.5 flex justify-center items-center pointer-events-none transition-colors ease-in-out duration-200 dark:text-neutral-500">
                    <FiMoon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
