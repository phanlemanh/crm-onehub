import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { trpc } from "../../../../_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import puppeteer from "../../../../node_modules/.bun/puppeteer-core@25.9.0/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";

const THU_MUC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"..",
	".acceptance-runs",
	"lai-thu-the-gop-y",
);
const ANH = join(THU_MUC, "anh");
mkdirSync(ANH, { recursive: true });
const P = JSON.parse(readFileSync(join(THU_MUC, "phien.json"), "utf8"));
const APP = P.app;
const API = P.api;
const SLUG = "onehub-center";
const MT = P.mucTieu;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CHO = 60_000;
const GOP_Y = 240_000;

const buoc = [];
let so = 0;
const tre = (ms) => new Promise((r) => setTimeout(r, ms));

const goi = (duong, vao, cookie) => trpc(API, cookie).lam(duong, vao);
const hoi = (duong, vao, cookie) => trpc(API, cookie).hoi(duong, vao);

async function trang(rong, cao, dpr = 1) {
	const ctx = await trinhDuyet.createBrowserContext();
	const host = new URL(APP).hostname;
	await ctx.setCookie(
		{
			name: P.truongPhong.ten,
			value: P.truongPhong.gia,
			domain: host,
			path: "/",
		},
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: dpr });
	return { ctx, p, rong };
}

async function chup(t, ten, moTa, doLuong = {}, chon = null) {
	so += 1;
	const tep = `${String(so).padStart(2, "0")}-${ten}-${t.rong}.png`;
	await tre(500);
	await t.p.evaluate(() => document.fonts.ready);
	if (chon) {
		const h = await t.p.$(chon);
		if (h) await h.screenshot({ path: join(ANH, tep) });
		else await t.p.screenshot({ path: join(ANH, tep) });
	} else await t.p.screenshot({ path: join(ANH, tep) });
	buoc.push({ so, tep, ten, rong: t.rong, moTa, doLuong });
	console.log(`ANH ${tep} — ${moTa}`);
}

function ghiChu(ten, moTa) {
	buoc.push({ so: null, tep: null, ten, moTa, doLuong: {} });
	console.log(`GHI ${ten}: ${moTa}`);
}

async function doHop(p) {
	return p.evaluate(() => {
		const hop = document.querySelector(
			'[role="dialog"][data-slot="dialog-content"]',
		);
		const cot = document.querySelector("[data-cot-gop-y]");
		const form = hop?.querySelector("form");
		const r = (o) => (o ? Math.round(o.getBoundingClientRect().width) : null);
		const the = [
			...document.querySelectorAll(
				'[data-cot-gop-y] [data-slot="proposed-change"]',
			),
		].map((o) => ({
			dong: o.getAttribute("data-dong"),
			kind: o.getAttribute("data-kind"),
			decided: o.getAttribute("data-decided"),
			rong: r(o),
			nutChinh: o.querySelectorAll('button[data-variant="default"]').length,
			nut: [...o.querySelectorAll("button")].map(
				(b) =>
					`${b.textContent.trim()}(${b.getAttribute("data-variant")}${b.disabled ? ",khoa" : ""})`,
			),
			cauMoi: r(o.querySelector('[data-slot="proposed-change-value"]')),
		}));
		return {
			soHop: document.querySelectorAll(
				'[role="dialog"][data-slot="dialog-content"]',
			).length,
			size: hop?.getAttribute("data-size") ?? null,
			hop: r(hop),
			form: r(form),
			cot: r(cot),
			tran: document.documentElement.scrollWidth > window.innerWidth,
			oDuocChi: [...document.querySelectorAll('[data-duoc-chi="true"]')].map(
				(o) => o.id,
			),
			the,
		};
	});
}

async function bamChu(p, trong, chu) {
	const h = await p.waitForFunction(
		(trong, chu) =>
			[...document.querySelectorAll(`${trong} button`)].find(
				(b) =>
					b.textContent.trim() === chu && b.checkVisibility() && !b.disabled,
			) ?? null,
		{ timeout: CHO },
		trong,
		chu,
	);
	await h.asElement().click();
	await tre(600);
}

async function moSheet(p) {
	await p.goto(
		`${APP}/${SLUG}/okr/theo-don-vi?kyOkr=${P.chuKy}&donOkr=pb:${P.phong}`,
		{ waitUntil: "networkidle2" },
	);
	await p.waitForSelector(`[data-mo-muc-tieu="${MT}"]`, {
		visible: true,
		timeout: CHO,
	});
	await p.click(`[data-mo-muc-tieu="${MT}"]`);
	await p.waitForSelector('button[aria-label="Thao tác với mục tiêu"]', {
		visible: true,
		timeout: CHO,
	});
	await tre(800);
}

async function moHopMucTieu(p) {
	await moSheet(p);
	await p.click('button[aria-label="Thao tác với mục tiêu"]');
	await p.waitForSelector('[role="menuitem"]', { visible: true, timeout: CHO });
	const muc = await p.waitForFunction(
		() =>
			[...document.querySelectorAll('[role="menuitem"]')].find(
				(o) => o.textContent.trim() === "Sửa mục tiêu",
			) ?? null,
		{ timeout: CHO },
	);
	await muc.asElement().click();
	await p.waitForSelector("[data-hop-thoai-muc-tieu]", {
		visible: true,
		timeout: CHO,
	});
	await p.waitForSelector("[data-nut-gop-y]", { visible: true, timeout: CHO });
	await tre(600);
}

async function loaiThe(p) {
	await p
		.waitForFunction(
			() =>
				document
					.querySelector("[data-cot-gop-y]")
					?.getAttribute("aria-busy") !== "true" &&
				document.querySelector("[data-cot-gop-y] [data-the-cho]") !== null,
			{ timeout: GOP_Y },
		)
		.catch(() => {});
	return p.evaluate(() => {
		const co = (s) =>
			document.querySelector(`[data-cot-gop-y] [data-the-cho]${s}`) !== null;
		return {
			vietLai: co('[data-kind="rewrite"]'),
			hoi: co('[data-kind="question"]'),
			canChinh: co('[data-kind="compact"]'),
			hoiKr: [
				...document.querySelectorAll(
					'[data-cot-gop-y] [data-the-cho][data-kind="question"] button',
				),
			].some((b) => b.textContent.trim() === "Mở KR này"),
		};
	});
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
const tl = P.truongPhong;
try {
	const t = await trang(1440, 900);
	await moSheet(t.p);
	await chup(
		t,
		"khung-chi-tiet",
		"Khung chi tiết Mục tiêu «Doanh thu quý 4 miền Bắc», có KR yếu «Gọi điện cho đối tác mới mỗi tuần»",
	);

	await t.p.click('button[aria-label="Thao tác với mục tiêu"]');
	await t.p.waitForSelector('[role="menuitem"]', { visible: true });
	await chup(t, "menu-sua", "Menu thao tác của Mục tiêu, mục «Sửa mục tiêu»");
	await t.p.keyboard.press("Escape");
	await moHopMucTieu(t.p);
	await chup(
		t,
		"hop-truoc-nho",
		"Hộp Sửa mục tiêu trước khi nhờ góp ý: cỡ mặc định, nút «Nhờ Trợ lý OKR góp ý»",
		await doHop(t.p),
	);

	await t.p.click('[data-nut-gop-y="nho"] button');
	await t.p.waitForSelector("[data-cot-gop-y]", {
		visible: true,
		timeout: CHO,
	});
	await tre(800);
	await chup(
		t,
		"dang-soan",
		"Vừa bấm nhờ: cột mở, Trợ lý đang đọc (shimmer và khung chờ)",
		await doHop(t.p),
	);

	let loai = await loaiThe(t.p);
	const viSaoThu = [
		"Quý 4 là mùa cao điểm; đội cần giữ đối tác mới ở lại sau đơn đầu.",
		"Đối tác mới bỏ đi sau đơn đầu; quý 4 là lúc giữ họ ở lại.",
	];
	for (
		let i = 0;
		i < viSaoThu.length && !(loai.vietLai && loai.hoiKr && loai.canChinh);
		i += 1
	) {
		ghiChu(
			"nho-lai",
			`lượt ${i + 1} thiếu loại thẻ (${JSON.stringify(loai)}) — đổi «vì sao lúc này» và nhờ lại qua API`,
		);
		await goi("okr.updateObjective", { id: MT, whyNow: viSaoThu[i] }, tl);
		await goi("okr.troLyDeXuat", { objectiveId: MT }, tl);
		await moHopMucTieu(t.p);
		loai = await loaiThe(t.p);
	}
	ghiChu("loai-the", JSON.stringify(loai));
	await chup(
		t,
		"cot-co-the",
		"Cột góp ý có thẻ: hộp cỡ assist, form trái, cột phải",
		await doHop(t.p),
	);

	const theVietLai = await t.p.$eval(
		'[data-cot-gop-y] [data-the-cho][data-kind="rewrite"]',
		(o) => o.getAttribute("data-dong"),
	);
	const selVL = `[data-dong="${theVietLai}"]`;
	await chup(
		t,
		"the-viet-lai",
		"Cận cảnh thẻ viết lại: nhãn, câu cũ gạch, câu mới, lý do, hàng nút ở chân",
		{},
		selVL,
	);

	await t.p.hover(selVL);
	await tre(400);
	await chup(
		t,
		"chi-o-re",
		"Rê chuột lên thẻ viết lại: ô tương ứng của form sáng viền",
		await doHop(t.p),
	);
	await t.p.mouse.move(5, 5);

	await t.p.focus(selVL);
	await t.p.keyboard.press("j");
	await tre(300);
	const sauJ = await t.p.evaluate(() =>
		document.activeElement?.getAttribute("data-dong"),
	);
	await chup(
		t,
		"phim-j",
		`Focus thẻ đầu rồi bấm J: focus sang thẻ ${sauJ}`,
		await doHop(t.p),
	);
	await t.p.keyboard.press("k");
	await tre(300);
	const sauK = await t.p.evaluate(() =>
		document.activeElement?.getAttribute("data-dong"),
	);
	ghiChu("phim-k", `bấm K: focus về ${sauK} (mong đợi ${theVietLai})`);

	await t.p.focus(selVL);
	await t.p.keyboard.press("e");
	await tre(500);
	await chup(
		t,
		"sua-bang-phim-e",
		"Bấm E trên thẻ viết lại: ô sửa mở, nút «Nhận bản đã sửa» tô màu, «Huỷ» viền",
		await doHop(t.p),
	);
	await t.p.keyboard.press("Escape");
	await tre(500);
	await chup(
		t,
		"esc-huy-sua",
		"Esc trong ô sửa: thẻ về chờ, hộp vẫn mở",
		await doHop(t.p),
	);

	const oViSao = '[data-hop-thoai-muc-tieu] textarea[id$="-vi-sao"]';
	await t.p.click(oViSao);
	await t.p.keyboard.type(" (sửa dở)");
	await tre(500);
	await chup(
		t,
		"khoa-khi-sua-do",
		"Ô «Vì sao lúc này» có chữ chưa lưu: nhận của ô đó khoá kèm lý do, «Mở KR này» khoá kèm lý do",
		await doHop(t.p),
	);
	for (let i = 0; i < " (sửa dở)".length; i += 1)
		await t.p.keyboard.press("Backspace");
	await tre(500);

	await bamChu(t.p, selVL, "Sửa");
	const oSua = `${selVL} [data-slot="proposed-change-edit"]`;
	await t.p.$eval(oSua, (x) => {
		x.focus();
		x.select();
	});
	await t.p.keyboard.press("Backspace");
	const chuSua = "Không thoả thuận nào của miền Bắc bị mất dấu trong quý 4";
	await t.p.type(oSua, chuSua);
	await chup(t, "dang-sua", "Sửa câu đề xuất ngay trên thẻ", await doHop(t.p));
	await bamChu(t.p, selVL, "Nhận bản đã sửa");
	await t.p.waitForSelector(`${selVL}[data-decided]`, {
		visible: true,
		timeout: CHO,
	});
	await tre(600);
	const docLai = (await hoi("okr.objective", { id: MT }, tl))?.title;
	await chup(
		t,
		"da-nhan",
		`Nhận bản đã sửa: thẻ gọn một dòng, toast có «Hoàn tác»; đọc lại API: «${docLai}»`,
		await doHop(t.p),
	);

	const theCan = await t.p.$(
		'[data-cot-gop-y] [data-the-cho][data-kind="compact"]',
	);
	if (theCan) {
		const id = await theCan.evaluate((o) => o.getAttribute("data-dong"));
		await theCan.evaluate((o) => o.scrollIntoView({ block: "center" }));
		await chup(
			t,
			"the-can-chinh",
			"Cận cảnh thẻ căn chỉnh: «Góp vào «…»», một nút chính «Căn chỉnh»",
			{},
			`[data-dong="${id}"]`,
		);
		await bamChu(t.p, `[data-dong="${id}"]`, "Căn chỉnh");
		await t.p
			.waitForSelector(`[data-dong="${id}"][data-decided]`, {
				visible: true,
				timeout: CHO,
			})
			.catch(() => {});
		await chup(t, "da-can-chinh", "Căn chỉnh xong: thẻ gọn", await doHop(t.p));
	}

	const hoiMt = await t.p.evaluate(
		() =>
			[
				...document.querySelectorAll(
					'[data-cot-gop-y] [data-the-cho][data-kind="question"]',
				),
			]
				.filter(
					(o) =>
						![...o.querySelectorAll("button")].some(
							(b) => b.textContent.trim() === "Mở KR này",
						),
				)
				.map((o) => o.getAttribute("data-dong"))[0] ?? null,
	);
	if (hoiMt) {
		await t.p.$eval(`[data-dong="${hoiMt}"]`, (o) =>
			o.scrollIntoView({ block: "center" }),
		);
		await chup(
			t,
			"cau-hoi-muc-tieu",
			"Câu hỏi cấp Mục tiêu: chỉ có «Bỏ qua», không nút tô màu",
			{},
			`[data-dong="${hoiMt}"]`,
		);
		await bamChu(t.p, `[data-dong="${hoiMt}"]`, "Bỏ qua");
		await tre(800);
		ghiChu(
			"bo-qua",
			`bỏ qua ${hoiMt}; số hộp thoại ${(await doHop(t.p)).soHop}`,
		);
	}

	const bac = await t.p.evaluate(
		() =>
			[...document.querySelectorAll("[data-cot-gop-y] [data-the-cho]")]
				.filter((o) =>
					[...o.querySelectorAll("button")].some(
						(b) => b.textContent.trim() === "Bác",
					),
				)
				.map((o) => o.getAttribute("data-dong"))[0] ?? null,
	);
	if (bac) {
		await bamChu(t.p, `[data-dong="${bac}"]`, "Bác");
		await t.p
			.waitForSelector(`[data-dong="${bac}"][data-decided]`, {
				visible: true,
				timeout: CHO,
			})
			.catch(() => {});
		await chup(
			t,
			"da-bac-bo-qua",
			"Sau Bác và Bỏ qua: các thẻ gọn «Đã bác», «Đã bỏ qua»",
			await doHop(t.p),
		);
	}

	const hoiKr = await t.p.evaluate(
		() =>
			[
				...document.querySelectorAll(
					'[data-cot-gop-y] [data-the-cho][data-kind="question"]',
				),
			]
				.filter((o) =>
					[...o.querySelectorAll("button")].some(
						(b) => b.textContent.trim() === "Mở KR này",
					),
				)
				.map((o) => o.getAttribute("data-dong"))[0] ?? null,
	);
	if (hoiKr) {
		await t.p.$eval(`[data-dong="${hoiKr}"]`, (o) =>
			o.scrollIntoView({ block: "center" }),
		);
		await chup(
			t,
			"cau-hoi-kr",
			"Câu hỏi gắn KR: «Mở KR này» viền, «Bỏ qua» mờ",
			{},
			`[data-dong="${hoiKr}"]`,
		);
		await bamChu(t.p, `[data-dong="${hoiKr}"]`, "Mở KR này");
		await t.p.waitForSelector("[data-hop-thoai-kr]", {
			visible: true,
			timeout: CHO,
		});
		await tre(1500);
		const tenKr = await t.p.$eval(
			'[data-hop-thoai-kr] input[id$="-ten"]',
			(o) => o.value,
		);
		await chup(
			t,
			"mo-kr",
			`«Mở KR này»: hộp Mục tiêu đóng, hộp Sửa KR «${tenKr}» mở`,
			await doHop(t.p),
		);
		const coCot = await t.p.$("[data-cot-gop-y]");
		if (!coCot) {
			await t.p
				.click("[data-hop-thoai-kr] [data-nut-gop-y] button")
				.catch(() => {});
			await t.p
				.waitForSelector("[data-cot-gop-y] [data-slot='proposed-change']", {
					visible: true,
					timeout: GOP_Y,
				})
				.catch(() => {});
		}
		await chup(
			t,
			"hop-kr-cot",
			"Hộp Sửa KR: cột chỉ thẻ của KR này",
			await doHop(t.p),
		);
		await t.p.click('[data-hop-thoai-kr] input[id$="-ten"]');
		await t.p.keyboard.press("End");
		await t.p.keyboard.type(" x");
		await tre(600);
		await chup(
			t,
			"kr-sua-do",
			"Hộp Sửa KR có chữ chưa lưu: soi dòng nhắc trên thẻ câu hỏi (Ngoài-4)",
			await doHop(t.p),
		);
	} else ghiChu("mo-kr", "lượt này không có câu hỏi gắn KR");
	await t.ctx.close();

	for (const [rong, cao] of [[390, 844]]) {
		const m = await trang(rong, cao, 2);
		await moHopMucTieu(m.p);
		const coCot = await m.p.$("[data-cot-gop-y]");
		if (!coCot) await m.p.click("[data-nut-gop-y] button").catch(() => {});
		await m.p
			.waitForSelector("[data-cot-gop-y]", { visible: true, timeout: CHO })
			.catch(() => {});
		await chup(
			m,
			"hop-dien-thoai-dau",
			"390 px: đầu hộp Sửa mục tiêu",
			await doHop(m.p),
		);
		await m.p
			.$eval("[data-cot-gop-y]", (o) => o.scrollIntoView({ block: "start" }))
			.catch(() => {});
		await chup(
			m,
			"hop-dien-thoai-cot",
			"390 px: cột góp ý xếp dưới form, thẻ trải hết bề ngang",
			await doHop(m.p),
		);
		await m.ctx.close();
	}

	const v = await trang(1440, 900);
	await v.p.goto(
		`${APP}/${SLUG}/okr/theo-don-vi?kyOkr=${P.chuKy}&donOkr=pb:${P.phong}&record=objective:${MT}&tab=vet`,
		{ waitUntil: "networkidle2" },
	);
	await v.p
		.waitForFunction(
			() => document.body.innerText.includes("theo đề xuất của Trợ lý OKR"),
			{ timeout: CHO },
		)
		.catch(() => {});
	await chup(
		v,
		"tab-vet",
		"Tab Vết của Mục tiêu có dòng «theo đề xuất của Trợ lý OKR»",
	);
	await v.ctx.close();

	if (P.lienHe) {
		for (const [rong, cao, dpr] of [
			[1440, 900, 1],
			[390, 844, 2],
		]) {
			const c = await trang(rong, cao, dpr);
			await c.p.goto(`${APP}/${SLUG}/contacts?record=contact:${P.lienHe}`, {
				waitUntil: "networkidle2",
			});
			await c.p
				.waitForSelector('[data-slot="proposed-change"][data-kind="compact"]', {
					visible: true,
					timeout: CHO,
				})
				.catch(() => {});
			const coThe = await c.p.$(
				'[data-slot="proposed-change"][data-kind="compact"]',
			);
			if (coThe)
				await coThe.evaluate((o) => o.scrollIntoView({ block: "center" }));
			await chup(
				c,
				"thong-tin-ca-nhan",
				"Tab Tổng quan của Cá nhân: gợi ý chức danh dùng thẻ gọn, «Nhận» tô màu, «Bác» mờ",
				{
					coThe: Boolean(coThe),
					nut: coThe
						? await coThe.evaluate((o) =>
								[...o.querySelectorAll("button")].map(
									(b) =>
										`${b.textContent.trim()}(${b.getAttribute("data-variant")})`,
								),
							)
						: [],
				},
			);
			if (rong === 1440 && coThe) {
				await chup(
					c,
					"the-thong-tin",
					"Cận cảnh thẻ thông tin",
					{},
					'[data-slot="proposed-change"][data-kind="compact"]',
				);
				await bamChu(
					c.p,
					'[data-slot="proposed-change"][data-kind="compact"]',
					"Nhận",
				);
				await tre(1200);
				await chup(
					c,
					"da-nhan-thong-tin",
					"Sau «Nhận»: thông tin ghi vào hồ sơ, toast «Đã thêm vào hồ sơ»",
				);
			}
			await c.ctx.close();
		}
	}
} catch (loi) {
	ghiChu("loi", String(loi?.stack ?? loi).slice(0, 800));
} finally {
	writeFileSync(join(THU_MUC, "buoc.json"), JSON.stringify(buoc, null, 1));
	await trinhDuyet.close();
}
