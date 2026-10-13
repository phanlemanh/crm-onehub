import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { docDanhSach, GOC, hong } from "./chung.mjs";

function goiDesignGate() {
	const goc = execFileSync(
		"node",
		[join(GOC, "scripts", "resolve-plugin.mjs"), "--plugin", "acceptance-gate", "--require", "scripts/design-gate.mjs", "--require", "scripts/design-scan.js"],
		{ cwd: GOC, encoding: "utf8" },
	).trim();
	return (tep) => {
		const r = spawnSync("node", [join(goc, "scripts", "design-gate.mjs"), "--target", tep, "--mode", "static"], {
			cwd: GOC,
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		return { dat: r.status === 0, chu: `${r.stdout}${r.stderr}` };
	};
}

function apDotBien(that, db) {
	if (Array.isArray(db.thay)) {
		const [cu, moi] = db.thay;
		return that.includes(cu) ? that.split(cu).join(moi) : null;
	}
	if (Array.isArray(db.thay_cap)) {
		let ra = that;
		for (const [cu, moi] of db.thay_cap) {
			if (!ra.includes(cu)) return null;
			ra = ra.replace(cu, moi);
		}
		return ra;
	}
	if (Array.isArray(db.thay_mot)) {
		const [cu, moi] = db.thay_mot;
		return that.includes(cu) ? that.replace(cu, moi) : null;
	}
	if (db.chen !== undefined && db.chen !== null) {
		const i = that.lastIndexOf("</");
		return i < 0 ? null : `${that.slice(0, i)}${String(db.chen)}${that.slice(i)}`;
	}
	return null;
}

function chay(argv) {
	const r = spawnSync(argv[0], argv.slice(1), { cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
	return { ma: r.status, chu: `${r.stdout}${r.stderr}` };
}

async function hamCua(db) {
	const mod = await import(pathToFileURL(join(GOC, db.mo_dun)).href);
	return mod[db.ham] instanceof Function ? mod[db.ham] : null;
}

async function soiKhongTep(db) {
	if (db.kieu === "lenh-chua") {
		const r = chay(db.lenh);
		return { thatDat: r.ma === 0 && r.chu.includes(db.chua), dotDat: false, chuDot: r.chu };
	}
	if (db.kieu === "ham-chuoi" || db.kieu === "ham-git") {
		const ham = await hamCua(db);
		if (!ham) return { ma: "HAM_VANG" };
		const that = db.kieu === "ham-git" ? execFileSync("git", db.git, { cwd: GOC, encoding: "utf8" }) : db.vao;
		const dot = db.kieu === "ham-git" ? `${that}${db.them}\n` : db.vao_dot;
		const t = ham(that);
		const d = ham(dot);
		return { thatDat: t.dat, dotDat: d.dat, chuDot: d.chu };
	}
	if (db.kieu === "lenh-goc") {
		const thuMuc = mkdtempSync(join(tmpdir(), "chieu-do-goc-"));
		try {
			const tar = join(thuMuc, "cay.tar");
			execFileSync("git", ["archive", "--output", tar, db.sha, db.thu_muc], { cwd: GOC });
			execFileSync("tar", ["-xf", tar, "-C", thuMuc]);
			const tep = join(thuMuc, db.tep);
			const goc = readFileSync(tep, "utf8");
			const dot = apDotBien(goc, db);
			if (dot === null || dot === goc) return { ma: "DOT_BIEN_LECH" };
			writeFileSync(tep, dot);
			const t = chay(["node", join(GOC, db.rang)]);
			const d = chay(["node", join(GOC, db.rang), "--goc", thuMuc]);
			return { thatDat: t.ma === 0, dotDat: d.ma === 0, chuDot: d.chu };
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	}
	return null;
}

async function soiDotBien(db) {
	const khongTep = await soiKhongTep(db);
	if (khongTep) return khongTep;
	const duong = join(GOC, db.tep);
	const that = readFileSync(duong, "utf8");
	const dot = db.xoa_tep ? "" : apDotBien(that, db);
	if (dot === null || (!db.xoa_tep && dot === that)) return { ma: "DOT_BIEN_LECH" };
	if (db.kieu === "design-gate") {
		const gate = goiDesignGate();
		const thuMuc = mkdtempSync(join(tmpdir(), "chieu-do-"));
		try {
			const ban = join(thuMuc, basename(db.tep));
			if (!db.xoa_tep) writeFileSync(ban, dot);
			const t = gate(db.tep);
			const d = gate(ban);
			return { thatDat: t.dat, dotDat: d.dat, chuDot: d.chu };
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	}
	if (db.kieu === "ham") {
		const mod = await import(pathToFileURL(join(GOC, db.mo_dun)).href);
		const ham = mod[db.ham];
		if (!(ham instanceof Function)) return { ma: "HAM_VANG" };
		const t = ham(that);
		const d = ham(dot);
		return { thatDat: t.dat, dotDat: d.dat, chuDot: d.chu };
	}
	return { ma: "KIEU_LA" };
}

if (import.meta.main) {
	const ds = docDanhSach().dong.filter((r) => r.xu_ly === "sua-rang");
	if (!ds.length) hong(2, "MA 2: danh sach khong co dong sua-rang");
	let loi = 0;
	let lech = 0;
	for (const r of ds) {
		const k = `${r.ho_so}:${r.eval}`;
		if (!Array.isArray(r.dot_bien) || !r.dot_bien.length) {
			console.log(`HONG THIEU_DOT_BIEN ${k}`);
			loi++;
			continue;
		}
		for (const db of r.dot_bien) {
			const kq = await soiDotBien(db);
			if (kq.ma) {
				console.log(`HONG ${kq.ma} ${k} ${db.ten}`);
				lech++;
				continue;
			}
			const batDung = !kq.dotDat && (!db.thong_diep_may || kq.chuDot.includes(db.thong_diep_may));
			if (kq.thatDat && batDung) console.log(`${k} ${db.ten}: that dat, dot bien bat — ${db.thong_diep}`);
			else {
				console.log(`HONG ${k} ${db.ten}: that ${kq.thatDat ? "dat" : "KHONG dat"}, dot bien ${kq.dotDat ? "KHONG bi bat" : "bat sai thong diep"}`);
				loi++;
			}
		}
	}
	console.log(`chieu-do: ${ds.length} dong sua-rang, ${loi + lech ? `${loi + lech} loi` : "moi rang sua con bat loi"}`);
	process.exit(lech ? 2 : loi ? 1 : 0);
}
