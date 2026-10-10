# Eval model thật đúng lúc — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** E15 của `tro-ly-doc-kho` không còn tốn token khi đầu vào không đổi, không còn đỏ oan vì lỗi hạ tầng hay nhiễu sát ngưỡng, và giữ nhật ký từng lượt.

**Architecture:** Logic thuần tách vào `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`:
- nhãn câu;
- kết luận;
- băm đầu vào;
- bản ghi (đọc và ghi);
- quyết dùng lại;
- vùng xám và gộp;
- thư mục lượt;
- dò model, có hàm gọi model tiêm vào.

`cham-bo-do.ts` chỉ nối các mảnh đó với `eve eval`, CSDL và Gateway, và thêm bốn cờ: `--do-lai`, `--chi-quyet`, `--ghi-ban-ghi`, `--cham-lai`.

**Tech Stack:** bun, bun test, `ai` (`generateText`, `@ai-sdk/gateway` qua `modelTaiLieu` và `modelTheoVai` của `apps/agent`), git.

**Spec:** `_acceptance/eval-model-that-dung-luc/design.md`, `contract.md`, `evals.yaml`.

## Global Constraints

- Không viết chú thích trong code. Không đổi tệp ngoài `_acceptance/**`; riêng `PRODUCT-MAP.md` và `LO-TRINH.html` do máy vẽ.
- Ngưỡng E15 giữ nguyên: 0,8 / 0,8 / 0,9 / 0,1 / 0.
- Hằng mới gom vào một khối `CHAM_BO_DO` trong `quyet-do.ts`:
  - hạn dùng lại 7 ngày, suy từ một hằng `NGAY_MS`;
  - số lượt nhật ký giữ lại là 10;
  - đường bản ghi `_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md`.
- Bản ghi đọc từ `git show HEAD:<đường>`; `--nguon-thu <tệp>` chỉ dành cho phép đo và luôn in «nguon thu».
- Phạm vi băm: `git ls-files apps/agent/agent` + các tệp khớp `paths` của E15 (đọc từ `evals.yaml` của `tro-ly-doc-kho`) + `bun.lock` + tệp bộ câu + hai `response.modelId`. Loại tệp bản ghi.

## Review Focus

1. Bản ghi ở HEAD không parse được, do sửa tay hay hỏng. Kỳ vọng: đo mới, in «DO MOI: ban ghi khong doc duoc», không ném. Thuộc Task 1, E4.
2. `git` không chạy được (không phải kho git, hay HEAD trống). Kỳ vọng: đo mới, in «DO MOI: chua co ban ghi». Thuộc Task 1, E4.
3. Bộ câu có một nhóm rỗng, ví dụ không câu `khong-co` nào. Kỳ vọng: chỉ số đó là `—`, không rơi vào vùng xám, không chia cho 0. Thuộc Task 1, E6.
4. Lượt hỏi lại trả về số câu khác lượt 1. Kỳ vọng: thoát 2 «KHONG DO DUOC: luot hoi lai thieu ket qua». Thuộc Task 2.
5. Lời dò trả `modelId` khác id cấu hình (Gateway định tuyến sang bản khác). Kỳ vọng: băm theo id trả về, và bằng chứng ghi cả hai. Thuộc Task 1, E12.

---

### Task 1: `quyet-do.ts` + `quyet-do.spec.ts` (logic thuần)

**Files:** Create `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`, `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`.
**Evals:** E1 (phần hàm), E2, E3, E4, E6, E7, E12 · **independent:** false

**Interfaces — Produces:**
- `nhanMotCau(nhom, ketCuc): "dung-trang"|"tu-choi-dung"|"sai"|"loi"`, với `ketCuc ∈ {khong-co-ket-qua, LOI, TRA_LOI-du, TRA_LOI-sai, TU_CHOI}`.
- `nhanHaiCau(ketCuc): "chuyen"|"khong-chuyen"|"loi"`.
- `ketLuan(mot, hai, nguong) → {ma: 0|1|2, dong: string[], so, xam: ChiSo[]}`.
- `vungXam(k, n, t, chieu) → "dat"|"xam"|"khong-dat"`.
- `gop(l1, l2, t, chieu) → {ma, dong}`.
- `bamDauVao(tep: {duong, noiDung}[], modelIds) → string`.
- `phamViBam(goc) → string[]`.
- `ghiBanGhi(...) → string` (markdown, khối máy đọc giữa hai mốc `<!-- ban-ghi-e15 -->`) và `docBanGhi(md) → BanGhi | null`.
- `docBanGhiHead(goc, duong) → string | null`.
- `quyetDungLai(banGhi, bam, now, {doLai}) → {dungLai: boolean, dong: string}`.
- `moThuMucLuot(goc, now, pid) → string`; `donLuotCu(thuMuc, giu)`.
- `doModel(goi: (vai) => Promise<{modelId}>) → {ma: 0, ids} | {ma: 2, dong}`.
- `dongKetLuot(ketLuan, tepBangChung) → string[]` (in «GHI BAN GHI …» khi đạt).

Các bước:
- [ ] Viết `quyet-do.spec.ts` theo bảng của E1, E2, E3, E4, E6, E7, E12. `describe` đặt tên `nhan-loi`, `nhat-ky`, `bam`, `dung-lai`, `vung-xam`, `gop`, `do-model`, và mỗi ca ghim thông điệp như `expected` ghi. Chạy, kỳ vọng đỏ vì chưa có module.
- [ ] Cài `quyet-do.ts`. Chạy lại, kỳ vọng xanh.
- [ ] Chạy `bun run check-types`, `bun run lint:slop`; commit.

### Task 2: nối `cham-bo-do.ts`

**Files:** Modify `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`.
**Evals:** E1, E5, E8, E11, E13 · **independent:** false (cần Task 1)

- [ ] **Cờ:** `--do-lai`, `--chi-quyet`, `--ghi-ban-ghi <tệp>`, `--cham-lai <thư mục>`, `--nguon-thu <tệp>`.
- [ ] **Đầu lượt:**
  - dò model (`generateText` một token tới `modelTaiLieu("hoi").model` và tới `gateway(modelGoc)`, lấy `response.modelId`);
  - băm, rồi quyết dùng lại;
  - `--chi-quyet` in quyết định rồi thoát 0;
  - dùng lại thì ghi bằng chứng «DUNG LAI …» kèm bảng đã ký, in «SO LOI GOI MODEL: 2», thoát theo `dat` của bản ghi.
- [ ] **Lượt đo:**
  - mở thư mục lượt và dọn lượt cũ;
  - ghi `cham-tung-cau.jsonl` (id, nhóm, kết cục, nhãn) sau khi chấm;
  - nhãn lấy từ `nhanMotCau` và `nhanHaiCau`;
  - kết luận lấy từ `ketLuan`;
  - chỉ số rơi vào vùng xám và lượt 1 không có `loi` thì chạy `eve eval` lần nữa với kế hoạch chỉ gồm bộ câu của chỉ số đó, chấm, rồi `gop`;
  - bằng chứng ghi ba tỉ lệ;
  - in «SO LOI GOI MODEL: <2 + số câu gửi eve>»;
  - ghi khối bản ghi vào bằng chứng của lượt, rồi in các dòng của `dongKetLuot`.
- [ ] **`--ghi-ban-ghi`:** chép tệp bằng chứng vào `_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md`.
- [ ] **`--cham-lai`:** đọc `cham-tung-cau.jsonl`, rồi `ketLuan`; xám thì in «CAN HOI LAI: <chỉ số> (<n> cau)»; thoát theo `ma`.
- [ ] Chạy `bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts --chi-quyet`, kỳ vọng «DO MOI: chua co ban ghi»; `bun run check-types`; commit.

### Task 3: bàn đo của hồ sơ F12

**Files:** Create các tệp dưới `_acceptance/eval-model-that-dung-luc/rang/`:
- `ban-sao.mjs` (git worktree ngoài kho, liên kết `node_modules` của gốc và gói, `.env`, `packages/db/src/generated`);
- `doi-dau-vao.mjs` (E5, `--ghi-ban-ghi` cho E11);
- `luot-kep.mjs` (E8);
- `giu-nguong.mjs` (E9);
- `cham-lai.mjs` (E13);
- `dot-bien.mjs` (E10, `SO_CAP_KHAI = 8`).

**Evals:** E5, E8, E9, E10, E11, E13 · **independent:** false

- [ ] Viết các script, chạy từng cái theo kỳ vọng ở `evals.yaml`.
- [ ] E8 tốn token một lần, vì là lượt đo đầy đủ đầu tiên. Bản ghi của lượt đó được chép bằng `--ghi-ban-ghi` vào `_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md` và commit (AC-10).
- [ ] Commit.
