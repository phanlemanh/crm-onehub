"use client";

import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useId, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChamTrangThai } from "../tien-do-kr";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { MucCongBo, QuyenCongBo } from "./tai-lieu-bo";

type SoanBoMessages = ReturnType<typeof okrSoanBoMessages>;

type ViecCongBo = { id: string; ten: string; quaDuyet: boolean };

type KetQuaMuc = ViecCongBo &
	({ trang: "xong" } | { trang: "loi"; cau: string });

type KetQua = ReadonlyMap<string, KetQuaMuc>;

const KET_QUA_TRONG: KetQua = new Map();

const laMucCongBo = (mt: MucCongBo) =>
	mt.status === "nhap" && mt.soKrDaLuu >= 1;

function useQuyenCongBo(
	muc: readonly MucCongBo[],
): (mt: MucCongBo) => QuyenCongBo | null {
	const trpc = useTRPC();
	const chiTiet = useQueries({
		queries: muc
			.filter((mt) => mt.quyen === null)
			.map((mt) => trpc.okr.objective.queryOptions({ id: mt.id })),
	});
	const theoId = new Map(
		chiTiet.flatMap((q) =>
			q.data ? [[q.data.id, q.data.quyen] as const] : [],
		),
	);
	return (mt) => mt.quyen ?? theoId.get(mt.id) ?? null;
}

function useGuiMot(): (viec: ViecCongBo) => Promise<KetQuaMuc> {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const congBo = useMutation(trpc.okr.publishObjective.mutationOptions());
	const guiDuyet = useMutation(trpc.okr.guiDuyet.mutationOptions());
	return async (viec) => {
		try {
			await (viec.quaDuyet ? guiDuyet : congBo).mutateAsync({ id: viec.id });
			void cache.okr(viec.id);
			return { ...viec, trang: "xong" };
		} catch (loi) {
			const cau = loi instanceof Error ? loi.message : String(loi);
			return { ...viec, trang: "loi", cau };
		}
	};
}

function doiTich(
	cu: ReadonlySet<string>,
	id: string,
	tich: boolean,
): ReadonlySet<string> {
	const moi = new Set(cu);
	if (tich) moi.delete(id);
	else moi.add(id);
	return moi;
}

function nhanNut(chu: SoanBoMessages, n: number, quaDuyet: boolean): string {
	if (n === 0) return chu.congBo.nutKhoa;
	return quaDuyet
		? chu.congBo.nutGuiDuyet(String(n))
		: chu.congBo.nut(String(n));
}

function DanhSachTich({
	ds,
	oLai,
	boTich,
	dang,
	datTich,
	chu,
}: {
	ds: readonly MucCongBo[];
	oLai: readonly MucCongBo[];
	boTich: ReadonlySet<string>;
	dang: boolean;
	datTich: (id: string, tich: boolean) => void;
	chu: SoanBoMessages;
}) {
	const goc = useId();
	return (
		<div className="flex flex-col gap-4">
			<FieldGroup data-danh-sach-cong-bo="">
				{ds.map((mt) => (
					<Field key={mt.id} orientation="horizontal" data-muc-cong-bo={mt.id}>
						<Checkbox
							id={`${goc}-${mt.id}`}
							checked={!boTich.has(mt.id)}
							disabled={dang}
							onCheckedChange={(co) => datTich(mt.id, co === true)}
						/>
						<FieldLabel htmlFor={`${goc}-${mt.id}`}>
							<span translate="no">{mt.ten}</span>
						</FieldLabel>
					</Field>
				))}
			</FieldGroup>
			{oLai.length > 0 ? (
				<FieldDescription data-o-lai-nhap="">
					{chu.congBo.hoi.oLaiNhap}{" "}
					<span translate="no">{oLai.map((mt) => mt.ten).join(", ")}</span>
				</FieldDescription>
			) : null}
		</div>
	);
}

function KetQuaCongBo({
	ketQua,
	dang,
	thuLai,
	chu,
}: {
	ketQua: KetQua;
	dang: boolean;
	thuLai: (viec: ViecCongBo) => void;
	chu: SoanBoMessages;
}) {
	return (
		<ItemGroup data-ket-qua-cong-bo="">
			{[...ketQua.values()].map((k) => (
				<Item key={k.id} size="sm" data-ket-qua={k.id} data-trang={k.trang}>
					<ItemContent>
						{k.trang === "xong" ? (
							<>
								<ItemTitle translate="no">{k.ten}</ItemTitle>
								<ChamTrangThai status={k.quaDuyet ? "cho-duyet" : "cong-bo"} />
							</>
						) : (
							<>
								<ItemTitle>
									<StatusIndicator
										tone={toneTheoNghia("hong")}
										size="sm"
										label={chu.congBo.loiMuc(k.ten)}
									/>
								</ItemTitle>
								<ItemDescription>{k.cau}</ItemDescription>
							</>
						)}
					</ItemContent>
					{k.trang === "loi" ? (
						<ItemActions>
							<Button
								variant="outline"
								size="sm"
								type="button"
								data-nut="thu-lai-cong-bo"
								disabled={dang}
								onClick={() => thuLai(k)}
							>
								{chu.congBo.thuLai}
							</Button>
						</ItemActions>
					) : null}
				</Item>
			))}
		</ItemGroup>
	);
}

function BienNhan({
	ketQua,
	veTheoDoi,
	chu,
}: {
	ketQua: KetQua;
	veTheoDoi: () => void;
	chu: SoanBoMessages;
}) {
	const xong = [...ketQua.values()];
	const so = String(xong.length);
	const quaDuyet = xong.every((k) => k.quaDuyet);
	return (
		<Empty border="solid" size="compact" data-bien-nhan-cong-bo="">
			<EmptyHeader>
				<EmptyTitle>
					{quaDuyet ? chu.congBo.daGuiDuyet(so) : chu.congBo.daCongBo(so)}
				</EmptyTitle>
				<EmptyDescription>{chu.congBo.daCongBoMoTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button
					variant="outline"
					size="sm"
					type="button"
					data-nut="ve-theo-doi"
					onClick={veTheoDoi}
				>
					{chu.congBo.veTheoDoi}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function useVongCongBo() {
	const phuThuoc = usePhuThuocSoan();
	const guiMot = useGuiMot();
	const [dang, datDang] = useState(false);
	const [ketQua, datKetQua] = useState<KetQua>(KET_QUA_TRONG);
	const chay = async (viec: readonly ViecCongBo[], truoc: KetQua) => {
		datDang(true);
		let kq = truoc;
		for (const v of viec) kq = new Map(kq).set(v.id, await guiMot(v));
		const coLoi = [...kq.values()].some((k) => k.trang === "loi");
		datKetQua(
			coLoi && !phuThuoc.giuKetQuaKhiLoi
				? new Map([...kq].filter(([, k]) => k.trang === "loi"))
				: kq,
		);
		datDang(false);
	};
	return { dang, ketQua, chay };
}

export function CongBo({
	mucTieu,
	veTheoDoi,
}: {
	mucTieu: MucCongBo[];
	veTheoDoi: () => void;
}) {
	const locale = useLocale();
	const chu = okrSoanBoMessages(locale);
	const phuThuoc = usePhuThuocSoan();
	const ds = mucTieu.filter(laMucCongBo);
	const oLai = mucTieu.filter(
		(mt) => mt.status === "nhap" && mt.soKrDaLuu === 0 && mt.ten.trim() !== "",
	);
	const quyenCua = useQuyenCongBo(ds);
	const vong = useVongCongBo();
	const [hoi, datHoi] = useState(false);
	const [boTich, datBoTich] = useState<ReadonlySet<string>>(new Set());
	const n = phuThuoc.demCongBo(mucTieu);
	const quaDuyet =
		ds.length > 0 && ds.every((mt) => quyenCua(mt)?.guiDuyet === true);
	const tich = ds.filter((mt) => !boTich.has(mt.id));
	const viecCua = (mt: MucCongBo): ViecCongBo => ({
		id: mt.id,
		ten: mt.ten,
		quaDuyet: quyenCua(mt)?.guiDuyet === true,
	});
	const xacNhan = async () => {
		const chon = phuThuoc.goiTheoOTich ? tich : ds;
		await vong.chay(chon.map(viecCua), KET_QUA_TRONG);
		datHoi(false);
	};

	if (vong.ketQua.size > 0) {
		const coLoi = [...vong.ketQua.values()].some((k) => k.trang === "loi");
		return coLoi ? (
			<KetQuaCongBo
				ketQua={vong.ketQua}
				dang={vong.dang}
				thuLai={(viec) => void vong.chay([viec], vong.ketQua)}
				chu={chu}
			/>
		) : (
			<BienNhan ketQua={vong.ketQua} veTheoDoi={veTheoDoi} chu={chu} />
		);
	}

	return (
		<div className="flex flex-col items-start gap-2" data-cong-bo="">
			<FieldDescription>{chu.congBo.moTa}</FieldDescription>
			<Button
				type="button"
				data-nut="cong-bo-bo"
				disabled={n === 0 || vong.dang}
				onClick={() => {
					datBoTich(new Set());
					datHoi(true);
				}}
			>
				{nhanNut(chu, n, quaDuyet)}
			</Button>
			<ConfirmDialog
				tone="default"
				tieuDe={
					quaDuyet
						? chu.congBo.hoi.tieuDeGuiDuyet(String(ds.length))
						: chu.congBo.hoi.tieuDe(String(ds.length))
				}
				than={okrMessages(locale).sheet.hoiCongBo.body}
				nut={nhanNut(chu, tich.length, quaDuyet)}
				thoi={chu.congBo.hoi.thoi}
				noiDung={
					<DanhSachTich
						ds={ds}
						oLai={oLai}
						boTich={boTich}
						dang={vong.dang}
						datTich={(id, co) => datBoTich((cu) => doiTich(cu, id, co))}
						chu={chu}
					/>
				}
				open={hoi}
				pending={vong.dang}
				khoaNut={tich.length === 0}
				onOpenChange={(mo) => {
					if (!mo && !vong.dang) datHoi(false);
				}}
				onConfirm={() => void xacNhan()}
			/>
		</div>
	);
}
