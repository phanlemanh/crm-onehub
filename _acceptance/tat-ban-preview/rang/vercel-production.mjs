import {
	chiTietTrienKhai,
	git,
	LoiApi,
	ngu,
	trienKhaiCho,
	vercelApi,
} from "./vercel-doc.mjs";

const BON_DU_AN = [
	"crm-onehub-app",
	"crm-onehub-api",
	"crm-onehub-agent",
	"agent-okr",
];
const BA_TEP = [
	"vercel.json",
	"apps/app/vercel.json",
	"apps/agent/vercel.json",
];
const SHA_MOC = "226231c9cfb19a0c76cf28f2a8ded8d712c87948";
const TRAN_PHUT = 15;
const CUOI = new Set(["READY", "ERROR", "CANCELED"]);

function banGit(duAn, sha) {
	const ds = trienKhaiCho(duAn, sha).filter((d) => d.target === "production");
	for (const d of ds.filter((d) => d.source !== "git"))
		console.log(`bo qua ${d.id} (source ${d.source})`);
	return ds
		.filter((d) => d.source === "git")
		.map((d) => chiTietTrienKhai(d.id));
}

function cronCuaTep(sha) {
	const r = git("show", `${sha}:apps/api/vercel.json`);
	if (r.ma !== 0) return null;
	return JSON.parse(r.ra)
		.crons.map((c) => c.path)
		.sort();
}

async function xanh(sha) {
	if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
		console.log("dung: vercel-production.mjs xanh <sha gop 40 hex>");
		return 2;
	}
	git("fetch", "-q", "origin", "onehub");
	if (git("merge-base", "--is-ancestor", sha, "origin/onehub").ma !== 0) {
		console.log(`M-KHONG-TREN-ONEHUB: ${sha}`);
		return 2;
	}
	const thieu = BA_TEP.filter(
		(tep) => git("cat-file", "-e", `${sha}:${tep}`).ma !== 0,
	);
	if (thieu.length) {
		console.log(`M-THIEU-TEP: ${thieu.join(", ")}`);
		return 2;
	}
	const batDau = Date.now();
	let ban = {};
	for (;;) {
		ban = Object.fromEntries(
			BON_DU_AN.map((duAn) => [duAn, banGit(duAn, sha)[0] ?? null]),
		);
		if (BON_DU_AN.every((duAn) => ban[duAn] && CUOI.has(ban[duAn].readyState)))
			break;
		if ((Date.now() - batDau) / 60000 > TRAN_PHUT) break;
		await ngu(30);
	}
	let ma = 0;
	for (const duAn of BON_DU_AN) {
		const d = ban[duAn];
		if (!d) {
			console.log(`KHONG-CO-PRODUCTION ${duAn}`);
			ma = Math.max(ma, 1);
			continue;
		}
		console.log(
			`${duAn} production ${d.id} (git): ${d.readyState} cho ${sha}${d.readyStateReason ? ` — ${d.readyStateReason}` : ""}`,
		);
		if (d.readyState === "READY") continue;
		if (
			d.readyState === "CANCELED" &&
			/newer|superseded|thay/i.test(d.readyStateReason)
		)
			ma = Math.max(ma, 2);
		else ma = Math.max(ma, 1);
	}
	const muon = cronCuaTep(sha);
	const co = (vercelApi("/v9/projects/crm-onehub-api").crons?.definitions ?? [])
		.map((c) => c.path)
		.sort();
	const thieuCron = (muon ?? []).filter((p) => !co.includes(p));
	const thuaCron = co.filter((p) => !(muon ?? []).includes(p));
	if (!muon || thieuCron.length || thuaCron.length) {
		console.log(
			`crons lech: thieu [${thieuCron.join(", ")}], thua [${thuaCron.join(", ")}]`,
		);
		ma = Math.max(ma, 1);
	} else console.log(`crons: ${co.length}/${muon.length} khop`);
	return ma;
}

function doChieuDo() {
	const d = banGit("agent-okr", SHA_MOC)[0];
	if (!d) {
		console.log(
			`khong thay ban production git cua agent-okr cho ${SHA_MOC.slice(0, 8)}`,
		);
		return 1;
	}
	console.log(
		`agent-okr production ${d.id} (git): ${d.readyState} — ${d.readyStateReason}`,
	);
	return d.readyState === "READY" ? 1 : 0;
}

const cheDo = process.argv[2];
if (cheDo !== "xanh" && cheDo !== "do") {
	console.log("dung: vercel-production.mjs xanh <sha>|do");
	process.exit(2);
}
try {
	process.exit(cheDo === "xanh" ? await xanh(process.argv[3]) : doChieuDo());
} catch (loi) {
	console.log(`LOI-API: ${loi instanceof LoiApi ? loi.message : String(loi)}`);
	process.exit(2);
}
