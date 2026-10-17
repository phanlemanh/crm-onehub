import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
	BAN_CHUP_LO_TRINH,
	banChupVao,
} from "@crm/validation/ban-chup-lo-trinh";
import {
	type LoTrinhChoXem,
	type MocLoTrinh,
	phanTichLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";
import type { BanDung } from "@/lib/lo-trinh/chon-nguon";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu.js";
import {
	type DauVaoLoTrinh,
	docDauVaoChoVai,
	docTrangLoTrinh,
	ketQuaTuHang,
} from "@/lib/lo-trinh/doc-trang";
import { type DuKienMoc, duKienMoc } from "@/lib/lo-trinh/du-kien";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import {
	boGioMay,
	chuaGiao,
	datDuKien,
	GOC,
	gioMay,
	HTML_THAT,
	type KhoiTho,
	khoaMocTho,
	khoiTho,
	mocDangChay,
	mocNhieuViec,
	suaKhoi,
	timMoc,
} from "./lo-trinh-du-kien-mau";

type HamDuKien = typeof duKienMoc;

const BAN_CHEP = "apps/app/lib/lo-trinh/doc-du-lieu.js";

function rutHamKit(): string {
	const src = readFileSync(path.join(GOC, "scripts/lo-trinh.mjs"), "utf8");
	const dau = src.indexOf("export function docDuLieu");
	const cuoi = src.indexOf("\n}\n", dau);
	if (dau < 0 || cuoi < 0)
		throw new Error("scripts/lo-trinh.mjs khong co docDuLieu");
	return src.slice(dau, cuoi + 3);
}

function kiemBanChep(tep: string): void {
	if (readFileSync(tep, "utf8") !== rutHamKit())
		throw new Error(`ban chep bo doc lech kit: ${BAN_CHEP}`);
}

function docTypes(o: KhoiTho): LoTrinhChoXem[] {
	const kq = phanTichLoTrinh(o);
	if (!kq.ok) throw new Error(`khoi lech khuon: ${kq.duongKhoa}`);
	return kq.duLieu.lo_trinh;
}

type MocChon = { lo: LoTrinhChoXem; moc: MocLoTrinh };

function moc(o: KhoiTho, khoa: string): MocChon {
	for (const lo of docTypes(o))
		for (const m of lo.moc)
			if (`${lo.tep}@${m.ngay}@${m.ten}` === khoa) return { lo, moc: m };
	throw new Error(`khong co moc ${khoa}`);
}

describe("ban-chep", () => {
	test("ban-chep: bo doc cua trang giong tung byte ham docDuLieu cua kit trong kho", () => {
		const kit = rutHamKit();
		expect(kit.length).toBeGreaterThan(0);
		expect(kit).toContain("gio_may");
		expect(kit).toContain("du_kien");
		expect(() => kiemBanChep(path.join(GOC, BAN_CHEP))).not.toThrow();
	});

	test("ban-chep: pha-thu — ban sao lech mot ky tu thi do", () => {
		const thu = mkdtempSync(path.join(os.tmpdir(), "ldk-ban-chep-"));
		const sao = path.join(thu, "doc-du-lieu.js");
		writeFileSync(sao, readFileSync(path.join(GOC, BAN_CHEP), "utf8").slice(1));
		expect(() => kiemBanChep(sao)).toThrow(
			`ban chep bo doc lech kit: ${BAN_CHEP}`,
		);
	});
});

const HOM_NAY = "2026-10-17";

function kiemSoDo(ham: HamDuKien): void {
	const goc = khoiTho();
	const chon = mocNhieuViec(goc, 2);
	const khoa = khoaMocTho(chon.lo, chon.moc);
	const o = (sua: (o: KhoiTho, mo: ReturnType<typeof chuaGiao>) => void) => {
		const k = khoiTho();
		const x = timMoc(k, khoa);
		datDuKien(x.moc, "2026-10-30", "2026-10-15", null);
		sua(k, chuaGiao(x.lo, x.moc));
		const { lo, moc: m } = moc(k, khoa);
		const dk = ham(lo, m, HOM_NAY);
		if (dk?.kieu !== "co-ngay") throw new Error(`moc ${khoa} khong co ngay`);
		return dk.chuaDuSoDo;
	};
	const ca: [
		string,
		boolean,
		(k: KhoiTho, mo: ReturnType<typeof chuaGiao>) => void,
	][] = [
		[
			"a-khai",
			false,
			(_k, mo) => {
				for (const h of mo) h.gio_may = gioMay("khai");
			},
		],
		[
			"b-do",
			false,
			(_k, mo) => {
				for (const h of mo) h.gio_may = gioMay("do");
			},
		],
		[
			"c-may-uoc",
			true,
			(_k, mo) => {
				for (const h of mo) h.gio_may = gioMay("do");
				const dau = mo[0];
				if (dau) dau.gio_may = gioMay("luat");
			},
		],
		[
			"d-khong-gio",
			true,
			(_k, mo) => {
				for (const h of mo) h.gio_may = gioMay("do");
				const dau = mo[0];
				if (dau) dau.gio_may = null;
			},
		],
		[
			"e-da-giao-may-uoc",
			false,
			(_k, mo) => {
				for (const h of mo) h.gio_may = gioMay("do");
				const dau = mo[0];
				if (dau) {
					dau.nhom_trang_thai = "da-giao";
					dau.gio_may = gioMay("luat");
				}
			},
		],
	];
	expect(ca.length).toBe(5);
	for (const [ten, kyVong, sua] of ca) {
		const thay = o(sua);
		if (thay !== kyVong) {
			if (ten === "e-da-giao-may-uoc")
				throw new Error("viec da giao lam co so do");
			throw new Error(`ngay tinh tren so do chua du ma khong co: ${ten}`);
		}
	}
}

describe("so-do", () => {
	test("so-do: ma tran 5 o tren cung mot moc", () => {
		expect(() => kiemSoDo(duKienMoc)).not.toThrow();
	});
	test("so-do: pha-thu — co so do luon tat thi do", () => {
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			return dk?.kieu === "co-ngay" ? { ...dk, chuaDuSoDo: false } : dk;
		};
		expect(() => kiemSoDo(hong)).toThrow(
			"ngay tinh tren so do chua du ma khong co: c-may-uoc",
		);
	});
	test("so-do: pha-thu — tinh ca viec da giao thi do", () => {
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			if (dk?.kieu !== "co-ngay") return dk;
			const coLuat = lo.hang.some(
				(x) =>
					m.hang.includes(x.ma) &&
					(x.gio_may === null || x.gio_may.co !== null),
			);
			return { ...dk, chuaDuSoDo: coLuat };
		};
		expect(() => kiemSoDo(hong)).toThrow("viec da giao lam co so do");
	});
});

function kiemQuaTai(ham: HamDuKien): void {
	const goc = khoiTho();
	const chon = mocDangChay(goc)[0];
	if (!chon) throw new Error("khoi that khong co moc dang chay");
	const khoa = khoaMocTho(chon.lo, chon.moc);
	const ca: [string | null, string, boolean, boolean][] = [
		[null, "2026-10-19", false, false],
		[null, "2026-10-20", false, false],
		[null, "2026-10-21", false, true],
		["mốc quá tải: dự kiến 20/10, mục tiêu 18/10", "2026-10-19", true, false],
		["mốc quá tải: dự kiến 20/10, mục tiêu 18/10", "2026-10-20", true, false],
		["mốc quá tải: dự kiến 20/10, mục tiêu 18/10", "2026-10-21", true, true],
	];
	expect(ca.length).toBe(6);
	for (const [quaTai, homNay, kyQuaTai, kyDaQua] of ca) {
		const k = khoiTho();
		datDuKien(timMoc(k, khoa).moc, "2026-10-20", "2026-10-15", quaTai);
		const { lo, moc: m } = moc(k, khoa);
		const dk = ham(lo, m, homNay);
		if (dk?.kieu !== "co-ngay") throw new Error("moc khong co ngay");
		if (dk.quaTai !== kyQuaTai) throw new Error(`co qua tai sai: ${homNay}`);
		if (dk.daQua !== kyDaQua)
			throw new Error(
				homNay === "2026-10-20"
					? "dung ngay hoan tat chua qua"
					: `co da qua sai: ${homNay}`,
			);
	}
}

describe("qua-tai", () => {
	test("qua-tai: ma tran 6 o qua tai x hom nay", () => {
		expect(() => kiemQuaTai(duKienMoc)).not.toThrow();
	});
	test("qua-tai: pha-thu — so ngay bang <= thi do", () => {
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			return dk?.kieu === "co-ngay" && h !== null
				? { ...dk, daQua: dk.hoanTat <= h }
				: dk;
		};
		expect(() => kiemQuaTai(hong)).toThrow("dung ngay hoan tat chua qua");
	});
});

function kiemChuaCo(ham: HamDuKien): void {
	const goc = khoiTho();
	const chon = mocDangChay(goc)[0];
	if (!chon) throw new Error("khoi that khong co moc dang chay");
	const khoa = khoaMocTho(chon.lo, chon.moc);
	const het = goc.lo_trinh
		.flatMap((lo) => lo.moc.map((m) => ({ lo, m })))
		.find((x) => !x.m.con_viec && x.m.hang.length > 0);
	if (!het) throw new Error("khoi that khong co moc het viec");
	const khoaHet = khoaMocTho(het.lo, het.m);
	const ca: [
		string,
		string,
		DuKienMoc["kieu"] | null,
		string | null,
		(k: KhoiTho) => void,
	][] = [
		[
			"chua-mo-viec",
			khoa,
			"chua-co",
			"chua-mo-viec",
			(k) => {
				const x = timMoc(k, khoa).moc;
				x.gio_may = {
					thap: 1,
					cao: 2,
					chu: "~1–2 giờ máy",
					phan_tram_tuan: null,
					phan_tram_chu: null,
				};
				x.du_kien = null;
			},
		],
		[
			"ban-cu",
			khoa,
			"chua-co",
			"ban-cu",
			(k) => {
				const x = timMoc(k, khoa).moc;
				delete x.gio_may;
				delete x.du_kien;
			},
		],
		[
			"khong-doc-duoc",
			khoa,
			"chua-co",
			"khong-doc-duoc",
			(k) => {
				datDuKien(timMoc(k, khoa).moc, "30/10", "2026-10-15", null);
			},
		],
		["het-viec", khoaHet, null, null, () => {}],
		[
			"doi-chung-co-ngay",
			khoa,
			"co-ngay",
			null,
			(k) => {
				datDuKien(timMoc(k, khoa).moc, "2026-10-30", "2026-10-15", null);
			},
		],
	];
	for (const [ten, k0, kyKieu, kyLyDo, sua] of ca) {
		const k = khoiTho();
		sua(k);
		const { lo, moc: m } = moc(k, k0);
		const dk = ham(lo, m, HOM_NAY);
		if (kyKieu === "chua-co" && dk?.kieu === "co-ngay")
			throw new Error("ngay muc tieu bi trinh nhu ngay du kien");
		if ((dk?.kieu ?? null) !== kyKieu) throw new Error(`kieu sai: ${ten}`);
		if (dk?.kieu === "chua-co" && dk.lyDo !== kyLyDo)
			throw new Error(`ly do chua co ngay sai: ${ten}`);
	}
}

describe("chua-co", () => {
	test("chua-co: ma tran ba ly do, moc het viec, doi chung co ngay", () => {
		expect(() => kiemChuaCo(duKienMoc)).not.toThrow();
	});
	test("chua-co: pha-thu — roi ve ngay muc tieu thi do", () => {
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			return dk?.kieu === "chua-co" && m.ngayHopLe
				? {
						kieu: "co-ngay",
						hoanTat: m.ngayHopLe,
						ngayTinh: null,
						quaTai: false,
						chuaDuSoDo: true,
						daQua: false,
					}
				: dk;
		};
		expect(() => kiemChuaCo(hong)).toThrow(
			"ngay muc tieu bi trinh nhu ngay du kien",
		);
	});
	test("chua-co: pha-thu — ly do co dinh thi do", () => {
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			return dk?.kieu === "chua-co"
				? { kieu: "chua-co", lyDo: "chua-mo-viec" }
				: dk;
		};
		expect(() => kiemChuaCo(hong)).toThrow("ly do chua co ngay sai: ban-cu");
	});
});

const CAU_THIEU_GIO = "chưa có giờ máy và ngày dự kiến";
const SHA = "d".repeat(40);
const BAN_DUNG: BanDung = {
	sha: SHA,
	dungLuc: "2026-10-17T08:00:00.000Z",
	moiTruong: "production",
};

function hangTuDay(html: string) {
	const { duLieu, canhBao } = docDuLieu(html);
	const vao = banChupVao.parse({
		nguon: BAN_CHUP_LO_TRINH.nguonCrm,
		sha: SHA,
		commitLuc: "2026-10-17T08:00:00.000Z",
		duLieu,
		canhBao,
	});
	return {
		sha: vao.sha,
		commitLuc: new Date(vao.commitLuc),
		layLuc: new Date("2026-10-17T08:05:00.000Z"),
		duLieu: vao.duLieu,
		canhBao: vao.canhBao,
	};
}

async function quaBanChup(html: string): Promise<DauVaoLoTrinh> {
	return docDauVaoChoVai("owner", {
		docBanChup: async () => ketQuaTuHang(hangTuDay(html)),
		docBanDung: async () => docTrangLoTrinh(HTML_THAT),
		banDung: BAN_DUNG,
		ghiCanhBao: () => {},
	});
}

export const HTML_BAN_CU = suaKhoi(boGioMay);

describe("ban-cu", () => {
	test("ban-cu: trang doi truoc khong bat hop canh bao vi thieu gio may", () => {
		expect(
			docDuLieu(HTML_BAN_CU).canhBao.some((c) => c.includes(CAU_THIEU_GIO)),
		).toBe(true);
		const dv = docTrangLoTrinh(HTML_BAN_CU);
		expect(dv.kieu).toBe("co-du-lieu");
		if (dv.kieu === "co-du-lieu")
			expect(dv.canhBao, "hop canh bao khuon bat vi thieu gio may").toEqual([]);
	});
	test("ban-cu: ban chup doi truoc mang cau canh bao cung bi go", async () => {
		const dv = await quaBanChup(HTML_BAN_CU);
		expect(dv.kieu === "co-du-lieu" && dv.nguon?.kieu).toBe("ban-chup");
		if (dv.kieu === "co-du-lieu")
			expect(dv.canhBao, "hop canh bao khuon bat vi thieu gio may").toEqual([]);
	});
	test("ban-cu: ban chup moi dung bang duong cua day.ts giu ngay du kien", async () => {
		const chon = mocDangChay(khoiTho())[0];
		if (!chon) throw new Error("khoi that khong co moc dang chay");
		const khoa = khoaMocTho(chon.lo, chon.moc);
		const html = suaKhoi((k) =>
			datDuKien(timMoc(k, khoa).moc, "2026-10-29", "2026-10-16", null),
		);
		const dv = await quaBanChup(html);
		if (dv.kieu !== "co-du-lieu") throw new Error(`khong doc duoc: ${dv.kieu}`);
		expect(dv.nguon?.kieu).toBe("ban-chup");
		const m = dv.duLieu.lo_trinh
			.flatMap((lo) => lo.moc.map((x) => ({ lo, x })))
			.find(({ lo, x }) => `${lo.tep}@${x.ngay}@${x.ten}` === khoa);
		expect(m?.x.du_kien?.hoan_tat, "ban chup mat ngay du kien").toBe(
			"2026-10-29",
		);
	});
});

function kiemKhoiThat(ham: HamDuKien, html: string): string[] {
	const dv = docTrangLoTrinh(html);
	if (dv.kieu !== "co-du-lieu")
		throw new Error(`khoi that khong doc duoc: ${dv.kieu}`);
	const tho = khoiTho(html);
	const theoMaTho = new Map(
		tho.lo_trinh.map((lo) => [lo.tep, new Map(lo.hang.map((h) => [h.ma, h]))]),
	);
	let tong = 0;
	let coNgay = 0;
	let chuaCo = 0;
	let canCo = 0;
	let coCo = 0;
	for (const lo of dv.duLieu.lo_trinh)
		for (const m of lo.moc) {
			if (!m.con_viec) continue;
			tong++;
			const dk = ham(lo, m, HOM_NAY);
			if (dk === null)
				throw new Error(`moc dang chay khong ngay khong co: ${m.ten}`);
			for (const loc of ["vi", "en"] as const) {
				const t = loTrinhMessages(loc).duKien;
				if (dk.kieu === "co-ngay") {
					const chu = t.ngay(dk.hoanTat).toLocaleLowerCase(loc);
					if (!chu.includes(loc === "vi" ? "dự kiến" : "expected"))
						throw new Error(`ngay du kien thieu chu du kien: ${m.ten}`);
				} else if (!t.lyDo[dk.lyDo]) throw new Error(`ly do rong: ${m.ten}`);
			}
			if (dk.kieu === "chua-co") {
				chuaCo++;
				continue;
			}
			coNgay++;
			const hangTho = theoMaTho.get(lo.tep);
			const can = m.hang.some((ma) => {
				const h = hangTho?.get(ma);
				return (
					h !== undefined &&
					h.nhom_trang_thai !== "da-giao" &&
					(h.gio_may == null || h.gio_may.co != null)
				);
			});
			if (can) canCo++;
			if (dk.chuaDuSoDo) coCo++;
			if (can !== dk.chuaDuSoDo)
				throw new Error(`ngay khong co tren so do chua du: ${m.ten}`);
		}
	if (tong === 0) throw new Error("khoi that khong co moc dang chay");
	return [
		`thuoc-1: ${coNgay}/${tong} co ngay, ${chuaCo}/${tong} co co`,
		`thuoc-2: ${coCo}/${canCo}`,
	];
}

describe("khoi-that", () => {
	test("khoi-that: moi moc dang chay cua LO-TRINH.html co ngay hoac co", () => {
		const dong = kiemKhoiThat(duKienMoc, HTML_THAT);
		for (const d of dong) console.log(d);
		expect(dong[0]).toMatch(/^thuoc-1: \d+\/\d+ co ngay/);
	});
	test("khoi-that: pha-thu — moc khong du_kien tra null thi do", () => {
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			return dk?.kieu === "chua-co" ? null : dk;
		};
		expect(() => kiemKhoiThat(hong, HTML_THAT)).toThrow(
			"moc dang chay khong ngay khong co:",
		);
	});
	test("khoi-that: pha-thu — co so do luon tat tren khoi that co viec may uoc thi do", () => {
		const chon = mocDangChay(khoiTho())[0];
		if (!chon) throw new Error("khoi that khong co moc dang chay");
		const khoa = khoaMocTho(chon.lo, chon.moc);
		const html = suaKhoi((k) => {
			const x = timMoc(k, khoa);
			datDuKien(x.moc, "2026-10-30", "2026-10-15", null);
			for (const h of chuaGiao(x.lo, x.moc)) h.gio_may = gioMay("luat");
		});
		const hong: HamDuKien = (lo, m, h) => {
			const dk = duKienMoc(lo, m, h);
			return dk?.kieu === "co-ngay" ? { ...dk, chuaDuSoDo: false } : dk;
		};
		expect(() => kiemKhoiThat(duKienMoc, html)).not.toThrow();
		expect(() => kiemKhoiThat(hong, html)).toThrow(
			`ngay khong co tren so do chua du: ${chon.moc.ten}`,
		);
	});
});
