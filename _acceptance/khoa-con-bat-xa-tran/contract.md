---
schema_version: 1
feature: Ca khoa-con-bat của go-la-cat-quyen.spec.ts chạy xa trần 5 giây của bun test mà không yếu đi
slug: khoa-con-bat-xa-tran
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: verified
design_doc: docs/superpowers/specs/2026-09-26-khoa-con-bat-xa-tran-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T21:56:20Z
---

# Acceptance Contract: khoa-con-bat-xa-tran

## Context

`go-la-cat-quyen > khoa-con-bat` hết giờ ở CI run 36191005876 (attempt 1): 5144ms so với
trần 5000ms; attempt 2 xanh ở 3731ms. Ca gọi tuần tự hai ma trận (~230 thủ tục tRPC,
~230 đường REST) bằng một khoá API, ~4ms mỗi lượt so với ~1.5ms khi gọi bằng cookie.
Mỗi lượt xác minh khoá ghi `UPDATE apikey`, nhưng một phiên khác đo riêng thấy các câu ghi
đó chỉ tốn ~0.3–0.5ms/lượt — phần chênh còn lại chưa quy được về nguyên nhân nào. Chạy song
song rút ngắn ca ~2.5 lần, cho thấy phần lớn thời gian là chờ chứ không phải CPU. Vòng
này cho hai ma trận của riêng ca đó chạy song song có giới hạn, và thêm khẳng định để
song song không làm ma trận hụt hàng.

Source input: yêu cầu của chủ kho 2026-09-26 («làm test nhanh và ổn định; chỉ nới trần
khi có lý do nói được thành lời»). Số đo trước khi làm ở design doc.

## Criteria

- AC-1: Given env như `.github/workflows/ci.yml` và một cơ sở dữ liệu kiểm riêng của lượt (không phải `crm_test` dùng chung), When chạy cả `apps/api/test/go-la-cat-quyen.spec.ts` 10 lượt, mỗi lượt một tiến trình `bun test --randomize` với seed đôi một khác nhau, Then cả 10 lượt thoát 0, mọi ca của tệp xanh ở mọi lượt, và thời gian của `khoa-con-bat` ở MỖI lượt ≤ 1250ms (một phần tư trần).
- AC-2: Given ca `khoa-con-bat` đã xoá dòng member của người giữ khoá, When hai ma trận chạy song song, Then danh sách tên hàng của ma trận tRPC bằng đúng danh sách thủ tục của sổ router theo thứ tự, và danh sách tên hàng của ma trận REST bằng đúng danh sách đường khai theo thứ tự — hụt, thừa, trùng hay đảo hàng thì ca đỏ với thông điệp gọi tên ma trận lệch (tRPC hoặc REST).
- AC-3: Given một bản sao của tệp mà khoá thuộc người VẪN là thành viên (bỏ dòng xoá member), When chạy `khoa-con-bat` trên bản sao, Then ca đỏ với thông điệp «tRPC: khoa con bat cua nguoi ngoai van qua duoc» — ma trận song song vẫn bắt được thủ tục cho khoá đi qua.
- AC-4: Given tệp spec, `bunfig.toml` của `apps/api` và gốc kho, script `test` của `apps/api/package.json`, và các lệnh chạy test trong `.github/workflows/ci.yml`, `acceptance.yml`, When đọc chúng, Then không ca nào mang trần thời gian riêng, tệp không gọi `setDefaultTimeout`, không bunfig nào có `timeout`, và không lệnh nào mang cờ `--timeout` — ca xanh nhờ nhanh lên, không nhờ trần cao lên.
- AC-5: Given bộ chia lô dùng chung cho các ma trận, When chạy với tham số mặc định, Then không bao giờ có quá một lượt gọi đang chạy cùng lúc; When chạy với `LO_SONG_SONG`, Then số lượt cùng lúc lớn nhất bằng đúng `LO_SONG_SONG` (8, dưới pool 10 kết nối); và chỉ hai lời gọi ma trận trong `khoa-con-bat` truyền `LO_SONG_SONG` — bốn lời gọi ma trận của các ca khác giữ mặc định tuần tự như trước vòng này.

## Coverage

- Bỏ quét coverage — xem sổ quyết định (entry «bỏ coverage-scan»). Không gian một chiều và đã đếm hết: {nhanh, phủ đúng danh sách hàng, còn cắn, không nới trần, không lan sang ca khác} = AC-1 … AC-5.

## Out of scope

- Làm nhanh các ca ma trận khác của tệp (`ma-tran-dang-nhap-lai`, `ngoai-le-dung-tap-khai`, `doi-chung-thanh-vien`, `tab-dang-mo`: 0.9–2.0s ở CI chậm). Riêng `doi-chung-thanh-vien` chạy bằng tư cách thành viên nên có thủ tục ghi thực thi thật — song song hoá nó là đổi phép đo.
- Bật `deferUpdates` hay đổi cấu hình plugin khoá trong `packages/auth` để bớt câu ghi mỗi lượt xác minh (đổi hành vi sản phẩm, T3).
- Test chậm ở tệp khác của `apps/api` (`vai-chi-okr.spec.ts` cũng quét ma trận).

## Notes

- Thời gian thật của `khoa-con-bat` ở CI chỉ đọc được sau khi PR chạy CI; nó được đọc ở S5 và ghi vào mô tả PR (sổ quyết định, entry `revisit`), không phải một eval của vòng.
- Trần thời gian của AC-1 đo trên Mac mini. Tỉ lệ CI/tại chỗ đo được ở run 36191005876 là ~2× (máy khoẻ) đến ~2.8× (máy chậm); 1250ms × 2.8 = 3.5s < 5s.
