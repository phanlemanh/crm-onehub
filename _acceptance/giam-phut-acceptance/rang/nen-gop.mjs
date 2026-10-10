import { readFileSync } from "node:fs";
import { docHead, git, jobChay, kichHoat, NGU_CANH } from "./luong.mjs";

function doiSo(ten) {
	const i = process.argv.indexOf(ten);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

function repo() {
	const m = git("remote", "get-url", "origin").match(/github\.com[:/](.+?)(?:\.git)?$/);
	if (!m) throw new Error("khong suy duoc repo tu origin");
	return m[1];
}

async function ghApi(duong) {
	const p = Bun.spawn(["gh", "api", duong], { stdout: "pipe", stderr: "pipe" });
	const [ra, loi, ma] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
	return { ma, ra, loi: `${loi}${ra}` };
}

export async function docLuat() {
	const r = repo();
	const rules = await ghApi(`repos/${r}/rules/branches/onehub`);
	if (rules.ma !== 0) throw new Error(`rules: ${rules.loi.trim()}`);
	const prot = await ghApi(`repos/${r}/branches/onehub/protection`);
	let protection = null;
	if (prot.ma === 0) protection = JSON.parse(prot.ra);
	else if (!/Branch not protected/.test(prot.loi)) throw new Error(`protection: ${prot.loi.trim()}`);
	return { rules: JSON.parse(rules.ra), protection };
}

export function checkBatBuoc({ rules, protection }) {
	const ten = new Set();
	for (const r of rules ?? []) {
		if (r.type !== "required_status_checks") continue;
		for (const c of r.parameters?.required_status_checks ?? []) ten.add(c.context);
	}
	for (const c of protection?.required_status_checks?.contexts ?? []) ten.add(c);
	for (const c of protection?.required_status_checks?.checks ?? []) ten.add(c.context);
	return [...ten];
}

export function tenJobPr(wf) {
	if (!kichHoat(wf, NGU_CANH.pr)) return [];
	return Object.entries(wf.jobs ?? {})
		.filter(([, j]) => jobChay(j, NGU_CANH.pr))
		.map(([k, j]) => j.name ?? k);
}

export function kiemNen(luat, wf) {
	const batBuoc = checkBatBuoc(luat);
	const coJob = new Set(tenJobPr(wf));
	return { batBuoc, thieu: batBuoc.filter((t) => !coJob.has(t)) };
}

function dongCay() {
	const ds = git("log", "origin/onehub", "--merges", "--first-parent", "--since=7.days", "--format=%H").split("\n").filter(Boolean);
	const lech = ds.filter((m) => git("rev-parse", `${m}^{tree}`) !== git("rev-parse", `${m}^2^{tree}`));
	return { gop: ds.length, lech: lech.length };
}

async function chay() {
	const hong = [];
	const wf = docHead();
	const tepRules = doiSo("--rules");
	let luat;
	try {
		luat = tepRules ? JSON.parse(readFileSync(tepRules, "utf8")) : await docLuat();
	} catch (e) {
		console.error(`MA 2: ${e.message}`);
		process.exit(2);
	}
	const kq = kiemNen(luat, wf);
	console.log(`check bat buoc cua onehub: [${kq.batBuoc.join(", ")}]; job chay khi PR: [${tenJobPr(wf).join(", ")}]`);
	for (const t of kq.thieu) {
		console.log(`sai check bat buoc ${t} khong con job`);
		hong.push(t);
	}
	const caGia = [
		[{ rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "luật kho" }] } }], protection: null }, ["luật kho"]],
		[{ rules: [], protection: { required_status_checks: { contexts: ["acceptance gate"] } } }, []],
	];
	for (const [luatGia, mong] of caGia) {
		const r = kiemNen(luatGia, wf);
		const dung = JSON.stringify(r.thieu) === JSON.stringify(mong);
		console.log(dung ? `BAT gia: bat buoc [${r.batBuoc}] -> thieu [${r.thieu}]` : `KHONG BAT gia: mong thieu [${mong}], duoc [${r.thieu}]`);
		if (!dung) hong.push("chieu do gia khong bat");
	}
	try {
		const c = dongCay();
		console.log(`thong tin: ${c.lech}/${c.gop} commit gop vao onehub 7 ngay qua co cay khac cay dau PR`);
	} catch (e) {
		console.log(`thong tin: khong dem duoc cay lech (${e.message.split("\n")[0]})`);
	}
	console.log(`E5: ${hong.length === 0 ? "MA 0" : `MA 1 — ${hong.join("; ")}`}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

if (import.meta.main) await chay();
