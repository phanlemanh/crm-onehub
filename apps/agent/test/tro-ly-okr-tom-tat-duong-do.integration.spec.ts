import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db, type Prisma } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import type { GoiTomTat } from "@crm/db/okr-tom-tat";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { OKR_MAU } from "../../api/scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../../api/scripts/okr-mau/nap";
import type { AgentTriggerService } from "../../api/src/agent/agent-trigger.service";
import { OkrService } from "../../api/src/okr/okr.service";
import { OkrAccessService } from "../../api/src/okr/okr-access.service";
import { TroLyOkrService } from "../../api/src/okr/tro-ly.service";
import { ToChucService } from "../../api/src/to-chuc/to-chuc.service";
import { congTy, lamSachOkr, napMau } from "../../api/test/okr-mau-san";
import { beginResearch } from "../agent/lib/dispatch";
import { chayXepTomTat } from "../agent/lib/okr/lich-tom-tat";
import { goiTomTatCuaViec, nopTomTatVao } from "../agent/lib/okr/nop-tom-tat";
import { claimDue, completeTask, type LeasedTask } from "../agent/lib/tasks";
import { moXuong } from "./support/nhac-gieo";
import { nguCanhCon } from "./support/tro-ly-phien-con";

const CHO_DB = 120_000;
const TIEN_TO = `tdd-${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}-`;
const luc = (vn: string) => new Date(`${vn}+07:00`);
const MOC_MAU = luc("2026-11-24T12:00:00");
const LUC_CAU_HINH = luc("2026-11-23T20:00:00");
const LUC_XEP = luc("2026-11-24T06:00:00");
const DONG_HO = luc("2026-11-24T07:00:00");
const LUC_DOC = luc("2026-11-24T09:00:00");
const TOM_TAT = "okr-tom-tat-tuan";
const XEP = "okr-tom-tat-xep";
const KY = idMau("chu-ky", "quy4");
const PHONG = { a: "kd-bac", b: "cham-soc" } as const;
const THONG_DIEP = { anBiChan: "an bi chan truoc khi gui" } as const;
const khoaCu = process.env.AI_GATEWAY_API_KEY;

const bo = congTy();
const pb = (ma: string) => idMau("pb", ma);
const nguoi = (ma: string) => idMau("nguoi", ma);
const QUAN_TRI = bo.nguoi.find((n) => n.vai === "admin")?.ma ?? "";
const truongCua = (maPhong: string) =>
	bo.phongBan.find((p) => p.ma === maPhong)?.truong ?? "";
const vietSo = (n: number) => String(n).replace(".", ",");

const khongTrigger = {
	okrKiemSanSang: async () => {},
	troLyOkrDaXep: () => {},
	canReachAgent: () => true,
} as unknown as AgentTriggerService;

type ViecDo = {
	phong: keyof typeof PHONG;
	task: LeasedTask;
	phienGoc: string;
	nac: string;
	outcomeMo: string | null;
	conLaiMs: number | null;
	goi: GoiTomTat | null;
};

let dichVu: TroLyOkrService;
let ketQuaXep = "";
const viec = new Map<keyof typeof PHONG, ViecDo>();
const nopRa = new Map<keyof typeof PHONG, { ketQua: string; soBo: number }>();

function dungDichVu() {
	const quyen = new OkrAccessService(db, new ToChucService(db));
	const okr = new OkrService(db, quyen, khongTrigger);
	return {
		okr,
		troLy: new TroLyOkrService(db, quyen, khongTrigger, okr),
	};
}

function phongCua(payload: Prisma.JsonValue | null): keyof typeof PHONG | null {
	const p = okrTroLyViec.safeParse(payload);
	if (!p.success || p.data.viec !== "tom-tat-tuan") return null;
	if (p.data.departmentId === pb(PHONG.a)) return "a";
	if (p.data.departmentId === pb(PHONG.b)) return "b";
	return null;
}

function cauTuGoi(goi: GoiTomTat) {
	const n = goi.nguon[0];
	if (!n) throw new Error(`goi cua ${goi.phong.ten} khong co nguon`);
	return [
		{
			vanBan: "Tuần này phòng ghi nhận đủ các lần cập nhật.",
			nguon: [n.id],
		},
		{
			vanBan: `Kết quả then chốt đang ở mức ${vietSo(n.giaTri)}.`,
			nguon: [n.id],
		},
		{
			vanBan: `Tiến độ theo lần cập nhật là ${n.tienDo}%.`,
			nguon: [n.id],
		},
	];
}

async function xaViec(): Promise<void> {
	const nhan = await claimDue(50, { only: [TOM_TAT] }, VIEC_OKR.leaseTomTatMs);
	for (const task of nhan) {
		const phong = phongCua(task.payload);
		if (!phong) continue;
		const phienGoc = `${TIEN_TO}goc-${task.id}`;
		await beginResearch(task, async () => ({ id: phienGoc }));
		const sau = await db.agentTask.findUniqueOrThrow({
			where: { id: task.id },
			select: {
				sessionId: true,
				finishedAt: true,
				outcome: true,
				createdAt: true,
				payload: true,
				kind: true,
				id: true,
				leasedUntil: true,
			},
		});
		const p = okrTroLyViec.parse(task.payload);
		viec.set(phong, {
			phong,
			task,
			phienGoc,
			nac: p.viec === "tom-tat-tuan" ? p.nac : "",
			outcomeMo: sau.finishedAt ? (sau.outcome ?? "") : null,
			conLaiMs: sau.leasedUntil ? sau.leasedUntil.getTime() - Date.now() : null,
			goi:
				sau.finishedAt || sau.sessionId !== phienGoc
					? null
					: await goiTomTatCuaViec({
							id: sau.id,
							kind: sau.kind,
							payload: sau.payload,
							createdAt: sau.createdAt,
							finishedAt: sau.finishedAt,
						}),
		});
	}
}

async function nopMoiViec(): Promise<void> {
	for (const [phong, v] of viec) {
		if (v.outcomeMo !== null || !v.goi) continue;
		const kq = await nopTomTatVao(
			{ cau: cauTuGoi(v.goi) },
			nguCanhCon(v.phienGoc),
		);
		nopRa.set(phong, { ketQua: kq.ketQua, soBo: kq.soBo });
		await completeTask(v.task.id, "da-nop");
	}
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await db.agentTask.deleteMany({ where: { kind: { in: [XEP, TOM_TAT] } } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	const dv = dungDichVu();
	dichVu = dv.troLy;
	setSystemTime(LUC_CAU_HINH);
	await dv.okr.setProgram(nguoi(QUAN_TRI), {
		aiOn: true,
		aiTomTatPhamVi: "danh-sach",
		aiTomTatDonVi: [pb(PHONG.a)],
		aiTomTatAnPhamVi: "danh-sach",
		aiTomTatAnDonVi: [pb(PHONG.b)],
	});
	const xep = await db.agentTask.create({
		data: {
			kind: XEP,
			reason: XEP,
			subject: `${TIEN_TO}xep`,
			budget: 0,
			dueAt: LUC_XEP,
		},
		select: { id: true, dueAt: true },
	});
	setSystemTime(LUC_XEP);
	ketQuaXep = await chayXepTomTat(xep, LUC_XEP);
	setSystemTime(DONG_HO);
	await xaViec();
	await nopMoiViec();
	setSystemTime(LUC_DOC);
}, CHO_DB);

afterAll(async () => {
	setSystemTime();
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ kind: { in: [XEP, TOM_TAT, "okr-kiem-san-sang"] } },
				{ subject: { startsWith: TIEN_TO } },
			],
		},
	});
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await lamSachOkr();
	await xoaBoOkrMau(db);
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
}, CHO_DB);

describe("duong-do", () => {
	test(
		"chayXepTomTat that ghi hai viec: phong A nac bat, phong B nac an",
		async () => {
			console.log(`xep: ${ketQuaXep}`);
			expect(ketQuaXep).toBe("da-xep:2");
			const ds = await db.agentTask.findMany({
				where: { kind: TOM_TAT },
				select: { payload: true },
			});
			const theoPhong = ds
				.map((h) => okrTroLyViec.parse(h.payload))
				.flatMap((p) =>
					p.viec === "tom-tat-tuan"
						? [`${p.departmentId}:${p.nac}:${p.cycleId}:${p.tuan}`]
						: [],
				)
				.sort();
			const tuan = dauTuanVN(new Date(LUC_XEP.getTime() - 1));
			expect(theoPhong).toEqual(
				[
					`${pb(PHONG.a)}:bat:${KY}:${tuan}`,
					`${pb(PHONG.b)}:an:${KY}:${tuan}`,
				].sort(),
			);
		},
		CHO_DB,
	);

	test(
		"beginResearch that: lyDoChanTruocKhiGui khong chan viec nao, ca viec an",
		() => {
			const chan = [...viec.values()]
				.filter((v) => v.outcomeMo !== null)
				.map(
					(v) =>
						`${v.phong === "b" ? THONG_DIEP.anBiChan : "bat bi chan truoc khi gui"}: ${v.outcomeMo}`,
				);
			expect(chan).toEqual([]);
			expect([...viec.keys()].sort()).toEqual(["a", "b"]);
			expect(viec.get("b")?.nac).toBe("an");
		},
		CHO_DB,
	);

	test(
		"beginResearch that: viec tom tat duoc giu 3 phut, khong phai 30 giay",
		() => {
			expect([...viec.values()].map((v) => v.conLaiMs)).toEqual([
				VIEC_OKR.leaseTomTatMs,
				VIEC_OKR.leaseTomTatMs,
			]);
			expect(VIEC_OKR.leaseTomTatMs).toBeGreaterThan(VIEC_OKR.leaseMs);
		},
		CHO_DB,
	);

	test(
		"nopTomTatVao voi cau dung tu goi that ghi ban cho ca hai phong",
		async () => {
			expect(Object.fromEntries(nopRa)).toEqual({
				a: { ketQua: "da-ghi", soBo: 0 },
				b: { ketQua: "da-ghi", soBo: 0 },
			});
			const ban = await db.okrTomTat.findMany({
				select: { departmentId: true, trangThai: true, cau: true },
			});
			expect(ban.map((b) => `${b.departmentId}:${b.trangThai}`).sort()).toEqual(
				[`${pb(PHONG.a)}:hien`, `${pb(PHONG.b)}:hien`].sort(),
			);
		},
		CHO_DB,
	);

	test(
		"troLyTomTat that: phong A tra cau co nguon bang hang OkrCheckIn, phong B khong co ban",
		async () => {
			const tl = nguoi(truongCua(PHONG.a));
			const a = await dichVu.troLyTomTat(tl, {
				cycleId: KY,
				departmentId: pb(PHONG.a),
			});
			const b = await dichVu.troLyTomTat(nguoi(truongCua(PHONG.b)), {
				cycleId: KY,
				departmentId: pb(PHONG.b),
			});
			expect(a.ban?.cau.length).toBe(3);
			const nguon = (a.ban?.cau ?? []).flatMap((c) => c.nguon);
			const kho = await db.okrCheckIn.findMany({
				where: { id: { in: nguon.map((n) => n.id) } },
				select: {
					id: true,
					keyResultId: true,
					value: true,
					confidence: true,
					note: true,
				},
			});
			const lech = nguon.flatMap((n) => {
				const h = kho.find((k) => k.id === n.id);
				return h &&
					h.keyResultId === n.keyResultId &&
					h.value.toNumber() === n.giaTri &&
					h.confidence === n.tuTin &&
					h.note === n.ghiChu
					? []
					: [`nguon lech kho: ${n.id}`];
			});
			expect(lech).toEqual([]);
			expect(b).toEqual({ ban: null, dangSoan: false, chuaCapNhat: false });
		},
		CHO_DB,
	);

	test(
		"troLyTomTatQuanTri that: tra ca hai phong voi nac dung",
		async () => {
			const qt = await dichVu.troLyTomTatQuanTri(nguoi(QUAN_TRI), {
				cycleId: KY,
			});
			const theoPhong = qt.phong
				.filter(
					(p) =>
						p.departmentId === pb(PHONG.a) || p.departmentId === pb(PHONG.b),
				)
				.map((p) => `${p.departmentId}:${p.nac}:${p.trangThai}:${p.soCau}`)
				.sort();
			expect(theoPhong).toEqual(
				[`${pb(PHONG.a)}:bat:hien:3`, `${pb(PHONG.b)}:an:hien:3`].sort(),
			);
		},
		CHO_DB,
	);
});
