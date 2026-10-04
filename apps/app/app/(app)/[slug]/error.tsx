"use client";

import { TrangLoiTam } from "@/components/trang-loi-tam";

export default function LoiTrongKhung({
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	return (
		<main className="flex min-h-0 flex-1 items-center justify-center p-6">
			<TrangLoiTam retry={retry} />
		</main>
	);
}
