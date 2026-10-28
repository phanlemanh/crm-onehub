import { describe, expect, setSystemTime, test } from "bun:test";
import { db } from "@crm/db";
import { chuoiMoiLan, type DiemMoiLan } from "../src/okr/dien-bien";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import {
	dienBienOutput,
	type LichSuKrOutput,
	lichSuKrOutput,
} from "../src/okr/okr-xem.contracts";
import {
	CHUONG_TRINH_RONG,
	dungSan,
	goi,
	goiQuery,
	type Json,
	kyDangChay,
	ma,
	ok,
	pbMoi,
	phien,
	truongMoi,
	ungDung,
} from "./okr-san";

dungSan();

const MA_TRAN_MS = 120_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const GIO_MS = 60 * 60 * 1000;
const GIO_GIEO = new Date("2026-09-21T03:00:00.000Z");
const GIO_DO = new Date("2026-10-21T05:00:00.000Z");
const truocDo = (ngay: number) => new Date(GIO_DO.getTime() - ngay * NGAY_MS);
const DAU_TUAN_DO = new Date("2026-10-19T03:00:00.000Z");

type Lan = { luc: Date; giaTri: number; ghiChu?: string };
type Ca = { ten: string; kieu: "tang-toi" | "moc"; lan: Lan[] };

const CA: Ca[] = [
	{ ten: "chua-lan-nao", kieu: "tang-toi", lan: [] },
	{ ten: "mot-lan", kieu: "tang-toi", lan: [{ luc: GIO_DO, giaTri: 21 }] },
	{
		ten: "nhieu-tuan",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(14), giaTri: 15, ghiChu: "tuan dau" },
			{ luc: truocDo(7), giaTri: 18 },
			{ luc: GIO_DO, giaTri: 22, ghiChu: "tuan nay tang" },
		],
	},
	{
		ten: "hai-lan-cung-tuan",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(7), giaTri: 30 },
			{ luc: DAU_TUAN_DO, giaTri: 27, ghiChu: "lan mot" },
			{ luc: GIO_DO, giaTri: 24, ghiChu: "lan hai" },
		],
	},
	{
		ten: "hai-lan-cung-ngay",
		kieu: "tang-toi",
		lan: [
			{ luc: GIO_DO, giaTri: 31 },
			{ luc: new Date(GIO_DO.getTime() + 2 * GIO_MS), giaTri: 33 },
		],
	},
	{
		ten: "hai-lan-cung-phut",
		kieu: "tang-toi",
		lan: [
			{ luc: GIO_DO, giaTri: 40 },
			{ luc: GIO_DO, giaTri: 41 },
		],
	},
	{
		ten: "kr-moc",
		kieu: "moc",
		lan: [
			{ luc: truocDo(7), giaTri: 0, ghiChu: "chua xong" },
			{ luc: GIO_DO, giaTri: 1 },
		],
	},
	{
		ten: "ghi-chu-rong",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(7), giaTri: 11, ghiChu: "   " },
			{ luc: GIO_DO, giaTri: 13 },
		],
	},
];

async function taoKr(
	objectiveId: string,
	ownerUserId: string,
	ai: string,
	kieu: Ca["kieu"],
): Promise<string> {
	const so =
		kieu === "moc"
			? { startValue: 0, targetValue: 1, currentValue: 0, unit: "" }
			: { startValue: 10, targetValue: 50, currentValue: 10, unit: "đại lý" };
	return ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("lsml kr"),
				kind: kieu,
				ownerUserId,
				dueOn: null,
				weight: 1,
				...so,
			},
			ai,
		),
		"tao kr",
	).id;
}

async function capNhat(
	userId: string,
	keyResultId: string,
	l: Lan,
): Promise<void> {
	setSystemTime(l.luc);
	const svc = ungDung().get(OkrCapNhatService);
	const { sessionId } = await svc.moCapNhat(userId, { entry: "tab" }, l.luc);
	await svc.guiCapNhat(
		userId,
		{
			sessionId,
			items: [
				{
					keyResultId,
					value: l.giaTri,
					confidence: "vua",
					note: l.ghiChu ?? "",
				},
			],
		},
		l.luc,
	);
}

type LanSql = {
	id: string;
	giaTri: number;
	ghiChu: string;
	tuTin: string;
	luc: string;
	ngay: string;
	tuan: string;
};

async function lanSql(keyResultId: string): Promise<LanSql[]> {
	return db.$queryRaw<LanSql[]>`
		SELECT c.id, c.value::float8 AS "giaTri", c.note AS "ghiChu", c.confidence AS "tuTin",
			to_char(coalesce(s."submittedAt", c."createdAt") AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS luc,
			to_char(((coalesce(s."submittedAt", c."createdAt") AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD') AS ngay,
			to_char(c."weekStart", 'YYYY-MM-DD') AS tuan
		FROM "okrCheckIn" c
		JOIN "okrCheckInSession" s ON s.id = c."sessionId"
		WHERE c."keyResultId" = ${keyResultId}
		ORDER BY coalesce(s."submittedAt", c."createdAt") ASC, c.id ASC`;
}

async function gieoBo(ten: string) {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	setSystemTime(GIO_GIEO);
	const quy = await kyDangChay(ten);
	const P = await pbMoi(`${ten} P`, null);
	const truong = await truongMoi("department", P, `${ten}-p`);
	const unit: Json = { level: "phong-ban", departmentId: P };
	const mt = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId: quy,
				unit,
				title: ma(`${ten} muc tieu`),
				kind: "cam-ket",
				ownerUserId: truong.nguoi,
				participantIds: [],
				whyNow: "",
				hienThi: "cong-khai",
			},
			truong.cookie,
		),
		"tao muc tieu",
	).id;
	const krCua = new Map<string, string>();
	for (const ca of CA)
		krCua.set(ca.ten, await taoKr(mt, truong.nguoi, truong.cookie, ca.kieu));
	ok(await goi("okr.publishObjective", { id: mt }, truong.cookie), "cong bo");
	for (const ca of CA)
		for (const l of ca.lan)
			await capNhat(truong.nguoi, krCua.get(ca.ten) ?? "", l);
	setSystemTime(GIO_DO);
	return krCua;
}

async function docLichSu(keyResultId: string): Promise<LichSuKrOutput> {
	const tra = await goiQuery("okr.lichSuKr", "quan", { keyResultId });
	expect(`lichSuKr HTTP ${tra.status} ${tra.loi}`).toBe("lichSuKr HTTP 200 ");
	return lichSuKrOutput.parse(tra.data);
}

function lechLan(ca: Ca, ls: LichSuKrOutput, sql: LanSql[]): string[] {
	const loi: string[] = [];
	if (ls.lan.length !== sql.length)
		return [`lsml-lan: ${ca.ten} ${ls.lan.length} lan can ${sql.length}`];
	sql.forEach((s, i) => {
		const l = ls.lan[i];
		if (!l) return;
		const mong = {
			checkInId: s.id,
			luc: s.luc,
			ngay: s.ngay,
			tuan: s.tuan,
			giaTri: ca.kieu === "moc" ? null : s.giaTri,
			tuTin: s.tuTin,
			ghiChu: s.ghiChu.trim() === "" ? null : s.ghiChu,
		};
		const thuc = {
			checkInId: l.checkInId,
			luc: l.luc,
			ngay: l.ngay,
			tuan: l.tuan,
			giaTri: l.giaTri,
			tuTin: l.tuTin,
			ghiChu: l.ghiChu,
		};
		if (JSON.stringify(thuc) !== JSON.stringify(mong))
			loi.push(
				`lsml-lan: ${ca.ten} lan ${i} ${JSON.stringify(thuc)} can ${JSON.stringify(mong)}`,
			);
	});
	return loi;
}

describe("lsml-lan", () => {
	test(
		"lsml-lan: tam ca, moi OkrCheckIn mot phan tu, thu tu gio gui roi id",
		async () => {
			const loi: string[] = [];
			let dem = 0;
			try {
				const krCua = await gieoBo("lsml-lan");
				for (const ca of CA) {
					const id = krCua.get(ca.ten) ?? "";
					const ls = await docLichSu(id);
					const sql = await lanSql(id);
					if (ca.lan.length !== sql.length)
						loi.push(
							`lsml-lan: ${ca.ten} SQL ${sql.length} can ${ca.lan.length}`,
						);
					loi.push(...lechLan(ca, ls, sql));
					if (ca.ten === "hai-lan-cung-tuan") {
						const db_ = dienBienOutput.parse(
							ok(
								await goiQuery("okr.dienBien", "quan", { keyResultId: id }),
								"dien bien",
							),
						);
						const tuan = sql.at(-1)?.tuan;
						const diemTuan = db_.diem.filter(
							(d) => d.tuan === tuan && d.giaTri !== null,
						).length;
						const lanTuan = ls.lan.filter((l) => l.tuan === tuan).length;
						if (diemTuan !== 1 || lanTuan !== 2)
							loi.push(
								`lsml-lan: hai-lan-cung-tuan ${lanTuan} lan can 2 (doi chung dienBien ${diemTuan} diem can 1)`,
							);
					}
					dem += 1;
				}
			} finally {
				setSystemTime();
			}
			console.log(`lsml-lan: ${dem}/${CA.length}`);
			expect(loi.join("\n")).toBe("");
			expect(dem).toBe(8);
		},
		MA_TRAN_MS,
	);
});

const KY_SAU_TUAN = [
	"2026-09-28",
	"2026-10-05",
	"2026-10-12",
	"2026-10-19",
	"2026-10-26",
	"2026-11-02",
];
const HOM_NAY_CHUOI = new Date("2026-10-28T05:00:00.000Z");
const kyVongThu = (tuan: string) => (KY_SAU_TUAN.indexOf(tuan) + 1) * 10;

type CaChuoi = {
	ten: string;
	kieu: "tang-toi" | "moc";
	lan: { id: string; tuan: string; luc: string; giaTri: number }[];
	mong: DiemMoiLan[];
};

const kv = (tuan: string) => 10 + (40 * kyVongThu(tuan)) / 100;
const trong = (tuan: string): DiemMoiLan => ({
	ngay: tuan,
	checkInId: null,
	giaTri: null,
	kyVong: kv(tuan),
});

const CA_CHUOI: CaChuoi[] = [
	{
		ten: "khong-lan",
		kieu: "tang-toi",
		lan: [],
		mong: KY_SAU_TUAN.map(trong),
	},
	{
		ten: "mot-lan",
		kieu: "tang-toi",
		lan: [
			{ id: "a", tuan: "2026-10-12", luc: "2026-10-14T03:00:00Z", giaTri: 20 },
		],
		mong: [
			trong("2026-09-28"),
			trong("2026-10-05"),
			{
				ngay: "2026-10-14",
				checkInId: "a",
				giaTri: 20,
				kyVong: kv("2026-10-12"),
			},
			trong("2026-10-19"),
			trong("2026-10-26"),
			trong("2026-11-02"),
		],
	},
	{
		ten: "ba-lan-mot-tuan",
		kieu: "tang-toi",
		lan: [
			{ id: "a", tuan: "2026-10-05", luc: "2026-10-05T02:00:00Z", giaTri: 12 },
			{ id: "b", tuan: "2026-10-05", luc: "2026-10-07T02:00:00Z", giaTri: 14 },
			{ id: "c", tuan: "2026-10-05", luc: "2026-10-11T16:30:00Z", giaTri: 15 },
		],
		mong: [
			trong("2026-09-28"),
			{
				ngay: "2026-10-05",
				checkInId: "a",
				giaTri: 12,
				kyVong: kv("2026-10-05"),
			},
			{
				ngay: "2026-10-07",
				checkInId: "b",
				giaTri: 14,
				kyVong: kv("2026-10-05"),
			},
			{
				ngay: "2026-10-11",
				checkInId: "c",
				giaTri: 15,
				kyVong: kv("2026-10-05"),
			},
			trong("2026-10-12"),
			trong("2026-10-19"),
			trong("2026-10-26"),
			trong("2026-11-02"),
		],
	},
	{
		ten: "tuan-trong-giua",
		kieu: "tang-toi",
		lan: [
			{ id: "a", tuan: "2026-09-28", luc: "2026-09-29T03:00:00Z", giaTri: 11 },
			{ id: "b", tuan: "2026-10-12", luc: "2026-10-13T03:00:00Z", giaTri: 19 },
		],
		mong: [
			{
				ngay: "2026-09-29",
				checkInId: "a",
				giaTri: 11,
				kyVong: kv("2026-09-28"),
			},
			trong("2026-10-05"),
			{
				ngay: "2026-10-13",
				checkInId: "b",
				giaTri: 19,
				kyVong: kv("2026-10-12"),
			},
			trong("2026-10-19"),
			trong("2026-10-26"),
			trong("2026-11-02"),
		],
	},
	{
		ten: "kr-moc",
		kieu: "moc",
		lan: [
			{ id: "a", tuan: "2026-10-05", luc: "2026-10-06T03:00:00Z", giaTri: 0 },
			{ id: "b", tuan: "2026-10-19", luc: "2026-10-20T03:00:00Z", giaTri: 1 },
		],
		mong: [
			{ ngay: "2026-09-28", checkInId: null, giaTri: null, kyVong: null },
			{ ngay: "2026-10-06", checkInId: "a", giaTri: null, kyVong: null },
			{ ngay: "2026-10-12", checkInId: null, giaTri: null, kyVong: null },
			{ ngay: "2026-10-20", checkInId: "b", giaTri: null, kyVong: null },
			{ ngay: "2026-10-26", checkInId: null, giaTri: null, kyVong: null },
			{ ngay: "2026-11-02", checkInId: null, giaTri: null, kyVong: null },
		],
	},
	{
		ten: "tuan-sau-hom-nay",
		kieu: "tang-toi",
		lan: [
			{ id: "a", tuan: "2026-11-02", luc: "2026-11-03T03:00:00Z", giaTri: 40 },
		],
		mong: KY_SAU_TUAN.map(trong),
	},
];

describe("lsml-chuoi", () => {
	test("lsml-chuoi: sau ca, moi lan mot diem mang ky vong cua tuan chua no", () => {
		const loi: string[] = [];
		let dem = 0;
		for (const ca of CA_CHUOI) {
			const thuc = chuoiMoiLan(
				{
					id: ca.ten,
					thuTu: 0,
					khoaLuc: null,
					kieu: ca.kieu,
					khoi: 10,
					dich: 50,
					lan: ca.lan.map((l) => ({
						id: l.id,
						tuan: l.tuan,
						luc: new Date(l.luc),
						tuTin: "vua",
						ghiChu: "",
						giaTri: l.giaTri,
					})),
				},
				KY_SAU_TUAN,
				HOM_NAY_CHUOI,
				kyVongThu,
			);
			if (thuc.length !== ca.mong.length)
				loi.push(
					`lsml-chuoi: ${ca.ten} ${thuc.length} diem can ${ca.mong.length}`,
				);
			else if (JSON.stringify(thuc) !== JSON.stringify(ca.mong))
				loi.push(
					`lsml-chuoi: ${ca.ten} ${JSON.stringify(thuc)} can ${JSON.stringify(ca.mong)}`,
				);
			dem += 1;
		}
		console.log(`lsml-chuoi: ${dem}/${CA_CHUOI.length}`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(6);
	});
});

async function boDonGian(gioiHan: boolean) {
	const cycleId = await kyDangChay(`lsml-q-${gioiHan ? "gh" : "ck"}`);
	const objectiveId = ok<{ id: string }>(
		await goi("okr.createObjective", {
			cycleId,
			unit: { level: "onehub" },
			title: ma("lsml muc tieu don"),
			kind: "cam-ket",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
			hienThi: gioiHan ? "gioi-han" : "cong-khai",
		}),
		"muc tieu",
	).id;
	const krId = ok<{ id: string }>(
		await goi("okr.createKeyResult", {
			objectiveId,
			title: ma("lsml kr don"),
			kind: "tang-toi",
			ownerUserId: phien.quan.nguoi,
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
			unit: "",
			dueOn: null,
			weight: 1,
		}),
		"kr",
	).id;
	ok(await goi("okr.publishObjective", { id: objectiveId }), "cong bo");
	return krId;
}

async function guiLan(keyResultId: string, value: number): Promise<string> {
	const { sessionId } = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }),
		"mo phien",
	);
	ok(
		await goi("okr.guiCapNhat", {
			sessionId,
			items: [{ keyResultId, value, confidence: "vua", note: "" }],
		}),
		"gui lan",
	);
	return (
		await db.okrCheckIn.findFirstOrThrow({
			where: { sessionId },
			select: { id: true },
		})
	).id;
}

describe("lsml-quyen", () => {
	test("lsml-quyen: nguoi ngoai nhan cung loi nhu dienBien, nguoi xem doc duoc", async () => {
		const loi: string[] = [];
		let dem = 0;
		const krId = await boDonGian(true);
		await guiLan(krId, 10);
		const ls = await goiQuery("okr.lichSuKr", "thuong", { keyResultId: krId });
		const dbg = await goiQuery("okr.dienBien", "thuong", { keyResultId: krId });
		if (ls.status === 200 || ls.status !== dbg.status || ls.loi !== dbg.loi)
			loi.push(
				`lsml-quyen: nguoi ngoai doc duoc hoac loi khac dienBien (${ls.status} «${ls.loi}» / ${dbg.status} «${dbg.loi}»)`,
			);
		dem += 1;
		const xem = await docLichSu(krId);
		if (xem.lan.length !== 1)
			loi.push(`lsml-quyen: doi chung nguoi xem ${xem.lan.length} lan can 1`);
		dem += 1;
		console.log(`lsml-quyen: ${dem}/2`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(2);
	});
});

const soCamXuc = async (checkInId: string, loai: string) =>
	db.okrCamXuc.count({ where: { checkInId, loai } });

describe("lsml-cam-xuc-api", () => {
	test("lsml-cam-xuc-api: tha tren L1 chi gan L1, tha tren L2 chi gan L2", async () => {
		const loi: string[] = [];
		let dem = 0;
		const krId = await boDonGian(false);
		const L1 = await guiLan(krId, 10);
		const L2 = await guiLan(krId, 12);
		const camCua = (ls: LichSuKrOutput, id: string) =>
			ls.lan.find((l) => l.checkInId === id)?.camXuc ?? [];
		const truoc = await docLichSu(krId);
		if (camCua(truoc, L1).length !== 0 || camCua(truoc, L2).length !== 0)
			loi.push("lsml-cam-xuc-api: doi chung — truoc khi tha da co cam xuc");
		dem += 1;
		ok(
			await goi("okr.thaCamXuc", { checkInId: L1, loai: "dong-y" }, "thuong"),
			"tha L1",
		);
		const sau1 = await docLichSu(krId);
		const a = camCua(sau1, L1).find((c) => c.loai === "dong-y")?.so ?? 0;
		if (a !== (await soCamXuc(L1, "dong-y")) || a !== 1)
			loi.push(`lsml-cam-xuc-api: L1 dong-y ${a} can 1`);
		if (camCua(sau1, L2).length !== 0)
			loi.push("lsml-cam-xuc-api: L2 mang cam xuc cua L1");
		dem += 1;
		ok(
			await goi(
				"okr.thaCamXuc",
				{ checkInId: L2, loai: "chuc-mung" },
				"thuong",
			),
			"tha L2",
		);
		const sau2 = await docLichSu(krId);
		const b = camCua(sau2, L2).find((c) => c.loai === "chuc-mung")?.so ?? 0;
		const a2 = camCua(sau2, L1)
			.map((c) => `${c.loai}:${c.so}`)
			.join(",");
		if (b !== (await soCamXuc(L2, "chuc-mung")) || b !== 1 || a2 !== "dong-y:1")
			loi.push(`lsml-cam-xuc-api: sau tha L2 — L2 chuc-mung ${b}, L1 «${a2}»`);
		dem += 1;
		console.log(`lsml-cam-xuc-api: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

describe("lsml-dien-bien-giu", () => {
	test(
		"lsml-dien-bien-giu: dienBien van moi tuan mot diem mang lan cuoi cua tuan",
		async () => {
			const loi: string[] = [];
			let dem = 0;
			try {
				const krCua = await gieoBo("lsml-dbg");
				for (const ca of CA) {
					const id = krCua.get(ca.ten) ?? "";
					const d = dienBienOutput.parse(
						ok(
							await goiQuery("okr.dienBien", "quan", { keyResultId: id }),
							"dien bien",
						),
					);
					const sql = await lanSql(id);
					const tuanDo = "2026-10-19";
					for (const p of d.diem) {
						const cuoi =
							p.tuan > tuanDo
								? null
								: (sql.filter((s) => s.tuan === p.tuan).at(-1) ?? null);
						const mong = {
							checkInId: cuoi?.id ?? null,
							giaTri: ca.kieu === "moc" || !cuoi ? null : cuoi.giaTri,
							tuTin: cuoi?.tuTin ?? null,
							ghiChu: cuoi && cuoi.ghiChu.trim() !== "" ? cuoi.ghiChu : null,
						};
						const thuc = {
							checkInId: p.checkInId,
							giaTri: p.giaTri,
							tuTin: p.tuTin,
							ghiChu: p.ghiChu,
						};
						if (JSON.stringify(thuc) !== JSON.stringify(mong))
							loi.push(
								`lsml-dien-bien-giu: ${ca.ten} tuan ${p.tuan} ${JSON.stringify(thuc)} can ${JSON.stringify(mong)}`,
							);
					}
					const tuanCoLan = new Set(sql.map((s) => s.tuan));
					if (
						d.diem.filter((p) => p.checkInId !== null).length !== tuanCoLan.size
					)
						loi.push(
							`lsml-dien-bien-giu: ${ca.ten} lech ban chup so diem co lan`,
						);
					if (ca.ten === "hai-lan-cung-tuan") {
						const tuanNay = sql.filter((s) => s.tuan === tuanDo);
						if (
							tuanNay.length !== 2 ||
							tuanNay[0]?.giaTri === tuanNay[1]?.giaTri
						)
							loi.push(
								"lsml-dien-bien-giu: doi chung hai-lan-cung-tuan khong co hai lan khac gia tri",
							);
					}
					dem += 1;
				}
			} finally {
				setSystemTime();
			}
			console.log(`lsml-dien-bien-giu: ${dem}/${CA.length}`);
			expect(loi.join("\n")).toBe("");
			expect(dem).toBe(8);
		},
		MA_TRAN_MS,
	);
});
