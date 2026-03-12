"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refId = searchParams.get("ref");
        if (refId) {
            // Store referral ID in cookie for 7 days
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            document.cookie = `typeflow_ref=${refId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
            console.log("[REFERRAL] Captured referrer ID:", refId);
        }
    }, [searchParams]);

    return null;
}
