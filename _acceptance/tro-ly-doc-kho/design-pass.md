---
slug: tro-ly-doc-kho
at: 2026-10-01T03:25:00Z
route: http://localhost:3300/proto/tro-ly-doc-kho
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (khong-dong-bo tren anh, gui kem the Cong Pham vi)
options:
divergence: skipped — khuôn hội thoại có sẵn ở bản mẫu lượt 0; chủ kho đã chọn chỗ đặt (tab «Hỏi» trong Kho) trong phiên 2026-10-01, không còn hướng nào mở
ds_skill: web-design-guidelines
states: [ST-tac-nhan-tra-loi, ST-tac-nhan-tu-choi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 0
deferred: 9
---
# design-pass — tro-ly-doc-kho

Bản mẫu là module `kho-tai-lieu` của lượt 0 (`man-hoi.tsx`), dựng bằng component `@crm/ui`
thật trong khung giả tĩnh của CRM. Lượt này chỉ thêm mục `catalog.ts` slug `tro-ly-doc-kho`
trỏ cùng module với hai trạng thái của lượt 4. Không sửa module: nó là phòng trưng bày chung
của mọi lượt Kho tài liệu (cùng cách lượt 2 và 3), nên mọi lệch dưới đây là phát hiện cho màn
thật.

Mười trạng thái còn lại của tab «Hỏi», hộp «Báo sai», dòng xác minh trên màn đọc và hai danh
sách mới của Sức khoẻ không có trạng thái bản mẫu: người duyệt duyệt chúng bằng bảng trạng thái
ở «Đặc tả UX» của thiết kế; hình thật lần đầu thấy ở ảnh của E7u.

Chuẩn UI nội của kho (`web-design-guidelines`, bản lấy 2026-10-01) soi trên `man-hoi.tsx`: không
vùng `aria-live`, «Trang gần nhất» là `Badge` không bấm được, không có ô nhập có nhãn — ba mục
đưa vào Nhóm 2.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-tac-nhan-tra-loi | desktop-1280 | light | evidence/design-pass/ST-tac-nhan-tra-loi--desktop-1280.png |
| ST-tac-nhan-tra-loi | mobile-375 | light | evidence/design-pass/ST-tac-nhan-tra-loi--mobile-375.png |
| ST-tac-nhan-tra-loi | desktop-1280 | dark | evidence/design-pass/ST-tac-nhan-tra-loi--desktop-1280--dark.png |
| ST-tac-nhan-tu-choi | desktop-1280 | light | evidence/design-pass/ST-tac-nhan-tu-choi--desktop-1280.png |
| ST-tac-nhan-tu-choi | mobile-375 | light | evidence/design-pass/ST-tac-nhan-tu-choi--mobile-375.png |
| ST-tac-nhan-tu-choi | desktop-1280 | dark | evidence/design-pass/ST-tac-nhan-tu-choi--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: static-frame` — bản mẫu đã nằm trong khung CRM (thanh trên, thanh biểu tượng). Lệch: thanh biểu tượng sáng mục trợ lý AI chứ không sáng mục «Tài liệu», và trang tên «Hội thoại» chứ không là tab của Kho — xem Nhóm 2.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Không có: module dùng chung, không vá trên bản mẫu.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Câu trả lời mẫu nói «đang có một bản đề xuất chờ duyệt nâng tầng 2 lên 1,5%» — đó là chữ của bản đề xuất, thứ trợ lý AI không bao giờ được đọc (`CONTEXT.md` mục Bản đề xuất). Màn thật không có dòng này; trợ lý chỉ thấy bản đang dùng (AC-1, AC-2).
- Câu trả lời mẫu tính «36 triệu» từ 1,2% của 3 tỷ — con số không có trong trang nào. Màn thật: mọi con số phải có trong đoạn trích của câu, nên câu chỉ nói «1,2%» (AC-3 f; sổ quyết định «không phép tính»).
- Trích dẫn dựng tay bằng `<li className="rounded-lg border">` — bảng «Dấu hiệu vẽ tay» của `docs/design.md`. Màn thật dùng `InlineCitation` hoặc `Sources` của AI Elements kéo bằng CLI (`docs/chat-ui.md` Rule 3), nối vào màn trong cùng thay đổi để cổng mồ côi xanh.
- Ảnh đại diện trợ lý đứng ở cuối tin (cạnh nút báo sai), không ở đầu tin như câu hỏi. Màn thật dùng `Message` của AI Elements và một vị trí ảnh cho cả hai phía.
- Khổ 375: tên trang và tên mục «› Mức hoa hồng theo tầng» chia cột, chữ vỡ ba dòng. Màn thật: tên mục nằm dưới tên trang, không chia cột.
- Ngày duyệt «01/07» không có năm. Màn thật: «Phiên bản 5 · duyệt 01/07/2026» theo định dạng ngày của kho.
- Câu từ chối mẫu nhắc «câu trả lời sai về tiền» cho mọi câu hỏi. Màn thật dùng một câu cố định không gắn chủ đề: «Chưa có trang đã duyệt nào trả lời câu này. Mình không đoán.» (AC-4).
- «Trang gần nhất» là `Badge` không bấm được, và bản mẫu không có vùng `aria-live` cho câu trả lời mới (`web-design-guidelines`: cập nhật bất đồng bộ cần `aria-live="polite"`; trích dẫn phải là liên kết thật). Màn thật: mỗi trang gần nhất là liên kết tới màn đọc; khối câu trả lời trong vùng `aria-live`.
- Bản mẫu không có ô hỏi, trạng thái chờ, quá hạn, lỗi, trần. Màn thật thêm `PromptInput` có nhãn cho trình đọc màn hình và bảy trạng thái theo «Đặc tả UX»; nút «Báo câu trả lời này sai» rút thành «Báo sai» — câu trả lời ngay trên đã là ngữ cảnh (`CONTEXT.md`, luật viết nhãn).
