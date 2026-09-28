import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
	chayBanSao,
	chup,
	docSpec,
	doiDich,
	GOC,
	ketThuc,
	MocVang,
	soChup,
	thayDungSoLan,
} from "./ban-sao.mjs";
import { CAU_HINH } from "./cau-hinh.mjs";

const RA = join(GOC, CAU_HINH.raGoc, `E4-${process.pid}`);
const [VE, MO] = CAU_HINH.taoPhamHoSoKy;

function gitShow(duong) {
	try {
		return execFileSync("git", ["show", `${CAU_HINH.neo}:${duong}`], {
			cwd: GOC,
			encoding: "utf8",
			maxBuffer: 32 * 1024 * 1024,
		});
	} catch (e) {
		throw new MocVang(
			`git show ${CAU_HINH.neo}:${duong} that bai: ${e.message.slice(0, 160)}`,
		);
	}
}

function tienKiem() {
	for (const p of CAU_HINH.tepDo)
		if (gitShow(p) !== readFileSync(join(GOC, p), "utf8"))
			throw new MocVang(`tep do da doi, phep so khong co lap spec: ${p}`);
}

function luot(nhan, src) {
	const thuMuc = join(RA, nhan);
	chayBanSao(doiDich(src, thuMuc), nhan, thuMuc);
	for (const t of CAU_HINH.taoPhamHoSoKy)
		if (!existsSync(join(thuMuc, t)))
			throw new MocVang(`luot ${nhan} khong ghi ${t}`);
	return thuMuc;
}

function lech(a, b, t) {
	const ba = readFileSync(join(a, t));
	const bb = readFileSync(join(b, t));
	if (ba.equals(bb)) return null;
	const ja = JSON.parse(ba.toString("utf8"));
	const jb = JSON.parse(bb.toString("utf8"));
	const khoa = [...new Set([...Object.keys(ja), ...Object.keys(jb)])].sort();
	return (
		khoa.find((k) => JSON.stringify(ja[k]) !== JSON.stringify(jb[k])) ??
		"(chi khac dinh dang)"
	);
}

function soSanh(goc) {
	tienKiem();
	const cu = luot("cu", gitShow(CAU_HINH.spec));
	const moi = luot("moi", goc);
	const doA = luot(
		"do-a",
		thayDungSoLan(
			goc,
			'laiMotFile(f, "en", tin)',
			'laiMotFile(f, "vi", tin)',
			1,
		),
	);
	const doB = luot(
		"do-b",
		thayDungSoLan(
			goc,
			'ban.length === 0 ? "khong co xuat nao ve duoc" : null',
			'"khong co xuat nao ve duoc"',
			1,
		),
	);
	const dong = [];
	let ma = 0;
	for (const t of CAU_HINH.taoPhamHoSoKy) {
		const k = lech(cu, moi, t);
		if (k !== null) {
			ma = 1;
			dong.push(`ban ve lech: ${t} khoa ${k}`);
			continue;
		}
		const co = statSync(join(moi, t)).size;
		const soKhoa = Object.keys(
			JSON.parse(readFileSync(join(moi, t), "utf8")),
		).length;
		dong.push(
			`trung tung byte: ${t} (${co} byte, ${soKhoa} khoa) — spec ${CAU_HINH.neo.slice(0, 8)} va spec moi`,
		);
	}
	for (const [nhan, thuMuc, t] of [
		["a", doA, VE],
		["b", doB, MO],
	]) {
		const k = lech(moi, thuMuc, t);
		if (k === null) {
			ma = 1;
			dong.push(`dot bien (${nhan}) KHONG lam lech ${t}`);
		} else dong.push(`chieu do (${nhan}) da bat: ban ve lech: ${t} khoa ${k}`);
	}
	return { ma, dong };
}

const truoc = chup();
const dong = [];
let ma = 0;
try {
	const kq = soSanh(docSpec());
	ma = kq.ma;
	dong.push(...kq.dong);
} catch (e) {
	if (!(e instanceof MocVang)) throw e;
	ma = 2;
	dong.push(`KHONG DO DUOC: ${e.message}`);
} finally {
	const loi = soChup(truoc, chup());
	if (loi.length > 0) ma = 2;
	dong.push(...loi);
}
ketThuc(ma, dong);
