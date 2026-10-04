"use client";

import { Button } from "@crm/ui/components/button";
import {
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BangMucTieu } from "../muc-tieu-va-kr/bang-muc-tieu";
import { DANH_SACH, DANH_SACH_LOC, STATE } from "./du-lieu";
import { ChipGopY } from "./kara";

const MAT_GOP_Y = "gopY";

function facets(coKara: boolean): DataTableFacet[] {
	const chung: DataTableFacet[] = [
		{
			id: "phuTrach",
			label: "Phụ trách",
			options: [
				{ value: "hung", label: "Trần Văn Hùng · 2" },
				{ value: "thao", label: "Võ Phương Thảo · 1" },
				{ value: "nga", label: "Bùi Thu Nga · 1" },
			],
		},
		{
			id: "loai",
			label: "Loại",
			options: [
				{ value: "cam-ket", label: "Cam kết · 4" },
				{ value: "tham-vong", label: "Tham vọng · 3" },
			],
		},
		{
			id: "trangThai",
			label: "Trạng thái",
			options: [
				{ value: "cong-bo", label: "Đã công bố · 6" },
				{ value: "cho-duyet", label: "Chờ duyệt · 1" },
			],
		},
	];
	if (!coKara) return chung;
	return [
		...chung,
		{
			id: MAT_GOP_Y,
			label: "Góp ý của Kara",
			options: [
				{ value: "cho", label: `Có góp ý chờ · ${DANH_SACH_LOC.length}` },
			],
		},
	];
}

export function DanhSachMucTieu({
	loc,
	hienTai = false,
}: {
	loc: boolean;
	hienTai?: boolean;
}) {
	const router = useRouter();
	const ds = loc ? DANH_SACH_LOC : DANH_SACH;
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2" data-loc-okr>
				<DataTableFacetMenu
					facets={facets(!hienTai)}
					filters={{ [MAT_GOP_Y]: loc ? ["cho"] : [] }}
					onFilterChange={(id, values) => {
						if (id !== MAT_GOP_Y) return;
						router.push(
							`?state=${values.includes("cho") ? STATE.aLoc : STATE.aDanhSach}`,
						);
					}}
				/>
				{loc ? (
					<Button asChild data-nut="bo-loc" size="sm" variant="ghost">
						<Link href={`?state=${STATE.aDanhSach}`}>Bỏ lọc</Link>
					</Button>
				) : null}
			</div>
			<BangMucTieu
				diemCam={hienTai ? {} : { nhanMucTieu: (mt) => <ChipGopY mt={mt} /> }}
				ds={ds}
				moSan="dau-tien"
			/>
		</div>
	);
}
