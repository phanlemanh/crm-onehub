import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const TL = {
	aiUx: "docs/ai-ux.md",
	chatUi: "docs/chat-ui.md",
	muc10: "## 10. Ai giữ luật nào",
	loTrinh: "## Lộ trình áp luật",
	trongCay: "### What is in the tree today",
	sauKhoi: [
		"KaraTranscript",
		"KaraComposer",
		"KaraSteps",
		"KaraState",
		"KaraProposal",
		"KaraArtifact",
	],
	luatLoi: "7",
	nutThuLai: "KaraRetry",
	tuVung: "tu-vung-tac-tu",
	hoSo: "bo-xuong-kara",
	tepKeo: ["artifact.tsx", "task.tsx"],
};

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : process.argv[i + 1];
};

const tepAiUx = doiSo("--tep-ai-ux") ?? join(GOC, TL.aiUx);
const tepChatUi = doiSo("--tep-chat-ui") ?? join(GOC, TL.chatUi);

const dong = [];
let sai = 0;

function ghi(ok, chu) {
	dong.push(`${ok ? "OK " : "SAI"} ${chu}`);
	if (!ok) sai += 1;
}

function khongDoDuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function doc(tep) {
	try {
		return readFileSync(tep, "utf8");
	} catch {
		return khongDoDuoc(`khong doc duoc ${tep}`);
	}
}

function bangSau(chu, tieuDe) {
	const dau = chu.indexOf(tieuDe);
	if (dau === -1) khongDoDuoc(`khong thay muc ${tieuDe}`);
	const hang = [];
	let daVao = false;
	for (const d of chu.slice(dau + tieuDe.length).split("\n")) {
		const laHang = d.trim().startsWith("|");
		if (!laHang && daVao) break;
		if (!laHang) continue;
		daVao = true;
		const o = d
			.trim()
			.replace(/^\||\|$/g, "")
			.split("|")
			.map((x) => x.trim());
		if (o.every((x) => /^:?-+:?$/.test(x))) continue;
		hang.push(o);
	}
	if (hang.length < 2) khongDoDuoc(`bang sau ${tieuDe} rong`);
	return { dau: hang[0], than: hang.slice(1) };
}

const aiUx = doc(tepAiUx);
const muc10 = bangSau(aiUx, TL.muc10);
const hangSau = muc10.than.find((o) =>
	TL.sauKhoi.every((k) => o.join(" ").includes(k)),
);
if (hangSau) ghi(true, "muc 10 co hang du sau khoi");
else
	for (const k of TL.sauKhoi) {
		const co = muc10.than.some((o) => o.join(" ").includes(k));
		ghi(co, co ? `muc 10 co ${k}` : `thieu khoi: ${k}`);
	}
const hangLoi = muc10.than.find((o) =>
	o[0]
		.split(",")
		.map((x) => x.trim())
		.includes(TL.luatLoi),
);
ghi(
	Boolean(hangLoi?.join(" ").includes(TL.nutThuLai)),
	`hang luat ${TL.luatLoi} neu ${TL.nutThuLai}`,
);

const loTrinh = bangSau(aiUx, TL.loTrinh);
const cotLam = loTrinh.dau.findIndex((x) => x === "Làm gì");
if (cotLam === -1) khongDoDuoc("bang lo trinh khong co cot «Làm gì»");
const hangTuVung = loTrinh.than.find((o) => o[0].includes(TL.tuVung));
ghi(
	Boolean(hangTuVung?.[cotLam]?.includes(TL.hoSo)),
	`hang ${TL.tuVung} ghi da gop vao ${TL.hoSo}`,
);

const chatUi = doc(tepChatUi);
const trongCay = bangSau(chatUi, TL.trongCay);
for (const t of TL.tepKeo) {
	const co = trongCay.than.some((o) => o[0].includes(t));
	ghi(co, co ? `chat-ui co hang ${t}` : `chat-ui thieu hang: ${t}`);
}

for (const d of dong) console.log(d);
if (sai > 0) {
	console.log(`DO: ${sai} muc sai`);
	process.exit(1);
}
console.log(`XANH: ${dong.length} muc`);
