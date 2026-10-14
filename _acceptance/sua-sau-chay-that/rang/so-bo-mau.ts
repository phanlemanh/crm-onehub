import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
	type BaoCao,
	bam,
	ghiBaoCao,
	kiemBangChung,
	tinhBang,
} from "../../bo-cau-hoi-mau/rang/bang-do";
import { BO_MAU } from "../../bo-cau-hoi-mau/rang/bo-mau-config";
import { khuonBoMau } from "../../bo-cau-hoi-mau/rang/khuon";
import {
	type DongTungCau,
	docTungCau,
} from "../../tro-ly-doc-kho/rang/quyet-do";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const SO = {
	evidence: resolve(import.meta.dir, "..", "evidence"),
	daKy: BO_MAU.duong.evidence,
	troLy: "apps/agent/agent",
	tepTroLy: "tro-ly-tep.txt",
	baoCao: BO_MAU.bangChung.baoCao,
	tungCau: BO_MAU.bangChung.tungCau,
	luot: [1, 2],
	soLoiBa: 3,
} as const;

type Ket = { ma: number; dong: string[] };
type ChoKiem = { evMoi: string; evKy: string; goc: string };

const doc = (tep: string) =>
	existsSync(tep) ? readFileSync(tep, "utf8") : null;

function danhSachTroLy(): string[] {
	const r = spawnSync(
		"git",
		["-C", GOC, "ls-files", "-co", "--exclude-standard", "--", SO.troLy],
		{ encoding: "utf8" },
	);
	if (r.status !== 0) throw new Error(`git ls-files thoat ${r.status}`);
	return r.stdout.split("\n").filter(Boolean).sort();
}

function bamTung(goc: string, ds: readonly string[]): Map<string, string> {
	return new Map(
		ds.map((f) => {
			const tep = join(goc, f);
			return [f, existsSync(tep) ? bam(readFileSync(tep, "utf8")) : "-"];
		}),
	);
}

function bamGop(tung: ReadonlyMap<string, string>): string {
	return bam(
		[...tung.keys()]
			.sort()
			.map((f) => `${f}\n${tung.get(f)}`)
			.join("\n"),
	);
}

function ghiTepTroLy(tung: ReadonlyMap<string, string>): string {
	return `${[...tung.keys()]
		.sort()
		.map((f) => `${f}\t${tung.get(f)}`)
		.join("\n")}\n`;
}

function docTepTroLy(chu: string): Map<string, string> {
	return new Map(
		chu
			.split("\n")
			.filter(Boolean)
			.map((d) => {
				const [f, h] = d.split("\t");
				return [f ?? "", h ?? ""];
			}),
	);
}

type NhanCau = { id: string; luot: number; nhan: string };

function khongDat(bangKhong: readonly string[]): NhanCau[] {
	return bangKhong.flatMap((x) => {
		const m = x.match(/^(\S+) \(luot (\d): (\S+)\)$/);
		return m ? [{ id: m[1] ?? "", luot: Number(m[2]), nhan: m[3] ?? "" }] : [];
	});
}

function soTepTroLy(ev: string, goc: string): string[] {
	const md = doc(join(ev, SO.baoCao)) ?? "";
	const ghi = md.match(/^bam tro-ly: ([0-9a-f]{64})$/m)?.[1];
	const tepTho = doc(join(ev, SO.tepTroLy));
	if (!ghi) return ["bao cao khong co dong bam tro-ly"];
	if (tepTho === null) return [`thieu ${SO.tepTroLy}`];
	const daGhi = docTepTroLy(tepTho);
	if (bamGop(daGhi) !== ghi)
		return [`${SO.tepTroLy} khong khop dong bam tro-ly cua do-bo-mau`];
	const hien = bamTung(goc, danhSachTroLy());
	const lech = [...new Set([...daGhi.keys(), ...hien.keys()])]
		.sort()
		.filter((f) => daGhi.get(f) !== hien.get(f));
	return lech.map((f) => `tep tro ly doi sau lan do: ${f}`);
}

function kiem({ evMoi, evKy, goc }: ChoKiem): Ket {
	const boTho = readFileSync(BO_MAU.duong.bo, "utf8");
	const ky = kiemBangChung(
		boTho,
		doc(join(evKy, SO.baoCao)),
		doc(join(evKy, SO.tungCau)),
	);
	if (!ky.ok) return { ma: 2, dong: [`KHONG DO DUOC: ban da ky ${ky.loi}`] };
	const moi = kiemBangChung(
		boTho,
		doc(join(evMoi, SO.baoCao)),
		doc(join(evMoi, SO.tungCau)),
	);
	if (!moi.ok) return { ma: 1, dong: [`LECH: luot nay ${moi.loi}`] };
	const tep = soTepTroLy(evMoi, goc);
	if (tep.length > 0) return { ma: 1, dong: tep };
	const dongKy = docTungCau(doc(join(evKy, SO.tungCau)) ?? "");
	const khongKy = khongDat(ky.bang.khongDat);
	const khongMoi = new Map(
		khongDat(moi.bang.khongDat).map((c) => [`${c.luot}:${c.id}`, c.nhan]),
	);
	const datKy = dongKy
		.filter((d) => !khongKy.some((k) => k.id === d.id && k.luot === d.luot))
		.map((d) => `${d.luot}:${d.id}`);
	const lui = datKy.filter((k) => {
		const n = khongMoi.get(k);
		return n !== undefined && n !== "loi";
	});
	const nhanMoi = khongDat(moi.bang.khongDat);
	const loiCua = (ds: readonly NhanCau[], luot: number) =>
		ds.filter((c) => c.luot === luot && c.nhan === "loi").map((c) => c.id);
	const dong: string[] = [];
	let chan = false;
	for (const luot of SO.luot) {
		const luiLuot = lui
			.filter((k) => k.startsWith(`${luot}:`))
			.map((k) => k.slice(2));
		const loiKy = loiCua(khongKy, luot);
		const loiMoi = loiCua(nhanMoi, luot);
		if (luiLuot.length > 0 || loiMoi.length > loiKy.length) chan = true;
		dong.push(
			`lui luot ${luot}: ${luiLuot.length ? luiLuot.join(", ") : "(khong co)"}`,
			`loi model luot ${luot}: ${loiMoi.length ? loiMoi.join(", ") : "(khong co)"} — tran ${loiKy.length} theo luot da ky (${loiKy.join(", ") || "khong co"})`,
		);
	}
	if (chan) return { ma: 1, dong };
	return { ma: 0, dong: [...dong, "dat: khong cau dat nao thanh khong dat"] };
}

function dungLai(md: string, dong: DongTungCau[], bamTroLy: string): string {
	const boTho = readFileSync(BO_MAU.duong.bo, "utf8");
	const bo = khuonBoMau.parse(JSON.parse(boTho));
	const tong = md
		.slice(md.indexOf("## Tổng"), md.indexOf("## Bảng"))
		.split("\n")
		.filter((d) => d.startsWith("- "))
		.map((d) => d.slice(2));
	const x: BaoCao = {
		bam: bam(boTho),
		bamTroLy,
		maCham: Number(md.match(/^ma thoat cham-bo-do: (\d+)$/m)?.[1] ?? "0"),
		luot: md.match(/^thu muc luot cham-bo-do: (.+)$/m)?.[1] ?? "",
		tong,
		bang: tinhBang(bo, dong),
		soLuot: {
			mot: dong.filter((d) => d.luot === 1).length,
			hai: dong.filter((d) => d.luot === 2).length,
		},
	};
	return ghiBaoCao(x);
}

function banSao(doi: (dong: DongTungCau[]) => DongTungCau[]): string {
	const thuMuc = mkdtempSync(join(tmpdir(), "ssct-so-bo-mau-"));
	const md = readFileSync(join(SO.daKy, SO.baoCao), "utf8");
	const dong = doi(docTungCau(readFileSync(join(SO.daKy, SO.tungCau), "utf8")));
	const tung = bamTung(GOC, danhSachTroLy());
	writeFileSync(
		join(thuMuc, SO.tungCau),
		`${dong.map((d) => JSON.stringify(d)).join("\n")}\n`,
	);
	writeFileSync(join(thuMuc, SO.baoCao), dungLai(md, dong, bamGop(tung)));
	writeFileSync(join(thuMuc, SO.tepTroLy), ghiTepTroLy(tung));
	return thuMuc;
}

const laDatMot = (d: DongTungCau) =>
	d.luot === 1 && d.nhom === "co-trang" && d.ketCuc === "TRA_LOI-du";

const laDatHai = (d: DongTungCau) =>
	d.luot === 2 &&
	d.nhom === "co-trang" &&
	(d.zalo ? d.zalo.coHang : d.ketCuc === "co-hang");

function doiHai(ds: DongTungCau[], ketCuc: "khong-hang" | "loi") {
	const chon = ds.find(laDatHai)?.id ?? "";
	return {
		dong: ds.map((d) =>
			d.luot === 2 && d.id === chon ? { ...d, ketCuc, zalo: undefined } : d,
		),
		ma: [chon],
	};
}

function doiN(ds: DongTungCau[], n: number, ketCuc: "TRA_LOI-sai" | "LOI") {
	const chon = ds
		.filter(laDatMot)
		.slice(0, n)
		.map((d) => d.id);
	return {
		dong: ds.map((d) =>
			d.luot === 1 && chon.includes(d.id) ? { ...d, ketCuc } : d,
		),
		ma: chon,
	};
}

type ChieuDo = {
	ten: string;
	chay: () => { ket: Ket; mong: number; phaiCo: string[]; dau?: string };
};

const CHIEU_DO: readonly ChieuDo[] = [
	{
		ten: "mot cau dat thanh sai",
		chay: () => {
			let ma: string[] = [];
			const ev = banSao((ds) => {
				const r = doiN(ds, 1, "TRA_LOI-sai");
				ma = r.ma;
				return r.dong;
			});
			return {
				ket: kiem({ evMoi: ev, evKy: SO.daKy, goc: GOC }),
				mong: 1,
				phaiCo: ma,
				dau: "lui luot 1:",
			};
		},
	},
	{
		ten: "mot cau thanh loi model, trong tran",
		chay: () => {
			let ma: string[] = [];
			const ev = banSao((ds) => {
				const loiCu = ds.find((d) => d.luot === 1 && d.ketCuc === "LOI");
				const r = doiN(ds, 1, "LOI");
				ma = r.ma;
				return r.dong.map((d) =>
					loiCu && d.luot === 1 && d.id === loiCu.id
						? { ...d, ketCuc: "TRA_LOI-du" }
						: d,
				);
			});
			const ket = kiem({ evMoi: ev, evKy: SO.daKy, goc: GOC });
			const dongLoi = ket.dong.filter((d) => d.startsWith("loi model"));
			return {
				ket: { ...ket, dong: dongLoi },
				mong: 0,
				phaiCo: ma,
				dau: "loi model luot 1:",
			};
		},
	},
	{
		ten: "ba cau dat thanh loi model, qua tran",
		chay: () => {
			let ma: string[] = [];
			const ev = banSao((ds) => {
				const r = doiN(ds, SO.soLoiBa, "LOI");
				ma = r.ma;
				return r.dong;
			});
			return {
				ket: kiem({ evMoi: ev, evKy: SO.daKy, goc: GOC }),
				mong: 1,
				phaiCo: ma,
				dau: "loi model luot 1:",
			};
		},
	},
	{
		ten: "luot hai mot cau dat thanh khong chuyen",
		chay: () => {
			let ma: string[] = [];
			const ev = banSao((ds) => {
				const r = doiHai(ds, "khong-hang");
				ma = r.ma;
				return r.dong;
			});
			return {
				ket: kiem({ evMoi: ev, evKy: SO.daKy, goc: GOC }),
				mong: 1,
				phaiCo: ma,
				dau: "lui luot 2:",
			};
		},
	},
	{
		ten: "luot hai mot cau thanh loi model, qua tran",
		chay: () => {
			let ma: string[] = [];
			const ev = banSao((ds) => {
				const r = doiHai(ds, "loi");
				ma = r.ma;
				return r.dong;
			});
			return {
				ket: kiem({ evMoi: ev, evKy: SO.daKy, goc: GOC }),
				mong: 1,
				phaiCo: ma,
				dau: "loi model luot 2:",
			};
		},
	},
	{
		ten: "mot byte tep tro ly doi",
		chay: () => {
			const ev = banSao((ds) => ds);
			const goc = mkdtempSync(join(tmpdir(), "ssct-cay-"));
			const ds = danhSachTroLy();
			for (const f of ds) {
				const tu = join(GOC, f);
				if (!existsSync(tu)) continue;
				mkdirSync(dirname(join(goc, f)), { recursive: true });
				writeFileSync(join(goc, f), readFileSync(tu));
			}
			const dich = ds.find((f) => f.includes("tro_ly_kho")) ?? ds[0] ?? "";
			const tho = readFileSync(join(goc, dich), "utf8");
			writeFileSync(join(goc, dich), `${tho} `);
			const ket = kiem({ evMoi: ev, evKy: SO.daKy, goc });
			rmSync(goc, { recursive: true, force: true });
			return { ket, mong: 1, phaiCo: [dich] };
		},
	},
];

function chayChieuDo(): boolean {
	let hong = false;
	for (const c of CHIEU_DO) {
		const { ket, mong, phaiCo, dau = "" } = c.chay();
		const thieu = phaiCo.filter(
			(m) => !ket.dong.some((d) => d.startsWith(dau) && d.includes(m)),
		);
		const dat = ket.ma === mong && thieu.length === 0 && phaiCo.length > 0;
		console.log(
			`chieu do ${c.ten}: ${dat ? "dat" : "HONG"} (ma ${ket.ma}, mong ${mong}; ghim ${phaiCo.join(", ")}${thieu.length ? `; thieu ${thieu.join(", ")}` : ""})`,
		);
		if (!dat) hong = true;
	}
	return !hong;
}

const doiSo = process.argv.slice(2);
if (doiSo.includes("--ghi-tep")) {
	mkdirSync(SO.evidence, { recursive: true });
	writeFileSync(
		join(SO.evidence, SO.tepTroLy),
		ghiTepTroLy(bamTung(GOC, danhSachTroLy())),
	);
	console.log(`da ghi ${join(SO.evidence, SO.tepTroLy)}`);
	process.exit(0);
}
const ket = kiem({ evMoi: SO.evidence, evKy: SO.daKy, goc: GOC });
for (const d of ket.dong) console.log(d);
const thuocSong = chayChieuDo();
if (!thuocSong) {
	console.log("THUOC HONG: mot chieu do khong phan biet duoc");
	process.exit(1);
}
process.exit(ket.ma);
