export const MAN = '[data-slot="page-shell"]';

export const PHAM_VI = [
	'[data-slot="page-shell"]',
	'[data-slot="sheet-content"]',
	"[data-sonner-toast]",
];

export const MA_TRANG_THAI = [
	{
		ma: "ST-danh-sach-loading",
		donVi: true,
		cach: "do o muc don vi — E25",
		vi_sao:
			"trang /campaigns nap truoc campaigns.list o may chu (HydrateClient), nen co dang-tai khong bao gio bat o luot dau",
	},
	{
		ma: "ST-danh-sach-empty",
		donVi: true,
		cach: "do o muc don vi — E25",
		vi_sao:
			"rong toan cuc: chi ton tai truoc chien dich dau tien cua noi lam viec duy nhat",
	},
	{
		ma: "ST-tao-khong-goc-nhin",
		donVi: true,
		cach: "do o muc don vi — E25",
		vi_sao:
			"rong toan cuc: chi ton tai truoc goc nhin ca nhan dung chung dau tien",
	},
	{
		ma: "ST-tao-dang-luu",
		cach: "chan tra loi cham tren campaigns.create roi bam nut tao trong hop tao",
	},
	{
		ma: "ST-chien-dich-nhap",
		cach: "mo trang chien dich vua tao, chua bam Bat dau",
	},
	{
		ma: "ST-chien-dich-dang-chay",
		cach: "bam Bat dau roi doc lai trang chien dich",
	},
	{
		ma: "ST-chien-dich-ket-thuc",
		cach: "bam Ket thuc roi tai lai trang chien dich",
	},
	{
		ma: "ST-thanh-vien-rong",
		cach: "chien dich tren goc nhin loc mot gia tri khong ai co",
	},
	{
		ma: "ST-thanh-vien-chua-so",
		cach: "mot ca nhan cua luot chay khong co so dien thoai",
	},
	{
		ma: "ST-ghi-ket-qua-dang-luu",
		cach: "chan tra loi cham tren campaigns.touch roi bam mot nut ket qua",
	},
	{
		ma: "ST-ghi-ket-qua-loi",
		cach: "ket thuc chien dich qua API giua chung roi bam mot nut ket qua",
	},
	{
		ma: "ST-so-do-chua-goi",
		cach: "doc dai so do cua chien dich chua co luot goi nao",
	},
];

export const COT_THANH_VIEN = [
	{ id: "name", khoa: "memberColumns.name", an: null },
	{ id: "phone", khoa: "memberColumns.phone", an: null },
	{ id: "tier", khoa: "memberColumns.tier", an: "md" },
	{ id: "listingsNew30d", khoa: "memberColumns.listingsNew30d", an: "lg" },
	{ id: "districts", khoa: "memberColumns.districts", an: "lg" },
	{ id: "lastOutcome", khoa: "memberColumns.lastOutcome", an: null },
	{ id: "record", khoa: "memberColumns.record", an: null },
];

export const KHOA_KET_QUA = [
	"outcome.noAnswer",
	"outcome.answered",
	"outcome.meeting",
	"outcome.declined",
	"outcome.wrongNumber",
];

export const DOC_CHU = (roots) => {
	const scopes = roots.flatMap((sel) => [...document.querySelectorAll(sel)]);
	if (scopes.length === 0) return null;
	const nhinThay = (el) => {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return false;
		const s = getComputedStyle(el);
		return (
			s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"
		);
	};
	const out = [];
	const them = (raw) => {
		if (raw === null || raw === undefined) return;
		for (const piece of String(raw).split(/\n+/)) {
			const t = piece.replace(/\s+/g, " ").trim();
			if (t !== "") out.push(t);
		}
	};
	for (const scope of scopes) {
		const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			const el = n.parentElement;
			if (!el) continue;
			if (el.closest('script,style,noscript,template,[translate="no"]')) continue;
			if (!nhinThay(el)) continue;
			them(n.nodeValue);
		}
		for (const el of scope.querySelectorAll("*")) {
			if (!nhinThay(el)) continue;
			if (el.closest('[translate="no"]')) continue;
			for (const attr of ["placeholder", "title", "aria-label", "alt"]) {
				them(el.getAttribute(attr));
			}
		}
	}
	return out;
};

export const DOC_KHONG_DICH = (giaTri) => {
	const thieu = [];
	for (const value of giaTri) {
		const found = [];
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			const el = n.parentElement;
			if (!el) continue;
			if (el.closest("script,style,noscript,template")) continue;
			if (!(n.nodeValue ?? "").includes(value)) continue;
			const r = el.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) continue;
			found.push(Boolean(el.closest('[translate="no"]')));
		}
		if (found.length === 0) continue;
		if (found.some((ok) => !ok)) thieu.push(value);
	}
	return thieu;
};

export const DOC_TOAST = () =>
	[...document.querySelectorAll("[data-sonner-toast]")].map((t) => {
		const lay = (sel) => {
			const el = t.querySelector(sel);
			return el === null ? "" : el.textContent.replace(/\s+/g, " ").trim();
		};
		return {
			tieuDe: lay("[data-title]"),
			than: lay("[data-description]"),
			toanBo: t.textContent.replace(/\s+/g, " ").trim(),
		};
	});

export const DOC_TIEU_DE = () =>
	[...document.querySelectorAll('[data-slot="table-head"]')]
		.filter((th) => th.getBoundingClientRect().width > 0)
		.filter((th) => th.textContent.trim() !== "")
		.map((th) => {
			const holder = th.querySelector("span,button,div") ?? th;
			const text = th.textContent.replace(/\s+/g, " ").trim();
			const probe = document.createElement("span");
			probe.style.cssText =
				"position:absolute;left:-9999px;white-space:nowrap;visibility:hidden";
			const cs = getComputedStyle(holder);
			probe.style.font = cs.font;
			probe.style.letterSpacing = cs.letterSpacing;
			probe.textContent = text;
			document.body.appendChild(probe);
			const textWidth = probe.getBoundingClientRect().width;
			probe.remove();
			const tran = (e) =>
				e.scrollWidth > e.clientWidth + 0.5 ||
				e.scrollHeight > e.clientHeight + 0.5;
			const nhan = th.querySelector('[data-slot="table-head-label"]') ?? holder;
			const cut = [nhan, ...th.querySelectorAll("*")].find((e) => {
				const s = getComputedStyle(e);
				return (
					(s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none") &&
					tran(e)
				);
			});
			const box = holder.getBoundingClientRect().width;
			const ten =
				th.getAttribute("title") ??
				th.querySelector("[title]")?.getAttribute("title") ??
				null;
			return {
				text,
				boxWidth: Number(box.toFixed(2)),
				textWidth: Number(textWidth.toFixed(2)),
				bicat: tran(nhan),
				coBaCham: Boolean(cut),
				title: ten,
			};
		});

export const BANG_THANH_VIEN = (nhanCot) => {
	const bang = [...document.querySelectorAll('[data-slot="table"]')];
	const khop = bang.filter((t) =>
		[...t.querySelectorAll('[data-slot="table-head"]')].some(
			(h) => (h.textContent ?? "").replace(/\s+/g, " ").trim() === nhanCot,
		),
	);
	return {
		tong: bang.length,
		khop: khop.length,
		dong: khop[0]
			? khop[0].querySelectorAll(
					'[data-slot="table-body"] [data-slot="table-row"]',
				).length
			: -1,
	};
};

export const DOC_NUT_KET_QUA = (nhan) => {
	const tap = new Set(nhan);
	const rows = [
		...document.querySelectorAll(
			'[data-slot="table-body"] [data-slot="table-row"]',
		),
	];
	const dem = rows.map(
		(r) =>
			[...r.querySelectorAll("button")].filter((b) =>
				tap.has((b.textContent ?? "").replace(/\s+/g, " ").trim()),
			).length,
	);
	return {
		dong: rows.length,
		tren1: dem[0] ?? 0,
		tong: dem.reduce((a, b) => a + b, 0),
	};
};

export const DOC_SO_DO = () =>
	[...document.querySelectorAll('[data-slot="stat-group"]')].map((g) =>
		[...g.querySelectorAll('[data-slot="stat-card"]')].map((c) => {
			const nhan = c.querySelector(":scope > span");
			const so = c.querySelector(":scope > div > span");
			const mo = c.querySelector(":scope > p");
			return {
				nhan: (nhan?.textContent ?? "").replace(/\s+/g, " ").trim(),
				so: (so?.textContent ?? "").replace(/\s+/g, " ").trim(),
				mo: (mo?.textContent ?? "").replace(/\s+/g, " ").trim(),
			};
		}),
	);

export const DOC_DAU_TRANG = () => {
	const hd = document.querySelector('[data-slot="page-shell-actions"]');
	const nut = hd
		? [...hd.querySelectorAll("button")].map((b) =>
				(b.textContent ?? "").replace(/\s+/g, " ").trim(),
			)
		: [];
	const huy = hd
		? [...hd.querySelectorAll('[data-slot="badge"]')].map((b) =>
				(b.textContent ?? "").replace(/\s+/g, " ").trim(),
			)
		: [];
	const mo = document.querySelector('[data-slot="page-shell-description"]');
	return {
		nut,
		huyHieu: huy,
		mo: (mo?.textContent ?? "").replace(/\s+/g, " ").trim(),
	};
};

export const DEM_GOI = (nhan) =>
	[...document.querySelectorAll('[role="img"]')].filter(
		(el) => el.getAttribute("aria-label") === nhan,
	).length;

export const DOC_MUC_MOI = () => {
	const li = document.querySelectorAll('[role="dialog"] li, [data-slot="sheet-content"] li');
	const gom = [...li]
		.filter((el) => el.querySelector('[role="img"]'))
		.map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim());
	return gom;
};

export const DOC_O_TRONG = (chuoi) =>
	[
		...document.querySelectorAll(
			'[data-slot="table-body"] [data-slot="table-row"]',
		),
	].some((r) => (r.textContent ?? "").includes(chuoi));
