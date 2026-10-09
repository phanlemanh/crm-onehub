import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { laTepChinh } from "../../../scripts/kiem-cheo/tep-chinh.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const KHO = "phanlemanh/crm-onehub";
const TEP_CI = ".github/workflows/ci.yml";
const MAU_TOI_THIEU = 10;
const NGUONG_SONG_PHUT = 15;
const NGUONG_CHET_PHUT = 20;
const CUA_SO_NGAY = 7;
const GIO_MS = 3600 * 1000;
const NGAY_MS = 24 * GIO_MS;
const BO_DEM_RONG = { tran: 0, de: 0, tay: 0, "chua-chay": 0 };
const LOP_DUNG = [
	["tran", /exceeded the maximum execution time/],
	["de", /higher priority waiting request/],
	["tay", /\bcanceled by\b/],
];

export class LoiDo extends Error {}

const phutGiua = (j) => (Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000;
const isoGiay = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");

export function ganPr(run, pulls, nhanh) {
	const cung = pulls.filter((p) => p.head?.ref === run.head_branch);
	if (cung.length === 0) return "khong-gan";
	return cung.some((p) => p.base?.ref === nhanh) ? "mau" : "base-khac";
}

export function xepDung(job, annotations) {
	if (!job.started_at) return "chua-chay";
	const cau = annotations.map((a) => String(a.message ?? ""));
	for (const [lop, mau] of LOP_DUNG) if (cau.some((c) => mau.test(c))) return lop;
	throw new LoiDo(
		`khong xep duoc job dung «${job.name}» (job ${job.id}, luot ${job.run_id}, attempt ${job.run_attempt}): ${cau.join(" | ") || "(khong co annotation)"}`,
	);
}

export function tongHopLuot(run, jobs, xep) {
	const cuoi = jobs.filter((j) => j.run_attempt === run.run_attempt);
	const ciOk = cuoi.find((j) => j.name === "ci-ok");
	const dangChay = run.status !== "completed";
	const daXong = cuoi.filter((j) => j.started_at && j.completed_at);
	const dung = { ...BO_DEM_RONG };
	for (const j of jobs.filter((x) => x.conclusion === "cancelled")) dung[xep(j)] += 1;
	return {
		maTran: dangChay ? null : Boolean(ciOk),
		dangChay,
		xanh: !dangChay && ciOk?.conclusion === "success",
		daiNhatPhut: daXong.length ? Math.max(...daXong.map(phutGiua)) : null,
		dung,
	};
}

export function trungVi(ds) {
	if (ds.length === 0) return null;
	const s = [...ds].sort((a, b) => a - b);
	const g = Math.floor(s.length / 2);
	return s.length % 2 ? s[g] : (s[g - 1] + s[g]) / 2;
}

export function ketLuan({ xanh, tran, dong }) {
	const tv = trungVi(xanh);
	if (!dong || xanh.length < MAU_TOI_THIEU) return { nhan: "chua", ma: 3, trungVi: tv };
	if (tran > 0 || tv > NGUONG_CHET_PHUT) return { nhan: "CHET", ma: 0, trungVi: tv };
	if (tv <= NGUONG_SONG_PHUT) return { nhan: "SONG", ma: 0, trungVi: tv };
	return { nhan: "giua", ma: 0, trungVi: tv };
}

function docNgay(s, ten) {
	const ms = Date.parse(s);
	if (Number.isNaN(ms)) throw new LoiDo(`${ten} khong doc duoc: «${s}»`);
	return ms;
}

export function cuaSo({ tu, den, mocGop, bayGio }) {
	let tuMs;
	if (tu) tuMs = docNgay(tu, "--tu");
	else if (mocGop) tuMs = docNgay(mocGop, "moc gop ci.yml");
	else throw new LoiDo(`khong co --tu va khong tim duoc commit gop doi ${TEP_CI}`);
	const denMs = den ? docNgay(den, "--den") : tuMs + CUA_SO_NGAY * NGAY_MS;
	if (denMs <= tuMs) throw new LoiDo(`cua so rong: --den ${isoGiay(denMs)} khong sau --tu ${isoGiay(tuMs)}`);
	return { tu: isoGiay(tuMs), den: isoGiay(denMs), dong: denMs <= bayGio, conGio: Math.max(0, (denMs - bayGio) / GIO_MS) };
}

function gh(thamSo) {
	try {
		return execFileSync("gh", thamSo, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
	} catch (e) {
		const loi = String(e.stderr ?? e.message ?? "").trim().split("\n")[0];
		throw new LoiDo(`gh ${thamSo.join(" ")} hong (ma ${e.status ?? "?"}): ${loi}`);
	}
}

function ghDanhSach(duong, loc) {
	const thamSo = ["api", "--paginate", `repos/${KHO}/${duong}`, "-q", `${loc} | tojson`];
	return gh(thamSo)
		.split("\n")
		.filter((d) => d.trim())
		.map((d) => {
			try {
				return JSON.parse(d);
			} catch {
				throw new LoiDo(`gh ${thamSo.join(" ")} tra JSON hong: «${d.slice(0, 80)}»`);
			}
		});
}

function mocGopCi(nhanh) {
	try {
		return execFileSync("git", ["-C", GOC, "log", "-1", "--first-parent", "--format=%cI", `origin/${nhanh}`, "--", TEP_CI], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch {
		return "";
	}
}

function docThamSo(argv) {
	const lay = (ten) => {
		const i = argv.indexOf(ten);
		if (i === -1) return undefined;
		const v = argv[i + 1];
		if (!v || v.startsWith("--")) throw new LoiDo(`${ten} can mot gia tri`);
		return v;
	};
	const nhanh = lay("--nhanh");
	if (!nhanh) throw new LoiDo("can --nhanh <base cua PR>, vd --nhanh onehub");
	return { nhanh, tu: lay("--tu"), den: lay("--den") };
}

function doCuaSo({ nhanh, tu, den }, bayGio) {
	const cs = cuaSo({ tu, den, mocGop: tu ? undefined : mocGopCi(nhanh), bayGio });
	const runs = ghDanhSach(`actions/runs?event=pull_request&created=${cs.tu}..${cs.den}&per_page=100`, ".workflow_runs[]").filter(
		(r) => r.path === TEP_CI,
	);
	const dem = { "khong-gan": 0, "base-khac": 0 };
	const mau = [];
	for (const run of runs) {
		const gan = ganPr(run, ghDanhSach(`commits/${run.head_sha}/pulls`, ".[]"), nhanh);
		if (gan !== "mau") {
			dem[gan] += 1;
			continue;
		}
		const jobs = ghDanhSach(`actions/runs/${run.id}/jobs?filter=all&per_page=100`, ".jobs[]");
		const xep = (j) => (j.started_at ? xepDung(j, ghDanhSach(`check-runs/${j.id}/annotations`, ".[]")) : "chua-chay");
		mau.push({ run, ...tongHopLuot(run, jobs, xep) });
	}
	return { cs, runs, dem, mau };
}

export function tongHopCuaSo(mau, dong) {
	const dung = mau.reduce(
		(s, l) => Object.fromEntries(Object.keys(s).map((k) => [k, s[k] + l.dung[k]])),
		{ ...BO_DEM_RONG },
	);
	const xanh = mau.filter((l) => l.xanh);
	const dai = xanh.map((l) => l.daiNhatPhut);
	return { dung, xanh, dai, kl: ketLuan({ xanh: dai, tran: dung.tran, dong }) };
}

function inKetQua({ cs, runs, dem, mau }, nhanh) {
	const { dung, xanh, dai, kl } = tongHopCuaSo(mau, cs.dong);
	const dong = cs.dong ? "da dong" : `chua dong, con ${cs.conGio.toFixed(1)} gio`;
	const nhan = {
		SONG: "SONG",
		CHET: "CHET",
		giua: "giua hai nguong",
		chua: !cs.dong ? "chua ket luan — cua so chua dong" : `chua ket luan — chua du mau (${xanh.length} < ${MAU_TOI_THIEU} luot xanh)`,
	}[kl.nhan];
	const dong_ = [
		`cua so: ${cs.tu} -> ${cs.den} (${dong})`,
		`base PR: ${nhanh}`,
		`luot ci.yml: ${runs.length}`,
		`vao mau: ${mau.length}`,
		`khong gan duoc: ${dem["khong-gan"]}`,
		`base khac: ${dem["base-khac"]}`,
		`dang chay: ${mau.filter((l) => l.dangChay).length}`,
		`luot xanh: ${xanh.length}`,
		`khong mang hinh ma tran: ${mau.filter((l) => l.maTran === false).length}`,
		`dung vi tran: ${dung.tran}`,
		`bi de: ${dung.de}`,
		`dung tay: ${dung.tay}`,
		`dung khi chua chay: ${dung["chua-chay"]}`,
		`job dai nhat moi luot xanh: ${dai.map((x) => x.toFixed(2)).join(", ") || "-"}`,
		`trung vi: ${kl.trungVi == null ? "-" : kl.trungVi.toFixed(2)}`,
		`ket luan: ${nhan}`,
		"phu goi: dieu kien «mot goi co test khong chay o o nao» do bang cmtb_phu_goi, thuoc nay khong do",
	];
	for (const l of mau.filter((x) => x.dung.tran > 0)) dong_.splice(10, 0, `  - luot ${l.run.id} (${l.run.head_branch}) dung vi tran ${l.dung.tran} job`);
	console.log(dong_.join("\n"));
	return kl.ma;
}

if (laTepChinh(import.meta.url)) {
	try {
		const thamSo = docThamSo(process.argv.slice(2));
		process.exitCode = inKetQua(doCuaSo(thamSo, Date.now()), thamSo.nhanh);
	} catch (e) {
		if (!(e instanceof LoiDo)) throw e;
		console.error(`do-7-ngay: KHONG DO DUOC — ${e.message}`);
		process.exitCode = 2;
	}
}
