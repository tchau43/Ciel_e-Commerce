import http from "../utils/api/axios.ts";

// export default class Base<C, U> {
export default class Base {
  http = async <T>(
    url: string,
    type: string,
    variables: T | null = null,
    options?: any
  ) => {
    return (http as any)[type](url, variables, options);
  };
}
