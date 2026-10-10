import { execFileSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const APP = path.join(GOC, "apps/app");
const DIST = ".next-lo-trinh-ban-dung";
const TEP = path.join(GOC, "LO-TRINH.html");
const NFT = path.join(
	APP,
	DIST,
	"server/app/(app)/[slug]/lo-trinh/page.js.nft.json",
);
const dungLai = process.argv.includes("--khong-dung");

let sai = 0;
const dong = (dung, nhan, chiTiet = "") => {
	console.log(
		`${dung ? "DUNG" : "SAI"} ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`,
	);
	if (!dung) sai++;
};

function goiDoc(thuMucChay) {
	const ma = `import { duongTepLoTrinh, docTepLoTrinh } from "${path.join(APP, "lib/lo-trinh/doc-tep.ts")}";
import { docDuLieu } from "${path.join(APP, "lib/lo-trinh/doc-du-lieu.js")}";
const duong = duongTepLoTrinh(${JSON.stringify(thuMucChay)});
const chu = docTepLoTrinh(${JSON.stringify(thuMucChay)});
console.log(JSON.stringify({ duong, dai: chu?.length ?? null, chu, coDuLieu: chu ? docDuLieu(chu).duLieu !== null : false }));`;
	return JSON.parse(
		execFileSync("bun", ["-e", ma], { cwd: APP, encoding: "utf8" }),
	);
}

if (!dungLai || !existsSync(NFT)) {
	rmSync(path.join(APP, DIST), { recursive: true, force: true });
	execFileSync("bunx", ["next", "build"], {
		cwd: APP,
		stdio: ["ignore", "inherit", "inherit"],
		env: { ...process.env, PROTO_DIST_DIR: DIST, NEXT_TELEMETRY_DISABLED: "1" },
	});
}

if (!existsSync(NFT)) {
	console.log(`KHONG DO DUOC: ban dung khong co ${path.relative(GOC, NFT)}`);
	process.exit(2);
}

const nft = JSON.parse(readFileSync(NFT, "utf8"));
const tep = nft.files.map((f) => path.resolve(path.dirname(NFT), f));
const coTep = tep.includes(TEP);
dong(
	coTep,
	coTep ? "ban dung mang LO-TRINH.html" : "ban dung khong mang LO-TRINH.html",
	`${tep.length} tep trong .nft.json`,
);

const tuApp = goiDoc(APP);
const that = readFileSync(TEP, "utf8");
const khop = tuApp.duong === TEP && tuApp.chu === that;
dong(
	khop,
	khop
		? "ham giai duong tu thu muc chay tra dung tep goc kho"
		: "ham giai duong tu thu muc chay tra tep khac",
	tuApp.duong,
);

if (!that.includes('id="lo-trinh-du-lieu"')) {
	console.log(
		"KHONG DO DUOC dong 3: LO-TRINH.html chưa mang khối — cần kit ≥ 2.26",
	);
	process.exit(2);
}

const tam = mkdtempSync(path.join(tmpdir(), "lo-trinh-ban-dung-"));
try {
	for (const f of tep) {
		if (!f.startsWith(`${GOC}${path.sep}`) || !existsSync(f)) continue;
		if (statSync(f).isDirectory()) continue;
		const dich = path.join(tam, path.relative(GOC, f));
		mkdirSync(path.dirname(dich), { recursive: true });
		cpSync(f, dich);
	}
	const chay = path.join(tam, "apps/app");
	mkdirSync(chay, { recursive: true });
	const tuBan = goiDoc(chay);
	const trongBan = String(tuBan.duong ?? "").startsWith(`${tam}${path.sep}`);
	dong(
		trongBan && tuBan.coDuLieu,
		trongBan && tuBan.coDuLieu
			? "ban sao chi gom tep cua ban dung doc ra khoi du lieu"
			: "trang doc tep ngoai ban dung",
		tuBan.duong,
	);
} finally {
	rmSync(tam, { recursive: true, force: true });
}

process.exit(sai === 0 ? 0 : 1);
