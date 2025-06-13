import { Category } from "@/types/dataTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CategoriesListProps {
  data: Category[];
  queryParams: string | null;
  setQueryParams: React.Dispatch<React.SetStateAction<string>>;
}

const CategoriesList = ({
  data,
  setQueryParams,
  queryParams,
}: CategoriesListProps) => {
  const navigate = useNavigate();
  const [selectedCate, setSelectedCate] = useState<string | null>(null);

  const handleRadioChange = (cateId: string | null) => {
    setSelectedCate(cateId);
    changeCateParams(cateId ? [cateId] : []);
  };

  const changeCateParams = (cateList: string[]) => {
    const params = new URLSearchParams(queryParams || "");
    params.delete("category");
    cateList.forEach((c) => params.append("category", c));
    const newParams = params.toString();
    setQueryParams(newParams);
    navigate(`?${newParams}`, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(queryParams || "");
    const newCheckedCate = params.getAll("category");
    if (newCheckedCate.length === 0) {
      setSelectedCate(null);
    } else {
      setSelectedCate(newCheckedCate[0]);
    }
  }, [queryParams]);

  return (
    <div className="flex flex-row items-center gap-2 overflow-x-auto w-full pl-0 py-1 scrollbar-thin scrollbar-thumb-ch-blue/30 scrollbar-track-transparent">
      <input
        type="radio"
        id="category-all"
        name="category-radio"
        className="hidden"
        checked={selectedCate === null}
        onChange={() => handleRadioChange(null)}
      />
      <label
        htmlFor="category-all"
        className={`px-3 py-1 rounded-full border-2 border-blue-600 bg-white text-base font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer mr-1
          ${
            selectedCate === null
              ? "text-pink-600 border-pink-600 bg-pink-50"
              : "text-blue-800 hover:text-pink-600 hover:border-pink-600 hover:bg-pink-50"
          }
        `}
      >
        ALL
      </label>
      {data.map((cate) => (
        <div key={cate._id} className="inline-block">
          <input
            type="radio"
            id={`category-${cate._id}`}
            name="category-radio"
            checked={selectedCate === cate._id}
            onChange={() => handleRadioChange(cate._id)}
            className="hidden"
          />
          <label
            htmlFor={`category-${cate._id}`}
            className={`px-3 py-1 rounded-full border-2 border-blue-600 bg-white text-base font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer mr-1
              ${
                selectedCate === cate._id
                  ? "text-pink-600 border-pink-600 bg-pink-50"
                  : "text-blue-800 hover:text-pink-600 hover:border-pink-600 hover:bg-pink-50"
              }
            `}
          >
            {cate.name.toUpperCase()}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;
