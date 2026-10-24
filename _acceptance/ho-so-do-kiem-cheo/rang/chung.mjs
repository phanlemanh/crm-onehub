import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DAU_LENH_CAN_MAY_CHU, evalMay, kit } from "./do-lai.mjs";

export { evalMay, kit };

export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const SLUG = "ho-so-do-kiem-cheo";
export const MOC_NEN = "6be0bb688900ecd8843989bd8f8b3095548b604f";
export const HO_SO_DIR = join(GOC, "_acceptance", SLUG);
export const DANH_SACH = join(HO_SO_DIR, "danh-sach.json");
export const DO_LAI_NEN = join(HO_SO_DIR, "do-lai-nen.json");
export const BANG = join(HO_SO_DIR, "bang-truoc-sau.md");
export const THU_MUC_CHAY = join(GOC, ".acceptance-runs", SLUG);
export const XU_LY = [
	"neo-co-dinh",
	"sua-rang",
	"khai-not-run",
	"tro-duong-moi",
	"tu-het",
	"sua-cu-phap",
	"san-pham-hong",
];
export const XU_LY_CO_DOT_BIEN = ["neo-co-dinh", "sua-rang"];
export const XU_LY_CAN_CAN_CU = ["neo-co-dinh", "sua-rang", "khai-not-run", "san-pham-hong"];
export const EVAL_TEP = "evals.yaml";
export const DA_KY = ["signed-off", "machine-cleared"];
export const NGUON_DAU_VAO = {
	danhSachF24: "_acceptance/ba-ho-so-do-san/danh-sach.json",
	hangNhan: "F28",
	them: ["so-okr-tu-chay"],
};
export const MA_TIN_HIEU = /^F1-[0-9]+$/;
export const NHAN_COMMIT = `(${SLUG})`;

const require = createRequire(import.meta.url);

export function hong(ma, chu) {
	console.error(chu);
	process.exit(ma);
}

export function git(...args) {
	return execFileSync("git", args, { cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
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

let yamlDaNap = null;
export function goiYaml() {
	if (yamlDaNap) return yamlDaNap;
	const tu = createRequire(join(GOC, "packages", "ui", "package.json"));
	for (const thu of [() => require("yaml"), () => tu("yaml")]) {
		try {
			yamlDaNap = thu();
			return yamlDaNap;
		} catch {}
	}
	const bun = join(GOC, "node_modules", ".bun");
	const ban = existsSync(bun)
		? execFileSync("ls", [bun], { encoding: "utf8" })
				.split("\n")
				.filter((t) => /^yaml@2\./.test(t))
				.sort()
				.at(-1)
		: null;
	if (!ban) hong(2, "MA 2: khong nap duoc goi yaml cua kho");
	yamlDaNap = require(join(bun, ban, "node_modules", "yaml"));
	return yamlDaNap;
}

export function yamlHong(text) {
	const doc = goiYaml().parseDocument(text);
	if (!doc.errors.length) return null;
	const e = doc.errors[0];
	const [dong, cot] = e.linePos?.[0] ? [e.linePos[0].line, e.linePos[0].col] : [0, 0];
	return { dong, cot, loi: String(e.message).split("\n")[0] };
}

export function docTai(ref, tuongDoi) {
	if (ref === null) {
		const tep = join(GOC, tuongDoi);
		return existsSync(tep) ? readFileSync(tep, "utf8") : null;
	}
	return gitThu("show", `${ref}:${tuongDoi}`);
}

export function trangThaiHoSo(ref, slug) {
	const c = docTai(ref, `_acceptance/${slug}/contract.md`);
	const m = c?.match(/^status:\s*([\w-]+)/m);
	return m ? m[1] : null;
}

export function hoSoDaKyTai(ref) {
	const ds = git("ls-tree", "-r", "-z", "--name-only", ref, "--", "_acceptance").split("\0");
	return [
		...new Set(
			ds
				.map((t) => /^_acceptance\/([^/]+)\/contract\.md$/.exec(t))
				.filter(Boolean)
				.map((m) => m[1]),
		),
	]
		.filter((s) => DA_KY.includes(trangThaiHoSo(ref, s)))
		.sort();
}

export function hoSoYamlHong(ref) {
	return hoSoDaKyTai(ref).filter((s) => {
		const t = docTai(ref, `_acceptance/${s}/${EVAL_TEP}`);
		return t !== null && yamlHong(t) !== null;
	});
}

export function tapDauVao(ref = MOC_NEN) {
	const f24 = JSON.parse(docTai(ref, NGUON_DAU_VAO.danhSachF24) ?? "{}");
	const tuF24 = [
		...(f24.ngoai_vong?.ho_so ?? []).map((h) => h.ho_so),
		...(f24.hoan_lai?.hang === NGUON_DAU_VAO.hangNhan ? f24.hoan_lai.ho_so.map((h) => h.ho_so ?? h) : []),
	];
	return [...new Set([...tuF24, ...NGUON_DAU_VAO.them, ...hoSoYamlHong(ref)])].sort();
}

export function khoa(d) {
	return `${d.ho_so}:${d.eval}`;
}

export function docJson(duong) {
	if (!existsSync(duong)) hong(2, `MA 2: khong co ${duong}`);
	try {
		return JSON.parse(readFileSync(duong, "utf8"));
	} catch (e) {
		return hong(2, `MA 2: ${duong} khong phai JSON — ${e.message}`);
	}
}

export function docDanhSach(duong = DANH_SACH) {
	const d = docJson(duong);
	if (!Array.isArray(d.dong) || !Array.isArray(d.hoan_lai) || d.moc_nen !== MOC_NEN)
		hong(2, `MA 2: ${duong} thieu dong[], hoan_lai[] hoac moc_nen khac ${MOC_NEN}`);
	return d;
}

export function tapDo(doLai) {
	return doLai.ho_so.flatMap((h) =>
		h.eval.filter((e) => e.exit !== e.ky_vong).map((e) => ({ ho_so: h.slug, eval: e.id, exit: e.exit, duoi: e.duoi ?? [] })),
	);
}

export function canMayChu(cmd) {
	return DAU_LENH_CAN_MAY_CHU.some((d) => String(cmd).includes(d));
}

export function thuMucChung() {
	return resolve(GOC, git("rev-parse", "--git-common-dir").trim(), "..");
}

export const NOI_VAO_CAY_TAM = [".env"];
const LENH_CAI = [
	["bun", ["install", "--frozen-lockfile"], "."],
	["bun", ["run", "db:generate"], "packages/db"],
];

export function dungCayTam(ref, ten) {
	const goc = mkdtempSync(join(tmpdir(), `${ten}-`));
	const cay = join(goc, "cay");
	git("worktree", "add", "--detach", "--quiet", cay, ref);
	for (const t of NOI_VAO_CAY_TAM)
		if (existsSync(join(GOC, t)) && !existsSync(join(cay, t))) {
			mkdirSync(dirname(join(cay, t)), { recursive: true });
			symlinkSync(join(GOC, t), join(cay, t));
		}
	for (const [lenh, thamSo, noi] of LENH_CAI) {
		const r = spawnSync(lenh, thamSo, { cwd: join(cay, noi), encoding: "utf8", maxBuffer: 1 << 26 });
		if (r.status !== 0) hong(2, `MA 2: cay tam khong cai duoc (${lenh} ${thamSo.join(" ")}): ${String(r.stderr).split("\n").slice(-3).join(" ")}`);
	}
	let daDon = false;
	const don = () => {
		if (daDon) return;
		daDon = true;
		gitThu("worktree", "remove", "--force", cay);
		rmSync(goc, { recursive: true, force: true });
	};
	process.on("exit", don);
	for (const s of ["SIGINT", "SIGTERM"])
		process.on(s, () => {
			don();
			process.exit(130);
		});
	return { cay, don };
}
