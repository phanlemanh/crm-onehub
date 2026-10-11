import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cuaSo, phutCuaJob, phutCuaLuot } from "../../giam-phut-acceptance/rang/do-phut.mjs";
import { CHAY, git, GOC, Ket, SLUG } from "./chung.mjs";

const MAU_TOI_THIEU = 10;
const NEN_DUOI = 52;
const NEN_TREN = 64;
const WORKFLOW = { "ci.yml": "CI", "acceptance.yml": "Acceptance" };
const JOB_NANG = [/^check-types, lint$/, /^test \(/, /^lệnh dựng$/, /^tác nhân OKR trên Node 24$/];
const TEN_PHAN_LOAI = "phân loại PR";

export function docNguong(chu = readFileSync(join(GOC, "_acceptance", SLUG, "opportunity.md"), "utf8")) {
	const song = chu.split("\n").find((d) => /^- (\[đề xuất\] )?Kết quả nào là SỐNG:/.test(d)) ?? "";
	const chet = chu.split("\n").find((d) => /^- (\[đề xuất\] )?Kết quả nào là CHẾT:/.test(d)) ?? "";
	const s = song.match(/trung bình mỗi nhánh ≤ (\d+)/)?.[1];
	const t1 = song.match(/chỉ T1 tốn ≤ (\d+) phút/)?.[1];
	const c = chet.match(/mỗi nhánh > (\d+)/)?.[1];
	if (!s || !t1 || !c) throw new Error("khong doc duoc nguong tu opportunity.md");
	return { song: Number(s), chet: Number(c), t1: Number(t1) };
}

export const laNhe = (l) => (l.jobs ?? []).some((j) => j.name === TEN_PHAN_LOAI && j.conclusion === "success") && (l.jobs ?? []).filter((j) => JOB_NANG.some((r) => r.test(j.name))).every((j) => j.conclusion === "skipped");

export function tongKet(cacLuot, nguong, fn = phutCuaJob) {
	const theoWf = {};
	const theoNhanh = new Map();
	const theoSha = new Map();
	for (const l of cacLuot) {
		const phut = phutCuaLuot(l, fn);
		const w = (theoWf[l.workflow] ??= { luot: 0, phut: 0, nhe: 0, nang: 0 });
		w.luot++;
		w.phut += phut;
		if (laNhe(l)) w.nhe++;
		else w.nang++;
		theoNhanh.set(l.nhanh, (theoNhanh.get(l.nhanh) ?? 0) + phut);
		if (l.t1) theoSha.set(l.sha, (theoSha.get(l.sha) ?? 0) + phut);
	}
	for (const l of cacLuot) if (!l.t1 && theoSha.has(l.sha)) theoSha.set(l.sha, theoSha.get(l.sha) + phutCuaLuot(l, fn));
	const soNhanh = theoNhanh.size;
	const tb = soNhanh ? [...theoNhanh.values()].reduce((a, b) => a + b, 0) / soNhanh : null;
	const ketLuan = soNhanh < MAU_TOI_THIEU ? "chua du mau" : tb <= nguong.song ? "SONG" : tb > nguong.chet ? "CHET" : "o giua";
	const t1 = [...theoSha.values()];
	const lonNhat = t1.length ? Math.max(...t1) : null;
	const ketLuanT1 = t1.length === 0 ? "chua co luot" : lonNhat <= nguong.t1 ? "SONG" : "CHET";
	return { theoWf, soNhanh, tb, ketLuan, t1: { lan: t1.length, lonNhat, ketLuan: ketLuanT1 } };
}

function inTongKet(kq, nguong) {
	for (const [w, v] of Object.entries(kq.theoWf)) console.log(`${w}: ${v.luot} luot, ${v.phut} phut, nhe ${v.nhe}, nang ${v.nang}`);
	console.log(`nguong: phut PR moi nhanh ${kq.tb?.toFixed(1)} tren ${kq.soNhanh} nhanh (<= ${nguong.song} SONG, > ${nguong.chet} CHET) ${kq.ketLuan}`);
	console.log(`nguong T1: ${kq.t1.lan} lan day, lon nhat ${kq.t1.lonNhat ?? "-"} phut (<= ${nguong.t1}) ${kq.t1.ketLuan}`);
}

function repo() {
	const m = git("remote", "get-url", "origin").trim().match(/github\.com[:/](.+?)(?:\.git)?$/);
	if (!m) throw new Error("khong suy duoc repo");
	return m[1];
}

async function gh(duong, jq) {
	const p = Bun.spawn(["gh", "api", "--paginate", duong, ...(jq ? ["--jq", jq] : [])], { stdout: "pipe", stderr: "pipe" });
	const [ra, loi, ma] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
	if (ma !== 0) throw new Error(`gh api ${duong}: ${loi.trim()}`);
	return ra;
}

async function docThat(tu, ngay) {
	const r = repo();
	const den = cuaSo(tu, ngay);
	const ra = [];
	for (const [tep, ten] of Object.entries(WORKFLOW)) {
		const luot = (await gh(`repos/${r}/actions/workflows/${tep}/runs?event=pull_request&created=${tu}..${den}&per_page=100`, ".workflow_runs[]|{id,status,conclusion,head_branch,head_sha}"))
			.split("\n")
			.filter((d) => d.trim())
			.map((d) => JSON.parse(d))
			.filter((l) => l.status === "completed");
		for (let i = 0; i < luot.length; i += 8) {
			const lo = await Promise.all(
				luot.slice(i, i + 8).map(async (l) => {
					const jobs = (await gh(`repos/${r}/actions/runs/${l.id}/jobs?per_page=100&filter=all`, ".jobs[]|{id,name,conclusion,started_at,completed_at}"))
						.split("\n")
						.filter((d) => d.trim())
						.map((d) => JSON.parse(d));
					const pl = jobs.find((j) => j.name === TEN_PHAN_LOAI && j.conclusion === "success");
					const t1 = pl && laNhe({ jobs }) ? /ly_do=chi-t1/.test(await gh(`repos/${r}/actions/jobs/${pl.id}/logs`).catch(() => "")) : false;
					return { workflow: ten, nhanh: l.head_branch, sha: l.head_sha, conclusion: l.conclusion, jobs, t1 };
				}),
			);
			ra.push(...lo);
		}
	}
	return ra;
}

function job(giay, ten = "x", conclusion = "success") {
	const bd = Date.parse("2026-10-02T00:00:00Z");
	return { name: ten, conclusion, started_at: new Date(bd).toISOString(), completed_at: new Date(bd + giay * 1000).toISOString() };
}

function nhanhGia(soNhanh, phutCi, phutAcc) {
	const ra = [];
	for (let i = 0; i < soNhanh; i++) {
		ra.push({ workflow: "CI", nhanh: `n${i}`, sha: `s${i}`, conclusion: "success", jobs: [job(phutCi * 60)] });
		ra.push({ workflow: "Acceptance", nhanh: `n${i}`, sha: `s${i}`, conclusion: "success", jobs: [job(phutAcc * 60)] });
	}
	return ra;
}

const k = new Ket();
const nguong = docNguong();
const i = process.argv.indexOf("--tu");
const tu = i >= 0 ? process.argv[i + 1] : "2026-10-02";
const j = process.argv.indexOf("--ngay");
const ngay = j >= 0 ? Number(process.argv[j + 1]) : 7;
mkdirSync(CHAY, { recursive: true });

k.kiem(phutCuaLuot({ jobs: [job(61)] }) === 2, "job 61 giay -> 2 phut", "lam tron sai");
k.kiem(phutCuaLuot({ jobs: [job(600, "x", "skipped")] }) === 0, "job skipped -> 0 phut", "skipped bi tinh");
k.kiem(laNhe({ jobs: [job(30, TEN_PHAN_LOAI), job(0, "check-types, lint", "skipped"), job(0, "test (${{ matrix.o.ten }})", "skipped")] }), "luot phan-loai + nang skipped -> nhe", "khong dem nhe");
const gia = (ds) => tongKet(ds, nguong);
k.kiem(gia(nhanhGia(12, 25, 20)).ketLuan === "o giua", "12 nhanh ci 25 + acceptance 20 -> o giua", gia(nhanhGia(12, 25, 20)).ketLuan);
k.kiem(gia(nhanhGia(12, 21, 20)).ketLuan === "SONG", "12 nhanh tong 41 -> SONG", gia(nhanhGia(12, 21, 20)).ketLuan);
k.kiem(gia(nhanhGia(12, 31, 20)).ketLuan === "CHET", "12 nhanh tong 51 -> CHET", gia(nhanhGia(12, 31, 20)).ketLuan);
const t1Gia = [{ workflow: "CI", nhanh: "t", sha: "t1", conclusion: "success", t1: true, jobs: [job(4 * 60, TEN_PHAN_LOAI)] }, { workflow: "Acceptance", nhanh: "t", sha: "t1", conclusion: "success", t1: true, jobs: [job(5 * 60, "acceptance gate")] }];
k.kiem(gia(t1Gia).t1.ketLuan === "CHET" && gia(t1Gia).t1.lonNhat === 9, "mot lan day T1 9 phut -> CHET", JSON.stringify(gia(t1Gia).t1));
const tronSai = (ms) => Math.round(ms / 60000);
k.bat("lam-tron-round", phutCuaLuot({ jobs: [job(61)] }, tronSai) !== 2, "ban sao ham dung round cho 1 phut");

const tepDuLieu = process.argv.indexOf("--du-lieu");
let that;
try {
	that = tepDuLieu >= 0 ? JSON.parse(readFileSync(process.argv[tepDuLieu + 1], "utf8")) : await docThat(tu, ngay);
} catch (e) {
	console.log(`MA 2: ${e.message}`);
	process.exit(2);
}
writeFileSync(join(CHAY, `do-phut-ci-${tu}-${ngay}.json`), JSON.stringify(that));
const kq = tongKet(that, nguong);
inTongKet(kq, nguong);
if (tu === "2026-10-02" && ngay === 7 && tepDuLieu < 0) k.kiem(kq.tb >= NEN_DUOI && kq.tb <= NEN_TREN, `doi-chung-duong nen 02-08/10: ${kq.tb?.toFixed(1)} phut moi nhanh trong [${NEN_DUOI}, ${NEN_TREN}]`, "nen lech so cua opportunity.md");
k.xong();
