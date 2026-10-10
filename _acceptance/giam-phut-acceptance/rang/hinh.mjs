import { isDeepStrictEqual } from "node:util";
import { BieuThucLa, docBanGoc, docHead, ghiBanSao, noiSuy, TEP_WF } from "./luong.mjs";

const JOB_GOP = "luat-kho";
const TEN_GOP = "acceptance gate";
const DIEU_KIEN_PR = "github.event_name == 'pull_request'";
const KHONG_HUY = "${{ !cancelled() }}";
const LENH_LUAT_KHO = "node scripts/luat-kho/do-cay.mjs --du-luat";
const CHUOI_BUOC = [
	["checkout", (b) => String(b.uses ?? "").startsWith("actions/checkout@") && b.with?.["fetch-depth"] === 0],
	["setup-node 24", (b) => String(b.uses ?? "").startsWith("actions/setup-node@") && String(b.with?.["node-version"]) === "24"],
	["setup-bun", (b) => String(b.uses ?? "").startsWith("oven-sh/setup-bun@")],
	["bun install", (b) => String(b.run ?? "").trim() === "bun install --frozen-lockfile"],
	["luat kho", (b) => String(b.run ?? "").trim() === LENH_LUAT_KHO],
	["test:dieu-phoi", (b) => String(b.run ?? "").trim() === "bun run test:dieu-phoi"],
	["product map", (b) => String(b.run ?? "").includes("scripts/product-map.mjs")],
	["pre-merge", (b) => String(b.run ?? "").includes("scripts/pre-merge-check.sh")],
];
const NGU_CANH_D = {
	prA: { event: "pull_request", nhanh: "onehub", pr: 7, sha: "a".repeat(40) },
	prB: { event: "pull_request", nhanh: "onehub", pr: 7, sha: "b".repeat(40) },
	pushA: { event: "push", nhanh: "onehub", pr: null, sha: "a".repeat(40) },
	pushB: { event: "push", nhanh: "onehub", pr: null, sha: "b".repeat(40) },
};

function boIf(job) {
	const { if: _bo, ...con } = job ?? {};
	return con;
}

export function kiemHinh(wf, goc) {
	const sai = [];
	const dat = [];
	const khoa = Object.keys(wf?.jobs ?? {}).sort();
	const mong = [JOB_GOP, "agent-okr-node24", "build"].sort();
	if (isDeepStrictEqual(khoa, mong)) dat.push("a: ba job luat-kho, build, agent-okr-node24");
	else sai.push(`sai a: jobs la [${khoa.join(", ")}], mong [${mong.join(", ")}]`);

	const gop = wf?.jobs?.[JOB_GOP];
	if (!gop) sai.push(`sai b: thieu job ${JOB_GOP}`);
	else {
		if (gop.name !== TEN_GOP) sai.push(`sai b: ten job la «${gop.name}», mong «${TEN_GOP}»`);
		if (gop.if !== undefined) sai.push(`sai b: job ${JOB_GOP} co if`);
		if (gop["continue-on-error"] !== undefined) sai.push(`sai b: job ${JOB_GOP} co continue-on-error`);
		if (!("DATABASE_URL" in (gop.env ?? {}))) sai.push(`sai b: job ${JOB_GOP} thieu env DATABASE_URL`);
		const buoc = gop.steps ?? [];
		if (buoc.length !== CHUOI_BUOC.length) sai.push(`sai b: job ${JOB_GOP} co ${buoc.length} buoc, mong ${CHUOI_BUOC.length}`);
		CHUOI_BUOC.forEach(([ten, khop], i) => {
			const b = buoc[i];
			if (!b || !khop(b)) {
				sai.push(`sai b: buoc ${i + 1} khong phai ${ten}`);
				return;
			}
			if (b["continue-on-error"] !== undefined) sai.push(`sai b: buoc ${ten} co continue-on-error`);
			const sauLuatKho = i > CHUOI_BUOC.findIndex(([t]) => t === "luat kho");
			if (sauLuatKho && b.if !== KHONG_HUY) sai.push(`sai b: buoc ${ten} thieu if !cancelled()`);
			if (!sauLuatKho && b.if !== undefined) sai.push(`sai b: buoc ${ten} co if`);
		});
		if (!sai.some((s) => s.startsWith("sai b"))) dat.push(`b: job ${JOB_GOP} «${TEN_GOP}», ${buoc.length} buoc dung thu tu`);
	}

	const okr = wf?.jobs?.["agent-okr-node24"];
	const build = wf?.jobs?.build;
	if (okr?.if !== DIEU_KIEN_PR) sai.push("sai c: agent-okr-node24 thieu if pull_request");
	if (build?.if !== undefined) sai.push("sai c: build co if");
	for (const ten of ["build", "agent-okr-node24"]) {
		if (!isDeepStrictEqual(boIf(wf?.jobs?.[ten]), boIf(goc?.jobs?.[ten]))) sai.push(`sai c: job ${ten} khac ban merge-base ngoai khoa if`);
	}
	if (!sai.some((s) => s.startsWith("sai c"))) dat.push("c: agent-okr-node24 chi chay khi PR, build giu nguyen, phan con lai bang merge-base");

	const c = wf?.concurrency;
	if (!c) sai.push("sai d: thieu concurrency");
	else {
		const nhom = {};
		const huy = {};
		for (const [k, nc] of Object.entries(NGU_CANH_D)) {
			nhom[k] = String(noiSuy(c.group, nc));
			huy[k] = noiSuy(c["cancel-in-progress"], nc) === true;
		}
		if (nhom.prA !== nhom.prB) sai.push("sai d: hai luot cung PR khac nhom");
		if (!huy.prA || !huy.prB) sai.push("sai d: luot PR khong huy luot cu");
		if (nhom.pushA === nhom.pushB) sai.push("sai d: hai push cung nhom");
		if (huy.pushA || huy.pushB) sai.push("sai d: push bi huy");
		if (nhom.prA === nhom.pushA) sai.push("sai d: PR va push cung nhom");
		if (!sai.some((s) => s.startsWith("sai d"))) dat.push(`d: PR cung nhom «${nhom.prA}» va huy; push khac nhom theo commit, khong huy`);
	}
	return { sai, dat };
}

const CHIEU_DO = [
	["job-co-if", (w) => { w.jobs[JOB_GOP].if = DIEU_KIEN_PR; }, `sai b: job ${JOB_GOP} co if`],
	["dieu-phoi-bo-if", (w) => { delete w.jobs[JOB_GOP].steps[5].if; }, "sai b: buoc test:dieu-phoi thieu if !cancelled()"],
	["okr-bo-if", (w) => { delete w.jobs["agent-okr-node24"].if; }, "sai c: agent-okr-node24 thieu if pull_request"],
	["build-co-if", (w) => { w.jobs.build.if = DIEU_KIEN_PR; }, "sai c: build co if"],
	["nhom-theo-ref", (w) => { w.concurrency.group = "acceptance-${{ github.event.pull_request.number || github.ref }}"; }, "sai d: hai push cung nhom"],
	["doi-ten", (w) => { w.jobs[JOB_GOP].name = "kiem"; }, "sai b: ten job"],
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
	let kq;
	try {
		kq = kiemHinh(wf, goc.wf);
	} catch (e) {
		if (e instanceof BieuThucLa) {
			console.error(`MA 2: ${e.message}`);
			process.exit(2);
		}
		throw e;
	}
	for (const d of kq.dat) console.log(`dat ${d}`);
	for (const s of kq.sai) console.log(s);
	const hong = [...kq.sai];
	for (const [ten, pha, can] of CHIEU_DO) {
		const ban = structuredClone(wf);
		pha(ban);
		const duong = ghiBanSao(`hinh-${ten}.yml`, ban);
		const r = kiemHinh(docHead(duong), goc.wf);
		const bat = r.sai.some((s) => s.startsWith(can));
		console.log(bat ? `BAT ${ten}: ${can}` : `KHONG BAT ${ten}: mong «${can}», duoc [${r.sai.join("; ")}]`);
		if (!bat) hong.push(`chieu do ${ten} khong bat`);
	}
	console.log(`E1: merge-base ${goc.sha.slice(0, 9)}, ${hong.length === 0 ? "MA 0" : `MA 1 — ${hong.length} loi`}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

if (import.meta.main) chay();
