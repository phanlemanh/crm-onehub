---
schema_version: 1
feature: "Mọi chỗ AI nói đều mang tên Kara: tab bản ghi, tóm tắt tuần, Soạn OKR, Cài đặt, Tài liệu, Zalo"
slug: kara-mot-ten
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-13
design_doc: docs/superpowers/specs/2026-10-13-kara-mot-ten-design.md
---

# Acceptance Contract: kara-mot-ten

## Context

Hàng K6a của `docs/plan/lo-trinh-okr.json`, dãy P1 đợt r2, Cổng Đáng ký `build` 2026-10-12. Luật chốt
01/10 (`docs/ai-ux.md` §1, `CONTEXT.md` «Kara»): AI chỉ có một tên trên màn là Kara; «Tác nhân» là vật
đội dựng; chỗ cần phân biệt phần chạy ghi «Kara · OKR», «Kara · hồ sơ», «Kara · Tài liệu». Kiểm kê 13/10
(`kiem-ke.json`) còn 118 chuỗi người dùng thấy gọi AI bằng tên khác trên năm bề mặt; Zalo không còn chuỗi nào sai ngoài
câu Kho tài liệu (đếm vào Tài liệu). Hàng này đổi chữ, thêm một luật máy giữ một tên, không đổi bố cục.

Source input: hàng K6a và `docs/ai-ux.md` (bảng «Lộ trình áp luật», dòng `tu-vung-tac-tu`) · kiểm kê
trong design doc.

## Criteria

- AC-1: Given tab bản ghi, CRM và onboarding (`crm.ts` trường tuỳ chỉnh và tra cứu, `record-sheet.ts` cảnh báo xoá, `companies.ts`, `khung-ung-dung.ts`, `auth.ts`, ảnh sản phẩm ở trang giới thiệu), When đọc mọi chữ vi và en của các khoá trong bảng kiểm kê, Then mỗi chữ gọi AI là «Kara» và không còn «tác nhân», «Agent» hay «agent» theo nghĩa người điền, người tra cứu, người trò chuyện.
- AC-2: Given tóm tắt tuần và nhắc buổi sáng (`okr-toan-canh.ts`, `nhac-qua-zalo.ts`, khoá tóm tắt của `tro-ly-okr.ts`, tiêu đề nhóm và thông báo trần trong `apps/agent/agent/lib/tin-nhac.ts`), When đọc các chữ đó, Then tiêu đề nhóm là «Kara · OKR», câu nói người làm là «Kara», và không còn «Trợ lý OKR» hay «Máy tóm tắt».
- AC-3: Given Soạn OKR (`okr-soan.ts`, `to-chuc.ts` mô tả gợi ý, các câu trả về từ `apps/api/src/okr/okr-config.ts`), When đọc các chữ đó, Then nút, hội thoại, lý do hỏng, cuộc soạn và câu lỗi đều gọi AI là «Kara», và không còn «Trợ lý», «trợ lý phụ» hay «Máy ghi».
- AC-4: Given Cài đặt (`tro-ly-okr.ts` trang và sổ chi phí, `settings.ts` mô hình và nghiên cứu), When đọc các chữ đó, Then trang mang tên «Kara · OKR», nhóm sổ chi phí là «Kara · hồ sơ» và «Kara · OKR», câu mô tả nói «Kara», và nhóm «Tác nhân» (vật đội dựng) giữ nguyên.
- AC-5: Given Tài liệu (`tai-lieu.ts`, `packages/validation/src/tai-lieu-nguon.ts`, `tai-lieu-hoi.ts`, `apps/api/src/tai-lieu/tai-lieu-config.ts`, `apps/agent/agent/lib/tai-lieu-config.ts`, tiêu đề phiên và câu đóng việc ở `tai-lieu-phien.ts`, `tai-lieu-hoi-phien.ts`), When đọc các chữ đó — kể cả câu hết hạn mức người hỏi qua Zalo thấy, Then mọi chỗ «Trợ lý AI», «máy soạn», «bản máy soạn», «Máy đang soạn», «the composer», «AI assistant» thành «Kara».
- AC-6: Given nhãn người nói khi tải hội thoại về (`packages/ui` `chatMessage.roleAssistant`), When đọc vi và en, Then cả hai là «Kara».
- AC-7: Given luật máy mới «một tên AI» chạy trên mọi kho chữ của `apps/app`, kho chữ `packages/ui`, và mọi chuỗi viết cứng trong `apps/app/app`, `apps/app/components` (trừ `proto`), `apps/api/src`, `apps/agent/agent`, `packages/validation/src`, When có một chuỗi chứa một trong 16 cụm cấm (vi so đúng chữ: «Trợ lý», «trợ lý», «Máy soạn», «máy soạn», «Máy góp ý», «máy góp ý», «Máy tóm tắt», «máy tóm tắt», «Máy ghi số», «Máy chạy ở chế độ ẩn», «Máy đang soạn», «máy không đọc», «Tác nhân nghiên cứu»; en không phân biệt hoa thường: «assistant», «composer», «your agent») hoặc «tác nhân»/«agent» ở khoá không thuộc danh sách vật-đội-dựng, Then bài đỏ và nêu tệp, khoá hay dòng, và cụm; And trên cây sau hàng này bài xanh; And danh sách 118 chuỗi phải đổi, 8 chữ giữ và 7 chỗ miễn được ghim trong `kiem-ke.json` trước khi sửa chữ đầu tiên.
- AC-8: Given các chữ không phải tên AI — «Tác nhân» vật đội dựng (nhóm `tac-nhan` sổ chi phí, khối Slack của Kết nối), «bot» Zalo, «máy chủ», «Máy đếm»/«Số máy»/«Máy gợi ý» của số đo OKR, «agent»/«tác tử» chỉ máy chủ tác tử, «tác tử» của trang sức khoẻ — When đọc sau hàng này, Then chúng giữ nguyên như trên `onehub` trước hàng.
- AC-9: Given bài kiểm có sẵn ghim chữ cũ (`messages-guard.spec.ts` và các bài giao diện nhắc «Trợ lý OKR», «máy soạn», «tác nhân»), When chạy bộ kiểm của kho, Then chúng khẳng định chữ mới, không bài nào bị gỡ hay bỏ qua, và cả bộ xanh.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — bề mặt:** tab bản ghi · tóm tắt tuần · Soạn OKR · Cài đặt · Tài liệu · dùng chung · Zalo [thước CE: sáu bề mặt câu giao + kiểm kê 13/10] → AC-1…AC-6
- **Trục B — nơi chữ sống:** kho chữ `apps/app` · kho chữ `packages/ui` · chuỗi trong validation · câu api trả về · chuỗi agent ghi xuống hay gửi đi · chữ cứng trong tệp giao diện [thước CE: bảng kiểm kê] → AC-1…AC-7
- **Trục C — nghĩa chữ:** tên AI (đổi) · vật đội dựng (giữ) · cửa vào Zalo (giữ) · công thức số đo (giữ) · hạ tầng (giữ) [thước CE: `docs/ai-ux.md` §1, mục từ «Kara», «Tác nhân», «Bot Zalo»] → AC-7, AC-8
- **Trục D — giữ lâu:** luật máy chặn tên cũ quay lại · bài có sẵn đổi theo [thước CE: luật «Ghim khoá mới ở messages-guard» trong ghi chú hàng] → AC-7, AC-9
- [GIẢ ĐỊNH] «Zalo» trong câu giao được phủ bằng câu Kho tài liệu Zalo thấy; lời tự xưng của mô hình trên Zalo là Hỏi-1.

## Out of scope

- Lời dặn mô hình tự xưng («Trợ lý OKR», «máy soạn», «Comp AI CRM») — chờ Hỏi-1.
- Đổi tên khoá, tên tệp, tên thư mục mã (`tro-ly-okr.ts`, `tro_ly_okr`, `may_soan`).
- Trang mẫu `apps/app/app/proto/**`.
- Bố cục, thành phần, dấu tia sáng — đã thuộc `nen-kara`, `bo-xuong-kara`, K4.

## Notes

- Bảng thay chữ một chiều nằm trong design doc.
- Hồ sơ đã ký có bài kiểm phải đổi chữ theo hàng này được liệt ở `evidence/ho-so-bai-doi.md` (E12) và ghim lại ở đuôi vòng, theo điều kiện giám sát khi duyệt sửa tệp chữ chung (P1-2).
