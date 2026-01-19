import { baseURL } from "./fnUtils";
import { UserSchema } from "./schema";
import type z from "zod";
type UseFetch = {
  url: RequestInfo;
  options?: RequestInit;
  setState: (data: z.infer<typeof UserSchema> | null) => void;
};
export const apiFetch = async ({
  url: input,
  options: init = {},
  setState,
}: UseFetch) => {
  const options: RequestInit = {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ? init.headers : {}),
    },
  };

  const url = new URL(`${baseURL}${input}`);

  let res = await fetch(url, options);
  if (res.status !== 401) return res;

  const refresh = await fetch(`${baseURL}/v1/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  if (!refresh.ok) {
    setState(null);
    throw new Error("Session Expired");
  }

  const data = (await refresh.json()) as {
    message: string;
    user: { _id: string; username: string; token: string; email: string };
  };

  setState(data.user);

  res = await fetch(url, {
    method: "POST",
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${data.user.token}`,
    },
  });
  return res;
};
