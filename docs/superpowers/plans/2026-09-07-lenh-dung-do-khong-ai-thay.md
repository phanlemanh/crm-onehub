# Lệnh dựng đỏ mà không cổng nào thấy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm `bun run build` xanh trở lại, và đưa chính lệnh ấy vào bộ lệnh chứng để lớp lỗi này không còn vô hình.

**Architecture:** 19 màn của `apps/app` gọi `getLocale()` ở thân hàm xuất mặc định, ngoài mọi `<Suspense>`, nên vỏ tĩnh không dựng nổi dưới `cacheComponents: true`. Mỗi màn sửa độc lập theo đúng một khuôn: hàm xuất mặc định trả một `<Suspense>` bọc component con async giữ nguyên thân cũ. Song song, thêm ổ cắm `build` ép-chạy-lại vào `_acceptance/config.yaml`, vào `feature_loop.suite_keys`, vào `.githooks/pre-push` và vào `.github/workflows/acceptance.yml`.

**Tech Stack:** Next 16 (App Router, cacheComponents), React Suspense, Turborepo, Bun, `@typescript-eslint/typescript-estree` hoặc TS compiler API cho chân AST.

**Spec:** `docs/superpowers/specs/2026-09-07-lenh-dung-do-khong-ai-thay-design.md`

## Global Constraints

- SHA ghim: `3c97e759a6c87bc8b6f0621d3854cb486728b442`.
- Ba số neo tại SHA ấy: **25** file gọi `getLocale` dưới `apps/app/app/**` · **19** trong đó gọi ở thân hàm xuất mặc định · **22** file có `generateMetadata`.
- **Không viết chú thích trong code.**
- Không `Record<string, unknown>`; không `typeof x === "..."`.
- **Không đụng `.github/workflows/ci.yml`** của hãng.
- **Không đụng thân `generateMetadata`** ở bất kỳ màn nào.
- Không đổi một khoá kho chuỗi nào.
- Mỗi phép đo mới phải có **cặp hai chiều trên cùng một vật**: vật lành → xanh; phá vật thật trong bản sao → đỏ với thông điệp ghim.
- Chân đo đặt ở `_acceptance/lenh-dung-do-khong-ai-thay/rang/`, đường dẫn suy từ vị trí script, không ghim cứng gốc kho.

---

### Task 1: Vá 19 màn

**Files:**
- Modify: 19 file dưới `apps/app/app/**` — danh sách sinh từ đĩa, không gõ tay
- Test: `bun run build`

**Interfaces:**
- Consumes: `getLocale()` từ `@/lib/locale/server`, `PageShellLoading` từ `@/components/page-shell`
- Produces: mỗi màn có một component con async giữ nguyên thân cũ, được `<Suspense>` bọc

Khuôn sửa, áp y hệt cho từng màn:

```tsx
export default function <Ten>Page() {
	return (
		<Suspense fallback={<PageShellLoading />}>
			<<Ten>Shell />
		</Suspense>
	);
}

async function <Ten>Shell() {
	const t = <kho>Messages(await getLocale());
	return ( … nguyên văn thân cũ … );
}
```

- [ ] **Step 1: Sinh danh sách 19 màn từ đĩa, đối chiếu neo**

```bash
cd /Users/manhphan/dev/crm
for f in $(grep -rl "getLocale" apps/app/app); do
  B=$(awk '/export default async function|export default function/,0' "$f" | grep -c "getLocale")
  [ "$B" -gt 0 ] && echo "$f"
done | tee /tmp/19-man.txt | wc -l
```

Expected: `19`. Khác 19 → DỪNG, neo sai, không sửa mù.

- [ ] **Step 2: Chạy lệnh dựng để thấy nó ĐỎ trước khi sửa**

```bash
bunx turbo run build --filter=app --force
```

Expected: FAIL, thông điệp `uncached or runtime data during prerendering`.

- [ ] **Step 3: Sửa từng màn theo khuôn trên**

Với mỗi màn: đổi `export default async function X()` thành `export default function X()` trả `<Suspense fallback={<PageShellLoading />}><XShell /></Suspense>`, rồi khai `async function XShell()` giữ nguyên thân cũ. Thêm `Suspense` vào import từ `react` và `PageShellLoading` từ `@/components/page-shell` nếu chưa có. Màn không dùng `PageShell` thì fallback là `null`.

**GIỮ NGUYÊN `generateMetadata`** — nó gọi `getLocale()` và điều đó không sao.

- [ ] **Step 4: Lệnh dựng xanh**

```bash
bunx turbo run build --filter=app --force
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/app && git commit -m "fix(app): dựng vỏ tĩnh được trở lại — chữ theo tiếng nay đọc trong Suspense"
```

**Phục vụ:** E1, E2, E3, E4. **`independent: false`** — mọi task đo màn đều dựa vào task này.

---

### Task 2: Chân E2 — không màn nào đọc dữ liệu lượt truy cập ở vỏ tĩnh

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs`

**Interfaces:**
- Consumes: `apps/app/app/**` trên đĩa
- Produces: mã 0 khi mọi đường tới `getLocale` đi qua ranh `<Suspense>`; mã 1 kèm `file:dòng`; mã 2 khi dân số lệch neo 25

- [ ] **Step 1: Viết chân**

Dùng TS compiler API. Với mỗi file dưới `apps/app/app/**` có chứa `getLocale`:
tìm hàm xuất mặc định; duyệt cây JSX của nó; với mỗi tên component con được dùng trong JSX, tra khai báo **cùng file** (một chặng) và duyệt tiếp. Đánh dấu một nút là "được che" nếu nó nằm dưới một `JsxElement` tên `Suspense`. Một lời gọi `getLocale` **không được che** trên bất kỳ đường nào → ĐỎ.

In ba số: `file co getLocale · file dat · neo`.

- [ ] **Step 2: Chiều xanh — mẫu dương ghim tên**

Chân phải khẳng định `apps/app/app/(app)/[slug]/settings/page.tsx` (đã sửa ở Task 1) là ĐẠT. Không đạt → mã 2: luật sai chứ không phải kho sai.

- [ ] **Step 3: Chiều đỏ — chạy thật**

```bash
D=$(mktemp -d) && cp -R apps/app "$D/" 
# cấy một lời gọi getLocale ngoài ranh Suspense vào một màn trong $D
node _acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs --goc "$D"
```

Expected: exit 1, nêu đúng `file:dòng` của màn bị cấy.

- [ ] **Step 4: Kiểm dân số lệch → mã 2**

Xoá một file khỏi bản sao → chân phải trả mã 2 vì đếm ra 24 ≠ neo 25.

- [ ] **Step 5: Commit**

**Phục vụ:** E2. **`independent: true`** (sau Task 1).

---

### Task 3: Thuộc E3 — chữ trên màn không đổi, so hai cây

**Files:**
- Create: `apps/app/test/chu-khong-doi.spec.ts`

**Interfaces:**
- Consumes: `git show <SHA>:<file>` cho vế trái, đĩa cho vế phải
- Produces: 19 ca, mỗi ca so `vi` và `en` từng ký tự

- [ ] **Step 1: Viết thuộc**

Dân số = 19 màn lấy **tại SHA ghim** bằng `git show`. Với mỗi màn: rút tên hàm kho chuỗi và khoá nó dùng, ở SHA ghim và ở HEAD; gọi hàm kho chuỗi thật cho cả `vi` và `en`; so từng ký tự.

`expect` phải mang nhãn để đọc được khi đỏ:
```ts
expect([man, "vi"]).toEqual([man, "vi"]);
```
theo lối `expect([nhan, giaTri]).toEqual([nhan, mongDoi])` kho đang dùng.

- [ ] **Step 2: Số ca = 19**

```ts
expect(soCa).toBe(19);
```
Tập rỗng hay lệch → thuộc phải đỏ, không im lặng bỏ qua.

- [ ] **Step 3: Chạy**

```bash
cd apps/app && bun test test/chu-khong-doi.spec.ts
```
Expected: 19 pass.

- [ ] **Step 4: Chiều đỏ**

Đổi một khoá trong bản sao → thuộc đỏ, nêu tên màn và cả hai chuỗi.

- [ ] **Step 5: Commit**

**Phục vụ:** E3. **`independent: true`** (sau Task 1).

---

### Task 4: Chân E4 — `generateMetadata` nguyên vẹn

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/metadata-nguyen-ven.mjs`

- [ ] **Step 1: Viết chân**

Với mỗi file có `generateMetadata` tại SHA ghim (neo **22**): rút thân hàm ấy bằng AST ở SHA ghim và ở **cây làm việc** (`git show <SHA>:<file>` so với file trên đĩa — không dùng `<SHA>..HEAD`, để sửa chưa commit cũng bị bắt), so từng ký tự sau khi chuẩn hoá khoảng trắng.

Đếm số file còn `generateMetadata` phải bằng 22.

- [ ] **Step 2: Chạy** — Expected: exit 0, in `22/22 nguyên vẹn`.

- [ ] **Step 3: Chiều đỏ** — sửa một thân `generateMetadata` trong bản sao → exit 1, in tên hàm và tên file.

- [ ] **Step 4: Commit**

**Phục vụ:** E4. **`independent: true`** (sau Task 1).

---

### Task 5: Đưa lệnh dựng vào bộ lệnh chứng

**Files:**
- Modify: `_acceptance/config.yaml` — thêm `executors.script.build_khong_cache` và thêm nó vào `feature_loop.suite_keys`
- Modify: `.githooks/pre-push` — thêm `build` vào vòng lặp task
- Modify: `.github/workflows/acceptance.yml` — thêm một bước chạy lệnh dựng
- Modify: `CLAUDE.md` — mục "Cách chứng minh nó chạy" nay có năm lệnh

**KHÔNG đụng `.github/workflows/ci.yml`.**

- [ ] **Step 1: Ổ cắm ép chạy lại**

Theo đúng lối `check_types_khong_cache` đã có trong config — đọc nó trước rồi chép hình dạng, không tự đúc kiểu mới.

- [ ] **Step 2: Thêm vào `feature_loop.suite_keys`**

Dùng script splice chung, không sửa tay:
```bash
node /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.8.0/scripts/config-patch.mjs --config _acceptance/config.yaml --key feature_loop.suite_keys --value "[executors.test.api, executors.script.check_types_khong_cache, executors.script.lint_khong_cache, executors.script.lint_slop, executors.script.build_khong_cache]" --write
```

- [ ] **Step 3: pre-push**

```sh
for task in check-types lint lint:slop test build; do
```

- [ ] **Step 4: acceptance.yml** — thêm một bước `- run: bun run build`, không `continue-on-error`, không `if:` chặn.

- [ ] **Step 5: Chạy pre-push thật**

```bash
.githooks/pre-push
```
Expected: exit 0, và log có dòng `pre-push: bun run build`.

- [ ] **Step 6: Commit**

**Phục vụ:** E5, E6. **`independent: true`** (không phụ thuộc Task 1).

---

### Task 6: Chân E5 — ba nơi đều chạy, hai nơi đo bằng hành vi

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs`

- [ ] **Step 1: Năm điều**

1. config có ổ cắm `build` và `suite_keys` gọi tên nó — đọc bằng trình phân tích YAML.
2. `ci.yml` không đổi một ký tự so với SHA ghim.
3. `pre-push` có `build` trong danh sách — **tách biến vòng `for task in …`**, không grep chuỗi `build`.
4. **Hành vi:** bản sao đã cấy lại lỗi cũ → chạy `.githooks/pre-push` → mã khác 0. Đối chứng dương: bản sao chưa cấy → mã 0. Thiếu đối chứng dương → mã 2.
5. `acceptance.yml`: bước chạy lệnh dựng không mang `continue-on-error: true` và không nằm dưới `if:` không bao giờ đúng — đọc bằng trình phân tích YAML.

- [ ] **Step 2: Chạy** — Expected: exit 0, in năm dòng "đạt".

- [ ] **Step 3: Chiều đỏ (hai lượt)**

Gỡ `build` khỏi `suite_keys` trong bản sao → exit 1 nêu điều 1.
Thêm `continue-on-error: true` vào bước ấy → exit 1 nêu điều 5.

- [ ] **Step 4: Commit**

**Phục vụ:** E5. **`independent: false`** — cần Task 5 xong.

---

### Task 7: Chân E6 — ổ cắm mới thật sự ép chạy lại

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/o-cam-ep-chay-lai.mjs`

- [ ] **Step 1: Viết chân**

Chạy ổ cắm mới **hai lượt liên tiếp** không đổi gì, đọc **dấu vết turbo** (`cache bypass` / `FULL TURBO` / `cache hit`) chứ không đoán theo thời gian. Cả hai lượt phải thật sự dựng.

- [ ] **Step 2: Chạy** — Expected: exit 0, in dấu vết cả hai lượt.

- [ ] **Step 3: Chiều đỏ** — bỏ cờ ép trong bản sao → lượt hai ăn đệm → exit 1, in ra dòng turbo chứng minh.

- [ ] **Step 4: Không đọc được dấu vết → mã 2**, không rơi về đo thời gian.

- [ ] **Step 5: Commit**

**Phục vụ:** E6. **`independent: false`** — cần Task 5 xong.

---

### Task 8: Chân E7 — lệnh chứng mới bắt được đúng lớp lỗi

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/bat-duoc-lop-loi.mjs`

- [ ] **Step 1: Bốn bước có răng**

1. **Đối chứng dương trước:** bản sao chưa cấy phải `bun run build` mã 0. Không xanh → mã 2 ngay.
2. Cấy vào màn **ghim tên** `apps/app/app/(app)/[slug]/settings/page.tsx`: đưa `const t = settingsMessages(await getLocale());` lên thân hàm xuất mặc định và làm nó `async`, cú pháp vẫn hợp lệ. Chân tự kiểm cú pháp bằng cách phân tích lại file trước khi chạy lệnh dựng.
3. `bun run build` → mã khác 0, thông điệp chứa tên màn **và** chuỗi `uncached or runtime data during prerendering`. Đỏ vì lỗi cú pháp hay lỗi kiểu → mã 1, không nhận.
4. Khôi phục bản sao, chạy lại → mã 0.

- [ ] **Step 2: Chạy** — Expected: exit 0.

- [ ] **Step 3: Commit**

**Phục vụ:** E7. **`independent: false`** — cần Task 1 và Task 5 xong.

---

### Task 9: Chân E1 và E8 — hai chân chạy lệnh

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/lenh-dung-xanh.mjs`
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs`

- [ ] **Step 1: E1** — chạy `bun run build` ép chạy lại, in mã. Không chạy được (thiếu phụ thuộc, hết giờ) → mã 2, không phải mã 1.

- [ ] **Step 2: E8** — chạy bốn lệnh cũ, in mã từng lệnh; thêm khẳng định `apps/app` ra **đúng ba** cảnh báo lint, lệch hai chiều đều đỏ.

- [ ] **Step 3: Chạy cả hai** — Expected: exit 0.

- [ ] **Step 4: Commit**

**Phục vụ:** E1, E8. **`independent: true`** (sau Task 1).

---

### Task 10: Nối ổ cắm và chạy trọn bộ chứng

**Files:**
- Modify: `_acceptance/config.yaml` — bảy ổ cắm `ld_*` cho E1…E8

- [ ] **Step 1: Cắm bảy ổ**

`ld_lenh_dung_xanh` · `ld_khong_doc_ngoai_suspense` · `ld_chu_khong_doi` (test) · `ld_metadata_nguyen_ven` · `ld_ba_noi_deu_chay` · `ld_o_cam_ep_chay_lai` · `ld_bat_duoc_lop_loi` · `ld_bon_lenh_cu`.

- [ ] **Step 2: Kiểm từng ổ cắm resolve được**

Chạy `s4-args.mjs` — nó fail-CLOSED khi một `config:` ref hỏng.

- [ ] **Step 3: Năm lệnh chứng**

```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```
Expected: cả **năm** mã 0. `apps/app` về đúng ba cảnh báo lint.

- [ ] **Step 4: Commit**

**Phục vụ:** toàn bộ. **`independent: false`** — task cuối.
