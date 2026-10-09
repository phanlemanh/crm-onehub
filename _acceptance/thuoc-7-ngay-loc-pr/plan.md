# thuoc-7-ngay-loc-pr — kế hoạch thi công

> Thực thi: Native, tuần tự trong vòng chính (feature-loop S3). Các bước dùng ô `- [ ]`.

**Goal:** Viết lại `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs` để đúng dòng Đường đo của F21 cho ra số thật của PR vào `onehub`.

**Architecture:** Một tệp: hàm thuần được xuất (gắn PR, xếp job dừng, tổng hợp, trung vị, kết luận, cửa sổ) và phần chạy chỉ thi hành khi tệp là lệnh chính. Đọc GitHub qua `gh api` (đồng bộ, `execFileSync`), mọi lỗi đọc thành mã 2. Mẫu kiểm đơn vị là JSON thật chụp từ GitHub.

**Tech Stack:** Node ≥ 24 và Bun 1.3 (không `Bun.*`), `node:test`, `gh` CLI.

**Spec:** `_acceptance/thuoc-7-ngay-loc-pr/design.md`, `contract.md`, `evals.yaml`.

## Global Constraints

- Không chú thích trong mã (luật kho).
- Mã thoát: 0 có kết luận · 2 không đo được · 3 chưa đủ để kết luận.
- Ngưỡng: ≥ 10 lượt xanh; SỐNG trung vị ≤ 15′ và 0 dừng vì trần; CHẾT trung vị > 20′ hoặc ≥ 1 dừng vì trần.
- Trung vị trên lượt xanh; số lượt chẵn lấy trung bình hai giá trị giữa.
- Ranh giới: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`, `_acceptance/ci-ma-tran-ba-o/evals.yaml`, `_acceptance/thuoc-7-ngay-loc-pr/**`, và chỉ THÊM khoá `executors.script.t7n_*` vào `_acceptance/config.yaml`.
- Đường dẫn trong mọi script suy từ `import.meta.dirname`, không hardcode gốc.

## Review Focus

1. Lượt có `head_branch` trùng nhiều PR (cùng branch mở lại PR mới) — chọn PR có `head.ref` trùng và base trùng `--nhanh`; có ít nhất một PR base trùng thì vào mẫu.
2. Job dừng có nhiều annotation (lý do + «The operation was canceled.») — xếp theo câu lý do, không theo câu chung.
3. Lượt đang chạy (`status != completed`) trong cửa sổ chưa đóng — không phải lượt xanh, không phải lỗi; đếm «đang chạy».
4. `%cI` mang múi giờ +07:00 — đổi sang UTC trước khi in và cộng 7 ngày.
5. Job chưa có `completed_at` ở lần chạy cuối của lượt đã xong — bỏ khỏi max, không ném lỗi.

Mỗi dòng có ca kiểm ở Task 2.

---

### Task 1: Chụp mẫu thật từ GitHub

**Files:**
- Create: `_acceptance/thuoc-7-ngay-loc-pr/rang/chup-mau.mjs`
- Create: `_acceptance/thuoc-7-ngay-loc-pr/rang/mau/*.json`

**Verify:** `node _acceptance/thuoc-7-ngay-loc-pr/rang/chup-mau.mjs && ls _acceptance/thuoc-7-ngay-loc-pr/rang/mau`

**Phục vụ:** E1. **independent:** false.

- [ ] Script gọi `gh api` và ghi nguyên văn JSON: lượt 37841386976 (`/actions/runs/<id>`, `/jobs?filter=all`), annotation của job dừng vì trần ở attempt 1 của nó, lượt 37877228894 và annotation job bị đè, `commits/<sha>/pulls` của một lượt PR đã gộp (37895940297) và của lượt `thu/ci-tach-job` (37860355090, trả `[]`), job của một lượt hình ma trận xanh (37909138411).
- [ ] Chạy, xem tệp đúng hình, commit.

### Task 2: Hàm thuần + kiểm đơn vị (E1)

**Files:**
- Modify (viết lại): `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
- Create: `_acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs`

**Interfaces — Produces:**
- `ganPr(luot, pulls, nhanh) → "mau" | "base-khac" | "khong-gan"`
- `xepDung(job, annotations) → "tran" | "de" | "tay" | "chua-chay"`; ném `LoiDo` («khong xep duoc …») khi job đã chạy mà không câu nào khớp.
- `tongHopLuot(run, jobs, xep) → { xanh, maTran, dangChay, daiNhatPhut, dung: {tran,de,tay,"chua-chay"} }` — `jobs` gồm mọi attempt; `daiNhatPhut` và `xanh` chỉ tính attempt bằng `run.run_attempt`.
- `trungVi(ds) → number`
- `ketLuan({ xanh: number[], tran, dong }) → { nhan: "SONG"|"CHET"|"giua"|"chua", ma: 0|3, trungVi }`
- `cuaSo({ tu, den, mocGop, bayGio }) → { tu: ISO, den: ISO, dong: boolean }`
- `class LoiDo extends Error`

- [ ] Viết test trước (`node:test`), mỗi luật một cặp xanh/đỏ trên cùng mẫu thật, thông điệp ghim: ganPr (đã gộp vào mẫu; đọc `pull_requests` của lượt thì rơi), xepDung (ba câu thật; `started_at` null → chua-chay; chỉ «The operation was canceled.» → LoiDo gọi tên job), tongHopLuot (37841386976: 1 trần ở attempt 1, xanh theo attempt 2? — lượt hình một job không có `ci-ok` nên `maTran: false`; ca xanh dùng 37909138411: xanh, dài nhất 10,25′), ketLuan (ma trận biên viết trước: 10/9 lượt × trung vị 15/15,01/20/20,01 × 0/1 trần × đóng/chưa), trungVi (trộn lượt không xanh không lọt vì `ketLuan` chỉ nhận mảng của lượt xanh — ca đỏ: bản sao truyền mọi lượt), chẵn 14/16,5 → 15,25, cuaSo (`2026-10-09T12:42:52+07:00`).
- [ ] Chạy: `node --test _acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs` → đỏ (hàm chưa có).
- [ ] Viết hàm, chạy lại → xanh. Phá-thử từng luật trong bản sao (đọc `pull_requests`, xếp theo thời lượng, bỏ lọc attempt, trung vị mọi lượt) → ca đỏ đúng thông điệp. Commit.

### Task 3: Phần chạy + bốn eval GitHub (E2–E5)

**Files:**
- Modify: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs` (phần chạy)
- Create: `_acceptance/thuoc-7-ngay-loc-pr/rang/{chung.mjs,cua-so-cu.mjs,mac-dinh.mjs,gh-gia.mjs,phan-trang.mjs}`

**Interfaces — Consumes:** hàm của Task 2. **Produces:** dòng đầu ra máy đọc được, mỗi dòng `khoá: giá trị` (`cua so`, `luot ci.yml`, `vao mau`, `khong gan duoc`, `base khac`, `dang chay`, `luot xanh`, `khong mang hinh ma tran`, `dung vi tran`, `bi de`, `dung tay`, `dung khi chua chay`, `job dai nhat`, `trung vi`, `ket luan`).

- [ ] Phần chạy: đọc `--nhanh` (bắt buộc), `--tu`, `--den`; mốc gộp từ `git log -1 --first-parent --format=%cI origin/<nhánh> -- .github/workflows/ci.yml`; `gh api --paginate` cho lượt và job (`per_page=100`, `-q` từng phần tử thành NDJSON); annotation cho mọi job `cancelled`; in các dòng; `LoiDo` hay `gh` lỗi → mã 2, không in `ket luan`.
- [ ] `chung.mjs`: chạy thước bằng runtime cho trước, tách dòng `khoá: giá trị`.
- [ ] `cua-so-cu.mjs` (E2): hai cửa sổ cố định × node/bun, so số ghim.
- [ ] `mac-dinh.mjs` (E3): cửa sổ mặc định × node/bun, so mốc với `git log`, so lượt xanh và dừng vì trần với số đếm độc lập (đường riêng: `gh api` lượt → `commits/<sha>/pulls` → `jobs?filter=all`).
- [ ] `gh-gia.mjs` (E4): `gh` giả trong thư mục tạm đầu PATH, bốn ô.
- [ ] `phan-trang.mjs` (E5): cửa sổ 141 lượt, biên 20 lượt, bản sao bỏ `--paginate` → 100.
- [ ] Chạy cả bốn, commit.

### Task 4: Nối F21 và khai eval (E6)

**Files:**
- Modify: `_acceptance/ci-ma-tran-ba-o/evals.yaml` (E5: `status: not-run`, `superseded_by: thuoc-7-ngay-loc-pr#AC-4`)
- Modify: `_acceptance/config.yaml` (thêm `t7n_don_vi`, `t7n_cua_so_cu`, `t7n_mac_dinh`, `t7n_loi_gh`, `t7n_phan_trang`, `t7n_noi_f21`)
- Create: `_acceptance/thuoc-7-ngay-loc-pr/rang/noi-f21.mjs`

- [ ] `noi-f21.mjs`: đọc E5 bằng `lib/eval-yaml.cjs`; gọi `chungThayBoi` trên cây thật (ok hoặc chỉ `ho-so-thay-chua-ky` khi chưa ký); trên bản sao tạm dựng ba ca (ok, `ac-thay-vang`, `thay-khong-nhan`).
- [ ] Khai khoá config, chạy `node _acceptance/thuoc-7-ngay-loc-pr/rang/noi-f21.mjs`, commit. Đặt contract `status: implemented`.
