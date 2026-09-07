# Ổ cắm phải giải ra một lệnh chạy được — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Mọi ổ cắm trong `_acceptance/config.yaml` giải ra một lệnh chạy được, và file parse được bằng YAML thật.

**Architecture:** Hai hình dạng sửa. Hình dạng A — 11 ổ cắm không chứa nháy đơn — bọc cả giá trị trong `'…'`; cả hai trình đọc trả đúng chuỗi bên trong. Hình dạng B — 5 ổ cắm chứa cả `"` lẫn `'` — đưa thân lệnh vào file `.sh` cạnh hồ sơ sở hữu, để giá trị không còn ngoặc và không còn `: `.

**Spec:** `docs/superpowers/specs/2026-09-07-o-cam-chay-duoc-that-design.md`

## Global Constraints

- SHA ghim `632aee6a3dde3e070f4dcaa7c61af21a9e6d2618`. Neo: 227 ổ cắm kế thừa + 8 thêm = 235 · 16 phải sửa (11 A, 5 B) · 25 file evidence-report · 222 khoá verifier distinct.
- **Không đổi khoá ổ cắm nào.** Chỉ đổi giá trị.
- Không viết chú thích trong code. Không `Record<string, unknown>`. Không `typeof x === "..."`.
- Chân đo **nạp `resolveConfigKey` thật của bộ kit** qua `resolve-plugin.mjs`, không viết lại.
- `resolveConfigKey(text, khoá)` nhận VĂN BẢN — chiều đỏ bẻ bản sao trong bộ nhớ, không ghi đè file thật.
- Mọi chân kết bằng so `sha256` của `_acceptance/config.yaml` với lúc bắt đầu; lệch là mã 2.

---

### Task 1: Sửa 11 ổ cắm hình dạng A

**Files:** Modify `_acceptance/config.yaml`

- [ ] **Step 1: Bọc nháy đơn** cho: `test.tt_api` · `test.go_khoa_api` · `test.go_khoa_app` · `script.rang_suite_sach` · `script.rang_suite_thu_tu` · `script.rang_microsoft_duong` · `script.rang_microsoft_do` · `script.rang_microsoft_nguon_env` · `script.rang_microsoft_hinh_thuc` · `script.tt_crawl_to_ingest` · `script.apr_lech_so_dong_do`.
- [ ] **Step 2: Kiểm ngay** — với mỗi cái, `resolveConfigKey` phải trả đúng chuỗi gốc (có ngoặc kép cân), và `bash -n -c` mã 0.
- [ ] **Step 3: Commit**

**Phục vụ:** E1, E3, E6. **`independent: false`**

---

### Task 2: Đưa 5 ổ cắm hình dạng B vào file script

**Files:** Create `_acceptance/auto-pr-thoi-do-o-ban-re/rang-*.sh` · Modify `_acceptance/config.yaml`

- [ ] **Step 1:** Với `apr_check_run`, `apr_check_run_do`, `apr_lech_so_dong`, `apr_lech_noi_dung`, `apr_lech_noi_dung_do` — chép **nguyên văn** thân lệnh vào một file `.sh`, `chmod +x`, giá trị ổ cắm thành `bash _acceptance/auto-pr-thoi-do-o-ban-re/<tên>.sh`.
- [ ] **Step 2:** Mỗi script mở bằng `set -euo pipefail`. Giữ nguyên mã thoát của lệnh gốc — chân đo của hồ sơ ấy đọc mã thoát.
- [ ] **Step 3: Kiểm** — `resolveConfigKey` trả đường dẫn không ngoặc; `bash -n` mã 0; chạy thật, so mã thoát với lệnh gốc.
- [ ] **Step 4: Commit**

**Phục vụ:** E1, E2, E3, E6. **`independent: false`**

---

### Task 3: Chín chân đo

**Files:** Create `_acceptance/o-cam-chay-duoc-that/rang/*.mjs`

| Chân | Đo gì |
| --- | --- |
| `moi-o-cam-chay-duoc.mjs` | E1 — 235 ổ cắm qua `bash -n`, cộng chặng mọi đường dẫn file trỏ tới đều tồn tại |
| `yaml-doc-duoc.mjs` | E2 — `Bun.YAML.parse` không ném, đọc ra ba nhánh |
| `hai-trinh-doc-bang-nhau.mjs` | E3 — kit vs YAML, trùng từng ký tự trên cả 235 |
| `khoa-khong-doi.mjs` | E4 — khoá cũ còn nguyên, khoá thêm trong allowlist tám tên |
| `verifier-con-giai-duoc.mjs` | E5 — ≥25 file, ≥222 khoá distinct, cả 16 khoá của vòng có mặt |
| `lenh-van-lam-dung-viec.mjs` | E6 — chạy trọn 16 lệnh, số lệnh phải bằng 16 |
| `chan-ho-so-da-ky-chay-lai.mjs` | E7 — hai chân của `lenh-dung-do-khong-ai-thay` mã 0; và chứng bản cũ crash |
| `ham-kit-chua-doi.mjs` | E9 — dấu vân hành vi ba chuỗi mẫu, in đường dẫn đã nạp |
| `nam-lenh-chung.mjs` | E8 — năm lệnh chứng, ba cảnh báo lint |

- [ ] **Step 1–9:** Mỗi chân viết xong chạy ngay cả hai chiều trước khi sang chân kế.
- [ ] **Step 10: Commit**

**Phục vụ:** toàn bộ. **`independent: true`** (sau Task 1 và 2)

---

### Task 4: Cắm ổ và chạy trọn bộ

**Files:** Modify `_acceptance/config.yaml`

- [ ] **Step 1:** Cắm tám ổ `oc_*` — đúng tám tên đã ghim, không hơn.
- [ ] **Step 2:** Kiểm mọi `config:` ref của mọi `evals.yaml` còn giải được.
- [ ] **Step 3:** Năm lệnh chứng đều mã 0.
- [ ] **Step 4: Commit**

**Phục vụ:** toàn bộ. **`independent: false`**
