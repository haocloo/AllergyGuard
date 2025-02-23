// "use client";

// import { useEffect } from "react";
// import { delete_cookie } from "@/services/server";

// export function DeleteCookie({ cookieName }: { cookieName: string }) {
//   if (!cookieName) {
//     return <></>;
//   }
//   useEffect(() => {
//     const clearCookie = async () => {
//       try {
//         await delete_cookie(cookieName);
//         window.location.reload();
//         window.location.href = "/auth";
//       } catch (error) {
//         alert("Error deleting cookie: " + error);
//       }
//     };
//     clearCookie();
//   }, []);

//   return <></>;
// }
