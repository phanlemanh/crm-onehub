## Trong hợp đồng

### AC-11 guard reads the wrong setting: the global auth.options.secondaryStorage instead of the api-key plugin's own storage/customStorage
- file: `apps/api/test/khoa-api-ghi-thua.spec.ts:140`
- severity: medium
- source: conventions
- AC: AC-9
- detail: The new test `khong-secondary-storage` and its helper `khongCoSecondaryStorage` (line 36) only check `auth.options.secondaryStorage`. The installed @better-auth/api-key does not choose its storage from that global setting — it resolves its own `storage: config?.storage ?? "database"` (dist/index.mjs:2342) and reads `opts.customStorage` first (line 140: `if (opts.customStorage) return opts.customStorage; return ctx.context.secondaryStorage`). The patched secondary-storage path (which AC-9 now admits is touched) only runs when the plugin sets `storage: "secondary-storage"` (lines 271/310/449/1703). The guard gets it wrong both ways: (1) false red — enabling a global secondaryStorage for sessions/rate-limiting while `apiKey({...})` stays on default database storage fails the test even though the api-key path is unchanged; (2) false green — `apiKey({ storage: "secondary-storage", customStorage: {...} })` with no global secondaryStorage takes exactly the patched path and the test stays green. AC-11's stated invariant (repo does not use the secondary-storage path of the patch) is therefore not held by a machine. Should read the api-key plugin's resolved options (storage === "database" and no customStorage) instead, e.g. from the `api-key` entry in `auth.options.plugins`.
- rationale: AC-9's own text asserts "AC-11 giữ điều kiện đó bằng máy" (AC-11 mechanically enforces that the repo does not take the secondary-storage path); the finding shows the check reads the wrong signal and can be fooled both ways, so that clause of AC-9 fails as written.

### AC-11 guard checks auth.options.secondaryStorage, but the api-key storage mode is set by the plugin's own `storage` option
- file: `apps/api/test/khoa-api-ghi-thua.spec.ts:140`
- severity: medium
- source: bugs
- AC: AC-9
- detail: The test `khong-secondary-storage` (and `khongCoSecondaryStorage`) only checks `auth.options.secondaryStorage`. In the installed @better-auth/api-key, the storage path is chosen by the plugin option `storage` (dist/index.mjs:2342), and the storage instance comes from `opts.customStorage` first, falling back to `ctx.context.secondaryStorage` only after that (lines 140-141). This breaks the guard two ways: (1) missed red — `apiKey({ storage: "secondary-storage", customStorage: {...} })` in `packages/auth/src/auth.ts` moves key verification onto the secondary-storage path (the same path AC-9 says the patch also changes, via `claimUsageInSecondaryStorage` using the patched `stampLastRequest`, line 1942), yet `auth.options.secondaryStorage` stays undefined so E15/AC-11 stays green with no signal; (2) false red — turning on auth-level `secondaryStorage` for session caching turns E15 red even though the api-key plugin keeps `storage: "database"` and the patched secondary-storage path is never reached. The check that matches the real condition is on the apiKey plugin's resolved options: `storage !== "secondary-storage"` (and no `customStorage`).
- rationale: Same root defect as the first finding: AC-9 explicitly claims AC-11 mechanically holds the "kho không dùng đường secondary-storage" condition, and this finding demonstrates the guard's condition does not track the actual branch selector, breaking that clause of AC-9.

### Shape 1 (measures the instruction, not the output): khong-secondary-storage checks auth.options.secondaryStorage, but the plugin picks the secondary-storage path from its own opts.storage / opts.customStorage
- file: `apps/api/test/khoa-api-ghi-thua.spec.ts:141`
- severity: medium
- source: measurement
- AC: AC-9
- detail: Lines 141-142 read `auth.options.secondaryStorage` and call `khongCoSecondaryStorage` on it, but neither the patch nor the plugin ever read that value to pick a branch — the branch is chosen by the api-key plugin's `opts.storage` (dist/index.mjs lines 249-449, 1703, 1729, 1739), with the storage backend picked at line 140 (`opts.customStorage` first, falling back to `ctx.context.secondaryStorage`). So a config like `apiKey({ storage: "secondary-storage", customStorage: {...}, lastRequestUpdateIntervalMs })` runs the patched `stampLastRequest` on the secondary-storage path while `auth.options.secondaryStorage` stays undefined and E15 stays green; conversely a global secondaryStorage with the plugin still on `storage: "database"` does not touch the patched secondary path but still fails the test. The red half of the test (lines 143-151) only proves the helper throws on a hand-written `{get,set,delete}` object — it never shows the real config ends up on the secondary-storage path. The value that decides is the resolved `storage`/`customStorage` of the apiKey plugin in the real auth config, not `auth.options.secondaryStorage`.
- rationale: Same root defect restated via test-shape framing: it falsifies AC-9's clause that "AC-11 giữ điều kiện đó bằng máy", since the guard's checked value does not correspond to the real condition that determines the secondary-storage path.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bản vá tạo lại mang theo tệp .bun-tag cũ, giờ có hai tệp đánh dấu rỗng (r2)**
  Người dùng thấy gì: Bản vá đi kèm một tệp dấu vết thừa còn sót từ lần vá trước, không ảnh hưởng gì tới việc dùng khoá API — chỉ là rác nhỏ trong tệp nguồn của bản vá.
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch`
  severity: low
  Đề xuất: known-limits

- **Kiểm bun.lock bằng regex tự chế, trả Record thay vì phân tích ở biên (r2)**
  Người dùng thấy gì: Công cụ tự động kiểm tra bản vá có thể báo lỗi giả nếu sau này có thêm một gói được vá nữa, khiến người soát mất công tra nhầm chỗ.
  file: `packages/auth/test/khoa-api-ghi-thua.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Nhánh trả sớm ở storage database bỏ luôn chốt «khoá còn tồn tại» của bản gốc (r2)**
  Người dùng thấy gì: Trong một khoảng thời gian rất ngắn (dưới một phút, chỉ một yêu cầu), một khoá API vừa bị xoá vẫn có thể lọt qua thêm một lượt gọi trước khi bị chặn hẳn.
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
