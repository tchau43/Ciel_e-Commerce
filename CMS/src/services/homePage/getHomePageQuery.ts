import CustomerHomePage from "@/repositories/customerPage/customerPage";
import { HomePageRes } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetHomePageQuery = (
  options?: any
): UseQueryResult<HomePageRes, Error> => {
  return useQuery({
    queryKey: ["homepageId"],
    queryFn: () => {
      return CustomerHomePage.getHomePageData(API_ENDPOINTS.CUSTOMER_HOME_PAGE);
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};
