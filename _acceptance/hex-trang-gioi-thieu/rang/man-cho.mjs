export const CHO = [
	{
		so: 1,
		ten: "nhan BUILT WITH",
		thuocTinh: "color",
		tenToken: "muted-foreground",
	},
	{
		so: 2,
		ten: "nhan SUGGESTED",
		thuocTinh: "color",
		tenToken: "muted-foreground",
	},
	{ so: 3, ten: "nen o hoi", thuocTinh: "background-color", tenToken: "muted" },
	{
		so: 4,
		ten: "chu goi y trong o hoi",
		thuocTinh: "color",
		tenToken: "muted-foreground",
	},
	{
		so: 5,
		ten: "nhan mono WHY",
		thuocTinh: "color",
		tenToken: "muted-foreground",
	},
	{
		so: 6,
		ten: "cham viec chua toi",
		thuocTinh: "background-color",
		tenToken: "border",
	},
	{ so: 7, ten: "han viec", thuocTinh: "color", tenToken: "muted-foreground" },
	{
		so: 8,
		ten: "vong nen cua vong quay",
		thuocTinh: "stroke",
		tenToken: "border",
	},
	{ so: 9, ten: "ngoi sao GitHub", thuocTinh: "color", tenToken: "warning" },
	{
		so: 10,
		ten: "vien khung soan",
		thuocTinh: "border-top-color",
		tenToken: "border",
	},
	{
		so: 11,
		ten: "lenh /Create agent",
		thuocTinh: "color",
		tenToken: "code-string",
	},
];

export const CHU = [1, 2, 4, 5, 7, 11];

export function docCho(cho) {
	const vungToi = document.querySelector(".dark");
	const butChuan = document.createElement("canvas").getContext("2d", {
		willReadFrequently: true,
	});
	const chuan = (mau) => {
		butChuan.clearRect(0, 0, 1, 1);
		butChuan.fillStyle = "rgba(0,0,0,0)";
		butChuan.fillStyle = mau;
		butChuan.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = butChuan.getImageData(0, 0, 1, 1).data;
		return {
			r,
			g,
			b,
			a: a / 255,
			chu: `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`,
		};
	};
	const mauToken = (ten, thuocTinh) => {
		const tham = document.createElement("span");
		tham.style.setProperty(
			thuocTinh === "stroke" ? "color" : thuocTinh,
			`var(--${ten})`,
		);
		if (thuocTinh === "border-top-color") tham.style.borderTopStyle = "solid";
		vungToi.appendChild(tham);
		const gia = getComputedStyle(tham).getPropertyValue(
			thuocTinh === "stroke" ? "color" : thuocTinh,
		);
		tham.remove();
		return chuan(gia).chu;
	};
	const theoChu = (the, chu) =>
		[...document.querySelectorAll(the)].find(
			(e) => e.textContent.trim() === chu,
		) ?? null;
	const o = () => {
		const nhan = theoChu("p", "SUGGESTED");
		return (
			nhan?.closest("div")?.parentElement?.querySelector("div.h-11 > span") ??
			null
		);
	};
	const tim = {
		1: () => theoChu("p", "BUILT WITH"),
		2: () => theoChu("p", "SUGGESTED"),
		3: () => o()?.parentElement ?? null,
		4: () => o(),
		5: () => theoChu("p", "WHY"),
		6: () => {
			const ds = document
				.querySelector("li > span.animate-pulse")
				?.closest("ul");
			for (const dong of ds?.querySelectorAll("li") ?? []) {
				const cham = dong.querySelector("span");
				if (cham && !cham.className.includes("animate-pulse")) return cham;
			}
			return null;
		},
		7: () =>
			document
				.querySelector("li > span.animate-pulse")
				?.closest("ul")
				?.querySelector("li span:last-child") ?? null,
		8: () => document.querySelector("svg.animate-spin circle"),
		9: () =>
			[...document.querySelectorAll("a")]
				.find((a) => a.textContent.includes("Star on GitHub"))
				?.querySelector('[data-icon="inline-end"] svg') ?? null,
		10: () =>
			theoChu("span", "/Create agent")?.closest("p")?.parentElement ?? null,
		11: () => theoChu("span", "/Create agent"),
	};
	const nenThat = (e) => {
		const lop = [];
		for (let x = e; x; x = x.parentElement) {
			const m = chuan(getComputedStyle(x).backgroundColor);
			if (m.a > 0) lop.push(m);
			if (m.a >= 1) break;
		}
		let nen = { r: 0, g: 0, b: 0 };
		for (const m of lop.reverse())
			nen = {
				r: m.r * m.a + nen.r * (1 - m.a),
				g: m.g * m.a + nen.g * (1 - m.a),
				b: m.b * m.a + nen.b * (1 - m.a),
			};
		return nen;
	};
	const doSang = ({ r, g, b }) => {
		const k = (v) => {
			const c = v / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
	};
	const tron = (tren, duoi) => ({
		r: tren.r * tren.a + duoi.r * (1 - tren.a),
		g: tren.g * tren.a + duoi.g * (1 - tren.a),
		b: tren.b * tren.a + duoi.b * (1 - tren.a),
	});
	if (!vungToi) return cho.map((c) => ({ ...c, loi: "khong thay vung .dark" }));
	return cho.map((c) => {
		const e = tim[c.so]?.();
		if (!e) return { ...c, loi: `khong thay ${c.ten}` };
		const that = chuan(getComputedStyle(e).getPropertyValue(c.thuocTinh));
		const nen = nenThat(e.parentElement ?? e);
		const s1 = doSang(tron(that, nen));
		const s2 = doSang(nen);
		const k = e.getBoundingClientRect();
		return {
			...c,
			hop: { x: k.x + scrollX, y: k.y + scrollY, w: k.width, h: k.height },
			that: that.chu,
			token: mauToken(c.tenToken, c.thuocTinh),
			tuongPhan: (Math.max(s1, s2) + 0.05) / (Math.min(s1, s2) + 0.05),
		};
	});
}

export function docNhapGoiY(luc) {
	const butChuan = document.createElement("canvas").getContext("2d", {
		willReadFrequently: true,
	});
	const chuan = (mau) => {
		butChuan.clearRect(0, 0, 1, 1);
		butChuan.fillStyle = "rgba(0,0,0,0)";
		butChuan.fillStyle = mau;
		butChuan.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = butChuan.getImageData(0, 0, 1, 1).data;
		return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
	};
	const vungToi = document.querySelector(".dark");
	const token = (ten) => {
		const tham = document.createElement("span");
		tham.style.color = `var(--${ten})`;
		vungToi.appendChild(tham);
		const gia = getComputedStyle(tham).color;
		tham.remove();
		return chuan(gia);
	};
	const nhan = [...document.querySelectorAll("p")].find(
		(p) => p.textContent.trim() === "SUGGESTED",
	);
	const nut = nhan?.parentElement?.querySelector("button") ?? null;
	const o =
		nhan?.closest("div")?.parentElement?.querySelector("div.h-11 span") ?? null;
	if (!vungToi || !nut || !o)
		return { loi: ` [${luc}: khong thay ${!nut ? "nut goi y" : "o hoi"}]` };
	return {
		chu: o.textContent.trim(),
		mau: chuan(getComputedStyle(o).color),
		muted: token("muted-foreground"),
		foreground: token("foreground"),
		cauBam: nut.textContent.trim(),
	};
}

export const DOI_THU = [
	["text-[#6E6E6E]", "text-muted-foreground"],
	["text-[#5A5A5A]", "text-muted-foreground"],
	["bg-[#1A1A1A]", "bg-muted"],
	["bg-[#3A3A3A]", "bg-border"],
	["text-[#E3B341]", "text-warning"],
	["border-[#3D3D3D]", "border-border"],
	["text-[#00805E]", "text-code-string"],
];

export function apDoiThu(doi) {
	let n = 0;
	for (const e of document.querySelectorAll("[class]")) {
		let lop = e.getAttribute("class");
		for (const [cu, moi] of doi)
			if (lop.includes(cu)) {
				lop = lop.replaceAll(cu, moi);
				n += 1;
			}
		e.setAttribute("class", lop);
	}
	for (const e of document.querySelectorAll('[stroke="#4A4A4A"]')) {
		e.setAttribute("stroke", "var(--border)");
		n += 1;
	}
	return n;
}

export async function soAnh(a, b, mat) {
	const nap = (u) =>
		new Promise((ok, hong) => {
			const h = new Image();
			h.onload = () => ok(h);
			h.onerror = hong;
			h.src = u;
		});
	const [ha, hb] = await Promise.all([nap(a), nap(b)]);
	if (ha.width !== hb.width || ha.height !== hb.height)
		return {
			loi: `kich thuoc khac ${ha.width}x${ha.height} / ${hb.width}x${hb.height}`,
		};
	const doc = (h) => {
		const c = document.createElement("canvas");
		c.width = h.width;
		c.height = h.height;
		const x = c.getContext("2d");
		x.drawImage(h, 0, 0);
		return x.getImageData(0, 0, h.width, h.height).data;
	};
	const da = doc(ha);
	const db = doc(hb);
	const trongMat = (px, py) =>
		mat.some(
			(m) =>
				px >= m.x - 3 &&
				px <= m.x + m.w + 3 &&
				py >= m.y - 3 &&
				py <= m.y + m.h + 3,
		);
	let khac = 0;
	let dau = null;
	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -1;
	let y1 = -1;
	for (let py = 0; py < ha.height; py += 1)
		for (let px = 0; px < ha.width; px += 1) {
			const i = (py * ha.width + px) * 4;
			if (
				Math.abs(da[i] - db[i]) > 2 ||
				Math.abs(da[i + 1] - db[i + 1]) > 2 ||
				Math.abs(da[i + 2] - db[i + 2]) > 2
			) {
				if (trongMat(px, py)) continue;
				khac += 1;
				dau ??= `${px},${py}`;
				x0 = Math.min(x0, px);
				y0 = Math.min(y0, py);
				x1 = Math.max(x1, px);
				y1 = Math.max(y1, py);
			}
		}
	return { khac, dau, hop: khac ? `${x0},${y0}-${x1},${y1}` : "" };
}

export function matHex() {
	const hex =
		/(\[|^)#(6E6E6E|5A5A5A|1A1A1A|3A3A3A|4A4A4A|E3B341|3D3D3D|00805E)(\]|$)/i;
	const ra = [];
	for (const e of document.querySelectorAll("*")) {
		const lop = e.getAttribute("class") ?? "";
		const net = e.getAttribute("stroke") ?? "";
		if (!hex.test(lop) && !hex.test(net)) continue;
		const k = e.getBoundingClientRect();
		if (k.width === 0 && k.height === 0) continue;
		ra.push({ x: k.x + scrollX, y: k.y + scrollY, w: k.width, h: k.height });
	}
	return ra;
}
