import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { GOC, LUAT_KHO } from "./luat-kho-cau-hinh.mjs";

const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);

const goiXuat = z.object({ exports: z.record(z.string(), z.string()) });

export function nguonNhap(noiDung) {
	return [
		...new Set(
			[
				...noiDung.matchAll(
					/(?:^|\n)\s*(?:import|export)[^;]*?from\s+"([^"]+)"/g,
				),
			].map((m) => m[1]),
		),
	];
}

const boNho = new Map();

export function tenNhap(noiDung) {
	return [
		...noiDung.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s+"([^"]+)"/g),
	].flatMap((m) =>
		m[1]
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t !== "" && !t.startsWith("type "))
			.map((t) => {
				const [goc, ten] = t.split(/\s+as\s+/);
				return { goc, ten: ten ?? goc, nguon: m[2] };
			}),
	);
}

function tepGoiNoiBo(nguon) {
	for (const [tien, thuMuc] of Object.entries(LUAT_KHO.kiemLai.goiNoiBo)) {
		if (!nguon.startsWith(tien)) continue;
		const xuat = goiXuat.parse(
			JSON.parse(readFileSync(join(GOC, thuMuc, "package.json"), "utf8")),
		).exports;
		const dich = xuat[`./${nguon.slice(tien.length)}`];
		return dich === undefined ? null : join(thuMuc, dich);
	}
	return null;
}

function tepCua(tu, nguon) {
	if (nguon.startsWith("./")) return join(dirname(tu), `${nguon}.ts`);
	return tepGoiNoiBo(nguon);
}

export function moDun(tep) {
	if (boNho.has(tep)) return boNho.get(tep);
	const noiDung = readFileSync(join(GOC, tep), "utf8");
	const dong = noiDung.split("\n");
	const ham = new Map();
	dong.forEach((d, i) => {
		const m = LUAT_KHO.ghiDb.khaiHam.exec(d);
		if (!m) return;
		let j = i + 1;
		while (j < dong.length && !/^\}/.test(dong[j])) j += 1;
		ham.set(m[1], { bat: i, het: j });
	});
	const nhap = new Map(
		tenNhap(noiDung)
			.map((n) => [n.ten, { goc: n.goc, tep: tepCua(tep, n.nguon) }])
			.filter(([, v]) => v.tep !== null),
	);
	const md = { tep, noiDung, dong, ham, nhap };
	boNho.set(tep, md);
	return md;
}

function lenhGhiO(dong, k) {
	const g = LUAT_KHO.ghiDb;
	if (/\$executeRaw/.test(dong[k]))
		return { mo: "$executeRaw", lenh: "executeRaw" };
	const noi = dong
		.slice(Math.max(0, k - LUAT_KHO.ghiPrisma.nhinLui), k + 1)
		.join(" ");
	const m = [...noi.matchAll(g.nhanPrisma)].at(-1);
	return m ? { mo: m[1], lenh: m[2] } : null;
}

function duLieuSau(dong, k) {
	for (let t = k; t <= k + LUAT_KHO.ghiDb.nhinToi && t < dong.length; t += 1) {
		const m = LUAT_KHO.ghiDb.duLieu.exec(dong[t]);
		if (m)
			return m[1].trim() === "{" ? "{ …nhiều dòng }" : m[1].replace(/,$/, "");
	}
	return null;
}

function ghiTrongHam(tep, ten, chuoi, daQua) {
	const khoa = `${tep}#${ten}`;
	if (daQua.has(khoa)) return { ghi: [], khong: [] };
	daQua.add(khoa);
	const md = moDun(tep);
	const h = md.ham.get(ten);
	if (!h) return { ghi: [], khong: [] };
	const ghi = [];
	const khong = [];
	const duong = [...chuoi, ten];
	for (let k = h.bat + 1; k <= h.het; k += 1) {
		const d = md.dong[k];
		if (LUAT_KHO.ghiDb.lenhGhi.test(d)) {
			const l = lenhGhiO(md.dong, k);
			const vitri = `${tep}:${k + 1}`;
			if (l) ghi.push({ duong, vitri, ...l, duLieu: duLieuSau(md.dong, k) });
			else
				khong.push({
					duong,
					vitri,
					chu: md.dong
						.slice(Math.max(0, k - 1), k + 1)
						.map((x) => x.trim())
						.join(" "),
				});
		}
		for (const [, goi] of d.matchAll(/\b([A-Za-z_]\w*)\s*[<(]/g)) {
			if (goi === ten) continue;
			const tiep = md.ham.has(goi)
				? { tep, ten: goi }
				: md.nhap.has(goi)
					? { tep: md.nhap.get(goi).tep, ten: md.nhap.get(goi).goc }
					: null;
			if (!tiep) continue;
			const r = ghiTrongHam(tiep.tep, tiep.ten, duong, daQua);
			ghi.push(...r.ghi);
			khong.push(...r.khong);
		}
	}
	return { ghi, khong };
}

export function ghiQuaDb() {
	const hang = [];
	const khong = [];
	for (const g of LUAT_KHO.ghiDb.goi) {
		const noiDung = readFileSync(join(GOC, g.tep), "utf8");
		const dong = noiDung.split("\n");
		for (const n of tenNhap(noiDung).filter((x) => g.nguon.test(x.nguon))) {
			const tepDb = tepGoiNoiBo(n.nguon);
			if (!tepDb || !moDun(tepDb).ham.has(n.goc)) continue;
			const noiGoi = dong
				.map((d, i) => ({ d, so: i + 1 }))
				.filter(
					({ d }) =>
						!/^\s*import\b/.test(d) &&
						new RegExp(`\\b${n.ten}\\s*[<(]`).test(d),
				)
				.map(({ so }) => `${g.tep}:${so}`);
			if (noiGoi.length === 0) continue;
			const r = ghiTrongHam(tepDb, n.goc, [], new Set());
			hang.push(...r.ghi.map((x) => ({ ...x, noiGoi })));
			khong.push(...r.khong);
		}
	}
	return { hang, khong };
}

export function baoNhap(tep, daQua = new Set()) {
	if (daQua.has(tep)) return { tep: [], ngoai: [] };
	daQua.add(tep);
	const md = moDun(tep);
	const nguon = [
		...new Set(tenNhap(md.noiDung).map((n) => n.nguon)),
		...nguonNhap(md.noiDung),
	];
	const ra = { tep: [tep], ngoai: [] };
	for (const n of new Set(nguon)) {
		const t = tepCua(tep, n);
		if (t === null) {
			ra.ngoai.push(n);
			continue;
		}
		const con = baoNhap(t, daQua);
		ra.tep.push(...con.tep);
		ra.ngoai.push(...con.ngoai);
	}
	return { tep: [...new Set(ra.tep)], ngoai: [...new Set(ra.ngoai)] };
}
