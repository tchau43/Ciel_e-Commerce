import { CategoryData } from "@/types/dataTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CategoriesListProps {
  data: CategoryData[];
  // onCategoryChange: (selectedCategories: string[]) => void;
}

const CategoriesList = ({ data }: CategoriesListProps) => {
  const navigate = useNavigate();
  const [checkedCate, setCheckedCate] = useState<string[]>(
    // data.map((d) => d._id)
    []
  );

  const handleCheckboxChange = (cateId: string) => {
    setCheckedCate((c) => {
      const cateList = checkedCate.includes(cateId)
        ? checkedCate.filter((c) => c !== cateId)
        : [...checkedCate, cateId];

      // changeCateParams(cateList);

      return cateList;
    });
  };

  const changeCateParams = (cateList: string[]) => {
    const params = new URLSearchParams();
    cateList.forEach((c) => params.append("category", c));
    console.log("params.toString()", params.toString());
    navigate(`?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    changeCateParams(checkedCate);
    // onCategoryChange(checkedCate); // Pass the selected categories to the parent
  }, [checkedCate]);

  return (
    <>
      <div className="w-[20vh] 2xl:w-[200px] ">
        <input
          type="checkbox"
          id="category-all"
          className="hidden"
          checked={checkedCate.length === data.length}
          onChange={() => {
            if (checkedCate.length === data.length) {
              setCheckedCate([]);
              // changeCateParams([]);
            } else {
              setCheckedCate(data.map((c) => c._id));
              // console.log("checkedCate", checkedCate);
              // changeCateParams(checkedCate);
            }
          }}
        ></input>
        <label
          htmlFor="category-all"
          className={
            checkedCate.length === data.length
              ? `text-[rgba(213,106,54,1)]`
              : `text-white`
          }
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
            ></input>
            <label
              htmlFor={`category-${cate._id}`}
              className={
                checkedCate.includes(cate._id)
                  ? `text-[rgba(213,106,54,1)]`
                  : `text-white`
              }
            >
              {cate.name.toUpperCase()}
            </label>
          </div>
        ))}
      </div>
    </>
  );
};

export default CategoriesList;
