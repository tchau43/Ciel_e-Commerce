import React from "react";
import CLogoImage from "@assets/CLogo.png";

const CLogo: React.FC = () => {
  return (
    <img src={CLogoImage} alt="CLogo" className="w-full h-full object-cover" />
  );
};

export default CLogo;
