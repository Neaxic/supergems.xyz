"use client"

import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function makeAPICall<T>(invoke: () => Promise<any>): Promise<T | undefined> {
    try {
        const resp = await invoke();
        if (resp.error) {
            console.log("Error in API call", resp);
            toast(resp.error);
        } else {
            return resp as T;
        }
    } catch (error) {
        console.error("Exception in API call", error);
        toast("Exception in API call");
    }
    return undefined;
}