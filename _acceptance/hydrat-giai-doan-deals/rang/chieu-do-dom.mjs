import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TRUOC_VONG = "6e431a011d1b4cedf21290c0ebbb9df3e420900b";
const TEP_NGAN = "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx";
const TEP_TEST = "apps/app/test/deals-giai-doan-hydrat.dom.tsx";
const CA = {
	e1: [/\+\s+"tone": "neutral",/, /\+\s+"chu": "QUALIFIED_TO_BUY",/],
	e2: [
		/Hydration failed because the server rendered text didn't match the client/,
	],
	e3: [/\+\s+"QUALIFIED_TO_BUY",/],
	e4: [/"khoa": "giaiDoan\.list"/, /\+\s+"coTrongCache": true,/],
};
const LOI_NAP = /SyntaxError|Export named|Cannot find (module|package)/;

let tam = null;
let sao = null;

function don() {
	if (!tam) return;
	try {
		execFileSync("git", ["worktree", "remove", "--force", sao], {
			cwd: GOC,
			stdio: "ignore",
		});
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		execFileSync("git", ["worktree", "prune"], { cwd: GOC, stdio: "ignore" });
	} catch {}
	tam = null;
}

function thoat(ma, ...dong) {
	for (const d of dong) console.log(d);
	don();
	process.exit(ma);
}

const nguonTest = readFileSync(join(GOC, TEP_TEST), "utf8");
const tenCa = [...nguonTest.matchAll(/\btest\(\s*"([^"]+)"/g)].map((m) => m[1]);
for (const ten of tenCa) {
	for (const [ca, ghim] of Object.entries(CA)) {
		if (ghim.some((g) => g.test(ten)))
			thoat(2, `KHONG DO DUOC: ten ca "${ten}" chua chuoi ghim cua ${ca}`);
	}
}
for (const ca of Object.keys(CA)) {
	if (tenCa.filter((t) => t.startsWith(`${ca} `)).length !== 1)
		thoat(2, `KHONG DO DUOC: ${TEP_TEST} khong co dung mot ca "${ca} …"`);
}
const nhapNgan = [
	...nguonTest.matchAll(
		/const \{([^}]*)\} = await import\(\s*"@\/app\/\(app\)\/\[slug\]\/deals\/create-deal-sheet"/g,
	),
].map((m) => m[1].trim());
if (nhapNgan.length !== 1 || nhapNgan[0] !== "CreateDealSheet")
	thoat(
		2,
		`KHONG DO DUOC: tep test phai chi nhap CreateDealSheet tu tep ngan, thay [${nhapNgan.join(" | ")}]`,
	);

function chayCa(cay, ca) {
	const kq = spawnSync(
		"bun",
		[
			"test",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			"./test/deals-giai-doan-hydrat.dom.tsx",
			"-t",
			`${ca} `,
		],
		{
			cwd: join(cay, "apps", "app"),
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
			encoding: "utf8",
		},
	);
	return { ma: kq.status ?? 1, ra: `${kq.stdout ?? ""}${kq.stderr ?? ""}` };
}

tam = mkdtempSync(join(tmpdir(), "hgd-chieu-do-dom-"));
sao = join(tam, "crm");
let ma = 2;
process.on("SIGINT", () => thoat(130));
process.on("SIGTERM", () => thoat(143));

try {
	let banCu;
	try {
		banCu = execFileSync("git", ["show", `${TRUOC_VONG}:${TEP_NGAN}`], {
			cwd: GOC,
			encoding: "utf8",
		});
	} catch {
		thoat(2, `KHONG DO DUOC: khong doc duoc ${TEP_NGAN} o ${TRUOC_VONG}`);
	}
	execFileSync("git", ["worktree", "add", "--detach", "--quiet", sao, "HEAD"], {
		cwd: GOC,
		stdio: "inherit",
	});
	writeFileSync(join(sao, TEP_TEST), nguonTest);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(sao, ".env"));
	const cai = spawnSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: sao,
		stdio: "inherit",
	});
	if (cai.status !== 0)
		thoat(2, "KHONG DO DUOC: bun install trong ban sao hong");

	const hongDuong = [];
	for (const ca of Object.keys(CA)) {
		const { ma: m, ra } = chayCa(sao, ca);
		if (m !== 0 || !/^\s*1 pass$/m.test(ra) || !/^\s*0 fail$/m.test(ra))
			hongDuong.push(`${ca} ma ${m}`);
		console.log(`doi chung duong ${ca}: ma ${m}`);
	}
	if (hongDuong.length > 0)
		thoat(1, `ban sao do sai truoc khi pha: ${hongDuong.join(", ")}`);

	const tep = join(sao, TEP_NGAN);
	if (readFileSync(tep, "utf8") === banCu)
		thoat(2, "KHONG DO DUOC: tep ngan o HEAD trung ban truoc vong");
	writeFileSync(tep, banCu);

	const dung = [];
	const lot = [];
	for (const [ca, ghim] of Object.entries(CA)) {
		const { ma: m, ra } = chayCa(sao, ca);
		if (LOI_NAP.test(ra))
			thoat(2, `KHONG DO DUOC: ${ca} loi nap — ${ra.match(LOI_NAP)?.[0]}`);
		const failDungCa = new RegExp(`\\(fail\\) .*> ${ca} `).test(ra);
		const thieu = ghim.filter((g) => !g.test(ra)).map(String);
		console.log(
			`chieu do ${ca}: ma ${m} · fail dung ca ${failDungCa} · thieu ghim ${thieu.length === 0 ? "-" : thieu.join(" ")}`,
		);
		if (m !== 0 && failDungCa && thieu.length === 0) dung.push(ca);
		else lot.push(ca);
	}
	if (lot.length > 0) {
		for (const ca of lot) console.log(`LOT: ${ca}`);
		ma = 1;
	} else {
		console.log(`DO DUNG GHIM: ${dung.join(" ")}`);
		ma = 0;
	}
} finally {
	don();
}
process.exit(ma);
