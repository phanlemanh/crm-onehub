import { join } from "node:path";
import {
	APP,
	BD,
	CO_DO,
	chuanBi,
	chup,
	GOC,
	idMau,
	KY4,
	KYKE,
	ketThuc,
	kiem,
	moTrang,
	yen,
} from "./ban-do.mjs";

const { okrSoanMessages } = await import(join(GOC, "apps/app/lib/messages/okr-soan.ts"));
const ms = okrSoanMessages("vi");
const DO_VAI = process.argv.includes("--kiem-do-vai");
const BO_QUA_CONSOLE = [/Failed to load resource: the server responded with a status of 404/, /favicon/, /avatar/i];

const { cookie, slug } = await chuanBi();

function danhSachMan(v) {
	const pb = idMau("pb", v.pb);
	return [
		{ ma: "cua-toi", duong: `/${slug}/okr?kyOkr=${KY4}`, cho: "[data-trang-thai]" },
		{ ma: "theo-don-vi", duong: `/${slug}/okr/theo-don-vi?kyOkr=${KY4}&donOkr=pb:${pb}`, cho: "[data-hang-cong-cu-don-vi]" },
		{ ma: "khung", duong: `/${slug}/okr?kyOkr=${KY4}&record=objective:${idMau("mt", v.mt)}`, cho: "[data-okr-sheet] [role=tab], [data-khung-loi], [data-khung-khong-thay]" },
	];
}

let soO = 0;
const vaiDo = CO_DO ? { "quan-tri": BD.vai["quan-tri"] } : BD.vai;
for (const [vai, v] of Object.entries(DO_VAI ? {} : vaiDo))
	for (const man of danhSachMan(v).filter((m) => !CO_DO || m.ma === "khung"))
		for (const kho of CO_DO ? [BD.kho[375]] : [BD.kho[375], BD.kho[390], BD.kho[1440]])
			for (const theme of CO_DO ? ["sang"] : ["sang", "toi"]) {
				const { ctx, p, loiConsole } = await moTrang(cookie[vai], kho, { theme: theme === "toi" ? "toi" : "light" });
				await p.goto(`${APP}${man.duong}`, { waitUntil: "domcontentloaded" });
				const co = await p.waitForSelector(man.cho, { timeout: BD.cho.phanTu }).catch(() => null);
				await yen(p);
				if (CO_DO)
					await p.evaluate(() => {
						const k = document.documentElement;
						const r = document.createElement("div");
						r.style.width = "2000px";
						r.style.height = "4px";
						k.appendChild(r);
					});
				const tran = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
				const loi = loiConsole.filter((l) => !BO_QUA_CONSOLE.some((b) => b.test(l)));
				const dung = Boolean(co) && tran <= 0 && loi.length === 0;
				if (kiem(dung, `${tran > 0 ? "tran ngang" : co ? "loi console" : "khong mo duoc man"}: ${vai} ${man.ma} ${kho.ten} ${theme}${loi.length ? ` (${loi[0]})` : ""}`))
					console.log(`man ok ${vai} ${man.ma} ${kho.ten} ${theme}`);
				else await chup(p, `E15-loi-${vai}-${man.ma}-${kho.ten}-${theme}`);
				soO += 1;
				await ctx.close();
			}
if (!DO_VAI) {
	if (!CO_DO) kiem(soO === 72, `so o sai: ${soO} != 72`);
	console.log(`so o: ${soO}`);
}

if (!CO_DO)
	for (const [vai, v] of Object.entries(BD.vai)) {
		const { ctx, p } = await moTrang(cookie[vai], BD.kho[1440]);
		await p.goto(`${APP}/${slug}/okr/theo-don-vi?kyOkr=${KYKE}&donOkr=pb:${idMau("pb", v.pb)}`, { waitUntil: "domcontentloaded" });
		await p.waitForSelector("[data-hang-hanh-dong], [data-trang-thai]", { timeout: BD.cho.phanTu }).catch(() => null);
		await yen(p);
		if (DO_VAI && vai === "truong-phong")
			await p.evaluate(() => {
				const h = document.querySelector("[data-hang-hanh-dong]");
				if (!h) return;
				const s = document.createElement("span");
				s.setAttribute("data-nhom-soan", "");
				s.innerHTML = "<button disabled>x</button>";
				h.appendChild(s);
			});
		const d = await p.evaluate((cau) => {
			const hien = (e) => e.getBoundingClientRect().height > 0;
			const hang = [...document.querySelectorAll("[data-hang-hanh-dong]")].find(hien);
			const nhom = hang?.querySelector("[data-nhom-soan]") ?? null;
			return {
				coHang: Boolean(hang),
				coNhom: Boolean(nhom),
				khoa: nhom?.querySelector("button")?.disabled ?? null,
				hinh: nhom ? (nhom.getAttribute("data-nut-soan") ?? nhom.querySelector("[data-nut-soan]")?.getAttribute("data-nut-soan") ?? null) : null,
				coCau: document.body.innerText.includes(cau),
			};
		}, ms.nut.chuaCauHinh);
		if (!kiem(d.coHang, `trang khong ve: ${vai}`)) {
			await ctx.close();
			continue;
		}
		// AC-14 loi-hua-moi: dieu-huong-khu-muc-tieu AC-5 — nguoi khong du quyen (pha lap ke hoach) thay nut soan KHOA kem ly do (nut-khong-quyen), khong thay nut bam duoc hay cau «chua cau hinh».
		const dung = vai === "quan-tri" ? d.coNhom && d.khoa === true : (!d.coNhom || (d.khoa === true && d.hinh === "nut-khong-quyen")) && !d.coCau;
		const thongDiep = vai === "quan-tri" ? `quan tri thieu nut khoa` : `nguoi thuong thay nut: ${vai}`;
		if (kiem(dung, thongDiep)) console.log(`vai soan ok ${vai}`);
		await chup(p, `E18-${vai}`);
		await ctx.close();
	}

await ketThuc();
