import { choBanNhap, datCss, lanToiCuoi, so } from "./do-khung.mjs";
import {
	anh,
	CHON,
	chungTrang,
	dungYen,
	ghi,
	KHUNG,
	khongDo,
	kiem,
	MAN,
	mo,
	moCuocMoi,
	moTrang,
	nop1,
	saiThem,
	trang,
} from "./man-chung.mjs";

const LE_PX = 1;
const DAY_PX = 24;
const BAO_TRON = 0.9;

const DOT_BIEN = {
	"khung-long": {
		css: '[data-o="hoi-thoai"]{border:1px solid currentColor!important;border-radius:8px!important}',
		moTa: "boc cot Kara trong KaraArtifact co vien",
	},
	"dau-lech": {
		css: '[data-o="ban-nhap"] [data-slot="kara-dock-header"]{height:88px!important}',
		moTa: "dong dau ban nhap cao gap doi",
	},
};

async function doO(p) {
	return p.evaluate(
		(khung, chonHoi, chonNhap, baoTron) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const hoi = k?.querySelector(chonHoi);
			const nhap = k?.querySelector(chonNhap);
			const cacO = [hoi, nhap].filter((o) => o?.checkVisibility());
			const ten = (x) => `${x.tagName.toLowerCase()}[${x.getAttribute("data-slot") ?? x.getAttribute("data-o") ?? ""}]`;
			const vienBon = (o) =>
				[o, ...o.querySelectorAll("*")]
					.filter((x) => x.checkVisibility())
					.filter((x) => {
						const c = getComputedStyle(x);
						const vien = ["Top", "Right", "Bottom", "Left"].every((b) => Number.parseFloat(c[`border${b}Width`]) >= 1);
						return vien && Number.parseFloat(c.borderTopLeftRadius) > 0 && x.getBoundingClientRect().width >= baoTron * o.getBoundingClientRect().width;
					});
			const boO = (o, x) =>
				x === o || [...o.querySelectorAll('[data-slot="kara-dock-header"],[data-slot="kara-dock-body"]')].some((d) => x.contains(d));
			const nguyenVan = cacO.flatMap((o) => vienBon(o).map(ten));
			const long = cacO.flatMap((o) => vienBon(o).filter((x) => boO(o, x)).map(ten));
			const dau = (o) => {
				const d = o?.querySelector('[data-slot="kara-dock-header"]');
				const r = d?.getBoundingClientRect();
				return r ? { cao: r.height, tren: r.top } : null;
			};
			const oDuoi = (o) => o.getBoundingClientRect().bottom;
			const soan = hoi && [...hoi.querySelectorAll("textarea")].find((x) => x.checkVisibility());
			const hopSoan = soan?.closest('[data-slot="kara-composer"]') ?? soan?.closest('[data-slot="input-group"]') ?? soan;
			const nut = nhap && [...nhap.querySelectorAll('[data-nut="dua-vao"]')].find((x) => x.checkVisibility());
			const dayNhap = nut?.closest('[data-slot="kara-dock-footer"]');
			return {
				long,
				nguyenVan,
				keHoi: hoi ? Number.parseFloat(getComputedStyle(hoi).borderLeftWidth) : null,
				keNhap: nhap ? Number.parseFloat(getComputedStyle(nhap).borderRightWidth) : null,
				dauHoi: dau(hoi),
				dauNhap: dau(nhap),
				oSoan: soan ? { textarea: soan.getBoundingClientRect().bottom, duoi: hopSoan.getBoundingClientRect().bottom, ten: ten(hopSoan), oDuoi: oDuoi(hoi) } : null,
				duaVao: nut ? { nut: nut.getBoundingClientRect().bottom, duoi: dayNhap ? dayNhap.getBoundingClientRect().bottom : -1, trongDay: !!dayNhap, oDuoi: oDuoi(nhap) } : null,
				coNhap: !!nhap?.checkVisibility(),
			};
		},
		KHUNG,
		CHON.hoiThoai,
		CHON.banNhap,
		BAO_TRON,
	);
}

async function cuoiThan(p, chonO) {
	await lanToiCuoi(p, chonO);
	return p.evaluate(
		(khung, chonO) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const o = k?.querySelector(chonO);
			const than = o?.querySelector('[data-slot="kara-dock-body"]');
			if (!than) return null;
			const cuon = [than, ...than.querySelectorAll("*")].find(
				(x) => x.checkVisibility() && ["auto", "scroll"].includes(getComputedStyle(x).overflowY),
			);
			let x = cuon ?? than;
			for (let i = 0; i < 12; i += 1) {
				const con = [...x.children].filter((c) => c.checkVisibility() && c.getBoundingClientRect().height > 0);
				if (con.length === 0) break;
				x = con[con.length - 1];
			}
			const day = o.querySelector('[data-slot="kara-dock-footer"]');
			const nen = day ? day.getBoundingClientRect().top : o.getBoundingClientRect().bottom;
			return { cuoi: x.getBoundingClientRect().bottom, day: nen, ten: `${x.tagName.toLowerCase()}[${x.getAttribute("data-slot") ?? ""}]` };
		},
		KHUNG,
		chonO,
	);
}

function loiO(d, rong, than) {
	const loi = [];
	if (d.long.length > 0) loi.push(`khung long trong khung (${d.long.join(", ")})`);
	if (rong) {
		if (!d.coNhap) loi.push("khung rong khong co o ban nhap");
		if (!(d.keHoi >= 1) || d.keNhap !== 0) loi.push(`duong ke chia sai (hoi trai ${d.keHoi}, nhap phai ${d.keNhap})`);
		if (!d.dauHoi || !d.dauNhap || Math.abs(d.dauHoi.cao - d.dauNhap.cao) > LE_PX || Math.abs(d.dauHoi.tren - d.dauNhap.tren) > LE_PX)
			loi.push("dau o khong thang hang");
		if (!d.duaVao || !d.duaVao.trongDay || d.duaVao.duoi < d.duaVao.oDuoi - DAY_PX) loi.push("Dua vao khong o day ban nhap");
	}
	if (!d.oSoan || d.oSoan.duoi < d.oSoan.oDuoi - DAY_PX) loi.push("o soan khong o day cot Kara");
	for (const [ten, t] of Object.entries(than))
		if (!t || t.cuoi > t.day + LE_PX) loi.push(`${ten}: phan tu cuoi khong hien tron tren day o`);
	return loi;
}

async function motO(cuocId, khung, nen, doDo, sau) {
	const t = await trang(MAN.kho[1440], nen);
	try {
		if (DOT_BIEN[doDo]) await datCss(t.p, DOT_BIEN[doDo].css, DOT_BIEN[doDo].moTa);
		const moDuoc = khung === "hep" && nen === "light" ? await mo(t, cuocId) : await moTrang(t, cuocId);
		if (!moDuoc) await khongDo(`${khung}/${nen}: khong mo duoc cuoc`);
		if (khung === "rong") await choBanNhap(t.p);
		await dungYen(t.p);
		await chungTrang(t.p, `${khung}/${nen}`);
		const d = await doO(t.p);
		const than = { "than hoi thoai": await cuoiThan(t.p, CHON.hoiThoai) };
		if (khung === "rong") than["than ban nhap"] = await cuoiThan(t.p, CHON.banNhap);
		await anh(t, `E4-${khung}-${nen}`, doDo);
		const loi = loiO(d, khung === "rong", than);
		ghi(
			`   o ${khung}/${nen}: khung long ${d.long.length} · ke hoi trai ${d.keHoi} / nhap phai ${d.keNhap ?? "-"} · dau hoi ${so(d.dauHoi?.cao)}@${so(d.dauHoi?.tren)} nhap ${d.dauNhap ? `${so(d.dauNhap.cao)}@${so(d.dauNhap.tren)}` : "-"} · o soan ${d.oSoan?.ten} ${so(d.oSoan?.duoi)}/${so(d.oSoan?.oDuoi)} (textarea ${so(d.oSoan?.textarea)}) · Dua vao: day ban nhap ${d.duaVao ? `${so(d.duaVao.duoi)}/${so(d.duaVao.oDuoi)} (nut ${so(d.duaVao.nut)})` : "-"} · ${Object.entries(than).map(([k, v]) => `${k} cuoi ${so(v?.cuoi)} ≤ day ${so(v?.day)} (${v?.ten})`).join(" · ")}`,
		);
		ghi(`   o ${khung}/${nen} so do nguyen van: vien bon canh ≥90% be ngang o ${d.nguyenVan.length} (${d.nguyenVan.join(", ") || "-"}) · textarea day ${so(d.oSoan?.textarea)} / o ${so(d.oSoan?.oDuoi)} · nut Dua vao day ${d.duaVao ? so(d.duaVao.nut) : "-"} / o ${d.duaVao ? so(d.duaVao.oDuoi) : "-"}`);
		if (loi.length === 0) ghi(`   o ${khung}/${nen}: dat`);
		else saiThem(`   o ${khung}/${nen}: ${loi.join(" · ")}`);
		if (sau) await sau(t);
		return 1;
	} finally {
		await t.dong();
	}
}

export async function phanKhungLien({ doDo }) {
	const cuoc = await moCuocMoi();
	let soO = 0;
	soO += await motO(cuoc.id, "hep", "light", doDo);
	soO += await motO(cuoc.id, "hep", "dark", doDo, async (t) => {
		if (!(await nop1(t))) await khongDo("Kara khong nop ban nhap");
	});
	soO += await motO(cuoc.id, "rong", "light", doDo);
	soO += await motO(cuoc.id, "rong", "dark", doDo);
	ghi(`   so o: ${soO}`);
	kiem(`so o ${soO} == 4`, soO === 4);
}
