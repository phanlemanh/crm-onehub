# Review findings: tin-hieu-tu-ve-kho (round 1)

## Trong hợp đồng

- **The scheduled job's git push runs the repo's pre-push hook, so it can never push the queue branch**
  file: `.github/workflows/tin-hieu-keo-ve.yml:34`
  severity: high
  AC: AC-8
  source: bugs
  Vì sao thuộc hợp đồng: Nếu đúng, lượt lịch không bao giờ đẩy được nhánh hàng chờ nên AC-8 (đẩy tệp tín hiệu lên nhánh) và theo đó AC-9 thất bại.
  detail: The workflow runs `bun install --frozen-lockfile`. Bun runs the root package's `prepare` script, which is `git config core.hooksPath .githooks`. I checked this in a scratch repo: `bun install`, with or without `--frozen-lockfile`, prints PREPARE_RAN and sets core.hooksPath to .githooks. After that, `scripts/tin-hieu/lich.ts` calls `git push --force origin HEAD:refs/heads/tin-hieu/keo-ve` through gitPhai with no `--no-verify` and no `CRM_SKIP_HOOKS`. So `.githooks/pre-push` runs `bun run check-types`, `lint`, `lint:slop`, `test` and `build` on the Actions runner. That runner has no Postgres service and no .env, so `test` fails. Even if every task passed, the full suite takes about 19 minutes in CI, longer than the job's `timeout-minutes: 15`. The result is that every run with new signals fails at the push. gitPhai then throws `git push hỏng: pre-push: bun run check-types`, a first stderr line that hides the real cause. The branch is never pushed and the PR is never opened. Meanwhile the server has already stamped `keoVeLuc` on those signals. lich.test.ts does not catch this because its temporary repos never set core.hooksPath. Fix: set `CRM_SKIP_HOOKS: 1` in the step env, or pass `--no-verify` / `-c core.hooksPath=/dev/null` on the push in lich.ts and say why.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Signals-only key middleware turns every verification failure, including a database outage, into 401**
  Người dùng thấy gì: Khi hệ thống dữ liệu đang sập, lượt kéo tín hiệu báo là khoá bị từ chối thay vì báo hệ thống lỗi. Chủ kho có thể tưởng khoá hỏng và đổi một khoá vẫn đang đúng.
  file: `apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts`
  severity: medium
  Đề xuất: known-limits

- **New workflow uses GITHUB_TOKEN only, skipping the repo's AUTOMATION_TOKEN fallback**
  Người dùng thấy gì: PR tín hiệu kéo về do lịch mở sẽ không tự chạy kiểm tra; người gộp phải đóng rồi mở lại PR bằng tay nếu muốn các kiểm tra chạy.
  file: `.github/workflows/tin-hieu-keo-ve.yml`
  severity: medium
  Đề xuất: known-limits

- **Create-key sheet hides the 'Key for' field from non-admins instead of locking it with a reason**
  Người dùng thấy gì: Thành viên thường không thấy lựa chọn loại khoá và cũng không được giải thích vì sao. Họ chỉ không biết có loại khoá riêng này, không mất chức năng nào.
  file: `apps/app/app/(app)/[slug]/settings/api-keys/to-tao-khoa.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP «mọi vai (cả owner)» nhưng chỉ có điểm-case vai okr**
  Người dùng thấy gì: Bộ kiểm tra chưa chứng minh rằng phiên đăng nhập của chủ không gian gọi được hay không đường kéo theo lịch. Nếu sau này có lỗi chỗ đó, bộ kiểm tra vẫn báo xanh.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assert âm một mình: o6 «không pr merge / --auto» không có đối chứng dương, và chỉ quét nhật ký của một ô**
  Người dùng thấy gì: Phép kiểm rằng lượt chạy không bao giờ tự gộp PR có thể xanh dù lượt chạy hỏng sớm và chẳng làm gì. Lời cam kết không tự gộp chưa được chứng minh chắc chắn.
  file: `scripts/tin-hieu/test/lich.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng dương của ô 6 (get-session) không thể đỏ**
  Người dùng thấy gì: Phép thử rằng khoá chỉ-kéo không mở được phiên đăng nhập qua đường đọc phiên có đối chứng giả, nên chưa chứng minh phép thử đó nhìn thấy được một phiên thật.
  file: `apps/api/test/khoa-keo-tin-hieu.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 — danh sách tệp đưa vào bộ phân loại là viết tay, không lấy từ diff của commit**
  Người dùng thấy gì: Phép thử rằng PR chỉ chứa tệp tín hiệu được xếp loại nhẹ dùng danh sách tệp gõ tay, không lấy từ thay đổi thật. Nếu cách đọc thay đổi thật hỏng, phép thử vẫn không phát hiện.
  file: `_acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs`
  severity: medium
  Đề xuất: known-limits

- **Queue branch and PR title break the repo's one-row-one-name rule**
  Người dùng thấy gì: PR tự động hằng ngày mang mã của tính năng đã giao nên có thể bị nhầm là việc làm tính năng mới. Chỉ gây nhầm khi đọc danh sách PR.
  file: `scripts/tin-hieu/lich.ts`
  severity: low
  Đề xuất: wont-fix

- **gh CLI output parsed with JSON.parse and an `as unknown[]` cast**
  Người dùng thấy gì: Nếu công cụ GitHub trả về dữ liệu lạ, lượt chạy có thể mở thêm một PR thay vì dừng và báo lỗi rõ ràng. Tình huống này hiếm.
  file: `scripts/tin-hieu/lich.ts`
  severity: low
  Đề xuất: wont-fix

- **New hour constant is a raw literal instead of being derived from one base unit**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ làm mã khó sửa đồng bộ hơn về sau.
  file: `scripts/tin-hieu/keo-ve.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — quét «mọi chỗ đọc phiên/khoá» bằng regex tên hàm, bỏ sót lớp `@Session()` của guard Nest**
  Người dùng thấy gì: Phép kiểm tra mọi chỗ đọc khoá có thể bỏ sót vài chỗ đọc phiên qua cơ chế khác, nên lời khẳng định khoá chỉ-kéo không mở được phiên ở đâu cũng chưa đủ rộng.
  file: `_acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4 — assert âm «hộp khoá toàn quyền không dặn» không kiểm hộp đã mở**
  Người dùng thấy gì: Bài kiểm câu dặn chỉ hiện với khoá chỉ-kéo có thể xanh dù hộp khoá vừa tạo không mở ra. Rủi ro nhỏ vì ca anh em đã kiểm hộp mở.
  file: `apps/app/test/khoa-api-loai.dom.tsx`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
