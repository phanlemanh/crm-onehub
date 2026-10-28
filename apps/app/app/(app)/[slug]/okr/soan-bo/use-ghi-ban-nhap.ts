"use client";

import { docSoOkr } from "@crm/validation/okr-kr";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import {
	type BanNhap,
	boDong,
	giuDong,
	type KrNhap,
	type MtNhap,
	suaKrCo,
	suaKr as suaKrNhap,
	suaMucTieu,
	suaTenCo,
	suaViSao,
	suaViSaoCo,
} from "./ban-nhap";
import { SOAN_BO } from "./cau-hinh";
import { type DongKrNhap, dongKrTrong, donViMucTieuCua } from "./du-lieu-bo";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { BoSoan, MucTieuSoan } from "./use-bo-soan";
import type { LuuDong } from "./use-luu-dong";

type BoXong = Extract<BoSoan, { trang: "xong" }>;

type KrSoan = MucTieuSoan["keyResults"][number];

export type MtCuaKr = { khoa: string; idCoSan: string | null };

type GiaKr = {
	title: string;
	startValue: number;
	targetValue: number;
	unit: string;
	ownerUserId: string;
};

type DoiKr = Partial<GiaKr> & { currentValue?: number };

export type GhiBanNhap = {
	luuMucTieu: (mt: MtNhap) => void;
	luuKr: (mt: MtCuaKr, kr: KrNhap) => void;
	luuTenCo: (mt: MucTieuSoan, ten: string) => void;
	luuViSaoCo: (mt: MucTieuSoan, viSao: string) => void;
	luuKrCo: (
		mt: MucTieuSoan,
		kr: KrSoan,
		gia: DongKrNhap,
		khoaSo: boolean,
	) => void;
	xoaKr: (khoa: string, id: string | null, mtId: string | null) => void;
	xoaMucTieu: (khoa: string, id: string, khoaKr: readonly string[]) => void;
};

const soCua = (chu: string): number | null =>
	chu.trim() === "" ? null : docSoOkr(chu);

const CHU_TRONG: Pick<DongKrNhap, "ten" | "khoi" | "dich" | "donVi"> = {
	ten: "",
	khoi: "",
	dich: "",
	donVi: "",
};

const giaGoc = (kr: KrSoan): GiaKr => ({
	title: kr.title,
	startValue: kr.startValue,
	targetValue: kr.targetValue,
	unit: kr.unit,
	ownerUserId: kr.owner.id,
});

const doiNeuKhac = <K extends keyof GiaKr>(
	khoa: K,
	cu: GiaKr,
	moi: Partial<GiaKr>,
): Partial<GiaKr> => {
	const gia = moi[khoa];
	return gia !== undefined && gia !== cu[khoa] ? { [khoa]: gia } : {};
};

function khacGia(cu: GiaKr, moi: Partial<GiaKr>): Partial<GiaKr> {
	return {
		...doiNeuKhac("title", cu, moi),
		...doiNeuKhac("startValue", cu, moi),
		...doiNeuKhac("targetValue", cu, moi),
		...doiNeuKhac("unit", cu, moi),
		...doiNeuKhac("ownerUserId", cu, moi),
	};
}

const rong = (doi: Partial<GiaKr>) => Object.keys(doi).length === 0;

export function useGhiBanNhap(
	bo: BoXong,
	luuDong: LuuDong,
	datBanNhap: (doi: (bn: BanNhap) => BanNhap) => void,
): GhiBanNhap {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const phuThuoc = usePhuThuocSoan();
	const taoMt = useMutation(trpc.okr.createObjective.mutationOptions());
	const suaMt = useMutation(trpc.okr.updateObjective.mutationOptions());
	const taoKr = useMutation(trpc.okr.createKeyResult.mutationOptions());
	const suaKr = useMutation(trpc.okr.updateKeyResult.mutationOptions());
	const boKr = useMutation(trpc.okr.removeKeyResult.mutationOptions());
	const boMt = useMutation(trpc.okr.xoaMucTieu.mutationOptions());
	const tenDaGui = useRef<ReadonlyMap<string, string>>(new Map());
	const viSaoDaGui = useRef<ReadonlyMap<string, string>>(new Map());
	const krDaGui = useRef<ReadonlyMap<string, GiaKr>>(new Map());

	const sauLoi = (xoaChu: () => void) => {
		bo.thuLai();
		if (!phuThuoc.giuChuKhiLoiLuu) xoaChu();
	};

	const guiMotLan = (
		khoa: string,
		dau: string,
		viec: (id: string | null) => Promise<{ id: string }>,
		xoaChu: () => void,
	) => {
		luuDong.chuaLuu(khoa, null);
		luuDong.guiMotLan(khoa, dau, async (id) => {
			try {
				const kq = await viec(id);
				void cache.okr(kq.id);
				return kq;
			} catch (loi) {
				sauLoi(xoaChu);
				throw loi;
			}
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
		const whyNow = mt.viSao.trim();
		guiMotLan(
			mt.khoa,
			JSON.stringify({ title, whyNow }),
			(id) =>
				id
					? suaMt.mutateAsync({ id, title, whyNow })
					: taoMt.mutateAsync({
							cycleId: bo.khoa.cycleId,
							unit: donViMucTieuCua(bo.khoa.don),
							title,
							kind: "cam-ket",
							ownerUserId: bo.nguoiMacDinh,
							participantIds: [],
							whyNow,
							hienThi: "cong-khai",
						}),
			() =>
				datBanNhap((bn) => suaViSao(suaMucTieu(bn, mt.khoa, ""), mt.khoa, "")),
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
		guiMotLan(
			kr.khoa,
			JSON.stringify(goiDi),
			async (id) =>
				id
					? suaKr.mutateAsync({ id, ...goiDi })
					: taoKr.mutateAsync({
							objectiveId: await idMucTieu(mt),
							...goiDi,
							dueOn: null,
							weight: 1,
						}),
			() => datBanNhap((bn) => suaKrNhap(bn, mt.khoa, kr.khoa, CHU_TRONG)),
		);
	};

	const datDaGui = (
		so: { current: ReadonlyMap<string, string> },
		id: string,
		chu: string | null,
	) => {
		const moi = new Map(so.current);
		if (chu === null) moi.delete(id);
		else moi.set(id, chu);
		so.current = moi;
	};

	const datTenDaGui = (id: string, ten: string | null) =>
		datDaGui(tenDaGui, id, ten);

	const tenMuon = useRef<ReadonlyMap<string, string>>(new Map());
	const viSaoMuon = useRef<ReadonlyMap<string, string>>(new Map());

	const doiMucTieuCo = (mt: MucTieuSoan) => {
		const title = (tenMuon.current.get(mt.id) ?? mt.title).trim();
		const whyNow = (viSaoMuon.current.get(mt.id) ?? mt.whyNow).trim();
		const tenTruoc = tenDaGui.current.get(mt.id) ?? mt.title;
		const viSaoTruoc = viSaoDaGui.current.get(mt.id) ?? mt.whyNow;
		return {
			...(title.length >= SOAN_BO.tenToiThieu && title !== tenTruoc
				? { title }
				: {}),
			...(whyNow !== viSaoTruoc ? { whyNow } : {}),
		};
	};

	const dongBoMucTieuCo = (mt: MucTieuSoan) => {
		const ten = (tenMuon.current.get(mt.id) ?? mt.title).trim();
		if (ten.length < SOAN_BO.tenToiThieu) {
			luuDong.chuaLuu(mt.id, "thieu-ten");
			return;
		}
		luuDong.chuaLuu(mt.id, null);
		if (Object.keys(doiMucTieuCo(mt)).length === 0) return;
		luuDong.luu(mt.id, async () => {
			const doi = doiMucTieuCo(mt);
			if (Object.keys(doi).length === 0) return { id: mt.id };
			const tenTruoc = tenDaGui.current.get(mt.id) ?? null;
			const viSaoTruoc = viSaoDaGui.current.get(mt.id) ?? null;
			if (doi.title !== undefined) datTenDaGui(mt.id, doi.title);
			if (doi.whyNow !== undefined) datDaGui(viSaoDaGui, mt.id, doi.whyNow);
			try {
				const kq = await suaMt.mutateAsync({ id: mt.id, ...doi });
				void cache.okr(mt.id);
				return kq;
			} catch (loi) {
				if (doi.title !== undefined) datTenDaGui(mt.id, tenTruoc);
				if (doi.whyNow !== undefined) datDaGui(viSaoDaGui, mt.id, viSaoTruoc);
				sauLoi(() => {
					if (doi.title !== undefined) datDaGui(tenMuon, mt.id, null);
					if (doi.whyNow !== undefined) datDaGui(viSaoMuon, mt.id, null);
					datBanNhap((bn) => {
						const boTen =
							doi.title !== undefined ? suaTenCo(bn, mt.id, "") : bn;
						return doi.whyNow !== undefined
							? suaViSaoCo(boTen, mt.id, "")
							: boTen;
					});
				});
				throw loi;
			}
		});
	};

	const luuTenCo = (mt: MucTieuSoan, ten: string) => {
		datDaGui(tenMuon, mt.id, ten);
		dongBoMucTieuCo(mt);
	};

	const luuViSaoCo = (mt: MucTieuSoan, viSao: string) => {
		datDaGui(viSaoMuon, mt.id, viSao);
		dongBoMucTieuCo(mt);
	};

	const datKrDaGui = (id: string, gia: GiaKr | null) => {
		const moi = new Map(krDaGui.current);
		if (gia === null) moi.delete(id);
		else moi.set(id, gia);
		krDaGui.current = moi;
	};

	const luuKrCo = (
		mt: MucTieuSoan,
		kr: KrSoan,
		gia: DongKrNhap,
		khoaSo: boolean,
	) => {
		const kq = phuThuoc.kiemDong({ ...gia, kieu: kr.kind });
		if (kq.loai === "chua-luu") {
			luuDong.chuaLuu(kr.id, kq.ly);
			return;
		}
		const moi: Partial<GiaKr> = khoaSo
			? { title: gia.ten.trim() }
			: {
					title: gia.ten.trim(),
					startValue: kq.khoi,
					targetValue: kq.dich,
					unit: gia.donVi.trim(),
					ownerUserId: gia.nguoi ?? kr.owner.id,
				};
		const coSo = () => krDaGui.current.get(kr.id) ?? giaGoc(kr);
		luuDong.chuaLuu(kr.id, null);
		if (rong(khacGia(coSo(), moi))) return;
		luuDong.luu(kr.id, async () => {
			const truoc = coSo();
			const doi = khacGia(truoc, moi);
			if (rong(doi)) return { id: kr.id };
			const goiDi: DoiKr =
				doi.startValue !== undefined && mt.status === "nhap"
					? { ...doi, currentValue: doi.startValue }
					: doi;
			datKrDaGui(kr.id, { ...truoc, ...doi });
			try {
				const kqGui = await suaKr.mutateAsync({ id: kr.id, ...goiDi });
				void cache.okr(mt.id);
				return kqGui;
			} catch (loi) {
				datKrDaGui(kr.id, truoc);
				sauLoi(() => datBanNhap((bn) => suaKrCo(bn, kr.id, CHU_TRONG)));
				throw loi;
			}
		});
	};

	const xoaKr = (khoa: string, id: string | null, mtId: string | null) => {
		datBanNhap((bn) => boDong(bn, khoa));
		luuDong.quen([khoa]);
		if (id === null && !luuDong.dangLuu(khoa)) return;
		luuDong.luu(khoa, async (idDaLuu) => {
			const idXoa = id ?? idDaLuu;
			if (idXoa === null) return { id: khoa };
			try {
				await boKr.mutateAsync({ id: idXoa });
				void cache.okr(mtId ?? undefined);
				return { id: idXoa };
			} catch (loi) {
				datBanNhap((bn) => giuDong(bn, khoa));
				throw loi;
			}
		});
	};

	const xoaMucTieu = (khoa: string, id: string, khoaKr: readonly string[]) => {
		luuDong.luu(khoa, async () => {
			await boMt.mutateAsync({ id });
			datBanNhap((bn) => boDong(bn, khoa));
			luuDong.quen([khoa, ...khoaKr]);
			void cache.okr(id);
			return { id };
		});
	};

	return {
		luuMucTieu,
		luuKr,
		luuTenCo,
		luuViSaoCo,
		luuKrCo,
		xoaKr,
		xoaMucTieu,
	};
}
