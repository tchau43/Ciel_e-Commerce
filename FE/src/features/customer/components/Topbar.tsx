import { RiFlightTakeoffFill } from "react-icons/ri";
import { MdLanguage } from "react-icons/md";
import { MdOutlineExplore } from "react-icons/md";

const Topbar = () => {
  return (
    <>
      <div className="bg-[rgb(216,240,236,1)] w-screen flex justify-between h-8 items-center px-20">
        <div className="flex gap-4">
          <MdOutlineExplore className="size-5" />
          <MdLanguage className="size-5" />
          <RiFlightTakeoffFill className="size-5" />
        </div>
        <div className="bg-[rgba(213,106,54,1)] h-full content-center px-5">
          Liên hệ tư vấn: 0392031915
        </div>
      </div>
    </>
  );
};

export default Topbar;
