---
schema_version: 1
feature: «Test của agent không nhập mã của app; danh sách thoả thuận Kara trả có một schema dùng chung»
slug: agent-test-khong-nhap-app
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-08T23:31:49Z
design_doc: _acceptance/agent-test-khong-nhap-app/design.md
---

# Acceptance Contract: agent-test-khong-nhap-app

## Context

#321 (`deal-va`) cho test tích hợp của agent nhập `apps/app/lib/agent-transcript.ts` để đi trọn vòng đầu ra
`list_deals` → bộ đọc của app; luật kho `cach-ly-hai-agent` cấm việc đó và onehub đỏ luật kho. Vòng này đưa schema
danh sách thoả thuận vào `@crm/validation/deal-list` (lối A, khuyên — lối B ở Notes), cho app và test agent cùng dùng,
và khép Ngoài-8 của `deal-va` (hình dạng viết tay ở hai nơi).

Source input: hàng E1c của đợt sau-14-10 (mốc 2026-10-09); `_acceptance/agent-test-khong-nhap-app/opportunity.md`;
Ngoài-8 của `deal-va`.

## Criteria

- AC-1: Given cây sau vòng này, When chạy `scripts/luat-kho/do-cay.mjs`, Then thoát 0 và không còn dòng `DO cach-ly-hai-agent`; đối chứng: bản sao chèn lại lệnh nhập `../../app/lib/agent-transcript` vào test agent thì luật đỏ gọi tên tệp.
- AC-2: Given `@crm/validation/deal-list`, When `parseDealListResult` đọc một kết quả đủ trường có `stageId`, một kết quả cũ không có `stageId`, một kết quả có `stageId` sai kiểu, và một giá trị sai hình (thiếu `deals`), Then lần lượt: giữ `stageId`; `stageId` là `null` và bảng còn nguyên; `stageId` là `null` và bảng còn nguyên; trả `null`.
- AC-3: Given bốn đầu vào của AC-2, When đọc qua `dealListResultOf` của app, Then kết quả bằng hệt kết quả của `parseDealListResult` của gói (app đọc bằng đúng hàm đó, không bước tháo hay schema riêng nào chen giữa); nguồn `apps/app/lib/agent-transcript.ts` không còn schema hay kiểu viết tay của danh sách thoả thuận; ca sẵn có của `agent-results.spec.ts` vẫn thoát 0 không sửa khẳng định.
- AC-4: Given test tích hợp `stage-id` của agent, When gọi `list_deals` qua công cụ đã đăng ký, Then đầu ra đọc qua `parseDealListResult` của gói (đúng hàm bộ đọc của app gọi) vẫn giữ `stageId` của từng thoả thuận, mọi trường mà schema khai đều mang đúng giá trị của đầu ra thật (parse không làm mất hay đổi trường nào), và tệp kiểm không nhập gì từ `apps/app`.
- AC-5: (kiểm không hồi quy) Given mọi hồ sơ đã ký mà lưới trước-merge báo bằng chứng cũ do diff của vòng này, cộng `deal-va`, `soan-okr-cung-tro-ly` và `tro-ly-okr-tom-tat` (hai hồ sơ sẽ đỏ ở lượt ghim kế vì luật kho), When ghim lại trong vòng này, Then mỗi hồ sơ có dòng ghim mới với mọi eval máy đạt kỳ vọng, và lưới trước-merge ở HEAD không báo bằng chứng cũ cho slug nào.

## Coverage

- Trục A — Đời bản ghi Kara: có `stageId` | không `stageId` | `stageId` sai kiểu | sai hình [thước CE: ma trận E5 của `deal-va`]
- Trục B — Bên dùng schema: agent (ghi) | app (đọc) | test agent [thước CE: luật `cach-ly-hai-agent`]
- Core → AC: luật kho xanh (AC-1) · hành vi đọc giữ nguyên (AC-2) · app dùng gói (AC-3) · test agent đi trọn vòng qua gói (AC-4) · hồ sơ đã ký (AC-5).
- Later: cho `lookup.ts` kiểm đầu ra của nó bằng cùng schema lúc ghi (parse ở biên phía ghi).

## Đường đo

- Thước: luật kho xanh trên cây sau gộp · số từ: một lần chạy tay `node scripts/luat-kho/do-cay.mjs` trên sha gộp của PR này, ghi vào `run-log.jsonl` của hồ sơ trong ngày gộp (CI chưa chạy luật kho) · bảo đảm bởi: AC-1
- Thước: phép đo đi trọn vòng còn · số từ: ca `stage-id` của agent · bảo đảm bởi: AC-4

## Out of scope

- Đưa luật kho vào CI (việc V2L của P4).
- `lookup.ts` parse đầu ra lúc ghi (Later).

## Notes

- **Lối thay B** (anh chọn ở Cổng 1): test agent bỏ bước đọc qua app, chỉ khẳng định `stageId` trong đầu ra công cụ;
  AC-2, AC-3 bỏ, AC-4 đổi thành «không nhập từ app, `stageId` có trong `execute` và `toModelOutput`». Mất phép đo
  bộ đọc của app mà `deal-va/E4` đã hứa.
- Tệp ngoài ranh giới xin ở P3-52.

Known limits — chấp nhận tại Cổng Bằng chứng 2026-10-09 (Phan Le Manh), từ mục ngoài hợp đồng của S4 round 1–2:

- Ngoài-1: Nếu sau này ai sửa cách công cụ trả danh sách thoả thuận cho Kara, bằng chứng của phép kiểm này có thể không bị đánh dấu là đã cũ, nên có thể không ai nhắc kiểm lại. Hiện tại chưa gây sai kết quả nào.
- Ngoài-2: Phép kiểm ghim lại có thể chấp nhận một mốc ghim không thuộc nhánh này, nên bằng chứng có thể gắn với bản code khác bản sắp gộp mà vẫn báo đạt.
- Ngoài-3: Dữ liệu mẫu trong bài kiểm thiếu vài trường mà Kara luôn trả thật, nên bài kiểm có thể xanh trong khi chưa thử đúng hình dạng dữ liệu thật.
- Ngoài-4: Phép kiểm ghim lại có thể chấp nhận mốc ghim không còn trong lịch sử nhánh (ví dụ sau khi sửa lại commit), nên bằng chứng có thể trỏ vào bản code không tồn tại trên máy chủ sau khi đẩy lên.
- Ngoài-5: Khi mạng lỗi lúc lấy bản mới nhất, phép kiểm ghim lại vẫn chạy trên bản cũ và vẫn có thể báo đạt, nên người xem tin kết quả đã so với bản mới nhất trong khi chưa phải.
- Ngoài-6: Phép kiểm chỉ chắc mốc ghim nằm sau điểm rẽ nhánh chứ chưa chắc nằm trên nhánh này, nên một mốc của nơi khác vẫn có thể lọt qua.
- Ngoài-7: Nếu ai lỡ xoá hoặc bỏ qua nhóm kiểm so sánh app với gói, phép kiểm vẫn báo xanh nhờ các ca cũ, nên có thể mất bảo vệ mà không ai biết.
- Ngoài-8: Nếu sau này có người viết lại danh sách thoả thuận bằng tay dưới một tên khác, phép kiểm sẽ không phát hiện, dẫn tới hai bản định nghĩa lệch nhau như trước.
- Ngoài-9: Một dòng ghim thiếu danh sách kết quả kiểm vẫn có thể được tính là đạt, nên có hồ sơ báo đã kiểm lại trong khi thực ra chưa chạy eval nào.
