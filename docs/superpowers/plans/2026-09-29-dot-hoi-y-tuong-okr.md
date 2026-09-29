# Hỏi ý mục tiêu — kế hoạch thi công (hạng mục 11 lộ trình OKR)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trước mỗi kỳ đặt OKR, cả công ty góp ý cho mục tiêu công ty trong khu OKR; người gom xếp ý thành chủ đề; người chọn viết trước, niêm phong, kết luận từng chủ đề bằng lý do tự viết rồi công bố; chủ đề chọn thành mục tiêu nháp cấp OneHub; ai góp cũng thấy hành trình ý mình và bấm «Tôi hiểu vì sao» — dựng và đo trên bộ OKR mẫu.

**Architecture:** Một mô-đun khuôn `@crm/validation/okr-hoi-y` (trần, danh mục, đầu vào, hàm thuần trạng thái và thứ tự xáo). Sáu bảng mới liền nhau cuối `schema.prisma`, `migration` chỉ tạo bảng. Máy chủ thêm `OkrHoiYService` (đồng hồ tiêm được) và các hàm thuần ở `apps/api/src/okr/hoi-y.ts` (bằng chứng chủ đề, giữ-đổi-thêm-bỏ, độ phủ, điều thiếu, chiếu ý theo vai, đọc bản viết trước); `createObjective` tách lõi giao dịch để công bố dùng lại; `setCyclePhase` thêm một chốt. Nhắc buổi sáng thêm hai loại mục. Màn là tab «Hỏi ý» mới trong khu OKR; `packages/ui` thêm hai thành phần miễn phí của ReUI (`timeline`, `scrollspy`) và hai biến thể (`Heatmap` chú giải, `SaveBar` danh sách); thanh tab OKR cuộn được và mang huy hiệu.

**Tech Stack:** Bun, Turborepo, NestJS + nestjs-trpc, Prisma 7 (Postgres), Zod, Next.js (bản trong kho — đọc `apps/app/node_modules/next/dist/docs/` trước khi đụng API Next), React Query + tRPC, nuqs, shadcn và ReUI trong `packages/ui`, eve (tác tử, chỉ phần nhắc).

**Spec:** `docs/superpowers/specs/2026-09-29-dot-hoi-y-tuong-okr-design.md` · hợp đồng `_acceptance/dot-hoi-y-tuong-okr/contract.md` (duyệt 2026-09-29, Manh Phan) · phép đo `_acceptance/dot-hoi-y-tuong-okr/evals.yaml` · bản mẫu `/proto/dot-hoi-y-tuong-okr` (`design-pass.md`, ba vòng) · rà soát `ra-soat-ux.md`, `ra-soat-reui.md`.

**Cổng 1.5:** duyệt 2026-09-29T12:25:54Z bởi Manh Phan — «duyệt · chạy: tác tử con · việc 1, 2, 11 song song»: subagent-driven (một tác tử con mỗi việc, kèm một người soát); việc 1, 2, 11 song song.

## Điều kiện trước S3

Không bắt đầu Task 1 trước khi chủ kho duyệt Cổng 1.5 và dán lệnh viết mã. Khi đó, theo thứ tự:

1. `git fetch origin && git merge origin/onehub`; xung đột `PRODUCT-MAP.md` thì vẽ lại bằng máy.
2. `bun install`, rồi `cd packages/db && bun run db:generate`.
3. Soát kế hoạch với mã mới: mốc `migration` mới nhất (hôm nay `20261006010000_giai_doan_thoa_thuan` → lượt này `20261008010000_okr_hoi_y`; nếu đã có mốc sau đó thì lấy mốc sau mốc mới nhất), model cuối `schema.prisma` (hôm nay `OkrMucTieuTuMau`, dòng 2671), dòng số của `setCyclePhase` (L360), `assertKyGhiDuoc` (L462), `vet` (L472), `assertThanhVien` (L511), `kiemTranMucTieu` (L520), `createObjective` (L567) ở `okr.service.ts`; `OkrAccessService.quyen` (L65); `viecOkr` (L22), `KHOA_MUC_OKR` (L70), `viecOkrCanNhac` (L469) ở `packages/db/src/okr-nhac.ts`; `THU_TU_NHAC` (L20) ở `onboarding-nhac.ts`; `napBoOkrMau` (L594), `xoaBoOkrMau` (L607) ở `apps/api/scripts/okr-mau/nap.ts`. Mọi chỗ lệch ghi vào `decisions.jsonl` (`type: "fix"`, `stage: "S3"`).
4. Soát hạng: vẫn T3.

## Soát lại sau gộp onehub (2026-09-29, `4dc7effe`)

- Đã gộp `origin/onehub` tới `cb6d5be8` (116 commit, gồm #207 Trợ lý OKR góp ý 9b và #208). Xung đột: `apps/app/app/proto/catalog.ts` (giữ cả hai mục `tro-ly-okr-de-xuat` và `dot-hoi-y-tuong-okr`), `PRODUCT-MAP.md` (vẽ lại bằng máy).
- `migration` mới nhất nay là `20261007010000_tro_ly_okr_de_xuat` → mốc của lượt này `20261008010000_okr_hoi_y` vẫn đúng.
- Model cuối vẫn `OkrMucTieuTuMau` (L2679).
- Dòng số đổi ở `okr.service.ts`: `setCyclePhase` L392, `assertKyGhiDuoc` L498, `vet` L508, `assertThanhVien` L547, `kiemTranMucTieu` L556, `createObjective` L603. Không đổi: `OkrAccessService.quyen` L65, `viecOkr` L22, `KHOA_MUC_OKR` L70, `viecOkrCanNhac` L469, `THU_TU_NHAC` L20, `napBoOkrMau` L594, `xoaBoOkrMau` L607, `noiDungOkr` L68, `duongMo` L113.
- `VIEC_TRO_LY` vẫn `["de-xuat", "tom-tat-tuan"]` — lượt 11b vẫn là việc riêng.
- Hạng vẫn T3.

## Global Constraints

- Không viết chú thích trong mã (mới hay sửa).
- Tên sản phẩm «Hỏi ý mục tiêu», không bao giờ «đợt» trên màn hay trong chữ; chữ «CEO» chỉ trong câu hỏi mặc định. Từ điển đã có tám mục ở `CONTEXT.md` (Hỏi ý mục tiêu, Ý, Người chọn, Bản viết trước, Chủ đề, Ý lạ, Kết luận, Kho ý).
- Trần và câu chữ khuôn ở `OKR_HOI_Y` (`packages/validation/src/okr-hoi-y.ts`); câu lỗi máy chủ ở `OKR.thongDiep.hoiY` (`apps/api/src/okr/okr-config.ts`). Không số trần 3, 5, 10, 24, 120, 200, 300, 500, 1000 ở tệp khác.
- Parse ở biên bằng Zod; không `Record<string, unknown>`; kiểu suy bằng `z.infer`; `OkrHoiY.soLieu` chỉ đọc qua `parseSoLieuHoiY`.
- `migration` chỉ `CREATE TABLE`, `CREATE (UNIQUE) INDEX` trên bảng mới, `ALTER TABLE <bảng mới> ADD CONSTRAINT … FOREIGN KEY`. Khoá ngoại tới `okrCycle`, `okrObjective`, `user`: `ON DELETE RESTRICT`; `okrYDongY → okrY`: `CASCADE`; `okrY → okrChuDe`: `SET NULL`. Sáu model mới liền nhau, là các model cuối của `schema.prisma`; quan hệ ngược trên model cũ chỉ là trường quan hệ Prisma, không cột.
- **Đồng hồ tiêm được**: `OkrHoiYService` đọc giờ qua `DONG_HO_HOI_Y` (nhà cung cấp Nest, mặc định `() => new Date()`), ghi tường minh `createdAt` của `OkrY` và `OkrYDongY`, `congBoLuc`, `OkrHoiYHieu.luc`, `niemPhongLuc`. Không dựa `@default(now())` của cơ sở dữ liệu cho các mốc đo. Bài test không `UPDATE` tay mốc nào.
- Ngày giờ Việt Nam: `ngayVN` từ `@crm/db/onboarding-nhac`. Hạn là biên nửa mở: góp được khi `now < hanLuc`.
- **Một chỗ cho mỗi luật đọc**: `chieuYChoNguoiXem` (tên người góp, số đồng ý, thứ tự xáo) và `docBanTruoc` (ai đọc được bản viết trước) ở `apps/api/src/okr/hoi-y.ts`; mọi thủ tục trả ý hay bản viết trước gọi chúng.
- Quyền trong `OkrHoiYService` (dựa `OkrAccessService.quyen`); màn chỉ hỏi cờ `quyen` từ API.
- Vết: `mo-hoi-y`, `sua-hoi-y`, `doi-nguoi-chon`, `niem-phong` (`after = { soCau, boQua }`, không chữ câu), `cong-bo-hoi-y`; mục tiêu tạo khi công bố để vết `tao` với `after.tuHoiY`. Ý, đồng ý, gom, kết luận, hiểu không để vết. Vết mức chu kỳ (`objectiveId` null).
- Màn chỉ dùng thành phần `@crm/ui` (bậc 1–3 của `docs/design.md`); không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui`; «Huỷ» bọc `SheetClose` / `DialogClose`. Chữ mới ở `apps/app/lib/messages/okr-hoi-y.ts`, vi và en khác nhau; hàm ghép chữ nhận đối số vô hướng (luật `messages-guard`). Chữ người nhập mang `translate="no"`.
- Cài ReUI theo `docs/reui.md`: chỉ trong `packages/ui`, `--dry-run` trước, không `--overwrite`, rồi bốn chỗ sửa (import `cn`, xoá chú thích, icon Carbon, màu và góc).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao bị phá đỏ với thông điệp ghim. Phá-thử làm SAU commit. Thiếu cặp là việc chưa xong.
- Bài chạm DB khai `timeout` ≥ 30 000 ms.

## Review Focus

- Người góp gửi ý đúng lúc hạn: `now = hanLuc − 1 ms` được, `now = hanLuc` bị từ chối (biên nửa mở) — Task 5 thêm hai ca bằng đồng hồ tiêm.
- Quản trị đổi người chọn sang một người đã góp ý: từ chối `400 nguoiChonDaGop` — người chọn không góp nên không được mang ý vào; Task 4 thêm ca.
- Ý, lý do, câu viết trước có emoji, chữ Anh, 300 ký tự liền không dấu cách, và chuỗi `<b>x</b>`: lưu nguyên, màn in nguyên văn không diễn giải, không tràn ngang ở 390 — Task 1 thêm ca khuôn, Task 12 thêm ca DOM.
- Người đã góp rời công ty trước công bố: ý vẫn trong chủ đề và được đếm ở bằng chứng, không nhận mục «đã công bố», không vào mẫu số — Task 8 và Task 10 thêm ca.
- Người chọn mở hai tab và bấm «Công bố» hai lần gần như cùng lúc: đúng một lần tạo mục tiêu, lần hai `400 daCongBo` (khoá hàng `OkrHoiY FOR UPDATE`) — Task 8 thêm ca song song.

---

## Bản đồ tệp

| Tệp | Việc |
|---|---|
| `packages/validation/src/okr-hoi-y.ts` (mới) | `OKR_HOI_Y`, danh mục, `soLieuHoiY`, `parseSoLieuHoiY`, đầu vào mọi thủ tục, `trangThaiHoiY`, `thuTuXao`, `chuanCau` |
| `packages/validation/package.json` | subpath `./okr-hoi-y` |
| `packages/db/src/okr-vet.ts` | năm hành động vết mới |
| `packages/db/prisma/schema.prisma` | sáu model mới cuối tệp + trường quan hệ ngược |
| `packages/db/prisma/migrations/20261008010000_okr_hoi_y/` | `migration` chỉ tạo bảng |
| `apps/api/src/okr/hoi-y.ts` (mới) | hàm thuần: `bangChungChuDe`, `ketQuaBanTruoc`, `doPhu`, `lyDoChuaCongBo`, `chieuYChoNguoiXem`, `docBanTruoc` |
| `apps/api/src/okr/okr-hoi-y.service.ts` (mới) | mọi thủ tục của lần hỏi ý |
| `apps/api/src/okr/okr-hoi-y.contracts.ts` (mới) | khuôn đầu ra tRPC |
| `apps/api/src/okr/dong-ho.ts` (mới) | `DONG_HO_HOI_Y` |
| `apps/api/src/okr/okr.service.ts` | tách `taoMucTieuTrongTx`; chốt `setCyclePhase` |
| `apps/api/src/okr/okr-config.ts` | `thongDiep.hoiY` |
| `apps/api/src/okr/okr.router.ts`, `okr.module.ts` | 17 thủ tục, đăng ký dịch vụ |
| `apps/api/test/okr-hoi-y.spec.ts`, `okr-hoi-y-san.ts`, `okr-hoi-y-thuan.spec.ts`, `okr-hoi-y-hieu-nang.spec.ts` (mới) | bài máy chủ |
| `apps/api/test/vai-chi-okr.spec.ts` | 17 thủ tục mới vào tập ghim; `DAU_VAO_HOP_LE` |
| `packages/db/src/okr-nhac.ts`, `onboarding-nhac.ts`, `packages/validation/src/nhac-ke-hoach.ts` | hai loại mục nhắc |
| `apps/agent/agent/lib/tin-nhac.ts`, `nhac-ke-hoach.ts`, `apps/agent/test/okr-nhac.integration.spec.ts` | dòng tin và đường mở |
| `packages/ui/src/components/reui/timeline.tsx`, `reui/scrollspy.tsx` (cài) | hai thành phần ReUI |
| `packages/ui/src/components/heatmap.tsx`, `save-bar.tsx`, `packages/ui/src/lib/messages.ts` | biến thể chú giải, biến thể danh sách |
| `apps/app/app/(app)/[slug]/okr/thanh-tab.tsx`, `layout.tsx` | tab «Hỏi ý», cuộn ngang, huy hiệu, công cụ cùng hàng |
| `apps/app/app/(app)/[slug]/okr/hoi-y/` (mới) | trang server và các khối client |
| `apps/app/lib/messages/okr-hoi-y.ts` (mới) | chữ vi/en |
| `apps/app/test/okr-hoi-y.dom.tsx` (mới) | bài DOM chín trạng thái |
| `apps/api/scripts/okr-mau/nap-hoi-y.ts` (mới), `nap.ts`, `cong-ty.json`, `apps/api/test/okr-mau-san.ts` | bộ mẫu |
| `_acceptance/dot-hoi-y-tuong-okr/rang/` (mới) | `ty-le-hoi-y.sql`, `ty-le.mjs`, `man-hoi-y.mjs`, `soi-ma.mjs`, `migration-chi-them.mjs` |
| `docs/api.md`, `docs/agent.md` | mục Hỏi ý mục tiêu |

## Thứ tự và độc lập

- Task 1 ∥ Task 2 ∥ Task 11 — `independent: true`.
- Task 3 sau 1. Task 4 sau 1, 2, 3. Task 5 → 6 → 7 → 8 → 9 tuần tự (cùng dịch vụ, cùng tệp bài).
- Task 10 sau 5 và 8. Task 12 sau 9 và 11. Task 13 sau 8. Task 14 sau hết.

---

### Task 1: Khuôn dùng chung, trạng thái, thứ tự xáo, hành động vết

**independent: true** · phục vụ E1 (khuôn), E4 (thứ tự xáo), mọi task sau

**Files:**
- Create: `packages/validation/src/okr-hoi-y.ts`, `packages/validation/test/okr-hoi-y.spec.ts`
- Modify: `packages/validation/package.json` (`"./okr-hoi-y": "./src/okr-hoi-y.ts"` cạnh `./okr-mau`)
- Modify: `packages/db/src/okr-vet.ts` (năm hành động cuối `HANH_DONG_VET`: `mo-hoi-y`, `sua-hoi-y`, `doi-nguoi-chon`, `niem-phong`, `cong-bo-hoi-y`), `apps/app/lib/messages/okr.ts` (nhãn vi/en ở `hanhDong`: «Mở hỏi ý», «Sửa hỏi ý», «Đổi người chọn», «Niêm phong bản viết trước», «Công bố hỏi ý»)

**Interfaces:**
- Produces:
  - `OKR_HOI_Y = { yMoiNguoi: 3, soLieu: { min: 1, max: 5, nhan: { min: 2, max: 60 }, giaTri: { min: 1, max: 40 }, ghiChu: { max: 120 } }, cauHoi: { min: 10, max: 300 }, loiMo: { max: 1000 }, noiDung: { min: 10, max: 300 }, viSao: { max: 500 }, doBangGi: { max: 200 }, banTruoc: { min: 3, max: 5, cau: { min: 10, max: 200 } }, tenChuDe: { min: 2, max: 120 }, lyDo: { min: 10, max: 1000 }, hanGio: { min: 24, max: 168 }, trich: 2, hienTruoc: 10, hieuNgay: 7 } as const`
  - `TRANG_THAI_HOI_Y = ["dang-mo", "dang-gom", "da-cong-bo"] as const`; `LOAI_CHU_DE = ["chu-de", "y-la"] as const`; `KET_LUAN = ["chon", "de-sau", "khong-lam", "da-co"] as const`; `NOI_BAN_TRUOC = ["cau-1","cau-2","cau-3","cau-4","cau-5","moi"] as const`
  - `soLieuHoiY` (mảng 1–5 `{ nhan, giaTri, ghiChu }`), `parseSoLieuHoiY(v: unknown): SoLieuHoiY` (ném lỗi có đường dẫn)
  - `moHoiYInput { cycleId, cauHoi, loiMo, soLieu, hanLuc: string (ISO), nguoiChonUserId }`; `suaHoiYInput { hoiYId, cauHoi?, loiMo?, soLieu?, hanLuc?, nguoiChonUserId? }`; `gopYInput { hoiYId, noiDung, viSao, doBangGi }`; `suaYInput { yId, noiDung, viSao, doBangGi }`; `yIdInput { yId }`; `dongYInput { yId, bat: boolean }`; `niemPhongInput = { hoiYId, cau: string[] (3–5) } | { hoiYId, boQua: true }`; `taoChuDeInput { hoiYId, ten }`; `suaChuDeInput { chuDeId, ten }`; `chuDeIdInput { chuDeId }`; `ganYInput = { yIds: string[] (1–50), chuDeId } | { yIds: [string], yLa: true }`; `ketLuanInput { chuDeId, ketLuan, lyDo, cauMucTieu: string, noiBanTruoc: NoiBanTruoc | null }`; `hoiYIdInput { hoiYId }`; `cycleIdInput { cycleId }`
  - `trangThaiHoiY(h: { hanLuc: Date; congBoLuc: Date | null }, now: Date): TrangThaiHoiY`
  - `thuTuXao(ids: string[], hat: string): string[]` — hoán vị ổn định: sắp theo băm FNV-1a 32 bit của `${hat}:${id}`, hoà thì theo `id`
  - `chuanCau(s: string): string` — gộp khoảng trắng, `trim`, `toLocaleLowerCase("vi")`

- [ ] **Step 1: Bài đỏ trước — bảng ca viết trước, so cả mảng.**

```ts
import { describe, expect, test } from "bun:test";
import { chuanCau, gopYInput, soLieuHoiY, thuTuXao, trangThaiHoiY } from "../src/okr-hoi-y";

const dong = (nhan: string, giaTri: string, ghiChu = "") => ({ nhan, giaTri, ghiChu });
const CA_SO_LIEU: [unknown, boolean][] = [
	[[dong("Doanh thu", "92%")], true],
	[[1, 2, 3, 4, 5].map((i) => dong(`Số ${i}`, "1")), true],
	[[], false],
	[[1, 2, 3, 4, 5, 6].map((i) => dong(`Số ${i}`, "1")), false],
	[[dong("D", "1")], false],
	[[dong("x".repeat(61), "1")], false],
	[[dong("Doanh thu", "")], false],
	[[dong("Doanh thu", "x".repeat(41))], false],
	[[dong("Doanh thu", "1", "x".repeat(121))], false],
	[[dong("Doanh thu", "1", "x".repeat(120))], true],
];

describe("okr-hoi-y", () => {
	test("so lieu", () =>
		expect(CA_SO_LIEU.map(([v]) => soLieuHoiY.safeParse(v).success)).toEqual(CA_SO_LIEU.map(([, k]) => k)));
	test("y: 9 va 301 ky tu bi tu choi, chu la giu nguyen", () => {
		const co = (noiDung: string) => gopYInput.safeParse({ hoiYId: "h", noiDung, viSao: "", doBangGi: "" }).success;
		expect([co("x".repeat(9)), co("x".repeat(301)), co("Launch 🚀 kho lạnh <b>x</b>"), co("x".repeat(300))]).toEqual([false, false, true, true]);
	});
	test("trang thai theo han nua mo va luc cong bo", () => {
		const han = new Date("2026-12-08T10:00:00.000Z");
		expect([
			trangThaiHoiY({ hanLuc: han, congBoLuc: null }, new Date(han.getTime() - 1)),
			trangThaiHoiY({ hanLuc: han, congBoLuc: null }, han),
			trangThaiHoiY({ hanLuc: han, congBoLuc: new Date("2026-12-14T03:00:00.000Z") }, new Date("2026-12-20T00:00:00.000Z")),
		]).toEqual(["dang-mo", "dang-gom", "da-cong-bo"]);
	});
	test("thu tu xao on dinh theo hat, khac giua hai hat, khong theo thu tu vao", () => {
		const ids = Array.from({ length: 12 }, (_, i) => `y${i}`);
		const a1 = thuTuXao(ids, "h:u1");
		expect(a1).toEqual(thuTuXao([...ids].reverse(), "h:u1"));
		expect(a1).not.toEqual(thuTuXao(ids, "h:u2"));
		expect(a1).not.toEqual(ids);
		expect([...a1].sort()).toEqual([...ids].sort());
	});
	test("chuan cau", () => expect(chuanCau("  Giao  hàng LẠNH ")).toBe("giao hàng lạnh"));
});
```

- [ ] **Step 2: Chạy, xác nhận đỏ** — `cd packages/validation && bun test test/okr-hoi-y.spec.ts` → FAIL «Cannot find module».
- [ ] **Step 3: Viết mô-đun theo Interfaces.** Chuỗi qua `z.string().trim()`. FNV-1a: `let h = 0x811c9dc5; for (const c of s) { h ^= c.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; }`.
- [ ] **Step 4: Năm hành động vết** và năm nhãn vi/en.
- [ ] **Step 5: Chạy lại** → PASS; `bunx tsc --noEmit -p packages/validation` và `-p apps/app` xanh.
- [ ] **Step 6: Commit, rồi phá-thử** — bản sao `thuTuXao` trả nguyên thứ tự vào → ca «không theo thứ tự vào» đỏ; bản sao `trangThaiHoiY` so `<=` → ca biên đỏ. Trả lại.

Verify per-task: `cd packages/validation && bun test test/okr-hoi-y.spec.ts`

---

### Task 2: Sáu bảng mới và phép đo `migration`

**independent: true** · phục vụ E19 (AC-14)

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (sáu model cuối tệp; trường quan hệ ngược trên `OkrCycle`, `OkrObjective`, `User`)
- Create: `packages/db/prisma/migrations/20261008010000_okr_hoi_y/migration.sql` (sinh bằng `bunx prisma migrate dev --create-only --name okr_hoi_y` rồi đổi tên thư mục sang mốc đã chốt ở Điều kiện trước S3)
- Create: `_acceptance/dot-hoi-y-tuong-okr/rang/migration-chi-them.mjs` (chép khuôn `_acceptance/canh-kr-okr/rang/migration-chi-them.mjs`, đổi bảng khoá ngoại viết trước)

**Interfaces:**
- Produces: sáu model, đúng thứ tự:

```prisma
model OkrHoiY {
  id              String           @id @default(cuid())
  cycleId         String           @unique
  cycle           OkrCycle         @relation(fields: [cycleId], references: [id], onDelete: Restrict)
  cauHoi          String
  loiMo           String           @default("")
  soLieu          Json
  hanLuc          DateTime
  nguoiChonUserId String
  nguoiChon       User             @relation("OkrHoiYNguoiChon", fields: [nguoiChonUserId], references: [id], onDelete: Restrict)
  taoBoiUserId    String
  taoBoi          User             @relation("OkrHoiYTaoBoi", fields: [taoBoiUserId], references: [id], onDelete: Restrict)
  congBoLuc       DateTime?
  createdAt       DateTime
  updatedAt       DateTime         @updatedAt
  banTruoc        OkrHoiYBanTruoc?
  y               OkrY[]
  chuDe           OkrChuDe[]
  hieu            OkrHoiYHieu[]

  @@map("okrHoiY")
}

model OkrHoiYBanTruoc {
  id             String   @id @default(cuid())
  hoiYId         String   @unique
  hoiY           OkrHoiY  @relation(fields: [hoiYId], references: [id], onDelete: Restrict)
  cau            String[]
  boQua          Boolean
  vietBoiUserId  String
  vietBoi        User     @relation("OkrHoiYVietBoi", fields: [vietBoiUserId], references: [id], onDelete: Restrict)
  niemPhongLuc   DateTime

  @@map("okrHoiYBanTruoc")
}

model OkrY {
  id           String      @id @default(cuid())
  hoiYId       String
  hoiY         OkrHoiY     @relation(fields: [hoiYId], references: [id], onDelete: Restrict)
  tacGiaUserId String
  tacGia       User        @relation("OkrYTacGia", fields: [tacGiaUserId], references: [id], onDelete: Restrict)
  noiDung      String
  viSao        String      @default("")
  doBangGi     String      @default("")
  chuDeId      String?
  chuDe        OkrChuDe?   @relation(fields: [chuDeId], references: [id], onDelete: SetNull)
  ganLuc       DateTime?
  createdAt    DateTime
  updatedAt    DateTime    @updatedAt
  dongY        OkrYDongY[]

  @@index([hoiYId, tacGiaUserId])
  @@index([chuDeId])
  @@map("okrY")
}

model OkrYDongY {
  yId       String
  y         OkrY     @relation(fields: [yId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation("OkrYDongY", fields: [userId], references: [id], onDelete: Restrict)
  createdAt DateTime

  @@id([yId, userId])
  @@map("okrYDongY")
}

model OkrChuDe {
  id          String        @id @default(cuid())
  hoiYId      String
  hoiY        OkrHoiY       @relation(fields: [hoiYId], references: [id], onDelete: Restrict)
  loai        String
  ten         String
  ketLuan     String?
  lyDo        String        @default("")
  cauMucTieu  String        @default("")
  noiBanTruoc String?
  objectiveId String?       @unique
  objective   OkrObjective? @relation(fields: [objectiveId], references: [id], onDelete: Restrict)
  viTri       Int
  createdAt   DateTime      @default(now())
  y           OkrY[]

  @@index([hoiYId])
  @@map("okrChuDe")
}

model OkrHoiYHieu {
  hoiYId String
  hoiY   OkrHoiY  @relation(fields: [hoiYId], references: [id], onDelete: Restrict)
  userId String
  user   User     @relation("OkrHoiYHieu", fields: [userId], references: [id], onDelete: Restrict)
  luc    DateTime

  @@id([hoiYId, userId])
  @@map("okrHoiYHieu")
}
```

- [ ] **Step 1: Phép đo đỏ trước** — `migration-chi-them.mjs` suy gốc kho từ `import.meta.url`, đọc mọi thư mục `migration` mới so với `origin/onehub`, tách câu SQL, so với tập viết trước (E19); bảng khoá ngoại viết trước: `okrHoiY→okrCycle RESTRICT`, `okrHoiY→user RESTRICT ×2`, `okrHoiYBanTruoc→okrHoiY RESTRICT`, `okrHoiYBanTruoc→user RESTRICT`, `okrY→okrHoiY RESTRICT`, `okrY→user RESTRICT`, `okrY→okrChuDe SET NULL`, `okrYDongY→okrY CASCADE`, `okrYDongY→user RESTRICT`, `okrChuDe→okrHoiY RESTRICT`, `okrChuDe→okrObjective RESTRICT`, `okrHoiYHieu→okrHoiY RESTRICT`, `okrHoiYHieu→user RESTRICT`; kiểm sáu model là các model cuối, liền nhau. `--chieu-do` sinh bốn tệp giả trong `tmpdir` (ADD COLUMN trên `okrObjective`; khoá ngoại tới `okrObjective` CASCADE; model mới giữa tệp; DROP INDEX) → exit 1 thông điệp ghim từng loại; đối chứng dương exit 0. Chạy trước khi có `migration` → exit 1 «không có migration mới».
- [ ] **Step 2: Sáu model + quan hệ ngược**, `bunx prisma format`, `--create-only`, đổi tên thư mục, đọc SQL: chỉ tạo bảng, chỉ mục, khoá ngoại.
- [ ] **Step 3: Chạy** `bun _acceptance/dot-hoi-y-tuong-okr/rang/migration-chi-them.mjs` → exit 0 in số câu; `--chieu-do` → exit 1 đủ bốn thông điệp. `cd packages/db && bun run db:generate && bunx tsc --noEmit`.
- [ ] **Step 4: Commit.**

Verify per-task: `bun _acceptance/dot-hoi-y-tuong-okr/rang/migration-chi-them.mjs && bun _acceptance/dot-hoi-y-tuong-okr/rang/migration-chi-them.mjs --chieu-do; test $? -eq 1`

---

### Task 3: Hàm thuần — bằng chứng, giữ-đổi-thêm-bỏ, độ phủ, điều thiếu, luật đọc

**independent: false** (cần 1) · phục vụ E7, E9, E11 (phần thuần), E4, E5 (luật đọc)

**Files:**
- Create: `apps/api/src/okr/hoi-y.ts`, `apps/api/test/okr-hoi-y-thuan.spec.ts`

**Interfaces:**
- Consumes: `thuTuXao`, `chuanCau`, `OKR_HOI_Y`, `KET_LUAN`, `NOI_BAN_TRUOC` (Task 1); `ngayVN` (`@crm/db/onboarding-nhac`).
- Produces:
  - `bangChungChuDe(y: { id; noiDung; tacGiaUserId; phongBanId: string | null; soDongY: number; createdAt: Date }[]) → { soNguoi; soDonVi; soDongY; trich: string[] }` — `soDonVi` đếm phòng ban chính khác nhau (người chưa xếp tính là một đơn vị «chưa xếp»); `trich` = `OKR_HOI_Y.trich` ý nhiều đồng ý nhất, hoà thì cũ trước.
  - `ketQuaBanTruoc(ban: { cau: string[]; boQua: boolean }, chon: { noiBanTruoc: string; cauMucTieu: string }[]) → { cau: ("giu" | "doi" | "bo")[]; doi: number; them: number; boQua: boolean }` — chỉ chủ đề `ketLuan = chon` được truyền vào.
  - `doPhu(input: { ngay: string[]; donVi: { id; loai: "goc" | "bo-phan" | "phong-ban" | "chua-xep"; cha: string | null }[]; nguoi: { id; phongBanChinh: string | null }[]; gop: { tacGiaUserId; ngayVN: string }[] }) → { hang: { id; giaTri: number[] }[] }` — mẫu số là `nguoi` (người gọi đã lọc thành viên còn hiệu lực, trừ người chọn), cộng dồn theo ngày, một chữ số thập phân.
  - `lyDoChuaCongBo(s: { coBanTruoc: boolean; boQua: boolean; yChuaGom: number; chuDe: { id; ten; soY; ketLuan: string | null; lyDo: string; cauMucTieu: string; noiBanTruoc: string | null }[]; tongOneHubSau: number; objectiveCap: number; capMode: "chan" | "canh-bao" }) → { ma: MaThieu; chuDeId: string | null }[]` với `MaThieu` ∈ `chua-niem-phong`, `y-chua-gom`, `chu-de-rong`, `thieu-ket-luan`, `thieu-ly-do`, `thieu-cau-muc-tieu`, `thieu-noi-ban-truoc`, `khong-chon`, `vuot-tran` (đúng thứ tự này).
  - `chieuYChoNguoiXem(y: YTho[], xem: { userId; laQuanTri: boolean; laNguoiChon: boolean; daNiemPhong: boolean; hoiYId: string; trangThai: TrangThaiHoiY }) → { khoa: boolean; y: YChieu[] }` — thành viên và vai «chỉ OKR»: không `tacGia`, không `soDongY`, có `daDongY` riêng, ý người khác theo `thuTuXao(ids, \`${hoiYId}:${userId}\`)`; quản trị và người chọn đã niêm phong: có tên và số, theo `createdAt`; người chọn chưa niêm phong: `khoa: true`, `y: []`.
  - `docBanTruoc(ban, xem) → { cau: string[]; boQua: boolean; vietBoi: string } | null` — trả khi `xem.laNguoiChon` hoặc `trangThai === "da-cong-bo"`; mọi ca khác `null`.

- [ ] **Step 1: Bài đỏ** — `describe("bang-chung")` ca E7 (5 ý, 4 người, 3 phòng ban thuộc 2 bộ phận, đồng ý `[3,0,2,1,0]` → `toEqual({ soNguoi: 4, soDonVi: 3, soDongY: 6, trich: [...] })`; một ý → một trích). `describe("giu-them-bo")` ca E9 (bốn câu; `cau-1` trùng sau `chuanCau`, `cau-3` khác chữ, `moi` → `{ cau: ["giu","bo","doi","bo"], doi: 1, them: 1 }`; `boQua` → `{ cau: [], doi: 0, them: 3, boQua: true }`). `describe("do-phu")` ma trận viết trước của E11 (9 hàng × 2 ngày, hàng gốc 12/21 → 57.1; R không trong `nguoi`). `describe("ly-do-chua-cong-bo")` chín ca, mỗi ca phá đúng một điều, so `toEqual` mảng mã. `describe("chieu-y")` bốn người xem × ba trạng thái, khẳng định khoá có/không có mặt theo bảng viết trước (`Object.keys` của mỗi ý so `toEqual`).
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/api && bun test test/okr-hoi-y-thuan.spec.ts"`.
- [ ] **Step 3: Viết `hoi-y.ts`** theo Interfaces; không truy vấn DB.
- [ ] **Step 4: Chạy xanh; commit; phá-thử** — `soDonVi` đếm theo bộ phận → ca E7 đỏ in hai giá trị; `ketQuaBanTruoc` so chữ phân biệt hoa thường → câu 1 thành `doi`, đỏ; `chieuYChoNguoiXem` giữ `tacGia` cho thành viên → ca đỏ in khoá lộ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y-thuan.spec.ts"`

---

### Task 4: Dịch vụ — mở, sửa, đổi người chọn; đồng hồ tiêm; router nền

**independent: false** (cần 1, 2, 3) · phục vụ E1, E2 (AC-1)

**Files:**
- Create: `apps/api/src/okr/okr-hoi-y.service.ts`, `apps/api/src/okr/okr-hoi-y.contracts.ts`, `apps/api/src/okr/dong-ho.ts`, `apps/api/test/okr-hoi-y.spec.ts`, `apps/api/test/okr-hoi-y-san.ts`
- Modify: `apps/api/src/okr/okr.router.ts`, `okr.module.ts`, `okr-config.ts` (`thongDiep.hoiY`), `apps/api/test/vai-chi-okr.spec.ts`

**Interfaces:**
- Consumes: `OkrService.vet`, `assertThanhVien`, `program`; `OkrAccessService.quyen` (`quanTri`); `isWorkspaceAdmin` (`@crm/auth`); khuôn Task 1; `goi`, `goiQuery`, `doc`, `phien`, `phienCua`, `nguoiMoi`, `taoNam` (`test/okr-san.ts`).
- Produces: `DONG_HO_HOI_Y` (token Nest, giá trị `() => Date`); `OkrHoiYService.moHoiY(userId, input) → { id }`, `suaHoiY(userId, input) → { id }`; `thongDiep.hoiY = { chiQuanTri, nguoiChonPhaiQuanTri, nguoiChonDaGop, kyKhongLapKeHoach, daCoHoiY, hanNgoaiKhoang, cauHoiDaKhoa, daNiemPhong, … }`; thủ tục `okr.moHoiY` (POST `/okr/hoi-y`), `okr.suaHoiY` (POST `/okr/hoi-y/{hoiYId}`); `okr-hoi-y-san.ts`: `datDongHo(d: Date)`, `gieoHoiY(opts?) → { ky, h, nguoi: { Q, P, T, O, A, B, R } }`, `dem(bang)`.

- [ ] **Step 1: Bài đỏ** — `describe("mo-hoi-y")` chuỗi E1 (đọc DB, `parseSoLieuHoiY` so `toEqual` đầu vào, trạng thái, mảng vết `toEqual(["mo-hoi-y","sua-hoi-y","sua-hoi-y"])`; lối ra đổi người chọn sau khi P bị hạ vai qua thủ tục thật, vết `doi-nguoi-chon`). `describe("mo-tu-choi")` bảng 11 ca của E2 khai trước `{ ca, maHttp, cau }`, cộng ca Review Focus «đổi người chọn sang người đã góp → 400 nguoiChonDaGop»; mỗi ca đếm `okrHoiY`, `okrTrail` không đổi.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t mo-"`.
- [ ] **Step 3: Dịch vụ.** Mỗi ghi trong `db.$transaction`; `moHoiY`: `quyen.quanTri` → không thì 403; chu kỳ `lap-ke-hoach`; `nguoiChonUserId` là thành viên có vai owner/admin; `hanLuc − now` ∈ [24 h, 168 h]; `createdAt = now()` của đồng hồ; vết `mo-hoi-y` `after = { hoiYId, hanLuc: ISO, nguoiChonUserId, soLieu: số dòng }`. `suaHoiY`: khoá hàng `FOR UPDATE`; `dang-mo`; `hanLuc` mới ∈ [now, createdAt + 168 h]; đổi `cauHoi` khi đã có ý → 400; đổi người chọn: người mới là quản trị, chưa góp ý; nếu đã có `OkrHoiYBanTruoc` thì chỉ khi người chọn cũ không còn owner/admin hoặc đã rời.
- [ ] **Step 4: Router** — hai thủ tục theo khuôn `moRa`/`dongRa` (`restMeta("POST", …, TAG)`); `okr.module.ts` đăng ký dịch vụ và `{ provide: DONG_HO_HOI_Y, useValue: () => new Date() }`; `cd apps/api && bun run trpc:generate`. `vai-chi-okr.spec.ts`: thêm tên thủ tục vào tập ghim và `DAU_VAO_HOP_LE` (mỗi thủ tục mới của Task 4–9 thêm ở task của nó; Task 9 so tổng 17).
- [ ] **Step 5: Chạy xanh**; `vai-chi-okr.spec.ts` toàn tệp xanh.
- [ ] **Step 6: Commit, phá-thử** — `suaHoiY` bỏ `vet` → ca mảng vết đỏ; `moHoiY` bỏ kiểm vai người chọn → ô «người chọn là member» đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t mo- && bun test test/vai-chi-okr.spec.ts"`

---

### Task 5: Góp, sửa, gỡ ý; «Tôi cũng nghĩ vậy»; đọc lần hỏi ý; huy hiệu

**independent: false** (cần 4) · phục vụ E3, E4 (AC-2, AC-3)

**Files:**
- Modify: `apps/api/src/okr/okr-hoi-y.service.ts`, `okr-hoi-y.contracts.ts`, `okr.router.ts`, `okr-config.ts`, `apps/api/test/okr-hoi-y.spec.ts`, `vai-chi-okr.spec.ts`

**Interfaces:**
- Consumes: `chieuYChoNguoiXem`, `docBanTruoc`, `trangThaiHoiY` (Task 1, 3).
- Produces: `gopY`, `suaY`, `goY`, `dongY`, `hoiY(userId, { cycleId }) → HoiYOutput | null`, `hoiYNhan(userId, { cycleId }) → { coHoiY; trangThai; canGop; soChuDeChuaKetLuan: number | null }`; `HoiYOutput = { hoiY: { id; cauHoi; loiMo; soLieu; hanLuc; createdAt; congBoLuc }; trangThai; nguoiChon: { id; name }; cuaToi: { y: YCuaToi[]; daHieu: boolean }; y: { khoa: boolean; ds: YChieu[] }; chuDe: ChuDeChieu[] | null; banTruoc: BanTruocChieu | null; ketQua: KetQuaChieu | null; quyen: { moDuoc; gopDuoc; gomDuoc; chonDuoc; congBoDuoc; lyDoChuaCongBo: { ma; chuDeId }[] } }` (phần `chuDe`, `ketQua` điền ở Task 7–8, trước đó `null`).

- [ ] **Step 1: Bài đỏ** — `describe("gop-y")` chuỗi và bảng từ chối E3, ca đua hai `gopY` song song khi đã có 2 ý (đúng 3 ý), hai ca biên hạn `hanLuc − 1 ms` được, `hanLuc` bị từ chối (Review Focus). `describe("ten-va-so")` ma trận E4: 4 vai × 3 đường × `hoiY`, `hoiYNhan` (thêm `hoiYDoPhu` ở Task 9) × 3 trạng thái — khai bảng kỳ vọng trước, bài in số ô; thứ tự xáo (T lần 1 = lần 2, T ≠ O, T ≠ `createdAt`, bấm đồng ý không đổi thứ tự); `dongY` lặp, bỏ, ý của mình, sau hạn; `hoiYNhan` bốn ca.
- [ ] **Step 2: Chạy đỏ** — `-t gop-y`, `-t ten-va-so`.
- [ ] **Step 3: Dịch vụ.** `gopY`: khoá hàng `OkrHoiY FOR UPDATE`, trạng thái `dang-mo`, người gọi không phải người chọn, đếm ý của người gọi < 3, `createdAt = now()`. `dongY`: `createMany skipDuplicates` / `deleteMany`. `hoiY` gom dữ liệu một lượt (lần hỏi ý, ý kèm `_count.dongY`, `dongY` của người gọi, bản viết trước) rồi đi qua `chieuYChoNguoiXem` và `docBanTruoc` — không chỗ nào tự chiếu.
- [ ] **Step 4: Router** — `gopY`, `suaY`, `goY`, `dongY` (POST), `hoiY`, `hoiYNhan` (GET `/okr/hoi-y?cycleId=`, `/okr/hoi-y/nhan?cycleId=`); `trpc:generate`; tập ghim `vai-chi-okr`.
- [ ] **Step 5: Chạy xanh; commit; phá-thử** — đếm trần ngoài giao dịch → ca đua đỏ in 4; `hoiY` trả `tacGia` cho mọi vai → ô (O, tRPC, hoiY, dang-mo) đỏ in chuỗi lộ; trả ý theo `createdAt` cho thành viên → ca «T ≠ O» đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t gop-y && bun test test/okr-hoi-y.spec.ts -t ten-va-so"`

---

### Task 6: Bản viết trước — niêm phong, khoá đọc ý, không lộ trước công bố

**independent: false** (cần 5) · phục vụ E5 (AC-4)

**Files:** `apps/api/src/okr/okr-hoi-y.service.ts`, `okr.router.ts`, `okr-config.ts`, `apps/api/test/okr-hoi-y.spec.ts`, `vai-chi-okr.spec.ts`

**Interfaces:**
- Produces: `niemPhong(userId, input) → { id }`; thủ tục `okr.niemPhong` (POST `/okr/hoi-y/{hoiYId}/niem-phong`).

- [ ] **Step 1: Bài đỏ** — `describe("ban-truoc")` toàn bộ E5: khoá trước niêm phong (0 ý người khác, `khoa: true`, câu ghim); niêm phong bốn câu → hàng đúng, đọc được ý kèm tên; lần hai 400; vết `{ soCau: 4, boQua: false }` và `JSON.stringify` vết không chứa câu nào; nửa ma trận quét lộ ở trạng thái dang-mo sau niêm phong (27 ô: 3 vai × 3 đường × 3 thủ tục đọc — `hoiYDoPhu` thêm ở Task 9, trước đó khai 18 ô và bài in số ô đã chạy); ca `boQua`. Nửa dang-gom (27 ô) viết ở Task 7, khi gom và kết luận đã có.
- [ ] **Step 2–4:** chạy đỏ; dịch vụ: chỉ người chọn, `dang-mo`, chưa có hàng; `cau` 3–5 câu qua khuôn; `niemPhongLuc = now()`; vết. Router, `trpc:generate`, tập ghim. Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — `docBanTruoc` trả cho quản trị → ô (Q, tRPC, hoiY, dang-mo) đỏ; bỏ khoá đọc ý → ca «0 ý trước niêm phong» đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t ban-truoc"`

---

### Task 7: Gom chủ đề và kết luận

**independent: false** (cần 6) · phục vụ E6, E7 (AC-5, AC-6)

**Files:** `apps/api/src/okr/okr-hoi-y.service.ts`, `okr-hoi-y.contracts.ts`, `okr.router.ts`, `okr-config.ts`, `apps/api/test/okr-hoi-y.spec.ts`, `vai-chi-okr.spec.ts`

**Interfaces:**
- Consumes: `bangChungChuDe` (Task 3).
- Produces: `taoChuDe`, `suaChuDe`, `goChuDe`, `ganY`, `ketLuanChuDe`; `ChuDeChieu = { id; loai; ten; ketLuan; lyDo; cauMucTieu; noiBanTruoc; objectiveId; bangChung: { soNguoi; soDonVi; soDongY; trich: string[] }; y: YChieu[] }`; `hoiY` điền `chuDe` (quản trị và người chọn khi `dang-gom`, mọi người khi `da-cong-bo` — ý không tên cho thành viên qua `chieuYChoNguoiXem`).

- [ ] **Step 1: Bài đỏ** — `describe("gom")` E6 đủ chuỗi và bảng từ chối; `describe("ket-luan")` E7 phần dịch vụ (ghi đọc lại, `lyDo === ""` và `cauMucTieu === ""` khi chưa kết luận, bảng từ chối gồm `cau-5` khi 4 câu và `cau-1` khi `boQua`). Thêm vào `describe("ban-truoc")` nửa ma trận quét lộ ở dang-gom sau khi P kết luận và khai `cau-1`, `cau-3`.
- [ ] **Step 2–4:** chạy đỏ; dịch vụ: gom chỉ khi `dang-gom`, quyền quản trị hoặc người chọn; `ganY` đặt `ganLuc = now()` cho mỗi ý được gắn (chuyển chủ đề thì ghi lại); với `yLa` tạo chủ đề `loai: y-la`, `ten` = 120 ký tự đầu của ý (cắt theo `Array.from` để không cắt giữa ký tự); `goChuDe` từ chối khi còn ý; `viTri` = max + 1. `ketLuanChuDe` chỉ người chọn, khuôn Task 1, `noiBanTruoc` hợp số câu. Router năm thủ tục (POST), `trpc:generate`, tập ghim. Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — `ganY yLa` gom nhiều ý → ca «đúng Y4» đỏ; quản trị kết luận được → ô 403 đỏ.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t gom && bun test test/okr-hoi-y-thuan.spec.ts -t bang-chung && bun test test/okr-hoi-y.spec.ts -t ket-luan"`

---

### Task 8: Công bố, kết quả, «Tôi hiểu vì sao», chốt pha chu kỳ

**independent: false** (cần 7) · phục vụ E8, E9 (AC-7, AC-8)

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts` (tách lõi `createObjective` L567 thành `taoMucTieuTrongTx(tx, userId, input): Promise<{ id; canhBao }>` — `createObjective` gọi nó sau `assertSuaDonVi`; `setCyclePhase` L360 thêm: rời `lap-ke-hoach` khi có `OkrHoiY` của chu kỳ với `congBoLuc` null → `BadRequestException(T.hoiY.conHoiYChuaCongBo(ten))`)
- Modify: `apps/api/src/okr/okr-hoi-y.service.ts`, `okr-hoi-y.contracts.ts`, `okr.router.ts`, `okr-config.ts`, `apps/api/test/okr-hoi-y.spec.ts`, `vai-chi-okr.spec.ts`

**Interfaces:**
- Consumes: `lyDoChuaCongBo`, `ketQuaBanTruoc` (Task 3); `taoMucTieuTrongTx`, `kiemTranMucTieu`, `program`.
- Produces: `congBo(userId, { hoiYId }) → { mucTieuIds: string[]; canhBao: string | null }`; `hieuViSao(userId, { hoiYId }) → { ok: true }`; `hoiY` điền `ketQua` (khi `da-cong-bo`: `ketQuaBanTruoc`, `vietBoi`, danh sách chủ đề chọn kèm `objectiveId`) và `cuaToi.y[i]` gồm `{ chuDe, ketLuan, lyDo, objectiveId, hanhTrinh: { gopLuc: createdAt; vaoChuDeLuc: ganLuc; ketLuanLuc: congBoLuc } }`; `quyen.lyDoChuaCongBo` từ `lyDoChuaCongBo`.

- [ ] **Step 1: Bài đỏ** — `describe("cong-bo")` bảng 9 ca thiếu E8 (mỗi ca: `quyen.lyDoChuaCongBo` so `toEqual`, `congBo` 400 câu riêng, đếm không đổi); ca đủ (ba mục tiêu `toEqual` tập, nối, vết); lần hai 400; ca song song hai `congBo` (Review Focus); chế độ cảnh báo; `setCyclePhase` trước và sau; ca lối ra (hạ vai P, đổi người chọn, người mới công bố); ca người góp đã rời trước công bố (Review Focus: ý vẫn đếm ở bằng chứng). `describe("ket-qua")` E9 phần dịch vụ.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Tách `taoMucTieuTrongTx`** — di chuyển thân giao dịch hiện tại, giữ nguyên hành vi; `bun run test -- "cd apps/api && bun test test/okr.spec.ts"` xanh trước khi đi tiếp.
- [ ] **Step 4: `congBo`** — một `db.$transaction`: `FOR UPDATE` hàng `OkrHoiY`; người gọi là người chọn và còn quản trị; `congBoLuc` null; chu kỳ `lap-ke-hoach`; tính `lyDoChuaCongBo` từ dữ liệu trong giao dịch — khác rỗng thì 400 với câu của mã đầu; mỗi chủ đề chọn: `taoMucTieuTrongTx(tx, userId, { cycleId, unit: { level: "onehub" }, ownerUserId: nguoiChon, kind: "cam-ket", title: cauMucTieu, whyNow: lyDo, participantIds: [] })`, ghi `objectiveId`, sửa `after` vết `tao` để có `tuHoiY` (truyền qua tham số `vetThem` của `taoMucTieuTrongTx`); `congBoLuc = now()`; vết `cong-bo-hoi-y` `after = { hoiYId, soMucTieu }`. `hieuViSao`: `da-cong-bo`, người gọi có ≥ 1 ý, `createMany skipDuplicates` với `luc = now()`.
- [ ] **Step 5: Router** `congBo`, `hieuViSao` (POST); `trpc:generate`; tập ghim. Chạy xanh.
- [ ] **Step 6: Commit, phá-thử** — tạo mục tiêu ngoài giao dịch rồi lỗi ở chủ đề thứ ba → ca «đếm không đổi» đỏ in số mục tiêu mồ côi; giữ luật «không đổi người chọn sau niêm phong» → ca lối ra đỏ in `daNiemPhong`.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t cong-bo && bun test test/okr-hoi-y-thuan.spec.ts -t giu-them-bo && bun test test/okr-hoi-y.spec.ts -t ket-qua && bun test test/okr.spec.ts"`

---

### Task 9: Độ phủ theo đơn vị và số truy vấn cố định

**independent: false** (cần 8) · phục vụ E11 (AC-10), và đóng ma trận E4 (thủ tục đọc thứ ba)

**Files:** `apps/api/src/okr/okr-hoi-y.service.ts`, `okr.router.ts`, `apps/api/test/okr-hoi-y.spec.ts`, `apps/api/test/okr-hoi-y-hieu-nang.spec.ts` (khuôn `okr-toan-canh-hieu-nang.spec.ts`), `vai-chi-okr.spec.ts`

**Interfaces:**
- Consumes: `doPhu` (Task 3); `ToChucService.tree()` (qua `OkrAccessService.quyen().cay` như `OkrXemService.cayGon`).
- Produces: `hoiYDoPhu(userId, { hoiYId }) → { cot: { ngay: string; nhan: string }[]; hang: { id; nhan; loai; cha: string | null; giaTri: (number | null)[] }[] }` — cột là từng ngày VN từ `createdAt` tới `min(hanLuc, now)`; thủ tục `okr.hoiYDoPhu` (GET).

- [ ] **Step 1: Bài đỏ** — `describe("do-phu")` dữ liệu gieo qua thủ tục thật bằng đồng hồ tiêm (hai ngày, ca biên 16:59 và 17:00 UTC), so ma trận viết trước; quét mọi thủ tục đọc bởi quản trị: không khoá `chuaGop` hay mảng mã người không góp. `okr-hoi-y-hieu-nang.spec.ts`: đếm truy vấn Prisma (`$on("query")` như bài toàn cảnh) với 5 và 50 phòng ban → bằng nhau. Mở rộng ma trận E4 sang `hoiYDoPhu`, tổng 108 ô; tập thủ tục vai «chỉ OKR» so `toEqual` danh sách cũ + 17 thủ tục mới.
- [ ] **Step 2–4:** chạy đỏ; dịch vụ: ba truy vấn cố định (lần hỏi ý, cây, `okrY` nhóm theo tác giả lấy `min(createdAt)`) rồi `doPhu`; router, `trpc:generate`. Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — mẫu số gồm người chọn → hàng gốc 12/22 đỏ; truy vấn trong vòng lặp đơn vị → bài hiệu năng đỏ in hai số đếm.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y-thuan.spec.ts -t do-phu && bun test test/okr-hoi-y.spec.ts -t do-phu && bun test test/okr-hoi-y-hieu-nang.spec.ts && bun test test/okr-hoi-y.spec.ts -t ten-va-so && bun test test/vai-chi-okr.spec.ts"`

---

### Task 10: Nhắc buổi sáng — «hỏi ý đang chờ bạn góp», «đã công bố»

**independent: false** (cần 5, 8) · phục vụ E10 (AC-9)

**Files:**
- Modify: `packages/db/src/okr-nhac.ts` (hai nhánh `viecOkr`: `{ loai: "okr-hoi-y-gop", hoiYId, nhan: string /* tên chu kỳ */, hanLuc: string }`, `{ loai: "okr-hoi-y-cong-bo", hoiYId, nhan: string }`; `KHOA_MUC_OKR`; hàm `viecHoiY(db, now, userIds?)` gọi trong `viecOkrCanNhac` L469)
- Modify: `packages/db/src/onboarding-nhac.ts` (`THU_TU_NHAC`: `okr-hoi-y-gop` ngay sau `okr-cap-nhat`, `okr-hoi-y-cong-bo` sau `okr-ghi-nhan`), `packages/validation/src/nhac-ke-hoach.ts` (`mucNhac` hai nhánh)
- Modify: `apps/agent/agent/lib/tin-nhac.ts` (`noiDungOkr` L68: «Công ty đang hỏi ý cho mục tiêu <nhan> — hạn <giờ VN>», «Mục tiêu <nhan> đã công bố — xem ý của bạn đi đâu»), `apps/agent/agent/lib/nhac-ke-hoach.ts` (`duongMo` L113: `<APP_URL>/<slug>/okr/hoi-y`), `apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx` (`ICON_VIEC` hai loại)
- Modify: `apps/api/test/okr-hoi-y.spec.ts` (`describe("nhac")`), `apps/agent/test/okr-nhac.integration.spec.ts` (`describe("hoi-y")`)

- [ ] **Step 1: Bài đỏ** — `nhac` E10 qua `okr.viecCuaToi` của từng người (tập người có mục so `toEqual`); ca người đã rời trước công bố không có mục «đã công bố» (Review Focus). Tích hợp agent: đồng hồ 08:31 giờ VN, tin của A có đúng một dòng hỏi ý với tên chu kỳ và đường mở.
- [ ] **Step 2–4:** chạy đỏ; `viecHoiY`: lần hỏi ý có `trangThaiHoiY === "dang-mo"` → mọi thành viên còn hiệu lực (trừ người chọn) chưa có `okrY`; `congBoLuc` trong cửa sổ `cuaSo` → người có `okrY`, còn là thành viên. Sửa đủ bảy chỗ; `bun run check-types` (bắt `THU_TU_DU`). Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — sinh `okr-hoi-y-gop` cho cả người đã góp → tập `{A, O}` đỏ in tập nhận.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t nhac && cd ../agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts -t hoi-y" && bun run check-types`

---

### Task 11: `packages/ui` — timeline, scrollspy, chú giải heatmap, thanh lưu có danh sách, thanh tab OKR

**independent: true** · phục vụ E14, E12, E15, E20 (phần giao diện)

**Files:**
- Install: `@reui/timeline`, `@reui/scrollspy` vào `packages/ui/src/components/reui/` — `cd packages/ui && bun run ui:add @reui/timeline --dry-run`, rồi thật, cùng cho `scrollspy`; bốn chỗ sửa của `docs/reui.md` (import `cn` từ `@crm/ui/lib/utils` và gỡ gói `cn`; xoá chú thích; icon Carbon qua `@crm/ui/components/icon`; màu và góc theo thang)
- Modify: `packages/ui/src/components/heatmap.tsx` (prop tuỳ chọn `legend?: { cao: string; trong: string }` thay chữ cứng ở `msg.heatmap`; mặc định giữ chữ cũ cho màn toàn cảnh), `packages/ui/src/lib/messages.ts`
- Modify: `packages/ui/src/components/save-bar.tsx` (biến thể `items?: { id: string; label: ReactNode; href: string }[]` — danh sách liên kết nhiều dòng, gập được ở < md, vai `status` thay `alert`)
- Modify: `apps/app/app/(app)/[slug]/okr/thanh-tab.tsx` (tab `hoi-y` → `/okr/hoi-y`; vùng cuộn ngang, `scrollIntoView({ inline: "nearest" })` tab đang đứng khi gắn; huy hiệu từ prop `nhanHoiY: "moi" | number | null`; công cụ cùng hàng ở ≥ md), `okr/layout.tsx` (prefetch `okr.hoiYNhan` với chu kỳ đang chọn, truyền huy hiệu)
- Create/Modify: `packages/ui/test/heatmap.dom.tsx`, `packages/ui/test/save-bar.dom.tsx` (bài DOM), `apps/app/test/okr-thanh-tab.dom.tsx`

- [ ] **Step 1: Bài DOM đỏ** — heatmap với `legend` in đúng chữ truyền vào, không có chữ «KR»; `SaveBar` với ba mục in ba liên kết `href="#…"`, `role="status"`; thanh tab: `nhanHoiY="moi"` → huy hiệu «Mới», `2` → «2», `null` → không huy hiệu; năm tab.
- [ ] **Step 2–4:** chạy đỏ; cài và sửa; chạy xanh; `bun run check-types`, `bun run lint`, `bun run lint:slop`.
- [ ] **Step 5: Commit, phá-thử** — thanh tab luôn hiện huy hiệu → ca `null` đỏ.

Verify per-task: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/heatmap.dom.tsx ./test/save-bar.dom.tsx && cd ../../apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-thanh-tab.dom.tsx && cd ../.. && bun run check-types`

---

### Task 12: Màn «Hỏi ý» — góp, gom, kết luận, kết quả, sheet mở

**independent: false** (cần 9, 11) · phục vụ E14, E12–E13, E15–E16 (AC-11, AC-12)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/hoi-y/page.tsx` (server: `requireSession`, `getServerTrpc`, prefetch `okr.hoiY`, `okr.hoiYDoPhu`, `okr.cycles`, `org.tree`; `<HydrateClient>`), `hoi-y.tsx` (client: chọn khối theo `trangThai` và `quyen`), `dai-moc.tsx` (dải mốc — `Timeline` ngang), `khoi-gop.tsx`, `khoi-y-dong-nghiep.tsx`, `khoi-do-phu.tsx`, `khoi-ban-truoc.tsx`, `khoi-gom.tsx`, `khoi-ket-luan.tsx` (ba cột ≥ lg với `Scrollspy`, `SaveBar items` ở < lg), `khoi-ket-qua.tsx` (hành trình — `Timeline` dọc), `sheet-mo-hoi-y.tsx`
- Create: `apps/app/lib/messages/okr-hoi-y.ts`; `apps/app/test/okr-hoi-y.dom.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (khoá sheet mở), `apps/app/lib/trpc/cache.ts` (làm mới `okr.hoiY`, `okr.hoiYNhan`, `okr.hoiYDoPhu` sau mỗi ghi), `okr/thanh-tab.tsx` (`TAB`, `DUONG`)

**Interfaces:**
- Consumes: mọi thủ tục Task 4–9; `StatCard`, `StatGroup` (`@crm/ui/components/stat-card`, `dashboard`), `Heatmap` (`legend`), `SaveBar` (`items`), `Timeline`, `Scrollspy` (Task 11), `Item`, `Field`, `Textarea`, `Toggle`, `ToggleGroup`, `Select`, `DropdownMenu`, `Checkbox`, `Collapsible`, `Sheet`, `ConfirmDialog`, `Empty`, `Skeleton`, `Badge`.
- Produces: các khối nhận dữ liệu đã hoàn tất (thuần hiển thị) để bài DOM dựng thẳng; bản mẫu `apps/app/app/proto/_modules/dot-hoi-y-tuong-okr/` là bố cục chuẩn.

- [ ] **Step 1: Bài DOM đỏ** — chín trạng thái × chín phần tử riêng (ma trận 9 × 9 viết trước, `data-trang-thai`); ô soạn 9 ký tự → `FieldError` câu ghim, mutation không gọi; đủ 3 ý → ô soạn vắng; thanh công bố in đúng `lyDoChuaCongBo` thành liên kết có `href` trỏ id thẻ có trong DOM, «Công bố» `disabled`; dòng đếm; thanh chọn nhiều vắng khi 0, «2 ý đã chọn» khi 2; 12 ý đồng nghiệp → 10 + «Hiện thêm 2 ý»; lý do 900 ký tự hiện đủ; ý có `<b>x</b>` in nguyên văn (Review Focus); tab huy hiệu.
- [ ] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-hoi-y.dom.tsx`.
- [ ] **Step 3: Dựng** theo bản mẫu, dữ liệu thật; khối gom theo bố cục `wishlist-1`; kết quả theo `review-3` + `c-timeline-3`; dải mốc theo `c-timeline-12`; mục lục theo `c-scrollspy-1`; sheet «Mở hỏi ý» trên URL, «Huỷ» bọc `SheetClose`, hạn bằng `DatePicker` + ô giờ; chữ ở `okr-hoi-y.ts`; chữ người nhập `translate="no"`.
- [ ] **Step 4: Chạy xanh**; `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- [ ] **Step 5: Commit, phá-thử** — thanh công bố bật nút khi còn thiếu → ca `chon-chua-du` đỏ in trạng thái nút.

Verify per-task: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-hoi-y.dom.tsx && cd ../.. && bun run check-types && bun run build`

---

### Task 13: Bộ OKR mẫu — chu kỳ năm kế và một lần hỏi ý đang gom

**independent: false** (cần 8) · phục vụ E17 (AC-13)

**Files:**
- Modify: `apps/api/scripts/okr-mau/cong-ty.json` (chu kỳ `nam-ke` ở `lap-ke-hoach`; khối `hoiY`: người chọn `le-hai-dang`, bốn câu viết trước, khoảng 30 ý của 23–27 người mẫu ở cả ba bộ phận gồm ≥ 3 người vai «chỉ OKR», 12 lượt đồng ý, bốn chủ đề (hai kết luận), một ý lạ, năm ý chưa gom), `khuon.ts` (khuôn Zod cho khối mới), `nap.ts` (`napBoOkrMau` gọi `napHoiYMau`; `xoaBoOkrMau` L607 xoá sáu bảng theo thứ tự khoá ngoại), `apps/api/scripts/okr-mau/nap-hoi-y.ts` (mới — ghi qua `OkrHoiYService` với đồng hồ tiêm, không chèn bảng tay; `idMau` cho mọi mã)
- Modify: `apps/api/test/okr-mau-san.ts` (`lamSachOkr` TRUNCATE thêm sáu bảng; danh sách bảng đếm rút từ DMMF), `apps/api/test/okr-mau.spec.ts` (`describe("hoi-y")`)

- [ ] **Step 1: Bài đỏ** — E17 đủ bảng khai, nạp lại, xoá có hàng ngoài bộ mẫu.
- [ ] **Step 2–4:** chạy đỏ; nạp, xoá; `bun run okr:mau` trên máy dev rồi mở `/okr/hoi-y` với chu kỳ năm kế — thấy đang gom. Chạy xanh.
- [ ] **Step 5: Commit, phá-thử** — lệnh xoá bỏ bước xoá `okrYDongY` → ca xoá đỏ in bảng còn hàng.

Verify per-task: `bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t hoi-y"`

---

### Task 14: Đường đo, phép đo màn, soi mã, tài liệu

**independent: false** (cần tất cả) · phục vụ E12, E13, E15, E16, E18, E20, E21 (AC-11, AC-12, AC-14, AC-15)

**Files:**
- Create: `_acceptance/dot-hoi-y-tuong-okr/rang/ty-le-hoi-y.sql` (chỉ SELECT và SET; `current_setting('okr.hoi_y')`, `current_setting('okr.hoi_y_truoc', true)`; mẫu số theo thành viên còn hiệu lực lúc chạy, trừ người chọn; cửa sổ hiểu nửa mở), `ty-le.mjs` (khuôn `canh-kr-okr/rang/ty-le.mjs`: gieo qua thủ tục thật với đồng hồ tiêm, so `toEqual` E18, `--chieu-do` ba bản sao SQL), `man-hoi-y.mjs` (khuôn `canh-kr-okr/rang/man-canh-kr.mjs`: cảnh cây, phiên đo, các bước E12 và E15, so DB E13 và E16, ghi phản hồi mạng qua CDP, ảnh vào `evidence/`, `--chieu-do`), `soi-ma.mjs` (`--ca thiet-ke` như E20: `design-gate.mjs --mode static` từng `.tsx` mới, `Huỷ` bọc `SheetClose`, không chú thích, không `Record<string, unknown>`, khoá chữ vi/en, đếm chỗ trả ý và bản viết trước = đếm lời gọi `chieuYChoNguoiXem`, `docBanTruoc`, tám mục `CONTEXT.md`, không chuỗi «đợt hỏi»)
- Modify: `docs/api.md` (mục «Hỏi ý mục tiêu» dưới OKR: bảng, quyền, luật đọc một chỗ, công bố, chốt pha, đồng hồ tiêm), `docs/agent.md` (hai loại mục nhắc), `docs/plan/lo-trinh-okr.md` (dòng 11)

- [ ] **Step 1:** viết bốn tệp đo; chạy từng cái với `--chieu-do` trước để thấy đỏ đúng thông điệp, rồi chạy thật thấy xanh.
- [ ] **Step 2:** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dot-hoi-y-tuong-okr/rang/man-hoi-y.mjs"`; soát ảnh 390 và 1440 bằng mắt.
- [ ] **Step 3:** năm lệnh chứng của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- [ ] **Step 4:** commit; contract sang `status: implemented`; S4.

Verify per-task: `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dot-hoi-y-tuong-okr/rang/ty-le.mjs" && bun _acceptance/dot-hoi-y-tuong-okr/rang/soi-ma.mjs --ca thiet-ke && bun run test && bun run build`
