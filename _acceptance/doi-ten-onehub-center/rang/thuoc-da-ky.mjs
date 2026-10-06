import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const yeuCau = createRequire(import.meta.url);
const GOC = process.env.DTOC_GOC ?? join(HERE, "..", "..", "..");
const BANG = process.env.DTOC_BANG ?? join(HERE, "bang-the.json");
const VONG_NAY = "doi-ten-onehub-center";
const HOP_DONG_LUOT = `_acceptance/${VONG_NAY}/contract.md`;
const LAN_MAY = new Set(["test", "script"]);
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const LA_THUOC = /(^_acceptance\/|\/test\/|\.spec\.|\.test\.|\.dom\.tsx$)/;
const LOAI = new Set(["the-ten", "chuoi-that", "neo-lai"]);
const THAY_THE = [
	{
		tep: "apps/app/test/cua-vao-shell.dom.tsx",
		ma: ["coHieuUngNen(trai)", 'toContain("CRM")', "some(coHieuUngNen)"],
		so: "cua-vao-dang-nhap/E2",
	},
	{
		tep: "_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs",
		ma: ["khong-shader"],
		so: "cua-vao-dang-nhap/E11",
	},
];
const SO_THAY_THE_KHAC = ["cua-vao-dang-nhap/E14"];
const VAT_CONG_GHI = ["evidence-report.md", "run-log.jsonl", "decisions.jsonl"];
const TEN =
	/\b(?:the |your |this |The |This |Your )?(?:OneHub )?CRM(?: OneHub)?\b|\bOneHub Center\b/g;
const DAU = "\u0000TEN\u0000";

const dong = [];
function ghi(dat, chu) {
	dong.push(dat);
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], {
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	}).trim();
}

function gitThu(...doi) {
	try {
		return git(...doi);
	} catch {
		return "";
	}
}

export function chuan(s) {
	return s.replace(TEN, DAU);
}

function giaiRef(cauHinh, ref) {
	if (!ref?.startsWith("config:")) return ref;
	let nut = cauHinh;
	for (const k of ref.slice("config:".length).split(".")) nut = nut?.[k];
	if (nut === undefined || nut === null || nut instanceof Object) {
		throw new Error(`khong giai duoc ${ref}`);
	}
	return String(nut);
}

export function tepTrongLenh(lenh) {
	const cwds = [
		".",
		...[...lenh.matchAll(/\bcd\s+([^\s&;"']+)\s*&&/g)].map((m) => m[1]),
	];
	return [
		...lenh.matchAll(
			/(?:\.\/|\.\.\/)?[\w@./()[\]-]+\.(?:tsx?|mjs|cjs|sh|json)\b/g,
		),
	]
		.map((a) => a[0])
		.flatMap((f) => [...cwds.map((c) => join(c, f)), f])
		.map((f) => f.replace(/^\.\//, ""))
		.filter((f) => existsSync(join(GOC, f)))
		.filter((f) => LA_THUOC.test(f));
}

function hoSoDaKy() {
	return git("ls-files", "_acceptance/*/contract.md")
		.split("\n")
		.filter(Boolean)
		.map((t) => t.split("/")[1])
		.filter((slug) => {
			const c = readFileSync(
				join(GOC, "_acceptance", slug, "contract.md"),
				"utf8",
			);
			return (
				slug !== VONG_NAY && DA_KY.has(c.match(/^status:\s*(\S+)/m)?.[1] ?? "")
			);
		});
}

export function tepThuocBiCham(doi) {
	const cauHinh = Bun.YAML.parse(
		readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
	);
	const daKy = hoSoDaKy();
	const tepThuoc = new Set();
	for (const slug of daKy) {
		const tepEvals = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(tepEvals)) continue;
		const { parseEvals } = yeuCau(join(GOC, "lib", "eval-yaml.cjs"));
		for (const ev of parseEvals(readFileSync(tepEvals, "utf8"), [
			"executor",
			"cmd",
			"status",
		])) {
			if (!LAN_MAY.has(ev.executor) || ev.status === "not-run") continue;
			for (const t of tepTrongLenh(giaiRef(cauHinh, ev.cmd))) tepThuoc.add(t);
		}
	}
	const cuaHoSo = (t) =>
		daKy.some((s) => t.startsWith(`_acceptance/${s}/`)) &&
		!VAT_CONG_GHI.some((ten) => t.endsWith(`/${ten}`));
	return doi.filter((t) => cuaHoSo(t) || tepThuoc.has(t));
}

function hunk(tep, base) {
	const ra = [];
	let cur = null;
	for (const l of gitThu("diff", "-U0", base, "HEAD", "--", tep).split("\n")) {
		if (l.startsWith("@@")) {
			cur = { bo: [], them: [] };
			ra.push(cur);
		} else if (cur && l.startsWith("-") && !l.startsWith("---"))
			cur.bo.push(l.slice(1));
		else if (cur && l.startsWith("+") && !l.startsWith("+++"))
			cur.them.push(l.slice(1));
	}
	return ra;
}

export function catCap(cu, moi) {
	let dau = 0;
	while (dau < cu.length && dau < moi.length && cu[dau] === moi[dau]) dau++;
	let cuoi = 0;
	while (
		cuoi < cu.length - dau &&
		cuoi < moi.length - dau &&
		cu[cu.length - 1 - cuoi] === moi[moi.length - 1 - cuoi]
	)
		cuoi++;
	const chu = /[\p{L}\p{N}_]/u;
	while (dau > 0 && chu.test(cu[dau - 1])) dau--;
	while (cuoi > 0 && chu.test(cu[cu.length - cuoi])) cuoi--;
	return {
		cu: cu.slice(dau, cu.length - cuoi),
		moi: moi.slice(dau, moi.length - cuoi),
	};
}

function trongSanPham(chuoi, ref) {
	if (!chuoi) return false;
	return (
		gitThu(
			"grep",
			"-l",
			"-F",
			"-e",
			chuoi,
			ref,
			"--",
			".",
			":(exclude)*/test/*",
			":(exclude)*.spec.*",
			":(exclude)*.dom.tsx",
			":(exclude)_acceptance",
		) !== ""
	);
}

export function dongHopLe(d, base) {
	if (!LOAI.has(d.loai)) return `loai la «${d.loai}»`;
	if (!/\bCRM\b/.test(d.dongCu ?? "") && !/\bCRM\b/.test(d.cu ?? "")) {
		return "cu khong mang CRM";
	}
	if (d.loai === "the-ten") {
		return chuan(d.dongCu) === chuan(d.dongMoi)
			? null
			: "the-ten nhung ca dong khac nhau ngoai ten";
	}
	if (d.loai === "chuoi-that") {
		if (chuan(d.cu) === DAU) return "chuoi-that ma cu chi la ten tran";
		return trongSanPham(d.cu, base) && trongSanPham(d.moi, "HEAD")
			? null
			: "chuoi-that khong co trong ma san pham";
	}
	return d.ly?.trim() ? null : "neo-lai khong ghi ly do";
}

function khoa(d) {
	return `${d.tep}\u0000${d.dongCu}\u0000${d.dongMoi}`;
}

export function rutCap(thuocBiCham, base) {
	const cap = [];
	const lech = [];
	for (const tep of thuocBiCham) {
		if (!existsSync(join(GOC, tep))) {
			lech.push(`${tep} bi xoa`);
			continue;
		}
		if (!gitThu("ls-tree", base, "--", tep)) continue;
		const thayThe = THAY_THE.find((x) => x.tep === tep);
		for (const h of hunk(tep, base)) {
			const la = [...h.bo, ...h.them].join("\n");
			if (thayThe?.ma.some((m) => la.includes(m))) continue;
			if (h.bo.length !== h.them.length) {
				lech.push(
					`${tep} (${h.bo.length} dong bo, ${h.them.length} dong them)`,
				);
				continue;
			}
			for (const [i, cu] of h.bo.entries()) {
				cap.push({
					tep,
					dongCu: cu,
					dongMoi: h.them[i],
					...catCap(cu, h.them[i]),
				});
			}
		}
	}
	return { cap, lech };
}

function doiChung(base) {
	const { parseEvals } = yeuCau(join(GOC, "lib", "eval-yaml.cjs"));
	const mau = join(GOC, "_acceptance", "no-sau-luot-5-okr", "evals.yaml");
	if (existsSync(mau)) {
		const doc = parseEvals(readFileSync(mau, "utf8"), ["executor", "cmd"]);
		const coLenh = doc.some((e) => e.cmd.startsWith("config:"));
		ghi(
			coLenh,
			`doi chung bo doc cua kit: doc duoc ${doc.length} eval tu evals.yaml Bun.YAML tu choi`,
		);
	}
	const tuDo = hoSoDaKy().includes(VONG_NAY);
	ghi(
		!tuDo,
		`doi chung vong nay ${tuDo ? "BI TINH" : "khong tinh"} la ho so da ky`,
	);
	const nho = catCap("expect(n).toBe(2);", "expect(n).toBe(3);");
	ghi(
		dongHopLe(
			{ loai: "chuoi-that", ...nho, dongCu: "expect(n).toBe(2);" },
			base,
		) !== null,
		`doi chung nhat nho so «${nho.cu}» -> «${nho.moi}» bi loai`,
	);
	ghi(
		dongHopLe(
			{
				loai: "chuoi-that",
				cu: "CRM",
				moi: "OneHub Center đọc",
				dongCu: "CRM",
			},
			base,
		) !== null,
		"doi chung ten tran «CRM» -> «OneHub Center đọc» loai chuoi-that bi loai",
	);
	const lenh =
		'bun run test -- "cd apps/agent && bun test test/noi-zalo-cho-nguoi-moi.integration.spec.ts"';
	const bat = tepTrongLenh(lenh).includes(
		"apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts",
	);
	ghi(
		bat,
		`doi chung lenh cd giua chuoi: ${bat ? "bat duoc" : "BO SOT"} tep thuoc`,
	);
}

function gopLuot() {
	const mocChung = git("merge-base", "HEAD", "origin/onehub");
	return gitThu(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		mocChung,
		"--",
		HOP_DONG_LUOT,
	)
		.split("\n")
		.at(-1);
}

function doTaiCommitGop(gop) {
	const tam = mkdtempSync(join(tmpdir(), "dtoc-gop-"));
	rmSync(tam, { recursive: true, force: true });
	git("worktree", "add", "--detach", tam, gop);
	try {
		const ra = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
			stdio: "inherit",
			env: {
				...process.env,
				DTOC_GOC: tam,
				DTOC_NEN: git("rev-parse", `${gop}^1`),
			},
		});
		return ra.status ?? 2;
	} finally {
		git("worktree", "remove", "--force", tam);
	}
}

export function main() {
	if (process.env.DTOC_NEN === undefined) {
		const gop = gopLuot();
		if (gop) {
			console.log(
				`LUOT DA GOP o ${gop}: do tai commit gop, nen la cha thu nhat cua no`,
			);
			process.exit(doTaiCommitGop(gop));
		}
	}
	const base =
		process.env.DTOC_NEN ?? git("merge-base", "HEAD", "origin/onehub");
	const doi = git("diff", "--name-only", base, "HEAD")
		.split("\n")
		.filter(Boolean);
	const thuoc = tepThuocBiCham(doi);
	console.log(`TEP THUOC ${thuoc.length}: ${thuoc.join(" ")}`);
	doiChung(base);

	const { cap, lech } = rutCap(thuoc, base);
	for (const l of lech) ghi(false, `the: ${l} — khong phai phep the tung dong`);

	const bang = JSON.parse(readFileSync(BANG, "utf8"));
	const khai = new Map(bang.map((d) => [khoa(d), d]));
	const thay = new Set(cap.map(khoa));
	for (const c of cap) {
		const d = khai.get(khoa(c));
		if (!d) {
			ghi(false, `chua khai: ${c.tep}: «${c.cu}» -> «${c.moi}»`);
			continue;
		}
		const loi = dongHopLe(d, base);
		ghi(
			loi === null,
			loi === null
				? `cap ${d.loai} ${c.tep}: «${c.cu}» -> «${c.moi}»`
				: `bang the: «${c.cu}» -> «${c.moi}» (${c.tep}) — ${loi}`,
		);
	}
	for (const d of bang) {
		if (!thay.has(khoa(d)))
			ghi(false, `thua trong bang: ${d.tep}: «${d.cu}» -> «${d.moi}»`);
	}

	const so = readFileSync(
		join(GOC, "_acceptance/doi-ten-onehub-center/decisions.jsonl"),
		"utf8",
	)
		.split("\n")
		.filter(Boolean)
		.map((l) => JSON.parse(l).supersedes)
		.filter(Boolean);
	for (const ma of [...THAY_THE.map((x) => x.so), ...SO_THAY_THE_KHAC]) {
		ghi(
			so.includes(ma),
			so.includes(ma)
				? `thay the ${ma} co dong supersedes`
				: `thay the khong co so: ${ma}`,
		);
	}

	const sai = dong.filter((d) => !d).length;
	console.log(`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI`);
	console.log(`EXIT ${sai ? 1 : 0}`);
	process.exit(sai ? 1 : 0);
}

if (import.meta.main) {
	try {
		main();
	} catch (loi) {
		console.log(`KHONG DO DUOC: ${loi.message}`);
		console.log("EXIT 2");
		process.exit(2);
	}
}
