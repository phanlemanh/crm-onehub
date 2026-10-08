export const KHO = {
	1440: { rong: 1440, cao: 900 },
	390: { rong: 390, cao: 844 },
};
export const LAN = {
	nacPx: 400,
	soNac: 5,
	choNacMs: 120,
	soDongChen: 60,
	caoDongPx: 96,
};

export async function chenDong(p, chonKhung, so = LAN.soDongChen) {
	return p.evaluate(
		(chon, so, cao) => {
			const khung = [...document.querySelectorAll(chon)].find((x) =>
				x.checkVisibility(),
			);
			if (!khung) return { loi: `khong thay ${chon}` };
			const ds = [khung, ...khung.querySelectorAll("*")];
			const cuon = ds.find((e) =>
				/(auto|scroll)/.test(getComputedStyle(e).overflowY),
			);
			const noi = cuon?.firstElementChild ?? cuon ?? khung;
			for (let i = 0; i < so; i += 1) {
				const d = document.createElement("div");
				d.setAttribute("data-kcs-dong", String(i));
				d.style.minHeight = `${cao}px`;
				d.textContent = `dong chen ${i}`;
				noi.appendChild(d);
			}
			return {
				conLai: document.querySelectorAll("[data-kcs-dong]").length,
				shCuon: cuon?.scrollHeight ?? null,
				chCuon: cuon?.clientHeight ?? null,
				noi: `${noi.tagName.toLowerCase()}[data-slot=${noi.getAttribute("data-slot") ?? ""}]`,
				cuon: cuon
					? `${cuon.tagName.toLowerCase()}[data-slot=${cuon.getAttribute("data-slot") ?? ""}]`
					: null,
			};
		},
		chonKhung,
		so,
		LAN.caoDongPx,
	);
}

function chupCuon() {
	return [...(window.__kcs ?? [])]
		.map((e) => Math.round(e.scrollTop))
		.concat(Math.round(window.scrollY));
}

export async function doLan(p, chonKhung) {
	const khung = await p.evaluate((chon) => {
		const k = [...document.querySelectorAll(chon)].find((x) =>
			x.checkVisibility(),
		);
		if (!k) return null;
		const cuonDuoc = (e) => {
			const s = getComputedStyle(e);
			return (
				/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1
			);
		};
		const trong = [k, ...k.querySelectorAll("*")].filter(cuonDuoc);
		const tren = [];
		for (let e = k.parentElement; e; e = e.parentElement)
			if (cuonDuoc(e)) tren.push(e);
		window.__kcs = [...trong, ...tren];
		const r = k.getBoundingClientRect();
		const top = Math.max(r.top, 0);
		const bot = Math.min(r.bottom, window.innerHeight);
		const moTa = (e) => {
			const s = getComputedStyle(e);
			return `${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""} oy=${s.overflowY} ch=${e.clientHeight} sh=${e.scrollHeight}`;
		};
		const chuoi = [];
		for (let e = k; e && e !== document.documentElement; e = e.parentElement)
			chuoi.push(moTa(e));
		const tranNhat = Math.max(
			0,
			...[k, ...k.querySelectorAll("*")].map(
				(e) => e.scrollHeight - e.clientHeight,
			),
		);
		return {
			x: Math.round(r.left + r.width / 2),
			y: Math.round((top + bot) / 2),
			caoKhung: Math.round(r.height),
			hienCao: Math.round(Math.max(0, bot - top)),
			soCuonTrong: trong.length,
			soCuonTren: tren.length,
			tranNhat,
			chuoi,
		};
	}, chonKhung);
	if (!khung) return { loi: `khong thay khung ${chonKhung}` };
	await p.mouse.move(khung.x, khung.y);
	const dau = await p.evaluate(chupCuon);
	for (let i = 0; i < LAN.soNac; i += 1) {
		await p.mouse.wheel({ deltaY: -LAN.nacPx });
		await new Promise((r) => setTimeout(r, LAN.choNacMs));
	}
	const sauLen = await p.evaluate(chupCuon);
	for (let i = 0; i < LAN.soNac; i += 1) {
		await p.mouse.wheel({ deltaY: LAN.nacPx });
		await new Promise((r) => setTimeout(r, LAN.choNacMs));
	}
	const sauXuong = await p.evaluate(chupCuon);
	const khac = (a, b) => a.some((v, i) => v !== b[i]);
	return {
		...khung,
		dau,
		sauLen,
		sauXuong,
		lenDuoc: khac(dau, sauLen),
		xuongDuoc: khac(sauLen, sauXuong),
	};
}

export const KHO_CHAM = { rong: 390, cao: 844, cham: true };
export const VUOT = {
	quangPx: 320,
	soBuoc: 12,
	buocMs: 16,
	soLan: 3,
	choMs: 400,
};

export async function batCham(p) {
	await p.setViewport({
		width: KHO_CHAM.rong,
		height: KHO_CHAM.cao,
		deviceScaleFactor: 2,
		isMobile: true,
		hasTouch: true,
	});
}

async function vuot(cdp, x, tuY, denY) {
	await cdp.send("Input.dispatchTouchEvent", {
		type: "touchStart",
		touchPoints: [{ x, y: tuY }],
	});
	for (let i = 1; i <= VUOT.soBuoc; i += 1) {
		const y = tuY + ((denY - tuY) * i) / VUOT.soBuoc;
		await cdp.send("Input.dispatchTouchEvent", {
			type: "touchMove",
			touchPoints: [{ x, y }],
		});
		await new Promise((r) => setTimeout(r, VUOT.buocMs));
	}
	await cdp.send("Input.dispatchTouchEvent", {
		type: "touchEnd",
		touchPoints: [],
	});
	await new Promise((r) => setTimeout(r, VUOT.choMs));
}

export async function doVuot(p, chonKhung) {
	const khung = await p.evaluate((chon) => {
		const k = [...document.querySelectorAll(chon)].find((x) =>
			x.checkVisibility(),
		);
		if (!k) return null;
		const cuonDuoc = (e) => {
			const s = getComputedStyle(e);
			return (
				/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1
			);
		};
		const trong = [k, ...k.querySelectorAll("*")].filter(cuonDuoc);
		const tren = [];
		for (let e = k.parentElement; e; e = e.parentElement)
			if (cuonDuoc(e)) tren.push(e);
		window.__kcs = [...trong, ...tren];
		const r = k.getBoundingClientRect();
		const top = Math.max(r.top, 0);
		const bot = Math.min(r.bottom, window.innerHeight);
		const ngan = document.querySelector(
			"[data-slot=drawer-content],[data-slot=sheet-content]",
		);
		const x0 = Math.round(r.left + r.width / 2);
		const y0 = Math.round((top + bot) / 2);
		const chuoiCham = [];
		for (
			let e = document.elementFromPoint(x0, y0);
			e && e !== document.documentElement;
			e = e.parentElement
		) {
			const s = getComputedStyle(e);
			chuoiCham.push(
				`${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""}${e.hasAttribute("data-vaul-drawer") ? "[vaul]" : ""} ta=${s.touchAction} ob=${s.overscrollBehaviorY} oy=${s.overflowY} st=${Math.round(e.scrollTop)}`,
			);
		}
		return {
			chuoiCham,
			x: Math.round(r.left + r.width / 2),
			yGiua: Math.round((top + bot) / 2),
			hienCao: Math.round(Math.max(0, bot - top)),
			tranNhat: Math.max(
				0,
				...[k, ...k.querySelectorAll("*")].map(
					(e) => e.scrollHeight - e.clientHeight,
				),
			),
			nganTop: ngan ? Math.round(ngan.getBoundingClientRect().top) : null,
		};
	}, chonKhung);
	if (!khung) return { loi: `khong thay khung ${chonKhung}` };
	const cdp = await p.createCDPSession();
	const vung = await p.evaluate((chon) => {
		const k = [...document.querySelectorAll(chon)].find((x) =>
			x.checkVisibility(),
		);
		const v =
			k?.querySelector("[data-slot=message-scroller-viewport]") ??
			window.__kcs?.[0] ??
			k;
		const r = v.getBoundingClientRect();
		const x = Math.round(r.left + r.width / 2);
		const tren = Math.max(r.top, 0) + 8;
		const duoi = Math.min(r.bottom, window.innerHeight) - 8;
		const sach = [];
		for (let y = Math.ceil(tren); y <= duoi; y += 2) {
			const e = document.elementFromPoint(x, y);
			if (e && v.contains(e) && !e.closest("button,a,[role=button]"))
				sach.push(y);
		}
		return { x, sach };
	}, chonKhung);
	if (vung.sach.length < 2)
		return { ...khung, loi: "khong co diem cham sach trong vung cuon" };
	const yTren = vung.sach[0];
	let yDuoi = vung.sach[vung.sach.length - 1];
	for (let i = 1; i < vung.sach.length; i += 1) {
		if (vung.sach[i] - vung.sach[i - 1] > 2) {
			yDuoi = vung.sach[i - 1];
			break;
		}
	}
	khung.x = vung.x;
	khung.yGiua = Math.round((yTren + yDuoi) / 2);
	khung.daiSach = yDuoi - yTren;
	const nua = Math.min(VUOT.quangPx, yDuoi - yTren) / 2;
	if (process.env.KCS_NGHE === "1") {
		const LOAI = new Set([
			"touchstart",
			"touchmove",
			"touchend",
			"pointerdown",
			"pointermove",
			"wheel",
			"scroll",
		]);
		const nghe = [];
		const chuDong = [];
		const { result } = await cdp.send("Runtime.evaluate", {
			expression: `(() => { const ds = []; for (let e = document.elementFromPoint(${khung.x}, ${khung.yGiua}); e; e = e.parentElement) ds.push(e); ds.push(document, window); return ds; })()`,
		});
		const { result: dsProps } = await cdp.send("Runtime.getProperties", {
			objectId: result.objectId,
			ownProperties: true,
		});
		for (const pr of dsProps.filter((x) => /^\d+$/.test(x.name))) {
			const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
				objectId: pr.value.objectId,
			});
			const co = listeners.filter((l) => LOAI.has(l.type));
			if (co.length === 0) continue;
			for (const l of co)
				if (!l.passive && ["touchmove", "touchstart", "wheel"].includes(l.type))
					chuDong.push([l.scriptId, l.lineNumber, l.type]);
			nghe.push(
				`${pr.value.description.slice(0, 60)} :: ${co.map((l) => `${l.type}${l.passive ? "(p)" : ""}${l.useCapture ? "(c)" : ""}@${l.scriptId}:${l.lineNumber}`).join(" ")}`,
			);
		}
		khung.nghe = nghe;
		const kichBan = new Map();
		cdp.on("Debugger.scriptParsed", (e) => kichBan.set(e.scriptId, e.url));
		await cdp.send("Debugger.enable");
		await new Promise((r) => setTimeout(r, 300));
		khung.nguon = {};
		for (const [id, dong, loai] of chuDong) {
			try {
				const { scriptSource } = await cdp.send("Debugger.getScriptSource", {
					scriptId: id,
				});
				const ds = scriptSource.split("\n");
				khung.nguon[`${loai}@${id}:${dong}`] = {
					url: kichBan.get(id),
					doan: ds
						.slice(Math.max(0, dong - 40), dong + 6)
						.map((x) => x.slice(0, 170)),
				};
			} catch (loi) {
				khung.nguon[`${loai}@${id}:${dong}`] = {
					loi: String(loi.message ?? loi),
				};
			}
		}
		await cdp.send("Debugger.disable");
	}
	if (process.env.KCS_DAO === "1") {
		await p.evaluate(() => {
			const v = window.__kcs?.[0];
			if (v) v.scrollTop = Math.round((v.scrollHeight - v.clientHeight) / 2);
		});
		await new Promise((r) => setTimeout(r, VUOT.choMs));
		khung.rrs = await p.evaluate(
			(x, y) => {
				const dau = document.elementFromPoint(x, y);
				const cuoi =
					dau?.closest("[data-vaul-drawer],[role=dialog]") ?? document.body;
				const ds = [];
				let tong = 0;
				let tongTop = 0;
				for (
					let t = dau;
					t && (cuoi.contains(t) || cuoi === t);
					t = t.parentElement
				) {
					const s = getComputedStyle(t);
					const could =
						s.overflowY !== "hidden" &&
						!(
							s.overflowY === s.overflowX &&
							t.tagName !== "TEXTAREA" &&
							s.overflowY === "visible"
						);
					const vt = t.scrollTop;
					const es = t.scrollHeight - t.clientHeight - vt;
					const tinh = (vt || es) && could;
					if (tinh) {
						tong += es;
						tongTop += vt;
					}
					ds.push(
						`${t.tagName.toLowerCase()}${t.getAttribute("data-slot") ? `[${t.getAttribute("data-slot")}]` : ""} oy=${s.overflowY} ox=${s.overflowX} could=${could} pos=${vt} sh=${t.scrollHeight} ch=${t.clientHeight} es=${es}${tinh ? " TINH" : ""}`,
					);
				}
				return {
					cuoi: `${cuoi.tagName.toLowerCase()}[${cuoi.getAttribute("data-slot") ?? ""}]`,
					tongXuong: tong,
					tongLen: tongTop,
					ds,
				};
			},
			khung.x,
			khung.yGiua,
		);
		khung.diemDau = await p.evaluate(
			(x, yLen, yXuong) => {
				const ten = (e) =>
					e
						? `${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""} «${(e.textContent ?? "").trim().slice(0, 20)}» trongViewport=${Boolean(e.closest("[data-slot=message-scroller-viewport]"))}`
						: "khong co";
				return {
					vuotLenBatDau: ten(document.elementFromPoint(x, yLen)),
					vuotXuongBatDau: ten(document.elementFromPoint(x, yXuong)),
				};
			},
			khung.x,
			khung.yGiua + nua,
			khung.yGiua - nua,
		);
		const g0 = await p.evaluate(chupCuon);
		for (let i = 0; i < VUOT.soLan; i += 1)
			await vuot(cdp, khung.x, khung.yGiua + nua, khung.yGiua - nua);
		const g1 = await p.evaluate(chupCuon);
		for (let i = 0; i < VUOT.soLan; i += 1)
			await vuot(cdp, khung.x, khung.yGiua - nua, khung.yGiua + nua);
		const g2 = await p.evaluate(chupCuon);
		const khac2 = (a, b) => a.some((v, i) => v !== b[i]);
		return {
			...khung,
			cham: true,
			dao: true,
			dau: g0,
			sauXuong: g1,
			sauLen: g2,
			xuongDuoc: khac2(g0, g1),
			lenDuoc: khac2(g1, g2),
		};
	}
	const dau = await p.evaluate(chupCuon);
	for (let i = 0; i < VUOT.soLan; i += 1)
		await vuot(cdp, khung.x, khung.yGiua - nua, khung.yGiua + nua);
	const sauLen = await p.evaluate(chupCuon);
	const nganSauLen = await p.evaluate(() => {
		const n = document.querySelector(
			"[data-slot=drawer-content],[data-slot=sheet-content]",
		);
		return n ? Math.round(n.getBoundingClientRect().top) : null;
	});
	for (let i = 0; i < VUOT.soLan; i += 1)
		await vuot(cdp, khung.x, khung.yGiua + nua, khung.yGiua - nua);
	const sauXuong = await p.evaluate(chupCuon);
	const khac = (a, b) => a.some((v, i) => v !== b[i]);
	return {
		...khung,
		cham: true,
		dau,
		sauLen,
		sauXuong,
		nganSauLen,
		lenDuoc: khac(dau, sauLen),
		xuongDuoc: khac(sauLen, sauXuong),
	};
}
