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
	if (typeof db.chen === "string") {
		const i = that.lastIndexOf("</");
		return i < 0 ? null : `${that.slice(0, i)}${db.chen}${that.slice(i)}`;
	}
	return null;
}

async function soiDotBien(db) {
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
		if (typeof ham !== "function") return { ma: "HAM_VANG" };
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
