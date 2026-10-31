import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC_TEST = join(GOC, "apps", "api", "test");
const NHAN = `f37-${process.pid}`;
const tam = [];

const MOI = `import { test } from "bun:test";
import { db } from "@crm/db";
import { gieoViecMau } from "@crm/db/viec-gieo";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { moXuong } from "./support/ke-hoach-gieo";

const run = process.env.TEST_RUN_ID ?? "local";

test("f37-moi: de lai chu so huu mang TEST_RUN_ID va viec mau giao cho ho", async () => {
	await moXuong();
	const now = new Date();
	for (const [id, email, vai, luc] of [
		[\`dev-moi-\${run}\`, \`\${run}-moi@localhost\`, "owner", "2000-01-01T00:00:00Z"],
		[\`dev-moi-lam-\${run}\`, \`\${run}-moi-lam@localhost\`, "member", "2000-01-02T00:00:00Z"],
	]) {
		await db.user.create({ data: { id, email, name: id, emailVerified: true, createdAt: now, updatedAt: now } });
		await db.member.create({ data: { id: \`m-\${id}\`, organizationId: WORKSPACE_ID, userId: id, role: vai, createdAt: new Date(luc) } });
	}
	await gieoViecMau(db, { databaseUrl: process.env.TEST_DATABASE_URL ?? "", nguon: "TEST_DATABASE_URL", now });
	const viec = await db.viec.count({ where: { nguoiGiaoId: \`dev-moi-\${run}\` } });
	if (viec === 0) throw new Error("f37-moi: gieoViecMau khong giao viec nao cho chu so huu moi");
});
`;

const DEM_MOI = `const { db } = await import("@crm/db");
const run = process.env.TEST_RUN_ID;
const n = await db.user.count({ where: { id: \`dev-moi-\${run}\` } });
const g = await db.user.count({ where: { email: \`\${run}-grant-needed@localhost\` } });
console.log(\`DEM moi=\${n} grant=\${g}\`);
await db.$disconnect();
`;

function ghiTam(ten, noiDung) {
	const p = join(THU_MUC_TEST, `${NHAN}-${ten}.spec.ts`);
	writeFileSync(p, noiDung);
	tam.push(p);
	return `./test/${NHAN}-${ten}.spec.ts`;
}

function banPha(tep, cu, moi) {
	const goc = readFileSync(join(THU_MUC_TEST, tep), "utf8");
	const n = goc.split(cu).length - 1;
	if (n !== 1) throw new Error(`ban pha ${tep}: khop ${n} lan, can 1`);
	return ghiTam(tep.replace(/\.spec\.ts$/, "-pha"), goc.replace(cu, moi));
}

function chayKho(tep, loc) {
	const dem = join(THU_MUC_TEST, `${NHAN}-dem.mjs`);
	writeFileSync(dem, DEM_MOI);
	if (!tam.includes(dem)) tam.push(dem);
	const lenh = [
		"cd apps/api",
		"export CRM_TELEMETRY_DISABLED=1",
		`bun test --preload ./test/setup.ts ${tep.join(" ")} -t '${loc}'; ma=$?`,
		`DATABASE_URL="$TEST_DATABASE_URL" bun ./test/${NHAN}-dem.mjs`,
		'echo "MA_BUN $ma"',
	].join(" && ");
	const r = spawnSync("bun", ["packages/db/scripts/test-run.ts", lenh], {
		cwd: GOC,
		encoding: "utf8",
	});
	const ra = `${r.stdout}${r.stderr}`;
	const ma = Number(/MA_BUN (\d+)/.exec(ra)?.[1] ?? -1);
	const dem2 = /DEM moi=(\d+) grant=(\d+)/.exec(ra);
	return {
		ma,
		ra,
		moi: Number(dem2?.[1] ?? -1),
		grant: Number(dem2?.[2] ?? -1),
	};
}

const loi = [];
function ca(ten, dat, r) {
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten}`);
	if (!dat) {
		console.log(r.ra.slice(-2500));
		loi.push(ten);
	}
}
const xanh = (r) => r.ma === 0 && /\b0 fail\b/.test(r.ra);

try {
	const moi = ghiTam("moi", MOI);

	const mkl = chayKho([moi, "./test/mat-khau-lien-ket.spec.ts"], ".");
	ca(
		"mkl-lanh: sau moi ro ri, mat-khau-lien-ket xanh va khong xoa nguoi dung cua tep khac",
		xanh(mkl) && mkl.moi === 1,
		mkl,
	);
	const mklPha = banPha(
		"mat-khau-lien-ket.spec.ts",
		'const suffix = `mkl-${process.env.TEST_RUN_ID ?? "local"}`;',
		'const suffix = process.env.TEST_RUN_ID ?? "mat-khau-lien-ket";',
	);
	const mklDo = chayKho([moi, mklPha], ".");
	ca(
		"mkl-pha: tien to chung TEST_RUN_ID thi moc don do o khoa ngoai viec_nguoiGiaoId_fkey",
		mklDo.ma !== 0 && mklDo.ra.includes("viec_nguoiGiaoId_fkey"),
		mklDo,
	);

	const vaiLanh = chayKho(["./test/vai-chi-okr.spec.ts"], "gan-vai");
	ca(
		"vai-lanh: khong co chu so huu sot thi gan-vai xanh",
		xanh(vaiLanh),
		vaiLanh,
	);
	const vaiDo = chayKho([moi, "./test/vai-chi-okr.spec.ts"], "f37-moi|gan-vai");
	ca(
		"vai-do: co chu so huu sot thi gan-vai do va goi ten tien de",
		vaiDo.ma !== 0 &&
			vaiDo.ra.includes("(fail) vai-chi-okr > gan-vai") &&
			vaiDo.ra.includes("chu phai la chu so huu duy nhat") &&
			vaiDo.ra.includes(`dev-moi-`),
		vaiDo,
	);

	const dgt = chayKho(
		[moi, "./test/du-an-do-nguong.spec.ts"],
		"f37-moi|dgt-thuoc",
	);
	ca("dgt-lanh: co thanh vien sot som hon, dgt-thuoc van xanh", xanh(dgt), dgt);
	const dgtPha = banPha(
		"du-an-do-nguong.spec.ts",
		"for (const [i, n] of [n1, n2].entries()) {",
		"for (const [i, n] of [].entries()) {",
	);
	const dgtDo = chayKho([moi, dgtPha], "f37-moi|dgt-thuoc");
	ca(
		"dgt-pha: bo buoc dua n1 n2 len dau thi dgt-thuoc do dung ly do cu",
		dgtDo.ma !== 0 &&
			dgtDo.ra.includes("(fail) dgt-thuoc") &&
			dgtDo.ra.includes("gieo mau chon thanh vien som nhat cua kho chung"),
		dgtDo,
	);

	const dev = chayKho(["./test/dev-grant-needed.spec.ts"], ".");
	ca(
		"dev-lanh: dev-grant-needed xanh va khong de lai nguoi dung",
		xanh(dev) && dev.grant === 0,
		dev,
	);
	const devPha = banPha(
		"dev-grant-needed.spec.ts",
		"afterAll(async () => {",
		'test.skip("f37-pha", async () => {',
	);
	const devDo = chayKho([devPha], ".");
	ca(
		"dev-pha: bo afterAll thi con dung mot nguoi dung grant-needed",
		devDo.grant === 1,
		devDo,
	);
} finally {
	for (const p of tam) rmSync(p, { force: true });
}

if (loi.length) {
	console.log(`TRUOT ${loi.length} ca: ${loi.join(", ")}`);
	process.exit(1);
}
console.log("DAT tat ca");
