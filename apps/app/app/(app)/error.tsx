"use client";

import { TrangLoiTam } from "@/components/trang-loi-tam";

export default function LoiNgoaiKhung({
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-6">
			<TrangLoiTam retry={retry} />
		</main>
	);
}
