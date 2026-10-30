"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronUp from "@carbon/icons-react/es/ChevronUp";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { FieldDescription, FieldGroup } from "@crm/ui/components/field";
import { type LoiHoi, useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useEffect, useRef } from "react";
import { DetailSheetSection } from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { moiNhat } from "../lich-su-moi-lan-cap-nhat/tinh";
import type { KrNgan } from "./du-lieu";
import { ChonTuTin, OBangChung, OGhiChu, OGiaTri } from "./o-nhap";
import {
	docGiaTri,
	giaTriMoiNhat,
	hienBangChung,
	kemDonVi,
	laNhap,
	moTaMoiNhat,
	mucDoi,
	type Nhap,
	saiBangChung,
	sanSang,
	soDoi,
	soVn,
} from "./tinh";

const T = okrMessages("vi");

const CHU = {
	tieuDe: "Cập nhật KR này",
	moiNhat: (mo: string) => `Lần mới nhất: ${mo}`,
	conNhap: "còn nháp chưa gửi",
	thuLai: "Thu khối cập nhật",
	phim: "Ctrl/⌘ + Enter",
	chonTuTin: "Chọn mức tự tin để gửi",
	giuNguyen: (so: string) => `Lần mới nhất ${so} · ${T.capNhat.dich}`,
} as const;

const HOI_BO_NHAP: LoiHoi = {
	tieuDe: "Bỏ cập nhật đang soạn?",
	than: "Giá trị, mức tự tin và ghi chú bạn vừa nhập cho KR này sẽ mất.",
	nut: "Bỏ",
	thoi: "Tiếp tục sửa",
};

function DongThu({
	kr,
	coNhap,
	onMo,
}: {
	kr: KrNgan;
	coNhap: boolean;
	onMo: () => void;
}) {
	const moTa = [CHU.moiNhat(moTaMoiNhat(kr)), coNhap ? CHU.conNhap : null]
		.filter((c) => c !== null)
		.join(" · ");
	return (
		<DetailSheetSection data-khoi-cap-nhat-kr="thu">
			<Item asChild size="sm" variant="outline">
				<button
					aria-expanded={false}
					data-nut="mo-khoi-cap-nhat-kr"
					onClick={onMo}
					type="button"
				>
					<ItemContent>
						<ItemTitle>{CHU.tieuDe}</ItemTitle>
						<ItemDescription className="tabular-nums">{moTa}</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Icon icon={ChevronDown} />
					</ItemActions>
				</button>
			</Item>
		</DetailSheetSection>
	);
}

function MoTaGiaTri({ kr, nhap }: { kr: KrNgan; nhap: Nhap }) {
	const doi = soDoi(kr, nhap);
	if (doi !== null) {
		return (
			<FieldDescription className="tabular-nums" data-xem-truoc-cap-nhat={doi}>
				{mucDoi(kr, doi)}
			</FieldDescription>
		);
	}
	const cu = giaTriMoiNhat(kr);
	const chuCu =
		kr.kieu === "moc"
			? cu >= 1
				? T.moc.xong
				: T.moc.chuaXong
			: kemDonVi(kr, soVn(cu));
	return (
		<FieldDescription className="tabular-nums">
			{kr.kieu === "moc"
				? `Lần mới nhất: ${chuCu.toLowerCase()}`
				: `${CHU.giuNguyen(chuCu)} ${kemDonVi(kr, soVn(kr.dich))}`}
		</FieldDescription>
	);
}

export function KhoiCapNhat({
	kr,
	mo,
	nhap,
	loi,
	ghiHo,
	tieuDiem,
	onMo,
	onNhap,
	onGui,
}: {
	kr: KrNgan;
	mo: boolean;
	nhap: Nhap;
	loi: boolean;
	ghiHo: string | null;
	tieuDiem: boolean;
	onMo: (mo: boolean) => void;
	onNhap: (nhap: Nhap) => void;
	onGui: () => void;
}) {
	const khai = useKhaiThayDoi(HOI_BO_NHAP);
	const coNhap = laNhap(kr, nhap);
	const oGiaTri = useRef<HTMLInputElement>(null);
	useEffect(() => {
		khai(coNhap);
	}, [khai, coNhap]);
	useMountEffect(() => {
		if (!tieuDiem) return;
		const khung = requestAnimationFrame(() => oGiaTri.current?.focus());
		return () => cancelAnimationFrame(khung);
	});

	if (!mo) return <DongThu coNhap={coNhap} kr={kr} onMo={() => onMo(true)} />;

	const so = docGiaTri(kr, nhap.giaTri);
	const duoc = sanSang(kr, nhap);
	const gui = () => {
		if (duoc) onGui();
	};

	return (
		<DetailSheetSection
			action={
				<Button
					aria-label={CHU.thuLai}
					onClick={() => onMo(false)}
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={ChevronUp} />
				</Button>
			}
			data-khoi-cap-nhat-kr="mo"
			data-tieu-diem={tieuDiem ? "gia-tri" : undefined}
			title={CHU.tieuDe}
		>
			<form
				className="flex flex-col gap-4"
				onKeyDown={(e) => {
					if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
						e.preventDefault();
						gui();
					}
				}}
				onSubmit={(e) => {
					e.preventDefault();
					gui();
				}}
			>
				{ghiHo === null ? null : (
					<Alert data-ghi-ho>
						<Icon icon={UserFollow} />
						<AlertTitle>
							{T.hopCapNhat.ghiHo} <span translate="no">{ghiHo}</span>
						</AlertTitle>
					</Alert>
				)}
				{loi ? (
					<Alert data-loi-gui variant="destructive">
						<Icon icon={WarningAlt} />
						<AlertTitle>{T.capNhat.loiGui.title}</AlertTitle>
						<AlertDescription>
							{T.capNhat.loiGui.mayChu} {T.capNhat.loiGui.conNguyen}
						</AlertDescription>
					</Alert>
				) : null}
				<FieldGroup>
					<OGiaTri
						datGiaTri={(giaTri) => onNhap({ ...nhap, giaTri })}
						khoa={false}
						kr={kr}
						loi={so === null}
						moTa={<MoTaGiaTri kr={kr} nhap={nhap} />}
						oRef={oGiaTri}
						value={nhap.giaTri}
					/>
					{hienBangChung(kr, nhap) ? (
						<OBangChung
							datBangChung={(bangChung) => onNhap({ ...nhap, bangChung })}
							id={kr.id}
							khoa={false}
							sai={saiBangChung(kr, nhap)}
							value={nhap.bangChung}
						/>
					) : null}
					<ChonTuTin
						datTuTin={(tuTin) => onNhap({ ...nhap, tuTin })}
						id={kr.id}
						khoa={false}
						lanTruoc={moiNhat(kr)?.tuTin ?? null}
						value={nhap.tuTin}
					/>
					<OGhiChu
						datGhiChu={(ghiChu) => onNhap({ ...nhap, ghiChu })}
						id={kr.id}
						khoa={false}
						value={nhap.ghiChu}
					/>
				</FieldGroup>
				<div className="flex flex-wrap items-center justify-end gap-3">
					<span
						aria-hidden={duoc || undefined}
						className="text-muted-foreground text-xs"
						data-goi-y-phim
					>
						{duoc ? CHU.phim : CHU.chonTuTin}
					</span>
					<Button
						aria-keyshortcuts="Control+Enter Meta+Enter"
						data-nut="gui-cap-nhat-kr"
						disabled={!duoc}
						type="submit"
					>
						{T.hopCapNhat.gui}
					</Button>
				</div>
			</form>
		</DetailSheetSection>
	);
}
