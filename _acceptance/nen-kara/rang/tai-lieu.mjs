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
	chuaCo: ["chưa — lượt nen-kara", "chỉ dạng thẻ"],
	thanhPhan: {
		"2, 3": ["KaraLabel"],
		5: ["density"],
		6: ["ProposedChangeReceipt"],
		8: ["AiFeedback"],
	},
	khung: "muc-tieu-va-kr",
	gopY: "gop-y-dung-cho",
	diemCam: [
		"BangMucTieu",
		"nhanMucTieu",
		"duoiMucTieu",
		"duoiKr",
		"sauTenKr",
		"dangMo",
		"data-muc-tieu",
	],
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
		if (o.every((x) => /^-+$/.test(x))) continue;
		hang.push(o);
	}
	if (hang.length < 2) khongDoDuoc(`bang sau ${tieuDe} rong`);
	return hang.slice(1);
}

const aiUx = doc(tepAiUx);
const muc10 = bangSau(aiUx, TL.muc10);
for (const [luat, can] of Object.entries(TL.thanhPhan)) {
	const h = muc10.find((o) => o[0] === String(luat));
	if (!h) {
		ghi(false, `muc 10 thieu hang luat ${luat}`);
		continue;
	}
	const chu = h.join(" | ").replaceAll("`", "");
	for (const cu of TL.chuaCo) {
		ghi(!chu.includes(cu), `muc 10 luat ${luat}: khong con «${cu}»`);
	}
	for (const ten of can)
		ghi(chu.includes(ten), `muc 10 luat ${luat}: neu ${ten}`);
}

const loTrinh = bangSau(aiUx, TL.loTrinh);
const iKhung = loTrinh.findIndex((o) => o[0].replaceAll("`", "") === TL.khung);
const iGopY = loTrinh.findIndex((o) => o[0].replaceAll("`", "") === TL.gopY);
ghi(iKhung !== -1, `lo trinh co hang ${TL.khung}`);
ghi(iGopY !== -1, `lo trinh co hang ${TL.gopY}`);
if (iKhung !== -1 && iGopY !== -1) {
	if (iKhung >= iGopY) ghi(false, "lo trinh sai thu tu");
	else
		ghi(true, `lo trinh: ${TL.khung} (${iKhung}) truoc ${TL.gopY} (${iGopY})`);
	const lam = (loTrinh[iGopY].at(-1) ?? "").replaceAll("`", "");
	for (const ten of TL.diemCam)
		ghi(lam.includes(ten), `hang ${TL.gopY} neu ${ten}`);
}

const chatUi = doc(tepChatUi);
const cay = bangSau(chatUi, TL.trongCay);
const hConf = cay.find((o) => o[0].includes("confirmation.tsx"));
ghi(Boolean(hConf), "chat-ui co hang confirmation.tsx");
if (hConf)
	ghi(hConf.join(" ").includes("card"), "hang confirmation.tsx neu card");

for (const d of dong) console.log(d);
console.log(sai === 0 ? "XANH" : `DO: ${sai} dong sai`);
process.exit(sai === 0 ? 0 : 1);
