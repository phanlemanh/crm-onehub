"use client";

import { signOut } from "@crm/auth/client";
import { toast } from "sonner";

export async function signOutAndRedirect(loiMacDinh: string) {
	const { error } = await signOut();

	if (error) {
		toast.error(error.message ?? loiMacDinh);
		return;
	}

	window.location.assign("/sign-in");
}
