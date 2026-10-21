import { spawnSync } from "node:child_process";
import { readdirSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BAN_DO, bat, chepBanDo, GOC, Ket, moiTruongSach, RA } from "./nen.mjs";

const LOC =
	"const chayTap = CHI ? new Map([...tap].filter(([k]) => CHI.includes(k))) : tap;";
const TAM = realpathSync(tmpdir());
const ket = new Ket();

function chayTep(tep, ...them) {
	const r = spawnSync("bun", [tep, ...them], {
		cwd: GOC,
		encoding: "utf8",
		env: moiTruongSach(),
		maxBuffer: 64 * 1024 * 1024,
	});
	const dong = `${r.stdout ?? ""}${r.stderr ?? ""}`.split("\n");
	return {
		ma: r.status,
		dong,
		chay: dong.find((d) => d.startsWith("chay: ")) ?? null,
		khong: dong.find((d) => d.startsWith("KHONG DO DUOC")) ?? null,
	};
}

const chay = (...them) => chayTep(BAN_DO, ...them);

function tapRut(dong) {
	const i = dong.findIndex((d) => / rut duoc \d+ lenh$/.test(d));
	const tap = [];
	for (const d of dong.slice(i + 1)) {
		const m = /^ {2}([\w-]+): /.exec(d);
		if (!m) break;
		tap.push(m[1]);
	}
	return {
		n: Number(/rut duoc (\d+) lenh/.exec(dong[i] ?? "")?.[1] ?? Number.NaN),
		tap,
	};
}

const tapChay = (r) =>
	r.chay ? r.chay.slice("chay: ".length).split(",").filter(Boolean) : null;

const r1 = chay("--chi-rut");
const rut = tapRut(r1.dong);
const c1 = tapChay(r1);
ket.kiem(
	rut.tap.length > 1 &&
		rut.tap.includes("gpct_nen_gop") &&
		rut.tap.length === rut.n,
	`doi-chung-duong tap rut ${rut.tap.length}/${rut.n} khoa, co gpct_nen_gop`,
	`tap rut ${rut.tap.length}, khai ${rut.n}`,
);
ket.kiem(
	r1.ma === 0 &&
		c1 !== null &&
		c1.length === rut.tap.length &&
		rut.tap.every((k) => c1.includes(k)),
	"khong-chi: chay = tap rut",
	`ma ${r1.ma}, chay ${c1?.length ?? "vang"} khoa, rut ${rut.tap.length}`,
);

const r2 = chay("--chi-rut", "--chi", "gpct_nen_gop");
ket.kiem(
	r2.ma === 0 && r2.chay === "chay: gpct_nen_gop",
	"chi-mot-khoa: chay: gpct_nen_gop",
	`ma ${r2.ma}, ${r2.chay}`,
);

const r3 = chay("--chi-rut", "--chi", "khong_co_khoa_nay");
ket.kiem(
	r3.ma === 2 &&
		r3.khong?.includes("khong_co_khoa_nay") === true &&
		r3.chay === null,
	"khoa-la: ma 2, KHONG DO DUOC goi ten khoa",
	`ma ${r3.ma}, ${r3.khong}, ${r3.chay}`,
);

const r4 = chay("--chi-rut", "--chi");
ket.kiem(
	r4.ma === 2 && r4.khong?.includes("--chi") === true,
	"chi-trong: ma 2, KHONG DO DUOC goi --chi",
	`ma ${r4.ma}, ${r4.khong}`,
);

const banTruoc = new Set(
	readdirSync(TAM).filter((t) => t.startsWith("cgdp-kdt-")),
);
const r5 = chay("--chi", "khong_co_khoa_nay");
const banMoi = readdirSync(TAM).filter(
	(t) => t.startsWith("cgdp-kdt-") && !banTruoc.has(t),
);
ket.kiem(
	r5.ma === 2 &&
		r5.khong !== null &&
		!r5.dong.some((d) => d.startsWith("neo:")) &&
		banMoi.length === 0,
	"day-du-khoa-la: ma 2, khong dung ban",
	`ma ${r5.ma}, ${r5.khong}, ban moi ${banMoi.join(",") || 0}`,
);
const pha = chepBanDo(
	join(RA, "chi", "pha", "khong-do-them.mjs"),
	LOC,
	"const chayTap = tap;",
);
const r6 = chayTep(pha, "--chi-rut", "--chi", "gpct_nen_gop");
bat(
	ket,
	"bo-loc-bi-bo",
	r6.chay !== "chay: gpct_nen_gop" && (tapChay(r6)?.length ?? 0) > 1,
	`ma ${r6.ma}, ${r6.chay?.slice(0, 80)}`,
);
ket.ket();
