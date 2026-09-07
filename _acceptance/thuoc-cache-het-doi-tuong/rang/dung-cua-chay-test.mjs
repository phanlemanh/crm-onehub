import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, docCauHinhCong, giaiThan } from "./cau-hinh-turbo.mjs";

const cong = docCauHinhCong();
const oTest = cong.oCam.filter((o) => o.khoa.startsWith("executors.test."));
if (oTest.length === 0) {
	console.error("KHONG DO DUOC: khong o cam test nao trong suite_keys.");
	process.exit(2);
}

function tenCoSoDuLieu() {
	let ra = "";
	try {
		ra = execSync("bun packages/db/scripts/test-run.ts --dry-run true", {
			cwd: GOC,
			encoding: "utf8",
			stdio: "pipe",
			env: { ...process.env, TEST_RUN_ID: "" },
			maxBuffer: 10e6,
			timeout: 120000,
		});
	} catch (e) {
		ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
	const m = ra.match(/test-run: (\S+) is this run's database \(TEST_RUN_ID=(\S+)\)/);
	return m === null ? null : { ten: m[1], ma: m[2] };
}

let ma = 0;
for (const o of oTest) {
	const than = giaiThan(o.lenh, cong.script).join(" ");
	const quaCua = /test-run\.ts/.test(than);
	console.log(`o cam ${o.khoa}\n  lenh : ${o.lenh}\n  giai : ${than}\n  qua cua chay test cua kho: ${quaCua}`);
	if (!quaCua) {
		console.error(
			`DO: ${o.khoa} goi thang turbo, di VONG QUA cua chay test cua kho — cong se chay test tren co so du lieu dung chung trong khi kho da chuyen sang co so du lieu theo luot.`,
		);
		ma = 1;
	}
}
if (ma !== 0) process.exit(ma);

const a = tenCoSoDuLieu();
const b = tenCoSoDuLieu();
if (a === null || b === null) {
	console.error(
		"KHONG DO DUOC: khong doc duoc ten co so du lieu hieu luc tu cua chay test — khong ket luan duoc quan he.",
	);
	process.exit(2);
}
console.log(`luot 1: ${a.ten} (ma luot ${a.ma})`);
console.log(`luot 2: ${b.ten} (ma luot ${b.ma})`);
if (a.ten === b.ten) {
	console.error(
		`DO: hai luot lien tiep dung CHUNG mot co so du lieu (${a.ten}) — cong khong duoc co so du lieu theo luot.`,
	);
	process.exit(1);
}
console.log(
	"XANH: o cam test di qua dung cua chay test cua kho, va hai luot lien tiep nhan HAI co so du lieu khac nhau — do quan he, khong do chuoi.",
);
