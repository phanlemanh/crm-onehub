"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Sheet } from "@crm/ui/components/sheet";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { useState } from "react";
import { CreatedApiKeyDialog } from "@/app/(app)/[slug]/settings/api-keys/created-api-key-dialog";
import {
	type LoaiKhoa,
	NhanLoaiKhoa,
} from "@/app/(app)/[slug]/settings/api-keys/loai-khoa";
import {
	type HanKhoa,
	ToTaoKhoa,
} from "@/app/(app)/[slug]/settings/api-keys/to-tao-khoa";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { khoaApiMessages } from "@/lib/messages/settings-khoa-api";

export const STATE = {
	quanTri: "ST-tao-khoa-quan-tri",
	chonKeo: "ST-tao-khoa-chon-keo",
	thanhVien: "ST-tao-khoa-thanh-vien",
	dangTao: "ST-tao-khoa-dang-tao",
	khoaMoi: "ST-khoa-moi-keo-tin-hieu",
	danhSach: "ST-danh-sach-co-khoa-keo",
} as const;

const KHOA_MAU = [
	{
		ten: "Lịch kéo tín hiệu",
		dau: "crm_aZ4k…",
		loai: "keo-tin-hieu",
		tao: "14/10/2026",
		dung: "15/10/2026 04:00",
	},
	{
		ten: "Máy chạy CI",
		dau: "crm_Qm8x…",
		loai: "toan-quyen",
		tao: "02/09/2026",
		dung: "13/10/2026 17:21",
	},
] satisfies {
	ten: string;
	dau: string;
	loai: LoaiKhoa;
	tao: string;
	dung: string;
}[];

function ToMau({ state }: { state: string }) {
	const t = khoaApiMessages(useLocale());
	const [ten, setTen] = useState(
		state === STATE.quanTri || state === STATE.thanhVien
			? ""
			: "Lịch kéo tín hiệu",
	);
	const [loai, setLoai] = useState<LoaiKhoa>(
		state === STATE.quanTri || state === STATE.thanhVien
			? "toan-quyen"
			: "keo-tin-hieu",
	);
	const [han, setHan] = useState<HanKhoa>("never");

	return (
		<Sheet open>
			<ToTaoKhoa
				t={t}
				laQuanTri={state !== STATE.thanhVien}
				ten={ten}
				onTen={setTen}
				loai={loai}
				onLoai={setLoai}
				han={han}
				onHan={setHan}
				dangTao={state === STATE.dangTao}
				onTao={() => {}}
			/>
		</Sheet>
	);
}

function DanhSachMau() {
	const t = khoaApiMessages(useLocale());

	return (
		<SimpleTable
			surface="page"
			columns={[
				{ id: "ten", header: t.bang.ten },
				{ id: "khoa", header: t.bang.khoa },
				{ id: "tao", header: t.bang.ngayTao },
				{ id: "dung", header: t.bang.dungLanCuoi },
			]}
		>
			{KHOA_MAU.map((k) => (
				<SimpleTableRow key={k.ten}>
					<SimpleTableCell>
						<span className="flex min-w-0 items-center gap-2">
							<span className="truncate" translate="no">
								{k.ten}
							</span>
							<NhanLoaiKhoa t={t} loai={k.loai} />
						</span>
					</SimpleTableCell>
					<SimpleTableCell>
						<span translate="no">{k.dau}</span>
					</SimpleTableCell>
					<SimpleTableCell>{k.tao}</SimpleTableCell>
					<SimpleTableCell>{k.dung}</SimpleTableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

export function TinHieuTuVeKhoMau({ state }: { state: string }) {
	const t = khoaApiMessages(useLocale());

	return (
		<PageShell width="wide">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.trang.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<DanhSachMau />
				{state === STATE.danhSach ? null : state === STATE.khoaMoi ? (
					<CreatedApiKeyDialog
						apiKey={{
							name: "Lịch kéo tín hiệu",
							key: "crm_aZ4kV9pQe7LmT2xRw8YbN3sJd6HcF1gU",
							loai: "keo-tin-hieu",
						}}
						onOpenChange={() => {}}
					/>
				) : (
					<ToMau key={state} state={state} />
				)}
			</PageShellContent>
		</PageShell>
	);
}
