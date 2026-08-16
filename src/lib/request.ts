"use server";

import { headers } from "next/headers";

export async function getRequestHeaders(): Promise<Headers> {
  return await headers();
}
