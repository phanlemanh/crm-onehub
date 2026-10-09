import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { CHON, choThay, dungYen, ghi, KHUNG, MAN } from "./man-chung.mjs";

const LAN_PX = 400;

export async function datCss(p, css, moTa) {
	await p.evaluateOnNewDocument((css) => {
		const dat = () => {
			const s = document.createElement("style");
			s.setAttribute("data-dot-bien", "");
			s.textContent = css;
			document.documentElement.appendChild(s);
		};
		if (document.documentElement) dat();
		else document.addEventListener("DOMContentLoaded", dat);
	}, css);
	await p
		.evaluate((css) => {
			if (document.querySelector("style[data-dot-bien]")) return;
			const s = document.createElement("style");
			s.setAttribute("data-dot-bien", "");
			s.textContent = css;
			document.documentElement.appendChild(s);
		}, css)
		.catch(() => {});
	ghi(`   (dot bien: ${moTa})`);
}

export async function choBanNhap(p, ms = MAN.cho.luotMs) {
	const thay = await choThay(
		p,
		(khung, chon) =>
			[...document.querySelectorAll(`:is(${khung}) ${chon}`)].some((o) =>
				o.checkVisibility(),
			),
		"o ban nhap hien",
		ms,
		KHUNG,
		CHON.banNhap,
	);
	await dungYen(p);
	return thay;
}

export async function thanCua(p, chonO) {
	return p.evaluate(
		(khung, chonO) => {
			const k = [...document.querySelectorAll(khung)].find((x) =>
				x.checkVisibility(),
			);
			const o = k?.querySelector(chonO);
			const than = o?.querySelector('[data-slot="kara-dock-body"]');
			if (!than) return null;
			const cuon = [than, ...than.querySelectorAll("*")].find(
				(x) =>
					x.checkVisibility() &&
					["auto", "scroll"].includes(getComputedStyle(x).overflowY),
			);
			const goc = cuon ?? than;
			const r = goc.getBoundingClientRect();
			return {
				x: r.left + r.width / 2,
				y: r.top + Math.min(r.height / 2, 200),
				top: goc.scrollTop,
				tran: goc.scrollHeight - goc.clientHeight,
				coCuon: !!cuon,
				khung: k.scrollTop,
			};
		},
		KHUNG,
		chonO,
	);
}

export async function lanThan(p, chonO, dy = LAN_PX) {
	const dau = await thanCua(p, chonO);
	if (!dau) return null;
	await p.mouse.move(dau.x, dau.y);
	await p.mouse.wheel({ deltaY: dy });
	await tre(MAN.cho.yenMs);
	const sau = await thanCua(p, chonO);
	const cuaSo = await p.evaluate(() => window.scrollY);
	return {
		truoc: dau.top,
		sau: sau?.top ?? dau.top,
		tran: dau.tran,
		coCuon: dau.coCuon,
		khung: sau?.khung ?? dau.khung,
		cuaSo,
	};
}

export async function lanToiCuoi(p, chonO) {
	for (let i = 0; i < 20; i += 1) {
		const t = await thanCua(p, chonO);
		if (!t || t.top >= t.tran - 1) return t;
		await p.mouse.move(t.x, t.y);
		await p.mouse.wheel({ deltaY: 2000 });
		await tre(MAN.cho.nhipMs);
	}
	return thanCua(p, chonO);
}

export const so = (x) => (Number.isFinite(x) ? x.toFixed(1) : String(x));
