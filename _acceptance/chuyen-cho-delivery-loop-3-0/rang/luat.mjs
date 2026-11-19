import { BANG_TEN, SAU_PLUGIN_CU, SAU_PLUGIN_MOI, THE } from "./kit.mjs";

export const CHEP_CU = ["dieu-phoi/scripts/hinh-dang.mjs", "dieu-phoi/scripts/cau-hinh.mjs", "dieu-phoi/scripts/dot.mjs"];
export const KHOA_GIU_KHAC = ["enabledPlugins", "extraKnownMarketplaces"];

export function kiemLopChep(ds, docKhoFn, docKitFn) {
	const loi = [];
	for (const { nguon, dich } of ds) {
		let kho;
		try {
			kho = docKhoFn(dich);
		} catch {
			loi.push(`thiếu: ${dich}`);
			continue;
		}
		if (kho !== docKitFn(nguon)) loi.push(`lệch bản ${THE}: ${dich}`);
	}
	return loi;
}

const NAP = [
	/\b(?:import|export)\s[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g,
	/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
	/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

export function kiemNapChepCu(tepNoiDung) {
	const loi = [];
	for (const { tep, noiDung } of tepNoiDung) {
		const thu = tep.split("/").slice(0, -1);
		for (const k of NAP) {
			for (const m of noiDung.matchAll(k)) {
				const dich = m[1];
				if (!dich.startsWith(".")) continue;
				const ra = [...thu];
				for (const doan of dich.split("/")) {
					if (doan === "..") ra.pop();
					else if (doan !== ".") ra.push(doan);
				}
				if (ra.join("/").startsWith("dieu-phoi/scripts/")) loi.push(`nạp bản chép cũ: ${tep} -> ${dich}`);
			}
		}
	}
	return loi;
}

export function kiemCho(mk, tenBat) {
	const loi = [];
	if (mk.name !== "delivery-loop") loi.push(`tên chợ ở marketplace.json của thẻ là ${mk.name}, không phải delivery-loop`);
	const co = new Set((mk.plugins ?? []).map((p) => p.name));
	for (const t of tenBat) if (!co.has(t)) loi.push(`chợ của thẻ không có plugin ${t}`);
	return loi;
}

export function kiemConChepCu(dsTheoDoi) {
	return dsTheoDoi.filter((t) => t.startsWith("dieu-phoi/")).map((t) => `còn tệp chép cũ: ${t}`);
}

export function docT1(config) {
	const dong = config.split("\n");
	const i = dong.findIndex((d) => /^ {2}t1_skip_globs:\s*$/.test(d));
	if (i < 0) throw new Error("config.yaml không có risk_tiers.t1_skip_globs");
	const ra = [];
	for (let j = i + 1; j < dong.length; j++) {
		const d = dong[j];
		if (/^ {0,2}\S/.test(d)) break;
		const m = /^ {4}- "([^"]+)"/.exec(d);
		if (m) ra.push(m[1]);
	}
	return ra;
}

export function kiemT1(globs, ds) {
	const co = new Set(globs);
	return [
		...ds.filter(({ dich }) => !co.has(dich)).map(({ dich }) => `t1_skip_globs thiếu: ${dich}`),
		...CHEP_CU.filter((c) => co.has(c)).map((c) => `t1_skip_globs còn đích cũ: ${c}`),
	];
}

export function kiemLuongGom(txt) {
	const loi = [];
	const the = [...txt.matchAll(/^\s*KIT_REF:\s*(\S+)\s*$/gm)].map((m) => m[1]);
	if (the.length !== 1 || the[0] !== THE) loi.push(`KIT_REF phải đúng một dòng ${THE} (thấy ${the.join(",") || "0"})`);
	const can = [
		'git clone --depth 1 --branch "$KIT_REF" https://github.com/phanlemanh/delivery-loop "$RUNNER_TEMP/delivery-loop"',
		'claude plugin marketplace add "$RUNNER_TEMP/delivery-loop"',
		"claude plugin install acceptance-gate@delivery-loop",
	];
	for (const c of can) if (!txt.split("\n").some((d) => d.trim() === c)) loi.push(`thiếu dòng: ${c}`);
	if (txt.includes("acceptance-gate-kit")) loi.push("còn chữ acceptance-gate-kit");
	return loi;
}

export function kiemSkillGom(skill, loiDan, coKitFn) {
	const loi = [];
	for (const s of skill) {
		const [p, ten] = s.split(":");
		if (p !== "acceptance-gate" || !coKitFn(`plugins/acceptance-gate/skills/${ten}/SKILL.md`)) {
			loi.push(`skill không có trên kit ${THE}: ${s}`);
		}
		if (!loiDan.includes(`/${s}`)) loi.push(`lời dặn không gọi /${s}`);
	}
	for (const cu of Object.keys(BANG_TEN.lenh)) if (loiDan.includes(cu)) loi.push(`lời dặn còn tên cũ: ${cu}`);
	return loi;
}

export function kiemPhien(st) {
	const loi = [];
	const cho = Object.keys(st.extraKnownMarketplaces ?? {});
	if (cho.length !== 1 || cho[0] !== "delivery-loop") loi.push(`chợ khai phải đúng delivery-loop (thấy ${cho.join(",") || "0"})`);
	const nguon = st.extraKnownMarketplaces?.["delivery-loop"]?.source ?? {};
	if (nguon.source !== "github" || nguon.repo !== "phanlemanh/delivery-loop") loi.push("chợ delivery-loop không trỏ github phanlemanh/delivery-loop");
	if (nguon.ref !== THE) loi.push(`ref của chợ phải là ${THE} (thấy ${nguon.ref ?? "vắng"})`);
	for (const p of SAU_PLUGIN_MOI) {
		if (st.enabledPlugins?.[`${p}@delivery-loop`] !== true) loi.push(`${p}@delivery-loop chưa bật`);
	}
	return loi;
}

export function kiemTat(st) {
	const loi = [];
	const ep = st.enabledPlugins ?? {};
	for (const p of SAU_PLUGIN_CU) {
		const k = `${p}@acceptance-gate-kit`;
		if (!(k in ep)) loi.push(`thiếu dòng tắt: ${k}`);
		else if (ep[k] !== false) loi.push(`${k} phải là false (thấy ${ep[k]})`);
	}
	for (const k of Object.keys(ep)) {
		if (k.endsWith("@acceptance-gate-kit") && !SAU_PLUGIN_CU.includes(k.split("@")[0])) loi.push(`khoá chợ cũ lạ: ${k}`);
	}
	return loi;
}

export function kiemPhanConLai(moi, cu) {
	const loi = [];
	const khoa = new Set([...Object.keys(moi), ...Object.keys(cu)]);
	for (const k of khoa) {
		if (KHOA_GIU_KHAC.includes(k)) continue;
		if (JSON.stringify(moi[k]) !== JSON.stringify(cu[k])) loi.push(`khoá ${k} đổi so với nhánh chính`);
	}
	const laKit = (k) => k.endsWith("@delivery-loop") || k.endsWith("@acceptance-gate-kit");
	for (const [k, v] of Object.entries(cu.enabledPlugins ?? {})) {
		if (!laKit(k) && moi.enabledPlugins?.[k] !== v) loi.push(`plugin ngoài kit ${k} đổi`);
	}
	for (const k of Object.keys(moi.enabledPlugins ?? {})) {
		if (!laKit(k) && !(k in (cu.enabledPlugins ?? {}))) loi.push(`plugin ngoài kit ${k} mới thêm`);
	}
	return loi;
}

export function doiTen(txt) {
	let n = 0;
	const tenCu = Object.keys(BANG_TEN.lenh).sort((a, b) => b.length - a.length);
	const khuon = new RegExp(`(?<![\\w-])(${tenCu.map((t) => t.replace(/[-:]/g, (c) => `\\${c}`)).join("|")})(?![\\w-])`, "g");
	const ra = txt.replace(khuon, (m) => {
		n += 1;
		return BANG_TEN.lenh[m];
	});
	return { ra, n };
}

export function kiemMau(cu, moi) {
	const { ra, n } = doiTen(cu);
	const loi = [];
	if (ra !== moi) loi.push("tệp mẫu đổi ngoài bảng tên");
	if (doiTen(moi).n !== 0) loi.push("tệp mẫu còn tên lệnh cũ");
	return { loi, n };
}

export function soDoiChung({ nenCu, nen3, dau }) {
	const loi = [];
	const ok = (t) => [...t.matchAll(/^OK \[([^\]]+)\]/gm)].map((m) => m[1]).sort();
	const vio = (t) => t.split("\n").filter((d) => d.startsWith("VIOLATION"));
	const chay = (t) => /rules ran=(\d+) declared-off=0 expected=\1/.test(t);
	for (const [ten, t] of [["nền kit cũ", nenCu], ["nền kit 3.0.0", nen3], ["HEAD", dau.van]]) {
		if (!chay(t)) loi.push(`${ten}: lưới không chạy đủ luật`);
	}
	if (vio(nenCu).length || vio(nen3).length) loi.push("merge-base có VIOLATION");
	const a = ok(nenCu);
	const b = ok(nen3);
	if (JSON.stringify(a) !== JSON.stringify(b)) loi.push("tập OK của hai kit trên merge-base lệch");
	if (a.length === 0) loi.push("merge-base không có hồ sơ OK nào");
	const okDau = new Set(ok(dau.van));
	const mat = a.filter((s) => !okDau.has(s) && s !== dau.slug);
	if (mat.length) loi.push(`hồ sơ thôi OK trên HEAD: ${mat.slice(0, 5).join(",")}`);
	const ngoai = vio(dau.van).filter((d) => !d.includes(`[${dau.slug}]`) && !d.startsWith("VIOLATION [PR]"));
	if (ngoai.length) loi.push(`VIOLATION ngoài vòng trên HEAD: ${ngoai.length}`);
	return { loi, ok: a.length, okDau: okDau.size, vongCuaVong: vio(dau.van).length - ngoai.length };
}
