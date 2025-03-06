import React from "react";
import Navbar from "./Navbar";
import { NavLink } from "react-router-dom";
import { clearAuthCredentials } from "@/utils/authUtil";

const Header: React.FC = () => {
  const handleLogout = () => {
    clearAuthCredentials();
  };
  return (
    <div className="h-max w-screen m-0 relative">
      <div className="right-4 top-1 w-fit absolute ">
        <NavLink
          to="/"
          className="hover:underline hover:text-blue-500 "
          onClick={handleLogout}
        >
          Logout
        </NavLink>
      </div>
      <div className="h-full flex flex-col items-center my-8 gap-4">
        <img
          className="h-16"
          src="https://s3-alpha-sig.figma.com/img/7a66/0317/2db7863c7e6ba009724368c27ced875b?Expires=1742169600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=YiRNwVtHQpbm0o4dslvVv~2asb338man6fzg7NJvB2vGPp~pk3XL-5xuG20dY8NPgn21HcxKUYA~zgf6HjHDMnFDUcvswiPUgX7edN0~vWCmdp3dftPb3dmASinsOvyyOqDn4G99p8v6g-cxKIWh~5NGc9OIrflESmrV7aUs2H8HgKvIij7XPzy0Bw5uAQq5rnz6lK9iehwcCjP-IoGjw8OTWSZRhKQO16USKTUQKuC29k5bxbzUT0Bpg46ifuJ5nk4Qf~pjZYQBqiS4XcwMv9xrgWmJyJdJ-V1Vf8SLEI4ySF91SNUc9LT~9G3lCSyq2QTtS055gRDn5KIFFXCpMA__"
        ></img>
        <Navbar />
      </div>
    </div>
  );
};

export default Header;
