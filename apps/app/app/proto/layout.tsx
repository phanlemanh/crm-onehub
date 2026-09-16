import { notFound } from "next/navigation";
import { protoMoDuoc } from "@/lib/proto-gate";

export default function ProtoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	if (!protoMoDuoc()) notFound();

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			{children}
		</main>
	);
}
