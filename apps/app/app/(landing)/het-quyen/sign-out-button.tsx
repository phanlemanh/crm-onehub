"use client";

import { Button } from "@crm/ui/components/button";
import { signOutAndRedirect } from "@/lib/sign-out";

export function SignOutButton({ label, loi }: { label: string; loi: string }) {
	return <Button onClick={() => signOutAndRedirect(loi)}>{label}</Button>;
}
