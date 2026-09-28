import { fileURLToPath } from "node:url";
import { chay, chieuDo, HEP, moDo, ngayVN, RONG } from "./man-lib.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);

const CAY_DO = {
	nhan: "ban sao diff-trang.tsx bo bien the mau cua ins",
	tenCay: "ktl-duyet-chieu-do",
	chiBuoc: "1",
	tep: "packages/ui/src/components/diff-trang.tsx",
	cam: (s) =>
		s.replace(
			'them: "bg-diff-them/15 text-foreground underline decoration-diff-them underline-offset-4",',
			'them: "",',
		),
	dauVet: 'them: "",',
	ghim: /buoc 1: ins khong co nen/,
};

if (process.argv.includes("--chieu-do")) await chieuDo(TEP_NAY, CAY_DO);

const TEN_TRANG = "Quy trình đối soát hoa hồng";
const BAN_1 = [
	"## Thời hạn",
	"",
	"Đối tác gửi bảng kê trong 48 giờ sau khi chốt kỳ.",
	"",
	"Bộ phận tài chính kiểm tra số liệu trước khi chuyển khoản.",
	"",
	"## Khiếu nại",
	"",
	"Mọi khiếu nại gửi qua email của phòng Đối tác.",
].join("\n");
const BAN_2 = [
	"## Thời hạn",
	"",
	"Đối tác gửi bảng kê trong 24 giờ sau khi chốt kỳ.",
	"",
	"## Khiếu nại",
	"",
	"Mọi khiếu nại gửi qua email của phòng Đối tác.",
	"",
	"Phòng Đối tác trả lời khiếu nại trong ba ngày làm việc.",
].join("\n");

const d = await moDo();

const docDoi = (t) =>
	t.evaluate(() => {
		const trong = (c) =>
			c === "" ||
			c === "transparent" ||
			/^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(c) ||
			/\/\s*0\)$/.test(c);
		const goc = document.querySelector("[data-diff-trang]");
		if (!goc) return null;
		const ins = [...goc.querySelectorAll("ins")].map((e) => {
			const s = getComputedStyle(e);
			return {
				chu: e.textContent.trim().slice(0, 60),
				nen: s.backgroundColor,
				coNen: !trong(s.backgroundColor),
			};
		});
		const del = [...goc.querySelectorAll("del")].map((e) => {
			const s = getComputedStyle(e);
			return {
				chu: e.textContent.trim().slice(0, 60),
				gach: s.textDecorationLine,
				coGach: s.textDecorationLine.includes("line-through"),
			};
		});
		return { ins, del };
	});

try {
	const chu = await d.nguoiMoi("a", "member", "Lê Văn An");
	const deXuat = await d.nguoiMoi("b", "member", "Phạm Thu Hà");
	const slugTrang = await d.taoTrangDangDung(chu, {
		ten: TEN_TRANG,
		loai: "quy-trinh",
		noiDung: BAN_1,
	});
	const { deXuatId } = await d.lam(deXuat.cookie, "taiLieu.propose", {
		slug: slugTrang,
		noiDung: BAN_2,
	});
	await d.batTrinhDuyet(chu.cookie);
	const duongDeXuat = `/tai-lieu/de-xuat/${deXuatId}`;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(chu.cookie, RONG, "/tai-lieu");
			await d.bamSel(t, "[data-tab-cho-duyet]");
			await d.bamSel(t, `[data-hang-cho-duyet] [data-de-xuat='${deXuatId}']`);
			await d.choDuong(t, duongDeXuat);
			await d.doi(t, () => document.querySelector("[data-diff-trang] ins"));
			const doi = await docDoi(t);
			await d.chup(t, "ktl-duyet-1440.png");
			await t.close();
			const loi = [];
			if (!doi || doi.ins.length === 0) loi.push("khong co ins nao");
			else if (doi.ins.some((i) => !i.coNen))
				loi.push(
					`ins khong co nen (${doi.ins.find((i) => !i.coNen).nen} o «${doi.ins.find((i) => !i.coNen).chu}»)`,
				);
			if (!doi || doi.del.length === 0) loi.push("khong co del nao");
			else if (doi.del.some((x) => !x.coGach))
				loi.push(
					`del khong gach ngang (${doi.del.find((x) => !x.coGach).gach})`,
				);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(chu.cookie, HEP, duongDeXuat);
			await d.doi(t, () => document.querySelector("[data-diff-trang] ins"));
			const tran = await d.cuonNgang(t);
			await d.chup(t, "ktl-duyet-390.png");
			await t.close();
			d.dat(2, tran.length === 0, `cuon ngang o 390: ${tran.join(", ")}`);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(chu.cookie, RONG, duongDeXuat);
			await d.bamSel(t, "[data-nut-duyet]:not([disabled])");
			await d.choDuong(t, `/tai-lieu/${encodeURIComponent(slugTrang)}`);
			await d.doi(t, () => document.querySelector("[data-phien-ban]"));
			const dong = await t.evaluate(() =>
				document.querySelector("[data-phien-ban]").textContent.trim(),
			);
			const mong = `Phiên bản 2 · duyệt ${ngayVN()}`;
			await d.chup(t, "ktl-doc-sau-duyet.png");
			await t.close();
			d.dat(3, dong === mong, `dong phien ban «${dong}» != «${mong}»`);
		});

	await d.ket("man-duyet");
} catch (e) {
	await d.khongDoDuoc(e);
}
