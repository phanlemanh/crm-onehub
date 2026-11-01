"use client";

import { Sheet } from "@crm/ui/components/sheet";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { OTruongPhieu } from "@/components/crm/fields/kieu-truong";
import {
	type KhoaTruongOkr,
	truongKr,
	truongMucTieu,
} from "@/components/crm/record-sheet/truong-okr";
import {
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetSection,
} from "@/components/detail-sheet";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	KR,
	LOI,
	MUC_TIEU,
	NGAN_MAU,
	type NganMau,
	NHAN_NGAN,
	NHAN_TRANG,
	st,
	THANH_VIEN,
	TRANG_MAU,
	type TrangMau,
} from "./du-lieu";

const NHAN = {
	truongTen: "Tên",
	truongViSao: "Vì sao lúc này",
	truongNguoi: "Phụ trách",
	goiYViSao: "Vì sao mục tiêu này quan trọng lúc này",
};

function KhungMau({ nhan, children }: { nhan: string; children: ReactNode }) {
	return (
		<figure className="flex min-w-0 flex-col gap-2">
			<figcaption className="text-muted-foreground text-xs">{nhan}</figcaption>
			<div
				className="flex h-[38rem] w-full max-w-[30rem] flex-col overflow-hidden rounded-lg border bg-background"
				data-ngan-mau=""
			>
				<Sheet open modal={false}>
					{children}
				</Sheet>
			</div>
		</figure>
	);
}

function NganThu({ ngan, trang }: { ngan: NganMau; trang: TrangMau }) {
	const [mt, datMt] = useState(MUC_TIEU);
	const [kr, datKr] = useState(KR);
	const vo = useRef<HTMLDivElement>(null);
	const daBao = useRef(false);
	const dangLuu = (khoa: KhoaTruongOkr) =>
		trang === "dang-luu" && khoa === "title";
	const luu = (khoa: KhoaTruongOkr, giaTri: string) => {
		if (ngan === "muc-tieu") {
			if (khoa === "ownerUserId") {
				const chu = THANH_VIEN.find((n) => n.id === giaTri);
				if (chu) datMt({ ...mt, owner: chu });
				return;
			}
			datMt({ ...mt, [khoa === "title" ? "title" : "whyNow"]: giaTri });
			return;
		}
		if (khoa === "title") datKr({ ...kr, title: giaTri });
	};
	useEffect(() => {
		if (trang === "dang-sua") {
			vo.current
				?.querySelector<HTMLElement>("button, [role='button']")
				?.click();
		}
		if (trang === "loi" && !daBao.current) {
			daBao.current = true;
			toast.error(LOI[ngan]);
		}
	}, [trang, ngan]);
	const chung = { nhan: NHAN, nguoiDung: THANH_VIEN, luu, dangLuu };
	const truong =
		ngan === "muc-tieu"
			? truongMucTieu(mt, chung)
			: truongKr(kr, { ...chung, suaNguoi: true });
	return (
		<>
			<DetailSheetHeader
				title={
					<span translate="no">
						{ngan === "muc-tieu" ? mt.title : kr.title}
					</span>
				}
				description={ngan === "muc-tieu" ? mt.donVi : kr.mucTieu}
			/>
			<DetailSheetBody>
				<div ref={vo} data-khu="chi-tiet" data-st={st(ngan, trang)}>
					<DetailSheetSection title="Chi tiết">
						{truong.map((t) => (
							<OTruongPhieu key={t.khoa} moTa={t} />
						))}
					</DetailSheetSection>
				</div>
			</DetailSheetBody>
		</>
	);
}

function timTrang(state: string): { ngan: NganMau; trang: TrangMau } {
	for (const ngan of NGAN_MAU)
		for (const trang of TRANG_MAU)
			if (st(ngan, trang) === state) return { ngan, trang };
	return { ngan: "muc-tieu", trang: "xem" };
}

export function SuaTaiChoMucTieuVaKrMau({ state }: { state: string }) {
	const { ngan, trang } = timTrang(state);
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Sửa mục tiêu và KR ngay trong ngăn</PageShellTitle>
					<PageShellDescription>
						Tên, «Vì sao lúc này» và người phụ trách sửa tại chỗ trong ngăn,
						cùng ô với ngăn deal.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<KhungMau
					key={state}
					nhan={`${NHAN_NGAN[ngan]} — ${NHAN_TRANG[trang]}`}
				>
					<NganThu ngan={ngan} trang={trang} />
				</KhungMau>
			</PageShellContent>
		</PageShell>
	);
}
