import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DONG_EVAL = /^\[lane\] (\S+) (\S+?)(?: \(chạy lại\))?: (.*) → exit (-?\d+)/;
const DA_CHAY = "(đã chạy)";

export function docNhatKyDung(text, slugs) {
	const viTri = new Map(slugs.map((s, i) => [s, i]));
	const ketQua = new Map();
	let cuoi = -1;
	for (const dong of String(text ?? "").split("\n")) {
		const m = DONG_EVAL.exec(dong);
		if (!m || !viTri.has(m[1])) continue;
		const [, slug, id, lenh, ma] = m;
		cuoi = Math.max(cuoi, viTri.get(slug));
		const ds = ketQua.get(slug) ?? [];
		const cu = ds.find((x) => x.id === id);
		const lenhThat = lenh === DA_CHAY ? null : lenh;
		if (cu) {
			cu.ma = Number(ma);
			if (lenhThat) cu.lenh = lenhThat;
		} else ds.push({ id, lenh: lenhThat, ma: Number(ma) });
		ketQua.set(slug, ds);
	}
	return {
		xong: cuoi < 0 ? [] : slugs.slice(0, cuoi),
		dangDo: cuoi < 0 ? null : slugs[cuoi],
		ketQua,
	};
}

export function tapConLai({ tap, tienDo, chamMoi }) {
	const vanXong = new Set(tienDo.xong.filter((s) => !chamMoi.includes(s)));
	return tap.filter((s) => !vanXong.has(s));
}

export function gopDo({ cu, moi, doLai }) {
	const lai = new Set(doLai);
	return [...cu.filter((d) => !lai.has(d.ho_so)), ...moi];
}

export function docTienDo(tep, tu) {
	if (!existsSync(tep)) return { co: false };
	let o;
	try {
		o = JSON.parse(readFileSync(tep, "utf8"));
	} catch (e) {
		return { co: false, lyDo: `tien-do.json hong: ${String(e.message).split("\n")[0]}` };
	}
	if (typeof o?.tu !== "string" || typeof o?.den !== "string" || !Array.isArray(o?.xong) || !Array.isArray(o?.do)) {
		return { co: false, lyDo: "tien-do.json thieu truong tu/den/xong/do" };
	}
	if (o.tu !== tu) return { co: false, lyDo: `tien-do.json cua moc ${o.tu}, moc hien tai ${tu}` };
	return { co: true, tienDo: { tu: o.tu, den: o.den, xong: o.xong, do: o.do } };
}

export function ghiTienDo(tep, tienDo) {
	const tam = join(dirname(tep), `.tien-do.tam-${process.pid}-${Date.now()}`);
	writeFileSync(tam, `${JSON.stringify(tienDo, null, 1)}\n`);
	renameSync(tam, tep);
}

export function xoaTienDo(tep) {
	rmSync(tep, { force: true });
}

const DONG_SUITE = /^\[lane\] suite (\d+\/\d+)(?: \(chạy lại\))?: (.*) → exit (-?\d+)/;

export function suiteDoTrongNhatKy(text) {
	const cuoi = new Map();
	for (const dong of String(text ?? "").split("\n")) {
		const m = DONG_SUITE.exec(dong);
		if (m) cuoi.set(m[1], { lenh: m[2], ma: Number(m[3]) });
	}
	return [...cuoi].filter(([, v]) => v.ma !== 0).map(([i, v]) => `${i} (${v.lenh}) ma ${v.ma}`);
}
