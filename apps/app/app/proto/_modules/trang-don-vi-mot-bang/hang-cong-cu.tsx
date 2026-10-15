"use client";

import { Combobox, type ComboboxOption } from "@crm/ui/components/combobox";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
	boDau,
	DON_VI,
	type DonViPhang,
	duongTrang,
	maDon,
	NGUOI_DON,
	thuoc,
} from "./du-lieu";

export type CachXem = "danh-sach" | "cay" | "hop-tuan" | "cham";

export const STATE_CUA_CACH_XEM = {
	"danh-sach": "ST-dvb-danh-sach",
	cay: "ST-dvb-cay",
	"hop-tuan": "ST-dvb-hop-tuan",
	cham: "ST-dvb-cham-diem",
} satisfies Record<CachXem, string>;

const CACH_XEM: { value: CachXem; label: string }[] = [
	{ value: "danh-sach", label: "Danh sách" },
	{ value: "cay", label: "Cây căn chỉnh" },
	{ value: "hop-tuan", label: "Họp tuần" },
	{ value: "cham", label: "Chấm điểm" },
];

/* Đúng lớp khung hàng công cụ của DataTable (packages/ui data-table.tsx). Ba
   cách xem không phải bảng bọc khối ô chọn + cách xem trong khung này để hàng
   công cụ đứng yên khi đổi cách xem. */
export const LOP_HANG_CONG_CU =
	"flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between";

const LOP_KHOI = "flex flex-col gap-2 sm:flex-row sm:items-center";

type LuaChon = ComboboxOption & { tim: string };

/* Gợi ý trong ô chọn bỏ tên công ty ở đầu đường (mọi đơn vị đều thuộc công
   ty): Combobox giữ gợi ý `shrink-0`, nên gợi ý dài cắt tên đơn vị còn «Ki…».
   Chân bảng vẫn ghi đủ «Thuộc A › B». */
function goiY(d: DonViPhang): string {
	if (d.duong.length <= 1) return thuoc(d);
	return `Thuộc ${d.duong.slice(1).join(" › ")}`;
}

function luaChon(maNguoi: string | null): LuaChon[] {
	const donVi = DON_VI.map((d) => {
		const n = d.tt.mucTieu.length;
		return {
			value: maDon(d),
			label: d.ten,
			hint: `${goiY(d)} · ${n === 0 ? "chưa đặt" : `${n} mục tiêu`}`,
			tim: boDau([d.ten, ...d.duong].join(" ")),
		};
	});
	const ng = maNguoi ? NGUOI_DON[maNguoi.replace("nguoi:", "")] : undefined;
	if (!ng || !maNguoi) return donVi;
	return [
		{
			value: maNguoi,
			label: ng.nguoi.ten,
			hint: `Người · ${ng.phongBan}`,
			tim: boDau(`${ng.nguoi.ten} ${ng.phongBan}`),
		},
		...donVi,
	];
}

function ChonDonVi({
	ma,
	moSan,
	cachXem,
}: {
	ma: string;
	moSan: boolean;
	cachXem: CachXem;
}) {
	const router = useRouter();
	const [tim, setTim] = useState(moSan ? "kinh" : "");
	const daMo = useRef(false);
	const moMotLan = useCallback(
		(el: HTMLButtonElement | null) => {
			if (!moSan || !el || daMo.current) return;
			daMo.current = true;
			el.click();
		},
		[moSan],
	);
	const tatCa = useMemo(
		() => luaChon(ma.startsWith("nguoi:") ? ma : null),
		[ma],
	);
	const khop = useMemo(() => {
		const q = boDau(tim.trim());
		return q === "" ? tatCa : tatCa.filter((o) => o.tim.includes(q));
	}, [tatCa, tim]);
	return (
		<Combobox
			aria-label="Đơn vị"
			className="w-full sm:w-72"
			data-chon-don-vi
			empty="Không có đơn vị nào khớp."
			onSearchChange={setTim}
			onValueChange={(v) =>
				router.replace(duongTrang(STATE_CUA_CACH_XEM[cachXem], v))
			}
			options={khop}
			ref={moMotLan}
			search={tim}
			searchPlaceholder="Tìm đơn vị…"
			selectedOption={tatCa.find((o) => o.value === ma)}
			size="sm"
			translate="no"
			value={ma}
		/>
	);
}

export function HangCongCuDonVi({
	ma,
	cachXem,
	moChon = false,
}: {
	ma: string;
	cachXem: CachXem;
	moChon?: boolean;
}) {
	const router = useRouter();
	return (
		<div className={LOP_KHOI} data-hang-cong-cu-don-vi>
			<ChonDonVi cachXem={cachXem} ma={ma} moSan={moChon} />
			<ViewSwitch
				items={CACH_XEM}
				label="Cách xem"
				onValueChange={(v) => {
					const moi = CACH_XEM.find((c) => c.value === v);
					if (moi)
						router.replace(duongTrang(STATE_CUA_CACH_XEM[moi.value], ma));
				}}
				value={cachXem}
			/>
		</div>
	);
}

export function KhungHangCongCu({ children }: { children: ReactNode }) {
	return <div className={LOP_HANG_CONG_CU}>{children}</div>;
}

/* Khung xương của hàng công cụ: cùng khung, cùng cỡ ô chọn (h-8, sm:w-72) và
   chỗ của cách xem, nên đỉnh ô chọn không nhảy khi dữ liệu về. */
export function HangCongCuKhungXuong() {
	return (
		<div className={LOP_HANG_CONG_CU} data-khung-hang="thanh-cong-cu">
			<div className={LOP_KHOI} data-hang-cong-cu-don-vi-khung>
				<Skeleton className="h-7 w-full sm:w-72" />
				<Skeleton className="h-7 w-32 md:w-92" />
			</div>
			<Skeleton className="hidden h-7 w-44 sm:block" />
			<div className="hidden gap-2 sm:flex lg:ml-auto">
				<Skeleton className="h-7 w-16" />
				<Skeleton className="h-7 w-24" />
				<Skeleton className="h-7 w-20" />
			</div>
			<Skeleton className="h-7 w-full sm:hidden" />
		</div>
	);
}
