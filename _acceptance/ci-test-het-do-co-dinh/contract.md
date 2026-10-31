---
schema_version: 1
feature: Một PR chỉ đổi tài liệu ra test (api) và test (app-ui) xanh trên onehub
slug: ci-test-het-do-co-dinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: draft
design_doc: _acceptance/ci-test-het-do-co-dinh/design.md
---

# Acceptance Contract: ci-test-het-do-co-dinh

## Context

Hàng F37 của «OKR» (`docs/plan/lo-trinh-okr.json`). Chủ kho gõ `build` ngày 31/10 ở phiên giám sát Mac Studio. Từ
28/10, mọi lượt CI đủ đỏ ở bốn ca: `dau-hook (e)` và ba ca `api` (móc dọn `mat-khau-lien-ket`,
`vai-chi-okr > gan-vai`, `dgt-thuoc`). Cả bốn ca phụ thuộc thứ tự tệp trong một tiến trình `bun test` và một kho của
lượt. Nguyên nhân và chiều đỏ trên nền 6ca59691a: `design.md`, `chieu-do-tren-nen.md`. Giám sát cho gánh thêm hai ca
hết giờ `dau-hook (i)`, `(j)`: khác gốc, cùng tệp.

Source input: hàng F37 · `docs/plan/don-dep-3110.md` mục 6 · log CI lượt 41191965481 (đỏ) và 40573884050 (xanh,
27/10) · tin giám sát 31/10 về (i), (j).

## Criteria

- AC-1: Given `packages/ui/test/lai-ra-man.spec.tsx` chạy trước `pre-push-da-chung.spec.ts` trong cùng một tiến trình `bun test` (thứ tự của lượt CI đỏ 41191965481), When chạy cả 21 tệp spec của `@crm/ui` đúng thứ tự đó, Then 0 fail và `dau-hook (e): chuoi ngay 13 roi 15` xanh; And đầu ra của chính lượt chạy cho thấy các tệp chạy đúng thứ tự đã ghi.
- AC-2: Given `pre-push-da-chung.spec.ts` tự ghim `globalThis.Date` ở mốc `2026-09-08T12:00:00+07:00` như `lai-ra-man` làm, When ca `dau-hook (k)` chạy chuỗi dấu 13 ngày rồi 15 ngày, Then ca xanh vì tính ngày theo giờ thật, đồng hồ mà hook cũng dùng; And sau ca, `globalThis.Date` là đúng đối tượng trước khi ghim; And trong một bản sao tệp, đổi chỗ tính ngày của dấu về `Date.now()` toàn cục thì `(k)` đỏ với thông điệp «dau 13 ngay theo gio that cua hook phai con dung».
- AC-3: Given mọi ca của `describe("dau-hook")`, When chạy, Then mỗi ca có trần chung `TRAN_DAU_HOOK_MS` = 30 000ms, đọc từ `DAU_HOOK_TRAN_MS` khi có giá trị; And ép `DAU_HOOK_TRAN_MS=100` thì `dau-hook (i)` đỏ vì «timed out after 100ms»; And bỏ ép thì `(i)` xanh lại; And không khẳng định nào của các ca `dau-hook` cũ đổi.
- AC-4: Given `apps/api/test/dev-grant-needed.spec.ts` chạy xong trên một kho của lượt, When đếm người dùng `<TEST_RUN_ID>-grant-needed@localhost`, Then còn 0; And trong một bản sao bỏ `afterAll` thì còn đúng 1.
- AC-5: Given một tệp chạy trước để lại một người dùng khác có email chứa `TEST_RUN_ID`, giữ vai owner, và được `gieoViecMau` giao việc mẫu, When `mat-khau-lien-ket.spec.ts` chạy ngay sau, Then tệp xanh, kể cả móc dọn `afterAll`; And người dùng của tệp kia vẫn còn; And trong một bản sao dùng lại tiền tố `TEST_RUN_ID` trần thì móc dọn đỏ ở khoá ngoại `viec_nguoiGiaoId_fkey`.
- AC-6: Given không gian làm việc không có chủ sở hữu nào ngoài «chu» của ca, When `vai-chi-okr > gan-vai` chạy, Then ca xanh và «chu» không hạ được vai mình («needs an owner»); And khi một tệp chạy trước để lại một chủ sở hữu khác thì ca đỏ ở tiền đề với thông điệp «chu phai la chu so huu duy nhat», kèm id chủ sở hữu sót lại.
- AC-7: Given một tệp chạy trước để lại thành viên tạo sớm hơn mọi thành viên của ca, When `dgt-thuoc` chạy, Then ca vẫn xanh: người tạo dự án mẫu là n1 của ca, và đáp án viết tay `dap-an.json` khớp; And trong một bản sao bỏ bước dời `createdAt` của n1, n2 thì ca đỏ ở dòng `expect` gọi tên lý do đỏ cũ «gieo mau chon thanh vien som nhat cua kho chung; thanh vien sot cua tep khac (dev-grant-needed) lam nguoi tao mau thi dang nhap bao User not found».
- AC-8: Given 278 tệp spec của `apps/api` theo đúng thứ tự lượt CI đỏ 41191965481, When chạy trong một tiến trình trên một kho dùng-một-lần, Then 0 fail, không dòng nào nhắc `viec_nguoiGiaoId_fkey`, `gan-vai` và `dgt-thuoc` xanh; And đầu ra cho thấy các tệp chạy đúng thứ tự đã ghi; And mỗi tệp trong bốn ca (`pre-push-da-chung`, `mat-khau-lien-ket`, `vai-chi-okr`, `du-an-do-nguong`) chạy riêng ba lượt liền đều xanh.

## Coverage

Quét tay ba trục (entry «bỏ coverage-scan» trong `decisions.jsonl`):

- Trục A — cách một tệp làm bẩn tệp sau: đồng hồ toàn cục bị ghim (AC-1, AC-2) · người dùng và thành viên sót lại (AC-4, AC-6, AC-7) · móc dọn khớp dữ liệu của tệp khác (AC-5).
- Trục B — thứ tự: chạy riêng (AC-8) · đúng thứ tự lượt CI đỏ (AC-1, AC-8) · tệp mồi chèn ngay trước (AC-5, AC-6, AC-7).
- Trục C — loại đỏ: khẳng định sai (AC-1…AC-8) · hết giờ (AC-3).
- Cross-cutting: chiều đỏ của mọi phép đo mới (AC-2…AC-7, và nền 6ca59691a cho AC-1, AC-8).
- [GIẢ ĐỊNH] Thứ tự tệp của bun trên CI giữ như lượt 41191965481. Nếu thứ tự đổi, AC-5…AC-7 vẫn đứng vì tệp mồi tự dựng lại điều kiện rò.

## Đường đo

- CI xanh trên onehub: số đọc bằng `gh run view` từ hai lượt: lượt CI đủ của chính PR này (sau `gh pr ready`) và lượt
  CI đủ đầu tiên của một PR chỉ đổi tài liệu sau khi gộp. Cần `test (api)` và `test (app-ui)` đều `success`. AC-8 và
  AC-1 bảo đảm điều đó trước khi gộp, bằng cách phát lại đúng thứ tự của lượt đỏ.

## Out of scope

- Không sửa `packages/ui/test/lai-ra-man.spec.tsx`: nó ngoài ranh giới và trong thước của năm hồ sơ đã ký. Đã gửi `viec-phu` K-1.
- Không sửa `gieoViecMau`/`gieoDuAnMau` (`packages/db/src`) cho thôi chọn «thành viên sớm nhất».
- Không rà khoảng 70 tệp `apps/api/test` khác còn dùng tiền tố `TEST_RUN_ID` trần; vòng này chỉ sửa tệp đã gây đỏ.
- Không đổi `.github/workflows/ci.yml`, và không đổi nếp «`test (api)` chập chờn không chặn» ngoài bốn ca này (luật 38).

## Notes

- Hai ca `dau-hook (i)`, `(j)` khác gốc với (e): chúng hết giờ 5 giây mặc định khi máy bận. Giám sát duyệt gánh trong
  vòng này ngày 31/10, với hai điều kiện: thước có chiều đỏ, và mức giờ chờ đủ rộng để không che một lần treo thật.
- `_acceptance/config.yaml` nằm ngoài ranh giới dãy K. Giám sát đã duyệt `cham-tep` K-3: chỉ thêm năm khoá `ctd_*`.
