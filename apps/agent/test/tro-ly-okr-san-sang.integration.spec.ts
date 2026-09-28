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
import { DIRECT_KINDS, PRIORITY } from "@crm/db/agent-tasks";
import { chiTieuThang } from "@crm/db/ai-chi-phi";
import {
	ketQuaKiemGanNhat,
	troLyOkrSanSang,
	xepViecTroLy,
} from "@crm/db/okr-tro-ly";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { drainAll } from "../agent/lib/dispatch";
import {
	chayKiemSanSang,
	xepKiemLaiKhoa,
} from "../agent/lib/okr/kiem-san-sang";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import {
	donOkr,
	gieoBoPhan,
	gieoChuKy,
	gieoMucTieu,
	gieoPhongBan,
} from "./support/okr-gieo";
import {
	donTroLy,
	gieoCauHinhAi,
	gieoChiPhi,
	gieoKiemSanSang,
} from "./support/tro-ly-gieo";

const HOM_NAY = new Date("2031-03-31T20:00:00+07:00");
const DAU_THANG = new Date("2031-03-01T00:05:00+07:00");
let luc = DAU_THANG.getTime();
const sau = () => {
	luc += 60_000;
	return new Date(luc);
};

type MucGieo = {
	phongTrongB: string;
	phongNgoai: string;
	caNhan: string;
	onehub: string;
	boPhanB: string;
};

let muc: MucGieo;

beforeAll(async () => {
	await moXuong();
	const chu = await gieoNguoi("Người gieo trợ lý");
	const ck = await gieoChuKy("dang-chay");
	const boPhanB = await gieoBoPhan(null);
	const phongA = await gieoPhongBan(null, boPhanB);
	const phongX = await gieoPhongBan(null, await gieoBoPhan(null));
	await db.orgPlacement.create({
		data: { userId: chu.id, primaryDepartmentId: phongA },
	});
	const mt = (cap: "onehub" | "phong-ban" | "ca-nhan", dep?: string) =>
		gieoMucTieu({
			cycleId: ck,
			chu: chu.id,
			congBo: new Date(),
			cap,
			departmentId: dep,
		});
	muc = {
		phongTrongB: await mt("phong-ban", phongA),
		phongNgoai: await mt("phong-ban", phongX),
		caNhan: await mt("ca-nhan"),
		onehub: await mt("onehub"),
		boPhanB,
	};
}, 30_000);

afterAll(async () => {
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("tro-ly-okr-san-sang", () => {
	test("ma trận lý do, một kỳ vọng mỗi ô", async () => {
		const ra: [string, unknown][] = [];
		const hoi = async (nhan: string, objectiveId: string, coTacTu?: boolean) =>
			ra.push([
				nhan,
				await troLyOkrSanSang(db, {
					viec: "de-xuat",
					objectiveId,
					now: HOM_NAY,
					coTacTu,
				}).then((r) => (r.bat ? "bat" : r.lyDo)),
			]);

		await gieoCauHinhAi(sau(), { aiOn: false, aiDeXuatPhamVi: "toan-cong-ty" });
		await hoi("tat tong", muc.phongTrongB);
		await gieoCauHinhAi(sau(), { aiOn: true, aiDeXuatPhamVi: "tat" });
		await hoi("viec tat", muc.phongTrongB);
		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: [],
		});
		await hoi("danh sach rong", muc.phongTrongB);
		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: [muc.boPhanB],
		});
		await hoi("phong trong bo phan", muc.phongTrongB);
		await hoi("phong ngoai bo phan", muc.phongNgoai);
		await hoi("ca nhan theo phong chinh", muc.caNhan);
		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: ["onehub"],
		});
		await hoi("cap onehub", muc.onehub);
		await gieoCauHinhAi(sau(), { aiOn: true, aiDeXuatPhamVi: "toan-cong-ty" });
		await hoi("khong noi tac tu", muc.phongTrongB, false);
		await gieoKiemSanSang(sau(), "chua-co-khoa-mo-hinh");
		await hoi("chua co khoa mo hinh", muc.phongTrongB);
		await gieoKiemSanSang(sau(), "san-sang");
		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 0,
		});
		await hoi("tran bang khong", muc.phongTrongB);

		expect(ra).toEqual([
			["tat tong", "tat"],
			["viec tat", "viec-tat"],
			["danh sach rong", "don-vi-chua-bat"],
			["phong trong bo phan", "bat"],
			["phong ngoai bo phan", "don-vi-chua-bat"],
			["ca nhan theo phong chinh", "bat"],
			["cap onehub", "bat"],
			["khong noi tac tu", "chua-noi-tac-tu"],
			["chua co khoa mo hinh", "chua-co-khoa-mo-hinh"],
			["tran bang khong", "het-tran-thang"],
		]);
		if (ra[2]?.[1] === "bat") throw new Error("rong la tat ca");
	}, 30_000);

	test("hết trần tính theo tháng giờ Việt Nam, không theo tháng quốc tế", async () => {
		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 1,
		});
		await gieoChiPhi(new Date("2031-03-01T00:30:00+07:00"), "okr.de-xuat", 0.6);
		await gieoChiPhi(
			new Date("2031-03-20T10:00:00+07:00"),
			"okr.chuyen-tiep",
			0.5,
		);
		await gieoChiPhi(new Date("2031-04-01T06:30:00+07:00"), "okr.de-xuat", 5);
		const thang = await chiTieuThang(db, "2031-03");
		if (Math.abs(thang.troLyOkrUsd - 1.1) > 1e-9) {
			throw new Error(`thang VN lech: ${thang.troLyOkrUsd}`);
		}
		const r = await troLyOkrSanSang(db, {
			viec: "de-xuat",
			objectiveId: muc.phongTrongB,
			now: HOM_NAY,
		});
		expect(r).toEqual({ bat: false, lyDo: "het-tran-thang" });
	}, 30_000);

	test("xếp việc: hết trần thì không ghi hàng; bấm hai lần song song thì một hàng", async () => {
		const nguoi = `${"mn3-"}nguoi-bam`;
		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 0,
		});
		const truoc = await db.agentTask.count({ where: { kind: "okr-de-xuat" } });
		const het = await xepViecTroLy(db, {
			viec: "de-xuat",
			objectiveId: muc.onehub,
			keyResultId: null,
			nguoiYeuCau: nguoi,
			nac: "bat",
			now: HOM_NAY,
		});
		expect(het).toEqual({ bat: false, lyDo: "het-tran-thang" });
		expect(await db.agentTask.count({ where: { kind: "okr-de-xuat" } })).toBe(
			truoc,
		);

		await gieoCauHinhAi(sau(), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 20,
		});
		const [a, b] = await Promise.all(
			[1, 2].map(() =>
				xepViecTroLy(db, {
					viec: "de-xuat",
					objectiveId: muc.onehub,
					keyResultId: null,
					nguoiYeuCau: nguoi,
					nac: "bat",
					now: HOM_NAY,
				}),
			),
		);
		const hang = await db.agentTask.findMany({
			where: {
				kind: "okr-de-xuat",
				payload: { path: ["objectiveId"], equals: muc.onehub },
			},
		});
		expect(hang.length).toBe(1);
		expect([a?.bat && a.taskId, b?.bat && b.taskId]).toEqual([
			hang[0]?.id,
			hang[0]?.id,
		]);
		expect(hang[0]?.reason).toBe("okr-de-xuat");
	}, 30_000);
});

describe("kiem-san-sang", () => {
	const khoa = {
		AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
		VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
	};

	afterAll(() => {
		for (const [k, v] of Object.entries(khoa)) {
			if (v === undefined) delete process.env[k];
			else process.env[k] = v;
		}
	});

	async function chay() {
		const hang = await db.agentTask.create({
			data: {
				kind: "okr-kiem-san-sang",
				reason: "okr-kiem-san-sang",
				subject: `${TIEN_TO}kiem-that`,
				dueAt: new Date(),
				budget: 0,
			},
		});
		await chayKiemSanSang(hang);
		return db.agentTask.findUniqueOrThrow({
			where: { id: hang.id },
			select: { outcome: true, finishedAt: true, sessionId: true },
		});
	}

	test("là việc trực tiếp: không mở phiên, không gửi gì sang tác tử", () => {
		expect(DIRECT_KINDS).toContain("okr-kiem-san-sang");
	});

	test("không có khoá nào thì ra chua-co-khoa-mo-hinh", async () => {
		delete process.env.AI_GATEWAY_API_KEY;
		delete process.env.VERCEL_OIDC_TOKEN;
		const r = await chay();
		expect(r.outcome).toBe("chua-co-khoa-mo-hinh");
		expect(r.finishedAt).not.toBeNull();
		expect(r.sessionId).toBeNull();
	});

	test("có khoá Gateway hay OIDC thì ra san-sang", async () => {
		process.env.AI_GATEWAY_API_KEY = "khoa-gia";
		delete process.env.VERCEL_OIDC_TOKEN;
		expect((await chay()).outcome).toBe("san-sang");
		delete process.env.AI_GATEWAY_API_KEY;
		process.env.VERCEL_OIDC_TOKEN = "oidc-gia";
		expect((await chay()).outcome).toBe("san-sang");
	});
});

describe("kiem-khoa-het-han", () => {
	const MOC = new Date("2033-08-01T02:00:00Z").getTime();
	const HAN = TRO_LY_OKR_TRAN.hanKiemKhoaMs;
	const PHUT = 60_000;
	const khoa = {
		AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
		VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
	};
	let gui = 0;
	const send = async (t: { id: string }) => {
		gui += 1;
		return { id: `ses-${t.id}` };
	};
	const viecKiem = () =>
		db.agentTask.findMany({
			where: { kind: "okr-kiem-san-sang", dueAt: { gte: new Date(MOC) } },
			orderBy: { dueAt: "asc" },
			select: { id: true, finishedAt: true, outcome: true },
		});
	const sanSang = () =>
		troLyOkrSanSang(db, { viec: "de-xuat", now: new Date() }).then((r) =>
			r.bat ? "bat" : r.lyDo,
		);
	const luc = (ms: number) => setSystemTime(new Date(ms));

	afterEach(() => setSystemTime());

	afterAll(async () => {
		for (const [k, v] of Object.entries(khoa)) {
			if (v === undefined) delete process.env[k];
			else process.env[k] = v;
		}
		await db.agentTask.deleteMany({
			where: { kind: "okr-kiem-san-sang", dueAt: { gte: new Date(MOC) } },
		});
	});

	test("kiem-khoa-het-han: chưa có khoá chỉ chặn trong hạn; nhịp sau hạn xếp đúng một việc kiểm, không gọi model", async () => {
		luc(MOC);
		await db.agentTask.updateMany({
			where: { finishedAt: null },
			data: { finishedAt: new Date(MOC), outcome: "don-truoc-kiem-khoa" },
		});
		delete process.env.AI_GATEWAY_API_KEY;
		delete process.env.VERCEL_OIDC_TOKEN;
		await gieoCauHinhAi(new Date(MOC - PHUT), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 9,
		});
		await db.agentTask.create({
			data: {
				kind: "okr-kiem-san-sang",
				reason: "okr-kiem-san-sang",
				priority: PRIORITY.okrKiem,
				budget: 0,
				dueAt: new Date(MOC),
			},
		});
		await drainAll(send);
		const dau = await ketQuaKiemGanNhat(db, new Date());
		expect(dau?.ketQua).toBe("chua-co-khoa-mo-hinh");
		expect(await sanSang()).toBe("chua-co-khoa-mo-hinh");
		const hetDau = dau?.luc.getTime() ?? MOC;

		luc(hetDau + HAN + PHUT);
		await Promise.all([xepKiemLaiKhoa(), xepKiemLaiKhoa()]);
		await xepKiemLaiKhoa();
		expect((await viecKiem()).filter((v) => v.finishedAt === null).length).toBe(
			1,
		);
		await drainAll(send);
		const hai = await viecKiem();
		expect(hai.map((v) => v.outcome)).toEqual([
			"chua-co-khoa-mo-hinh",
			"chua-co-khoa-mo-hinh",
		]);
		const hetHai =
			(await ketQuaKiemGanNhat(db, new Date()))?.luc.getTime() ?? 0;

		process.env.AI_GATEWAY_API_KEY = "khoa-gia";
		luc(hetHai + HAN - PHUT);
		await drainAll(send);
		expect((await viecKiem()).length).toBe(2);
		expect(await sanSang()).toBe("chua-co-khoa-mo-hinh");

		luc(hetHai + HAN + PHUT);
		await drainAll(send);
		const sanSangSau = await sanSang();
		if (sanSangSau === "chua-co-khoa-mo-hinh") {
			throw new Error("kiem khoa cu chan mai");
		}
		const ba = await viecKiem();
		expect(ba.map((v) => v.outcome)).toEqual([
			"chua-co-khoa-mo-hinh",
			"chua-co-khoa-mo-hinh",
			"san-sang",
		]);
		expect(sanSangSau).toBe("bat");
		await drainAll(send);
		expect((await viecKiem()).length).toBe(3);
		expect(gui).toBe(0);
	}, 60_000);
});
