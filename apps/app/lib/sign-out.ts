"use client";

import { signOut } from "@crm/auth/client";
import { toast } from "sonner";

function baoLoi(loiMacDinh: string, error: unknown) {
	console.error("Sign out failed", error);
	toast.error(loiMacDinh);
}

export async function signOutAndRedirect(loiMacDinh: string) {
	try {
		const { error } = await signOut();
		if (error) {
			baoLoi(loiMacDinh, error);
			return;
		}
	} catch (error) {
		baoLoi(loiMacDinh, error);
		return;
	}

	window.location.assign("/sign-in");
}
