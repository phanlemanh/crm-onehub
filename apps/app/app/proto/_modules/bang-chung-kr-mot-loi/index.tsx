"use client";

import Add from "@carbon/icons-react/es/Add";
import Attachment from "@carbon/icons-react/es/Attachment";
import { Button } from "@crm/ui/components/button";
import { FieldGroup } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { ItemGroup } from "@crm/ui/components/item";
import { Sheet } from "@crm/ui/components/sheet";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { DongDinhBangChung } from "@/components/crm/record-sheet/dong-dinh-bang-chung";
import { DongBangChung } from "@/components/crm/record-sheet/kr-bang-chung";
import { ODuongDanBangChung } from "@/components/crm/record-sheet/o-duong-dan-bang-chung";
import {
	DetailSheetBody,
	DetailSheetEmpty,
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
	BANG_CHUNG,
	GHI_CHU,
	KR_MOC,
	NHAN_TRANG,
	st,
	TRANG_MAU,
	type TrangMau,
	URL_DUNG,
	URL_SAI,
} from "./du-lieu";

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

const khongBaoGio = () => new Promise<void>(() => {});
const tuChoi = () => Promise.reject(new Error("SERVER_MSG"));
const xong = async () => {};

function NutDinh() {
	return (
		<Button size="sm" variant="outline" data-nut="dinh-bang-chung">
			<Icon icon={Add} data-icon="inline-start" />
			Đính bằng chứng
		</Button>
	);
}

function PhanBangChung({ trang }: { trang: TrangMau }) {
	const vo = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (trang === "dang-dinh" || trang === "loi") {
			vo.current
				?.querySelector<HTMLButtonElement>("[data-nut='dinh']")
				?.click();
		}
	}, [trang]);
	const danhSach = trang === "rong" ? [] : BANG_CHUNG;
	const dau =
		trang === "sai"
			? { url: URL_SAI, ghiChu: "" }
			: trang === "dang-nhap"
				? { url: "", ghiChu: "" }
				: { url: URL_DUNG, ghiChu: GHI_CHU };
	const onDinh =
		trang === "dang-dinh" ? khongBaoGio : trang === "loi" ? tuChoi : xong;
	const moDong = trang !== "rong" && trang !== "co";
	const dong = moDong ? (
		<DongDinhBangChung dau={dau} dong={() => {}} onDinh={onDinh} />
	) : null;
	return (
		<div ref={vo} className="contents" data-st={st(trang)}>
			<DetailSheetBody>
				{danhSach.length === 0 && !moDong ? (
					<DetailSheetEmpty
						icon={Attachment}
						title="Chưa có bằng chứng"
						description="Đính đường dẫn cho thấy mốc này đã xong — không bắt buộc."
						action={<NutDinh />}
					/>
				) : (
					<DetailSheetSection>
						<div className="flex flex-col gap-3">
							<ItemGroup>
								{danhSach.map((b) => (
									<DongBangChung goDuoc b={b} key={b.id} onGo={() => {}} />
								))}
								{dong}
							</ItemGroup>
							{moDong ? null : (
								<div>
									<NutDinh />
								</div>
							)}
						</div>
					</DetailSheetSection>
				)}
			</DetailSheetBody>
		</div>
	);
}

function KhoiCapNhatMoc() {
	const ma = useId();
	return (
		<DetailSheetBody>
			<div data-st={st("cap-nhat-moc")}>
				<DetailSheetSection title="Cập nhật">
					<FieldGroup>
						<p className="text-sm">Mốc: Xong</p>
						<ODuongDanBangChung
							id={`${ma}-url`}
							onChange={() => {}}
							value={URL_DUNG}
						/>
					</FieldGroup>
				</DetailSheetSection>
			</div>
		</DetailSheetBody>
	);
}

function timTrang(state: string): TrangMau {
	return TRANG_MAU.find((t) => st(t) === state) ?? "rong";
}

export function BangChungKrMotLoiMau({ state }: { state: string }) {
	const trang = timTrang(state);
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Đính bằng chứng KR ngay trong ngăn</PageShellTitle>
					<PageShellDescription>
						Một dòng nhập cuối danh sách thay hộp thoại; khối cập nhật của KR
						mốc dùng cùng ô đường dẫn.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<KhungMau key={state} nhan={NHAN_TRANG[trang]}>
					<DetailSheetHeader
						title={<span translate="no">{KR_MOC}</span>}
						description="KR mốc · Đã xong"
					/>
					{trang === "cap-nhat-moc" ? (
						<KhoiCapNhatMoc />
					) : (
						<PhanBangChung trang={trang} />
					)}
				</KhungMau>
			</PageShellContent>
		</PageShell>
	);
}
