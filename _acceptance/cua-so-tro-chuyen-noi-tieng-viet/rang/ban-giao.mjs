import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { docTep } from "../../man-cai-dat-noi-tieng-viet/rang/tep-thay.mjs";

const XUONG = join(GOC, "_acceptance");
const NEO_DOT_MOT = { file: 26, file_quet: 20, chuoi: 237, van_ban: 180, thuoc_tinh: 57 };
const SO_DONG_KHONG_QUET_DOT_MOT = 6;

function docKhai(duong) {
	try {
		return JSON.parse(docTep(duong));
	} catch {
		return null;
	}
}

function banKhaiCuaHoSo(slug) {
	const thuMuc = join(XUONG, slug, "rang");
	if (!existsSync(thuMuc)) return null;
	for (const t of readdirSync(thuMuc))
		if (t.startsWith("lat-") && t.endsWith(".json")) {
			const k = docKhai(join(thuMuc, t));
			if (k !== null) return { duong: join(thuMuc, t), khai: k };
		}
	return null;
}

function quetDuoc(khai, duongFile) {
	const trongThuMuc = (khai.thu_muc ?? []).some((tm) => duongFile.startsWith(`${tm}/`));
	const themVao = (khai.them ?? []).includes(duongFile);
	const biLoai = (khai.khong_quet ?? []).some((k) => k.duong === duongFile);
	return (trongThuMuc || themVao) && !biLoai;
}

const hong = [];
const doiChieu = [];

for (const slug of readdirSync(XUONG)) {
	const ben = banKhaiCuaHoSo(slug);
	if (ben === null) continue;
	for (const dong of ben.khai.khong_quet ?? []) {
		const nhan = dong.chuyen_giao;
		if (String(nhan) !== nhan) continue;
		doiChieu.push(`${slug} → ${nhan} · ${dong.duong.split("/").pop()}`);
		const kia = banKhaiCuaHoSo(nhan);
		if (kia === null) {
			hong.push(
				`${slug} khai ban giao "${dong.duong}" cho "${nhan}", nhung ho so do khong ton tai hoac khong co ban khai lat`,
			);
			continue;
		}
		if (!quetDuoc(kia.khai, dong.duong))
			hong.push(
				`${slug} khai ban giao "${dong.duong}" cho "${nhan}", nhung ban khai cua "${nhan}" KHONG quet file do`,
			);
	}
}

console.log(`quan he ban giao: ${doiChieu.length} dong doi chieu duoc`);
for (const d of doiChieu) console.log(`   ${d}`);
for (const d of hong) console.log(`   HONG: ${d}`);

if (doiChieu.length === 0) {
	console.log(
		"KHONG DO DUOC: khong dong ban giao nao trong ca xuong. Tap quan sat rong khong bao gio la dat.",
	);
	process.exit(2);
}
if (hong.length > 0) process.exit(1);

const banDotMot = banKhaiCuaHoSo("agent-builder-noi-tieng-viet");
if (banDotMot === null) {
	console.log("KHONG DO DUOC: khong doc duoc ban khai cua ho so dot mot.");
	process.exit(2);
}

const ra = execFileSync(
	"node",
	[join(GOC, "_acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs"), "--lat", banDotMot.duong],
	{ cwd: GOC, encoding: "utf8", env: process.env },
);
const soFile = ra.match(/XANH:\s*(\d+)\s*file/);
if (soFile === null) {
	console.log("KHONG DO DUOC: chan khai sinh cua dot mot khong in ra so file — khong doc duoc ket qua.");
	process.exit(2);
}
const doLai = Number(soFile[1]);
const khaiRa = banDotMot.khai.neo ?? {};
const lech = [];
if (doLai !== khaiRa.file_quet)
	lech.push(`chan khai sinh do lai ${doLai} file quet, ban khai ghi ${khaiRa.file_quet}`);
for (const [k, v] of Object.entries(NEO_DOT_MOT))
	if (khaiRa[k] !== v)
		lech.push(`neo ${k}: ban khai ghi ${khaiRa[k]}, hop dong dot mot ghim ${v}`);
if ((banDotMot.khai.khong_quet ?? []).length !== SO_DONG_KHONG_QUET_DOT_MOT)
	lech.push(
		`so dong khong_quet cua dot mot: ${(banDotMot.khai.khong_quet ?? []).length}, hop dong ghim ${SO_DONG_KHONG_QUET_DOT_MOT}`,
	);

console.log(
	`\nneo cua dot mot: chan khai sinh DO LAI tren dia ra ${doLai} file quet · ban khai ghi ${khaiRa.file_quet} · hop dong ghim ${NEO_DOT_MOT.file_quet} · khong_quet ${(banDotMot.khai.khong_quet ?? []).length}/${SO_DONG_KHONG_QUET_DOT_MOT}`,
);
for (const d of lech) console.log(`   LECH: ${d}`);
if (lech.length > 0) process.exit(1);

console.log("XANH: moi dong ban giao tro dung, va neo cua ho so da ky con nguyen sau khi do lai tren dia.");
process.exit(0);
