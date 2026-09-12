import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const THU_MUC = join(GOC, "packages", "ui", "src", "components", "ai-elements");
const BANG_TOKEN = join(GOC, "packages", "ui", "src", "styles", "globals.css");
const SO_TAY = join(GOC, "docs", "design.md");

const THANG_BAN_KINH = ["sm", "md", "lg", "none"];
const CANH_BAN_KINH = [
	"tl",
	"tr",
	"br",
	"bl",
	"ss",
	"se",
	"ee",
	"es",
	"t",
	"r",
	"b",
	"l",
	"s",
	"e",
];
const CANH_VIEN = ["x", "y", "t", "r", "b", "l", "s", "e"];
const DAU_MAU = ["text", "bg", "border", "ring", "fill", "stroke"];
const CHU_CSS = new Set(["transparent", "current", "inherit"]);

const CHU_KHONG_MAU = new Set([
	"xs",
	"sm",
	"base",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
	"6xl",
	"7xl",
	"8xl",
	"9xl",
	"left",
	"center",
	"right",
	"justify",
	"start",
	"end",
	"wrap",
	"nowrap",
	"balance",
	"pretty",
	"ellipsis",
	"clip",
]);

const NEN_KHONG_MAU = new Set([
	"fixed",
	"local",
	"scroll",
	"auto",
	"cover",
	"contain",
	"none",
	"repeat",
	"no-repeat",
	"repeat-x",
	"repeat-y",
	"repeat-round",
	"repeat-space",
	"clip-border",
	"clip-padding",
	"clip-content",
	"clip-text",
	"origin-border",
	"origin-padding",
	"origin-content",
	"bottom",
	"center",
	"left",
	"right",
	"top",
	"left-bottom",
	"left-top",
	"right-bottom",
	"right-top",
]);

const VIEN_KHONG_MAU = new Set([
	"0",
	"2",
	"4",
	"8",
	"solid",
	"dashed",
	"dotted",
	"double",
	"hidden",
	"none",
	"collapse",
	"separate",
]);

const VONG_KHONG_MAU = new Set(["0", "1", "2", "4", "8", "inset"]);
const NET_KHONG_MAU = new Set(["0", "1", "2", "none"]);
const TO_KHONG_MAU = new Set(["none"]);

const NEN_DOC = /^(gradient-to|linear|radial|conic)(-|$)/;
const RIENG_KHONG_MAU = /^\[(length|size|position|image|url)[:(]/;

function chiaNgoaiNgoac(chuoi, dau) {
	const ra = [];
	let sau = 0;
	let dem = "";
	for (const c of chuoi) {
		if (c === "[") sau += 1;
		else if (c === "]") sau -= 1;
		if (c === dau && sau === 0) {
			ra.push(dem);
			dem = "";
			continue;
		}
		dem += c;
	}
	ra.push(dem);
	return ra;
}

function botBien(lop) {
	const phan = chiaNgoaiNgoac(lop, ":");
	return phan[phan.length - 1].replace(/^!/, "");
}

function lopTrongDong(dong) {
	const ra = [];
	for (const tho of dong.split(/[\s"'`]+/)) {
		const sach = tho.replace(/^[({[,;]+/, "").replace(/[)}\],;]+$/, "");
		if (sach.length > 0) ra.push(sach);
	}
	return ra;
}

function docBangToken() {
	const van = readFileSync(BANG_TOKEN, "utf8");
	const bang = new Set();
	for (const khop of van.matchAll(/--color-([a-z0-9-]+)\s*:/g))
		bang.add(khop[1]);
	return bang;
}

function ketThucBanKinh(gia) {
	for (const canh of CANH_BAN_KINH) {
		if (gia === canh) return "";
		if (gia.startsWith(`${canh}-`)) return gia.slice(canh.length + 1);
	}
	return gia;
}

function laToken(gia, bang) {
	const goc = chiaNgoaiNgoac(gia, "/")[0];
	if (CHU_CSS.has(goc)) return true;
	return bang.has(goc);
}

function xetMau(dau, gia, bang) {
	if (gia.startsWith("[")) {
		if (RIENG_KHONG_MAU.test(gia)) return { trongVe: false, dat: true };
		return { trongVe: true, dat: false };
	}
	if (dau === "text") {
		if (CHU_KHONG_MAU.has(gia)) return { trongVe: false, dat: true };
		return { trongVe: true, dat: laToken(gia, bang) };
	}
	if (dau === "bg") {
		if (NEN_KHONG_MAU.has(gia) || NEN_DOC.test(gia))
			return { trongVe: false, dat: true };
		return { trongVe: true, dat: laToken(gia, bang) };
	}
	if (dau === "border") {
		let con = gia;
		for (const canh of CANH_VIEN) {
			if (con === canh) return { trongVe: false, dat: true };
			if (con.startsWith(`${canh}-`)) {
				con = con.slice(canh.length + 1);
				break;
			}
		}
		if (VIEN_KHONG_MAU.has(con)) return { trongVe: false, dat: true };
		return { trongVe: true, dat: laToken(con, bang) };
	}
	if (dau === "ring") {
		if (VONG_KHONG_MAU.has(gia)) return { trongVe: false, dat: true };
		if (gia.startsWith("offset-")) {
			const con = gia.slice(7);
			if (VONG_KHONG_MAU.has(con)) return { trongVe: false, dat: true };
			return { trongVe: true, dat: laToken(con, bang) };
		}
		return { trongVe: true, dat: laToken(gia, bang) };
	}
	if (dau === "stroke") {
		if (NET_KHONG_MAU.has(gia)) return { trongVe: false, dat: true };
		return { trongVe: true, dat: laToken(gia, bang) };
	}
	if (TO_KHONG_MAU.has(gia)) return { trongVe: false, dat: true };
	return { trongVe: true, dat: laToken(gia, bang) };
}

function ket(ma) {
	process.exit(ma);
}

let bang;
try {
	bang = docBangToken();
} catch (e) {
	console.log(
		`KHONG DO DUOC: khong doc duoc bang token ${relative(GOC, BANG_TOKEN)} — ${String(e).slice(0, 120)}`,
	);
	ket(2);
}

if (bang.size < 20) {
	console.log(
		`KHONG DO DUOC: bang token chi co ${bang.size} ten — globals.css doi hinh, danh sach trang khong con dong.`,
	);
	ket(2);
}

let soTay;
try {
	soTay = readFileSync(SO_TAY, "utf8");
} catch (e) {
	console.log(
		`KHONG DO DUOC: khong doc duoc ${relative(GOC, SO_TAY)} — ${String(e).slice(0, 120)}`,
	);
	ket(2);
}

const thieuThang = THANG_BAN_KINH.filter(
	(t) => !soTay.includes(`rounded-${t}`),
);
if (thieuThang.length > 0) {
	console.log(
		`KHONG DO DUOC: docs/design.md khong con neu ${thieuThang.map((t) => `rounded-${t}`).join(" · ")} — thang ban kinh da doi, sua rang truoc khi do.`,
	);
	ket(2);
}

let tep;
try {
	tep = readdirSync(THU_MUC)
		.filter((t) => t.endsWith(".tsx"))
		.sort();
} catch (e) {
	console.log(
		`KHONG DO DUOC: khong doc duoc ${relative(GOC, THU_MUC)} — ${String(e).slice(0, 120)}`,
	);
	ket(2);
}

if (tep.length === 0) {
	console.log(
		`KHONG DO DUOC: ${relative(GOC, THU_MUC)} khong co tep .tsx nao. Tap rong khong phai la sach.`,
	);
	ket(2);
}

console.log(
	`bang token dong: ${bang.size} ten mau doc tu packages/ui/src/styles/globals.css`,
);
console.log(
	`thang ban kinh dong: ${THANG_BAN_KINH.map((t) => `rounded-${t}`).join(" · ")}`,
);
console.log(`pham vi: ${relative(GOC, THU_MUC)} — ${tep.length} tep\n`);

const laBanKinh = [];
const laMau = [];
let danSoBanKinh = 0;
let danSoMau = 0;
const theoTep = [];

for (const ten of tep) {
	const duong = join(THU_MUC, ten);
	if (!statSync(duong).isFile()) continue;
	const dongs = readFileSync(duong, "utf8").split("\n");
	let bkTep = 0;
	let mauTep = 0;
	for (let i = 0; i < dongs.length; i += 1) {
		for (const tho of lopTrongDong(dongs[i])) {
			const lop = botBien(tho);
			if (lop === "rounded" || lop.startsWith("rounded-")) {
				danSoBanKinh += 1;
				const gia = lop === "rounded" ? "" : lop.slice(8);
				if (!THANG_BAN_KINH.includes(ketThucBanKinh(gia))) {
					laBanKinh.push({ tep: ten, dong: i + 1, lop });
					bkTep += 1;
				}
				continue;
			}
			const dau = DAU_MAU.find((d) => lop.startsWith(`${d}-`));
			if (dau === undefined) continue;
			const xet = xetMau(dau, lop.slice(dau.length + 1), bang);
			if (!xet.trongVe) continue;
			danSoMau += 1;
			if (!xet.dat) {
				laMau.push({ tep: ten, dong: i + 1, lop });
				mauTep += 1;
			}
		}
	}
	theoTep.push({ ten, bkTep, mauTep });
}

for (const t of theoTep) {
	console.log(`   ${t.ten}: ban kinh la ${t.bkTep} · mau la ${t.mauTep}`);
}

console.log(
	`\nVE BAN KINH — xet ${danSoBanKinh} lop rounded-, ngoai thang: ${laBanKinh.length}`,
);
for (const l of laBanKinh) {
	console.log(
		`   NGOAI THANG: ${relative(GOC, join(THU_MUC, l.tep))}:${l.dong}: ${l.lop}`,
	);
}

console.log(
	`\nVE MAU — xet ${danSoMau} lop mang o mau, ngoai bang: ${laMau.length}`,
);
for (const l of laMau) {
	console.log(
		`   NGOAI BANG: ${relative(GOC, join(THU_MUC, l.tep))}:${l.dong}: ${l.lop}`,
	);
}

if (laBanKinh.length > 0 || laMau.length > 0) {
	console.log(
		`\nDO: ${laBanKinh.length} lop ban kinh ngoai thang · ${laMau.length} lop mau ngoai bang.`,
	);
	ket(1);
}

console.log(
	"\nXANH: moi lop ban kinh nam trong thang bon gia tri, va moi lop mau goi dung mot ten co trong bang token.",
);
ket(0);
