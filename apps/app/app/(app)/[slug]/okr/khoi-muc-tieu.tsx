"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { OwnerCell } from "@/components/crm/owner-cell";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { NhanGioiHan } from "@/components/okr/nhan-gioi-han";
import { okrMessages } from "@/lib/messages/okr";
import { BangKr } from "./bang-kr";
import { coNoiDung, type DiemCam } from "./diem-cam";
import type { MucTieu } from "./kieu";
import {
	NhanTrangThai,
	nhipCua,
	TienDoMucTieu,
	TienDoMucTieuGon,
} from "./tien-do-kr";

const AN_DUOI_MD = "hidden align-top md:table-cell";

function demCham(mt: MucTieu): number {
	return mt.keyResults.filter((kr) => {
		const nhip = nhipCua(kr.progress, mt.expected, mt.kind, kr.kind === "moc");
		return nhip === "cham-nhip" || nhip === "truot";
	}).length;
}

function HangMucTieu({
	mucTieu,
	hienDonVi,
	mo,
	doiMo,
	diemCam,
}: {
	mucTieu: MucTieu;
	hienDonVi: boolean;
	mo: boolean;
	doiMo: () => void;
	diemCam?: DiemCam;
}) {
	const m = okrMessages(useLocale());
	const k = m.khoiMucTieu;
	const openRecord = useOpenRecord();
	const nhan = diemCam?.nhanMucTieu?.(mucTieu);
	const cham = demCham(mucTieu);
	const tienDo = {
		ten: mucTieu.title,
		progress: mucTieu.progress,
		expected: mucTieu.expected,
		kind: mucTieu.kind,
		soKr: mucTieu.keyResults.length,
	};
	return (
		<SimpleTableRow
			clickable
			data-hang-muc-tieu={mucTieu.id}
			expandable
			onClick={doiMo}
		>
			<SimpleTableCell className="w-12 align-top">
				<Button
					aria-expanded={mo}
					className="group"
					aria-label={mo ? k.thuGon(mucTieu.title) : k.moRa(mucTieu.title)}
					onClick={(e) => {
						e.stopPropagation();
						doiMo();
					}}
					size="icon-sm"
					variant="ghost"
				>
					<Icon
						className="transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none motion-reduce:duration-0"
						icon={ChevronRight}
					/>
				</Button>
			</SimpleTableCell>
			<SimpleTableCell className="whitespace-normal align-top">
				<span className="flex min-w-0 flex-col gap-1">
					<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<button
							type="button"
							className="wrap-anywhere text-start font-medium underline-offset-2 hover:underline focus-visible:underline"
							translate="no"
							data-mo-muc-tieu={mucTieu.id}
							onClick={(e) => {
								e.stopPropagation();
								openRecord({ kind: "objective", id: mucTieu.id });
							}}
						>
							{mucTieu.title}
						</button>
						<span
							className="inline-flex flex-wrap items-center gap-2"
							data-nhom-nhan
						>
							<Badge variant="outline">{m.loai[mucTieu.kind]}</Badge>
							<NhanTrangThai status={mucTieu.status} />
							{mucTieu.hienThi === "gioi-han" ? (
								<NhanGioiHan moHop={null} soNguoiXem={mucTieu.soNguoiXem} />
							) : null}
							{coNoiDung(nhan) ? nhan : null}
						</span>
					</span>
					<span className="text-muted-foreground text-xs">
						{hienDonVi ? (
							<>
								<span translate="no">{mucTieu.unitName}</span>
								{" · "}
							</>
						) : null}
						{k.soKr(mucTieu.keyResults.length)}
						{mucTieu.alignments.length > 0
							? ` · ${m.gopVao(mucTieu.alignments.length)}`
							: null}
						{cham > 0 ? ` · ${k.soKrCham(cham)}` : null}
						<span className="md:hidden">
							{" · "}
							<span translate="no">{mucTieu.owner.name}</span>
						</span>
					</span>
					<span className="w-full pt-1 md:hidden">
						<TienDoMucTieuGon {...tienDo} />
					</span>
				</span>
			</SimpleTableCell>
			<SimpleTableCell className={`${AN_DUOI_MD} w-48`}>
				<span translate="no">
					<OwnerCell owner={{ ...mucTieu.owner, image: null }} />
				</span>
			</SimpleTableCell>
			<SimpleTableCell className={`${AN_DUOI_MD} w-64`}>
				<TienDoMucTieu {...tienDo} />
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function HangChuaCoKr({ mucTieu }: { mucTieu: MucTieu }) {
	const m = okrMessages(useLocale());
	return (
		<SimpleTableRow data-chua-co-kr={mucTieu.id} nested>
			<SimpleTableCell />
			<SimpleTableCell className="whitespace-normal" colSpan={3}>
				<span className="text-muted-foreground">{m.chuaCoKr}</span>
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

export function KhoiMucTieu({
	mucTieu,
	hienDonVi,
	danhDauCuaToi,
	mo = true,
	doiMo = () => {},
	diemCam,
}: {
	mucTieu: MucTieu;
	hienDonVi: boolean;
	danhDauCuaToi: boolean;
	mo?: boolean;
	doiMo?: () => void;
	diemCam?: DiemCam;
}) {
	const m = okrMessages(useLocale());
	return (
		<div data-muc-tieu={mucTieu.id}>
			<BangKr
				an={!mo}
				cotMo
				danhDauCuaToi={danhDauCuaToi}
				dau={
					<HangMucTieu
						diemCam={diemCam}
						doiMo={doiMo}
						hienDonVi={hienDonVi}
						mo={mo}
						mucTieu={mucTieu}
					/>
				}
				diemCam={diemCam}
				duoiDau={
					mo && mucTieu.keyResults.length === 0 ? (
						<HangChuaCoKr mucTieu={mucTieu} />
					) : null
				}
				expected={mucTieu.expected}
				header="sr-only"
				keyResults={mucTieu.keyResults}
				kind={mucTieu.kind}
				mucTieu={mucTieu}
				nested
				tenCotDau={m.cot.mucTieuVaKr}
			/>
		</div>
	);
}
