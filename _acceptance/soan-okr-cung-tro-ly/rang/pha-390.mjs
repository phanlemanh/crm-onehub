import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
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

const PHA_390 = {
	tienToTam: "soan-pha-390-",
	man: "apps/app/app/(app)/[slug]/okr/soan/man-soan.tsx",
	chepSang: [
		"apps/app/test/soan-okr.dom.tsx",
		"apps/app/test/kieu-that.ts",
		"apps/app/test/khung-soan-okr.tsx",
	],
	bai: "./test/soan-okr.dom.tsx",
	ca: "ngăn soạn ở 390 px",
	tenCa: "ngăn soạn ở 390 px: thanh tab và trò chuyện không giãn quá ngăn",
	moc: '<TabsList aria-label={m.man.tabs} className="w-full">',
	pha: [
		{
			ten: "bo-thanh-tab",
			ghim: "ngan soan o 390px: khong thay thanh tab Tro chuyen/Ban nhap dang hien",
			doi: (c) => c.replace(/\n\t*<TabsList[\s\S]*?<\/TabsList>/, ""),
		},
		{
			ten: "thanh-tab-tran",
			ghim: "ngan soan o 390px: thanh tab hoac khung tro chuyen rong hon ngan",
			doi: (c) =>
				c.replace(
					PHA_390.moc,
					'<TabsList aria-label={m.man.tabs} className="w-full min-w-[480px]">',
				),
		},
	],
	loiNap: /SyntaxError|Export named|Cannot find (module|package)/,
};

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

function chay() {
	const kq = spawnSync(
		"bun",
		[
			"test",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			PHA_390.bai,
			"-t",
			PHA_390.ca,
		],
		{
			cwd: join(sao, "apps", "app"),
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
			encoding: "utf8",
		},
	);
	return { ma: kq.status ?? 1, ra: `${kq.stdout ?? ""}${kq.stderr ?? ""}` };
}

process.on("SIGINT", () => thoat(130));
process.on("SIGTERM", () => thoat(143));

const nguonMan = readFileSync(join(GOC, PHA_390.man), "utf8");
if (!nguonMan.includes(PHA_390.moc))
	thoat(2, `KHONG DO DUOC: ${PHA_390.man} khong con moc thanh tab`);
const nguonBai = readFileSync(join(GOC, PHA_390.chepSang[0]), "utf8");
for (const p of PHA_390.pha)
	if (!nguonBai.includes(p.ghim))
		thoat(2, `KHONG DO DUOC: bai 390 khong con cau ghim cua ${p.ten}`);

tam = mkdtempSync(join(tmpdir(), PHA_390.tienToTam));
sao = join(tam, "crm");
let ma = 2;
try {
	execFileSync("git", ["worktree", "add", "--detach", "--quiet", sao, "HEAD"], {
		cwd: GOC,
		stdio: "inherit",
	});
	for (const t of PHA_390.chepSang) cpSync(join(GOC, t), join(sao, t));
	writeFileSync(join(sao, PHA_390.man), nguonMan);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(sao, ".env"));
	const cai = spawnSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: sao,
		stdio: "inherit",
	});
	if (cai.status !== 0)
		thoat(2, "KHONG DO DUOC: bun install trong ban sao hong");

	const lanh = chay();
	const lanhXanh =
		lanh.ma === 0 &&
		/^\s*1 pass$/m.test(lanh.ra) &&
		/^\s*0 fail$/m.test(lanh.ra);
	console.log(`doi chung lanh: ma ${lanh.ma} · ${lanhXanh ? "XANH" : "DO"}`);
	if (!lanhXanh)
		thoat(1, lanh.ra.slice(-1500), "ban sao lanh do truoc khi pha");

	const lot = [];
	for (const p of PHA_390.pha) {
		const moi = p.doi(nguonMan);
		if (moi === nguonMan)
			thoat(2, `KHONG DO DUOC: pha ${p.ten} khong doi duoc`);
		writeFileSync(join(sao, PHA_390.man), moi);
		const { ma: m, ra } = chay();
		writeFileSync(join(sao, PHA_390.man), nguonMan);
		if (PHA_390.loiNap.test(ra))
			thoat(
				2,
				`KHONG DO DUOC: ${p.ten} loi nap — ${ra.match(PHA_390.loiNap)?.[0]}`,
			);
		const failDungCa = ra.includes("(fail) ") && ra.includes(PHA_390.tenCa);
		for (const d of ra.split("\n").filter((d) => /^\+ {3}"/.test(d)))
			console.log(`  ${d.trim()}`);
		const bat = m !== 0 && failDungCa && ra.includes(p.ghim);
		console.log(
			`chieu do ${p.ten}: ma ${m} · ${bat ? `DO DUNG GHIM «${p.ghim}»` : "LOT"}`,
		);
		if (!bat) lot.push(p.ten);
	}
	ma = lot.length === 0 ? 0 : 1;
	console.log(
		`KET LUAN pha-390: lanh xanh, chieu do ${PHA_390.pha.length - lot.length}/${PHA_390.pha.length} — ma thoat ${ma}`,
	);
} finally {
	don();
}
process.exit(ma);
