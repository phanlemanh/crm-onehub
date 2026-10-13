import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ActivitiesService } from "../../../apps/api/src/activities/activities.service";
import { ActivityStampService } from "../../../apps/api/src/crm/activity-stamp.service";
import { db } from "../src/client";
import { TrangThaiViec } from "../src/generated/prisma/enums";
import { parseVetViec } from "../src/viec";
import { chepTatCa, daoTatCa, demViecCanLam } from "../src/viec-chep";
import { chepViecCanLam, doiTrangThai, taoViec } from "../src/viec-ghi";
import {
	donNguoi,
	khuonApi,
	khuonMaLech,
	khuonTacNhan,
	moToChuc,
	taoNguoi,
} from "./support/viec-can-lam-cu";

const MA = `cvc${Date.now().toString(36)}`;
const NGAY_MS = 24 * 60 * 60 * 1000;

let quanTri = "";
let thuong = "";
let congTy = "";
let thoaThuan = "";
let caNhan = "";
let keHoach = "";

function hong(dieu: boolean, thongDiep: string): void {
	if (!dieu) throw new Error(thongDiep);
}

async function vanTay() {
	const [viec, viecVet, viecGan] = await Promise.all([
		db.viec.count(),
		db.viecVet.count(),
		db.viecGan.count(),
	]);
	return { viec, viecVet, viecGan };
}

async function banChepCua(activityId: string) {
	return db.viec.findMany({
		where: { activityGocId: activityId },
		include: { gan: true, vet: true },
	});
}

async function dongThoiGian(dealId: string): Promise<string[]> {
	const doc = new ActivitiesService(db, new ActivityStampService(db));
	const ket = await doc.timeline({ dealId, filter: "all", limit: 100 });
	return ket.entries.map((e) => e.id);
}

async function hangGoc(id: string) {
	return JSON.stringify(await db.activity.findUnique({ where: { id } }));
}

beforeAll(async () => {
	await moToChuc();
	quanTri = await taoNguoi(`${MA}-q`, "admin");
	thuong = await taoNguoi(`${MA}-m`, "member");
	const cty = await db.company.create({ data: { name: `${MA} cty` } });
	congTy = cty.id;
	thoaThuan = (
		await db.deal.create({
			data: { name: `${MA} deal`, companyId: congTy, ownerId: thuong },
		})
	).id;
	caNhan = (
		await db.contact.create({
			data: { firstName: `${MA}`, lastName: "Lan", companyId: congTy },
		})
	).id;
	keHoach = (
		await db.onboardingPlan.create({
			data: {
				companyId: congTy,
				startedAt: new Date(),
				targetDays: 30,
				ownerId: thuong,
			},
		})
	).id;
});

afterAll(async () => {
	await donNguoi(MA);
});

describe("cvc-chep-du", () => {
	test("cvc-chep-du: mỗi việc cần làm cũ thành đúng một Việc đủ trường, bản gốc giữ nguyên", async () => {
		const han = new Date(Date.now() + 2 * NGAY_MS);
		const luc = new Date(Date.now() - 5 * NGAY_MS);
		const lucXong = new Date(Date.now() - NGAY_MS);
		const ca = {
			"1": await khuonApi({
				createdById: thuong,
				subject: "Gửi báo giá",
				body: "Kèm bảng phí",
				dueAt: han,
				dealId: thoaThuan,
				companyId: congTy,
				createdAt: luc,
			}),
			"2": await khuonApi({
				createdById: thuong,
				subject: "Gọi chị Lan",
				contactId: caNhan,
				companyId: congTy,
				completedAt: lucXong,
				createdAt: luc,
			}),
			"3": await khuonApi({
				createdById: thuong,
				subject: "Chuẩn bị tài liệu",
				planId: keHoach,
				companyId: congTy,
				createdAt: luc,
			}),
			"4": await khuonApi({
				createdById: thuong,
				subject: null,
				body: "Gọi lại\nchi tiết",
				dealId: thoaThuan,
				createdAt: luc,
			}),
			"5": await khuonApi({
				createdById: thuong,
				subject: null,
				body: null,
				dealId: thoaThuan,
				createdAt: luc,
			}),
			"6": await khuonTacNhan({
				createdById: thuong,
				subject: "Tác nhân nhắc",
				dealId: thoaThuan,
				companyId: congTy,
				agentId: `${MA}-ag`,
				runId: `${MA}-run`,
				actionId: `${MA}-act`,
				createdAt: luc,
			}),
			"7": await khuonMaLech({
				createdById: thuong,
				subject: "Gắn mã nền tảng MB-1 vào đúng cá nhân",
				body: "Mở đúng cá nhân",
				planId: keHoach,
				companyId: congTy,
				platformBrokerId: "MB-1",
				createdAt: luc,
			}),
			rf1: await khuonApi({
				createdById: thuong,
				subject: "   ",
				body: "\n  Gọi lại\nchi tiết",
				dealId: thoaThuan,
				createdAt: luc,
			}),
		};
		const ghiChu = await db.activity.create({
			data: {
				type: "NOTE",
				body: "ghi chú",
				dealId: thoaThuan,
				createdById: thuong,
			},
		});
		const cuocGoi = await db.activity.create({
			data: {
				type: "CALL",
				body: "đã gọi",
				dealId: thoaThuan,
				createdById: thuong,
			},
		});
		const gocTruoc = new Map<string, string>();
		for (const id of Object.values(ca)) gocTruoc.set(id, await hangGoc(id));
		const nen = await demViecCanLam(db);
		const viecTruoc = await db.viec.count();

		const ket = await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		hong(
			ket.loi.length === 0,
			`cvc: chep khong ra dung mot viec loi ${JSON.stringify(ket.loi)}`,
		);

		const ky = {
			"1": {
				tieuDe: "Gửi báo giá",
				moTa: "Kèm bảng phí",
				gan: ["company", "deal"],
				xong: false,
				khoa: null,
				han: true,
			},
			"2": {
				tieuDe: "Gọi chị Lan",
				moTa: null,
				gan: ["company", "contact"],
				xong: true,
				khoa: null,
				han: false,
			},
			"3": {
				tieuDe: "Chuẩn bị tài liệu",
				moTa: null,
				gan: ["company", "plan"],
				xong: false,
				khoa: null,
				han: false,
			},
			"4": {
				tieuDe: "Gọi lại",
				moTa: null,
				gan: ["deal"],
				xong: false,
				khoa: null,
				han: false,
			},
			"5": {
				tieuDe: "Việc cần làm",
				moTa: null,
				gan: ["deal"],
				xong: false,
				khoa: null,
				han: false,
			},
			"6": {
				tieuDe: "Tác nhân nhắc",
				moTa: null,
				gan: ["company", "deal"],
				xong: false,
				khoa: null,
				han: false,
			},
			"7": {
				tieuDe: "Gắn mã nền tảng MB-1 vào đúng cá nhân",
				moTa: "Mở đúng cá nhân",
				gan: ["company", "plan"],
				xong: false,
				khoa: "ma-lech:MB-1",
				han: false,
			},
			rf1: {
				tieuDe: "Gọi lại",
				moTa: null,
				gan: ["deal"],
				xong: false,
				khoa: null,
				han: false,
			},
		} as const;

		for (const [ten, id] of Object.entries(ca)) {
			const k = ky[ten as keyof typeof ky];
			const goc = await db.activity.findUniqueOrThrow({ where: { id } });
			const ban = await banChepCua(id);
			hong(ban.length === 1, `cvc: chep khong ra dung mot viec ${ten}`);
			const v = ban[0];
			if (!v) throw new Error(`cvc: chep khong ra dung mot viec ${ten}`);
			hong(v.tieuDe === k.tieuDe, `cvc: chep sai truong tieuDe ${ten}`);
			hong(v.moTa === k.moTa, `cvc: chep sai truong moTa ${ten}`);
			hong(
				(v.hanNgay?.getTime() ?? null) === (goc.dueAt?.getTime() ?? null) &&
					(k.han ? v.hanNgay !== null : true),
				`cvc: chep sai truong hanNgay ${ten}`,
			);
			const trangThai = k.xong ? TrangThaiViec.XONG : TrangThaiViec.CHUA_LAM;
			hong(v.trangThai === trangThai, `cvc: chep sai truong trangThai ${ten}`);
			hong(
				(v.khepLuc?.getTime() ?? null) === (goc.completedAt?.getTime() ?? null),
				`cvc: chep sai truong khepLuc ${ten}`,
			);
			for (const cot of [
				"nguoiGiaoId",
				"nguoiThucHienId",
				"taoBoiId",
			] as const) {
				hong(v[cot] === goc.createdById, `cvc: chep sai truong ${cot} ${ten}`);
			}
			hong(
				v.taoLuc.getTime() === goc.createdAt.getTime(),
				`cvc: chep sai truong taoLuc ${ten}`,
			);
			const gan = v.gan
				.map((g) =>
					g.companyId
						? "company"
						: g.contactId
							? "contact"
							: g.dealId
								? "deal"
								: "plan",
				)
				.sort();
			hong(
				JSON.stringify(gan) === JSON.stringify([...k.gan].sort()),
				`cvc: chep sai gan ${ten}`,
			);
			hong(v.khoaNguon === k.khoa, `cvc: chep sai khoa nguon ${ten}`);
			const tao = v.vet.filter((d) => d.loai === "tao");
			const vet = tao[0] ? parseVetViec(tao[0]) : null;
			hong(
				v.vet.length === 1 &&
					tao.length === 1 &&
					tao[0]?.nguon === "chep-cu" &&
					tao[0]?.luc.getTime() === goc.createdAt.getTime() &&
					vet?.loai === "tao" &&
					vet.sau.chep?.activityGocId === id,
				`cvc: chep sai vet ${ten}`,
			);
			hong(
				(await hangGoc(id)) === gocTruoc.get(id),
				`cvc: ban goc bi doi ${ten}`,
			);
		}

		hong(
			(await banChepCua(ghiChu.id)).length === 0 &&
				(await banChepCua(cuocGoi.id)).length === 0,
			"cvc: chep ca hoat dong khong phai viec can lam",
		);
		hong(
			(await db.viec.count()) - viecTruoc === nen.chuaChep,
			"cvc: chep ca hoat dong khong phai viec can lam",
		);
		expect(ket.chep).toBe(nen.chuaChep);
	});
});

describe("cvc-chep-lai", () => {
	test("cvc-chep-lai: chạy lại không nhân bản, hỏng giữa chừng không kéo việc khác, chạy thử không ghi", async () => {
		await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		const truoc = await db.viec.count();
		const lai = await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		hong(
			lai.chep === 0 && (await db.viec.count()) === truoc,
			`cvc: chep lai nhan ban ${lai.chep}`,
		);

		const daChep = {
			id: await khuonApi({
				createdById: thuong,
				subject: "Chép lại",
				dealId: thoaThuan,
			}),
		};
		await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		const truocLai = await db.viec.count();
		let chepLai: { id: string } | string | null = "chua-chay";
		try {
			chepLai = await db.$transaction((tx) =>
				chepViecCanLam(tx, {
					activityId: daChep.id,
					nguoiChay: { id: quanTri, ten: quanTri },
					now: new Date(),
				}),
			);
		} catch (e) {
			chepLai = e instanceof Error ? e.message : String(e);
		}
		hong(
			chepLai === null && (await db.viec.count()) === truocLai,
			`cvc: chep lai nhan ban ${JSON.stringify(chepLai)}`,
		);

		const ba = [
			await khuonApi({
				createdById: thuong,
				subject: "Một",
				dealId: thoaThuan,
				createdAt: new Date(Date.now() - 3000),
			}),
			await khuonApi({
				createdById: thuong,
				subject: "Hai",
				dealId: thoaThuan,
				createdAt: new Date(Date.now() - 2000),
			}),
			await khuonApi({
				createdById: thuong,
				subject: "Ba",
				dealId: thoaThuan,
				createdAt: new Date(Date.now() - 1000),
			}),
		];
		const giua = ba[1] ?? "";
		const cay: typeof chepViecCanLam = (tx, i) =>
			i.activityId === giua
				? Promise.reject(new Error("cvc-loi-cay"))
				: chepViecCanLam(tx, i);

		const vtThu = await vanTay();
		const thu = await chepTatCa(db, {
			nguoiChayId: quanTri,
			now: new Date(),
			thu: true,
			chepMot: cay,
		});
		const vtSauThu = await vanTay();
		hong(
			JSON.stringify(vtThu) === JSON.stringify(vtSauThu),
			"cvc: chay thu ghi vao kho",
		);
		hong(
			thu.thu &&
				thu.loi.some((l) => l.id === giua && l.lyDo.includes("cvc-loi-cay")),
			"cvc: chay thu khong bao loi",
		);

		const ket = await chepTatCa(db, {
			nguoiChayId: quanTri,
			now: new Date(),
			chepMot: cay,
		});
		hong(
			(await banChepCua(ba[0] ?? "")).length === 1 &&
				(await banChepCua(ba[2] ?? "")).length === 1,
			"cvc: hong giua chung lam mat viec khac",
		);
		hong(
			(await banChepCua(giua)).length === 0 &&
				ket.loi.some((l) => l.id === giua && l.lyDo.includes("cvc-loi-cay")),
			"cvc: viec hong khong duoc bao",
		);
		await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		const dem = await demViecCanLam(db);
		hong(
			(await banChepCua(giua)).length === 1 && dem.chuaChep === 0,
			"cvc: chay lai khong chep viec da hong",
		);

		const moi = await khuonApi({
			createdById: thuong,
			subject: "Song song",
			dealId: thoaThuan,
		});
		await Promise.all([
			chepTatCa(db, { nguoiChayId: quanTri, now: new Date() }),
			chepTatCa(db, { nguoiChayId: quanTri, now: new Date() }),
		]);
		hong((await banChepCua(moi)).length === 1, "cvc: chay song song nhan ban");
	});
});

describe("cvc-nguoi-tao", () => {
	test("cvc-nguoi-tao: ma trận 18 ô người tạo × trạng thái × gắn", async () => {
		const okr = await taoNguoi(`${MA}-okr`, "okr");
		const roi = await taoNguoi(`${MA}-roi`, "member");
		const nguoiTao = { member: thuong, okr, roi } as const;
		const ganCua = {
			"thoa-thuan": { dealId: thoaThuan },
			"ke-hoach": { planId: keHoach },
			"khong-gan": {},
		} as const;
		const MA_TRAN: {
			xong: boolean;
			gan: keyof typeof ganCua;
			tao: keyof typeof nguoiTao;
		}[] = [];
		for (const xong of [false, true]) {
			for (const gan of ["thoa-thuan", "ke-hoach", "khong-gan"] as const) {
				for (const tao of ["member", "okr", "roi"] as const)
					MA_TRAN.push({ xong, gan, tao });
			}
		}
		const o: { ten: string; id: string; doiNguoi: boolean; tao: string }[] = [];
		for (const c of MA_TRAN) {
			const id = await khuonApi({
				createdById: nguoiTao[c.tao],
				subject: `${c.xong ? "xong" : "mo"} ${c.gan} ${c.tao}`,
				completedAt: c.xong ? new Date() : null,
				...ganCua[c.gan],
			});
			o.push({
				ten: `${c.xong ? "xong" : "mo"}-${c.gan}-${c.tao}`,
				id,
				doiNguoi: !c.xong && c.tao !== "member",
				tao: nguoiTao[c.tao],
			});
		}
		hong(o.length === 18, `cvc: ma tran nguoi tao thieu o ${o.length}`);
		await db.member.delete({ where: { id: `m-${roi}` } });

		await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		for (const c of o) {
			const ban = await banChepCua(c.id);
			hong(ban.length === 1, `cvc: o khong chep duoc ${c.ten}`);
			const v = ban[0];
			if (!v) continue;
			const tao = v.vet.find((d) => d.loai === "tao");
			const vet = tao ? parseVetViec(tao) : null;
			const goc = vet?.loai === "tao" ? vet.sau.chep?.nguoiTaoGoc : undefined;
			if (c.doiNguoi) {
				hong(
					v.nguoiGiaoId === quanTri &&
						v.nguoiThucHienId === quanTri &&
						v.taoBoiId === c.tao &&
						goc?.id === c.tao,
					`cvc: nguoi tao khong nhan van giu ${c.ten}`,
				);
			} else {
				hong(
					v.nguoiGiaoId === c.tao &&
						v.nguoiThucHienId === c.tao &&
						v.taoBoiId === c.tao,
					`cvc: viec doi nguoi sai ${c.ten}`,
				);
			}
		}

		const moi = await khuonApi({
			createdById: thuong,
			subject: "Chờ quản trị",
			dealId: thoaThuan,
		});
		for (const nguoiChayId of [null, thuong]) {
			const vt = await db.viec.count();
			let loi = "";
			try {
				await chepTatCa(db, { nguoiChayId, now: new Date() });
			} catch (e) {
				loi = e instanceof Error ? e.message : String(e);
			}
			hong(
				loi.includes("quản trị") && (await db.viec.count()) === vt,
				"cvc: chay khong co quan tri van ghi",
			);
		}
		hong(
			(await banChepCua(moi)).length === 0,
			"cvc: chay khong co quan tri van ghi",
		);
	});
});

describe("cvc-dao", () => {
	test("cvc-dao: đảo xoá bản chép chưa đổi, giữ bản đã đổi trừ khi có cờ", async () => {
		await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		const a = await khuonApi({
			createdById: thuong,
			subject: "Đảo một",
			dealId: thoaThuan,
		});
		const b = await khuonApi({
			createdById: thuong,
			subject: "Đảo hai",
			dealId: thoaThuan,
		});
		const gocA = await hangGoc(a);
		const gocB = await hangGoc(b);
		const web = await db.$transaction((tx) =>
			taoViec(tx, {
				nguoiId: thuong,
				tieuDe: "Việc web",
				gan: [{ loai: "deal", id: thoaThuan }],
				nguon: "web",
				now: new Date(),
			}),
		);
		await chepTatCa(db, { nguoiChayId: quanTri, now: new Date() });
		const banA = (await banChepCua(a))[0]?.id ?? "";
		const banB = (await banChepCua(b))[0]?.id ?? "";
		await db.$transaction((tx) =>
			doiTrangThai(tx, {
				viecId: banB,
				nguoiId: thuong,
				nguon: "web",
				now: new Date(),
				den: TrangThaiViec.DANG_LAM,
			}),
		);

		const truocDao = (await dongThoiGian(thoaThuan)).filter((id) =>
			[a, b].includes(id),
		);
		hong(truocDao.length === 0, "cvc: ban goc hien khi ban chep con");
		const ket = await daoTatCa(db, { caBanDaDoi: false });
		hong(
			(await db.viec.count({ where: { id: banA } })) === 0 &&
				(await db.viecVet.count({ where: { viecId: banA } })) === 0 &&
				(await db.viecGan.count({ where: { viecId: banA } })) === 0,
			"cvc: dao khong xoa ban chua doi",
		);
		hong(
			(await db.viec.count({ where: { id: banB } })) === 1 &&
				ket.giuLai.includes(banB),
			"cvc: dao xoa ban da doi",
		);
		hong(
			(await db.viec.count({ where: { id: web.id } })) === 1,
			"cvc: dao xoa viec khong phai ban chep",
		);

		await daoTatCa(db, { caBanDaDoi: true });
		hong(
			(await db.viec.count({ where: { id: banB } })) === 0,
			"cvc: dao ca ban da doi khong xoa",
		);
		hong(
			(await hangGoc(a)) === gocA && (await hangGoc(b)) === gocB,
			"cvc: dao doi ban goc",
		);
		const hien = (await dongThoiGian(thoaThuan)).filter((id) =>
			[a, b].includes(id),
		);
		hong(hien.length === 2, "cvc: dao xong viec cu khong hien lai");
		hong(
			(await db.viec.count({ where: { id: web.id } })) === 1,
			"cvc: dao xoa viec khong phai ban chep",
		);
	});
});
