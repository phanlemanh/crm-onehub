import { notFound } from "next/navigation";

export default function ProtoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	if (process.env.PROTO_ROUTE !== "1") notFound();

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			{children}
		</main>
	);
}
