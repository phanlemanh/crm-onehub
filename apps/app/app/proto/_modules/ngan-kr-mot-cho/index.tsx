"use client";

import { Button } from "@crm/ui/components/button";
import { CardTitle } from "@crm/ui/components/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { useState } from "react";
import type { KrMau, MucTuTin } from "../ban-mau-okr/du-lieu";
import {
	giaTri,
	KhungUngDung,
	TenNguoi,
	TinhTrangKr,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import { KR_CUA_MUC_TIEU, MUC_TIEU } from "./du-lieu";
import { HopCapNhat } from "./hop";
import { type HinhNgan, NganKr } from "./ngan";

type Canh = {
	ngan: { viTri: number; hinh: HinhNgan } | null;
	hop: { kr: KrMau; giaTriDau?: string } | null;
};

const KR_DAU = KR_CUA_MUC_TIEU[0] as KrMau;
const KR_HAI = KR_CUA_MUC_TIEU[1] as KrMau;
const KR_MOC = KR_CUA_MUC_TIEU.find((k) => k.kieu === "moc") as KrMau;

const CANH_THEO_STATE = {
	"ST-nkr-dong": { ngan: null, hop: null },
	"ST-nkr-ngan": { ngan: { viTri: 1, hinh: "mo" }, hop: null },
	"ST-nkr-ngan-dau": { ngan: { viTri: 0, hinh: "mo" }, hop: null },
	"ST-nkr-ngan-chi-doc": { ngan: { viTri: 1, hinh: "chi-doc" }, hop: null },
	"ST-nkr-hop": { ngan: null, hop: { kr: KR_HAI, giaTriDau: "78" } },
	"ST-nkr-hop-moc": { ngan: null, hop: { kr: KR_MOC } },
	"ST-nkr-hop-sai": { ngan: null, hop: { kr: KR_DAU, giaTriDau: "ba giờ" } },
	"ST-nkr-hop-tu-ngan": {
		ngan: { viTri: 1, hinh: "mo" },
		hop: { kr: KR_HAI, giaTriDau: "78" },
	},
	"ST-nkr-dang-tai": { ngan: { viTri: 1, hinh: "dang-tai" }, hop: null },
	"ST-nkr-loi": { ngan: { viTri: 1, hinh: "loi" }, hop: null },
	"ST-nkr-khong-thay": { ngan: { viTri: 1, hinh: "khong-thay" }, hop: null },
} satisfies Record<string, Canh>;

function BangKr({
	daGui,
	onMoNgan,
	onCapNhat,
}: {
	daGui: Record<string, number>;
	onMoNgan: (viTri: number) => void;
	onCapNhat: (kr: KrMau) => void;
}) {
	const hienTai = (kr: KrMau) => daGui[kr.id] ?? kr.hienTai;
	return (
		<section className="flex flex-col gap-3" data-bang-kr>
			<CardTitle>
				<span translate="no">{MUC_TIEU.ten}</span>
			</CardTitle>
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "kr", header: "KR" },
						{ id: "pt", header: "Phụ trách", width: "w-44" },
						{ id: "gt", header: "Hiện tại", align: "right", width: "w-28" },
						{ id: "tt", header: "Tình trạng", width: "w-36" },
						{ id: "cn", srLabel: "Cập nhật", align: "right", width: "w-28" },
					]}
					variant="panel"
				>
					{KR_CUA_MUC_TIEU.map((kr, i) => (
						<SimpleTableRow key={kr.id}>
							<SimpleTableCell>
								<button
									className="text-left hover:underline focus-visible:underline"
									onClick={() => onMoNgan(i)}
									translate="no"
									type="button"
								>
									{kr.ten}
								</button>
							</SimpleTableCell>
							<SimpleTableCell>
								<TenNguoi ten={kr.phuTrach.ten} />
							</SimpleTableCell>
							<SimpleTableCell numeric>
								{giaTri(kr, hienTai(kr))}
							</SimpleTableCell>
							<SimpleTableCell>
								<TinhTrangKr
									laMoc={kr.kieu === "moc"}
									loai={MUC_TIEU.loai}
									phanTram={tienDo({ ...kr, hienTai: hienTai(kr) })}
									size="sm"
								/>
							</SimpleTableCell>
							<SimpleTableCell align="right">
								<Button
									onClick={() => onCapNhat(kr)}
									size="sm"
									variant="outline"
								>
									Cập nhật
								</Button>
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="md:hidden">
				{KR_CUA_MUC_TIEU.map((kr, i) => (
					<Item key={kr.id} size="sm" variant="outline">
						<ItemContent>
							<ItemTitle>
								<button
									className="text-left hover:underline"
									onClick={() => onMoNgan(i)}
									translate="no"
									type="button"
								>
									{kr.ten}
								</button>
							</ItemTitle>
							<ItemDescription>{giaTri(kr, hienTai(kr))}</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button onClick={() => onCapNhat(kr)} size="sm" variant="outline">
								Cập nhật
							</Button>
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
		</section>
	);
}

function NganKrMotCho({ state }: { state: string }) {
	const dau: Canh =
		state in CANH_THEO_STATE
			? CANH_THEO_STATE[state as keyof typeof CANH_THEO_STATE]
			: CANH_THEO_STATE["ST-nkr-dong"];
	const [ngan, setNgan] = useState(dau.ngan);
	const [hop, setHop] = useState(dau.hop);
	const [daGui, setDaGui] = useState<Record<string, number>>({});
	const gui = (kr: KrMau, giaTriMoi: number, _tuTin: MucTuTin) => {
		setDaGui((cu) => ({ ...cu, [kr.id]: giaTriMoi }));
		setHop(null);
	};
	return (
		<KhungUngDung trang="theo-don-vi" vai="day-du">
			<BangKr
				daGui={daGui}
				onCapNhat={(kr) => setHop({ kr })}
				onMoNgan={(viTri) => setNgan({ viTri, hinh: "mo" })}
			/>
			{ngan ? (
				<NganKr
					daGui={daGui}
					hinh={ngan.hinh}
					onCapNhat={(kr) => setHop({ kr })}
					onDoiViTri={(viTri) => setNgan({ ...ngan, viTri })}
					viTri={ngan.viTri}
				/>
			) : null}
			{hop ? (
				<HopCapNhat
					giaTriDau={hop.giaTriDau}
					key={hop.kr.id}
					kr={hop.kr}
					onDong={() => setHop(null)}
					onGui={(g, t) => gui(hop.kr, g, t)}
				/>
			) : null}
		</KhungUngDung>
	);
}

export function NganKrMotChoMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<NganKrMotCho key={state} state={state} />
		</LocaleProvider>
	);
}
