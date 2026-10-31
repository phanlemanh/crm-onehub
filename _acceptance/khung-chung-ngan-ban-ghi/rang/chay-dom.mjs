import { spawnSync } from "node:child_process";
import { copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "..", "..", "..");
const APP = join(GOC, "apps", "app");
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== "CLAUDECODE"));
const KHUNG = join(APP, "components", "crm", "record-sheet", "record-parts.tsx");
const CHO_TAI = '(loadingView ?? <KhungXuongNgan data-khung-xuong-ngan="" />)';

function chay(NGUON) {
	const TEN = `bk1-${process.pid}-${NGUON}`;
	const DICH = join(APP, "test", TEN);
	copyFileSync(join(RANG, NGUON), DICH);
	try {
		const r = spawnSync(
			"bun",
			["test", "--timeout", "30000", "--preload", "../../packages/ui/test/setup-dom.ts", `./test/${TEN}`],
			{ cwd: APP, encoding: "utf8", env: { ...ENV, TZ: "Asia/Ho_Chi_Minh" } },
		);
		return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
	} finally {
		rmSync(DICH, { force: true });
	}
}

const CHI = process.argv.includes("--ngan-that") ? "that" : process.argv.includes("--khung") ? "khung" : null;
const BO = [
	{ ten: "khung", tep: "khung-ngan.dom.tsx", mau: [/bk1-proto ST-so-kr-du/, /bk1-doi-chung-am/] },
	{ ten: "that", tep: "ngan-that.dom.tsx", mau: [/bk1-ngan-that: bon ngan that/] },
].filter((b) => !CHI || b.ten === CHI);
let ok = true;
for (const b of BO) {
	const lanh = chay(b.tep);
	console.log(lanh.ra.split("\n").filter((d) => /\((pass|fail)\)|^ \d+ (pass|fail)|error:/.test(d)).join("\n"));
	const dat = lanh.ma === 0 && /\b0 fail\b/.test(lanh.ra) && b.mau.every((m) => m.test(lanh.ra));
	console.log(`${dat ? "DAT" : "TRUOT"} ban-lanh ${b.tep}`);
	ok = ok && dat;
}

if (BO.some((b) => b.ten === "that") && ok) {
	const sach = spawnSync("git", ["diff", "--quiet", "--", KHUNG], { cwd: GOC }).status === 0;
	if (!sach) {
		console.log("TRUOT pha-cho-tai — record-parts.tsx co thay doi chua commit, khong pha tai cho");
		ok = false;
	} else {
		const goc = readFileSync(KHUNG, "utf8");
		if (!goc.includes(CHO_TAI)) {
			console.log("TRUOT pha-cho-tai — khong thay cho chon cho tai mac dinh cua khung");
			ok = false;
		} else {
			let pha;
			try {
				writeFileSync(KHUNG, goc.replace(CHO_TAI, '(loadingView ?? <div className="animate-spin" />)'));
				pha = chay("ngan-that.dom.tsx");
			} finally {
				writeFileSync(KHUNG, goc);
			}
			const do_ = pha.ma !== 0 && /\(fail\) bk1-ngan-that/.test(pha.ra) && /khung xuong/.test(pha.ra);
			console.log(`${do_ ? "DAT" : "TRUOT"} pha-cho-tai: khung cho tai bang vong quay thi bon ngan that do`);
			ok = ok && do_;
		}
	}
}
console.log(ok ? "DAT tat ca" : "TRUOT");
process.exit(ok ? 0 : 1);
