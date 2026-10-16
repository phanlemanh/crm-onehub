import { describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	docE22,
	docE24,
	docKetQuaEval,
	ketLuan,
	NGUONG,
	TRANG_THAI_EVE,
} from "./doc-so.mjs";

const MAU = join(import.meta.dir, "mau");
const O_CO_HOI = join(import.meta.dir, "..", "opportunity.md");
const doc = (ten: string) => readFileSync(join(MAU, ten), "utf8");

function hong(dieuKien: boolean, thongDiep: string) {
	if (dieuKien) throw new Error(thongDiep);
}

function bang<T>(a: T, b: T) {
	return JSON.stringify(a) === JSON.stringify(b);
}

const DAT = {
	e24Hong: 0,
	e22Dung: 30,
	gopYThua: 0,
	judge: 1,
	tacNhanQua: 3,
};

describe("thk-doc-so", () => {
	test("E24 Haiku: 11 luot hong tren 20", () => {
		const so = docE24(doc("e24-haiku.log"));
		hong(
			"khongDo" in so || so.soHong !== 11 || so.soLuot !== 20,
			"thk: e24 haiku doc sai",
		);
	});

	test("E24 Gemini: 0 hong, p50 13360, p90 30990", () => {
		const so = docE24(doc("e24-gemini.log"));
		hong(
			"khongDo" in so ||
				so.soHong !== 0 ||
				so.p50 !== 13_360 ||
				so.p90 !== 30_990,
			"thk: e24 gemini doc sai",
		);
	});

	test("E22 Haiku: 20/30, ba ca gop y thua, judge 0.95, chi 0.158889", () => {
		const so = docE22(doc("e22-haiku.log"));
		hong(
			"khongDo" in so ||
				so.dung !== 20 ||
				so.tong !== 30 ||
				!bang(so.gopYThua, ["gy-10", "gy-12", "gy-13"]) ||
				so.judge !== 0.95 ||
				so.chiUsd !== 0.158_889,
			"thk: e22 haiku doc sai",
		);
	});

	test("E22 Gemini mat kho: khong do duoc", () => {
		hong(
			!("khongDo" in docE22(doc("e22-gemini-mat-kho.log"))),
			"thk: mat kho thanh so",
		);
	});

	test("ket qua tung eval trong dau ra eve eval", () => {
		const tep = join(MAU, "e22-haiku-eve.log");
		const r = spawnSync("grep", ["-E", "^(✓|✗|○|–) ", tep], {
			encoding: "utf8",
			env: { ...process.env, LC_ALL: "en_US.UTF-8" },
		});
		const dap = r.stdout
			.trim()
			.split("\n")
			.map((d) => d.split(/\s+/))
			.map(([dau, id]) => ({ id: id ?? "", dau: dau ?? "" }));
		hong(dap.length === 0, "thk: doc eve eval sai (mau rong)");
		hong(
			new Set(dap.map((d) => d.dau)).size < 2,
			"thk: doc eve eval sai (mau chi co mot trang thai)",
		);
		const text = readFileSync(tep, "utf8");
		for (const d of dap) {
			const so = docKetQuaEval(text, d.id);
			const mong = TRANG_THAI_EVE[d.dau as keyof typeof TRANG_THAI_EVE];
			const dung =
				mong === "skipped"
					? "khongDo" in so
					: !("khongDo" in so) &&
						so.trangThai === mong &&
						so.qua === (mong === "passed");
			hong(!dung, `thk: doc eve eval sai ${d.id}`);
		}
		hong(
			!(
				"khongDo" in
				docKetQuaEval("–  agent-builder  skipped\n", "agent-builder")
			),
			"thk: doc eve eval sai skipped thanh so",
		);
		hong(
			!("khongDo" in docKetQuaEval(text, "agent-builder")),
			"thk: doc eve eval sai agent-builder",
		);
	});

	test("NGUONG chep dung muc SONG cua o co hoi", () => {
		hong(
			!bang(NGUONG, {
				e24Hong: 0,
				e22Dung: 28,
				gopYThua: 0,
				judge: 0.9,
				tacNhanQua: 3,
			}),
			"thk: nguong lech o co hoi",
		);
		const song = readFileSync(O_CO_HOI, "utf8")
			.split("\n")
			.find((d) => d.startsWith("- Kết quả nào là SỐNG:"));
		for (const manh of [
			"E24 0/20",
			"E22 ≥ 28/30",
			"0 ca góp ý thừa",
			"judge ≥ 0,9",
			"3/3",
		])
			hong(!song?.includes(manh), `thk: nguong lech o co hoi (${manh})`);
	});

	test("bien tung ve, hai phia", () => {
		const o = [
			["e24Hong", 0, 1],
			["e22Dung", 28, 27],
			["gopYThua", 0, 1],
			["judge", 0.9, 0.89],
			["tacNhanQua", 3, 2],
		] as const;
		hong(o.length !== Object.keys(NGUONG).length, "thk: bien sai (thieu ve)");
		for (const [ve, dat, truot] of o) {
			const ketDat = ketLuan({ ...DAT, [ve]: dat });
			const ketTruot = ketLuan({ ...DAT, [ve]: truot });
			const vai = ve === "tacNhanQua" ? "tacNhan" : "troLyOkr";
			hong(ketDat[vai]?.ket !== "dat", `thk: bien sai ${ve} ${dat}`);
			hong(ketTruot[vai]?.ket !== "khong-dat", `thk: bien sai ${ve} ${truot}`);
		}
	});

	test("ket luan Haiku cua mau: khong dat o ba ve", () => {
		const e24 = docE24(doc("e24-haiku.log"));
		const e22 = docE22(doc("e22-haiku.log"));
		hong("khongDo" in e24 || "khongDo" in e22, "thk: ket luan haiku sai (mau)");
		if ("khongDo" in e24 || "khongDo" in e22) return;
		const ket = ketLuan({
			e24Hong: e24.soHong,
			e22Dung: e22.dung,
			gopYThua: e22.gopYThua.length,
			judge: e22.judge,
		});
		hong(
			ket.troLyOkr.ket !== "khong-dat" ||
				!bang(ket.troLyOkr.truot, ["e24", "e22", "gop-y-thua"]),
			"thk: ket luan haiku sai",
		);
	});
});
