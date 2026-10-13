# Bộ câu hỏi mẫu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên thợ tự làm tuần tự). Steps dùng `- [ ]`.

**Goal:** Bộ 50 câu hỏi mẫu, lệnh kiểm bộ, lệnh đo trợ lý kho trên bộ bằng script chấm sẵn có, và một lượt đo đã lưu.

**Architecture:** Mọi tệp trong `_acceptance/bo-cau-hoi-mau/`. Hàm thuần (kiểm bộ, tính bảng, kiểm bằng chứng) tách khỏi CLI để bài kiểm gọi cùng hàm CLI gọi. Đo bằng cách gọi `cham-bo-do.ts --bo` như một tiến trình con; không import hay sửa tệp nào của `tro-ly-doc-kho` ngoài đọc `quyet-do.ts` (khuôn, `dongTungCau`, `nhanMotCau`, `nhanHaiCau`).

**Tech Stack:** Bun 1.3, TypeScript, zod (nạp qua `createRequire` từ `apps/agent` như `quyet-do.ts`), `bun:test`.

**Spec:** `_acceptance/bo-cau-hoi-mau/design.md` · `contract.md` · `evals.yaml`

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Hằng số tinh chỉnh được ở `rang/bo-mau-config.ts`, một object `as const` nhóm theo mối quan tâm.
- Đọc dữ liệu thô bằng zod ở biên; không truyền `Record<string, unknown>`.
- Không tệp nào dưới `_acceptance/tro-ly-doc-kho/` đổi.
- Không gọi `pkill`/`killall`; chỉ `kill <PID>` của tiến trình tự khởi chạy (luật đợt 3).
- Thành phần: S1 15 · S2 5 · S3 8 · S6 8 (4 có `ganTrang`) · S7 10 (5 kiểu × 2) · ngoài kho 4.

## Review Focus

- Ý trọng yếu gõ dạng NFD hay có khoảng trắng khác trang → vẫn khớp sau NFC; khác chữ thì bác (Task 1, ca NFD của E4).
- Số trong câu hỏi thật (300.000 đồng, 24 giờ, 31 tháng 3) → không bị luật riêng tư bắt nhầm (Task 1, đối chứng dương E5).
- jsonl có dòng trùng mã nhưng đủ số dòng → lệnh đo phải thấy (Task 2, E10).
- Script chấm ghi thư mục lượt ở dòng «thu muc luot» — thiếu dòng đó → «không đo được», không đoán thư mục (Task 2).
- Bảng trong báo cáo bị sửa tay sau khi đo → lệnh kiểm phải thấy ô lệch (Task 2, E8).

---

### Task 1: Bộ 50 câu và lệnh kiểm bộ

independent: false · phục vụ E1, E2, E3, E4, E5, E6, E9j

**Files:**
- Create: `rang/bo-mau-config.ts`, `rang/khuon.ts`, `rang/kiem-bo.ts`, `rang/kiem-bo.test.ts`, `bo-mau.json`

**Interfaces — Produces:**
- `BO_MAU` (config): `{ duong: { bo, trangMau, evidence, chayGoc }, thanhPhan: Record<"<tang>/<kieuChu>", number>, ganTrangS6: 4, tongCau: 50, mauRiengTu: {dienThoai, email, soHopDong}, nhanBo: "mau", moDauNguon: "Bộ mẫu giả" }`
- `khuonCauMau`, `khuonBoMau` (zod strict, mở rộng `khuonCau`); `type CauMau`, `type BoMau`; `TANG`, `KIEU_CHU`.
- `docTrangMau(dir): Map<string,string>` (slug → nội dung NFC).
- `kiemBo(tho: unknown, trang: Map<string,string>): ViPham[]` với `ViPham = { luat: "khuon"|"thanh-phan"|"trang-mong"|"y-trong-yeu"|"rieng-tu"; ma: string; cau: string }`.
- `demThanhPhan(bo: BoMau): Record<string, number>`.
- CLI `bun rang/kiem-bo.ts [--bo <tệp>]`: in `bo-mau: <n> cau, <k> vi pham`, năm dòng `luat <tên>: <k>`, mỗi vi phạm một dòng `<luat> <ma>: <cau>`; thoát 0/1.

- [ ] Viết `kiem-bo.test.ts`: mỗi luật một `describe` mang đúng tên luật (`khuon`, `thanh-phan`, `trang-mong`, `y-trong-yeu`, `rieng-tu`, `cli`); ca lành trên `bo-mau.json` thật; bảng ca đỏ viết trước đúng như `expected` của E1–E6, mỗi ca phá một bản sao `structuredClone` và khẳng định đúng một vi phạm `{luat, ma}` + câu ghim chứa mã.
- [ ] Chạy `bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts` → đỏ (chưa có module).
- [ ] Viết config, khuôn, `kiemBo`, CLI.
- [ ] Viết `bo-mau.json` 50 câu theo thành phần; mọi ý chép nguyên văn từ trang.
- [ ] Chạy lại bài → xanh; chạy CLI → `0 vi pham`.
- [ ] Phá-thử tay một lần (sửa `1,2%` trong bản sao tạm) để thấy câu ghim; commit.

### Task 2: Lệnh đo — bảng, kiểm bằng chứng, ba chế độ

independent: false · phục vụ E7, E8, E10

**Files:**
- Create: `rang/bang-do.ts`, `rang/do-bo-mau.ts`, `rang/do-bo-mau.test.ts`, `rang/cham-gia.ts` (script chấm giả cho bài)

**Interfaces — Consumes:** `khuonBoMau`, `BO_MAU`, `docTungCau`/`dongTungCau`/`nhanMotCau`/`nhanHaiCau` của `quyet-do.ts`.
**Produces:**
- `tinhBang(bo: BoMau, dong: DongTungCau[]): Bang` — `Bang = { tang: Record<string,{k,n,loi}>, kieuChu: Record<string,{k,n,loi}>, zalo: Record<string,{k,n,loi}>, khongDat: string[] }`.
- `soMa(bo, dong): { thieu: string[]; trung: string[] }` theo lượt.
- `ghiBaoCao(x: { bam, bamTroLy, maCham, tong: string[], bang: Bang, luot: string }): string` (markdown, khối bảng giữa hai mốc); `docBaoCao(md): { bam, bang } | null`.
- `kiemBangChung(boTho: string, md: string | null, jsonl: string | null): { ok: true } | { ok: false; loi: string }`.
- CLI `do-bo-mau.ts` không cờ / `--do` / `--ghi <dir>`; biến `BCM_LENH_CHAM`, `BCM_EVIDENCE`, `BCM_BO`, `BCM_CHAY` để bài tiêm.

- [ ] Viết `do-bo-mau.test.ts` với `describe("bang-do")` và `describe("ma-thoat")` đúng các ca của E8 và E10; fixture jsonl sinh bằng `dongTungCau`.
- [ ] Chạy → đỏ.
- [ ] Viết `bang-do.ts`, `cham-gia.ts`, `do-bo-mau.ts`.
- [ ] Chạy → xanh; commit.

### Task 3: Một lượt đo thật, lưu bằng chứng, README

independent: false · phục vụ E7 (và AC-6 trên script chấm thật)

**Files:**
- Create: `evidence/do-bo-mau.md`, `evidence/cham-tung-cau.jsonl`, `evidence/cham-bo-do-mau.md`, `README.md`

- [ ] `bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do` (gọi model thật; `mot-luot.sh` tự giữ khoá đo cấp máy) — chạy nền, ghi PID.
- [ ] `--ghi <thư mục lượt>`; chạy lệnh không cờ → `khop`; `git status -- _acceptance/tro-ly-doc-kho` trống.
- [ ] README: lệnh kiểm, `--do`, `--ghi`, chi phí, thêm câu (sửa `bo-mau.json` → kiểm → `--do` → `--ghi`).
- [ ] Năm lệnh của kho trên phần đổi (`check-types` không phủ `_acceptance`; chạy `bunx tsc --noEmit` riêng cho `rang/`), commit.
