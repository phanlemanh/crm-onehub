"use client";

import { Button } from "@crm/ui/components/button";
import { Sheet } from "@crm/ui/components/sheet";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { type ReactNode, useState } from "react";
import {
	KhungNgan,
	KhungTaiLoi,
} from "@/components/crm/record-sheet/record-parts";
import {
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProse,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
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
	DOI_TUONG,
	type DoiTuong,
	MAU,
	type MauNgan,
	NHAN_TRANG,
	ST_SO_KR_CU,
	st,
	TRANG,
	type TrangNgan,
} from "./du-lieu";

const khongLamGi = () => {};

function OSo({ mau }: { mau: MauNgan }) {
	return (
		<DetailSheetStats>
			{mau.oSo.map((o) => (
				<DetailSheetStat key={o.nhan} label={o.nhan}>
					{o.giaTri}
				</DetailSheetStat>
			))}
		</DetailSheetStats>
	);
}

function TheNoiDung({ doan }: { doan: readonly string[] }) {
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<DetailSheetProse>
					{doan.map((d) => (
						<p key={d}>{d}</p>
					))}
				</DetailSheetProse>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

function LoiCua({ mau }: { mau: MauNgan }) {
	const { lyDo, tieuDe, moTa, nut } = mau.loi;
	if (nut)
		return (
			<KhungTaiLoi
				lyDo={lyDo}
				tieuDe={tieuDe}
				moTa={moTa}
				hanhDong={{ nhan: nut, onClick: khongLamGi, "data-nut": "mau" }}
			/>
		);
	return (
		<KhungTaiLoi
			lyDo={lyDo}
			tieuDe={tieuDe}
			moTa={moTa}
			onRetry={khongLamGi}
			coDong={false}
		/>
	);
}

function NganTrongKhung({ dt, tt }: { dt: DoiTuong; tt: TrangNgan }) {
	const mau = MAU[dt];
	const [tab, setTab] = useState(mau.the[0]?.id ?? "");
	const tabs: DetailSheetTab[] = mau.the.map((t) => ({
		value: t.id,
		label: t.nhan,
		content: <TheNoiDung doan={t.doan} />,
	}));
	const chung = {
		loading: tt === "dang-tai",
		error: tt === "loi" ? "loi" : null,
		errorView: <LoiCua mau={mau} />,
		title: tt === "du" ? <span translate="no">{mau.tieuDe}</span> : mau.ten,
		description: tt === "du" ? mau.moTa : undefined,
		actions:
			tt === "du" ? (
				<Button variant="outline" size="sm">
					Sửa
				</Button>
			) : undefined,
		vo: { "data-ngan-mau": dt, "data-trang-mau": tt },
	};
	if (mau.theGiuaThan)
		return (
			<KhungNgan
				{...chung}
				tabs={tabs}
				tab={tab}
				onTabChange={setTab}
				vungThan={{ "data-than-mau": dt }}
				than={(theCon) => (
					<div>
						<OSo mau={mau} />
						<DetailSheetSection title="Việc · bằng chứng">
							{theCon}
						</DetailSheetSection>
						<DetailSheetSection title="Sổ nguồn">
							<DetailSheetProse>
								<p>Số đại lý mới ký trong quý</p>
							</DetailSheetProse>
						</DetailSheetSection>
					</div>
				)}
			/>
		);
	if (tabs.length === 0)
		return <KhungNgan {...chung} than={() => <OSo mau={mau} />} />;
	return (
		<KhungNgan
			{...chung}
			stats={<OSo mau={mau} />}
			tabs={tabs}
			tab={tab}
			onTabChange={setTab}
		/>
	);
}

function KrTuDungCu({ tt }: { tt: "dang-tai" | "loi" }) {
	const mau = MAU.kr;
	return (
		<div className="contents" data-ngan-cu="kr">
			<DetailSheetHeader title={mau.ten} />
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
				<DetailSheetSection>
					{tt === "dang-tai" ? (
						<div aria-busy="true" className="flex flex-col gap-3">
							<div className="grid grid-cols-2 gap-3">
								<Skeleton className="h-20 w-full" />
								<Skeleton className="h-20 w-full" />
							</div>
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-40 w-full" />
						</div>
					) : (
						<VungTaiLoi
							tieuDe="Không tải được KR"
							moTa="Kiểm tra kết nối rồi thử lại."
							onThuLai={khongLamGi}
						/>
					)}
				</DetailSheetSection>
			</div>
		</div>
	);
}

function KhungMau({ nhan, children }: { nhan: string; children: ReactNode }) {
	return (
		<figure className="flex min-w-0 flex-col gap-2">
			<figcaption className="text-muted-foreground text-xs">{nhan}</figcaption>
			<div className="flex h-[38rem] w-full max-w-[30rem] flex-col overflow-hidden rounded-lg border bg-background">
				<Sheet open modal={false}>
					{children}
				</Sheet>
			</div>
		</figure>
	);
}

function docState(state: string): { dt: DoiTuong; tt: TrangNgan } | null {
	for (const dt of DOI_TUONG)
		for (const tt of TRANG) if (st(dt, tt) === state) return { dt, tt };
	return null;
}

export function KhungChungNganBanGhiMau({ state }: { state: string }) {
	const cap = docState(state);
	const soCu =
		state === ST_SO_KR_CU.dangTai
			? "dang-tai"
			: state === ST_SO_KR_CU.loi
				? "loi"
				: null;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Khung ngăn chung</PageShellTitle>
					<PageShellDescription>
						Bảy loại ngăn bản ghi mở trong cùng một khung: cùng đầu ngăn, chờ
						tải bằng khung xương, lỗi nói đúng lý do.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<div data-trang-proto={state} className="grid gap-6 md:grid-cols-2">
					{soCu ? (
						<>
							<KhungMau nhan="Trước — ngăn KR tự dựng">
								<KrTuDungCu tt={soCu} />
							</KhungMau>
							<KhungMau nhan="Sau — ngăn KR trong khung">
								<NganTrongKhung dt="kr" tt={soCu} />
							</KhungMau>
						</>
					) : cap ? (
						<>
							<KhungMau nhan={`${MAU[cap.dt].ten} — ${NHAN_TRANG[cap.tt]}`}>
								<NganTrongKhung dt={cap.dt} tt={cap.tt} />
							</KhungMau>
							<KhungMau nhan={`Màn mẫu: Deal — ${NHAN_TRANG[cap.tt]}`}>
								<NganTrongKhung dt="deal" tt={cap.tt} />
							</KhungMau>
						</>
					) : null}
				</div>
			</PageShellContent>
		</PageShell>
	);
}
