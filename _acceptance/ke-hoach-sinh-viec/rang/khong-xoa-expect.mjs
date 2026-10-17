import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
// Mọi tệp kiểm ĐÃ CÓ ở mốc mà nhánh sửa (không riêng một danh sách tay): đo lời hứa AC-10 của
// ke-hoach-sinh-viec trên đúng các tệp vòng này chạm.
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
			if (loai === "M" || loai === "D")
				return [{ loai, cu, moi: loai === "D" ? null : cu }];
			if (loai === "R" && moi) return [{ loai, cu, moi }];
			return [];
		})
		.filter((t) => MAU_TEP_KIEM.test(t.cu));
}
// Khoảng đếm: «--gop <sha gộp>» đo đúng cặp gộp của vòng (cha thứ nhất → chính commit gộp), nên các PR
// gộp vào nhánh chính SAU vòng không lọt vào phép đo; «--moc <sha>» giữ đường cũ (mốc → cây làm việc)
// cho lúc vòng chưa gộp.
function tepKiemDaSua(goc, moc, dich) {
	return docTenTrangThai(
		git(
			goc,
			"diff",
			"--name-status",
			"-M",
			"--diff-filter=MDR",
			moc,
			dich ?? "HEAD",
		),
	);
}
// Câu expect được phép mất, mỗi câu kèm lý do có tên. Chỉ một: AC-1 của ke-hoach-sinh-viec (Cổng
// Phạm vi 14/10) lật lời hứa «bước tạo từ khuôn chưa giao» của dieu-phoi-30-ngay-dau.
const CHO_PHEP = ["expect(step.assigneeId).toBeNull()"];

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

function git(goc, ...args) {
	return execFileSync("git", ["-C", goc, ...args], { encoding: "utf8" });
}

function doKhoang(goc, moc, dich) {
	const tep = tepKiemDaSua(goc, moc, dich);
	let tongSai = 0;
	let tongChoPhep = 0;
	let tongTruoc = 0;
	const loi = [];
	for (const { cu, moi } of tep) {
		const ten = moi ?? cu;
		const truoc = git(goc, "show", `${moc}:${cu}`);
		const sau =
			moi === null
				? ""
				: dich
					? git(goc, "show", `${dich}:${moi}`)
					: readFileSync(path.join(goc, moi), "utf8");
		tongTruoc += cauExpect(truoc).length;
		const { sai, choPhep } = mat(truoc, sau);
		tongChoPhep += choPhep;
		tongSai += sai.length;
		for (const c of sai) loi.push(`${ten}: expect bi xoa hay sua: ${c}`);
	}
	return { soTep: tep.length, tongSai, tongChoPhep, tongTruoc, loi };
}

function thuCapGop() {
	const kho = mkdtempSync(path.join(tmpdir(), "kh-cap-gop-"));
	const g = (...a) =>
		git(kho, "-c", "user.name=t", "-c", "user.email=t@t", ...a);
	const ghi = (ten, noiDung) => writeFileSync(path.join(kho, ten), noiDung);
	try {
		g("init", "-q", "-b", "chinh");
		execFileSync("mkdir", ["-p", path.join(kho, "test")]);
		ghi("test/a.spec.ts", "expect(a).toBe(1);\n");
		ghi("x.ts", "1\n");
		g("add", ".");
		g("commit", "-q", "-m", "goc");
		const capGop = (tenNhanh, tep, noiDung) => {
			g("checkout", "-q", "-b", tenNhanh, "chinh");
			ghi(tep, noiDung);
			g("commit", "-q", "-am", tenNhanh);
			g("checkout", "-q", "chinh");
			g("merge", "-q", "--no-ff", "-m", `gop ${tenNhanh}`, tenNhanh);
			return git(kho, "rev-parse", "HEAD").trim();
		};
		const sach = capGop("vong-sach", "x.ts", "2\n");
		const sauSach = doKhoang(kho, `${sach}^1`, sach);
		const ban = capGop(
			"vong-sua-expect",
			"test/a.spec.ts",
			"expect(a).toBe(2);\n",
		);
		const sauBan = doKhoang(kho, `${ban}^1`, ban);
		const sauBanRoiSach = doKhoang(kho, `${sach}^1`, sach);
		const ok =
			sauSach.tongSai === 0 &&
			sauBan.tongSai === 1 &&
			sauBan.loi[0] ===
				"test/a.spec.ts: expect bi xoa hay sua: expect(a).toBe(1)" &&
			sauBanRoiSach.tongSai === 0;
		if (!ok) {
			console.error(
				`tu-thu cap gop: sach ${sauSach.tongSai}, sua-expect ${JSON.stringify(sauBan.loi)}, sach-sau-PR-khac ${sauBanRoiSach.tongSai}`,
			);
			process.exit(2);
		}
	} finally {
		rmSync(kho, { recursive: true, force: true });
	}
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
		{
			loai: "M",
			cu: "apps/api/test/a.spec.ts",
			moi: "apps/api/test/a.spec.ts",
		},
		{ loai: "D", cu: "apps/api/test/b.spec.ts", moi: null },
		{
			loai: "R",
			cu: "apps/api/test/c.spec.ts",
			moi: "apps/api/test/d.spec.ts",
		},
	]);
	if (JSON.stringify(ds) !== mongDs) {
		console.error(`tu-thu: doc ten-trang-thai sai ${JSON.stringify(ds)}`);
		process.exit(2);
	}
	if (mat("expect(a).toBe(1);", "").sai.length !== 1) {
		console.error("tu-thu: tep bi xoa khong bat");
		process.exit(2);
	}
	thuCapGop();
	console.log(
		"tu-thu 6/6: sua gia tri nhieu dong -> bat; sua khoang trang trong chuoi -> bat; doi khoang trang ngoai chuoi -> khong bat; doc M/D/R -> dung; tep bi xoa -> bat; cap gop: vong sua expect -> bat, vong sach -> im, PR gop sau vong -> im",
	);
	process.exit(0);
}

const iGop = process.argv.indexOf("--gop");
const iMoc = process.argv.indexOf("--moc");
const dau =
	iGop >= 0
		? process.argv[iGop + 1]
		: iMoc >= 0
			? process.argv[iMoc + 1]
			: null;
if (!dau) {
	console.error(
		"thieu --gop <sha gop cua vong> hay --moc <sha>: moc phai ghim trong lenh, khong suy tu merge-base",
	);
	process.exit(2);
}
const dich = iGop >= 0 ? git(GOC, "rev-parse", dau).trim() : null;
const moc = git(GOC, "rev-parse", dich ? `${dich}^1` : dau).trim();
const kq = doKhoang(GOC, moc, dich);
for (const d of kq.loi) console.error(d);
console.log(
	`${dich ? `cap gop ${moc.slice(0, 9)}..${dich.slice(0, 9)}` : `moc ${moc.slice(0, 9)}`} · ${kq.soTep} tep · ${kq.tongTruoc} cau expect san co · ${kq.tongChoPhep} cau cho phep mat`,
);
if (kq.tongSai > 0) process.exit(1);
console.log("khong expect san co nao bi xoa hay sua");
