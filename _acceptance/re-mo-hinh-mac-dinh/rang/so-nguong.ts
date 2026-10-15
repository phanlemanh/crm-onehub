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
import { TAI_LIEU_AGENT } from "../../../apps/agent/agent/lib/tai-lieu-config";
import {
	type BaoCao,
	bam,
	ghiBaoCao,
	kiemBangChung,
	phanBang,
	tinhBang,
} from "../../bo-cau-hoi-mau/rang/bang-do";
import { BO_MAU } from "../../bo-cau-hoi-mau/rang/bo-mau-config";
import { khuonBoMau } from "../../bo-cau-hoi-mau/rang/khuon";
import {
	CHAM_BO_DO,
	chamTungCau,
	type DongTungCau,
	docTungCau,
	ketLuan,
} from "../../tro-ly-doc-kho/rang/quyet-do";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const SO = {
	evidence: resolve(import.meta.dir, "..", "evidence"),
	daKy: BO_MAU.duong.evidence,
	troLy: "apps/agent/agent",
	tepCauHinh: "apps/agent/agent/lib/tai-lieu-config.ts",
	tepTroLy: "tro-ly-tep.txt",
	baoCao: BO_MAU.bangChung.baoCao,
	tungCau: BO_MAU.bangChung.tungCau,
	maModel: "google/gemini-3.8-flash",
	cacLuot: [1, 2],
	soLoiBa: 3,
	vuotTran: "VUOT TRAN LOI MODEL",
	khongDat: "KHONG DAT",
} as const;

type Ket = { ma: number; dong: string[] };
type ChoKiem = { ev: string; goc: string };

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

function soTroLy(ev: string, goc: string): string[] {
	const md = doc(join(ev, SO.baoCao)) ?? "";
	const ghi = md.match(/^bam tro-ly: ([0-9a-f]{64})$/m)?.[1];
	const tho = doc(join(ev, SO.tepTroLy));
	if (!ghi) return ["bao cao khong co dong bam tro-ly"];
	if (tho === null) return [`thieu ${SO.tepTroLy}`];
	const daGhi = docTepTroLy(tho);
	if (!daGhi.has(SO.tepCauHinh))
		return [`danh sach tep tro ly thieu ${SO.tepCauHinh}`];
	if (bamGop(daGhi) !== ghi)
		return [`${SO.tepTroLy} khong khop dong bam tro-ly cua do-bo-mau`];
	const hien = bamTung(goc, danhSachTroLy());
	return [...new Set([...daGhi.keys(), ...hien.keys()])]
		.sort()
		.filter((f) => daGhi.get(f) !== hien.get(f))
		.map((f) => `tep tro ly doi sau lan do: ${f}`);
}

const loiLuot = (ds: readonly DongTungCau[], luot: number) =>
	chamTungCau(ds, CHAM_BO_DO.nguong)
		[luot === 1 ? "mot" : "hai"].filter((c) => c.nhan === "loi")
		.map((c) => c.id);

function kiem({ ev, goc }: ChoKiem): Ket {
	if (TAI_LIEU_AGENT.hoi.maModel !== SO.maModel)
		return {
			ma: 1,
			dong: [
				`cau hinh tro ly kho chon ${TAI_LIEU_AGENT.hoi.maModel}, khong phai ${SO.maModel}`,
			],
		};
	const boTho = readFileSync(BO_MAU.duong.bo, "utf8");
	const ky = kiemBangChung(
		boTho,
		doc(join(SO.daKy, SO.baoCao)),
		doc(join(SO.daKy, SO.tungCau)),
	);
	if (!ky.ok) return { ma: 2, dong: [`KHONG DO DUOC: ban da ky ${ky.loi}`] };
	const moi = kiemBangChung(
		boTho,
		doc(join(ev, SO.baoCao)),
		doc(join(ev, SO.tungCau)),
	);
	if (!moi.ok) return { ma: 1, dong: [`LECH: luot nay ${moi.loi}`] };
	const tep = soTroLy(ev, goc);
	if (tep.length > 0) return { ma: 1, dong: tep };
	const dong = docTungCau(doc(join(ev, SO.tungCau)) ?? "");
	const { mot, hai } = chamTungCau(dong, CHAM_BO_DO.nguong);
	const kiemSai = dong.filter((d) => d.luot === 1 && d.khongQuaKiem).length;
	const kl = ketLuan(
		mot.filter((c) => c.nhan !== "loi"),
		hai.filter((c) => c.nhan !== "loi"),
		CHAM_BO_DO.nguong,
		kiemSai,
	);
	const dongKy = docTungCau(doc(join(SO.daKy, SO.tungCau)) ?? "");
	const loiKy = SO.cacLuot.flatMap((l) => loiLuot(dongKy, l));
	const loiMoi = SO.cacLuot.flatMap((l) => loiLuot(dong, l));
	const hong = kl.dong
		.map((d) => d.match(/^(\w+): .* (xam|khong-dat)$/)?.[1])
		.filter((c): c is string => c !== undefined)
		.map((c) => `${SO.khongDat}: ${c}`);
	const vuot =
		loiMoi.length > loiKy.length
			? [
					`${SO.vuotTran}: ${loiMoi.length} > ${loiKy.length} (${loiMoi.join(", ")})`,
				]
			: [];
	const ra = [
		"bon chi so canh nguong cu (cau loi model tach rieng):",
		...kl.dong.map((d) => `  ${d}`),
		...SO.cacLuot.map(
			(l) =>
				`loi model luot ${l}: ${loiLuot(dong, l).join(", ") || "(khong co)"} — luot da ky: ${loiLuot(dongKy, l).join(", ") || "(khong co)"}`,
		),
		`tong loi model hai luot: ${loiMoi.length} — tran ${loiKy.length} theo luot da ky`,
		"bang tang x kieu chu (chi de doc, khong chan):",
		phanBang(moi.bang),
		...hong,
		...vuot,
	];
	const dat = kl.ma === 0 && hong.length === 0 && vuot.length === 0;
	return dat
		? {
				ma: 0,
				dong: [
					...ra,
					"dat: bon chi so dat nguong cu, cau loi model trong tran",
				],
			}
		: { ma: 1, dong: ra };
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

const tam: string[] = [];

function thuMucTam(tien: string): string {
	const t = mkdtempSync(join(tmpdir(), tien));
	tam.push(t);
	return t;
}

function banSao(
	doi: (dong: DongTungCau[]) => DongTungCau[],
	boTep?: string,
): string {
	const thuMuc = thuMucTam("rmh-so-nguong-");
	const md = readFileSync(join(SO.daKy, SO.baoCao), "utf8");
	const dong = doi(docTungCau(readFileSync(join(SO.daKy, SO.tungCau), "utf8")));
	const tung = bamTung(GOC, danhSachTroLy());
	if (boTep) tung.delete(boTep);
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

const laDatHai = (d: DongTungCau) => d.luot === 2 && d.ketCuc === "co-hang";

function doiHai(ds: DongTungCau[], n: number) {
	const chon = ds
		.filter(laDatHai)
		.slice(0, n)
		.map((d) => d.id);
	return {
		dong: ds.map((d) =>
			d.luot === 2 && chon.includes(d.id)
				? {
						...d,
						ketCuc: "loi" as const,
						zalo: { ketQua: "loi", loi: null, coHang: d.zalo?.coHang ?? true },
					}
				: d,
		),
		ma: chon,
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
	chay: () => { ket: Ket; mong: number; phaiCo: string[] };
};

const CHIEU_DO: readonly ChieuDo[] = [
	{
		ten: "ban sao nguyen (doi chung duong)",
		chay: () => ({
			ket: kiem({ ev: banSao((ds) => ds), goc: GOC }),
			mong: 0,
			phaiCo: ["dat: bon chi so dat nguong cu"],
		}),
	},
	{
		ten: "dung trang tut duoi nguong",
		chay: () => {
			const tho = docTungCau(readFileSync(join(SO.daKy, SO.tungCau), "utf8"));
			const mau = tho.filter(
				(d) => d.luot === 1 && d.nhom !== "khong-co" && d.ketCuc !== "LOI",
			).length;
			const n = Math.floor(mau * (1 - CHAM_BO_DO.nguong.dungTrang)) + 1;
			const ev = banSao((ds) => doiN(ds, n, "TRA_LOI-sai").dong);
			return {
				ket: kiem({ ev, goc: GOC }),
				mong: 1,
				phaiCo: [`${SO.khongDat}: dungTrang`],
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
				ket: kiem({ ev, goc: GOC }),
				mong: 1,
				phaiCo: [`${SO.vuotTran}: `, ...ma],
			};
		},
	},
	{
		ten: "mot cau luot hai thanh loi model, tong qua tran",
		chay: () => {
			let ma: string[] = [];
			const ev = banSao((ds) => {
				const r = doiHai(ds, 1);
				ma = r.ma;
				return r.dong;
			});
			return {
				ket: kiem({ ev, goc: GOC }),
				mong: 1,
				phaiCo: [`${SO.vuotTran}: `, ...ma],
			};
		},
	},
	{
		ten: "mot byte tep tro ly doi",
		chay: () => {
			const ev = banSao((ds) => ds);
			const goc = thuMucTam("rmh-cay-");
			const ds = danhSachTroLy();
			for (const f of ds) {
				const tu = join(GOC, f);
				if (!existsSync(tu)) continue;
				mkdirSync(dirname(join(goc, f)), { recursive: true });
				writeFileSync(join(goc, f), readFileSync(tu));
			}
			const dich = ds.find((f) => f.includes("tro_ly_kho")) ?? ds[0] ?? "";
			writeFileSync(
				join(goc, dich),
				`${readFileSync(join(goc, dich), "utf8")} `,
			);
			return { ket: kiem({ ev, goc }), mong: 1, phaiCo: [dich] };
		},
	},
	{
		ten: "danh sach tep tro ly thieu tai-lieu-config.ts",
		chay: () => ({
			ket: kiem({ ev: banSao((ds) => ds, SO.tepCauHinh), goc: GOC }),
			mong: 1,
			phaiCo: [SO.tepCauHinh],
		}),
	},
];

function chayChieuDo(): boolean {
	let hong = false;
	for (const c of CHIEU_DO) {
		const { ket, mong, phaiCo } = c.chay();
		const thieu = phaiCo.filter((m) => !ket.dong.some((d) => d.includes(m)));
		const dat = ket.ma === mong && thieu.length === 0;
		console.log(
			`chieu do ${c.ten}: ${dat ? "dat" : "HONG"} (ma ${ket.ma}, mong ${mong}; ghim ${phaiCo.join(", ")}${thieu.length ? `; thieu ${thieu.join(", ")}` : ""})`,
		);
		if (!dat) hong = true;
	}
	for (const t of tam) rmSync(t, { recursive: true, force: true });
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
const ket = kiem({ ev: SO.evidence, goc: GOC });
for (const d of ket.dong) console.log(d);
if (!chayChieuDo()) {
	console.log("THUOC HONG: mot chieu do khong phan biet duoc");
	process.exit(1);
}
process.exit(ket.ma);
