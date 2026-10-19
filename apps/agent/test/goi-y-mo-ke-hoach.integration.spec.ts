import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { boQuaGoiYTrongTx, sinhGoiYKeHoach } from "@crm/db/goi-y-ke-hoach";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import { noiDungThongBao } from "@crm/validation/thong-bao";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import { donDep, gieoNguoi, ma, moXuong } from "./support/nhac-gieo";
import { lucVN } from "./support/nhac-gui-gieo";
import { batBot, noiZalo, tatBot, voiToken } from "./support/okr-gieo";
import { zaloGia } from "./support/zalo-gia";

const NGAY = "2031-11-04";
const APP_URL = "https://crm.test";

const giaiDoan: string[] = [];
let thang = "";
let mo = "";

function nem(thongDiep: string): never {
	throw new Error(thongDiep);
}

async function dealThang(chuId: string, tenCty: string, tenDeal: string) {
	const cty = await db.company.create({ data: { name: `${ma()} ${tenCty}` } });
	const deal = await db.deal.create({
		data: { name: tenDeal, companyId: cty.id, ownerId: chuId, stage: thang },
	});
	const g = await db.$transaction((tx) =>
		sinhGoiYKeHoach(tx, {
			dealId: deal.id,
			tuLoai: "OPEN",
			denLoai: "WON",
			now: new Date(),
		}),
	);
	if (!g) nem("gy: dung goi y hong");
	return { goiYId: g.id, dealId: deal.id, congTy: cty.name };
}

beforeAll(async () => {
	await moXuong();
	await batBot();
	for (const kind of ["WON", "OPEN"] as const) {
		const g = await db.dealStage.create({
			data: { label: `${ma()} ${kind}`, kind, position: 950 },
		});
		giaiDoan.push(g.id);
		if (kind === "WON") thang = g.id;
		else mo = g.id;
	}
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await donDep();
	await db.deal.deleteMany({ where: { stage: { in: giaiDoan } } });
	await db.dealStage.deleteMany({ where: { id: { in: giaiDoan } } });
	await tatBot();
});

describe("gy-nhac", () => {
	test("bộ gom và tin nhắc của người nhận có đúng gợi ý chờ của deal đang thắng", async () => {
		const P = await gieoNguoi("GY Phụ trách nhắc");
		const Q = await gieoNguoi("GY Người khác nhắc");
		const R = await gieoNguoi("GY Đã rời xưởng");
		await noiZalo(P.id, "ZP");
		const g1 = await dealThang(P.id, "Cty Nhắc Một", "Deal nhắc một");
		const g2 = await dealThang(P.id, "Cty Nhắc Hai", "Deal nhắc hai");
		await db.deal.update({ where: { id: g2.dealId }, data: { stage: mo } });
		const g3 = await dealThang(P.id, "Cty Nhắc Ba", "Deal nhắc ba");
		await db.$transaction((tx) =>
			boQuaGoiYTrongTx(tx, { id: g3.goiYId, nguoiId: P.id, now: new Date() }),
		);
		await dealThang(R.id, "Cty Nhắc Bốn", "Deal nhắc bốn");
		await db.member.deleteMany({ where: { userId: R.id } });

		const luc = lucVN(NGAY, 30);
		setSystemTime(luc);
		const gom = await viecCanNhac(db, { now: luc, cuaSo: "buoi-sang" });
		const cuaP = (gom.get(P.id) ?? []).filter(
			(v) => v.loai === "goi-y-ke-hoach",
		);
		for (const cam of [g2.goiYId, g3.goiYId]) {
			if (cuaP.some((v) => "goiYId" in v && v.goiYId === cam)) {
				nem(`gy: nhac goi y da xu ly ${cam}`);
			}
		}
		const [m1] = cuaP;
		if (
			cuaP.length !== 1 ||
			!m1 ||
			!("goiYId" in m1) ||
			m1.goiYId !== g1.goiYId
		) {
			nem(`gy: nhac goi y sai ${cuaP.length}`);
		}
		if (m1.companyName !== g1.congTy || m1.dealName !== "Deal nhắc một") {
			nem("gy: nhac goi y thieu ten");
		}
		for (const ai of [Q.id, R.id]) {
			if ((gom.get(ai) ?? []).some((v) => v.loai === "goi-y-ke-hoach")) {
				nem("gy: nhac goi y lac nguoi");
			}
		}

		await lenLichNhac(luc);
		const hang = await db.agentTask.findFirst({
			where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(P.id, luc) },
		});
		if (!hang) nem("gy: tin nhac thieu goi y");
		const z = zaloGia();
		const daGhi: unknown[] = [];
		await voiToken(() =>
			chayNhac(hang, {
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
				ghiThongBao: async (_db, _userId, viec) => {
					daGhi.push(...viec);
					return { tao: viec.length, capNhat: 0 };
				},
			}),
		);
		const tin = z.guiToi("ZP").map((g) => String(g.body.text ?? ""));
		if (!tin.some((t) => t.includes(g1.congTy)))
			nem("gy: tin nhac thieu goi y");
		const tb = daGhi.filter(
			(v) => noiDungThongBao.safeParse(v).data?.loai === "goi-y-ke-hoach",
		);
		if (tb.length !== 1) nem("gy: thong bao goi y sai");

		await db.$transaction((tx) =>
			boQuaGoiYTrongTx(tx, { id: g1.goiYId, nguoiId: P.id, now: new Date() }),
		);
		const sau = await viecCanNhac(db, {
			now: luc,
			userId: P.id,
			cuaSo: "buoi-sang",
		});
		if ((sau.get(P.id) ?? []).some((v) => v.loai === "goi-y-ke-hoach")) {
			nem("gy: nhac goi y da xu ly");
		}
		expect(tb.length).toBe(1);
	});
});
