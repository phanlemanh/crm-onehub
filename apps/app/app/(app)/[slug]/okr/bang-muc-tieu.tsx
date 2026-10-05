"use client";

import { useQueryState } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import type { DiemCam } from "./diem-cam";
import { KhoiMucTieu } from "./khoi-muc-tieu";
import type { MucTieu } from "./kieu";
import { chuanThuMucTieu, parseAsThuMucTieu } from "./okr-search-params";

export function BangMucTieu({
	ds,
	hienDonVi,
	danhDauCuaToi,
	diemCam,
	dangMo,
	onDoiMo,
}: {
	ds: MucTieu[];
	hienDonVi: boolean;
	danhDauCuaToi: boolean;
	diemCam?: DiemCam;
	dangMo?: ReadonlySet<string>;
	onDoiMo?: (id: string) => void;
}) {
	const [thu, setThu] = useQueryState(
		SEARCH_PARAM.okr.thuMucTieu,
		parseAsThuMucTieu,
	);
	const daThu = new Set(chuanThuMucTieu(thu));
	const moCua = (id: string) => (dangMo ? dangMo.has(id) : !daThu.has(id));
	const doiMo = (id: string) => {
		if (onDoiMo) {
			onDoiMo(id);
			return;
		}
		const conLai = [...daThu];
		const sau = daThu.has(id)
			? conLai.filter((x) => x !== id)
			: [...conLai, id];
		void setThu(sau.length > 0 ? sau : null);
	};
	return (
		<div className="flex flex-col gap-3">
			{ds.map((mt) => (
				<KhoiMucTieu
					danhDauCuaToi={danhDauCuaToi}
					diemCam={diemCam}
					doiMo={() => doiMo(mt.id)}
					hienDonVi={hienDonVi}
					key={mt.id}
					mo={moCua(mt.id)}
					mucTieu={mt}
				/>
			))}
		</div>
	);
}
