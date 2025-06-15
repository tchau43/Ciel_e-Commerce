import http from "../utils/api/axios.ts";

// export default class Base<C, U> {
export default class Base {
  http = async <TResponse, TRequest = any>(
    url: string,
    type: string,
    variables: TRequest | null = null,
    options?: any
  ): Promise<TResponse> => {
    return (http as any)[type](url, variables, options);
  };
}
