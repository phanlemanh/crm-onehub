import { spawnSync } from "node:child_process";
import {
	closeSync,
	openSync,
	readFileSync,
	statSync,
	unlinkSync,
	writeSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

export function thoat(ma, ...dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

export function ghim(ten, thuc, mong) {
	if (thuc !== mong) {
		throw new Error(
			`HANG GHIM LECH: ${ten} — dem duoc ${thuc}, ban khai noi ${mong}.\n` +
				"   Hai con so cung suy tu mot luot quet la 0 bang 0 khi glob neo sai goc,\n" +
				"   nen hang phai chep tay tu cay va so TRUOC khi dem vi pham.",
		);
	}
	return thuc;
}

export function bang(tieu_de, hang) {
	console.log(tieu_de);
	for (const d of hang) console.log(`   ${d}`);
}

export function chay(lenh, doi_so, tuy = {}) {
	const r = spawnSync(lenh, doi_so, {
		cwd: tuy.cwd ?? GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		env: { ...process.env, ...(tuy.env ?? {}) },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const KHOA = "/tmp/thuoc-khai-dung-tieng.khoa";
const KHOA_HET_HAN = 30 * 60 * 1000;
const KHOA_CHO_TOI_DA = 9 * 60 * 1000;

export async function giuKhoa(ten) {
	if (process.env.KHOA_DA_GIU === "1") {
		console.log(`-- KHOA: ${ten} di qua, khoa da do lan chay cha giu.`);
		return () => {};
	}
	const batDau = Date.now();
	for (;;) {
		try {
			const fd = openSync(KHOA, "wx");
			writeSync(fd, `${ten} ${process.pid} ${new Date().toISOString()}\n`);
			closeSync(fd);
			console.log(`-- KHOA: ${ten} giu ${KHOA}`);
			return () => {
				try {
					unlinkSync(KHOA);
				} catch {}
			};
		} catch (loi) {
			if (loi.code !== "EEXIST") throw loi;
			let cu = "";
			try {
				cu = readFileSync(KHOA, "utf8").trim();
				const tuoi = Date.now() - statSync(KHOA).mtimeMs;
				if (tuoi > KHOA_HET_HAN) {
					console.log(`-- KHOA: go khoa qua han cua ${JSON.stringify(cu)}`);
					unlinkSync(KHOA);
					continue;
				}
			} catch {
				continue;
			}
			if (Date.now() - batDau > KHOA_CHO_TOI_DA) {
				throw new Error(
					`KHONG DO DUOC: doi khoa qua ${KHOA_CHO_TOI_DA / 60000} phut, dang giu boi ${JSON.stringify(cu)}.\n` +
						"   Nam chan do cua vong nay dung CHUNG mot CSDL dev va chung tep vung-khai.json,\n" +
						"   nen chay song song la do lan nhau. Khoa nay ep chung tuan tu.\n" +
						"   Nguong 9 phut dat DUOI tran 600 giay cua cong cu cham, de mot va cham\n" +
						"   thanh mot LOI KHAI TIEN DE doc duoc, khong phai mot lan bi cat cam.\n" +
						"   Cach chay lai: chay rieng dung o nay, khong chay cung luc voi o khac.",
				);
			}
			await new Promise((r) => setTimeout(r, 3000));
		}
	}
}
