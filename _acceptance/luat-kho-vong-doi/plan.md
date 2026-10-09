# Kế hoạch thi công — luat-kho-vong-doi

Hồ sơ: `contract.md` (đã duyệt Cổng 1 ngày 09/10), `evals.yaml`, `design.md`. Mọi bước bám khuôn sáu luật sẵn có của
`scripts/luat-kho/do-cay.mjs`: luật đọc cây cú pháp TypeScript, nền theo tệp và chữ dòng trong `cau-hinh.mjs`, tự gài ca
phá thử trên bản gương. Không viết chú thích trong mã (AGENTS.md).

## Task 1 — cấu hình và đọc schema

**Files:** `scripts/luat-kho/cau-hinh.mjs` (thêm `luat.vongDoi`: `ten: "vong-doi"`, `schema:
"packages/db/prisma/schema.prisma"`, `cotCat: ["archivedAt", "deletedAt"]`, `cotDanhDau: "archivedAt"`,
`dinhDanhKiem: ["archivedAt", "archivedFilter"]`, `tienToList: "list"`, `hamDoc: "findMany"`, `hamXoa: ["delete",
"deleteMany"]`), `scripts/luat-kho/do-cay.mjs` (`docSchema(goc)` → `{ mo: [{ ten, so, cot }], cat: Set<truy cập> }`).
**Verify:** `node scripts/luat-kho/do-cay.mjs --chi-do .` vẫn in sáu dòng cũ như trước. **Phục vụ:** E1, E2.
**independent:** false.

## Task 2 — phân tích phương thức lớp

**Files:** `do-cay.mjs` — `phanTich` thêm `lop: [{ ten, phuongThuc: Map<tên, { so, goi: [{ truyCap, ham, so }], goiThis:
Set, coKiem }> }]`; `goi` lấy từ `<x>.<truyCap>.<ham>(` (truy cập là tên đứng ngay trước hàm), `goiThis` từ
`this.<tên>(`, `coKiem` khi thân có định danh trong `dinhDanhKiem` (kể cả tên thuộc tính `archivedAt: null` và
`pb.archivedAt`).
**Verify:** như Task 1. **Phục vụ:** E1, E2. **independent:** false.

## Task 3 — hàm luật `vong-doi`

**Files:** `do-cay.mjs` — `THU_TU` thêm luật thứ bảy; `HAM_LUAT["vong-doi"]` chỉ cho tệp trong app Nest và không phải tệp
kiểm: (b) phương thức tên `list*` gọi `findMany` trên mô hình cất mà `kiem(m)` sai → `list lan ban da cat: <truy cập>`;
(a) mọi phương thức gọi `delete`/`deleteMany` trên mô hình cất mà `kiem(m)` sai → `xoa vinh vien khong kiem da luu tru:
<truy cập>`; `kiem(m) = m.coKiem || m.goiThis có hàm cùng lớp coKiem`. `kiemSchema(goc)` cho (c) → `mo hinh <Tên> co hai
cach cat`, `van` = dòng `model <Tên> {`. `luatVang`: thiếu schema hay không có app Nest → `vong-doi` vắng. `nc` mang
`cat` từ `docSchema`.
**Verify:** `node scripts/luat-kho/do-cay.mjs --chi-do .` in `DO vong-doi` đúng hai chỗ AgentDefinition (trước khi có nền).
**Phục vụ:** E1, E2. **independent:** false.

## Task 4 — nền và tự gài

**Files:** `cau-hinh.mjs` — `nen["vong-doi"]` hai chỗ (`model AgentDefinition {` trong schema; dòng `findMany` của `list`
trong `apps/api/src/agent/agent-definitions.service.ts`). `do-cay.mjs` — `chepGuong` chép thêm schema; thêm kiểu bước
`tepSua(tep, sua)` sửa tệp có sẵn; bảy ca `PHA` có tên: `vd-hai-cot`, `vd-list-khong-loc`, `vd-xoa-khong-kiem` (đỏ) và
`vd-mot-cot`, `vd-list-loc-qua-ham-phu`, `vd-xoa-kiem-qua-ham-phu`, `vd-khong-ten-list` (xanh), dùng app Nest giả
`THU.api`.
**Verify:** `node scripts/luat-kho/do-cay.mjs --du-luat` → `XANH vong-doi: … (nen 2 tep, 2 dong cu)`, chiều đo 39/39
(thoát 1 chỉ vì `cach-ly-hai-agent` của #321 cho tới khi P3 sửa). Phá thử: bỏ một ca đỏ khỏi hàm luật → chiều đo
`SAI pha-…`, mã 2. **Phục vụ:** E1. **independent:** false.

## Task 5 — bài đo E2

**Files:** `_acceptance/luat-kho-vong-doi/rang/pha.mjs` — ma trận đúng như `expected` của E2 (c1, b1–b4, a1–a4, n1–n2,
k1–k2, h1–h2), mỗi ô một cặp đỏ/xanh trên cùng bản sao tmpdir, chạy CHÍNH `do-cay.mjs --chi-do` (h1/h2 chạy bản sao của
`do-cay.mjs` đã làm hỏng), gốc kho suy từ `import.meta.dirname`, bấm `git status` trước/sau.
**Verify:** `node _acceptance/luat-kho-vong-doi/rang/pha.mjs` mã 0; phá thử: sửa `kiem(m)` luôn đúng → các ô đỏ hỏng, mã 1
gọi tên ô. **Phục vụ:** E2. **independent:** true.

## Task 6 — CI và bài đo E3

**Files:** `.github/workflows/acceptance.yml` — job `luật kho`: checkout, setup-bun, `bun install --frozen-lockfile`,
`node scripts/luat-kho/do-cay.mjs --du-luat`. `_acceptance/luat-kho-vong-doi/rang/ci.mjs` — đọc YAML bằng gói `yaml` của
kho, kiểm bước và không `continue-on-error`; chiều đỏ trên bản sao.
**Verify:** `node _acceptance/luat-kho-vong-doi/rang/ci.mjs` mã 0. **Phục vụ:** E3. **independent:** true.

## Task 7 — bài đo E4 và khoá cấu hình

**Files:** `_acceptance/luat-kho-vong-doi/rang/thoi-gian.mjs` (gốc cố định `532e33175`, dùng `node_modules` của cây đang
xét, bắt buộc dòng KET LUAN); `_acceptance/config.yaml` thêm `lkv_pha`, `lkv_ci`, `lkv_thoi_gian` (chỉ thêm, giám sát
duyệt P4-41).
**Verify:** `node _acceptance/luat-kho-vong-doi/rang/thoi-gian.mjs` mã 0; `LKV_TRAN_GIAY=0` → mã 1 «vuot tran».
**Phục vụ:** E4. **independent:** true.

## Thứ tự

Task 1 → 2 → 3 → 4 tuần tự (cùng `do-cay.mjs`). Task 5, 6, 7 độc lập, làm sau Task 4. S4 chỉ dispatch khi bản sửa #321
của P3 đã nằm trong HEAD (điều kiện vào S4 của E1); chưa có thì S4 BLOCKED «chờ bản sửa #321».
