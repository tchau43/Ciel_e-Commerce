import { CategoryData } from "@/types/dataTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CategoriesListProps {
  data: CategoryData[];
  queryParams: string | null;
  setQueryParams: React.Dispatch<React.SetStateAction<string>>;
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

  const changeCateParams = (cateList: string[]) => {
    const params = new URLSearchParams(queryParams || "");

    // Clear existing categories first
    params.delete("category");

    // Add new categories
    cateList.forEach((c) => params.append("category", c));

    // Preserve search text
    const newParams = params.toString();
    setQueryParams(newParams);
    navigate(`?${newParams}`, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(queryParams || "");
    const newCheckedCate = params.getAll("category");
    setCheckedCate(newCheckedCate);
  }, [queryParams]);

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
