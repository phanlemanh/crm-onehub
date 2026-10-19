import { readFileSync } from "node:fs";
import { join } from "node:path";
import { boDong, boGuong, chayTrong, chuThuocCay, dungGuong, GOC, ghiThuoc } from "./guong.mjs";

const TEP_WF = join(GOC, ".github", "workflows", "acceptance.yml");
const TEP_CONFIG = join(GOC, "_acceptance", "config.yaml");
const TEP_API = join(GOC, "docs", "api.md");
const JOB = "luat-kho";
const TEN_BUOC = "OKR read rule";
const CAI = "bun install --frozen-lockfile";
const LUAT_KHO = "node scripts/luat-kho/do-cay.mjs --du-luat";
const IF_CHO_PHEP = "${{ !cancelled() }}";
const NEO_API = "soi-ma.mjs --ca xem` fails on";
const CAU_API = ["acceptance gate", ".github/workflows/acceptance.yml", "every pull request", "onehub"];
const MIEN_THU = { tep: "apps/api/src/okr/tro-ly.service.ts", ham: "coKrSuaDuoc", bang: "okrKeyResult" };

function lenhConfig() {
	const m = readFileSync(TEP_CONFIG, "utf8").match(/^ {4}ghd_soi_xem: "(.*)"$/m);
	if (!m) throw new Error("config khong co ghd_soi_xem");
	return m[1];
}

function buocSoiXem(job) {
	return (job?.steps ?? []).filter((b) => b.name === TEN_BUOC);
}

export function kiem(chu, lenh) {
	const loi = [];
	const wf = Bun.YAML.parse(chu);
	const job = wf?.jobs?.[JOB];
	if (!job) return ["thieu job luat-kho"];
	const buoc = buocSoiXem(job);
	if (buoc.length !== 1) return ["thieu buoc soi-xem"];
	const b = buoc[0];
	const chay = (job.steps ?? []).map((x) => String(x.run ?? "").trim());
	const i = job.steps.indexOf(b);
	if (String(b.run ?? "").trim() !== lenh) loi.push("lech lenh config");
	if (!(chay.indexOf(CAI) > -1 && chay.indexOf(CAI) < i && chay.indexOf(LUAT_KHO) > -1 && chay.indexOf(LUAT_KHO) < i))
		loi.push("buoc sai thu tu");
	if (b["continue-on-error"] || job["continue-on-error"]) loi.push("buoc khong chan");
	if (b.if !== undefined && String(b.if).trim() !== IF_CHO_PHEP) loi.push("buoc co if la");
	if (job.if !== undefined) loi.push("job co if");
	const pr = wf?.on?.pull_request;
	if (pr === undefined) loi.push("khong chay khi pull_request");
	else if (pr && ["paths", "paths-ignore", "branches"].some((k) => k in pr)) loi.push("pull_request bi loc");
	if (!(wf?.on?.push?.branches ?? []).includes("onehub")) loi.push("push thieu onehub");
	return loi;
}

function dotBien(chu, lenh) {
	const khoi = `      - name: ${TEN_BUOC}\n        if: ${IF_CHO_PHEP}\n        run: ${lenh}\n`;
	return [
		["bo-buoc", chu.replace(`${khoi}\n`, ""), "thieu buoc soi-xem"],
		["doi-ten", chu.replace(`- name: ${TEN_BUOC}\n`, "- name: OKR read\n"), "thieu buoc soi-xem"],
		["continue-on-error", chu.replace(khoi, `${khoi}        continue-on-error: true\n`), "buoc khong chan"],
		["job-if", chu.replace(`\n  ${JOB}:\n`, `\n  ${JOB}:\n    if: github.event_name == 'push'\n`), "job co if"],
		["pr-paths", chu.replace("\n  pull_request:\n", '\n  pull_request:\n    paths: ["apps/api/src/okr/**"]\n'), "pull_request bi loc"],
		["doi-run", chu.replace(khoi, khoi.replace("--ca xem", "--ca thiet-ke")), "lech lenh config"],
	];
}

function cheDoHinh() {
	const lenh = lenhConfig();
	const chu = readFileSync(TEP_WF, "utf8");
	const loi = kiem(chu, lenh);
	for (const l of loi) console.log(`SAI ${l}`);
	if (loi.length === 0) console.log(`dat buoc «${TEN_BUOC}» trong job ${JOB}: run = ghd_soi_xem, sau cai dat va luat kho, chan, khong loc PR, push co onehub`);
	let lot = 0;
	for (const [ten, ban, can] of dotBien(chu, lenh)) {
		if (ban === chu) {
			console.log(`LOT ${ten}: dot bien khong ap duoc`);
			lot++;
			continue;
		}
		const l = kiem(ban, lenh);
		if (l.includes(can)) console.log(`bat ${ten}`);
		else {
			console.log(`LOT ${ten}: can «${can}», thay «${l.join(", ")}»`);
			lot++;
		}
	}
	return loi.length === 0 && lot === 0 ? 0 : 1;
}

function cheDoChay() {
	const wf = Bun.YAML.parse(readFileSync(TEP_WF, "utf8"));
	const buoc = buocSoiXem(wf?.jobs?.[JOB]);
	if (buoc.length !== 1 || !buoc[0].run) {
		console.log(`KHONG DO DUOC: khong rut duoc buoc «${TEN_BUOC}» trong job ${JOB}`);
		return 2;
	}
	const lenh = String(buoc[0].run).trim();
	let goc;
	try {
		goc = dungGuong("chay");
	} catch (e) {
		console.log(`KHONG DO DUOC: ${e.message}`);
		return 2;
	}
	let lot = 0;
	try {
		const goc0 = chuThuocCay();
		const nguyen = chayTrong(goc, lenh);
		if (nguyen.ma === 0 && nguyen.ra.includes("\nXANH")) console.log("bat guong-nguyen");
		else {
			console.log(`LOT guong-nguyen: ma ${nguyen.ma}`);
			lot++;
		}
		ghiThuoc(goc, boDong(goc0, MIEN_THU));
		const bo = chayTrong(goc, lenh);
		if (bo.ma !== 0 && bo.ra.includes("DO:")) console.log(`bat guong-bo-mien: ma ${bo.ma}`);
		else {
			console.log(`LOT guong-bo-mien: ma ${bo.ma}`);
			lot++;
		}
	} finally {
		boGuong(goc);
	}
	console.log(`lenh cua buoc: ${lenh}`);
	return lot === 0 ? 0 : 1;
}

function doanApi(chu) {
	const dong = chu.split("\n");
	const i = dong.findIndex((d) => d.includes(NEO_API));
	if (i === -1) return null;
	const ra = [dong[i]];
	for (let j = i + 1; j < dong.length && dong[j].trim() !== "" && !/^\s*- /.test(dong[j]); j++) ra.push(dong[j]);
	return ra.join(" ").replace(/\s+/g, " ");
}

export function kiemApi(chu) {
	const doan = doanApi(chu);
	if (doan === null) return ["khong thay doan soi-ma --ca xem trong docs/api.md"];
	return CAU_API.every((c) => doan.includes(c)) ? [] : ["thieu cau CI trong docs/api.md"];
}

function cheDoTaiLieu() {
	const chu = readFileSync(TEP_API, "utf8");
	const loi = kiemApi(chu);
	for (const l of loi) console.log(`SAI ${l}`);
	if (loi.length === 0) console.log("dat tai-lieu");
	const dau = chu.indexOf("The\n  `acceptance gate`");
	const cuoi = chu.indexOf("`onehub`.", dau);
	let lot = 0;
	if (dau === -1 || cuoi === -1) {
		console.log("LOT tai-lieu-thieu: khong tim duoc cau moi de bo");
		lot++;
	} else {
		const ban = chu.slice(0, dau) + chu.slice(cuoi + "`onehub`.".length);
		if (kiemApi(ban).includes("thieu cau CI trong docs/api.md")) console.log("bat tai-lieu-thieu");
		else {
			console.log("LOT tai-lieu-thieu");
			lot++;
		}
	}
	return loi.length === 0 && lot === 0 ? 0 : 1;
}

const CHE_DO = { "--chay": cheDoChay, "--tai-lieu": cheDoTaiLieu };
if (import.meta.main) {
	const co = process.argv.slice(2).find((a) => a in CHE_DO);
	process.exit((co ? CHE_DO[co] : cheDoHinh)());
}
