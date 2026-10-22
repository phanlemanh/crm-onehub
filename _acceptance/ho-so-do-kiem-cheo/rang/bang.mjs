import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BANG, DO_LAI_NEN, docDanhSach, docJson, docTai, GOC, gitThu, HO_SO_DIR, kit, MOC_NEN, tapDo } from "./chung.mjs";

const KET_QUA_CHIEU_DO = join(HO_SO_DIR, "chieu-do-ket-qua.json");
const TRUONG = ["status", "cmd", "expected"];
const SO_DONG_THONG_DIEP = 6;

export function nguyenVanCanCu(cc) {
	const s = String(cc ?? "").trim();
	const m = /^(.+):(\d+)$/.exec(s);
	if (m && existsSync(join(GOC, m[1]))) return readFileSync(join(GOC, m[1]), "utf8").split("\n")[Number(m[2]) - 1]?.trim() ?? "";
	if (/^[0-9a-f]{7,40}$/.test(s)) {
		const t = gitThu("log", "-1", "--format=%h %s%n%b", s);
		return t ? t.trim().split("\n").filter(Boolean).slice(0, SO_DONG_THONG_DIEP).join(" / ") : "";
	}
	if (existsSync(join(GOC, s))) return `(tệp ${s})`;
	return "";
}

function evalCua(ref, slug, id) {
	const t = docTai(ref, `_acceptance/${slug}/evals.yaml`);
	if (t === null) return null;
	const e = kit().Y.parseEvals(t, TRUONG).find((x) => x.id === id);
	return e ? Object.fromEntries(TRUONG.map((k) => [k, e[k] ?? ""])) : null;
}

function khoi(tieuDe, dong, duoi, chieuDo, ref) {
	const ra = [`### ${tieuDe}`, "", `- Xử lý: \`${dong.xu_ly}\``, `- Lý do: ${dong.ly_do ?? ""}`, `- Căn cứ: \`${dong.can_cu ?? ""}\` — ${nguyenVanCanCu(dong.can_cu) || "(không đọc được)"}`];
	if (dong.sua) ra.push(`- Sửa: ${dong.sua}`);
	ra.push("", "Đầu ra đỏ ở mốc nền:", "", "```", ...(duoi.length ? duoi : ["(không có)"]), "```");
	if (ref) {
		const [slug, id] = tieuDe.split(":");
		const truoc = evalCua(MOC_NEN, slug, id);
		const sau = evalCua(null, slug, id);
		for (const k of TRUONG)
			if (truoc && sau && truoc[k] !== sau[k]) ra.push("", `Trước (\`${k}\`): ${truoc[k] || "(trống)"}`, "", `Sau (\`${k}\`): ${sau[k] || "(trống)"}`);
	}
	if (dong.dot_bien) {
		ra.push("", `Đột biến \`${dong.dot_bien.ten}\` — thông điệp ghim «${dong.dot_bien.thong_diep}»`);
		const kq = chieuDo?.[tieuDe];
		if (kq) ra.push("", "```", `nguyên vẹn ${kq.nguyenVen} · đột biến ${kq.dotBien}${kq.neo !== null && kq.neo !== undefined ? ` · neo sai ${kq.neo}` : ""}`, ...(kq.duoiDotBien ?? []), "```");
	}
	return ra.join("\n");
}

export function sinhBang(ds, doLai) {
	const duoi = new Map(tapDo(doLai).map((d) => [`${d.ho_so}:${d.eval}`, d.duoi]));
	const chieuDo = existsSync(KET_QUA_CHIEU_DO) ? JSON.parse(readFileSync(KET_QUA_CHIEU_DO, "utf8")) : null;
	const phan = [`# Bảng trước/sau — ho-so-do-kiem-cheo`, "", `Máy sinh bằng \`rang/bang.mjs\` từ danh-sach.json, do-lai-nen.json (mốc nền ${MOC_NEN}) và diff tới HEAD. Không sửa tay.`, "", "## Dòng của vòng"];
	for (const d of ds.dong) {
		if (d.xu_ly === "sua-cu-phap") continue;
		phan.push("", khoi(`${d.ho_so}:${d.eval}`, d, duoi.get(`${d.ho_so}:${d.eval}`) ?? [], chieuDo, true));
	}
	phan.push("", "## Hồ sơ hoàn lại");
	for (const h of ds.hoan_lai) {
		for (const s of h.san_pham_hong) phan.push("", khoi(`${h.ho_so}:${s.eval}`, { ...s, xu_ly: "san-pham-hong" }, duoi.get(`${h.ho_so}:${s.eval}`) ?? [], null, false));
		for (const t of h.tin_hieu ?? []) phan.push("", `- Tín hiệu ${t.ma}: ${t.tieu_de}`);
	}
	phan.push("", "## Sửa cú pháp YAML", "", ...ds.dong.filter((d) => d.xu_ly === "sua-cu-phap").map((d) => `- \`${d.ho_so}\` — ${d.ly_do}`), "");
	return phan.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const bang = sinhBang(docDanhSach(), docJson(DO_LAI_NEN));
	if (process.argv.includes("--ghi")) writeFileSync(BANG, bang);
	else process.stdout.write(bang);
}
