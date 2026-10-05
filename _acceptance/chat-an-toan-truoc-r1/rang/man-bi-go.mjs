import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "chat-an-toan-truoc-r1";
const CHIEU_DO = process.argv.includes("--chieu-do");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/${HO_SO}/rang/man-bi-go.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { writeAgentModel } = await import(
	"../../../packages/db/src/settings.ts"
);

const BI_GO =
	"Model đã chọn không còn trên AI Gateway — tác nhân đang chạy model mặc định. Chọn model khác.";
const KHONG_DU_QUYEN = "Chỉ chủ sở hữu hoặc quản trị mới đổi được model.";
const ID_GIA = "khong-con/model-gia-r1e";

const d = await moDo();

const docMan = (t) =>
	t.evaluate(
		(chuBao, chuQuyen) => {
			const hop = [...document.querySelectorAll('[data-slot="alert"]')].find(
				(e) => (e.innerText ?? "").includes(chuBao),
			);
			const nut = document.querySelector('button[role="combobox"]');
			const tran = [];
			if (document.documentElement.scrollWidth > window.innerWidth + 1) {
				tran.push(
					`trang ${document.documentElement.scrollWidth}>${window.innerWidth}`,
				);
			}
			if (hop && hop.scrollWidth > hop.clientWidth + 1) {
				tran.push(`hop ${hop.scrollWidth}>${hop.clientWidth}`);
			}
			return {
				coHop: Boolean(hop?.checkVisibility()),
				nutKhoa: nut ? nut.disabled : null,
				coCauQuyen: (document.body.innerText ?? "").includes(chuQuyen),
				tran,
			};
		},
		BI_GO,
		KHONG_DU_QUYEN,
	);

try {
	const chu = await d.nguoiMoi("bg", "owner", "Nguyễn Văn Chủ");
	const thanhVien = await d.nguoiMoi("bgm", "member", "Trần Thị Thành");
	await d.batTrinhDuyet(chu.cookie);
	const danhMuc = await d.hoi(chu.cookie, "settings.modelCatalog");
	if (!danhMuc.available || danhMuc.models.length === 0) {
		await d.khongDoDuoc(
			new Error(
				"ban do khong doc duoc danh muc AI Gateway — khong do duoc buoc nao",
			),
		);
	}
	const idCon = danhMuc.models[0].id;
	console.log(`-- ${MA}: id con ${idCon}`);

	const datModel = (id) =>
		writeAgentModel(d.db, { id, contextWindowTokens: 200_000 });

	if (chay(1))
		await d.chayBuoc(1, async () => {
			await datModel(CHIEU_DO ? idCon : ID_GIA);
			const t = await d.moTrang(chu.cookie, RONG, "/settings");
			const m = await docMan(t);
			await d.chup(t, "r1e-bi-go-1440.png");
			await t.close();
			d.dat(1, m.coHop, "khong thay hop bao");
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			await datModel(ID_GIA);
			const t = await d.moTrang(chu.cookie, HEP, "/settings");
			const m = await docMan(t);
			await d.chup(t, "r1e-bi-go-390.png");
			await t.close();
			const loi = [];
			if (!m.coHop) loi.push("khong thay hop bao o 390");
			if (m.tran.length > 0) loi.push(`tran ngang: ${m.tran.join(", ")}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			await datModel(ID_GIA);
			const t = await d.moTrang(thanhVien.cookie, RONG, "/settings");
			const m = await docMan(t);
			await d.chup(t, "r1e-bi-go-member-1440.png");
			await t.close();
			const loi = [];
			if (!m.coHop) loi.push("thanh vien khong thay hop bao");
			if (m.nutKhoa !== true)
				loi.push(`o chon model khong bi khoa (${m.nutKhoa})`);
			if (!m.coCauQuyen) loi.push("khong thay cau chi quan tri doi duoc");
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			await datModel(idCon);
			const t = await d.moTrang(chu.cookie, RONG, "/settings");
			const m = await docMan(t);
			await d.chup(t, "r1e-con-1440.png");
			await t.close();
			d.dat(4, !m.coHop, "hop bao hien du model con tren Gateway");
		});

	await writeAgentModel(d.db, null);
	await d.ket("man-bi-go");
} catch (e) {
	await d.khongDoDuoc(e);
}
