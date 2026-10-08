import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { batCham, chenDong, doLan, doVuot, KHO, KHO_CHAM } from "./do-lan.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = join(GOC, ".acceptance-runs", "khung-chat-cuon-duoc", "tai-hien");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 60_000;

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	return new URL(res.headers.get("location") ?? "/", APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
}

async function mat(trinhDuyet, cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	if (kho.cham) await batCham(p);
	else
		await p.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
	return { ctx, p };
}

const nguoi = await db.user.findUnique({
	where: { email: NGUOI },
	select: { id: true },
});
if (!nguoi) throw new Error(`khong co nguoi ${NGUOI} trong kho do`);
const hoiThoai = await db.agentConversation.create({
	data: { kind: "BUILDER", userId: nguoi.id, title: "kcs tai hien cuon" },
	select: { id: true },
});
const SO_TIN = 30;
const CAU =
	"Tin thử cuộn khung chat: một đoạn đủ dài để mỗi tin chiếm vài dòng ở khổ hẹp, cộng lại vượt xa chiều cao khung. ";
for (let i = 0; i < SO_TIN; i += 1) {
	await db.agentConversationSubmission.create({
		data: {
			conversationId: hoiThoai.id,
			submittedById: nguoi.id,
			clientRequestId: `kcs-${hoiThoai.id}-${i}`,
			message: {
				text: `#${i} ${CAU.repeat(3)}`,
				resources: [],
				attachments: [],
			},
			status: "ACCEPTED",
			createdAt: new Date(Date.now() - (SO_TIN - i) * 60_000),
		},
	});
}
const lienHe = await db.contact.findFirst({ select: { id: true } });
const cookie = phien(NGUOI);
const slug = await suySlug(cookie);
mkdirSync(RA, { recursive: true });

const MAT = [
	{
		ten: "chat",
		duong: `/${slug}/chat/${hoiThoai.id}`,
		khung: "[data-slot=message-scroller]",
		chen: false,
	},
	...(lienHe
		? [
				{
					ten: "kara-ban-ghi",
					duong: `/${slug}/contacts?record=contact:${lienHe.id}&tab=agent`,
					khung:
						"[data-slot=sheet-content] [data-slot=message-scroller], [data-slot=drawer-content] [data-slot=message-scroller]",
				},
			]
		: []),
];

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
const ket = [];
try {
	for (const m of MAT) {
		for (const [nhan, kho] of [
			...Object.entries(KHO),
			["390-cham", KHO_CHAM],
		]) {
			const { ctx, p } = await mat(trinhDuyet, cookie, kho);
			try {
				await p.goto(`${APP}${m.duong}`, { waitUntil: "load" });
				const thay = await p
					.waitForFunction(
						(chon) =>
							[...document.querySelectorAll(chon)].some((x) =>
								x.checkVisibility(),
							),
						{ timeout: CHO_MS },
						m.khung,
					)
					.then(() => true)
					.catch(() => false);
				const cay = await p.evaluate((chon) => {
					const k = [...document.querySelectorAll(chon)].find((x) =>
						x.checkVisibility(),
					);
					const dong = [];
					const di = (e, sau) => {
						if (sau > 4) return;
						const s = getComputedStyle(e);
						dong.push(
							`${"  ".repeat(sau)}${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""} oy=${s.overflowY} disp=${s.display} ch=${e.clientHeight} sh=${e.scrollHeight} cls=${(e.getAttribute("class") ?? "").slice(0, 90)}`,
						);
						for (const c of [...e.children].slice(0, 4)) di(c, sau + 1);
					};
					if (k) di(k, 0);
					const kara = [
						...document.querySelectorAll(
							"[data-slot*=kara],[data-slot*=conversation],[role=log],[role=tab]",
						),
					]
						.filter((x) => x.checkVisibility())
						.map(
							(x) =>
								`${x.getAttribute("data-slot") ?? x.getAttribute("role")}:${(x.textContent ?? "").trim().slice(0, 24)}`,
						);
					return { dong, kara: kara.slice(0, 25) };
				}, m.khung);
				console.log(
					`== cay ${m.ten} ${nhan}\n${cay.dong.join("\n")}\n   hien: ${cay.kara.join(" | ")}`,
				);
				if (!thay) {
					const tep = join(RA, `${m.ten}-${nhan}-khong-thay.png`);
					await p.screenshot({ path: tep });
					ket.push({
						mat: m.ten,
						kho: nhan,
						loi: `khong thay ${m.khung}`,
						anh: tep,
					});
					continue;
				}
				const chen =
					m.chen === false
						? { conLai: 0, tinThat: SO_TIN }
						: await chenDong(p, m.khung);
				await new Promise((r) => setTimeout(r, 500));
				chen.sau500 = await p.evaluate(() => ({
					conLai: document.querySelectorAll("[data-kcs-dong]").length,
				}));
				if (process.env.KCS_TA === "1")
					await p.evaluate(() => {
						for (const n of document.querySelectorAll("[data-vaul-drawer]"))
							n.style.touchAction = "auto";
					});
				if (process.env.KCS_NO_DRAG === "1")
					await p.evaluate((chon) => {
						const k = [...document.querySelectorAll(chon)].find((x) =>
							x.checkVisibility(),
						);
						k?.querySelector(
							"[data-slot=message-scroller-viewport]",
						)?.setAttribute("data-vaul-no-drag", "");
					}, m.khung);
				const lan = kho.cham
					? await doVuot(p, m.khung)
					: await doLan(p, m.khung);
				const tep = join(RA, `${m.ten}-${nhan}.png`);
				await p.screenshot({ path: tep });
				ket.push({ mat: m.ten, kho: nhan, chen, ...lan, anh: tep });
			} finally {
				await ctx.close();
			}
		}
	}
} finally {
	await trinhDuyet.close();
	await db.agentConversation
		.delete({ where: { id: hoiThoai.id } })
		.catch(() => {});
	await db.$disconnect();
}

writeFileSync(join(RA, "ket-qua.json"), `${JSON.stringify(ket, null, 2)}\n`);
for (const k of ket) {
	if (k.loi) {
		console.log(`${k.mat} ${k.kho}: ${k.loi}`);
		continue;
	}
	console.log(
		`${k.mat} ${k.kho}: chen=${JSON.stringify(k.chen)} cao=${k.caoKhung} hien=${k.hienCao} tran=${k.tranNhat} cuonTrong=${k.soCuonTrong} cuonTren=${k.soCuonTren} len=${k.lenDuoc} xuong=${k.xuongDuoc} dau=${k.dau} sauLen=${k.sauLen}`,
	);
	if (k.chuoi) console.log(`   chuoi: ${k.chuoi.slice(0, 7).join(" < ")}`);
	if (k.chuoiCham)
		console.log(`   cham: ${k.chuoiCham.slice(0, 12).join("\n          < ")}`);
}
