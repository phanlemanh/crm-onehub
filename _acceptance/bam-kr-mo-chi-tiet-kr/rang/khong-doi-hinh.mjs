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
const TRANG_THAI_KY = new Set(["signed-off", "machine-cleared"]);
const VAT = [
	"phan-kr-phu-trach",
	"cay-can-chinh",
	"viec-cua-toi",
	"bang-kr",
	"tin-nhac",
];
const CHU_CU = "Cập nhật tuần";
const DAU_MO = "data-mo-muc-tieu";
const THEM = [
	["dat-okr-trong-crm", "dok_man_chrome"],
	["hop-thoai-giu-cho-dang-nhap", "hg_man_that"],
];
const TEP_CUA_VONG = /(bam-kr-mo-chi-tiet-kr|\/bkr-|bam-kr-quet)/;
const ANH_CHUP = "apps/agent/test/fixtures/tin-nhac-truoc-tb1.json";
const LOP_TEP =
	/^(apps\/[^/]+\/test\/|packages\/[^/]+\/test\/|_acceptance\/[^/]+\/rang\/)/;
const TRAN_LENH_MS = 15 * 60_000;
const DAN_CHAM_TEP = /cham-tep V\d+-\d+/;
const MA_DO = 1;
const MA_KHONG_DO = 2;

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

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

function dongSo(chu) {
	return chu.split("\n").filter(Boolean);
}

function hoSoCoFixMoi(nen, tep, cwd = GOC) {
	for (const slug of readdirSync(join(cwd, "_acceptance"))) {
		const L = join(cwd, "_acceptance", slug, "decisions.jsonl");
		if (!existsSync(L)) continue;
		const r = spawnSync(
			"git",
			["show", `${nen}:_acceptance/${slug}/decisions.jsonl`],
			{ cwd, encoding: "utf8" },
		);
		const cu = new Set(r.status === 0 ? dongSo(r.stdout) : []);
		const co = dongSo(readFileSync(L, "utf8"))
			.filter((d) => !cu.has(d))
			.some((d) => {
				try {
					const o = JSON.parse(d);
					return (
						o.type === "fix" &&
						String(o.decision).includes(tep) &&
						DAN_CHAM_TEP.test(
							`${o.decided_by ?? ""} ${o.why ?? ""} ${o.decision}`,
						)
					);
				} catch {
					return false;
				}
			});
		if (co) return slug;
	}
	return null;
}

function tepMienCua(m, daSua, nen) {
	const sua = m.tep.filter((t) => daSua.includes(t));
	if (sua.length === 0) return null;
	const dan = sua.map((t) => [t, hoSoCoFixMoi(nen, t)]);
	return dan.every(([, h]) => h) ? dan : null;
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
				return (
					than.includes(CHU_CU) ||
					than.includes(DAU_MO) ||
					VAT.some((v) => than.includes(v))
				);
			});
			if (thuoc) lop.push({ slug, ten: `${slug}#${e.id}`, lenh, tep: tepLenh });
		}
	}
	for (const [slug, khoa] of THEM) {
		const lenh = String(
			resolveConfigKey(cauHinh, `executors.script.${khoa}`) ?? "",
		).trim();
		if (!lenh) throw new Error(`khong giai duoc thuoc man ${slug} (${khoa})`);
		console.log(`THEM ${slug}`);
		lop.push({ slug, ten: `${slug}#${khoa}`, lenh, tep: tepTrongLenh(lenh) });
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

function anhChupDoi(nen, cwd = GOC) {
	return (
		git(["diff", "--name-only", `${nen}...HEAD`, "--", ANH_CHUP], cwd) !== ""
	);
}

function lamBanSao(sua) {
	const tam = mkdtempSync(join(tmpdir(), "bkr-khong-doi-do-"));
	const sao = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(sao, ".env"));
	sua(sao);
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
			"test(bkr): chieu do",
		],
		sao,
	);
	return { tam, cay: sao };
}

function chieuDo(kieu) {
	if (kieu === "anh-chup") {
		const sao = lamBanSao((c) => {
			const d = join(c, ANH_CHUP);
			writeFileSync(d, `${readFileSync(d, "utf8")}\n`);
		});
		try {
			const nen = git(["merge-base", NHANH_GOC, "HEAD"], sao.cay);
			if (anhChupDoi(nen, sao.cay)) {
				console.log("SAI AC-6: ANH CHUP LICH SU DOI");
				return MA_DO;
			}
			return 0;
		} finally {
			donCay(sao);
		}
	}
	const BAI = "apps/agent/test/kara-mot-ten.spec.ts";
	const sao = lamBanSao((c) => {
		const d = join(c, BAI);
		writeFileSync(
			d,
			readFileSync(d, "utf8").replace('"*Cập nhật*"', '"*Cập nhật sai*"'),
		);
	});
	try {
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao.cay,
			stdio: "ignore",
		});
		const lop = quetLop([BAI]).filter(
			(m) => m.slug === "kara-mot-ten" && m.tep.includes(BAI),
		);
		if (lop.length === 0)
			throw new Error("khong thay eval kara-mot-ten chay bai");
		const goc = dungCayGoc();
		let sai = 0;
		try {
			for (const m of lop) {
				const lan1 = chay(m.lenh, sao.cay, new Map());
				const cay = lan1 === 0 ? 0 : chay(m.lenh, sao.cay, new Map());
				const nen = cay === 0 ? 0 : chay(m.lenh, goc.cay, new Map());
				if (nen === 0 && cay !== 0) {
					sai += 1;
					console.log(`SAI AC-6: ${m.ten} nen 0, cay ${cay}`);
				}
			}
		} finally {
			donCay(goc);
		}
		return sai > 0 ? MA_DO : 0;
	} finally {
		donCay(sao);
	}
}

try {
	const iDo = process.argv.indexOf("--chieu-do");
	if (iDo >= 0) process.exit(chieuDo(process.argv[iDo + 1] ?? "hoi-quy"));
	const nen = git(["merge-base", NHANH_GOC, "HEAD"]);
	const daSua = tepDaSua(nen);
	for (const t of daSua) console.log(`DA SUA ${t}`);
	let sai = 0;
	if (anhChupDoi(nen)) {
		const dan = hoSoCoFixMoi(nen, ANH_CHUP);
		if (dan)
			console.log(
				`DOI ANH CHUP: so ${dan} co dong fix dan cham-tep da duyet`,
			);
		else {
			console.log("SAI AC-6: ANH CHUP LICH SU DOI");
			sai += 1;
		}
	}
	const lop = quetLop(daSua);
	console.log(
		`quet lop: ${new Set(lop.map((m) => m.slug)).size} ho so, ${lop.length} eval`,
	);
	if (process.argv.includes("--chi-tinh")) {
		console.log(
			`KET LUAN khong-doi-hinh tinh: ${sai === 0 ? "dat" : `${sai} SAI`}`,
		);
		process.exit(sai === 0 ? 0 : MA_DO);
	}
	const daChayCay = new Map();
	const lan1 = lop.map((m) => ({ ...m, ma: chay(m.lenh, GOC, daChayCay) }));
	const daChayLai = new Map();
	const cay = lan1.map((m) => {
		if (m.ma === 0) return m;
		const lai = chay(m.lenh, GOC, daChayLai);
		if (lai === 0)
			console.log(`CHAP CHON ${m.ten}: cay ${m.ma} lan 1, 0 lan 2`);
		return { ...m, ma: lai };
	});
	for (const m of cay.filter((x) => x.ma === 0)) console.log(`DUNG ${m.ten}`);
	const doCay = cay.filter((m) => m.ma !== 0);
	if (doCay.length > 0) {
		const goc = dungCayGoc();
		try {
			const daChayNen = new Map();
			for (const m of doCay) {
				const ma = chay(m.lenh, goc.cay, daChayNen);
				if (ma !== 0) {
					console.log(`DO SAN TREN NEN ${m.ten}`);
					continue;
				}
				const mien = tepMienCua(m, daSua, nen);
				if (mien) {
					console.log(
						`DOI THUOC ${m.ten}: ${mien.map(([t, h]) => `${t} (so ${h})`).join(", ")} co dong fix dan cham-tep da duyet`,
					);
					continue;
				}
				sai += 1;
				console.log(`SAI AC-6: ${m.ten} nen 0, cay ${m.ma}`);
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
