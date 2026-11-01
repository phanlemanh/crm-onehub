---
schema_version: 1
feature: Ô nhập số tiền thoả thuận đọc đúng theo tiếng đang dùng và số chữ số lẻ của đồng tiền, từ chối chuỗi mơ hồ
slug: o-so-tien-doc-theo-tieng
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-o-so-tien-doc-theo-tieng-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T05:20:22Z
---

# Acceptance Contract: o-so-tien-doc-theo-tieng

## Context

Ba ô nhập số tiền thoả thuận (tấm tạo, ô sửa tại chỗ trên tấm thoả thuận, thêm nhanh từ
tấm công ty) đọc chuỗi người gõ bằng `Number.parseFloat`. Màn hiện tiền theo tiếng Việt,
nên người gõ `150.000.000` và thoả thuận lưu là 150; `1.500.000,50` thành 1,5; tấm tạo
biến chuỗi không đọc được thành «không có số tiền» mà không báo. Tổng cột, biểu đồ,
báo cáo sai theo. Vòng này thay cả ba bằng một ô dùng chung trong `packages/ui` đọc theo
tiếng đang dùng và số chữ số lẻ của đồng tiền, từ chối chuỗi mơ hồ kèm câu nói cách sửa,
và cho người thấy máy đã đọc gì trước khi lưu.

Source input: prompt của chủ kho 2026-09-24 + rà mã ba ô, `@crm/db/currency`,
`@crm/ui/lib/format`, và bản `--dry-run` của `@reui/number-field`.

## Criteria

- AC-1: Given tiếng (vi, en) và đồng tiền (VND không lẻ, USD hai chữ số lẻ), When đọc từng chuỗi trong ma trận viết trước — rỗng, số trần, có dấu nghìn đúng, có phần lẻ trong hạn, lẻ vượt hạn, viết theo tiếng kia, dấu nghìn đặt lệch, ký tự lạ, dấu lẻ trơ trọi, âm với `-`, âm với `−`, vượt số nguyên an toàn — Then kết quả đúng ô đã ghi: `cents` cho chuỗi nhận, lý do có tên (`format`, `otherLocale`, `fraction`, `negative`, `tooLarge`) cho chuỗi từ chối; JPY cho cùng kết quả với VND. Cụ thể: vi/VND `150.000.000` → 15 000 000 000 cents; vi/USD `1.500.000,50` → 150 000 050 cents; vi/VND `1.500.000,50` → `fraction`.
- AC-2: Given một chuỗi chỉ hợp lệ theo tiếng kia (vi: `1.5`, `1,500.50`, `1,500` với USD; en: `150.000.000`, `1.500,50`), When đọc theo tiếng đang dùng, Then bị từ chối với lý do `otherLocale`, không bao giờ ra một con số; And cùng chuỗi đó đọc theo đúng tiếng của nó thì ra số (đối chứng hai chiều).
- AC-3: Given một số tiền bất kỳ trong dải lưu được của cột `amount` (tới 999 999 999 999,99), When đọc chuỗi, Then `cents` đúng tuyệt đối, không sai số thực (`0,29` → 29; `1.234.567,89` → 123 456 789; `999.999.999.999,99` → 99 999 999 999 999); And với mọi giá trị máy tự định dạng bằng `formatMoneyInput` ở cả hai tiếng và cả ba đồng VND/USD/JPY, đọc lại cho đúng giá trị ban đầu.
- AC-4: Given ô số tiền dùng chung, When gõ một chuỗi đọc được, Then dưới ô hiện «Đọc là <số tiền định dạng như trên màn>» (vi) / «Reads as …» (en); When gõ chuỗi bị từ chối, Then ô mang `aria-invalid`, dưới ô hiện câu lỗi đúng lý do có cách sửa và một số mẫu viết đúng tiếng; And dòng đó `aria-live="polite"` và ô trỏ tới nó bằng `aria-describedby`; And phần số tiền trong dòng mang `translate="no"`, tiền tố «Đọc là»/«Reads as» thì không; When đổi đồng tiền, Then dòng đọc lại theo số chữ số lẻ mới; When ô rỗng, Then không có dòng.
- AC-5: Given ô số tiền dùng chung đang có chữ, When rời ô, Then chữ đọc được được viết lại với dấu nghìn chuẩn của tiếng (`150000000` → `150.000.000`), còn chữ bị từ chối để nguyên.
- AC-6: Given tấm tạo thoả thuận ở tiếng Việt, đồng VND, When gõ `150.000.000` rồi Tạo, Then lệnh tạo gửi `amountCents` 15 000 000 000 và `currency` VND; When số tiền bị từ chối rồi Tạo, Then không lệnh tạo nào gửi đi, focus về ô số tiền, câu lỗi vẫn hiện, nút Tạo không bị khoá vì số tiền; When chọn USD, gõ `1.500,50`, đổi sang VND rồi Tạo, Then không lệnh nào gửi đi và câu lỗi phần lẻ hiện; When đổi lại USD rồi Tạo, Then gửi đúng một lệnh với `amountCents` 150 050 và `currency` USD; When bỏ trống, Then gửi `amountCents` null.
- AC-7: Given ô sửa tại chỗ số tiền của một thoả thuận USD 1 500 000,50 ở tiếng Việt, When mở sửa, Then ô hiện `1.500.000,50`; When sửa thành `2.000.000,75` và Enter, Then lưu `amountCents` 200 000 075; When gõ chuỗi bị từ chối và Enter hoặc rời ô, Then không lưu gì, ô vẫn ở chế độ sửa với câu lỗi; When Esc, Then về giá trị cũ, không lưu; When để trống và Enter, Then lưu `amountCents` null.
- AC-8: Given thêm nhanh thoả thuận từ tấm công ty, đồng tiền báo cáo VND, tiếng Việt, When gõ `150.000.000` rồi Tạo, Then lệnh tạo gửi `amountCents` 15 000 000 000 và `currency` VND; When gõ `1,5`, Then câu lỗi phần lẻ hiện, bấm Tạo không gửi gì và focus về ô số tiền; When bỏ trống rồi Tạo, Then gửi `amountCents` null; When thiết lập tiền tệ chưa tải xong, Then nút Tạo bị khoá.
- AC-9: Given ứng dụng chạy thật ở khổ 375 và 1440, When gõ `150.000.000` (vi, VND) vào tấm tạo và Tạo, và sửa số tiền của một thoả thuận USD thành `1,500,000.50` ở tiếng Anh, Then màn hiện dòng đọc lại trước khi lưu, và bản ghi máy chủ (`deals.byId`) mang đúng 15 000 000 000 và 150 000 050 cents; When gõ `1.5` ở tiếng Việt vào ô sửa tại chỗ rồi Enter, rồi rời ô, Then màn hiện câu lỗi, ô vẫn ở chế độ sửa, và bản ghi máy chủ vẫn 150 000 050 cents trước khi Esc. (cross-layer)
- AC-10: Given ba tệp gọi và ô dùng chung, When soi mã và chạy cổng thiết kế tĩnh, Then cả ba chỗ dùng `MoneyInput`/`InlineMoneyField`, không chỗ nào còn `Number.parseFloat` cho số tiền, `packages/ui` không có `@base-ui/react` hay `src/components/reui/number-field.tsx`, cổng thiết kế tĩnh không vi phạm; And câu của ô có đủ vi và en, hai khoá `amountNotNumber` không còn.

## Coverage

Chân sản phẩm: dựng từ repo — hai tiếng của sản phẩm [SUY-TỪ-REPO: packages/ui/src/lib/locale.ts], mười hai đồng tiền và số chữ số lẻ [SUY-TỪ-REPO: packages/db/src/currency.ts], quy ước vận chuyển ×100 và cột `Decimal(14, 2)` [SUY-TỪ-REPO: docs/currency.md], ba ô nhập [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx, apps/app/components/crm/record-sheet/deal-sheet.tsx, apps/app/components/crm/record-sheet/quick-add.tsx]. Chân ngành: [NGÀNH: Unicode CLDR — ký hiệu số theo locale, vi: dấu nghìn «.», dấu lẻ «,»], [NGÀNH: ISO 4217 — số chữ số lẻ, VND và JPY bằng 0], [NGÀNH: React Aria NumberField / @internationalized/number — đọc số theo locale của người dùng].

- Trục tiếng: vi | en [thước CE: `LOCALES`]
- Trục chữ số lẻ của đồng tiền: 0 (VND, JPY) | 2 (mười đồng còn lại) [thước CE: `CURRENCIES`, ISO 4217]
- Trục dạng chuỗi: rỗng | số trần | dấu nghìn đúng | lẻ trong hạn | lẻ vượt hạn | viết theo tiếng kia | sai dạng (dấu nghìn đặt lệch, ký tự lạ, dấu lẻ trơ trọi) | âm (`-`, `−`) | quá lớn — mỗi lý do từ chối có ô ở cả hai tiếng [thước CE: ngữ pháp số CLDR của hai locale + năm lý do của bộ đọc]
- Trục chỗ đọc × lúc đọc: đang gõ (AC-4) | rời ô (AC-5) | gửi tấm tạo (AC-6) | lưu tại chỗ (AC-7) | gửi thêm nhanh (AC-8) [thước CE: ba tệp gọi `parseFloat`, tìm bằng grep]
- Core: AC-1 … AC-10. Ma trận của AC-1 là tích đủ 2 tiếng × 2 đồng × 12 dạng = 48 ô (+ JPY ≡ VND 24 ô); ba chỗ dùng mỗi chỗ đo nhánh nhận, nhánh từ chối, nhánh rỗng.
- Cross-cutting: hai tiếng (AC-1, AC-4, AC-9) · khổ 375 và 1440 (AC-9) · trình đọc màn hình (AC-4) · số trong dòng đọc lại mang `translate="no"` (AC-4).
- [GIẢ ĐỊNH] Người dùng tiếng Việt gõ `1.500` với USD là muốn một nghìn năm trăm (đọc theo tiếng, dòng đọc lại cho thấy) — không có số liệu hành vi gõ của người dùng thật.
- Later/Never: xem Out of scope và sổ quyết định.

## Out of scope

- Ô tỷ giá ở Cài đặt → Tiền tệ (cũng đọc bằng `parseFloat`) — vòng riêng.
- Dán chuỗi có ký hiệu tiền (`150.000.000 ₫`), khoảng trắng làm dấu nghìn, cách viết tắt (`150tr`, `1.5M`) — bị từ chối có câu lỗi, không được đọc.
- Tự chèn dấu nghìn ngay trong ô theo từng phím gõ.
- Chặn phía máy khách số tiền vượt trần lưu của máy chủ (`MAX_AMOUNT_CENTS`); máy chủ vẫn chặn như cũ.
- Trường tuỳ biến kiểu số trong `RecordFields`.

## Notes

- Không đụng máy chủ: `deals.create` và `deals.update` nhận `amountCents` như cũ; việc sửa nằm hoàn toàn ở chỗ đọc chuỗi.
- Known limits (Ngoài-6, Gate 2): bài kiểm «nút Tạo của thêm nhanh bị khoá khi thiết lập tiền tệ chưa về» chỉ đo chiều khoá, không có đối chứng nút bật khi đủ điều kiện; các ca còn lại gửi biểu mẫu bằng `requestSubmit()` nên không đi qua trạng thái khoá của nút.
- Known limits (Ngoài-7, Gate 2): thước soi mã (`rang/soi-ma.mjs`) đếm số khẳng định nhưng không so với con số khai trước; nếu thư mục câu chữ đổi đuôi tệp, vế «không còn khoá amountNotNumber» có thể không kiểm tệp nào mà vẫn xanh.
