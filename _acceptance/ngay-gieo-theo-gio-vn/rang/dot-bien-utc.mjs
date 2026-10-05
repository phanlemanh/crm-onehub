import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const API = join(GOC, "apps/api");
const TEN_SAO = `.sao-ngay-${process.pid}`;
const SAO = join(API, TEN_SAO);
const HO_TRO = join(SAO, "support/ke-hoach-gieo.ts");

const BAN_VN = `export function ngayCach(soNgay: number): Date {
	return new Date(
		Date.parse(\`\${ngayVN(new Date())}T00:00:00Z\`) + soNgay * DAY_MS,
	);
}`;

const BAN_UTC = `export function ngayCach(soNgay: number): Date {
	const homNay = new Date();
	return new Date(
		Date.UTC(
			homNay.getUTCFullYear(),
			homNay.getUTCMonth(),
			homNay.getUTCDate() + soNgay,
		),
	);
}`;

const NHAP_VN = 'import { ngayVN } from "@crm/db/onboarding-nhac";\n';

const CA = [
	{ ma: "viec-dem", ten: "viec-cua-toi: khung-dem" },
	{ ma: "viec-ngay", ten: "viec-cua-toi: khung-ngay" },
	{ ma: "gieo-dem", ten: "ngay-gieo-theo-vn: khung-dem" },
	{ ma: "gieo-ngay", ten: "ngay-gieo-theo-vn: khung-ngay" },
];

const KY_VONG_PHA = {
	"viec-dem":
		"khung-dem scope me: tap va thu tu; ke hoach da dong khong lot vao",
	"gieo-dem": "khung-dem: ngayCach(-1, 0, 3, 4) theo ngay lich VN",
	"viec-ngay": null,
	"gieo-ngay": null,
};

const loi = [];

const TIEN_TO_SAO = ".sao-ngay-";
const DB_CHUNG = "crm_test";

function conSong(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function donSaoSot() {
	for (const ten of readdirSync(API)) {
		if (!ten.startsWith(TIEN_TO_SAO)) continue;
		const pid = Number(ten.slice(TIEN_TO_SAO.length));
		if (Number.isInteger(pid) && conSong(pid)) {
			console.error(
				`dot-bien-utc: ban sao apps/api/${ten} cua tien trinh ${pid} dang chay — cho no xong roi chay lai`,
			);
			process.exit(2);
		}
		rmSync(join(API, ten), { recursive: true, force: true });
		console.log(`don ban sao sot apps/api/${ten} (tien trinh ${pid} da chet)`);
	}
}

function docXml(tep) {
	const xml = readFileSync(tep, "utf8");
	const ket = new Map();
	for (const m of xml.matchAll(
		/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g,
	)) {
		const ten = /\bname="([^"]*)"/.exec(m[1])?.[1] ?? "";
		const trong = m[3] ?? "";
		ket.set(ten, { hong: /<failure\b/.test(trong), noi: trong });
	}
	return ket;
}

function chay(luot) {
	const xml = join(SAO, `ket-qua-${luot}.xml`);
	const lenh = `cd apps/api && bun test ./${TEN_SAO}/moi-phia-ke-hoach.spec.ts -t 'viec-cua-toi|ngay-gieo-theo-vn' --reporter=junit --reporter-outfile=${xml}`;
	const r = spawnSync("bun", ["run", "test", "--", lenh], {
		cwd: GOC,
		encoding: "utf8",
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (!existsSync(xml)) {
		loi.push(
			`${luot}: khong co tep junit — lenh khong chay toi bun test (ma ${r.status})\n${ra.slice(-2000)}`,
		);
		return null;
	}
	const db = /test-run: (\S+) is this run's database/.exec(ra)?.[1];
	if (!db || db === DB_CHUNG) {
		loi.push(
			`${luot}: khong thay co so du lieu rieng cua luot (thay «${db ?? "khong co"}») — co the dung chung ${DB_CHUNG} voi eval khac`,
		);
	} else {
		console.log(`${luot}: chay tren co so du lieu rieng ${db}`);
	}
	const ket = docXml(xml);
	const tim = (ten) => {
		const t = [...ket.entries()].find(([k]) => k.includes(ten))?.[1];
		return t && { ...t, noi: `${t.noi}\n${doanLoi(ra, ten)}` };
	};
	return { ma: r.status, ra, tim };
}

function doanLoi(ra, ten) {
	const dong = ra.split("\n");
	const cuoi = dong.findIndex(
		(d) => d.startsWith("(fail) ") && d.includes(ten),
	);
	if (cuoi < 0) return "";
	let dau = cuoi - 1;
	while (dau >= 0 && !/^\((pass|fail|skip|todo)\) /.test(dong[dau])) dau--;
	return dong.slice(dau + 1, cuoi).join("\n");
}

function kiemLanh(kq) {
	if (kq.ma !== 0)
		loi.push(`vat lanh: lenh thoat ${kq.ma}, mong 0 (doi chung duong do)`);
	for (const ca of CA) {
		const t = kq.tim(ca.ten);
		if (!t) loi.push(`vat lanh: khong thay ca «${ca.ten}» trong ket qua`);
		else if (t.hong) loi.push(`vat lanh: ca «${ca.ten}» do, mong xanh`);
		else console.log(`vat lanh  · ${ca.ten}: xanh`);
	}
}

function kiemPha(kq) {
	if (kq.ma === 0)
		loi.push("ban pha UTC: lenh thoat 0, mong khac 0 — thuoc khong thay loi");
	for (const ca of CA) {
		const t = kq.tim(ca.ten);
		const mong = KY_VONG_PHA[ca.ma];
		if (!t) {
			loi.push(`ban pha UTC: khong thay ca «${ca.ten}» trong ket qua`);
			continue;
		}
		if (mong === null) {
			if (t.hong)
				loi.push(
					`ban pha UTC: ca «${ca.ten}» do, mong xanh — moc ngoai khung khong phan biet duoc hai cach tinh`,
				);
			else console.log(`ban pha UTC · ${ca.ten}: xanh (dung ky vong)`);
			continue;
		}
		if (!t.hong) loi.push(`ban pha UTC: ca «${ca.ten}» xanh, mong do`);
		else if (!t.noi.includes(mong))
			loi.push(
				`ban pha UTC: ca «${ca.ten}» do nhung khong mang thong diep ghim «${mong}»`,
			);
		else console.log(`ban pha UTC · ${ca.ten}: do voi «${mong}»`);
	}
}

donSaoSot();

try {
	mkdirSync(SAO, { recursive: true });
	cpSync(
		join(API, "test/moi-phia-ke-hoach.spec.ts"),
		join(SAO, "moi-phia-ke-hoach.spec.ts"),
	);
	cpSync(join(API, "test/support"), join(SAO, "support"), { recursive: true });
	cpSync(join(API, "test/fixtures"), join(SAO, "fixtures"), {
		recursive: true,
	});

	const lanh = chay("lanh");
	if (lanh) kiemLanh(lanh);

	const nguon = readFileSync(HO_TRO, "utf8");
	if (!nguon.includes(BAN_VN) || !nguon.includes(NHAP_VN)) {
		loi.push(
			"khong tim thay ban ngayCach theo ngay VN trong ke-hoach-gieo.ts de pha — thuoc da lech voi vat",
		);
	} else {
		writeFileSync(HO_TRO, nguon.replace(BAN_VN, BAN_UTC).replace(NHAP_VN, ""));
		const pha = chay("pha");
		if (pha) kiemPha(pha);
	}
} finally {
	rmSync(SAO, { recursive: true, force: true });
}

if (loi.length > 0) {
	console.error(`dot-bien-utc: DO\n- ${loi.join("\n- ")}`);
	process.exit(1);
}
console.log(
	"dot-bien-utc: XANH — vat lanh xanh ca bon ca; tra ngayCach ve ngay UTC thi khung-dem do dung thong diep, khung-ngay van xanh",
);
