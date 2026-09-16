"use client";

import { Button } from "@crm/ui/components/button";
import { signOutAndRedirect } from "@/lib/sign-out";

export function SignOutButton({ label }: { label: string }) {
	return <Button onClick={() => signOutAndRedirect(label)}>{label}</Button>;
}
