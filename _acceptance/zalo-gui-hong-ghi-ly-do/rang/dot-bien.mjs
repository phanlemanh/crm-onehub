import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 20;
const TRAN_MS = 600_000;
const AGENT = (t) =>
	`cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/zalo-gui-hong-ly-do.spec.ts -t ${t}`;
const API = (t) => `cd apps/api && bun test test/zalo-doi-bot.spec.ts -t ${t}`;
const DOM = (t) =>
	`cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/zalo-doi-bot.dom.tsx -t ${t}`;
const ZAPI = "apps/agent/agent/lib/zalo-api.ts";
const XUONG = "apps/agent/agent/lib/zalo-bot-xuong.ts";
const WEBHOOK = "apps/agent/agent/lib/zalo-webhook.ts";
const DAT_KHOA = `		if (laTinZalo(await request.text()))
			await (deps.datKhoaLech ?? datKhoaLech)();`;

const CAP = [
	[
		"a mo ta cu",
		AGENT("mo-ta"),
		ZAPI,
		"export function moTaLoiZalo(loi: Error): string {",
		"export function moTaLoiZalo(loi: Error): string {\n\treturn loi.name;",
		"mo ta ZaloTuChoi khac",
	],
	[
		"b bo cat tran",
		AGENT("mo-ta"),
		ZAPI,
		'return moTa ? moTa.slice(0, ZALO.nhatKy.tranMoTa) : "-";',
		'return moTa ?? "-";',
		"dai: khong cat o tran",
	],
	[
		"c 408 moi lenh",
		AGENT("408"),
		ZAPI,
		"method === ZALO.poll.lenhKeo && res.status === ZALO.http.hetTin;",
		"res.status === ZALO.http.hetTin;",
		"408 sendMessage bi cho lot",
	],
	[
		"d tra loi phien",
		AGENT("bay-cho"),
		"apps/agent/agent/lib/zalo-tra-loi.ts",
		"gui tra loi hong message_id=${hang.messageId}: ${loi instanceof Error ? moTaLoiZalo(loi)",
		"gui tra loi hong message_id=${hang.messageId}: ${loi instanceof Error ? loi.name",
		"tra-loi-phien: khong co ly do",
	],
	[
		"e bo da-gap",
		AGENT("bo-qua"),
		"apps/agent/agent/lib/zalo-nhan.ts",
		"\t\tghiBoQua(tin.message_id, ZALO.nhatKy.boQua.daGap);\n",
		"",
		"da-gap: khong co dong bo qua",
	],
	[
		"f bo webhook-test",
		AGENT("webhook-thu"),
		WEBHOOK,
		"\t\tconsole.error(`[zalo] ${ZALO.nhatKy.maThu}`);\n\t\treturn null;\n",
		"",
		"webhook-test van ghi sai khuon",
	],
	[
		"g lo token",
		AGENT("rieng-tu"),
		ZAPI,
		"if (mang.success) return `mang (${mang.data.code})`;",
		"if (mang.success) return `mang (${mang.data.code}) ${loi.message}`;",
		"lo tok-rieng-tu-h4 trong nhat ky",
	],
	[
		"h bo buoc hoi",
		AGENT("doi-bot-hoi"),
		XUONG,
		"if (soLienKet > 0 && yeuCau.xacNhanDoiBot !== true) {",
		"if (soLienKet < 0) {",
		"doi bot khong hoi, da go 3 lien ket",
	],
	[
		"i go truoc setWebhook",
		AGENT("doi-bot-dong-y"),
		XUONG,
		"\tconst ket = await dangKy(fetcher, token, url, khoa);",
		"\tif (soLienKet > 0) await goHetLienKet(db);\n\tconst ket = await dangKy(fetcher, token, url, khoa);",
		"zalo tu choi ma lien ket da bi go",
	],
	[
		"j tach giao dich",
		AGENT("doi-bot-dong-y"),
		XUONG,
		"\t\t\tawait tx.appSetting.update({ where: { id: SETTINGS_ID }, data: cuoi });\n\t\t\treturn goHetLienKet(tx);",
		"\t\t\tawait db.appSetting.update({ where: { id: SETTINGS_ID }, data: cuoi });\n\t\t\treturn goHetLienKet(db);",
		"go lien ket khong nguyen tu",
	],
	[
		"k can noi lai tat",
		API("can-noi-lai"),
		"apps/api/src/zalo/zalo.service.ts",
		'canNoiLai: k.uuTien === "ZALO" && lienKet.loai !== "da-noi",',
		"canNoiLai: false,",
		"A khong duoc bao noi lai",
	],
	[
		"l bo doc than",
		AGENT("mo-ta"),
		ZAPI,
		"const loi = await docThanLoi(res);",
		"const loi = await Promise.resolve(null);",
		"http 400: mat description",
	],
	[
		"m bo co o API",
		API("luu-bot-qua-api"),
		"apps/api/src/zalo/zalo.contracts.ts",
		"\txacNhanDoiBot: z.literal(true).optional(),\n",
		"",
		"co xac nhan bi bo o API",
	],
	[
		"n nut khong co",
		DOM("doi-bot-dom"),
		"apps/app/app/(app)/[slug]/settings/connections/zalo/o-token.tsx",
		"luu.mutate({ token: doiBot.token, xacNhanDoiBot: true })",
		"luu.mutate({ token: doiBot.token })",
		"xac nhan khong gui co",
	],
	[
		"o 403 khong dat",
		AGENT("webhook-403"),
		WEBHOOK,
		DAT_KHOA,
		"\t\tawait request.text();",
		"403 khong dat ly do khoa-lech",
	],
	[
		"p nhip kiem xoa",
		AGENT("ly-do-ben"),
		"apps/agent/agent/lib/zalo-bot.ts",
		"data: { zaloWebhookUrl: url },",
		"data: { zaloWebhookUrl: url, zaloWebhookLyDo: null },",
		"nhip kiem xoa ly do khoa-lech",
	],
	[
		"q API giau khoa-lech",
		API("canh-bao-khoa"),
		"apps/api/src/zalo/zalo.service.ts",
		'if (ly === "khoa-lech") return "khoa-lech";',
		'if (ly === "khoa-lech") return "da-dang-ky";',
		"khoa-lech bi giau o API",
	],
	[
		"r bo nhanh khoa-lech",
		DOM("canh-bao-khoa"),
		"apps/app/app/(app)/[slug]/settings/connections/zalo/trang-thai-webhook.tsx",
		'const khoaLech = trangThai === "khoa-lech";',
		"const khoaLech = false;",
		"khong co canh bao khoa lech",
	],
	[
		"s ghi lai moi lan",
		AGENT("webhook-403"),
		WEBHOOK,
		"\t\t\tOR: [{ zaloWebhookLyDo: null }, { zaloWebhookLyDo: { not: lyDo } }],\n",
		"",
		"403 ghi lai moi yeu cau",
	],
	[
		"t ke la bat",
		AGENT("webhook-403"),
		WEBHOOK,
		"if (laTinZalo(await request.text()))",
		"if ((await request.text()) !== null)",
		"ke la bat canh bao gia",
	],
];

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

const banSao = dungBanSao("zghl");
let daChay = 0;
const hong = [];
try {
	for (const [ten, cmd, tep, cu, moi, ghim] of CAP) {
		daChay += 1;
		const truoc = lenh(banSao, cmd);
		const traLai = thayMotLan(banSao, tep, cu, moi);
		let sau;
		try {
			sau = lenh(banSao, cmd);
		} finally {
			traLai();
		}
		const dung = truoc.ma === 0 && sau.ma !== 0 && coGhim(sau.ra, ghim);
		console.log(
			`${ten} xanh=${truoc.ma} do=${sau.ma} ghim=${coGhim(sau.ra, ghim) ? "ok" : "thieu"}`,
		);
		if (!dung)
			hong.push({
				ten,
				truoc: truoc.ra.slice(-1200),
				sau: sau.ra.slice(-1200),
			});
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
for (const h of hong)
	console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`DOT BIEN: ${SO_CAP_KHAI - hong.length}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
