import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import suKienGoiBoDung from "../../../apps/agent/test/fixtures/goi-bo-dung-kem-khuon-that.json" with {
	type: "json",
};
import { ghiThongBaoTacNhan } from "../../../apps/agent/agent/lib/thong-bao-tac-nhan.ts";
import { CHO_TAC_NHAN } from "../../../apps/app/lib/agent-builder-cho.ts";
import { troChuyenMessages } from "../../../apps/app/lib/messages/agent-builder-tro-chuyen.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "cho-tac-nhan-lau", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const DA_CHO_MS = CHO_TAC_NHAN.nguongLauMs + 50_000;
const DUOI_MS = 5_000;
const LECH_GIAY = 5;
const CHU_CU = "Chạy ngầm";
const TEN_TAC_NHAN = "Đo màn: tóm tắt deal mỗi sáng";
const t = troChuyenMessages("vi");
const MA_TRAN = [
	"tren-nguong-1280",
	"tren-nguong-375",
	"duoi-nguong-1280",
	"duoi-nguong-375",
	"chuong-1280",
	"mo-tu-chuong-1280",
	"chuong-375",
	"mo-tu-chuong-375",
];
const THE = "[data-slot=the-dang-dung]";
const CHUONG = "[data-slot=chuong-thong-bao]";
const SO = "[data-slot=so-chua-doc]";

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null, member: null, hoiThoai: [], agent: null };
const batDau = new Map();

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${email}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.split("/").filter(Boolean)[0];
	if (!dau || dau === "sign-in" || dau.startsWith("onboarding"))
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

async function nguoiDo() {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `ctnl-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `ctnl-${ma}`,
			email,
			name: "Người đo Tác nhân",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = nguoi.id;
	tao.member = `member-ctnl-${ma}`;
	await db.member.create({
		data: {
			id: tao.member,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	return { id: nguoi.id, email, ma };
}

async function hoiThoaiDangDung(nguoi, daChoMs) {
	const phienId = `ctnl-phien-${nguoi.ma}-${tao.hoiThoai.length}`;
	const h = await db.agentConversation.create({
		data: {
			userId: nguoi.id,
			kind: "BUILDER",
			title: "Đo màn: đang dựng",
			sessionId: phienId,
		},
		select: { id: true },
	});
	tao.hoiThoai.push(h.id);
	const gui = await db.agentConversationSubmission.create({
		data: {
			conversationId: h.id,
			submittedById: nguoi.id,
			clientRequestId: `ctnl-${crypto.randomUUID()}`,
			commandType: "CREATE_AGENT",
			message: {
				text: "Dựng tác nhân tóm tắt deal",
				resources: [],
				attachments: [],
			},
			status: "SENDING",
			createdAt: new Date(Date.now() - daChoMs),
		},
		select: { createdAt: true },
	});
	await db.agentEvent.create({
		data: {
			id: `${suKienGoiBoDung.meta.id}-${phienId}`,
			sessionId: phienId,
			conversationId: h.id,
			type: suKienGoiBoDung.type,
			data: suKienGoiBoDung.data,
			emittedAt: new Date(gui.createdAt.getTime() + 1_000),
		},
	});
	batDau.set(h.id, gui.createdAt.getTime());
	return h.id;
}

async function hoiThoaiXong(nguoi) {
	const h = await db.agentConversation.create({
		data: { userId: nguoi.id, kind: "BUILDER", title: "Đo màn: đã xong" },
		select: { id: true },
	});
	tao.hoiThoai.push(h.id);
	await db.agentConversationSubmission.create({
		data: {
			conversationId: h.id,
			submittedById: nguoi.id,
			clientRequestId: `ctnl-${crypto.randomUUID()}`,
			commandType: "CREATE_AGENT",
			message: { text: "Dựng tác nhân", resources: [], attachments: [] },
			status: "ACCEPTED",
		},
	});
	const agent = await db.agentDefinition.create({
		data: { name: TEN_TAC_NHAN, status: "DRAFT", createdById: nguoi.id },
		select: { id: true },
	});
	tao.agent = agent.id;
	await db.agentVersion.create({
		data: {
			agentId: agent.id,
			number: 1,
			status: "DRAFT",
			instructions: "Tóm tắt.",
			manifest: {},
			modelId: "test/model",
			sandboxPolicy: {},
			createdById: nguoi.id,
			sourceConversationId: h.id,
		},
	});
	const ghi = await ghiThongBaoTacNhan(db, h.id, "cho", new Date());
	if (!ghi) khongDo("bo ghi that khong ghi thong bao tac-nhan-xong");
	return h.id;
}

async function trang(cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function mo(p, url, sel) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(sel, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay ${sel}`);
	}
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
	await p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
}

const anh = (p, ten) =>
	p.screenshot({ path: join(RA, `${ten}.png`), fullPage: true });
const rongTrang = (p) => p.evaluate(() => document.documentElement.scrollWidth);
const soChuong = (p) =>
	p.evaluate(
		(sel) => Number(document.querySelector(sel)?.textContent ?? 0),
		SO,
	);

async function kiemThe(p, ma, kho, id, quaNguong) {
	const doc = await p.evaluate(() => {
		const the = document.querySelector("[data-slot=the-dang-dung]");
		return {
			daTroi: the?.querySelector("[data-slot=da-troi]")?.textContent ?? null,
			lauHon: the?.querySelector("[data-slot=lau-hon]")?.textContent ?? null,
			chu: the?.textContent ?? "",
		};
	});
	const giayThat = Math.floor((Date.now() - batDau.get(id)) / 1000);
	const khop = /(\d+):(\d{2})/.exec(doc.daTroi ?? "");
	const giayThe = khop ? Number(khop[1]) * 60 + Number(khop[2]) : -1;
	const rong = await rongTrang(p);
	kiem(
		ma,
		`thoi gian ${JSON.stringify(doc.daTroi)} (${giayThe} s, tu luc gui ${giayThat} s), dong qua nguong ${JSON.stringify(doc.lauHon)}, rong trang ${rong}`,
		giayThe >= 1 &&
			Math.abs(giayThe - giayThat) <= LECH_GIAY &&
			doc.lauHon === (quaNguong ? t.dung.lauHon : null) &&
			doc.chu.includes(t.dung.roiTrang) &&
			!doc.chu.includes(CHU_CU) &&
			rong <= kho,
	);
	await anh(p, ma);
}

async function moChuong(p) {
	await p.click(CHUONG);
	await p.waitForSelector("[data-slot=danh-sach-thong-bao]", { timeout: CHO_MS });
	await p.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => {});
}

async function dongTacNhan(p) {
	return p.evaluate((ten) => {
		const a = [
			...document.querySelectorAll("[data-slot=danh-sach-thong-bao] a"),
		].find((x) => x.querySelector('[translate="no"]')?.textContent === ten);
		return a ? { href: a.getAttribute("href"), chu: a.textContent } : null;
	}, TEN_TAC_NHAN);
}

async function moTuChuong(p, ma, nguoi, slug, xong, truoc) {
	const d = await dongTacNhan(p);
	if (d) await p.click(`[data-slot=danh-sach-thong-bao] a[href="${d.href}"]`);
	await p
		.waitForFunction(
			(id) => location.pathname.endsWith(`/chat/${id}`),
			{ timeout: CHO_MS },
			xong,
		)
		.catch(() => {});
	await p
		.waitForNetworkIdle({ idleTime: 1500, timeout: CHO_MS })
		.catch(() => {});
	const daDoc = await db.thongBao.findFirst({
		where: { nguoiNhanId: nguoi.id, duongDan: `/chat/${xong}` },
		select: { docLuc: true },
	});
	await mo(p, `${APP}/${slug}/chat`, CHUONG);
	const sau = await soChuong(p);
	kiem(
		ma,
		`mo cuoc tro chuyen tu chuong: docLuc ${daDoc?.docLuc ? "co" : "khong"}, so chua doc ${truoc} -> ${sau}`,
		Boolean(daDoc?.docLuc) && sau === truoc - 1,
	);
	await anh(p, ma);
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const slug = await suySlug(phien(QUAN_TRI));
	const nguoi = await nguoiDo();
	const tren = await hoiThoaiDangDung(nguoi, DA_CHO_MS);
	const xong = await hoiThoaiXong(nguoi);
	const c = phien(nguoi.email);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});

	for (const kho of [1280, 375]) {
		const { ctx, p } = await trang(c, kho);
		try {
			await mo(p, `${APP}/${slug}/chat/${tren}`, THE);
			await kiemThe(p, `tren-nguong-${kho}`, kho, tren, true);
		} finally {
			await ctx.close();
		}
	}

	for (const kho of [1280, 375]) {
		const duoi = await hoiThoaiDangDung(nguoi, DUOI_MS);
		const { ctx, p } = await trang(c, kho);
		try {
			await mo(p, `${APP}/${slug}/chat/${duoi}`, THE);
			await p
				.waitForSelector("[data-slot=da-troi]", { timeout: CHO_MS })
				.catch(() => {});
			await kiemThe(p, `duoi-nguong-${kho}`, kho, duoi, false);
		} finally {
			await ctx.close();
		}
	}

	for (const kho of [1280, 375]) {
		await db.thongBao.updateMany({
			where: { nguoiNhanId: nguoi.id },
			data: { docLuc: null },
		});
		const { ctx, p } = await trang(c, kho);
		try {
			await mo(p, `${APP}/${slug}/chat`, CHUONG);
			const truoc = await soChuong(p);
			await moChuong(p);
			const d = await dongTacNhan(p);
			const rong = await rongTrang(p);
			kiem(
				`chuong-${kho}`,
				`dong tac nhan ${JSON.stringify(d)}, so chua doc ${truoc}, rong trang ${rong}`,
				d !== null &&
					d.href === `/${slug}/chat/${xong}` &&
					truoc >= 1 &&
					rong <= kho,
			);
			await anh(p, `chuong-${kho}`);
			await moTuChuong(p, `mo-tu-chuong-${kho}`, nguoi, slug, xong, truoc);
		} finally {
			await ctx.close();
		}
	}
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((x) => !daPhat.has(x));
	if (thieu.length > 0) {
		dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
		sai += 1;
	}
	ma = sai > 0 ? 1 : 0;
} catch (e) {
	dong.push(
		`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
	);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	if (tao.user)
		await db.thongBao.deleteMany({ where: { nguoiNhanId: tao.user } });
	if (tao.agent)
		await db.agentVersion.deleteMany({ where: { agentId: tao.agent } });
	for (const id of tao.hoiThoai) {
		await db.agentEvent
			.deleteMany({ where: { conversationId: id } })
			.catch(() => {});
		await db.agentConversation.deleteMany({ where: { id } }).catch(() => {});
	}
	if (tao.agent)
		await db.agentDefinition.deleteMany({ where: { id: tao.agent } });
	if (tao.member) await db.member.deleteMany({ where: { id: tao.member } });
	if (tao.user) {
		await db.session.deleteMany({ where: { userId: tao.user } });
		await db.user.deleteMany({ where: { id: tao.user } });
	}
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
