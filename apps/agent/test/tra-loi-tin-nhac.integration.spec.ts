import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import * as loiChung from "@crm/db/onboarding-buoc";
import { type LoaiNhac, NHAC, viecCanNhac } from "@crm/db/onboarding-nhac";
import { ghiSai, taoMaLienKet, ZALO_LIEN_KET } from "@crm/db/zalo-lien-ket";
import { onboardingActivityMeta } from "@crm/validation/onboarding-activity";
import { timelineInput } from "../../api/src/activities/activities.contracts";
import { ActivitiesService } from "../../api/src/activities/activities.service";
import { ActivityStampService } from "../../api/src/crm/activity-stamp.service";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { dungTin } from "../agent/lib/tin-nhac";
import { gioNhac } from "../agent/lib/zalo-bot-xuong";
import { ZALO } from "../agent/lib/zalo-config";
import { donDep, gieoNguoi, xongBuoc } from "./support/nhac-gieo";
import { lucVN, NGAY_MAI, NGAY_NHAC, PHUT_SAU } from "./support/nhac-gui-gieo";
import {
	APP_URL,
	batBot,
	buocCuaMuc,
	buocTheoId,
	buocXongLuc,
	type ChonGieo,
	demDaThay,
	demVetZalo,
	donTraLoi,
	gieoNhac,
	guiNhac,
	hangHomNay,
	nhan,
	noiZalo,
	phanTu,
	vetXong,
	voiToken,
	xongLucCua,
} from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const GOC = lucVN(NGAY_NHAC, PHUT_SAU);

const TIEU_DE = {
	"buoc-qua-han": "Quá hạn",
	"buoc-sap-han": "Sắp hạn",
	"ke-hoach-im": "Kế hoạch im",
	"moc-ngay": "Mốc ngày",
} as const satisfies { [K in LoaiNhac]: string };

const DANH_SO = /^(\d+)\. /;

function dongDanhSo(text: string): string[] {
	return text.split("\n").filter((d) => DANH_SO.test(d));
}

function tieuDeTren(text: string, dong: string): string | undefined {
	const cac = text.split("\n");
	const tieuDe = new Set(Object.values(TIEU_DE));
	return cac
		.slice(0, cac.indexOf(dong))
		.reverse()
		.find((d) => tieuDe.has(d));
}

beforeEach(async () => {
	await donTraLoi();
	await batBot();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donTraLoi();
	await donDep();
});

describe("danh-so", () => {
	test("danh-so: dong n cua tin Zalo thuoc daGui[n-1], goi y mot dong, trong tran, Slack khong so", async () => {
		let daChay = 0;

		const { A } = await gieoNhac(GOC, {
			quaHan: 1,
			sapHan: 1,
			im: true,
			moc: true,
		});
		await noiZalo(A.id, "ZA");
		const bon = await guiNhac(A.id, GOC);
		expect(bon.kenh, "o zalo-bon di qua Zalo").toBe("zalo");
		expect(
			bon.daGui.map((m) => m.loai),
			"du bon loai",
		).toEqual(["buoc-qua-han", "buoc-sap-han", "ke-hoach-im", "moc-ngay"]);
		const dong = dongDanhSo(bon.text);
		expect(dong.length, "so dong danh so = daGui.length").toBe(
			bon.daGui.length,
		);
		dong.forEach((d, i) => {
			const n = i + 1;
			const muc = phanTu(bon.daGui, n);
			expect(d.startsWith(`${n}. `), `dong ${n} bat dau "${n}. "`).toBe(true);
			expect(
				d.endsWith(`?record=plan:${muc.planId}`),
				`dong n thuoc daGui[n-1]: dong ${n}`,
			).toBe(true);
			expect(tieuDeTren(bon.text, d), `tieu de cua dong ${n}`).toBe(
				TIEU_DE[muc.loai],
			);
		});
		expect(
			bon.text.split("\n").filter((d) => d.includes("xong 2")).length,
			"dung mot dong goi y",
		).toBe(1);
		daChay += 1;

		const { A: M } = await gieoNhac(
			GOC,
			{ quaHan: NHAC.tran + 2, tenDai: true },
			"Minh",
		);
		await noiZalo(M.id, "ZM");
		const dai = await guiNhac(M.id, GOC);
		expect(dai.text.length, "khong vuot tran").toBeLessThanOrEqual(
			ZALO.tranKyTu,
		);
		expect(dai.daGui.length, "tran thuc su cat bot dong").toBeLessThan(
			NHAC.tran,
		);
		expect(dongDanhSo(dai.text).length, "so dong danh so = daGui.length").toBe(
			dai.daGui.length,
		);
		daChay += 1;

		const { A: B } = await gieoNhac(
			GOC,
			{ quaHan: 1, sapHan: 1, im: true, moc: true },
			"Binh",
		);
		const slack = await guiNhac(B.id, GOC, { slack: true });
		expect(slack.kenh, "o slack di qua Slack").toBe("slack");
		expect(slack.text.length, "Slack co tin").toBeGreaterThan(0);
		expect(dongDanhSo(slack.text), "Slack khong danh so").toEqual([]);
		expect(slack.text.includes("xong 2"), "Slack khong goi y").toBe(false);
		daChay += 1;

		expect(daChay, "so o thuc chay").toBe(3);
	});

	test("danh-so: tran sat, dong goi y tinh vao tran", async () => {
		const { A } = await gieoNhac(GOC, { quaHan: 3 }, "Sat");
		const viec =
			(
				await viecCanNhac(db, { now: GOC, userId: A.id, cuaSo: "buoi-sang" })
			).get(A.id) ?? [];
		expect(viec.length, "du ba viec").toBe(3);
		const khongLienKet = () => null;
		const du = dungTin(
			"Sat",
			viec,
			khongLienKet,
			"tron",
			Number.POSITIVE_INFINITY,
			ZALO.loi.goiY,
		);
		const tran = du.text.length - 1;
		const sat = dungTin("Sat", viec, khongLienKet, "tron", tran, ZALO.loi.goiY);
		expect(
			sat.text.length,
			"khong vuot tran khi tin sat tran",
		).toBeLessThanOrEqual(tran);
		expect(sat.daGui.length, "tran sat cat mot dong").toBe(viec.length - 1);
		expect(sat.text.includes(ZALO.loi.goiY), "van giu dong goi y").toBe(true);
	});
});

const LUC = lucVN(NGAY_NHAC, PHUT_SAU + 30);

let demZalo = 0;

function zaloMoi(): string {
	demZalo += 1;
	return `ZT${demZalo}`;
}

async function coNhac(chon: ChonGieo, ten: string, luc = GOC) {
	const { A } = await gieoNhac(luc, chon, ten);
	const zid = zaloMoi();
	await noiZalo(A.id, zid);
	const gui = await guiNhac(A.id, luc);
	expect(gui.kenh, `${ten}: tin nhac di qua Zalo`).toBe("zalo");
	return { A, zid, daGui: gui.daGui };
}

function soTrong(phan: string): number[] {
	return [...phan.matchAll(/(?:^|; |: )(\d+) · /g)].map((m) => Number(m[1]));
}

function motTraLoi(tra: string[]): string {
	expect(tra.length, "dung mot tin tra loi").toBe(1);
	const cau = tra[0] ?? "";
	expect(cau.includes("\n"), "tra loi mot dong").toBe(false);
	return cau;
}

describe("xong-mot", () => {
	test("xong-mot: xong 2 danh dau dung buoc muc 2, dau vet dung ten nguoi nhan, doc qua API", async () => {
		const { A, zid, daGui } = await coNhac({ quaHan: 2, sapHan: 1 }, "Xmot");
		const S = await buocTheoId(buocCuaMuc(daGui, 2));
		const truoc = await xongLucCua(daGui);
		const { tra } = await nhan(zid, "xong 2", LUC);
		expect(await buocXongLuc(S.id), "muc 2 la S").not.toBeNull();
		const vet = await vetXong(S.id);
		expect(vet.length, "dung mot dau vet cho S").toBe(1);
		const v = phanTu(vet, 1);
		expect(v.meta, "source zalo").toEqual({
			kind: "buoc.xong",
			stepId: S.id,
			nhan: S.label,
			giaoLucXong: S.assigneeId,
			source: "zalo",
		});
		expect({ nguoi: v.createdById, keHoach: v.planId }).toEqual({
			nguoi: A.id,
			keHoach: S.planId,
		});
		const sau = await xongLucCua(daGui);
		expect(
			sau.filter((_, i) => i !== 1),
			"cac buoc khac giu nguyen",
		).toEqual(truoc.filter((_, i) => i !== 1));
		const cau = motTraLoi(tra);
		expect(cau, "cap so va nhan").toContain(`2 · ${S.label}`);
		expect(cau).toContain(S.plan.company.name);

		const api = new ActivitiesService(db, new ActivityStampService(db));
		const dong = await api.timeline(
			timelineInput.parse({ planId: S.planId, limit: 50 }),
		);
		const cuaS = dong.entries.filter(
			(e) =>
				e.type === "PLAN_CHANGE" &&
				onboardingActivityMeta.safeParse(e.meta).data?.stepId === S.id,
		);
		expect(cuaS.length, "dong thoi gian API co dung mot muc cua S").toBe(1);
		expect(
			onboardingActivityMeta.safeParse(phanTu(cuaS, 1).meta).success,
			"meta doc duoc bang schema",
		).toBe(true);

		const T = buocCuaMuc(daGui, 1);
		await nhan(zid, "xong 1", LUC);
		expect(
			await buocXongLuc(T),
			"doi chung: xong 1 danh dau muc 1",
		).not.toBeNull();
		expect((await vetXong(S.id)).length, "S khong them dau vet").toBe(1);
	});
});

describe("xong-mot", () => {
	test("xong-mot: cau xac nhan dai van trong tran ky tu", async () => {
		const { zid, daGui } = await coNhac(
			{ quaHan: NHAC.tran, tenDai: true },
			"Dai",
		);
		const so = daGui.map((_, i) => i + 1).join(" ");
		const { tra } = await nhan(zid, `xong ${so}`, LUC);
		const cau = motTraLoi(tra);
		expect(cau.length, "cau xac nhan trong tran").toBeLessThanOrEqual(
			ZALO.tranKyTu,
		);
		expect(await xongLucCua(daGui), "moi buoc xong").not.toContain(null);
	});
});

describe("nhieu-so", () => {
	test("nhieu-so: nam cach viet deu danh dau muc 1 va 3", async () => {
		const O = [
			"Xong 1 3",
			"xong 1,3",
			"done 1 3",
			"  XONG  1 , 3 ",
			"xong 3 1 3",
		];
		let daChay = 0;
		for (const [i, chu] of O.entries()) {
			const { zid, daGui } = await coNhac({ quaHan: 3 }, `Nhieu${i}`);
			const mot = await buocTheoId(buocCuaMuc(daGui, 1));
			const ba = await buocTheoId(buocCuaMuc(daGui, 3));
			const truocVet = await demVetZalo();
			const { tra } = await nhan(zid, chu, LUC);
			expect(await buocXongLuc(mot.id), `o ${chu}: muc 1`).not.toBeNull();
			expect(await buocXongLuc(ba.id), `o ${chu}: muc 3`).not.toBeNull();
			expect(
				(await demVetZalo()) - truocVet,
				`o ${chu}: dem Activity = 2`,
			).toBe(2);
			const cau = motTraLoi(tra);
			expect(cau, `o ${chu}: cap 1`).toContain(`1 · ${mot.label}`);
			expect(cau, `o ${chu}: cap 3`).toContain(`3 · ${ba.label}`);
			daChay += 1;
		}
		expect(daChay, "so o thuc chay").toBe(5);
	});
});

describe("ngoai-dai", () => {
	test("ngoai-dai: xong 2 9 khong danh dau gi, neu 9 va dai 1–4", async () => {
		const { zid, daGui } = await coNhac(
			{ quaHan: 1, sapHan: 1, im: true, moc: true },
			"Ngoai",
		);
		const truoc = await xongLucCua(daGui);
		const truocVet = await demVetZalo();
		const { tra } = await nhan(zid, "xong 2 9", LUC);
		expect(await xongLucCua(daGui), "duoc ca hoac khong").toEqual(truoc);
		expect(await demVetZalo(), "khong dau vet moi").toBe(truocVet);
		const cau = motTraLoi(tra);
		expect(cau).toContain("9");
		expect(cau).toContain("1–4");
		await nhan(zid, "xong 2", LUC);
		expect(
			await buocXongLuc(buocCuaMuc(daGui, 2)),
			"doi chung: muc 2 lam duoc",
		).not.toBeNull();
	});
});

describe("khong-phai-buoc", () => {
	test("khong-phai-buoc: im va moc chan ca lenh, duong dan theo APP_URL", async () => {
		const cu = process.env.APP_URL;
		let daChay = 0;
		try {
			for (const loai of ["ke-hoach-im", "moc-ngay"] as const) {
				for (const appUrl of [APP_URL, null]) {
					if (appUrl) process.env.APP_URL = appUrl;
					else delete process.env.APP_URL;
					const { zid, daGui } = await coNhac(
						{ quaHan: 1, sapHan: 1, im: true, moc: true },
						`Kpb${daChay}`,
					);
					const k = daGui.findIndex((m) => m.loai === loai) + 1;
					const P = phanTu(daGui, k).planId;
					const truoc = await xongLucCua(daGui);
					const truocVet = await demVetZalo();
					const { tra } = await nhan(zid, `xong 1 ${k}`, LUC);
					const o = `o ${loai} ${appUrl ? "co" : "vang"} APP_URL`;
					expect(
						await xongLucCua(daGui),
						`${o}: muc khong phai buoc chan ca lenh`,
					).toEqual(truoc);
					expect(await demVetZalo(), `${o}: khong dau vet`).toBe(truocVet);
					const cau = motTraLoi(tra);
					expect(cau, `${o}: neu so`).toContain(`Mục ${k}`);
					if (appUrl) expect(cau, o).toContain(`?record=plan:${P}`);
					else expect(cau.includes("http"), o).toBe(false);
					daChay += 1;
				}
			}
		} finally {
			if (cu === undefined) delete process.env.APP_URL;
			else process.env.APP_URL = cu;
		}
		expect(daChay, "so o thuc chay").toBe(4);
	});
});

describe("trang-thai-buoc", () => {
	test("trang-thai-buoc: da xong truoc, da xoa, ke hoach dong", async () => {
		let daChay = 0;
		{
			const { A, zid, daGui } = await coNhac({ quaHan: 3 }, "DaXong");
			const hai = buocCuaMuc(daGui, 2);
			const ba = buocCuaMuc(daGui, 3);
			await xongBuoc(hai, A.id);
			const vetHai = (await vetXong(hai)).length;
			const { tra } = await nhan(zid, "xong 2 3", LUC);
			expect(await buocXongLuc(ba), "o da-xong: muc 3").not.toBeNull();
			expect(
				(await vetXong(hai)).length,
				"o da-xong: muc 2 khong them vet",
			).toBe(vetHai);
			const [vua = "", truoc = ""] = motTraLoi(tra).split(
				ZALO.loi.mocDaXongTruoc,
			);
			expect(
				{ vua: soTrong(vua), truoc: soTrong(truoc) },
				"3 vua xong, 2 da xong tu truoc",
			).toEqual({ vua: [3], truoc: [2] });
			daChay += 1;
		}
		for (const o of ["da-xoa", "ke-hoach-dong"] as const) {
			const { zid, daGui } = await coNhac({ quaHan: 3 }, `Doi${o}`);
			const hai = await buocTheoId(buocCuaMuc(daGui, 2));
			const ba = buocCuaMuc(daGui, 3);
			if (o === "da-xoa")
				await db.onboardingStep.delete({ where: { id: hai.id } });
			else
				await db.onboardingPlan.update({
					where: { id: hai.planId },
					data: { closedAt: LUC },
				});
			const truocVet = await demVetZalo();
			const { tra, messageId } = await nhan(zid, "xong 2 3", LUC);
			expect(await buocXongLuc(ba), `o ${o}: buoc mat chan ca lenh`).toBeNull();
			expect(await demVetZalo(), `o ${o}: khong dau vet`).toBe(truocVet);
			expect(motTraLoi(tra), `o ${o}: neu 2`).toContain("Mục 2");
			expect(await demDaThay(messageId), `o ${o}: tin khong bi gui lai`).toBe(
				1,
			);
			daChay += 1;
		}
		expect(daChay, "so o thuc chay").toBe(3);
	});
});

describe("tin-hom-nay", () => {
	test("tin-hom-nay: chi tin nhac hom nay qua Zalo, theo gio VN", async () => {
		const chuaCo = "Hôm nay chưa có tin nhắc qua Zalo";
		const gio = `${String(NHAC.gio.gio).padStart(2, "0")}:${String(NHAC.gio.phut).padStart(2, "0")}`;
		let daChay = 0;
		const kiemChuaCo = async (
			o: string,
			zid: string,
			stepId: string,
			luc: Date,
		) => {
			const truocVet = await demVetZalo();
			const { tra } = await nhan(zid, "xong 1", luc);
			expect(await buocXongLuc(stepId), `${o}: khong buoc nao doi`).toBeNull();
			expect(await demVetZalo(), `${o}: khong dau vet`).toBe(truocVet);
			const cau = motTraLoi(tra);
			expect(cau, o).toContain(chuaCo);
			expect(cau, o).toContain(gio);
			daChay += 1;
		};

		{
			const { zid, daGui } = await coNhac({ quaHan: 1 }, "HomQua");
			await kiemChuaCo(
				"(a) chi hom qua",
				zid,
				buocCuaMuc(daGui, 1),
				lucVN(NGAY_MAI, PHUT_SAU),
			);
		}
		{
			const { A } = await gieoNhac(GOC, { quaHan: 1 }, "QuaSlack");
			const zid = zaloMoi();
			await noiZalo(A.id, zid);
			await db.notificationPreference.create({
				data: { userId: A.id, channel: "SLACK" },
			});
			const gui = await guiNhac(A.id, GOC, { slack: true });
			expect(gui.kenh, "(b) di qua Slack").toBe("slack");
			await kiemChuaCo(
				"(b) hom nay qua Slack",
				zid,
				buocCuaMuc(gui.daGui, 1),
				LUC,
			);
		}
		{
			const { A } = await gieoNhac(GOC, { quaHan: 1 }, "HetViec");
			const zid = zaloMoi();
			await noiZalo(A.id, zid);
			setSystemTime(GOC);
			await lenLichNhac(GOC);
			const buoc = await db.onboardingStep.findFirstOrThrow({
				where: { assigneeId: A.id },
			});
			await db.onboardingStep.update({
				where: { id: buoc.id },
				data: { completedAt: GOC },
			});
			const hang = await hangHomNay(A.id, GOC);
			await voiToken(() =>
				chayNhac(hang, { zaloFetcher: zaloGia().fetcher, appUrl: APP_URL }),
			);
			expect((await hangHomNay(A.id, GOC)).outcome, "(c) khong-viec").toBe(
				"khong-viec",
			);
			await db.onboardingStep.update({
				where: { id: buoc.id },
				data: { completedAt: null },
			});
			await kiemChuaCo("(c) khong-viec", zid, buoc.id, LUC);
		}
		{
			const { A } = await gieoNhac(GOC, { quaHan: 1 }, "ChuaChay");
			const zid = zaloMoi();
			await noiZalo(A.id, zid);
			setSystemTime(GOC);
			await lenLichNhac(GOC);
			const buoc = await db.onboardingStep.findFirstOrThrow({
				where: { assigneeId: A.id },
			});
			await kiemChuaCo("(d) chua chay", zid, buoc.id, LUC);
		}
		{
			const { zid, daGui } = await coNhac({ quaHan: 1 }, "CuoiNgay");
			await nhan(zid, "xong 1", new Date(`${NGAY_NHAC}T23:59:00+07:00`));
			expect(
				await buocXongLuc(buocCuaMuc(daGui, 1)),
				"(e) 23:59 gio VN van la ngay D",
			).not.toBeNull();
			daChay += 1;
		}
		{
			const { zid, daGui } = await coNhac({ quaHan: 1 }, "QuaDem");
			await kiemChuaCo(
				"(f) 00:01 ngay D+1",
				zid,
				buocCuaMuc(daGui, 1),
				new Date(`${NGAY_MAI}T00:01:00+07:00`),
			);
		}
		expect(daChay, "so o thuc chay").toBe(6);
	});
});

describe("nguoi-nhan", () => {
	test("nguoi-nhan: nguoi khac, vai okr, chua noi, bi chan", async () => {
		let daChay = 0;
		{
			const B = await coNhac({ quaHan: 1 }, "NhanB");
			const A = await gieoNguoi("NhanA");
			const zidA = zaloMoi();
			await noiZalo(A.id, zidA);
			const { tra } = await nhan(zidA, "xong 1", LUC);
			expect(
				await buocXongLuc(buocCuaMuc(B.daGui, 1)),
				"(a) buoc cua B khong doi",
			).toBeNull();
			expect(motTraLoi(tra), "(a)").toContain(
				"Hôm nay chưa có tin nhắc qua Zalo",
			);
			daChay += 1;
		}
		{
			const { A, zid, daGui } = await coNhac({ quaHan: 1 }, "Okr");
			await db.member.updateMany({
				where: { userId: A.id },
				data: { role: "okr" },
			});
			const truocVet = await demVetZalo();
			const { tra } = await nhan(zid, "xong 1", LUC);
			expect(
				await buocXongLuc(buocCuaMuc(daGui, 1)),
				"vai okr khong ghi",
			).toBeNull();
			expect(await demVetZalo(), "(b) khong dau vet").toBe(truocVet);
			expect(motTraLoi(tra), "(b)").toBe(ZALO.loi.khongQuyen);
			await db.member.updateMany({
				where: { userId: A.id },
				data: { role: "member" },
			});
			await nhan(zid, "xong 1", LUC);
			expect(
				await buocXongLuc(buocCuaMuc(daGui, 1)),
				"doi chung (b): vai member danh dau duoc",
			).not.toBeNull();
			daChay += 1;
		}
		{
			const truocVet = await demVetZalo();
			const { tra } = await nhan(zaloMoi(), "xong 1", LUC);
			expect(motTraLoi(tra), "(c) chua noi").toBe(ZALO.loi.huongDan);
			expect(await demVetZalo(), "(c) khong dau vet").toBe(truocVet);
			daChay += 1;
		}
		{
			const { zid, daGui } = await coNhac({ quaHan: 1 }, "BiChan");
			for (let i = 0; i < ZALO_LIEN_KET.doMa.toiDa; i += 1)
				await ghiSai(db, zid, LUC);
			const { res, tra, messageId } = await nhan(zid, "xong 1", LUC);
			expect(res.status, "(d) webhook 200").toBe(200);
			expect(await demDaThay(messageId), "(d) tin da duoc xu ly").toBe(1);
			expect(tra.length, "(d) khong gui gi").toBe(0);
			expect(
				await buocXongLuc(buocCuaMuc(daGui, 1)),
				"(d) khong buoc doi",
			).toBeNull();
			daChay += 1;
		}
		expect(daChay, "so o thuc chay").toBe(4);
	});
});

describe("khong-lenh", () => {
	test("khong-lenh: thieu so, cau khac, ma noi", async () => {
		const { A, zid, daGui } = await coNhac({ quaHan: 1 }, "KhongLenh");
		const truoc = await xongLucCua(daGui);
		const { tra: t1 } = await nhan(zid, "xong", LUC);
		expect(motTraLoi(t1), "thieu so").toContain("xong 2");
		expect(await xongLucCua(daGui), "thieu so: khong gi doi").toEqual(truoc);
		expect(await db.zaloLinkAttempt.count(), "xong khong tinh la ma sai").toBe(
			0,
		);
		const { tra: t2 } = await nhan(zid, "cảm ơn", LUC);
		const cau = motTraLoi(t2);
		expect(
			cau.startsWith(ZALO.loi.daNoiRoi(A.name, gioNhac())),
			"cau da noi",
		).toBe(true);
		expect(cau, "kem goi y").toContain("xong 2");
		const { ma } = await taoMaLienKet(db, A.id, LUC);
		await nhan(zid, ma, LUC);
		const maSau = await db.zaloLinkCode.findFirstOrThrow({
			where: { crmUserId: A.id },
		});
		expect(maSau.usedAt, "ma noi van dung").not.toBeNull();
		expect(
			(await db.zaloLink.findUniqueOrThrow({ where: { crmUserId: A.id } }))
				.zaloUserId,
			"lien ket ghi lai",
		).toBe(zid);
	});
});

describe("trung-va-loi", () => {
	test("trung-va-loi: giao lai khong ghi hai lan, loi DB khong de buoc nao doi", async () => {
		{
			const { zid, daGui } = await coNhac({ quaHan: 2 }, "Trung");
			const a = await nhan(zid, "xong 1 2", LUC, { messageId: "ttn-trung-1" });
			const b = await nhan(zid, "xong 1 2", LUC, { messageId: "ttn-trung-1" });
			expect([a.res.status, b.res.status]).toEqual([200, 200]);
			for (const n of [1, 2]) {
				expect(
					(await vetXong(buocCuaMuc(daGui, n))).length,
					`muc ${n} mot dau vet`,
				).toBe(1);
			}
			expect(a.tra.length + b.tra.length, "mot tin tra loi").toBe(1);
		}
		{
			const { zid, daGui } = await coNhac({ quaHan: 2 }, "LoiDb");
			const goc = loiChung.datBuocXong;
			let lan = 0;
			const nghe = spyOn(loiChung, "datBuocXong").mockImplementation(
				(tx, input, vetDung) => {
					lan += 1;
					if (lan === 2) return Promise.reject(new Error("db loi gia"));
					return goc(tx, input, vetDung);
				},
			);
			const im = spyOn(console, "error").mockImplementation(() => {});
			let loi: Awaited<ReturnType<typeof nhan>>;
			try {
				loi = await nhan(zid, "xong 1 2", LUC, { messageId: "ttn-loi-1" });
			} finally {
				nghe.mockRestore();
				im.mockRestore();
			}
			expect(loi.res.status, "webhook 500").toBe(500);
			expect(await xongLucCua(daGui), "loi DB khong de buoc nao doi").toEqual([
				null,
				null,
			]);
			expect(await demDaThay("ttn-loi-1"), "khong ghi da thay").toBe(0);
			const lai = await nhan(zid, "xong 1 2", LUC, { messageId: "ttn-loi-1" });
			expect(lai.res.status).toBe(200);
			expect(
				(await xongLucCua(daGui)).every((x) => x !== null),
				"gui lai thi xong ca hai",
			).toBe(true);
			expect(lai.tra.length, "mot cau xac nhan").toBe(1);
		}
	});
});

describe("khong-luu-chu", () => {
	test("khong-luu-chu: noi dung tin khong vao DB, khong vao log", async () => {
		const { zid } = await coNhac({ quaHan: 1 }, "KhongLuu");
		const M = `ttn-${randomUUID()}`;
		const dong: string[] = [];
		const ghi = (...a: unknown[]) => {
			dong.push(a.map((x) => Bun.inspect(x, { depth: 10 })).join(" "));
		};
		const l = spyOn(console, "log").mockImplementation(ghi);
		const e = spyOn(console, "error").mockImplementation(ghi);
		let thanDi = "";
		let maTin = "";
		try {
			const a = await nhan(zid, `hỏi ${M}`, LUC, { send: 500 });
			const b = await nhan(zid, `xong 1 ${M}`, LUC);
			thanDi = a.than + b.than;
			maTin = a.messageId;
		} finally {
			l.mockRestore();
			e.mockRestore();
		}
		expect(thanDi.includes(M), "doi chung: M di vao than webhook").toBe(true);
		expect(
			dong.some((d) => d.includes(maTin)),
			"bo bat log thu duoc dong cua luot",
		).toBe(true);
		for (const bang of [
			"zaloUpdateSeen",
			"zaloLink",
			"zaloLinkAttempt",
			"activity",
			"agentTask",
		]) {
			const [hang] = await db.$queryRawUnsafe<{ n: bigint }[]>(
				`SELECT count(*) AS n FROM "${bang}" t WHERE t::text ILIKE $1`,
				`%${M}%`,
			);
			expect(Number(hang?.n ?? -1), `noi dung tin khong vao DB: ${bang}`).toBe(
				0,
			);
		}
		expect(
			dong.filter((d) => d.includes(M)),
			"khong dong log nao chua M",
		).toEqual([]);
	});
});
