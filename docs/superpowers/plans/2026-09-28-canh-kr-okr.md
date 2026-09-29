# Việc, sáng kiến, ghi nhận và mẫu nằm cạnh KR — kế hoạch thi công (lượt 8a)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi KR có việc và sáng kiến (chiến dịch, kế hoạch 30 ngày có sẵn) nằm cạnh, KR mốc có bằng chứng, mục tiêu có lời ghi nhận báo tới người nhận, và quản trị có mẫu OKR để đặt mục tiêu — dựng và đo trên bộ OKR mẫu.

**Architecture:** Hai mô-đun khuôn ở `packages/validation` (`okr-canh-kr.ts`, `okr-mau.ts`). Sáu bảng mới liền nhau cuối `schema.prisma`, `migration` chỉ tạo bảng. Máy chủ thêm `OkrCanhKrService` (việc, sáng kiến, bằng chứng, ghi nhận) và `OkrMauService` (mẫu, tạo từ mẫu) cạnh các dịch vụ OKR có sẵn; một hàm thuần `lienKetChoVai` (`canh-kr.ts`) là chỗ duy nhất quyết vai nào thấy tên bản ghi gốc. `removeKeyResult`, `transferWork`, `guiCapNhat`, `comments`, `objective` sửa tại chỗ. Màn thêm loại bản ghi `kr` cho ngăn xếp (khung KR), cột Việc ở bảng KR, chế độ Ghi nhận ở tab Trao đổi, khối Mẫu OKR ở Cài đặt, «Bắt đầu từ mẫu» ở hộp thoại đặt mục tiêu.

**Tech Stack:** Bun, Turborepo, NestJS + nestjs-trpc, Prisma 7 (Postgres), Zod, Next.js (bản trong kho — đọc `apps/app/node_modules/next/dist/docs/` trước khi đụng API Next), React Query + tRPC, nuqs, shadcn trong `packages/ui`.

**Spec:** `docs/superpowers/specs/2026-09-28-canh-kr-okr-design.md` · hợp đồng `_acceptance/canh-kr-okr/contract.md` (duyệt 2026-09-28, Manh Phan) · phép đo `_acceptance/canh-kr-okr/evals.yaml` · bản mẫu `/proto/canh-kr-okr` (`design-pass.md`).

**Cổng 1.5:** duyệt 2026-09-28 bởi Manh Phan — chạy subagent-driven (một tác tử con mỗi việc, kèm một người soát); việc 1 và 2 song song.

## Điều kiện trước S3

Không bắt đầu Task 1 trước khi chủ kho dán «được viết mã, kéo onehub về trước» (điều kiện: M `bo-okr-mau`, #186, đã gộp). Khi đó, theo thứ tự:

1. `git fetch origin && git merge origin/onehub`.
2. `bun install`, rồi `cd packages/db && bun run db:generate`.
3. Soát kế hoạch với mã mới: mốc `migration` mới nhất (hôm nay `20261002010000_tro_ly_okr_nen` → lượt này `20261004010000_okr_canh_kr`, lấy mốc sau mốc mới nhất nếu đã có mốc khác), model cuối `schema.prisma` (hôm nay `AiBaoTran`), dòng số của `removeKeyResult` (L914), `vet` (L466), `createKeyResult` (L703), `guiCapNhat` (`okr-cap-nhat.service.ts` L112), `comments` và `addComment` (`okr-trao-doi.service.ts` L91, L134), tệp của M dưới `apps/api/scripts/okr-mau/` và `apps/api/test/okr-mau*.ts`. Mọi chỗ lệch ghi vào `decisions.jsonl` (`type: "fix"`, `stage: "S3"`).
4. Soát hạng: vẫn T3.

## Soát lại sau gộp onehub (2026-09-28, `e2cffe32`)

- Đã gộp `origin/onehub` tới `7784cadd` (#186 bộ OKR mẫu, #187 `slack-thieu-quyen-email`, #188 bản chụp lộ trình). Xung đột duy nhất là `PRODUCT-MAP.md`, vẽ lại bằng máy.
- Không chỗ nào lệch: mốc `migration` mới nhất vẫn `20261002010000_tro_ly_okr_nen`; model cuối vẫn `AiBaoTran`; `vet` L466, `createKeyResult` L703, `removeKeyResult` L914, `objective` L1481, `guiCapNhat` L112, `comments` L91, `addComment` L134, `transferWork` L244 đúng như kế hoạch; tệp của M ở `apps/api/scripts/okr-mau/` và `apps/api/test/okr-mau*.ts` có đủ.
- Hạng vẫn T3.

## Global Constraints

- Không viết chú thích trong mã (mới hay sửa).
- Trần và câu chữ máy chủ ở `OKR.canhKr` và `OKR.thongDiep.canhKr` (`apps/api/src/okr/okr-config.ts`); trần khuôn ở `OKR_CANH_KR` (`packages/validation/src/okr-canh-kr.ts`) và `OKR_MAU` (`packages/validation/src/okr-mau.ts`). Không số trần 2, 5, 200, 300, 500, 2000 ở tệp khác.
- Parse ở biên bằng Zod; không `Record<string, unknown>`; kiểu suy bằng `z.infer`; `OkrMau.noiDung` chỉ đọc qua `parseMauNoiDung`.
- `migration` chỉ `CREATE TABLE`, `CREATE (UNIQUE) INDEX` trên bảng mới, `ALTER TABLE <bảng mới> ADD CONSTRAINT … FOREIGN KEY`. Khoá ngoại tới `okrObjective`, `okrKeyResult`, `okrMau`, `user`: `ON DELETE RESTRICT`; tới `campaign`, `onboardingPlan`: `ON DELETE SET NULL`; `okrGhiNhanNhan → okrGhiNhan`: `CASCADE`. Sáu model mới liền nhau, là các model cuối của `schema.prisma`. Quan hệ ngược trên model cũ chỉ là trường quan hệ Prisma, không cột.
- Hàng sáng kiến chỉ lưu `campaignId` / `planId`; không chép tên. Vết `gan-sang-kien` và `go-viec` của sáng kiến chỉ mang `{ loai, campaignId }` hoặc `{ loai, planId }`. Mọi chỗ trả hàng sáng kiến hay dòng vết sáng kiến gọi `lienKetChoVai` — không chỗ nào tự quyết.
- Quyền trong `OkrAccessService` (`ghiDuocKr`) và dịch vụ; màn chỉ hỏi cờ quyền từ API.
- Mọi ghi để đúng một dòng `okrTrail` qua `OkrService.vet`, không `Activity`.
- Khoá pha: mọi ghi việc, sáng kiến, bằng chứng gọi `assertKyGhiDuoc` và từ chối mục tiêu `da-bo`; ghi nhận không khoá pha, chỉ đòi mục tiêu `cong-bo`.
- Màn chỉ dùng thành phần `@crm/ui` (bậc 1); không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui`; «Huỷ» bọc `DialogClose` / `SheetClose`.
- Chữ mới ở `apps/app/lib/messages/okr-canh-kr.ts`, vi và en khác nhau; hàm ghép chữ nhận đối số vô hướng (luật `messages-guard`). Chữ người nhập mang `translate="no"`.
- Ngày theo giờ Việt Nam (`ngayVN` từ `@crm/db/onboarding-nhac`).
- Mười hành động vết mới, cuối `HANH_DONG_VET` (`packages/db/src/okr-vet.ts`), đúng thứ tự: `them-viec`, `sua-viec`, `xong-viec`, `go-viec`, `gan-sang-kien`, `dinh-bang-chung`, `go-bang-chung`, `ghi-nhan`, `go-ghi-nhan`, `sua-mau`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao bị phá đỏ với thông điệp ghim. Phá-thử làm SAU commit (bài học «phá-thử phải commit trước»). Thiếu cặp là việc chưa xong.
- Bài chạm DB khai `timeout` ≥ 30 000 ms (bài học «trần 5 s của bun test dưới tải»).

## Review Focus

- Hai lần bấm «Gắn» nhanh cùng một kế hoạch: một hàng, lần hai 400 câu ghim (chỉ mục duy nhất, bắt lỗi `P2002` thành câu người đọc) — Task 4 thêm ca chạy song song hai lời gọi.
- Người làm một việc bị gỡ khỏi không gian làm việc rồi được cho vào lại: việc vẫn trỏ đúng người, cờ «đã rời» tắt — Task 8 thêm ca.
- Tiêu đề việc, lời ghi nhận, tên mẫu có chữ tiếng Anh, emoji, 200 ký tự liền không dấu cách: lưu nguyên, màn không tràn ngang ở 390 — Task 3 thêm ca khuôn, Task 9 thêm bước chụp.
- Mẫu có KR «mốc»: khi tạo từ mẫu, KR mốc không đòi khởi điểm và đích (luôn 0 → 1) — Task 7 thêm ca.
- Kế hoạch 30 ngày gắn vào KR thuộc công ty bị lưu trữ (chưa xoá hẳn): sáng kiến đọc «đã lưu trữ», bấm vẫn mở được — Task 4 thêm ca.

---

## Bản đồ tệp

| Tệp | Việc |
|---|---|
| `packages/validation/src/okr-canh-kr.ts` (mới) | `OKR_CANH_KR`, loại việc, khuôn đầu vào việc, sáng kiến, bằng chứng, ghi nhận; `duongDanBangChung` |
| `packages/validation/src/okr-mau.ts` (mới) | `OKR_MAU`, `mauNoiDung`, `parseMauNoiDung`, `luuMauInput`, `taoTuMauInput` |
| `packages/validation/package.json` | subpath `./okr-canh-kr`, `./okr-mau` |
| `packages/validation/src/okr-cap-nhat.ts` | `guiCapNhatInput` nhận `bangChung?` theo KR |
| `packages/db/src/okr-vet.ts` | mười hành động vết mới |
| `packages/db/src/okr-nhac.ts` | loại mục `okr-ghi-nhan` |
| `packages/db/prisma/schema.prisma` | sáu model mới cuối tệp + trường quan hệ ngược |
| `packages/db/prisma/migrations/20261004010000_okr_canh_kr/` | `migration` chỉ tạo bảng |
| `apps/api/src/okr/canh-kr.ts` (mới) | hàm thuần `lienKetChoVai`, `vetSangKienChoVai`, `demViec` |
| `apps/api/src/okr/okr-canh-kr.service.ts` (mới) | `canhKr`, việc, sáng kiến, bằng chứng, ghi nhận |
| `apps/api/src/okr/okr-mau.service.ts` (mới) | `mau`, `luuMau`, `luuTruMau`, `khoiPhucMau`, `taoTuMau` |
| `apps/api/src/okr/okr-canh-kr.contracts.ts` (mới) | khuôn đầu ra tRPC |
| `apps/api/src/okr/okr.service.ts` | `removeKeyResult`, `objective` (số việc mỗi KR, vết qua `vetSangKienChoVai`) |
| `apps/api/src/okr/okr-trao-doi.service.ts` | `comments` trả `dong` trộn bình luận và ghi nhận; `transferWork`/`transferPreview` đếm việc |
| `apps/api/src/okr/okr-cap-nhat.service.ts` | `guiCapNhat` ghi bằng chứng trong cùng giao dịch |
| `apps/api/src/okr/okr-config.ts` | `canhKr` và `thongDiep.canhKr` |
| `apps/api/src/okr/okr.router.ts`, `okr.module.ts` | thủ tục mới, đăng ký dịch vụ |
| `apps/api/test/okr-canh-kr.spec.ts`, `okr-canh-kr-san.ts` (mới) | bài máy chủ |
| `apps/api/test/vai-chi-okr.spec.ts` | ca `sang-kien-an`; `DAU_VAO_HOP_LE` cho thủ tục ghi mới |
| `apps/agent/agent/lib/tin-nhac.ts`, `apps/agent/test/okr-nhac.integration.spec.ts` | dòng ghi nhận trong tin nhắc buổi sáng |
| `apps/app/components/crm/record-sheet/record-stack.ts`, `record-sheet-host.tsx` | loại `kr` |
| `apps/app/components/crm/record-sheet/kr-sheet.tsx` (mới) | khung KR: «Việc và sáng kiến», «Bằng chứng» |
| `apps/app/components/crm/record-sheet/objective-sheet.tsx`, `objective-trao-doi.tsx` | cột Việc; chế độ Ghi nhận |
| `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`, `hop-thoai-cap-nhat-kr.tsx`, `hop-thoai-muc-tieu.tsx`, `viec-cua-toi.tsx` | cột Việc, ô bằng chứng, «Bắt đầu từ mẫu», mục ghi nhận |
| `apps/app/app/(app)/[slug]/settings/okr/page.tsx`, `khoi-mau-okr.tsx`, `sheet-mau-okr.tsx` (mới) | khối Mẫu OKR |
| `apps/app/lib/messages/okr-canh-kr.ts` (mới), `okr.ts` | chữ vi/en; nhãn mười hành động vết |
| `apps/app/test/okr-canh-kr.dom.tsx` (mới) | bài DOM khung KR |
| `apps/api/scripts/okr-mau/cong-ty.json`, `khuon.ts`, `nap.ts` (của M) | bộ mẫu thêm việc, bằng chứng, ghi nhận, mẫu |
| `_acceptance/canh-kr-okr/rang/*` (mới) | `migration-chi-them.mjs`, `soi-ma.mjs`, `ty-le-canh-kr.sql`, `ty-le.mjs`, `man-canh-kr.mjs` |

## Thứ tự và độc lập

Task 1 và Task 2 độc lập nhau (chạy song song được). Task 3 → 8 là máy chủ, tuần tự vì cùng sửa `okr.router.ts`, `okr-config.ts`, `okr-canh-kr.service.ts`. Task 9 → 11 là màn, cần máy chủ xong. Task 12 cần M đã gộp. Task 13 cần tất cả.

---

### Task 1: Khuôn dữ liệu dùng chung và hành động vết

**independent: true** · phục vụ E5, E8 (AC-4, AC-7) và mọi task sau

**Files:**
- Create: `packages/validation/src/okr-canh-kr.ts`, `packages/validation/src/okr-mau.ts`
- Create: `packages/validation/test/okr-canh-kr.spec.ts`, `packages/validation/test/okr-mau.spec.ts`
- Modify: `packages/validation/package.json` (`"./okr-canh-kr": "./src/okr-canh-kr.ts"`, `"./okr-mau": "./src/okr-mau.ts"` cạnh `./okr-kr`)
- Modify: `packages/db/src/okr-vet.ts` (mười hành động cuối `HANH_DONG_VET`), `apps/app/lib/messages/okr.ts` (nhãn vi/en cho mười hành động ở `hanhDong`)

**Interfaces:**
- Consumes: `kieuKr`, `soKr`, `kiemSoTheoKieu`, `KIEU_KR` (`okr-kr`); `LOAI_MUC_TIEU` (`okr-muc-tieu`); `CAP_MUC_TIEU` (`okr-muc-tieu`).
- Produces: `OKR_CANH_KR = { tieuDe: {min:2,max:200}, url: {max:2000}, ghiChu: {max:300}, loiNhan: {min:1,max:500}, nguoiNhan: {min:1,max:5} } as const`; `LOAI_VIEC_KR = ["viec","chien-dich","ke-hoach"] as const`; `duongDanBangChung: z.ZodString` (trim, ≤2000, `new URL` được, `protocol` ∈ {`http:`,`https:`}); `themViecInput {keyResultId, tieuDe, nguoiLamUserId, hanNgay: "YYYY-MM-DD"|null}`; `suaViecInput {id, tieuDe?, nguoiLamUserId?, hanNgay?}`; `danhDauViecInput {id, xong: boolean}`; `idInput {id}`; `ganSangKienInput {keyResultId, loai: "chien-dich"|"ke-hoach", banGhiId}`; `bangChungVao {url, ghiChu}`; `themBangChungInput {keyResultId} & bangChungVao`; `guiGhiNhanInput {objectiveId, keyResultId: string|null, nguoiNhan: string[] (1–5, không trùng), loiNhan}`; `OKR_MAU = { krToiDa: 10, ten: {min:3,max:120}, cauMucTieu: {max:200} } as const`; `mauKr {title, kind, unit, startValue: soKr|null, targetValue: soKr|null}` (đủ hai số thì qua `kiemSoTheoKieu`, `superRefine` với `path: ["targetValue"]`); `mauNoiDung {cauMucTieu, loai, krs: mauKr[] (1..krToiDa)}`; `parseMauNoiDung(v: unknown): MauNoiDung` (ném lỗi có đường dẫn trường); `CAP_MAU = ["bo-phan","phong-ban","ca-nhan"] as const`; `luuMauInput {id: string|null, ten, cap, donViIds: string[], noiDung: mauNoiDung}`; `taoTuMauInput {mauId, cycleId, unit: donViMucTieu, ownerUserId, krs: {startValue, targetValue, ownerUserId}[]}`.

- [ ] **Step 1: Bài đỏ trước — bảng ca viết trước, so cả mảng kết quả.**

```ts
import { describe, expect, test } from "bun:test";
import { duongDanBangChung, guiGhiNhanInput, themViecInput } from "../src/okr-canh-kr";

const CA_URL: [string, boolean][] = [
	["https://drive.google.com/x", true],
	["http://intranet.onehub.vn/a?b=1", true],
	["javascript:alert(1)", false],
	["JAVASCRIPT:alert(1)", false],
	["data:text/html,x", false],
	["ftp://x", false],
	["httpx://x", false],
	["drive.google.com/x", false],
	["", false],
	["   ", false],
	[`https://x.vn/${"a".repeat(1990)}`, false],
];

describe("okr-canh-kr", () => {
	test("đường dẫn bằng chứng", () =>
		expect(CA_URL.map(([u]) => duongDanBangChung.safeParse(u).success)).toEqual(CA_URL.map(([, k]) => k)));
	test("tiêu đề việc 1 và 201 ký tự bị từ chối, chữ lạ giữ nguyên", () => {
		const co = (t: string) => themViecInput.safeParse({ keyResultId: "k", tieuDe: t, nguoiLamUserId: "u", hanNgay: null }).success;
		expect([co("a"), co("a".repeat(201)), co("Launch 🚀 bộ câu hỏi"), co("x".repeat(200))]).toEqual([false, false, true, true]);
	});
	test("ghi nhận: 0 người, 6 người, trùng người, lời trống, lời 501 ký tự", () => {
		const co = (nguoiNhan: string[], loiNhan: string) => guiGhiNhanInput.safeParse({ objectiveId: "o", keyResultId: null, nguoiNhan, loiNhan }).success;
		expect([co([], "x"), co(["a","b","c","d","e","f"], "x"), co(["a","a"], "x"), co(["a"], ""), co(["a"], "x".repeat(501)), co(["a","b"], "Cảm ơn")]).toEqual([false, false, false, false, false, true]);
	});
});
```

`packages/validation/test/okr-mau.spec.ts` — bảng ≥ 8 ca của E8: nhận một KR không số; nhận KR đủ hai số hợp kiểu; từ chối 0 KR; `OKR_MAU.krToiDa + 1` KR; «tăng tới» đích < khởi điểm với `issues[0].path` so `toEqual(["krs", 1, "targetValue"])`; phần trăm đích 120; kiểu lạ; tên trống. Thêm ca `parseMauNoiDung({})` ném lỗi nêu `krs`.

- [ ] **Step 2: Chạy, xác nhận đỏ** — `cd packages/validation && bun test test/okr-canh-kr.spec.ts test/okr-mau.spec.ts` → FAIL «Cannot find module».
- [ ] **Step 3: Viết hai mô-đun theo Interfaces.** Đường dẫn: `z.string().trim().min(1).max(OKR_CANH_KR.url.max).refine((s) => { try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } })`. Người nhận: `z.array(z.string().min(1)).min(1).max(5).refine((a) => new Set(a).size === a.length)`.
- [ ] **Step 4: Mười hành động vết** vào cuối `HANH_DONG_VET` (thứ tự ở Global Constraints) và mười nhãn vi/en ở `hanhDong` của `okr.ts` (vi: «Thêm việc», «Sửa việc», «Đánh dấu việc», «Gỡ việc», «Gắn sáng kiến», «Đính bằng chứng», «Gỡ bằng chứng», «Ghi nhận», «Gỡ ghi nhận», «Sửa mẫu OKR»).
- [ ] **Step 5: Chạy lại** → PASS; `bunx tsc --noEmit -p packages/validation` và `-p apps/app` xanh.
- [ ] **Step 6: Commit, rồi phá-thử** — bản sao `duongDanBangChung` chỉ kiểm `startsWith("http")` → ca `httpx://x` đỏ in đầu vào; trả lại.

Verify per-task: `cd packages/validation && bun test test/okr-canh-kr.spec.ts test/okr-mau.spec.ts`

---

### Task 2: Sáu bảng mới và phép đo `migration`

**independent: true** · phục vụ E20 (AC-14)

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (sáu model cuối tệp, sau `AiBaoTran`; trường quan hệ ngược trên `OkrKeyResult`, `OkrObjective`, `User`, `Campaign`, `OnboardingPlan`)
- Create: `packages/db/prisma/migrations/20261004010000_okr_canh_kr/migration.sql`
- Create: `_acceptance/canh-kr-okr/rang/migration-chi-them.mjs` (chép khuôn `_acceptance/khep-ky-okr/rang/migration-chi-them.mjs`, đổi bảng khoá ngoại viết trước)

**Interfaces:**
- Produces: model `OkrViecKr` (`okrViecKr`), `OkrBangChung` (`okrBangChung`), `OkrGhiNhan` (`okrGhiNhan`), `OkrGhiNhanNhan` (`okrGhiNhanNhan`), `OkrMau` (`okrMau`), `OkrMucTieuTuMau` (`okrMucTieuTuMau`).

- [ ] **Step 1: Phép đo đỏ trước.** `migration-chi-them.mjs` suy gốc kho từ `import.meta.dirname` (ba cấp lên), lấy thư mục migration mới so với `origin/onehub`, tách câu SQL, so với tập viết trước (Global Constraints); bảng khoá ngoại viết trước so `toEqual` với bảng rút từ SQL:

```js
const KHOA_NGOAI_VIET_TRUOC = [
	["okrViecKr", "keyResultId", "okrKeyResult", "RESTRICT"],
	["okrViecKr", "nguoiLamUserId", "user", "RESTRICT"],
	["okrViecKr", "campaignId", "campaign", "SET NULL"],
	["okrViecKr", "planId", "onboardingPlan", "SET NULL"],
	["okrViecKr", "taoBoiUserId", "user", "RESTRICT"],
	["okrBangChung", "keyResultId", "okrKeyResult", "RESTRICT"],
	["okrBangChung", "tacGiaUserId", "user", "RESTRICT"],
	["okrGhiNhan", "objectiveId", "okrObjective", "RESTRICT"],
	["okrGhiNhan", "keyResultId", "okrKeyResult", "RESTRICT"],
	["okrGhiNhan", "tacGiaUserId", "user", "RESTRICT"],
	["okrGhiNhanNhan", "ghiNhanId", "okrGhiNhan", "CASCADE"],
	["okrGhiNhanNhan", "userId", "user", "RESTRICT"],
	["okrMau", "taoBoiUserId", "user", "RESTRICT"],
	["okrMucTieuTuMau", "objectiveId", "okrObjective", "RESTRICT"],
	["okrMucTieuTuMau", "mauId", "okrMau", "RESTRICT"],
];
```

Cờ `--chieu-do`: bốn tệp giả trong `os.tmpdir()` (ADD COLUMN trên `okrComment`; khoá ngoại tới `campaign` RESTRICT; model mới giữa tệp; `DROP INDEX`) → mỗi tệp exit 1 với thông điệp ghim riêng; tệp chỉ CREATE TABLE và khoá ngoại đúng bảng → exit 0. Chạy → đỏ (chưa có migration).

- [ ] **Step 2: Sáu model** (khoá theo bảng trên):

```prisma
model OkrViecKr {
  id             String          @id @default(cuid())
  keyResultId    String
  keyResult      OkrKeyResult    @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  loai           String
  tieuDe         String          @default("")
  nguoiLamUserId String?
  nguoiLam       User?           @relation("OkrViecKrNguoiLam", fields: [nguoiLamUserId], references: [id], onDelete: Restrict)
  hanNgay        DateTime?       @db.Date
  xongLuc        DateTime?
  campaignId     String?
  campaign       Campaign?       @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  planId         String?
  plan           OnboardingPlan? @relation(fields: [planId], references: [id], onDelete: SetNull)
  taoBoiUserId   String
  taoBoi         User            @relation("OkrViecKrTaoBoi", fields: [taoBoiUserId], references: [id], onDelete: Restrict)
  position       Int             @default(0)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@unique([keyResultId, campaignId])
  @@unique([keyResultId, planId])
  @@index([keyResultId, position])
  @@index([nguoiLamUserId])
  @@map("okrViecKr")
}

model OkrBangChung {
  id           String       @id @default(cuid())
  keyResultId  String
  keyResult    OkrKeyResult @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  url          String
  ghiChu       String       @default("")
  tacGiaUserId String
  tacGia       User         @relation("OkrBangChungTacGia", fields: [tacGiaUserId], references: [id], onDelete: Restrict)
  createdAt    DateTime     @default(now())

  @@index([keyResultId, createdAt])
  @@map("okrBangChung")
}

model OkrGhiNhan {
  id           String           @id @default(cuid())
  objectiveId  String
  objective    OkrObjective     @relation(fields: [objectiveId], references: [id], onDelete: Restrict)
  keyResultId  String?
  keyResult    OkrKeyResult?    @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  loiNhan      String
  tacGiaUserId String
  tacGia       User             @relation("OkrGhiNhanTacGia", fields: [tacGiaUserId], references: [id], onDelete: Restrict)
  createdAt    DateTime         @default(now())
  nhan         OkrGhiNhanNhan[]

  @@index([objectiveId, createdAt])
  @@index([createdAt])
  @@map("okrGhiNhan")
}

model OkrGhiNhanNhan {
  ghiNhanId String
  ghiNhan   OkrGhiNhan @relation(fields: [ghiNhanId], references: [id], onDelete: Cascade)
  userId    String
  user      User       @relation("OkrGhiNhanNhan", fields: [userId], references: [id], onDelete: Restrict)

  @@id([ghiNhanId, userId])
  @@index([userId])
  @@map("okrGhiNhanNhan")
}

model OkrMau {
  id           String            @id @default(cuid())
  ten          String
  cap          String
  donViIds     String[]          @default([])
  noiDung      Json
  archivedAt   DateTime?
  taoBoiUserId String
  taoBoi       User              @relation("OkrMauTaoBoi", fields: [taoBoiUserId], references: [id], onDelete: Restrict)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  mucTieu      OkrMucTieuTuMau[]

  @@index([cap, archivedAt])
  @@map("okrMau")
}

model OkrMucTieuTuMau {
  id          String       @id @default(cuid())
  objectiveId String       @unique
  objective   OkrObjective @relation(fields: [objectiveId], references: [id], onDelete: Restrict)
  mauId       String
  mau         OkrMau       @relation(fields: [mauId], references: [id], onDelete: Restrict)
  createdAt   DateTime     @default(now())

  @@index([mauId])
  @@map("okrMucTieuTuMau")
}
```

- [ ] **Step 3: Sinh migration** — `cd packages/db && bunx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/20261004010000_okr_canh_kr/migration.sql` (dùng kho dùng-một-lần theo `docs/setup.md`); đọc lại tệp, xoá mọi câu chạm bảng cũ nếu có.
- [ ] **Step 4:** `bun run db:generate`; `bun run db:test --reset`; chạy `bun _acceptance/canh-kr-okr/rang/migration-chi-them.mjs` → exit 0, in số câu > 0; `--chieu-do` → bốn đỏ đúng thông điệp.
- [ ] **Step 5: Commit.**

Verify per-task: `bun _acceptance/canh-kr-okr/rang/migration-chi-them.mjs && bun _acceptance/canh-kr-okr/rang/migration-chi-them.mjs --chieu-do; test $? -eq 1`

---

### Task 3: Việc dưới KR — dịch vụ, quyền, vết

**independent: false** (cần 1, 2) · phục vụ E1, E2 (AC-1)

**Files:**
- Create: `apps/api/src/okr/okr-canh-kr.service.ts`, `apps/api/src/okr/okr-canh-kr.contracts.ts`, `apps/api/src/okr/canh-kr.ts`
- Create: `apps/api/test/okr-canh-kr.spec.ts`, `apps/api/test/okr-canh-kr-san.ts`
- Modify: `apps/api/src/okr/okr.router.ts`, `okr.module.ts`, `okr-config.ts`

**Interfaces:**
- Consumes: `OkrService.vet`, `OkrService.assertKyGhiDuoc`, `OkrService.assertThanhVien`, `OkrAccessService.quyen`, `ghiDuocKr` (`okr-access.service.ts`); khuôn Task 1; `goi`, `goiQuery`, `doc`, `phien`, `phienCua` (`test/okr-san.ts`); `gieoKyQuy`, `gieoMucTieuCongBo` (`test/okr-khep-san.ts`).
- Produces: `OkrCanhKrService.canhKr(userId, keyResultId): Promise<CanhKrOutput>`; `themViec`, `suaViec`, `danhDauViec`, `goViec` (mỗi hàm `(userId, input) => Promise<{ id: string }>`); `canhKrOutput = { kr: { id, title, kind, objectiveId, ownerName }, dong: DongCanh[], bangChung: BangChung[], quyen: { suaDuoc: boolean; ganDuoc: boolean }, khoa: boolean }`; `DongCanh = { id, loai: "viec", tieuDe, nguoiLam: { id, name, daRoi: boolean } | null, hanNgay: string|null, quaHan: boolean, xong: boolean, laNguoiLam: boolean } | { id, loai: "chien-dich"|"ke-hoach", lienKet: LienKet }`; thủ tục `okr.canhKr` (GET `/okr/key-results/{keyResultId}/canh`), `okr.themViec`, `okr.suaViec`, `okr.danhDauViec`, `okr.goViec`; `okr-canh-kr-san.ts`: `gieoCanhKr()` → `{ ky, mt, kr, krMoc, nguoi: { A, T, B, M, O } }`, `dem(bang)`.

- [ ] **Step 1: Bài đỏ** — `describe("viec-vong-doi")`: chuỗi E1 trên một việc, đọc DB sau từng bước, vết so `toEqual(["them-viec","sua-viec","xong-viec","xong-viec","go-viec"])`; ca từ chối tiêu đề 1 và 201 ký tự, người làm không phải thành viên — mỗi ca đếm `okrViecKr` và `okrTrail` không đổi. `describe("viec-quyen")`: ma trận 5 người × 4 thao tác khai trước dạng

```ts
const KY_VONG: Record<"A"|"T"|"B"|"M"|"O", Record<"them"|"sua"|"danh-dau"|"go", 200|403>> = {
	A: { them: 200, sua: 200, "danh-dau": 200, go: 200 },
	T: { them: 200, sua: 200, "danh-dau": 200, go: 200 },
	B: { them: 403, sua: 403, "danh-dau": 200, go: 403 },
	M: { them: 403, sua: 403, "danh-dau": 403, go: 403 },
	O: { them: 403, sua: 403, "danh-dau": 403, go: 403 },
};
```

và so `toEqual` bảng nhận 20 ô; thêm ca B đánh dấu việc của người khác → 403. Mọi `test(…, fn, 30_000)`.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t viec"` → đỏ.
- [ ] **Step 3: Dịch vụ.** Mỗi ghi: `db.$transaction(async (tx) => { … })`, trong đó: đọc KR kèm `objective { id, cycleId, status, level, divisionId, departmentId, personUserId }`; `okr.assertKyGhiDuoc(tx, cycleId)`; mục tiêu `da-bo` → `T.canhKr.mucTieuDaBo`; quyền: `ghiDuocKr(q, userId, kr)` → không thì `ForbiddenException(T.canhKr.khongSuaDuoc)`; riêng `danhDauViec` cho qua khi `viec.nguoiLamUserId === userId`; `themViec` gọi `okr.assertThanhVien(tx, [nguoiLamUserId])`; `position` = max + 1; vết `okr.vet(tx, userId, "them-viec", { objectiveId, keyResultId }, null, { viecId, tieuDe, nguoiLamUserId, hanNgay })`. `hanNgay` lưu `new Date(\`${hanNgay}T00:00:00.000Z\`)`, đọc ra bằng `ngayLich`; `quaHan = !xong && hanNgay < ngayVN(now)`. `daRoi` = người làm không còn `member` của `WORKSPACE_ID`.
- [ ] **Step 4: Router** — năm thủ tục, khuôn như `comments`/`addComment` (L627–L646): `@Query({ input, output, meta: restMeta("GET", …, TAG) })`, `@Mutation({ … restMeta("POST", "/okr/key-results/{keyResultId}/viec", TAG) })`, gọi `this.canhKr.<ham>(ctx.user.id, input)`. Đăng ký dịch vụ ở `okr.module.ts`. `cd apps/api && bun run trpc:generate`.
- [ ] **Step 5: Chạy lại** → xanh. `vai-chi-okr.spec.ts` (toàn tệp) vẫn xanh.
- [ ] **Step 6: Commit, rồi phá-thử** — bản sao `danhDauViec` bỏ `vet` → ca thứ tự vết đỏ in mảng nhận; bản sao cho mọi thành viên đánh dấu → ô (M, danh-dau) đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t viec"`

---

### Task 4: Sáng kiến và luật không lộ dữ liệu đối tác

**independent: false** (cần 3) · phục vụ E3, E4 (AC-2, AC-3)

**Files:**
- Modify: `apps/api/src/okr/canh-kr.ts`, `okr-canh-kr.service.ts`, `okr.service.ts` (`objective`: vết qua `vetSangKienChoVai`), `okr.router.ts`, `okr-config.ts`
- Modify: `apps/api/test/okr-canh-kr.spec.ts`, `apps/api/test/vai-chi-okr.spec.ts`

**Interfaces:**
- Produces: `type LienKet = { loai: "chien-dich"|"ke-hoach"; coQuyen: false } | { loai: "chien-dich"|"ke-hoach"; coQuyen: true; id: string|null; ten: string|null; trangThai: "chua-chay"|"dang-chay"|"da-dong"|"da-luu-tru"|"da-xoa" }`; `lienKetChoVai(role: WorkspaceRole, hang: { loai; campaign: { id, name, status }|null; plan: { id, closedAt, company: { name, archivedAt } }|null }): LienKet`; `vetSangKienChoVai(role, v: VetDong): VetDong` (với `gan-sang-kien` và `go-viec` mang `loai` ≠ `viec`: vai không đọc được phạm vi đối tác → `before`/`after` thành `{ loai, coQuyen: false }`); `okr.ganSangKien`.

- [ ] **Step 1: Bài đỏ** — `describe("sang-kien")` theo E3 (không chuỗi tên trong mọi cột chữ của `okrViecKr` và trong `before`/`after` của `okrTrail`; `after` so `toEqual({ loai: "chien-dich", campaignId: C })`; đổi tên chiến dịch → tên mới; gắn lần hai, mã không tồn tại, vai okr → từ chối kèm đếm; hai lời gọi gắn song song cùng kế hoạch → một hàng, một 400; chiến dịch `FINISHED` → `da-dong`; lưu trữ công ty của kế hoạch → `da-luu-tru` và vẫn mở được; xoá hẳn công ty → `da-xoa`). Ở `vai-chi-okr.spec.ts` thêm `describe("sang-kien-an")`: bốn đường (tRPC `okr.canhKr`, REST `GET /rest/okr/key-results/{id}/canh`, khoá API gọi REST, `okr.objective` phần `trail` qua tRPC và REST) × hai vai; mỗi phản hồi `JSON.stringify` đếm các chuỗi viết trước `[idC, idP, tenC, tenCongTyX, tenPhuTrachC, "RUNNING"]` = 0 cho vai okr và in bảng đếm; vai member thấy `tenC`, `tenCongTyX`. Thêm `okr.ganSangKien`, `okr.themViec`, `okr.suaViec`, `okr.danhDauViec`, `okr.goViec` vào `DAU_VAO_HOP_LE`.
- [ ] **Step 2: Chạy** → đỏ.
- [ ] **Step 3: Viết.** `ganSangKien`: quyền như việc cộng `docDuocPhamVi(q.role, "doi-tac")` — không thì `ForbiddenException(T.canhKr.khongGanDuoc)`; kiểm bản ghi tồn tại (`campaign.findUnique` / `onboardingPlan.findUnique`); ghi hàng `{ loai, campaignId|planId, tieuDe: "" }`; bắt `Prisma.PrismaClientKnownRequestError` mã `P2002` → `BadRequestException(T.canhKr.daGan)`; vết `after: { loai, campaignId }` hoặc `{ loai, planId }`. `canhKr` đọc hàng kèm `campaign { id, name, status }`, `plan { id, closedAt, company { name, archivedAt } }`, rồi `lienKetChoVai(q.role, hang)`: `coQuyen: false` khi `!docDuocPhamVi(role, "doi-tac")`; `da-xoa` khi id null; `da-luu-tru` khi công ty của kế hoạch có `archivedAt` (chiến dịch không có lưu trữ trong kho — `CampaignStatus` chỉ `DRAFT`, `RUNNING`, `FINISHED`); `da-dong` khi chiến dịch `FINISHED` hoặc kế hoạch `closedAt !== null`; `chua-chay` khi chiến dịch `DRAFT`; còn lại `dang-chay`. Thêm `"chua-chay"` vào kiểu `trangThai` của `LienKet`. `objective()` map `trail` qua `vetSangKienChoVai(q.role, v)`.
- [ ] **Step 4: Chạy lại** → xanh; `bun test test/vai-chi-okr.spec.ts` toàn tệp xanh.
- [ ] **Step 5: Commit, rồi phá-thử** — `lienKetChoVai` trả `ten` cho mọi vai → ô (okr, tRPC, tenC) đỏ; `objective()` bỏ `vetSangKienChoVai` → ô (okr, vết, idC) đỏ; ganSangKien chép tên vào `tieuDe` → ca «không chuỗi tên» đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t sang-kien && bun test test/vai-chi-okr.spec.ts"`

---

### Task 5: Bằng chứng cho KR mốc

**independent: false** (cần 3) · phục vụ E5 (AC-4)

**Files:**
- Modify: `okr-canh-kr.service.ts`, `okr-cap-nhat.service.ts`, `packages/validation/src/okr-cap-nhat.ts`, `okr.router.ts`, `okr-config.ts`, `apps/api/test/okr-canh-kr.spec.ts`

**Interfaces:**
- Produces: `okr.themBangChung`, `okr.goBangChung`; `guiCapNhatInput` mỗi mục KR nhận `bangChung?: bangChungVao`; hàm dùng chung `ghiBangChung(tx, userId, kr, vao)` trong `OkrCanhKrService` (xuất để `OkrCapNhatService` gọi).

- [ ] **Step 1: Bài đỏ** `describe("bang-chung")` theo E5: đính, gỡ (vết `go-bang-chung` với `before.url`), KR «tăng tới» → 400, người không sửa được → 403; `guiCapNhat` đánh dấu KR mốc xong không kèm → 0 hàng; kèm hợp lệ → một `okrCheckIn` + một `okrBangChung` cùng giao dịch, vết `cap-nhat-tuan` và `dinh-bang-chung`; kèm `javascript:x` → 400, 0 `okrCheckIn` mới, 0 `okrBangChung`, `currentValue` không đổi, phiên `submittedAt` vẫn null. Bằng chứng gửi kèm KR không phải mốc hay KR mốc gửi «chưa xong» → 400.
- [ ] **Step 2–4:** chạy đỏ; viết (`ghiBangChung` kiểm `kr.kind === "moc"`, `ghiDuocKr`, khoá pha, ghi hàng, vết); `guiCapNhat` gọi `ghiBangChung` trong cùng `tx` sau khi ghi `okrCheckIn`; khuôn Zod parse `bangChung` trước khi mở giao dịch nên đường dẫn sai từ chối cả lần gửi. Chạy xanh; `okr-cap-nhat.spec.ts` cũ vẫn xanh.
- [ ] **Step 5: Commit, phá-thử** — `guiCapNhat` ghi bằng chứng ngoài giao dịch → ca `javascript:` để lại `okrCheckIn`, đỏ in số đếm.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t bang-chung && bun test test/okr-cap-nhat.spec.ts"`

---

### Task 6: Ghi nhận và tin báo người nhận

**independent: false** (cần 3) · phục vụ E6, E7 (AC-5, AC-6)

**Files:**
- Modify: `okr-canh-kr.service.ts`, `okr-trao-doi.service.ts` (`comments` trả thêm `dong`), `okr.contracts.ts` (`commentsOutput.dong`), `okr.router.ts`, `okr-config.ts`
- Modify: `packages/db/src/okr-nhac.ts` (loại `okr-ghi-nhan` trong `viecOkr`, `KHOA_MUC_OKR`; sinh trong `viecTraoDoi`)
- Modify: `apps/agent/agent/lib/tin-nhac.ts` (`noiDungOkr` case `okr-ghi-nhan`), `apps/agent/test/okr-nhac.integration.spec.ts` (ca `ghi-nhan`)
- Modify: `apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx` (`ICON_VIEC`, `khoaViec`, `TieuDeViec`, `DichViec` cho `okr-ghi-nhan`), `apps/app/lib/messages/okr.ts`
- Create: `_acceptance/canh-kr-okr/rang/soi-ma.mjs` (ca `dem-theo-nguoi`; ca `thiet-ke` thêm ở Task 13)
- Modify: `apps/api/test/okr-canh-kr.spec.ts`

**Interfaces:**
- Produces: `okr.guiGhiNhan`, `okr.goGhiNhan`; `commentsOutput.dong: ({ loai: "binh-luan"; id; createdAt } | { loai: "ghi-nhan"; id; createdAt; nguoiGui: NguoiOkr; nguoiNhan: NguoiOkr[]; keyResultId; keyResultTitle; loiNhan; goDuoc: boolean })[]` xếp `createdAt` tăng, bình luận chỉ mang id để màn tra trong `comments`; `viecOkr` loại `{ loai: "okr-ghi-nhan"; ghiNhanId; objectiveId; nhan; nguoiGui }`.

- [ ] **Step 1: Bài đỏ** `describe("ghi-nhan-gui")` theo E6 (đủ bảy ca từ chối viết trước, mỗi ca câu ghim và đếm; gỡ: người gửi được, quản trị được, người nhận 403; thứ tự `dong` t1 < t2 < t3 so `toEqual(["binh-luan","ghi-nhan","binh-luan"])`). `describe("ghi-nhan-bao")`: `viecCuaToi` của A, B mỗi người đúng một mục `okr-ghi-nhan`, của O không mục ghi nhận, không mục `okr-nhac-ten` từ ghi nhận. Ở agent: `test("ghi-nhan: tin sáng có đúng một dòng", …)` với đồng hồ đóng băng, cả ca ngoài cửa sổ.
- [ ] **Step 2: soi-ma `dem-theo-nguoi`** — suy gốc từ vị trí tệp; quét `apps/**` và `packages/**` (bỏ `test/`, `node_modules`) tìm `okrGhiNhanNhan.groupBy`, `_count` gắn `okrGhiNhanNhan`/`nhan`, `GROUP BY "userId"` trên `okrGhiNhanNhan`; in số tệp đã soi (> 0); có vi phạm → exit 1 in tệp:dòng. `--chieu-do` chép một tệp giả có `okrGhiNhanNhan.groupBy({ by: ["userId"] })` vào tmpdir và soi nó → exit 1.
- [ ] **Step 3: Viết** `guiGhiNhan` (mục tiêu `cong-bo`, không khoá pha; `assertThanhVien(tx, nguoiNhan, () => T.canhKr.nguoiNhanKhongConThanhVien)`; người nhận chứa chính mình → `T.canhKr.tuGhiNhan`; KR thuộc mục tiêu khác → `T.traoDoi.krKhacMucTieu`; ghi `okrGhiNhan` + `nhan.create`; vết `ghi-nhan` `after: { ghiNhanId, nguoiNhan }`), `goGhiNhan` (tác giả hoặc `q.quanTri`; vết `go-ghi-nhan`). `viecTraoDoi` đọc thêm `okrGhiNhan` trong `cuaSo`, sinh mục cho từng người nhận khác người gửi.
- [ ] **Step 4:** chạy xanh; `okr-nhac.integration.spec.ts` toàn tệp xanh; `bun run check-types`.
- [ ] **Step 5: Commit, phá-thử** — `viecTraoDoi` gửi cả người gửi → ca «O 0 mục» đỏ; soi-ma `--chieu-do` exit 1.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t ghi-nhan && cd ../agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts" && bun _acceptance/canh-kr-okr/rang/soi-ma.mjs --ca dem-theo-nguoi`

---

### Task 7: Mẫu OKR — quản trị soạn, trưởng đơn vị dùng

**independent: false** (cần 1, 2, 3) · phục vụ E8, E9 (AC-7, AC-8)

**Files:**
- Create: `apps/api/src/okr/okr-mau.service.ts`
- Modify: `okr.router.ts`, `okr.module.ts`, `okr-config.ts`, `okr.contracts.ts`, `apps/api/test/okr-canh-kr.spec.ts`

**Interfaces:**
- Consumes: `OkrService.createObjective` phần kiểm quyền đơn vị (`OkrAccessService.suaDuocDonVi`), `kiemTranMucTieu`, luật trần KR của `createKeyResult` (tách thành `kiemTranKr(ct, dem, them)` trả `string|null` hoặc ném — dùng chung cho cả hai đường).
- Produces: `okr.mau({ cap?, donViId? })` → `{ mau: { id, ten, cap, donViIds, soKr, daDung, luuTru, noiDung }[], quanTri: boolean }`; `okr.luuMau`, `okr.luuTruMau`, `okr.khoiPhucMau`, `okr.taoTuMau` → `{ id, canhBao: string|null }`.

- [ ] **Step 1: Bài đỏ** `describe("mau-quan-tri")` theo E8 và `describe("tu-mau")` theo E9 (lọc mẫu so tập `toEqual`; nguyên khối bốn ca đếm ba bảng không đổi; chế độ cảnh báo; sửa mẫu sau khi tạo không đổi mục tiêu; mẫu có KR «mốc» tạo KR 0 → 1 không cần số).
- [ ] **Step 2–4:** chạy đỏ; viết. `luuMau`: `q.quanTriChuongTrinh` không thì 403; mỗi `donViIds` là phòng ban (cấp `phong-ban`) hay bộ phận (cấp `bo-phan`) còn sống — sai nêu mã hay tên; `noiDung` lưu bản đã parse; vết `sua-mau` `after: { mauId, ten }`. `mau()`: quản trị nhận mọi mẫu; người khác nhận mẫu `archivedAt null`, `cap` khớp, `donViIds` rỗng hoặc chứa `donViId`; `daDung` = `_count.mucTieu`. `taoTuMau`: một `$transaction` — `assertKyGhiDuoc`, quyền đơn vị như `createObjective`, `kiemTranMucTieu`, mỗi KR `krInput.parse` + `kiemSoTheoKieu` (KR «mốc» nhận 0 → 1), `kiemTranKr`, tạo mục tiêu `nhap` + KR + `okrMucTieuTuMau`; vết `tao` `after` thêm `tuMau: mauId`. Chạy xanh; `okr.spec.ts` (`-t muc-tieu`, `-t sau-kieu-kr`) vẫn xanh sau khi tách `kiemTranKr`.
- [ ] **Step 5: Commit, phá-thử** — `taoTuMau` tạo mục tiêu trước giao dịch → ca thiếu đích để lại một mục tiêu, đỏ in số đếm.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t mau && bun test test/okr.spec.ts"`

---

### Task 8: Khoá pha, xoá KR, người rời

**independent: false** (cần 3–6) · phục vụ E10 (AC-9)

**Files:**
- Modify: `okr.service.ts` (`removeKeyResult`), `okr-trao-doi.service.ts` (`dieuKienChuyen`, `transferPreview`, `transferWork`), `okr.contracts.ts` (`transferOkrOutput.viec`), `okr-config.ts`, `apps/api/test/okr-canh-kr.spec.ts`
- Modify: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx` (hiện số việc cạnh số KR, mục tiêu) và chữ của nó

**Interfaces:**
- Produces: `transferOkrOutput = { kr, mucTieu, viec }`.

- [ ] **Step 1: Bài đỏ** `describe("khoa-pha")` — ma trận 3 × 7 viết trước dạng `Record<"cham-diem"|"da-dong"|"da-bo", Record<ThaoTac, 400>>`, so `toEqual` bảng nhận; ghi nhận ở `cham-diem`, `da-dong` → 200; xoá KR nháp có hai việc → KR và hai việc mất, hai vết `go-viec`; KR có bằng chứng → 400 `krCoBangChung`; KR có ghi nhận → 400 `krCoGhiNhan`; B rời → `daRoi` true; B được cho vào lại → `daRoi` false; `transferPreview` đếm `viec`; `transferWork` đổi người làm việc chưa xong sang A, việc đã xong giữ B, vết `chuyen-viec`.
- [ ] **Step 2–4:** chạy đỏ; viết: trong `removeKeyResult` sau các kiểm cũ thêm `okrBangChung.count > 0 → T.canhKr.krCoBangChung`, `okrGhiNhan.count > 0 → T.canhKr.krCoGhiNhan`, rồi đọc việc của KR, `okrViecKr.deleteMany` và một vết `go-viec` mỗi hàng trước `okrKeyResult.delete`; `dieuKienChuyen` trả thêm `viec: { nguoiLamUserId: fromUserId, xongLuc: null, keyResult: <điều kiện kr cũ bỏ ownerUserId> }`. Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — `ganSangKien` bỏ `assertKyGhiDuoc` → ô (cham-diem, ganSangKien) đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t khoa-pha && bun test test/okr-cap-nhat.spec.ts"`

---

### Task 9: Màn — cột Việc, khung KR, bằng chứng

**independent: false** (cần 3–5) · phục vụ E11, E12, E13 (AC-10)

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` (`RECORD_KINDS` thêm `"kr"`), `record-sheet-host.tsx` (nhánh `kind === "kr"` → `<KrSheet keyResultId={shown.id} />`)
- Create: `apps/app/components/crm/record-sheet/kr-sheet.tsx` (khung KR), `kr-viec.tsx` (danh sách và dòng nhập), `kr-bang-chung.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx` (cột «Việc»), `apps/app/components/crm/record-sheet/objective-sheet.tsx` (truyền `soViec`), `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` (ô bằng chứng cho KR mốc khi chọn «Xong»)
- Modify: `apps/api/src/okr/okr.service.ts` (`objective()` trả mỗi KR `soViec: { xong, tong }`, `soSangKien`, `coBangChung`)
- Create: `apps/app/lib/messages/okr-canh-kr.ts`; `apps/app/test/okr-canh-kr.dom.tsx`

**Interfaces:**
- Consumes: `okr.canhKr`, `okr.themViec`, `okr.suaViec`, `okr.danhDauViec`, `okr.goViec`, `okr.ganSangKien`, `okr.themBangChung`, `okr.goBangChung`; `onboarding.listPlans({ q, pageSize })`, `campaigns.list` cho bộ chọn (chỉ gọi khi `quyen.ganDuoc`); `useRecordSheetView`, `DetailSheet*` như `so-kr-sheet.tsx`.
- Produces: `KrSheet({ keyResultId })`; `KrViecDanhSach({ duLieu, … })` nhận dữ liệu đã hoàn tất (thuần hiển thị, bài DOM dựng thẳng).

- [ ] **Step 1: Bài DOM đỏ** — `okr-canh-kr.dom.tsx` dựng `KrViecDanhSach` với sáu bộ dữ liệu viết trước (dang-tai, rong, loi, co-viec, khoa, nguoi-roi); ma trận 6 × 6 `data-trang-thai` khẳng định đúng một có mặt; dòng nhập: Enter với «a» → `FieldError` câu ghim, `onThem` không gọi; Esc → không gọi; KR `tang-toi` → không có tab «Bằng chứng»; tiêu đề 200 ký tự liền không tràn (`min-w-0` + `break-words` do `Item` sẵn có — không thêm class).
- [ ] **Step 2–4:** chạy đỏ; dựng theo bản mẫu `apps/app/app/proto/_modules/canh-kr-okr/khung-kr.tsx` nhưng dữ liệu thật: `Item` + `Checkbox` + `DropdownMenu`, `DatePicker` cho hạn, `PickListDialog` cho bộ chọn (danh sách lọc ở máy chủ bằng `q` cho kế hoạch; chiến dịch dùng `campaigns.list`), `StatusIndicator` cho trạng thái sáng kiến, `ConfirmDialog` cho gỡ, `Empty` cho rỗng và lỗi kèm «Thử lại». Mở khung: `openRecord({ kind: "kr", id })`; đường dẫn `?record=kr:<id>` mở thẳng được (bộ giải ngăn xếp nhận loại mới; mã không tồn tại → `Empty` lỗi có nút về khung mục tiêu). Hộp thoại cập nhật: khi KR mốc chọn «Xong», hiện `Field` «Bằng chứng (tuỳ chọn)» với `Input type="url"`; lỗi khuôn hiện dưới ô, «Gửi cập nhật» khoá. Chạy xanh; `bun run check-types`.
- [ ] **Step 5: Commit, phá-thử** — khung KR luôn hiện tab «Bằng chứng» → ca KR tăng tới đỏ in tên tab.

Verify per-task: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-canh-kr.dom.tsx && cd ../.. && bun run check-types`

---

### Task 10: Màn — ghi nhận trong Trao đổi

**independent: false** (cần 6) · phục vụ E14, E15 (AC-11)

**Files:**
- Modify: `apps/app/components/crm/record-sheet/objective-trao-doi.tsx` (đọc `dong`; `ToggleGroup` «Bình luận · Ghi nhận»; ở chế độ ghi nhận: người nhận bằng ô chọn thành viên có `TokenField`, lời, KR tuỳ chọn; dòng ghi nhận là `Item variant="muted"` biểu tượng `Trophy`)
- Modify: `apps/app/lib/messages/okr-canh-kr.ts`, `apps/app/test/okr-canh-kr.dom.tsx` (ca ô soạn)

- [ ] **Step 1: Bài DOM đỏ** — chế độ ghi nhận không người nhận → nút gửi khoá; sáu người → câu «Tối đa 5 người» và khoá; gửi → `guiGhiNhan` nhận đúng mảng id; dòng `ghi-nhan` trong `dong` hiện khác dòng bình luận (`data-ghi-nhan`), người gửi thấy «Gỡ ghi nhận», người khác không.
- [ ] **Step 2–4:** chạy đỏ; viết theo bản mẫu `ghi-nhan.tsx` (tiêu đề một câu «X ghi nhận Y, Z»); chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — ô soạn gửi thiếu người nhận cuối → ca «đúng mảng id» đỏ.

Verify per-task: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-canh-kr.dom.tsx`

---

### Task 11: Màn — Mẫu OKR ở Cài đặt và «Bắt đầu từ mẫu»

**independent: false** (cần 7) · phục vụ E16, E17 (AC-12)

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/okr/khoi-mau-okr.tsx`, `sheet-mau-okr.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/okr/page.tsx` (prefetch `okr.mau({})`, render `<KhoiMauOkr />` sau `<FormCauHinh />`)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx` (khi `yeuCau.loai === "tao"`: đọc `okr.mau({ cap, donViId })`; có mẫu thì hiện «Bắt đầu từ mẫu»; chọn mẫu → form điền sẵn câu mục tiêu, loại, danh sách KR với ô khởi điểm và đích trống; «Tạo bản nháp» gọi `okr.taoTuMau`; ô trống → lỗi dưới ô)
- Modify: `apps/app/lib/messages/okr-canh-kr.ts`, `apps/app/test/okr-canh-kr.dom.tsx` (ca sheet mẫu, ca hộp thoại từ mẫu)

- [ ] **Step 1: Bài DOM đỏ** — sheet: «Lưu mẫu» khoá khi trống; KR mẫu «giảm xuống» khởi điểm 4 đích 8 → lỗi dưới đúng KR, «Lưu» khoá; thành viên thường → danh sách đọc được, điều khiển khoá, dòng lý do dưới tiêu đề. Hộp thoại: không mẫu → không nút «Bắt đầu từ mẫu»; chọn mẫu → hai KR, ô số trống; bấm tạo → lỗi dưới hai ô, `taoTuMau` không gọi.
- [ ] **Step 2–4:** chạy đỏ; viết theo `docs/settings.md`: `Card` + `ItemGroup`, sheet mở trên URL (`useQueryState("mau")`), «Huỷ» `SheetClose` bên trái — `SheetFooter` hiện xếp dọc, giữ nguyên (Nhóm 2 của design-pass, để Đợt 2 Cài đặt), đơn vị áp dụng chọn bằng `PickListDialog` từ `org.tree`, lưu trữ bằng `ConfirmDialog`. Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — danh sách mẫu của hộp thoại lọc ở màn thay vì máy chủ (bỏ tham số `donViId`) → ca trưởng P2 đỏ ở E16 (chạy trong Task 13).

Verify per-task: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-canh-kr.dom.tsx && cd ../.. && bun run check-types`

---

### Task 12: Bộ OKR mẫu thêm việc, bằng chứng, ghi nhận, mẫu

**independent: false** (cần 2, 3–7; cần M đã gộp) · phục vụ E18 (AC-13)

**Files:**
- Modify: `apps/api/scripts/okr-mau/cong-ty.json`, `khuon.ts`, `nap.ts` (và lệnh xoá trong cùng mô-đun của M)
- Modify: `apps/api/test/okr-mau.spec.ts` (ca `canh-kr`), `apps/api/test/okr-mau-san.ts` (danh sách bảng đếm rút từ `Prisma.dmmf.datamodel.models`, không gõ tay)

- [ ] **Step 1: Bài đỏ** `test("canh-kr: …")` theo E18 (bảng 10 phòng ban khai trước; ≥ 3 KR mốc xong có bằng chứng; ≥ 6 ghi nhận; đúng 3 mẫu; đúng 2 `okrMucTieuTuMau`; nạp lần hai đếm bằng; xoá sạch sáu bảng; hàng ngoài bộ mẫu đứng nguyên).
- [ ] **Step 2–4:** chạy đỏ; thêm khối `canhKr` vào `cong-ty.json` (việc theo mã KR mẫu, người làm theo mã người mẫu; bằng chứng `https://docs.mau.onehub.test/<mã>`; ghi nhận; ba mẫu — bộ phận, các phòng kinh doanh, các phòng hỗ trợ; hai mục tiêu quý 4 trỏ mẫu); `khuon.ts` parse khối mới bằng khuôn của Task 1; `nap.ts` ghi qua `prisma` trong cùng giao dịch nạp, mã hàng mang tiền tố bộ mẫu; xoá theo thứ tự `okrGhiNhanNhan` → `okrGhiNhan` → `okrBangChung` → `okrViecKr` → `okrMucTieuTuMau` → `okrMau` trước các bảng cũ. Chạy xanh; `okr-mau.spec.ts` toàn tệp xanh (M ghim lại nếu thước của M đổi — ghi `fix` vào sổ).
- [ ] **Step 5: Commit, phá-thử** — lệnh xoá bỏ bước `okrGhiNhanNhan` → ca xoá đỏ in bảng còn hàng.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts"`

---

### Task 13: Đường đo, phép đo màn, soi thiết kế

**independent: false** (cần tất cả) · phục vụ E11, E12, E14–E17, E19, E21

**Files:**
- Create: `_acceptance/canh-kr-okr/rang/ty-le-canh-kr.sql`, `ty-le.mjs`, `man-canh-kr.mjs`
- Modify: `_acceptance/canh-kr-okr/rang/soi-ma.mjs` (ca `thiet-ke`)

- [ ] **Step 1: `ty-le-canh-kr.sql`** — chỉ `SET` / `SELECT`, tham số `current_setting('okr.chu_ky')`; mười ba cột đúng tên E19 (`mucTieu`, `coViecHaySangKien`, `mocXong`, `mocCoBangChung`, `phongBanCoGhiNhan`, `phongBanTong`, `ghiNhanTong`, `mucTieuPhongBan`, `tuMauPhongBan`, `viecXong`, `viecTong`, `sangKienKeHoach`, `sangKienTong`). `ty-le.mjs` gieo qua thủ tục thật đúng số E19, chạy SQL, so `toEqual`; từ chối tệp SQL có câu khác `SELECT`/`SET`; `--chieu-do` chạy hai bản sao SQL (tính cả nháp; tính `tuMau` mọi cấp) → exit 1 in hai kết quả.
- [ ] **Step 2: `man-canh-kr.mjs`** — khuôn `_acceptance/khep-ky-okr/rang/man-khep-ky.mjs` (cảnh cây `canh-cay.mjs` trước màn đầu; phiên đo nạp bộ OKR mẫu; `dev:session` cho người mẫu; puppeteer theo `chup-proto-hang-loat`); ba ca `EVAL=E11|E14|E16` chạy đúng bước của evals.yaml, cùng lần chạy đọc DB cho E12, E15, E17; bộ ghi CDP cho E15 in số phản hồi đã ghi và số chứa `canhKr`, đối chứng dương ở phiên trưởng P1; `--chieu-do` cho từng ca theo evals.yaml; ảnh vào `.acceptance-runs/canh-kr-okr/` rồi chép sang `evidence/` khi xanh (luật tạo phẩm của kit).
- [ ] **Step 3: `soi-ma.mjs --ca thiet-ke`** theo E21 (danh sách tệp từ `git diff --name-only origin/onehub...HEAD`, chỉ dòng thêm; `design-gate.mjs --mode static` cho mọi `.tsx` mới ở `apps/app`; «Huỷ» bọc `DialogClose`/`SheetClose`; không chú thích, không `Record<string, unknown>`; mọi khoá chữ `okr-canh-kr.ts` có vi và en khác nhau; `lienKetChoVai` định nghĩa một lần, số chỗ trả hàng sáng kiến = số lời gọi; năm mục `CONTEXT.md`); `--chieu-do` ba vi phạm có tên.
- [ ] **Step 4:** chạy cả ba, xanh; phá-thử từng cái; commit.
- [ ] **Step 5: Năm lệnh chứng** — `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` xanh. Đặt hợp đồng `status: implemented`, sang S4.

Verify per-task: `bun _acceptance/canh-kr-okr/rang/soi-ma.mjs --ca thiet-ke && bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/canh-kr-okr/rang/ty-le.mjs"`
