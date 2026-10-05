"use client";

import { signOut } from "@crm/auth/client";
import { toast } from "sonner";

export async function signOutAndRedirect(loiMacDinh: string) {
	const ketQua = await signOut().catch((loi: Error) => ({ error: loi }));

	if (ketQua.error) {
		console.error("Sign out failed", ketQua.error);
		toast.error(loiMacDinh);
		return;
	}

	window.location.assign("/sign-in");
}
