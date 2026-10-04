import { spawnSync } from "node:child_process";
import { AGENT_OKR, LoiApi, ngu, statusGithub, trienKhaiCho } from "./vercel-doc.mjs";

const MOC_DO = "9333acad157ddb24f5128bcb98fec6d02ba5bab0";
const CHE_DO = process.argv[2];
const TRAN_GIAY = 600;
const NHIP_GIAY = 20;
const DOI_CHUNG = "Vercel – crm-onehub-";
const CONTEXT_AGENT_OKR = "Vercel – agent-okr";
const TRANG_THAI_DO = new Set(["failure", "error"]);

function git(...doiSo) {
	return spawnSync("git", doiSo, { encoding: "utf8" }).stdout.trim();
}

function thoat(ma, dong) {
	console.log(dong);
	process.exit(ma);
}

function moiNhatTheoContext(dsStatus) {
	const moiNhat = new Map();
	for (const s of dsStatus) if (!moiNhat.has(s.context)) moiNhat.set(s.context, s.state);
	return [...moiNhat];
}

async function choDoiChung(sha) {
	for (let da = 0; da <= TRAN_GIAY; da += NHIP_GIAY) {
		const doiChung = moiNhatTheoContext(statusGithub(sha)).filter(([c]) => c.startsWith(DOI_CHUNG));
		if (doiChung.length > 0 && doiChung.every(([, st]) => st !== "pending")) return doiChung;
		await ngu(NHIP_GIAY);
	}
	return null;
}

function moTa(dsTrienKhai) {
	return dsTrienKhai.map((d) => `${d.id} (${d.readyState})`).join(", ");
}

try {
	if (CHE_DO !== "xanh" && CHE_DO !== "do") thoat(2, "doi so: xanh | do");
	const sha = CHE_DO === "do" ? MOC_DO : git("log", "-1", "--format=%H", "HEAD", "--", "apps/agent-okr");
	if (!sha) thoat(2, "KHONG-CO-COMMIT cham apps/agent-okr");
	if (!git("branch", "-r", "--contains", sha)) thoat(2, `CHUA-DAY ${sha}`);
	const doiChung = await choDoiChung(sha);
	if (!doiChung) thoat(2, `DOI-CHUNG-VANG ${sha}`);
	const nen = doiChung.map(([c, st]) => `${c}=${st}`).join(", ");
	const dsTrienKhai = trienKhaiCho(AGENT_OKR, sha);
	const statusDo = statusGithub(sha).filter((s) => s.context === CONTEXT_AGENT_OKR && TRANG_THAI_DO.has(s.state));
	if (CHE_DO === "xanh") {
		if (dsTrienKhai.length === 0 && statusDo.length === 0) {
			thoat(0, `agent-okr: 0 deployment, 0 status do cho ${sha}; doi chung: ${nen}`);
		}
		thoat(1, `agent-okr co deployment [${moTa(dsTrienKhai)}], ${statusDo.length} status do cho ${sha}`);
	}
	const ngan = sha.slice(0, 8);
	if (dsTrienKhai.length > 0) console.log(`agent-okr co deployment cho ${ngan}…: ${moTa(dsTrienKhai)}`);
	if (statusDo.length > 0) console.log(`status ${CONTEXT_AGENT_OKR} failure cho ${ngan}…`);
	const batDuSo = dsTrienKhai.length > 0 && statusDo.length > 0;
	thoat(batDuSo ? 0 : 1, `do: deployment ${dsTrienKhai.length}, status do ${statusDo.length}; doi chung: ${nen}`);
} catch (loi) {
	if (loi instanceof LoiApi) thoat(2, `LOI-API ${loi.message}`);
	throw loi;
}
