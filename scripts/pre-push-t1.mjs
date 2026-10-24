import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { docGlobT1, quyetDinh, tachT1, tepT1 } from "../.github/scripts/phan-loai.mjs";

const KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SHA_RONG = /^0+$/;
const NHU_PR_SAN_SANG = { suKien: "pull_request", nhap: "false" };
const NHANH_CHINH = "onehub";
const DUOI = "CI phân loại PR theo cùng luật.";
const TOI_DA_TEP_MA_DOC = 3;
const LY_DO_CHI_NEN = "chi-cua-nen";
const LY_DO_GITHUB = "cham-github";
const THU_MUC_GITHUB = ".github/";
const TEP_KHAI_DA_CHUNG = join(".githooks", "da-chung.json");

function git(goc, ...args) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8" });
	return { ok: r.status === 0, ra: (r.stdout || "").trim(), loi: (r.stderr || "").trim().split("\n")[0] };
}

function gitPhai(goc, ...args) {
	const r = git(goc, ...args);
	if (!r.ok) throw new Error(`git ${args[0]} hỏng: ${r.loi}`);
	return r.ra;
}

export function docDong(chu) {
	return chu
		.split("\n")
		.map((d) => d.trim())
		.filter(Boolean)
		.map((d) => {
			const [localRef, localSha, remoteRef, remoteSha] = d.split(/\s+/);
			return { localRef, localSha, remoteRef, remoteSha };
		});
}

function gocSo(goc, dong, remote) {
	if (dong.remoteSha && !SHA_RONG.test(dong.remoteSha) && git(goc, "cat-file", "-e", `${dong.remoteSha}^{commit}`).ok) {
		return dong.remoteSha;
	}
	const ref = `refs/remotes/${remote}/${NHANH_CHINH}`;
	if (!git(goc, "rev-parse", "--verify", "-q", ref).ok) throw new Error(`thiếu ${remote}/${NHANH_CHINH}`);
	return gitPhai(goc, "merge-base", ref, dong.localSha);
}

function tepDiff(goc, tu, den) {
	return gitPhai(goc, "diff", "--name-only", "--no-renames", tu, den).split("\n").filter(Boolean);
}

function tepRieng(goc, dong, remote, tang) {
	const ref = `refs/remotes/${remote}/${NHANH_CHINH}`;
	if (!git(goc, "rev-parse", "--verify", "-q", ref).ok) return new Set(tang);
	const nen = gitPhai(goc, "merge-base", dong.localSha, ref);
	const truoc = gitPhai(goc, "merge-base", nen, dong.remoteSha);
	return new Set([...tepDiff(goc, nen, dong.localSha), ...tepDiff(goc, truoc, dong.remoteSha)]);
}

export function tepDay(goc, dongs, remote) {
	const tep = new Set();
	const tang = new Set();
	for (const dong of dongs) {
		if (!dong.localSha || SHA_RONG.test(dong.localSha)) continue;
		const goc0 = gocSo(goc, dong, remote);
		const ds = tepDiff(goc, goc0, dong.localSha);
		const rieng = goc0 === dong.remoteSha ? tepRieng(goc, dong, remote, ds) : new Set(ds);
		for (const t of ds) {
			tang.add(t);
			if (rieng.has(t)) tep.add(t);
		}
	}
	return { tep: [...tep].sort(), cuaNen: [...tang].filter((t) => !tep.has(t)).sort() };
}

export function docBoQua(goc) {
	const hinh = JSON.parse(readFileSync(join(goc, ".githooks", "gate-shape.json"), "utf8"));
	const skip = hinh.t1Only?.skip;
	if (!Array.isArray(skip) || skip.length === 0) throw new Error("gate-shape.json không khai khối t1Only");
	return skip;
}

function xepLoai(goc, tep, cuaNen) {
	const boQua = docBoQua(goc);
	const globs = docGlobT1(goc);
	if (tep.length === 0 && cuaNen.length > 0) return { boQua, tep, lyDo: LY_DO_CHI_NEN };
	const t1 = tep.length ? tepT1(globs, tep) : new Set();
	const kq = quyetDinh({ ...NHU_PR_SAN_SANG, tep, laT1: (t) => t1.has(t) });
	return { boQua: kq.nang ? [] : boQua, tep, lyDo: kq.lyDo };
}

export function phanLoaiDay(goc, dongs, remote) {
	const { tep, cuaNen } = tepDay(goc, dongs, remote);
	return { ...xepLoai(goc, tep, cuaNen), cuaNen };
}

export function tepMaDocDay(goc, tep) {
	if (tep.length === 0) return [];
	const { t1, maDoc } = tachT1(docGlobT1(goc), tep);
	const kq = quyetDinh({ ...NHU_PR_SAN_SANG, tep, laT1: (t) => t1.has(t), laMaDoc: (t) => maDoc.has(t) });
	return kq.lyDo === "t1-ma-doc" ? [...maDoc].sort() : [];
}

function rutGon(ds) {
	const con = ds.length - TOI_DA_TEP_MA_DOC;
	return `${ds.slice(0, TOI_DA_TEP_MA_DOC).join(", ")}${con > 0 ? ` +${con}` : ""}`;
}

async function daChung(dongs, remote, boQuaT1) {
	if (!existsSync(join(KHO, TEP_KHAI_DA_CHUNG))) return [];
	try {
		const m = await import("./pre-push-da-chung.mjs");
		const khai = m.docKhai(KHO);
		const kq = m.chungDay(KHO, khai, dongs, remote);
		m.ghiPhieu(KHO, { refs: kq.refs, t1: boQuaT1, daChung: kq.buoc });
		if (kq.dong) process.stderr.write(`${kq.dong}\n`);
		return kq.buoc;
	} catch (e) {
		process.stderr.write(`pre-push: không đọc được dấu cây (${String(e.message).replace(/\s+/g, " ").trim()}) — chạy như cũ.\n`);
		return [];
	}
}

async function chay() {
	const i = process.argv.indexOf("--remote");
	const remote = i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : "origin";
	let chu = "";
	try {
		chu = readFileSync(0, "utf8");
	} catch {
		chu = "";
	}
	let boQuaT1 = [];
	try {
		const kq = phanLoaiDay(KHO, docDong(chu), remote);
		const n = kq.tep.length;
		const k = kq.cuaNen.length;
		if (kq.boQua.length) {
			const bo = kq.boQua.join(", ");
			if (k === 0) process.stderr.write(`pre-push: chỉ tệp T1 (${n} tệp) — bỏ ${bo}; ${DUOI}\n`);
			else if (n === 0)
				process.stderr.write(`pre-push: lần đẩy chỉ mang phần của ${NHANH_CHINH} (${k} tệp), PR không tự thêm tệp nào — bỏ ${bo}; ${DUOI}\n`);
			else
				process.stderr.write(
					`pre-push: chỉ tệp T1 trong phần PR tự thêm (${n} tệp; ${k} tệp của ${NHANH_CHINH} không tính) — bỏ ${bo}; ${DUOI}\n`,
				);
			boQuaT1 = kq.boQua;
		} else if (k > 0 && n > 0) {
			const maDoc = tepMaDocDay(KHO, kq.tep);
			const t1 = tepT1(docGlobT1(KHO), kq.tep);
			const ngoai = kq.tep.filter((t) => !t1.has(t));
			const github = kq.tep.filter((t) => t.startsWith(THU_MUC_GITHUB));
			const [loai, ds] =
				kq.lyDo === LY_DO_GITHUB
					? ["tệp dưới .github/", github]
					: maDoc.length
						? ["tệp T1 mà mã đọc", maDoc]
						: ["tệp ngoài T1", ngoai];
			process.stderr.write(
				`pre-push: phần PR tự thêm (${n} tệp; ${k} tệp của ${NHANH_CHINH} không tính) có ${loai} (${rutGon(ds)}) — chạy đủ năm bước.\n`,
			);
		} else {
			const maDoc = tepMaDocDay(KHO, kq.tep);
			if (maDoc.length) process.stderr.write(`pre-push: có tệp T1 mà mã đọc (${rutGon(maDoc)}) — chạy đủ năm bước.\n`);
		}
	} catch (e) {
		process.stderr.write(`pre-push: không phân loại được lần đẩy (${String(e.message).replace(/\s+/g, " ").trim()}) — chạy đủ năm bước.\n`);
	}
	const tong = [...new Set([...boQuaT1, ...(await daChung(docDong(chu), remote, boQuaT1))])];
	if (tong.length) process.stdout.write(`${tong.join(" ")}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) chay();
