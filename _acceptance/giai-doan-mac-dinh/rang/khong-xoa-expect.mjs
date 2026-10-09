import { execFileSync } from "node:child_process";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const TEP = ["apps/api/test/giai-doan.spec.ts"];
const CHO_PHEP = [];

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
	].join("\n");
	const sau = [
		'expect(\n\tra.name,\n\t"ten",\n).toBe("Error");',
		'expect(nhan).toBe("Đã kýhợp đồng");',
		"expect( a ).toBe( 1 );",
	].join("\n");
	const { sai } = mat(truoc, sau);
	if (sai.length !== 2) {
		console.error(
			`tu-thu: mong 2 sai, duoc ${sai.length}: ${JSON.stringify(sai)}`,
		);
		process.exit(2);
	}
	console.log(
		"tu-thu 3/3: sua gia tri nhieu dong -> bat; sua khoang trang trong chuoi -> bat; doi khoang trang ngoai chuoi -> khong bat",
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
	const sau = git("show", `HEAD:${tep}`);
	tongTruoc += cauExpect(truoc).length;
	const { sai, choPhep } = mat(truoc, sau);
	tongChoPhep += choPhep;
	tongSai += sai.length;
	for (const c of sai) console.error(`${tep}: expect bi xoa hay sua: ${c}`);
}
console.log(
	`moc ${moc.slice(0, 9)} · ${TEP.length} tep · ${tongTruoc} cau expect san co · ${tongChoPhep} cau cho phep mat`,
);
if (tongSai > 0) process.exit(1);
console.log("khong expect san co nao bi xoa hay sua");
