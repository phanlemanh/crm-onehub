import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app");
const NHAN = `bk1-${process.pid}`;
const NHAP = `import { KhungNgan, RecordSheetFrame } from "@/components/crm/record-sheet/record-parts";\n`;
const CA = [
	{ ten: "lanh", ma: `<RecordSheetFrame loading={false} error={null} title="t" />`, mong: null },
	{ ten: "thieu-loading", ma: `<RecordSheetFrame error={null} title="t" />`, mong: "loading" },
	{ ten: "thieu-error", ma: `<RecordSheetFrame loading={false} title="t" />`, mong: "error" },
	{ ten: "tabs-thieu-tab", ma: `<RecordSheetFrame loading={false} error={null} title="t" tabs={[]} />`, mong: "tab" },
	{ ten: "khung-ngan-lanh", ma: `<KhungNgan loading={false} error={null} title="t" />`, mong: null },
	{ ten: "khung-ngan-thieu-loading", ma: `<KhungNgan error={null} title="t" />`, mong: "loading" },
	{ ten: "khung-ngan-thieu-error", ma: `<KhungNgan loading={false} title="t" />`, mong: "error" },
];

const tam = [];
let ok = true;
try {
	const tep = CA.map((c) => {
		const p = join(APP, "test", `${NHAN}-${c.ten}.tsx`);
		writeFileSync(p, `${NHAP}export const X = () => ${c.ma};\n`);
		tam.push(p);
		return `test/${NHAN}-${c.ten}.tsx`;
	});
	const cfg = join(APP, `tsconfig.${NHAN}.json`);
	writeFileSync(cfg, JSON.stringify({ extends: "./tsconfig.json", include: tep, compilerOptions: { noEmit: true, incremental: false } }));
	tam.push(cfg);
	const r = spawnSync("bunx", ["tsc", "-p", cfg, "--pretty", "false"], { cwd: APP, encoding: "utf8" });
	const ra = `${r.stdout}${r.stderr}`;
	for (const c of CA) {
		const tatCa = ra.split("\n");
		const dong = [];
		tatCa.forEach((d, i) => {
			if (!d.includes(`${NHAN}-${c.ten}.tsx`)) return;
			dong.push(d);
			for (let j = i + 1; j < tatCa.length && /^\s/.test(tatCa[j]); j++) dong.push(tatCa[j]);
		});
		const dat =
			c.mong === null
				? dong.length === 0
				: dong.some((d) => /error TS\d+/.test(d)) && dong.some((d) => new RegExp(`'${c.mong}'|: ${c.mong}(,|$)`).test(d));
		console.log(`${dat ? "DAT" : "TRUOT"} ${c.ten}${c.mong ? ` — tsc phai doi prop '${c.mong}'` : " — tsc phai im"}`);
		if (!dat) {
			console.log(dong.join("\n") || ra.slice(-1500));
			ok = false;
		}
	}
} finally {
	for (const p of tam) rmSync(p, { force: true });
}
if (!ok) process.exit(1);
console.log("DAT tat ca");
