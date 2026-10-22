import { fileURLToPath } from "node:url";
import { docDanhSach, docTai, EVAL_TEP, hong, kit, MOC_NEN, yamlHong } from "./chung.mjs";

const TRUONG = ["executor", "cmd", "status", "criterion", "expected", "paths"];

export function banGhiKit(text) {
	const { core, Y } = kit();
	const ky = Y.expectedExits(text).byId;
	return new Map(
		Y.parseEvals(text, TRUONG).map((e) => [
			e.id,
			{ ...Object.fromEntries(TRUONG.map((k) => [k, e[k] ?? null])), paths: core.evalPathsOf(text, e.id) ?? [], ma: ky.get(e.id) ?? 0 },
		]),
	);
}

export function soiHoSo(slug, textMoi, textCu) {
	const loi = [];
	const h = yamlHong(textMoi);
	if (h) loi.push(`YAML_HONG ${slug}:${h.dong}:${h.cot} — ${h.loi}`);
	const cu = banGhiKit(textCu);
	const moi = banGhiKit(textMoi);
	for (const id of new Set([...cu.keys(), ...moi.keys()])) {
		const a = cu.get(id);
		const b = moi.get(id);
		if (!a || !b) {
			loi.push(`NGHIA_DOI ${slug}:${id}:${a ? "bi-bo" : "them-moi"}`);
			continue;
		}
		for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) loi.push(`NGHIA_DOI ${slug}:${id}:${k}`);
	}
	return { loi, soEval: moi.size };
}

function tuKiem(slug, textMoi, textCu) {
	const sai = [];
	if (!yamlHong(textCu)) return ["ban moc nen cua ho so tu kiem da la YAML chuan — khong co loi de cay lai"];
	if (!soiHoSo(slug, textCu, textCu).loi.some((l) => l.startsWith(`YAML_HONG ${slug}`))) sai.push("cay lai ban moc nen khong ra YAML_HONG");
	const id = [...banGhiKit(textMoi).keys()][0];
	const doiChu = textMoi.replace(/(expected:\s*["']?)(\S)/, "$1x$2");
	if (doiChu === textMoi || !soiHoSo(slug, doiChu, textCu).loi.some((l) => l.startsWith(`NGHIA_DOI ${slug}:`))) sai.push(`doi mot chu expected (${id}) khong ra NGHIA_DOI`);
	return sai;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const slugs = docDanhSach()
		.dong.filter((d) => d.xu_ly === "sua-cu-phap")
		.map((d) => d.ho_so);
	if (!slugs.length) hong(2, "MA 2: khong dong sua-cu-phap nao");
	const loiTong = [];
	let tuKiemXong = false;
	for (const slug of slugs) {
		const moi = docTai(null, `_acceptance/${slug}/${EVAL_TEP}`);
		const cu = docTai(MOC_NEN, `_acceptance/${slug}/${EVAL_TEP}`);
		if (moi === null || cu === null) hong(2, `MA 2: khong doc duoc ${slug}/${EVAL_TEP} o HEAD hoac moc nen`);
		const { loi, soEval } = soiHoSo(slug, moi, cu);
		if (!tuKiemXong) {
			const sai = tuKiem(slug, moi, cu);
			if (sai.length) hong(1, `HONG tu kiem: ${sai.join("; ")}`);
			tuKiemXong = true;
		}
		if (loi.length) loiTong.push(...loi);
		else console.log(`${slug}: yaml chuẩn đọc được · ${soEval} eval, bản ghi kit giống mốc nền`);
	}
	for (const l of loiTong) console.log(l);
	console.log(`yaml-chuan: ${slugs.length - new Set(loiTong.map((l) => l.split(" ")[1].split(":")[0])).size}/${slugs.length} hồ sơ đạt`);
	process.exit(loiTong.length ? 1 : 0);
}
