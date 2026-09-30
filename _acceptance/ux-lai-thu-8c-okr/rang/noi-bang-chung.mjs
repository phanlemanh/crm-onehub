import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const HO_SO = "ux-lai-thu-8c-okr";
export const GOC = join(THU_MUC, "..", "..", "..");
export const TAM_HO_SO = join(GOC, ".acceptance-runs", HO_SO);
export const DICH_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
const HOP_DONG =
	process.env.HOP_DONG ?? join(GOC, "_acceptance", HO_SO, "contract.md");
const TRANG_THAI_CHEP = "implemented";

function docTrangThai() {
	if (!existsSync(HOP_DONG))
		return { trangThai: null, ly: `không có ${HOP_DONG}` };
	const kit = spawnSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"lib/evidence-core.cjs",
		],
		{ encoding: "utf8" },
	);
	const goc = kit.stdout?.trim();
	if (kit.status !== 0 || !goc)
		return {
			trangThai: null,
			ly: "không tìm được lib/evidence-core.cjs của bộ kit",
		};
	const { frontmatterField } = createRequire(import.meta.url)(
		join(goc, "lib", "evidence-core.cjs"),
	);
	const trangThai = (
		frontmatterField(readFileSync(HOP_DONG, "utf8"), "status") ?? ""
	).toLowerCase();
	return { trangThai: trangThai || null, ly: null };
}

export function noiBangChung() {
	const { trangThai, ly } = docTrangThai();
	return {
		trangThai,
		chep: trangThai === TRANG_THAI_CHEP,
		ly:
			ly ??
			(trangThai === TRANG_THAI_CHEP
				? `hồ sơ đang ${trangThai}`
				: `hồ sơ đang ${trangThai ?? "(không đọc được)"}, chỉ chép khi ${TRANG_THAI_CHEP}`),
	};
}

export function chepSangBangChung(tepTam, conDich) {
	const noi = noiBangChung();
	const dich = [];
	if (noi.chep)
		for (const [tep, con] of tepTam.map((t, i) => [t, conDich[i]])) {
			const d = join(DICH_HO_SO, con);
			mkdirSync(dirname(d), { recursive: true });
			copyFileSync(tep, d);
			dich.push(d);
		}
	console.log(
		`bang chung: ${tepTam.length} tep o ${relative(GOC, dirname(tepTam[0] ?? TAM_HO_SO))}/ · ${noi.chep ? `da chep sang ${relative(GOC, DICH_HO_SO)}/` : "KHONG chep sang evidence/"} (${noi.ly})`,
	);
	return dich;
}
