---
schema_version: 1
feature: Bài kiểm packages/auth xanh bất kể bun xếp tệp theo thứ tự nào — token Google giả khớp cấu hình auth, tệp đổi ALLOWED_SIGN_IN trả lại env
slug: kiem-auth-khong-phu-thuoc-thu-tu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-09-23-kiem-auth-khong-phu-thuoc-thu-tu-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-23
---

# Acceptance Contract: kiem-auth-khong-phu-thuoc-thu-tu

## Context

CI của PR #87 (run 35813904599) đỏ hai ca `cua-google-con-song` trong
`packages/auth/test/chia-mat-khau.integration.spec.ts`, dù PR không chạm
`packages/auth`. `auth.ts` khoá `google.hd` lúc nạp module, còn token Google giả
của bài kiểm đọc lại `ALLOWED_SIGN_IN` lúc chạy; bốn tệp test gán biến đó mà
không trả lại. Tệp nào trong bốn chạy trước `chia-mat-khau` thì token mang `hd`
lệch và Better Auth từ chối. Vòng này sửa phép đo, không sửa sản phẩm. Mã sửa đã
có ở commit `6b66dc6f` trên nhánh `fix/auth-test-env-ro`; commit gốc trước bản
sửa là `b812b65a`.

Source input: prompt

## Criteria

- AC-1: Given env đặt theo khối `env:` của `.github/workflows/ci.yml` và một trong bốn tệp đổi `ALLOWED_SIGN_IN` (`cau-tu-choi`, `hosted-domain`, `cong-vao`, `tu-choi-khong-de-lai-hang`) chạy trước `chia-mat-khau` trong cùng tiến trình, When hai ca `cua-google-con-song` chạy, Then với bản sửa cả hai xanh ở cả bốn cặp; và với bản test gốc ở `b812b65a` cả hai đỏ ở cả bốn cặp, log ghim `does not satisfy the configured "hd" option "example.com"`. Cặp nào bản gốc không đỏ thì phép đo thoát 2 và gọi tên cặp.
- AC-2: Given `ALLOWED_SIGN_IN=example.com` trước khi tệp chạy, When từng tệp `*.spec.ts` trong `packages/auth/test` chạy riêng trong một tiến trình bun, Then ở bản gốc `b812b65a` tập tệp làm lệch env bằng đúng bốn tệp đã kể tên ở AC-1, và ở bản sửa tập đó rỗng; và một lượt toàn gói ở bản sửa kết thúc với env vẫn là `example.com`.
- AC-3: Given env CI (đã kiểm `isGoogleConfigured()` trả `true` trong env đó) và các seed `--randomize` mà thứ tự tệp bun chọn đặt ít nhất một tệp đổi env trước `chia-mat-khau`, When chạy toàn gói `packages/auth`, Then ở bản sửa đúng hai ca `cua-google-con-song` được tính là xanh; và bản test gốc ở `b812b65a` cùng seed cho đúng hai ca đó đỏ. Seed không còn thoả tiền đề thứ tự thì phép đo thoát 2 và gọi tên seed.
- AC-4: Given env CI và cơ sở dữ liệu test mới, When chạy toàn gói `packages/auth` theo thứ tự bun tự chọn, Then 0 ca đỏ, tổng số ca bằng tổng ở `b812b65a` cùng env, và số ca bỏ qua không vượt số ở `b812b65a`.
- AC-5: Given cây ở HEAD, When chạy kiểm kiểu, lint, lint:slop, suite test (không dùng cache, trừ gói `agent`) và bản dựng của repo, Then cả năm thoát 0.
- AC-6: Given diff từ `b812b65a` tới HEAD, When liệt kê tệp đã đổi ngoài `_acceptance/**` và các tệp T1 của kho (`risk_tiers.t1_skip_globs`), Then mọi tệp nằm trong `packages/auth/test/**`; và một danh sách mẫu có `packages/auth/src/auth.ts` bị phép đo gọi tên.
- AC-7: Given token giả nay lấy `hd` từ cấu hình auth thay vì từ env, When người đọc hai ca `cua-google-con-song`, Then ca vẫn đo đúng điều nó hứa — người trong danh sách vào được bằng Google và cửa Google vẫn từ chối khi token không khớp — không phải được làm xanh bằng cách biến phép so `hd` thành hằng đúng. (judgment)
- AC-8: Given `ALLOWED_SIGN_IN` đặt lúc nạp module auth trong một tiến trình mới, When đọc `hd` của nhà cung cấp Google trong cấu hình auth, Then nó bằng `googleHostedDomain()` cho cùng danh sách (một miền → miền đó; có địa chỉ lẻ hoặc nhiều miền → vắng); và hai đột biến trên bản sao — `auth.ts` đặt `hd` là một miền ngoài danh sách, `auth.ts` bỏ hẳn `hd` — mỗi đột biến làm ca đo này đỏ, ghim tên ca.

## Coverage

Không dùng skill morphological-scan: bộ AC đi từ một diff đã có và một lỗi đã tái
hiện, không gian là các tệp đã chạm (xem entry `descope` trong `decisions.jsonl`).

- Trục tệp đổi env: cả lớp `*.spec.ts` trong `packages/auth/test`, liệt kê lúc chạy (AC-2) | bốn tệp rò ở bản gốc, mỗi tệp một cặp với `chia-mat-khau` (AC-1) [thước CE: tập tệp rò ở bản gốc do chính AC-2 đo, phải bằng bốn tên viết sẵn]
- Trục ai chọn thứ tự: tệp dò cố định thứ tự (AC-1) | bun xáo theo seed (AC-3) | bun thứ tự thường (AC-4) [thước CE chưa kiểm chứng]
- Trục chiều đo: dương — bản sửa xanh (AC-1..AC-5, AC-8) | âm — bản gốc `b812b65a` đỏ, tệp sản phẩm bị gọi tên, đột biến `auth.ts` bị bắt (AC-1, AC-2, AC-3, AC-6, AC-8)
- Trục lớp: bài kiểm `packages/auth/test` (AC-1..AC-4, AC-7) | chỗ `auth.ts` nối `hd` (AC-8) | toàn cây (AC-5) | ranh giới không chạm sản phẩm (AC-6)

## Out of scope

- Không sửa `packages/auth/src/auth.ts`: khoá `hd` lúc nạp là hành vi đúng của một tiến trình máy chủ; đổi nó là đổi sản phẩm ở đường T3 để chiều một bài kiểm.
- Không sửa các ca đỏ khác chỉ lộ ra dưới `--randomize` (`ensureWorkspaceMembership`, `duong-moi`, `vai-dinh-truoc`, `doi chung duong`, `khong-sinh-thanh-vien`): chúng phụ thuộc trạng thái cơ sở dữ liệu hoặc thứ tự ca bên trong tệp, đỏ y hệt trên bản gốc, và thứ tự thường của CI không làm chúng đỏ.
- Không đo nhánh "giá trị gốc vắng" của `traLaiDanhSachSauTep` (xoá biến): CI và máy dev luôn có `ALLOWED_SIGN_IN`.
- Không sửa cảnh báo biome import thừa có sẵn ở `packages/auth/test/loi-moi-ket-thuc.spec.ts:8`.
- Không cấp khoá Google OAuth thật cho `.env` tại chỗ.

## Notes

Hợp đồng viết SAU khi mã đã sửa (commit `6b66dc6f`) — phản mẫu tiêu chí tự uốn
theo thứ đã dựng. Giảm nhẹ: mỗi AC chạy được có chiều đỏ lấy từ bản gốc trong
git ở `b812b65a`, thứ mà mã đã dựng không tự làm xanh được; AC-6 đo sự VẮNG MẶT
của thay đổi sản phẩm.

AC-8 thêm sau phản biện context sạch (F1): token giả theo cấu hình auth nên hai
ca `cua-google-con-song` thôi tình cờ bắt được một `auth.ts` khoá sai `hd`; AC-8
đo trực tiếp chỗ nối đó. Bản sửa vì thế thêm tệp test mới
`packages/auth/test/hd-cua-google.spec.ts`.

Không có bề mặt người nhìn; không eval thiết kế, không `ui-check`.
