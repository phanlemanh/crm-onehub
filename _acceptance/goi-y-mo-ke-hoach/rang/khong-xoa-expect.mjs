import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
// Mọi tệp kiểm ĐÃ CÓ ở mốc mà nhánh sửa (không riêng một danh sách tay): đo lời hứa AC-10 của
// goi-y-mo-ke-hoach trên đúng các tệp vòng này chạm.
const MAU_TEP_KIEM =
	/(^|\/)test\/.*\.(spec|integration\.spec|dom)\.tsx?$|\.spec\.tsx?$/;
// Tệp kiểm ĐÃ CÓ ở mốc mà nhánh sửa (M), xoá (D) hay đổi tên (R): xoá một tệp kiểm là cách xoá expect
// triệt để nhất, nên D so với nội dung rỗng và R so tên cũ ở mốc với tên mới ở HEAD.
function docTenTrangThai(chu) {
	return chu
		.split("\n")
		.filter(Boolean)
		.map((d) => d.split("\t"))
		.flatMap(([ma, cu, moi]) => {
			if (!ma || !cu) return [];
			const loai = ma[0];
			if (loai === "M" || loai === "D") return [{ loai, cu, moi: loai === "D" ? null : cu }];
			if (loai === "R" && moi) return [{ loai, cu, moi }];
			return [];
		})
		.filter((t) => MAU_TEP_KIEM.test(t.cu));
}
function tepKiemDaSua(moc) {
	return docTenTrangThai(
		git("diff", "--name-status", "-M", "--diff-filter=MDR", moc, "HEAD"),
	);
}
// Câu expect được phép mất, mỗi câu kèm lý do có tên. goi-y-mo-ke-hoach không lật lời hứa nào của hồ sơ
// khác, nên danh sách rỗng.
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
	const ds = docTenTrangThai(
		"M\tapps/api/test/a.spec.ts\nD\tapps/api/test/b.spec.ts\nR087\tapps/api/test/c.spec.ts\tapps/api/test/d.spec.ts\nM\tapps/api/src/x.ts\n",
	);
	const mongDs = JSON.stringify([
		{ loai: "M", cu: "apps/api/test/a.spec.ts", moi: "apps/api/test/a.spec.ts" },
		{ loai: "D", cu: "apps/api/test/b.spec.ts", moi: null },
		{ loai: "R", cu: "apps/api/test/c.spec.ts", moi: "apps/api/test/d.spec.ts" },
	]);
	if (JSON.stringify(ds) !== mongDs) {
		console.error(`tu-thu: doc ten-trang-thai sai ${JSON.stringify(ds)}`);
		process.exit(2);
	}
	if (mat('expect(a).toBe(1);', "").sai.length !== 1) {
		console.error("tu-thu: tep bi xoa khong bat");
		process.exit(2);
	}
	console.log(
		"tu-thu 5/5: sua gia tri nhieu dong -> bat; sua khoang trang trong chuoi -> bat; doi khoang trang ngoai chuoi -> khong bat; doc M/D/R -> dung; tep bi xoa -> bat",
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
const TEP = tepKiemDaSua(moc);
for (const { cu, moi } of TEP) {
	const tep = moi ?? cu;
	const truoc = git("show", `${moc}:${cu}`);
	const sau = moi === null ? "" : readFileSync(path.join(GOC, moi), "utf8");
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
