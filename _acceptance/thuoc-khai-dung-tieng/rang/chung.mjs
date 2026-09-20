import { spawnSync } from "node:child_process";
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

export class LoiKhongChay extends Error {
	constructor(lenh, doi_so, cwd, r, ra) {
		const vi = r.error
			? `khong khoi dong duoc (${r.error.code ?? r.error.message})`
			: `bi giet bang tin hieu ${r.signal}`;
		super(
			`LENH KHONG CHO RA MA THOAT: ${lenh} ${doi_so.join(" ")}\n` +
				`   duoi ${cwd}\n` +
				`   ${vi}\n` +
				`   giu duoc ${ra.length} ky tu dau ra truoc khi dut.\n` +
				"   Khong co ma thoat thi khong co phep do. spawnSync tra status=null\n" +
				"   cho ca hai ca nay, va null !== 0 doc y het mot lenh DO that — do la\n" +
				"   cach mot luot chua he chay hoa trang thanh mot phat hien co ten.",
		);
		this.name = "LoiKhongChay";
		this.tin_hieu = r.signal ?? null;
		this.ma_loi = r.error?.code ?? null;
		this.ra = ra;
	}
}

export function chay(lenh, doi_so, tuy = {}) {
	const bat_dau = Date.now();
	const r = spawnSync(lenh, doi_so, {
		cwd: tuy.cwd ?? GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		env: { ...process.env, ...(tuy.env ?? {}) },
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (r.error || r.status === null) {
		throw new LoiKhongChay(lenh, doi_so, tuy.cwd ?? GOC, r, ra);
	}
	return { ma: r.status, ra, giay: (Date.now() - bat_dau) / 1000 };
}
