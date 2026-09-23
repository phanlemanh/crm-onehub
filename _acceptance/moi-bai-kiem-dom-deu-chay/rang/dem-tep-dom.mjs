import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	rmSync,
	symlinkSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GOI = {
	app: {
		rel: "apps/app",
		thuMuc: join(GOC, "apps", "app"),
		lenh: "bun run test:dom",
	},
	ui: {
		rel: "packages/ui",
		thuMuc: join(GOC, "packages", "ui"),
		lenh: "bun run test",
	},
};
const LENH_GOC = "bun run test -- --filter=app --filter=@crm/ui";
const TIEN_TO_TAM = "zz-do-thu-";
const [cheDo, tenGoi] = process.argv.slice(2);
const TEP_TAM = `${TIEN_TO_TAM}${cheDo ?? "x"}-${process.pid}.dom.tsx`;

function chay(lenh, thuMuc, envThem = {}) {
	const r = spawnSync("sh", ["-c", `${lenh} 2>&1`], {
		cwd: thuMuc,
		encoding: "utf8",
		env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1", ...envThem },
		maxBuffer: 64 * 1024 * 1024,
	});
	const ra = r.stdout ?? "";
	const doan = ra.split(/^.*chay-dom: /m).slice(1);
	const tepChay = doan.flatMap((d) => {
		const ten = /^test\/([\w.-]+\.dom\.tsx)/.exec(d)?.[1];
		const soBai = Number(/Ran (\d+) tests? across 1 file/.exec(d)?.[1] ?? 0);
		return ten && soBai > 0 ? [ten] : [];
	});
	const luot = [...ra.matchAll(/Ran (\d+) tests? across (\d+) files?/g)].map(
		(m) => ({ bai: Number(m[1]), tep: Number(m[2]) }),
	);
	return { ma: r.status, ra, tepChay, luot };
}

function tepDom(goi) {
	return readdirSync(join(goi.thuMuc, "test"))
		.filter((t) => t.endsWith(".dom.tsx"))
		.sort();
}

function tepSpec(thuMuc) {
	const r = spawnSync(
		"sh",
		[
			"-c",
			"find . -path ./node_modules -prune -o -type f \\( -name '*.spec.*' -o -name '*.test.*' \\) -print",
		],
		{ cwd: thuMuc, encoding: "utf8" },
	);
	return (r.stdout ?? "").split("\n").filter(Boolean);
}

let guongDangMo = null;
const guongDaDung = [];

function coTep(duong) {
	try {
		lstatSync(duong);
		return true;
	} catch {
		return false;
	}
}

function dungGuong() {
	const T = mkdtempSync(join(tmpdir(), TIEN_TO_TAM));
	const noi = (rel) => {
		for (const e of readdirSync(join(GOC, rel)))
			symlinkSync(join(GOC, rel, e), join(T, rel, e));
	};
	const moRa = (rel) => {
		let cur = "";
		for (const p of rel.split("/")) {
			cur = cur ? `${cur}/${p}` : p;
			if (lstatSync(join(T, cur)).isSymbolicLink()) {
				unlinkSync(join(T, cur));
				mkdirSync(join(T, cur));
				noi(cur);
			}
		}
	};
	const chep = (rel) => {
		unlinkSync(join(T, rel));
		copyFileSync(join(GOC, rel), join(T, rel));
	};
	noi("");
	chep("package.json");
	chep("turbo.json");
	for (const nhom of ["apps", "packages"]) {
		moRa(nhom);
		for (const g of readdirSync(join(GOC, nhom))) {
			if (!coTep(join(GOC, nhom, g, "package.json"))) continue;
			moRa(`${nhom}/${g}`);
			chep(`${nhom}/${g}/package.json`);
			if (coTep(join(GOC, nhom, g, "turbo.json")))
				chep(`${nhom}/${g}/turbo.json`);
		}
	}
	moRa("packages/db/scripts");
	chep("packages/db/scripts/test-run.ts");
	for (const g of Object.values(GOI)) moRa(`${g.rel}/test`);
	return T;
}

function donGuong() {
	if (guongDangMo) rmSync(guongDangMo, { recursive: true, force: true });
	guongDangMo = null;
}

for (const [tinHieu, ma] of [
	["SIGINT", 130],
	["SIGTERM", 143],
]) {
	process.on(tinHieu, () => {
		donGuong();
		process.exit(ma);
	});
}

function voiTepTam(goi, noiDung, lam) {
	const T = dungGuong();
	guongDangMo = T;
	guongDaDung.push(T);
	try {
		writeFileSync(join(T, goi.rel, "test", TEP_TAM), noiDung);
		return lam(T);
	} finally {
		donGuong();
	}
}

const TEP_XANH = `import { expect, test } from "bun:test";
test("tep moi do thu", () => { expect(1).toBe(1); });
`;
const TEP_DO = `import { expect, test } from "bun:test";
test("tep do do thu", () => { expect(1).toBe(2); });
`;
const TEP_MUI_GIO = `import { expect, test } from "bun:test";
test("mui gio do thu", () => {
	expect(new Date(Date.UTC(2026, 0, 1)).getTimezoneOffset()).toBe(-420);
});
`;

const hong = [];
let khang = 0;

function duTep(ten) {
	const goi = GOI[ten];
	const mong = tepDom(goi);
	if (mong.length === 0) {
		console.log(`KHONG DO DUOC: ${ten} khong co tep *.dom.tsx nao`);
		process.exit(2);
	}
	const kq = chay(goi.lenh, goi.thuMuc);
	console.log(
		`${ten}: ${mong.length} tep tren dia, ${kq.tepChay.length} tep da chay, ma ${kq.ma}`,
	);
	for (const t of mong) {
		khang += 1;
		const lan = kq.tepChay.filter((x) => x === t).length;
		if (lan !== 1) hong.push(`${ten}: tep ${t} chay ${lan} lan (thieu tep)`);
	}
	khang += 1;
	if (kq.ma !== 0) hong.push(`${ten}: lenh kiem thoat ma ${kq.ma}`);
	return { mong, kq };
}

if (cheDo === "du-tep") {
	if (!GOI[tenGoi]) {
		console.log("KHONG DO DUOC: goi phai la app hoac ui");
		process.exit(2);
	}
	const { mong, kq } = duTep(tenGoi);
	let ghiChu = `${mong.length} tep + 1 ma thoat`;
	if (tenGoi === "ui") {
		const spec = tepSpec(GOI.ui.thuMuc);
		khang += 1;
		const coLuot = kq.luot.some((l) => l.tep === spec.length && l.bai > 0);
		if (spec.length === 0 || !coLuot)
			hong.push(`ui: ${spec.length} tep spec khong con chay`);
		ghiChu += ` + 1 luot spec (${spec.length} tep)`;
	}
	console.log(`khang-dinh: ${khang} (= ${ghiChu})`);
} else if (cheDo === "tep-moi") {
	for (const ten of ["app", "ui"]) {
		const goi = GOI[ten];
		const kq = voiTepTam(goi, TEP_XANH, (T) =>
			chay(goi.lenh, join(T, goi.rel)),
		);
		khang += 1;
		if (!kq.tepChay.includes(TEP_TAM))
			hong.push(`${ten}: tep moi ${TEP_TAM} khong duoc chay`);
		khang += 1;
		if (kq.ma !== 0)
			hong.push(`${ten}: tep moi xanh ma lenh thoat ma ${kq.ma}`);
	}
	console.log(`khang-dinh: ${khang} (= 2 goi x 2)`);
} else if (cheDo === "tep-do") {
	for (const ten of ["app", "ui"]) {
		const goi = GOI[ten];
		const kq = voiTepTam(goi, TEP_DO, (T) => chay(goi.lenh, join(T, goi.rel)));
		khang += 1;
		if (kq.ma === 0) hong.push(`${ten}: tep do ma lenh van xanh`);
		khang += 1;
		if (!kq.ra.includes(TEP_TAM))
			hong.push(`${ten}: dau ra khong goi ten tep do`);
	}
	console.log(`khang-dinh: ${khang} (= 2 goi x 2)`);
} else if (cheDo === "cach-ly") {
	const goi = GOI.app;
	const mong = tepDom(goi);
	const kq = chay(goi.lenh, goi.thuMuc);
	khang += 1;
	if (kq.luot.length !== mong.length) {
		hong.push(
			`app: ${kq.luot.length} luot bun test cho ${mong.length} tep (khong moi tep mot tien trinh)`,
		);
	}
	for (const [i, l] of kq.luot.entries()) {
		khang += 1;
		if (l.tep !== 1)
			hong.push(`app: luot ${i + 1} chay ${l.tep} tep chung mot tien trinh`);
	}
	khang += 1;
	if (kq.ma !== 0)
		hong.push(`app: lenh kiem thoat ma ${kq.ma} (co tep do khi chay rieng)`);
	console.log(`khang-dinh: ${khang} (= 1 + ${kq.luot.length} luot + 1)`);
} else if (cheDo === "mui-gio") {
	const goi = GOI.app;
	const kq = voiTepTam(goi, TEP_MUI_GIO, (T) =>
		chay(goi.lenh, join(T, goi.rel), { TZ: "UTC" }),
	);
	khang += 1;
	if (!kq.tepChay.includes(TEP_TAM))
		hong.push("app: tep do mui gio khong duoc chay");
	khang += 1;
	if (kq.ma !== 0)
		hong.push("app: bai kiem DOM khong chay voi TZ=Asia/Ho_Chi_Minh");
	console.log(`khang-dinh: ${khang}`);
} else if (cheDo === "goc") {
	for (const ten of ["app", "ui"]) {
		const goi = GOI[ten];
		const xanh = voiTepTam(goi, TEP_XANH, (T) => chay(LENH_GOC, T));
		khang += 1;
		if (xanh.ma !== 0 || !xanh.tepChay.includes(TEP_TAM))
			hong.push(
				`${ten}: tep xanh khong chay qua bun run test goc (ma ${xanh.ma})`,
			);
		const kq = voiTepTam(goi, TEP_DO, (T) => chay(LENH_GOC, T));
		khang += 1;
		if (kq.ma === 0) hong.push(`${ten}: tep do khong lam bun run test goc do`);
		khang += 1;
		if (!kq.ra.includes(TEP_TAM))
			hong.push(`${ten}: bun run test goc khong goi ten tep do`);
	}
	console.log(`khang-dinh: ${khang} (= 2 goi x 3)`);
} else {
	console.log(
		"KHONG DO DUOC: che do phai la du-tep|tep-moi|tep-do|cach-ly|mui-gio|goc",
	);
	process.exit(2);
}

for (const [ten, goi] of Object.entries(GOI)) {
	khang += 1;
	const sot = readdirSync(join(goi.thuMuc, "test")).filter((t) =>
		t.startsWith(TIEN_TO_TAM),
	);
	if (sot.length > 0) hong.push(`${ten}: tep tam con sot: ${sot.join(", ")}`);
}
khang += 1;
const guongSot = guongDaDung.filter((T) => existsSync(T));
if (guongSot.length > 0) hong.push(`guong con sot: ${guongSot.join(", ")}`);

for (const h of hong) console.log(`HONG ${h}`);
process.exit(hong.length === 0 ? 0 : 1);
