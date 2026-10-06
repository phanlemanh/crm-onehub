import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");
const { TAM_HO_SO, chepSangBangChung } = await import("./noi-bang-chung.mjs");

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const GOC = join(THU_MUC, "..", "..", "..");
const DUONG_DOC = join(THU_MUC, "duong-doc-okr.json");
const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);
const dongDuongDoc = z.array(
	z.object({
		tep: z.string().min(1),
		thuTuc: z.array(z.string().regex(/^\w+\.\w+$/)).min(1),
		lyDo: z.string().trim().min(1),
	}),
);

const GOC_SOI = ["apps/api/src", "packages/db/src", "apps/agent/agent/lib"];
const GOC_API = "apps/api/src/";
const GOC_OKR = "apps/api/src/okr/";
const GOC_TO_CHUC = "apps/api/src/to-chuc";
const VUNG_LUAT = ["apps", "packages"];
const LOAI_TRU = new Set([
	"node_modules",
	".eve",
	"generated",
	".next",
	"dist",
	"build",
	".turbo",
	"test",
	"tests",
	"__tests__",
]);
const LA_THU = /\.(spec|test)\.(ts|tsx|mts)$/;
const DUOI = /\.(ts|tsx|mts)$/;

const BANG = [
	"okrObjective",
	"okrKeyResult",
	"okrViecKr",
	"okrGhiNhan",
	"okrComment",
	"okrCheckIn",
	"okrTrail",
	"okrSoChup",
	"okrAlignment",
	"okrBangChung",
	"okrDiemKr",
	"okrDoiDich",
	"okrFollow",
	"okrGhiNhanNhan",
	"okrMangSang",
	"okrMention",
	"okrMucTieuTuMau",
	"okrNguoiXem",
	"okrNguonKr",
	"okrNhinLai",
	"okrParticipant",
];
const DOC = new Set([
	"findMany",
	"findFirst",
	"findUnique",
	"findUniqueOrThrow",
	"findFirstOrThrow",
	"count",
	"groupBy",
	"aggregate",
]);
const DIEU_KIEN = new Set(["dieuKienXemMucTieu", "boGioiHan"]);
const SQL_THO = new Set([
	"$queryRaw",
	"$queryRawUnsafe",
	"$executeRaw",
	"$executeRawUnsafe",
]);
const SAN_LOI_GOI = 40;

const LY_DO_DUONG_DOC_RONG =
	"duong-doc-okr.json rỗng: `rg okr(Objective|KeyResult|ViecKr|GhiNhan|Comment|CheckIn|Trail|SoChup)\\. apps/api/src --glob '!**/okr/**'` không ra dòng nào (29/09). Ngoài router okr chỉ dashboard gọi viecCanNhac của @crm/db/onboarding-nhac, và nó chỉ giữ mục kế hoạch (laNhacKeHoach), không trả mục OKR. Lời đọc ở packages/db/src và apps/agent/agent/lib là thư viện: thủ tục tRPC gọi chúng (okr.viecCuaToi, okr.banGhiChiSo) đã nằm trong router okr và trong ma trận THU_TU_DOC_OKR.";

const MIEN_XEM = [
	{
		tep: "apps/api/src/okr/okr-hien-thi.service.ts",
		ham: "datHienThi",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng mục tiêu FOR UPDATE sau assertSuaMucTieu (đã qua điều kiện xem)",
	},
	{
		tep: "apps/api/src/okr/okr-hien-thi.service.ts",
		ham: "datHienThi",
		bang: "okrObjective",
		lyDo: "ghi: đọc lại trạng thái, mức và người xem của mục tiêu vừa qua assertSuaMucTieu (đã qua điều kiện xem)",
	},
	{
		tep: "apps/api/src/okr/okr-hien-thi.service.ts",
		ham: "datHienThi",
		bang: "okrAlignment",
		lyDo: "đếm mọi căn chỉnh hai chiều để chặn sang giới hạn, kể cả căn chỉnh từ mục tiêu người gọi không xem được; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "updateKeyResultTrong",
		bang: "okrNguonKr",
		lyDo: "ghi: đọc nguồn máy của KR vừa qua assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrAlignment",
		lyDo: "ghi: đếm căn chỉnh trỏ KR để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrDoiDich",
		lyDo: "ghi: đếm lần đổi đích để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrDiemKr",
		lyDo: "ghi: đếm dòng điểm để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrBangChung",
		lyDo: "ghi: đếm bằng chứng để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "addAlignmentTrong",
		bang: "okrAlignment",
		lyDo: "ghi: tìm căn chỉnh trùng sau khi nguồn và đích đã qua điều kiện xem",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeAlignment",
		bang: "okrAlignment",
		lyDo: "ghi: đọc căn chỉnh theo mã rồi assertSuaMucTieu trên nguồn; đích giới hạn không có căn chỉnh",
	},
	{
		tep: "apps/api/src/okr/khep.ts",
		ham: "kiemDongKy",
		bang: "okrDiemKr",
		lyDo: "cổng pha chấm điểm → đã đóng phải đếm mọi KR chưa chấm, kể cả giới hạn; chỉ quản trị gọi, chỉ ra số — bảng chấm dùng dongKyChoNguoiXem có điều kiện",
	},
	{
		tep: "apps/api/src/okr/okr-khep.service.ts",
		ham: "bangChamCua",
		bang: "okrDiemKr",
		lyDo: "đọc thang điểm của chu kỳ từ một dòng bất kỳ; không trả dòng, không nêu mục tiêu",
	},
	{
		tep: "apps/api/src/okr/okr-khep.service.ts",
		ham: "chamKr",
		bang: "okrDiemKr",
		lyDo: "ghi điểm sau cổng ghiDuocKr",
	},
	{
		tep: "apps/api/src/okr/okr-khep.service.ts",
		ham: "ghiDieuHocDuoc",
		bang: "okrNhinLai",
		lyDo: "ghi điều học được sau assertSuaMucTieu",
	},
	{
		tep: "apps/api/src/okr/okr-khep.service.ts",
		ham: "mangSang",
		bang: "okrMangSang",
		lyDo: "ghi: tìm lần mang sang trùng sau assertSuaMucTieu (đã qua điều kiện xem); chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "goBangChung",
		bang: "okrBangChung",
		lyDo: "ghi: đọc bằng chứng theo mã rồi qua krDeGhi và ghiDuocKr",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecTraoDoi",
		bang: "okrFollow",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "lienQuanOkr",
		bang: "okrFollow",
		lyDo: "chỉ đếm dòng theo dõi của chính người gọi; ra có/không, không nêu mục tiêu",
	},
	{
		tep: "apps/agent/agent/lib/okr-sheets.ts",
		ham: "docVaGhi",
		bang: "okrNguonKr",
		lyDo: "máy đọc Google Sheets cho KR nguồn bảng tính, không có người xem",
	},
	{
		tep: "apps/api/src/okr/okr-access.service.ts",
		ham: "assertSuaKr",
		bang: "okrKeyResult",
		lyDo: "cổng ghi KR: người phụ trách KR hay người sửa được đơn vị đều xem được mục tiêu; ghiSoKr hỏi điều kiện xem trước (docKr) để trả 404",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "kiemTranMucTieu",
		bang: "okrObjective",
		lyDo: "đếm trần mục tiêu của đơn vị khi ghi — trần tính cả mục tiêu giới hạn, chỉ ra số, không tên",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "trangThai",
		bang: "okrObjective",
		lyDo: "đọc trạng thái trong giao dịch ghi sau cổng quyền sửa",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "phaCua",
		bang: "okrObjective",
		lyDo: "đọc pha chu kỳ trong giao dịch ghi sau cổng quyền sửa",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "taoMucTieuTrongTx",
		bang: "okrObjective",
		lyDo: "ghi: đếm vị trí trong chu kỳ, không trả hàng nào",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "updateObjectiveTrong",
		bang: "okrObjective",
		lyDo: "ghi: đọc lại hàng sau assertSuaMucTieu",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "congBoTrongGiaoDich",
		bang: "okrKeyResult",
		lyDo: "ghi: đếm KR của mục tiêu vừa qua assertSuaMucTieu (publishObjective) hay assertXemMucTieu và người duyệt (duyetMucTieu); chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "khoaMucTieu",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng mục tiêu FOR UPDATE trong giao dịch ghi; mọi lời gọi (publishObjective, guiDuyet, duyetMucTieu, traLaiMucTieu, rutDuyet) đã qua assertXemMucTieu trước",
	},
	{
		tep: "apps/api/src/okr/okr-duyet.service.ts",
		ham: "guiDuyet",
		bang: "okrKeyResult",
		lyDo: "ghi: đếm KR của mục tiêu vừa qua assertSuaMucTieuCoQuyen để chặn gửi duyệt khi chưa có KR; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr-duyet.service.ts",
		ham: "rutDuyet",
		bang: "okrTrail",
		lyDo: "ghi: đọc người gửi duyệt gần nhất của mục tiêu vừa qua assertXemMucTieu; chỉ so với người gọi, không trả ra",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecChoDuyet",
		bang: "okrObjective",
		lyDo: "nhắc buổi sáng đọc cả lô mục tiêu chờ duyệt cho mọi người duyệt; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecChoDuyet",
		bang: "okrTrail",
		lyDo: "nhắc buổi sáng đọc người gửi duyệt của cả lô; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecTraLai",
		bang: "okrTrail",
		lyDo: "nhắc buổi sáng đọc vết trả lại và gửi duyệt của cả lô; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecTraLai",
		bang: "okrObjective",
		lyDo: "nhắc buổi sáng đọc cả lô mục tiêu bị trả lại; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "createKeyResult",
		bang: "okrKeyResult",
		lyDo: "ghi: đếm KR để tính trần và vị trí, sau assertSuaMucTieu",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "updateKeyResultTrong",
		bang: "okrKeyResult",
		lyDo: "ghi: đọc lại KR sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrKeyResult",
		lyDo: "ghi: đọc lại KR sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrCheckIn",
		lyDo: "ghi: đếm lần cập nhật để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrSoChup",
		lyDo: "ghi: đếm số chụp để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrGhiNhan",
		lyDo: "ghi: đếm ghi nhận để chặn xoá, chỉ ra có/không",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "okrViecKr",
		lyDo: "ghi: đọc việc của KR để gỡ kèm vết go-viec, sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "updateKeyResultTrong",
		bang: "tho:okrKeyResult",
		lyDo: "khoá hàng KR FOR UPDATE sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "removeKeyResult",
		bang: "tho:okrKeyResult",
		lyDo: "khoá hàng KR FOR UPDATE sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "addAlignmentTrong",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng mục tiêu nguồn FOR UPDATE sau assertSuaMucTieu",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "addAlignmentTrong",
		bang: "tho:okrKeyResult",
		lyDo: "khoá hàng KR đích FOR SHARE; đích đọc ngay sau qua dichCanChinh có điều kiện xem",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "phanTichNhap",
		bang: "okrObjective",
		lyDo: "nhập bảng tính: tìm tiêu đề trùng trong đơn vị người nhập sửa được (hay quản trị) — người đó xem được mọi mục tiêu cấp đơn vị ấy",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "applyImport",
		bang: "okrObjective",
		lyDo: "nhập bảng tính: đếm vị trí và trùng khi ghi, không trả hàng nào",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "objective",
		bang: "okrTrail",
		lyDo: "okrTrail không có quan hệ objective; mục tiêu vừa qua điều kiện xem ở docMucTieu, mỗi dòng đi qua vetChoNguoiXem",
	},
	{
		tep: "apps/api/src/okr/okr-xem.service.ts",
		ham: "moHopTuan",
		bang: "okrTrail",
		lyDo: "đọc dòng mo-hop-tuan của chính người gọi để gộp lần mở, dòng không trỏ mục tiêu",
	},
	{
		tep: "apps/api/src/okr/khep.ts",
		ham: "chotKyCham",
		bang: "okrKeyResult",
		lyDo: "sang chấm điểm: đếm KR nguồn CRM thiếu số ngày cuối và ghi dòng điểm cho mọi KR đã công bố, kể cả giới hạn; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr-khep.service.ts",
		ham: "mangSang",
		bang: "okrObjective",
		lyDo: "ghi: đọc lại mục tiêu nguồn và đếm vị trí trong chu kỳ đích sau assertSuaMucTieu (đã qua điều kiện xem); vị trí chỉ là số",
	},
	{
		tep: "apps/api/src/okr/okr-khep.service.ts",
		ham: "mangSang",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng mục tiêu FOR UPDATE sau assertSuaMucTieu (đã qua điều kiện xem)",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "krDeGhi",
		bang: "okrKeyResult",
		lyDo: "cổng ghi việc KR: theo sau là ghiDuocKr (người phụ trách KR hay người sửa được đơn vị đều xem được)",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "viecCo",
		bang: "okrViecKr",
		lyDo: "cổng ghi việc: theo sau là krDeGhi và ghiDuocKr hay người làm của chính việc",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "themViec",
		bang: "okrViecKr",
		lyDo: "ghi: tính vị trí cuối sau cổng ghiDuocKr",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "ganSangKien",
		bang: "okrViecKr",
		lyDo: "ghi: tính vị trí cuối sau cổng ghiDuocKr",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "themBangChung",
		bang: "okrKeyResult",
		lyDo: "ghi bằng chứng: đọc kiểu và số hiện tại của KR vừa qua krDeGhi và ghiDuocKr",
	},
	{
		tep: "apps/api/src/okr/okr-canh-kr.service.ts",
		ham: "goGhiNhan",
		bang: "okrGhiNhan",
		lyDo: "ghi: chỉ người gửi hay quản trị gỡ được, đọc hàng của chính mã đưa vào",
	},
	{
		tep: "apps/api/src/okr/okr-trao-doi.service.ts",
		ham: "transferPreview",
		bang: "okrKeyResult",
		lyDo: "chỉ quản trị (canManageOnboarding) — quản trị xem mọi mục tiêu; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr-trao-doi.service.ts",
		ham: "transferPreview",
		bang: "okrObjective",
		lyDo: "chỉ quản trị (canManageOnboarding) — quản trị xem mọi mục tiêu; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr-trao-doi.service.ts",
		ham: "transferPreview",
		bang: "okrViecKr",
		lyDo: "chỉ quản trị (canManageOnboarding) — quản trị xem mọi mục tiêu; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/okr-trao-doi.service.ts",
		ham: "transferWork",
		bang: "okrKeyResult",
		lyDo: "ghi, chỉ quản trị — quản trị xem mọi mục tiêu",
	},
	{
		tep: "apps/api/src/okr/okr-trao-doi.service.ts",
		ham: "transferWork",
		bang: "okrObjective",
		lyDo: "ghi, chỉ quản trị — quản trị xem mọi mục tiêu",
	},
	{
		tep: "apps/api/src/okr/okr-trao-doi.service.ts",
		ham: "transferWork",
		bang: "okrViecKr",
		lyDo: "ghi, chỉ quản trị — quản trị xem mọi mục tiêu",
	},
	{
		tep: "apps/api/src/okr/okr-so.service.ts",
		ham: "datNguonKr",
		bang: "okrKeyResult",
		lyDo: "ghi nguồn sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr-so.service.ts",
		ham: "datNguonKr",
		bang: "tho:okrKeyResult",
		lyDo: "khoá hàng KR FOR UPDATE sau assertSuaKr",
	},
	{
		tep: "apps/api/src/okr/okr-cap-nhat.service.ts",
		ham: "guiCapNhat",
		bang: "okrKeyResult",
		lyDo: "ghi cập nhật tuần: mỗi KR qua ghiDuocKr (người phụ trách KR hay người sửa được đơn vị đều xem được)",
	},
	{
		tep: "apps/api/src/okr/okr-mau.service.ts",
		ham: "taoTuMau",
		bang: "okrObjective",
		lyDo: "ghi: đếm vị trí trong chu kỳ, không trả hàng nào",
	},
	{
		tep: "apps/api/src/okr/hien-thi.ts",
		ham: "locXemTrongVet",
		bang: "okrKeyResult",
		lyDo: "chỉ lấy objectiveId của KR được nêu trong vết để che; không trả hàng; mục tiêu tra ngay sau có điều kiện xem",
	},
	{
		tep: "packages/db/src/okr-don-vi.ts",
		ham: "demOkrCuaDonVi",
		bang: "okrObjective",
		lyDo: "đếm để chặn lưu trữ, xoá hẳn đơn vị — phải đếm cả mục tiêu giới hạn; chỉ ra số",
	},
	{
		tep: "packages/db/src/okr-don-vi.ts",
		ham: "demOkrTheoDonVi",
		bang: "okrObjective",
		lyDo: "org.tree và onboarding.listDepartments đếm OKR mở và lịch sử theo đơn vị để nói trước số mục tiêu chặn lưu trữ, xoá hẳn — phải đếm cả mục tiêu giới hạn như demOkrCuaDonVi; chỉ ra số theo mã đơn vị, không mã hay tên mục tiêu",
	},
	{
		tep: "apps/api/src/okr/okr-tai-co-cau.service.ts",
		ham: "khoaLo",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng mục tiêu FOR UPDATE trước khi chuyển đơn vị; mã lấy từ lô đã qua điều kiện xem ngay trên, không trả hàng nào",
	},
	{
		tep: "apps/api/src/okr/okr-tai-co-cau.service.ts",
		ham: "vuotTran",
		bang: "okrObjective",
		lyDo: "ghi: quản trị chuyển OKR, đếm mục tiêu của đơn vị nhận theo chu kỳ để so trần chương trình như kiemTranMucTieu — trần tính cả mục tiêu giới hạn; chỉ ra số",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "docKr",
		bang: "okrKeyResult",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecKr",
		bang: "okrCheckIn",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecGiao",
		bang: "okrTrail",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecGiao",
		bang: "okrKeyResult",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecGiao",
		bang: "okrObjective",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecTraoDoi",
		bang: "okrComment",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecTraoDoi",
		bang: "okrCheckIn",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "viecTraoDoi",
		bang: "okrGhiNhan",
		lyDo: "nhắc buổi sáng đọc cả lô cho mọi người nhận; viecOkrCanNhac lọc từng người bằng dieuKienXemMucTieu (locTheoQuyenXem) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "lienQuanOkr",
		bang: "okrKeyResult",
		lyDo: "chỉ đếm KR của chính người gọi (người phụ trách KR luôn xem được); ra có/không",
	},
	{
		tep: "packages/db/src/okr-nhac.ts",
		ham: "lienQuanOkr",
		bang: "okrObjective",
		lyDo: "chỉ đếm mục tiêu người gọi phụ trách (người phụ trách luôn xem được); ra có/không",
	},
	{
		tep: "packages/db/src/okr-tro-ly.ts",
		ham: "donViCuaMucTieu",
		bang: "okrObjective",
		lyDo: "Trợ lý OKR tra đơn vị để tính phạm vi bật — không trả tiêu đề; xepViecTroLy đã hỏi điều kiện xem của người yêu cầu trước",
	},
	{
		tep: "packages/db/src/okr-tro-ly.ts",
		ham: "taoViecDeXuat",
		bang: "okrObjective",
		lyDo: "xếp việc đề xuất đọc mốc cập nhật của mục tiêu và mã KR để băm khoá, không trả tiêu đề; xepViecTroLy hỏi điều kiện xem của người yêu cầu trước (từ chối khong-xem-duoc), xepLuotAnSauKhiLuu chạy sau khi người lưu vừa qua assertSuaMucTieu/assertSuaKr — người sửa được luôn xem được",
	},
	{
		tep: "packages/db/src/okr-tro-ly.ts",
		ham: "nacCuaMucTieu",
		bang: "okrKeyResult",
		lyDo: "tra mục tiêu của KR để tính nấc bật theo đơn vị, chỉ ra objectiveId; lối gọi (troLySanSang, xepViecTroLy, tác tử trước khi gửi) đã hỏi điều kiện xem của người yêu cầu",
	},
	{
		tep: "packages/db/src/okr-de-xuat.ts",
		ham: "danhSachDeXuat",
		bang: "okrObjective",
		lyDo: "thư viện; lối gọi duy nhất troLyDanhSach đọc mục tiêu qua dieuKienXemMucTieu trước — người không xem được nhận danh sách rỗng như mã không có",
	},
	{
		tep: "packages/db/src/okr-xu-huong.ts",
		ham: "docDiemXuHuong",
		bang: "okrKeyResult",
		lyDo: "thư viện; lối gọi duy nhất xuHuongKr đọc KR qua điều kiện xem trước (404 như mã không có); chỉ ra số",
	},
	{
		tep: "packages/db/src/okr-xu-huong.ts",
		ham: "docDiemXuHuong",
		bang: "okrSoChup",
		lyDo: "thư viện; lối gọi duy nhất xuHuongKr đọc KR qua điều kiện xem trước; chỉ ra số",
	},
	{
		tep: "packages/db/src/okr-xu-huong.ts",
		ham: "docDiemXuHuong",
		bang: "okrCheckIn",
		lyDo: "thư viện; lối gọi duy nhất xuHuongKr đọc KR qua điều kiện xem trước; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/tro-ly.service.ts",
		ham: "troLyQuyet",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng FOR UPDATE theo mã mục tiêu của dòng đề xuất, không đọc cột nào; điều kiện xem hỏi ngay sau (xemDuoc) — không xem được thì 404 cùng câu với mã đề xuất không có",
	},
	{
		tep: "apps/api/src/okr/tro-ly.service.ts",
		ham: "troLyQuyet",
		bang: "okrObjective",
		lyDo: "ghi: lấy id và cycleId của mục tiêu theo dòng đề xuất để kiểm kỳ chưa ẩn và khoá hàng; không trả ra ngoài, xemDuoc chặn ngay sau bằng 404",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "cycles",
		bang: "okrTrail",
		lyDo: "đọc vết an-chu-ky theo mã chu kỳ để nói lý do ẩn chu kỳ; dòng vết cấp chu kỳ, không mang mã hay tiêu đề mục tiêu",
	},
	{
		tep: "apps/api/src/okr/okr-hoi-y.service.ts",
		ham: "tinhTrangCongBo",
		bang: "okrObjective",
		lyDo: "đếm mục tiêu cấp công ty trong chu kỳ để so trần chương trình như kiemTranMucTieu — trần tính cả mục tiêu giới hạn; chỉ ra số",
	},
	{
		tep: "apps/api/src/okr/tro-ly.service.ts",
		ham: "assertConHieuLuc",
		bang: "okrObjective",
		lyDo: "ghi: đọc tiêu đề hiện hành để so với dòng đề xuất sau khi troLyQuyet đã qua xemDuoc và assertSuaDong; không trả ra ngoài",
	},
	{
		tep: "apps/api/src/okr/tro-ly.service.ts",
		ham: "luotTu",
		bang: "okrObjective",
		lyDo: "chỉ troLyAn gọi, sau assertQuanTri; quản trị xem được mọi mục tiêu (§4)",
	},
	{
		tep: "apps/api/src/okr/tro-ly-so-do.ts",
		ham: "hoanTacTrong",
		bang: "okrTrail",
		lyDo: "số đo Trợ lý OKR chỉ quản trị (troLyAn, troLySoDo qua assertQuanTri); đếm lần hoàn tác, không trả vết; quản trị xem được mọi mục tiêu (§4)",
	},
	{
		tep: "apps/api/src/okr/dem-gop-y.ts",
		ham: "demGopYCho",
		bang: "okrObjective",
		lyDo: "chỉ nhận id mục tiêu người gọi đã đọc qua dieuKienXemMucTieu (okr.service docMucTieu, okr-xem danh sách theo đơn vị); trả số góp ý chờ cho đúng các id đó, chỉ đếm mục tiêu người gọi sửa được hoặc ghi được KR",
	},
	{
		tep: "apps/api/src/okr/soan-so-do.service.ts",
		ham: "mucTieuTuNhap",
		bang: "okrTrail",
		lyDo: "số đo soạn OKR chỉ quản trị (soan.soDo qua assertQuanTri); đọc vết tạo để biết mục tiêu nào ra từ cuộc soạn, chỉ trả số đếm; quản trị xem được mọi mục tiêu (§4)",
	},
	{
		tep: "apps/api/src/okr/soan-so-do.service.ts",
		ham: "mucTieuTuNhap",
		bang: "okrObjective",
		lyDo: "số đo soạn OKR chỉ quản trị (soan.soDo qua assertQuanTri); đọc ngày tạo và ngày công bố để đếm tỷ lệ công bố, không trả tiêu đề; quản trị xem được mọi mục tiêu (§4)",
	},
	{
		tep: "packages/db/src/okr-chi-so.ts",
		ham: "chupKrCrm",
		bang: "okrKeyResult",
		lyDo: "máy chụp số hằng ngày, không có người xem; chỉ đọc nguồn và ngày chu kỳ",
	},
	{
		tep: "packages/db/src/okr-chi-so.ts",
		ham: "chupKrCrm",
		bang: "okrSoChup",
		lyDo: "máy chụp số hằng ngày: đếm hàng mới hơn để quyết ghi currentValue",
	},
	{
		tep: "apps/agent/agent/lib/okr-chup.ts",
		ham: "chupSoOkr",
		bang: "okrKeyResult",
		lyDo: "máy chụp số hằng ngày, không có người xem",
	},
	{
		tep: "apps/agent/agent/lib/okr-chup.ts",
		ham: "ghiBangTinh",
		bang: "okrSoChup",
		lyDo: "máy chụp số hằng ngày: đếm hàng mới hơn để quyết ghi currentValue",
	},
	{
		tep: "packages/db/src/okr-tom-tat.ts",
		ham: "demLanTrongCuaSo",
		bang: "okrCheckIn",
		lyDo: "đếm lần cập nhật trong cửa sổ của một phòng; mucTieuTrongGoi lọc Mục tiêu công khai (boGioiHan), đã công bố, của đúng phòng; chỉ ra số",
	},
	{
		tep: "packages/db/src/okr-tom-tat.ts",
		ham: "krSoTrongGoi",
		bang: "okrKeyResult",
		lyDo: "đọc KR cho gói tóm tắt của máy, không có người xem; cùng hàm phụ mucTieuTrongGoi lọc công khai (boGioiHan), đã công bố, của đúng phòng",
	},
	{
		tep: "packages/db/src/okr-tom-tat.ts",
		ham: "nguonHienTai",
		bang: "okrCheckIn",
		lyDo: "đọc lần cập nhật nguồn lúc hiện; docTomTatChoNguoiXem lọc theo người xem bằng dieuKienXemMucTieu (xemDuoc) trước khi trả câu",
	},
	{
		tep: "packages/db/src/okr-tom-tat.ts",
		ham: "nguonHienTai",
		bang: "okrKeyResult",
		lyDo: "đọc KR của nguồn lúc hiện; docTomTatChoNguoiXem bỏ câu có nguồn thuộc Mục tiêu người xem không xem được (dieuKienXemMucTieu) trước khi trả",
	},
	{
		tep: "packages/db/src/okr-tom-tat.ts",
		ham: "banTuanChoQuanTri",
		bang: "okrCheckIn",
		lyDo: "khối tóm tắt ở Sức khoẻ chương trình; troLyTomTatQuanTri chặn mọi vai trừ quản trị chương trình (quanTriChuongTrinh) trước khi gọi",
	},
];

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

function diCay(thuMuc, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, ra);
		else if (DUOI.test(ten) && !LA_THU.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		/\.tsx$/.test(duong) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

const tenThuoc = (n) => {
	if (ts.isPropertyAccessExpression(n)) return n.name.text;
	if (
		ts.isElementAccessExpression(n) &&
		ts.isStringLiteralLike(n.argumentExpression)
	)
		return n.argumentExpression.text;
	if (ts.isIdentifier(n)) return n.text;
	return null;
};

function hamCua(n) {
	for (let p = n.parent; p; p = p.parent) {
		if ((ts.isMethodDeclaration(p) || ts.isFunctionDeclaration(p)) && p.name)
			return p.name.getText();
		if (
			ts.isVariableDeclaration(p) &&
			p.parent?.parent?.parent &&
			ts.isSourceFile(p.parent.parent.parent)
		)
			return p.name.getText();
	}
	return "(ngoai-ham)";
}

function coDieuKien(nut) {
	let co = false;
	const di = (n) => {
		if (co) return;
		if (ts.isIdentifier(n) && DIEU_KIEN.has(n.text)) co = true;
		else ts.forEachChild(n, di);
	};
	di(nut);
	return co;
}

const BANG_THO = new RegExp(`"(${BANG.join("|")})"`, "g");

function soiTep(ten, duong, chu) {
	if (!BANG.some((b) => chu.includes(b))) return [];
	const sf = cay(duong, chu);
	const ra = [];
	const dong = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
	const di = (n) => {
		if (ts.isCallExpression(n)) {
			const phuongThuc = tenThuoc(n.expression);
			const doiTuong =
				ts.isPropertyAccessExpression(n.expression) ||
				ts.isElementAccessExpression(n.expression)
					? tenThuoc(n.expression.expression)
					: null;
			if (phuongThuc && DOC.has(phuongThuc) && BANG.includes(doiTuong))
				ra.push({
					tep: ten,
					duong,
					dong: dong(n),
					ham: hamCua(n),
					bang: doiTuong,
					loai: phuongThuc,
					dieuKien: n.arguments.some(coDieuKien),
				});
			if (phuongThuc && SQL_THO.has(phuongThuc)) {
				const sql = n.arguments.map((a) => a.getText(sf)).join(" ");
				for (const m of sql.matchAll(BANG_THO))
					ra.push({
						tep: ten,
						duong,
						dong: dong(n),
						ham: hamCua(n),
						bang: `tho:${m[1]}`,
						loai: phuongThuc,
						dieuKien: false,
					});
			}
		}
		if (
			ts.isTaggedTemplateExpression(n) &&
			SQL_THO.has(tenThuoc(n.tag) ?? "")
		) {
			const sql = n.template.getText(sf);
			for (const m of sql.matchAll(BANG_THO))
				ra.push({
					tep: ten,
					duong,
					dong: dong(n),
					ham: hamCua(n),
					bang: `tho:${m[1]}`,
					loai: tenThuoc(n.tag),
					dieuKien: false,
				});
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function dinhNghia(chu, ten) {
	const sf = cay("x.ts", chu);
	let so = 0;
	const di = (n) => {
		if (ts.isFunctionDeclaration(n) && n.name?.text === ten) so += 1;
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.name.text === ten &&
			n.initializer &&
			(ts.isArrowFunction(n.initializer) ||
				ts.isFunctionExpression(n.initializer))
		)
			so += 1;
		ts.forEachChild(n, di);
	};
	di(sf);
	return so;
}

function nhapTuOkr(chu) {
	const sf = cay("x.ts", chu);
	const ra = [];
	for (const s of sf.statements)
		if (
			(ts.isImportDeclaration(s) || ts.isExportDeclaration(s)) &&
			s.moduleSpecifier &&
			ts.isStringLiteralLike(s.moduleSpecifier) &&
			/(^|\/)okr(\/|$)/.test(s.moduleSpecifier.text)
		)
			ra.push(s.moduleSpecifier.text);
	return ra;
}

function docDuongDoc() {
	if (!existsSync(DUONG_DOC))
		return { loi: `khong co ${tuongDoi(DUONG_DOC)}`, dong: [] };
	let tho;
	try {
		tho = JSON.parse(readFileSync(DUONG_DOC, "utf8"));
	} catch (e) {
		return { loi: `duong-doc-okr.json khong doc duoc: ${e.message}`, dong: [] };
	}
	const doc = dongDuongDoc.safeParse(tho);
	if (!doc.success)
		return {
			loi: `duong-doc-okr.json phai la mang { tep, thuTuc: string[] (>=1), lyDo }: ${doc.error.message}`,
			dong: [],
		};
	return { loi: null, dong: doc.data };
}

function tepCanSoi(thay, them) {
	const ra = new Map();
	for (const g of GOC_SOI)
		for (const duong of diCay(join(GOC, g), [])) ra.set(tuongDoi(duong), duong);
	for (const [ten, duong] of thay) ra.set(ten, duong);
	for (const [ten, duong] of them) ra.set(ten, duong);
	return ra;
}

function caXem(thay = new Map(), them = new Map()) {
	const hong = [];
	const tep = tepCanSoi(thay, them);
	const loiGoi = [...tep].flatMap(([ten, duong]) =>
		soiTep(ten, duong, readFileSync(duong, "utf8")),
	);
	const khoaMien = (x) => `${x.tep}#${x.ham}#${x.bang}`;
	const mien = new Map(MIEN_XEM.map((m) => [khoaMien(m), m]));
	const dungMien = new Set();
	for (const m of MIEN_XEM)
		if (!m.lyDo || m.lyDo.trim().length === 0)
			hong.push(`MIEN_XEM thieu ly do: ${khoaMien(m)}`);
	let soDieuKien = 0;
	let soMien = 0;
	for (const g of loiGoi) {
		const o = `${g.tep}${g.duong === join(GOC, g.tep) ? "" : ` (${g.duong})`}:${g.dong}`;
		if (g.dieuKien) {
			soDieuKien += 1;
			continue;
		}
		const k = khoaMien(g);
		if (mien.has(k)) {
			soMien += 1;
			dungMien.add(k);
			continue;
		}
		hong.push(
			`thieu dieu kien xem: ${o} ${g.ham} ${g.bang}.${g.loai} — khong co dieuKienXemMucTieu / boGioiHan, khong co dong MIEN_XEM`,
		);
	}
	for (const m of MIEN_XEM)
		if (!dungMien.has(khoaMien(m)))
			hong.push(`MIEN_XEM thua (khong khop loi goi nao): ${khoaMien(m)}`);

	const duongDoc = docDuongDoc();
	if (duongDoc.loi) hong.push(duongDoc.loi);
	const coKhai = new Set(duongDoc.dong.map((d) => d.tep));
	const ngoaiOkr = loiGoi.filter(
		(g) => g.tep.startsWith(GOC_API) && !g.tep.startsWith(GOC_OKR),
	);
	for (const g of ngoaiOkr)
		if (!coKhai.has(g.tep))
			hong.push(
				`thieu trong duong-doc-okr.json: ${g.tep}${g.duong === join(GOC, g.tep) ? "" : ` (${g.duong})`}:${g.dong} ${g.bang}.${g.loai}`,
			);
	for (const d of duongDoc.dong)
		if (!ngoaiOkr.some((g) => g.tep === d.tep))
			hong.push(
				`duong-doc-okr.json thua: ${d.tep} khong con loi doc bang OKR ngoai okr/`,
			);

	const luat = VUNG_LUAT.flatMap((v) => diCay(join(GOC, v), []));
	for (const ten of ["xemDuocMucTieu", "dieuKienXemMucTieu"]) {
		const noi = luat.flatMap((d) => {
			const so = dinhNghia(readFileSync(d, "utf8"), ten);
			return so > 0 ? [`${tuongDoi(d)} x${so}`] : [];
		});
		const tong = noi.reduce((a, x) => a + Number(x.split(" x")[1]), 0);
		if (tong !== 1)
			hong.push(
				`${ten} dinh nghia ${tong} lan (can dung 1): ${noi.join(", ")}`,
			);
	}
	for (const d of diCay(join(GOC, GOC_TO_CHUC), [])) {
		const nhap = nhapTuOkr(readFileSync(d, "utf8"));
		if (nhap.length > 0)
			hong.push(`to-chuc nhap tu okr: ${tuongDoi(d)} «${nhap.join(", ")}»`);
	}

	const theoBang = new Map();
	for (const g of loiGoi) theoBang.set(g.bang, (theoBang.get(g.bang) ?? 0) + 1);
	if (loiGoi.length <= SAN_LOI_GOI)
		hong.push(
			`chi thay ${loiGoi.length} loi goi (can > ${SAN_LOI_GOI}) — luoi soi hong`,
		);
	return {
		hong,
		loiGoi,
		theoBang,
		soDieuKien,
		soMien,
		soTep: tep.size,
		ngoaiOkr: ngoaiOkr.length,
		duongDoc: duongDoc.dong.length,
	};
}

function inKetQua(kq) {
	console.log(
		`soi-ma --ca xem: ${kq.soTep} tep, ${kq.loiGoi.length} loi doc bang OKR (${kq.soDieuKien} co dieu kien, ${kq.soMien} mien theo MIEN_XEM ${MIEN_XEM.length} dong)`,
	);
	for (const b of [...BANG, ...BANG.map((x) => `tho:${x}`)])
		if (kq.theoBang.has(b)) console.log(`  ${b}: ${kq.theoBang.get(b)}`);
	console.log(
		`  ngoai apps/api/src/okr trong apps/api/src: ${kq.ngoaiOkr} loi goi; duong-doc-okr.json: ${kq.duongDoc} dong${kq.duongDoc === 0 ? ` — ${LY_DO_DUONG_DOC_RONG}` : ""}`,
	);
}

function lanhXem() {
	const kq = caXem();
	inKetQua(kq);
	for (const h of kq.hong) console.log(`HONG ${h}`);
	console.log(kq.hong.length === 0 ? "XANH" : `DO: ${kq.hong.length} loi`);
	process.exit(kq.hong.length === 0 ? 0 : 1);
}

function khongDoDuoc(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function chieuDoXem() {
	const nguon = "apps/api/src/okr/okr-xem.service.ts";
	const goc = readFileSync(join(GOC, nguon), "utf8");
	const sf = cay(nguon, goc);
	let bo = null;
	const di = (n) => {
		if (bo) return;
		if (
			ts.isCallExpression(n) &&
			tenThuoc(n.expression) === "findMany" &&
			ts.isPropertyAccessExpression(n.expression) &&
			tenThuoc(n.expression.expression) === "okrObjective"
		) {
			const tim = (x) => {
				if (bo) return;
				if (
					ts.isCallExpression(x) &&
					ts.isIdentifier(x.expression) &&
					x.expression.text === "dieuKienXemMucTieu"
				)
					bo = {
						tu: x.getStart(sf),
						den: x.getEnd(),
						dong: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
					};
				else ts.forEachChild(x, tim);
			};
			n.arguments.forEach(tim);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	if (!bo)
		khongDoDuoc(
			`${nguon} khong con okrObjective.findMany nao goi dieuKienXemMucTieu de bo`,
		);
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-xem-"));
	const banSao = join(thuMuc, basename(nguon));
	writeFileSync(banSao, `${goc.slice(0, bo.tu)}{}${goc.slice(bo.den)}`);
	const tenGia = "apps/api/src/gia-chieu-do/gia.service.ts";
	const tepGia = join(thuMuc, "gia.service.ts");
	writeFileSync(
		tepGia,
		"export async function docGia(db) {\n\treturn db.okrKeyResult.findMany({ include: { objective: true } });\n}\n",
	);
	let kq;
	try {
		kq = caXem(new Map([[nguon, banSao]]), new Map([[tenGia, tepGia]]));
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	for (const h of kq.hong) console.log(`HONG ${h}`);
	const ghim = [
		`thieu dieu kien xem: ${nguon} (${banSao}):${bo.dong}`,
		`thieu dieu kien xem: ${tenGia} (${tepGia}):2`,
		`thieu trong duong-doc-okr.json: ${tenGia} (${tepGia}):2`,
	];
	let lot = 0;
	for (const g of ghim) {
		const bat = kq.hong.some((h) => h.startsWith(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(
		`chieu do: ban sao ${nguon} bo dieuKienXemMucTieu khoi okrObjective.findMany dong ${bo.dong}, them ${tenGia} doc okrKeyResult kem objective khong dieu kien — ${ghim.length - lot}/${ghim.length} vi pham bi bat`,
	);
	process.exit(lot === 0 ? 1 : 0);
}

const MOC = "origin/onehub";
const TEP_DIFF_LUOT = join(TAM_HO_SO, "diff-luot.txt");
const LOAI_TRU_THIET_KE = new Set([
	"node_modules",
	".eve",
	".next",
	"dist",
	"build",
	"generated",
	".turbo",
]);
const THU_MUC_THU = new Set(["test", "tests", "__tests__"]);
const LA_THU_THIET_KE = /\.(spec|test|dom)\.(ts|tsx|mts|mjs|js)$/;
const VUNG_APP = /^apps\/app\/(?!app\/proto\/).+\.tsx$/;
const VUNG_MA =
	/^(apps|packages|scripts|_acceptance\/[^/]+\/rang)\/.+\.(ts|tsx|mts|mjs|js)$/;
const VUNG_CHU = /^apps\/app\/lib\/messages\/okr[^/]*\.ts$/;
const MUC_TU_DIEN = [
	{
		ten: "Mức hiển thị (mục tiêu)",
		mau: /^\*\*Mức hiển thị \(mục tiêu\)\*\*:/m,
	},
	{ ten: "Chờ duyệt / Người duyệt (OKR)", mau: /^\*\*Chờ duyệt[^*]*\*\*:/m },
	{ ten: "Chuyển OKR", mau: /^\*\*Chuyển OKR\*\*:/m },
	{ ten: "OKR mồ côi", mau: /^\*\*OKR mồ côi\*\*:/m },
];
const MUC_API = [
	{
		muc: "## OKR",
		can: [
			"dieuKienXemMucTieu",
			"xemDuocMucTieu",
			"boGioiHan",
			"khongThayMucTieu",
			"nguoiDuyetMucTieu",
			"chuyenDonVi",
			"moCoi",
		],
	},
	{
		muc: "## The organization tree",
		can: [
			"okrMo",
			"demOkrCuaDonVi",
			"@crm/db/okr-don-vi",
			"archiveDepartment",
			"lyDoKhongXoaPhongBan",
		],
	},
];
const DAU_HIEU = [
	{ nhan: "<table>", mau: /<table\b/ },
	{ nhan: "<h1>", mau: /<h1\b/ },
	{ nhan: "<h2>", mau: /<h2\b/ },
	{ nhan: "size-2 rounded-full", mau: /size-2\s+rounded-full/ },
	{ nhan: "divide-y", mau: /divide-y\b/ },
	{
		nhan: "rounded-lg border",
		mau: /rounded-lg\s+border\b|\bborder\s+rounded-lg/,
	},
	{ nhan: "navigator.clipboard", mau: /navigator\.clipboard/ },
	{ nhan: "AlertDialog", mau: /AlertDialog/ },
];
const CHAN = new Set(["DialogFooter", "SheetFooter", "DrawerFooter"]);
const BOC = new Set(["DialogClose", "SheetClose", "DrawerClose"]);
const LA_HUY = /Huỷ|Hủy|\bhuy\b|\bcancel\b/i;
const GHIM_THIET_KE = {
	chuThich: "chú thích mã",
	huy: "nút Huỷ không bọc DialogClose",
	thieuEn: "khoá chữ thiếu en",
};

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	}).trim();

const tenKhoa = (p) =>
	p.name && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name))
		? p.name.text
		: null;

function keoMoc() {
	if (git("rev-parse", "--is-shallow-repository") === "true")
		khongDoDuoc(
			`kho la ban sao nong (shallow) — ${MOC}...HEAD khong co merge-base tin duoc; chay git fetch --unshallow roi do lai`,
		);
	const goc = spawnSync("git", ["-C", GOC, "merge-base", "HEAD", MOC], {
		encoding: "utf8",
	});
	if (goc.status !== 0 || !goc.stdout.trim())
		khongDoDuoc(`khong tim duoc merge-base HEAD ${MOC}`);
	return goc.stdout.trim();
}

function tepDiff(loc) {
	return git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		`${MOC}...HEAD`,
	)
		.split("\n")
		.filter(Boolean);
}

const dongCua = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

const dongCuaChu = (chu, doan) =>
	chu.slice(0, chu.lastIndexOf(doan)).split("\n").length;

function banGoc(gocSo, t) {
	const r = spawnSync("git", ["-C", GOC, "show", `${gocSo}:${t}`], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return r.status === 0 ? r.stdout : "";
}

function dongThem(gocSo, t, duong) {
	const thu = mkdtempSync(join(tmpdir(), "soi-dong-them-"));
	try {
		const cu = join(thu, "cu");
		writeFileSync(cu, banGoc(gocSo, t));
		const r = spawnSync(
			"git",
			["diff", "--no-index", "-U0", "--no-color", cu, duong],
			{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
		);
		const them = new Set();
		for (const m of (r.stdout ?? "").matchAll(
			/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm,
		)) {
			const dau = Number(m[1]);
			const so = m[2] === undefined ? 1 : Number(m[2]);
			for (let k = 0; k < so; k += 1) them.add(dau + k);
		}
		return them;
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

const chuDong = (chu, them) =>
	chu
		.split("\n")
		.filter((_, k) => them.has(k + 1))
		.join("\n");

function chuThichTrong(sf) {
	const chu = sf.text;
	const gap = new Map();
	const themVao = (r) => {
		if (r) for (const c of r) gap.set(c.pos, c);
	};
	const di = (n) => {
		if (n.kind === ts.SyntaxKind.JsxText) return;
		themVao(ts.getLeadingCommentRanges(chu, n.pos));
		themVao(ts.getTrailingCommentRanges(chu, n.pos));
		for (const c of n.getChildren(sf)) di(c);
	};
	di(sf);
	return [...gap.values()]
		.sort((a, b) => a.pos - b.pos)
		.map((c) => ({
			dong: dongCua(sf, c.pos),
			chu: chu.slice(c.pos, c.end).split("\n")[0].slice(0, 60),
		}));
}

function soiDongThem(duong, ten, them) {
	const sf = cay(duong, readFileSync(duong, "utf8"));
	const hong = chuThichTrong(sf)
		.filter((c) => them.has(c.dong))
		.map((c) => `${GHIM_THIET_KE.chuThich}: ${ten}:${c.dong} «${c.chu}»`);
	const di = (n) => {
		if (
			ts.isTypeReferenceNode(n) &&
			n.typeName.getText(sf) === "Record" &&
			n.typeArguments?.length === 2 &&
			n.typeArguments[0].kind === ts.SyntaxKind.StringKeyword &&
			n.typeArguments[1].kind === ts.SyntaxKind.UnknownKeyword &&
			them.has(dongCua(sf, n.getStart(sf)))
		)
			hong.push(
				`Record<string, unknown>: ${ten}:${dongCua(sf, n.getStart(sf))}`,
			);
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

function dauHieuVeTay(chu, ten) {
	return DAU_HIEU.filter(({ mau }) => mau.test(chu)).map(
		({ nhan }) => `dấu hiệu vẽ tay: ${nhan} (${ten})`,
	);
}

const tenThe = (n) =>
	ts.isJsxElement(n)
		? n.openingElement.tagName.getText()
		: ts.isJsxSelfClosingElement(n)
			? n.tagName.getText()
			: null;

function nutHuy(duong, ten, them) {
	const sf = cay(duong, readFileSync(duong, "utf8"));
	const hong = [];
	const dem = { chan: 0, huy: 0 };
	const soiChan = (chan) => {
		dem.chan += 1;
		const di = (n, boc) => {
			const the = tenThe(n);
			if (the === "Button" && ts.isJsxElement(n)) {
				const chu = n.children.map((c) => c.getText(sf)).join(" ");
				if (LA_HUY.test(chu)) {
					dem.huy += 1;
					const dong = dongCua(sf, n.getStart(sf));
					if (!boc && them.has(dong))
						hong.push(`${GHIM_THIET_KE.huy}: ${ten}:${dong}`);
				}
			}
			const bocTiep = boc || (the !== null && BOC.has(the));
			ts.forEachChild(n, (c) => di(c, bocTiep));
		};
		ts.forEachChild(chan, (c) => di(c, false));
	};
	const tim = (n) => {
		if (ts.isJsxElement(n) && CHAN.has(tenThe(n))) soiChan(n);
		ts.forEachChild(n, tim);
	};
	tim(sf);
	return { hong, dem };
}

function boVo(n) {
	let e = n;
	while (
		e &&
		(ts.isAsExpression(e) ||
			ts.isSatisfiesExpression(e) ||
			ts.isParenthesizedExpression(e))
	)
		e = e.expression;
	return e;
}

function phang(obj, sf, tien, ra) {
	for (const p of obj.properties) {
		if (!ts.isPropertyAssignment(p)) {
			ra.set(`${tien}${p.getText(sf).slice(0, 40)}`, {
				gia: `(khong doc duoc: ${ts.SyntaxKind[p.kind]})`,
				dong: dongCua(sf, p.getStart(sf)),
			});
			continue;
		}
		const k = tenKhoa(p);
		if (k === null) continue;
		const g = boVo(p.initializer);
		if (ts.isObjectLiteralExpression(g)) phang(g, sf, `${tien}${k}.`, ra);
		else
			ra.set(`${tien}${k}`, {
				gia: ts.isStringLiteralLike(g) ? g.text : g.getText(sf),
				dong: dongCua(sf, p.getStart(sf)),
			});
	}
	return ra;
}

function khoaChu(chu, ten) {
	const sf = cay(`${ten}.ts`, chu);
	const bang = {};
	const di = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			(n.name.text === "vi" || n.name.text === "en") &&
			n.initializer
		) {
			const g = boVo(n.initializer);
			if (ts.isObjectLiteralExpression(g))
				bang[n.name.text] = phang(g, sf, "", new Map());
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return bang;
}

function soiChu(gocSo, t, duong, ten) {
	const hong = [];
	const nay = khoaChu(readFileSync(duong, "utf8"), ten);
	if (!nay.vi || !nay.en)
		return {
			hong: [`tệp chữ ${ten} không có hai bảng const vi / const en`],
			moi: 0,
		};
	const cu = khoaChu(banGoc(gocSo, t), `${ten}.goc`);
	const cuVi = cu.vi ?? new Map();
	const cuEn = cu.en ?? new Map();
	let moi = 0;
	for (const [k, v] of nay.vi) {
		if (cuVi.get(k)?.gia === v.gia && cuEn.has(k)) continue;
		moi += 1;
		const e = nay.en.get(k);
		if (!e)
			hong.push(`${GHIM_THIET_KE.thieuEn}: ${ten} «${k}» (dong ${v.dong})`);
		else if (e.gia === v.gia)
			hong.push(`khoá chữ vi và en trùng nhau: ${ten} «${k}» = «${v.gia}»`);
	}
	for (const [k, e] of nay.en)
		if (!nay.vi.has(k))
			hong.push(`khoá chữ chỉ có ở en: ${ten} «${k}» (dong ${e.dong})`);
	return { hong, moi };
}

function mucCua(chu, dau) {
	const i = chu.indexOf(`\n${dau}\n`);
	if (i === -1) return null;
	const sau = chu.slice(i + dau.length + 2);
	const het = sau.search(/\n## /);
	return het === -1 ? sau : sau.slice(0, het);
}

function soiTuDien() {
	const chu = readFileSync(join(GOC, "CONTEXT.md"), "utf8");
	const hong = [];
	for (const m of MUC_TU_DIEN) {
		const khop = m.mau.exec(chu);
		if (!khop) {
			console.log(`CONTEXT.md muc ${m.ten}: KHONG`);
			hong.push(`CONTEXT.md thiếu mục ${m.ten}`);
			continue;
		}
		const sau = chu.slice(khop.index);
		const het = sau.search(/\n\n/);
		const khoi = het === -1 ? sau : sau.slice(0, het);
		const thieu = [
			["_Avoid_:", /^_Avoid_:/m],
			["Vì sao:", /^Vì sao:/m],
			["dòng chốt", /(Chốt|chốt\s+tại\s+Cổng\s+Phạm\s+vi)/],
		]
			.filter(([, mau]) => !mau.test(khoi))
			.map(([ten]) => ten);
		console.log(
			`CONTEXT.md muc ${m.ten}: co${thieu.length > 0 ? `, THIEU ${thieu.join(", ")}` : " (nghia, dong chot, _Avoid_, Vi sao)"}`,
		);
		for (const t of thieu) hong.push(`CONTEXT.md mục ${m.ten} thiếu ${t}`);
	}
	return hong;
}

function soiApiMd() {
	const chu = readFileSync(join(GOC, "docs", "api.md"), "utf8");
	const hong = [];
	for (const { muc, can } of MUC_API) {
		const khoi = mucCua(chu, muc);
		if (khoi === null) {
			hong.push(`docs/api.md không có mục «${muc}»`);
			continue;
		}
		const thieu = can.filter((c) => !khoi.includes(c));
		console.log(
			`docs/api.md «${muc}»: ${can.length - thieu.length}/${can.length} (${can.join(", ")})`,
		);
		for (const t of thieu) hong.push(`docs/api.md mục «${muc}» thiếu «${t}»`);
	}
	return hong;
}

function goiKit() {
	const r = spawnSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
		],
		{ encoding: "utf8" },
	);
	if (r.status !== 0 || !r.stdout.trim())
		khongDoDuoc(
			`khong tim duoc design-gate.mjs cua bo kit acceptance-gate: ${(r.stderr ?? "").trim()}`,
		);
	return r.stdout.trim();
}

function caThietKe(gocSo, thay = new Map()) {
	const duongCua = (t) => thay.get(t) ?? join(GOC, t);
	const tenCua = (t) => thay.get(t) ?? t;
	const moi = new Set(tepDiff("A"));
	const doi = tepDiff("AM").filter((t) => existsSync(join(GOC, t)));
	const khongThu = (t) =>
		!t.split("/").some((p) => THU_MUC_THU.has(p)) && !LA_THU_THIET_KE.test(t);
	const khongLoaiTru = (t) =>
		!t.split("/").some((p) => LOAI_TRU_THIET_KE.has(p));
	const app = doi.filter((t) => VUNG_APP.test(t) && khongThu(t)).sort();
	const tepMa = doi.filter((t) => VUNG_MA.test(t) && khongLoaiTru(t)).sort();
	const tepChu = doi.filter((t) => VUNG_CHU.test(t)).sort();
	const them = new Map();
	for (const t of new Set([...app, ...tepMa]))
		them.set(t, dongThem(gocSo, t, duongCua(t)));

	console.log(`dai so sanh: ${MOC}...HEAD (merge-base ${gocSo.slice(0, 8)})`);
	console.log(`tep giao dien apps/app (${app.length}):`);
	for (const t of app)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(`tep ma soi dong them (${tepMa.length}):`);
	for (const t of tepMa)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(
		`tep chu okr (${tepChu.length}): ${tepChu.map(tenCua).join(", ")}`,
	);

	const hong = [];
	const kit = app.length > 0 ? goiKit() : null;
	const demHuy = { chan: 0, huy: 0 };
	for (const t of app) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				thay.has(t) ? duongCua(t) : t,
				"--mode",
				"static",
			],
			{ cwd: GOC, encoding: "utf8" },
		);
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const p0 = Number(ra.match(/"p0_count":\s*(\d+)/)?.[1] ?? Number.NaN);
		if (r.status !== 0 || p0 !== 0)
			hong.push(`design-gate P0: ${tenCua(t)} (ma ${r.status}, p0 ${p0})`);
		const chu = readFileSync(duongCua(t), "utf8");
		hong.push(...dauHieuVeTay(chuDong(chu, them.get(t)), tenCua(t)));
		const huy = nutHuy(duongCua(t), tenCua(t), them.get(t));
		hong.push(...huy.hong);
		demHuy.chan += huy.dem.chan;
		demHuy.huy += huy.dem.huy;
		console.log(
			`design-gate ${r.status === 0 && p0 === 0 ? "dat " : "HONG"} ${tenCua(t)} (p0 ${p0}; chan hop thoai ${huy.dem.chan}, nut huy ${huy.dem.huy})`,
		);
	}
	console.log(
		`chan hop thoai da soi: ${demHuy.chan} · nut Huy trong chan: ${demHuy.huy}`,
	);
	for (const t of tepMa)
		hong.push(...soiDongThem(duongCua(t), tenCua(t), them.get(t)));
	let khoaMoi = 0;
	for (const t of tepChu) {
		const r = soiChu(gocSo, t, duongCua(t), tenCua(t));
		khoaMoi += r.moi;
		hong.push(...r.hong);
	}
	console.log(`khoa chu moi hoac doi (vi): ${khoaMoi}`);
	hong.push(...soiTuDien());
	hong.push(...soiApiMd());
	const soTep = new Set([...app, ...tepMa, ...tepChu]).size;
	console.log(`tong tep da soi: ${soTep}`);
	return { hong, soTep, app, tepChu };
}

function ghiDiffLuot(gocSo) {
	const thongKe = git("diff", "--stat=200", `${MOC}...HEAD`);
	const danhSach = git(
		"diff",
		"--name-status",
		"--no-renames",
		`${MOC}...HEAD`,
	);
	mkdirSync(dirname(TEP_DIFF_LUOT), { recursive: true });
	writeFileSync(
		TEP_DIFF_LUOT,
		[
			`git diff ${MOC}...HEAD — merge-base ${gocSo}, HEAD ${git("rev-parse", "HEAD")}`,
			"",
			"## git diff --stat",
			"",
			thongKe,
			"",
			"## Danh sách tệp (git diff --name-status)",
			"",
			danhSach,
			"",
		].join("\n"),
	);
	console.log(
		`da ghi ${tuongDoi(TEP_DIFF_LUOT)} (${danhSach.split("\n").length} tep)`,
	);
}

function lanhThietKe() {
	const gocSo = keoMoc();
	if (gocSo === git("rev-parse", "HEAD")) {
		console.log(
			`diff ${MOC}...HEAD rong — HEAD ${gocSo.slice(0, 8)} da nam trong ${MOC} (nhanh da gop); khong soi, khong ghi gi`,
		);
		process.exit(0);
	}
	const { hong, soTep } = caThietKe(gocSo);
	if (soTep === 0) khongDoDuoc("diff khong co tep nao de soi");
	ghiDiffLuot(gocSo);
	chepSangBangChung([TEP_DIFF_LUOT], ["diff-luot.txt"]);
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

function chieuDoThietKe() {
	const gocSo = keoMoc();
	const doi = tepDiff("AM").filter((t) => existsSync(join(GOC, t)));
	const nguon = doi.find(
		(t) =>
			VUNG_APP.test(t) &&
			!t.split("/").some((p) => THU_MUC_THU.has(p)) &&
			!LA_THU_THIET_KE.test(t),
	);
	const nguonChu = doi.find((t) => VUNG_CHU.test(t));
	if (!nguon || !nguonChu)
		khongDoDuoc(
			"diff khong co tep giao dien apps/app hay tep chu okr nao de chep",
		);
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-thiet-ke-"));
	const tep = join(thuMuc, basename(nguon));
	const tepChu = join(thuMuc, basename(nguonChu));
	const goc = readFileSync(join(GOC, nguon), "utf8");
	const banSao = `${goc}\n// x\nexport function HopThoaiGia() {\n\treturn (\n\t\t<DialogFooter>\n\t\t\t<Button variant="outline">Huỷ</Button>\n\t\t</DialogFooter>\n\t);\n}\n`;
	writeFileSync(tep, banSao);
	const chuGoc = readFileSync(join(GOC, nguonChu), "utf8");
	const KHOA_DO = "thuChieuDo";
	const chuSao = chuGoc.replace(
		/^const vi = \{\n/m,
		`const vi = {\n\t${KHOA_DO}: "Thử chiều đỏ",\n`,
	);
	if (chuSao === chuGoc)
		khongDoDuoc(`khong chen duoc khoa chu vao ${nguonChu} — tep doi hinh`);
	writeFileSync(tepChu, chuSao);
	const dongChu = dongCuaChu(banSao, "\n// x\n") + 1;
	const dongNut = dongCuaChu(banSao, '<Button variant="outline">Huỷ</Button>');
	let kq;
	try {
		kq = caThietKe(
			gocSo,
			new Map([
				[nguon, tep],
				[nguonChu, tepChu],
			]),
		);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	for (const h of kq.hong) console.log(`HONG ${h}`);
	const ghim = [
		`${GHIM_THIET_KE.chuThich}: ${tep}:${dongChu}`,
		`${GHIM_THIET_KE.huy}: ${tep}:${dongNut}`,
		`${GHIM_THIET_KE.thieuEn}: ${tepChu} «${KHOA_DO}»`,
	];
	let lot = 0;
	for (const g of ghim) {
		const bat = kq.hong.some((h) => h.startsWith(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(
		`chieu do: ban sao ${nguon} chen \`// x\` va nut Huy khong DialogClose, ban sao ${nguonChu} them khoa thieu en — ${ghim.length - lot}/${ghim.length} vi pham bi bat`,
	);
	process.exit(lot === 0 ? 1 : 0);
}

const CA = {
	xem: { lanh: lanhXem, chieuDo: chieuDoXem },
	"thiet-ke": { lanh: lanhThietKe, chieuDo: chieuDoThietKe },
};

const i = process.argv.indexOf("--ca");
const ca = i === -1 ? null : (process.argv[i + 1] ?? "");
const chon = ca === null ? undefined : CA[ca];
if (!chon) {
	console.log(`KHONG DO DUOC: can --ca ${Object.keys(CA).join(" | ")}`);
	process.exit(2);
}
if (process.argv.includes("--chieu-do")) chon.chieuDo();
else chon.lanh();
