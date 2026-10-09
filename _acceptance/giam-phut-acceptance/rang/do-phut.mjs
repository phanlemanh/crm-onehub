import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { GOC, git, THU_MUC_CHAY } from "./luong.mjs";

const MAU_TOI_THIEU = 10;
const DOI_CHUNG_PUSH = 8;
const OPP = join(GOC, "_acceptance", "giam-phut-acceptance", "opportunity.md");

export const phutCuaJob = (ms) => Math.ceil(ms / 60000);

function doiSo(ten, macDinh) {
	const i = process.argv.indexOf(ten);
	return i >= 0 ? process.argv[i + 1] : macDinh;
}

export function docNguong() {
	const dong = readFileSync(OPP, "utf8").split("\n").find((d) => d.startsWith("- Kết quả nào là SỐNG:"));
	const push = dong?.match(/push lên `onehub` có trung vị ≤ (\d+)/)?.[1];
	const pr = dong?.match(/của PR có trung vị ≤ (\d+)/)?.[1];
	if (!push || !pr) throw new Error(`khong doc duoc nguong tu ${OPP}`);
	return { push: Number(push), pull_request: Number(pr) };
}

export function phutCuaLuot(luot, fn = phutCuaJob) {
	let tong = 0;
	for (const j of luot.jobs ?? []) {
		if (j.conclusion === "skipped" || !j.started_at || !j.completed_at) continue;
		tong += fn(new Date(j.completed_at) - new Date(j.started_at));
	}
	return tong;
}

const trungVi = (ds) => {
	if (ds.length === 0) return null;
	const s = [...ds].sort((a, b) => a - b);
	const g = Math.floor(s.length / 2);
	return s.length % 2 ? s[g] : (s[g - 1] + s[g]) / 2;
};
const p90 = (ds) => (ds.length === 0 ? null : [...ds].sort((a, b) => a - b)[Math.ceil(ds.length * 0.9) - 1]);

export function tongKet(cacLuot, nguong, fn = phutCuaJob) {
	const ra = {};
	for (const ev of ["push", "pull_request"]) {
		const cua = cacLuot.filter((l) => l.event === ev);
		const huy = cua.filter((l) => l.conclusion === "cancelled");
		const du = cua.filter((l) => l.conclusion !== "cancelled");
		const phut = du.map((l) => phutCuaLuot(l, fn));
		const tv = trungVi(phut);
		const ketLuan = du.length < MAU_TOI_THIEU ? "chua du mau" : tv <= nguong[ev] ? "SONG" : "CHET";
		ra[ev] = { luot: du.length, trungVi: tv, p90: p90(phut), huy: huy.length, phutHuy: huy.reduce((t, l) => t + phutCuaLuot(l, fn), 0), ketLuan };
	}
	return ra;
}

function repo() {
	const url = git("remote", "get-url", "origin");
	const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
	if (!m) throw new Error(`khong suy duoc repo tu ${url}`);
	return m[1];
}

async function gh(duong, jq) {
	const p = Bun.spawn(["gh", "api", "--paginate", duong, "--jq", jq], { stdout: "pipe", stderr: "pipe" });
	const [ra, loi, ma] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
	if (ma !== 0) throw new Error(`gh api ${duong}: ${loi.trim()}`);
	return ra.split("\n").filter((d) => d.trim()).map((d) => JSON.parse(d));
}

async function docThat(tu, ngay) {
	const r = repo();
	const den = new Date(new Date(tu).getTime() + ngay * 86400000).toISOString().slice(0, 10);
	const luot = (await gh(`repos/${r}/actions/workflows/acceptance.yml/runs?created=${tu}..${den}&per_page=100`, ".workflow_runs[]|{id,event,status,conclusion}")).filter((l) => l.status === "completed");
	const ra = [];
	for (let i = 0; i < luot.length; i += 8) {
		const lo = await Promise.all(
			luot.slice(i, i + 8).map(async (l) => ({
				event: l.event,
				conclusion: l.conclusion,
				jobs: await gh(`repos/${r}/actions/runs/${l.id}/jobs?per_page=100`, ".jobs[]|{conclusion,started_at,completed_at}"),
			})),
		);
		ra.push(...lo);
	}
	return ra;
}

function inTongKet(nhan, kq, nguong) {
	for (const ev of ["push", "pull_request"]) {
		const k = kq[ev];
		console.log(`${nhan} ${ev}: ${k.luot} luot, trung vi ${k.trungVi ?? "-"} phut, p90 ${k.p90 ?? "-"}; huy ${k.huy} luot (${k.phutHuy} phut)`);
	}
	console.log(`${nhan} nguong: push <= ${nguong.push} ${kq.push.ketLuan}; pull_request <= ${nguong.pull_request} ${kq.pull_request.ketLuan}`);
}

function job(giay, conclusion = "success") {
	const bd = new Date("2026-10-01T00:00:00Z");
	return { conclusion, started_at: bd.toISOString(), completed_at: new Date(bd.getTime() + giay * 1000).toISOString() };
}

function duLieuGia() {
	const luot = [];
	for (let i = 0; i < 5; i++) luot.push({ event: "pull_request", conclusion: "success", jobs: [job(660)] });
	for (let i = 0; i < 6; i++) luot.push({ event: "pull_request", conclusion: "cancelled", jobs: [job(120, "cancelled")] });
	for (let i = 0; i < 10; i++) luot.push({ event: "push", conclusion: "success", jobs: [job(61), job(300, "skipped")] });
	return luot;
}

async function chay() {
	const hong = [];
	const nguong = docNguong();
	const lamTronDung = phutCuaJob(61000) === 2 && phutCuaJob(60000) === 1 && phutCuaJob(0) === 0;
	if (!lamTronDung) hong.push("lam tron sai o ham that");
	const banRound = (ms) => Math.round(ms / 60000);
	const batRound = banRound(61000) !== 2;
	console.log(batRound ? "BAT lam-tron: ban sao Math.round ra 61s = 1 phut" : "KHONG BAT lam-tron");
	if (!batRound) hong.push("chieu do lam tron khong bat");

	mkdirSync(THU_MUC_CHAY, { recursive: true });
	const tepGia = doiSo("--du-lieu", join(THU_MUC_CHAY, "do-phut-gia.json"));
	if (!process.argv.includes("--du-lieu")) writeFileSync(tepGia, JSON.stringify(duLieuGia()));
	const gia = tongKet(JSON.parse(readFileSync(tepGia, "utf8")), nguong);
	inTongKet("gia", gia, nguong);
	const kiemGia = [
		[gia.push.trungVi === 2, `job 61s + job skipped phai ra 2 phut, duoc ${gia.push.trungVi}`],
		[gia.pull_request.trungVi === 11, `trung vi PR bo luot huy phai ra 11, duoc ${gia.pull_request.trungVi}`],
		[gia.pull_request.huy === 6, `phai dem rieng 6 luot huy, duoc ${gia.pull_request.huy}`],
		[gia.pull_request.ketLuan !== "SONG", `PR 11 phut khong duoc SONG voi nguong ${nguong.pull_request}`],
	];
	for (const [dung, ly] of kiemGia) {
		console.log(dung ? `BAT gia: ${ly.split(",")[0]}` : `sai gia: ${ly}`);
		if (!dung) hong.push(ly);
	}
	if (tongKet(duLieuGia(), nguong, banRound).push.trungVi === gia.push.trungVi) hong.push("lam tron sai: 61s ra 1 phut khong doi ket qua — thuoc mu");
	else console.log("BAT lam-tron-du-lieu: ban Math.round doi trung vi push");

	if (!process.argv.includes("--chi-gia")) {
		const tu = doiSo("--tu", "2026-10-02");
		const ngay = Number(doiSo("--ngay", "7"));
		let that;
		try {
			that = tongKet(await docThat(tu, ngay), nguong);
		} catch (e) {
			console.error(`MA 2: ${e.message}`);
			process.exit(2);
		}
		inTongKet(`that ${tu}+${ngay}n`, that, nguong);
		if (tu === "2026-10-02" && !(that.push.trungVi > DOI_CHUNG_PUSH)) hong.push(`doi chung duong: truoc thay doi trung vi push phai > ${DOI_CHUNG_PUSH}, duoc ${that.push.trungVi}`);
	}
	console.log(`E4: ${hong.length === 0 ? "MA 0" : `MA 1 — ${hong.join("; ")}`}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

if (import.meta.main) await chay();
