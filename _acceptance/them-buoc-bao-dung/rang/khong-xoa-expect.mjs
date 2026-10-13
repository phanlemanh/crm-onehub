import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const TEP = [
	"apps/api/test/dieu-phoi-va.spec.ts",
	"apps/app/test/dieu-phoi-va.dom.tsx",
	"apps/app/test/han-viec.dom.tsx",
	"apps/app/test/moi-phia-ke-hoach.dom.tsx",
	"apps/app/test/may-nhac.dom.tsx",
	"apps/app/test/ke-hoach-sheet.dom.tsx",
];
const CHO_PHEP = ["expect(khongCo.getStatus()).toBe(400)"];
const TEP_KHOI = "apps/api/test/dieu-phoi-va.spec.ts";
const DAU_KHOI = 'describe("bo-phan-hong"';
const DOI_DONG = [
	"expect(khongCo.getStatus()).toBe(400);",
	"expect(khongCo.getStatus()).toBe(404);",
];
const BO_QUA = /\.(skip|todo|only)\(/g;

function demBoQua(nguon) {
	return (nguon.match(BO_QUA) ?? []).length;
}

function khoi(nguon) {
	const dau = nguon.indexOf(DAU_KHOI);
	if (dau < 0) return null;
	const sau = nguon.indexOf("\ndescribe(", dau + DAU_KHOI.length);
	return nguon.slice(dau, sau < 0 ? nguon.length : sau);
}

function khoiLech(truoc, sau) {
	const a = khoi(truoc);
	const b = khoi(sau);
	if (a === null || b === null) return ["khoi bo-phan-hong mat"];
	const mong = a.split("\n").map((d) => d.replace(DOI_DONG[0], DOI_DONG[1]));
	const co = b.split("\n");
	const lech = [];
	for (let i = 0; i < Math.max(mong.length, co.length); i += 1) {
		if (mong[i] !== co[i]) lech.push(`dong ${i + 1}: ${(co[i] ?? "").trim()}`);
	}
	return lech;
}

function chuanHoa(cau) {
	let ra = "";
	let trong = "";
	for (let i = 0; i < cau.length; i += 1) {
		const c = cau[i];
		if (trong) {
			ra += c;
			if (c === "\\") {
				ra += cau[i + 1] ?? "";
				i += 1;
			} else if (c === trong) trong = "";
		} else if (c === '"' || c === "'" || c === "`") {
			trong = c;
			ra += c;
		} else if (!/\s/.test(c)) ra += c;
	}
	return ra.replace(/,([)\]}])/g, "$1");
}

function cauExpect(nguon) {
	const ra = [];
	let i = nguon.indexOf("expect(");
	while (i !== -1) {
		let sau = 0;
		let j = i;
		for (; j < nguon.length; j += 1) {
			const c = nguon[j];
			if (c === "(" || c === "[" || c === "{") sau += 1;
			else if (c === ")" || c === "]" || c === "}") sau -= 1;
			else if (c === ";" && sau === 0) break;
		}
		ra.push(chuanHoa(nguon.slice(i, j)));
		i = nguon.indexOf("expect(", j);
	}
	return ra;
}

function mat(truoc, sau) {
	const con = new Map();
	for (const c of cauExpect(sau)) con.set(c, (con.get(c) ?? 0) + 1);
	const thieu = [];
	for (const c of cauExpect(truoc)) {
		const n = con.get(c) ?? 0;
		if (n > 0) con.set(c, n - 1);
		else thieu.push(c);
	}
	const sai = thieu.filter(
		(c) => !CHO_PHEP.some((m) => c.includes(m.replace(/\s+/g, ""))),
	);
	return { sai, choPhep: thieu.length - sai.length };
}

function git(...args) {
	return execFileSync("git", ["-C", GOC, ...args], { encoding: "utf8" });
}

if (process.argv.includes("--tu-thu")) {
	const truoc = [
		'expect(\n\tra.name,\n\t"ten",\n).toBe("TypeError");',
		'expect(nhan).toBe("Đã ký hợp đồng");',
		"expect(a).toBe(1);",
		"expect(khongCo.getStatus()).toBe(400);",
	].join("\n");
	const sau = [
		'expect(\n\tra.name,\n\t"ten",\n).toBe("Error");',
		'expect(nhan).toBe("Đã kýhợp đồng");',
		"expect( a ).toBe( 1 );",
		"expect(khongCo.getStatus()).toBe(404);",
	].join("\n");
	const mong = [
		'expect(ra.name,"ten").toBe("TypeError")',
		'expect(nhan).toBe("Đã ký hợp đồng")',
	];
	const { sai, choPhep } = mat(truoc, sau);
	if (JSON.stringify(sai) !== JSON.stringify(mong) || choPhep !== 1) {
		console.error(
			`tu-thu: mong 2 sai ${JSON.stringify(mong)} va 1 cho phep, duoc ${JSON.stringify(sai)} va ${choPhep} cho phep`,
		);
		process.exit(2);
	}
	if (demBoQua('test("a", () => {});') !== 0 || demBoQua('test.skip("a", () => {});\ndescribe.only("b", () => {});') !== 2) {
		console.error("tu-thu: khong bat .skip");
		process.exit(2);
	}
	const goc = [
		'describe("bo-phan-hong", () => {',
		"\tconst maLa = maMoi(\"bp-khong-co\");",
		`\t${DOI_DONG[0]}`,
		"});",
		'describe("dem-qua-han", () => {});',
	].join("\n");
	const dungDoi = goc.replace(DOI_DONG[0], DOI_DONG[1]);
	const suaFixture = dungDoi.replace("bp-khong-co", "bp-khac");
	if (khoiLech(goc, dungDoi).length !== 0) {
		console.error("tu-thu: khoi bo-phan-hong bat nham dong cho phep");
		process.exit(2);
	}
	const lech = khoiLech(goc, suaFixture);
	if (lech.length !== 1 || !lech[0].includes("bp-khac")) {
		console.error(`tu-thu: khong bat sua fixture trong khoi bo-phan-hong: ${JSON.stringify(lech)}`);
		process.exit(2);
	}
	console.log(
		"tu-thu 7/7: sua gia tri nhieu dong -> bat dung cau; sua khoang trang trong chuoi -> bat dung cau; doi khoang trang ngoai chuoi -> khong bat; cau cho phep -> khong tinh sai; .skip/.only -> dem dung; doi dong cho phep trong khoi -> khong bat; sua fixture trong khoi -> bat dung dong",
	);
	process.exit(0);
}

const iMoc = process.argv.indexOf("--moc");
if (iMoc < 0 || !process.argv[iMoc + 1]) {
	console.error(
		"thieu --moc <sha>: moc phai ghim trong lenh, khong suy tu merge-base",
	);
	process.exit(2);
}
const moc = git("rev-parse", process.argv[iMoc + 1]).trim();
let tongSai = 0;
let tongChoPhep = 0;
let tongTruoc = 0;
for (const tep of TEP) {
	const truoc = git("show", `${moc}:${tep}`);
	const sau = readFileSync(path.join(GOC, tep), "utf8");
	tongTruoc += cauExpect(truoc).length;
	const { sai, choPhep } = mat(truoc, sau);
	tongChoPhep += choPhep;
	tongSai += sai.length;
	for (const c of sai) console.error(`${tep}: expect bi xoa hay sua: ${c}`);
	const boQuaTruoc = demBoQua(truoc);
	const boQuaSau = demBoQua(sau);
	if (boQuaSau > boQuaTruoc) {
		tongSai += 1;
		console.error(`${tep}: them .skip/.todo/.only (${boQuaTruoc} -> ${boQuaSau})`);
	}
	if (tep === TEP_KHOI) {
		for (const d of khoiLech(truoc, sau)) {
			tongSai += 1;
			console.error(`${tep}: khoi bo-phan-hong lech moc: ${d}`);
		}
	}
}
console.log(
	`moc ${moc.slice(0, 9)} · ${TEP.length} tep · ${tongTruoc} cau expect san co · ${tongChoPhep} cau cho phep mat`,
);
if (tongSai > 0) process.exit(1);
console.log("khong expect san co nao bi xoa hay sua");
