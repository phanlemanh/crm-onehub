import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	DANH_SACH,
	DO_LAI_NEN,
	docDanhSach,
	docJson,
	docTai,
	dungCayTam,
	EVAL_TEP,
	evalMay,
	HO_SO_DIR,
	hoSoYamlHong,
	khoa,
	MOC_NEN,
	tapDauVao,
	tapDo,
	XU_LY,
} from "./chung.mjs";

const XU_LY_CU_PHAP = "sua-cu-phap";

export function soContext(contractText) {
	const ctx = contractText.split("## Context")[1]?.split("\n## ")[0] ?? "";
	const hoSo = /\*\*(\d+) hồ sơ\*\*/.exec(ctx);
	const evDo = /(\d+) eval, (\d+) đỏ/.exec(ctx);
	return hoSo && evDo ? { hoSo: +hoSo[1], eval: +evDo[1], do: +evDo[2] } : null;
}

export function evalKyVong(dauVao, configText) {
	const ra = new Map();
	for (const slug of dauVao) {
		const t = docTai(MOC_NEN, `_acceptance/${slug}/${EVAL_TEP}`);
		ra.set(slug, t === null ? [] : evalMay(configText, t).may.map((e) => e.id));
	}
	return ra;
}

export function kiemDanhSach({ ds, doLai, dauVao, kyVong, yamlHong, context }) {
	const loi = [];
	if (doLai.sha !== MOC_NEN) return { ma: 2, loi: [`MA 2: do-lai-nen.json mang sha ${doLai.sha}, khac moc nen ${MOC_NEN}`] };
	const daDo = new Map(doLai.ho_so.map((h) => [h.slug, h.eval.map((e) => e.id)]));
	for (const slug of dauVao) {
		const co = new Set(daDo.get(slug) ?? []);
		for (const id of kyVong.get(slug) ?? []) if (!co.has(id)) loi.push(`THIEU_DO ${slug}:${id}`);
		const can = new Set(kyVong.get(slug) ?? []);
		for (const id of co) if (!can.has(id)) loi.push(`THUA_DO ${slug}:${id}`);
	}
	for (const slug of daDo.keys()) if (!dauVao.includes(slug)) loi.push(`THUA_DO ${slug}:*`);
	const doTap = new Set(tapDo(doLai).map(khoa));
	const khai = new Map();
	for (const d of ds.dong) {
		if (!XU_LY.includes(d.xu_ly)) loi.push(`XU_LY_LA ${khoa(d)}: ${d.xu_ly}`);
		if (d.xu_ly === XU_LY_CU_PHAP) continue;
		if (khai.has(khoa(d))) loi.push(`TRUNG ${khoa(d)}`);
		khai.set(khoa(d), d);
	}
	for (const h of ds.hoan_lai) for (const ev of h.eval_do) khai.set(`${h.ho_so}:${ev}`, h);
	for (const k of doTap) if (!khai.has(k)) loi.push(`THIEU ${k}`);
	for (const k of khai.keys()) if (!doTap.has(k)) loi.push(`THUA ${k}`);
	for (const slug of yamlHong) {
		const n = ds.dong.filter((d) => d.ho_so === slug && d.xu_ly === XU_LY_CU_PHAP).length;
		if (n !== 1) loi.push(`THIEU_SUA_CU_PHAP ${slug} (${n} dong)`);
	}
	const soEval = [...kyVong.values()].reduce((a, v) => a + v.length, 0);
	const so = { hoSo: dauVao.length, eval: soEval, do: doTap.size };
	if (!context || context.hoSo !== so.hoSo || context.eval !== so.eval || context.do !== so.do)
		loi.push(`SO_LECH_CONTEXT do ${JSON.stringify(so)} · contract ${JSON.stringify(context)}`);
	const soDong = ds.dong.filter((d) => d.xu_ly !== XU_LY_CU_PHAP).length;
	const soHoanLai = ds.hoan_lai.reduce((a, h) => a + h.eval_do.length, 0);
	return { ma: loi.length ? 1 : 0, loi, so, soDong, soHoanLai };
}

function tuKiem(dauVao) {
	const sai = [];
	const ds = structuredClone(dauVao.ds);
	const bo = ds.dong.find((d) => d.xu_ly !== XU_LY_CU_PHAP);
	ds.dong = ds.dong.filter((d) => d !== bo);
	if (!kiemDanhSach({ ...dauVao, ds }).loi.includes(`THIEU ${khoa(bo)}`)) sai.push(`bo dong ${khoa(bo)} khong ra THIEU`);
	const ds2 = structuredClone(dauVao.ds);
	ds2.dong.push({ ho_so: "ho-so-bia", eval: "E99", xu_ly: "sua-rang" });
	if (!kiemDanhSach({ ...dauVao, ds: ds2 }).loi.includes("THUA ho-so-bia:E99")) sai.push("dong bia khong ra THUA");
	const doLai = structuredClone(dauVao.doLai);
	const h = doLai.ho_so[0];
	const ev = h.eval.shift();
	if (!kiemDanhSach({ ...dauVao, doLai }).loi.includes(`THIEU_DO ${h.slug}:${ev.id}`)) sai.push("bo eval khoi do-lai khong ra THIEU_DO");
	return sai;
}

function taiLap(dauVao, doLai) {
	const { cay } = dungCayTam(MOC_NEN, "hsdk-tai-lap");
	const dich = join(cay, "_acceptance", "ho-so-do-kiem-cheo", "rang");
	mkdirSync(dich, { recursive: true });
	copyFileSync(join(HO_SO_DIR, "rang", "do-lai.mjs"), join(dich, "do-lai.mjs"));
	const ra = join(cay, "..", "tai-lap.json");
	const r = spawnSync("node", [join(dich, "do-lai.mjs"), "--ra", ra, "--bo-may-chu", ...dauVao], {
		cwd: cay,
		encoding: "utf8",
		stdio: ["ignore", "inherit", "inherit"],
	});
	if (r.status !== 0) return { loi: [`MA 2: tai lap do-lai.mjs thoat ${r.status}`], a: 0, b: 0 };
	const moi = JSON.parse(readFileSync(ra, "utf8"));
	const cu = new Map(doLai.ho_so.flatMap((h) => h.eval.map((e) => [`${h.slug}:${e.id}`, e])));
	const loi = [];
	let a = 0;
	let b = 0;
	for (const h of moi.ho_so)
		for (const e of h.eval) {
			const k = `${h.slug}:${e.id}`;
			if (e.bo) {
				b += 1;
				continue;
			}
			a += 1;
			const c = cu.get(k);
			const doCu = c ? c.exit !== c.ky_vong : null;
			const doMoi = e.exit !== e.ky_vong;
			if (doCu !== doMoi) loi.push(`DO_LAI_LECH ${k}: nen ${c ? c.exit : "vang"} · tai lap ${e.exit}`);
		}
	return { loi, a, b };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const ds = docDanhSach(DANH_SACH);
	const doLai = docJson(DO_LAI_NEN);
	const configText = docTai(MOC_NEN, "_acceptance/config.yaml");
	const dauVao = tapDauVao(MOC_NEN);
	const vao = {
		ds,
		doLai,
		dauVao,
		kyVong: evalKyVong(dauVao, configText),
		yamlHong: hoSoYamlHong(MOC_NEN),
		context: soContext(readFileSync(join(HO_SO_DIR, "contract.md"), "utf8")),
	};
	const kq = kiemDanhSach(vao);
	if (kq.ma === 2) {
		console.error(kq.loi.join("\n"));
		process.exit(2);
	}
	const sai = tuKiem(vao);
	if (sai.length) {
		console.error(`HONG tu kiem: ${sai.join("; ")}`);
		process.exit(1);
	}
	let loi = kq.loi;
	if (process.argv.includes("--tai-lap")) {
		const t = taiLap(dauVao, doLai);
		loi = loi.concat(t.loi);
		console.log(`tai-lap: ${t.a} eval tai lap · ${t.b} eval can may chu khong tai lap (khai)`);
	}
	for (const l of loi) console.log(l);
	console.log(
		`danh-sach: ${kq.so.hoSo} hồ sơ đầu vào · ${kq.so.eval} eval máy · ${kq.soDong} dòng + ${kq.soHoanLai} eval hoàn lại = ${kq.so.do} đỏ ở mốc nền ${MOC_NEN}`,
	);
	process.exit(loi.length ? 1 : 0);
}
