import http from "../utils/api/axios.ts";

export default class Base {
  http = async <TResponse, TVariables = any>(
    url: string,
    type: string,
    variables?: TVariables | null,
    options?: any
  ) => {
    return (http as any)[type](url, variables, options) as Promise<TResponse>;
  };
}
