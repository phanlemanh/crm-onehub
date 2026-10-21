"use client";

import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";

export function CuonToiNeo({ id }: { id: string }) {
	useMountEffect(() => {
		if (window.location.hash !== `#${id}`) return;
		document.getElementById(id)?.scrollIntoView({ block: "start" });
	});
	return null;
}
