import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const co = process.argv.indexOf("--config");
const CAU_HINH =
	co === -1 ? join(GOC, "_acceptance", "config.yaml") : process.argv[co + 1];

const SCRIPT = JSON.parse(
	readFileSync(join(GOC, "package.json"), "utf8"),
).scripts;

export function docSuiteKeys(nguon) {
	const khoi = nguon.match(/^ {2}suite_keys:\n((?: {4}- .+\n)+)/m);
	if (khoi === null) return [];
	return khoi[1]
		.trimEnd()
		.split("\n")
		.map((d) => d.replace(/^\s*- /, "").trim());
}

export function docLenh(nguon, khoa) {
	const ten = khoa.split(".").pop();
	const m = nguon.match(new RegExp(`^\\s+${ten}: (?:"(.+)"|'(.+)')$`, "m"));
	return m === null ? null : (m[1] ?? m[2]);
}

export function giaiLenh(lenh, script) {
	const ra = [];
	for (const doan of lenh.split("&&").map((d) => d.trim())) {
		const m = doan.match(/^bun run ([\w:-]+)$/);
		const than = m === null ? doan : (script[m[1]] ?? doan);
		ra.push(than);
	}
	return ra;
}

export function anCache(lenh, script) {
	return giaiLenh(lenh, script).some(
		(than) => /\bturbo run\b/.test(than) && !/--force\b/.test(than),
	);
}

const nguon = readFileSync(CAU_HINH, "utf8");
const khoa = docSuiteKeys(nguon);

if (khoa.length === 0) {
	console.error(
		"KHONG DO DUOC: config khong khai suite_keys — khong co lenh chung nao de soi.",
	);
	process.exit(2);
}

console.log(`suite_keys cua cong: ${khoa.length} lenh`);
const thieu = [];
for (const k of khoa) {
	const lenh = docLenh(nguon, k);
	if (lenh === null) {
		thieu.push(`${k} — o cam khong ton tai trong config`);
		continue;
	}
	const an = anCache(lenh, SCRIPT);
	console.log(`  ${an ? "AN CACHE " : "cuong buc"}  ${k}`);
	for (const than of giaiLenh(lenh, SCRIPT))
		console.log(`              ${than === lenh ? than : `→ ${than}`}`);
	if (an) thieu.push(`${k} — lenh "${lenh}" chay qua turbo ma KHONG co --force`);
	if (k.startsWith("executors.test.")) {
		const than = giaiLenh(lenh, SCRIPT).join(" ");
		const quaCua = /test-run\.ts/.test(than);
		const coDbTest = /\bdb:test\b/.test(`${lenh} ${than}`);
		if (!quaCua && !coDbTest)
			thieu.push(
				`${k} — o cam test cua cong khong dung lai co so du lieu test: khong chua db:test VA khong di qua cua chay test cua kho (test-run.ts, noi duc mot co so du lieu rieng cho moi luot)`,
			);
	}
}
console.log(`da soi ${khoa.length} lenh`);

if (thieu.length > 0) {
	for (const t of thieu)
		console.error(
			`DO: mot lenh chung cua cong con an cache — mot luot xanh co the la ban phat lai, khong phai mot luot chay. ${t}`,
		);
	process.exit(1);
}
console.log(
	`XANH: ca ${khoa.length} lenh chung cua cong deu chay CUONG BUC hoac khong qua turbo — khong lenh nao co the tra ve mot mau xanh phat lai.`,
);
