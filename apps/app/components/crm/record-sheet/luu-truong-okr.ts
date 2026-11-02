"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loiLuuTruong } from "@/components/crm/fields/kieu-truong";
import { crmMessages } from "@/lib/messages/crm";
import { okrMessages } from "@/lib/messages/okr";
import { savingField } from "@/lib/pending-field";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import {
	KHOA_TRUONG_OKR,
	type KhoaTruongOkr,
	type LuuTruongOkr,
	loiDoDaiOkr,
	type NhanTruongOkr,
} from "./truong-okr";

export function nhanTruongOkr(locale: Locale): NhanTruongOkr {
	const s = okrMessages(locale).sheet;
	return {
		truongTen: s.truongTen,
		truongViSao: s.truongViSao,
		truongNguoi: s.truongNguoi,
		goiYViSao: s.goiYViSao,
	};
}

export type DichLuuOkr = {
	loai: "muc-tieu" | "kr";
	id: string;
	objectiveId: string;
	giaTriCu: Readonly<Partial<Record<KhoaTruongOkr, string>>>;
};

type LoiLuu = { data?: { code?: string } | null } | null;

function nhanCuaKhoa(nhan: NhanTruongOkr, khoa: KhoaTruongOkr): string {
	if (khoa === KHOA_TRUONG_OKR.ten) return nhan.truongTen;
	if (khoa === KHOA_TRUONG_OKR.viSao) return nhan.truongViSao;
	return nhan.truongNguoi;
}

type BienLuuOkr = { id: string } & Partial<Record<KhoaTruongOkr, string>>;

export type LuuTaiChoOkr = {
	luu: LuuTruongOkr;
	dangLuu: (khoa: KhoaTruongOkr) => boolean;
};

function khoaCuaBien(bien: BienLuuOkr | undefined): KhoaTruongOkr | null {
	const khoa = Object.values(KHOA_TRUONG_OKR).find(
		(k) => bien !== undefined && k in bien,
	);
	return khoa ?? null;
}

export function useLuuTruongOkr(dich: DichLuuOkr): LuuTaiChoOkr {
	const locale = useLocale();
	const nhan = nhanTruongOkr(locale);
	const cauDoDai = okrMessages(locale).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();

	const baoLoi = (loi: LoiLuu, bien: BienLuuOkr | undefined) => {
		const khoa = khoaCuaBien(bien) ?? KHOA_TRUONG_OKR.ten;
		const tenO = nhanCuaKhoa(nhan, khoa);
		if (khoa === KHOA_TRUONG_OKR.nguoi && loi?.data?.code === "BAD_REQUEST") {
			toast.error(loiLuuTruong({ nhan: tenO, kieu: "USER" }, locale));
			return;
		}
		const m = crmMessages(locale).truongKieu;
		toast.error(`${m.chuaLuu(tenO)} ${m.tuChoi.khac}`);
	};
	const xong = {
		onSuccess: () => cache.okr(dich.objectiveId, { settle: "record" }),
	};

	const mucTieu = useMutation(
		trpc.okr.updateObjective.mutationOptions({
			...xong,
			onError: (loi, bien) => baoLoi(loi, bien),
		}),
	);
	const kr = useMutation(
		trpc.okr.updateKeyResult.mutationOptions({
			...xong,
			onError: (loi, bien) => baoLoi(loi, bien),
		}),
	);
	const dang = dich.loai === "muc-tieu" ? mucTieu : kr;
	const dangTheoKhoa = savingField({
		isPending: dang.isPending,
		variables: dang.variables ? { data: dang.variables } : undefined,
	});

	const luu: LuuTruongOkr = (khoa, giaTri) => {
		const moi = khoa === KHOA_TRUONG_OKR.nguoi ? giaTri : giaTri.trim();
		if (moi === (dich.giaTriCu[khoa] ?? "").trim()) return;
		const loiDoDai = loiDoDaiOkr(khoa, moi);
		if (loiDoDai) {
			toast.error(loiDoDai === "ten" ? cauDoDai.tenDoDai : cauDoDai.viSaoDai);
			return;
		}
		const bien: BienLuuOkr = { id: dich.id, [khoa]: moi };
		if (dich.loai === "muc-tieu") mucTieu.mutate(bien);
		else kr.mutate(bien);
	};

	return { luu, dangLuu: (khoa) => dangTheoKhoa(khoa) };
}
