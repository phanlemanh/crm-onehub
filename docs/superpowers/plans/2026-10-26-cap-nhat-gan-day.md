# Cập nhật gần đây (VK12) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang «Cập nhật gần đây» của khu Mục tiêu: một dòng cho mỗi lần cập nhật KR của chu kỳ, mới nhất trước, ba chip phạm vi, trả lời dưới lần mới nhất, bấm dòng mở chi tiết KR.

**Architecture:** Một thủ tục chỉ đọc `okr.capNhatGanDay` trong `OkrCapNhatGanDayService` (phần thuần ở `cap-nhat-gan-day.ts`), lọc/đếm/phân trang bằng Prisma với số truy vấn cố định; trả lời đi qua `okr.addComment` sẵn có. Màn là một trang client dưới `/okr/cap-nhat-gan-day` dựng từ `packages/ui`, chip và trang trên đường dẫn bằng `nuqs`.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Zod, Next.js (app router, cacheComponents), React Query, nuqs, bun test (happy-dom).

**Spec:** `docs/superpowers/specs/2026-10-26-cap-nhat-gan-day-design.md` · hợp đồng `_acceptance/cap-nhat-gan-day/contract.md` · evals `_acceptance/cap-nhat-gan-day/evals.yaml`

## Global Constraints

- Không chú thích trong mã. Không migration, không chạm `packages/db/prisma`.
- Mọi lần đọc `okrCheckIn`, `okrComment`, `okrFollow` mang `dieuKienXemMucTieu(nguCanhXem)`.
- Tập gốc: KR thuộc mục tiêu `status: "cong-bo"`, `level` ∈ `CAP_CONG_TY` (`onehub`, `bo-phan`, `phong-ban`), `cycleId` đang chọn.
- Thời điểm một lần cập nhật = `session.submittedAt`; xếp `session.submittedAt desc, createdAt desc, id desc`.
- Cỡ trang `OKR_XEM.capNhatGanDay.coTrang = 20` trong `apps/api/src/okr/okr-xem.config.ts`.
- Chữ chip đúng «Tất cả · Tôi dẫn · Đang theo dõi» (C5), giá trị `PHAM_VI_BO`, tham số `phamViBo`, mặc định `tat-ca` (Hỏi-1).
- Lần trả lời: `okr.addComment({ objectiveId, keyResultId, body, mentionUserIds })`, `mentionUserIds = [mentionNguoiCapNhat]` khi có (Hỏi-2).
- Chữ trên màn rút từ tệp chữ vi/en; dữ liệu người nhập `translate="no"`.
- Trang `PageShell width="page"`; tiêu đề và mô tả dựng trong `page.tsx`.

## Review Focus

1. Lần cập nhật của KR có hai lần cùng `submittedAt` (cùng phiên gửi nhiều KR) — trang không trùng, không sót khi sang trang (E6, xếp có `id`).
2. Người cập nhật đã rời công ty — trả lời vẫn gửi được, không nhắc tên (E8 ca «không còn là thành viên»).
3. Ghi chú rỗng — dòng không để trống một đoạn trắng (E9 dòng không ghi chú).
4. Chu kỳ đã ẩn — gửi trả lời ra câu lỗi máy chủ dưới ô, chữ giữ nguyên (E8, E9).
5. Bấm Gửi hai lần nhanh — chỉ một lần trả lời (Gửi tắt khi đang gửi, E9).

---

### Task 1: Hợp đồng và phần thuần của thủ tục

**Files:**
- Create: `apps/api/src/okr/okr-cap-nhat-gan-day.contracts.ts`, `apps/api/src/okr/cap-nhat-gan-day.ts`
- Modify: `apps/api/src/okr/okr-xem.config.ts` (thêm `capNhatGanDay: { coTrang: 20 }`)

**Interfaces — Produces:**
- `capNhatGanDayInput = z.object({ cycleId, phamVi: z.enum(PHAM_VI_BO).default("tat-ca"), trang: z.number().int().min(1).default(1) })`
- `dongCapNhat = { checkInId, luc: string (ISO), nguoi: {id,name}, thayCho: {id,name} | null, kr: {id, tieuDe, kieu, donVi}, mucTieu: {id, tieuDe}, bo: {khoa, ten}, giaTri: number, tuTin: MucTuTin, ghiChu: string, moiNhat: boolean, traLoi: {id, nguoi:{id,name}, noiDung, luc}[], mentionNguoiCapNhat: string | null }`
- `capNhatGanDayOutput = { rows: dongCapNhat[], total: number, trang: number, coTrang: number, facetCounts: { phamVi: {value, count}[] } }`
- `dieuKienPhamVi(phamVi, dan: DanDonVi, theoDoi: ReadonlySet<string>): Prisma.OkrObjectiveWhereInput`
- `khoaBoTheoDoi(rows: {level, divisionId, departmentId, personUserId}[]): Set<string>` (dùng `khoaDonViDong`)
- `traLoiTu(binhLuan, luc: Date): binhLuan` (lọc `createdAt >= luc`, cũ trước)

- [ ] Step 1: Viết `cap-nhat-gan-day.ts` thuần (không Prisma client), tạo điều kiện `where` cho ba phạm vi: tat-ca → `{}`; toi-dan → `OR [{level:"bo-phan", divisionId in boPhan}, {level:"phong-ban", departmentId in phongBan}]` (rỗng → `{ id: { in: [] } }`); theo-doi → OR theo khoá bộ (`goc` → `level:"onehub"`, `bp:X`, `pb:Y`).
- [ ] Step 2: `bun run check-types` trong `apps/api` xanh. Commit.

### Task 2: Dịch vụ, router, ca mẫu và bài kiểm API (E2, E4, E5, E6, E8)

**Files:**
- Create: `apps/api/src/okr/okr-cap-nhat-gan-day.service.ts`, `apps/api/scripts/okr-mau/ca-cap-nhat-gan-day.ts`, `apps/api/test/okr-cap-nhat-gan-day.spec.ts`
- Modify: `apps/api/src/okr/okr.router.ts` (`@Query` `capNhatGanDay`, `restMeta("POST", "/okr/updates/list", TAG)`), `apps/api/src/okr/okr.module.ts`, `apps/api/test/vai-chi-okr.spec.ts` (tập cho phép thêm `okr.capNhatGanDay`), `apps/api/src/generated/server.ts` (qua `bun run trpc:generate`), `docs/api.md` (mục OKR, một gạch đầu dòng)

**Interfaces — Consumes:** Task 1. **Produces:** `trpc.okr.capNhatGanDay`.

- [ ] Step 1: Ca mẫu `ca-cap-nhat-gan-day.ts` (khuôn `ca-moi-kr.ts`): mốc giờ, cây B1(P1,P2)/B2(P3)/OneHub, người, mục tiêu (công bố đủ cấp, cá nhân, đã bỏ, chu kỳ khác, giới hạn), lần cập nhật theo giờ, theo dõi, bình luận — kèm tập mong đợi viết tay.
- [ ] Step 2: Viết spec năm `describe` `cng-nguon`, `cng-quyen`, `cng-pham-vi`, `cng-trang`, `cng-tra-loi` đúng `expected` của E2, E4, E5, E6, E8 (gieo qua `goi(...)` với `setSystemTime`). Chạy → đỏ (thủ tục chưa có).
- [ ] Step 3: Dịch vụ: `quyen` → `nguCanhXem`; đọc `okrFollow` (một truy vấn) → khoá bộ; ba `count` + một `findMany` (skip/take) + một `findMany` lần mới nhất của các KR trên trang (`distinct: ["keyResultId"]`, `orderBy session.submittedAt desc`) + một `okrComment.findMany` theo KR trên trang có `createdAt >= min(luc)` rồi lọc theo từng KR + một `member.findMany` cho người còn là thành viên.
- [ ] Step 4: Router + module; `cd apps/api && bun run trpc:generate`; thêm tên vào `vai-chi-okr.spec.ts`.
- [ ] Step 5: `bun run test -- "cd apps/api && bun test test/okr-cap-nhat-gan-day.spec.ts"` xanh; `bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem` thoát 0. Phá-thử từng chiều đỏ trên bản sao sau khi commit, `git checkout` lại.
- [ ] Step 6: Commit.

### Task 3: Thanh bên mục thứ bảy và thước của hồ sơ đã ký (E1 phần thanh bên, E12)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/tab-okr.ts` (`NHOM_THANH_BEN` nhóm `dau` = `["cua-toi","cap-nhat-gan-day"]`, `DUONG_MUC["cap-nhat-gan-day"] = "/okr/cap-nhat-gan-day"`), `thanh-ben-muc-tieu.tsx` (nhãn), `apps/app/lib/messages/okr-vo-khu.ts` (`muc.capNhatGanDay`), `apps/app/test/vo-khu-muc-tieu.dom.tsx` (ma trận thanh bên bảy mục), `_acceptance/vo-khu-muc-tieu/rang/do-man-lib.mjs` (`soMuc: 7`), `_acceptance/vo-khu-muc-tieu/decisions.jsonl` (dòng `fix` nêu D7 và `cap-nhat-gan-day`, `decided_by` chủ kho)
- Create: `_acceptance/cap-nhat-gan-day/rang/thuoc-vkm.mjs`

- [ ] Step 1: Sửa thanh bên; `config:executors.test.vkm_thanh_ben` xanh với ma trận mới.
- [ ] Step 2: `thuoc-vkm.mjs` import `DO` và `NHOM_THANH_BEN`, đọc sổ bằng `JSON.parse` từng dòng; in đúng câu của E12; thoát 1 khi lệch. Phá-thử `soMuc: 6` → đỏ đúng thông điệp.
- [ ] Step 3: Commit.

### Task 4: Trang Cập nhật gần đây (E1, E7, E9, E10, E13)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/page.tsx`, `.../cap-nhat-gan-day/cap-nhat-gan-day.tsx` (client), `.../cap-nhat-gan-day/dong-tin.tsx` (một dòng + ô trả lời), `.../cap-nhat-gan-day/tham-so.ts` (parsers `phamViBo` + trang), `apps/app/lib/messages/okr-cap-nhat-gan-day.ts` (vi/en), `apps/app/test/cap-nhat-gan-day.dom.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (`okr.trangCapNhat: "trangCapNhat"`)

**Interfaces — Consumes:** `trpc.okr.capNhatGanDay`, `trpc.okr.addComment`, `useMoNganKr`, `useChuKy`, `parseAsPhamViBo`.

- [ ] Step 1: Viết dom test năm ca `cng-thanh-ben`, `cng-duong-dan`, `cng-tra-loi-man`, `cng-mo-kr`, `cng-trang-thai` đúng `expected` của E1, E7, E9, E10, E13 (khuôn `moi-kr-ca-cong-ty.dom.tsx`). Chạy → đỏ.
- [ ] Step 2: `page.tsx` (khuôn `moi-kr/page.tsx`): tiêu đề, một câu mô tả, prefetch `okr.capNhatGanDay` với tham số đọc từ đường dẫn.
- [ ] Step 3: Client: trạng thái `ST-cng-*` theo bảng của design doc; chip `ToggleGroup` `data-pham-vi`; `ItemGroup` dòng `data-dong-tin={checkInId}`; ô trả lời `data-tra-loi` cho từng lần trả lời; `TablePagination`; đổi chip hay chu kỳ → trang 1; thành công gửi → `invalidateQueries(okr.capNhatGanDay)`; lỗi giữ chữ.
- [ ] Step 4: Năm ca xanh; `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh. Phá-thử các chiều đỏ. Commit.

### Task 5: Ma trận lối mở KR (E11)

**Files:**
- Modify: `_acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs` (ô `{ o: "cap-nhat-gan-day", tep: "apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx", ham: <hàm gọi useMoNganKr> }`), `_acceptance/ngan-kr-mot-cho/decisions.jsonl` (dòng `fix` nêu D8)
- Create: `_acceptance/cap-nhat-gan-day/rang/ma-tran-lo-mo-kr.mjs`

- [ ] Step 1: Thêm ô; `bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs` thoát 0, hai số bằng nhau.
- [ ] Step 2: `ma-tran-lo-mo-kr.mjs` chạy bộ quét, kiểm dòng `loi: cap-nhat-gan-day`, đọc sổ bằng `JSON.parse`; phá-thử hai chiều đỏ. Commit.

### Task 6: Bộ OKR mẫu có theo dõi và trả lời (E15)

**Files:**
- Create: `apps/api/scripts/okr-mau/nap-trao-doi.ts` (khuôn `nap-hoi-y.ts`: dựng `OkrTraoDoiService`, gọi `follow` và `addComment` với `now`)
- Modify: `apps/api/scripts/okr-mau/khuon.ts` hoặc `cong-ty.json` (khai theo dõi và trả lời mẫu), `apps/api/scripts/okr-mau/nap.ts` (gọi nạp sau lần cập nhật; xoá cũ đã có), `apps/api/test/okr-mau.spec.ts` (`describe("cap-nhat-gan-day")`)

- [ ] Step 1: Ca kiểm đỏ; nạp; ca xanh, nạp lại không nhân đôi. Commit.

### Task 7: Bàn đo màn (E3, E14, E16)

**Files:**
- Create: `_acceptance/cap-nhat-gan-day/rang/do-man.mjs` (khuôn `_acceptance/moi-kr-ca-cong-ty/rang/do-man.mjs`; `CNG_PHA`, `CNG_CHEP_ANH`)

- [ ] Step 1: Chạy qua `config:executors.script.cng_man` dưới khoá máy; in đúng các dòng DUNG của E3, E16; chụp bốn ảnh của E14 khi `CNG_CHEP_ANH=1`.
- [ ] Step 2: Phá-thử từng `CNG_PHA` → đúng dòng SAI. Commit.

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6 → 7 (tuần tự, cùng một phiên; 5 cần tệp của 4, 6 cần thủ tục của 2, 7 cần cả trang lẫn dữ liệu mẫu).
