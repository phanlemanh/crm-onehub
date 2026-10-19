import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import { requireSession } from "@/lib/session";
import { DanhSachThongBaoTrang } from "./danh-sach-thong-bao-trang";
import { KhungChoThongBao } from "./khung-cho";

export async function generateMetadata(): Promise<Metadata> {
	return { title: thongBaoMessages(await getLocale()).trang.tieuDe };
}

async function NoiDung() {
	await requireSession();
	return <DanhSachThongBaoTrang />;
}

export default async function ThongBaoPage() {
	const m = thongBaoMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungChoThongBao />}>
					<NoiDung />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}
