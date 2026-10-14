import { afterAll, beforeAll, describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import {
	type OnboardingActivityMeta,
	parseOnboardingActivityMeta,
} from "@crm/validation/onboarding-activity";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import { OnboardingTheoDoi } from "../src/onboarding/onboarding-theo-doi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import {
	dichVu,
	doiVai,
	donDep,
	gieoBoPhan,
	gieoCongTy,
	gieoNguoiNgoai,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";

const TRAN_MS = 60_000;

const THUOC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"va-lo-ro-vai-chi-okr",
	"rang",
	"ro-vai-chi-okr.mjs",
);

beforeAll(moXuong);
afterAll(donDep);

const ghi = () => new OnboardingGhi(db);
const theoDoi = () => new OnboardingTheoDoi(db);
const workspace = () =>
	new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);

function kiem(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function nem(goi: () => Promise<unknown>, ten: string): Promise<string> {
	try {
		await goi();
	} catch (loi) {
		return loi instanceof Error ? loi.message : String(loi);
	}
	throw new Error(ten);
}

async function maMember(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).id;
}

async function idVet(planId: string): Promise<Set<string>> {
	const ds = await db.activity.findMany({
		where: { planId },
		select: { id: true },
	});
	return new Set(ds.map((v) => v.id));
}

async function vetMoi(
	planId: string,
	truoc: Set<string>,
): Promise<OnboardingActivityMeta[]> {
	const ds = await db.activity.findMany({
		where: { planId },
		select: { id: true, meta: true },
	});
	return ds
		.filter((v) => !truoc.has(v.id))
		.map((v) => parseOnboardingActivityMeta(v.meta));
}

function loai(ds: OnboardingActivityMeta[]): string {
	return JSON.stringify(ds.map((m) => m.kind).sort());
}

async function buoc(id: string) {
	return db.onboardingStep.findUniqueOrThrow({ where: { id } });
}

async function keHoach(id: string) {
	return db.onboardingPlan.findUniqueOrThrow({ where: { id } });
}

async function dangTheoDoi(planId: string, userId: string): Promise<boolean> {
	const so = await db.onboardingWatch.count({ where: { planId, userId } });
	return so > 0;
}

type BuocDung = { giao?: string; xong?: boolean };

async function dungKeHoach(input: {
	camTrich: string;
	quanTri: string;
	buoc: BuocDung[];
}) {
	const bp = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: input.buoc.map((_, i) => ({
			label: `Buoc ${i + 1}`,
			departmentId: bp.id,
			position: i,
			offsetDays: i,
		})),
	});
	const congTy = await gieoCongTy();
	// Từ DA3 (ke-hoach-sinh-viec) kế hoạch tạo từ khuôn sinh Việc, và người còn Việc mở không đổi vai
	// sang «chỉ OKR» được (409 của DA1). Lời hứa của hồ sơ này đo đường bước KHÔNG mang Việc (kế hoạch
	// tạo trước DA3) nên dựng kế hoạch theo khuôn bằng bản ghi trực tiếp; đường mang Việc do
	// ke-hoach-sinh-viec đo (kh-go-buoc dong-ke-hoach).
	const batDau = new Date("2026-10-12T00:00:00.000Z");
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			templateId: khuon.id,
			startedAt: batDau,
			targetDays: 30,
			ownerId: input.camTrich,
		},
	});
	for (const s of khuon.steps) {
		await db.onboardingStep.create({
			data: {
				planId: plan.id,
				label: s.label,
				departmentId: s.departmentId,
				dueAt: new Date(batDau.getTime() + s.offsetDays * 24 * 60 * 60 * 1000),
				position: s.position,
			},
		});
	}
	const ds = await db.onboardingStep.findMany({
		where: { planId: plan.id },
		orderBy: { position: "asc" },
	});
	for (const [i, b] of input.buoc.entries()) {
		const hang = ds[i];
		if (hang === undefined) throw new Error(`mlk: khuon thieu buoc ${i}`);
		if (b.giao) {
			await dichVu().assignStep(
				{ stepId: hang.id, assigneeId: b.giao },
				input.quanTri,
			);
		}
		if (b.xong) {
			await dichVu().setStepDone(
				{ stepId: hang.id, done: true },
				input.quanTri,
			);
		}
	}
	return { plan, buoc: ds.map((h) => h.id) };
}

async function nguoi() {
	return {
		qt: await gieoThanhVien("Quản Trị MLK", "admin"),
		a: await gieoThanhVien("Người A MLK", "member"),
		m: await gieoThanhVien("Người M MLK", "member"),
		q: await gieoThanhVien("Người Q MLK", "member"),
	};
}

async function dungChiOkr() {
	const n = await nguoi();
	const k = await dungKeHoach({
		camTrich: n.a.id,
		quanTri: n.qt.id,
		buoc: [{ giao: n.a.id }, { giao: n.m.id }, { giao: n.a.id, xong: true }],
	});
	await theoDoi().bat({ planId: k.plan.id }, n.m.id);
	await dichVu().closePlan({ id: k.plan.id }, n.qt.id);
	await workspace().setMemberRole(n.qt.id, {
		memberId: await maMember(n.a.id),
		role: "okr",
	});
	const [b1, b2, b3] = k.buoc as [string, string, string];
	const plan = await keHoach(k.plan.id);
	kiem(plan.ownerId === n.a.id, "mlk: dung sai ownerId");
	kiem(plan.closedAt !== null, "mlk: dung sai closedAt");
	kiem((await buoc(b1)).assigneeId === n.a.id, "mlk: dung sai buoc1");
	kiem((await buoc(b2)).assigneeId === n.m.id, "mlk: dung sai buoc2");
	kiem((await buoc(b3)).completedAt !== null, "mlk: dung sai buoc3");
	kiem(await dangTheoDoi(plan.id, n.m.id), "mlk: dung sai theoDoiM");
	return { ...n, planId: plan.id, b1, b2, b3 };
}

function chayThuoc(trong: string) {
	if (!existsSync(THUOC)) throw new Error(`mlk: khong thay thuoc ${THUOC}`);
	const ket = spawnSync("node", [THUOC, "--trong", trong], {
		env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
		encoding: "utf8",
	});
	return { status: ket.status, stdout: ket.stdout };
}

describe("mlk-mo-lai", () => {
	test(
		"mlk-mo-lai: chỉ OKR — người bấm cầm trịch, bước chưa giao, vết đủ",
		async () => {
			const f = await dungChiOkr();
			const truoc = await idVet(f.planId);
			await dichVu().reopenPlan({ id: f.planId }, f.q.id);

			const plan = await keHoach(f.planId);
			kiem(plan.closedAt === null, "mlk: ke hoach khong mo");
			kiem(
				plan.ownerId === f.q.id,
				`mlk: cam trich chua doi sang nguoi mo lai ${plan.ownerId}`,
			);
			kiem(
				(await buoc(f.b1)).assigneeId === null,
				"mlk: buoc mo con trong tay vai okr",
			);
			kiem(
				(await buoc(f.b2)).assigneeId === f.m.id,
				"mlk: buoc cua member bi doi",
			);
			const b3 = await buoc(f.b3);
			kiem(
				b3.assigneeId === f.a.id && b3.completedAt !== null,
				"mlk: buoc da xong bi doi",
			);
			kiem(
				await dangTheoDoi(f.planId, f.m.id),
				"mlk: theo doi cua member bi go",
			);
			const moi = await vetMoi(f.planId, truoc);
			kiem(
				loai(moi) ===
					JSON.stringify(["buoc.giao", "keHoach.doiCamTrich", "keHoach.moLai"]),
				`mlk: vet mo lai sai ${JSON.stringify(moi)}`,
			);
			const doi = moi.find((m) => m.kind === "keHoach.doiCamTrich");
			const giao = moi.find((m) => m.kind === "buoc.giao");
			kiem(
				doi?.kind === "keHoach.doiCamTrich" &&
					doi.tu === f.a.id &&
					doi.den === f.q.id &&
					giao?.kind === "buoc.giao" &&
					giao.tu === f.a.id &&
					giao.den === null,
				`mlk: vet doi nguoi sai ${JSON.stringify(moi)}`,
			);
		},
		TRAN_MS,
	);

	test(
		"mlk-mo-lai: cầm trịch đọc được — bước và theo dõi của vai okr vẫn bị gỡ",
		async () => {
			const n = await nguoi();
			const k = await dungKeHoach({
				camTrich: n.m.id,
				quanTri: n.qt.id,
				buoc: [{ giao: n.a.id }],
			});
			const [b1] = k.buoc as [string];
			await theoDoi().bat({ planId: k.plan.id }, n.a.id);
			await dichVu().closePlan({ id: k.plan.id }, n.qt.id);
			await doiVai(n.a.id, "okr");
			kiem(await dangTheoDoi(k.plan.id, n.a.id), "mlk: dung sai theoDoiA");
			kiem((await buoc(b1)).assigneeId === n.a.id, "mlk: dung sai buoc1");

			const truoc = await idVet(k.plan.id);
			await dichVu().reopenPlan({ id: k.plan.id }, n.q.id);

			kiem(
				(await keHoach(k.plan.id)).ownerId === n.m.id,
				"mlk: doi cam trich doc duoc",
			);
			kiem(
				(await buoc(b1)).assigneeId === null,
				"mlk: cam trich doc duoc ma buoc con trong tay vai okr",
			);
			kiem(
				!(await dangTheoDoi(k.plan.id, n.a.id)),
				"mlk: cam trich doc duoc ma vai okr con theo doi",
			);
			const moi = await vetMoi(k.plan.id, truoc);
			kiem(
				loai(moi) === JSON.stringify(["buoc.giao", "keHoach.moLai"]),
				`mlk: vet cam trich doc duoc sai ${JSON.stringify(moi)}`,
			);
		},
		TRAN_MS,
	);

	test(
		"mlk-mo-lai: đối chứng member — không đổi người, chỉ vết mở lại",
		async () => {
			const n = await nguoi();
			const k = await dungKeHoach({
				camTrich: n.a.id,
				quanTri: n.qt.id,
				buoc: [{ giao: n.a.id }, { giao: n.m.id }],
			});
			const [b1, b2] = k.buoc as [string, string];
			await theoDoi().bat({ planId: k.plan.id }, n.a.id);
			await theoDoi().bat({ planId: k.plan.id }, n.m.id);
			await dichVu().closePlan({ id: k.plan.id }, n.qt.id);

			const truoc = await idVet(k.plan.id);
			await dichVu().reopenPlan({ id: k.plan.id }, n.q.id);
			const doi =
				(await keHoach(k.plan.id)).ownerId !== n.a.id ||
				(await buoc(b1)).assigneeId !== n.a.id ||
				(await buoc(b2)).assigneeId !== n.m.id ||
				!(await dangTheoDoi(k.plan.id, n.a.id));
			kiem(!doi, "mlk: mo lai doi nguoi doc duoc doi tac");
			const moi = await vetMoi(k.plan.id, truoc);
			kiem(
				loai(moi) === JSON.stringify(["keHoach.moLai"]),
				`mlk: doi chung co vet thua ${JSON.stringify(moi)}`,
			);

			const truoc2 = await idVet(k.plan.id);
			await dichVu().reopenPlan({ id: k.plan.id }, n.q.id);
			kiem(
				(await vetMoi(k.plan.id, truoc2)).length === 0,
				"mlk: mo lai lan hai co vet",
			);
		},
		TRAN_MS,
	);

	test(
		"mlk-mo-lai: đã rời — người bấm cầm trịch, bước chưa giao",
		async () => {
			const n = await nguoi();
			const k = await dungKeHoach({
				camTrich: n.a.id,
				quanTri: n.qt.id,
				buoc: [{ giao: n.a.id }],
			});
			const [b1] = k.buoc as [string];
			await dichVu().closePlan({ id: k.plan.id }, n.qt.id);
			await workspace().removeMember(n.qt.id, {
				memberId: await maMember(n.a.id),
			});
			const conHang = await db.member.count({ where: { userId: n.a.id } });
			kiem(conHang === 0, "mlk: dung sai member");
			kiem(
				(await keHoach(k.plan.id)).ownerId === n.a.id,
				"mlk: dung sai ownerId",
			);
			kiem((await buoc(b1)).assigneeId === n.a.id, "mlk: dung sai buoc1");

			const truoc = await idVet(k.plan.id);
			await dichVu().reopenPlan({ id: k.plan.id }, n.q.id);
			kiem(
				(await keHoach(k.plan.id)).ownerId === n.q.id,
				"mlk: cam trich da roi chua doi",
			);
			kiem(
				(await buoc(b1)).assigneeId === null,
				"mlk: buoc mo con trong tay nguoi da roi",
			);
			const moi = await vetMoi(k.plan.id, truoc);
			const doi = moi.find((m) => m.kind === "keHoach.doiCamTrich");
			const giao = moi.find((m) => m.kind === "buoc.giao");
			kiem(
				doi?.kind === "keHoach.doiCamTrich" &&
					doi.tu === n.a.id &&
					doi.den === n.q.id &&
					giao?.kind === "buoc.giao" &&
					giao.tu === n.a.id &&
					giao.den === null,
				`mlk: vet nguoi da roi sai ${JSON.stringify(moi)}`,
			);
		},
		TRAN_MS,
	);

	test(
		"mlk-mo-lai: người bấm không nhận được việc — 400, không ghi gì",
		async () => {
			const f = await dungChiOkr();
			const xOkr = await gieoThanhVien("Người X OKR MLK", "okr");
			const xNgoai = await gieoNguoiNgoai("Người X Ngoài MLK");

			const chup = async () =>
				JSON.stringify({
					plan: await keHoach(f.planId),
					buoc: await db.onboardingStep.findMany({
						where: { planId: f.planId },
						orderBy: { id: "asc" },
					}),
					theoDoi: await db.onboardingWatch.findMany({
						where: { planId: f.planId },
						orderBy: { userId: "asc" },
					}),
					vet: await db.activity.count({ where: { planId: f.planId } }),
				});
			const truoc = await chup();

			for (const [x, loiMong, ten] of [
				[xOkr, ONBOARDING.thongDiep.vaiChiOkr(xOkr.name), "okr"],
				[xNgoai, ONBOARDING.thongDiep.khongPhaiThanhVien(xNgoai.id), "ngoai"],
			] as const) {
				const loi = await nem(
					() => ghi().datDong(f.planId, false, x.id),
					`mlk: nguoi bam vai ${ten} khong bi chan`,
				);
				kiem(loi === loiMong, `mlk: loi nguoi bam sai ${loi}`);
				kiem((await chup()) === truoc, `mlk: tu choi ma van ghi ${ten}`);
			}
		},
		TRAN_MS,
	);
});

async function dungBoXong() {
	const n = await nguoi();
	const k = await dungKeHoach({
		camTrich: n.m.id,
		quanTri: n.qt.id,
		buoc: [
			{ giao: n.a.id, xong: true },
			{ giao: n.m.id, xong: true },
			{ xong: true },
		],
	});
	const [bA, bM, bTrong] = k.buoc as [string, string, string];
	kiem((await buoc(bA)).assigneeId === n.a.id, "mlk: dung sai buocA");
	kiem((await buoc(bA)).completedAt !== null, "mlk: dung sai buocA xong");
	kiem((await buoc(bM)).completedAt !== null, "mlk: dung sai buocM xong");
	return { ...n, planId: k.plan.id, bA, bM, bTrong };
}

describe("mlk-bo-xong", () => {
	test(
		"mlk-bo-xong: bỏ xong bước của vai okr — bước mở ở dạng chưa giao",
		async () => {
			const f = await dungBoXong();
			await workspace().setMemberRole(f.qt.id, {
				memberId: await maMember(f.a.id),
				role: "okr",
			});

			const truoc = await idVet(f.planId);
			await dichVu().setStepDone({ stepId: f.bA, done: false }, f.q.id);
			const bA = await buoc(f.bA);
			kiem(bA.completedAt === null, "mlk: buoc khong mo lai");
			kiem(bA.assigneeId === null, "mlk: bo xong tra buoc ve vai okr");
			const moi = await vetMoi(f.planId, truoc);
			kiem(
				loai(moi) === JSON.stringify(["buoc.boXong", "buoc.giao"]),
				`mlk: vet bo xong sai ${JSON.stringify(moi)}`,
			);
			const giao = moi.find((m) => m.kind === "buoc.giao");
			kiem(
				giao?.kind === "buoc.giao" && giao.tu === f.a.id && giao.den === null,
				`mlk: vet bo xong doi nguoi sai ${JSON.stringify(moi)}`,
			);

			const truocM = await idVet(f.planId);
			await dichVu().setStepDone({ stepId: f.bM, done: false }, f.q.id);
			kiem(
				(await buoc(f.bM)).assigneeId === f.m.id,
				"mlk: bo xong doi nguoi member",
			);
			const moiM = await vetMoi(f.planId, truocM);
			kiem(
				loai(moiM) === JSON.stringify(["buoc.boXong"]),
				`mlk: doi chung bo xong co vet thua ${JSON.stringify(moiM)}`,
			);

			const truocTrong = await idVet(f.planId);
			await dichVu().setStepDone({ stepId: f.bTrong, done: false }, f.q.id);
			kiem(
				loai(await vetMoi(f.planId, truocTrong)) ===
					JSON.stringify(["buoc.boXong"]),
				"mlk: bo xong buoc chua giao co vet giao",
			);

			const truocLai = await idVet(f.planId);
			await dichVu().setStepDone({ stepId: f.bA, done: false }, f.q.id);
			kiem(
				(await vetMoi(f.planId, truocLai)).length === 0,
				"mlk: bo xong lan hai co vet",
			);
		},
		TRAN_MS,
	);

	test(
		"mlk-bo-xong: đã rời — bỏ xong bước của người đã rời thành chưa giao",
		async () => {
			const f = await dungBoXong();
			await workspace().removeMember(f.qt.id, {
				memberId: await maMember(f.a.id),
			});
			await dichVu().setStepDone({ stepId: f.bA, done: false }, f.q.id);
			kiem(
				(await buoc(f.bA)).assigneeId === null,
				"mlk: bo xong tra buoc ve nguoi da roi",
			);
		},
		TRAN_MS,
	);

	test(
		"mlk-bo-xong: đối chứng vòng tròn — member giữ nguyên, vết như cũ",
		async () => {
			const n = await nguoi();
			const k = await dungKeHoach({
				camTrich: n.m.id,
				quanTri: n.qt.id,
				buoc: [{ giao: n.m.id }],
			});
			const [b1] = k.buoc as [string];
			const truoc = await idVet(k.plan.id);
			const buocVong = [
				() => dichVu().setStepDone({ stepId: b1, done: true }, n.q.id),
				() => dichVu().setStepDone({ stepId: b1, done: false }, n.q.id),
				() => dichVu().setStepDone({ stepId: b1, done: true }, n.q.id),
				() => dichVu().closePlan({ id: k.plan.id }, n.q.id),
				() => dichVu().reopenPlan({ id: k.plan.id }, n.q.id),
			];
			for (const [i, lam] of buocVong.entries()) {
				await lam();
				const doi =
					(await buoc(b1)).assigneeId !== n.m.id ||
					(await keHoach(k.plan.id)).ownerId !== n.m.id;
				kiem(!doi, `mlk: vong tron doi nguoi ${i}`);
			}
			const moi = await vetMoi(k.plan.id, truoc);
			kiem(
				loai(moi) ===
					JSON.stringify([
						"buoc.boXong",
						"buoc.xong",
						"buoc.xong",
						"keHoach.dong",
						"keHoach.moLai",
					]),
				`mlk: vong tron vet sai ${loai(moi)}`,
			);
		},
		TRAN_MS,
	);
});

describe("mlk-thuoc", () => {
	test(
		"mlk-thuoc: sau mở lại và sau bỏ xong thước về 0; đường cũ thước đỏ",
		async () => {
			const f = await dungChiOkr();
			await dichVu().reopenPlan({ id: f.planId }, f.q.id);
			const sauMo = chayThuoc(f.a.id);
			kiem(
				sauMo.status === 0,
				`mlk: thuoc con viec mo sau mo lai ${sauMo.status} ${sauMo.stdout}`,
			);

			const g = await dungBoXong();
			await workspace().setMemberRole(g.qt.id, {
				memberId: await maMember(g.a.id),
				role: "okr",
			});
			await dichVu().setStepDone({ stepId: g.bA, done: false }, g.q.id);
			const sauBo = chayThuoc(g.a.id);
			kiem(
				sauBo.status === 0,
				`mlk: thuoc con viec mo sau bo xong ${sauBo.status}`,
			);

			const h = await dungChiOkr();
			await db.onboardingPlan.update({
				where: { id: h.planId },
				data: { closedAt: null },
			});
			const duongCu = chayThuoc(h.a.id);
			kiem(
				duongCu.status === 1,
				`mlk: thuoc khong do duoc viec mo ${duongCu.status}`,
			);
		},
		TRAN_MS,
	);
});
