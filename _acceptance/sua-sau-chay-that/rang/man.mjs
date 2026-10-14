import { join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HO_SO = "sua-sau-chay-that";
const GOC = join(TEP_NAY, "..", "..", "..", "..");
process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { chay, chieuDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);

const CAY_DO = {
	nhan: "ban sao tai-lieu-cho.ts bo dieu kien loai",
	tenCay: "ssct-doc-cho-chieu-do",
	chiBuoc: "1",
	tep: "apps/app/lib/tai-lieu-cho.ts",
	cam: (s) =>
		s.replace('\t\t\t!r.cu &&\n\t\t\tr.loai === "NOI_DUNG",', "\t\t\t!r.cu,"),
	dauVet: "\t\t\t!r.cu,\n\t);",
	ghim: /buoc 1: dem ban cho sai/,
};

if (process.argv.includes("--chieu-do")) await chieuDo(TEP_NAY, CAY_DO);

const CHU = {
	coBanCho: (so) => `Có ${so} bản chờ duyệt`,
	xemBanCho: "Xem bản chờ duyệt",
	chiHttps: "Chỉ nhận liên kết https",
	saiLoai: "Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB.",
};

const NOI_DUNG = "## Mức hưởng\n\nĐối tác tầng 1 hưởng 2% doanh thu thuần.";
const MUC_LUC =
	"## Lương &amp; thưởng\n\nThưởng theo quý.\n\n## A &lt; B\n\nSo sánh hai mức.";
const BANG_HAI = "| Tầng | Tỉ lệ |\n| --- | --- |\n| Một | 1% |\n| Hai | 2% |";
const BANG_BA =
	"| Tầng | Tỉ lệ | Hạn |\n| --- | --- | --- |\n| Một | 1% | Quý |\n| Hai | 2% | Năm |";

const { moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
const d = await moDo();

async function cho(t) {
	await t
		.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
		.catch(() => null);
	await new Promise((r) => setTimeout(r, 800));
}

const chuTrong = (t, s) =>
	t.evaluate(
		(s) =>
			window
				.__tim(s)
				.map((e) => e.innerText.trim())
				.join(" | "),
		s,
	);

async function chay5() {
	const chu = await d.nguoiMoi("sc", "member", "Nguyễn Thu Hà");
	const a = await d.nguoiMoi("sa", "member", "Trần Minh Quân");
	const p = await d.taoTrangDangDung(chu, {
		ten: "Quy định hoa hồng đối tác",
		loai: "quy-dinh",
		noiDung: NOI_DUNG,
	});
	const sua = await d.lam(a.cookie, "taiLieu.propose", {
		slug: p,
		noiDung: `${NOI_DUNG}\n\nĐối tác tầng 2 hưởng 1% doanh thu thuần.`,
	});
	await d.lam(a.cookie, "taiLieu.deXuatLuuTru", {
		slug: p,
		lyDo: "Đã thay bằng quy định năm 2027.",
	});
	const m = await d.taoTrangDangDung(chu, {
		ten: "Chính sách lương thưởng",
		loai: "chinh-sach",
		noiDung: MUC_LUC,
	});
	const b = await d.taoTrangDangDung(chu, {
		ten: "Bảng hoa hồng theo tầng",
		loai: "quy-dinh",
		noiDung: BANG_HAI,
	});
	const themCot = await d.lam(a.cookie, "taiLieu.propose", {
		slug: b,
		noiDung: BANG_BA,
	});
	await d.batTrinhDuyet(chu.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/tai-lieu/${encodeURIComponent(p)}`,
			);
			await d.doi(t, () => window.__tim("[data-man-doc]").length > 0);
			const huyHieu = await chuTrong(t, "[data-co-ban-cho]");
			const href = await t.evaluate(
				(chu) => window.__theoChu("a", chu).map((a) => a.getAttribute("href")),
				CHU.xemBanCho,
			);
			await d.chup(t, "ssct-doc-cho-1440.png");
			await t.close();
			const dich = `/tai-lieu/de-xuat/${encodeURIComponent(sua.deXuatId)}`;
			const dung =
				huyHieu === CHU.coBanCho(1) &&
				href.length === 1 &&
				(href[0] ?? "").endsWith(dich);
			d.dat(
				1,
				dung,
				`dem ban cho sai: huy hieu «${huyHieu}», nut «${href}» != «${dich}»`,
			);
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/tai-lieu/${encodeURIComponent(m)}`,
			);
			await d.doi(t, () => window.__tim("[data-reader-toc] a").length > 0);
			const muc = await t.evaluate(() =>
				window.__tim("[data-reader-toc] a").map((a) => ({
					chu: a.innerText.trim(),
					neo: a.getAttribute("href"),
				})),
			);
			const tieuDe = await t.evaluate(() =>
				[...document.querySelectorAll("[data-man-doc] article h2")].map(
					(h) => ({
						chu: h.innerText.trim(),
						id: h.id,
					}),
				),
			);
			await d.bamChu(t, "[data-reader-toc] a", "A < B");
			const neo = await t.evaluate(() => window.location.hash);
			const toi = await t.evaluate((neo) => {
				const h = document.getElementById(decodeURIComponent(neo.slice(1)));
				return h ? h.innerText.trim() : null;
			}, neo);
			await d.chup(t, "ssct-muc-luc-1440.png");
			await t.close();
			const mong = ["Lương & thưởng", "A < B"];
			const dung =
				JSON.stringify(muc.map((x) => x.chu)) === JSON.stringify(mong) &&
				JSON.stringify(muc.map((x) => x.neo)) ===
					JSON.stringify(tieuDe.map((h) => `#${h.id}`)) &&
				toi === "A < B";
			d.dat(
				2,
				dung,
				`muc luc «${JSON.stringify(muc)}», tieu de «${JSON.stringify(tieuDe)}», bam toi «${toi}»`,
			);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/tai-lieu/de-xuat/${encodeURIComponent(themCot.deXuatId)}`,
			);
			await d.doi(t, () => window.__tim("[data-diff-trang] table").length > 0);
			const bang = await t.evaluate(() =>
				window.__tim("[data-diff-trang] table").map((b) => ({
					dau: [...b.querySelectorAll("thead th")].map((o) =>
						(o.querySelector("del, ins")?.textContent ?? o.textContent)
							.replace(/^(Bỏ|Thêm): /, "")
							.trim(),
					),
					bo: b.querySelectorAll("tbody del").length,
					them: b.querySelectorAll("tbody ins").length,
				})),
			);
			await d.chup(t, "ssct-bang-doi-cot-1440.png");
			await t.close();
			const dung =
				bang.length === 2 &&
				bang[0].dau.join(",") === "Tầng,Tỉ lệ" &&
				bang[1].dau.join(",") === "Tầng,Tỉ lệ,Hạn" &&
				bang[0].them === 0 &&
				bang[1].bo === 0;
			d.dat(3, dung, `bang doi cot «${JSON.stringify(bang)}»`);
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/tai-lieu/${encodeURIComponent(m)}/sua`,
			);
			await d.bamSel(t, '[data-nut="lienKet"]');
			await d.doi(
				t,
				() =>
					window.__tim('[data-radix-popper-content-wrapper] input[type="url"]')
						.length > 0,
			);
			const o = await t.$(
				'[data-radix-popper-content-wrapper] input[type="url"]',
			);
			await o.click({ clickCount: 3 });
			await o.type("http://a.vn");
			await t.keyboard.press("Enter");
			await new Promise((r) => setTimeout(r, 500));
			const loi = await chuTrong(t, "[data-loi-lien-ket]");
			const coLienKet = await t.evaluate(
				() =>
					document.querySelectorAll('[data-trinh-soan] [role="textbox"] a')
						.length,
			);
			await d.chup(t, "ssct-soan-http-1440.png");
			await t.close();
			d.dat(
				4,
				loi === CHU.chiHttps && coLienKet === 0,
				`loi «${loi}», lien ket trong o soan ${coLienKet}`,
			);
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const t = await d.moTrang(chu.cookie, RONG, "/tai-lieu");
			await d.doi(
				t,
				() =>
					document.querySelector("[data-tai-nguon]:not([disabled])") !== null,
			);
			await d.bamSel(t, "[data-tai-nguon]");
			await d.doi(
				t,
				() =>
					document.querySelector("[data-hop-tai-nguon] input[type='file']") !==
					null,
			);
			const o = await t.$("[data-hop-tai-nguon] input[type='file']");
			const tep = join(GOC, ".acceptance-runs", HO_SO, "ghi-chu.txt");
			const { mkdirSync, writeFileSync } = await import("node:fs");
			mkdirSync(join(GOC, ".acceptance-runs", HO_SO), { recursive: true });
			writeFileSync(tep, "ghi chú thường");
			await o.uploadFile(tep);
			await cho(t);
			const chuHop = await t.evaluate(
				() => document.querySelector("[data-hop-tai-nguon]")?.innerText ?? "",
			);
			await d.chup(t, "ssct-tai-sai-loai-1440.png");
			await t.close();
			d.dat(
				5,
				chuHop.includes(CHU.saiLoai),
				`hop tai khong neu loai nhan duoc: «${chuHop.slice(0, 200)}»`,
			);
		});
}

try {
	await chay5();
	await d.ket("man sua-sau-chay-that");
} catch (e) {
	await d.khongDoDuoc(e);
}
