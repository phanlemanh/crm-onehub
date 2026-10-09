import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TEP = ".github/workflows/ci.yml";
const KHO = "phanlemanh/crm-onehub";
const LUOT_323 = ["37860355090", "37862221635"];

function goiCoTest() {
	const ws =
		JSON.parse(readFileSync(join(GOC, "package.json"), "utf8")).workspaces ??
		[];
	const ra = new Set();
	for (const mau of ws) {
		if (!mau.endsWith("/*"))
			throw new Error(`workspace «${mau}» khong phai dang <thu muc>/*`);
		const cha = join(GOC, mau.slice(0, -2));
		for (const d of readdirSync(cha, { withFileTypes: true })) {
			const pj = join(cha, d.name, "package.json");
			if (!d.isDirectory() || !existsSync(pj)) continue;
			const goi = JSON.parse(readFileSync(pj, "utf8"));
			if (goi.scripts?.test) ra.add(goi.name);
		}
	}
	return ra;
}

function quaDuongCi(loc) {
	const r = spawnSync("bash", ["-c", `bun run test -- ${loc} --dry=json`], {
		cwd: GOC,
		encoding: "utf8",
	});
	const dong = (r.stdout ?? "").split("\n");
	const dau = dong.findIndex((d) => d === "{");
	const cuoi = dong.lastIndexOf("}");
	if (r.status !== 0 || dau === -1 || cuoi < dau)
		throw new Error(
			`duong CI \`bun run test -- ${loc} --dry=json\` ma ${r.status}, khong co JSON`,
		);
	const j = JSON.parse(dong.slice(dau, cuoi + 1).join("\n"));
	return new Set(
		j.tasks.filter((t) => t.task === "test").map((t) => t.package),
	);
}

function quaLog323(oTen) {
	const ra = new Set();
	for (const run of LUOT_323) {
		const jobs = JSON.parse(
			execFileSync("gh", ["api", `repos/${KHO}/actions/runs/${run}/jobs`], {
				encoding: "utf8",
			}),
		).jobs;
		const job = jobs.find((j) => j.name === `test (${oTen})`);
		if (!job) throw new Error(`luot ${run} khong co job test (${oTen})`);
		const log = execFileSync(
			"gh",
			["api", `repos/${KHO}/actions/jobs/${job.id}/logs`],
			{
				encoding: "utf8",
				maxBuffer: 256 * 1024 * 1024,
			},
		);
		for (const m of log.matchAll(/##\[group\](@?[a-z][\w@/-]*):test\s*$/gm))
			ra.add(m[1]);
	}
	return ra;
}

function phanHoach(ma, coTest, laySo) {
	const loi = [];
	const o = ma.map(([ten, loc]) => ({ ten, loc, goi: laySo(ten, loc) }));
	for (const x of o)
		if (
			x.ten === "con-lai" &&
			x.loc
				.split(/\s+/)
				.some((f) => f.startsWith("--filter=") && !f.startsWith("--filter=!"))
		)
			loi.push("con-lai co bo loc duong");
	for (const g of coTest) {
		const noi = o.filter((x) => x.goi.has(g)).map((x) => x.ten);
		if (noi.length === 0) loi.push(`${g} khong o o nao`);
		if (noi.length > 1) loi.push(`${g} o hai o: ${noi.join(", ")}`);
	}
	return { loi, o };
}

const maTran = (chu) =>
	(Bun.YAML.parse(chu).jobs?.test?.strategy?.matrix?.o ?? []).map((x) => [
		x.ten,
		x.loc,
	]);

const coTest = goiCoTest();
const that = readFileSync(join(GOC, TEP), "utf8");
const hong = [];
const ciNho = new Map();
const quaCi = (ten, loc) => {
	if (!ciNho.has(loc)) ciNho.set(loc, quaDuongCi(loc));
	return ciNho.get(loc);
};

const a = phanHoach(maTran(that), coTest, quaCi);
for (const x of a.o)
	console.log(`duong CI · ${x.ten}: ${[...x.goi].sort().join(" ")}`);
hong.push(...a.loi.map((l) => `duong CI: ${l}`));
const b = phanHoach(maTran(that), coTest, (ten) => quaLog323(ten));
for (const x of b.o)
	console.log(`log #323 · ${x.ten}: ${[...x.goi].sort().join(" ")}`);
hong.push(...b.loi.map((l) => `log #323: ${l}`));

const chieuDo = [
	{
		ten: "app-ui chi con --filter=app",
		chu: that.replace(
			"loc: --filter=app --filter=@crm/ui",
			"loc: --filter=app",
		),
		can: "@crm/ui khong o o nao",
	},
	{
		ten: "bo o api",
		chu: that.replace(/\n\s+- ten: api\n\s+loc: --filter=api/, ""),
		can: "api khong o o nao",
	},
	{
		ten: "con-lai them --filter=agent",
		chu: that.replace(
			"loc: --filter=!api --filter=!app --filter=!@crm/ui",
			"loc: --filter=!api --filter=!app --filter=!@crm/ui --filter=agent",
		),
		can: "con-lai co bo loc duong",
	},
];
for (const c of chieuDo) {
	if (c.chu === that) {
		hong.push(`chieu do ${c.ten}: khong tao duoc ban sao`);
		continue;
	}
	const { loi } = phanHoach(maTran(c.chu), coTest, quaCi);
	const bat = loi.some((l) => l.includes(c.can));
	console.log(
		`chieu do ${c.ten}: ${bat ? "DO dung cho" : "KHONG BAT"} — ${loi.join("; ") || "0 loi"}`,
	);
	if (!bat) hong.push(`chieu do ${c.ten}: khong bat «${c.can}»`);
}
if (hong.length > 0) {
	console.error(hong.join("\n"));
	process.exit(1);
}
console.log(
	`phu-goi: ${coTest.size} goi co test, moi goi dung mot o qua duong CI va qua log #323; ba chieu do dung cho`,
);
