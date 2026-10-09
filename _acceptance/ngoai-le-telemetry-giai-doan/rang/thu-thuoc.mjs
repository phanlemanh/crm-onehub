import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const THUOC = "_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs";
const ALLOWLIST = "packages/telemetry/src/allowlist.ts";
const THU_MUC = [
	"apps/api/src",
	"apps/agent/agent",
	"apps/app/app",
	"apps/app/components",
	"apps/app/lib",
	"packages/db/src",
	"packages/telemetry/src",
];
const TRU = [
	/^packages\/db\/src\/generated\//,
	/^packages\/db\/src\/giai-doan\.ts$/,
	/^apps\/app\/app\/proto\//,
	/^apps\/api\/src\/generated\//,
];

const DOT_BIEN = {
	"bo-telemetry": [['\t"packages/telemetry/src",\n', ""]],
	"nuot-tep": [
		["const TRU = [\n", "const TRU = [\n\t/^packages\\/telemetry\\/src\\/allowlist\\.ts$/,\n"],
	],
	"tu-dau": [
		[
			"for (const khop of d.matchAll(mau)) {",
			"for (const khop of [d.match(new RegExp(mau.source))].filter(Boolean)) {",
		],
	],
	"theo-tep-khong": [
		[
			"const duoc = CHO_PHEP.get(t) ?? new Set();",
			'const duoc = t.startsWith("packages/telemetry/src/") ? new Set(["GIAI_DOAN_GOC"]) : new Set();',
		],
	],
};

function co(ten) {
	const i = process.argv.indexOf(ten);
	return i > 0 ? process.argv[i + 1] : undefined;
}

function git(...a) {
	return execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
}

function nguonThuoc() {
	const goc = readFileSync(path.join(GOC, THUOC), "utf8");
	const ten = co("--dot-bien");
	if (!ten) return goc;
	const buoc = DOT_BIEN[ten];
	if (!buoc) throw new Error(`dot bien la: ${ten}`);
	let s = goc;
	for (const [a, b] of buoc) {
		if (!s.includes(a)) throw new Error(`dot bien ${ten} khong ap duoc: ${a}`);
		s = s.replace(a, b);
	}
	return s;
}

function banSao(chen) {
	const dich = mkdtempSync(path.join(tmpdir(), "nlt-"));
	const tep = path.join(dich, ".ban-sao.tar");
	execFileSync("git", ["-C", GOC, "archive", "--output", tep, "HEAD", "--", ...THU_MUC, THUOC]);
	execFileSync("tar", ["-x", "-f", tep, "-C", dich]);
	rmSync(tep);
	writeFileSync(path.join(dich, THUOC), nguonThuoc());
	for (const [tep, dong] of chen) appendFileSync(path.join(dich, tep), `\n${dong}\n`);
	execFileSync("git", ["init", "-q"], { cwd: dich });
	execFileSync("git", ["add", "-A"], { cwd: dich });
	return dich;
}

function chay(chen) {
	const dich = banSao(chen);
	try {
		const r = spawnSync("bun", [THUOC], { cwd: dich, encoding: "utf8" });
		const soDong = Object.fromEntries(
			chen.map(([tep]) => [tep, readFileSync(path.join(dich, tep), "utf8").split("\n").length - 1]),
		);
		return { ma: r.status, ra: `${r.stdout}${r.stderr}`, soDong };
	} finally {
		rmSync(dich, { recursive: true, force: true });
	}
}

const loi = [];
const kiem = (dk, thongDiep) => {
	if (!dk) loi.push(thongDiep);
};

function caThat() {
	const tep = git("ls-files", "--", ...THU_MUC)
		.split("\n")
		.filter((t) => /\.(ts|tsx|mjs|js)$/.test(t))
		.filter((t) => !TRU.some((r) => r.test(t)));
	const r = chay([]);
	kiem(r.ma === 0, `thuoc thoat ${r.ma} tren cay that`);
	const n = Number(r.ra.match(/so tep da quet: (\d+)/)?.[1] ?? -1);
	kiem(n === tep.length, `thuoc khong quet packages/telemetry/src (quet ${n}, mong ${tep.length})`);
	const mong = readFileSync(path.join(GOC, ALLOWLIST), "utf8")
		.split("\n")
		.flatMap((d, i) => (d.includes("GIAI_DOAN_GOC") ? [`CHO PHEP ${ALLOWLIST}:${i + 1}: GIAI_DOAN_GOC`] : []));
	const co = r.ra.split("\n").filter((d) => d.startsWith("CHO PHEP "));
	kiem(mong.length > 0, "allowlist.ts khong con dong GIAI_DOAN_GOC nao (doi chung)");
	kiem(JSON.stringify(co) === JSON.stringify(mong), `dong CHO PHEP lech: ${JSON.stringify(co)} != ${JSON.stringify(mong)}`);
	console.log(`that: thoat ${r.ma} · quet ${n}/${tep.length} · CHO PHEP ${co.length}/${mong.length}`);
}

function caDo(ten, chen, mongHong, thongDiep) {
	const lanh = chay([]);
	kiem(lanh.ma === 0, `${ten}: doi chung duong thoat ${lanh.ma}`);
	const r = chay(chen);
	const dong = mongHong.map(([tep, tu]) => `HONG ${tep}:${r.soDong[tep]}: ${tu}`);
	const du = r.ma === 1 && dong.every((d) => r.ra.includes(d));
	kiem(du, `${thongDiep} (thoat ${r.ma}, can ${dong.join(" | ")})`);
	console.log(`${ten}: thoat ${r.ma} · ${du ? "bat duoc" : "LOT"}`);
	return r;
}

function caTaiLieu() {
	const tep = co("--tai-lieu") ?? path.join(GOC, "docs/api.md");
	let md = readFileSync(tep, "utf8");
	if (process.argv.includes("--tai-lieu-dot-bien")) {
		for (const c of ["@crm/telemetry/allowlist", "permittedDealStage", "DEAL_STAGE_KEYS", "deals_by_stage"]) md = md.replaceAll(c, "");
	}
	const i = md.indexOf("## Deal stages are rows");
	kiem(i >= 0, "khong thay muc Deal stages are rows");
	const muc = md.slice(i, md.indexOf("\n## ", i + 3) > 0 ? md.indexOf("\n## ", i + 3) : undefined);
	const gach = muc.split(/\n(?=- )/).filter((g) => g.includes("GIAI_DOAN_GOC"));
	kiem(gach.length === 1, `muc co ${gach.length} gach dau dong ve GIAI_DOAN_GOC`);
	const g = gach[0] ?? "";
	for (const c of ["@crm/telemetry/allowlist", "deals_by_stage", "permittedDealStage", "DEAL_STAGE_KEYS", "allowlist.ts"]) {
		kiem(g.includes(c), `tai lieu thieu ngoai le telemetry: ${c}`);
	}
	kiem(!g.replace(/\s+/g, " ").includes("for the seed and tests only — product"), "tai lieu con cau seed and tests only dung mot minh");
	console.log(`tai-lieu: ${gach.length} gach`);
}

function caGhim() {
	const log = readFileSync(co("--run-log") ?? path.join(GOC, "_acceptance/giai-doan-thoa-thuan/run-log.jsonl"), "utf8");
	const dong = log
		.split("\n")
		.filter(Boolean)
		.flatMap((d) => {
			try {
				const j = JSON.parse(d);
				return j.kind === "repin" ? [j] : [];
			} catch {
				return [];
			}
		});
	const cuoi = dong.at(-1);
	kiem(Boolean(cuoi), "giai-doan-thoa-thuan chua co dong ghim");
	if (!cuoi) return;
	const bao = readFileSync(path.join(GOC, "_acceptance/giai-doan-thoa-thuan/evidence-report.md"), "utf8");
	kiem(bao.match(/^verified_commit:\s*(\S+)/m)?.[1] === cuoi.sha, "sha dong ghim khac verified_commit");
	let thuocLuc = "";
	try {
		thuocLuc = git("show", `${cuoi.sha}:${THUOC}`);
	} catch {
		thuocLuc = "";
	}
	kiem(thuocLuc === readFileSync(path.join(GOC, THUOC), "utf8").trim(), "ghim cu khong chua thuoc moi");
	const ev = cuoi.evals_exit ?? {};
	kiem("E17" in ev, "dong ghim khong co E17");
	kiem(Object.values(ev).every((m) => m === 0), `eval khong dat: ${JSON.stringify(ev)}`);
	kiem((cuoi.suites_exit ?? []).length > 0 && cuoi.suites_exit.every((m) => m === 0), "suite khong dat");
	console.log(`ghim-gdtt: ${cuoi.run_id} · sha ${String(cuoi.sha).slice(0, 9)}`);
}

const ca = co("--ca");
if (ca === "that") caThat();
else if (ca === "chu-telemetry") {
	caDo("chu-telemetry", [["packages/telemetry/src/events.ts", 'const x = "CLOSED_WON";']], [["packages/telemetry/src/events.ts", "CLOSED_WON"]], "thuoc khong bat CLOSED_WON trong telemetry");
} else if (ca === "chu-allowlist") {
	caDo("chu-allowlist", [[ALLOWLIST, 'if (id === "CLOSED_WON") return id;']], [[ALLOWLIST, "CLOSED_WON"]], "ngoai le nuot ca tep allowlist.ts");
	const r = caDo(
		"cung-dong",
		[[ALLOWLIST, 'export const w = Object.values(GIAI_DOAN_GOC).find((c) => c === "CLOSED_WON");']],
		[[ALLOWLIST, "CLOSED_WON"]],
		"ngoai le theo dong khong theo tu",
	);
	kiem(r.ra.includes(`CHO PHEP ${ALLOWLIST}:${r.soDong[ALLOWLIST]}: GIAI_DOAN_GOC`), "ngoai le theo dong khong theo tu (thieu CHO PHEP cung dong)");
} else if (ca === "ten-ngoai") {
	caDo("ten-telemetry", [["packages/telemetry/src/index.ts", "export const y = GIAI_DOAN_GOC;"]], [["packages/telemetry/src/index.ts", "GIAI_DOAN_GOC"]], "ngoai le khong theo tep");
	caDo("chu-api", [["apps/api/src/telemetry/rollup.service.ts", 'const z = "DEMO_BOOKED";']], [["apps/api/src/telemetry/rollup.service.ts", "DEMO_BOOKED"]], "phan quet cu yeu di (DEMO_BOOKED o api)");
	caDo("ten-api", [["apps/api/src/telemetry/rollup.service.ts", "const v = GIAI_DOAN_GOC;"]], [["apps/api/src/telemetry/rollup.service.ts", "GIAI_DOAN_GOC"]], "phan quet cu yeu di (GIAI_DOAN_GOC o api)");
} else if (ca === "tai-lieu") caTaiLieu();
else if (ca === "ghim-gdtt") caGhim();
else {
	console.error(`--ca la: ${ca}`);
	process.exit(2);
}

for (const l of loi) console.error(l);
process.exit(loi.length === 0 ? 0 : 1);
