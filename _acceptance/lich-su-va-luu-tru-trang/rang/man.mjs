import { join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HO_SO = "lich-su-va-luu-tru-trang";
const GOC = join(TEP_NAY, "..", "..", "..", "..");
process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const i = process.argv.indexOf("--phan");
const PHAN = i > 0 ? process.argv[i + 1] : process.env.LSLT_PHAN;
const PHAN_CO = ["lich-su", "luu-tru", "da-luu-tru"];
if (!PHAN_CO.includes(PHAN ?? "")) {
	console.log(`KHONG DO DUOC: --phan phai la mot trong ${PHAN_CO.join(", ")}`);
	process.exit(2);
}
process.env.LSLT_PHAN = PHAN;

const { chay, chieuDo, HEP, moDo, ngayVN, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);

const TRANG_APP = "apps/app/app/(app)/[slug]/tai-lieu";
const CAY_DO = {
	"lich-su": {
		nhan: "ban sao man-doc.tsx an nut Lich su",
		tenCay: "lslt-lich-su-chieu-do",
		chiBuoc: "1",
		tep: `${TRANG_APP}/[trang]/man-doc.tsx`,
		cam: (s) =>
			s.replace('data-nut-lich-su=""', 'data-nut-lich-su="" hidden'),
		dauVet: 'data-nut-lich-su="" hidden',
		ghim: /buoc 1: khong thay nut Lịch sử/,
	},
	"luu-tru": {
		nhan: "ban sao luu-tru-trang.tsx bo dai da luu tru",
		tenCay: "lslt-luu-tru-chieu-do",
		chiBuoc: "4",
		tep: `${TRANG_APP}/[trang]/luu-tru-trang.tsx`,
		cam: (s) =>
			s.replace("if (!luuTru.daLuuTru) return null;", "return null;"),
		dauVet: "\treturn null;\n\treturn (",
		ghim: /buoc 4: khong thay dai da luu tru/,
	},
	"da-luu-tru": {
		nhan: "ban sao danh-sach-loc.ts bo tham so archived khoi URL",
		tenCay: "lslt-da-luu-tru-chieu-do",
		chiBuoc: "1",
		tep: `${TRANG_APP}/danh-sach-loc.ts`,
		cam: (s) =>
			s.replace(
				'if (loc.archived) q.set(SEARCH_PARAM.list.archived, "true");',
				"",
			),
		dauVet: "String(loc.page));\n\t\n",
		ghim: /buoc 1: mat bo loc Đã lưu trữ/,
	},
};

if (process.argv.includes("--chieu-do")) await chieuDo(TEP_NAY, CAY_DO[PHAN]);

const BAN = [
	"## Mức hưởng\n\nĐối tác tầng 1 hưởng 2% doanh thu thuần.\n\nĐối tác tầng 2 hưởng 1% doanh thu thuần.\n\n## Ngưỡng\n\nHợp đồng dưới 10 triệu đồng không phát sinh hoa hồng.",
	"## Mức hưởng\n\nĐối tác tầng 1 hưởng 2% doanh thu thuần.\n\nĐối tác tầng 2 hưởng 1,2% doanh thu thuần.\n\n## Ngưỡng\n\nHợp đồng dưới 20 triệu đồng không phát sinh hoa hồng.",
	"## Mức hưởng\n\nĐối tác tầng 1 hưởng 2% doanh thu thuần.\n\nĐối tác tầng 2 hưởng 1,2% doanh thu thuần.\n\nĐối tác tầng 3 hưởng 0,5% doanh thu thuần.\n\n## Ngưỡng và ngoại lệ\n\nNhân viên thử việc không nhận hoa hồng đối tác.",
];
const CAU_BAN_1 = "Hợp đồng dưới 10 triệu đồng không phát sinh hoa hồng.";
const LY_DO_LUU = "Đã thay bằng quy định hoa hồng năm 2027.";
const LY_DO_KHOI = "Đối tác cũ còn hợp đồng chạy tới hết năm.";

const d = await moDo();

const chuTrong = (t, s) =>
	t.evaluate(
		(s) =>
			window
				.__tim(s)
				.map((e) => e.innerText.trim())
				.join(" | "),
		s,
	);
const coHien = (t, s) => t.evaluate((s) => window.__tim(s).length > 0, s);

async function duyetBang(c, id) {
	const ct = await d.hoi(c.cookie, "taiLieu.proposal", { id });
	await d.lam(c.cookie, "taiLieu.approve", { id, diffHash: ct.diffHash });
}

async function deXuatTrang(c, thuTuc, slug, lyDo) {
	return (await d.lam(c.cookie, thuTuc, { slug, lyDo })).deXuatId;
}

async function phanLichSu() {
	const chu = await d.nguoiMoi("lc", "member", "Nguyễn Thu Hà");
	const a = await d.nguoiMoi("la", "member", "Trần Minh Quân");
	const b = await d.nguoiMoi("lb", "member", "Lê Hoàng Yến");
	const m = await d.nguoiMoi("lm", "member", "Phạm Văn Minh");
	const s = await d.taoTrangDangDung(chu, {
		ten: "Quy định hoa hồng đối tác theo tầng",
		loai: "quy-dinh",
		noiDung: BAN[0],
	});
	for (const [ai, noiDung] of [
		[a, BAN[1]],
		[b, BAN[2]],
	]) {
		const { deXuatId } = await d.lam(ai.cookie, "taiLieu.propose", {
			slug: s,
			noiDung,
		});
		await duyetBang(chu, deXuatId);
	}
	await d.batTrinhDuyet(m.cookie);
	const duongTrang = `/tai-lieu/${encodeURIComponent(s)}`;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(m.cookie, RONG, duongTrang);
			if (!(await coHien(t, "[data-nut-lich-su]"))) {
				await t.close();
				d.dat(1, false, "khong thay nut Lịch sử");
				return;
			}
			await d.bamSel(t, "[data-nut-lich-su]");
			await d.choDuong(t, `${duongTrang}/lich-su`);
			await d.doi(t, () => window.__tim("[data-bang-lich-su] tr[data-phien-ban]").length === 3);
			const dong = await t.evaluate(() =>
				window
					.__tim("[data-bang-lich-su] tr[data-phien-ban]")
					.map((r) => `${r.getAttribute("data-phien-ban")}:${r.innerText.includes("Đang dùng")}`),
			);
			await d.chup(t, "lslt-lich-su-1440.png");
			await t.close();
			const mong = ["3:true", "2:false", "1:false"];
			d.dat(1, dong.join(",") === mong.join(","), `bang «${dong}» != «${mong}»`);
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(m.cookie, RONG, `${duongTrang}/lich-su`);
			await d.bamSel(t, "[data-bang-lich-su] tr[data-phien-ban='1'] a");
			await d.choDuong(t, `${duongTrang}/lich-su/1`);
			await d.doi(t, () => document.querySelector("[data-diff-trang]"));
			const doi = await t.evaluate(() => ({
				ins: document.querySelectorAll("[data-diff-trang] ins").length,
				del: document.querySelectorAll("[data-diff-trang] del").length,
			}));
			await d.chup(t, "lslt-ban-cu-so-sanh-1440.png");
			await t.close();
			d.dat(2, doi.ins > 0 && doi.del > 0, `diff thieu cho to: ins ${doi.ins}, del ${doi.del}`);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(m.cookie, RONG, `${duongTrang}/lich-su/1`);
			await d.bamSel(t, "[data-kieu='toan-van']");
			await d.doi(t, () => !document.querySelector("[data-diff-trang]"));
			const chu = await chuTrong(t, "[data-ban-cu]");
			await d.chup(t, "lslt-ban-cu-toan-van-1440.png");
			await t.close();
			d.dat(3, chu.includes(CAU_BAN_1), "toan van khong co cau cua ban 1");
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(m.cookie, RONG, `${duongTrang}/lich-su/1`);
			await d.bamChu(t, "[data-nut-quay-lai]", "Quay lại phiên bản 1");
			await d.doi(t, () => /\/tai-lieu\/de-xuat\/[^/]+$/.test(window.location.pathname));
			await d.choDuong(t, "");
			await d.doi(t, () => window.__tim("[data-quay-lai]").length > 0);
			const nhan = await chuTrong(t, "[data-quay-lai]");
			await d.chup(t, "lslt-duyet-quay-lai-1440.png");
			await t.close();
			d.dat(4, nhan === "Quay lại phiên bản 1", `nhan «${nhan}»`);
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const t = await d.moTrang(m.cookie, HEP, `${duongTrang}/lich-su`);
			await d.doi(t, () => window.__tim("[data-the-lich-su] a[data-phien-ban]").length > 0);
			const bang = await coHien(t, "[data-bang-lich-su]");
			const tran = await d.cuonNgang(t);
			await d.chup(t, "lslt-lich-su-390.png");
			await t.close();
			d.dat(
				5,
				!bang && tran.length === 0,
				`o 390: ${bang ? "bang van hien" : ""} ${tran.join(", ")}`.trim(),
			);
		});
}

async function phanLuuTru() {
	const chu = await d.nguoiMoi("uc", "member", "Nguyễn Thu Hà");
	const m = await d.nguoiMoi("um", "member", "Phạm Văn Minh");
	const s = await d.taoTrangDangDung(chu, {
		ten: "Quy trình đối soát hoa hồng cũ",
		loai: "quy-trinh",
		noiDung: BAN[0],
	});
	await d.batTrinhDuyet(m.cookie);
	const duongTrang = `/tai-lieu/${encodeURIComponent(s)}`;
	const choCua = async (loai) =>
		(await d.hoi(chu.cookie, "taiLieu.proposals", { nhom: "cho", slug: s })).rows.find(
			(r) => r.loai === loai,
		)?.id ?? null;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(m.cookie, RONG, duongTrang);
			await d.bamSel(t, "[data-menu-trang]");
			await d.bamSel(t, "[data-muc-de-xuat-luu-tru]");
			await d.doi(t, () => window.__tim("[data-hop-viec-trang='LUU_TRU']").length > 0);
			const khoaTruoc = await t.evaluate(() => document.querySelector("[data-nut-gui]").disabled);
			await t.type("[data-hop-viec-trang] textarea", LY_DO_LUU);
			const moSau = await t.evaluate(() => !document.querySelector("[data-nut-gui]").disabled);
			await d.chup(t, "lslt-hop-luu-tru-1440.png");
			await d.bamSel(t, "[data-nut-gui]");
			await d.doi(t, () => !document.querySelector("[data-hop-viec-trang]"));
			await t.close();
			d.dat(1, khoaTruoc && moSau, `nut gui: khoa khi rong ${khoaTruoc}, mo khi co chu ${moSau}`);
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(m.cookie, RONG, duongTrang);
			await d.doi(t, () => window.__tim("[data-co-luu-tru-cho]").length > 0);
			const huyHieu = await chuTrong(t, "[data-co-luu-tru-cho]");
			await d.bamSel(t, "[data-menu-trang]");
			await d.doi(t, () => window.__tim("[data-vi-sao-khoa]").length > 0);
			const khoa = await t.evaluate(
				() => document.querySelector("[data-muc-de-xuat-luu-tru]").getAttribute("aria-disabled") === "true",
			);
			await d.chup(t, "lslt-cho-luu-tru-1440.png");
			await t.close();
			d.dat(
				2,
				huyHieu === "Có đề xuất lưu trữ chờ duyệt" && khoa,
				`huy hieu «${huyHieu}», muc khoa ${khoa}`,
			);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const id = (await choCua("LUU_TRU")) ?? (await deXuatTrang(m, "taiLieu.deXuatLuuTru", s, LY_DO_LUU));
			const t = await d.moTrang(chu.cookie, RONG, "/tai-lieu?tabTaiLieu=cho-duyet");
			await d.bamSel(t, `[data-hang-cho-duyet] [data-de-xuat='${id}']`);
			await d.choDuong(t, `/tai-lieu/de-xuat/${id}`);
			await d.doi(t, () => window.__tim("[data-viec-trang='LUU_TRU']").length > 0);
			const viec = await chuTrong(t, "[data-viec-trang]");
			const nut = await chuTrong(t, "[data-nut-duyet]");
			await d.chup(t, "lslt-duyet-luu-tru-1440.png");
			await d.bamSel(t, "[data-nut-duyet]");
			await d.choDuong(t, duongTrang);
			await t.close();
			const sau = await d.hoi(chu.cookie, "taiLieu.get", { slug: s });
			d.dat(
				3,
				viec.includes("Đề xuất lưu trữ trang") && viec.includes(LY_DO_LUU) && nut === "Duyệt lưu trữ" && sau.daLuuTru !== null,
				`viec «${viec}», nut «${nut}», daLuuTru ${JSON.stringify(sau.daLuuTru)}`,
			);
		});

	const damBaoDaLuu = async () => {
		const g = await d.hoi(chu.cookie, "taiLieu.get", { slug: s });
		if (g.daLuuTru) return;
		const id = (await choCua("LUU_TRU")) ?? (await deXuatTrang(m, "taiLieu.deXuatLuuTru", s, LY_DO_LUU));
		await duyetBang(chu, id);
	};

	if (chay(4))
		await d.chayBuoc(4, async () => {
			await damBaoDaLuu();
			const t = await d.moTrang(m.cookie, RONG, duongTrang);
			await d.doi(t, () => document.querySelector("[data-man-doc]"));
			if (!(await coHien(t, "[data-da-luu-tru]"))) {
				await t.close();
				d.dat(4, false, "khong thay dai da luu tru");
				return;
			}
			const dai = await chuTrong(t, "[data-da-luu-tru]");
			const coSua = await t.evaluate(() =>
				window.__tim("a").some((a) => a.innerText.trim() === "Sửa trang"),
			);
			const nutKhoiPhuc = await coHien(t, "[data-nut-de-xuat-khoi-phuc]");
			await d.chup(t, "lslt-da-luu-tru-1440.png");
			await t.close();
			const mong = `Trang đã lưu trữ ngày ${ngayVN()}`;
			d.dat(
				4,
				dai.includes(mong) && nutKhoiPhuc && !coSua,
				`dai «${dai.slice(0, 80)}», nut khoi phuc ${nutKhoiPhuc}, co Sua trang ${coSua}`,
			);
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			await damBaoDaLuu();
			const t = await d.moTrang(m.cookie, HEP, duongTrang);
			await d.doi(t, () => window.__tim("[data-da-luu-tru]").length > 0);
			const tran = await d.cuonNgang(t);
			await d.chup(t, "lslt-da-luu-tru-390.png");
			await t.close();
			d.dat(5, tran.length === 0, `cuon ngang o 390: ${tran.join(", ")}`);
		});

	if (chay(6))
		await d.chayBuoc(6, async () => {
			await damBaoDaLuu();
			const t = await d.moTrang(m.cookie, RONG, duongTrang);
			await d.bamSel(t, "[data-nut-de-xuat-khoi-phuc]");
			await d.doi(t, () => window.__tim("[data-hop-viec-trang='KHOI_PHUC']").length > 0);
			await t.type("[data-hop-viec-trang] textarea", LY_DO_KHOI);
			await d.bamSel(t, "[data-nut-gui]");
			await d.doi(t, () => window.__tim("[data-co-khoi-phuc-cho]").length > 0);
			const huyHieu = await chuTrong(t, "[data-co-khoi-phuc-cho]");
			await d.chup(t, "lslt-hop-khoi-phuc-1440.png");
			await t.close();
			d.dat(6, huyHieu === "Có đề xuất khôi phục chờ duyệt", `huy hieu «${huyHieu}»`);
		});

	if (chay(7))
		await d.chayBuoc(7, async () => {
			await damBaoDaLuu();
			const id = (await choCua("KHOI_PHUC")) ?? (await deXuatTrang(m, "taiLieu.deXuatKhoiPhuc", s, LY_DO_KHOI));
			const t = await d.moTrang(chu.cookie, RONG, `/tai-lieu/de-xuat/${id}`);
			await d.doi(t, () => window.__tim("[data-viec-trang='KHOI_PHUC']").length > 0);
			const viec = await chuTrong(t, "[data-viec-trang]");
			const nut = await chuTrong(t, "[data-nut-duyet]");
			await d.chup(t, "lslt-duyet-khoi-phuc-1440.png");
			await d.bamSel(t, "[data-nut-duyet]");
			await d.choDuong(t, duongTrang);
			await t.close();
			d.dat(
				7,
				viec.includes("Đề xuất khôi phục trang") && nut === "Duyệt khôi phục",
				`viec «${viec}», nut «${nut}»`,
			);
		});

	if (chay(8))
		await d.chayBuoc(8, async () => {
			const t = await d.moTrang(m.cookie, RONG, "/tai-lieu");
			await d.doi(t, () => window.__tim("[data-bang-trang] tr[data-trang]").length > 0);
			const tren = await t.evaluate(() =>
				window.__tim("[data-bang-trang] tr[data-trang]").map((r) => r.getAttribute("data-trang")),
			);
			await d.chup(t, "lslt-sau-khoi-phuc-1440.png");
			await t.close();
			const api = (await d.hoi(m.cookie, "taiLieu.list", { page: 1 })).rows.map((r) => r.slug);
			d.dat(
				8,
				tren.includes(s) && tren.join(",") === api.join(","),
				`bang «${tren.join(",")}» / API «${api.join(",")}» / co ${s}: ${tren.includes(s)}`,
			);
		});
}

async function phanDaLuuTru() {
	const chu = await d.nguoiMoi("dc", "member", "Nguyễn Thu Hà");
	const m = await d.nguoiMoi("dm", "member", "Phạm Văn Minh");
	await d.batTrinhDuyet(m.cookie);
	const daCo = await d.hoi(m.cookie, "taiLieu.list", { page: 1, archived: true });
	const rongTruoc = daCo.total === 0;
	const dangDung = await d.taoTrangDangDung(chu, {
		ten: "Chính sách thưởng quý hiện hành",
		loai: "chinh-sach",
		noiDung: BAN[1],
	});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			if (!rongTruoc) {
				d.dat(4, false, `kho do da co ${daCo.total} trang luu tru, khong do duoc cau rong`);
				return;
			}
			const t = await d.moTrang(m.cookie, RONG, "/tai-lieu");
			await d.bamSel(t, "[data-nut-da-luu-tru]");
			await d.doi(t, () => window.__tim("[data-da-luu-tru-rong]").length > 0);
			const cau = await chuTrong(t, "[data-da-luu-tru-rong]");
			await d.chup(t, "lslt-ds-da-luu-tru-rong-1440.png");
			await t.close();
			d.dat(4, cau.includes("Chưa có trang nào đã lưu trữ"), `cau rong «${cau}»`);
		});

	const daLuu = await d.taoTrangDangDung(chu, {
		ten: "Chính sách thưởng quý cũ",
		loai: "chinh-sach",
		noiDung: BAN[0],
	});
	const idLuu = await deXuatTrang(m, "taiLieu.deXuatLuuTru", daLuu, LY_DO_LUU);
	await duyetBang(chu, idLuu);
	const slugTren = (t) =>
		t.evaluate(() =>
			window.__tim("[data-bang-trang] tr[data-trang]").map((r) => r.getAttribute("data-trang")),
		);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(m.cookie, RONG, "/tai-lieu");
			await d.bamSel(t, "[data-nut-da-luu-tru]");
			await cho(t);
			const url = await t.evaluate(() => window.location.search);
			if (!url.includes("archived=true")) {
				await t.close();
				d.dat(1, false, `mat bo loc Đã lưu trữ: URL «${url}»`);
				return;
			}
			await d.doi(t, () => window.__tim("[data-bang-trang] tr[data-trang]").length > 0);
			const tren = await slugTren(t);
			const cot = await chuTrong(t, "[data-bang-trang] th");
			await d.chup(t, "lslt-ds-da-luu-tru-1440.png");
			await t.close();
			const api = (await d.hoi(m.cookie, "taiLieu.list", { page: 1, archived: true })).rows.map(
				(r) => r.slug,
			);
			d.dat(
				1,
				tren.join(",") === api.join(",") && tren.includes(daLuu) && !tren.includes(dangDung) && cot.includes("Lưu trữ ngày"),
				`bang «${tren}» / API «${api}» / cot «${cot}»`,
			);
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(m.cookie, RONG, "/tai-lieu?archived=true");
			await t.reload({ waitUntil: "load" });
			await cho(t);
			const tren = await slugTren(t);
			const url = await t.evaluate(() => window.location.search);
			await t.close();
			d.dat(
				2,
				url.includes("archived=true") && tren.join(",") === daLuu,
				`tai lai mat bo loc: URL «${url}», bang «${tren}»`,
			);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(m.cookie, RONG, "/tai-lieu?archived=true");
			await d.bamSel(t, "[data-nut-da-luu-tru]");
			await d.doi(t, () => !window.location.search.includes("archived"));
			await cho(t);
			const tren = await slugTren(t);
			await t.close();
			d.dat(
				3,
				tren.includes(dangDung) && !tren.includes(daLuu),
				`danh sach thuong «${tren}»`,
			);
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const t = await d.moTrang(chu.cookie, RONG, "/tai-lieu?tabTaiLieu=cho-duyet");
			await d.bamSel(t, "[data-nhom='da-xu-ly']");
			await d.doi(t, () => window.__tim("[data-trang-thai='DA_DUYET']").length > 0);
			const tren = await t.evaluate(() =>
				window.__tim("[data-hang-cho-duyet] [data-de-xuat]").map((a) => a.getAttribute("data-de-xuat")),
			);
			const nhan = await chuTrong(t, "[data-trang-thai='DA_DUYET']");
			await d.chup(t, "lslt-da-xu-ly-1440.png");
			await t.close();
			const api = (await d.hoi(chu.cookie, "taiLieu.proposals", { nhom: "da-xu-ly", page: 1 })).rows.map(
				(r) => r.id,
			);
			d.dat(
				5,
				nhan.startsWith("Đã duyệt") && tren.join(",") === api.join(","),
				`nhan «${nhan}», man «${tren}» / API «${api}»`,
			);
		});
}

async function cho(t) {
	await t.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 }).catch(() => null);
	await new Promise((r) => setTimeout(r, 800));
}

try {
	if (PHAN === "lich-su") await phanLichSu();
	else if (PHAN === "luu-tru") await phanLuuTru();
	else await phanDaLuuTru();
	await d.ket(`man ${PHAN}`);
} catch (e) {
	await d.khongDoDuoc(e);
}
