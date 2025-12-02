"use client"
import { useUserContext } from "@/contexts/userContext";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { address } = useUserContext();

    useEffect(() => {
        redirect("/d/profile/" + address);
    }, [address]);

    return (
        <p>Redirecting</p>
    )
}