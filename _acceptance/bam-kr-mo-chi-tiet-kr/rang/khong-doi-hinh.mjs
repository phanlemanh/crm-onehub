import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const require = createRequire(import.meta.url);
const { parseEvals } = require(join(GOC, "lib", "eval-yaml.cjs"));
const { resolveConfigKey } = require(join(GOC, "lib", "evidence-core.cjs"));

const SLUG = "bam-kr-mo-chi-tiet-kr";
const NHANH_GOC = "origin/onehub";
const NGUOI_QUYET = "Phan Le Manh";
const TRANG_THAI_KY = new Set(["signed-off", "machine-cleared"]);
const VAT = [
	"phan-kr-phu-trach",
	"cay-can-chinh",
	"viec-cua-toi",
	"bang-kr",
	"tin-nhac",
];
const CHU_CU = "Cập nhật tuần";
const TEP_CUA_VONG = /(bam-kr-mo-chi-tiet-kr|\/bkr-|bam-kr-quet)/;
const ANH_CHUP = "apps/agent/test/fixtures/tin-nhac-truoc-tb1.json";
const LOP_TEP =
	/^(apps\/[^/]+\/test\/|packages\/[^/]+\/test\/|_acceptance\/[^/]+\/rang\/)/;
const TRAN_LENH_MS = 15 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function giaTri(dong) {
	const m = /:\s*"(.*)"$/.exec(dong);
	return m ? m[1] : dong;
}

export function capChu() {
	const ds = JSON.parse(
		readFileSync(join(GOC, `_acceptance/${SLUG}/rang/cap-chu.json`), "utf8"),
	);
	const cap = ds.flatMap((c) => [
		[c.cu, c.moi],
		[giaTri(c.cu), giaTri(c.moi)],
	]);
	return [...new Map(cap.map((x) => [x.join("→"), x])).values()].sort(
		(a, b) => b[0].length - a[0].length,
	);
}

function doiMotCap(cu, moi, cap) {
	const khop = cap.filter(([a, b]) => {
		const vi = cu.indexOf(a);
		if (vi < 0 || cu.indexOf(a, vi + 1) >= 0) return false;
		if (cu.slice(vi + a.length).startsWith(" này")) return false;
		return cu.slice(0, vi) + b + cu.slice(vi + a.length) === moi;
	});
	return khop.length >= 1;
}

export function khoiDiff(than) {
	const khoi = [];
	let hien = null;
	for (const dong of than.split("\n")) {
		if (dong.startsWith("@@")) {
			const m = /\+(\d+)/.exec(dong);
			hien = { dong: Number(m?.[1] ?? 0), bo: [], them: [] };
			khoi.push(hien);
		} else if (hien && dong.startsWith("-") && !dong.startsWith("---"))
			hien.bo.push(dong.slice(1));
		else if (hien && dong.startsWith("+") && !dong.startsWith("+++"))
			hien.them.push(dong.slice(1));
	}
	return khoi;
}

export function khoiHopLe(k, cap, apAnh = null) {
	const bo = k.bo.map((d) => d.trim());
	const them = k.them.map((d) => d.trim());
	if (apAnh) {
		const boKhop = bo.every((d) => apAnh.dongBo.includes(d));
		const themKhop = them.every((d) => apAnh.dongThem.includes(d));
		if (boKhop && themKhop) return true;
	}
	if (bo.length !== them.length || bo.length === 0) return false;
	return bo.every((d, i) => d === them[i] || doiMotCap(d, them[i], cap));
}

function cocSo(mb) {
	return mb;
}

function ganNen() {
	return git(["merge-base", NHANH_GOC, "HEAD"]);
}

function tepDaSua(nen, cwd = GOC) {
	return git(
		["diff", "--name-only", "--diff-filter=AMDR", `${nen}...HEAD`],
		cwd,
	)
		.split("\n")
		.filter(
			(t) =>
				t &&
				LOP_TEP.test(t) &&
				!t.startsWith(`_acceptance/${SLUG}/`) &&
				!TEP_CUA_VONG.test(t),
		);
}

function tepTrongLenh(lenh) {
	const cd = /^cd\s+(\S+)\s*&&/.exec(lenh.replace(/^bun run test --\s*"/, ""));
	const goc = cd ? cd[1] : ".";
	return [...lenh.matchAll(/([\w./[\]()-]+\.(?:tsx?|mjs|cjs|js))/g)]
		.map((m) => m[1].replace(/^\.\//, ""))
		.flatMap((t) => [join(goc, t), t])
		.filter((t) => existsSync(join(GOC, t)));
}

function trangThai(slug) {
	const duong = join(GOC, "_acceptance", slug, "contract.md");
	if (!existsSync(duong)) return null;
	return /^status:\s*(\S+)/m.exec(readFileSync(duong, "utf8"))?.[1] ?? null;
}

export function quetLop(daSua) {
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const lop = [];
	for (const slug of readdirSync(join(GOC, "_acceptance"))) {
		if (slug === SLUG || !TRANG_THAI_KY.has(trangThai(slug) ?? "")) continue;
		const tep = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(tep)) continue;
		for (const e of parseEvals(readFileSync(tep, "utf8"), [
			"executor",
			"cmd",
			"status",
		])) {
			if (!["test", "script"].includes(String(e.executor).trim())) continue;
			if (String(e.status ?? "").trim() === "not-run") continue;
			const ref = String(e.cmd ?? "")
				.trim()
				.replace(/^config:/, "");
			const lenh = String(resolveConfigKey(cauHinh, ref) ?? "").trim();
			if (!lenh) continue;
			const tepLenh = tepTrongLenh(lenh);
			const thuoc = tepLenh.some((t) => {
				if (daSua.includes(t)) return true;
				const than = readFileSync(join(GOC, t), "utf8");
				return than.includes(CHU_CU) || VAT.some((v) => than.includes(v));
			});
			if (thuoc) lop.push({ slug, ten: `${slug}#${e.id}`, lenh, tep: tepLenh });
		}
	}
	return lop;
}

function chay(lenh, cwd, daChay) {
	if (daChay.has(lenh)) return daChay.get(lenh);
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	const ma = r.status ?? 2;
	daChay.set(lenh, ma);
	return ma;
}

function dungCayGoc() {
	const tam = mkdtempSync(join(tmpdir(), "bkr-khong-doi-"));
	const cay = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", cay, NHANH_GOC]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(cay, ".env"));
	execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: cay,
		stdio: "inherit",
	});
	execFileSync("bun", ["run", "db:generate"], {
		cwd: join(cay, "packages", "db"),
		stdio: "ignore",
	});
	return { tam, cay };
}

function donCay({ tam, cay }) {
	spawnSync("git", ["worktree", "remove", "--force", cay], { cwd: GOC });
	rmSync(tam, { recursive: true, force: true });
	spawnSync("git", ["worktree", "prune"], { cwd: GOC });
}

function dongSo(slug) {
	const duong = join(GOC, "_acceptance", slug, "decisions.jsonl");
	if (!existsSync(duong)) return [];
	return readFileSync(duong, "utf8")
		.split("\n")
		.filter(Boolean)
		.flatMap((d) => {
			try {
				return [JSON.parse(d)];
			} catch {
				return [];
			}
		});
}

export function chuBai() {
	return JSON.parse(
		readFileSync(join(GOC, `_acceptance/${SLUG}/rang/chu-bai.json`), "utf8"),
	);
}

export function kiemSo(daSua) {
	const { chu, apBangCapAnhChup } = chuBai();
	const loi = [];
	for (const t of daSua) {
		if (t === ANH_CHUP) {
			loi.push(`SAI AC-6: ANH CHUP LICH SU DOI ${t}`);
			continue;
		}
		if (t === apBangCapAnhChup.tepHoTro) continue;
		const slug = chu[t];
		if (!slug) {
			loi.push(`SAI AC-6: THIEU CHU ${t}`);
			continue;
		}
		const co = dongSo(slug).some(
			(d) =>
				d.type === "fix" &&
				d.decided_by === NGUOI_QUYET &&
				JSON.stringify(d).includes(t),
		);
		if (!co) loi.push(`SAI AC-6: THIEU SO ${t} (${slug})`);
	}
	return loi;
}

export function kiemTepHoTro(cwd = GOC) {
	const { apBangCapAnhChup: a } = chuBai();
	const duong = join(cwd, a.tepHoTro);
	if (!existsSync(duong)) return [];
	const than = readFileSync(duong, "utf8");
	const loi = [];
	if (!than.includes("_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json"))
		loi.push(`SAI AC-6: ${a.tepHoTro} khong doc bang cap`);
	if (!than.includes('"apps/agent/agent/lib/tin-nhac.ts"'))
		loi.push(`SAI AC-6: ${a.tepHoTro} khong gioi han cap cua tin-nhac`);
	return loi;
}

export function kiemKhoi(daSua, nen, cwd = GOC) {
	const cap = capChu();
	const { apBangCapAnhChup: a } = chuBai();
	const loi = [];
	for (const t of daSua) {
		if (t === ANH_CHUP || t === a.tepHoTro) continue;
		const apAnh = a.tepGoi.includes(t) ? a : null;
		for (const k of khoiDiff(
			git(["diff", "-U0", `${nen}...HEAD`, "--", t], cwd),
		))
			if (!khoiHopLe(k, cap, apAnh))
				loi.push(`SAI AC-6: DOI LOGIC ${t}:${k.dong}`);
	}
	return loi;
}

function chieuDo(kieu) {
	const tam = mkdtempSync(join(tmpdir(), "bkr-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const nen = git(["merge-base", NHANH_GOC, "HEAD"], sao);
		const daSua = tepDaSua(nen, sao);
		const dich = daSua.find((t) => t !== ANH_CHUP);
		if (!dich) throw new Error("khong co tep da ky nao bi sua de pha");
		if (kieu === "doi-logic") {
			const duong = join(sao, dich);
			writeFileSync(
				duong,
				`${readFileSync(duong, "utf8")}export const doiLogicThu = 1 + 1;\n`,
			);
		}
		if (kieu === "not-tobe") {
			const duong = join(sao, dich);
			const than = readFileSync(duong, "utf8");
			const i = than.indexOf("Cập nhật");
			const j = than.indexOf(".toBe(", i);
			if (i < 0 || j < 0)
				throw new Error(`khong tim duoc cho pha not-tobe o ${dich}`);
			writeFileSync(duong, `${than.slice(0, j)}.not.toBe(${than.slice(j + 6)}`);
		}
		if (kieu === "xoa-so") {
			for (const slug of readdirSync(join(sao, "_acceptance"))) {
				const duong = join(sao, "_acceptance", slug, "decisions.jsonl");
				if (!existsSync(duong)) continue;
				const giu = readFileSync(duong, "utf8")
					.split("\n")
					.filter((d) => {
						try {
							const x = JSON.parse(d);
							return !(x.type === "fix" && JSON.stringify(x).includes(dich));
						} catch {
							return true;
						}
					});
				writeFileSync(duong, giu.join("\n"));
			}
		}
		git(["add", "-A"], sao);
		git(
			[
				"-c",
				"user.name=kiem-do",
				"-c",
				"user.email=kiem@do.do",
				"commit",
				"-q",
				"--no-verify",
				"-m",
				`test(bkr): chieu do ${kieu}`,
			],
			sao,
		);
		const loi =
			kieu === "xoa-so"
				? kiemSo(daSua)
				: kiemKhoi(tepDaSua(nen, sao), nen, sao);
		for (const l of loi) console.log(l);
		return loi.length > 0 ? MA_DO : 0;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

try {
	const iDo = process.argv.indexOf("--chieu-do");
	if (iDo >= 0) process.exit(chieuDo(process.argv[iDo + 1] ?? "doi-logic"));
	const nen = cocSo(ganNen());
	const daSua = tepDaSua(nen);
	for (const t of daSua) console.log(`DA SUA ${t}`);
	const lop = quetLop(daSua);
	console.log(
		`quet lop: ${new Set(lop.map((m) => m.slug)).size} ho so, ${lop.length} eval`,
	);
	let sai = 0;
	for (const l of [
		...kiemSo(daSua),
		...kiemTepHoTro(),
		...kiemKhoi(daSua, nen),
	]) {
		console.log(l);
		sai += 1;
	}
	if (process.argv.includes("--chi-tinh")) {
		console.log(
			`KET LUAN khong-doi-hinh tinh: ${sai === 0 ? "dat" : `${sai} SAI`}`,
		);
		process.exit(sai === 0 ? 0 : MA_DO);
	}
	const daChayCay = new Map();
	const cay = lop.map((m) => ({ ...m, ma: chay(m.lenh, GOC, daChayCay) }));
	const do_ = cay.filter((m) => m.ma !== 0);
	for (const m of cay.filter((x) => x.ma === 0)) console.log(`DUNG ${m.ten}`);
	if (do_.length > 0) {
		const goc = dungCayGoc();
		try {
			const daChayNen = new Map();
			for (const m of do_) {
				const ma = chay(m.lenh, goc.cay, daChayNen);
				if (ma === 0) {
					sai += 1;
					console.log(`SAI AC-6: ${m.ten} nen 0, cay ${m.ma}`);
				} else console.log(`DO SAN TREN NEN ${m.ten}`);
			}
		} finally {
			donCay(goc);
		}
	}
	console.log(`KET LUAN khong-doi-hinh: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
