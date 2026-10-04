import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NGUOI = [
	["quan-tri", { onehub: true, "bo-phan": true, "phong-ban": true }, false],
	["truong-bo-phan", { onehub: false, "bo-phan": true, "phong-ban": true }, false],
	["truong-phong-ban", { onehub: false, "bo-phan": false, "phong-ban": true }, false],
	["phu-trach-kr", { onehub: false, "bo-phan": false, "phong-ban": false }, false],
	["thanh-vien", { onehub: false, "bo-phan": false, "phong-ban": false }, false],
	["truong-phong-ban-vai-okr", { onehub: false, "bo-phan": false, "phong-ban": true }, true],
	["truong-bo-phan-vai-okr", { onehub: false, "bo-phan": true, "phong-ban": true }, true],
];
const DON_VI = ["onehub", "bo-phan", "phong-ban"];
const NAC = ["tat", "an", "bat"];
const THU_TUC = [
	"soanSanSang",
	"soanMo",
	"soanDanhSachCuoc",
	"soanDanhSach",
	"soanQuyet",
	"soanDuaVao",
];

const THEO_CUOC = new Set(["soanDanhSach", "soanQuyet", "soanDuaVao"]);

function o(nguoi, suaDuoc, quanTri, nac, thuTuc) {
	if (!suaDuoc) return THEO_CUOC.has(thuTuc) ? "404" : "403";
	if (thuTuc === "soanDanhSachCuoc") return "mo";
	if (nac === "tat") return "don-vi-chua-bat";
	if (nac === "an") {
		if (quanTri) return "mo";
		if (thuTuc === "soanSanSang" || thuTuc === "soanMo") return "don-vi-che-do-an";
		return "404";
	}
	return "mo";
}

const dong = [];
for (const [ten, sua] of NGUOI) {
	const quanTri = ten === "quan-tri";
	for (const dv of DON_VI) {
		for (const nac of NAC) {
			for (const tt of THU_TUC) {
				dong.push(`| ${ten} | ${dv} | ${nac} | ${tt} | ${o(ten, sua[dv], quanTri, nac, tt)} |`);
			}
		}
	}
}

const md = [
	"# Ma trận quyền — soan-okr-cung-tro-ly (E1, AC-1)",
	"",
	"Sinh bởi `ma-tran-quyen.mjs` từ bốn luật đóng; bài E1 đọc bảng này lúc chạy và từ chối",
	"chạy nếu có ô trống hay ô hai giá trị. Giá trị ô: `mo` · một mã lý do có tên · `403` · `404`.",
	"",
	"Luật: (1) không sửa được OKR của đơn vị → 403 ở ba thủ tục theo đơn vị (`soanSanSang`,",
	"`soanMo`, `soanDanhSachCuoc`), 404 ở ba thủ tục theo mã cuộc (`soanDanhSach`, `soanQuyet`,",
	"`soanDuaVao`) — cùng câu với mã không có, theo luật «theo mã» của 8c; (2) `soanDanhSachCuoc` (xem",
	"cuộc cũ) mở cho người sửa được ở mọi nấc; (3) nấc tắt → `don-vi-chua-bat` cho mọi thủ tục",
	"còn lại, kể cả `soanDuaVao` trên cuộc đã mở trước khi tắt; (4) nấc ẩn → quản trị mở; người",
	"khác sửa được thì `soanSanSang`/`soanMo` trả `don-vi-che-do-an`, còn `soanDanhSach`,",
	"`soanQuyet`, `soanDuaVao` trên cuộc quản trị mở trả 404 cùng câu với mã không có; nấc bật →",
	"mở cho người sửa được. Đổi 403 → 404 ở các ô theo mã cuộc: việc H1, 30/09, sau gộp 8c.",
	"Ai sửa được: quản trị mọi cấp; trưởng bộ phận: bộ phận và phòng ban trong nó; trưởng phòng",
	"ban: phòng ban; phụ trách KR và thành viên: không; vai «chỉ OKR» theo đúng chức trưởng",
	"của mình (đường vào mới không thu hẹp quyền OKR của họ).",
	"",
	`Số ô: ${dong.length} (= ${NGUOI.length} người × ${DON_VI.length} đơn vị × ${NAC.length} nấc × ${THU_TUC.length} thủ tục).`,
	"",
	"| Người | Đơn vị | Nấc | Thủ tục | Giá trị |",
	"|---|---|---|---|---|",
	...dong,
	"",
].join("\n");

const ra = join(dirname(fileURLToPath(import.meta.url)), "ma-tran-quyen.md");
if (process.argv.includes("--write")) {
	writeFileSync(ra, md);
	console.log(`ghi ${ra}: ${dong.length} ô`);
} else {
	process.stdout.write(md);
}
