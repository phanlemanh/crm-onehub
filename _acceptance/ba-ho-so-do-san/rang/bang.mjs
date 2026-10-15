import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { docDanhSach, docTai, gitThu, GOC, MOC_NEN, SLUG } from "./chung.mjs";

function khoiEval(text, id) {
	if (text === null) return "(tep vang)";
	const dong = text.split("\n");
	const dau = dong.findIndex((l) => l.trim() === `- id: ${id}`);
	if (dau < 0) return "(khong co eval)";
	let cuoi = dau + 1;
	while (cuoi < dong.length && !/^\s{2}- id: /.test(dong[cuoi]) && !/^\S/.test(dong[cuoi])) cuoi++;
	return dong.slice(dau, cuoi).join("\n").trimEnd();
}

const rao = (s) => `\`\`\`\n${String(s).trimEnd()}\n\`\`\``;

function vatGo(r) {
	const ra = [];
	if (/^[0-9a-f]{7,40}$/.test(r.can_cu ?? "")) {
		ra.push(`Commit căn cứ: ${rao(gitThu("show", "--stat", "--format=%h %ad %s", "--date=short", r.can_cu)?.split("\n").slice(0, 25).join("\n") ?? "(khong doc duoc)")}`);
	} else if (r.can_cu) {
		const m = /^(.+):(\d+)$/.exec(r.can_cu);
		const t = m ? docTai(null, m[1]) : null;
		ra.push(`Căn cứ \`${r.can_cu}\`: ${rao(t ? t.split("\n")[Number(m[2]) - 1] : "(khong doc duoc)")}`);
	}
	if (r.muc) {
		const dac = /[*?]/.test(r.muc) ? `:(glob)${r.muc}` : `:(literal)${r.muc}`;
		const co = gitThu("ls-files", "--", dac)?.trim();
		ra.push(`Vật của mục \`${r.muc}\` ở HEAD: ${co ? `CÒN (${co.split("\n").length} tệp)` : "VẮNG"}`);
	}
	return ra.join("\n\n");
}

function chayBang(lenh) {
	const r = spawnSync(lenh[0], lenh.slice(1), { cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	return `${r.stdout}${r.stderr}`.trim().split("\n").slice(-40).join("\n");
}

function phanThem(r) {
	const ra = [];
	if (Array.isArray(r.ly_do_tach) && r.ly_do_tach.length) {
		ra.push("Lý do tách theo loại (1 = vật đã gỡ · 2 = tiền đề bị quyết định đã ký sau lật · 3 = lỗi của chính răng):", "", "| Loại | Lý do | Căn cứ |", "|---|---|---|");
		for (const t of r.ly_do_tach) ra.push(`| ${t.loai} | ${String(t.ly_do).replaceAll("|", "/")} | \`${t.can_cu ?? "-"}\` |`);
		ra.push("");
	}
	for (const b of r.bang_them ?? []) ra.push(`${b.tieu_de}:`, rao(chayBang(b.lenh)), "");
	return ra;
}

function chieuDo() {
	const r = spawnSync("bun", [join(GOC, "_acceptance", SLUG, "rang", "chieu-do.mjs")], { cwd: GOC, encoding: "utf8" });
	return `${r.stdout}${r.stderr}`.trim();
}

const d = docDanhSach();
const nhom = new Map();
for (const r of d.dong) {
	if (!["khai-not-run", "sua-rang"].includes(r.xu_ly)) continue;
	const k = `${r.ho_so}:${r.eval}`;
	if (!nhom.has(k)) nhom.set(k, []);
	nhom.get(k).push(r);
}
const raChieuDo = chieuDo();
const phan = [
	"# Bảng trước/sau — ba-ho-so-do-san",
	"",
	`Máy sinh bằng \`rang/bang.mjs\` từ \`danh-sach.json\`, mốc nền \`${MOC_NEN}\`. Mỗi mục là một eval mà vòng này khai không chạy hoặc sửa răng.`,
	"",
];
for (const [k, rows] of nhom) {
	const [slug, id] = k.split(":");
	const r = rows[0];
	const tep = `_acceptance/${slug}/evals.yaml`;
	phan.push(`## ${k} — ${r.xu_ly}`, "");
	phan.push(`Lý do: ${r.ly_do ?? "(trống)"}`, "", `Căn cứ: \`${r.can_cu ?? "-"}\``, "");
	if (rows.length > 1) phan.push(`Mục paths trong dòng: ${rows.map((x) => `\`${x.muc ?? "-"}\``).join(", ")}`, "");
	phan.push("Trước (mốc nền):", rao(khoiEval(docTai(MOC_NEN, tep), id)), "", "Sau (cây đang xét):", rao(khoiEval(docTai(null, tep), id)), "");
	if (r.xu_ly === "khai-not-run") phan.push(rows.map(vatGo).filter(Boolean).join("\n\n"), "");
	if (r.xu_ly === "sua-rang" && /^[0-9a-f]{7,40}$/.test(r.can_cu ?? "")) phan.push(vatGo({ ...r, muc: null }), "");
	phan.push(...phanThem(r));
	if (r.xu_ly === "sua-rang") {
		for (const t of r.tep ?? []) phan.push(`Diff \`${t}\`:`, rao(gitThu("diff", MOC_NEN, "HEAD", "--", t) || "(khong doi)"), "");
		phan.push("Đột biến khai:", rao(JSON.stringify(r.dot_bien ?? [], null, 2)), "");
		phan.push("Đầu ra chieu-do.mjs cho dòng này:", rao(raChieuDo.split("\n").filter((l) => l.includes(k)).join("\n") || "(khong co dong nao)"), "");
	}
}
writeFileSync(join(GOC, "_acceptance", SLUG, "bang-truoc-sau.md"), `${phan.join("\n")}\n`);
console.log(`bang: ${nhom.size} eval khai-not-run/sua-rang`);
