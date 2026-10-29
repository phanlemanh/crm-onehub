"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { FieldDescription } from "@crm/ui/components/field";
import {
	KaraDock,
	KaraDockBody,
	KaraDockFooter,
	KaraDockHeader,
} from "@crm/ui/components/kara/dock";
import { KaraState } from "@crm/ui/components/kara/state";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useState } from "react";
import { DetailSheet, DetailSheetHeader } from "@/components/detail-sheet";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { CotBen, type HinhKara } from "./cot-ben";
import {
	BO,
	DIEM_DA_NHAN,
	DIEM_MOI,
	type DiemKiem,
	type DongMucTieu,
	MT_CONG_BO,
	MT_DANG_GO,
	MT_MOI,
	MT_MOI_DA_NHAN,
	MT_TRONG,
} from "./du-lieu";
import { NganTheoDoi } from "./ngan-theo-doi";
import { TaiLieuBo } from "./tai-lieu";

type Hinh = {
	muc: DongMucTieu[];
	diem: DiemKiem[];
	kara: HinhKara;
	trong?: boolean;
	hep?: boolean;
	hoiCongBo?: boolean;
	daCongBo?: boolean;
	chiXem?: boolean;
	tai?: "dang" | "loi";
	noi?: string;
	ngan?: "chip" | "chip-mo-tai-cho";
};

const HINH = {
	"ST-soan-trong": { muc: [MT_TRONG], diem: [], kara: "chua-doc", trong: true },
	"ST-soan-dang-go": { muc: [MT_DANG_GO], diem: DIEM_MOI, kara: "chua-doc" },
	"ST-soan-kara-dang-doc": { muc: [MT_MOI], diem: DIEM_MOI, kara: "dang-doc" },
	"ST-soan-co-gop-y": { muc: [MT_MOI], diem: DIEM_MOI, kara: "co-gop-y" },
	"ST-soan-da-nhan-gop-y": {
		muc: [MT_MOI_DA_NHAN],
		diem: DIEM_DA_NHAN,
		kara: "da-nhan-mot",
		noi: "mt-1",
	},
	"ST-soan-co-muc-da-cong-bo": {
		muc: [MT_CONG_BO, MT_MOI_DA_NHAN],
		diem: DIEM_DA_NHAN,
		kara: "khong-co",
	},
	"ST-soan-kara-tat": { muc: [MT_MOI], diem: DIEM_MOI, kara: "tat" },
	"ST-soan-hoi-cong-bo": {
		muc: [MT_CONG_BO, MT_MOI_DA_NHAN],
		diem: DIEM_DA_NHAN,
		kara: "khong-co",
		hoiCongBo: true,
	},
	"ST-soan-da-cong-bo": {
		muc: [MT_CONG_BO, { ...MT_MOI_DA_NHAN, trangThai: "cong-bo" }],
		diem: DIEM_DA_NHAN,
		kara: "khong-co",
		daCongBo: true,
	},
	"ST-soan-chi-xem": {
		muc: [MT_CONG_BO],
		diem: [],
		kara: "chua-doc",
		chiXem: true,
	},
	"ST-soan-dang-tai": { muc: [], diem: [], kara: "chua-doc", tai: "dang" },
	"ST-soan-loi-tai": { muc: [], diem: [], kara: "chua-doc", tai: "loi" },
	"ST-soan-dien-thoai": {
		muc: [MT_MOI],
		diem: DIEM_MOI,
		kara: "co-gop-y",
		hep: true,
	},
	"ST-ngan-mot-chip": { muc: [], diem: [], kara: "co-gop-y", ngan: "chip" },
	"ST-ngan-chip-mo-tai-cho": {
		muc: [],
		diem: [],
		kara: "co-gop-y",
		ngan: "chip-mo-tai-cho",
	},
} satisfies Record<string, Hinh>;

function laHinh(s: string): s is keyof typeof HINH {
	return s in HINH;
}

const CHU = {
	nen: "Mục tiêu",
	nenMoTa: "Bộ OKR của từng đơn vị trong chu kỳ đang chọn.",
	meta: (n: number) =>
		n === 0 ? "Không có mục tiêu nháp" : `${n} mục tiêu nháp · tự lưu`,
	congBo: (n: number) => (n === 0 ? "Công bố" : `Công bố ${n} mục tiêu`),
	congBoMoTa:
		"Mục tiêu còn thiếu KR hay thiếu đích ở lại Nháp. Điểm chất lượng không chặn công bố.",
	hoiTieuDe: (n: number) => `Công bố ${n} mục tiêu?`,
	hoiThan:
		"Khởi điểm của mọi KR sẽ bị khoá, và các mục tiêu được tính vào số đếm của đơn vị.",
	hoiNut: "Công bố",
	hoiThoi: "Huỷ",
	daCongBo: "Đã công bố 1 mục tiêu",
	daCongBoMoTa:
		"Mục tiêu đã vào màn theo dõi của Bộ OKR. Sửa nội dung thì quay lại Soạn bất cứ lúc nào.",
	veTheoDoi: "Về màn theo dõi",
	chiXem:
		"Bạn xem được bộ này nhưng không sửa được: chỉ trưởng đơn vị và quản trị soạn bộ OKR.",
	loi: "Chưa mở được bộ OKR",
	loiMoTa: "Máy chủ không trả lời. Nội dung bạn đã lưu vẫn còn.",
	tabBo: "Bộ OKR",
	tabCot: "Chất lượng và Kara",
} as const;

function soNhap(muc: DongMucTieu[]): number {
	return muc.filter((m) => m.trangThai === "nhap" && m.ten !== "").length;
}

function ChanCongBo({ h }: { h: Hinh }) {
	const n = soNhap(h.muc);
	if (h.chiXem || h.daCongBo) return null;
	return (
		<div className="flex flex-col gap-2">
			<FieldDescription>{CHU.congBoMoTa}</FieldDescription>
			<Button className="w-fit" disabled={n === 0} data-nut="cong-bo-bo">
				{CHU.congBo(n)}
			</Button>
		</div>
	);
}

function ThanTaiLieu({ h }: { h: Hinh }) {
	if (h.tai === "dang")
		return (
			<div className="flex flex-col gap-4" data-cho-tai="">
				<Skeleton className="h-6 w-2/3" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		);
	if (h.tai === "loi")
		return (
			<KaraState
				kind="error"
				what={CHU.loi}
				description={CHU.loiMoTa}
				onRetry={() => {}}
			/>
		);
	return (
		<div className="flex flex-col gap-6">
			{h.daCongBo ? (
				<KaraState
					kind="empty"
					title={CHU.daCongBo}
					description={CHU.daCongBoMoTa}
					action={
						<Button variant="outline" size="sm" type="button">
							{CHU.veTheoDoi}
						</Button>
					}
				/>
			) : null}
			{h.chiXem ? <FieldDescription>{CHU.chiXem}</FieldDescription> : null}
			<TaiLieuBo muc={h.muc} noi={h.noi} trong={h.trong} chiXem={h.chiXem} />
		</div>
	);
}

function OTaiLieu({ h, trongTab }: { h: Hinh; trongTab?: boolean }) {
	const n = soNhap(h.muc);
	return (
		<KaraDock
			side="fill"
			alone={trongTab}
			aria-label={CHU.tabBo}
			data-o="tai-lieu"
		>
			<KaraDockHeader>
				<span className="truncate font-medium text-sm">
					<span translate="no">{BO.donVi}</span> · {BO.chuKy}
				</span>
				{h.tai ? null : (
					<span className="shrink-0 text-muted-foreground text-xs">
						{CHU.meta(n)}
					</span>
				)}
			</KaraDockHeader>
			<KaraDockBody>
				<ThanTaiLieu h={h} />
			</KaraDockBody>
			{h.tai ? null : (
				<KaraDockFooter divided>
					<ChanCongBo h={h} />
				</KaraDockFooter>
			)}
		</KaraDock>
	);
}

function HaiTab({ h }: { h: Hinh }) {
	return (
		<KaraDock side="fill" alone>
			<Tabs
				defaultValue={h.hep ? "cot" : "bo"}
				className="flex min-h-0 flex-1 flex-col gap-0"
			>
				<TabsList
					variant="line"
					className="w-full shrink-0 justify-start border-b px-4"
				>
					<TabsTrigger value="bo">{CHU.tabBo}</TabsTrigger>
					<TabsTrigger value="cot">{CHU.tabCot}</TabsTrigger>
				</TabsList>
				<TabsContent value="bo" className="flex min-h-0 flex-1 flex-col">
					<OTaiLieu h={h} trongTab />
				</TabsContent>
				<TabsContent value="cot" className="flex min-h-0 flex-1 flex-col">
					<CotBen diem={h.diem} kara={h.kara} motMinh />
				</TabsContent>
			</Tabs>
		</KaraDock>
	);
}

function ThanKhung({ h }: { h: Hinh }) {
	if (h.hep) return <HaiTab h={h} />;
	const coCot = !h.chiXem && !h.tai;
	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col lg:hidden">
				<HaiTab h={h} />
			</div>
			<div className="hidden min-h-0 flex-1 lg:flex">
				<OTaiLieu h={h} />
				{coCot ? <CotBen diem={h.diem} kara={h.kara} /> : null}
			</div>
		</>
	);
}

const CHO_HOI_MS = 600;

export function CheDoSoanBoOkrMau({ state }: { state: string }) {
	const h: Hinh = HINH[laHinh(state) ? state : "ST-soan-co-gop-y"];
	const [hoi, datHoi] = useState(false);
	useMountEffect(() => {
		if (!h.hoiCongBo) return;
		const hen = setTimeout(() => datHoi(true), CHO_HOI_MS);
		return () => clearTimeout(hen);
	});
	return (
		<div data-che-do-soan={state}>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{CHU.nen}</PageShellTitle>
					<PageShellDescription>{CHU.nenMoTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			{h.ngan ? (
				<NganTheoDoi moTaiCho={h.ngan === "chip-mo-tai-cho"} />
			) : (
				<DetailSheet open onOpenChange={() => {}} size="kara">
					<DetailSheetHeader
						title={BO.tieuDe}
						description={
							<>
								<span translate="no">{BO.donVi}</span> · {BO.chuKy}
							</>
						}
					/>
					<div className="flex min-h-0 flex-1 flex-col">
						<ThanKhung h={h} />
					</div>
				</DetailSheet>
			)}
			<ConfirmDialog
				tone="default"
				tieuDe={CHU.hoiTieuDe(soNhap(h.muc))}
				than={CHU.hoiThan}
				nut={CHU.hoiNut}
				thoi={CHU.hoiThoi}
				open={hoi}
				onOpenChange={datHoi}
				onConfirm={() => {}}
				pending={false}
			/>
		</div>
	);
}
