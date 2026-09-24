import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const CHE_DO = process.argv[2];
const BO_THU_MUC = new Set([
	"node_modules",
	"generated",
	".next",
	".output",
	".eve",
	".turbo",
	"dist",
	"test",
]);
const DUOI = /\.(ts|tsx|mjs)$/;
const BO_TEP = /\.(spec|dom|test)\.(ts|tsx|mjs)$/;

const LENH_GHI = [
	/\.department\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(/,
	/(INSERT INTO|UPDATE|DELETE FROM)\s+"department"/i,
];
const THU_TUC_CU =
	/onboarding\.(createDepartment|updateDepartment|reorderDepartments|archiveDepartment|restoreDepartment|purgeDepartment)\b/;
const DUONG_REST_CU = "/onboarding/departments";
const PHUONG_THUC_GHI = /["'`](POST|PATCH|DELETE|PUT)["'`]/;

function tapTep(goc) {
	const r = spawnSync(
		"git",
		["-C", goc, "ls-files", "-z", "apps", "packages"],
		{
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		},
	);
	if (r.status !== 0) {
		console.error(`thuoc rong: git ls-files loi — ${r.stderr}`);
		process.exit(2);
	}
	return r.stdout
		.split("\0")
		.filter(Boolean)
		.filter((t) => DUOI.test(t) && !BO_TEP.test(t))
		.filter((t) => !t.split("/").some((d) => BO_THU_MUC.has(d)))
		.filter(
			(t) => /^apps\/[^/]+\//.test(t) || /^packages\/[^/]+\/src\//.test(t),
		)
		.sort();
}

function quet(goc, tep) {
	const viPham = [];
	let soLenh = 0;
	for (const t of tep) {
		const dong = fs.readFileSync(path.join(goc, t), "utf8").split("\n");
		dong.forEach((d, i) => {
			if (CHE_DO === "api") {
				if (!LENH_GHI.some((r) => r.test(d))) return;
				soLenh += 1;
				if (!t.startsWith("apps/api/src/to-chuc/")) {
					viPham.push(`lenh ghi phong ban ngoai to-chuc: ${t}:${i + 1}`);
				}
				return;
			}
			const lanCan = dong.slice(Math.max(0, i - 3), i + 4).join("\n");
			const goiThuTuc = THU_TUC_CU.test(d);
			const goiRest =
				d.includes(DUONG_REST_CU) &&
				(/\/onboarding\/departments\/(\{|\$\{|[A-Za-z0-9_-]+)/.test(d) ||
					PHUONG_THUC_GHI.test(lanCan));
			if (!goiThuTuc && !goiRest) return;
			soLenh += 1;
			viPham.push(
				t.startsWith("apps/app/app/(app)/[slug]/settings/organization/")
					? `man web goi duong ghi cu: ${t}:${i + 1}`
					: `goi duong ghi cu ngoai man To chuc: ${t}:${i + 1}`,
			);
		});
	}
	return { viPham, soLenh };
}

function inSoTep(tep) {
	const theoApp = new Map();
	for (const t of tep) {
		const k = t.split("/").slice(0, 2).join("/");
		theoApp.set(k, (theoApp.get(k) ?? 0) + 1);
	}
	return theoApp;
}

function guong(tep, chen) {
	const tam = fs.mkdtempSync(path.join(os.tmpdir(), "mot-cho-ghi-"));
	for (const t of tep) {
		const dich = path.join(tam, t);
		fs.mkdirSync(path.dirname(dich), { recursive: true });
		fs.copyFileSync(path.join(GOC, t), dich);
	}
	for (const [t, dong] of chen) {
		fs.appendFileSync(path.join(tam, t), `\n${dong}\n`);
	}
	return tam;
}

if (CHE_DO !== "api" && CHE_DO !== "app") {
	console.error("mot-cho-ghi: can che do api hoac app");
	process.exit(2);
}

const tep = tapTep(GOC);
const soTheoApp = inSoTep(tep);
for (const [k, n] of soTheoApp) console.log(`quet: ${k} ${n} tep`);
if (tep.length === 0 || [...soTheoApp.values()].some((n) => n === 0)) {
	console.error("thuoc rong: khong quet duoc tep nao");
	process.exit(2);
}
const that = quet(GOC, tep);
console.log(
	`quet: ${tep.length} tep, ${that.soLenh} ${CHE_DO === "api" ? "lenh ghi phong ban" : "cho goi duong ghi cu"}`,
);
if (CHE_DO === "api" && that.soLenh === 0) {
	console.error(
		"thuoc rong: khong thay lenh ghi phong ban nao, ke ca trong to-chuc",
	);
	process.exit(2);
}

const CA_DO =
	CHE_DO === "api"
		? [
				{
					tep: "apps/api/src/onboarding/onboarding.service.ts",
					dong: "await this.db.department.update({ where: { id }, data: {} })",
					ghim: "lenh ghi phong ban ngoai to-chuc: apps/api/src/onboarding/onboarding.service.ts",
				},
			]
		: [
				{
					tep: "apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx",
					dong: "trpc.onboarding.archiveDepartment.mutationOptions();",
					ghim: "man web goi duong ghi cu: apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx",
				},
				{
					tep:
						tep.find((t) => t.startsWith("apps/agent/agent/")) ??
						tep.find((t) => t.startsWith("apps/agent/")),
					dong: 'await fetch(api + "/rest/onboarding/departments", { method: "POST" });',
					ghim: "goi duong ghi cu ngoai man To chuc: apps/agent/",
				},
			];
let mu = false;
for (const ca of CA_DO) {
	if (ca.tep === undefined) {
		console.error("thuoc mu: khong co tep nao cua apps/agent de chen chieu do");
		process.exit(2);
	}
	const tam = guong(tep, [[ca.tep, ca.dong]]);
	try {
		const kq = quet(tam, tep);
		const bat = kq.viPham.filter((v) => v.startsWith(ca.ghim));
		console.log(`chieu do ${ca.tep}: bat ${bat.length} vi pham`);
		if (bat.length !== 1 || kq.viPham.length !== that.viPham.length + 1)
			mu = true;
	} finally {
		fs.rmSync(tam, { recursive: true, force: true });
	}
}
if (mu) {
	console.error(
		"thuoc mu: ban guong co vi pham chen vao ma thuoc khong bat dung mot",
	);
	process.exit(2);
}

for (const v of that.viPham) console.error(v);
process.exit(that.viPham.length === 0 ? 0 : 1);
