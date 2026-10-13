import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { docDanhSach, docTai, git, gitThu, GOC, hong, kit, MOC_NEN, SLUG } from "./chung.mjs";

const TEP_GHIM = ["run-log.jsonl", "evidence-report.md"];
const TRUONG_SO = ["status", "cmd", "expected", "paths"];

const bang = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function phang(o, tien = "", ra = new Map()) {
	if (o && typeof o === "object" && !Array.isArray(o)) {
		for (const [k, v] of Object.entries(o)) phang(v, tien ? `${tien}.${k}` : k, ra);
	} else ra.set(tien, o);
	return ra;
}

const TRUONG_DOC = ["criterion", "executor", "status", "cmd", "expected", "question", "superseded_by", "expected_exit", "layer"];

function evalsTheoId(text) {
	if (text === null) return new Map();
	const { core, Y } = kit();
	const ra = new Map();
	for (const e of Y.parseEvals(text, TRUONG_DOC)) {
		const o = { id: e.id };
		for (const k of TRUONG_DOC) if (e[k] !== undefined && e[k] !== null && e[k] !== "") o[k] = e[k];
		const ps = core.evalPathsOf(text, e.id);
		if (ps && ps.length) o.paths = ps;
		ra.set(e.id, o);
	}
	return ra;
}

export function canCuSong(cc) {
	if (typeof cc !== "string" || !cc.trim()) return false;
	const m = /^(.+):(\d+)$/.exec(cc);
	if (m && existsSync(join(GOC, m[1]))) {
		const so = readFileSync(join(GOC, m[1]), "utf8").split("\n").length;
		return Number(m[2]) >= 1 && Number(m[2]) <= so;
	}
	return /^[0-9a-f]{7,40}$/.test(cc) && gitThu("cat-file", "-e", `${cc}^{commit}`) !== null;
}

function pathsMoiKy(cu, rows) {
	let ds = [...(cu ?? [])];
	for (const r of rows) {
		const i = ds.indexOf(r.muc);
		if (i < 0) return null;
		if (r.moi === null || r.moi === undefined) ds.splice(i, 1);
		else ds[i] = r.moi;
	}
	return ds;
}

export function kiemKhai({ tepDoi, evalsCap, danhSach, configCu, configMoi, kiemCanCu }) {
	const loi = [];
	const theoHoSo = new Map();
	for (const r of danhSach.dong) {
		if (!theoHoSo.has(r.ho_so)) theoHoSo.set(r.ho_so, []);
		theoHoSo.get(r.ho_so).push(r);
	}
	const tepKhai = new Set(danhSach.dong.filter((r) => r.xu_ly === "sua-rang").flatMap((r) => r.tep ?? []));
	let soEval = 0;
	for (const tep of tepDoi) {
		const m = /^_acceptance\/([^/]+)\/(.+)$/.exec(tep);
		if (!m) {
			if (!tepKhai.has(tep)) loi.push(`TEP_KHONG_KHAI ${tep}`);
			continue;
		}
		const [, slug, ten] = m;
		const rows = theoHoSo.get(slug);
		if (!rows) {
			loi.push(`NGOAI_DANH_SACH ${tep}`);
			continue;
		}
		if (rows.every((r) => r.xu_ly === "tu-het")) {
			loi.push(`TU_HET_BI_CHAM ${tep}`);
			continue;
		}
		if (TEP_GHIM.includes(ten)) continue;
		if (ten !== "evals.yaml") {
			if (!tepKhai.has(tep)) loi.push(`TEP_KHONG_KHAI ${tep}`);
			continue;
		}
		const { cu, moi } = evalsCap.get(slug) ?? { cu: new Map(), moi: new Map() };
		for (const id of new Set([...cu.keys(), ...moi.keys()])) {
			const a = cu.get(id);
			const b = moi.get(id);
			const khoa = `${slug}:${id}`;
			if (!a || !b) {
				loi.push(`KHONG_KHAI ${khoa} (eval them hoac bot)`);
				continue;
			}
			const khacKhac = Object.keys({ ...a, ...b }).filter((k) => !TRUONG_SO.includes(k) && !bang(a[k], b[k]));
			const doi = TRUONG_SO.filter((k) => !bang(a[k], b[k]));
			if (!doi.length && !khacKhac.length) continue;
			soEval++;
			const r = rows.filter((x) => x.eval === id);
			const co = (xl) => r.some((x) => x.xu_ly === xl);
			if (khacKhac.length) loi.push(`KHONG_KHAI ${khoa} (doi ${khacKhac.join(",")})`);
			if (doi.includes("status") && !(b.status === "not-run" && co("khai-not-run"))) loi.push(`KHONG_KHAI ${khoa} (doi status)`);
			if ((doi.includes("cmd") || doi.includes("expected")) && !co("sua-rang")) loi.push(`KHONG_KHAI ${khoa} (doi cmd/expected)`);
			if (doi.includes("paths")) {
				if (!r.length) loi.push(`KHONG_KHAI ${khoa} (doi paths)`);
				else if (r.every((x) => x.xu_ly === "tro-duong-moi")) {
					const kyVong = pathsMoiKy(a.paths, r);
					if (!kyVong || !bang(kyVong, b.paths ?? [])) loi.push(`KHONG_KHAI ${khoa} (paths doi khac dong tro-duong-moi)`);
				}
			}
			if (co("bo-paths") && (b.status !== "not-run" || b.paths !== undefined)) loi.push(`BO_PATHS_O_DANG_CHAY ${khoa}`);
		}
	}
	for (const r of danhSach.dong) {
		if (!["khai-not-run", "sua-rang"].includes(r.xu_ly)) continue;
		const k = `${r.ho_so}:${r.eval}:${r.muc ?? "-"}`;
		if (typeof r.ly_do !== "string" || !r.ly_do.trim()) loi.push(`CAN_CU_HONG ${k} (thieu ly_do)`);
		else if (!kiemCanCu(r.can_cu)) loi.push(`CAN_CU_HONG ${k} (${r.can_cu})`);
	}
	const cu = phang(configCu);
	const moi = phang(configMoi);
	for (const [k, v] of cu) if (!moi.has(k) || !bang(moi.get(k), v)) loi.push(`CONFIG_DOI_GIA_TRI ${k}`);
	return { loi, soEval };
}

function tepRangNgoai(danhSach, configMoi) {
	const ra = new Set();
	const slugs = new Set(danhSach.dong.map((r) => r.ho_so));
	for (const slug of slugs) {
		const text = docTai(null, `_acceptance/${slug}/evals.yaml`);
		for (const e of evalsTheoId(text).values()) {
			if (typeof e.cmd !== "string" || !e.cmd.startsWith("config:")) continue;
			let v = configMoi;
			for (const p of e.cmd.slice(7).split(".")) v = v?.[p];
			for (const m of String(v ?? "").matchAll(/((?:scripts|apps|packages|\.github|\.githooks)\/[\w./()[\]-]+\.(?:mjs|cjs|js|ts|tsx|sh|yml))/g))
				ra.add(m[1]);
		}
	}
	return [...ra];
}

function tuKiem(dauVao) {
	const ra = [];
	const bat = (ten, sua, can) => {
		const v = sua(structuredClone({ ...dauVao, kiemCanCu: undefined }));
		v.kiemCanCu = dauVao.kiemCanCu;
		const { loi } = kiemKhai(v);
		ra.push(loi.some((l) => l.startsWith(can)) ? `OK tu kiem ${ten}: bat "${can}"` : `HONG tu kiem ${ten}: khong bat "${can}"`);
	};
	const dangChay = [...dauVao.evalsCap].flatMap(([slug, { moi }]) =>
		[...moi.values()].filter((e) => e.status !== "not-run" && Array.isArray(e.paths) && e.paths.length).map((e) => ({ slug, e })),
	)[0];
	if (!dangChay) return ["HONG tu kiem: khong co eval dang chay de cay"];
	const { slug, e } = dangChay;
	const tepE = `_acceptance/${slug}/evals.yaml`;
	bat(
		"not-run khong dong",
		(v) => {
			v.tepDoi = [...new Set([...v.tepDoi, tepE])];
			v.evalsCap.get(slug).moi.set(e.id, { ...e, status: "not-run" });
			v.danhSach.dong = v.danhSach.dong.filter((r) => !(r.ho_so === slug && r.eval === e.id));
			return v;
		},
		`KHONG_KHAI ${slug}:${e.id}`,
	);
	bat(
		"can_cu sha bia",
		(v) => {
			v.danhSach.dong.push({ ho_so: slug, eval: "E0", muc: null, xu_ly: "khai-not-run", ly_do: "bia", can_cu: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" });
			return v;
		},
		"CAN_CU_HONG",
	);
	bat(
		"bo-paths o dang chay",
		(v) => {
			v.tepDoi = [...new Set([...v.tepDoi, tepE])];
			const { paths, ...khongPaths } = e;
			v.evalsCap.get(slug).moi.set(e.id, khongPaths);
			v.danhSach.dong.push({ ho_so: slug, eval: e.id, muc: paths[0], xu_ly: "bo-paths" });
			return v;
		},
		`BO_PATHS_O_DANG_CHAY ${slug}:${e.id}`,
	);
	const khoaCu = [...phang(dauVao.configCu).keys()].find((k) => k.startsWith("executors.script."));
	bat(
		"doi gia tri khoa config cu",
		(v) => {
			const p = khoaCu.split(".");
			let o = v.configMoi;
			for (const x of p.slice(0, -1)) o = o[x];
			o[p.at(-1)] = "echo bi-doi";
			return v;
		},
		`CONFIG_DOI_GIA_TRI ${khoaCu}`,
	);
	const tuHet = dauVao.danhSach.dong.find((r) => r.xu_ly === "tu-het");
	if (tuHet)
		bat(
			"cham ho so tu-het",
			(v) => {
				v.tepDoi = [...v.tepDoi, `_acceptance/${tuHet.ho_so}/run-log.jsonl`];
				return v;
			},
			`TU_HET_BI_CHAM _acceptance/${tuHet.ho_so}/run-log.jsonl`,
		);
	bat(
		"tep rang khong khai",
		(v) => {
			v.tepDoi = [...v.tepDoi, `_acceptance/${slug}/rang/bia.mjs`];
			return v;
		},
		`TEP_KHONG_KHAI _acceptance/${slug}/rang/bia.mjs`,
	);
	return ra;
}

if (import.meta.main) {
	const danhSach = docDanhSach();
	const configCu = Bun.YAML.parse(docTai(MOC_NEN, "_acceptance/config.yaml") ?? "");
	const configMoi = Bun.YAML.parse(docTai(null, "_acceptance/config.yaml") ?? "");
	const tepAcc = git("diff", "--name-only", MOC_NEN, "HEAD", "--", "_acceptance")
		.split("\n")
		.filter(Boolean)
		.filter((t) => !t.startsWith(`_acceptance/${SLUG}/`) && t !== "_acceptance/config.yaml");
	const ngoai = tepRangNgoai(danhSach, configMoi).filter((t) => git("diff", "--name-only", MOC_NEN, "HEAD", "--", t).trim());
	const tepDoi = [...tepAcc, ...ngoai];
	const evalsCap = new Map();
	for (const t of tepAcc) {
		const m = /^_acceptance\/([^/]+)\/evals\.yaml$/.exec(t);
		if (m)
			evalsCap.set(m[1], {
				cu: evalsTheoId(docTai(MOC_NEN, t)),
				moi: evalsTheoId(docTai("HEAD", t)),
			});
	}
	const dauVao = { tepDoi, evalsCap, danhSach, configCu, configMoi, kiemCanCu: canCuSong };
	const { loi, soEval } = kiemKhai(dauVao);
	const tk = tuKiem(dauVao);
	for (const l of loi) console.log(`HONG ${l}`);
	for (const t of tk) console.log(t);
	if (!tepDoi.length) hong(2, "MA 2: khong tep nao doi tu moc nen — chay sau khi da ap danh sach");
	console.log(`khai-du: ${tepDoi.length} tep doi ngoai ho so nay, ${soEval} eval doi, ${loi.length ? `${loi.length} loi` : "moi thay doi co dong danh sach"}`);
	process.exit(loi.length || tk.some((t) => t.startsWith("HONG")) ? 1 : 0);
}
