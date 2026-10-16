import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docDanhSach } from "./hoa-cu-theo-paths.mjs";
import { giaiInput, tepTheoDoi } from "./them-paths.mjs";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const yeuCau = createRequire(import.meta.url);
const L = yeuCau(join(GOC, "lib", "evidence-core.cjs"));
const Y = yeuCau(join(GOC, "lib", "eval-yaml.cjs"));
const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { maxBuffer: 1 << 30 }).toString();

const MIEN = "_acceptance/thu-paths-e15-giai-doan/";
const HO_SO_E15 = "giai-doan-thoa-thuan";
const GLOB_CHU = "apps/app/lib/messages/**";
const MAU_TEP_CHU = /^apps\/app\/lib\/messages\/[^/]+\.ts$/;

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
}

function banTai(sha, tep) {
	const r = spawnSync("git", ["-C", GOC, "show", `${sha}:${tep}`], {
		encoding: "utf8",
		maxBuffer: 1 << 30,
	});
	return r.status === 0 ? r.stdout : null;
}

function khoiEval(chu) {
	const dong = chu.split("\n");
	const kq = new Map();
	let id = null;
	let dau = -1;
	const dong1 = () => {
		if (id != null) kq.set(id, dong.slice(dau, i));
	};
	let i = 0;
	for (; i < dong.length; i++) {
		const m = dong[i].match(/^\s*-\s+id:\s*["']?([^"'\s]+)["']?\s*$/);
		if (m) {
			dong1();
			id = m[1];
			dau = i;
		}
	}
	dong1();
	return kq;
}

function boPaths(khoi) {
	const kq = [];
	let thutPaths = null;
	for (const d of khoi) {
		const t = d.match(/^(\s*)/)[1].length;
		if (thutPaths != null) {
			if (d.trim() && (t > thutPaths || (t === thutPaths && /^\s*-\s/.test(d))))
				continue;
			thutPaths = null;
		}
		if (/^\s*paths:\s*$/.test(d)) {
			thutPaths = t;
			continue;
		}
		kq.push(d);
	}
	while (kq.length && !kq[kq.length - 1].trim()) kq.pop();
	return kq.join("\n");
}

function soHoSo(slug, tep, mb, coTep, dem) {
	const cu = banTai(mb, tep);
	const moi = banTai("HEAD", tep);
	if (cu == null || moi == null) {
		dem.lech += 1;
		console.log(`TEP_MOI_HAY_MAT ${tep}`);
		return;
	}
	const kCu = khoiEval(cu);
	const kMoi = khoiEval(moi);
	const exec = new Map(
		Y.parseEvals(moi, ["executor"]).map((e) => [
			String(e.id),
			String(e.executor ?? "").trim(),
		]),
	);
	const dsMoi = L.evalListsOf(moi, ["inputs", "paths"]).byId;
	const dsCu = L.evalListsOf(cu, ["paths"]).byId;
	for (const id of new Set([...kCu.keys(), ...kMoi.keys()])) {
		if (!kCu.has(id) || !kMoi.has(id)) {
			dem.lech += 1;
			console.log(`DOI_TRUONG ${slug}#${id}: eval them hay bot`);
			continue;
		}
		if (boPaths(kCu.get(id)) !== boPaths(kMoi.get(id))) {
			dem.lech += 1;
			console.log(`DOI_TRUONG ${slug}#${id}`);
			continue;
		}
		const pCu = dsCu.get(id)?.paths ?? null;
		const pMoi = dsMoi.get(id)?.paths ?? null;
		if (JSON.stringify(pCu) === JSON.stringify(pMoi)) continue;
		if (slug === HO_SO_E15 && id === "E15") {
			const mong = [
				...new Set((pCu ?? []).flatMap((g) => (g === GLOB_CHU ? [] : [g]))),
			];
			const conLai = (pMoi ?? []).filter((g) => !MAU_TEP_CHU.test(g));
			const chu = (pMoi ?? []).filter((g) => MAU_TEP_CHU.test(g));
			if (
				!(pCu ?? []).includes(GLOB_CHU) ||
				JSON.stringify(conLai) !== JSON.stringify(mong) ||
				!chu.length
			) {
				dem.lech += 1;
				console.log(`PATHS_KHAC_INPUTS ${slug}#${id}`);
			} else dem.e15 += 1;
			continue;
		}
		if (pCu != null || exec.get(id) !== "judgment") {
			dem.lech += 1;
			console.log(
				`PATHS_KHAC_INPUTS ${slug}#${id}: chi duoc them paths cho eval judgment chua co paths`,
			);
			continue;
		}
		const muonCo = [
			...new Set(
				(dsMoi.get(id)?.inputs ?? []).map((i) => giaiInput(slug, i, coTep)),
			),
		];
		if (
			muonCo.includes(null) ||
			JSON.stringify(muonCo) !== JSON.stringify(pMoi)
		) {
			dem.lech += 1;
			console.log(`PATHS_KHAC_INPUTS ${slug}#${id}`);
			continue;
		}
		dem.them += 1;
	}
}

function chay() {
	const i = process.argv.indexOf("--ho-so");
	if (i === -1) khongDo("can --ho-so <slug,...|@tep>");
	const chon = docDanhSach(process.argv[i + 1] ?? "");
	const mb = git("merge-base", "HEAD", "origin/onehub").trim();
	if (mb === git("rev-parse", "HEAD").trim()) {
		console.log("da gop, khong so");
		return 0;
	}
	const coTep = tepTheoDoi();
	const dem = { them: 0, e15: 0, lech: 0 };
	let mien = false;
	for (const tep of git("diff", "--name-only", mb, "HEAD", "--", "_acceptance")
		.split("\n")
		.filter((t) => /^_acceptance\/[^/]+\/evals\.yaml$/.test(t))) {
		if (tep.startsWith(MIEN)) {
			mien = true;
			continue;
		}
		const slug = tep.split("/")[1];
		if (slug !== HO_SO_E15 && !chon.includes(slug)) {
			dem.lech += 1;
			console.log(`NGOAI_DANH_SACH ${slug}`);
			continue;
		}
		soHoSo(slug, tep, mb, coTep, dem);
	}
	if (mien) console.log(`mien: ${MIEN}**`);
	for (const t of git("diff", "--name-only", mb, "HEAD", "--", "lib")
		.split("\n")
		.filter(Boolean)) {
		dem.lech += 1;
		console.log(`CHAM_LIB ${t}`);
	}
	console.log(
		`chi-them: ${dem.them} eval them paths · E15 doi ${dem.e15} dong · ${dem.lech} lech`,
	);
	return dem.lech;
}

if (process.argv[1] === fileURLToPath(import.meta.url))
	process.exit(chay() ? 1 : 0);
