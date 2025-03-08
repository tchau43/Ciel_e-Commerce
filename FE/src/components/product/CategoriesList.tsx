// import { CategoryData } from "@/types/dataTypes";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// interface CategoriesListProps {
//   data: CategoryData[];
//   queryParams: URLSearchParams | null;
//   setQueryParams: React.Dispatch<React.SetStateAction<URLSearchParams | null>>; // onCategoryChange: (selectedCategories: string[]) => void;
// }

// const CategoriesList = ({
//   data,
//   setQueryParams,
//   queryParams,
// }: CategoriesListProps) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [checkedCate, setCheckedCate] = useState<string[]>([]);
//   const [searchParams, setSearchParams] = useSearchParams();

//   const handleCheckboxChange = (cateId: string) => {
//     setCheckedCate((c) => {
//       const cateIdList = checkedCate.includes(cateId)
//         ? checkedCate.filter((c) => c !== cateId)
//         : [...checkedCate, cateId];

//       return cateIdList;
//     });
//     changeParams(checkedCate);
//   };

//   const extractParams = () => {
//     const params = new URLSearchParams(location.search);
//     const categoriesFromURL = params.getAll("category");
//     return categoriesFromURL; // Returns an array of category values from the URL
//   };

//   const changeParams = async (cateIdList: string[]) => {
//     await setQueryParams((p) => {
//       const newParams = new URLSearchParams();
//       cateIdList.forEach((c) => newParams.append("category", c));
//       return newParams;
//     });
//     navigate(`?${queryParams?.toString()}`, { replace: true });
//     // setSearchParams(new URLSearchParams());

//     // const params = new URLSearchParams(window.location.search);
//     // console.log("params", params.toString());
//     // const categories = params.getAll("category"); // Get all values of "category" param
//     // console.log("categories", categories);
//     // // if (categories.length > 0) {
//     // categories.forEach(setCheckedCate(c=>[]));
//     // }
//   };

//   // useEffect(() => {
//   //   changeParams(checkedCate);
//   // }, [checkedCate]);

//   return (
//     <>
//       <div className="w-[20vh] 2xl:w-[200px] ">
//         <input
//           type="checkbox"
//           id="category-all"
//           className="hidden"
//           checked={checkedCate.length === data.length}
//           onChange={() => {
//             if (checkedCate.length === data.length) {
//               setCheckedCate([]);
//               // changeCateParams([]);
//             } else {
//               setCheckedCate(data.map((c) => c._id));
//               // console.log("checkedCate", checkedCate);
//               // changeCateParams(checkedCate);
//             }
//           }}
//         ></input>
//         <label
//           htmlFor="category-all"
//           className={
//             checkedCate.length === data.length
//               ? `text-[rgba(213,106,54,1)]`
//               : `text-white`
//           }
//         >
//           ALL
//         </label>
//         {data.map((cate) => (
//           <div key={cate._id}>
//             <input
//               type="checkbox"
//               id={`category-${cate._id}`}
//               checked={checkedCate.includes(cate._id)}
//               onChange={() => handleCheckboxChange(cate._id)}
//               className="hidden"
//             ></input>
//             <label
//               htmlFor={`category-${cate._id}`}
//               className={
//                 checkedCate.includes(cate._id)
//                   ? `text-[rgba(213,106,54,1)]`
//                   : `text-white`
//               }
//             >
//               {cate.name.toUpperCase()}
//             </label>
//           </div>
//         ))}
//       </div>
//     </>
//   );
// };

// export default CategoriesList;

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
            : "text-white"
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
                : "text-white" + "hover:cursor-pointer"
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
