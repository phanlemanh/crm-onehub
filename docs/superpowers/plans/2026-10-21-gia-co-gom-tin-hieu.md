# Gia cố lịch gom tín hiệu — kế hoạch thi công

> **For agentic workers:** thực thi tuần tự trong vòng chính (feature-loop S3); mọi task chạm cùng `gom-lich.ts`
> nên không task nào `independent`.

**Goal:** phiên gom chỉ cầm khoá mô hình và chỉ làm đúng việc gom; lượt không chạy thứ phiên để lại và không đẩy khoá.

**Architecture:** một hàm `dungLoiGoi` dựng đối số, tệp cài đặt và môi trường của phiên từ `GOM.moHinh`; `chayGom` thêm
bốn chốt (token trên đĩa trước phiên · băm siêu dữ liệu git quanh phiên · quét khoá trước đẩy · token chỉ tới fetch,
push, gh). Tệp lịch bỏ token khỏi đĩa. Một lệnh `thu-pha.ts` gọi Claude Code thật bằng đúng `dungLoiGoi`.

**Tech Stack:** Bun (TypeScript), Zod (`packages/validation`), git, Claude Code 2.1.304, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-21-gia-co-gom-tin-hieu-design.md` · hợp đồng
`_acceptance/gia-co-gom-tin-hieu/contract.md` · phép đo `_acceptance/gia-co-gom-tin-hieu/evals.yaml`.

## Global Constraints

- Không chú thích trong mã. Hằng tinh chỉnh được nằm trong `GOM` (`scripts/tin-hieu/gom-cau-hinh.ts`), `as const`.
- Đầu ra JSON của Claude Code parse ở biên bằng Zod trong `packages/validation/src/tin-hieu-gom.ts`.
- Claude Code ghim `2.1.304`.
- Bài kiểm mới ở `scripts/tin-hieu/test/gom-gia-co.test.ts`, describe đúng tên `gcg-<khoá>` của `_acceptance/config.yaml`.
- Bài kiểm của TH2 (`gom-lich.test.ts`) vẫn xanh.

## Review Focus

- Kho tạm của bài kiểm không có token → mọi chốt token tắt êm, lượt TH2 cũ chạy như trước.
- `stdout` của phiên không phải JSON (claude giả cũ) → không có dòng «bị từ chối», lượt không đỏ vì thế.
- Bản gom đã định trùng tên một tệp đã có trên `onehub` → hậu tố `-2`.
- Siêu dữ liệu git đổi bởi chính lượt (intent-to-add, `git fetch`) không được tính là phiên đổi: băm ngay trước và
  ngay sau lời gọi phiên.
- Quét đĩa trên máy Actions không đọc `node_modules` và các thư mục bộ đệm lớn dưới thư mục nhà.

---

### Task 1: Môi trường và lời gọi của phiên (E1, E2)

**Files:** Modify `scripts/tin-hieu/gom-cau-hinh.ts`, `scripts/tin-hieu/gom-lich.ts`; Test
`scripts/tin-hieu/test/gom-gia-co.test.ts`, `scripts/tin-hieu/test/gom-kho-tam.ts`.

**Interfaces — Produces:**
- `GOM.moHinh.moiTruong: readonly string[]`, `GOM.moHinh.hangMoiTruong: Record<string,string>`,
  `GOM.gitLenh: readonly (readonly [string,string])[]`, `GOM.moHinh.congCu`, `GOM.moHinh.camCongCu`,
  `GOM.moHinh.skill`, `GOM.moHinh.cam`, `GOM.moHinh.duLieu`, `GOM.moHinh.bienBanGom`.
- `lenhKit(ag: string, banGom: string, loTrinh: readonly string[]): string[]`.
- `gitCauHinh(cap: readonly (readonly [string,string])[]): Record<string,string>` (khoá `GIT_CONFIG_COUNT/KEY_n/VALUE_n`).
- `dungLoiGoi(o: { ag; goc; banGom; loTrinh; phuQuyet; nguon: Record<string,string|undefined>; thuMucTam }):
  { thamSo: string[]; env: NodeJS.ProcessEnv; tepCaiDat: string; lenh: string[] }`.

- [ ] claude giả ghi `env.json` và chép tệp `--settings`; bài `gcg-moi-truong` (6 dòng) và `gcg-loi-goi` (13 dòng) theo E1,
  E2 kèm chiều đỏ qua `banTiem`.
- [ ] Viết `dungLoiGoi`; `chayGom` gọi nó.
- [ ] `bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-moi-truong` và `-t gcg-loi-goi` xanh; commit.

### Task 2: Bản gom đã định, phiên không git (E3)

**Interfaces — Produces:** `duongBanGom(goc: string, thuMuc: string, now: Date): string`; `GOM.thongDiep.biTuChoi`;
schema `ketQuaPhien` trong `tin-hieu-gom.ts`.

- [ ] claude giả: ghi vào `process.env.TIN_HIEU_BAN_GOM` khi có; chế độ `chi-duoc-phep` chạy đúng các dòng Bash của tệp
  cài đặt, không git; in JSON `permission_denials` theo chế độ.
- [ ] Lượt: tạo tệp rỗng + `git add --intent-to-add`; sau phiên tệp rỗng → gỡ khỏi index và cây; in dòng bị-từ-chối.
- [ ] `gcg-chi-viec-gom` ba ca xanh, chiều đỏ; `gom-lich.test.ts` xanh; commit.

### Task 3: Token chỉ tới đúng lời gọi, không nằm trên đĩa (E4b, E5)

**Interfaces — Produces:** `GOM.tokenKho = ["TIN_HIEU_TOKEN"]`, `quetDia(goc: string, nha: string, giaTri: string[]): string[]`,
`GOM.quetDia.boQua`, `GOM.thongDiep.tokenTrenDia`.

- [ ] Vỏ bọc `git`/`node`/`bun` ghi argv và cờ có-token; bài `gcg-token` 6 dòng; bài `gcg-khong-tren-dia` ba ca.
- [ ] `envSach` (bỏ mọi khoá trong `GOM.tokenKho`, `GH_TOKEN`, `GITHUB_TOKEN`, `GOM.khoaMoHinh`); fetch/push nhận
  `http.https://github.com/.extraheader` qua `gitCauHinh`; gh nhận `GH_TOKEN`; quét đĩa trước phiên.
- [ ] Hai bài xanh; commit.

### Task 4: Băm siêu dữ liệu git quanh phiên (E6)

**Interfaces — Produces:** `bamSieuDuLieu(goc: string): Map<string,string>`, `GOM.thongDiep.sieuDuLieu`.

- [ ] Năm chế độ tấn công của claude giả (a–e) + ca mọi lệnh git sau phiên mang `core.hooksPath=/dev/null`.
- [ ] Băm trước/sau lời gọi phiên; khác → đỏ trước lệnh git kế; mọi lệnh git của lượt mang `gitCauHinh(GOM.gitLenh)`.
- [ ] `gcg-sieu-du-lieu` xanh, chiều đỏ; commit.

### Task 5: Quét khoá trước đẩy (E7)

**Interfaces — Produces:** `dangKhoa(giaTri: string): string[]` (nguyên văn + lõi base64 ở ba độ lệch),
`GOM.thongDiep.lotKhoa`.

- [ ] Bốn chế độ lọt (a–d); bài `gcg-lot-khoa`; chiều đỏ bản chỉ quét nguyên văn.
- [ ] Quét `git diff`, thông điệp commit, tiêu đề và thân PR trước `git push`; commit.

### Task 6: Tệp lịch (E4)

**Files:** `.github/workflows/tin-hieu-gom.yml`, `_acceptance/gia-co-gom-tin-hieu/rang/tep-lich.mjs`.

- [ ] Răng 5 dòng + `--tu-kiem` ba bản tiêm; tệp lịch: `persist-credentials: false`, cài gói qua `GIT_CONFIG_*` của
  bước, bước gom bỏ `GH_TOKEN`, ghim 2.1.304; răng TH2 (`gtc_tep_lich`) vẫn xanh; commit.

### Task 7: Phép thử với Claude Code thật (E8, E8b)

**Files:** `scripts/tin-hieu/thu-pha.ts`.

- [ ] Cài Claude Code bản ghim (đọc từ tệp lịch) vào thư mục đệm ngoài kho một lần; gốc kit bọc ghi env.
- [ ] `--tu-kiem` (bảy+một việc bị cấm, biến mồi, hai chiều đỏ); `--gom-that --tu-kiem` (lượt gom thật, 0 từ chối,
  chiều đỏ bỏ `--rang`); chạy xanh; commit.

### Task 8: Tài liệu và đóng S3

- [ ] `docs/setup.md` mục lịch gom: phiên được làm gì, token cần quyền gì, đặt `ANTHROPIC_API_KEY` sau khi hàng này gộp.
- [ ] `check-types`, `lint`, `lint:slop` cho tệp đã sửa; hợp đồng `status: implemented`.
