"use client";

import { Card, CardContent, CardHeader } from "@crm/ui/components/card";
import { useMessages } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";

const KHUNG_XUONG = {
	bang: { hang: 8 },
	danhSach: { dong: 6 },
	the: { the: 2, hang: 3 },
	tongQuan: { oSo: 4, hang: 5 },
	chiTiet: { doan: 3 },
} as const;

export type HinhKhungXuong =
	| "bang"
	| "danh-sach"
	| "the"
	| "tong-quan"
	| "chi-tiet";

const day = (so: number, tien: string) =>
	Array.from({ length: so }, (_, i) => `${tien}-${i}`);

function Bang() {
	return (
		<div className="flex flex-col gap-3">
			<div data-khung-hang="thanh-cong-cu" className="flex items-center gap-2">
				<Skeleton className="h-8 w-full max-w-xs" />
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-8 w-24" />
			</div>
			<div className="flex flex-col gap-1 overflow-hidden rounded-lg border">
				<Skeleton data-khung-hang="dau-bang" className="h-9 w-full rounded-none" />
				{day(KHUNG_XUONG.bang.hang, "hang").map((k) => (
					<Skeleton
						data-khung-hang="hang"
						key={k}
						className="h-9 w-full rounded-none"
					/>
				))}
			</div>
		</div>
	);
}

function DanhSach() {
	return (
		<div className="flex flex-col gap-2">
			{day(KHUNG_XUONG.danhSach.dong, "dong").map((k) => (
				<div
					data-khung-hang="dong"
					key={k}
					className="flex items-center gap-3 rounded-lg border p-3"
				>
					<Skeleton className="size-8 shrink-0" />
					<div className="flex min-w-0 flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-48 max-w-full" />
						<Skeleton className="h-3 w-72 max-w-full" />
					</div>
				</div>
			))}
		</div>
	);
}

function The({ cot }: { cot: 1 | 2 }) {
	return (
		<div className={cot === 2 ? "grid gap-4 md:grid-cols-2" : "flex flex-col gap-6"}>
			{day(KHUNG_XUONG.the.the, "the").map((k) => (
				<Card data-khung-hang="the" key={k}>
					<CardHeader>
						<Skeleton className="h-5 w-40 max-w-full" />
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						{day(KHUNG_XUONG.the.hang, `${k}-hang`).map((h) => (
							<div data-khung-hang="hang" key={h} className="flex flex-col gap-2">
								<Skeleton className="h-4 w-32 max-w-full" />
								<Skeleton className="h-8 w-full" />
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function TongQuan() {
	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{day(KHUNG_XUONG.tongQuan.oSo, "o-so").map((k) => (
					<Skeleton data-khung-hang="o-so" key={k} className="h-24 w-full rounded-lg" />
				))}
			</div>
			<Card>
				<CardContent className="flex flex-col gap-1">
					{day(KHUNG_XUONG.tongQuan.hang, "hang").map((k) => (
						<Skeleton data-khung-hang="hang" key={k} className="h-9 w-full" />
					))}
				</CardContent>
			</Card>
		</div>
	);
}

function TieuDeGiuCho() {
	return (
		<div data-khung-hang="tieu-de" className="flex flex-col gap-3">
			<Skeleton className="h-8 w-64 max-w-full" />
			<Skeleton className="h-4 w-96 max-w-full" />
			<Skeleton className="h-8 w-48 max-w-full md:hidden" />
		</div>
	);
}

function ChiTiet() {
	return (
		<div className="flex flex-col gap-6">
			<TieuDeGiuCho />
			{day(KHUNG_XUONG.chiTiet.doan, "doan").map((k) => (
				<div data-khung-hang="doan" key={k} className="flex flex-col gap-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-11/12" />
					<Skeleton className="h-4 w-8/12" />
				</div>
			))}
		</div>
	);
}

function Than({ hinh, cot }: { hinh: HinhKhungXuong; cot: 1 | 2 }) {
	if (hinh === "bang") return <Bang />;
	if (hinh === "danh-sach") return <DanhSach />;
	if (hinh === "the") return <The cot={cot} />;
	if (hinh === "tong-quan") return <TongQuan />;
	return <ChiTiet />;
}

export function KhungXuong({
	hinh,
	cot = 1,
	coTieuDe = false,
}: {
	hinh: HinhKhungXuong;
	cot?: 1 | 2;
	coTieuDe?: boolean;
}) {
	const msg = useMessages();
	return (
		<div data-khung-xuong={hinh} aria-busy="true" className="min-w-0">
			<div aria-hidden="true" className="flex flex-col gap-6">
				{coTieuDe && hinh !== "chi-tiet" ? <TieuDeGiuCho /> : null}
				<Than cot={cot} hinh={hinh} />
			</div>
			<span role="status" aria-live="polite" className="sr-only">
				{msg.khungXuong.dangTai}
			</span>
		</div>
	);
}
