import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGUON = join(GOC, "scripts", "dieu-phoi");
const NOW = Date.parse("2026-10-05T12:00:00Z");
const CFG = {
	nhanh_chinh: "main",
	han_thue_phut: { s4: 90, "ghim-lai": 40, "duong-nen": 40, merge: 120 },
	nhip_cu_phut: 10,
	suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 },
	bao_ve: [],
	s4_tran_gom_phut: 60,
};

const tam = [];
const moiThuMuc = () => {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "dph-nt-")));
	tam.push(d);
	return d;
};
const ghiJson = (p, du) => {
	mkdirSync(dirname(p), { recursive: true });
	writeFileSync(p, JSON.stringify(du));
};
const docJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const suKien = (dot) =>
	existsSync(join(dot, "su-kien.jsonl"))
		? readFileSync(join(dot, "su-kien.jsonl"), "utf8").trim().split("\n").filter(Boolean).map((d) => JSON.parse(d))
		: [];

function dungDot(hangViec) {
	const dot = moiThuMuc();
	ghiJson(join(dot, "dieu-phoi.config.json"), CFG);
	ghiJson(join(dot, "hang-viec.json"), hangViec);
	for (const d of ["khoa", "xin", "yeu-cau", "tra-loi", "cho-nguoi", "tiep"]) mkdirSync(join(dot, d), { recursive: true });
	return dot;
}

function taoIo({ gh = "[]", diff = "", show = {} } = {}) {
	return {
		nowMs: () => NOW,
		chay: (cmd, args) => {
			if (cmd === "sysctl" && args[0] === "vm.swapusage") return "total = 24576.00M  used = 1024.00M  free = 1.00M";
			if (cmd === "sysctl" && args.includes("kern.memorystatus_vm_pressure_level")) return "1";
			if (cmd === "sysctl") return "{ 3.00 2.00 1.00 }";
			if (cmd === "ps") return "102400 node\n";
			if (cmd === "gh") return gh;
			if (cmd === "git" && args[0] === "diff") return diff;
			if (cmd === "git" && args[0] === "show") {
				if (show[args[1]] !== undefined) return show[args[1]];
				throw new Error("not found");
			}
			return "";
		},
	};
}

async function caTiepTheoTrangThai(goc) {
	const { motNhip } = await import(pathToFileURL(join(goc, "phat-lich.mjs")).href);
	const w1 = moiThuMuc();
	const w2 = moiThuMuc();
	const dot = dungDot({
		dot: "nt",
		day: [{ id: "P1", worktree: w1 }, { id: "P2", worktree: w2 }],
		hang: [
			{ ma: "A", slug: "a", day: "P1", moc: "2026-10-12", uu_tien: 1 },
			{ ma: "B", slug: "b", day: "P1", moc: "2026-10-12", uu_tien: 2 },
			{ ma: "C", slug: "c", day: "P2", moc: "2026-10-14", uu_tien: 1, sau: ["A"] },
		],
	});
	mkdirSync(join(w1, "_acceptance", "b"), { recursive: true });
	writeFileSync(join(w1, "_acceptance", "b", "contract.md"), "---\nslug: b\nstatus: implemented\n---\n");
	await motNhip(dot, taoIo({ show: { "origin/main:_acceptance/a/contract.md": "---\nslug: a\nstatus: signed-off\n---\n" } }));
	const p1 = docJson(join(dot, "tiep", "P1.json"));
	const p2 = docJson(join(dot, "tiep", "P2.json"));
	const sai = [];
	if (p1?.hang !== "b" || p1?.moi !== false) sai.push(`tiep/P1 = ${JSON.stringify({ hang: p1?.hang, moi: p1?.moi })}, mong {hang:b, moi:false}`);
	if (p2?.hang !== "c" || p2?.moi !== true) sai.push(`tiep/P2 = ${JSON.stringify({ hang: p2?.hang, moi: p2?.moi })}, mong {hang:c, moi:true}`);
	return sai;
}

async function caNhanhCuaMinh(goc) {
	const { motNhip } = await import(pathToFileURL(join(goc, "phat-lich.mjs")).href);
	const w1 = moiThuMuc();
	const dot = dungDot({ dot: "nt", day: [{ id: "P1", worktree: w1 }], hang: [{ ma: "A", slug: "a", day: "P1", ranh_gioi: ["apps/a/**"] }] });
	const yc = (id, tep) => ghiJson(join(dot, "yeu-cau", `${id}.json`), { id, phien: "P1", loai: "cham-tep", hang: "a", noi_dung: { tep: [tep] }, luc: "2026-10-05T11:00:00Z" });
	yc("P1-1", "apps/x.ts");
	yc("P1-2", "apps/y.ts");
	await motNhip(dot, taoIo({ gh: JSON.stringify([{ headRefName: "feat/P1" }]), diff: "apps/x.ts\n" }));
	const sai = [];
	if (existsSync(join(dot, "tra-loi", "P1-1.json"))) sai.push(`P1-1 co tra-loi ${JSON.stringify(docJson(join(dot, "tra-loi", "P1-1.json")))}, mong can_phan`);
	const sk = suKien(dot).filter((s) => s.loai === "yeu-cau" && s.id === "P1-1" && s.can_phan === true);
	if (sk.length !== 1 || !String(sk[0]?.ly_do).includes("đang được nhánh feat/P1 sửa")) sai.push(`su kien can_phan P1-1: ${JSON.stringify(sk)}`);
	if (docJson(join(dot, "tra-loi", "P1-2.json"))?.ket_qua !== "duyet") sai.push("doi chung duong: P1-2 (apps/y.ts) khong duoc may duyet");
	return sai;
}

async function caPermissionPrompt(goc) {
	const { xuLyChoNguoi } = await import(pathToFileURL(join(goc, "hook-cho-nguoi.mjs")).href);
	const sai = [];
	const w1 = moiThuMuc();
	const dot = dungDot({ dot: "nt", day: [{ id: "P1", worktree: w1 }], hang: [] });
	const kq = xuLyChoNguoi({ hook_event_name: "Notification", notification_type: "permission_prompt", message: "xin quyen Bash", cwd: w1, session_id: "s1" }, { timDot: () => dot });
	const tep = docJson(join(dot, "cho-nguoi", "P1.json"));
	if (kq !== "ghi" || tep?.loai !== "permission_prompt") sai.push(`permission_prompt -> ${kq}, tep ${JSON.stringify(tep)}`);
	const w2 = moiThuMuc();
	const dot2 = dungDot({ dot: "nt", day: [{ id: "P1", worktree: w2 }], hang: [] });
	const kq2 = xuLyChoNguoi({ hook_event_name: "Notification", notification_type: "auth_success", cwd: w2 }, { timDot: () => dot2 });
	if (kq2 !== "bo-qua" || existsSync(join(dot2, "cho-nguoi", "P1.json"))) sai.push(`doi chung auth_success -> ${kq2}`);
	return sai;
}

const CA = [
	{ ten: "tiep-theo-trang-thai", chay: caTiepTheoTrangThai, dotBien: { ma: "M13", tep: "phat-lich.mjs", tim: "  const td = new Map();\n", thay: "  const td = new Map();\n  return td;\n" } },
	{ ten: "nhanh-cua-minh", chay: caNhanhCuaMinh, dotBien: { ma: "M14", tep: "phat-lich.mjs", tim: "nhanhCua: () => null", thay: "nhanhCua: () => 'feat/P1'" } },
	{ ten: "permission-prompt", chay: caPermissionPrompt, dotBien: { ma: "M15", tep: "hook-cho-nguoi.mjs", tim: "new Set(['idle_prompt', 'permission_prompt'])", thay: "new Set(['idle_prompt'])" } },
];

const ghi = (s) => process.stdout.write(`${s}\n`);
let saiTong = 0;
try {
	for (const ca of CA) {
		const sai = await ca.chay(NGUON);
		if (sai.length === 0) ghi(`XANH ${ca.ten}`);
		else {
			saiTong++;
			for (const s of sai) ghi(`DO: ${ca.ten}: ${s}`);
		}
		const ban = moiThuMuc();
		cpSync(NGUON, ban, { recursive: true });
		const p = join(ban, ca.dotBien.tep);
		const cu = readFileSync(p, "utf8");
		if (cu.split(ca.dotBien.tim).length !== 2) {
			ghi(`MOC VANG ${ca.dotBien.ma} ${ca.dotBien.tep}`);
			process.exit(2);
		}
		writeFileSync(p, cu.replace(ca.dotBien.tim, ca.dotBien.thay));
		const saiDb = await ca.chay(ban);
		if (saiDb.length > 0) ghi(`${ca.dotBien.ma} DO: ${ca.ten} (${saiDb.join("; ")})`);
		else {
			saiTong++;
			ghi(`SONG ${ca.dotBien.ma}: ${ca.ten} van xanh tren ban dot bien`);
		}
	}
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${saiTong === 0 ? "xanh, 3/3 dot bien bi bat" : `${saiTong} sai`}`);
process.exit(saiTong === 0 ? 0 : 1);
