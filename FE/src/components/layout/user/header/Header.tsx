import React from "react";
import Navbar from "./Navbar";

const Header: React.FC = () => {
  return (
    <div className="!h-[90px] w-full border-b-[1px] bg-primary">
      <div className="justify-between items-center flex h-full mx-[20px]">
        <div className="w-[60px] h-[60px] rounded-full bg-slate-500 flex items-center justify-center">
          <img
            src="/images/logo.png"
            alt="logo"
            className="object-contain w-full h-full rounded-full"
          />
        </div>
        <Navbar />
      </div>
    </div>
  );
};

export default Header;
