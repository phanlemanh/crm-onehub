const MAN = '[data-slot="page-shell"]';

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function nutMenu(page, thuTu) {
	const h = await page.evaluateHandle(
		(man, i) =>
			[...document.querySelectorAll(`${man} button`)].filter(
				(el) => el.getAttribute("aria-haspopup") === "menu",
			)[i] ?? null,
		MAN,
		thuTu,
	);
	return h.asElement();
}

async function dong(page) {
	await page.keyboard.press("Escape").catch(() => {});
	await cho(300);
	if ((await page.$$('[role="dialog"]')).length > 0) {
		await page.keyboard.press("Escape").catch(() => {});
		await page
			.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 0, {
				timeout: 5000,
			})
			.catch(() => {});
	}
	await cho(200);
}

function moMenu(thuTu) {
	return async (page) => {
		const el = await nutMenu(page, thuTu);
		if (!el) return false;
		await el.click().catch(() => {});
		await cho(500);
		return (await page.$$('[data-slot="dropdown-menu-content"]')).length > 0;
	};
}

function moFacet(thuTuMenu, viTri) {
	return async (page) => {
		if (!(await moMenu(thuTuMenu)(page))) return false;
		const con = await page.$$('[data-slot="dropdown-menu-sub-trigger"]');
		const sub = con[viTri];
		if (!sub) return false;
		await sub.hover().catch(() => {});
		await cho(600);
		return (await page.$$('[data-slot="dropdown-menu-sub-content"]')).length > 0;
	};
}

async function moHopThoai(page) {
	const nut = await page.$$(`${MAN} button`);
	for (const b of nut) {
		const co = await b.evaluate(
			(el) => el.getAttribute("aria-haspopup") === "dialog",
		);
		if (!co) continue;
		await b.click().catch(() => {});
		await cho(800);
		return (await page.$$('[role="dialog"]')).length > 0;
	}
	return false;
}

async function chonMotDong(page) {
	const o = await page.$$(
		'[data-slot="table-body"] [data-slot="table-row"] [role="checkbox"]',
	);
	if (o.length === 0) return false;
	await o[0].click().catch(() => {});
	await cho(600);
	return o[0]
		.evaluate((el) => el.getAttribute("data-state") === "checked")
		.catch(() => false);
}

async function boChon(page) {
	const o = await page.$$(
		'[data-slot="table-body"] [data-slot="table-row"] [role="checkbox"][data-state="checked"]',
	);
	for (const el of o) await el.click().catch(() => {});
	await cho(400);
	await dong(page);
}

function bm(ten, mo, dongRieng) {
	return { ten, mo, dong: dongRieng ?? dong };
}

const CHUNG = (thuTuLoc, soFacet, coViews) => [
	bm("menu Bộ lọc", moMenu(thuTuLoc)),
	...Array.from({ length: soFacet }, (_, i) =>
		bm(`menu con facet ${i + 1}`, moFacet(thuTuLoc, i)),
	),
	bm("menu Sắp xếp", moMenu(thuTuLoc + 1)),
	bm("menu Cột", moMenu(thuTuLoc + 2)),
	...(coViews ? [bm("menu Views", moMenu(thuTuLoc + 3))] : []),
	bm("thanh chọn dòng", chonMotDong, boChon),
	bm("hộp thoại tạo mới", moHopThoai),
];

export const BE_MAT = {
	companies: CHUNG(0, 4, true),
	contacts: CHUNG(0, 3, true),
	deals: [
		bm("menu tab thoả thuận", moMenu(0)),
		bm("menu giai đoạn trên một dòng", moMenu(4)),
		...CHUNG(1, 3, false),
	],
};

export const CHUA_MO = [
	'[data-slot="dropdown-menu-content"]',
	'[data-slot="dropdown-menu-sub-content"]',
	'[role="dialog"]',
];
