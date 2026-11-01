---
schema_version: 1
feature: Ô số tiền không đoán đồng tiền khi thiết lập tiền tệ của không gian làm việc chưa tải hoặc tải lỗi
slug: tien-te-chua-tai-khong-doan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-tien-te-chua-tai-khong-doan-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T07:24:02Z
---

# Acceptance Contract: tien-te-chua-tai-khong-doan

## Context

Tiếp nối Ngoài-1, Ngoài-4, Ngoài-5 của hồ sơ `o-so-tien-doc-theo-tieng` (PR #114). Khi thiết lập tiền tệ của không gian làm việc chưa về hoặc tải lỗi, tấm tạo thoả thuận đoán USD — đọc số theo USD và lưu thoả thuận thành USD — còn ô thêm nhanh ở tấm công ty khoá nút Tạo mãi mãi mà không nói gì. Vòng này biến «chưa biết đồng tiền» thành một trạng thái có tên: không đọc số, không gửi đồng tiền đoán, nói cho người biết làm gì tiếp; thoả thuận không có số tiền vẫn tạo được và để máy chủ chọn đồng tiền báo cáo như trước PR #114.

Source input: prompt của chủ kho 2026-09-24 («làm tiếp việc sửa lưu nhầm USD») + định tuyến Cổng 2 của `o-so-tien-doc-theo-tieng` + rà mã hai ô và `deals.service.ts`.

## Criteria

- AC-1: Given tấm tạo thoả thuận, tiếng Việt, thiết lập tiền tệ đang tải và người chưa chọn đồng tiền, When gõ `150.000.000`, Then ô chọn đồng tiền hiện đúng chữ «Tiền tệ» và không có đồng nào đang được chọn, dòng dưới ô số tiền là «Đang tải đồng tiền mặc định…» và ô không mang `aria-invalid`; When bấm Tạo, Then không lệnh tạo nào gửi đi và focus về ô chọn đồng tiền; When thiết lập về với đồng báo cáo VND, Then dòng đổi thành «Đọc là 150.000.000 ₫» mà không phải gõ lại, và bấm Tạo gửi đúng một lệnh với `amountCents` 15 000 000 000 và `currency` VND.
- AC-2: Given tấm tạo thoả thuận và thiết lập tiền tệ tải lỗi, When gõ `150.000.000`, Then dòng dưới ô là «Không tải được đồng tiền mặc định — chọn đồng tiền bên cạnh để nhập số tiền.»; When bấm Tạo, Then không lệnh nào gửi đi và focus về ô chọn đồng tiền; When chọn VND, Then dòng đổi thành «Đọc là 150.000.000 ₫», và bấm Tạo gửi `amountCents` 15 000 000 000 với `currency` VND.
- AC-3: Given tấm tạo thoả thuận, When bấm Tạo ở mọi tổ hợp của ma trận viết trước — thiết lập (về VND · đang tải · lỗi) × người chọn đồng tiền (không chọn · chọn USD) × số tiền (`150.000.000` · để trống) — Then mỗi lệnh gửi đi mang đồng tiền đã biết (đồng người chọn, không thì đồng của không gian làm việc) — cả khi số để trống; ô có số thì dòng «Đọc là …» trước khi Tạo hiện số theo đúng đồng của lệnh; số để trống mà chưa biết đồng tiền thì lệnh gửi đi không kèm `currency`; có số mà chưa biết đồng tiền thì không lệnh nào gửi đi; và không lệnh nào mang USD khi không ai chọn USD.
- AC-4: Given thêm nhanh thoả thuận ở tấm công ty, tên đã gõ, When thiết lập tiền tệ đang tải, Then nút Tạo khoá; When thiết lập về, Then nút Tạo mở (đối chứng dương cho Ngoài-6 của hồ sơ trước).
- AC-5: Given thêm nhanh và thiết lập tiền tệ tải lỗi, tên đã gõ, When nhìn ô số tiền, Then nút Tạo mở và cạnh ô có nút «Thử lại»; When gõ `150.000.000`, Then dòng dưới ô là «Không tải được đồng tiền báo cáo, nên chưa lưu được số tiền. Bỏ trống số tiền để tạo thoả thuận, hoặc thử lại.»; When bấm Tạo, Then không lệnh nào gửi đi và focus về ô số tiền; When để trống ô số tiền rồi bấm Tạo, Then gửi đúng một lệnh với `amountCents` null và không kèm `currency`.
- AC-6: Given thêm nhanh, thiết lập tiền tệ tải lỗi và người đã gõ `150.000.000`, When bấm «Thử lại» và lần này thiết lập về với VND, Then truy vấn thiết lập được gọi thêm đúng một lần, nút «Thử lại» biến mất, dòng đổi thành «Đọc là 150.000.000 ₫», và bấm Tạo gửi `amountCents` 15 000 000 000 với `currency` VND.
- AC-7: Given ô số tiền dùng chung với đồng tiền chưa biết, ở tiếng Việt và tiếng Anh, When ô có chữ, Then dòng dưới ô là đúng câu chỗ gọi truyền vào (hoặc câu mặc định «Chọn đồng tiền để đọc số này.» / «Choose a currency to read this amount.» khi chỗ gọi không truyền), dòng mang `aria-live="polite"`, ô không mang `aria-invalid`, ô trỏ tới dòng bằng `aria-describedby`; When ô rỗng, Then không có dòng.
- AC-8: Given ứng dụng chạy thật ở 1440, tiếng Việt, đồng tiền báo cáo khác USD, và trình duyệt nhận lỗi cho yêu cầu thiết lập tiền tệ, When mở tấm tạo thoả thuận, gõ `150.000.000`, chọn một đồng khác cả USD lẫn đồng báo cáo (EUR khi đồng báo cáo là VND) rồi Tạo, Then màn hiện câu lỗi trước khi chọn và «Đọc là» theo đồng đã chọn sau khi chọn, và bản ghi máy chủ (`deals.byId`) có `amountCents` 15 000 000 000 với đúng đồng đã chọn; When tạo một thoả thuận khác với số tiền để trống trong cùng điều kiện, Then bản ghi máy chủ mang đúng đồng tiền báo cáo của không gian làm việc. (cross-layer)
- AC-10: Given ứng dụng chạy thật ở 1440, tiếng Việt, và yêu cầu thiết lập tiền tệ đang bị trả lỗi, When mở thêm nhanh thoả thuận ở tấm công ty và gõ `150.000.000`, Then màn hiện nút «Thử lại» cạnh ô và câu lỗi của thêm nhanh; When bỏ chặn, bấm «Thử lại» rồi Tạo, Then dòng đổi thành «Đọc là» theo đồng báo cáo và bản ghi máy chủ có `amountCents` 15 000 000 000 với đồng tiền báo cáo. (cross-layer)
- AC-9: Given các tệp vòng này chạm, When soi mã và chạy cổng thiết kế tĩnh, Then tấm tạo không còn hằng `"USD"` làm đồng tiền dự phòng, cổng thiết kế tĩnh không vi phạm, và mọi câu mới có đủ tiếng Việt và tiếng Anh.

## Coverage

Chân sản phẩm: hai ô gọi thiết lập tiền tệ [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx, apps/app/components/crm/record-sheet/quick-add.tsx], máy chủ tự lấy đồng tiền báo cáo khi `currency` vắng [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts], định tuyến Cổng 2 [SUY-TỪ-REPO: _acceptance/o-so-tien-doc-theo-tieng/decisions.jsonl]. Chân ngành: [NGÀNH: TanStack Query — ba trạng thái pending / error / success của một truy vấn và `refetch`], [NGÀNH: Vercel Web Interface Guidelines — lỗi hiện ngay cạnh ô, kèm cách sửa; nút gửi không khoá vì kiểm hợp lệ].

- Trục trạng thái thiết lập: về · đang tải · lỗi · lỗi rồi thử lại thành công [thước CE: ba trạng thái của TanStack Query + `refetch`]
- Trục ô: tấm tạo (có ô chọn đồng tiền) · thêm nhanh (không có) [thước CE: hai tệp gọi `currency.settings` có ô số tiền]
- Trục số tiền: có số · để trống [thước CE: hợp đồng máy chủ cho phép `amountCents` null và `currency` vắng]
- Trục người chọn đồng tiền (chỉ tấm tạo): không chọn · chọn [thước CE: ô chọn đồng tiền]
- Core: AC-1 … AC-10. Ma trận AC-3 là tích đủ 3 × 2 × 2 = 12 ô cho tấm tạo; thêm nhanh đi đủ đang tải (AC-4), lỗi (AC-5), thử lại (AC-6).
- Cross-cutting: hai tiếng ở ô dùng chung (AC-7) · trình đọc màn hình qua dòng `aria-live` (AC-7) · màn thật và bản ghi máy chủ cho cả hai màn (AC-8 tấm tạo, AC-10 thêm nhanh).
- Later/Never: xem Out of scope.

## Out of scope

- Tự thử lại truy vấn thiết lập tiền tệ theo lịch (ngoài cơ chế thử lại mặc định của TanStack Query).
- Hiện lỗi tải thiết lập ở chỗ khác ngoài hai ô số tiền (ví dụ màn Cài đặt tiền tệ).
- Thước soi mã của hồ sơ trước không so số khẳng định với con số khai (Ngoài-7 của hồ sơ trước) — vẫn là hạn chế đã biết của hồ sơ đó.

## Notes

- Hai hành vi của hồ sơ `o-so-tien-doc-theo-tieng` được giữ nguyên và vẫn do bộ đo của hồ sơ đó canh: nút Tạo của tấm tạo không khoá vì số tiền (AC-6 cũ), nút Tạo của thêm nhanh khoá khi thiết lập đang tải (AC-8 cũ). Vòng này chạm tệp của hồ sơ đó nên hồ sơ đó được ghim lại bằng làn máy trước khi giao.
- Đổi chữ sau khi giao: hồ sơ `ten-dong-tien-bao-cao` (Ngoài-1 của hồ sơ này) thay «đồng tiền mặc định» bằng «đồng tiền báo cáo» ở hai câu của tấm tạo mà AC-1 và AC-2 trên đây ghim nguyên văn. Hành vi không đổi; câu hiện hành nằm ở AC-1 của hồ sơ đó.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-2: thước màn thật (`rang/man-that.mjs`) gặp ngoại lệ bất ngờ ở vài bước (bấm, chờ bộ chọn, gọi mạng trong bộ chặn yêu cầu) thì thoát mã 1 như «tính năng hỏng» thay vì mã 2 «không đo được».
  - Ngoài-3: thước soi mã (`rang/soi-ma.mjs`) tính con số khẳng định kỳ vọng từ chính danh sách nó lặp, nên phép so số khẳng định không bao giờ đỏ; danh sách khoá câu chữ chọn tay, không rút từ diff.
