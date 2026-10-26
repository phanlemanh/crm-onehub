# Hồ sơ đỏ ở kiểm chéo — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 44 ô đỏ của 19 hồ sơ đã ký được sửa thước hoặc khai lý do và ghim lại xanh; 4 lỗi sản phẩm thật đi tín hiệu, 3 hồ sơ dính chúng hoàn lại với cách sửa ghi sẵn.

**Architecture:** Một danh sách đóng `_acceptance/ho-so-do-kiem-cheo/danh-sach.json` là nguồn sự thật; sáu răng của hồ sơ (`rang/*.mjs`, một mô-đun dùng chung `rang/chung.mjs`) đo nó theo bảy AC. Sửa thước ở hồ sơ khác đi theo cụm, mỗi dòng có bản vá đột biến dưới `dot-bien/` để bộ chạy chiều đỏ chứng.

**Tech Stack:** Node 24 / Bun, `node:child_process` + git, bộ đọc evals của acceptance-gate qua `scripts/resolve-plugin.mjs`, gói `yaml` 2.9 của kho.

**Spec:** `docs/superpowers/specs/2026-10-22-ho-so-do-kiem-cheo-design.md` · hợp đồng `_acceptance/ho-so-do-kiem-cheo/contract.md` · `evals.yaml` cùng thư mục.

## Global Constraints

- Mốc nền `6be0bb688900ecd8843989bd8f8b3095548b604f`, không bao giờ `merge-base` hay `HEAD` trôi.
- Không chú thích mã (AGENTS.md). Hằng tinh chỉnh gom trong `rang/chung.mjs`.
- Không sửa `contract.md` của hồ sơ khác; không sửa `apps/**`, `packages/**`.
- Commit chạm hồ sơ khác mang «(ho-so-do-kiem-cheo)» trong tiêu đề (E2 đòi).
- `_acceptance/config.yaml` chỉ thêm dòng hoặc đổi lệnh của chính hồ sơ có dòng (luật 7, luật 23).
- Mỗi dòng sửa thước: một dòng sổ `fix` mang `decided_by: Manh Phan` (luật 23, chủ kho duyệt A 19/10).
- Việc nặng (lượt đo nhiều hồ sơ, chiều đỏ đầy đủ, ghim lại) qua `khoa-may/chay-nang.sh`; ghim lại xin khoá `ghim-lai` của đợt.
- Sửa răng của hồ sơ khác chỉ sau khi giám sát trả lời yêu cầu chạm tệp F1-23.

## Review Focus

- Hồ sơ hai bên dùng chung một bảng (`chu-mac-dinh-thu-vien-ngoai` ↔ `chan-lai-component-ra-man`): sửa một bên phải sửa bên kia cùng commit — chiều đỏ chạy cả hai eval.
- Sha neo không có trong bản sao nông (CI clone `--depth`): răng neo phải thoát mã 2 «KHONG DO DUOC», không xanh — đột biến `neo-sai` ở mọi dòng `neo-co-dinh`.
- Lệnh đo màn của chiều đỏ mất 3–11 phút mỗi lượt: bộ chạy phải dọn cây tạm khi bị ngắt (SIGINT/SIGTERM) và cho chạy riêng một hồ sơ (`--chi`).
- Gộp `onehub` giữa chừng đổi HEAD: danh sách và do-lai-nen không đổi theo (neo mốc nền); `khai-du` loại commit đã có ở `origin/onehub`.
- `evals.yaml` sửa cú pháp mà đổi nghĩa thầm (ví dụ nháy kép đổi `\\` thành `\`): `yaml-chuan` so bản ghi kit trường-theo-trường với mốc nền.

---

### Task 1: Danh sách đóng và phép danh sách (E1)

**Files:** Create `_acceptance/ho-so-do-kiem-cheo/rang/chung.mjs`, `rang/danh-sach.mjs`, `danh-sach.json`; dùng `rang/do-lai.mjs` đã có. **Phục vụ:** E1. **independent:** false (nền của mọi task).

**Interfaces — Produces (chung.mjs):** `GOC`, `SLUG`, `MOC_NEN`, `XU_LY = ["neo-co-dinh","sua-rang","khai-not-run","tro-duong-moi","tu-het","sua-cu-phap","san-pham-hong"]`, `hong(ma, chu)`, `git(...a)`, `gitThu(...a)`, `kit()`, `docTai(ref, duong)`, `docDanhSach(duong?) → {moc_nen, dong:[Dong], hoan_lai:[HoanLai]}`, `khoa(d) = "<ho_so>:<eval>"`, `tapDauVao() → string[]`, `yamlHong(text) → {dong, cot, loi}|null`.
`Dong = {ho_so, eval, xu_ly, ly_do, can_cu, tep?: string[], dot_bien?: {ten, ban_va, thong_diep}, dot_bien_neo?: {ten, ban_va}}`; dòng `sua-cu-phap` có `eval: "evals.yaml"`.
`HoanLai = {ho_so, eval_do: string[], san_pham_hong: string[], tin_hieu: {ma, tieu_de, noi_dung}, sua_san: [{eval, xu_ly, sua, dot_bien}]}`.

- [ ] Viết `danh-sach.json` từ ba tệp nháp ở scratchpad (`xu-ly-nhap*.json`): 44 dòng ô đỏ + 5 dòng `sua-cu-phap`; ba mục `hoan_lai` với 29 ô.
- [ ] `danh-sach.mjs` theo E1: tự kiểm (`THIEU`, `THUA`, `THIEU_DO`), so số với Context, `--tai-lap` dựng cây tạm ở mốc nền và chạy `do-lai.mjs` cho eval không qua `tien-de.mjs`/`mot-luot.sh`/`APP_URL`.
- [ ] Chạy `bun _acceptance/ho-so-do-kiem-cheo/rang/danh-sach.mjs` → mã 0, dòng tổng «27 hồ sơ đầu vào · 345 eval máy · 44 dòng + 29 eval hoàn lại = 73 đỏ».
- [ ] Phá thử: bỏ một dòng khỏi bản sao → `THIEU <khoá>` mã 1. Commit.

### Task 2: Khai đủ và bảng trước/sau (E2)

**Files:** Create `rang/khai-du.mjs`, `rang/bang.mjs`, `bang-truoc-sau.md` (máy sinh). **Phục vụ:** E2, E6. **independent:** false (cần T1).

**Interfaces:** Consumes chung.mjs. Produces `sinhBang() → string` (bang.mjs), `kiemKhai({...}) → string[]` (khai-du.mjs, chép khuôn `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs` rồi thêm `DOI_LOI_AC`, `COMMIT_KHONG_NHAN`, `CONFIG_NGOAI`, `NGOAI_KHO_HO_SO`, `BANG_LECH`).

- [ ] `bang.mjs`: mỗi dòng (kể cả `san-pham-hong` trong `hoan_lai`) một khối — đuôi đỏ từ `do-lai-nen.json`, nguyên văn căn cứ (`tệp:dòng` đọc ở HEAD, sha → `git log -1 --format=%s%n%b`), eval trước (`git show MOC_NEN:…`) / sau, đầu ra đột biến (đọc `.acceptance-runs/ho-so-do-kiem-cheo/chieu-do.json` nếu có).
- [ ] `khai-du.mjs` mười luật của E2, mỗi luật một cặp đỏ trên bản sao trong tmpdir.
- [ ] Chạy cả hai → mã 0 (lúc này chưa có thay đổi ngoài hồ sơ: «0 tệp đổi»). Commit.

### Task 3: Bộ chạy chiều đỏ (E3)

**Files:** Create `rang/chieu-do.mjs`. **Phục vụ:** E3. **independent:** false (cần T1).

**Interfaces:** Produces `chayDong(cay, dong, cmd, kyVong) → {nguyenVen, dotBien, coThongDiep}`; ghi `.acceptance-runs/ho-so-do-kiem-cheo/chieu-do.json`.

- [ ] Cây tạm `git worktree add --detach <tmp> HEAD`, symlink `.env`, `node_modules`, `apps/*/node_modules`, `packages/*/node_modules`; dọn ở `exit`, `SIGINT`, `SIGTERM`.
- [ ] Mỗi dòng: lệnh nguyên vẹn → kỳ vọng; `git apply` bản vá → không đạt + thông điệp; `git checkout -- .` ; `dot_bien_neo` → mã 2. Mã lỗi: `NGUYEN_VEN_DO`, `BAN_VA_HONG`, `DOT_BIEN_LOT`, `SAI_THONG_DIEP`, `NEO_SAI_XANH`, `THIEU_DOT_BIEN`. `--chi <hồ sơ>`.
- [ ] Đối chứng tự thân: dòng giả bản vá rỗng → `DOT_BIEN_LOT`; thông điệp bịa → `SAI_THONG_DIEP`. Commit.

### Task 4: Ghim xanh và lối ra (E4, E7) + gửi tín hiệu

**Files:** Create `rang/ghim-xanh.mjs` (chép khuôn F24, đọc danh sách F28), `rang/loi-ra.mjs`. **Phục vụ:** E4, E7. **independent:** false (cần T1).

- [ ] Gửi bốn tín hiệu: `node <thư mục đợt>/loi/dieu-phoi.mjs yeu-cau viec-phu --hang ho-so-do-kiem-cheo --noi-dung '{"tieu_de":…,"ly_do":…}'` — một cho mỗi lỗi; ghi mã trả về vào `hoan_lai[].tin_hieu.ma`.
- [ ] `loi-ra.mjs` theo E7 (khuôn `^F1-[0-9]+$`, `sua_san` đủ cho mọi eval đỏ khác). Chạy → mã 0. Commit.

### Task 5: Sửa cú pháp YAML (E5)

**Files:** Create `rang/yaml-chuan.mjs`; Modify `_acceptance/{danh-sach-keo-chung,dieu-phoi-hai-tang,lich-su-va-luu-tru-trang,no-sau-luot-5-okr,zalo-gui-hong-ghi-ly-do}/evals.yaml` (chỉ cú pháp). **Phục vụ:** E5. **independent:** true so với T6–T9 (khác tệp), cần F1-23.

- [ ] `yaml-chuan.mjs` theo E5 (lỗi `YAML_HONG`, `NGHIA_DOI` từng trường).
- [ ] Sửa từng tệp tới khi `YAML.parseDocument` không lỗi và `yaml-chuan` báo «bản ghi kit giống mốc nền». Commit «fix(ho-so-do-kiem-cheo): cú pháp YAML …».

### Task 6: Neo cặp gộp — 11 ô (Hỏi-2 duyệt)

**Files:** `rang/` của ban-gieo-gop-y-sau-nop (E4), ca-chap-chon-con-lai (E6), danh-sach-keo-chung (E13), to-chuc-danh-sach-chi-tiet (E21), bo-dung-khong-ket (E9), tro-ly-okr-nen (E22, E17), chu-cuoi-cung-tien-de (E5), zalo-gui-hong-ghi-ly-do (E7); áp `_acceptance/neo-thuoc-het-han/vao-f28-so-okr-tu-chay.patch` (so-okr-tu-chay E23, E25); `expected` các eval đó; `dot-bien/<hồ sơ>-<eval>.patch` + `-neo.patch`. **Phục vụ:** E2, E3. **independent:** false (cùng tệp với T7 ở tro-ly-okr-nen, so-okr-tu-chay).

- [ ] Mỗi răng: sha cặp gộp ở danh sách (đã thử ở scratchpad `tra-neo/`, `tra-cmd/`), kiểm `git cat-file -e`, không có → mã 2.
- [ ] zalo E7: tìm cặp gộp như các hồ sơ khác (commit đầu thêm `contract.md`, giao ancestry-path với first-parent).
- [ ] `chieu-do.mjs --chi <hồ sơ>` từng hồ sơ → bắt đúng. Commit một hồ sơ một commit.

### Task 7: Vật đổi theo hồ sơ ký sau, neo đếm, lỗi răng

**Files:** ca-chap-chon-cach-ly (E5, E7), chan-trung-khoa-ban-nhap (E3, E4), chan-lai-component-ra-man (E1, E2, E7 + kéo theo E9 của chu-mac-dinh), chu-mac-dinh-thu-vien-ngoai (E3, E4, E9), bo-xuong-kara (E10), cai-dat-chung-chi-quan-tri (E8), tro-ly-okr-nen (E4, E23, E25), so-okr-tu-chay (E8). **Phục vụ:** E2, E3. **independent:** false.

- [ ] Sửa theo cột `sua` của danh sách; bảng dựng sẵn ở scratchpad `tra-cmd/*.sua.json` chép vào chỗ.
- [ ] bo-xuong-kara E10 vế vân tay: E10 thôi xích răng mạng `ai-elements@latest` của hồ sơ khác — chỉ kiểm có mục artifact/task trong sổ (không chạm răng của `nen-chat-ai-elements`, ngoài danh sách).
- [ ] Mỗi hồ sơ: chạy eval (`do-lai.mjs --ra <tmp> <hồ sơ>`) → xanh; `chieu-do --chi` → bắt. Commit từng hồ sơ.

### Task 8: Màn đổi có chủ đích

**Files:** bang-thanh-vien-giu-hang (E1–E7, `rang/do-bang.mjs` hoặc răng chung `tieu-de-cot-doc-tron` mà lệnh gọi — sửa đúng tệp chứa câu chờ), cap-nhat-tuan-okr (E7 khai not-run, E14, E19), toan-canh-okr (E3, E28, E29), so-okr-tu-chay (E12, E14). **Phục vụ:** E2, E3. **independent:** false.

- [ ] Sửa theo cột `sua`; đo lại từng hồ sơ qua `do-lai.mjs` (đi `tien-de.mjs`, phiên đo riêng) — xanh.
- [ ] cap-nhat-tuan-okr E19 chạy lần đầu sau khi tách `try`: đỏ tiếp thì tra ngay, ghi dòng `fix` provisional.
- [ ] Bản vá đột biến cho mỗi dòng (DB-1, CN-1, TC-1…3, SO-1). Commit từng hồ sơ.

### Task 9: cron-theo-ban-khai (Hỏi-3, Hỏi-4 duyệt)

**Files:** `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`, `rang/ban-trien-khai-that.mjs`, `evals.yaml` (expected E7, E8). **Phục vụ:** E2, E3. **independent:** true so với T6–T8.

- [ ] E7: `stdio` inherit cho `test`, `maxBuffer` 64 MiB cho lint; ghim cảnh báo đo ở cây của cặp gộp vòng cron (cây tạm ở `GOP^2`), không ở HEAD.
- [ ] E8: đòi bản production READY có `meta.githubCommitSha` mà cặp gộp cron là tổ tiên (`git merge-base --is-ancestor GOP <sha>`); token hết hạn → in «token Vercel CLI hết hạn — chạy vercel login», mã 2.
- [ ] Đột biến: test hỏng → mã 1; sha bản production không chứa cặp gộp → mã 1.

### Task 10: Chiều đỏ đầy đủ, ghim lại, bảng

**Phục vụ:** E3, E4, E6. **independent:** false (cuối).

- [ ] Gộp `origin/onehub` nếu đã đổi; `bun install` nếu `bun.lock` đổi; vẽ lại bản đồ.
- [ ] `chieu-do.mjs` đầy đủ qua `chay-nang.sh` → mã 0.
- [ ] Xin khoá `ghim-lai`, `repin-lane.mjs --tung-ho-so --write` hai lượt (nhóm không đo màn, nhóm đo màn) qua `giu-nhip.mjs` → mọi hồ sơ trong danh sách có dòng repin xanh. Nhả khoá.
- [ ] `bang.mjs` sinh `bang-truoc-sau.md`; chạy E1, E2, E4, E5, E7 → mã 0. Commit, rồi S4.
