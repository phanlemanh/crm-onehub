## Trong hợp đồng

- **Hình dạng 2: fixture hành động viết tay thiếu trường input, nên assert «lo cau hoi trong log» không với tới chỗ câu hỏi thật nằm**
  AC: AC-3
  file: `apps/agent/test/okr-uy-quyen-ngoai.spec.ts:104`
  severity: low
  source: measurement
  detail: AC-3 hứa dòng log không mang chữ nào của câu hỏi. Bài gieo «câu hỏi» CAU_HOI_RIENG vào `callId` (dòng 93–97, 104–105) qua kiểu viết tay HanhDongYeuCau {kind, callId, subagentName}. Request subagent-call thật của eve (apps/agent/node_modules/eve/dist/src/runtime/actions/types.d.ts:26–34) chở câu hỏi trong `input` và `description`, mà fixture không có hai trường này. Vì vậy assert ở dòng 160 `k.dong.some((d) => d.includes(CAU_HOI_RIENG))` (thông điệp ghim «lo cau hoi trong log») không bắt được một hook ghi `a.input` hay `a.description` ra log. Fixture được dựng đúng khuôn mà bên đọc (laGoiTroLy) cần, không rút từ khuôn eve thật. Hiện chỗ hở này được đỡ một phần nhờ phép so bằng tuyệt đối `k.dong` ở dòng 175–182. Nhưng chính assert mà eval gọi tên thì vô hiệu.
  lý do thuộc hợp đồng: AC-3 hứa dòng log không mang chữ nào của câu hỏi; finding nói bài đo không với tới được nơi câu hỏi thật nằm nên lời hứa này chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New env var TRO_LY_OKR_BO_DE is missing from turbo.json pass-through, which breaks the repo's 'three homes' rule**
  Người dùng thấy gì: Công tắc dùng riêng cho phép đo có thể âm thầm không có tác dụng nếu ai đó bật nó khi chạy agent bằng lệnh dev thông thường. Phép đo chính thức và người dùng thật ở production không bị ảnh hưởng.
  file: `.env.example`
  severity: medium
  Đề xuất: known-limits

- **docs/environment.md has no row for TRO_LY_OKR_BO_DE, unlike the matching OKR_SHEETS_* measurement overrides**
  Người dùng thấy gì: Người muốn tra công tắc dùng cho phép đo sẽ không thấy nó trong bảng biến môi trường chung, nên có thể không biết nó bị bỏ qua ở production. Không ảnh hưởng cách bot Zalo trả lời.
  file: `.env.example`
  severity: low
  Đề xuất: known-limits

- **The new transcript label for the stand-in is keyed by file name, so it never shows, and the model-facing lyDo text shows instead**
  Người dùng thấy gì: Trong màn xem hội thoại của Kara ở app, ngoài phiên OKR, dòng công cụ bị từ chối có thể hiện nguyên câu hướng dẫn tiếng Anh dành cho mô hình thay vì một nhãn thân thiện. Người dùng thấy chữ khó hiểu nhưng bot vẫn trả lời bình thường.
  file: `apps/app/lib/agent-transcript.ts`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4: kiểm âm «uy quyen OKR giet luot» ghim vào thông điệp đã bị xoá khỏi code, nên không thể đỏ**
  Người dùng thấy gì: Một trong các phép kiểm bảo đảm bot không chết lượt khi hỏi OKR không còn khả năng báo lỗi, nên dòng bằng chứng đó không chứng minh thêm điều gì. Việc bot trả lời được vẫn do phép kiểm trạng thái đã trả lời bảo vệ.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: luật .env.example kiểm «có mặt» trong khi lời hứa là «đúng một dòng khai»**
  Người dùng thấy gì: Thước kiểm phạm vi có thể bỏ lọt nếu ai đó lén thêm một biến cấu hình khác dưới dạng ghi chú vào tệp mẫu cấu hình. Hiện tại không có biến lạ nào được thêm.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/6 lỗi rơi vào file không bộ đo nào phủ (.env.example, apps/app/lib/agent-transcript.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
