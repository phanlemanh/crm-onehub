import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = "apps/app/components/crm/record-sheet";
const KHUON = "design/patterns/ngan-ban-ghi.md";
const THIET_KE = "docs/design.md";
const NGAN = [
	{ dt: "deal", kind: "deal", ham: "DealSheet", tep: "deal-sheet.tsx" },
	{ dt: "lien-he", kind: "contact", ham: "ContactSheet", tep: "contact-sheet.tsx" },
	{ dt: "cong-ty", kind: "company", ham: "CompanySheet", tep: "company-sheet.tsx" },
	{ dt: "ke-hoach", kind: "plan", ham: "PlanSheet", tep: "plan-sheet.tsx" },
	{ dt: "muc-tieu", kind: "objective", ham: "ObjectiveSheet", tep: "objective-sheet.tsx" },
	{ dt: "kr", kind: "kr", ham: "KrSheet", tep: "kr-sheet.tsx" },
	{ dt: "so-kr", kind: "so-kr", ham: "SoKrSheet", tep: "so-kr-sheet.tsx" },
];
const CAM = ["DetailSheetHeader", "Spinner", "VungTaiLoi"];
const KHUNG = /<(RecordSheetFrame|KhungNgan|KhungKr)\b/;
const NGOAI_LE_SKELETON = new Set(["kr-sheet.tsx", "so-kr-sheet.tsx"]);
const KHOA_KHUON = ["nhom", "doi_tuong", "khuon", "nhan_dien", "mau_dang_chay", "khe_bat_buoc", "cam_ngoai_khuon", "ngoai_le"];

function nhap(ma, ten) {
	return new RegExp(`import\\s*(?:type\\s*)?\\{[^}]*\\b${ten}\\b[^}]*\\}\\s*from`, "s").test(ma);
}

export function quet(goc) {
	const doc = (p) => readFileSync(join(goc, p), "utf8");
	const loi = [];
	const host = doc(`${THU_MUC}/record-sheet-host.tsx`);
	for (const n of NGAN) {
		if (!new RegExp(`kind === "${n.kind}"[\\s\\S]{0,240}<${n.ham}\\b`).test(host))
			loi.push(`HOST ${n.kind}: record-sheet-host.tsx khong dung ${n.ham}`);
		const ma = doc(`${THU_MUC}/${n.tep}`);
		if (!KHUNG.test(ma)) loi.push(`NGOAI KHUNG ${n.tep}: khong goi RecordSheetFrame, KhungNgan hay KhungKr`);
		for (const c of CAM) if (nhap(ma, c)) loi.push(`CAM ${n.tep}: nhap ${c}`);
		if (nhap(ma, "Skeleton") && !NGOAI_LE_SKELETON.has(n.tep))
			loi.push(`CAM ${n.tep}: nhap Skeleton ngoai danh sach ngoai le`);
	}
	const khuon = doc(KHUON);
	const fm = /^---\n([\s\S]*?)\n---/.exec(khuon)?.[1] ?? "";
	for (const k of KHOA_KHUON) if (!new RegExp(`^${k}:`, "m").test(fm)) loi.push(`KHUON thieu khoa ${k}`);
	const dt = /^doi_tuong:\s*\[([^\]]*)\]/m.exec(fm)?.[1].split(",").map((x) => x.trim()) ?? [];
	const mong = NGAN.map((n) => n.dt);
	if (dt.join(",") !== mong.join(",")) loi.push(`KHUON doi_tuong ${JSON.stringify(dt)} khac ${JSON.stringify(mong)}`);
	for (const n of NGAN) if (!khuon.includes(n.tep)) loi.push(`KHUON khong nhac ${n.tep}`);
	const tk = doc(THIET_KE);
	const muc = /### Chờ tải và lỗi tải trong ngăn bản ghi\n([\s\S]*?)\n### /.exec(tk)?.[1] ?? "";
	if (!muc) loi.push("THIET KE thieu muc «Chờ tải và lỗi tải trong ngăn bản ghi»");
	for (const t of ["KhungXuongNgan", "KhungTaiLoi", "VungTaiLoi", KHUON]) if (muc && !muc.includes(t)) loi.push(`THIET KE muc ngan khong nhac ${t}`);
	return loi;
}

function ca(ten, dat, chiTiet) {
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten}${dat ? "" : ` — ${chiTiet}`}`);
	return dat;
}

let ok = true;
const lanh = quet(GOC);
ok = ca("ban-lanh: bay ngan di qua khung, khuon va thiet ke dung", lanh.length === 0, lanh.join("; ")) && ok;

const tam = mkdtempSync(join(tmpdir(), "bk1-quet-"));
try {
	for (const p of [THU_MUC, "design", "docs"]) cpSync(join(GOC, p), join(tam, p), { recursive: true });
	const deal = join(tam, THU_MUC, "deal-sheet.tsx");
	const goc = readFileSync(deal, "utf8");
	writeFileSync(deal, `import { DetailSheetHeader } from "@/components/detail-sheet";\n${goc}`);
	const pha1 = quet(tam);
	ok = ca("pha-nhap-cam: deal-sheet nhap DetailSheetHeader thi do, goi ten tep va khoi", pha1.includes("CAM deal-sheet.tsx: nhap DetailSheetHeader"), pha1.join("; ")) && ok;
	writeFileSync(deal, goc.replace(/<RecordSheetFrame\b/g, "<KhungTuDung"));
	const pha2 = quet(tam);
	ok = ca("pha-thoat-khung: deal-sheet khong goi khung thi do", pha2.includes("NGOAI KHUNG deal-sheet.tsx: khong goi RecordSheetFrame, KhungNgan hay KhungKr"), pha2.join("; ")) && ok;
	writeFileSync(deal, goc);
	const k = join(tam, KHUON);
	writeFileSync(k, readFileSync(k, "utf8").replace(", so-kr]", "]"));
	const pha3 = quet(tam);
	ok = ca("pha-khuon: bo so-kr khoi doi_tuong thi do", pha3.some((d) => d.startsWith("KHUON doi_tuong")), pha3.join("; ")) && ok;
} finally {
	rmSync(tam, { recursive: true, force: true });
}

if (!ok) process.exit(1);
console.log("DAT tat ca");
