import { afterEach, describe, expect, test } from "bun:test";
import { type ChildProcess, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdirSync, renameSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { dungGocGia, type GocGia, songCon } from "./support/eve-gia";
import {
	type ChuKhoaEve,
	chuKhoa,
	cungDau,
	dauKhoaEve,
	duongKhoaEve,
	ghiChu,
	ghiConVaoKhoa,
	giuKhoaEve,
	KHOI_DONG,
	traKhoaEve,
	xetKhoaCu,
} from "./support/khoi-dong";

const SUPPORT = join(import.meta.dir, "support");
const TRAN_CA_MS = 30_000;
const CHO_C_MS = 3_000;

const MA_CON = `
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { duongKhoaEve, ghiConVaoKhoa, giuKhoaEve } from ${JSON.stringify(join(SUPPORT, "khoi-dong.ts"))};
import { sinhEveGia } from ${JSON.stringify(join(SUPPORT, "eve-gia.ts"))};
const goc = process.env.GOC_GIA;
await giuKhoaEve([goc]);
const pid = process.env.KHONG_CON ? 0 : sinhEveGia(goc).pid;
if (pid) ghiConVaoKhoa(goc, pid);
const ma = JSON.parse(readFileSync(join(duongKhoaEve(goc), "chu.json"), "utf8")).ma;
console.log("SAN SANG " + process.pid + " " + pid + " " + ma);
process.stdin.on("data", (d) => { if (String(d).includes("thoat")) process.exit(0); });
setInterval(() => {}, 1e6);
`;

type Con = { con: ChildProcess; pid: number; pidEve: number; ma: string };

const donDep: (() => void)[] = [];

afterEach(() => {
	for (const f of donDep.splice(0).reverse()) f();
});

function giet(pid: number): void {
	try {
		process.kill(pid, "SIGKILL");
	} catch {}
}

function gocMoi(): GocGia {
	const goc = dungGocGia();
	donDep.push(() => {
		traKhoaEve([goc.goc]);
		rmSync(duongKhoaEve(goc.goc), { recursive: true, force: true });
		goc.don();
	});
	return goc;
}

function moCon(goc: string, khongCon = false): Promise<Con> {
	const env = khongCon
		? { ...process.env, GOC_GIA: goc, KHONG_CON: "1" }
		: { ...process.env, GOC_GIA: goc };
	const con = spawn("bun", ["-e", MA_CON], {
		cwd: join(import.meta.dir, ".."),
		stdio: ["pipe", "pipe", "pipe"],
		env,
	});
	return new Promise<Con>((ok, loi) => {
		let ra = "";
		con.stdout?.on("data", (d) => {
			ra += String(d);
			const m = ra.match(/SAN SANG (\d+) (\d+) (\S+)/);
			if (m?.[1] && m[2] && m[3]) {
				const pidEve = Number(m[2]);
				donDep.push(() => {
					giet(Number(m[1]));
					if (pidEve) giet(pidEve);
				});
				ok({ con, pid: Number(m[1]), pidEve, ma: m[3] });
			}
		});
		con.stderr?.on("data", (d) => {
			ra += String(d);
		});
		con.once("exit", (ma) => loi(new Error(`con thoat ${ma}: ${ra}`)));
	});
}

function choThoat(con: ChildProcess, tin?: NodeJS.Signals): Promise<void> {
	return new Promise((ok) => {
		con.once("exit", () => ok());
		if (tin) con.kill(tin);
	});
}

async function choChet(pid: number): Promise<boolean> {
	const het = Date.now() + KHOI_DONG.dungMs * 2;
	while (Date.now() < het) {
		if (!songCon(pid)) return true;
		await Bun.sleep(50);
	}
	return !songCon(pid);
}

function docChu(khoa: string): ChuKhoaEve {
	const chu = chuKhoa(khoa);
	if (!chu) throw new Error(`khong doc duoc ${KHOI_DONG.khoa.tep} cua ${khoa}`);
	return chu;
}

function conCu(khoa: string): string[] {
	const dau = `${basename(khoa)}${KHOI_DONG.khoa.duoiCu}`;
	return readdirSync(dirname(khoa)).filter((t) => t.startsWith(dau));
}

function ngu(): number {
	const p = spawn("sleep", ["30"]);
	const pid = p.pid ?? 0;
	donDep.push(() => giet(pid));
	return pid;
}

async function khoaCuCoMoCoi(
	goc: string,
): Promise<{ eveMoCoi: number; maCu: string }> {
	const truoc = await moCon(goc);
	await choThoat(truoc.con, "SIGKILL");
	if (!songCon(truoc.pidEve) || !xetKhoaCu(duongKhoaEve(goc)))
		throw new Error("khong dung duoc canh khoa cu");
	return { eveMoCoi: truoc.pidEve, maCu: truoc.ma };
}

describe("ghi-tron", () => {
	test(
		"ma trận viết trước: lượt khác đọc khoá giữa hai bước ghi không thấy khoá cũ",
		async () => {
			let chay = 0;
			const goc = gocMoi();
			const khoa = duongKhoaEve(goc.goc);
			let thayLanDau = false;
			await giuKhoaEve([goc.goc], {
				giuaGhi: () => {
					thayLanDau = true;
					if (xetKhoaCu(khoa))
						throw new Error("khoa song bi phan cu giua luc ghi");
				},
			});
			expect(thayLanDau).toBe(true);
			chay++;

			const cu = (Date.now() - KHOI_DONG.khoa.nhipMs * 4) / 1000;
			utimesSync(khoa, cu, cu);
			let thayLanHai = false;
			ghiConVaoKhoa(goc.goc, ngu(), {
				giuaGhi: () => {
					thayLanHai = true;
					if (xetKhoaCu(khoa))
						throw new Error("khoa song bi phan cu giua luc ghi");
					let chu: { pid: number } | null = null;
					try {
						chu = docChu(khoa);
					} catch {
						chu = null;
					}
					if (chu?.pid !== process.pid)
						throw new Error("chu.json khong doc duoc giua luc ghi");
				},
			});
			expect(thayLanHai).toBe(true);
			chay++;
			expect(readdirSync(khoa)).toEqual([KHOI_DONG.khoa.tep]);
			expect(chay).toBe(2);
		},
		TRAN_CA_MS,
	);
});

describe("so-dau", () => {
	test(
		"ma trận viết trước: sáu cặp dấu khoá",
		async () => {
			const [goc, gocKhac, gocVang] = [gocMoi(), gocMoi(), gocMoi()];
			await giuKhoaEve([goc.goc, gocKhac.goc, gocVang.goc]);
			const khoa = duongKhoaEve(goc.goc);
			const khoaKhac = duongKhoaEve(gocKhac.goc);
			const khoaVang = duongKhoaEve(gocVang.goc);
			const goc0 = dauKhoaEve(khoa);
			const chu = docChu(khoa);
			const datGio = (k: string, ms: number) =>
				utimesSync(k, ms / 1000, ms / 1000);
			const giaTri: [string, boolean, boolean][] = [];
			giaTri.push([
				"cung thu muc doc hai lan",
				cungDau(goc0, dauKhoaEve(khoa)),
				true,
			]);

			ghiChu(khoa, { ...chu, ma: randomUUID() });
			datGio(khoa, goc0.mtimeMs);
			giaTri.push(["ma khac", cungDau(goc0, dauKhoaEve(khoa)), false]);
			ghiChu(khoa, chu);
			datGio(khoa, goc0.mtimeMs);

			datGio(khoa, goc0.mtimeMs + 5_000);
			const doiGio = cungDau(goc0, dauKhoaEve(khoa));
			if (doiGio) throw new Error("ino trung coi la cung khoa");
			giaTri.push(["doi mtime", doiGio, false]);

			const gioVang = goc0.mtimeMs + 10_000;
			const chuVang = docChu(khoaVang);
			rmSync(join(khoaVang, KHOI_DONG.khoa.tep));
			datGio(khoaVang, gioVang);
			const dauVang = dauKhoaEve(khoaVang);
			giaTri.push([
				"ma vang hai ben",
				cungDau(dauVang, dauKhoaEve(khoaVang)),
				true,
			]);
			ghiChu(khoaVang, chuVang);
			datGio(khoaVang, gioVang);
			const dauCoMa = dauKhoaEve(khoaVang);
			if (dauCoMa.ino !== dauVang.ino || dauCoMa.mtimeMs !== dauVang.mtimeMs)
				throw new Error("ca ma vang mot ben khong co lap duoc ma");
			giaTri.push(["ma vang mot ben", cungDau(dauVang, dauCoMa), false]);

			const chuKhac = docChu(khoaKhac);
			const gioChung = goc0.mtimeMs + 15_000;
			ghiChu(khoaKhac, { ...chuKhac, ma: chu.ma });
			datGio(khoa, gioChung);
			datGio(khoaKhac, gioChung);
			const dauMot = dauKhoaEve(khoa);
			const dauHai = dauKhoaEve(khoaKhac);
			if (dauMot.ma !== dauHai.ma || dauMot.mtimeMs !== dauHai.mtimeMs)
				throw new Error("ca hai thu muc khac khong co lap duoc ino");
			const haiThuMuc = cungDau(dauMot, dauHai);
			ghiChu(khoaKhac, chuKhac);
			if (haiThuMuc) throw new Error("hai khoa khac ino coi la mot");
			giaTri.push(["hai thu muc khac", haiThuMuc, false]);

			expect(giaTri.map(([ten, that]) => [ten, that])).toEqual(
				giaTri.map(([ten, , mong]) => [ten, mong]),
			);
			expect(giaTri.length).toBe(6);
		},
		TRAN_CA_MS,
	);
});

describe("mot-luot", () => {
	test(
		"một lượt chờ giành khoá cũ: dừng eve mồ côi, giữ khoá mới, không để thư mục .cu-",
		async () => {
			const goc = gocMoi();
			const khoa = duongKhoaEve(goc.goc);
			const { eveMoCoi, maCu } = await khoaCuCoMoCoi(goc.goc);
			await giuKhoaEve([goc.goc]);
			expect(await choChet(eveMoCoi)).toBe(true);
			const chu = docChu(khoa);
			expect([chu.pid, chu.ma === maCu]).toEqual([process.pid, false]);
			if (conCu(khoa).length > 0)
				throw new Error("con thu muc .cu- sau khi don");
		},
		TRAN_CA_MS,
	);
});

describe("hai-luot", () => {
	test(
		"hai lượt cùng thấy khoá cũ: lượt chậm không dừng eve và không gỡ khoá của lượt nhanh",
		async () => {
			const goc = gocMoi();
			const khoa = duongKhoaEve(goc.goc);
			const { eveMoCoi } = await khoaCuCoMoCoi(goc.goc);
			let daGoi = false;
			let b: Con | null = null;
			const loiC = await giuKhoaEve([goc.goc], {
				choMs: CHO_C_MS,
				sauKhiXetCu: async () => {
					if (daGoi) return;
					daGoi = true;
					b = await moCon(goc.goc);
				},
			}).then(
				() => null,
				(e: Error) => e,
			);
			const lb = b as Con | null;
			if (!lb) throw new Error("luot B khong chay");
			if (!songCon(lb.pidEve)) throw new Error("eve cua luot B bi dung");
			const chu = docChu(khoa);
			if (chu.pid !== lb.pid || chu.ma !== lb.ma)
				throw new Error("khoa cua luot B bi go");
			expect(await choChet(eveMoCoi)).toBe(true);
			expect(conCu(khoa)).toEqual([]);
			expect(loiC?.message.includes(String(lb.pid))).toBe(true);
		},
		TRAN_CA_MS,
	);
});

describe("doi-chu", () => {
	test(
		"khoá đã bị thay: chủ cũ không ghi, không gỡ, không dọn khoá của chủ mới",
		async () => {
			const goc = gocMoi();
			const khoa = duongKhoaEve(goc.goc);
			const raNgoai = () => {
				const dich = join(tmpdir(), `khoa-ra-ngoai-${randomUUID()}`);
				renameSync(khoa, dich);
				donDep.push(() => rmSync(dich, { recursive: true, force: true }));
			};

			await giuKhoaEve([goc.goc]);
			raNgoai();
			const b = await moCon(goc.goc, true);
			const loiGhi = (() => {
				try {
					ghiConVaoKhoa(goc.goc, ngu());
					return null;
				} catch (e) {
					return e instanceof Error ? e : new Error(String(e));
				}
			})();
			const sauGhi = docChu(khoa);
			if (sauGhi.pid !== b.pid || sauGhi.con.length !== 0)
				throw new Error("ghi vao khoa nguoi khac");
			expect(loiGhi?.message.includes("da doi chu")).toBe(true);

			traKhoaEve([goc.goc]);
			let sauTra: { pid: number } | null = null;
			try {
				sauTra = docChu(khoa);
			} catch {
				sauTra = null;
			}
			if (sauTra?.pid !== b.pid) throw new Error("tra khoa go khoa nguoi khac");

			await choThoat(b.con, "SIGKILL");
			rmSync(khoa, { recursive: true, force: true });
			const aPhay = await moCon(goc.goc, true);
			raNgoai();
			const bPhay = await moCon(goc.goc, true);
			const thoat = choThoat(aPhay.con);
			aPhay.con.stdin?.write("thoat\n");
			await thoat;
			let sauThoat: { pid: number } | null = null;
			try {
				sauThoat = docChu(khoa);
			} catch {
				sauThoat = null;
			}
			if (sauThoat?.pid !== bPhay.pid)
				throw new Error("don luc thoat go khoa nguoi khac");
		},
		TRAN_CA_MS,
	);
});
