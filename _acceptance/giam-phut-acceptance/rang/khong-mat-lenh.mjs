import { isDeepStrictEqual } from "node:util";
import { BieuThucLa, docBanGoc, docHead, ghiBanSao, lenhChay, NGU_CANH, TEP_WF } from "./luong.mjs";

const JOB_BO_KHI_PUSH = ["agent-okr-node24"];
const CAM_KHI_PUSH = ["--filter=agent-okr", "db:deploy"];
const NGU_CANH_PUSH = { "push onehub": NGU_CANH.pushOnehub, "push release": NGU_CANH.pushRelease };

const laChuanBi = (run) => run.startsWith("bun install");

function demLenh(ds) {
	const dem = new Map();
	for (const run of ds) dem.set(run, (dem.get(run) ?? 0) + 1);
	return dem;
}

function soDaTap(nhan, head, goc) {
	const sai = [];
	const dh = demLenh(head);
	const dg = demLenh(goc);
	for (const [run, n] of dg) if ((dh.get(run) ?? 0) < n) sai.push(`${nhan} mat lenh: ${run.split("\n")[0]}`);
	for (const [run, n] of dh) if ((dg.get(run) ?? 0) < n) sai.push(`${nhan} thua lenh: ${run.split("\n")[0]}`);
	return sai;
}

function tach(lenh) {
	return {
		kiem: lenh.filter((l) => !laChuanBi(l.run)).map((l) => l.run),
		chuanBi: [...new Set(lenh.filter((l) => laChuanBi(l.run)).map((l) => l.run))].sort(),
	};
}

export function kiemLenh(wf, goc) {
	const sai = [];
	const dat = [];
	if (!isDeepStrictEqual(wf?.on, goc?.on)) sai.push("sai a: on khac merge-base");
	else dat.push("a: khoi on bang merge-base");

	const prH = tach(lenhChay(wf, NGU_CANH.pr));
	const prG = tach(lenhChay(goc, NGU_CANH.pr));
	if (prG.kiem.length === 0 || !prG.kiem.includes("bun run build")) sai.push("doi chung: lop kiem pull_request cua merge-base rong hoac thieu bun run build");
	const saiPr = [...soDaTap("pull_request", prH.kiem, prG.kiem)];
	if (!isDeepStrictEqual(prH.chuanBi, prG.chuanBi)) saiPr.push(`pull_request lop chuan bi khac: [${prH.chuanBi}] / [${prG.chuanBi}]`);
	sai.push(...saiPr);
	if (saiPr.length === 0) dat.push(`pull_request: ${prH.kiem.length} lenh kiem, ${prH.chuanBi.length} lenh chuan bi`);

	for (const [nhan, nc] of Object.entries(NGU_CANH_PUSH)) {
		const h = tach(lenhChay(wf, nc));
		const mongLenh = lenhChay(goc, nc).filter((l) => !JOB_BO_KHI_PUSH.includes(l.job));
		const mong = tach(mongLenh);
		const saiPush = soDaTap(nhan, h.kiem, mong.kiem).map((s) => s.replace(`${nhan} mat lenh`, `${nhan} thieu lenh`).replace(`${nhan} thua lenh`, `${nhan} con chay`));
		for (const run of h.kiem) if (CAM_KHI_PUSH.some((c) => run.includes(c))) saiPush.push(`${nhan} con chay: ${run}`);
		sai.push(...saiPush);
		const bo = tach(lenhChay(goc, nc)).kiem.length - h.kiem.length;
		if (saiPush.length === 0) dat.push(`${nhan}: ${h.kiem.length} lenh kiem, bo ${bo} lenh`);
	}
	return { sai: [...new Set(sai)], dat };
}

const CHIEU_DO = [
	["xoa-dieu-phoi", (w) => { w.jobs["luat-kho"].steps = w.jobs["luat-kho"].steps.filter((b) => String(b.run ?? "").trim() !== "bun run test:dieu-phoi"); }, ["pull_request mat lenh: bun run test:dieu-phoi"]],
	["nhan-doi-luat-kho", (w) => { const s = w.jobs["luat-kho"].steps; const i = s.findIndex((b) => String(b.run ?? "").includes("luat-kho/do-cay")); s.splice(i, 0, structuredClone(s[i])); }, ["pull_request thua lenh: node scripts/luat-kho/do-cay.mjs --du-luat"]],
	["okr-bo-if", (w) => { delete w.jobs["agent-okr-node24"].if; }, ["push onehub con chay: bun run test -- --filter=agent-okr"]],
	["xoa-push", (w) => { delete w.on.push; }, ["sai a: on khac merge-base", "push onehub thieu lenh"]],
	["them-echo", (w) => { w.jobs["luat-kho"].steps.push({ run: "echo moi" }); }, ["pull_request thua lenh: echo moi"]],
];

function chay() {
	let wf;
	let goc;
	try {
		wf = docHead(process.argv[2] ?? TEP_WF);
		goc = docBanGoc();
	} catch (e) {
		console.error(`MA 2: khong doc duoc workflow: ${e.message}`);
		process.exit(2);
	}
	try {
		const kq = kiemLenh(wf, goc.wf);
		for (const d of kq.dat) console.log(`dat ${d}`);
		for (const s of kq.sai) console.log(`sai ${s}`);
		const hong = [...kq.sai];
		for (const [ten, pha, can] of CHIEU_DO) {
			const ban = structuredClone(wf);
			pha(ban);
			const r = kiemLenh(docHead(ghiBanSao(`lenh-${ten}.yml`, ban)), goc.wf);
			const thieu = can.filter((c) => !r.sai.some((s) => s.startsWith(c)));
			console.log(thieu.length === 0 ? `BAT ${ten}: ${can.join(" + ")}` : `KHONG BAT ${ten}: thieu [${thieu.join("; ")}], duoc [${r.sai.join("; ")}]`);
			if (thieu.length > 0) hong.push(`chieu do ${ten} khong bat`);
		}
		console.log(`E2: merge-base ${goc.sha.slice(0, 9)}, ${hong.length === 0 ? "MA 0" : `MA 1 — ${hong.length} loi`}`);
		process.exit(hong.length === 0 ? 0 : 1);
	} catch (e) {
		if (e instanceof BieuThucLa) {
			console.error(`MA 2: ${e.message}`);
			process.exit(2);
		}
		throw e;
	}
}

if (import.meta.main) chay();
