import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

export const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
export const THU_MUC = path.join(GOC, "apps/app/test/fixtures/lo-trinh/x2");
export const TEP_MAU = path.join(THU_MUC, "LO-TRINH.html");
export const TEP_NGUON = path.join(THU_MUC, "nguon.json");
export const TEP_PROTO = path.join(
	GOC,
	"apps/app/app/proto/_modules/ngan-ho-so-trong-lo-trinh/du-lieu-x2.json",
);
const KIT_MAC_DINH = path.join(os.homedir(), "dev/acceptance-gate-kit");
const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;
const HEX40 = /^[0-9a-f]{40}$/;

export function catHam(chu) {
	const dau = chu.indexOf("export function docDuLieu");
	if (dau < 0) return null;
	const mo = chu.indexOf("{", chu.indexOf(")", dau));
	let sau = 0;
	for (let k = mo; k < chu.length; k++) {
		if (chu[k] === "{") sau++;
		if (chu[k] === "}") sau--;
		if (sau === 0) return chu.slice(dau, k + 1);
	}
	return null;
}

export const bam = (chu) => createHash("sha256").update(chu).digest("hex");

export function khoiCua(html) {
	const m = KHOI.exec(String(html));
	return m ? JSON.parse(m[1]) : null;
}

function giaiNen(kho, sha, dich) {
	const a = spawnSync("git", ["-C", kho, "archive", sha], {
		maxBuffer: 1 << 30,
	});
	if (a.status !== 0)
		return `git archive ${sha} ở ${kho} hỏng: ${String(a.stderr).trim()}`;
	const t = spawnSync("tar", ["-x", "-C", dich], {
		input: a.stdout,
		maxBuffer: 1 << 30,
	});
	return t.status === 0 ? null : `tar hỏng: ${String(t.stderr).trim()}`;
}

export function coCommit(kho, sha) {
	if (!existsSync(kho)) return false;
	const r = spawnSync("git", ["-C", kho, "cat-file", "-e", `${sha}^{commit}`]);
	return r.status === 0;
}

export function veLai({ kit, kitSha, crmSha }) {
	const tam = mkdtempSync(path.join(os.tmpdir(), "lhs-mau-"));
	try {
		const dKit = path.join(tam, "kit");
		const dCrm = path.join(tam, "crm");
		mkdirSync(dKit);
		mkdirSync(dCrm);
		const loi = giaiNen(kit, kitSha, dKit) ?? giaiNen(GOC, crmSha, dCrm);
		if (loi) throw new Error(loi);
		for (const thamSo of [
			["init", "-q"],
			["add", "-A"],
			[
				"-c",
				"user.email=mau@lan-do",
				"-c",
				"user.name=mau",
				"commit",
				"-qm",
				"ban sao",
			],
		]) {
			const g = spawnSync("git", thamSo, { cwd: dCrm, encoding: "utf8" });
			if (g.status !== 0)
				throw new Error(`git ${thamSo.join(" ")} hỏng: ${g.stderr}`);
		}
		const ve = spawnSync(
			"node",
			[path.join(dKit, "scripts/product-map.mjs"), "--root", dCrm],
			{ cwd: dCrm, encoding: "utf8" },
		);
		const trang = path.join(dCrm, "LO-TRINH.html");
		if (ve.status !== 0 || !existsSync(trang))
			throw new Error(
				`bộ vẽ của kit ${kitSha} không vẽ được LO-TRINH.html (mã ${ve.status}): ${ve.stderr}`,
			);
		const ham = catHam(
			readFileSync(path.join(dKit, "scripts/lo-trinh.mjs"), "utf8"),
		);
		return {
			html: readFileSync(trang),
			hamBam: ham === null ? null : bam(ham),
		};
	} finally {
		rmSync(tam, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 200,
		});
	}
}

export function lechByte(a, b) {
	const n = Math.min(a.length, b.length);
	for (let k = 0; k < n; k++) if (a[k] !== b[k]) return k;
	return a.length === b.length ? -1 : n;
}

function giaTri(thamSo, ten) {
	const i = thamSo.indexOf(ten);
	if (i < 0) return null;
	const v = thamSo[i + 1];
	if (!v || v.startsWith("--"))
		throw new Error(`${ten} cần một giá trị ngay sau nó`);
	return v;
}

function ghi({ kit, kitSha, crmSha }) {
	if (!HEX40.test(kitSha) || !HEX40.test(crmSha))
		throw new Error("--kit-sha và --crm-sha phải là mã commit đủ 40 ký tự");
	const { html, hamBam } = veLai({ kit, kitSha, crmSha });
	const khoi = khoiCua(html);
	if (khoi === null || khoi.phien_ban !== 2 || hamBam === null)
		throw new Error(`kit ${kitSha} không vẽ khối bản 2 — không ghi tệp mẫu`);
	mkdirSync(THU_MUC, { recursive: true });
	writeFileSync(TEP_MAU, html);
	writeFileSync(
		TEP_NGUON,
		`${JSON.stringify(
			{
				kit_sha: kitSha,
				crm_sha: crmSha,
				lenh: `node _acceptance/ngan-ho-so-trong-lo-trinh/rang/sinh-mau-x2.mjs --ghi --kit-sha ${kitSha} --crm-sha ${crmSha}`,
				ngay: new Date().toISOString().slice(0, 10),
				ham_doc_du_lieu_sha256: hamBam,
			},
			null,
			"\t",
		)}\n`,
	);
	mkdirSync(path.dirname(TEP_PROTO), { recursive: true });
	writeFileSync(TEP_PROTO, `${JSON.stringify(khoi, null, "\t")}\n`);
	console.log(
		`ghi ${path.relative(GOC, TEP_MAU)} (${html.length} byte), nguon.json, ${path.relative(GOC, TEP_PROTO)}`,
	);
}

export function kiem({ kit, nguon, html, proto }) {
	const dong = [];
	const them = (dung, nhan) => dong.push({ dung, nhan });
	const coKhoa =
		HEX40.test(String(nguon.kit_sha)) &&
		HEX40.test(String(nguon.crm_sha)) &&
		typeof nguon.lenh === "string" &&
		/^\d{4}-\d{2}-\d{2}$/.test(String(nguon.ngay)) &&
		/^[0-9a-f]{64}$/.test(String(nguon.ham_doc_du_lieu_sha256));
	them(coKhoa, coKhoa ? "nhan nguon du khoa" : "nhan nguon thieu hay sai khoa");
	if (!coKhoa) return { ma: 1, dong };
	if (!coCommit(kit, nguon.kit_sha))
		return {
			ma: 2,
			dong,
			cau: `khong co kit ${nguon.kit_sha} o may — khong ve lai duoc`,
		};
	const ve = veLai({ kit, kitSha: nguon.kit_sha, crmSha: nguon.crm_sha });
	const k = lechByte(ve.html, html);
	them(
		k < 0,
		k < 0
			? "tep mau khop ban ve lai tung byte"
			: `tep mau lech ban ve lai o byte ${k}`,
	);
	const khoi = khoiCua(html);
	const ban2 =
		khoi !== null &&
		khoi.phien_ban === 2 &&
		khoi.lo_trinh.some((t) => t.hang.some((h) => h.tom_tat != null));
	them(
		ban2,
		ban2 ? "khoi ban 2 co dai tom tat" : "khoi khong phai ban 2 co dai",
	);
	them(
		ve.hamBam === nguon.ham_doc_du_lieu_sha256,
		ve.hamBam === nguon.ham_doc_du_lieu_sha256
			? "bam ham docDuLieu cua kit khop nhan nguon"
			: "bam ham docDuLieu cua kit lech nhan nguon",
	);
	const khopProto = proto !== null && isDeepStrictEqual(proto, khoi);
	them(
		khopProto,
		khopProto
			? "du lieu ban mau == khoi cua tep mau"
			: "du lieu ban mau lech khoi cua tep mau",
	);
	return { ma: dong.every((d) => d.dung) ? 0 : 1, dong };
}

const laChinhNo = (() => {
	if (!process.argv[1]) return false;
	try {
		return (
			realpathSync(process.argv[1]) ===
			realpathSync(fileURLToPath(import.meta.url))
		);
	} catch {
		return false;
	}
})();

if (laChinhNo) {
	const thamSo = process.argv.slice(2);
	const kit = path.resolve(
		giaTri(thamSo, "--kit") ?? process.env.KIT_GOC ?? KIT_MAC_DINH,
	);
	try {
		if (thamSo.includes("--ghi")) {
			ghi({
				kit,
				kitSha: giaTri(thamSo, "--kit-sha") ?? "",
				crmSha: giaTri(thamSo, "--crm-sha") ?? "",
			});
			process.exit(0);
		}
		const nguon = JSON.parse(readFileSync(TEP_NGUON, "utf8"));
		const html = readFileSync(TEP_MAU);
		const proto = existsSync(TEP_PROTO)
			? JSON.parse(readFileSync(TEP_PROTO, "utf8"))
			: null;
		const kq = kiem({ kit, nguon, html, proto });
		for (const d of kq.dong)
			console.log(`${d.dung ? "DUNG" : "SAI"} ${d.nhan}`);
		let ma = kq.ma;
		if (ma === 0 && thamSo.includes("--pha-thu")) {
			const hong = Buffer.from(html);
			const vt = hong.indexOf("tom_tat");
			hong[vt] = hong[vt] === 0x74 ? 0x54 : 0x74;
			const pha = kiem({ kit, nguon, html: hong, proto });
			const bat = pha.dong.find((d) => !d.dung);
			const dung =
				pha.ma === 1 && bat?.nhan === `tep mau lech ban ve lai o byte ${vt}`;
			console.log(
				`${dung ? "DUNG" : "SAI"} pha-thu: doi mot byte trong khoi -> ${bat ? bat.nhan : "khong dong nao do"}`,
			);
			if (!dung) ma = 1;
		}
		console.log(`KET LUAN ma ${ma}${kq.cau ? ` — ${kq.cau}` : ""}`);
		process.exit(ma);
	} catch (loi) {
		console.log(`KET LUAN ma 1 — ${loi.message}`);
		process.exit(1);
	}
}
