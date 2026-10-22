import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sinhBang } from "./bang.mjs";
import { BANG, DO_LAI_NEN, docDanhSach, docJson, docTai, git, gitThu, GOC, kit, MOC_NEN, NHAN_COMMIT, SLUG, XU_LY_CAN_CAN_CU } from "./chung.mjs";

const TEP_GHIM = ["run-log.jsonl", "evidence-report.md"];
const TEP_DUOC_NGOAI = ["PRODUCT-MAP.md", "LO-TRINH.html"];
const TRUONG_DOC = ["criterion", "executor", "status", "cmd", "expected", "question", "superseded_by", "expected_exit", "layer"];
const XU_LY_DOI_LENH = ["sua-rang", "neo-co-dinh"];
const XU_LY_DOI_PATHS = ["sua-rang", "neo-co-dinh", "tro-duong-moi"];
const CONFIG = "_acceptance/config.yaml";
const TIEN_TO_KHOA_HO_SO = "executors.script.hsdk_";

const bang = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function phang(o, tien = "", ra = new Map()) {
	if (o instanceof Object && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) phang(v, tien ? `${tien}.${k}` : k, ra);
	else ra.set(tien, o);
	return ra;
}

export function evalsTheoId(text) {
	if (text === null) return new Map();
	const { core, Y } = kit();
	const ra = new Map();
	for (const e of Y.parseEvals(text, TRUONG_DOC)) {
		const o = { id: e.id };
		for (const k of TRUONG_DOC) if (e[k] !== undefined && e[k] !== null && e[k] !== "") o[k] = e[k];
		const ps = core.evalPathsOf(text, e.id);
		if (ps?.length) o.paths = ps;
		ra.set(e.id, o);
	}
	return ra;
}

export function canCuSong(cc) {
	const s = String(cc ?? "").trim();
	if (!s) return false;
	const m = /^(.+):(\d+)$/.exec(s);
	if (m && existsSync(join(GOC, m[1]))) {
		const so = readFileSync(join(GOC, m[1]), "utf8").split("\n").length;
		return Number(m[2]) >= 1 && Number(m[2]) <= so;
	}
	if (/^[0-9a-f]{7,40}$/.test(s)) return gitThu("cat-file", "-e", `${s}^{commit}`) !== null;
	return existsSync(join(GOC, s));
}

export function khoaConfigCua(slugs, docEvals) {
	const ra = new Set();
	for (const s of slugs) for (const m of (docEvals(s) ?? "").matchAll(/config:([\w.]+)/g)) ra.add(m[1]);
	return ra;
}

export function kiemKhai({ tepDoi, evalsCap, contractDoi, danhSach, configDoi, khoaCuaDong, commitKhongNhan, bangThat, bangSinh, kiemCanCu }) {
	const loi = [];
	const theoHoSo = new Map();
	for (const r of danhSach.dong) theoHoSo.set(r.ho_so, [...(theoHoSo.get(r.ho_so) ?? []), r]);
	const hoanLai = new Set(danhSach.hoan_lai.map((h) => h.ho_so));
	const tepKhai = new Set(danhSach.dong.filter((r) => XU_LY_DOI_LENH.includes(r.xu_ly)).flatMap((r) => r.tep ?? []));
	for (const sha of commitKhongNhan) loi.push(`COMMIT_KHONG_NHAN ${sha}`);
	let soEval = 0;
	for (const tep of tepDoi) {
		const m = /^_acceptance\/([^/]+)\/(.+)$/.exec(tep);
		if (!m) {
			if (TEP_DUOC_NGOAI.includes(tep)) continue;
			loi.push(`NGOAI_KHO_HO_SO ${tep}`);
			continue;
		}
		const [, slug, ten] = m;
		if (hoanLai.has(slug)) continue;
		const rows = theoHoSo.get(slug);
		if (!rows) {
			loi.push(`NGOAI_DANH_SACH ${tep}`);
			continue;
		}
		if (ten === "contract.md") {
			if (contractDoi.has(tep)) loi.push(`DOI_LOI_AC ${tep}`);
			continue;
		}
		if (TEP_GHIM.includes(ten)) continue;
		if (ten !== "evals.yaml") {
			if (!tepKhai.has(tep)) loi.push(`TEP_KHONG_KHAI ${tep}`);
			continue;
		}
		const { cu, moi } = evalsCap.get(slug) ?? { cu: new Map(), moi: new Map() };
		const chiCuPhap = rows.every((r) => r.xu_ly === "sua-cu-phap");
		for (const id of new Set([...cu.keys(), ...moi.keys()])) {
			const a = cu.get(id);
			const b = moi.get(id);
			const k = `${slug}:${id}`;
			if (!a || !b) {
				loi.push(`KHONG_KHAI ${k} (eval them hoac bot)`);
				continue;
			}
			const doi = Object.keys({ ...a, ...b }).filter((x) => !bang(a[x], b[x]));
			if (!doi.length) continue;
			soEval += 1;
			const r = rows.filter((x) => x.eval === id);
			const co = (ds) => r.some((x) => ds.includes(x.xu_ly));
			if (chiCuPhap) {
				loi.push(`KHONG_KHAI ${k} (sua-cu-phap ma doi ${doi.join(",")})`);
				continue;
			}
			const la = doi.filter((x) => !["status", "cmd", "expected", "paths"].includes(x));
			if (la.length) loi.push(`KHONG_KHAI ${k} (doi ${la.join(",")})`);
			if (doi.includes("status") && !(b.status === "not-run" && co(["khai-not-run"]))) loi.push(`KHONG_KHAI ${k} (doi status)`);
			if ((doi.includes("cmd") || doi.includes("expected")) && !co([...XU_LY_DOI_LENH, "khai-not-run"])) loi.push(`KHONG_KHAI ${k} (doi cmd/expected)`);
			if (doi.includes("paths") && !co(XU_LY_DOI_PATHS)) loi.push(`KHONG_KHAI ${k} (doi paths)`);
		}
	}
	for (const tep of contractDoi) if (!tepDoi.includes(tep)) loi.push(`DOI_LOI_AC ${tep}`);
	const dongCanCu = [
		...danhSach.dong.filter((r) => XU_LY_CAN_CAN_CU.includes(r.xu_ly)),
		...danhSach.hoan_lai.flatMap((h) => h.san_pham_hong.map((s) => ({ ...s, ho_so: h.ho_so }))),
	];
	for (const r of dongCanCu) {
		const k = `${r.ho_so}:${r.eval}`;
		if (!String(r.ly_do ?? "").trim()) loi.push(`CAN_CU_HONG ${k} (thieu ly_do)`);
		else if (!kiemCanCu(r.can_cu)) loi.push(`CAN_CU_HONG ${k} (${r.can_cu})`);
	}
	for (const { khoa, loai, sha } of configDoi) {
		const cuaHoSo = khoa.startsWith(TIEN_TO_KHOA_HO_SO);
		if (khoaCuaDong.has(khoa) || cuaHoSo) continue;
		loi.push(`${loai === "doi" ? "CONFIG_DOI_GIA_TRI" : "CONFIG_NGOAI"} ${khoa} (${sha.slice(0, 9)})`);
	}
	if (bangThat !== bangSinh) loi.push("BANG_LECH bang-truoc-sau.md khac ban rang/bang.mjs sinh lai");
	return { loi, soEval };
}

export function commitVong() {
	return git("log", "--no-merges", "--format=%H", `--grep=${NHAN_COMMIT}`, "--fixed-strings", `${MOC_NEN}..HEAD`).split("\n").filter(Boolean).reverse();
}

export function commitKhongNhan(vong) {
	const coNhan = new Set(vong);
	const nhanhChinh = gitThu("rev-parse", "--verify", "origin/onehub") ? ["^origin/onehub"] : [];
	return git("rev-list", "--no-merges", `${MOC_NEN}..HEAD`, ...nhanhChinh).split("\n").filter((s) => s && !coNhan.has(s));
}

function tepCua(sha) {
	return git("show", "--name-only", "--format=", sha).split("\n").filter(Boolean);
}

function configDoiCua(sha) {
	const cu = phang(Bun.YAML.parse(docTai(`${sha}^`, CONFIG) ?? "") ?? {});
	const moi = phang(Bun.YAML.parse(docTai(sha, CONFIG) ?? "") ?? {});
	const ra = [];
	for (const [k, v] of moi) {
		if (!cu.has(k)) ra.push({ khoa: k, loai: "them", sha });
		else if (!bang(cu.get(k), v)) ra.push({ khoa: k, loai: "doi", sha });
	}
	for (const k of cu.keys()) if (!moi.has(k)) ra.push({ khoa: k, loai: "doi", sha });
	return ra;
}

function tuKiem(vao) {
	const ra = [];
	const bat = (ten, sua, can) => {
		const v = sua({ ...structuredClone({ ...vao, kiemCanCu: undefined }), kiemCanCu: vao.kiemCanCu });
		const { loi } = kiemKhai(v);
		ra.push(loi.some((l) => l.startsWith(can)) ? `OK tu kiem ${ten}` : `HONG tu kiem ${ten}: khong bat «${can}» (${loi.slice(0, 3).join("; ") || "khong loi"})`);
	};
	const r0 = vao.danhSach.dong.find((r) => r.xu_ly === "sua-rang");
	const slug = r0.ho_so;
	const evs = evalsTheoId(docTai(null, `_acceptance/${slug}/evals.yaml`));
	const e = [...evs.values()].find((x) => x.status !== "not-run" && x.id !== r0.eval) ?? [...evs.values()][0];
	const tepE = `_acceptance/${slug}/evals.yaml`;
	bat(
		"not-run khong dong",
		(v) => {
			v.tepDoi = [...new Set([...v.tepDoi, tepE])];
			v.evalsCap.set(slug, { cu: new Map([[e.id, e]]), moi: new Map([[e.id, { ...e, status: "not-run" }]]) });
			return v;
		},
		`KHONG_KHAI ${slug}:${e.id}`,
	);
	bat(
		"can_cu sha bia",
		(v) => {
			v.danhSach.dong.push({ ho_so: slug, eval: "E0", xu_ly: "khai-not-run", ly_do: "bia", can_cu: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" });
			return v;
		},
		"CAN_CU_HONG",
	);
	bat(
		"sua loi AC",
		(v) => {
			v.tepDoi = [...v.tepDoi, `_acceptance/${slug}/contract.md`];
			v.contractDoi = new Set([`_acceptance/${slug}/contract.md`]);
			return v;
		},
		`DOI_LOI_AC _acceptance/${slug}/contract.md`,
	);
	bat(
		"khoa config ho so khong dong",
		(v) => {
			v.configDoi = [...v.configDoi, { khoa: "executors.script.ldv_man", loai: "doi", sha: "0".repeat(40) }];
			return v;
		},
		"CONFIG_DOI_GIA_TRI executors.script.ldv_man",
	);
	bat(
		"tep apps",
		(v) => {
			v.tepDoi = [...v.tepDoi, "apps/app/lib/x.ts"];
			return v;
		},
		"NGOAI_KHO_HO_SO apps/app/lib/x.ts",
	);
	bat(
		"commit khong nhan",
		(v) => {
			v.commitKhongNhan = ["c".repeat(40)];
			return v;
		},
		`COMMIT_KHONG_NHAN ${"c".repeat(40)}`,
	);
	bat(
		"bang sua tay",
		(v) => {
			v.bangThat = `${v.bangSinh}x`;
			return v;
		},
		"BANG_LECH",
	);
	return ra;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const danhSach = docDanhSach();
	const vong = commitVong();
	const dauCuoi = new Map();
	const configDoi = [];
	for (const sha of vong)
		for (const t of tepCua(sha)) {
			if (t === CONFIG) configDoi.push(...configDoiCua(sha));
			if (!dauCuoi.has(t)) dauCuoi.set(t, { dau: sha, cuoi: sha });
			else dauCuoi.get(t).cuoi = sha;
		}
	const hoanLai = new Set(danhSach.hoan_lai.map((h) => h.ho_so));
	const loiHoanLai = [];
	const contractDoi = new Set();
	for (const [t, { dau, cuoi }] of dauCuoi) {
		const doiRong = docTai(`${dau}^`, t) !== docTai(cuoi, t);
		if (hoanLai.has(/^_acceptance\/([^/]+)\//.exec(t)?.[1]) && doiRong) loiHoanLai.push(`HOAN_LAI_CON_DOI ${t}`);
		if (/^_acceptance\/[^/]+\/contract\.md$/.test(t) && !t.startsWith(`_acceptance/${SLUG}/`) && doiRong) contractDoi.add(t);
	}
	const tepDoi = [...dauCuoi.keys()].filter((t) => !t.startsWith(`_acceptance/${SLUG}/`) && t !== CONFIG && !t.startsWith("docs/"));
	const evalsCap = new Map();
	for (const t of tepDoi) {
		const m = /^_acceptance\/([^/]+)\/evals\.yaml$/.exec(t);
		if (!m) continue;
		const { dau, cuoi } = dauCuoi.get(t);
		evalsCap.set(m[1], { cu: evalsTheoId(docTai(`${dau}^`, t)), moi: evalsTheoId(docTai(cuoi, t)) });
	}
	const slugsDong = [...new Set(danhSach.dong.map((r) => r.ho_so))];
	const vao = {
		tepDoi,
		evalsCap,
		contractDoi,
		danhSach,
		configDoi,
		khoaCuaDong: new Set([...khoaConfigCua(slugsDong, (s) => docTai(null, `_acceptance/${s}/evals.yaml`))].map((k) => k)),
		commitKhongNhan: commitKhongNhan(vong),
		bangThat: existsSync(BANG) ? readFileSync(BANG, "utf8") : "",
		bangSinh: sinhBang(danhSach, docJson(DO_LAI_NEN)),
		kiemCanCu: canCuSong,
	};
	const { loi: loiKhai, soEval } = kiemKhai(vao);
	const loi = [...loiKhai, ...loiHoanLai];
	const tk = tuKiem(vao);
	for (const l of loi) console.log(l);
	for (const t of tk) console.log(t);
	console.log(`khai-du: ${tepDoi.length} tệp đổi ngoài hồ sơ này, ${soEval} eval đổi, ${loi.length ? `${loi.length} lỗi` : "mọi thay đổi có dòng danh sách"}`);
	process.exit(loi.length || tk.some((t) => t.startsWith("HONG")) ? 1 : 0);
}
