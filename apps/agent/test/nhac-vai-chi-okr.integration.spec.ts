import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import {
	DAY_MS,
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
} from "./support/nhac-gieo";
import { hangCua } from "./support/nhac-gui-gieo";
import {
	batBot,
	donOkr,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	noiZalo,
	tatBot,
} from "./support/okr-gieo";
import { APP_URL, voiToken } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const LOAI_KE_HOACH: readonly string[] = [
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
];

function vn(luc: string): Date {
	return new Date(`${luc}+07:00`);
}

const NOW = vn("2026-10-14T10:00:00");
const TUAN_TRUOC = vn("2026-10-05T10:00:00");

beforeEach(async () => {
	await donOkr();
	await moXuong();
	setSystemTime(NOW);
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donOkr();
	await tatBot();
});

async function tenCongTyCua(planId: string): Promise<string> {
	const plan = await db.onboardingPlan.findUniqueOrThrow({
		where: { id: planId },
		select: { company: { select: { name: true } } },
	});
	return plan.company.name;
}

async function dungNguoi(ten: string, vai: string) {
	const nguoi = await gieoNguoi(ten);
	const cam = await gieoNguoi(`${ten} cam`);
	const sapHan = await gieoKeHoach({
		camTrich: cam.id,
		batDau: new Date(NOW.getTime() - 10 * DAY_MS),
		buoc: [
			{
				nhan: "Buoc sap han",
				han: new Date(NOW.getTime() + 2 * DAY_MS),
				giao: nguoi.id,
			},
		],
	});
	const im = await gieoKeHoach({
		camTrich: nguoi.id,
		batDau: new Date(NOW.getTime() - 20 * DAY_MS),
		buoc: [{ nhan: "Buoc im", han: new Date(NOW.getTime() + 20 * DAY_MS) }],
		imTu: new Date(NOW.getTime() - 8 * DAY_MS),
	});
	const moc = await gieoKeHoach({
		camTrich: cam.id,
		batDau: new Date(NOW.getTime() - 6 * DAY_MS),
		buoc: [{ nhan: "Buoc moc", han: new Date(NOW.getTime() + 20 * DAY_MS) }],
		theoDoi: [nguoi.id],
	});
	const chay = await gieoChuKy("dang-chay", 1);
	const mucTieu = await gieoMucTieu({
		cycleId: chay,
		chu: nguoi.id,
		congBo: TUAN_TRUOC,
	});
	await gieoKr({
		objectiveId: mucTieu,
		chu: nguoi.id,
		tieuDe: `KR VLR ${ten}`,
		khoa: TUAN_TRUOC,
	});
	await db.member.updateMany({
		where: { userId: nguoi.id },
		data: { role: vai },
	});
	const congTy = await Promise.all(
		[sapHan, im, moc].map((k) => tenCongTyCua(k.plan.id)),
	);
	return { nguoi, congTy };
}

describe("vlr-gom", () => {
	test("vlr-gom: vai okr không có việc kế hoạch ở cả hai cửa sổ, vẫn có việc OKR; member đủ ba loại; người đã rời không có gì", async () => {
		const okr = await dungNguoi("vlr-gom-okr", "okr");
		const thuong = await dungNguoi("vlr-gom-member", "member");
		const roi = await dungNguoi("vlr-gom-roi", "member");
		await db.member.deleteMany({ where: { userId: roi.nguoi.id } });
		for (const cuaSo of ["buoi-sang", "truc-tiep"] as const) {
			const kq = await viecCanNhac(db, { now: NOW, cuaSo });
			const cuaOkr = kq.get(okr.nguoi.id) ?? [];
			const lo = cuaOkr.find((v) => LOAI_KE_HOACH.includes(v.loai));
			if (lo) {
				throw new Error(
					`vlr: bo gom con viec ke hoach cho vai okr ${lo.loai} ${cuaSo}`,
				);
			}
			if (!cuaOkr.some((v) => v.loai === "okr-cap-nhat")) {
				throw new Error(`vlr: bo gom mat viec okr ${cuaSo}`);
			}
			const cuaThuong = (kq.get(thuong.nguoi.id) ?? []).map((v) => v.loai);
			for (const loai of ["buoc-sap-han", "ke-hoach-im", "moc-ngay"]) {
				if (!cuaThuong.includes(loai)) {
					throw new Error(`vlr: doi chung thieu ${loai} ${cuaSo}`);
				}
			}
			expect(kq.has(roi.nguoi.id)).toBe(false);
		}
	});
});

async function guiMot(
	ten: string,
	vai: string,
	kenh: "zalo" | "slack",
): Promise<{ tin: string[]; daGui: { loai: string }[]; congTy: string[] }> {
	const { nguoi, congTy } = await dungNguoi(ten, vai);
	const z = zaloGia();
	const s = slackGia();
	if (kenh === "zalo") {
		await noiZalo(nguoi.id, `Z-${nguoi.id}`);
		await batBot();
	} else {
		await noiSlack(nguoi.id);
		await khopSlack(nguoi.id, `S-${nguoi.id}`);
		await db.notificationPreference.create({
			data: { userId: nguoi.id, channel: "SLACK" },
		});
	}
	await lenLichNhac(NOW);
	const hang = await hangCua(nguoi.id);
	await voiToken(() =>
		chayNhac(hang, {
			fetcher: s.fetcher,
			zaloFetcher: z.fetcher,
			appUrl: APP_URL,
		}),
	);
	const tin =
		kenh === "zalo"
			? z.guiToi(`Z-${nguoi.id}`).map((g) => g.body.text ?? "")
			: s.goi
					.filter((g) => g.url.endsWith("chat.postMessage"))
					.map((g) => g.body.text ?? "");
	const sau = await db.agentTask.findUniqueOrThrow({ where: { id: hang.id } });
	return { tin, daGui: parseNhacPayload(sau.payload).daGui ?? [], congTy };
}

describe("vlr-tin", () => {
	test.each(["zalo", "slack"] as const)(
		"vlr-tin: tin %s tới vai okr có việc OKR, không tên công ty",
		async (kenh) => {
			const ten = `vlr-tin-${kenh}`;
			const { tin, daGui, congTy } = await guiMot(ten, "okr", kenh);
			if (tin.length !== 1) {
				throw new Error(`vlr: ${kenh} khong gui dung mot tin ${tin.length}`);
			}
			const than = tin[0] ?? "";
			if (!than.includes("KR chờ cập nhật tuần này")) {
				throw new Error(`vlr: tin ${kenh} thieu viec okr`);
			}
			const lo = congTy.find((c) => than.includes(c));
			if (lo) throw new Error(`vlr: tin ${kenh} mang ten doi tac ${lo}`);
			if (daGui.some((m) => LOAI_KE_HOACH.includes(m.loai))) {
				throw new Error("vlr: daGui co viec ke hoach");
			}
		},
	);

	test("vlr-tin: đối chứng — tin của member mang tên công ty của chính họ", async () => {
		const { tin, congTy } = await guiMot("vlr-tin-member", "member", "zalo");
		const than = tin[0] ?? "";
		if (!congTy.some((c) => than.includes(c))) {
			throw new Error("vlr: doi chung tin member thieu ten cong ty");
		}
	});

	test("vlr-tin: vai okr chỉ có việc kế hoạch → không hàng, không tin; member cùng khuôn có hàng", async () => {
		const okr = await gieoNguoi("vlr-chi-ke-hoach");
		const thuong = await gieoNguoi("vlr-chi-ke-hoach-member");
		const cam = await gieoNguoi("vlr-cam");
		for (const n of [okr, thuong]) {
			await gieoKeHoach({
				camTrich: cam.id,
				batDau: new Date(NOW.getTime() - 10 * DAY_MS),
				buoc: [
					{ nhan: "B", han: new Date(NOW.getTime() + 2 * DAY_MS), giao: n.id },
				],
			});
		}
		await db.member.updateMany({
			where: { userId: okr.id },
			data: { role: "okr" },
		});
		await noiZalo(okr.id, `Z-${okr.id}`);
		await batBot();
		await lenLichNhac(NOW);
		const theoTienTo = (id: string) =>
			db.agentTask.count({
				where: {
					kind: "nhac-ke-hoach",
					subject: { startsWith: `user:${id}:` },
				},
			});
		if ((await theoTienTo(thuong.id)) === 0) {
			throw new Error("vlr: doi chung chi ke hoach khong co hang");
		}
		if ((await theoTienTo(okr.id)) !== 0) {
			throw new Error("vlr: ghi hang nhac cho vai okr chi co ke hoach");
		}
		const z = zaloGia();
		const hangMo = await db.agentTask.findMany({
			where: { kind: "nhac-ke-hoach", finishedAt: null },
		});
		for (const h of hangMo) {
			await voiToken(() =>
				chayNhac(h, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
			).catch(() => undefined);
		}
		if (z.guiToi(`Z-${okr.id}`).length > 0) {
			throw new Error("vlr: gui tin cho vai okr chi co ke hoach");
		}
	});
});
