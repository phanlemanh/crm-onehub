"use client";

import Information from "@carbon/icons-react/es/Information";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { dauThangSau, homNayVn, ngayThangVn } from "@/lib/okr-chu-ky-nhan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { DonChonOkr } from "../okr-search-params";
import { DanhSachCuoc } from "./danh-sach-cuoc";
import type { DonViSoan } from "./kieu";
import { ManSoan } from "./man-soan";

const PHA_SOAN = "lap-ke-hoach" satisfies PhaChuKy;
const TRAN_CUOC_KY = String(TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy);

type LyDoSoan = keyof OkrSoanMessages["lyDo"];
type HinhNutTat =
	| "nut-het-cuoc"
	| "nut-het-tran"
	| "nut-chua-khoa"
	| "nut-chua-cau-hinh";

export const HINH_NUT_TAT = {
	"don-vi-luu-tru": null,
	"don-vi-chua-bat": null,
	"don-vi-che-do-an": null,
	"cuoc-an-dang-mo": null,
	"con-cuoc-dang": null,
	"het-cuoc-ky": "nut-het-cuoc",
	"het-tran-thang": "nut-het-tran",
	"chua-co-khoa-mo-hinh": "nut-chua-khoa",
} as const satisfies Record<LyDoSoan, HinhNutTat | null>;

export function donViSoanCua(
	don: DonChonOkr,
	cycleId: string,
): DonViSoan | null {
	switch (don.loai) {
		case "goc":
			return {
				cycleId,
				level: "onehub",
				divisionId: null,
				departmentId: null,
			};
		case "bp":
			return {
				cycleId,
				level: "bo-phan",
				divisionId: don.id,
				departmentId: null,
			};
		case "pb":
			return {
				cycleId,
				level: "phong-ban",
				divisionId: null,
				departmentId: don.id,
			};
		case "nguoi":
			return null;
	}
}

function NhomSoan({
	nut,
	thongTin,
	hinh,
	m,
}: {
	nut: ReactNode;
	thongTin?: ReactNode;
	hinh?: string;
	m: OkrSoanMessages;
}) {
	return (
		<span
			className="inline-flex items-center gap-1"
			data-nhom-soan
			data-nut-soan={hinh}
		>
			{nut}
			{thongTin ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							aria-label={m.nut.thongTin}
							data-nut="thong-tin-soan"
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={Information} />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" data-thong-tin-soan>
						<div className="flex flex-col items-start gap-2 text-xs">
							{thongTin}
						</div>
					</PopoverContent>
				</Popover>
			) : null}
		</span>
	);
}

function NutKhoa({ m }: { m: OkrSoanMessages }) {
	return (
		<Button disabled size="sm" variant="outline">
			{m.nut.soan}
		</Button>
	);
}

export function NutSoan({
	don,
	cycleId,
	phaKy,
	quanTri,
	canEdit,
	cauNoi,
}: {
	don: DonChonOkr;
	cycleId: string;
	phaKy: PhaChuKy | null;
	quanTri: boolean;
	canEdit: boolean;
	cauNoi: boolean;
}) {
	const m = okrSoanMessages(useLocale());
	const trpc = useTRPC();
	const [cuocSoan, datCuocSoan] = useQueryState(
		SEARCH_PARAM.okr.cuocSoan,
		parseAsString,
	);
	const [dsCuoc, datDsCuoc] = useQueryState(
		SEARCH_PARAM.okr.dsCuoc,
		parseAsString,
	);
	const donVi = donViSoanCua(don, cycleId);
	const hienDuoc = donVi !== null && phaKy === PHA_SOAN && (canEdit || quanTri);
	const sanSang = useQuery({
		...trpc.okr.soanSanSang.queryOptions(
			hienDuoc && cauNoi && donVi ? donVi : skipToken,
		),
		retry: false,
	});
	const mo = useMutation(
		trpc.okr.soanMo.mutationOptions({
			onSuccess: (kq) => {
				if (kq.ok) void datCuocSoan(kq.cuoc.id);
				else if (kq.cuocDang) void datCuocSoan(kq.cuocDang.id);
				else void sanSang.refetch();
			},
			onError: (loi) => toast.error(loi.message || m.nut.loiMo),
		}),
	);
	if (!hienDuoc || !donVi) return null;

	const man = cuocSoan ? (
		<ManSoan
			cuocSoanId={cuocSoan}
			quanTri={quanTri}
			cauNoi={cauNoi}
			moCuoc={(id) => void datCuocSoan(id)}
			dong={() => {
				void datCuocSoan(null);
				void sanSang.refetch();
			}}
		/>
	) : null;
	const ds =
		dsCuoc && cauNoi ? (
			<DanhSachCuoc
				donVi={donVi}
				dong={() => void datDsCuoc(null)}
				mo={(id) => {
					void datDsCuoc(null);
					void datCuocSoan(id);
				}}
			/>
		) : null;
	const nutDs = (da: number, tran: string) =>
		da > 0 ? (
			<Button
				size="sm"
				variant="ghost"
				data-nut="ds-cuoc"
				onClick={() => void datDsCuoc("1")}
			>
				{m.nut.dsCuoc(String(da), tran)}
			</Button>
		) : null;
	const chu = (cau: string) => <p className="text-muted-foreground">{cau}</p>;

	let nhom: ReactNode = null;
	const s = sanSang.data;
	if (!cauNoi) {
		if (quanTri)
			nhom = (
				<NhomSoan
					m={m}
					hinh="nut-chua-cau-hinh"
					nut={<NutKhoa m={m} />}
					thongTin={chu(m.nut.chuaCauHinh)}
				/>
			);
	} else if (!s) {
		nhom = <NhomSoan m={m} hinh="dang-tai" nut={<NutKhoa m={m} />} />;
	} else if (!s.bat) {
		const hinh = HINH_NUT_TAT[s.lyDo];
		if (hinh === "nut-het-cuoc")
			nhom = (
				<NhomSoan
					m={m}
					hinh={hinh}
					nut={<NutKhoa m={m} />}
					thongTin={
						<>
							{chu(m.nut.hetCuoc(TRAN_CUOC_KY))}
							{nutDs(TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy, TRAN_CUOC_KY)}
						</>
					}
				/>
			);
		else if (hinh === "nut-het-tran")
			nhom = (
				<NhomSoan
					m={m}
					hinh={hinh}
					nut={<NutKhoa m={m} />}
					thongTin={chu(m.nut.tamNghi(dauThangSau(homNayVn(new Date()))))}
				/>
			);
		else if (hinh === "nut-chua-khoa")
			nhom = (
				<NhomSoan
					m={m}
					hinh={hinh}
					nut={<NutKhoa m={m} />}
					thongTin={chu(m.lyDo["chua-co-khoa-mo-hinh"])}
				/>
			);
	} else if (s.nac !== "an" || quanTri) {
		const dsDaDung = nutDs(s.soCuocDaDung, String(s.tranCuoc));
		if (s.cuocDang) {
			const cuocDang = s.cuocDang;
			nhom = (
				<NhomSoan
					hinh="nut-tiep"
					m={m}
					nut={
						<Button
							size="sm"
							variant="outline"
							aria-haspopup="dialog"
							onClick={() => void datCuocSoan(cuocDang.id)}
						>
							{m.nut.tiep}
						</Button>
					}
					thongTin={
						<>
							{chu(
								m.nut.tiepMoTa(
									ngayThangVn(new Date(cuocDang.moLuc)),
									String(cuocDang.soLuot),
									String(cuocDang.soDongTong - cuocDang.soDongNhan),
								),
							)}
							{dsDaDung}
						</>
					}
				/>
			);
		} else {
			const nutMo = (
				<Button
					size="sm"
					variant="outline"
					data-nut-soan={s.nac === "an" ? undefined : "nut"}
					aria-haspopup="dialog"
					disabled={mo.isPending}
					onClick={() => mo.mutate(donVi)}
				>
					{m.nut.soan}
				</Button>
			);
			const an =
				s.nac === "an" ? (
					<>
						<Badge variant="outline">{m.nut.cheDoAn}</Badge>
						{chu(m.nut.cheDoAnMoTa)}
					</>
				) : null;
			nhom = (
				<NhomSoan
					hinh={s.nac === "an" ? "nut-an" : undefined}
					m={m}
					nut={nutMo}
					thongTin={
						an || dsDaDung ? (
							<>
								{an}
								{dsDaDung}
							</>
						) : undefined
					}
				/>
			);
		}
	}
	return (
		<>
			{nhom}
			{man}
			{ds}
		</>
	);
}
