import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "..", "..", "..");
const LUOT = "41191965481";
const BON_CA = [
	"(pass) dau-hook > dau-hook (e): chuoi ngay 13 roi 15",
	"(pass) vai-chi-okr > gan-vai: admin gan okr qua doi vai va loi moi; member khong gan duoc; chu so huu cuoi khong bi ha",
	"(pass) dgt-thuoc > dgt-thuoc: đúng đáp án viết tay trên kho mẫu, chỉ đọc, gieo luỹ đẳng",
];
const BO_BIEN = new Set(["CLAUDECODE", "DAU_HOOK_TRAN_MS"]);
const ENV = Object.fromEntries(
	Object.entries(process.env).filter(([k]) => !BO_BIEN.has(k)),
);
const chi = process.argv.includes("--chi-ui")
	? "ui"
	: process.argv.includes("--chi-api")
		? "api"
		: "ca-hai";

function docThuTu(ten) {
	return readFileSync(join(RANG, `thu-tu-${ten}-${LUOT}.txt`), "utf8")
		.split("\n")
		.filter(Boolean);
}

function thuTuThat(ra, danhSach) {
	const thay = [];
	for (const d of ra.split("\n")) {
		const m = /^(test\/[A-Za-z0-9.-]+\.spec\.tsx?):$/.exec(d.trim());
		if (m && danhSach.includes(m[1]) && !thay.includes(m[1])) thay.push(m[1]);
	}
	return thay;
}

const loi = [];
function ca(ten, dat, chiTiet) {
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten}${dat ? "" : ` — ${chiTiet}`}`);
	if (!dat) loi.push(ten);
}

function kiemThuTu(ten, ra, danhSach) {
	const thay = thuTuThat(ra, danhSach);
	ca(
		`${ten}: chay dung thu tu tep cua luot ${LUOT}`,
		thay.join("\n") === danhSach.join("\n"),
		`thay ${thay.length}/${danhSach.length} tep, lech tu tep ${thay.findIndex((t, i) => t !== danhSach[i]) + 1}`,
	);
}

if (chi !== "api") {
	const ui = docThuTu("ui");
	const r = spawnSync(
		"bun",
		["test", "--preload", "./test/setup-dom.ts", ...ui.map((t) => `./${t}`)],
		{
			cwd: join(GOC, "packages", "ui"),
			encoding: "utf8",
			env: ENV,
		},
	);
	const ra = `${r.stdout}${r.stderr}`;
	kiemThuTu("app-ui", ra, ui);
	ca(
		"app-ui: lai-ra-man chay truoc pre-push-da-chung",
		ui.indexOf("test/lai-ra-man.spec.tsx") <
			ui.indexOf("test/pre-push-da-chung.spec.ts"),
		"thu tu ghi sai",
	);
	ca(
		"app-ui: 0 fail, dau-hook (e) xanh",
		r.status === 0 && /\b0 fail\b/.test(ra) && ra.includes(BON_CA[0]),
		`ma ${r.status}\n${ra
			.split("\n")
			.filter((d) => d.includes("(fail)"))
			.join("\n")}`,
	);
}

if (chi !== "ui") {
	const api = docThuTu("api");
	const lenh = `cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts ${api.map((t) => `./${t}`).join(" ")}`;
	const r = spawnSync("bun", ["packages/db/scripts/test-run.ts", lenh], {
		cwd: GOC,
		encoding: "utf8",
		env: ENV,
		maxBuffer: 1 << 30,
	});
	const ra = `${r.stdout}${r.stderr}`;
	kiemThuTu("api", ra, api);
	const mkl = api.indexOf("test/mat-khau-lien-ket.spec.ts");
	ca(
		"api: mat-khau-lien-ket chay truoc vai-chi-okr va du-an-do-nguong",
		mkl < api.indexOf("test/vai-chi-okr.spec.ts") &&
			mkl < api.indexOf("test/du-an-do-nguong.spec.ts"),
		"thu tu ghi sai",
	);
	ca(
		"api: 0 fail, khong loi khoa ngoai, gan-vai va dgt-thuoc xanh",
		r.status === 0 &&
			/\b0 fail\b/.test(ra) &&
			!ra.includes("viec_nguoiGiaoId_fkey") &&
			BON_CA.slice(1).every((c) => ra.includes(c)),
		`ma ${r.status}\n${ra
			.split("\n")
			.filter((d) => d.includes("(fail)") || d.includes("_fkey"))
			.join("\n")}`,
	);
}

if (loi.length) {
	console.log(`TRUOT ${loi.length} ca: ${loi.join(", ")}`);
	process.exit(1);
}
console.log("DAT tat ca");
