// import React,{ createContext, useState } from "react";

// interface User{
//     name: string;
//     email: string;
//     password: string;
// }

// export const Auth = createContext();

// export default function AuthContext(props) {
//   const [loading, setLoading] = useState(true);
//   const [auth, setAuth] = useState({
//     isAuthenticated: false,
//     user: {
//       name: "",
//       email: "",
//     },
//   });

//   return (
//     <>
//       <Auth.Provider value={{ auth, setAuth, loading, setLoading }}>
//         {props.children}
//       </Auth.Provider>
//     </>
//   );
// }
