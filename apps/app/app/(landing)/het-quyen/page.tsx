import type { Metadata } from "next";
import { getLocale } from "@/lib/locale/server";
import { thanhVienMessages } from "@/lib/messages/settings-thanh-vien";
import { SignOutButton } from "./sign-out-button";

export async function generateMetadata(): Promise<Metadata> {
	return { title: thanhVienMessages(await getLocale()).hetQuyen.tieuDe };
}

export default async function HetQuyenPage() {
	const t = thanhVienMessages(await getLocale()).hetQuyen;

	return (
		<main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 px-4">
			<h1 className="font-medium text-xl">{t.tieuDe}</h1>
			<p className="text-muted-foreground">{t.than}</p>
			<SignOutButton label={t.dangXuat} />
		</main>
	);
}
