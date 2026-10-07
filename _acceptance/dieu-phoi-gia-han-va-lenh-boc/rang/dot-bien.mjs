import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGUON = join(GOC, "scripts", "dieu-phoi");
const TEP_TEST = "gia-han-va-lenh-boc";
const TRAN_LENH_MS = 60_000;

const CA = {
	T1: "tra-loi hỏng không làm đứng nhịp: thu hồi, cấp, ghi bảng; dời tệp và báo một lần",
	T2: "sau khi dời tệp hỏng: không báo lại; trong trần máy duyệt lại và gia hạn một lần; vượt trần chờ giám sát không lặp",
	T3: "tra-loi hợp lệ mà không phải object bị coi là hỏng",
	T4: "tra-loi lành của giám sát vẫn gia hạn như cũ, không có tra-loi-hong",
	T5: "giu-nhip: tiền tố biến tới tiến trình con, giữ môi trường cũ, mã thoát đúng, vẫn chạm nhịp; không tiền tố như cũ; chỉ gán biến thoát 2",
	T6: "dòng gợi ý của hook cho lệnh nền có tiền tố biến chạy được bằng sh -c và được hook cho qua",
};

const DOT_BIEN = [
	{ ma: "G1", tep: "phat-lich.mjs", tim: "    const tra = docTraLoi(thuMuc, y._ten);", thay: "    const tra = docJson(path.join(thuMuc, 'tra-loi', `${y._ten}.json`));", ghim: ["T1"] },
	{ ma: "G2", tep: "phat-lich.mjs", tim: "  fs.renameSync(p, path.join(path.dirname(p), 'hong', path.basename(p)));\n", thay: "", ghim: ["T2"] },
	{ ma: "G3", tep: "phat-lich.mjs", tim: "const laBanGhi = du !== null && typeof du === 'object' && !Array.isArray(du);", thay: "const laBanGhi = true;", ghim: ["T3"] },
	{ ma: "G4", tep: "phat-lich.mjs", tim: "return laBanGhi ? du : doiTraLoiHong(thuMuc, p, 'không phải object');", thay: "return doiTraLoiHong(thuMuc, p, 'không phải object');", ghim: ["T4"] },
	{ ma: "G5", tep: "giu-nhip.mjs", tim: "    const { bien, conLai } = tachBien(lenh);", thay: "    const { bien, conLai } = { bien: {}, conLai: lenh };", ghim: ["T5", "T6"] },
	{
		ma: "G6",
		tep: "giu-nhip.mjs",
		tim: "  const viTri = lenh.findIndex((tu) => !MAU_GAN_BIEN.test(tu));\n  const so = viTri === -1 ? lenh.length : viTri;\n  return {\n    bien: Object.fromEntries(lenh.slice(0, so).map((tu) => tu.match(MAU_GAN_BIEN).slice(1))),\n    conLai: lenh.slice(so),\n  };",
		thay: "  const laGan = (tu) => tu.includes('=');\n  return {\n    bien: Object.fromEntries(lenh.filter(laGan).map((tu) => [tu.slice(0, tu.indexOf('=')), tu.slice(tu.indexOf('=') + 1)])),\n    conLai: lenh.filter((tu) => !laGan(tu)),\n  };",
		ghim: ["T5"],
	},
	{ ma: "G7", tep: "giu-nhip.mjs", tim: "env: { ...process.env, ...bien }", thay: "env: process.env", ghim: ["T5", "T6"] },
];

const ghi = (s) => process.stdout.write(`${s}\n`);

function chayTest(thuMuc) {
	const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", join(thuMuc, "test", `${TEP_TEST}.test.mjs`)], {
		cwd: thuMuc,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
	});
	const tap = r.stdout ?? "";
	const do_ = [...tap.matchAll(/^\s*not ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
	const xanh = [...tap.matchAll(/^\s*ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
	return { ma: r.status, do_, xanh };
}

function banChep() {
	const d = mkdtempSync(join(tmpdir(), "dph-gh-"));
	cpSync(NGUON, d, { recursive: true });
	return d;
}

const tam = [];
let sai = 0;
try {
	const nen = banChep();
	tam.push(nen);
	const r = chayTest(nen);
	ghi(`nen ${TEP_TEST}: ma ${r.ma}, xanh ${r.xanh.length}, do ${r.do_.length}`);
	if (r.ma !== 0 || r.do_.length > 0 || r.xanh.length === 0) {
		ghi(`NEN DO ${TEP_TEST}`);
		process.exit(2);
	}
	for (const ma of new Set(DOT_BIEN.flatMap((m) => m.ghim))) {
		if (!r.xanh.includes(CA[ma])) {
			ghi(`KHONG DO DUOC: ca ghim '${CA[ma]}' khong co trong ${TEP_TEST}.test.mjs`);
			process.exit(2);
		}
	}
	for (const m of DOT_BIEN) {
		const d = banChep();
		tam.push(d);
		const p = join(d, m.tep);
		const cu = readFileSync(p, "utf8");
		if (cu.split(m.tim).length !== 2) {
			ghi(`MOC VANG ${m.ma} ${m.tep}`);
			process.exit(2);
		}
		writeFileSync(p, cu.replace(m.tim, () => m.thay));
		const doThat = new Set(chayTest(d).do_);
		for (const ca of doThat) ghi(`${m.ma} DO: ${ca}`);
		for (const g of m.ghim) {
			if (doThat.has(CA[g])) ghi(`BAT ${m.ma} ${g}`);
			else {
				sai++;
				ghi(`SONG ${m.ma}: ${g} ${CA[g]} — do that: ${[...doThat].join(" | ") || "khong ca nao"}`);
			}
		}
	}
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${DOT_BIEN.length} dot bien, ${sai === 0 ? "moi ca ghim deu do" : `${sai} ca ghim song`}`);
process.exit(sai === 0 ? 0 : 1);
