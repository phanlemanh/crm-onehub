import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "@crm/db";
import { DU_AN } from "@crm/db/du-an";
import {
	dongDuAn,
	suaDuAn,
	suaMoc,
	taoMoc,
	taoPhuThuoc,
	xoaMoc,
	xoaPhuThuoc,
} from "@crm/db/du-an-ghi";
import { doiDuAn, LoiChaDoiDuAn, suaViec, taoViecCon } from "@crm/db/viec-ghi";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	donDuAn,
	duAnThu,
	lichCua,
	ngayDb,
	viecCoLich,
} from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	cookieCua,
	donViec,
	goi,
	type KetGoi,
	nguoi,
} from "./support/viec-gieo";

const GIAY_MS = 1000;
const VCK = {
	maTestMs: 300 * GIAY_MS,
	choMs: 10 * GIAY_MS,
	nhipMs: 100,
	giaoDichMs: 30 * GIAY_MS,
} as const;

type ThaoTac =
	| "them-moc"
	| "sua-moc"
	| "xoa-moc"
	| "them-phu-thuoc"
	| "go-phu-thuoc"
	| "sua-du-an"
	| "doi-ngay"
	| "chuyen-vao";

const MA_TRAN: ThaoTac[] = [
	"them-moc",
	"sua-moc",
	"xoa-moc",
	"them-phu-thuoc",
	"go-phu-thuoc",
	"sua-du-an",
	"doi-ngay",
	"chuyen-vao",
];

type DuAnDung = {
	id: string;
	C: string;
	X: string;
	Y: string;
	Z: string;
	moc: string;
};

type Chuyen = { tu: "P" | "ngoai"; den: "Q" | "ngoai" | "P" };

const MA_TRAN_CHUYEN: Chuyen[] = [
	{ tu: "P", den: "Q" },
	{ tu: "P", den: "ngoai" },
	{ tu: "ngoai", den: "P" },
];

type KetA<T> = { ok: T } | { loi: unknown };

const TEN_MOI_DU_AN = "Dự án vck đã đổi tên";
const TEN_MOC_MOI = "Mốc vck mới";
const TEN_MOC_SUA = "Mốc vck đã sửa";
const HAN_X_MOI = "2026-10-26";
const LOI_CHA_DOI = DU_AN.thongDiep.chaDoiDuAn;

let app: NestExpressApplication;
let q: { id: string };

function json<T>(x: T): string {
	return JSON.stringify(x, (_k, v) =>
		v instanceof Error ? { ten: v.name, loi: v.message } : v,
	);
}

beforeAll(async () => {
	await moXuong();
	app = await batApp();
	q = await nguoi("vck-a", "owner");
	await cookieCua(q.id);
}, VCK.maTestMs);

afterAll(async () => {
	await app.close();
	await donDuAn();
	await donViec();
	await donDep();
});

function dau() {
	return { nguoiId: q.id, now: new Date() };
}

function dauViec(viecId: string) {
	return { viecId, nguoiId: q.id, nguon: "web" as const, now: new Date() };
}

async function dungDuAn(ten: string, coPhuThuoc = false): Promise<DuAnDung> {
	const p = await duAnThu(q.id, ten);
	const C = await viecCoLich({
		duAnId: p.id,
		giaoId: q.id,
		tieuDe: "Việc cha vck",
	});
	const X = await viecCoLich({
		duAnId: p.id,
		giaoId: q.id,
		tieuDe: "Việc X vck",
		batDau: "2026-10-20",
		han: "2026-10-21",
	});
	const Y = await viecCoLich({
		duAnId: p.id,
		giaoId: q.id,
		tieuDe: "Việc Y vck",
		batDau: "2026-10-22",
		han: "2026-10-23",
	});
	const Z = await viecCoLich({
		duAnId: null,
		giaoId: q.id,
		tieuDe: "Việc Z vck",
	});
	const moc = await db.$transaction((tx) =>
		taoMoc(tx, {
			...dau(),
			duAnId: p.id,
			ten: "Mốc vck",
			ngay: ngayDb("2026-10-30"),
			cho: [],
		}),
	);
	if (coPhuThuoc) {
		await db.$transaction((tx) =>
			taoPhuThuoc(tx, { ...dau(), truocId: X.id, sauId: Y.id }),
		);
	}
	return { id: p.id, C: C.id, X: X.id, Y: Y.id, Z: Z.id, moc: moc.id };
}

async function lamB(t: ThaoTac, tx: DbGhi, p: DuAnDung): Promise<void> {
	switch (t) {
		case "them-moc":
			await taoMoc(tx, {
				...dau(),
				duAnId: p.id,
				ten: TEN_MOC_MOI,
				ngay: ngayDb("2026-10-31"),
				cho: [p.Y],
			});
			return;
		case "sua-moc":
			await suaMoc(tx, { ...dau(), mocId: p.moc, ten: TEN_MOC_SUA });
			return;
		case "xoa-moc":
			await xoaMoc(tx, { ...dau(), mocId: p.moc });
			return;
		case "them-phu-thuoc":
			await taoPhuThuoc(tx, { ...dau(), truocId: p.X, sauId: p.Y });
			return;
		case "go-phu-thuoc":
			await xoaPhuThuoc(tx, { ...dau(), truocId: p.X, sauId: p.Y });
			return;
		case "sua-du-an":
			await suaDuAn(tx, { ...dau(), duAnId: p.id, ten: TEN_MOI_DU_AN });
			return;
		case "doi-ngay":
			await suaViec(tx, { ...dauViec(p.X), hanNgay: ngayDb(HAN_X_MOI) });
			return;
		case "chuyen-vao":
			await doiDuAn(tx, { ...dauViec(p.Z), duAnId: p.id });
			return;
	}
}

async function kiemB(t: ThaoTac, p: DuAnDung): Promise<unknown> {
	switch (t) {
		case "them-moc":
			return (await db.duAnMoc.count({
				where: { duAnId: p.id, ten: TEN_MOC_MOI },
			})) === 1
				? null
				: "khong co moc moi";
		case "sua-moc":
			return (await db.duAnMoc.findUnique({ where: { id: p.moc } }))?.ten ===
				TEN_MOC_SUA
				? null
				: "moc khong doi ten";
		case "xoa-moc":
			return (await db.duAnMoc.count({ where: { id: p.moc } })) === 0
				? null
				: "moc con";
		case "them-phu-thuoc":
			return (await db.viecPhuThuoc.count({
				where: { truocId: p.X, sauId: p.Y },
			})) === 1
				? null
				: "khong co phu thuoc X-Y";
		case "go-phu-thuoc":
			return (await db.viecPhuThuoc.count({
				where: { truocId: p.X, sauId: p.Y },
			})) === 0
				? null
				: "phu thuoc X-Y con";
		case "sua-du-an":
			return (await db.duAn.findUnique({ where: { id: p.id } }))?.ten ===
				TEN_MOI_DU_AN
				? null
				: "ten du an khong doi";
		case "doi-ngay": {
			const x = await lichCua(p.X);
			return x.han === HAN_X_MOI ? null : x;
		}
		case "chuyen-vao": {
			const z = await lichCua(p.Z);
			return z.duAnId === p.id ? null : z;
		}
	}
}

async function choBiChan(pidB: number, nhan: string): Promise<number> {
	const het = Date.now() + VCK.choMs;
	while (Date.now() < het) {
		const ds = await db.$queryRaw<{ pid: number }[]>`
			SELECT pid FROM pg_stat_activity
			WHERE datname = current_database() AND ${pidB}::int = ANY(pg_blocking_pids(pid))`;
		const dau = ds[0];
		if (dau) return dau.pid;
		await Bun.sleep(VCK.nhipMs);
	}
	throw new Error(`${nhan}: A khong cho khoa`);
}

async function xenKe<T>(input: {
	nhan: string;
	giu: (tx: DbGhi) => Promise<void>;
	a: () => Promise<T>;
	b: (tx: DbGhi) => Promise<void>;
}): Promise<{ a: KetA<T>; loiB: Error | null; pidCho: number | null }> {
	let aHua: Promise<KetA<T>> | null = null;
	let pidCho: number | null = null;
	let loiB: Error | null = null;
	try {
		await db.$transaction(
			async (tx) => {
				const ds = await tx.$queryRaw<
					{ pid: number }[]
				>`SELECT pg_backend_pid() AS pid`;
				const pidB = ds[0]?.pid;
				if (pidB === undefined)
					throw new Error(`${input.nhan}: khong doc duoc pid B`);
				await input.giu(tx);
				aHua = input.a().then(
					(ok): KetA<T> => ({ ok }),
					(loi): KetA<T> => ({ loi }),
				);
				pidCho = await choBiChan(pidB, input.nhan);
				await input.b(tx);
			},
			{ timeout: VCK.giaoDichMs, maxWait: VCK.choMs },
		);
	} catch (loi) {
		loiB = loi instanceof Error ? loi : new Error(String(loi));
	}
	const a: KetA<T> = aHua ? await aHua : { loi: new Error("A chua chay") };
	if (pidCho === null) {
		throw new Error(`${input.nhan}: A khong cho khoa ${json({ loiB, a })}`);
	}
	console.log(`${input.nhan}: A bi B chan, pid ${pidCho}`);
	return { a, loiB, pidCho };
}

function taoConQuaApi(chaId: string, tieuDe: string): () => Promise<KetGoi> {
	return () => goi(app, "viec.taoCon", "mutation", { chaId, tieuDe }, q.id);
}

async function giuDuAn(tx: DbGhi, duAnId: string): Promise<void> {
	await tx.$queryRaw`SELECT id FROM "duAn" WHERE id = ${duAnId} FOR UPDATE`;
}

function conCua(chaId: string) {
	return db.viec.findMany({
		where: { chaId },
		select: { id: true, duAnId: true },
	});
}

describe("vck-doi-thu", () => {
	test(
		"vck-doi-thu: ma trận tám thao tác giữ khoá dự án — thêm việc con và thao tác kia đều xong",
		async () => {
			let daSo = 0;
			for (const t of MA_TRAN) {
				const p = await dungDuAn(`vck ${t}`, t === "go-phu-thuoc");
				const nhan = `vck doi thu: ${t}`;
				const { a, loiB } = await xenKe({
					nhan,
					giu: (tx) => giuDuAn(tx, p.id),
					a: taoConQuaApi(p.C, `Việc con vck ${t}`),
					b: (tx) => lamB(t, tx, p),
				});
				if (!("ok" in a) || a.ok.status !== 200 || loiB !== null) {
					throw new Error(`vck doi thu: ${t} ra ${json({ a, loiB })}`);
				}
				const con = await conCua(p.C);
				if (con.length !== 1 || con[0]?.duAnId !== p.id) {
					throw new Error(`vck doi thu: con lech ${t} ${json(con)}`);
				}
				const lech = await kiemB(t, p);
				if (lech !== null) {
					throw new Error(`vck doi thu: B lech ${t} ${json(lech)}`);
				}
				daSo += 1;
			}
			if (daSo !== MA_TRAN.length || daSo !== 8) {
				throw new Error(`vck doi thu: ma tran thieu ${daSo}`);
			}
			const p = await dungDuAn("vck đối chứng");
			const r = await taoConQuaApi(p.C, "Việc con vck đối chứng")();
			if (r.status !== 200) {
				throw new Error(`vck doi thu: doi chung hong ${json(r)}`);
			}
		},
		VCK.maTestMs,
	);
});

describe("vck-dong", () => {
	test(
		"vck-dong: người khác đóng dự án lúc thêm việc con — đóng xong, thêm việc con nhận «Dự án đã đóng.»",
		async () => {
			const doiChung = await dungDuAn("vck đóng đối chứng");
			const r = await taoConQuaApi(doiChung.C, "Việc con vck trước khi đóng")();
			if (r.status !== 200) {
				throw new Error(`vck dong: doi chung hong ${json(r)}`);
			}
			const p = await dungDuAn("vck đóng");
			const { a, loiB } = await xenKe({
				nhan: "vck dong",
				giu: (tx) => giuDuAn(tx, p.id),
				a: taoConQuaApi(p.C, "Việc con vck lúc đóng"),
				b: (tx) => dongDuAn(tx, { ...dau(), duAnId: p.id, laQuanTri: true }),
			});
			const da = await db.duAn.findUnique({ where: { id: p.id } });
			if (loiB !== null || !da?.dongLuc) {
				throw new Error(`vck dong: dong khong an ${json({ loiB, da })}`);
			}
			if (
				!("ok" in a) ||
				a.ok.status !== 400 ||
				a.ok.message !== DU_AN.thongDiep.daDong
			) {
				throw new Error(`vck dong: A ra ${json(a)}`);
			}
			const con = await conCua(p.C);
			if (con.length !== 0) throw new Error(`vck dong: sinh con ${con.length}`);
		},
		VCK.maTestMs,
	);
});

async function dungChuyen(c: Chuyen) {
	const p = await dungDuAn(`vck chuyển ${c.tu}-${c.den}`);
	const qDuAn = await duAnThu(q.id, "vck đích");
	const den = { P: p.id, Q: qDuAn.id, ngoai: null }[c.den];
	if (c.tu === "ngoai") {
		await db.$transaction((tx) =>
			doiDuAn(tx, { ...dauViec(p.C), duAnId: null }),
		);
	}
	return { p, den };
}

describe("vck-chuyen-cha", () => {
	test(
		"vck-chuyen-cha: việc cha đổi dự án lúc chờ — qua viec.taoCon việc con vẫn được tạo, đúng dự án mới",
		async () => {
			let daSo = 0;
			for (const c of MA_TRAN_CHUYEN) {
				const ma = `${c.tu}-${c.den}`;
				const { p, den } = await dungChuyen(c);
				const { a, loiB } = await xenKe({
					nhan: `vck chuyen cha: ${ma}`,
					giu: (tx) => doiDuAn(tx, { ...dauViec(p.C), duAnId: den }),
					a: taoConQuaApi(p.C, `Việc con vck ${ma}`),
					b: async () => {},
				});
				if (!("ok" in a) || a.ok.status !== 200 || loiB !== null) {
					throw new Error(`vck chuyen cha: ${ma} ra ${json({ a, loiB })}`);
				}
				const con = await conCua(p.C);
				const cha = await lichCua(p.C);
				if (
					con.length !== 1 ||
					con[0]?.duAnId !== cha.duAnId ||
					cha.duAnId !== den
				) {
					throw new Error(
						`vck chuyen cha: con lech ${ma} ${json({ con, cha })}`,
					);
				}
				daSo += 1;
			}
			if (daSo !== MA_TRAN_CHUYEN.length || daSo !== 3) {
				throw new Error(`vck chuyen cha: ma tran thieu ${daSo}`);
			}
		},
		VCK.maTestMs,
	);

	test(
		"vck-chuyen-cha: một lượt taoViecCon gặp việc cha vừa đổi dự án thì dừng bằng LoiChaDoiDuAn, không sinh việc con",
		async () => {
			let daSo = 0;
			for (const c of MA_TRAN_CHUYEN) {
				const ma = `${c.tu}-${c.den}`;
				const { p, den } = await dungChuyen(c);
				const { a, loiB } = await xenKe({
					nhan: `vck chuyen cha: mot luot ${ma}`,
					giu: (tx) => doiDuAn(tx, { ...dauViec(p.C), duAnId: den }),
					a: () =>
						db.$transaction((tx) =>
							taoViecCon(tx, {
								chaId: p.C,
								nguoiId: q.id,
								tieuDe: `Việc con vck một lượt ${ma}`,
								now: new Date(),
							}),
						),
					b: async () => {},
				});
				if (
					loiB !== null ||
					!("loi" in a) ||
					!(a.loi instanceof LoiChaDoiDuAn) ||
					a.loi.message !== LOI_CHA_DOI
				) {
					throw new Error(
						`vck chuyen cha: mot luot ${ma} ra ${json({ a, loiB })}`,
					);
				}
				const con = await conCua(p.C);
				if (con.length !== 0) {
					throw new Error(
						`vck chuyen cha: mot luot sinh con ${ma} ${con.length}`,
					);
				}
				try {
					await db.$transaction((tx) =>
						taoViecCon(tx, {
							chaId: p.C,
							nguoiId: q.id,
							tieuDe: `Việc con vck đối chứng ${ma}`,
							now: new Date(),
						}),
					);
				} catch (loi) {
					throw new Error(`vck chuyen cha: doi chung hong ${ma} ${json(loi)}`);
				}
				daSo += 1;
			}
			if (daSo !== 3) throw new Error(`vck chuyen cha: ma tran thieu ${daSo}`);
		},
		VCK.maTestMs,
	);
});
