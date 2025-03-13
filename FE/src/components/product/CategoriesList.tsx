import { CategoryData } from "@/types/dataTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CategoriesListProps {
  data: CategoryData[];
  queryParams: string | null;
  setQueryParams: React.Dispatch<React.SetStateAction<string | null>>;
}

const CategoriesList = ({
  data,
  setQueryParams,
  queryParams,
}: CategoriesListProps) => {
  const navigate = useNavigate();
  const [checkedCate, setCheckedCate] = useState<string[]>([]);

  // When a checkbox is toggled, update checkedCate and update the URL accordingly.
  const handleCheckboxChange = (cateId: string) => {
    setCheckedCate((prev) => {
      const newCheckedCate = prev.includes(cateId)
        ? prev.filter((id) => id !== cateId)
        : [...prev, cateId];
      changeCateParams(newCheckedCate);
      return newCheckedCate;
    });
  };

  // Build query string and update URL.
  const changeCateParams = (cateList: string[]) => {
    const params = new URLSearchParams();
    cateList.forEach((c) => params.append("category", c));
    const paramsStr = params.toString();
    console.log("Updated query params:", paramsStr);
    // Update parent's queryParams state and URL
    setQueryParams(paramsStr);
    navigate(`?${paramsStr}`, { replace: true });
  };

  // Optionally, sync local state with queryParams when they change externally
  useEffect(() => {
    // Always parse queryParams (even if empty)
    const params = new URLSearchParams(queryParams || "");
    const newCheckedCate = params.getAll("category");
    setCheckedCate(newCheckedCate);
  }, [queryParams]); // Update when queryParams changes

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (checkedCate.length === data.length) {
      setCheckedCate([]);
      changeCateParams([]);
    } else {
      const allIds = data.map((c) => c._id);
      setCheckedCate(allIds);
      changeCateParams(allIds);
    }
  };

  return (
    <div className="w-[20vh] 2xl:w-[200px] pl-4">
      <input
        type="checkbox"
        id="category-all"
        className="hidden"
        checked={checkedCate.length === data.length}
        onChange={handleSelectAll}
      />
      <label
        htmlFor="category-all"
        // className={
        //   checkedCate.length === data.length
        //     ? "text-[rgba(213,106,54,1)]"
        //     : "text-white" + "hover:cursor-pointer"
        // }
        className={`${
          checkedCate.length === data.length
            ? "text-[rgba(213,106,54,1)]"
            : "text-black"
        } hover:cursor-pointer`}
      >
        ALL
      </label>
      {data.map((cate) => (
        <div key={cate._id}>
          <input
            type="checkbox"
            id={`category-${cate._id}`}
            checked={checkedCate.includes(cate._id)}
            onChange={() => handleCheckboxChange(cate._id)}
            className="hidden"
          />
          <label
            htmlFor={`category-${cate._id}`}
            className={`${
              checkedCate.includes(cate._id)
                ? "text-[rgba(213,106,54,1)]"
                : "text-black" + "hover:cursor-pointer"
            } hover:cursor-pointer`}
          >
            {cate.name.toUpperCase()}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;
