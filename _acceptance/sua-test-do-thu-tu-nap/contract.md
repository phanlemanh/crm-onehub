---
schema_version: 1
feature: Sửa hai lỗi môi trường làm suite test đỏ, và nối dây cổng nghiệm thu vào bản kit đang cài
slug: sua-test-do-thu-tu-nap
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, cli]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-08-31T23:20:31Z
---

# Acceptance Contract: sua-test-do-thu-tu-nap

## Context

Suite test của repo đỏ vì hai lỗi môi trường, không phải lỗi sản phẩm. Lỗi thứ
nhất phụ thuộc thứ tự nạp file spec: `auth.e2e.spec.ts` đặt biến môi trường giả
ở module scope, nhưng `agent-lifecycle.spec.ts` nạp trước và import `@crm/auth`,
nên cấu hình auth chốt "chưa khai Google" trước khi biến được đặt. Lỗi thứ hai
làm `bun run db:test` không thấy `.env` gốc vì nó chạy với cwd `packages/db`.
Cùng lượt này, cấu hình cổng nghiệm thu bỏ đường dẫn cache ghi cứng và khai ba
ổ cắm còn trống, để cổng chạy được trên máy khác và trên bản kit khác.

Source input: prompt

## Criteria

- AC-1: Given môi trường sạch không export `.env` gốc, When chạy toàn bộ suite của `apps/api`, Then mọi test xanh và số test đếm được không nhỏ hơn 381.
- AC-2: Given `agent-lifecycle.spec.ts` nạp TRƯỚC `auth.e2e.spec.ts` trong cùng một tiến trình, When hai file chạy chung một lượt, Then test tuỳ-chọn-đăng-nhập vẫn xanh.
- AC-3: Given `.env` chỉ nằm ở gốc repo và shell không export biến nào, When chạy `bun run db:test` từ gốc, Then lệnh thoát 0.
- AC-4: Given không export biến môi trường nào, When chạy executor `test` với bộ nhớ đệm turbo tắt và loại gói `agent` bằng `--filter=!agent`, Then mọi task còn lại xanh.
- AC-5: Given `_acceptance/config.yaml`, When đọc mọi lệnh trong `executors`, Then không lệnh nào chứa đường dẫn tuyệt đối tới thư mục nhà hay số hiệu phiên bản.
- AC-6: Given plugin acceptance-gate đã cài, When chạy `scripts/resolve-plugin.mjs`, Then nó in ra một thư mục có thật mang `scripts/product-map.mjs` và thoát 0.
- AC-7: Given `_acceptance/config.yaml`, When bộ đọc của kit đọc ba ổ cắm `discovery.brainstorm_skill`, `feature_loop.ui_standards_skill`, `design_pass.ds_skill`, Then cả ba trả về tên skill, không cái nào rỗng.
- AC-8: Given một diff PR chạm file không phải T1 và không kèm thư mục `_acceptance/<slug>/`, When chạy `pre-merge-check.sh` ở chế độ PR, Then lệnh thoát khác 0 và in dòng `VIOLATION [PR]`.
- AC-9: Given một diff PR chỉ chạm file khớp `risk_tiers.t1_skip_globs`, When chạy `pre-merge-check.sh` ở chế độ PR, Then luật `t1-escape` có chạy và KHÔNG in dòng `VIOLATION [PR]`.
- AC-10: Given cây làm việc hiện tại, When chạy tác vụ lint và tác vụ kiểm kiểu của repo, Then cả hai xanh.
- AC-11: Given khối biến giả chuyển từ file spec sang file preload, When người đọc lại `auth.e2e.spec.ts`, Then test vẫn đo đúng thứ nó hứa đo, không phải được làm cho xanh bằng cách nới lỏng khẳng định. (judgment)

## Coverage

Quét theo ba trục. Không dùng skill morphological-scan cho vòng này: bộ AC đi
từ một diff đã có, không gian là các file đã chạm, không phải một không gian
tính năng mở.

- Trục lớp bị chạm: môi trường test `apps/api` (AC-1, AC-2) | script DB `packages/db` (AC-3) | cấu hình cổng `_acceptance` (AC-5, AC-7) | script nhúng `scripts/` (AC-6) | toàn cây (AC-4, AC-10) [thước CE: danh sách file trong `git status`]
- Trục chiều đo: chiều dương — thứ phải chạy được (AC-1, AC-3, AC-4, AC-6, AC-7, AC-8, AC-10) | chiều âm — thứ phải KHÔNG nổ (AC-5, AC-9) [thước CE chưa kiểm chứng]
- Trục môi trường: sạch như CI, không `.env` (AC-1) | có `.env` gốc, không export (AC-3, AC-4) | worktree tạm ở commit cũ (AC-8, AC-9) [thước CE: lệnh `env -i` và `git worktree` trong bộ răng]

## Out of scope

- Không cấp khoá Google OAuth thật. Thứ chặn B1 trong `_acceptance/handoff.md` vẫn nguyên.
- Không sửa test phập phù của `apps/agent`. Nó đỏ một lượt trong năm và fork đã theo dõi ở issue trycompai/crm#195.
- Không đồng bộ 11 file nhúng trong `scripts/` và `lib/` theo bản kit mới hơn. Vòng này chỉ thêm một file nhúng.
- Không đưa symlink `.claude/skills/` vào git. `.gitignore` cố ý loại nó.
- Không đổi hành vi sản phẩm. Diff chỉ chạm file test, script và cấu hình.

## Notes

Hợp đồng này viết SAU khi mã đã sửa. Đây là điều skill cảnh báo là phản mẫu:
tiêu chí có thể tự uốn theo thứ đã dựng. Giảm nhẹ bằng hai cách — mỗi tiêu chí
neo vào một lệnh chạy được, và hai tiêu chí chiều âm (AC-5, AC-9) đo sự VẮNG
MẶT, thứ mà mã đã dựng không tự làm xanh được.

Không có bề mặt web. Không sinh eval thiết kế, dù `executors.design` có trong
config.

**AC-4 và AC-9 bị sửa SAU khi vòng 2 cho đỏ.** Ghi ở đây để người soi được, vì
sửa tiêu chí sau khi thấy kết quả là đường dễ nhất để làm giả một màu xanh.

- AC-4 trước: "mọi task xanh". Nó mâu thuẫn với mục Ngoài phạm vi, nơi đã loại
  test phập phù của `apps/agent`. Nay AC-4 loại gói `agent` bằng tên, đúng thứ
  Ngoài phạm vi đã nói. Test đó vẫn đỏ; hợp đồng thôi giả vờ là nó không đỏ.
- AC-9 trước: "KHÔNG in `VIOLATION [PR]` và thoát 0". Vế đầu luôn đúng. Vế sau
  đỏ vì một luật KHÁC nổ — hồ sơ này chưa ký nên luật per-slug chặn, và răng
  đọc mã thoát của cả tiến trình. Nay AC-9 nói về đúng luật `t1-escape`. Vế bị
  bỏ không đo thứ tiêu chí hứa đo.
