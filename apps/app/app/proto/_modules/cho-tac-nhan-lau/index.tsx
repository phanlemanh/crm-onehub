"use client";

import { Button } from "@crm/ui/components/button";
import { LocaleProvider, useLocale } from "@crm/ui/components/locale-provider";
import { useState } from "react";
import { TheDangDung } from "@/components/agent-builder/the-dang-dung";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { ChuongThongBaoKhung } from "@/components/thong-bao/chuong-thong-bao";
import { troChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";
import { cauThongBao } from "@/lib/thong-bao/cau";
import {
	DA_TROI_MS,
	DA_XONG,
	DANG_GHI,
	dongTacNhan,
	HREF_CHAT,
	STATE,
} from "./du-lieu";

const BUOC_VAT = [
	null,
	"agent/instructions.md",
	"agent/manifest.json",
	"agent/README.md",
] as const;

const TEN_MAU = "Tóm tắt deal mỗi sáng";

function TheMau({
	state,
}: {
	state: typeof STATE.duoiNguong | typeof STATE.trenNguong;
}) {
	const t = troChuyenMessages(useLocale());
	return (
		<TheDangDung
			buoc={t.man.buoc.map((nhan: string, index: number) => ({
				nhan,
				vat: BUOC_VAT[index] ?? null,
			}))}
			daXong={DA_XONG[state]}
			dangGhi={DANG_GHI[state]}
			daTroiMs={DA_TROI_MS[state]}
			chu={t.dung}
			nutDung={
				<Button variant="outline" size="sm">
					{t.dung.dungLai}
				</Button>
			}
		/>
	);
}

function ChuongMau({ chuaDoc }: { chuaDoc: boolean }) {
	const locale = useLocale();
	const [mo, setMo] = useState(true);
	const cau = (
		loai: "tac-nhan-xong" | "tac-nhan-can-tra-loi" | "tac-nhan-hong",
	) =>
		cauThongBao(locale, {
			loai,
			conversationId: "hoi-thoai-mau",
			luotId: "luot-mau",
			ten: TEN_MAU,
		});
	const homNay = dongTacNhan(
		{
			xong: cau("tac-nhan-xong"),
			canTraLoi: cau("tac-nhan-can-tra-loi"),
			hong: cau("tac-nhan-hong"),
		},
		chuaDoc,
	);
	return (
		<div className="flex h-12 items-center justify-end gap-1.5 border-b px-3">
			<ChuongThongBaoKhung
				dangDocHet={false}
				homNay={homNay}
				hrefTatCa={HREF_CHAT}
				onDocHet={() => {}}
				onMo={() => {}}
				onOpenChange={setMo}
				onThuLai={() => {}}
				open={mo}
				soChuaDoc={chuaDoc ? homNay.length : 0}
				tranSo={99}
				trangThai="xong"
				truocDo={[]}
			/>
		</div>
	);
}

function Than({ state }: { state: string }) {
	const t = troChuyenMessages(useLocale());
	if (state === STATE.chuongBaLoai) return <ChuongMau chuaDoc />;
	if (state === STATE.chuongDaDoc) return <ChuongMau chuaDoc={false} />;
	const the = state === STATE.trenNguong ? STATE.trenNguong : STATE.duoiNguong;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.man.boDung}</PageShellTitle>
					<PageShellDescription>{TEN_MAU}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<TheMau state={the} />
			</PageShellContent>
		</PageShell>
	);
}

export function ChoTacNhanLauMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<Than state={state} />
		</LocaleProvider>
	);
}
