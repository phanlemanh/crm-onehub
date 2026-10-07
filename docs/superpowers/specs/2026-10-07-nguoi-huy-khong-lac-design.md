# nguoi-huy-khong-lac — ca «người dùng huỷ» không lắc theo tốc độ máy

Ngày: 2026-10-07 · Hồ sơ: `_acceptance/nguoi-huy-khong-lac/` · Hạng T2 · Mặt: không (mã kiểm)

## Vấn đề

Ca `nguoi-huy > nguoi-huy: nguoi dung huy thi khong hoan n=5` của
`apps/app/test/soan-okr-khong-tru-luot.spec.ts` — thước của eval E4 (`r1h_huy`) trong hồ sơ đã ký
`soan-okr-khong-tru-luot` — quá hạn 5000 ms ở CI ngày 07/10 (run 37572504550 lần 1, PR #291, 5002.11 ms).
Tệp test không đổi giữa hai đỉnh, ca xanh ở lượt CI trước, và xanh tại chỗ.

Nguyên nhân, tái hiện được: ca ngủ 20 ms rồi huỷ. Trước khi gọi `fetch`, cửa soạn còn chờ bốn việc có cơ
sở dữ liệu (vai người dùng, đọc cuộc, tăng lượt, ký token). Máy chậm hơn 20 ms thì lệnh huỷ tới TRƯỚC
`fetch`. `fetch` giả của `apps/app/test/khung-cua-hoan.ts` nhánh `"treo"` chỉ gắn bộ nghe sự kiện `abort` —
trên một signal đã huỷ sẵn, sự kiện ấy không bao giờ bắn lại, nên lời gọi treo mãi; `fetch` thật thì từ
chối ngay. Hẹn giờ của cửa (`CUA_OKR.choTroLyMs`, hạ còn 300 ms trong bài) không cứu được vì
`AbortSignal.any([request.signal, quaHan.signal])` đã huỷ sẵn từ đầu. Đổi `Bun.sleep(20)` thành
`Bun.sleep(0)` → cả `n=0` lẫn `n=5` treo đúng 5000 ms, cùng chữ ký với CI. `n` không liên quan.

## Cách làm

Hai chỗ, đều trong mã kiểm; route không đổi.

1. `fetch` giả theo đúng hợp đồng của `fetch` thật: được gọi với signal đã huỷ thì từ chối ngay bằng
   `signal.reason`, ở mọi nhánh kết quả. Khung đếm số lời gọi như vậy (`soLanHuySan`) để bài kiểm thấy
   được lệnh huỷ đã tới trước `fetch`.
2. Ca huỷ chờ theo điều kiện thay vì theo đồng hồ: `k.choTreo()` trả về khi `fetch` giả đã nhận yêu cầu và
   đang treo (bộ nghe `abort` đã gắn), rồi mới huỷ. Lời hứa của ca giữ nguyên: người dùng huỷ TRONG LÚC
   chờ Trợ lý thì không hoàn lượt.

Không nâng trần thời gian của ca: chờ có điều kiện rút được, và ca xanh trong khoảng 20 ms.

## Phép đo

- E1 (AC-1) — describe mới `khong-lac-duong-cham` trong cùng tệp: cùng kịch bản với `nguoi-huy` nhưng
  tiêm `TRE_TOI_FETCH_MS` (200 ms, gấp 10 lần mức ngủ cũ) vào bước tăng lượt — giả lập máy CI chậm.
  Khẳng định: lúc huỷ `fetch` giả đã nhận đúng 1 lời gọi và không lời gọi nào mang signal huỷ sẵn
  (thông điệp ghim `huy-truoc-fetch n=<n>`); cửa trả lời trước `HAN_KHONG_LAC_MS` (2000 ms, ghim
  `treo-sau-huy n=<n>`); soLuot = n + 1; thân không có `luot`. Chiều đỏ: bản sao ca chờ `Bun.sleep(20)`.
- E2 (AC-2) — describe mới `fetch-gia-theo-that`: ma trận viết trước năm kết quả của `fetch` giả
  (`nem`, `treo`, `luong-cham`, 202, 500 — mỗi nhánh của `fetchGia` một ô) gọi với signal huỷ sẵn → từ
  chối với đúng `signal.reason` trước hạn (ghim `fetch-gia-treo-khi-da-huy <ket>`). Đối chứng rút từ
  writer thật: `fetch` thật của Bun với cùng signal từ chối cùng lý do. Đối chứng dương: signal chưa
  huỷ, 202 → 202.
- E3 (AC-3) — lệnh `r1h_huy` của hồ sơ gốc: sáu ca `nguoi-huy` xanh, khẳng định không đổi. Chiều đỏ của E4
  hồ sơ gốc chạy lại ở S3: gỡ nhánh «huỷ thì không hoàn» của route → `hoan-khi-nguoi-huy n=<n>` trong
  dưới 1 s, không phải quá hạn.

Hằng thời gian mới (`TRE_TOI_FETCH_MS`, `HAN_KHONG_LAC_MS`) sống cạnh `CHO_TRO_LY_THU_MS` trong
`khung-cua-hoan.ts` — module cấu hình của khung kiểm cửa soạn.

## Bỏ

- Đặc tả UX: không chạm màn.
- Quét độ phủ bằng skill: không gian chỉ hai trục, liệt kê tay trong `## Coverage` của contract.
- Route cửa soạn: không đổi — lỗi nằm ở thước, không ở vật.

Brainstorm diễn ra trong phiên 07/10: điều tra theo `superpowers:systematic-debugging`, tái hiện, đề xuất
ba đường (gộp vào #291 · PR riêng có hồ sơ · vượt cổng), chủ kho chọn PR riêng có hồ sơ T2 tối thiểu.
