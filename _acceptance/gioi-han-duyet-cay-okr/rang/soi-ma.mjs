import {
	existsSync,
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
		ham: "updateKeyResult",
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
		ham: "addAlignment",
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
		ham: "createObjective",
		bang: "okrObjective",
		lyDo: "ghi: đếm vị trí trong chu kỳ, không trả hàng nào",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "updateObjective",
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
		ham: "updateKeyResult",
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
		ham: "updateKeyResult",
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
		ham: "addAlignment",
		bang: "tho:okrObjective",
		lyDo: "khoá hàng mục tiêu nguồn FOR UPDATE sau assertSuaMucTieu",
	},
	{
		tep: "apps/api/src/okr/okr.service.ts",
		ham: "addAlignment",
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
		ham: "canhBaoTran",
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
		ham: "xepViecTroLy",
		bang: "okrObjective",
		lyDo: "xếp việc đề xuất đọc mốc cập nhật của mục tiêu sau khi người yêu cầu qua điều kiện xem (từ chối khong-xem-duoc)",
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

const CA = {
	xem: { lanh: lanhXem, chieuDo: chieuDoXem },
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
