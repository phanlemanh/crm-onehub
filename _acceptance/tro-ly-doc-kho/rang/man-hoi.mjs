import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "tro-ly-doc-kho";

const CAY_DO = {
	1: {
		nhan: "ban sao an tab Hoi",
		tenCay: "tlk-man-hoi-chieu-do",
		chiBuoc: "1",
		tep: "apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx",
		cam: (s) => s.replace('data-tab-hoi=""', 'data-tab-an=""'),
		dauVet: 'data-tab-an=""',
		ghim: /buoc 1: khong thay tab Hỏi/,
	},
};

const coChieuDo = process.argv.find(
	(a) => a === "--chieu-do" || a.startsWith("--chieu-do="),
);
if (coChieuDo) {
	const buoc = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[buoc];
	if (!cay) {
		console.log(`KHONG DO DUOC: man-hoi khong co chieu do cho buoc ${buoc}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-hoi.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { cho, chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { ghiGanNhat, nopTraLoi } = await import(
	"../../../apps/agent/agent/lib/tai-lieu-hoi.ts"
);
const { TAI_LIEU_HOI } = await import(
	"../../../packages/validation/src/tai-lieu-hoi.ts"
);

const NGAY_MS = 24 * 60 * 60 * 1000;
const CHO_HANG_MS = 30_000;
const DANG_DOC = "Trợ lý AI đang đọc kho…";

const TRANG = {
	hoaHong: {
		ten: "Quy định hoa hồng đối tác",
		cau: "Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.",
		noiDung:
			"## Mức hưởng\n\nĐối tác tầng 1 hưởng 2% doanh thu thuần của hợp đồng.\n\nĐối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.\n",
	},
	nghiPhep: {
		ten: "Nghỉ phép năm",
		cau: "Nhân viên chính thức có mười hai ngày nghỉ phép mỗi năm.",
		noiDung:
			"## Số ngày\n\nNhân viên chính thức có mười hai ngày nghỉ phép mỗi năm.\n",
	},
	congTacPhi: {
		ten: "Quy định công tác phí",
		cau: "Công tác phí mỗi ngày là 300.000 đồng.",
		noiDung: "## Mức\n\nCông tác phí mỗi ngày là 300.000 đồng.\n",
	},
	thuViec: {
		ten: "Chính sách thử việc",
		cau: "Thời gian thử việc của nhân viên kinh doanh là hai tháng.",
		noiDung:
			"## Thời gian\n\nThời gian thử việc của nhân viên kinh doanh là hai tháng.\n",
	},
};

const d = await moDo();
const CUON = [];

const LOP_DEV = "nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container";

async function goLopDev(t) {
	await t.evaluate((chon) => {
		for (const e of document.querySelectorAll(chon)) e.remove();
	}, LOP_DEV);
}

async function chup(t, ten) {
	await goLopDev(t);
	await d.chup(t, ten);
}

async function chup390(t, ten, phaiThay) {
	if (t.viewport()?.width !== HEP)
		await t.setViewport({ width: HEP, height: 844, deviceScaleFactor: 1 });
	await cho(800);
	await goLopDev(t);
	const tran = await d.cuonNgang(t);
	const so = await t.evaluate(() => ({
		sw: document.documentElement.scrollWidth,
		iw: window.innerWidth,
	}));
	const thay = await t.evaluate((s) => window.__tim(s).length > 0, phaiThay);
	const catNgang = await t.evaluate((s) => {
		const ra = [];
		for (const goc of window.__tim(s))
			for (const e of [goc, ...goc.querySelectorAll("*")]) {
				const r = e.getBoundingClientRect();
				if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1))
					ra.push(
						`${e.tagName.toLowerCase()} «${(e.textContent ?? "").trim().slice(0, 40)}» ${Math.round(r.left)}..${Math.round(r.right)}`,
					);
			}
		return ra;
	}, phaiThay);
	CUON.push(
		`${ten}: scrollWidth ${so.sw} innerWidth ${so.iw} ${tran.length === 0 ? "khong cuon ngang" : `CUON NGANG ${tran.join(", ")}`} · ${phaiThay} ${thay ? "hien" : "KHONG HIEN"} · ${catNgang.length === 0 ? "khong phan tu nao tran mep" : `TRAN MEP ${catNgang.join("; ")}`}`,
	);
	await d.chup(t, ten);
	return [
		...tran,
		...(thay ? [] : [`390 khong hien ${phaiThay}`]),
		...catNgang.map((c) => `390 ${phaiThay} tran mep: ${c}`),
	];
}

async function choHang(nguoiId, truoc) {
	const het = Date.now() + CHO_HANG_MS;
	while (Date.now() < het) {
		const h = await d.db.taiLieuHoi.findFirst({
			where: {
				nguoiHoiId: nguoiId,
				trangThai: "DANG_HOI",
				id: { notIn: [...truoc] },
			},
			orderBy: { hoiLuc: "desc" },
			select: { id: true },
		});
		if (h) {
			truoc.add(h.id);
			return h.id;
		}
		await cho(300);
	}
	throw new Error("khong thay hang dang hoi sau khi gui");
}

async function traLoiGia(hoiId, slug, khoa) {
	const t = TRANG[khoa];
	const kq = await nopTraLoi(
		hoiId,
		{
			loai: "tra-loi",
			cau: [
				{
					chu: t.cau,
					trich: [{ slug, phienBan: await phienBan(slug), doan: t.cau }],
				},
			],
		},
		new Date(),
	);
	if (!kq.ok) throw new Error(`tro ly gia nop bi bac: ${kq.loi}`);
}

async function phienBan(slug) {
	const t = await d.db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { banDangDung: { select: { so: true } } },
	});
	return t.banDangDung?.so ?? 0;
}

async function moHoi(nguoi, rong) {
	const t = await d.moTrang(nguoi.cookie, rong, "/tai-lieu");
	const coTab = await t.$("[data-tab-hoi]");
	if (!coTab) return { t, coTab: false };
	await d.bamSel(t, "[data-tab-hoi]");
	await d.doi(t, () => window.__tim("[data-hoi-kho] textarea").length > 0);
	await cho(500);
	return { t, coTab: true };
}

async function goCau(t, cau) {
	await t.click("[data-hoi-kho] textarea");
	await t.type("[data-hoi-kho] textarea", cau);
	await t.keyboard.press("Enter");
}

const chuThay = (t) => t.evaluate(() => document.body.innerText);

async function choKetQua(t, trangThai) {
	await d.doi(
		t,
		(s) => window.__tim(`[data-ket-qua-hoi="${s}"]`).length > 0,
		trangThai,
	);
	await cho(600);
}

async function hoiVaTraLoi(t, nguoi, truoc, cau, slug, khoa) {
	await goCau(t, cau);
	const hoiId = await choHang(nguoi.id, truoc);
	await d.doi(t, (s) => document.body.innerText.includes(s), DANG_DOC);
	await traLoiGia(hoiId, slug, khoa);
	await choKetQua(t, "TRA_LOI");
	return hoiId;
}

try {
	const nguoi = await d.nguoiMoi("h", "member", "Lê Thu Trang");
	const ws = await d.batTrinhDuyet(nguoi.cookie);
	const slug = {};
	for (const [khoa, t] of Object.entries(TRANG)) {
		slug[khoa] = await d.taoTrangDangDung(nguoi, {
			ten: `${t.ten} ${MA}`,
			loai: "quy-dinh",
			noiDung: t.noiDung,
		});
	}
	await d.db.taiLieuTrang.update({
		where: { slug: slug.thuViec },
		data: { xacMinhDen: new Date(Date.now() - NGAY_MS) },
	});
	const truoc = new Set();
	console.log(`-- gieo ${Object.keys(slug).length} trang tren ${ws}`);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const { t, coTab } = await moHoi(nguoi, RONG);
			if (!coTab) {
				await chup(t, "tlk-hoi-trong-1440.png");
				await t.close();
				d.dat(1, false, "khong thay tab Hỏi");
				return;
			}
			const chu = await chuThay(t);
			const goiY = await t.evaluate(
				() => window.__tim("[data-goi-y] button").length,
			);
			await chup(t, "tlk-hoi-trong-1440.png");
			const tran = await chup390(t, "tlk-hoi-trong-390.png", "[data-goi-y]");
			await t.close();
			const okr = await d.nguoiMoi("o", "okr", "Trần Văn Mục Tiêu");
			const to = await d.moTrang(okr.cookie, RONG, "/tai-lieu");
			const okrThayTab = (await to.$("[data-tab-hoi]")) !== null;
			await to.close();
			const loi = [];
			if (tran.length > 0) loi.push(`390: ${tran.join(", ")}`);
			if (okrThayTab) loi.push("vai okr thay tab Hỏi");
			if (
				!chu.includes(
					"Hỏi về quy định, chính sách, quy trình hay biểu mẫu của OneHub.",
				)
			)
				loi.push("thieu cau mo dau");
			if (goiY !== 3) loi.push(`${goiY} goi y`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const { t } = await moHoi(nguoi, RONG);
			await hoiVaTraLoi(
				t,
				nguoi,
				truoc,
				"quy dinh hoa hong tang 2",
				slug.hoaHong,
				"hoaHong",
			);
			const trich = await t.evaluate(() => {
				const y = window.__tim("[data-y-tra-loi]")[0];
				const a = y?.querySelector("a");
				return {
					chu: y?.innerText ?? "",
					href: a?.getAttribute("href") ?? "",
					ten: a?.innerText.trim() ?? "",
				};
			});
			await chup(t, "tlk-hoi-tra-loi-1440.png");
			const loi = [];
			if (!trich.chu.includes(TRANG.hoaHong.cau)) loi.push("thieu y tra loi");
			if (!trich.chu.includes("Phiên bản 1")) loi.push("thieu phien ban");
			if (!trich.chu.includes(`«${TRANG.hoaHong.cau}»`))
				loi.push("thieu doan trich");
			if (!trich.ten.startsWith(TRANG.hoaHong.ten))
				loi.push(`ten trang trich: ${trich.ten}`);
			await d.bamSel(t, "[data-y-tra-loi] a");
			await d.choDuong(t, `/tai-lieu/${slug.hoaHong}`);
			const duong = await t.evaluate(() => window.location.pathname);
			await t.close();
			if (duong !== `/${ws}/tai-lieu/${slug.hoaHong}`)
				loi.push(`bam trich toi ${duong}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const { t } = await moHoi(nguoi, RONG);
			await goCau(t, "Thử việc có được tăng lương giữa kỳ không?");
			const hoiId = await choHang(nguoi.id, truoc);
			await d.doi(t, (s) => document.body.innerText.includes(s), DANG_DOC);
			await ghiGanNhat(hoiId, [
				{ slug: slug.thuViec, ten: `${TRANG.thuViec.ten} ${MA}` },
			]);
			const kq = await nopTraLoi(hoiId, { loai: "khong-biet" }, new Date());
			if (!kq.ok) throw new Error(`tro ly gia tu choi bi bac: ${kq.loi}`);
			await choKetQua(t, "TU_CHOI");
			const chu = await t.evaluate(
				() => window.__tim("[data-tu-choi]")[0]?.innerText ?? "",
			);
			await chup(t, "tlk-hoi-tu-choi-1440.png");
			const tran = await chup390(
				t,
				"tlk-hoi-tu-choi-390.png",
				"[data-tu-choi]",
			);
			await t.close();
			const loi = [];
			if (tran.length > 0) loi.push(`390: ${tran.join(", ")}`);
			if (!chu.includes(TAI_LIEU_HOI.tuChoi)) loi.push("thieu cau tu choi");
			if (!chu.includes("Trang gần nhất")) loi.push("thieu Trang gan nhat");
			if (!chu.includes(TRANG.thuViec.ten))
				loi.push("thieu ten trang gan nhat");
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const { t } = await moHoi(nguoi, RONG);
			await hoiVaTraLoi(
				t,
				nguoi,
				truoc,
				"Thử việc của nhân viên kinh doanh bao lâu?",
				slug.thuViec,
				"thuViec",
			);
			const canhBao = await t.evaluate(
				() => window.__tim("[data-qua-han]")[0]?.innerText ?? "",
			);
			await chup(t, "tlk-hoi-qua-han-1440.png");
			const tran = await chup390(
				t,
				"tlk-hoi-qua-han-390.png",
				"[data-qua-han]",
			);
			await t.close();
			const loi = [];
			if (tran.length > 0) loi.push(`390: ${tran.join(", ")}`);
			if (!canhBao.includes(TRANG.thuViec.ten))
				loi.push("Alert thieu ten trang");
			if (!canhBao.includes("quá hạn xác minh"))
				loi.push("Alert thieu qua han");
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const { t } = await moHoi(nguoi, HEP);
			await hoiVaTraLoi(
				t,
				nguoi,
				truoc,
				"quy dinh hoa hong tang 2",
				slug.hoaHong,
				"hoaHong",
			);
			const tran = await chup390(
				t,
				"tlk-hoi-tra-loi-390.png",
				"[data-y-tra-loi]",
			);
			await t.close();
			d.dat(5, tran.length === 0, `390: ${tran.join(", ")}`);
		});

	if (chay(6))
		await d.chayBuoc(6, async () => {
			const { t } = await moHoi(nguoi, RONG);
			const hoiId = await hoiVaTraLoi(
				t,
				nguoi,
				truoc,
				"Công tác phí mỗi ngày bao nhiêu?",
				slug.congTacPhi,
				"congTacPhi",
			);
			await d.bamChu(t, "button", "Báo sai");
			await d.doi(t, () => window.__tim("[role=dialog] textarea").length > 0);
			await t.type(
				"[role=dialog] textarea",
				"Mức mới từ tháng 10 là 350.000 đồng.",
			);
			await d.bamChu(t, "[role=dialog] button", "Gửi cho chủ trang");
			await d.doi(t, () =>
				window.__theoChu("button", "Đã báo sai").some((b) => b.disabled),
			);
			await cho(500);
			await chup(t, "tlk-bao-sai-1440.png");
			const tran = await chup390(
				t,
				"tlk-bao-sai-390.png",
				'[data-bao-sai="da-gui"]',
			);
			await t.close();
			const bao = await d.db.taiLieuBaoSai.findMany({
				where: { hoiId },
				select: { trangId: true, ghiChu: true },
			});
			const loi = [];
			if (tran.length > 0) loi.push(`390: ${tran.join(", ")}`);
			if (bao.length !== 1) loi.push(`${bao.length} hang bao sai`);
			if (bao[0]?.ghiChu !== "Mức mới từ tháng 10 là 350.000 đồng.")
				loi.push("ghi chu khong luu");
			d.dat(6, loi.length === 0, loi.join(" · "));
		});

	writeFileSync(
		join(process.env.BANG_CHUNG, "tlk-hoi-cuon-390.txt"),
		`${CUON.join("\n")}\n`,
	);
	console.log("  so do tlk-hoi-cuon-390.txt");
	await d.ket("man-hoi");
} catch (e) {
	await d.khongDoDuoc(e);
}
