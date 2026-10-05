import { spawnSync } from "node:child_process";
import { AGENT_OKR, LoiApi, ngu, trienKhaiCho } from "./vercel-doc.mjs";

const MOC = {
	do: "226231c9cfb19a0c76cf28f2a8ded8d712c87948",
	"bo-tay": "ff8c337294773cabc1103eb4a764734a04754168",
};
const CHE_DO = process.argv[2];
const TRAN_GIAY = 600;
const NHIP_GIAY = 20;
const TRANG_THAI_CUOI = new Set(["READY", "ERROR", "CANCELED"]);
const LY_DO_BI_CHAN = /Ignored Build Step|deploymentEnabled/i;

function thoat(ma, dong) {
	console.log(dong);
	process.exit(ma);
}

function shaXanh() {
	if (process.argv[3]) return process.argv[3];
	spawnSync("git", ["fetch", "-q", "origin", "onehub"]);
	return spawnSync("git", ["rev-parse", "origin/onehub"], { encoding: "utf8" }).stdout.trim();
}

async function banGit(sha, choToiTran) {
	const daBao = new Set();
	for (let da = 0; da <= (choToiTran ? TRAN_GIAY : 0); da += NHIP_GIAY) {
		const ds = trienKhaiCho(AGENT_OKR, sha).filter((d) => d.target === "production");
		for (const d of ds) {
			if (d.source !== "git" && !daBao.has(d.id)) {
				daBao.add(d.id);
				console.log(`bo qua ${d.id} (source ${d.source})`);
			}
		}
		const ban = ds.find((d) => d.source === "git" && TRANG_THAI_CUOI.has(d.readyState));
		if (ban) return ban;
		if (choToiTran) await ngu(NHIP_GIAY);
	}
	return null;
}

try {
	if (!["xanh", "do", "bo-tay"].includes(CHE_DO)) thoat(2, "doi so: xanh [sha] | do | bo-tay");
	const sha = CHE_DO === "xanh" ? shaXanh() : MOC[CHE_DO];
	const ban = await banGit(sha, CHE_DO === "xanh");
	if (!ban) thoat(CHE_DO === "xanh" ? 1 : 2, `KHONG-CO-PRODUCTION git cho ${sha}`);
	const lyDo = ban.readyStateReason ? ` — ${ban.readyStateReason}` : "";
	const dong = `agent-okr production ${ban.id} (git): ${ban.readyState}${lyDo}`;
	if (CHE_DO === "xanh") {
		if (ban.readyState === "READY") thoat(0, `${dong} cho ${sha}`);
		const biThay = ban.readyState === "CANCELED" && !LY_DO_BI_CHAN.test(ban.readyStateReason);
		thoat(biThay ? 2 : 1, biThay ? `BI-THAY ${dong}` : dong);
	}
	if (CHE_DO === "do") {
		const dung = ban.readyState === "CANCELED" && ban.readyStateReason.includes("Ignored Build Step");
		thoat(dung ? 0 : 1, dong);
	}
	thoat(ban.readyState === "CANCELED" ? 0 : 1, dong);
} catch (loi) {
	if (loi instanceof LoiApi) thoat(2, `LOI-API ${loi.message}`);
	throw loi;
}
