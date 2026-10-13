import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const SLUG = "ba-ho-so-do-san";
export const MOC_NEN = "3a2783409894908bc8dd1ee3893b88f990d1aebe";
export const DANH_SACH = join(GOC, "_acceptance", SLUG, "danh-sach.json");
export const XU_LY = ["tro-duong-moi", "bo-paths", "khai-not-run", "sua-rang", "tu-het"];
export const MA_CHET = ["paths-khong-tro-toi-tep", "dang-khai-la"];
export const DA_KY = ["signed-off", "machine-cleared"];
export const P8_4 = [
	{ ho_so: "khoa-con-bat-xa-tran", eval: "E4" },
	{ ho_so: "lenh-dung-do-khong-ai-thay", eval: "E5" },
	{ ho_so: "do-man-tren-kho-rieng", eval: "E11" },
];

const require = createRequire(import.meta.url);

export function hong(ma, chu) {
	console.error(chu);
	process.exit(ma);
}

export function git(...args) {
	return execFileSync("git", args, {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});
}

export function gitThu(...args) {
	try {
		return execFileSync("git", args, {
			cwd: GOC,
			encoding: "utf8",
			maxBuffer: 256 * 1024 * 1024,
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return null;
	}
}

let kitDaNap = null;
export function kit() {
	if (kitDaNap) return kitDaNap;
	let goc;
	try {
		goc = execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"lib/evidence-core.cjs",
				"--require",
				"lib/eval-yaml.cjs",
			],
			{ cwd: GOC, encoding: "utf8" },
		).trim();
	} catch (e) {
		hong(2, `MA 2: khong giai duoc goi acceptance-gate qua scripts/resolve-plugin.mjs — ${e.message}`);
	}
	kitDaNap = {
		goc,
		core: require(join(goc, "lib", "evidence-core.cjs")),
		Y: require(join(goc, "lib", "eval-yaml.cjs")),
	};
	return kitDaNap;
}

export function cayTai(ref) {
	const ds =
		ref === null
			? git("ls-files", "-z").split("\0")
			: git("ls-tree", "-r", "-z", "--name-only", ref).split("\0");
	return kit().core.dungCayPaths(ds.filter(Boolean));
}

export function docTai(ref, tuongDoi) {
	if (ref === null) {
		const tep = join(GOC, tuongDoi);
		return existsSync(tep) ? readFileSync(tep, "utf8") : null;
	}
	return gitThu("show", `${ref}:${tuongDoi}`);
}

export function evalsTai(ref, slug) {
	return docTai(ref, `_acceptance/${slug}/evals.yaml`);
}

export function trangThaiHoSo(ref, slug) {
	const c = docTai(ref, `_acceptance/${slug}/contract.md`);
	if (c === null) return null;
	const m = c.match(/^status:\s*([\w-]+)/m);
	return m ? m[1] : null;
}

export function hoSoTai(ref) {
	const ds =
		ref === null
			? git("ls-files", "-z", "--", "_acceptance/*/contract.md").split("\0")
			: git("ls-tree", "-r", "-z", "--name-only", ref, "--", "_acceptance").split("\0");
	return [
		...new Set(
			ds
				.map((t) => /^_acceptance\/([^/]+)\/contract\.md$/.exec(t))
				.filter(Boolean)
				.map((m) => m[1]),
		),
	].sort();
}

export function hoSoDaKyTai(ref) {
	return hoSoTai(ref).filter((s) => DA_KY.includes(trangThaiHoSo(ref, s)));
}

export function cacEval(text) {
	return kit().Y.parseEvals(text, ["executor", "status", "cmd"]);
}

export function pathsCua(text, id) {
	return kit().core.evalPathsOf(text, id) || [];
}

export function mucChetCua(slug, text, cay) {
	const { core } = kit();
	const ra = [];
	let evs;
	try {
		evs = cacEval(text);
	} catch {
		return ra;
	}
	for (const e of evs)
		for (const muc of pathsCua(text, e.id)) {
			const pl = core.phanLoaiMucPaths(muc, cay);
			if (!pl.nhan && MA_CHET.includes(pl.ma))
				ra.push({ ho_so: slug, eval: e.id, muc, ma: pl.ma });
		}
	return ra;
}

export function quetMucChet(ref) {
	const cay = cayTai(ref);
	const ra = [];
	for (const slug of hoSoDaKyTai(ref)) {
		const t = evalsTai(ref, slug);
		if (t !== null) ra.push(...mucChetCua(slug, t, cay));
	}
	return ra;
}

export function khoaDong(d) {
	return `${d.ho_so}:${d.eval}:${d.muc ?? "-"}`;
}

export function docDanhSach(duong = DANH_SACH) {
	if (!existsSync(duong)) hong(2, `MA 2: khong co ${duong}`);
	let d;
	try {
		d = JSON.parse(readFileSync(duong, "utf8"));
	} catch (e) {
		hong(2, `MA 2: ${duong} khong phai JSON — ${e.message}`);
	}
	if (!d || !Array.isArray(d.dong) || !/^[0-9a-f]{40}$/.test(String(d.moc_nen ?? "")))
		hong(2, `MA 2: ${duong} thieu dong[] hoac moc_nen`);
	return d;
}

export function thuMucChung() {
	const chung = git("rev-parse", "--git-common-dir").trim();
	return resolve(GOC, chung, "..");
}
