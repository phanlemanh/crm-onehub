"use client";

import { docSoOkr } from "@crm/validation/okr-kr";
import { useMutation } from "@tanstack/react-query";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { KrNhap, MtNhap } from "./ban-nhap";
import { SOAN_BO } from "./cau-hinh";
import { dongKrTrong, donViMucTieuCua } from "./du-lieu-bo";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { BoSoan } from "./use-bo-soan";
import type { LuuDong } from "./use-luu-dong";

type BoXong = Extract<BoSoan, { trang: "xong" }>;

export type MtCuaKr = { khoa: string; idCoSan: string | null };

export type GhiBanNhap = {
	luuMucTieu: (mt: MtNhap) => void;
	luuKr: (mt: MtCuaKr, kr: KrNhap) => void;
};

const soCua = (chu: string): number | null =>
	chu.trim() === "" ? null : docSoOkr(chu);

export function useGhiBanNhap(bo: BoXong, luuDong: LuuDong): GhiBanNhap {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const phuThuoc = usePhuThuocSoan();
	const taoMt = useMutation(trpc.okr.createObjective.mutationOptions());
	const suaMt = useMutation(trpc.okr.updateObjective.mutationOptions());
	const taoKr = useMutation(trpc.okr.createKeyResult.mutationOptions());
	const suaKr = useMutation(trpc.okr.updateKeyResult.mutationOptions());

	const guiMotLan = (
		khoa: string,
		dau: string,
		viec: (id: string | null) => Promise<{ id: string }>,
	) => {
		luuDong.chuaLuu(khoa, null);
		luuDong.guiMotLan(khoa, dau, async (id) => {
			const kq = await viec(id);
			void cache.okr(kq.id);
			return kq;
		});
	};

	const luuMucTieu = (mt: MtNhap) => {
		const title = mt.ten.trim();
		if (title === "") {
			luuDong.chuaLuu(mt.khoa, null);
			return;
		}
		if (title.length < SOAN_BO.tenToiThieu) {
			luuDong.chuaLuu(mt.khoa, "thieu-ten");
			return;
		}
		guiMotLan(mt.khoa, title, (id) =>
			id
				? suaMt.mutateAsync({ id, title })
				: taoMt.mutateAsync({
						cycleId: bo.khoa.cycleId,
						unit: donViMucTieuCua(bo.khoa.don),
						title,
						kind: "cam-ket",
						ownerUserId: bo.nguoiMacDinh,
						participantIds: [],
						whyNow: "",
						hienThi: "cong-khai",
					}),
		);
	};

	const idMucTieu = async (mt: MtCuaKr): Promise<string> => {
		const id = mt.idCoSan ?? (await luuDong.choId(mt.khoa));
		if (id === null) throw new Error("muc-tieu-chua-luu");
		return id;
	};

	const luuKr = (mt: MtCuaKr, kr: KrNhap) => {
		if (dongKrTrong(kr)) {
			luuDong.chuaLuu(kr.khoa, null);
			return;
		}
		const kieu = kr.kieu ?? phuThuoc.suyKieu(soCua(kr.khoi), soCua(kr.dich));
		const kq = phuThuoc.kiemDong({ ...kr, kieu });
		if (kq.loai === "chua-luu") {
			luuDong.chuaLuu(kr.khoa, kq.ly);
			return;
		}
		const coMucTieu =
			mt.idCoSan !== null ||
			luuDong.id(mt.khoa) !== null ||
			luuDong.dangLuu(mt.khoa);
		if (!coMucTieu) {
			luuDong.chuaLuu(kr.khoa, "muc-tieu-chua-luu");
			return;
		}
		const goiDi = {
			title: kr.ten.trim(),
			kind: kq.kieu,
			ownerUserId: kr.nguoi ?? bo.nguoiMacDinh,
			startValue: kq.khoi,
			targetValue: kq.dich,
			currentValue: kq.khoi,
			unit: kr.donVi.trim(),
		};
		guiMotLan(kr.khoa, JSON.stringify(goiDi), async (id) =>
			id
				? suaKr.mutateAsync({ id, ...goiDi })
				: taoKr.mutateAsync({
						objectiveId: await idMucTieu(mt),
						...goiDi,
						dueOn: null,
						weight: 1,
					}),
		);
	};

	return { luuMucTieu, luuKr };
}
