import { fileURLToPath } from "node:url";
import { chay, chieuDo, HEP, moDo, ngayVN, RONG } from "./man-lib.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);

const CAY_DO = {
	nhan: "ban sao tai-lieu.service.ts dem ca de xuat nguoi khac vao so cho duyet",
	tenCay: "ktl-danh-sach-chieu-do",
	chiBuoc: "1,2",
	tep: "apps/api/src/tai-lieu/tai-lieu.service.ts",
	cam: (s) =>
		s.replace(
			'where: { AND: [dieuKienDuyetDuoc(nguoi), { trangThai: "CHO_DUYET" }] },',
			'where: { trangThai: "CHO_DUYET" },',
		),
	dauVet:
		'this.db.taiLieuDeXuat.count({\n\t\t\t\twhere: { trangThai: "CHO_DUYET" },',
	ghim: /buoc 2: so cho duyet 3 != 2/,
};

if (process.argv.includes("--chieu-do")) await chieuDo(TEP_NAY, CAY_DO);

const SO_CHO = 2;
const TRANG = [
	{
		khoa: "doc",
		chu: "m",
		ten: "Quy định về hoa hồng đối tác",
		loai: "quy-dinh",
		noiDung: [
			"## Phạm vi",
			"",
			"Áp dụng cho mọi đối tác môi giới và chuyên viên quan hệ khách hàng của ngân hàng.",
			"",
			"## Mức hoa hồng",
			"",
			"| Hạng | Tỷ lệ |",
			"| --- | --- |",
			"| Bạc | 0,5% |",
			"| Vàng | 0,8% |",
			"",
			"### Thời điểm chi trả",
			"",
			"- Chốt số vào ngày 25 hằng tháng",
			"- Chi trả trong 5 ngày làm việc",
			"",
			"## Khiếu nại",
			"",
			"Gửi khiếu nại cho **phòng Đối tác** trong 30 ngày.",
		].join("\n"),
	},
	{
		khoa: "p2",
		chu: "m",
		ten: "Quy định bảo mật dữ liệu khách hàng",
		loai: "quy-dinh",
		noiDung:
			"## Nguyên tắc\n\nChỉ dùng dữ liệu khách hàng cho đúng việc đã được giao.",
	},
	{
		khoa: "p3",
		chu: "m",
		ten: "Chính sách thưởng quý",
		loai: "chinh-sach",
		noiDung: "## Điều kiện\n\nĐạt ít nhất 90% chỉ tiêu của quý.",
	},
	{
		khoa: "p4",
		chu: "x",
		ten: "Chính sách công tác phí",
		loai: "chinh-sach",
		noiDung:
			"## Mức chi\n\nThanh toán theo hoá đơn, tối đa 1.500.000 đồng mỗi ngày.",
	},
	{
		khoa: "p5",
		chu: "x",
		ten: "Quy trình tiếp nhận đối tác mới",
		loai: "quy-trinh",
		noiDung: "## Các bước\n\n1. Nhận hồ sơ\n2. Thẩm định\n3. Ký hợp đồng",
	},
];
const DE_XUAT = [
	{ trang: "p2", them: "\n\nBáo ngay cho trưởng phòng khi phát hiện rò rỉ." },
	{ trang: "p3", them: "\n\nThưởng chi cùng kỳ lương tháng đầu quý sau." },
	{ trang: "p4", them: "\n\nVé máy bay đặt qua phòng Hành chính." },
];
const DEM_LOAI = {
	"quy-dinh": 2,
	"chinh-sach": 2,
	"quy-trinh": 1,
	"bieu-mau": 0,
};

const d = await moDo();

const docDanhSach = (t) =>
	t.evaluate(() => {
		const so = (e) => Number(e?.querySelector("span")?.textContent ?? "NaN");
		const nhom = {};
		for (const e of window.__tim("[data-loai]"))
			nhom[e.getAttribute("data-loai")] = so(e);
		const tatCa = window
			.__tim(
				"[data-danh-sach-trang] [role='radio'], [data-danh-sach-trang] button",
			)
			.find((e) => e.getAttribute("data-loai") === null);
		const badge = window
			.__tim("[data-tab-cho-duyet] [data-so-cho-duyet]")
			.at(0);
		return {
			hang: window.__tim("[data-danh-sach-trang] [data-trang]").length,
			nhom,
			tatCa: so(tatCa),
			choDuyet: badge ? Number(badge.textContent.trim()) : 0,
		};
	});

try {
	const nguoi = {
		m: await d.nguoiMoi("m", "member", "Trần Thị Mai"),
		x: await d.nguoiMoi("x", "member", "Đỗ Minh Khang"),
	};
	await d.batTrinhDuyet(nguoi.m.cookie);
	const slug = {};

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(nguoi.m.cookie, RONG, "");
			await d.bamSel(t, "nav a[href$='/tai-lieu']");
			await d.choDuong(t, "/tai-lieu");
			await d.doi(t, () => document.querySelector("[data-kho-rong]"));
			const kq = await t.evaluate(() => {
				const k = document.querySelector("[data-kho-rong]");
				return {
					chu: k.innerText,
					nut: [...k.querySelectorAll("a")].map((a) => a.innerText.trim()),
				};
			});
			await d.chup(t, "ktl-kho-rong.png");
			await t.close();
			const loi = [];
			if (!kq.chu.includes("Chưa có trang nào"))
				loi.push("khong co «Chưa có trang nào»");
			if (!kq.nut.includes("Viết trang đầu tiên"))
				loi.push(`khong co nut «Viết trang đầu tiên» (${kq.nut.join(", ")})`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	for (const p of TRANG)
		slug[p.khoa] = await d.taoTrangDangDung(nguoi[p.chu], {
			ten: p.ten,
			loai: p.loai,
			noiDung: p.noiDung,
		});
	for (const x of DE_XUAT) {
		const p = TRANG.find((q) => q.khoa === x.trang);
		await d.lam(nguoi.x.cookie, "taiLieu.propose", {
			slug: slug[x.trang],
			noiDung: `${p.noiDung}${x.them}`,
		});
	}

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(nguoi.m.cookie, RONG, "/tai-lieu");
			await d.doi(t, () => document.querySelector("[data-danh-sach-trang]"));
			await d
				.doi(t, () =>
					document.querySelector("[data-tab-cho-duyet] [data-so-cho-duyet]"),
				)
				.catch(() => null);
			const ds = await docDanhSach(t);
			await d.chup(t, "ktl-danh-sach-1440.png");
			const loi = [];
			if (ds.choDuyet !== SO_CHO)
				loi.push(`so cho duyet ${ds.choDuyet} != ${SO_CHO}`);
			if (ds.hang !== TRANG.length)
				loi.push(`${ds.hang} hang trang != ${TRANG.length}`);
			if (ds.tatCa !== TRANG.length)
				loi.push(`dem Tat ca ${ds.tatCa} != ${TRANG.length}`);
			for (const [l, n] of Object.entries(DEM_LOAI))
				if (ds.nhom[l] !== n) loi.push(`dem ${l} ${ds.nhom[l]} != ${n}`);
			await d.bamSel(t, "[data-tab-cho-duyet]");
			await d.doi(t, () =>
				window.location.search.includes("tabTaiLieu=cho-duyet"),
			);
			await d.doi(t, () => document.querySelector("[data-hang-cho-duyet]"));
			const hangCho = await t.evaluate(
				() => window.__tim("[data-hang-cho-duyet] [data-de-xuat]").length,
			);
			if (hangCho !== SO_CHO)
				loi.push(`tab Cho duyet co ${hangCho} hang != ${SO_CHO}`);
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await d.moTrang(nguoi.m.cookie, HEP, "/tai-lieu");
			await d.doi(t, () => document.querySelector("[data-the-trang]"));
			const the = await t.evaluate(
				() => window.__tim("[data-the-trang] [data-trang]").length,
			);
			if (the !== TRANG.length)
				loi.push(`390: ${the} the trang != ${TRANG.length}`);
			const tran = await d.cuonNgang(t);
			if (tran.length > 0)
				loi.push(`danh sach 390 cuon ngang: ${tran.join(", ")}`);
			await d.chup(t, "ktl-danh-sach-390.png");
			await t.close();
			const t2 = await d.moTrang(
				nguoi.m.cookie,
				HEP,
				`/tai-lieu/${encodeURIComponent(slug.doc)}`,
			);
			await d.doi(t2, () => document.querySelector("[data-phien-ban]"));
			const tran2 = await d.cuonNgang(t2);
			if (tran2.length > 0)
				loi.push(`man doc 390 cuon ngang: ${tran2.join(", ")}`);
			await d.chup(t2, "ktl-doc-390.png");
			await t2.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(
				nguoi.m.cookie,
				RONG,
				`/tai-lieu/${encodeURIComponent(slug.doc)}`,
			);
			await d.doi(t, () => document.querySelector("[data-phien-ban]"));
			const kq = await t.evaluate(() => ({
				phienBan: document.querySelector("[data-phien-ban]").textContent.trim(),
				mucLuc: window
					.__tim("[data-reader-toc] a")
					.map((a) => a.textContent.trim()),
				chuTrang: document.querySelector("[data-chu-trang]")?.innerText ?? "",
			}));
			await d.chup(t, "ktl-doc-1440.png");
			await t.close();
			const loi = [];
			const mong = `Phiên bản 1 · duyệt ${ngayVN()}`;
			if (kq.phienBan !== mong)
				loi.push(`dong phien ban «${kq.phienBan}» != «${mong}»`);
			const mucMong = [
				"Phạm vi",
				"Mức hoa hồng",
				"Thời điểm chi trả",
				"Khiếu nại",
			];
			if (JSON.stringify(kq.mucLuc) !== JSON.stringify(mucMong))
				loi.push(`muc luc ${JSON.stringify(kq.mucLuc)}`);
			if (
				!kq.chuTrang.includes("Chủ trang") ||
				!kq.chuTrang.includes(nguoi.m.ten)
			)
				loi.push(`khoi chu trang «${kq.chuTrang.replace(/\n/g, " / ")}»`);
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket("man-danh-sach");
} catch (e) {
	await d.khongDoDuoc(e);
}
