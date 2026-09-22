import { setSystemTime } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { NHAC } from "@crm/db/onboarding-nhac";
import { LOAI_VIEC_NHAC, lenLichNhac } from "../../agent/lib/nhac-ke-hoach";
import {
	DAY_MS,
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	phan,
	TIEN_TO,
} from "./nhac-gieo";

export const HOM_QUA = -1;

export const HAN_XA = NHAC.moc[2];

export const PHUT_MS = 60 * 1000;

export const NGAY_NHAC = "2026-10-10";

export const NGAY_MAI = "2026-10-11";

export const PHUT_TRUOC = -1;

export const PHUT_SAU = 1;

export const MUOI_GIO_SANG = 90;

export const MOT_NGAY = 1;

const HAI_NGAY = 2;

export function lucVN(ngay: string, phutSauGioNhac: number): Date {
	const gio = String(NHAC.gio.gio).padStart(2, "0");
	const phut = String(NHAC.gio.phut).padStart(2, "0");
	const moc = new Date(`${ngay}T${gio}:${phut}:00+07:00`);
	return new Date(moc.getTime() + phutSauGioNhac * PHUT_MS);
}

export function ngayCach(goc: Date, soNgay: number): Date {
	return new Date(goc.getTime() + soNgay * DAY_MS);
}

export async function hangNhac() {
	return db.agentTask.findMany({
		where: { kind: LOAI_VIEC_NHAC, subject: { startsWith: `user:${TIEN_TO}` } },
		orderBy: { subject: "asc" },
	});
}

export async function hangCua(userId: string) {
	const hang = await db.agentTask.findFirst({
		where: { kind: LOAI_VIEC_NHAC, subject: { startsWith: `user:${userId}:` } },
	});
	if (!hang) throw new Error(`khong co hang nhac cua ${userId}`);
	return hang;
}

export async function quet(
	luc: Date,
): Promise<{ loi: string | null; so: number }> {
	setSystemTime(luc);
	const loi = await lenLichNhac(luc).then(
		() => null,
		(e: Error) => e.message,
	);
	return { loi, so: (await hangNhac()).length };
}

export async function gieoQuet() {
	await moXuong();
	const A = await gieoNguoi("An");
	const O = await gieoNguoi("Oanh");
	const N = await gieoNguoi("Nam");
	const goc = lucVN(NGAY_NHAC, 0);
	await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, -NHAC.imSauNgay),
		buoc: [{ nhan: "Tre", giao: A.id, han: ngayCach(goc, HOM_QUA) }],
	});
	return { A, O, N };
}

export function dongCo(text: string, chu: string): string[] {
	return text.split("\n").filter((d) => d.includes(chu));
}

export function lienKetCua(dong: string): string | null {
	return /<([^|>]+)\|/.exec(dong)?.[1] ?? null;
}

export async function gieoGui() {
	await moXuong();
	const A = await gieoNguoi("An");
	const O = await gieoNguoi("Oanh");
	await noiSlack(A.id);
	await khopSlack(A.id, "U-MN3-A");
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const moi = ngayCach(goc, HOM_QUA);
	const quaHan = await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: moi,
		buoc: [{ nhan: "Tre", giao: A.id, han: ngayCach(goc, HOM_QUA) }],
	});
	const sap1 = await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: moi,
		buoc: [{ nhan: "Sap mot", giao: A.id, han: ngayCach(goc, MOT_NGAY) }],
	});
	const sap2 = await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: moi,
		buoc: [
			{ nhan: "Sap hai", giao: A.id, han: ngayCach(goc, NHAC.sapHanNgay) },
		],
	});
	const im = await gieoKeHoach({
		camTrich: A.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, -NHAC.imSauNgay),
		buoc: [{ nhan: "Xa", giao: O.id, han: ngayCach(goc, HAN_XA) }],
	});
	return {
		A,
		goc,
		keHoach: [quaHan, sap1, sap2, im].map((k) => k.plan),
	};
}

export async function tenCongTy(planId: string): Promise<string> {
	const k = await db.onboardingPlan.findUniqueOrThrow({
		where: { id: planId },
		select: { company: { select: { name: true } } },
	});
	return k.company.name;
}

export async function gieoMuoiHai() {
	await moXuong();
	const A = await gieoNguoi("An");
	const O = await gieoNguoi("Oanh");
	await noiSlack(A.id);
	await khopSlack(A.id, "U-MN3-A");
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const soViec = NHAC.tran + 2;
	await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, HOM_QUA),
		buoc: Array.from({ length: soViec }, (_, i) => ({
			nhan: `Tre ${i}`,
			giao: A.id,
			han: ngayCach(goc, HOM_QUA - i),
		})),
	});
	return { A, goc };
}

export async function gieoKhongKenh() {
	await moXuong();
	const A = await gieoNguoi("An");
	const O = await gieoNguoi("Oanh");
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const k = await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, HOM_QUA),
		buoc: [{ nhan: "Tre", giao: A.id, han: ngayCach(goc, HOM_QUA) }],
	});
	setSystemTime(goc);
	await lenLichNhac(goc);
	return { A, goc, buoc: phan(k.buoc, 0) };
}

export type KyDo = { tu: Date; den: Date };

const IM_NGAN = 3;

const IM_DAI = 9;

const IM_DONG = HAN_XA;

export const TRUNG_VI = (IM_NGAN + IM_DAI) / 2;

const RANG = join(
	import.meta.dir,
	"../../../../_acceptance/may-nhac-truoc-nguoi/rang",
);

function docRang(tep: string): string {
	return readFileSync(join(RANG, tep), "utf8");
}

export async function trungViIm(luc: Date): Promise<number | null> {
	const [hang] = await db.$queryRawUnsafe<{ trung_vi: number | null }[]>(
		docRang("ngay-im-trung-vi.sql"),
		luc,
	);
	return hang?.trung_vi ?? null;
}

export async function xongDungHan(tu: Date, den: Date) {
	const [hang] = await db.$queryRawUnsafe<{ dung: number; mau: number }[]>(
		docRang("xong-dung-han-sau-nhac.sql"),
		tu,
		den,
	);
	return { dung: hang?.dung, mau: hang?.mau };
}

export async function gieoDuongDo() {
	await moXuong();
	const A = await gieoNguoi("An");
	const O = await gieoNguoi("Oanh");
	await noiSlack(A.id);
	await khopSlack(A.id, "U-MN3-A");
	const gui = lucVN(NGAY_NHAC, PHUT_SAU);
	const do_ = ngayCach(gui, IM_NGAN);
	const soTre = NHAC.tran - 2;
	const x = await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(gui, -HAN_XA),
		imTu: ngayCach(gui, HAI_NGAY * HOM_QUA),
		buoc: [
			{ nhan: "Sap xong", giao: A.id, han: ngayCach(gui, MOT_NGAY) },
			{ nhan: "Sap chua", giao: A.id, han: ngayCach(gui, HAI_NGAY) },
			{ nhan: "Sap bi cat", giao: A.id, han: ngayCach(gui, NHAC.sapHanNgay) },
			{ nhan: "Xong truoc gui", giao: A.id, han: ngayCach(gui, HAI_NGAY) },
		],
	});
	await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(gui, -HAN_XA),
		imTu: ngayCach(do_, -IM_DAI),
		buoc: Array.from({ length: soTre }, (_, i) => ({
			nhan: `Tre ${i}`,
			giao: A.id,
			han: ngayCach(gui, HOM_QUA - i),
		})),
	});
	await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(gui, -HAN_XA),
		dong: true,
		imTu: ngayCach(do_, -IM_DONG),
		buoc: [{ nhan: "Dong", giao: A.id, han: ngayCach(gui, HOM_QUA) }],
	});
	return {
		A,
		gui,
		do_,
		sapXong: phan(x.buoc, 0),
		sapChua: phan(x.buoc, 1),
		biCat: phan(x.buoc, 2),
		xongTruoc: phan(x.buoc, 3),
	};
}
