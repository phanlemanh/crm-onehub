# Việc chung (DA1) — Kế hoạch thi công

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người dùng giao một **Việc** gắn với thoả thuận, công ty, cá nhân hay kế hoạch 30 ngày; người thực hiện thấy nó ở màn «Việc của tôi», ở khối «Việc» đầu thẻ Hoạt động của bản ghi, ở Tổng quan, và được nhắc buổi sáng (Zalo/Slack, «xong n»). Quyền xem P3 thu hẹp, đồ thị năm trạng thái có kiểm quyền, cột đo `roiChuaLamLuc` cho ngưỡng 80%, thước chỉ đọc cho hai số của Cổng Đáng.

**Architecture:** Bốn bảng mới (`viec`, `viecGan`, `viecTheoDoi`, `viecVet`) trong `packages/db`. Mọi luật thuần (đồ thị trạng thái, quyền, điều kiện xem, khuôn vết Zod, lời) ở **một** module `packages/db/src/viec.ts`; mọi lệnh ghi ở **một** module `packages/db/src/viec-ghi.ts` (nhận `tx`, ném `LoiViec` có tên) — API, Tác nhân («xong n») và bộ gieo mẫu cùng gọi nó. API thêm module Nest `apps/api/src/viec` (router mỏng `PhamViDoiTacMiddleware`, service đổi `LoiViec` sang `HttpException`). Nhắc buổi sáng thêm ba loại vào bộ gom `onboarding-nhac.ts`, lọc vai bằng `tapDoiTac` sẵn có. App thêm màn `/[slug]/viec`, khung `?record=viec:<id>`, khối «Việc» trong `Timeline`, loại «Việc» trong ô soạn.

**Tech Stack:** Prisma 7 + PostgreSQL · NestJS + nestjs-trpc (tRPC v11, cầu REST) · Zod 4 · Bun test (tích hợp với kho thử `crm_<id>_test`, DOM với happy-dom) · Next.js App Router + TanStack Query + nuqs · `@crm/ui` (shadcn, ReUI) · eve agent (Zalo/Slack).

**Spec:**
- Thiết kế đã duyệt: `docs/superpowers/specs/2026-10-13-viec-chung-design.md`
- Hợp đồng 15 tiêu chí: `_acceptance/viec-chung/contract.md` (status `approved`, Mạnh 13/10)
- 23 phép đo: `_acceptance/viec-chung/evals.yaml`, lệnh ở `_acceptance/config.yaml` dòng 1561–1579 và 2471–2473 (`vc_*`)

## Đã đọc trước khi viết

`AGENTS.md`, `CLAUDE.md`, `docs/design.md` (nạp sẵn); thiết kế, hợp đồng, evals ở trên; `docs/api.md` (mục «tRPC is the data surface», «One organization» — đổi vai, «Deleting a record is archive first, purge later», «Logging»); `docs/agent.md` mục «Nhắc buổi sáng»; `docs/vong-doi.md`; skill `.agents/skills/nestjs-trpc/SKILL.md` (router là provider, CLI sinh `AppRouter` — chạy `trpc:generate`), `.agents/skills/nuqs/SKILL.md` (parser có kiểu, `withDefault`, `NuqsTestingAdapter`). Mã thật: `schema.prisma`, `onboarding-buoc.ts`, `vai-doi-tac.ts`, `onboarding-nhac.ts`, `nhac-ke-hoach.ts` (validation), `onboarding-ghi.ts`, `onboarding.contracts.ts`, `onboarding-config.ts`, `workspace.service.ts`, `workspace-config.ts`, `activities/*`, `dashboard.service.ts` + contracts, `companies|contacts|deals.service.ts` (`purge`), các spec mẫu của DA0a, `nhac-ke-hoach.ts`/`tin-nhac.ts`/`tra-loi-nhac.ts`/`zalo-nhan.ts` của agent, các thành phần app và test DOM mẫu, bản mẫu `app/proto/_modules/viec-chung`, các răng `ro-vai-chi-okr.mjs`, `dot-bien.mjs`, `ban-sao.mjs`, `man.mjs`, `man-lib.mjs`, `messages-guard.spec.ts` (luật kho chuỗi).

## Global Constraints

Luật kho, chép nguyên — mỗi task chịu ràng buộc này:

- **Không viết chú thích trong mã.** Không với mã mới, không với mã sửa.
- **Hằng số theo khu, một tệp config.** Mọi số và lời có thể chỉnh của Việc nằm trong `VIEC` ở `packages/db/src/viec.ts` (`as const`). Không số rời ở đầu tệp dùng nó. API, agent, app đọc từ đó (app đọc lời màn từ `apps/app/lib/messages/viec.ts`).
- **Parse ở biên, không truyền `Record<string, unknown>`.** Cột `truoc`/`sau` (Json) của `viecVet` đọc bằng `parseVetViec` (union Zod `vetViec`) ngay lúc đọc; không ép kiểu `unknown`. Ném lỗi có lời khi không đọc được, không nuốt thành mảng rỗng.
- **`/packages/ui` là nguồn giao diện.** Chỉ dùng thành phần `@crm/ui`; không đổi màu/góc/khoảng cách bằng `className`; theo bảng «Dấu hiệu vẽ tay» và «Nếp màn trong app» của `docs/design.md`; giao diện thật theo bản mẫu đã duyệt `apps/app/app/proto/_modules/viec-chung/index.tsx`.
- **Trí khôn ở `apps/agent`, không ở API.** API không gọi dịch vụ ngoài; nhắc và «xong n» sống ở agent.
- **Một `.env` ở gốc.** Lượt này không thêm biến môi trường.
- **Giờ `Asia/Ho_Chi_Minh`.** «Hôm nay», «quá hạn», «sắp hạn», cửa sổ thước đều theo ngày VN (`dauNgayVN`, `soNgayVN`, `NHAC.muiGio`). Hạn lưu ở nửa đêm UTC của ngày chọn (như `ngayLich` của bước), đọc ra bằng `ngayHan`.
- **Migration mốc UTC thật.** Tạo bằng `cd packages/db && bun run db:migrate --create-only --name viec_chung` (thư mục mang giờ UTC lúc chạy). Ngay trước MỖI lần đẩy: `git fetch origin onehub && git ls-tree --name-only origin/onehub packages/db/prisma/migrations/ | tail -3`; có migration mới hơn của mình thì `git mv` thư mục sang mốc `date -u +%Y%m%d%H%M%S` mới.
- **Không chạm vùng DA0b.** Không sửa `kiemNguoiNhanViec` của `apps/api/src/onboarding/onboarding-ghi.ts`, đường mở lại kế hoạch (`datDong`), bỏ «xong» bước (`setStepDone`, `datBuocXong`). DA1 chỉ sửa thân `transferPreview`, `transferWork`, `demViecDangGiu`, `xoaTheoDoiCua` của tệp đó. Bản `kiemNguoiNhanViec` cho Việc là hàm riêng trong `packages/db/src/viec-ghi.ts`.
- **Giữ nguyên chuỗi mà hồ sơ đã ký đột biến.** `_acceptance/va-lo-ro-vai-chi-okr/rang/dot-bien.mjs` thay đúng một lần các chuỗi: `if (viec.keHoach > 0 || viec.buoc > 0) {`, `theoDoiDaXoa = await xoaTheoDoiCua(tx, target.userId);`, `if (!docDuocDoiTac(input.role)) {` (workspace.service.ts), `guiCua(k, tapDoiTac, chon.now)` (onboarding-nhac.ts), `if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {` (onboarding-ghi.ts). Mỗi chuỗi phải còn **đúng một lần** trong tệp của nó. `_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs:69` ghim nhãn menu «Chuyển việc 30 ngày…» — không đổi nhãn đó trên màn.
- **Không `git add -A` / `-u`.** Mỗi commit `git add <tệp cụ thể>`.
- **Năm lệnh chứng**, từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

Năm chỗ dễ cắn nhất mà 23 phép đo chưa đo; mỗi dòng có một test nằm trong task sở hữu:

1. **Ranh nửa đêm VN của «quá hạn».** Hạn lưu `D 00:00Z` (= 07:00 VN); lúc 00:30 VN ngày D+1 việc hạn D phải quá hạn, việc hạn D+1 thì chưa. Test `vc-cua-toi: ranh nua dem` trong `apps/api/test/viec-cua-toi.spec.ts` — Task 6.
2. **Người rời vừa giao vừa thực hiện cùng một việc (tự giao).** `chuyenViecTrongGiaoDich` phải đổi cả hai cột và ghi **một** vết, không hai. Test `vc-chuyen: tu giao` trong `apps/api/test/viec-chuyen.spec.ts` — Task 7.
3. **`nguoiTheoDoiIds` trùng nhau hoặc chứa chính người thực hiện.** Tạo việc không được ném lỗi unique và chỉ ghi mỗi người một hàng theo dõi. Test `vc-tao: theo doi trung` trong `apps/api/test/viec-ghi.spec.ts` — Task 2.
4. **Một dòng vết hỏng khuôn trong kho.** `viec.lichSu` phải trả lỗi có lời «Vết việc <id> không đọc được» thay vì mảng rỗng hay bỏ dòng. Test `vc-sua: vet hong` trong `apps/api/test/viec-ghi.spec.ts` — Task 4.
5. **Bấm «Giao việc» hai lần liên tiếp.** Ô soạn chỉ gọi `viec.create` một lần. Test `vc-o-soan-giao: bam hai lan` trong `apps/app/test/viec-o-soan.dom.tsx` — Task 10.

## Cấu trúc tệp

| Tệp | Tạo / Sửa | Trách nhiệm |
| --- | --- | --- |
| `packages/db/prisma/schema.prisma` | Sửa | enum `TrangThaiViec`, bốn model, quan hệ ngược ở `User`, `Company`, `Contact`, `Deal`, `OnboardingPlan` |
| `packages/db/prisma/migrations/<UTC>_viec_chung/migration.sql` | Tạo | bảng, chỉ mục, ràng buộc «đúng một bản ghi» |
| `packages/db/src/viec.ts` | Tạo | `VIEC` (config + lời), `TRANG_THAI_*`, `DO_THI`, `quyenDoi`, `hanhDong`, `vaiCua`, `dieuKienXemViec`, `dieuKienNhom`, `dieuKienViecMoCua`, `demViecMoCua`, `vetViec`/`parseVetViec`, `CHON_VIEC`/`CHON_GAN`, `banGhiCua`, `docViecCuaBanGhi`, `ngayHan`, `LOAI_NHAC_VIEC` |
| `packages/db/src/viec-ghi.ts` | Tạo | `LoiViec`, `kiemNguoiNhanViec`, `taoViec`, `doiTrangThai`, `suaViec`, `doiNguoiThucHien`, `ganBanGhi`, `goBanGhi`, `themTheoDoi`, `boTheoDoi`, `coLichSu`, `xoaViec`, `chuyenViecTrongGiaoDich`, `goTheoDoiCuaNguoi`, `ghiGoDoXoa` |
| `packages/db/src/viec-gieo.ts` | Tạo | `gieoViecMau` cho `db:seed`, qua `viec-ghi` |
| `packages/db/scripts/require-local-db.ts` | Sửa | tách `loiKhoXa` dùng lại được, phần chạy giữ hành vi |
| `packages/db/prisma/seed.ts` | Sửa | gọi `gieoViecMau` |
| `packages/db/src/onboarding-nhac.ts` | Sửa | ba loại nhắc việc, nguồn việc lọc `tapDoiTac` |
| `packages/db/package.json` | Sửa | exports `./viec`, `./viec-ghi`, `./viec-gieo` |
| `packages/validation/src/viec.ts`, `package.json` | Tạo / Sửa | tái xuất phần thuần cho app/agent |
| `packages/validation/src/nhac-ke-hoach.ts` | Sửa | nhánh `mucNhac` cho việc |
| `apps/api/src/viec/viec.contracts.ts` | Tạo | Zod vào/ra |
| `apps/api/src/viec/viec.service.ts` | Tạo | đọc, gọi `viec-ghi`, dịch `LoiViec` |
| `apps/api/src/viec/viec.router.ts`, `viec.module.ts` | Tạo | router `viec`, REST |
| `apps/api/src/app.module.ts` | Sửa | đăng ký `ViecModule` |
| `apps/api/src/generated/server.ts` | Sinh lại | `bun run trpc:generate` |
| `apps/api/src/onboarding/onboarding-ghi.ts`, `onboarding.contracts.ts` | Sửa | `demViecDangGiu`, `xoaTheoDoiCua`, `transferPreview`, `transferWork`, `transferOutput.viec` |
| `apps/api/src/workspace/workspace.service.ts`, `workspace-config.ts` | Sửa | 409 có số việc, lời `conViec` |
| `apps/api/src/dashboard/dashboard.service.ts`, `dashboard.contracts.ts` | Sửa | `viecQuaHan`, `quaHan.viec` cộng việc |
| `apps/api/src/{deals,contacts,companies}/*.service.ts` | Sửa | `ghiGoDoXoa` trong `purge` |
| `apps/api/test/support/viec-gieo.ts` | Tạo | dựng app, phiên, gọi tRPC, gieo |
| `apps/api/test/viec-ghi.spec.ts` | Tạo | E1, E2, E3, E4, E12 |
| `apps/api/test/viec-quyen.spec.ts` | Tạo | E5, E6 |
| `apps/api/test/viec-cua-toi.spec.ts` | Tạo | E7 |
| `apps/api/test/viec-chuyen.spec.ts` | Tạo | E11 |
| `apps/api/test/viec-do-nguong.spec.ts` | Tạo | E14 |
| `packages/db/test/viec.spec.ts` | Tạo | đồ thị 13/20, `hanhDong`, `parseVetViec` |
| `packages/db/test/viec-gieo.spec.ts` | Tạo | E14b |
| `apps/agent/agent/lib/nhac-ke-hoach.ts`, `tin-nhac.ts`, `tra-loi-nhac.ts`, `zalo-config.ts` | Sửa | mã mục, đường mở, dòng tin, «xong n» của việc, cách ly lỗi một mục |
| `apps/agent/test/nhac-viec.integration.spec.ts` | Tạo | E8, E9, E10 |
| `apps/app/lib/messages/viec.ts` | Tạo | lời màn (en/vi) |
| `apps/app/lib/messages/crm.ts` | Sửa | bỏ ba khoá của «Việc cần làm» trong ô soạn |
| `apps/app/lib/messages/khung-ung-dung.ts`, `ke-hoach-noi.ts` | Sửa | nhãn thanh trái, dòng số việc trong hộp chuyển |
| `apps/app/components/viec/*.tsx` | Tạo | `trang-thai-viec`, `bang-viec`, `o-soan-viec`, `giao-viec`, `khoi-viec`, `khung-viec`, `lich-su-viec`, `dong-viec-tong-quan` |
| `apps/app/components/crm/timeline/activity-composer.tsx`, `timeline.tsx` | Sửa | loại «Việc», khối «Việc» |
| `apps/app/components/crm/record-sheet/record-stack.ts`, `record-sheet-host.tsx` | Sửa | loại khung `viec` |
| `apps/app/lib/record-href.ts`, `search-param-keys.ts`, `khung-dieu-huong.ts`, `pham-vi-man.ts`, `trpc/cache.ts` | Sửa | đường, tham số, thanh trái, proxy, làm mới |
| `apps/app/components/app-icon-rail.tsx` | Sửa | icon mục `viec` |
| `apps/app/app/(app)/[slug]/viec/page.tsx`, `viec-cua-toi.tsx` | Tạo | màn Việc của tôi |
| `apps/app/app/(app)/[slug]/dashboard-summary.tsx` | Sửa | dòng việc quá hạn |
| `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx` | Sửa | số việc |
| `apps/app/test/viec-o-soan.dom.tsx`, `viec-cua-toi.dom.tsx`, `viec-khung.dom.tsx`, `viec-chuyen-hop.dom.tsx` | Tạo | E1b, E7b, E7c, E4b, E11b |
| `apps/app/test/khung-dieu-huong.spec.ts`, `han-viec.dom.tsx`, `dieu-phoi-va.dom.tsx`, `may-nhac.dom.tsx` | Sửa | 12 mục thanh trái; `viecQuaHan: []` trong dữ liệu giả Tổng quan |
| `_acceptance/viec-chung/rang/do-nguong.mjs` | Tạo | thước chỉ đọc |
| `_acceptance/viec-chung/rang/man.mjs` | Tạo | phép đo màn trên bản chạy thật |
| `_acceptance/viec-chung/rang/dot-bien.mjs` | Tạo | 13 cặp đột biến |
| `CONTEXT.md`, `docs/api.md`, `docs/agent.md` | Sửa | từ điển và luật |

Thứ tự phụ thuộc: Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 18; Task 17 (tài liệu) độc lập.

---

## Task 1: Bảng, migration và luật thuần `viec.ts`

**Files:**
- Modify: `packages/db/prisma/schema.prisma` — `User` chèn trước `@@unique([email])` (sau dòng 100); `Company` sau dòng 410 (`onboardingPlans`); `Contact` sau dòng 477 (`onboardingEnrollments`); `Deal` sau dòng 1041 (`fieldValues`); `OnboardingPlan` sau dòng 1862 (`okrViecKr`); enum và bốn model mới ở cuối tệp (sau dòng 2918).
- Create: `packages/db/prisma/migrations/<UTC>_viec_chung/migration.sql`
- Create: `packages/db/src/viec.ts`
- Modify: `packages/db/package.json` (exports, cạnh `"./vai-doi-tac"` dòng 70)
- Create: `packages/validation/src/viec.ts`; Modify: `packages/validation/package.json` (exports, sau `"./vai-workspace"` dòng 59)
- Test: `packages/db/test/viec.spec.ts`

**Interfaces:**
- Produces (`@crm/db/viec`):
  - `TRANG_THAI_VIEC: readonly ["CHUA_LAM","DANG_LAM","CHO_DANH_GIA","XONG","HUY"]`, `TRANG_THAI_MO`, `TRANG_THAI_KHEP`, `DICH_ROI_CHUA_LAM`
  - `type QuyenDoi = "G" | "GT"`; `DO_THI: Record<TrangThaiViec, Partial<Record<TrangThaiViec, QuyenDoi>>>`
  - `type VaiTrongViec = { giao: boolean; thucHien: boolean; theoDoi: boolean }`; `vaiCua(v: { nguoiGiaoId: string; nguoiThucHienId: string; theoDoi: { userId: string }[] }, userId: string): VaiTrongViec`
  - `quyenDoi(nguon: TrangThaiViec, den: TrangThaiViec, vai: VaiTrongViec): "duoc" | "khong-hop-le" | "khong-quyen"`; `dichDuoc(nguon, vai): TrangThaiViec[]`; `laMoLai(nguon, den): boolean`; `hanhDong(nguon, den): string`
  - `VIEC` (config + `thongDiep`)
  - `NHOM_VIEC`, `type NhomViec`, `NGUON_VIEC`, `type NguonViec`, `LOAI_VET_VIEC`, `LOAI_BAN_GHI`, `type BanGhiGan = { loai: LoaiBanGhi; id: string }`, `cotGan(b)`, `dieuKienGanCua(b): Prisma.ViecGanWhereInput`
  - `dieuKienXemViec(userId: string): Prisma.ViecWhereInput`; `dieuKienNhom(nhom: NhomViec, userId: string): Prisma.ViecWhereInput`; `dieuKienViecMoCua(userId: string): Prisma.ViecWhereInput`; `demViecMoCua(tx: DbGhi, userId: string): Promise<number>`
  - `vetViec` (Zod discriminated union theo `loai`), `type VetViec`, `type NguoiVet = { id: string; ten: string }`, `type BanGhiVet = { loai: LoaiBanGhi; id: string; ten: string }`, `parseVetViec(hang: { id: string; loai: string; truoc: unknown; sau: unknown }): VetViec`
  - `CHON_GAN`, `CHON_VIEC`, `type HangGan`, `type HangViec`, `banGhiCua(g: HangGan): BanGhiVet`, `tenKeHoach(congTy: string): string`, `ngayHan(d: Date): string`, `theoHan(a, b): number`, `docViecCuaBanGhi(db: DbGhi, b: BanGhiGan, userId: string): Promise<HangViec[]>`
  - `LOAI_NHAC_VIEC = ["viec-qua-han","viec-sap-han","viec-cho-danh-gia"] as const`
- Phục vụ evals: E3, E6 (nền); E2 (khử trùng ở `docViecCuaBanGhi`)
- independent: false

- [ ] **Step 1: Viết test đỏ** — `packages/db/test/viec.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import {
	DO_THI,
	dichDuoc,
	hanhDong,
	parseVetViec,
	quyenDoi,
	TRANG_THAI_VIEC,
	VIEC,
} from "../src/viec";

const BANG = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
} as const;

const GIAO = { giao: true, thucHien: false, theoDoi: false };
const LAM = { giao: false, thucHien: true, theoDoi: false };
const THEO = { giao: false, thucHien: false, theoDoi: true };

describe("viec thuan", () => {
	it("do thi: 20 cap khac nhau, 13 hop le, khop bang thiet ke", () => {
		const cap = TRANG_THAI_VIEC.flatMap((n) =>
			TRANG_THAI_VIEC.filter((d) => d !== n).map((d) => [n, d] as const),
		);
		expect(cap).toHaveLength(20);
		const hopLe = cap.filter(([n, d]) => DO_THI[n][d] !== undefined);
		expect(hopLe).toHaveLength(13);
		for (const [n, d] of cap) {
			const mong = (BANG[n] as Record<string, string | undefined>)[d];
			expect(DO_THI[n][d], `${n}-${d}`).toBe(mong);
		}
	});

	it("quyenDoi: nguoi theo doi khong doi duoc o nao, cap sai la khong-hop-le", () => {
		for (const n of TRANG_THAI_VIEC)
			for (const d of TRANG_THAI_VIEC) {
				if (n === d) continue;
				expect(quyenDoi(n, d, THEO)).toBe(
					DO_THI[n][d] === undefined ? "khong-hop-le" : "khong-quyen",
				);
			}
		expect(quyenDoi("CHO_DANH_GIA", "XONG", LAM)).toBe("khong-quyen");
		expect(quyenDoi("CHUA_LAM", "XONG", LAM)).toBe("duoc");
		expect(quyenDoi("CHUA_LAM", "HUY", GIAO)).toBe("duoc");
		expect(dichDuoc("DANG_LAM", LAM)).toEqual([
			"CHUA_LAM",
			"CHO_DANH_GIA",
			"XONG",
		]);
	});

	it("hanhDong: moi cap hop le co cau lam rieng", () => {
		expect(hanhDong("CHUA_LAM", "DANG_LAM")).toBe(VIEC.lam.batDau);
		expect(hanhDong("XONG", "DANG_LAM")).toBe(VIEC.lam.lamLai);
		expect(hanhDong("HUY", "CHUA_LAM")).toBe(VIEC.lam.moLai);
		expect(VIEC.thongDiep.chiNguoiGiao(VIEC.lam.huy)).toBe(
			"Chỉ người giao được huỷ việc.",
		);
		expect(VIEC.thongDiep.khongChuyenDuoc("XONG", "CHUA_LAM")).toBe(
			"Không chuyển được việc từ «Xong» sang «Chưa làm».",
		);
	});

	it("parseVetViec: dung khuon thi doc, sai khuon thi nem co ma vet", () => {
		const dung = parseVetViec({
			id: "v1",
			loai: "doi-trang-thai",
			truoc: { trangThai: "CHUA_LAM" },
			sau: { trangThai: "DANG_LAM" },
		});
		expect(dung.loai).toBe("doi-trang-thai");
		expect(() =>
			parseVetViec({ id: "v2", loai: "doi-han", truoc: 3, sau: null }),
		).toThrow("Vết việc v2 không đọc được");
	});
});
```

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd packages/db && bun test test/viec.spec.ts"` → đỏ vì `../src/viec` chưa có.

- [ ] **Step 3: Thêm bảng vào `schema.prisma`.** Chèn vào `User` (trước `@@unique([email])`):

```prisma
  viecGiao     Viec[]        @relation("ViecNguoiGiao")
  viecThucHien Viec[]        @relation("ViecNguoiThucHien")
  viecTao      Viec[]        @relation("ViecTaoBoi")
  viecTheoDoi  ViecTheoDoi[]
  viecVet      ViecVet[]     @relation("ViecVetNguoi")
```

Vào `Company`, `Contact`, `Deal`, `OnboardingPlan` (đúng vị trí ở mục Files) một dòng:

```prisma
  viecGan ViecGan[]
```

Cuối tệp:

```prisma
enum TrangThaiViec {
  CHUA_LAM
  DANG_LAM
  CHO_DANH_GIA
  XONG
  HUY
}

model Viec {
  id              String        @id @default(cuid())
  tieuDe          String
  moTa            String?
  trangThai       TrangThaiViec @default(CHUA_LAM)
  hanNgay         DateTime?
  nguoiGiaoId     String
  nguoiGiao       User          @relation("ViecNguoiGiao", fields: [nguoiGiaoId], references: [id], onDelete: Restrict)
  nguoiThucHienId String
  nguoiThucHien   User          @relation("ViecNguoiThucHien", fields: [nguoiThucHienId], references: [id], onDelete: Restrict)
  taoBoiId        String
  taoBoi          User          @relation("ViecTaoBoi", fields: [taoBoiId], references: [id], onDelete: Restrict)
  taoLuc          DateTime      @default(now())
  doiLuc          DateTime      @updatedAt
  roiChuaLamLuc   DateTime?
  khepLuc         DateTime?
  gan             ViecGan[]
  theoDoi         ViecTheoDoi[]
  vet             ViecVet[]

  @@index([nguoiThucHienId, trangThai, hanNgay])
  @@index([nguoiGiaoId, trangThai])
  @@index([taoLuc])
  @@map("viec")
}

model ViecGan {
  id        String          @id @default(cuid())
  viecId    String
  viec      Viec            @relation(fields: [viecId], references: [id], onDelete: Cascade)
  companyId String?
  company   Company?        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  contactId String?
  contact   Contact?        @relation(fields: [contactId], references: [id], onDelete: Cascade)
  dealId    String?
  deal      Deal?           @relation(fields: [dealId], references: [id], onDelete: Cascade)
  planId    String?
  plan      OnboardingPlan? @relation(fields: [planId], references: [id], onDelete: Cascade)
  taoLuc    DateTime        @default(now())

  @@unique([viecId, companyId])
  @@unique([viecId, contactId])
  @@unique([viecId, dealId])
  @@unique([viecId, planId])
  @@index([companyId])
  @@index([contactId])
  @@index([dealId])
  @@index([planId])
  @@map("viecGan")
}

model ViecTheoDoi {
  id     String   @id @default(cuid())
  viecId String
  viec   Viec     @relation(fields: [viecId], references: [id], onDelete: Cascade)
  userId String
  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  taoLuc DateTime @default(now())

  @@unique([viecId, userId])
  @@index([userId])
  @@map("viecTheoDoi")
}

model ViecVet {
  id      String   @id @default(cuid())
  viecId  String
  viec    Viec     @relation(fields: [viecId], references: [id], onDelete: Cascade)
  luc     DateTime @default(now())
  nguoiId String?
  nguoi   User?    @relation("ViecVetNguoi", fields: [nguoiId], references: [id], onDelete: SetNull)
  loai    String
  truoc   Json?
  sau     Json?
  nguon   String

  @@index([viecId, luc])
  @@index([loai])
  @@map("viecVet")
}
```

- [ ] **Step 4: Sinh migration mốc UTC thật** — `cd packages/db && bun run db:migrate --create-only --name viec_chung` (chạy trên kho dev cục bộ; `require-local-db` chặn kho xa). Mở `migrations/<UTC>_viec_chung/migration.sql` vừa sinh, thêm cuối tệp:

```sql
ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_dung_mot_ban_ghi" CHECK (num_nonnulls("companyId", "contactId", "dealId", "planId") = 1);
```

Rồi `bun run db:migrate` để áp, `bun run db:generate`.

- [ ] **Step 5: Viết `packages/db/src/viec.ts`:**

```ts
import { z } from "zod";
import type { Prisma } from "./generated/prisma/client";
import { TrangThaiViec } from "./generated/prisma/enums";
import type { DbGhi } from "./zalo-lien-ket";

export const TRANG_THAI_VIEC = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
	TrangThaiViec.HUY,
] as const;

export const TRANG_THAI_MO: readonly TrangThaiViec[] = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
];

export const TRANG_THAI_KHEP: readonly TrangThaiViec[] = [
	TrangThaiViec.XONG,
	TrangThaiViec.HUY,
];

export const DICH_ROI_CHUA_LAM: readonly TrangThaiViec[] = [
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
];

export type QuyenDoi = "G" | "GT";

export const DO_THI: Record<
	TrangThaiViec,
	Partial<Record<TrangThaiViec, QuyenDoi>>
> = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
};

export const NHOM_VIEC = [
	"giao-cho-toi",
	"toi-giao",
	"dang-theo-doi",
] as const;

export type NhomViec = (typeof NHOM_VIEC)[number];

export const NGUON_VIEC = ["web", "zalo", "api", "chuyen-viec"] as const;

export type NguonViec = (typeof NGUON_VIEC)[number];

export const LOAI_VET_VIEC = [
	"tao",
	"doi-trang-thai",
	"doi-nguoi-thuc-hien",
	"doi-han",
	"doi-noi-dung",
	"gan",
	"go",
	"theo-doi",
	"bo-theo-doi",
	"chuyen-viec",
	"go-do-ban-ghi-xoa",
] as const;

export const LOAI_BAN_GHI = ["company", "contact", "deal", "plan"] as const;

export type LoaiBanGhi = (typeof LOAI_BAN_GHI)[number];

export const LOAI_NHAC_VIEC = [
	"viec-qua-han",
	"viec-sap-han",
	"viec-cho-danh-gia",
] as const;

export type LoaiNhacViec = (typeof LOAI_NHAC_VIEC)[number];

const NHAN = {
	CHUA_LAM: "Chưa làm",
	DANG_LAM: "Đang làm",
	CHO_DANH_GIA: "Chờ đánh giá",
	XONG: "Xong",
	HUY: "Huỷ",
} as const satisfies Record<TrangThaiViec, string>;

const TEN_LOAI = {
	company: "công ty",
	contact: "cá nhân",
	deal: "thoả thuận",
	plan: "kế hoạch 30 ngày",
} as const satisfies Record<LoaiBanGhi, string>;

export const VIEC = {
	tieuDeToiDa: 200,
	moTaToiDa: 4000,
	theoDoiToiDa: 20,
	tranKhep: 50,
	tranTongQuan: 10,
	soDongCho: 5,
	muiGio: "Asia/Ho_Chi_Minh",
	nhan: NHAN,
	lam: {
		batDau: "bắt đầu việc",
		lamLai: "trả việc để làm lại",
		moLai: "mở lại việc",
		veChuaLam: "đưa việc về «Chưa làm»",
		guiDanhGia: "gửi việc để đánh giá",
		xong: "đánh dấu xong",
		huy: "huỷ việc",
		sua: "sửa việc",
		doiNguoi: "đổi người thực hiện",
		gan: "gắn hay gỡ bản ghi",
		theoDoiKhac: "thêm hay bỏ người theo dõi khác",
		xoa: "xoá việc",
	},
	thongDiep: {
		khongCoViec: (id: string) => `Không có việc nào mang mã ${id}.`,
		khongChuyenDuoc: (nguon: TrangThaiViec, dich: TrangThaiViec) =>
			`Không chuyển được việc từ «${NHAN[nguon]}» sang «${NHAN[dich]}».`,
		chiNguoiGiao: (lam: string) => `Chỉ người giao được ${lam}.`,
		chiGiaoVaThucHien: (lam: string) =>
			`Chỉ người giao và người thực hiện được ${lam}.`,
		coLichSu: "Việc đã có lịch sử nên không xoá được — huỷ việc thay vì xoá.",
		khongPhaiThanhVien: (id: string) =>
			`Người ${id} không phải thành viên đang hoạt động.`,
		vaiChiOkr: (ten: string) =>
			`${ten} mang vai «chỉ OKR» — không nhận được việc gắn dữ liệu đối tác.`,
		khongCoBanGhi: (loai: LoaiBanGhi, id: string) =>
			`Không có ${TEN_LOAI[loai]} nào mang mã ${id}.`,
		dungMotBanGhi:
			"Chọn đúng một bản ghi: công ty, cá nhân, thoả thuận hoặc kế hoạch 30 ngày.",
		vetHong: (id: string, chiTiet: string) =>
			`Vết việc ${id} không đọc được: ${chiTiet}`,
		ganHong: (id: string) => `Hàng gắn ${id} không trỏ tới bản ghi nào.`,
	},
} as const;

export function hanhDong(nguon: TrangThaiViec, den: TrangThaiViec): string {
	if (den === TrangThaiViec.HUY) return VIEC.lam.huy;
	if (den === TrangThaiViec.XONG) return VIEC.lam.xong;
	if (den === TrangThaiViec.CHO_DANH_GIA) return VIEC.lam.guiDanhGia;
	if (den === TrangThaiViec.CHUA_LAM) {
		return nguon === TrangThaiViec.HUY ? VIEC.lam.moLai : VIEC.lam.veChuaLam;
	}
	return nguon === TrangThaiViec.CHUA_LAM ? VIEC.lam.batDau : VIEC.lam.lamLai;
}

export type VaiTrongViec = {
	giao: boolean;
	thucHien: boolean;
	theoDoi: boolean;
};

export function vaiCua(
	v: {
		nguoiGiaoId: string;
		nguoiThucHienId: string;
		theoDoi: { userId: string }[];
	},
	userId: string,
): VaiTrongViec {
	return {
		giao: v.nguoiGiaoId === userId,
		thucHien: v.nguoiThucHienId === userId,
		theoDoi: v.theoDoi.some((t) => t.userId === userId),
	};
}

export type KetQuyenDoi = "duoc" | "khong-hop-le" | "khong-quyen";

export function quyenDoi(
	nguon: TrangThaiViec,
	den: TrangThaiViec,
	vai: VaiTrongViec,
): KetQuyenDoi {
	const o = DO_THI[nguon][den];
	if (o === undefined) return "khong-hop-le";
	const duoc = o === "G" ? vai.giao : vai.giao || vai.thucHien;
	if (!duoc) return "khong-quyen";
	return "duoc";
}

export function dichDuoc(
	nguon: TrangThaiViec,
	vai: VaiTrongViec,
): TrangThaiViec[] {
	return TRANG_THAI_VIEC.filter((den) => quyenDoi(nguon, den, vai) === "duoc");
}

export function laMoLai(nguon: TrangThaiViec, den: TrangThaiViec): boolean {
	return (
		(nguon === TrangThaiViec.CHO_DANH_GIA ||
			TRANG_THAI_KHEP.includes(nguon)) &&
		TRANG_THAI_MO.includes(den)
	);
}

export type BanGhiGan = { loai: LoaiBanGhi; id: string };

export function cotGan(b: BanGhiGan): {
	companyId?: string;
	contactId?: string;
	dealId?: string;
	planId?: string;
} {
	switch (b.loai) {
		case "company":
			return { companyId: b.id };
		case "contact":
			return { contactId: b.id };
		case "deal":
			return { dealId: b.id };
		case "plan":
			return { planId: b.id };
	}
}

export function dieuKienGanCua(b: BanGhiGan): Prisma.ViecGanWhereInput {
	if (b.loai !== "company") return cotGan(b);
	return {
		OR: [
			{ companyId: b.id },
			{ deal: { companyId: b.id } },
			{ contact: { companyId: b.id } },
			{ plan: { companyId: b.id } },
		],
	};
}

export function dieuKienXemViec(userId: string): Prisma.ViecWhereInput {
	return {
		OR: [
			{ gan: { some: {} } },
			{ nguoiGiaoId: userId },
			{ nguoiThucHienId: userId },
			{ theoDoi: { some: { userId } } },
		],
	};
}

export function dieuKienNhom(
	nhom: NhomViec,
	userId: string,
): Prisma.ViecWhereInput {
	switch (nhom) {
		case "giao-cho-toi":
			return { nguoiThucHienId: userId };
		case "toi-giao":
			return { nguoiGiaoId: userId, nguoiThucHienId: { not: userId } };
		case "dang-theo-doi":
			return { theoDoi: { some: { userId } } };
	}
}

export function dieuKienViecMoCua(userId: string): Prisma.ViecWhereInput {
	return {
		trangThai: { in: [...TRANG_THAI_MO] },
		OR: [{ nguoiThucHienId: userId }, { nguoiGiaoId: userId }],
	};
}

export function demViecMoCua(tx: DbGhi, userId: string): Promise<number> {
	return tx.viec.count({ where: dieuKienViecMoCua(userId) });
}

const nguoiVet = z.object({ id: z.string(), ten: z.string() });

const banGhiVet = z.object({
	loai: z.enum(LOAI_BAN_GHI),
	id: z.string(),
	ten: z.string(),
});

const trangThaiVet = z.object({ trangThai: z.enum(TRANG_THAI_VIEC) });

const hanVet = z.object({ hanNgay: z.string().nullable() });

const noiDungVet = z.object({
	tieuDe: z.string(),
	moTa: z.string().nullable(),
});

const haiNguoiVet = z.object({ nguoiGiao: nguoiVet, nguoiThucHien: nguoiVet });

export const vetViec = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("tao"),
		truoc: z.null(),
		sau: z.object({
			tieuDe: z.string(),
			nguoiThucHien: nguoiVet,
			hanNgay: z.string().nullable(),
			banGhi: z.array(banGhiVet),
			nguoiTheoDoi: z.array(nguoiVet),
		}),
	}),
	z.object({
		loai: z.literal("doi-trang-thai"),
		truoc: trangThaiVet,
		sau: trangThaiVet,
	}),
	z.object({
		loai: z.literal("doi-nguoi-thuc-hien"),
		truoc: nguoiVet,
		sau: nguoiVet,
	}),
	z.object({ loai: z.literal("doi-han"), truoc: hanVet, sau: hanVet }),
	z.object({
		loai: z.literal("doi-noi-dung"),
		truoc: noiDungVet,
		sau: noiDungVet,
	}),
	z.object({ loai: z.literal("gan"), truoc: z.null(), sau: banGhiVet }),
	z.object({ loai: z.literal("go"), truoc: banGhiVet, sau: z.null() }),
	z.object({ loai: z.literal("theo-doi"), truoc: z.null(), sau: nguoiVet }),
	z.object({ loai: z.literal("bo-theo-doi"), truoc: nguoiVet, sau: z.null() }),
	z.object({
		loai: z.literal("chuyen-viec"),
		truoc: haiNguoiVet,
		sau: haiNguoiVet,
	}),
	z.object({
		loai: z.literal("go-do-ban-ghi-xoa"),
		truoc: banGhiVet,
		sau: z.object({ ten: z.string() }),
	}),
]);

export type VetViec = z.infer<typeof vetViec>;

export type NguoiVet = z.infer<typeof nguoiVet>;

export type BanGhiVet = z.infer<typeof banGhiVet>;

export function parseVetViec(hang: {
	id: string;
	loai: string;
	truoc: unknown;
	sau: unknown;
}): VetViec {
	const ket = vetViec.safeParse({
		loai: hang.loai,
		truoc: hang.truoc,
		sau: hang.sau,
	});
	if (!ket.success) {
		throw new Error(VIEC.thongDiep.vetHong(hang.id, ket.error.message));
	}
	return ket.data;
}

export const CHON_GAN = {
	id: true,
	viecId: true,
	companyId: true,
	contactId: true,
	dealId: true,
	planId: true,
	company: { select: { name: true } },
	contact: { select: { firstName: true, lastName: true } },
	deal: { select: { name: true } },
	plan: { select: { company: { select: { name: true } } } },
} as const satisfies Prisma.ViecGanSelect;

export type HangGan = Prisma.ViecGanGetPayload<{ select: typeof CHON_GAN }>;

const CHON_NGUOI = { select: { id: true, name: true, image: true } } as const;

export const CHON_VIEC = {
	id: true,
	tieuDe: true,
	moTa: true,
	trangThai: true,
	hanNgay: true,
	taoLuc: true,
	khepLuc: true,
	nguoiGiaoId: true,
	nguoiThucHienId: true,
	nguoiGiao: CHON_NGUOI,
	nguoiThucHien: CHON_NGUOI,
	theoDoi: {
		select: { userId: true, user: CHON_NGUOI },
		orderBy: { taoLuc: "asc" },
	},
	gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" } },
} as const satisfies Prisma.ViecSelect;

export type HangViec = Prisma.ViecGetPayload<{ select: typeof CHON_VIEC }>;

export function tenKeHoach(congTy: string): string {
	return `Kế hoạch 30 ngày · ${congTy}`;
}

export function banGhiCua(g: HangGan): BanGhiVet {
	if (g.companyId && g.company) {
		return { loai: "company", id: g.companyId, ten: g.company.name };
	}
	if (g.contactId && g.contact) {
		const ten = [g.contact.firstName, g.contact.lastName]
			.filter(Boolean)
			.join(" ");
		return { loai: "contact", id: g.contactId, ten };
	}
	if (g.dealId && g.deal) {
		return { loai: "deal", id: g.dealId, ten: g.deal.name };
	}
	if (g.planId && g.plan) {
		return {
			loai: "plan",
			id: g.planId,
			ten: tenKeHoach(g.plan.company.name),
		};
	}
	throw new Error(VIEC.thongDiep.ganHong(g.id));
}

export function ngayHan(d: Date): string {
	return d.toISOString().slice(0, 10);
}

export function theoHan(
	a: { hanNgay: Date | null; taoLuc: Date },
	b: { hanNgay: Date | null; taoLuc: Date },
): number {
	const ha = a.hanNgay?.getTime() ?? Number.POSITIVE_INFINITY;
	const hb = b.hanNgay?.getTime() ?? Number.POSITIVE_INFINITY;
	return ha - hb || a.taoLuc.getTime() - b.taoLuc.getTime();
}

export async function docViecCuaBanGhi(
	db: DbGhi,
	b: BanGhiGan,
	userId: string,
): Promise<HangViec[]> {
	const hang = await db.viecGan.findMany({
		where: { ...dieuKienGanCua(b), viec: dieuKienXemViec(userId) },
		select: { viec: { select: CHON_VIEC } },
		orderBy: { taoLuc: "asc" },
	});
	return [...new Map(hang.map((h) => [h.viec.id, h.viec])).values()];
}
```

`packages/db/package.json` thêm ba dòng exports (sau `"./vai-doi-tac"`): `"./viec": "./src/viec.ts"`, `"./viec-ghi": "./src/viec-ghi.ts"`, `"./viec-gieo": "./src/viec-gieo.ts"`.

`packages/validation/src/viec.ts`:

```ts
export {
	LOAI_BAN_GHI,
	LOAI_NHAC_VIEC,
	LOAI_VET_VIEC,
	NGUON_VIEC,
	NHOM_VIEC,
	type NhomViec,
	parseVetViec,
	TRANG_THAI_VIEC,
	type VetViec,
	VIEC,
	vetViec,
} from "@crm/db/viec";
```

(`viec.ts` chỉ nhập `zod`, enum sinh sẵn và kiểu — không chạm Prisma client — nên app phía trình duyệt đọc được qua `@crm/validation/viec`.)

`packages/validation/package.json` exports thêm `"./viec": "./src/viec.ts"`.

- [ ] **Step 6: Chạy xanh** — `bun run test -- "cd packages/db && bun test test/viec.spec.ts"` → 4 ca xanh. `cd packages/db && bunx tsc --noEmit` không lỗi.

- [ ] **Step 7: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/*_viec_chung/migration.sql packages/db/src/viec.ts packages/db/package.json packages/validation/src/viec.ts packages/validation/package.json packages/db/test/viec.spec.ts
git commit -m "feat(viec-chung): bốn bảng việc, đồ thị trạng thái và luật xem thuần"
```

---

## Task 2: Một chỗ ghi `viec-ghi.ts`, router `viec` — tạo, gắn, gỡ, khối của bản ghi

**Files:**
- Create: `packages/db/src/viec-ghi.ts`
- Create: `apps/api/src/viec/viec.contracts.ts`, `viec.service.ts`, `viec.router.ts`, `viec.module.ts`
- Modify: `apps/api/src/app.module.ts` (import cạnh dòng 19 `DashboardModule`; thêm `ViecModule,` sau dòng 79 `DashboardModule,`)
- Regenerate: `apps/api/src/generated/server.ts`
- Create: `apps/api/test/support/viec-gieo.ts`
- Test: `apps/api/test/viec-ghi.spec.ts` (describe `vc-tao`, `vc-gan`)

**Interfaces:**
- Consumes: mọi thứ của Task 1.
- Produces (`@crm/db/viec-ghi`):
  - `class LoiViec extends Error { readonly ma: "khong-thay" | "khong-hop-le" | "khong-quyen" | "nguoi-nhan" | "co-lich-su" | "ban-ghi" }`
  - `kiemNguoiNhanViec(tx: DbGhi, userId: string): Promise<NguoiVet>`
  - `taoViec(tx: DbGhi, input: TaoViecInput): Promise<{ id: string }>` với `TaoViecInput = { nguoiId: string; tieuDe: string; moTa?: string | null; hanNgay?: Date | null; nguoiThucHienId?: string; nguoiTheoDoiIds?: string[]; gan: BanGhiGan[]; nguon: NguonViec; now: Date }`
  - `ganBanGhi(tx, input: GhiBanGhiInput): Promise<void>`, `goBanGhi(tx, input: GhiBanGhiInput): Promise<void>` với `GhiBanGhiInput = DauGhi & { banGhi: BanGhiGan }`, `DauGhi = { viecId: string; nguoiId: string; nguon: NguonViec; now: Date }`
  - (khai sẵn để Task 3–8 dùng) `doiTrangThai`, `suaViec`, `doiNguoiThucHien`, `themTheoDoi`, `boTheoDoi`, `coLichSu`, `xoaViec`, `chuyenViecTrongGiaoDich`, `goTheoDoiCuaNguoi`, `ghiGoDoXoa` — viết đủ thân ở task này, test ở task sau.
- Produces (API): `ViecService` với `create(input, userId): Promise<{ id: string }>`, `get(id, userId): Promise<ViecChiTietOutput>`, `cuaBanGhi(input, userId): Promise<ViecCuaBanGhiOutput>`, `gan(input, userId)`, `go(input, userId)`; router alias `viec`, REST `POST /viec`, `GET /viec/{id}`, `GET /viec-theo-ban-ghi`, `POST /viec/{id}/gan`, `POST /viec/{id}/go`.
- Produces (test support): `batApp()`, `goi(app, ten, loai, input, userId): Promise<KetGoi>`, `nguoi(ten, vai)`, `thoaThuan(app, chuId, ten?)`, `keHoachCua(congTyId, chuId)`, `taoThu(input)`, `doiThu(viecId, nguoiId, den)`, `donViec()`.
- Phục vụ evals: E1, E2
- independent: false

- [ ] **Step 1: Viết hỗ trợ test** — `apps/api/test/support/viec-gieo.ts`:

```ts
import { spyOn } from "bun:test";
import { db, type TrangThaiViec } from "@crm/db";
import type { NguonViec } from "@crm/db/viec";
import { doiTrangThai, type TaoViecInput, taoViec } from "@crm/db/viec-ghi";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { BackfillService } from "../../src/backfill/backfill.service";
import { createApp } from "../../src/create-app";
import { type DauVao, dangNhap, datMatKhau, goiTrpc } from "../ma-tran-thu";
import {
	dichVu,
	gieoBoPhan,
	gieoCongTy,
	gieoThanhVien,
	token,
} from "./ke-hoach-gieo";

export type KetGoi = {
	status: number;
	code: string | null;
	message: string;
	data: unknown;
};

const cookie = new Map<string, string>();

export async function batApp(): Promise<NestExpressApplication> {
	const app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({
		started: false,
	});
	return app;
}

export async function cookieCua(userId: string): Promise<string> {
	const co = cookie.get(userId);
	if (co) return co;
	await db.user.update({
		where: { id: userId },
		data: { emailVerified: true },
	});
	const moi = await dangNhap(await datMatKhau(userId));
	cookie.set(userId, moi);
	return moi;
}

export async function goi(
	app: NestExpressApplication,
	ten: string,
	loai: "query" | "mutation",
	input: DauVao,
	userId: string,
): Promise<KetGoi> {
	const res = await goiTrpc(app, ten, loai, input, {
		cookie: await cookieCua(userId),
	});
	return {
		status: res.status,
		code: res.body?.error?.data?.code ?? null,
		message: String(res.body?.error?.message ?? ""),
		data: res.body?.result?.data,
	};
}

export function nguoi(
	ten: string,
	vai: "owner" | "admin" | "member" | "okr" = "member",
) {
	return gieoThanhVien(ten, vai);
}

export async function thoaThuan(
	app: NestExpressApplication,
	chuId: string,
	ten = "VC Cty",
) {
	const congTy = await goi(
		app,
		"companies.create",
		"mutation",
		{ name: `${token()} ${ten}` },
		chuId,
	);
	const congTyId = (congTy.data as { id: string }).id;
	const deal = await goi(
		app,
		"deals.create",
		"mutation",
		{ name: `${token()} Thoả thuận ${ten}`, companyId: congTyId, ownerId: chuId },
		chuId,
	);
	return { congTyId, dealId: (deal.data as { id: string }).id };
}

export async function keHoachCua(congTyId: string, chuId: string) {
	const bp = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: [
			{ label: "Buoc mot", departmentId: bp.id, position: 0, offsetDays: 0 },
		],
	});
	return dichVu().createFromTemplate({
		companyId: congTyId,
		templateId: khuon.id,
		startedAt: new Date("2026-10-12T00:00:00.000Z"),
		ownerId: chuId,
	});
}

export async function congTyRieng() {
	return gieoCongTy();
}

export function taoThu(
	input: Omit<TaoViecInput, "nguon" | "now"> & {
		nguon?: NguonViec;
		now?: Date;
	},
): Promise<{ id: string }> {
	return db.$transaction((tx) =>
		taoViec(tx, {
			...input,
			nguon: input.nguon ?? "web",
			now: input.now ?? new Date(),
		}),
	);
}

export async function doiThu(
	viecId: string,
	nguoiId: string,
	den: TrangThaiViec,
	now = new Date(),
	nguon: NguonViec = "web",
): Promise<void> {
	await db.$transaction((tx) =>
		doiTrangThai(tx, { viecId, nguoiId, den, nguon, now }),
	);
}

export function demVet(viecId: string, loai?: string) {
	return db.viecVet.count({ where: { viecId, loai } });
}

export async function donViec(): Promise<void> {
	await db.viec.deleteMany({
		where: { taoBoi: { email: { endsWith: "@thu.test" } } },
	});
}
```

`ke-hoach-gieo.ts` đã xuất `token`, `dichVu`, `gieoBoPhan`, `gieoCongTy`, `gieoThanhVien` — không sửa.

- [ ] **Step 2: Viết test đỏ** — `apps/api/test/viec-ghi.spec.ts` (phần `vc-tao`, `vc-gan`; Task 3, 4, 8 nối thêm describe vào cùng tệp):

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { viecCuaBanGhiOutput } from "../src/viec/viec.contracts";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	demVet,
	donViec,
	goi,
	keHoachCua,
	nguoi,
	thoaThuan,
} from "./support/viec-gieo";

const NGAY_MS = 24 * 60 * 60 * 1000;
const MA_TEST_MS = 120_000;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

function ngayMaiVN(): string {
	return ngayVN(new Date(Date.now() + NGAY_MS));
}

async function khoi(
	userId: string,
	banGhi: Record<string, string>,
): Promise<string[]> {
	const r = await goi(app, "viec.cuaBanGhi", "query", banGhi, userId);
	const ra = viecCuaBanGhiOutput.parse(r.data);
	return ra.mo.map((v) => v.id);
}

describe("vc-tao", () => {
	test(
		"vc-tao: A giao cho B, hạn mai, W theo dõi, gắn D — một hàng, một vết tạo web, khối D và C có việc",
		async () => {
			const a = await nguoi("vc-a", "member");
			const b = await nguoi("vc-b", "member");
			const w = await nguoi("vc-w", "member");
			const { congTyId, dealId } = await thoaThuan(app, a.id);
			const khac = await thoaThuan(app, a.id, "VC Cty khac");
			const tieuDe = `vc-tao ${Date.now()}`;
			const r = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe,
					dealId,
					nguoiThucHienId: b.id,
					hanNgay: ngayMaiVN(),
					nguoiTheoDoiIds: [w.id],
				},
				a.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const hang = await db.viec.findMany({ where: { tieuDe } });
			if (hang.length !== 1) {
				throw new Error(`vc: tao viec khong ra dung mot hang ${hang.length}`);
			}
			const v = hang[0];
			if (!v) throw new Error("vc: tao viec khong ra dung mot hang 0");
			if (v.trangThai !== "CHUA_LAM") {
				throw new Error("vc: tao viec sai truong trangThai");
			}
			if (v.nguoiGiaoId !== a.id) {
				throw new Error("vc: tao viec sai truong nguoiGiaoId");
			}
			if (v.nguoiThucHienId !== b.id) {
				throw new Error("vc: tao viec sai truong nguoiThucHienId");
			}
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: v.id } });
			if (!theo.some((t) => t.userId === w.id)) {
				throw new Error("vc: thieu nguoi theo doi");
			}
			const gan = await db.viecGan.findMany({ where: { viecId: v.id } });
			if (gan.length !== 1 || gan[0]?.dealId !== dealId) {
				throw new Error("vc: gan sai");
			}
			const vet = await db.viecVet.findMany({ where: { viecId: v.id } });
			if (
				vet.length !== 1 ||
				vet[0]?.loai !== "tao" ||
				vet[0]?.nguoiId !== a.id ||
				vet[0]?.nguon !== "web"
			) {
				throw new Error("vc: vet tao sai");
			}
			for (const [ten, banGhi] of [
				["deal", { dealId }],
				["company", { companyId: congTyId }],
			] as const) {
				if (!(await khoi(a.id, banGhi)).includes(v.id)) {
					throw new Error(`vc: khoi viec ${ten} thieu viec`);
				}
			}
			if ((await khoi(a.id, { dealId: khac.dealId })).includes(v.id)) {
				throw new Error("vc: viec lot sang ban ghi khac");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-tao: không chọn người thực hiện thì người thực hiện là người giao",
		async () => {
			const a = await nguoi("vc-a2", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tieuDe = `vc-tao-mac-dinh ${Date.now()}`;
			await goi(app, "viec.create", "mutation", { tieuDe, dealId }, a.id);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			if (v.nguoiThucHienId !== a.id) {
				throw new Error("vc: nguoi thuc hien mac dinh sai");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-tao: theo doi trung — nguoiTheoDoiIds lặp và chứa người thực hiện chỉ ra mỗi người một hàng",
		async () => {
			const a = await nguoi("vc-a3", "member");
			const b = await nguoi("vc-b3", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tieuDe = `vc-tao-trung ${Date.now()}`;
			const r = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe,
					dealId,
					nguoiThucHienId: b.id,
					nguoiTheoDoiIds: [b.id, a.id, a.id],
				},
				a.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: v.id } });
			expect(theo.map((t) => t.userId).sort()).toEqual([a.id, b.id].sort());
		},
		MA_TEST_MS,
	);
});

describe("vc-gan", () => {
	test(
		"vc-gan: gắn thêm kế hoạch cùng công ty — vẫn một việc, công ty hiện một lần; gỡ D thì công ty vẫn còn qua kế hoạch",
		async () => {
			const a = await nguoi("vc-gan-a", "member");
			const b = await nguoi("vc-gan-b", "member");
			const { congTyId, dealId } = await thoaThuan(app, a.id);
			const plan = await keHoachCua(congTyId, a.id);
			const tieuDe = `vc-gan ${Date.now()}`;
			await goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe, dealId, nguoiThucHienId: b.id },
				a.id,
			);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			const g = await goi(
				app,
				"viec.gan",
				"mutation",
				{ id: v.id, planId: plan.id },
				a.id,
			);
			expect(g.status, JSON.stringify(g)).toBe(200);
			const so = await db.viec.count({ where: { tieuDe } });
			if (so !== 1) throw new Error(`vc: gan them nhan ban viec ${so}`);
			if (!(await khoi(a.id, { planId: plan.id })).includes(v.id)) {
				throw new Error("vc: ke hoach khong thay viec");
			}
			const lan = (await khoi(a.id, { companyId: congTyId })).filter(
				(id) => id === v.id,
			).length;
			if (lan !== 1) throw new Error(`vc: cong ty hien viec ${lan} lan`);
			if ((await demVet(v.id, "gan")) !== 1) {
				throw new Error("vc: thieu vet gan");
			}
			await goi(app, "viec.go", "mutation", { id: v.id, dealId }, a.id);
			if ((await khoi(a.id, { dealId })).includes(v.id)) {
				throw new Error("vc: go xong van hien");
			}
			if (!(await khoi(a.id, { companyId: congTyId })).includes(v.id)) {
				throw new Error("vc: cong ty mat viec khi con gan ke hoach");
			}
			if ((await demVet(v.id, "go")) !== 1) {
				throw new Error("vc: thieu vet go");
			}
		},
		MA_TEST_MS,
	);
});
```

- [ ] **Step 3: Chạy thấy đỏ** — `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts -t vc-tao"` → đỏ (`viec.contracts` chưa có, `viec.create` 404).

- [ ] **Step 4: Viết `packages/db/src/viec-ghi.ts`:**

```ts
import { Prisma } from "./generated/prisma/client";
import { TrangThaiViec } from "./generated/prisma/enums";
import { docDuocDoiTac } from "./vai-doi-tac";
import {
	type BanGhiGan,
	type BanGhiVet,
	banGhiCua,
	CHON_GAN,
	cotGan,
	DICH_ROI_CHUA_LAM,
	DO_THI,
	dieuKienViecMoCua,
	dieuKienXemViec,
	hanhDong,
	laMoLai,
	type NguoiVet,
	type NguonViec,
	ngayHan,
	quyenDoi,
	TRANG_THAI_KHEP,
	tenKeHoach,
	type VetViec,
	VIEC,
	vaiCua,
} from "./viec";
import { WORKSPACE_ID } from "./workspace";
import type { DbGhi } from "./zalo-lien-ket";

export type MaLoiViec =
	| "khong-thay"
	| "khong-hop-le"
	| "khong-quyen"
	| "nguoi-nhan"
	| "co-lich-su"
	| "ban-ghi";

export class LoiViec extends Error {
	constructor(
		readonly ma: MaLoiViec,
		message: string,
	) {
		super(message);
		this.name = "LoiViec";
	}
}

export type DauGhi = {
	viecId: string;
	nguoiId: string;
	nguon: NguonViec;
	now: Date;
};

export type TaoViecInput = {
	nguoiId: string;
	tieuDe: string;
	moTa?: string | null;
	hanNgay?: Date | null;
	nguoiThucHienId?: string;
	nguoiTheoDoiIds?: string[];
	gan: BanGhiGan[];
	nguon: NguonViec;
	now: Date;
};

export type DoiTrangThaiInput = DauGhi & { den: TrangThaiViec };

export type SuaViecInput = DauGhi & {
	tieuDe?: string;
	moTa?: string | null;
	hanNgay?: Date | null;
};

export type DoiNguoiInput = DauGhi & { nguoiThucHienId: string };

export type GhiBanGhiInput = DauGhi & { banGhi: BanGhiGan };

export type TheoDoiInput = DauGhi & { userId: string };

const CHON_GHI = {
	id: true,
	tieuDe: true,
	moTa: true,
	trangThai: true,
	hanNgay: true,
	nguoiGiaoId: true,
	nguoiThucHienId: true,
	roiChuaLamLuc: true,
	nguoiGiao: { select: { id: true, name: true } },
	nguoiThucHien: { select: { id: true, name: true } },
	theoDoi: { select: { userId: true } },
	_count: { select: { gan: true } },
} as const satisfies Prisma.ViecSelect;

type ViecGhi = Prisma.ViecGetPayload<{ select: typeof CHON_GHI }>;

function nguoiCua(n: { id: string; name: string }): NguoiVet {
	return { id: n.id, ten: n.name };
}

async function ghiVet(
	tx: DbGhi,
	dau: { viecId: string; nguoiId: string | null; nguon: NguonViec; luc: Date },
	vet: VetViec,
): Promise<void> {
	await tx.viecVet.create({
		data: {
			viecId: dau.viecId,
			nguoiId: dau.nguoiId,
			nguon: dau.nguon,
			luc: dau.luc,
			loai: vet.loai,
			truoc: vet.truoc ?? Prisma.DbNull,
			sau: vet.sau ?? Prisma.DbNull,
		},
	});
}

function dauVet(input: DauGhi) {
	return {
		viecId: input.viecId,
		nguoiId: input.nguoiId,
		nguon: input.nguon,
		luc: input.now,
	};
}

async function docViecGhi(
	tx: DbGhi,
	viecId: string,
	nguoiId: string,
): Promise<ViecGhi> {
	await tx.$queryRaw`SELECT id FROM viec WHERE id = ${viecId} FOR UPDATE`;
	const viec = await tx.viec.findFirst({
		where: { AND: [{ id: viecId }, dieuKienXemViec(nguoiId)] },
		select: CHON_GHI,
	});
	if (viec === null) {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(viecId));
	}
	return viec;
}

export async function kiemNguoiNhanViec(
	tx: DbGhi,
	userId: string,
): Promise<NguoiVet> {
	const nguoi = await tx.user.findFirst({
		where: { id: userId, members: { some: { organizationId: WORKSPACE_ID } } },
		select: {
			id: true,
			name: true,
			members: {
				where: { organizationId: WORKSPACE_ID },
				select: { role: true },
			},
		},
	});
	if (nguoi === null) {
		throw new LoiViec(
			"nguoi-nhan",
			VIEC.thongDiep.khongPhaiThanhVien(userId),
		);
	}
	if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {
		throw new LoiViec("nguoi-nhan", VIEC.thongDiep.vaiChiOkr(nguoi.name));
	}
	return { id: nguoi.id, ten: nguoi.name };
}

async function docBanGhi(tx: DbGhi, b: BanGhiGan): Promise<BanGhiVet> {
	const loi = () =>
		new LoiViec("ban-ghi", VIEC.thongDiep.khongCoBanGhi(b.loai, b.id));
	switch (b.loai) {
		case "company": {
			const r = await tx.company.findUnique({
				where: { id: b.id },
				select: { name: true },
			});
			if (!r) throw loi();
			return { ...b, ten: r.name };
		}
		case "contact": {
			const r = await tx.contact.findUnique({
				where: { id: b.id },
				select: { firstName: true, lastName: true },
			});
			if (!r) throw loi();
			return {
				...b,
				ten: [r.firstName, r.lastName].filter(Boolean).join(" "),
			};
		}
		case "deal": {
			const r = await tx.deal.findUnique({
				where: { id: b.id },
				select: { name: true },
			});
			if (!r) throw loi();
			return { ...b, ten: r.name };
		}
		case "plan": {
			const r = await tx.onboardingPlan.findUnique({
				where: { id: b.id },
				select: { company: { select: { name: true } } },
			});
			if (!r) throw loi();
			return { ...b, ten: tenKeHoach(r.company.name) };
		}
	}
}

export async function taoViec(
	tx: DbGhi,
	input: TaoViecInput,
): Promise<{ id: string }> {
	const nguoiThucHien = await kiemNguoiNhanViec(
		tx,
		input.nguoiThucHienId ?? input.nguoiId,
	);
	const nguoiTheoDoi: NguoiVet[] = [];
	for (const id of new Set(input.nguoiTheoDoiIds ?? [])) {
		nguoiTheoDoi.push(await kiemNguoiNhanViec(tx, id));
	}
	const ganDung: BanGhiVet[] = [];
	for (const b of input.gan) ganDung.push(await docBanGhi(tx, b));
	const viec = await tx.viec.create({
		data: {
			tieuDe: input.tieuDe,
			moTa: input.moTa ?? null,
			hanNgay: input.hanNgay ?? null,
			nguoiGiaoId: input.nguoiId,
			nguoiThucHienId: nguoiThucHien.id,
			taoBoiId: input.nguoiId,
			taoLuc: input.now,
		},
		select: { id: true },
	});
	for (const b of ganDung) {
		await tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(b) } });
	}
	for (const n of nguoiTheoDoi) {
		await tx.viecTheoDoi.create({ data: { viecId: viec.id, userId: n.id } });
	}
	await ghiVet(
		tx,
		{
			viecId: viec.id,
			nguoiId: input.nguoiId,
			nguon: input.nguon,
			luc: input.now,
		},
		{
			loai: "tao",
			truoc: null,
			sau: {
				tieuDe: input.tieuDe,
				nguoiThucHien,
				hanNgay: input.hanNgay ? ngayHan(input.hanNgay) : null,
				banGhi: ganDung,
				nguoiTheoDoi,
			},
		},
	);
	return viec;
}

export async function doiTrangThai(
	tx: DbGhi,
	input: DoiTrangThaiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	const vai = vaiCua(viec, input.nguoiId);
	const ket = quyenDoi(viec.trangThai, input.den, vai);
	if (ket === "khong-hop-le") {
		throw new LoiViec(
			"khong-hop-le",
			VIEC.thongDiep.khongChuyenDuoc(viec.trangThai, input.den),
		);
	}
	if (ket === "khong-quyen") {
		const lam = hanhDong(viec.trangThai, input.den);
		const chiG = DO_THI[viec.trangThai][input.den] === "G";
		throw new LoiViec(
			"khong-quyen",
			chiG
				? VIEC.thongDiep.chiNguoiGiao(lam)
				: VIEC.thongDiep.chiGiaoVaThucHien(lam),
		);
	}
	if (laMoLai(viec.trangThai, input.den) && viec._count.gan > 0) {
		await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);
	}
	const roiChuaLam =
		viec.roiChuaLamLuc === null &&
		viec.nguoiThucHienId === input.nguoiId &&
		viec.trangThai === TrangThaiViec.CHUA_LAM &&
		DICH_ROI_CHUA_LAM.includes(input.den);
	await tx.viec.update({
		where: { id: viec.id },
		data: {
			trangThai: input.den,
			khepLuc: TRANG_THAI_KHEP.includes(input.den) ? input.now : null,
			roiChuaLamLuc: roiChuaLam ? input.now : undefined,
		},
	});
	await ghiVet(tx, dauVet(input), {
		loai: "doi-trang-thai",
		truoc: { trangThai: viec.trangThai },
		sau: { trangThai: input.den },
	});
}

export async function suaViec(tx: DbGhi, input: SuaViecInput): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	const vai = vaiCua(viec, input.nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec(
			"khong-quyen",
			VIEC.thongDiep.chiGiaoVaThucHien(VIEC.lam.sua),
		);
	}
	const tieuDe = input.tieuDe ?? viec.tieuDe;
	const moTa = input.moTa === undefined ? viec.moTa : input.moTa;
	const hanCu = viec.hanNgay ? ngayHan(viec.hanNgay) : null;
	const hanMoi =
		input.hanNgay === undefined
			? hanCu
			: input.hanNgay
				? ngayHan(input.hanNgay)
				: null;
	const doiNoiDung = tieuDe !== viec.tieuDe || moTa !== viec.moTa;
	if (!doiNoiDung && hanMoi === hanCu) return;
	await tx.viec.update({
		where: { id: viec.id },
		data: { tieuDe, moTa, hanNgay: input.hanNgay },
	});
	if (doiNoiDung) {
		await ghiVet(tx, dauVet(input), {
			loai: "doi-noi-dung",
			truoc: { tieuDe: viec.tieuDe, moTa: viec.moTa },
			sau: { tieuDe, moTa },
		});
	}
	if (hanMoi !== hanCu) {
		await ghiVet(tx, dauVet(input), {
			loai: "doi-han",
			truoc: { hanNgay: hanCu },
			sau: { hanNgay: hanMoi },
		});
	}
}

export async function doiNguoiThucHien(
	tx: DbGhi,
	input: DoiNguoiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (!vaiCua(viec, input.nguoiId).giao) {
		throw new LoiViec(
			"khong-quyen",
			VIEC.thongDiep.chiNguoiGiao(VIEC.lam.doiNguoi),
		);
	}
	if (viec.nguoiThucHienId === input.nguoiThucHienId) return;
	const moi = await kiemNguoiNhanViec(tx, input.nguoiThucHienId);
	await tx.viec.update({
		where: { id: viec.id },
		data: { nguoiThucHienId: moi.id },
	});
	await ghiVet(tx, dauVet(input), {
		loai: "doi-nguoi-thuc-hien",
		truoc: nguoiCua(viec.nguoiThucHien),
		sau: moi,
	});
}

function canGiaoHayLam(viec: ViecGhi, nguoiId: string, lam: string): void {
	const vai = vaiCua(viec, nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec("khong-quyen", VIEC.thongDiep.chiGiaoVaThucHien(lam));
	}
}

export async function ganBanGhi(
	tx: DbGhi,
	input: GhiBanGhiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	canGiaoHayLam(viec, input.nguoiId, VIEC.lam.gan);
	const ban = await docBanGhi(tx, input.banGhi);
	const co = await tx.viecGan.findFirst({
		where: { viecId: viec.id, ...cotGan(input.banGhi) },
	});
	if (co) return;
	await tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(input.banGhi) } });
	await ghiVet(tx, dauVet(input), { loai: "gan", truoc: null, sau: ban });
}

export async function goBanGhi(
	tx: DbGhi,
	input: GhiBanGhiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	canGiaoHayLam(viec, input.nguoiId, VIEC.lam.gan);
	const co = await tx.viecGan.findFirst({
		where: { viecId: viec.id, ...cotGan(input.banGhi) },
		select: CHON_GAN,
	});
	if (!co) return;
	await tx.viecGan.delete({ where: { id: co.id } });
	await ghiVet(tx, dauVet(input), {
		loai: "go",
		truoc: banGhiCua(co),
		sau: null,
	});
}

export async function themTheoDoi(
	tx: DbGhi,
	input: TheoDoiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (input.userId !== input.nguoiId) {
		canGiaoHayLam(viec, input.nguoiId, VIEC.lam.theoDoiKhac);
	}
	if (viec.theoDoi.some((t) => t.userId === input.userId)) return;
	const nguoi = await kiemNguoiNhanViec(tx, input.userId);
	await tx.viecTheoDoi.create({ data: { viecId: viec.id, userId: nguoi.id } });
	await ghiVet(tx, dauVet(input), { loai: "theo-doi", truoc: null, sau: nguoi });
}

export async function boTheoDoi(
	tx: DbGhi,
	input: TheoDoiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (input.userId !== input.nguoiId) {
		canGiaoHayLam(viec, input.nguoiId, VIEC.lam.theoDoiKhac);
	}
	const hang = await tx.viecTheoDoi.findFirst({
		where: { viecId: viec.id, userId: input.userId },
		select: { id: true, user: { select: { id: true, name: true } } },
	});
	if (!hang) return;
	await tx.viecTheoDoi.delete({ where: { id: hang.id } });
	await ghiVet(tx, dauVet(input), {
		loai: "bo-theo-doi",
		truoc: nguoiCua(hang.user),
		sau: null,
	});
}

export async function coLichSu(tx: DbGhi, viecId: string): Promise<boolean> {
	const so = await tx.viecVet.count({
		where: { viecId, loai: { not: "tao" } },
	});
	return so > 0;
}

export async function xoaViec(
	tx: DbGhi,
	input: { viecId: string; nguoiId: string },
): Promise<{ id: string }> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (!vaiCua(viec, input.nguoiId).giao) {
		throw new LoiViec("khong-quyen", VIEC.thongDiep.chiNguoiGiao(VIEC.lam.xoa));
	}
	if (await coLichSu(tx, viec.id)) {
		throw new LoiViec("co-lich-su", VIEC.thongDiep.coLichSu);
	}
	await tx.viec.delete({ where: { id: viec.id } });
	return { id: viec.id };
}

export async function chuyenViecTrongGiaoDich(
	tx: DbGhi,
	input: { tuId: string; den: NguoiVet; nguoiId: string; now: Date },
): Promise<number> {
	const ds = await tx.viec.findMany({
		where: dieuKienViecMoCua(input.tuId),
		orderBy: { id: "asc" },
		select: {
			id: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			nguoiGiao: { select: { id: true, name: true } },
			nguoiThucHien: { select: { id: true, name: true } },
		},
	});
	for (const v of ds) {
		const nguoiThucHienMoi =
			v.nguoiThucHienId === input.tuId ? input.den.id : v.nguoiThucHienId;
		const nguoiGiaoMoi =
			v.nguoiGiaoId === input.tuId ? input.den.id : v.nguoiGiaoId;
		await tx.viec.update({
			where: { id: v.id },
			data: { nguoiThucHienId: nguoiThucHienMoi, nguoiGiaoId: nguoiGiaoMoi },
		});
		const truoc = {
			nguoiGiao: nguoiCua(v.nguoiGiao),
			nguoiThucHien: nguoiCua(v.nguoiThucHien),
		};
		await ghiVet(
			tx,
			{
				viecId: v.id,
				nguoiId: input.nguoiId,
				nguon: "chuyen-viec",
				luc: input.now,
			},
			{
				loai: "chuyen-viec",
				truoc,
				sau: {
					nguoiGiao:
						nguoiGiaoMoi === input.den.id ? input.den : truoc.nguoiGiao,
					nguoiThucHien:
						nguoiThucHienMoi === input.den.id
							? input.den
							: truoc.nguoiThucHien,
				},
			},
		);
	}
	return ds.length;
}

export async function goTheoDoiCuaNguoi(
	tx: DbGhi,
	userId: string,
	now: Date,
): Promise<number> {
	const hang = await tx.viecTheoDoi.findMany({
		where: { userId },
		select: {
			id: true,
			viecId: true,
			user: { select: { id: true, name: true } },
		},
	});
	for (const h of hang) {
		await tx.viecTheoDoi.delete({ where: { id: h.id } });
		await ghiVet(
			tx,
			{ viecId: h.viecId, nguoiId: null, nguon: "api", luc: now },
			{ loai: "bo-theo-doi", truoc: nguoiCua(h.user), sau: null },
		);
	}
	return hang.length;
}

export async function ghiGoDoXoa(
	tx: DbGhi,
	where: Prisma.ViecGanWhereInput,
	now: Date,
): Promise<number> {
	const hang = await tx.viecGan.findMany({ where, select: CHON_GAN });
	for (const g of hang) {
		const ban = banGhiCua(g);
		await ghiVet(
			tx,
			{ viecId: g.viecId, nguoiId: null, nguon: "api", luc: now },
			{ loai: "go-do-ban-ghi-xoa", truoc: ban, sau: { ten: ban.ten } },
		);
	}
	return hang.length;
}
```

Bốn chuỗi mà răng đột biến ở Task 15 thay phải xuất hiện **đúng một lần** trong `viec-ghi.ts`: `for (const b of ganDung) {`, `if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {`, `		viec.nguoiThucHienId === input.nguoiId &&`, `await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);`, `v.nguoiGiaoId === input.tuId ? input.den.id : v.nguoiGiaoId`, `if (await coLichSu(tx, viec.id)) {` — kiểm bằng `grep -c` sau khi viết.

- [ ] **Step 5: Viết `apps/api/src/viec/viec.contracts.ts`:**

```ts
import {
	LOAI_BAN_GHI,
	LOAI_VET_VIEC,
	NGUON_VIEC,
	NHOM_VIEC,
	TRANG_THAI_VIEC,
	VIEC,
	vetViec,
} from "@crm/db/viec";
import { z } from "zod";
import { ngayLich } from "../onboarding/onboarding.contracts";

const ma = z.string().trim().min(1).max(120);

const banGhiTruong = {
	companyId: ma.optional(),
	contactId: ma.optional(),
	dealId: ma.optional(),
	planId: ma.optional(),
};

type BanGhiTruong = {
	companyId?: string;
	contactId?: string;
	dealId?: string;
	planId?: string;
};

function soBanGhi(b: BanGhiTruong): number {
	return [b.companyId, b.contactId, b.dealId, b.planId].filter(Boolean).length;
}

export const viecIdInput = z.object({ id: ma });

export const viecCreateInput = z
	.object({
		tieuDe: z.string().trim().min(1).max(VIEC.tieuDeToiDa),
		moTa: z.string().trim().max(VIEC.moTaToiDa).nullable().optional(),
		hanNgay: ngayLich.nullable().optional(),
		nguoiThucHienId: ma.optional(),
		nguoiTheoDoiIds: z.array(ma).max(VIEC.theoDoiToiDa).default([]),
		...banGhiTruong,
	})
	.refine((v) => soBanGhi(v) <= 1, { message: VIEC.thongDiep.dungMotBanGhi });

export const viecBanGhiInput = z
	.object(banGhiTruong)
	.refine((v) => soBanGhi(v) === 1, { message: VIEC.thongDiep.dungMotBanGhi });

export const viecGanInput = z
	.object({ id: ma, ...banGhiTruong })
	.refine((v) => soBanGhi(v) === 1, { message: VIEC.thongDiep.dungMotBanGhi });

export const viecDoiTrangThaiInput = z.object({
	id: ma,
	den: z.enum(TRANG_THAI_VIEC),
});

export const viecSuaInput = z.object({
	id: ma,
	tieuDe: z.string().trim().min(1).max(VIEC.tieuDeToiDa).optional(),
	moTa: z.string().trim().max(VIEC.moTaToiDa).nullable().optional(),
	hanNgay: ngayLich.nullable().optional(),
});

export const viecDoiNguoiInput = z.object({ id: ma, nguoiThucHienId: ma });

export const viecTheoDoiInput = z.object({ id: ma, userId: ma.optional() });

export const viecCuaToiInput = z.object({
	nhom: z.enum(NHOM_VIEC).default("giao-cho-toi"),
});

const nguoiRa = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().nullable(),
});

const banGhiRa = z.object({
	loai: z.enum(LOAI_BAN_GHI),
	id: z.string(),
	ten: z.string(),
});

export const viecDong = z.object({
	id: z.string(),
	tieuDe: z.string(),
	trangThai: z.enum(TRANG_THAI_VIEC),
	hanNgay: z.string().nullable(),
	quaHan: z.boolean(),
	nguoiGiao: nguoiRa,
	nguoiThucHien: nguoiRa,
	banGhi: z.array(banGhiRa),
});

export const viecChiTietOutput = viecDong.extend({
	moTa: z.string().nullable(),
	nguoiTheoDoi: z.array(nguoiRa),
	coLichSu: z.boolean(),
	quyen: z.object({
		trangThai: z.array(z.enum(TRANG_THAI_VIEC)),
		sua: z.boolean(),
		doiNguoi: z.boolean(),
		gan: z.boolean(),
		theoDoiKhac: z.boolean(),
		dangTheoDoi: z.boolean(),
		xoa: z.boolean(),
	}),
});

export const viecCuaBanGhiOutput = z.object({
	mo: z.array(viecDong),
	daXong: z.array(viecDong),
	daHuy: z.array(viecDong),
});

export const viecCuaToiOutput = viecCuaBanGhiOutput.extend({
	demNhom: z.object({
		"giao-cho-toi": z.number().int(),
		"toi-giao": z.number().int(),
		"dang-theo-doi": z.number().int(),
	}),
});

export const viecVetOutput = z.array(
	z.object({
		id: z.string(),
		luc: z.string(),
		nguon: z.enum(NGUON_VIEC),
		loai: z.enum(LOAI_VET_VIEC),
		nguoi: z.object({ id: z.string(), name: z.string() }).nullable(),
		vet: vetViec,
	}),
);

export const viecTaoOutput = z.object({ id: z.string() });

export type ViecCreateInput = z.infer<typeof viecCreateInput>;
export type ViecBanGhiInput = z.infer<typeof viecBanGhiInput>;
export type ViecGanInput = z.infer<typeof viecGanInput>;
export type ViecDoiTrangThaiInput = z.infer<typeof viecDoiTrangThaiInput>;
export type ViecSuaInput = z.infer<typeof viecSuaInput>;
export type ViecDoiNguoiInput = z.infer<typeof viecDoiNguoiInput>;
export type ViecTheoDoiInput = z.infer<typeof viecTheoDoiInput>;
export type ViecCuaToiInput = z.infer<typeof viecCuaToiInput>;
export type ViecDongOutput = z.infer<typeof viecDong>;
export type ViecChiTietOutput = z.infer<typeof viecChiTietOutput>;
export type ViecCuaBanGhiOutput = z.infer<typeof viecCuaBanGhiOutput>;
export type ViecCuaToiOutput = z.infer<typeof viecCuaToiOutput>;
export type ViecVetOutput = z.infer<typeof viecVetOutput>;
```

- [ ] **Step 6: Viết `apps/api/src/viec/viec.service.ts`** (đủ phương thức; các phương thức của Task 3–8 viết luôn ở đây để router một lần đủ):

```ts
import { type Db, TrangThaiViec } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	type BanGhiGan,
	banGhiCua,
	CHON_VIEC,
	dichDuoc,
	dieuKienNhom,
	dieuKienXemViec,
	docViecCuaBanGhi,
	type HangViec,
	NHOM_VIEC,
	ngayHan,
	parseVetViec,
	TRANG_THAI_MO,
	theoHan,
	VIEC,
	vaiCua,
} from "@crm/db/viec";
import {
	boTheoDoi,
	coLichSu,
	doiNguoiThucHien,
	doiTrangThai,
	ganBanGhi,
	goBanGhi,
	LoiViec,
	suaViec,
	taoViec,
	themTheoDoi,
	xoaViec,
} from "@crm/db/viec-ghi";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	ViecBanGhiInput,
	ViecChiTietOutput,
	ViecCreateInput,
	ViecCuaBanGhiOutput,
	ViecCuaToiInput,
	ViecCuaToiOutput,
	ViecDoiNguoiInput,
	ViecDoiTrangThaiInput,
	ViecDongOutput,
	ViecGanInput,
	ViecSuaInput,
	ViecTheoDoiInput,
	ViecVetOutput,
} from "./viec.contracts";

function dichLoi(loi: unknown): never {
	if (!(loi instanceof LoiViec)) throw loi;
	switch (loi.ma) {
		case "khong-thay":
			throw new NotFoundException(loi.message);
		case "khong-quyen":
			throw new ForbiddenException(loi.message);
		case "co-lich-su":
			throw new ConflictException(loi.message);
		case "khong-hop-le":
		case "nguoi-nhan":
		case "ban-ghi":
			throw new BadRequestException(loi.message);
	}
}

export function banGhiTu(b: {
	companyId?: string;
	contactId?: string;
	dealId?: string;
	planId?: string;
}): BanGhiGan | null {
	if (b.companyId) return { loai: "company", id: b.companyId };
	if (b.contactId) return { loai: "contact", id: b.contactId };
	if (b.dealId) return { loai: "deal", id: b.dealId };
	if (b.planId) return { loai: "plan", id: b.planId };
	return null;
}

function laQuaHan(h: HangViec, now: Date): boolean {
	return (
		h.hanNgay !== null &&
		TRANG_THAI_MO.includes(h.trangThai) &&
		h.hanNgay < dauNgayVN(now)
	);
}

export function viecRa(h: HangViec, now: Date): ViecDongOutput {
	return {
		id: h.id,
		tieuDe: h.tieuDe,
		trangThai: h.trangThai,
		hanNgay: h.hanNgay ? ngayHan(h.hanNgay) : null,
		quaHan: laQuaHan(h, now),
		nguoiGiao: h.nguoiGiao,
		nguoiThucHien: h.nguoiThucHien,
		banGhi: h.gan.map(banGhiCua),
	};
}

function chiaKhep(ds: HangViec[], now: Date): ViecCuaBanGhiOutput {
	const sap = [...ds].sort(theoHan);
	return {
		mo: sap.filter((v) => TRANG_THAI_MO.includes(v.trangThai)).map((v) => viecRa(v, now)),
		daXong: sap.filter((v) => v.trangThai === TrangThaiViec.XONG).map((v) => viecRa(v, now)),
		daHuy: sap.filter((v) => v.trangThai === TrangThaiViec.HUY).map((v) => viecRa(v, now)),
	};
}

@Injectable()
export class ViecService {
	private readonly logger = new Logger(ViecService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	private ghi<T>(lam: (tx: DbGhi) => Promise<T>): Promise<T> {
		return this.db.$transaction((tx) => lam(tx)).catch(dichLoi);
	}

	private async docThay(id: string, userId: string): Promise<HangViec> {
		const h = await this.db.viec.findFirst({
			where: { AND: [{ id }, dieuKienXemViec(userId)] },
			select: CHON_VIEC,
		});
		if (h === null) throw new NotFoundException(VIEC.thongDiep.khongCoViec(id));
		return h;
	}

	async get(id: string, userId: string): Promise<ViecChiTietOutput> {
		const h = await this.docThay(id, userId);
		const daCoLichSu = await coLichSu(this.db, h.id);
		const vai = vaiCua(h, userId);
		return {
			...viecRa(h, new Date()),
			moTa: h.moTa,
			nguoiTheoDoi: h.theoDoi.map((t) => t.user),
			coLichSu: daCoLichSu,
			quyen: {
				trangThai: dichDuoc(h.trangThai, vai),
				sua: vai.giao || vai.thucHien,
				doiNguoi: vai.giao,
				gan: vai.giao || vai.thucHien,
				theoDoiKhac: vai.giao || vai.thucHien,
				dangTheoDoi: vai.theoDoi,
				xoa: vai.giao && !daCoLichSu,
			},
		};
	}

	async lichSu(id: string, userId: string): Promise<ViecVetOutput> {
		await this.docThay(id, userId);
		const hang = await this.db.viecVet.findMany({
			where: { viecId: id },
			orderBy: [{ luc: "desc" }, { id: "desc" }],
			select: {
				id: true,
				luc: true,
				nguon: true,
				loai: true,
				truoc: true,
				sau: true,
				nguoi: { select: { id: true, name: true } },
			},
		});
		return hang.map((h) => {
			const vet = parseVetViec(h);
			return {
				id: h.id,
				luc: h.luc.toISOString(),
				nguon: nguonCua(h.nguon, h.id),
				loai: vet.loai,
				nguoi: h.nguoi,
				vet,
			};
		});
	}

	async cuaBanGhi(
		input: ViecBanGhiInput,
		userId: string,
	): Promise<ViecCuaBanGhiOutput> {
		const b = banGhiTu(input);
		if (b === null) throw new BadRequestException(VIEC.thongDiep.dungMotBanGhi);
		return chiaKhep(await docViecCuaBanGhi(this.db, b, userId), new Date());
	}

	async cuaToi(
		input: ViecCuaToiInput,
		userId: string,
	): Promise<ViecCuaToiOutput> {
		const now = new Date();
		const ds = await this.db.viec.findMany({
			where: { AND: [dieuKienNhom(input.nhom, userId), dieuKienXemViec(userId)] },
			select: CHON_VIEC,
		});
		const dem = await Promise.all(
			NHOM_VIEC.map((nhom) =>
				this.db.viec.count({
					where: {
						AND: [
							dieuKienNhom(nhom, userId),
							{ trangThai: { in: [...TRANG_THAI_MO] } },
						],
					},
				}),
			),
		);
		const chia = chiaKhep(ds, now);
		return {
			mo: chia.mo,
			daXong: chia.daXong.slice(0, VIEC.tranKhep),
			daHuy: chia.daHuy.slice(0, VIEC.tranKhep),
			demNhom: {
				"giao-cho-toi": dem[0] ?? 0,
				"toi-giao": dem[1] ?? 0,
				"dang-theo-doi": dem[2] ?? 0,
			},
		};
	}

	create(input: ViecCreateInput, userId: string): Promise<{ id: string }> {
		const b = banGhiTu(input);
		return this.ghi((tx) =>
			taoViec(tx, {
				nguoiId: userId,
				tieuDe: input.tieuDe,
				moTa: input.moTa ?? null,
				hanNgay: input.hanNgay ?? null,
				nguoiThucHienId: input.nguoiThucHienId,
				nguoiTheoDoiIds: input.nguoiTheoDoiIds,
				gan: b ? [b] : [],
				nguon: "web",
				now: new Date(),
			}),
		);
	}

	async doiTrangThai(
		input: ViecDoiTrangThaiInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			doiTrangThai(tx, {
				viecId: input.id,
				nguoiId: userId,
				den: input.den,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async sua(input: ViecSuaInput, userId: string): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			suaViec(tx, {
				viecId: input.id,
				nguoiId: userId,
				tieuDe: input.tieuDe,
				moTa: input.moTa,
				hanNgay: input.hanNgay,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async doiNguoiThucHien(
		input: ViecDoiNguoiInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			doiNguoiThucHien(tx, {
				viecId: input.id,
				nguoiId: userId,
				nguoiThucHienId: input.nguoiThucHienId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async gan(input: ViecGanInput, userId: string): Promise<ViecChiTietOutput> {
		const b = banGhiTu(input);
		if (b === null) throw new BadRequestException(VIEC.thongDiep.dungMotBanGhi);
		await this.ghi((tx) =>
			ganBanGhi(tx, {
				viecId: input.id,
				nguoiId: userId,
				banGhi: b,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async go(input: ViecGanInput, userId: string): Promise<ViecChiTietOutput> {
		const b = banGhiTu(input);
		if (b === null) throw new BadRequestException(VIEC.thongDiep.dungMotBanGhi);
		await this.ghi((tx) =>
			goBanGhi(tx, {
				viecId: input.id,
				nguoiId: userId,
				banGhi: b,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async theoDoi(
		input: ViecTheoDoiInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			themTheoDoi(tx, {
				viecId: input.id,
				nguoiId: userId,
				userId: input.userId ?? userId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async boTheoDoi(
		input: ViecTheoDoiInput,
		userId: string,
	): Promise<{ id: string }> {
		await this.ghi((tx) =>
			boTheoDoi(tx, {
				viecId: input.id,
				nguoiId: userId,
				userId: input.userId ?? userId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return { id: input.id };
	}

	async xoa(id: string, userId: string): Promise<{ id: string }> {
		const ket = await this.ghi((tx) => xoaViec(tx, { viecId: id, nguoiId: userId }));
		this.logger.log({ message: "viec.xoa", viecId: ket.id, userId });
		return ket;
	}
}

function nguonCua(
	nguon: string,
	vetId: string,
): ViecVetOutput[number]["nguon"] {
	if (nguon === "web" || nguon === "zalo" || nguon === "api" || nguon === "chuyen-viec") {
		return nguon;
	}
	throw new Error(VIEC.thongDiep.vetHong(vetId, `nguon ${nguon}`));
}
```

`boTheoDoi` trả `{ id }` vì người vừa bỏ theo dõi một việc riêng không còn thấy nó — gọi `get` sẽ 404.

- [ ] **Step 7: Viết router và module.** `apps/api/src/viec/viec.router.ts`:

```ts
import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { PhamViDoiTacMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import {
	viecBanGhiInput,
	viecChiTietOutput,
	viecCreateInput,
	viecCuaBanGhiOutput,
	viecCuaToiInput,
	viecCuaToiOutput,
	viecDoiNguoiInput,
	viecDoiTrangThaiInput,
	viecGanInput,
	viecIdInput,
	viecSuaInput,
	viecTaoOutput,
	viecTheoDoiInput,
	viecVetOutput,
} from "./viec.contracts";
import { ViecService } from "./viec.service";

const TAG = ["Viec"];

@Router({ alias: "viec" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class ViecRouter {
	constructor(@Inject(ViecService) private readonly viec: ViecService) {}

	@Query({
		input: viecCuaToiInput,
		output: viecCuaToiOutput,
		meta: restMeta("GET", "/viec", TAG),
	})
	cuaToi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecCuaToiInput>,
	) {
		return this.viec.cuaToi(input, ctx.user.id);
	}

	@Query({
		input: viecIdInput,
		output: viecChiTietOutput,
		meta: restMeta("GET", "/viec/{id}", TAG),
	})
	get(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.viec.get(id, ctx.user.id);
	}

	@Query({
		input: viecIdInput,
		output: viecVetOutput,
		meta: restMeta("GET", "/viec/{id}/lich-su", TAG),
	})
	lichSu(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.viec.lichSu(id, ctx.user.id);
	}

	@Query({
		input: viecBanGhiInput,
		output: viecCuaBanGhiOutput,
		meta: restMeta("GET", "/viec-theo-ban-ghi", TAG),
	})
	cuaBanGhi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecBanGhiInput>,
	) {
		return this.viec.cuaBanGhi(input, ctx.user.id);
	}

	@Mutation({
		input: viecCreateInput,
		output: viecTaoOutput,
		meta: restMeta("POST", "/viec", TAG),
	})
	create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecCreateInput>,
	) {
		return this.viec.create(input, ctx.user.id);
	}

	@Mutation({
		input: viecDoiTrangThaiInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/trang-thai", TAG),
	})
	doiTrangThai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecDoiTrangThaiInput>,
	) {
		return this.viec.doiTrangThai(input, ctx.user.id);
	}

	@Mutation({
		input: viecSuaInput,
		output: viecChiTietOutput,
		meta: restMeta("PATCH", "/viec/{id}", TAG),
	})
	sua(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecSuaInput>,
	) {
		return this.viec.sua(input, ctx.user.id);
	}

	@Mutation({
		input: viecDoiNguoiInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/nguoi-thuc-hien", TAG),
	})
	doiNguoiThucHien(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecDoiNguoiInput>,
	) {
		return this.viec.doiNguoiThucHien(input, ctx.user.id);
	}

	@Mutation({
		input: viecGanInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/gan", TAG),
	})
	gan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecGanInput>,
	) {
		return this.viec.gan(input, ctx.user.id);
	}

	@Mutation({
		input: viecGanInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/go", TAG),
	})
	go(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecGanInput>,
	) {
		return this.viec.go(input, ctx.user.id);
	}

	@Mutation({
		input: viecTheoDoiInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/theo-doi", TAG),
	})
	theoDoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecTheoDoiInput>,
	) {
		return this.viec.theoDoi(input, ctx.user.id);
	}

	@Mutation({
		input: viecTheoDoiInput,
		output: viecTaoOutput,
		meta: restMeta("POST", "/viec/{id}/bo-theo-doi", TAG),
	})
	boTheoDoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecTheoDoiInput>,
	) {
		return this.viec.boTheoDoi(input, ctx.user.id);
	}

	@Mutation({
		input: viecIdInput,
		output: viecTaoOutput,
		meta: restMeta("DELETE", "/viec/{id}", TAG),
	})
	xoa(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.viec.xoa(id, ctx.user.id);
	}
}
```

`apps/api/src/viec/viec.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ViecRouter } from "./viec.router";
import { ViecService } from "./viec.service";

@Module({
	imports: [TrpcModule],
	providers: [ViecService, ViecRouter],
	exports: [ViecService],
})
export class ViecModule {}
```

`app.module.ts`: `import { ViecModule } from "./viec/viec.module";` (theo thứ tự chữ, sau `./users/users.module`), và `ViecModule,` sau `DashboardModule,`. Rồi `cd apps/api && bun run trpc:generate` để sinh lại `src/generated/server.ts`.

- [ ] **Step 8: Chạy xanh** — `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts -t vc-tao"` và `... -t vc-gan"` → xanh. **Phá thử (MEASURE-BIRTH):** trong `packages/db/src/viec-ghi.ts` đổi tạm `for (const b of ganDung) {` thành `for (const b of []) {`, chạy `-t vc-tao` → đỏ với `error: vc: gan sai`; hoàn lại. Đổi tạm trong `viec.ts` `return [...new Map(hang.map((h) => [h.viec.id, h.viec])).values()];` thành `return hang.map((h) => h.viec);`, chạy `-t vc-gan` → đỏ với `vc: cong ty hien viec 2 lan`; hoàn lại. `git diff --stat packages/db/src` không còn dòng nào của lần phá.

- [ ] **Step 9: Commit**

```bash
git add packages/db/src/viec-ghi.ts apps/api/src/viec/viec.contracts.ts apps/api/src/viec/viec.service.ts apps/api/src/viec/viec.router.ts apps/api/src/viec/viec.module.ts apps/api/src/app.module.ts apps/api/src/generated/server.ts apps/api/test/support/viec-gieo.ts apps/api/test/viec-ghi.spec.ts
git commit -m "feat(viec-chung): một chỗ ghi việc, router viec — tạo, gắn, gỡ, khối của bản ghi"
```

---

## Task 3: Đồ thị trạng thái — ma trận 100 ô và cột đo `roiChuaLamLuc`

**Files:**
- Test: `apps/api/test/viec-ghi.spec.ts` (thêm describe `vc-trang-thai` cuối tệp)
- Modify (nếu test chỉ ra lệch): `packages/db/src/viec.ts`, `packages/db/src/viec-ghi.ts` (thân `doiTrangThai`, đã viết ở Task 2)

**Interfaces:**
- Consumes: `doiTrangThai`, `quyenDoi`, `hanhDong`, `VIEC.thongDiep.{khongChuyenDuoc,chiNguoiGiao,chiGiaoVaThucHien}`; `taoThu`, `doiThu`, `goi`.
- Produces: không giao diện mới.
- Phục vụ evals: E3 (chiều đỏ ở E16 c, k, l)
- independent: false

- [ ] **Step 1: Viết test đỏ** — thêm vào cuối `apps/api/test/viec-ghi.spec.ts` (thêm `TrangThaiViec` và `VIEC`, `hanhDong` vào import đầu tệp; `taoThu`, `doiThu` từ `./support/viec-gieo`):

```ts
import { TrangThaiViec } from "@crm/db";
import { hanhDong, VIEC } from "@crm/db/viec";

const TT = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
	TrangThaiViec.HUY,
] as const;

const BANG_THIET_KE: Record<string, Record<string, "G" | "GT" | undefined>> = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
};

type Vai = "giao" | "thucHien" | "theoDoi" | "khac" | "quanTri";

const VAI: readonly Vai[] = ["giao", "thucHien", "theoDoi", "khac", "quanTri"];

describe("vc-trang-thai", () => {
	test(
		"vc-trang-thai: 5 người × 20 cặp = 100 ô đúng bảng thiết kế",
		async () => {
			const a = await nguoi("vc-tt-a", "member");
			const b = await nguoi("vc-tt-b", "member");
			const w = await nguoi("vc-tt-w", "member");
			const x = await nguoi("vc-tt-x", "member");
			const q = await nguoi("vc-tt-q", "admin");
			const id: Record<Vai, string> = {
				giao: a.id,
				thucHien: b.id,
				theoDoi: w.id,
				khac: x.id,
				quanTri: q.id,
			};
			const { dealId } = await thoaThuan(app, a.id);
			let daChay = 0;
			for (const vai of VAI) {
				for (const nguon of TT) {
					for (const dich of TT) {
						if (nguon === dich) continue;
						daChay += 1;
						const v = await taoThu({
							nguoiId: a.id,
							tieuDe: `vc-tt ${vai} ${nguon}-${dich}`,
							nguoiThucHienId: b.id,
							nguoiTheoDoiIds: [w.id],
							gan: [{ loai: "deal", id: dealId }],
						});
						if (nguon !== TrangThaiViec.CHUA_LAM) {
							await doiThu(v.id, a.id, nguon);
						}
						const vetTruoc = await demVet(v.id);
						const r = await goi(
							app,
							"viec.doiTrangThai",
							"mutation",
							{ id: v.id, den: dich },
							id[vai],
						);
						const sau = await db.viec.findUniqueOrThrow({
							where: { id: v.id },
						});
						const vetSau = await demVet(v.id);
						const o = BANG_THIET_KE[nguon]?.[dich];
						const duoc =
							o === "GT"
								? vai === "giao" || vai === "thucHien"
								: o === "G" && vai === "giao";
						const ca = `${vai} ${nguon}-${dich}`;
						if (o === undefined) {
							if (
								r.code !== "BAD_REQUEST" ||
								r.message !== VIEC.thongDiep.khongChuyenDuoc(nguon, dich) ||
								sau.trangThai !== nguon ||
								vetSau !== vetTruoc
							) {
								throw new Error(`vc: cap khong hop le lot ${ca}`);
							}
							continue;
						}
						if (duoc) {
							const vet = await db.viecVet.findFirst({
								where: { viecId: v.id, loai: "doi-trang-thai" },
								orderBy: [{ luc: "desc" }, { id: "desc" }],
							});
							const dungVet =
								JSON.stringify(vet?.truoc) ===
									JSON.stringify({ trangThai: nguon }) &&
								JSON.stringify(vet?.sau) === JSON.stringify({ trangThai: dich });
							if (
								r.status !== 200 ||
								sau.trangThai !== dich ||
								vetSau !== vetTruoc + 1 ||
								!dungVet
							) {
								throw new Error(`vc: o duoc hong ${ca}`);
							}
							continue;
						}
						if (r.status === 200 || sau.trangThai !== nguon) {
							throw new Error(`vc: o khong lot ${ca}`);
						}
						const loiMong =
							o === "G"
								? VIEC.thongDiep.chiNguoiGiao(hanhDong(nguon, dich))
								: VIEC.thongDiep.chiGiaoVaThucHien(hanhDong(nguon, dich));
						if (
							r.code !== "FORBIDDEN" ||
							r.message !== loiMong ||
							vetSau !== vetTruoc
						) {
							throw new Error(`vc: loi tu choi sai o ${ca}`);
						}
					}
				}
			}
			if (daChay !== 100) {
				throw new Error(`vc: ma tran trang thai thieu o ${daChay}`);
			}
		},
		600_000,
	);

	test(
		"vc-trang-thai: roiChuaLamLuc chỉ ghi một lần, khi chính người thực hiện rời Chưa làm",
		async () => {
			const a = await nguoi("vc-roi-a", "member");
			const b = await nguoi("vc-roi-b", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const moi = (tieuDe: string) =>
				taoThu({
					nguoiId: a.id,
					tieuDe,
					nguoiThucHienId: b.id,
					gan: [{ loai: "deal", id: dealId }],
				});
			const roi = async (viecId: string) =>
				(await db.viec.findUniqueOrThrow({ where: { id: viecId } }))
					.roiChuaLamLuc;
			const v1 = await moi("vc-roi 1");
			await goi(app, "viec.doiTrangThai", "mutation", { id: v1.id, den: "DANG_LAM" }, b.id);
			if ((await roi(v1.id)) === null) {
				throw new Error("vc: roiChuaLamLuc khong ghi");
			}
			const v2 = await moi("vc-roi 2");
			await goi(app, "viec.doiTrangThai", "mutation", { id: v2.id, den: "DANG_LAM" }, a.id);
			const v3 = await moi("vc-roi 3");
			await goi(app, "viec.doiTrangThai", "mutation", { id: v3.id, den: "HUY" }, a.id);
			if ((await roi(v2.id)) !== null || (await roi(v3.id)) !== null) {
				throw new Error("vc: roiChuaLamLuc ghi boi nguoi giao");
			}
			const v4 = await moi("vc-roi 4");
			await goi(app, "viec.doiTrangThai", "mutation", { id: v4.id, den: "DANG_LAM" }, b.id);
			const dau = await roi(v4.id);
			await goi(app, "viec.doiTrangThai", "mutation", { id: v4.id, den: "CHUA_LAM" }, b.id);
			await new Promise((r) => setTimeout(r, 20));
			await goi(app, "viec.doiTrangThai", "mutation", { id: v4.id, den: "DANG_LAM" }, b.id);
			if ((await roi(v4.id))?.getTime() !== dau?.getTime()) {
				throw new Error("vc: roiChuaLamLuc ghi lai");
			}
		},
		MA_TEST_MS,
	);
});
```

- [ ] **Step 2: Chạy** — `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts -t vc-trang-thai"`. Nếu Task 2 viết đúng, xanh ngay; chứng chiều đỏ ở Step 3. Nếu đỏ, sửa thân `doiTrangThai`/`quyenDoi` cho khớp bảng (bảng trong spec là nguồn), không sửa bảng.

- [ ] **Step 3: Phá thử (MEASURE-BIRTH, ba chiều E16 c, k, l)** — mỗi lần đổi một chỗ, chạy `-t vc-trang-thai`, thấy đỏ đúng ghim, hoàn lại:
  - `viec.ts`: `if (!duoc) return "khong-quyen";` → `if (!duoc && !vai.theoDoi) return "khong-quyen";` → `vc: o khong lot theoDoi CHUA_LAM-DANG_LAM`.
  - `viec.ts`: `const duoc = o === "G" ? vai.giao : vai.giao || vai.thucHien;` → `const duoc = (o === "G" ? vai.giao : vai.giao || vai.thucHien) || (nguon === "CHO_DANH_GIA" && den === "XONG" && vai.theoDoi);` → `vc: o khong lot theoDoi CHO_DANH_GIA-XONG`.
  - `viec-ghi.ts`: xoá dòng `		viec.nguoiThucHienId === input.nguoiId &&` → `vc: roiChuaLamLuc ghi boi nguoi giao`.
  Sau ba lần `git diff packages/db/src` rỗng.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/viec-ghi.spec.ts packages/db/src/viec.ts packages/db/src/viec-ghi.ts
git commit -m "test(viec-chung): ma trận 100 ô của đồ thị trạng thái và cột đo rời Chưa làm"
```

---

## Task 4: Sửa, đổi người, theo dõi, lịch sử

**Files:**
- Test: `apps/api/test/viec-ghi.spec.ts` (thêm describe `vc-sua`)
- Modify (nếu lệch): `packages/db/src/viec-ghi.ts`, `apps/api/src/viec/viec.service.ts`

**Interfaces:**
- Consumes: `suaViec`, `doiNguoiThucHien`, `themTheoDoi`, `boTheoDoi`, `ViecService.lichSu`, `viecVetOutput`.
- Phục vụ evals: E4 (chiều đỏ ở E16 c)
- independent: false

- [ ] **Step 1: Viết test đỏ** — thêm cuối `viec-ghi.spec.ts` (import `viecVetOutput` từ `../src/viec/viec.contracts`):

```ts
describe("vc-sua", () => {
	test(
		"vc-sua: chuỗi được để đúng một vết mỗi bước; chuỗi không được 403 không đổi; lịch sử mới nhất trước",
		async () => {
			const a = await nguoi("vc-sua-a", "member");
			const b = await nguoi("vc-sua-b", "member");
			const w = await nguoi("vc-sua-w", "member");
			const c = await nguoi("vc-sua-c", "member");
			const x = await nguoi("vc-sua-x", "member");
			const q = await nguoi("vc-sua-q", "admin");
			const { dealId } = await thoaThuan(app, a.id);
			const v = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-sua goc",
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [w.id],
				gan: [{ loai: "deal", id: dealId }],
			});
			const duoc: [string, string, string, Record<string, string | null>, string][] = [
				["doiNguoi", a.id, "viec.doiNguoiThucHien", { nguoiThucHienId: c.id }, "doi-nguoi-thuc-hien"],
				["tieuDe", a.id, "viec.sua", { tieuDe: "vc-sua moi" }, "doi-noi-dung"],
				["han A", a.id, "viec.sua", { hanNgay: "2026-11-01" }, "doi-han"],
				["theo X", a.id, "viec.theoDoi", { userId: x.id }, "theo-doi"],
				["han C", c.id, "viec.sua", { hanNgay: "2026-11-02" }, "doi-han"],
				["bo W", w.id, "viec.boTheoDoi", {}, "bo-theo-doi"],
				["Q tu theo", q.id, "viec.theoDoi", {}, "theo-doi"],
			];
			for (const [buoc, ai, ten, input, loai] of duoc) {
				const truoc = await demVet(v.id);
				const r = await goi(app, ten, "mutation", { id: v.id, ...input }, ai);
				const vet = await db.viecVet.findFirst({
					where: { viecId: v.id },
					orderBy: [{ luc: "desc" }, { id: "desc" }],
				});
				if (
					r.status !== 200 ||
					(await demVet(v.id)) !== truoc + 1 ||
					vet?.loai !== loai ||
					(vet.truoc === null && vet.sau === null)
				) {
					throw new Error(`vc: sua ${buoc} vet sai`);
				}
			}
			const khongDuoc: [string, string, string, Record<string, string>][] = [
				["B", b.id, "viec.sua", { hanNgay: "2026-11-03" }],
				["C", c.id, "viec.doiNguoiThucHien", { nguoiThucHienId: b.id }],
				["X", x.id, "viec.sua", { tieuDe: "X sua" }],
				["W", w.id, "viec.theoDoi", { userId: b.id }],
			];
			for (const [ai, id, ten, input] of khongDuoc) {
				const truoc = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
				const vetTruoc = await demVet(v.id);
				const r = await goi(app, ten, "mutation", { id: v.id, ...input }, id);
				const sau = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
				if (
					r.code !== "FORBIDDEN" ||
					JSON.stringify(sau) !== JSON.stringify(truoc) ||
					(await demVet(v.id)) !== vetTruoc
				) {
					throw new Error(`vc: sua lot ${ai} ${ten}`);
				}
			}
			const ls = await goi(app, "viec.lichSu", "query", { id: v.id }, a.id);
			const dong = viecVetOutput.parse(ls.data);
			const lucs = dong.map((d) => Date.parse(d.luc));
			const giam = lucs.every((l, i) => i === 0 || l <= (lucs[i - 1] ?? l));
			if (
				dong.length !== 8 ||
				!giam ||
				dong.at(-1)?.loai !== "tao" ||
				dong.some((d) => !d.nguoi?.name || !d.nguon)
			) {
				throw new Error("vc: lich su sai thu tu");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-sua: vet hong — một dòng vết sai khuôn làm lichSu báo lỗi có lời, không trả rỗng",
		async () => {
			const a = await nguoi("vc-hong-a", "member");
			const v = await taoThu({ nguoiId: a.id, tieuDe: "vc-hong", gan: [] });
			const hong = await db.viecVet.create({
				data: { viecId: v.id, loai: "doi-han", truoc: 3, sau: "x", nguon: "web" },
			});
			const r = await goi(app, "viec.lichSu", "query", { id: v.id }, a.id);
			expect(r.status).toBe(500);
			expect(r.message).toContain(`Vết việc ${hong.id} không đọc được`);
		},
		MA_TEST_MS,
	);
});
```

Lưu ý ca «vet hong»: nếu `DomainErrorMiddleware`/bộ định dạng lỗi che lời của lỗi 500 trên đường tRPC, thay khẳng định thứ hai bằng gọi thẳng `new ViecService(db).lichSu(v.id, a.id)` và `expect(...).rejects.toThrow(\`Vết việc ${hong.id} không đọc được\`)` — điều cần giữ là lời có mã vết.

- [ ] **Step 2: Chạy thấy đỏ hoặc xanh** — `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts -t vc-sua"`. Đỏ thì sửa `viec-ghi.ts`/service tới xanh.

- [ ] **Step 3: Phá thử** — trong `viec-ghi.ts`, hàm `canGiaoHayLam`, đổi `if (!vai.giao && !vai.thucHien) {` thành `if (!vai.giao && !vai.thucHien && !vai.theoDoi) {` → `-t vc-sua` đỏ với `vc: sua lot W viec.theoDoi`; hoàn lại.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/viec-ghi.spec.ts packages/db/src/viec-ghi.ts apps/api/src/viec/viec.service.ts
git commit -m "test(viec-chung): sửa, đổi người, theo dõi và lịch sử việc"
```

---

## Task 5: Vai «chỉ OKR», quyền xem P3, đổi vai

**Files:**
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` dòng 187–202 (`demViecDangGiu`, `xoaTheoDoiCua` — thân)
- Modify: `apps/api/src/workspace/workspace.service.ts` dòng 264–273
- Modify: `apps/api/src/workspace/workspace-config.ts` dòng 17–19
- Test: `apps/api/test/viec-quyen.spec.ts` (describe `vc-vai-okr`, `vc-xem`)

**Interfaces:**
- Consumes: `demViecMoCua`, `goTheoDoiCuaNguoi` (Task 1–2).
- Produces: `demViecDangGiu(tx, userId): Promise<{ keHoach: number; buoc: number; viec: number }>`; `xoaTheoDoiCua(tx, userId): Promise<number>` (đếm cả theo dõi việc); `WORKSPACE_CONFIG.messages.conViec(keHoach: number, buoc: number, viec: number): string` — bằng nguyên văn `conViecKeHoach(keHoach, buoc)` khi `viec === 0`.
- Phục vụ evals: E5, E6 (chiều đỏ ở E16 d, e, m)
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/viec-quyen.spec.ts`:

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { KHONG_TRONG_PHAM_VI } from "@crm/auth";
import { db } from "@crm/db";
import { VIEC } from "@crm/db/viec";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import {
	dashboardSummaryOutput,
} from "../src/dashboard/dashboard.contracts";
import {
	viecCuaBanGhiOutput,
	viecCuaToiOutput,
} from "../src/viec/viec.contracts";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { WORKSPACE_CONFIG } from "../src/workspace/workspace-config";
import { doiVai, donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	cookieCua,
	doiThu,
	donViec,
	goi,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const MA_TEST_MS = 300_000;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

const workspace = () =>
	new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);

async function maMember(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).id;
}

async function soDem() {
	return Promise.all([
		db.viec.count(),
		db.viecTheoDoi.count(),
		db.viecVet.count(),
	]);
}

describe("vc-vai-okr", () => {
	test(
		"vc-vai-okr: bảy đường đặt hay mở lại về người vai okr đều 400 có tên và «chỉ OKR», không ghi gì",
		async () => {
			const okr = await nguoi("Người OKR VC", "okr");
			const a = await nguoi("vc-okr-a", "member");
			const b = await nguoi("vc-okr-b", "member");
			const q = await nguoi("vc-okr-q", "admin");
			const { dealId } = await thoaThuan(app, a.id);
			const gan = [{ loai: "deal" as const, id: dealId }];
			const v = await taoThu({ nguoiId: a.id, tieuDe: "vc-okr goc", nguoiThucHienId: b.id, gan });
			await taoThu({ nguoiId: a.id, tieuDe: "vc-okr cua a", gan });
			const duong: [string, () => Promise<{ code: string | null; message: string; status: number }>][] = [
				["(1)", () => goi(app, "viec.create", "mutation", { tieuDe: "x", dealId, nguoiThucHienId: okr.id }, a.id)],
				["(2)", () => goi(app, "viec.doiNguoiThucHien", "mutation", { id: v.id, nguoiThucHienId: okr.id }, a.id)],
				["(3)", () => goi(app, "viec.theoDoi", "mutation", { id: v.id, userId: okr.id }, a.id)],
				["(4)", () => goi(app, "onboarding.transferWork", "mutation", { fromUserId: a.id, toUserId: okr.id }, q.id)],
			];
			for (const [den, nguon] of [
				["(5)", "XONG"],
				["(6)", "CHO_DANH_GIA"],
				["(7)", "HUY"],
			] as const) {
				const m = await nguoi(`vc-okr-m ${den}`, "member");
				const mv = await taoThu({ nguoiId: a.id, tieuDe: `vc-okr mo lai ${den}`, nguoiThucHienId: m.id, gan });
				await doiThu(mv.id, a.id, nguon);
				await doiVai(m.id, "okr");
				const dich = nguon === "HUY" ? "CHUA_LAM" : "DANG_LAM";
				duong.push([den, () => goi(app, "viec.doiTrangThai", "mutation", { id: mv.id, den: dich }, a.id)]);
			}
			for (const [ten, chay] of duong) {
				const truoc = await soDem();
				const r = await chay();
				const sau = await soDem();
				const tenNguoi = ten === "(1)" || ten === "(2)" || ten === "(3)" || ten === "(4)" ? "Người OKR VC" : "vc-okr-m";
				if (
					r.status !== 400 ||
					!r.message.includes(tenNguoi) ||
					!r.message.includes("chỉ OKR") ||
					JSON.stringify(truoc) !== JSON.stringify(sau)
				) {
					throw new Error(`vc: giao cho vai okr khong bi chan ${ten}`);
				}
			}
			const m5 = await nguoi("vc-okr-m5 duong", "member");
			const v5 = await taoThu({ nguoiId: a.id, tieuDe: "vc-okr doi chung", nguoiThucHienId: m5.id, gan });
			await doiThu(v5.id, a.id, "XONG");
			const lam = await goi(app, "viec.doiTrangThai", "mutation", { id: v5.id, den: "DANG_LAM" }, a.id);
			expect(lam.status, "doi chung lam lai").toBe(200);
		},
		MA_TEST_MS,
	);

	test(
		"vc-vai-okr: router viec đóng cho vai okr, ô chọn không có họ, đổi vai bị 409 khi còn việc, chỉ theo dõi thì gỡ hết",
		async () => {
			const okr = await nguoi("vc-okr-cua", "okr");
			const a = await nguoi("vc-okr-a2", "member");
			const b = await nguoi("vc-okr-b2", "member");
			const c = await nguoi("vc-okr-c2", "member");
			const giaoThoi = await nguoi("vc-okr-g2", "member");
			const q = await nguoi("vc-okr-q2", "admin");
			const { dealId } = await thoaThuan(app, a.id);
			const gan = [{ loai: "deal" as const, id: dealId }];
			for (const [ten, loai, input] of [
				["viec.cuaToi", "query", { nhom: "giao-cho-toi" }],
				["viec.get", "query", { id: "khong-co" }],
				["viec.create", "mutation", { tieuDe: "x" }],
			] as const) {
				const r = await goi(app, ten, loai, input, okr.id);
				if (r.code !== "FORBIDDEN" || r.message !== KHONG_TRONG_PHAM_VI) {
					throw new Error(`vc: router viec mo cho vai okr ${ten}`);
				}
			}
			const ds = await goi(app, "onboarding.nguoiNhanViec", "query", undefined, a.id);
			if ((ds.data as { id: string }[]).some((u) => u.id === okr.id)) {
				throw new Error("vc: o chon co vai okr");
			}
			const tao = await goi(app, "viec.create", "mutation", { tieuDe: "vc dc", dealId, nguoiThucHienId: b.id }, a.id);
			expect(tao.status, "doi chung create").toBe(200);
			for (const [bien, userId] of [
				["thuc hien", b.id],
				["chi giao", giaoThoi.id],
			] as const) {
				if (bien === "chi giao") {
					await taoThu({ nguoiId: giaoThoi.id, tieuDe: "vc giao thoi", nguoiThucHienId: b.id, gan });
				}
				let loi = "";
				try {
					await workspace().setMemberRole(q.id, { memberId: await maMember(userId), role: "okr" });
				} catch (e) {
					loi = e instanceof Error ? e.message : String(e);
				}
				const vai = (await db.member.findFirstOrThrow({ where: { userId } })).role;
				if (
					loi !== WORKSPACE_CONFIG.messages.conViec(0, 0, 1) ||
					!loi.includes("Chuyển việc") ||
					vai !== "member"
				) {
					throw new Error(`vc: doi vai khi con viec khong bi chan ${bien} ${loi}`);
				}
			}
			await taoThu({ nguoiId: a.id, tieuDe: "vc theo mo", nguoiThucHienId: b.id, nguoiTheoDoiIds: [c.id], gan });
			const theoXong = await taoThu({ nguoiId: a.id, tieuDe: "vc theo xong", nguoiThucHienId: b.id, nguoiTheoDoiIds: [c.id], gan });
			await doiThu(theoXong.id, a.id, "XONG");
			await workspace().setMemberRole(q.id, { memberId: await maMember(c.id), role: "okr" });
			if ((await db.viecTheoDoi.count({ where: { userId: c.id } })) !== 0) {
				throw new Error("vc: con theo doi viec sau doi vai");
			}
			expect((await db.member.findFirstOrThrow({ where: { userId: c.id } })).role).toBe("okr");
		},
		MA_TEST_MS,
	);
});

type Duong = "get" | "lichSu" | "cuaToi" | "cuaBanGhi" | "tongQuan" | "rest" | "theoDoi";

const DUONG: readonly Duong[] = ["get", "lichSu", "cuaToi", "cuaBanGhi", "tongQuan", "rest", "theoDoi"];

const NHOM_CUA = {
	giao: "toi-giao",
	thucHien: "giao-cho-toi",
	theoDoi: "dang-theo-doi",
	khac: "dang-theo-doi",
	quanTri: "dang-theo-doi",
} as const;

describe("vc-xem", () => {
	test(
		"vc-xem: 2 việc × 5 người × 7 đường = 70 ô; việc riêng chỉ ba người trong cuộc thấy, lời như mã lạ",
		async () => {
			const p = {
				giao: await nguoi("vc-xem-a", "member"),
				thucHien: await nguoi("vc-xem-b", "member"),
				theoDoi: await nguoi("vc-xem-w", "member"),
				khac: await nguoi("vc-xem-x", "member"),
				quanTri: await nguoi("vc-xem-q", "admin"),
			};
			const { dealId } = await thoaThuan(app, p.giao.id);
			const homKia = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
			const chung = {
				nguoiId: p.giao.id,
				nguoiThucHienId: p.thucHien.id,
				nguoiTheoDoiIds: [p.theoDoi.id],
				hanNgay: new Date(`${homKia.toISOString().slice(0, 10)}T00:00:00.000Z`),
			};
			const G = await taoThu({ ...chung, tieuDe: "vc-xem G", gan: [{ loai: "deal", id: dealId }] });
			const R = await taoThu({ ...chung, tieuDe: "vc-xem R", gan: [] });
			const maLa = `khong-co-${Date.now()}`;
			const laLa = await goi(app, "viec.get", "query", { id: maLa }, p.khac.id);
			expect(laLa.message).toBe(VIEC.thongDiep.khongCoViec(maLa));
			let daChay = 0;
			for (const [tenViec, viec] of [["G", G], ["R", R]] as const) {
				for (const vai of ["giao", "thucHien", "theoDoi", "khac", "quanTri"] as const) {
					const userId = p[vai].id;
					const trongCuoc = vai === "giao" || vai === "thucHien" || vai === "theoDoi";
					const thay = tenViec === "G" || trongCuoc;
					for (const duong of DUONG) {
						daChay += 1;
						const ca = `${tenViec} ${vai} ${duong}`;
						if (duong === "get" || duong === "lichSu" || duong === "rest" || duong === "theoDoi") {
							const truocTheo = await db.viecTheoDoi.count({ where: { viecId: viec.id } });
							let status: number;
							let message: string;
							if (duong === "rest") {
								const res = await request(app.getHttpServer())
									.get(`${REST_BRIDGE_PATH}/viec/${viec.id}`)
									.set("cookie", await cookieCua(userId));
								status = res.status;
								message = String(res.body?.message ?? "");
							} else {
								const r = await goi(
									app,
									duong === "theoDoi" ? "viec.theoDoi" : `viec.${duong}`,
									duong === "theoDoi" ? "mutation" : "query",
									{ id: viec.id },
									userId,
								);
								status = r.code === "NOT_FOUND" ? 404 : r.status;
								message = r.message;
							}
							if (thay) {
								if (status !== 200) throw new Error(`vc: viec rieng lo ${vai} ${duong} doi chung ${status}`);
								continue;
							}
							if (status === 200) throw new Error(`vc: viec rieng lo ${vai} ${duong}`);
							if (status !== 404 || message !== VIEC.thongDiep.khongCoViec(viec.id)) {
								throw new Error(`vc: loi khong thay khac ma la ${duong} ${ca}`);
							}
							if ((await db.viecTheoDoi.count({ where: { viecId: viec.id } })) !== truocTheo) {
								throw new Error(`vc: viec rieng lo ${vai} ${duong}`);
							}
							continue;
						}
						let ids: string[];
						if (duong === "cuaToi") {
							const r = await goi(app, "viec.cuaToi", "query", { nhom: NHOM_CUA[vai] }, userId);
							ids = viecCuaToiOutput.parse(r.data).mo.map((v) => v.id);
						} else if (duong === "cuaBanGhi") {
							const r = await goi(app, "viec.cuaBanGhi", "query", { dealId }, userId);
							ids = viecCuaBanGhiOutput.parse(r.data).mo.map((v) => v.id);
						} else {
							const r = await goi(app, "dashboard.summary", "query", { scope: "everyone" }, userId);
							ids = dashboardSummaryOutput.parse(r.data).viecQuaHan.map((v) => v.id);
						}
						const co = ids.includes(viec.id);
						const mong =
							duong === "cuaBanGhi"
								? tenViec === "G"
								: duong === "tongQuan"
									? thay
									: trongCuoc;
						if (co && !mong) throw new Error(`vc: viec rieng lo ${vai} ${duong}`);
						if (!co && mong) throw new Error(`vc: viec rieng lo ${vai} ${duong} doi chung thieu`);
					}
				}
			}
			if (daChay !== 70) throw new Error(`vc: ma tran xem thieu o ${daChay}`);
		},
		MA_TEST_MS,
	);
});
```

Ca `tongQuan` của ma trận dùng `viecQuaHan` — trường do Task 6 thêm. Ở task này test chạy được tới ô đó thì đỏ vì `viecQuaHan` chưa có; ghi nhận trạng thái «đỏ đúng chỗ» rồi để Task 6 làm xanh. `-t vc-vai-okr` phải xanh ngay ở task này.

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/api && bun test test/viec-quyen.spec.ts -t vc-vai-okr"` → đỏ ở `conViec` (chưa có) và ở «con theo doi viec sau doi vai».

- [ ] **Step 3: Mã tối thiểu.** `workspace-config.ts` — thay khối dòng 17–19 bằng (giữ `conViecKeHoach` vì spec DA0a so nguyên văn):

```ts
		conViecKeHoach: (keHoach: number, buoc: number) =>
			`Người này còn cầm trịch ${keHoach} kế hoạch và làm ${buoc} bước đang mở. Chuyển việc ở màn Thành viên trước, rồi mới đổi sang vai «chỉ OKR».`,
		conViec: (keHoach: number, buoc: number, viec: number) =>
			viec === 0
				? `Người này còn cầm trịch ${keHoach} kế hoạch và làm ${buoc} bước đang mở. Chuyển việc ở màn Thành viên trước, rồi mới đổi sang vai «chỉ OKR».`
				: `Người này còn cầm trịch ${keHoach} kế hoạch, làm ${buoc} bước và giữ ${viec} việc đang mở. Chuyển việc ở màn Thành viên trước, rồi mới đổi sang vai «chỉ OKR».`,
```

`onboarding-ghi.ts` — thêm import `import { demViecMoCua } from "@crm/db/viec";` và `import { goTheoDoiCuaNguoi } from "@crm/db/viec-ghi";`; thay thân hai hàm (dòng 187–202):

```ts
export async function demViecDangGiu(
	tx: Tx,
	userId: string,
): Promise<{ keHoach: number; buoc: number; viec: number }> {
	const dk = dieuKienChuyen(userId);
	const [keHoach, buoc, viec] = await Promise.all([
		tx.onboardingPlan.count({ where: dk.keHoach }),
		tx.onboardingStep.count({ where: dk.buoc }),
		demViecMoCua(tx, userId),
	]);
	return { keHoach, buoc, viec };
}

export async function xoaTheoDoiCua(tx: Tx, userId: string): Promise<number> {
	const { count } = await tx.onboardingWatch.deleteMany({ where: { userId } });
	return count + (await goTheoDoiCuaNguoi(tx, userId, new Date()));
}
```

`workspace.service.ts` dòng 266–271 — giữ nguyên chuỗi `if (viec.keHoach > 0 || viec.buoc > 0) {` (răng DA0a đột biến nó), đổi lời và thêm nhánh việc:

```ts
				const viec = await demViecDangGiu(tx, target.userId);
				const conViec = new ConflictException(
					WORKSPACE_CONFIG.messages.conViec(viec.keHoach, viec.buoc, viec.viec),
				);
				if (viec.keHoach > 0 || viec.buoc > 0) {
					throw conViec;
				}
				if (viec.viec > 0) throw conViec;
				theoDoiDaXoa = await xoaTheoDoiCua(tx, target.userId);
```

- [ ] **Step 4: Chạy xanh** — `-t vc-vai-okr` xanh. Chạy lại spec DA0a: `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t vlr-doi-vai"` vẫn xanh (lời `conViec(k, b, 0)` bằng `conViecKeHoach(k, b)`).

- [ ] **Step 5: Phá thử (E16 d, m, e)** — mỗi lần một chỗ, hoàn lại sau:
  - `viec-ghi.ts`: `if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {` → `if (false) {` → `-t vc-vai-okr` đỏ `vc: giao cho vai okr khong bi chan (1)`.
  - `viec-ghi.ts`: xoá dòng `		await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);` → đỏ `vc: giao cho vai okr khong bi chan (5)`.
  - `viec.ts`: `{ gan: { some: {} } },` → `{},` → `-t vc-xem` đỏ `vc: viec rieng lo khac get` (ô `get` chạy trước ô `tongQuan`, nên chiều đỏ đo được dù Task 6 chưa xong).

- [ ] **Step 6: Commit**

```bash
git add apps/api/test/viec-quyen.spec.ts apps/api/src/onboarding/onboarding-ghi.ts apps/api/src/workspace/workspace.service.ts apps/api/src/workspace/workspace-config.ts
git commit -m "feat(viec-chung): chặn vai chỉ OKR ở mọi đường đặt người, đổi vai đếm cả việc"
```

---

## Task 6: Việc của tôi và Tổng quan

**Files:**
- Modify: `apps/api/src/dashboard/dashboard.contracts.ts` (thêm `viecQuaHanOutput` sau dòng 74 `overdueTaskOutput`; trường `viecQuaHan` trong `dashboardSummaryOutput`, sau dòng 133 `overdueTasks`)
- Modify: `apps/api/src/dashboard/dashboard.service.ts` dòng 60 (đổi tên biến), 162, 302–307, 315–331
- Modify: `apps/app/test/han-viec.dom.tsx` dòng ~288, `apps/app/test/dieu-phoi-va.dom.tsx` dòng ~536, `apps/app/test/may-nhac.dom.tsx` dòng ~267 (thêm `viecQuaHan: []` cạnh `overdueTasks`)
- Test: `apps/api/test/viec-cua-toi.spec.ts`

**Interfaces:**
- Consumes: `ViecService.cuaToi` (Task 2), `dieuKienXemViec`, `CHON_VIEC`, `banGhiCua`, `ngayHan`, `VIEC.tranTongQuan`.
- Produces: `dashboardSummaryOutput.viecQuaHan: { loai: "viec"; id: string; tieuDe: string; hanNgay: string; nguoiThucHien: { id: string; name: string }; banGhi: { loai; id; ten } | null }[]`; `quaHan.viec` = việc cần làm cũ quá hạn + Việc quá hạn.
- Phục vụ evals: E7 (và ô `tongQuan` của E6)
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/viec-cua-toi.spec.ts` (lệnh chạy có `TZ=Asia/Ho_Chi_Minh`):

```ts
import { afterAll, afterEach, beforeAll, describe, expect, setSystemTime, test } from "bun:test";
import { db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { dashboardSummaryOutput } from "../src/dashboard/dashboard.contracts";
import { viecCuaToiOutput } from "../src/viec/viec.contracts";
import { donDep, gieoBoPhan, gieoKeHoach, moXuong } from "./support/ke-hoach-gieo";
import { batApp, doiThu, donViec, goi, nguoi, taoThu, thoaThuan } from "./support/viec-gieo";

const NOW = new Date("2026-10-14T12:00:00+07:00");
const MA_TEST_MS = 120_000;

const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

describe("vc-cua-toi", () => {
	test(
		"vc-cua-toi: Giao cho tôi xếp quá hạn, hôm nay, tuần sau, không hạn; khép ở dòng gập; số đếm chỉ việc mở; Tổng quan có việc quá hạn",
		async () => {
			setSystemTime(NOW);
			const a = await nguoi("vc-ct-a", "member");
			const b = await nguoi("vc-ct-b", "member");
			const c = await nguoi("vc-ct-c", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const gan = [{ loai: "deal" as const, id: dealId }];
			const mot = (tieuDe: string, hanNgay: Date | null) =>
				taoThu({ nguoiId: a.id, tieuDe, nguoiThucHienId: b.id, hanNgay, gan, now: NOW });
			const quaHan = await mot("vc-ct qua han", han("2026-10-12"));
			const homNay = await mot("vc-ct hom nay", han("2026-10-14"));
			const tuanSau = await mot("vc-ct tuan sau", han("2026-10-21"));
			const khongHan = await mot("vc-ct khong han", null);
			const xong = await mot("vc-ct xong", han("2026-10-13"));
			const huy = await mot("vc-ct huy", han("2026-10-13"));
			await doiThu(xong.id, b.id, "XONG", NOW);
			await doiThu(huy.id, a.id, "HUY", NOW);
			await taoThu({ nguoiId: b.id, tieuDe: "vc-ct b giao", nguoiThucHienId: a.id, gan, now: NOW });
			await taoThu({ nguoiId: c.id, tieuDe: "vc-ct c", nguoiThucHienId: c.id, nguoiTheoDoiIds: [b.id], gan, now: NOW });
			const doc = async (nhom: string) =>
				viecCuaToiOutput.parse((await goi(app, "viec.cuaToi", "query", { nhom }, b.id)).data);
			const giao = await doc("giao-cho-toi");
			const thuTu = giao.mo.map((v) => v.id);
			if (
				JSON.stringify(thuTu) !== JSON.stringify([quaHan.id, homNay.id, tuanSau.id, khongHan.id]) ||
				giao.daXong.length !== 1 ||
				giao.daHuy.length !== 1
			) {
				throw new Error(`vc: viec cua toi sai thu tu ${JSON.stringify(giao)}`);
			}
			for (const nhom of ["toi-giao", "dang-theo-doi"]) {
				if ((await doc(nhom)).mo.length !== 1) throw new Error(`vc: nhom ${nhom} sai`);
			}
			if (JSON.stringify(giao.demNhom) !== JSON.stringify({ "giao-cho-toi": 4, "toi-giao": 1, "dang-theo-doi": 1 })) {
				throw new Error("vc: dem nhom dem ca viec khep");
			}
			const bp = await gieoBoPhan();
			await gieoKeHoach({ camTrich: a.id, buoc: [{ nhan: "vc-ct buoc", boPhanId: bp.id, giao: b.id, han: han("2026-10-10") }] });
			const viecCu = await db.activity.count({
				where: { type: "TASK", completedAt: null, dueAt: { lt: dauNgayVN(NOW) }, createdById: b.id },
			});
			const tq = dashboardSummaryOutput.parse(
				(await goi(app, "dashboard.summary", "query", { scope: "me" }, b.id)).data,
			);
			const coViec = tq.viecQuaHan.some((d) => d.loai === "viec" && d.id === quaHan.id);
			if (!coViec || tq.mySteps.length === 0 || tq.quaHan.viec !== viecCu + 1) {
				throw new Error("vc: tong quan thieu viec qua han");
			}
			const tqA = dashboardSummaryOutput.parse(
				(await goi(app, "dashboard.summary", "query", { scope: "me" }, a.id)).data,
			);
			if (tqA.viecQuaHan.some((d) => d.id === quaHan.id)) {
				throw new Error("vc: tong quan lan viec nguoi khac");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-cua-toi: ranh nua dem — 00:30 VN ngày D+1 thì việc hạn D quá hạn, việc hạn D+1 chưa",
		async () => {
			const luc = new Date("2026-10-15T00:30:00+07:00");
			setSystemTime(luc);
			const a = await nguoi("vc-nd-a", "member");
			const hom = await taoThu({ nguoiId: a.id, tieuDe: "vc-nd D", hanNgay: han("2026-10-14"), gan: [], now: luc });
			const mai = await taoThu({ nguoiId: a.id, tieuDe: "vc-nd D+1", hanNgay: han("2026-10-15"), gan: [], now: luc });
			const ra = viecCuaToiOutput.parse(
				(await goi(app, "viec.cuaToi", "query", { nhom: "giao-cho-toi" }, a.id)).data,
			);
			expect(ra.mo.find((v) => v.id === hom.id)?.quaHan).toBe(true);
			expect(ra.mo.find((v) => v.id === mai.id)?.quaHan).toBe(false);
		},
		MA_TEST_MS,
	);
});
```

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-cua-toi.spec.ts"` → đỏ ở `viecQuaHan` (chưa có trong khuôn ra).

- [ ] **Step 3: Mã tối thiểu.** `dashboard.contracts.ts` sau `overdueTaskOutput`:

```ts
const viecQuaHanOutput = z.object({
	loai: z.literal("viec"),
	id: z.string(),
	tieuDe: z.string(),
	hanNgay: z.string(),
	nguoiThucHien: linkedRecordOutput,
	banGhi: z
		.object({
			loai: z.enum(["company", "contact", "deal", "plan"]),
			id: z.string(),
			ten: z.string(),
		})
		.nullable(),
});
```

và trong `dashboardSummaryOutput`, sau `overdueTasks`: `viecQuaHan: z.array(viecQuaHanOutput),`.

`dashboard.service.ts`: import `import { banGhiCua, CHON_VIEC, dieuKienXemViec, ngayHan, TRANG_THAI_MO, VIEC } from "@crm/db/viec";`. Đổi tên biến cục bộ `viecQuaHan` (dòng 60, 162, 302) thành `viecCanLamQuaHan` và tham số của `demQuaHan` (dòng 317, 322) thành `viecCanLam`. Thêm phương thức:

```ts
	private dieuKienViecQuaHan(
		actingUserId: string,
		mine: boolean,
		now: Date,
	): Prisma.ViecWhereInput {
		return {
			AND: [
				{
					trangThai: { in: [...TRANG_THAI_MO] },
					hanNgay: { lt: dauNgayVN(now) },
				},
				mine ? { nguoiThucHienId: actingUserId } : dieuKienXemViec(actingUserId),
			],
		};
	}

	private async viecQuaHan(actingUserId: string, mine: boolean, now: Date) {
		const hang = await this.db.viec.findMany({
			where: this.dieuKienViecQuaHan(actingUserId, mine, now),
			orderBy: [{ hanNgay: "asc" }, { id: "asc" }],
			take: VIEC.tranTongQuan,
			select: CHON_VIEC,
		});
		return hang.map((h) => ({
			loai: "viec" as const,
			id: h.id,
			tieuDe: h.tieuDe,
			hanNgay: h.hanNgay ? ngayHan(h.hanNgay) : "",
			nguoiThucHien: { id: h.nguoiThucHien.id, name: h.nguoiThucHien.name },
			banGhi: h.gan[0] ? banGhiCua(h.gan[0]) : null,
		}));
	}
```

`demQuaHan` nhận thêm `mine: boolean` và đếm việc: `const [viec, buoc, viecChung] = await Promise.all([this.db.activity.count({ where: viecCanLam }), …buoc như cũ…, this.db.viec.count({ where: this.dieuKienViecQuaHan(actingUserId, mine, now) })]); return { viec: viec + viecChung, buoc };`. Trong `summary`: `quaHan: await this.demQuaHan(viecCanLamQuaHan, actingUserId, mine, now),` và thêm `viecQuaHan: await this.viecQuaHan(actingUserId, mine, now),` cạnh `overdueTasks`.

Ba tệp DOM test của app: thêm `viecQuaHan: [],` ngay sau dòng `overdueTasks: …` trong hàm dựng dữ liệu giả Tổng quan (`tongQuan` ở `han-viec.dom.tsx`, hàm dựng ở `dieu-phoi-va.dom.tsx`, `tongQuanGia` ở `may-nhac.dom.tsx`).

- [ ] **Step 4: Chạy xanh** — lệnh của Step 2 xanh; `bun run test -- "cd apps/api && bun test test/viec-quyen.spec.ts -t vc-xem"` nay xanh trọn 70 ô.

- [ ] **Step 5: Phá thử** — trong `dieuKienViecQuaHan` đổi `mine ? { nguoiThucHienId: actingUserId } : dieuKienXemViec(actingUserId)` thành `{}` → `vc-cua-toi` đỏ `vc: tong quan lan viec nguoi khac`; hoàn lại.

- [ ] **Step 6: Commit**

```bash
git add apps/api/test/viec-cua-toi.spec.ts apps/api/src/dashboard/dashboard.contracts.ts apps/api/src/dashboard/dashboard.service.ts apps/app/test/han-viec.dom.tsx apps/app/test/dieu-phoi-va.dom.tsx apps/app/test/may-nhac.dom.tsx
git commit -m "feat(viec-chung): Việc của tôi theo ba nhóm, Tổng quan gộp việc quá hạn"
```

---

## Task 7: Chuyển việc khi nghỉ

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts` dòng 191–194 (`transferOutput`)
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` dòng 437–513 (thân `transferPreview`, `transferWork`)
- Modify: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx` dòng 61–113
- Modify: `apps/app/lib/messages/ke-hoach-noi.ts` (khối `chuyen` en dòng 31–47, vi dòng 84–101: thêm `soViec`, `xongViec`)
- Modify: `apps/app/lib/trpc/cache.ts` dòng 245–253 (`workTransferred` làm mới cả `viec`)
- Regenerate: `apps/api/src/generated/server.ts`
- Test: `apps/api/test/viec-chuyen.spec.ts`, `apps/app/test/viec-chuyen-hop.dom.tsx`

**Interfaces:**
- Consumes: `chuyenViecTrongGiaoDich`, `demViecMoCua`, `demViecDangGiu` (Task 5).
- Produces: `TransferOutput = { keHoach: number; buoc: number; viec: number }`.
- Phục vụ evals: E11, E11b (chiều đỏ ở E16 h)
- independent: false

- [ ] **Step 1: Viết test đỏ (API)** — `apps/api/test/viec-chuyen.spec.ts`:

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, type Db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { donDep, gieoKeHoach, moXuong } from "./support/ke-hoach-gieo";
import { batApp, doiThu, donViec, nguoi, taoThu, thoaThuan } from "./support/viec-gieo";

const MA_TEST_MS = 120_000;
let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

const workspace = () =>
	new WorkspaceService(db, { workspaceChanged: async () => undefined } as unknown as AgentTriggerService);

function dbHongLanThu(lan: number): Db {
	let dem = 0;
	const boc = (tx: object) =>
		new Proxy(tx, {
			get(goc, khoa) {
				const gt = Reflect.get(goc, khoa);
				if (khoa !== "viec") return gt;
				return new Proxy(gt as object, {
					get(v, ham) {
						const fn = Reflect.get(v, ham);
						if (ham !== "update") return fn;
						return (...doiSo: unknown[]) => {
							dem += 1;
							if (dem === lan) throw new Error("vc thu hong lan cap nhat");
							return (fn as (...a: unknown[]) => unknown).apply(v, doiSo);
						};
					},
				});
			},
		});
	return new Proxy(db, {
		get(goc, khoa) {
			if (khoa !== "$transaction") return Reflect.get(goc, khoa);
			return (lam: (tx: object) => Promise<unknown>) =>
				db.$transaction((tx) => lam(boc(tx)));
		},
	}) as Db;
}

async function dung() {
	const qt = await nguoi("vc-cv-qt", "admin");
	const ra = await nguoi("vc-cv-ra", "member");
	const b = await nguoi("vc-cv-b", "member");
	const c = await nguoi("vc-cv-c", "member");
	const { dealId } = await thoaThuan(app, qt.id);
	const gan = [{ loai: "deal" as const, id: dealId }];
	const mo1 = await taoThu({ nguoiId: b.id, tieuDe: "vc-cv mo 1", nguoiThucHienId: ra.id, gan });
	const mo2 = await taoThu({ nguoiId: b.id, tieuDe: "vc-cv mo 2", nguoiThucHienId: ra.id, gan });
	const xong = await taoThu({ nguoiId: b.id, tieuDe: "vc-cv xong", nguoiThucHienId: ra.id, gan });
	await doiThu(xong.id, ra.id, "XONG");
	const giao = await taoThu({ nguoiId: ra.id, tieuDe: "vc-cv giao", nguoiThucHienId: b.id, gan });
	await gieoKeHoach({ camTrich: ra.id, buoc: [] });
	return { qt, ra, b, c, mo1, mo2, xong, giao };
}

describe("vc-chuyen", () => {
	test("vc-chuyen: xem trước nêu 3 việc bằng số của lời đổi vai; chuyển đổi người thực hiện và người giao, giữ việc đã khép, mỗi việc một vết", async () => {
		const f = await dung();
		const ghi = new OnboardingGhi(db);
		const xem = await ghi.transferPreview({ fromUserId: f.ra.id }, f.qt.id);
		if (xem.keHoach !== 1 || xem.buoc !== 0 || xem.viec !== 3) {
			throw new Error(`vc: xem truoc thieu viec ${JSON.stringify(xem)}`);
		}
		const memberId = (await db.member.findFirstOrThrow({ where: { userId: f.ra.id } })).id;
		let loi = "";
		try {
			await workspace().setMemberRole(f.qt.id, { memberId, role: "okr" });
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (!loi.includes(`giữ ${xem.viec} việc`)) throw new Error("vc: hai cho dem viec lech");
		const kq = await ghi.transferWork({ fromUserId: f.ra.id, toUserId: f.c.id }, f.qt.id);
		expect(kq.viec).toBe(3);
		const doc = (id: string) => db.viec.findUniqueOrThrow({ where: { id } });
		if ((await doc(f.giao.id)).nguoiGiaoId !== f.c.id) throw new Error("vc: chuyen viec bo sot nguoi giao");
		for (const v of [f.mo1, f.mo2]) {
			if ((await doc(v.id)).nguoiThucHienId !== f.c.id) throw new Error("vc: chuyen viec bo sot nguoi thuc hien");
		}
		if ((await doc(f.xong.id)).nguoiThucHienId !== f.ra.id) throw new Error("vc: chuyen viec doi viec da khep");
		for (const v of [f.mo1, f.mo2, f.giao]) {
			const so = await db.viecVet.count({ where: { viecId: v.id, loai: "chuyen-viec", nguon: "chuyen-viec" } });
			if (so !== 1) throw new Error("vc: vet chuyen viec sai");
		}
		const keHoach = await db.onboardingPlan.count({ where: { ownerId: f.c.id } });
		expect(keHoach).toBe(1);
	}, MA_TEST_MS);

	test("vc-chuyen: nguyên tử — lần cập nhật việc thứ ba hỏng thì không kế hoạch, không việc nào đổi", async () => {
		const f = await dung();
		const truoc = await db.viec.findMany({ where: { id: { in: [f.mo1.id, f.mo2.id, f.giao.id] } }, orderBy: { id: "asc" } });
		const keHoachTruoc = await db.onboardingPlan.count({ where: { ownerId: f.ra.id } });
		await expect(
			new OnboardingGhi(dbHongLanThu(3)).transferWork({ fromUserId: f.ra.id, toUserId: f.c.id }, f.qt.id),
		).rejects.toThrow("vc thu hong lan cap nhat");
		const sau = await db.viec.findMany({ where: { id: { in: [f.mo1.id, f.mo2.id, f.giao.id] } }, orderBy: { id: "asc" } });
		if (
			JSON.stringify(sau) !== JSON.stringify(truoc) ||
			(await db.onboardingPlan.count({ where: { ownerId: f.ra.id } })) !== keHoachTruoc
		) {
			throw new Error("vc: chuyen viec khong nguyen tu");
		}
	}, MA_TEST_MS);

	test("vc-chuyen: tu giao — người rời vừa giao vừa thực hiện một việc thì đổi cả hai cột, đúng một vết", async () => {
		const qt = await nguoi("vc-tg-qt", "admin");
		const ra = await nguoi("vc-tg-ra", "member");
		const c = await nguoi("vc-tg-c", "member");
		const v = await taoThu({ nguoiId: ra.id, tieuDe: "vc-tg", gan: [] });
		await new OnboardingGhi(db).transferWork({ fromUserId: ra.id, toUserId: c.id }, qt.id);
		const sau = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
		expect([sau.nguoiGiaoId, sau.nguoiThucHienId]).toEqual([c.id, c.id]);
		expect(await db.viecVet.count({ where: { viecId: v.id, loai: "chuyen-viec" } })).toBe(1);
	}, MA_TEST_MS);
});
```

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/api && bun test test/viec-chuyen.spec.ts"` → đỏ `vc: xem truoc thieu viec`.

- [ ] **Step 3: Mã tối thiểu (API).** `onboarding.contracts.ts` `transferOutput` thêm `viec: z.number().int().nonnegative(),`. `onboarding-ghi.ts` thêm import `chuyenViecTrongGiaoDich` từ `@crm/db/viec-ghi` (cùng dòng import `goTheoDoiCuaNguoi`). Thân `transferPreview`:

```ts
	async transferPreview(
		input: TransferPreviewInput,
		actingUserId: string,
	): Promise<TransferOutput> {
		await yeuCauQuanTri(actingUserId);
		return demViecDangGiu(this.db, input.fromUserId);
	}
```

(`demViecDangGiu` nhận `Tx`; `Db` thoả `Prisma.TransactionClient` ở mọi trường nó đọc — nếu `tsc` đòi, đổi kiểu tham số của `demViecDangGiu` sang `DbGhi` từ `@crm/db/zalo-lien-ket`.) Thân `transferWork` — bỏ nhánh trả sớm, thêm việc ở cuối giao dịch:

```ts
		return this.db.$transaction(async (tx) => {
			const den = await kiemNguoiNhanViec(tx, input.toUserId);
			const dk = dieuKienChuyen(input.fromUserId);
			const keHoach = await tx.onboardingPlan.findMany({
				where: dk.keHoach,
				orderBy: { id: "asc" },
			});
			const buoc = await tx.onboardingStep.findMany({
				where: dk.buoc,
				select: { ...CHON_BUOC, plan: { select: { companyId: true } } },
				orderBy: { id: "asc" },
			});
			const tuTen = await tenNguoi(tx, input.fromUserId);
			for (const plan of keHoach) {
				await tx.onboardingPlan.update({
					where: { id: plan.id },
					data: { ownerId: den.id },
				});
				await ghiVet(
					tx,
					plan,
					vet.keHoachDoiCamTrich({
						tu: plan.ownerId,
						tuTen,
						den: den.id,
						denTen: den.name,
					}),
					actingUserId,
				);
			}
			for (const b of buoc) {
				await tx.onboardingStep.update({
					where: { id: b.id },
					data: { assigneeId: den.id },
				});
				await ghiVet(
					tx,
					{ id: b.planId, companyId: b.plan.companyId },
					vet.buocGiao({
						stepId: b.id,
						nhan: b.label,
						tu: input.fromUserId,
						tuTen,
						den: den.id,
						denTen: den.name,
					}),
					actingUserId,
				);
			}
			const viec = await chuyenViecTrongGiaoDich(tx, {
				tuId: input.fromUserId,
				den: { id: den.id, ten: den.name },
				nguoiId: actingUserId,
				now: new Date(),
			});
			return { keHoach: keHoach.length, buoc: buoc.length, viec };
		});
```

(Hai vòng `for` chép nguyên văn từ dòng 474–510 hiện tại; chỉ nhánh trả sớm `if (keHoach.length === 0 && buoc.length === 0)` bị bỏ.) Chạy `cd apps/api && bun run trpc:generate`.

- [ ] **Step 4: Chạy xanh (API)** và **phá thử (E16 h)** — trong `viec-ghi.ts` đổi `v.nguoiGiaoId === input.tuId ? input.den.id : v.nguoiGiaoId` thành `v.nguoiGiaoId` → đỏ `vc: chuyen viec bo sot nguoi giao`; hoàn lại. Chạy lại `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts"` vẫn xanh.

- [ ] **Step 5: Viết test đỏ (hộp)** — `apps/app/test/viec-chuyen-hop.dom.tsx`, chép khung mock tRPC 1–140 của `apps/app/test/nguoi-nhan-viec.dom.tsx` (link giả `traLoi`, `mock.module` cho `@/lib/trpc/client`, `next/navigation`, `next/link`; hàm `mo`, `afterEach`, `nhip`, `cho`), chỉ import `ChuyenViecDialog`, `LocaleProvider`, `keHoachNoiMessages`, `dien`; rồi:

```tsx
const kChuyen = keHoachNoiMessages("vi").chuyen;
const HUONG = { userId: "u-huong", name: "Hương Lê" };

describe("vc-man-chuyen", () => {
	test("vc-man-chuyen: hộp nêu «3 việc» cạnh số kế hoạch; preview 0 việc thì không in dòng việc", async () => {
		for (const [viec, coDong] of [
			[3, true],
			[0, false],
		] as const) {
			traLoi.set("onboarding.transferPreview", () => ({ keHoach: 1, buoc: 0, viec }));
			traLoi.set("onboarding.nguoiNhanViec", () => BA);
			await mo(<ChuyenViecDialog nguoi={HUONG} onDong={() => {}} />);
			const moTa = () =>
				document.body.querySelector('[data-slot="dialog-description"]')?.textContent ?? "";
			await cho(() => moTa().includes(HUONG.name), "mo ta co ten");
			const dong = document.body.querySelector("[data-dong-viec]");
			if (coDong && !(dong?.textContent ?? "").includes(dien(kChuyen.soViec, { n: "3" }))) {
				throw new Error("vc: hop chuyen viec thieu so viec");
			}
			if (coDong && !moTa().includes("3 việc")) throw new Error("vc: hop chuyen viec thieu so viec");
			if (!coDong && dong !== null) throw new Error("vc: hop chuyen viec in dong rong");
			expect(moTa()).toContain(dien(kChuyen.coViec, { ten: HUONG.name, keHoach: "1", buoc: "0" }));
			await dongSan();
		}
	});
});
```

với `dongSan` là phần thân `afterEach` của tệp mẫu tách ra thành hàm (unmount, xoá `document.body`), gọi được giữa hai vòng.

- [ ] **Step 6: Chạy thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-chuyen-hop.dom.tsx` → đỏ (`soViec` chưa có).

- [ ] **Step 7: Mã tối thiểu (hộp).** `ke-hoach-noi.ts`, khối `chuyen`: en thêm `soViec: "{n} open work items",` và `xongViec: "Plus {n} open work items.",`; vi thêm `soViec: "{n} việc đang mở",` và `xongViec: "Kèm {n} việc đang mở.",`. Nhãn `menu`, `tieuDe` không đổi (Global Constraints). `chuyen-viec-dialog.tsx`:

```tsx
	const so = xemTruoc.data;
	const coKeHoach = so !== undefined && (so.keHoach > 0 || so.buoc > 0);
	const coViecChung = so !== undefined && so.viec > 0;
	const coViec = coKeHoach || coViecChung;
```

trong `onSuccess` của `chuyen`:

```tsx
				const ten = { keHoach: String(kq.keHoach), buoc: String(kq.buoc), ten: tenNhan };
				toast.success(
					kq.viec > 0
						? `${dien(k.xong, ten)} ${dien(k.xongViec, { n: String(kq.viec) })}`
						: dien(k.xong, ten),
				);
```

và nhánh mô tả:

```tsx
						) : (
							<>
								{coKeHoach
									? dienNode(k.coViec, { ten, keHoach: String(so.keHoach), buoc: String(so.buoc) })
									: dienNode(k.khongViec, { ten })}
								{coViecChung ? (
									<>
										{" "}
										<span data-dong-viec="">{dien(k.soViec, { n: String(so.viec) })}</span>
									</>
								) : null}
							</>
						)}
```

`cache.ts` `workTransferred`: thêm `trpc.viec.cuaToi.queryKey(), trpc.viec.cuaBanGhi.queryKey(), trpc.viec.get.queryKey()` vào mảng đầu.

- [ ] **Step 8: Chạy xanh** — lệnh Step 6 xanh; `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dien-node-khoa-rieng.dom.tsx ./test/nguoi-nhan-viec.dom.tsx ./test/lam-moi-chuyen-viec.dom.tsx ./test/messages-guard.spec.ts` vẫn xanh. **Phá thử:** đổi tạm `coViecChung ? (` thành `false ? (` → `vc: hop chuyen viec thieu so viec`; hoàn lại.

- [ ] **Step 9: Commit**

```bash
git add apps/api/test/viec-chuyen.spec.ts apps/api/src/onboarding/onboarding.contracts.ts apps/api/src/onboarding/onboarding-ghi.ts apps/api/src/generated/server.ts apps/app/test/viec-chuyen-hop.dom.tsx "apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx" apps/app/lib/messages/ke-hoach-noi.ts apps/app/lib/trpc/cache.ts
git commit -m "feat(viec-chung): Chuyển việc chuyển cả việc đang mở, một giao dịch, một hàm đếm"
```

---

## Task 8: Vòng đời — xoá khi chưa có lịch sử, huỷ và mở lại, xoá vĩnh viễn bản ghi gắn

**Files:**
- Modify: `apps/api/src/deals/deals.service.ts` (trong giao dịch `purge`, ngay trước dòng 556 `const deal = await tx.deal.delete({`)
- Modify: `apps/api/src/contacts/contacts.service.ts` (ngay trước dòng 474 `const contact = await tx.contact.delete({`)
- Modify: `apps/api/src/companies/companies.service.ts` (ngay trước dòng 496 `const company = await tx.company.delete({`)
- Test: `apps/api/test/viec-ghi.spec.ts` (describe `vc-vong-doi`)

**Interfaces:**
- Consumes: `xoaViec`, `coLichSu`, `ghiGoDoXoa`, `ViecService.xoa` (log `viec.xoa`), `tenKeHoach`.
- Phục vụ evals: E12 (chiều đỏ ở E16 i)
- independent: false

- [ ] **Step 1: Viết test đỏ** — thêm vào `viec-ghi.spec.ts` (import `spyOn` từ `bun:test`, `Logger` từ `@nestjs/common`, `tenKeHoach` từ `@crm/db/viec`; `keHoachCua`, `congTyRieng` từ support):

```ts
describe("vc-vong-doi", () => {
	test("vc-vong-doi: xoá việc mới có log; có lịch sử thì 409; huỷ rồi mở lại về Chưa làm", async () => {
		const a = await nguoi("vc-vd-a", "member");
		const moi = await taoThu({ nguoiId: a.id, tieuDe: "vc-vd moi", gan: [] });
		const ls = await goi(app, "viec.get", "query", { id: moi.id }, a.id);
		if ((ls.data as { coLichSu: boolean }).coLichSu !== false) throw new Error("vc: xoa viec moi hong");
		const nghe = spyOn(Logger.prototype, "log");
		const xoa = await goi(app, "viec.xoa", "mutation", { id: moi.id }, a.id);
		const suKien = nghe.mock.calls.filter(
			([m]) => typeof m === "object" && m !== null && (m as { message?: string }).message === "viec.xoa" && (m as { viecId?: string }).viecId === moi.id,
		);
		nghe.mockRestore();
		if (xoa.status !== 200 || (await db.viec.count({ where: { id: moi.id } })) !== 0) {
			throw new Error("vc: xoa viec moi hong");
		}
		if (suKien.length !== 1) throw new Error("vc: xoa khong log");
		const cu = await taoThu({ nguoiId: a.id, tieuDe: "vc-vd cu", gan: [] });
		await doiThu(cu.id, a.id, "DANG_LAM");
		const r = await goi(app, "viec.xoa", "mutation", { id: cu.id }, a.id);
		if (r.code !== "CONFLICT" || (await db.viec.count({ where: { id: cu.id } })) !== 1) {
			throw new Error("vc: xoa viec co lich su");
		}
		const huy = await taoThu({ nguoiId: a.id, tieuDe: "vc-vd huy", gan: [] });
		await goi(app, "viec.doiTrangThai", "mutation", { id: huy.id, den: "HUY" }, a.id);
		await goi(app, "viec.doiTrangThai", "mutation", { id: huy.id, den: "CHUA_LAM" }, a.id);
		const sau = await db.viec.findUniqueOrThrow({ where: { id: huy.id } });
		if (sau.trangThai !== "CHUA_LAM" || (await demVet(huy.id, "doi-trang-thai")) !== 2) {
			throw new Error("vc: huy mo lai sai");
		}
	}, MA_TEST_MS);

	test("vc-vong-doi: xoá vĩnh viễn D, K, P theo đường thật — việc còn, mỗi lần một vết go-do-ban-ghi-xoa; xoá C thì thành việc riêng", async () => {
		const a = await nguoi("vc-vd2-a", "member");
		const b = await nguoi("vc-vd2-b", "member");
		const x = await nguoi("vc-vd2-x", "member");
		const { congTyId, dealId } = await thoaThuan(app, a.id);
		const k = await goi(app, "contacts.create", "mutation", { firstName: `${token()} K`, companyId: congTyId }, a.id);
		const kId = (k.data as { id: string }).id;
		const cp = await congTyRieng();
		const plan = await keHoachCua(cp.id, a.id);
		const v = await taoThu({
			nguoiId: a.id,
			tieuDe: "vc-vd2",
			nguoiThucHienId: b.id,
			gan: [
				{ loai: "company", id: congTyId },
				{ loai: "contact", id: kId },
				{ loai: "plan", id: plan.id },
				{ loai: "deal", id: dealId },
			],
		});
		const tenK = (await db.contact.findUniqueOrThrow({ where: { id: kId } }));
		const buoc: [string, string, string, string][] = [
			["deal", "deals", dealId, (await db.deal.findUniqueOrThrow({ where: { id: dealId } })).name],
			["contact", "contacts", kId, [tenK.firstName, tenK.lastName].filter(Boolean).join(" ")],
			["plan", "companies", cp.id, tenKeHoach(cp.name)],
		];
		for (const [loai, router, id, ten] of buoc) {
			const ganTruoc = await db.viecGan.count({ where: { viecId: v.id } });
			await goi(app, `${router}.archive`, "mutation", { id }, a.id);
			const xoa = await goi(app, `${router}.purge`, "mutation", { id }, a.id);
			expect(xoa.status, `${loai} ${JSON.stringify(xoa)}`).toBe(200);
			if ((await db.viec.count({ where: { id: v.id } })) !== 1 || (await db.viecGan.count({ where: { viecId: v.id } })) !== ganTruoc - 1) {
				throw new Error(`vc: xoa ${loai} mat viec`);
			}
			const vet = await db.viecVet.findMany({ where: { viecId: v.id, loai: "go-do-ban-ghi-xoa" } });
			if (!vet.some((h) => JSON.stringify(h.sau) === JSON.stringify({ ten }))) {
				throw new Error(`vc: thieu vet go do xoa ${loai}`);
			}
		}
		await goi(app, "companies.archive", "mutation", { id: congTyId }, a.id);
		await goi(app, "companies.purge", "mutation", { id: congTyId }, a.id);
		const ngoai = await goi(app, "viec.get", "query", { id: v.id }, x.id);
		const trong = await goi(app, "viec.get", "query", { id: v.id }, b.id);
		if (
			(await db.viecGan.count({ where: { viecId: v.id } })) !== 0 ||
			ngoai.code !== "NOT_FOUND" ||
			trong.status !== 200
		) {
			throw new Error("vc: viec mo coi khong thanh rieng");
		}
	}, MA_TEST_MS);
});
```

(`token` import từ `./support/ke-hoach-gieo`.) Kế hoạch 30 ngày không có đường xoá vĩnh viễn riêng trong mã (`grep onboardingPlan.delete` trống): đường thật duy nhất là xoá vĩnh viễn công ty của nó (cascade). Vì vậy P thuộc công ty riêng `cp`, và «xoá vĩnh viễn P» = lưu trữ rồi xoá vĩnh viễn `cp` — xem «Lệch nhỏ» cuối tệp.

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts -t vc-vong-doi"` → đỏ `vc: thieu vet go do xoa deal`.

- [ ] **Step 3: Mã tối thiểu.** Ba service: `import { ghiGoDoXoa } from "@crm/db/viec-ghi";` và trong giao dịch `purge`, ngay trước lệnh `delete`:
  - `deals.service.ts`: `await ghiGoDoXoa(tx, { dealId: id }, new Date());`
  - `contacts.service.ts`: `await ghiGoDoXoa(tx, { contactId: id }, new Date());`
  - `companies.service.ts`: `await ghiGoDoXoa(tx, { OR: [{ companyId: id }, { deal: { companyId: id } }, { plan: { companyId: id } }] }, new Date());`

- [ ] **Step 4: Chạy xanh** và **phá thử (E16 i)** — `viec-ghi.ts`: `if (await coLichSu(tx, viec.id)) {` → `if (false) {` → đỏ `vc: xoa viec co lich su`; hoàn lại. Chạy `bun run test -- "cd apps/api && bun test test/luu-tru-chat.spec.ts"` vẫn xanh.

- [ ] **Step 5: Commit**

```bash
git add apps/api/test/viec-ghi.spec.ts apps/api/src/deals/deals.service.ts apps/api/src/contacts/contacts.service.ts apps/api/src/companies/companies.service.ts
git commit -m "feat(viec-chung): xoá việc khi chưa có lịch sử, vết khi bản ghi gắn bị xoá vĩnh viễn"
```

---

## Task 9: Nhắc buổi sáng ba loại và «xong n»

**Files:**
- Modify: `packages/db/src/onboarding-nhac.ts` — `THU_TU_NHAC` (dòng 22–45), `ViecNhac` (dòng 192–197), thêm nguồn việc sau `guiCua` (dòng 290), `soSanh` (dòng 292–298), `gop` (dòng 319–350), `viecCanNhac` (dòng 352–406)
- Modify: `packages/validation/src/nhac-ke-hoach.ts` dòng 31–33 (nhánh mới đầu `mucNhac`)
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` — `maViec` (dòng 61–91), `lenLichNhac` (dòng 97–113), `duongMo` (dòng 133–160)
- Modify: `apps/agent/agent/lib/tin-nhac.ts` — `TIEU_DE` (dòng 19–38), thêm `dongViec`, `dong` (dòng 242–251)
- Modify: `apps/agent/agent/lib/tra-loi-nhac.ts` (gần như viết lại `xongTheoTinNhac`, `KetTraLoi`, `cauTraLoi`)
- Modify: `apps/agent/agent/lib/zalo-config.ts` dòng 132–140 (`buocDoi`, thêm `viecKhongCuaBan`)
- Test: `apps/agent/test/nhac-viec.integration.spec.ts`

**Interfaces:**
- Consumes: `LOAI_NHAC_VIEC`, `CHON_GAN`, `banGhiCua`, `ngayHan`, `TRANG_THAI_MO`, `TRANG_THAI_KHEP`, `quyenDoi`, `vaiCua` (Task 1); `doiTrangThai` (Task 2).
- Produces:
  - `type NhacViec = { loai: LoaiNhacViec; viecId: string; tieuDe: string; han?: string; soNgay?: number; banGhi: string | null }` và `laNhacViec(v: ViecNhac): v is NhacViec` ở `@crm/db/onboarding-nhac`
  - `mucNhac` nhánh `{ loai: LoaiNhacViec; viecId: string }`
  - `lenLichNhac(now?: Date, gom?: typeof viecCanNhac): Promise<{ ghi: number }>`
  - `KetTraLoi` thêm `{ loai: "viec-khong-cua-ban"; muc: number[] }`; `LyDoDoi` thêm `"khong-co-viec"`; `MucXong.congTy: string | null`
- Phục vụ evals: E8, E9, E10 (chiều đỏ ở E16 f, g)
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/agent/test/nhac-viec.integration.spec.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, setSystemTime, test } from "bun:test";
import { db, type TrangThaiViec } from "@crm/db";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import { doiTrangThai, taoViec } from "@crm/db/viec-ghi";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { chayNhac, chuDeNhac, LOAI_VIEC_NHAC, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { xongTheoTinNhac } from "../agent/lib/tra-loi-nhac";
import { DAY_MS, donDep, gieoKeHoach, gieoNguoi, khopSlack, ma, moXuong, noiSlack, slackGia, TIEN_TO } from "./support/nhac-gieo";
import { hangCua } from "./support/nhac-gui-gieo";
import { batBot, donOkr, gieoChuKy, gieoKr, gieoMucTieu, noiZalo, tatBot } from "./support/okr-gieo";
import { APP_URL, voiToken } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const NOW = new Date("2026-10-14T09:00:00+07:00");
const TUAN_TRUOC = new Date("2026-10-05T10:00:00+07:00");
const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

async function donViec() {
	await db.viec.deleteMany({ where: { taoBoiId: { startsWith: TIEN_TO } } });
}

beforeEach(async () => {
	await donViec();
	await donOkr();
	await moXuong();
	setSystemTime(NOW);
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await donViec();
	await donOkr();
	await donDep();
	await tatBot();
});

async function thoaThuan(ten: string, chuId: string) {
	const congTy = await db.company.create({ data: { name: `${ma()} ${ten} Cty` } });
	return db.deal.create({ data: { name: `${ten} ${ma()}`, companyId: congTy.id, ownerId: chuId } });
}

function viec(input: { giao: string; lam: string; tieuDe: string; hanNgay?: Date | null; dealId?: string }) {
	return db.$transaction((tx) =>
		taoViec(tx, {
			nguoiId: input.giao,
			nguoiThucHienId: input.lam,
			tieuDe: input.tieuDe,
			hanNgay: input.hanNgay ?? null,
			gan: input.dealId ? [{ loai: "deal", id: input.dealId }] : [],
			nguon: "web",
			now: NOW,
		}),
	);
}

function doi(viecId: string, nguoiId: string, den: TrangThaiViec) {
	return db.$transaction((tx) => doiTrangThai(tx, { viecId, nguoiId, den, nguon: "web", now: NOW }));
}

async function dungNguoi(ten: string, tenNguoi: string) {
	const n = await gieoNguoi(tenNguoi);
	const khac = await gieoNguoi(`${tenNguoi} khac`);
	const deal = await thoaThuan(`VC Deal ${ten}`, khac.id);
	await viec({ giao: khac.id, lam: n.id, tieuDe: `${ten} qua han`, hanNgay: han("2026-10-12"), dealId: deal.id });
	await viec({ giao: khac.id, lam: n.id, tieuDe: `${ten} sap han`, hanNgay: han("2026-10-16"), dealId: deal.id });
	const cho = await viec({ giao: n.id, lam: khac.id, tieuDe: `${ten} cho danh gia`, dealId: deal.id });
	await doi(cho.id, khac.id, "CHO_DANH_GIA");
	const chay = await gieoChuKy("dang-chay", 1);
	const mucTieu = await gieoMucTieu({ cycleId: chay, chu: n.id, congBo: TUAN_TRUOC });
	await gieoKr({ objectiveId: mucTieu, chu: n.id, tieuDe: `KR VC ${ten}`, khoa: TUAN_TRUOC });
	const congTy = await db.company.findUniqueOrThrow({ where: { id: deal.companyId } });
	return { nguoi: n, tenDoiTac: [deal.name, congTy.name] };
}

describe("vc-nhac-vai-okr", () => {
	test("vc-nhac-vai-okr: bộ gom của vai okr không có loại việc ở cả hai cửa sổ, vẫn có việc OKR; member đủ ba loại", async () => {
		const okr = await dungNguoi("vc-nhac-okr", "Người OKR Nhắc");
		const thuong = await dungNguoi("vc-nhac-member", "vc-nhac-member");
		await db.member.updateMany({ where: { userId: okr.nguoi.id }, data: { role: "okr" } });
		for (const cuaSo of ["buoi-sang", "truc-tiep"] as const) {
			const kq = await viecCanNhac(db, { now: NOW, cuaSo });
			const cuaOkr = kq.get(okr.nguoi.id) ?? [];
			if (cuaOkr.some((v) => v.loai.startsWith("viec-"))) {
				throw new Error(`vc: bo gom co viec doi tac cho vai okr ${cuaSo}`);
			}
			if (!cuaOkr.some((v) => v.loai === "okr-cap-nhat")) throw new Error(`vc: bo gom mat viec okr ${cuaSo}`);
			const loai = (kq.get(thuong.nguoi.id) ?? []).map((v) => v.loai);
			for (const l of ["viec-qua-han", "viec-sap-han", "viec-cho-danh-gia"]) {
				if (!loai.includes(l)) throw new Error(`vc: doi chung thieu ${l}`);
			}
		}
	});

	test.each([
		["zalo", "vc-nhac-okr-zalo"],
		["slack", "vc-nhac-okr-slack"],
	] as const)("vc-nhac-vai-okr: tin %s tới vai okr không mang tên đối tác, daGui không có dòng việc", async (kenh, ten) => {
		const okr = await dungNguoi(ten, `Người OKR ${kenh}`);
		await db.member.updateMany({ where: { userId: okr.nguoi.id }, data: { role: "okr" } });
		const z = zaloGia();
		const s = slackGia();
		if (kenh === "zalo") {
			await noiZalo(okr.nguoi.id, `Z-${okr.nguoi.id}`);
			await batBot();
		} else {
			await noiSlack(okr.nguoi.id);
			await khopSlack(okr.nguoi.id, `S-${okr.nguoi.id}`);
			await db.notificationPreference.create({ data: { userId: okr.nguoi.id, channel: "SLACK" } });
		}
		await lenLichNhac(NOW);
		const hang = await hangCua(okr.nguoi.id);
		await voiToken(() => chayNhac(hang, { fetcher: s.fetcher, zaloFetcher: z.fetcher, appUrl: APP_URL }));
		const tin = kenh === "zalo"
			? z.guiToi(`Z-${okr.nguoi.id}`).map((g) => g.body.text ?? "")
			: s.goi.filter((g) => g.url.endsWith("chat.postMessage")).map((g) => g.body.text ?? "");
		const ganTen = await db.viecGan.findMany({
			where: { viec: { OR: [{ nguoiThucHienId: okr.nguoi.id }, { nguoiGiaoId: okr.nguoi.id }] } },
			select: { deal: { select: { name: true, company: { select: { name: true } } } } },
		});
		const tenDoiTac = ganTen.flatMap((g) => (g.deal ? [g.deal.name, g.deal.company.name] : []));
		if (tin.length !== 1 || tenDoiTac.some((t) => (tin[0] ?? "").includes(t))) {
			throw new Error(`vc: tin ${kenh} mang ten doi tac`);
		}
		const sau = await db.agentTask.findUniqueOrThrow({ where: { id: hang.id } });
		if ((parseNhacPayload(sau.payload).daGui ?? []).some((m) => m.loai.startsWith("viec-"))) {
			throw new Error("vc: daGui co dong viec");
		}
	});

	test("vc-nhac-vai-okr: đối chứng — tin Zalo của member có ba dòng việc và tên thoả thuận của họ", async () => {
		const thuong = await dungNguoi("vc-nhac-member-tin", "vc-nhac-member-tin");
		const z = zaloGia();
		await noiZalo(thuong.nguoi.id, `Z-${thuong.nguoi.id}`);
		await batBot();
		await lenLichNhac(NOW);
		const hang = await hangCua(thuong.nguoi.id);
		await voiToken(() => chayNhac(hang, { zaloFetcher: z.fetcher, appUrl: APP_URL }));
		const than = z.guiToi(`Z-${thuong.nguoi.id}`).map((g) => g.body.text ?? "")[0] ?? "";
		const daGui = parseNhacPayload((await db.agentTask.findUniqueOrThrow({ where: { id: hang.id } })).payload).daGui ?? [];
		for (const l of ["viec-qua-han", "viec-sap-han", "viec-cho-danh-gia"]) {
			if (!daGui.some((m) => m.loai === l)) throw new Error(`vc: doi chung thieu ${l}`);
		}
		if (!thuong.tenDoiTac.some((t) => than.includes(t))) throw new Error("vc: doi chung thieu ten thoa thuan");
	});

	test("vc-nhac-vai-okr: nguồn việc của bộ gom lọc bằng docDuocDoiTac của @crm/db/vai-doi-tac, không so chuỗi okr", () => {
		const nguon = readFileSync(join(import.meta.dir, "..", "..", "..", "packages", "db", "src", "onboarding-nhac.ts"), "utf8");
		const dung =
			nguon.includes('import { docDuocDoiTac } from "./vai-doi-tac";') &&
			nguon.includes("guiViec(v, tapDoiTac, chon.now)") &&
			!/["']okr["']\s*[!=]==|[!=]==\s*["']okr["']/.test(nguon);
		if (!dung) throw new Error("vc: nhac viec khong dung luat vai cua DA0a");
	});
});

async function dungE9() {
	const b = await gieoNguoi("vc-nhac-b");
	const a = await gieoNguoi("vc-nhac-a");
	const d = await gieoNguoi("vc-nhac-d");
	const x = await gieoNguoi("vc-nhac-x");
	const deal = await thoaThuan("VC Nhac Deal", x.id);
	await db.deal.update({ where: { id: deal.id }, data: { name: "VC Nhac Deal" } });
	const quaHan = await viec({ giao: x.id, lam: b.id, tieuDe: "VC việc quá hạn", hanNgay: han("2026-10-13"), dealId: deal.id });
	const sapHan = await viec({ giao: x.id, lam: b.id, tieuDe: "VC việc sắp hạn", hanNgay: han("2026-10-16"), dealId: deal.id });
	const cho = await viec({ giao: a.id, lam: b.id, tieuDe: "VC việc chờ đánh giá", dealId: deal.id });
	await doi(cho.id, b.id, "CHO_DANH_GIA");
	for (const t of ["d qua han", "d sap han"]) {
		const v = await viec({ giao: x.id, lam: d.id, tieuDe: `VC ${t}`, hanNgay: han("2026-10-13"), dealId: deal.id });
		await doi(v.id, d.id, "XONG");
	}
	const choD = await viec({ giao: d.id, lam: b.id, tieuDe: "VC d cho", dealId: deal.id });
	await doi(choD.id, b.id, "CHO_DANH_GIA");
	await doi(choD.id, d.id, "XONG");
	await gieoKeHoach({ camTrich: x.id, batDau: new Date(NOW.getTime() - 10 * DAY_MS), buoc: [{ nhan: "VC buoc", han: new Date(NOW.getTime() + 2 * DAY_MS), giao: b.id }] });
	return { a, b, d, x, quaHan, sapHan, cho };
}

describe("vc-nhac", () => {
	test("vc-nhac: bộ gom đúng người đúng loại; Zalo cho B có hai việc và tên thoả thuận; Slack cho A có việc chờ đánh giá; một loại hỏng không làm đổ cả lô", async () => {
		const f = await dungE9();
		const kq = await viecCanNhac(db, { now: NOW, cuaSo: "buoi-sang" });
		const loai = (id: string) => (kq.get(id) ?? []).map((v) => v.loai);
		for (const [n, id, l] of [["b", f.b.id, "viec-qua-han"], ["b", f.b.id, "viec-sap-han"], ["a", f.a.id, "viec-cho-danh-gia"]] as const) {
			if (!loai(id).includes(l)) throw new Error(`vc: bo gom sai ${n} ${l}`);
		}
		if (loai(f.d.id).some((l) => l.startsWith("viec-"))) throw new Error("vc: bo gom sai d viec-");
		const z = zaloGia();
		const s = slackGia();
		await noiZalo(f.b.id, `Z-${f.b.id}`);
		await batBot();
		await noiSlack(f.a.id);
		await khopSlack(f.a.id, `S-${f.a.id}`);
		await db.notificationPreference.create({ data: { userId: f.a.id, channel: "SLACK" } });
		await lenLichNhac(NOW);
		for (const id of [f.b.id, f.a.id]) {
			const h = await hangCua(id);
			await voiToken(() => chayNhac(h, { fetcher: s.fetcher, zaloFetcher: z.fetcher, appUrl: APP_URL }));
		}
		const tinB = z.guiToi(`Z-${f.b.id}`).map((g) => g.body.text ?? "");
		if (tinB.length !== 1 || !["VC việc quá hạn", "VC việc sắp hạn", "VC Nhac Deal"].every((c) => (tinB[0] ?? "").includes(c))) {
			throw new Error("vc: tin zalo thieu dong viec");
		}
		const tinA = s.goi.filter((g) => g.url.endsWith("chat.postMessage")).map((g) => g.body.text ?? "");
		if (!tinA.some((t) => t.includes("VC việc chờ đánh giá"))) throw new Error("vc: tin slack thieu viec cho danh gia");
	});

	test("vc-nhac: cách ly — một mục loại lạ trong bộ gom của A không chặn hàng nhắc của B", async () => {
		const f = await dungE9();
		await db.agentTask.deleteMany({ where: { kind: LOAI_VIEC_NHAC } });
		const gomHong: typeof viecCanNhac = async (dbx, chon) => {
			const kq = await viecCanNhac(dbx, chon);
			const cuaA = kq.get(f.a.id) ?? [];
			kq.set(f.a.id, [...cuaA, { loai: "loai-la", viecId: "x" } as unknown as (typeof cuaA)[number]]);
			return kq;
		};
		await lenLichNhac(NOW, gomHong);
		const soB = await db.agentTask.count({ where: { kind: LOAI_VIEC_NHAC, subject: { startsWith: `user:${f.b.id}:` } } });
		if (soB !== 1) throw new Error("vc: mot loai hong lam do ca lo");
	});
});

describe("vc-xong-n", () => {
	test("vc-xong-n: B đóng việc quá hạn qua Zalo, A đóng việc chờ đánh giá; người giao cầm tin chuyển tiếp bị từ chối; trả lần hai báo đã xong; dòng bước vẫn xong", async () => {
		const f = await dungE9();
		const z = zaloGia();
		for (const id of [f.b.id, f.a.id]) await noiZalo(id, `Z-${id}`);
		await batBot();
		await lenLichNhac(NOW);
		for (const id of [f.b.id, f.a.id]) {
			const h = await hangCua(id);
			await voiToken(() => chayNhac(h, { zaloFetcher: z.fetcher, appUrl: APP_URL }));
		}
		const daGui = async (id: string) =>
			parseNhacPayload((await hangCua(id)).payload).daGui ?? [];
		const viTri = async (id: string, loai: string) =>
			(await daGui(id)).findIndex((m) => m.loai === loai) + 1;
		const tra = (userId: string, so: number) =>
			db.$transaction((tx) => xongTheoTinNhac(tx, { userId, so: [so], now: NOW, lienKet: () => null }));
		const vetZalo = (viecId: string) => db.viecVet.count({ where: { viecId, nguon: "zalo", loai: "doi-trang-thai" } });

		const r1 = await tra(f.b.id, await viTri(f.b.id, "viec-qua-han"));
		const v1 = await db.viec.findUniqueOrThrow({ where: { id: f.quaHan.id } });
		if (v1.trangThai !== "XONG" || (await vetZalo(f.quaHan.id)) !== 1 || r1.loai !== "xong" || !r1.vua.some((m) => m.nhan === "VC việc quá hạn")) {
			throw new Error("vc: xong n khong dong viec");
		}
		await tra(f.a.id, await viTri(f.a.id, "viec-cho-danh-gia"));
		if ((await db.viec.findUniqueOrThrow({ where: { id: f.cho.id } })).trangThai !== "XONG") {
			throw new Error("vc: xong n nguoi giao hong");
		}
		const muc = await daGui(f.b.id);
		await db.agentTask.deleteMany({ where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(f.x.id, NOW) } });
		await db.agentTask.create({
			data: {
				kind: LOAI_VIEC_NHAC,
				reason: "thu",
				subject: chuDeNhac(f.x.id, NOW),
				dueAt: NOW,
				priority: 0,
				payload: { muc, daGui: muc, kenh: "zalo" },
			},
		});
		const vetTruoc = await db.viecVet.count({ where: { viecId: f.sapHan.id } });
		const rLa = await tra(f.x.id, await viTri(f.b.id, "viec-sap-han"));
		if (
			(await db.viec.findUniqueOrThrow({ where: { id: f.sapHan.id } })).trangThai !== "CHUA_LAM" ||
			(await db.viecVet.count({ where: { viecId: f.sapHan.id } })) !== vetTruoc ||
			rLa.loai === "xong"
		) {
			throw new Error("vc: xong n nguoi la lot");
		}
		const vetLai = await vetZalo(f.quaHan.id);
		const r2 = await tra(f.b.id, await viTri(f.b.id, "viec-qua-han"));
		if (r2.loai !== "xong" || r2.vua.length !== 0 || r2.truoc.length !== 1 || (await vetZalo(f.quaHan.id)) !== vetLai) {
			throw new Error("vc: xong n ghi hai lan");
		}
		const rBuoc = await tra(f.b.id, await viTri(f.b.id, "buoc-sap-han"));
		expect(rBuoc.loai).toBe("xong");
	});
});
```

Chỗ «người lạ» dùng `x` — người **giao** hai việc của B — cầm tin chuyển tiếp của B: `viec-ghi` cho phép người giao đóng việc (ô G·T), nên chỉ có phép kiểm «người nhắn đúng vai của dòng» ở `tra-loi-nhac.ts` chặn được; một người lạ hẳn thì `viec-ghi` đã chặn, và chiều đỏ (g) sẽ không đo được gì. Lời trả của ca người lạ được kiểm khác lời xác nhận bằng `rLa.loai === "xong"`.

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/nhac-viec.integration.spec.ts -t vc-nhac"` → đỏ `vc: bo gom sai b viec-qua-han`.

- [ ] **Step 3: Bộ gom (`onboarding-nhac.ts`).** Thêm import:

```ts
import {
	banGhiCua,
	CHON_GAN,
	LOAI_NHAC_VIEC,
	type LoaiNhacViec,
	ngayHan,
	TRANG_THAI_MO,
} from "./viec";
```

`THU_TU_NHAC`: chèn `...LOAI_NHAC_VIEC,` ngay sau `...LOAI_NHAC,`; kiểu `satisfies` thêm `| LoaiNhacViec`. Sau `ViecKeHoach`:

```ts
export type NhacViec = {
	loai: LoaiNhacViec;
	viecId: string;
	tieuDe: string;
	han?: string;
	soNgay?: number;
	banGhi: string | null;
};
```

`ViecNhac` thêm `| NhacViec`. Hàm kiểm loại:

```ts
export function laNhacViec(v: ViecNhac): v is NhacViec {
	return (LOAI_NHAC_VIEC as readonly string[]).includes(v.loai);
}
```

Sau `guiCua`:

```ts
function docViec(db: Db, userId: string | undefined) {
	return db.viec.findMany({
		where: {
			trangThai: { in: [...TRANG_THAI_MO] },
			OR: userId
				? [{ nguoiThucHienId: userId }, { nguoiGiaoId: userId }]
				: undefined,
		},
		select: {
			id: true,
			tieuDe: true,
			trangThai: true,
			hanNgay: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" }, take: 1 },
		},
	});
}

type ViecDoc = Awaited<ReturnType<typeof docViec>>[number];

type GuiViec = { userId: string; viec: NhacViec };

function guiViec(v: ViecDoc, thanhVien: Set<string>, now: Date): GuiViec[] {
	const dau = v.gan[0];
	const chung = {
		viecId: v.id,
		tieuDe: v.tieuDe,
		han: v.hanNgay ? ngayHan(v.hanNgay) : undefined,
		banGhi: dau ? banGhiCua(dau).ten : null,
	};
	const ra: GuiViec[] = [];
	if (v.trangThai === "CHO_DANH_GIA" && v.nguoiGiaoId !== v.nguoiThucHienId) {
		ra.push({ userId: v.nguoiGiaoId, viec: { ...chung, loai: "viec-cho-danh-gia" } });
	}
	if (v.hanNgay !== null) {
		const conLai = soNgayVN(now, v.hanNgay);
		if (conLai < 0) {
			ra.push({ userId: v.nguoiThucHienId, viec: { ...chung, loai: "viec-qua-han", soNgay: -conLai } });
		} else if (v.trangThai !== "CHO_DANH_GIA" && conLai <= NHAC.sapHanNgay) {
			ra.push({ userId: v.nguoiThucHienId, viec: { ...chung, loai: "viec-sap-han", soNgay: conLai } });
		}
	}
	return ra.filter((g) => thanhVien.has(g.userId));
}

function gomViec(gui: GuiViec[]): Map<string, NhacViec[]> {
	const ra = new Map<string, NhacViec[]>();
	for (const g of gui) {
		const ds = ra.get(g.userId) ?? [];
		if (!ds.some((v) => v.loai === g.viec.loai && v.viecId === g.viec.viecId)) {
			ds.push(g.viec);
		}
		ra.set(g.userId, ds);
	}
	return ra;
}
```

`soSanh`: trước dòng `if (theoLoai !== 0 || !("planId" in a) ...)` thêm:

```ts
	if (theoLoai === 0 && "viecId" in a && "viecId" in b) {
		return (a.han ?? "~").localeCompare(b.han ?? "~") || a.viecId.localeCompare(b.viecId);
	}
```

`gop`: thêm tham số `viecGiao: Map<string, NhacViec[]>` sau `ai`, thêm `...viecGiao.keys()` vào tập người và `...(viecGiao.get(userId) ?? [])` vào `ds`. `viecCanNhac`: thêm `docViec(db, chon.userId)` vào `Promise.all` (biến `viecGiao`), và truyền vào `gop` (giữ nguyên chuỗi `guiCua(k, tapDoiTac, chon.now)`):

```ts
	return gop(
		gom(keHoach.flatMap((k) => guiCua(k, tapDoiTac, chon.now))),
		okr,
		taiLieu,
		tomTat,
		ai,
		gomViec(viecGiao.flatMap((v) => guiViec(v, tapDoiTac, chon.now))),
		tap,
	);
```

- [ ] **Step 4: Mã mục (`nhac-ke-hoach.ts` của validation).** Import `LOAI_NHAC_VIEC` từ `@crm/db/viec`; nhánh đầu của `z.union([...])`:

```ts
	z.object({ loai: z.enum(LOAI_NHAC_VIEC), viecId: ma }).strict(),
```

- [ ] **Step 5: Agent.** `nhac-ke-hoach.ts`: import `laNhacViec` từ `@crm/db/onboarding-nhac`. Trong `maViec`, ngay trước `if (!laViecOkr(v))`:

```ts
	if (laNhacViec(v)) {
		return mucNhac.parse({ loai: v.loai, viecId: v.viecId });
	}
```

Trong `duongMo`, dòng đầu của hàm trả:

```ts
		if (laNhacViec(v)) {
			return `${ctx.appUrl}/${ctx.slug}/viec?record=viec:${v.viecId}`;
		}
```

`lenLichNhac` — nhận bộ gom làm tham số và cách ly từng mục:

```ts
function maCuaAnToan(userId: string, ds: ViecNhac[]): MucNhac[] {
	return ds.flatMap((v) => {
		try {
			return [maViec(v)];
		} catch (loi) {
			console.error(
				`[nhac] bo muc loai=${v.loai} nguoi=${userId}: ${loi instanceof Error ? loi.message : String(loi)}`,
			);
			return [];
		}
	});
}

export async function lenLichNhac(
	now = new Date(),
	gom: typeof viecCanNhac = viecCanNhac,
): Promise<{ ghi: number }> {
	if (!daToiGioNhac(now)) return { ghi: 0 };
	const viec = await gom(db, { now, cuaSo: "buoi-sang" });
	const hang = [...viec].flatMap(([userId, ds]) => {
		const muc = maCuaAnToan(userId, truKrIm(ds));
		return muc.length === 0
			? []
			: [
					{
						kind: LOAI_VIEC_NHAC,
						reason: LY_DO,
						subject: chuDeNhac(userId, now),
						dueAt: now,
						priority: PRIORITY.nhac,
						payload: { muc },
					},
				];
	});
	if (hang.length === 0) return { ghi: 0 };
	const { count } = await db.agentTask.createMany({
		data: hang,
		skipDuplicates: true,
	});
	return { ghi: count };
}
```

`tin-nhac.ts`: import `laNhacViec`, `type NhacViec`; `TIEU_DE` thêm:

```ts
	"viec-qua-han": "Việc quá hạn",
	"viec-sap-han": "Việc sắp hạn",
	"viec-cho-danh-gia": "Việc chờ bạn đánh giá",
```

thêm hàm:

```ts
function dongViec(
	v: NhacViec,
	so: number,
	url: string | null,
	khuon: KhuonTin,
): string {
	const han = v.han ? ` · hạn ${ngayThang(v.han)}` : "";
	if (khuon === "tron") {
		const banGhi = v.banGhi ? ` · ${v.banGhi}` : "";
		return `${so}. ${v.tieuDe}${han}${banGhi}${url ? ` — ${url}` : ""}`;
	}
	const banGhi = v.banGhi ? ` · ${thoat(v.banGhi)}` : "";
	return `• ${thoat(v.tieuDe)}${han}${banGhi}${url ? ` — <${url}|mở việc>` : ""}`;
}
```

và dòng đầu của `dong`: `if (laNhacViec(v)) return dongViec(v, so, url, khuon);`.

`zalo-config.ts`: `buocDoi` nhận `lyDo: "khong-co-buoc" | "ke-hoach-dong" | "khong-co-viec"` và thêm nhánh `lyDo === "khong-co-viec" ? \`Mục ${so} không còn việc đó.\` :`; thêm `viecKhongCuaBan: (so: string) => \`Mục ${so} là việc của người khác trong tin này, không đánh dấu xong từ đây được.\`,`.

`tra-loi-nhac.ts` — thay phần thân từ `type LyDoDoi` tới hết `xongTheoTinNhac` và cập nhật `lietKe`, `cauTraLoi`:

```ts
type LyDoDoi = "khong-co-buoc" | "ke-hoach-dong" | "khong-co-viec";

type MucXong = { so: number; nhan: string; congTy: string | null };

export type KetTraLoi =
	| { loai: "khong-quyen" }
	| { loai: "chua-co-tin" }
	| { loai: "ngoai-dai"; sai: number[]; tran: number }
	| {
			loai: "khong-phai-buoc";
			muc: { so: number; loai: MucNhac["loai"]; url: string | null }[];
	  }
	| { loai: "viec-khong-cua-ban"; muc: number[] }
	| { loai: "buoc-doi"; muc: { so: number; lyDo: LyDoDoi }[] }
	| { loai: "xong"; vua: MucXong[]; truoc: MucXong[] };
```

(`BuocDoi`, `VET_ZALO`, `XongTheoTinNhacInput`, `coQuyen`, `mucHomNay` giữ nguyên.) Trong `xongTheoTinNhac`, sau `const chon = …`:

```ts
	const laBuoc = (m: MucNhac | undefined) => Boolean(m && "stepId" in m && m.stepId);
	const laViec = (m: MucNhac | undefined): m is Extract<MucNhac, { viecId: string }> =>
		Boolean(m && "viecId" in m);
	const khongPhaiBuoc = chon.flatMap(({ so, muc: m }) =>
		m && !laBuoc(m) && !laViec(m)
			? [{ so, loai: m.loai, url: "planId" in m ? input.lienKet(m.planId) : null }]
			: [],
	);
	if (khongPhaiBuoc.length > 0) {
		return { loai: "khong-phai-buoc", muc: khongPhaiBuoc };
	}
	const dsViec = chon.flatMap(({ so, muc: m }) => (laViec(m) ? [{ so, muc: m }] : []));
	const hangViec = await tx.viec.findMany({
		where: { id: { in: dsViec.map((d) => d.muc.viecId) } },
		select: {
			id: true,
			tieuDe: true,
			trangThai: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			theoDoi: { select: { userId: true } },
			gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" }, take: 1 },
		},
	});
	const viecTheoId = new Map(hangViec.map((v) => [v.id, v]));
	const dungNguoiNhan = (
		m: Extract<MucNhac, { viecId: string }>,
		v: { nguoiGiaoId: string; nguoiThucHienId: string },
		userId: string,
	) =>
		m.loai === "viec-cho-danh-gia"
			? v.nguoiGiaoId === userId
			: v.nguoiThucHienId === userId;
	const khongCuaBan: number[] = [];
	const doi: { so: number; lyDo: LyDoDoi }[] = [];
	for (const { so, muc: m } of dsViec) {
		const v = viecTheoId.get(m.viecId);
		if (!v) {
			doi.push({ so, lyDo: "khong-co-viec" });
			continue;
		}
		if (!dungNguoiNhan(m, v, input.userId)) {
			khongCuaBan.push(so);
			continue;
		}
		if (
			!TRANG_THAI_KHEP.includes(v.trangThai) &&
			quyenDoi(v.trangThai, TrangThaiViec.XONG, vaiCua(v, input.userId)) !== "duoc"
		) {
			khongCuaBan.push(so);
		}
	}
	if (khongCuaBan.length > 0) return { loai: "viec-khong-cua-ban", muc: khongCuaBan };
	if (doi.length > 0) throw new BuocDoi(doi);
	const vua: MucXong[] = [];
	const truoc: MucXong[] = [];
	for (const { so, muc: m } of dsViec) {
		const v = viecTheoId.get(m.viecId);
		if (!v) continue;
		const dong = { so, nhan: v.tieuDe, congTy: v.gan[0] ? banGhiCua(v.gan[0]).ten : null };
		if (TRANG_THAI_KHEP.includes(v.trangThai)) {
			truoc.push(dong);
			continue;
		}
		await doiTrangThai(tx, { viecId: v.id, nguoiId: input.userId, den: TrangThaiViec.XONG, nguon: "zalo", now: input.now });
		vua.push(dong);
	}
	for (const { so, muc: m } of chon) {
		if (!(m && "stepId" in m && m.stepId)) continue;
		const ket = await datBuocXong(
			tx,
			{ stepId: m.stepId, done: true, nguoiId: input.userId, now: input.now },
			VET_ZALO,
		);
		if (ket.ket === "khong-co-buoc" || ket.ket === "ke-hoach-dong") {
			doi.push({ so, lyDo: ket.ket });
			continue;
		}
		const dong = { so, nhan: ket.buoc.label, congTy: ket.buoc.companyName };
		(ket.ket === "da-doi" ? vua : truoc).push(dong);
	}
	if (doi.length > 0) throw new BuocDoi(doi);
	return { loai: "xong", vua, truoc };
```

Khối trên thay toàn bộ phần từ `const khongPhaiBuoc = …` (dòng 79) tới hết hàm (dòng 111); phần đầu hàm (`coQuyen`, `mucHomNay`, `ngoai-dai`, `chon`) giữ nguyên.

Chú ý: điều kiện chặn người nhắn sai vai viết đúng một lần là `if (!dungNguoiNhan(m, v, input.userId)) {` — răng (g) đột biến chuỗi này. Import thêm: `import { TrangThaiViec } from "@crm/db"; import { banGhiCua, CHON_GAN, quyenDoi, TRANG_THAI_KHEP, vaiCua } from "@crm/db/viec"; import { doiTrangThai } from "@crm/db/viec-ghi";`. `lietKe` đổi thành `ds.map((m) => (m.congTy ? \`${m.so} · ${m.nhan} (${m.congTy})\` : \`${m.so} · ${m.nhan}\`)).join("; ")`. `cauTraLoi` thêm nhánh:

```ts
		case "viec-khong-cua-ban":
			return motDong(
				`${ket.muc.map((so) => ZALO.loi.viecKhongCuaBan(String(so))).join(" ")} ${chuaDanhDau}`,
			);
```

- [ ] **Step 6: Chạy xanh** — `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/nhac-viec.integration.spec.ts"` xanh; spec DA0a `bun run test -- "cd apps/agent && bun test test/nhac-vai-chi-okr.integration.spec.ts"` và các spec trả lời Zalo (`bun run test -- "cd apps/agent && bun test test/tra-loi-nhac*.spec.ts test/zalo-*.spec.ts"`) vẫn xanh; `bun run check-types` bắt `THU_TU_DU` nếu thiếu thứ tự.

- [ ] **Step 7: Phá thử (E16 f, g)** — `onboarding-nhac.ts`: `guiViec(v, tapDoiTac, chon.now)` → `guiViec(v, tap, chon.now)` → `-t vc-nhac-vai-okr` đỏ `vc: bo gom co viec doi tac cho vai okr buoi-sang`; hoàn lại. `tra-loi-nhac.ts`: `if (!dungNguoiNhan(m, v, input.userId)) {` → `if (false) {` → `-t vc-xong-n` đỏ `vc: xong n nguoi la lot`; hoàn lại.

- [ ] **Step 8: Commit**

```bash
git add packages/db/src/onboarding-nhac.ts packages/validation/src/nhac-ke-hoach.ts apps/agent/agent/lib/nhac-ke-hoach.ts apps/agent/agent/lib/tin-nhac.ts apps/agent/agent/lib/tra-loi-nhac.ts apps/agent/agent/lib/zalo-config.ts apps/agent/test/nhac-viec.integration.spec.ts
git commit -m "feat(viec-chung): nhắc buổi sáng ba loại việc, xong n đóng việc qua cùng hàm ghi"
```

---

## Task 10: Giao diện — loại «Việc» trong ô soạn và khối «Việc» đầu thẻ Hoạt động

**Files:**
- Create: `apps/app/lib/messages/viec.ts`
- Modify: `apps/app/lib/messages/crm.ts` — xoá ba khoá ô soạn không còn chỗ gọi: `task`, `dueDate`, `addTask` (en dòng 14, 16, 17; vi dòng 347, 349, 350)
- Modify: `apps/app/test/messages-guard.spec.ts` — thêm `"nut.xong",` vào `KHONG_DAU` (cạnh `"moc.xong"`)
- Create: `apps/app/components/viec/trang-thai-viec.tsx`, `o-soan-viec.tsx`, `khoi-viec.tsx`
- Modify: `apps/app/components/crm/timeline/activity-composer.tsx` (toàn tệp, 176 dòng)
- Modify: `apps/app/components/crm/timeline/timeline.tsx` dòng 33 (import), 371–380 (nhánh rỗng), 382–384 (đầu vùng cuộn)
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` dòng 17–24 (`RECORD_KINDS` thêm `"viec"`)
- Modify: `apps/app/lib/trpc/cache.ts` — kiểu `CrmCache` (dòng 24–54) thêm `viec(options?: Options): Promise<void>;`, thân thêm `viec`
- Test: `apps/app/test/viec-o-soan.dom.tsx`

**Interfaces:**
- Consumes: `trpc.viec.create`, `trpc.viec.cuaBanGhi`, `trpc.onboarding.nguoiNhanViec`, `trpc.users.me`; `VIEC`, `NHOM_VIEC` từ `@crm/validation/viec`.
- Produces: `viecMessages(locale: Locale): ViecMessages`; `TrangThaiViecNhan({ trangThai })`, `HanViec({ viec })`, `type ViecDong`, `type TrangThaiViec` (`trang-thai-viec.tsx`); `OSoanViec({ anchor: TimelineAnchor | null; loaiChon?: ReactNode; onXong?: () => void })`; `KhoiViec({ anchor })`, `DongGapViec({ nhan, ds })`; `useCrmCache().viec()`.
- Phục vụ evals: E1b
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/app/test/viec-o-soan.dom.tsx`:

```tsx
import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Goi = { path: string; input: unknown };
const traLoi = new Map<string, (input: unknown) => unknown>();
const daGoi: Goi[] = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			daGoi.push({ path: op.path, input: op.input });
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay(op.input) : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient }),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/deals",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("sonner", () => ({ toast: { error: () => {}, success: () => {} } }));

const { Timeline } = await import("@/components/crm/timeline/timeline");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { activityLabel } = await import("@/lib/activity-presentation");

const V = viecMessages("vi");
const TOI = { id: "u-toi", name: "Phạm Thu Hà", email: "ha@thu.test", image: null };
const BINH = { id: "u-b", name: "Lê Bình", email: "binh@thu.test", image: null };
const DONG_DAU = {
	id: "a1",
	type: "NOTE",
	subject: null,
	body: "Ghi chú đầu tiên",
	occurredAt: "2026-10-12T03:00:00.000Z",
	dueAt: null,
	completedAt: null,
	meta: null,
	createdAt: "2026-10-12T03:00:00.000Z",
	createdBy: { id: TOI.id, name: TOI.name, email: TOI.email, image: null },
	company: null,
	contact: null,
	deal: null,
	planId: null,
	emailThread: null,
	calendarEvent: null,
};
const VIEC_MO = {
	id: "v1",
	tieuDe: "Gửi bảng phí mới cho anh Tuấn",
	trangThai: "CHUA_LAM",
	hanNgay: "2026-10-12",
	quaHan: true,
	nguoiGiao: { ...TOI },
	nguoiThucHien: { ...BINH },
	banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
};

let san: { o: HTMLElement; root: Root } | null = null;

function datMacDinh(khoi: unknown) {
	traLoi.set("activities.timelineCounts", () => ({ all: 1, notes: 1, upcoming: 0, done: 0, email: 0, meetings: 0 }));
	traLoi.set("activities.timeline", (vao) =>
		(vao as { filter?: string })?.filter === "upcoming"
			? { entries: [], nextCursor: null }
			: { entries: [DONG_DAU], nextCursor: null },
	);
	traLoi.set("viec.cuaBanGhi", () => khoi);
	traLoi.set("onboarding.nguoiNhanViec", () => [TOI, BINH]);
	traLoi.set("users.me", () => TOI);
}

async function mo(man: ReactElement) {
	queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	document.body.innerHTML = "";
});

async function nhip() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await nhip();
	}
	throw new Error(`het gio cho ${moTa}`);
}

async function bam(el: Element | null) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		(el as HTMLElement).click();
	});
	await nhip();
}

async function go(el: HTMLInputElement, chu: string) {
	const datGiaTri = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
	await act(async () => {
		datGiaTri?.call(el, chu);
		el.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find((b) => (b.textContent ?? "").trim() === chu) ?? null;

async function moOSoanViec() {
	await cho(() => document.querySelector(`[aria-label="${V.oSoan.loai}"]`) !== null, "loai Viec");
	await bam(document.querySelector(`[aria-label="${V.oSoan.loai}"]`));
	await cho(() => document.querySelector("[data-o-soan-viec] input") !== null, "o soan viec");
}

describe("vc-o-soan-giao", () => {
	test("vc-o-soan-giao: loại «Việc» thay «Việc cần làm», mặc định «Tôi», giao gọi viec.create đúng mốc; khối Việc đứng trước dòng sự kiện", async () => {
		datMacDinh({ mo: [VIEC_MO], daXong: [], daHuy: [] });
		traLoi.set("viec.create", () => ({ id: "v-moi" }));
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await cho(() => document.querySelector("[data-khoi-viec]") !== null, "khoi viec");
		await cho(() => (document.body.textContent ?? "").includes("Ghi chú đầu tiên"), "dong su kien");
		const tieuDeViec = [...document.querySelectorAll("[data-khoi-viec] *")].find((e) => e.textContent === VIEC_MO.tieuDe) ?? null;
		const dongSuKien = document.querySelector("[data-slot=timeline] > li");
		if (!tieuDeViec || !dongSuKien || !(tieuDeViec.compareDocumentPosition(dongSuKien) & Node.DOCUMENT_POSITION_FOLLOWING)) {
			throw new Error("vc: khoi viec khong dung dau the");
		}
		if (document.querySelector(`[aria-label="${activityLabel("TASK", "vi")}"]`) !== null) {
			throw new Error("vc: o soan con viec can lam");
		}
		await moOSoanViec();
		const chonNguoi = document.querySelector(`[role="combobox"][aria-label="${V.oSoan.nguoiThucHien}"]`);
		if ((chonNguoi?.textContent ?? "").trim() !== V.oSoan.toi) throw new Error("vc: mac dinh khong phai toi");
		const oTieuDe = document.querySelector<HTMLInputElement>("[data-o-soan-viec] input");
		if (!oTieuDe) throw new Error("vc: o soan goi sai khong co o tieu de");
		await go(oTieuDe, "Gọi lại anh Tuấn");
		await bam(chonNguoi);
		await cho(() => [...document.querySelectorAll('[role="option"]')].some((o) => o.textContent?.includes(BINH.name)), "lua chon Binh");
		await bam([...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes(BINH.name)) ?? null);
		await bam(nutChu(V.oSoan.chonHan));
		await cho(() => document.querySelector("[data-day] button, button[data-day]") !== null, "lich");
		await bam(document.querySelector("[data-day] button, button[data-day]"));
		await bam(nutChu(V.oSoan.giao));
		await cho(() => daGoi.some((g) => g.path === "viec.create"), "goi create");
		const goi = daGoi.filter((g) => g.path === "viec.create");
		const vao = goi[0]?.input as { dealId?: string; tieuDe?: string; nguoiThucHienId?: string } | undefined;
		if (goi.length !== 1 || vao?.dealId !== "d1" || vao.tieuDe !== "Gọi lại anh Tuấn" || vao.nguoiThucHienId !== BINH.id) {
			throw new Error(`vc: o soan goi sai ${JSON.stringify(goi)}`);
		}
	});

	test("vc-o-soan-giao: bam hai lan — bấm «Giao việc» hai lần liền chỉ gọi viec.create một lần", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		let mo1: (v: unknown) => void = () => {};
		traLoi.set("viec.create", () => new Promise((r) => { mo1 = r; }));
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await moOSoanViec();
		const oTieuDe = document.querySelector<HTMLInputElement>("[data-o-soan-viec] input");
		if (!oTieuDe) throw new Error("khong co o tieu de");
		await go(oTieuDe, "Một việc");
		const nut = nutChu(V.oSoan.giao);
		await act(async () => {
			nut?.click();
			nut?.click();
		});
		await nhip();
		expect(daGoi.filter((g) => g.path === "viec.create")).toHaveLength(1);
		mo1({ id: "v" });
	});

	test("vc-o-soan-giao: đối chứng — bản ghi không có việc nào (kể cả đã khép) thì không hiện khối", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await cho(() => (document.body.textContent ?? "").includes("Ghi chú đầu tiên"), "dong su kien");
		for (let i = 0; i < 5; i += 1) await nhip();
		if (document.querySelector("[data-khoi-viec]") !== null) throw new Error("vc: khoi rong van hien");
	});
});

describe("vc-o-soan-loi", () => {
	test("vc-o-soan-loi: tạo hỏng thì lời lỗi dưới nút, chữ đã gõ còn nguyên", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		traLoi.set("viec.create", () => {
			throw new Error("Máy chủ từ chối việc này");
		});
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await moOSoanViec();
		const oTieuDe = document.querySelector<HTMLInputElement>("[data-o-soan-viec] input");
		if (!oTieuDe) throw new Error("khong co o tieu de");
		await go(oTieuDe, "Việc sẽ hỏng");
		await bam(nutChu(V.oSoan.giao));
		await cho(() => document.querySelector("[data-o-soan-viec] [data-slot=field-error]") !== null, "loi");
		const loi = document.querySelector("[data-o-soan-viec] [data-slot=field-error]")?.textContent ?? "";
		const conChu = document.querySelector<HTMLInputElement>("[data-o-soan-viec] input")?.value;
		if (!loi.includes("Máy chủ từ chối việc này") || conChu !== "Việc sẽ hỏng") {
			throw new Error("vc: o soan mat chu khi loi");
		}
	});
});
```

(`FieldError` của `@crm/ui` mang `data-slot="field-error"`; nếu khác, đọc tệp `packages/ui/src/components/field.tsx` rồi đổi bộ chọn — không thêm thuộc tính riêng vào thành phần dùng chung.)

- [ ] **Step 2: Chạy thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-o-soan.dom.tsx -t 'vc-o-soan-giao|vc-o-soan-loi'` → đỏ (`@/lib/messages/viec` chưa có).

- [ ] **Step 3: Kho chuỗi** — `apps/app/lib/messages/viec.ts` (chỉ chuỗi, không hàm — mọi biến ghép bằng `dien`; khoá nào khai thì phải có chỗ gọi, luật «khoa chet» của `messages-guard.spec.ts`):

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trangThai: {
		CHUA_LAM: "Not started",
		DANG_LAM: "In progress",
		CHO_DANH_GIA: "Awaiting review",
		XONG: "Done",
		HUY: "Cancelled",
	},
	daXong: "Done ({n})",
	daHuy: "Cancelled ({n})",
	khongHan: "No due date",
	oSoan: {
		loai: "Work item",
		tieuDe: "What needs doing?",
		nguoiThucHien: "Assignee",
		toi: "Me",
		han: "Due",
		chonHan: "Pick a date",
		nguoiTheoDoi: "Follower",
		khongTheoDoi: "No one",
		timNguoi: "Search people",
		khongAi: "No one matches",
		giao: "Assign",
		dangGiao: "Assigning…",
		loi: "Couldn't assign. Check the fields and try again.",
	},
	khoi: { tieuDe: "Work" },
};

type ViecMessages = typeof en;

const vi: ViecMessages = {
	trangThai: {
		CHUA_LAM: "Chưa làm",
		DANG_LAM: "Đang làm",
		CHO_DANH_GIA: "Chờ đánh giá",
		XONG: "Đã xong",
		HUY: "Đã huỷ",
	},
	daXong: "Đã xong ({n})",
	daHuy: "Đã huỷ ({n})",
	khongHan: "Không hạn",
	oSoan: {
		loai: "Việc",
		tieuDe: "Cần làm gì?",
		nguoiThucHien: "Người thực hiện",
		toi: "Tôi",
		han: "Hạn",
		chonHan: "Chọn ngày",
		nguoiTheoDoi: "Người theo dõi",
		khongTheoDoi: "Không ai",
		timNguoi: "Tìm người",
		khongAi: "Không có ai khớp",
		giao: "Giao việc",
		dangGiao: "Đang giao…",
		loi: "Chưa giao được. Kiểm lại các ô rồi thử lại.",
	},
	khoi: { tieuDe: "Việc" },
};

const BANG = { en, vi } satisfies Record<Locale, ViecMessages>;

export type { ViecMessages };

export function viecMessages(locale: Locale): ViecMessages {
	return BANG[locale];
}
```

- [ ] **Step 4: Thành phần.** `apps/app/components/viec/trang-thai-viec.tsx`:

```tsx
"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { formatDay } from "@crm/ui/lib/format";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { viecMessages } from "@/lib/messages/viec";
import type { RouterOutputs } from "@/lib/trpc/types";

export type ViecDong = RouterOutputs["viec"]["cuaToi"]["mo"][number];

export type TrangThaiViec = ViecDong["trangThai"];

const NGHIA = {
	CHUA_LAM: "nhap",
	DANG_LAM: "dangChay",
	CHO_DANH_GIA: "cho",
	XONG: "xong",
} as const satisfies Record<Exclude<TrangThaiViec, "HUY">, NghiaTrangThai>;

export function TrangThaiViecNhan({ trangThai }: { trangThai: TrangThaiViec }) {
	const m = viecMessages(useLocale());
	if (trangThai === "HUY") {
		return <span className="text-muted-foreground text-sm">{m.trangThai.HUY}</span>;
	}
	return (
		<StatusIndicator
			tone={toneTheoNghia(NGHIA[trangThai])}
			label={m.trangThai[trangThai]}
		/>
	);
}

export function HanViec({
	viec,
}: {
	viec: Pick<ViecDong, "hanNgay" | "quaHan">;
}) {
	const locale = useLocale();
	const m = viecMessages(locale);
	if (viec.hanNgay === null) {
		return <span className="text-muted-foreground">{m.khongHan}</span>;
	}
	const nhan = formatDay(viec.hanNgay, locale);
	if (viec.quaHan) {
		return <StatusIndicator tone={toneTheoNghia("hong")} label={nhan} />;
	}
	return <span className="text-muted-foreground tabular-nums">{nhan}</span>;
}
```

`apps/app/components/viec/o-soan-viec.tsx`:

```tsx
"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { DatePicker } from "@crm/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { VIEC } from "@crm/validation/viec";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useRef, useState } from "react";
import type { TimelineAnchor } from "@/components/crm/timeline/timeline";
import { viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const TOI = "toi";

const KHONG_AI = "khong-ai";

export function OSoanViec({
	anchor,
	loaiChon,
	onXong,
}: {
	anchor: TimelineAnchor | null;
	loaiChon?: ReactNode;
	onXong?: () => void;
}) {
	const m = viecMessages(useLocale()).oSoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [tieuDe, setTieuDe] = useState("");
	const [nguoi, setNguoi] = useState(TOI);
	const [han, setHan] = useState<string | null>(null);
	const [theoDoi, setTheoDoi] = useState(KHONG_AI);
	const [loi, setLoi] = useState<string | null>(null);
	const dangGui = useRef(false);
	const ds = useQuery(trpc.onboarding.nguoiNhanViec.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const khac = (ds.data ?? [])
		.filter((u) => u.id !== toi.data?.id)
		.map((u) => ({ value: u.id, label: u.name }));

	const tao = useMutation(
		trpc.viec.create.mutationOptions({
			onSuccess: async () => {
				setTieuDe("");
				setNguoi(TOI);
				setHan(null);
				setTheoDoi(KHONG_AI);
				setLoi(null);
				await cache.viec();
				onXong?.();
			},
			onError: (e) => setLoi(e.message || m.loi),
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);

	const gui = () => {
		const chu = tieuDe.trim();
		if (chu === "" || dangGui.current) return;
		dangGui.current = true;
		setLoi(null);
		tao.mutate({
			...(anchor ?? {}),
			tieuDe: chu,
			hanNgay: han,
			nguoiThucHienId: nguoi === TOI ? undefined : nguoi,
			nguoiTheoDoiIds: theoDoi === KHONG_AI ? [] : [theoDoi],
		});
	};

	return (
		<form
			className="flex flex-col gap-3"
			data-o-soan-viec=""
			onSubmit={(event) => {
				event.preventDefault();
				gui();
			}}
		>
			{loaiChon}
			<Input
				aria-label={m.tieuDe}
				autoComplete="off"
				maxLength={VIEC.tieuDeToiDa}
				onChange={(event) => setTieuDe(event.target.value)}
				placeholder={m.tieuDe}
				translate="no"
				value={tieuDe}
			/>
			<div className="grid gap-3 sm:grid-cols-3">
				<Field>
					<FieldLabel>{m.nguoiThucHien}</FieldLabel>
					<Combobox
						aria-label={m.nguoiThucHien}
						empty={m.khongAi}
						onValueChange={setNguoi}
						options={[{ value: TOI, label: m.toi }, ...khac]}
						searchPlaceholder={m.timNguoi}
						translate="no"
						value={nguoi}
					/>
				</Field>
				<Field>
					<FieldLabel>{m.han}</FieldLabel>
					<DatePicker onChange={setHan} placeholder={m.chonHan} value={han} />
				</Field>
				<Field>
					<FieldLabel>{m.nguoiTheoDoi}</FieldLabel>
					<Combobox
						aria-label={m.nguoiTheoDoi}
						empty={m.khongAi}
						onValueChange={setTheoDoi}
						options={[{ value: KHONG_AI, label: m.khongTheoDoi }, ...khac]}
						searchPlaceholder={m.timNguoi}
						translate="no"
						value={theoDoi}
					/>
				</Field>
			</div>
			<div className="flex flex-col items-end gap-1">
				<Button disabled={tao.isPending} type="submit">
					{tao.isPending ? m.dangGiao : m.giao}
				</Button>
				{loi ? <FieldError>{loi}</FieldError> : null}
			</div>
		</form>
	);
}
```

`apps/app/components/viec/khoi-viec.tsx`:

```tsx
"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { useQuery } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import type { TimelineAnchor } from "@/components/crm/timeline/timeline";
import { viecMessages } from "@/lib/messages/viec";
import { useTRPC } from "@/lib/trpc/client";
import { HanViec, TrangThaiViecNhan, type ViecDong } from "./trang-thai-viec";

function DongViec({ viec }: { viec: ViecDong }) {
	const open = useOpenRecord();
	return (
		<Item asChild data-viec={viec.id} size="sm" variant="outline">
			<button onClick={() => open({ kind: "viec", id: viec.id })} type="button">
				<ItemContent>
					<ItemTitle translate="no">{viec.tieuDe}</ItemTitle>
					<ItemDescription>
						<TrangThaiViecNhan trangThai={viec.trangThai} />
						<span aria-hidden> · </span>
						<HanViec viec={viec} />
						<span aria-hidden> · </span>
						<span translate="no">{viec.nguoiThucHien.name}</span>
					</ItemDescription>
				</ItemContent>
			</button>
		</Item>
	);
}

export function DongGapViec({ nhan, ds }: { nhan: string; ds: ViecDong[] }) {
	if (ds.length === 0) return null;
	return (
		<Collapsible data-dong-gap="">
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					{nhan}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ItemGroup>
					{ds.map((v) => (
						<DongViec key={v.id} viec={v} />
					))}
				</ItemGroup>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function KhoiViec({ anchor }: { anchor: TimelineAnchor }) {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const q = useQuery(trpc.viec.cuaBanGhi.queryOptions(anchor));
	const du = q.data;
	if (!du || du.mo.length + du.daXong.length + du.daHuy.length === 0) {
		return null;
	}
	return (
		<section className="flex flex-col gap-2 pt-3" data-khoi-viec="">
			<SectionHeading actions={<Badge variant="secondary">{du.mo.length}</Badge>}>
				{m.khoi.tieuDe}
			</SectionHeading>
			<ItemGroup>
				{du.mo.map((v) => (
					<DongViec key={v.id} viec={v} />
				))}
			</ItemGroup>
			<div className="flex flex-wrap gap-2">
				<DongGapViec nhan={dien(m.daXong, { n: du.daXong.length })} ds={du.daXong} />
				<DongGapViec nhan={dien(m.daHuy, { n: du.daHuy.length })} ds={du.daHuy} />
			</div>
		</section>
	);
}
```

- [ ] **Step 5: Ô soạn và dòng thời gian.** `activity-composer.tsx` viết lại (bỏ `Calendar`, `DayPicker`, `Popover*`, `dateFormat`, `DUE_OPTIONS`, `dueAt`):

```tsx
"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { OSoanViec } from "@/components/viec/o-soan-viec";
import { activityLabel } from "@/lib/activity-presentation";
import { type CrmMessages, crmMessages } from "@/lib/messages/crm";
import { viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ActivityIcon } from "./activity-icon";
import type { TimelineAnchor } from "./timeline";

const LOAI = ["NOTE", "CALL", "EMAIL", "MEETING", "VIEC"] as const;

type LoaiSoan = (typeof LOAI)[number];

type LoaiHoatDong = Exclude<LoaiSoan, "VIEC">;

function placeholders(m: CrmMessages) {
	const c = m.timeline.composer;
	return {
		NOTE: c.placeholder,
		CALL: c.call,
		EMAIL: c.note,
		MEETING: c.meeting,
	} satisfies Record<LoaiHoatDong, string>;
}

export function ActivityComposer({ anchor }: { anchor: TimelineAnchor }) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const v = viecMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const [type, setType] = useState<LoaiSoan>("NOTE");
	const [draft, setDraft] = useState("");
	const text = draft.trim();

	const create = useMutation(
		trpc.activities.create.mutationOptions({
			onSuccess: async () => {
				await cache.activity();
				setDraft("");
			},
			onError: (error) =>
				toast.error(error.data ? error.message : m.timeline.composer.failed),
		}),
	);

	const nhanLoai = (loai: LoaiSoan) =>
		loai === "VIEC" ? v.oSoan.loai : activityLabel(loai, locale);

	const chonLoai = (
		<div className="min-w-0 overflow-x-auto">
			<ToggleGroup
				onValueChange={(next) => next && setType(next as LoaiSoan)}
				size="sm"
				spacing={0}
				type="single"
				value={type}
			>
				{LOAI.map((option) => (
					<ToggleGroupItem aria-label={nhanLoai(option)} key={option} value={option}>
						<ActivityIcon type={option === "VIEC" ? "TASK" : option} />
						{nhanLoai(option)}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);

	if (type === "VIEC") return <OSoanViec anchor={anchor} loaiChon={chonLoai} />;

	const submit = () => {
		if (text === "" || create.isPending) return;
		create.mutate({ ...anchor, type, body: text });
	};

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<InputGroup>
				<InputGroupTextarea
					aria-label={m.timeline.composer.happened}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
							event.preventDefault();
							submit();
						}
						if (event.key === "Escape") setDraft("");
					}}
					placeholder={placeholders(m)[type]}
					value={draft}
				/>
				<InputGroupAddon align="block-end" className="gap-2 border-t">
					{chonLoai}
					{text === "" ? null : (
						<InputGroupButton
							className="ml-auto"
							disabled={create.isPending}
							size="xs"
							type="submit"
							variant="default"
						>
							{create.isPending ? <Spinner /> : null}
							{m.timeline.composer.log(activityLabel(type, locale).toLowerCase())}
						</InputGroupButton>
					)}
				</InputGroupAddon>
			</InputGroup>
		</form>
	);
}
```

`timeline.tsx`: import `import { KhoiViec } from "@/components/viec/khoi-viec";`; trong nhánh rỗng, ngay sau dòng `{thongBaoLamMoi ? … : null}` thêm `<div className="px-5"><KhoiViec anchor={anchor} /></div>`; trong vùng cuộn, ngay sau `{thongBaoLamMoi}` thêm `<KhoiViec anchor={anchor} />`.

`record-stack.ts`: `RECORD_KINDS` thêm `"viec",` sau `"soan",`.

`cache.ts`: kiểu thêm `viec(options?: Options): Promise<void>;`; thân thêm

```ts
		viec: (options) =>
			run(
				[
					trpc.viec.cuaToi.queryKey(),
					trpc.viec.cuaBanGhi.queryKey(),
					trpc.viec.get.queryKey(),
					trpc.viec.lichSu.queryKey(),
				],
				[trpc.dashboard.summary.queryKey()],
				options,
			),
```

`crm.ts`: xoá `task`, `dueDate`, `addTask` ở cả hai thứ tiếng. `messages-guard.spec.ts`: thêm `"nut.xong",` vào `KHONG_DAU` (Task 12 dùng khoá đó; thêm sớm vô hại).

- [ ] **Step 6: Chạy xanh** — lệnh Step 2 xanh; `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/messages-guard.spec.ts ./test/dong-thoi-gian-giu-khi-loi.dom.tsx ./test/dong-thoi-gian-loi-dung-luot.dom.tsx ./test/ke-hoach-sheet.dom.tsx ./test/giai-doan-timeline.dom.tsx` vẫn xanh (nếu một test mock `useTRPC` bằng object tường minh rồi mount `Timeline`, thêm vào object đó `viec: { cuaBanGhi: thuTuc("viec.cuaBanGhi", () => ({ mo: [], daXong: [], daHuy: [] })) }`). **Phá thử:** đổi tạm `if (!du || du.mo.length + du.daXong.length + du.daHuy.length === 0) {` thành `if (!du) {` → ca đối chứng đỏ `vc: khoi rong van hien`; hoàn lại.

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages/viec.ts apps/app/lib/messages/crm.ts apps/app/test/messages-guard.spec.ts apps/app/components/viec/trang-thai-viec.tsx apps/app/components/viec/o-soan-viec.tsx apps/app/components/viec/khoi-viec.tsx apps/app/components/crm/timeline/activity-composer.tsx apps/app/components/crm/timeline/timeline.tsx apps/app/components/crm/record-sheet/record-stack.ts apps/app/lib/trpc/cache.ts apps/app/test/viec-o-soan.dom.tsx
git commit -m "feat(viec-chung): ô soạn giao Việc và khối Việc đầu thẻ Hoạt động"
```

---

## Task 11: Giao diện — màn «Việc của tôi», thanh trái, chặn vai «chỉ OKR»

**Files:**
- Create: `apps/app/app/(app)/[slug]/viec/page.tsx`, `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`
- Create: `apps/app/components/viec/bang-viec.tsx`, `apps/app/components/viec/giao-viec.tsx`
- Modify: `apps/app/lib/messages/viec.ts` (thêm khối `trang`, `nhom`, `cot`, `rong`, `loi`, `khongGan`)
- Modify: `apps/app/lib/search-param-keys.ts` (thêm `viec: { nhom: "nhom" },` sau khối `onboarding`)
- Modify: `apps/app/lib/khung-dieu-huong.ts` dòng 4–15 (`MucRailKey` thêm `"viec"`), dòng 24–36 (`MUC_RAIL` chèn `{ key: "viec", href: "/viec", match: "prefix" },` ngay sau `overview`)
- Modify: `apps/app/lib/messages/khung-ung-dung.ts` (`rail.viec`: en `"My work"`, vi `"Việc của tôi"`)
- Modify: `apps/app/components/app-icon-rail.tsx` dòng 51–63 (`ICON.viec: TaskComplete`, import `@carbon/icons-react/es/TaskComplete`)
- Modify: `apps/app/lib/pham-vi-man.ts` dòng 12–20 (`KHU_DOI_TAC` thêm `"/viec",`)
- Modify: `apps/app/test/khung-dieu-huong.spec.ts` dòng 27 (`toHaveLength(12)`) và thêm một ca
- Test: `apps/app/test/viec-cua-toi.dom.tsx`

**Interfaces:**
- Consumes: `trpc.viec.cuaToi`; `NHOM_VIEC`, `type NhomViec`, `VIEC` từ `@crm/validation/viec`; `TrangThaiViecNhan`, `HanViec`, `DongGapViec`, `OSoanViec` (Task 10).
- Produces: route `/[slug]/viec`; `ViecCuaToi()`; `BangViec({ ds, nhom })`; `GiaoViec()`, `useMoGiaoViec(): () => void` (mở hộp bằng `?new=viec`).
- Phục vụ evals: E7b, E7c
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/app/test/viec-cua-toi.dom.tsx`; khung mock tRPC chép từ `viec-o-soan.dom.tsx` (link `traLoi`/`daGoi`, `mock.module` cho `@/lib/trpc/client`, `@/lib/trpc/cache`, `next/navigation`, `sonner`, hàm `mo`, `nhip`, `cho`, `bam`), thêm:

```tsx
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));

const { default: ViecPage } = await import("@/app/(app)/[slug]/viec/page");
const { viecMessages } = await import("@/lib/messages/viec");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const V = viecMessages("vi");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const urls: string[] = [];

const nguoi = (id: string, name: string) => ({ id, name, image: null });
const viec = (id: string, hanNgay: string | null, quaHan: boolean, trangThai = "CHUA_LAM") => ({
	id,
	tieuDe: `Việc ${id}`,
	trangThai,
	hanNgay,
	quaHan,
	nguoiGiao: nguoi("u-a", "Lê Quang Vinh"),
	nguoiThucHien: nguoi("u-b", "Phạm Thu Hà"),
	banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
});

const DU_E7 = {
	mo: [viec("qh", "2026-10-12", true), viec("hn", "2026-10-14", false), viec("ts", "2026-10-21", false), viec("kh", null, false)],
	daXong: [viec("x", "2026-10-13", false, "XONG")],
	daHuy: [viec("h", "2026-10-13", false, "HUY")],
	demNhom: { "giao-cho-toi": 4, "toi-giao": 1, "dang-theo-doi": 1 },
};

async function moTrang(): Promise<void> {
	queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	const man = await ViecPage();
	await act(async () => {
		root.render(
			<NuqsTestingAdapter onUrlUpdate={(e) => urls.push(e.queryString)}>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

const giuTieuDe = (ca: string) => {
	const chu = document.body.textContent ?? "";
	if (!chu.includes(V.trang.tieuDe) || !chu.includes(V.trang.moTa)) throw new Error(`vc: mat tieu de khi ${ca}`);
};

describe("vc-man-co-viec", () => {
	test("vc-man-co-viec: ba chip có số, nhóm lên đường dẫn, bốn dòng đúng thứ tự, dòng quá hạn đỏ, hai dòng gập đóng sẵn", async () => {
		traLoi.set("viec.cuaToi", () => DU_E7);
		await moTrang();
		await cho(() => document.querySelectorAll("[data-nhom]").length === 3, "chip");
		const so = ["giao-cho-toi", "toi-giao", "dang-theo-doi"].map(
			(n) => document.querySelector(`[data-nhom="${n}"] [data-dem]`)?.textContent,
		);
		const nhan = ["giao-cho-toi", "toi-giao", "dang-theo-doi"].map((n) => document.querySelector(`[data-nhom="${n}"]`)?.textContent ?? "");
		if (JSON.stringify(so) !== JSON.stringify(["4", "1", "1"]) || !nhan[0]?.includes(V.nhom["giao-cho-toi"]) || !nhan[1]?.includes(V.nhom["toi-giao"]) || !nhan[2]?.includes(V.nhom["dang-theo-doi"])) {
			throw new Error("vc: chip nhom sai");
		}
		const thuTu = [...document.querySelectorAll("tr[data-viec]")].map((e) => e.getAttribute("data-viec"));
		if (JSON.stringify(thuTu) !== JSON.stringify(["qh", "hn", "ts", "kh"]) || document.querySelector('tr[data-viec="qh"] [data-tone="error"]') === null || document.querySelectorAll('tr[data-viec] [data-tone="error"]').length !== 1) {
			throw new Error("vc: dong qua han khong do");
		}
		const gap = [...document.querySelectorAll("[data-dong-gap] button")].map((b) => `${b.textContent}|${b.getAttribute("data-state")}`);
		if (JSON.stringify(gap) !== JSON.stringify(["Đã xong (1)|closed", "Đã huỷ (1)|closed"])) throw new Error("vc: dong gap sai");
		await bam(document.querySelector('[data-nhom="toi-giao"]'));
		await cho(() => urls.some((u) => u.includes("nhom=toi-giao")), "duong dan");
		if (!urls.some((u) => u.includes("nhom=toi-giao"))) throw new Error("vc: nhom khong len duong dan");
	});

	test("vc-man-co-viec: đối chứng — không có việc quá hạn thì không dòng nào đỏ", async () => {
		traLoi.set("viec.cuaToi", () => ({ ...DU_E7, mo: DU_E7.mo.filter((v) => !v.quaHan) }));
		await moTrang();
		await cho(() => document.querySelectorAll("tr[data-viec]").length === 3, "ba dong");
		expect(document.querySelectorAll('tr[data-viec] [data-tone="error"]').length).toBe(0);
	});
});

describe("vc-man-trang-thai", () => {
	test("vc-man-trang-thai: chờ tải — khung xương, không vòng quay, tiêu đề giữ", async () => {
		traLoi.set("viec.cuaToi", () => new Promise(() => {}));
		await moTrang();
		await nhip();
		giuTieuDe("cho tai");
		if (document.querySelector("[data-viec-cho-tai]") === null || document.querySelector('[data-slot="spinner"]') !== null) {
			throw new Error("vc: cho tai sai");
		}
	});

	test("vc-man-trang-thai: lỗi — VungTaiLoi có Thử lại, bấm gọi lại", async () => {
		traLoi.set("viec.cuaToi", () => {
			throw new Error("hong");
		});
		await moTrang();
		await cho(() => document.querySelector("[data-vung-tai-loi]") !== null, "vung loi");
		giuTieuDe("loi");
		const truoc = daGoi.filter((g) => g.path === "viec.cuaToi").length;
		const nut = [...document.querySelectorAll("[data-vung-tai-loi] button")].find((b) => (b.textContent ?? "").includes(THU_LAI)) ?? null;
		if (!nut) throw new Error("vc: loi tai sai");
		await bam(nut);
		await cho(() => daGoi.filter((g) => g.path === "viec.cuaToi").length > truoc, "goi lai");
	});

	test("vc-man-trang-thai: rỗng — Empty có lời và nút Giao việc", async () => {
		traLoi.set("viec.cuaToi", () => ({ mo: [], daXong: [], daHuy: [], demNhom: { "giao-cho-toi": 0, "toi-giao": 0, "dang-theo-doi": 0 } }));
		await moTrang();
		await cho(() => document.querySelector('[data-slot="empty"]:not([data-vung-tai-loi])') !== null, "rong");
		giuTieuDe("rong");
		const rong = document.querySelector('[data-slot="empty"]:not([data-vung-tai-loi])');
		const chu = rong?.textContent ?? "";
		if (!chu.includes("Chưa có việc nào giao cho bạn") || ![...(rong?.querySelectorAll("button") ?? [])].some((b) => b.textContent === V.trang.giaoViec)) {
			throw new Error("vc: rong sai");
		}
	});

	test("vc-man-trang-thai: đối chứng — có việc thì không ca nào trong ba ca hiện", async () => {
		traLoi.set("viec.cuaToi", () => DU_E7);
		await moTrang();
		await cho(() => document.querySelectorAll("tr[data-viec]").length === 4, "co viec");
		expect(document.querySelector("[data-viec-cho-tai]")).toBeNull();
		expect(document.querySelector("[data-vung-tai-loi]")).toBeNull();
		expect(document.querySelector('[data-slot="empty"]')).toBeNull();
	});
});
```

(Biến `san`, `queryClient`, các import `NuqsTestingAdapter`, `QueryClientProvider`, `createRoot`, `act`, `LocaleProvider`, `TooltipProvider` như tệp mẫu; `afterEach` dọn thêm `urls.length = 0`.)

- [ ] **Step 2: Chạy thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-cua-toi.dom.tsx -t vc-man-co-viec` (và `-t vc-man-trang-thai`) → đỏ (route chưa có).

- [ ] **Step 3: Kho chuỗi** — thêm vào `en` của `viec.ts`:

```ts
	trang: {
		tieuDe: "My work",
		moTa: "Work assigned to you, work you assigned, and work you follow.",
		giaoViec: "Assign work",
	},
	nhom: {
		"giao-cho-toi": "Assigned to me",
		"toi-giao": "I assigned",
		"dang-theo-doi": "Following",
	},
	cot: {
		viec: "Work",
		trangThai: "Status",
		han: "Due",
		banGhi: "Linked to",
		nguoiGiao: "Assigned by",
		nguoiThucHien: "Assignee",
	},
	rong: {
		"giao-cho-toi": "Nothing assigned to you yet",
		"toi-giao": "You haven't assigned any work",
		"dang-theo-doi": "You aren't following any work",
		moTa: "Assign work from here or from a deal, company, person or 30-day plan.",
	},
	loi: {
		tieuDe: "Couldn't load your work",
		moTa: "The server didn't answer. Try again in a moment.",
	},
	khongGan: "Not linked",
```

và vào `vi`:

```ts
	trang: {
		tieuDe: "Việc của tôi",
		moTa: "Việc người khác giao cho bạn, việc bạn giao, và việc bạn đang theo dõi.",
		giaoViec: "Giao việc",
	},
	nhom: {
		"giao-cho-toi": "Giao cho tôi",
		"toi-giao": "Tôi giao",
		"dang-theo-doi": "Đang theo dõi",
	},
	cot: {
		viec: "Việc",
		trangThai: "Trạng thái",
		han: "Hạn",
		banGhi: "Gắn với",
		nguoiGiao: "Người giao",
		nguoiThucHien: "Người thực hiện",
	},
	rong: {
		"giao-cho-toi": "Chưa có việc nào giao cho bạn",
		"toi-giao": "Bạn chưa giao việc nào",
		"dang-theo-doi": "Bạn chưa theo dõi việc nào",
		moTa: "Giao việc ở đây hoặc từ một thoả thuận, công ty, cá nhân hay kế hoạch 30 ngày.",
	},
	loi: {
		tieuDe: "Không tải được danh sách việc",
		moTa: "Máy chủ chưa trả lời. Thử lại sau giây lát.",
	},
	khongGan: "Chưa gắn bản ghi",
```

- [ ] **Step 4: Màn.** `apps/app/components/viec/bang-viec.tsx`:

```tsx
"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import type { NhomViec } from "@crm/validation/viec";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { HanViec, TrangThaiViecNhan, type ViecDong } from "./trang-thai-viec";

function cot(m: ViecMessages, nhom: NhomViec): SimpleTableColumn[] {
	return [
		{ id: "viec", header: m.cot.viec },
		{ id: "trang-thai", header: m.cot.trangThai, width: "w-40" },
		{ id: "han", header: m.cot.han, width: "w-32" },
		{ id: "gan", header: m.cot.banGhi, className: "hidden lg:table-cell" },
		{
			id: "nguoi",
			header: nhom === "toi-giao" ? m.cot.nguoiThucHien : m.cot.nguoiGiao,
			width: "w-40",
		},
	];
}

export function BangViec({ ds, nhom }: { ds: ViecDong[]; nhom: NhomViec }) {
	const m = viecMessages(useLocale());
	const open = useOpenRecord();
	const nguoi = (v: ViecDong) =>
		nhom === "toi-giao" ? v.nguoiThucHien.name : v.nguoiGiao.name;
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable columns={cot(m, nhom)} surface="page">
					{ds.map((v) => (
						<SimpleTableRow
							clickable
							data-viec={v.id}
							key={v.id}
							onClick={() => open({ kind: "viec", id: v.id })}
						>
							<TableCell className="max-w-0 truncate font-medium">
								<span translate="no">{v.tieuDe}</span>
							</TableCell>
							<TableCell>
								<TrangThaiViecNhan trangThai={v.trangThai} />
							</TableCell>
							<TableCell>
								<HanViec viec={v} />
							</TableCell>
							<TableCell className="hidden max-w-0 truncate text-muted-foreground lg:table-cell">
								<span translate="no">{v.banGhi[0]?.ten ?? m.khongGan}</span>
							</TableCell>
							<TableCell className="truncate text-muted-foreground">
								<span translate="no">{nguoi(v)}</span>
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="gap-2 md:hidden">
				{ds.map((v) => (
					<Item asChild data-viec={v.id} key={v.id} variant="outline">
						<button onClick={() => open({ kind: "viec", id: v.id })} type="button">
							<ItemContent>
								<ItemTitle translate="no">{v.tieuDe}</ItemTitle>
								<ItemDescription>
									<TrangThaiViecNhan trangThai={v.trangThai} />
									<span aria-hidden> · </span>
									<HanViec viec={v} />
								</ItemDescription>
							</ItemContent>
						</button>
					</Item>
				))}
			</ItemGroup>
		</>
	);
}
```

`apps/app/components/viec/giao-viec.tsx`:

```tsx
"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { OSoanViec } from "./o-soan-viec";

const moHop = parseAsStringLiteral(["viec"] as const);

export function useMoGiaoViec(): () => void {
	const [, setMo] = useQueryState(SEARCH_PARAM.dialog.create, moHop);
	return useCallback(() => void setMo("viec"), [setMo]);
}

export function GiaoViec() {
	const m = viecMessages(useLocale());
	const [mo, setMo] = useQueryState(SEARCH_PARAM.dialog.create, moHop);
	return (
		<>
			<Button onClick={() => void setMo("viec")}>{m.trang.giaoViec}</Button>
			<Dialog
				onOpenChange={(tiep) => {
					if (!tiep) void setMo(null);
				}}
				open={mo === "viec"}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{m.trang.giaoViec}</DialogTitle>
						<DialogDescription>{m.rong.moTa}</DialogDescription>
					</DialogHeader>
					<OSoanViec anchor={null} onXong={() => void setMo(null)} />
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{m.oSoan.huy}</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
```

(`oSoan.huy`: thêm vào kho chuỗi — en `"Cancel"`, vi `"Huỷ"`.)

`apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`:

```tsx
"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { NHOM_VIEC, type NhomViec, VIEC } from "@crm/validation/viec";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { BangViec } from "@/components/viec/bang-viec";
import { useMoGiaoViec } from "@/components/viec/giao-viec";
import { DongGapViec } from "@/components/viec/khoi-viec";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";

const nhomParser = parseAsStringLiteral(NHOM_VIEC).withDefault("giao-cho-toi");

export function ViecCuaToi() {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const moGiao = useMoGiaoViec();
	const [nhom, setNhom] = useQueryState(SEARCH_PARAM.viec.nhom, nhomParser);
	const q = useQuery(trpc.viec.cuaToi.queryOptions({ nhom }));

	if (q.isPending) {
		return (
			<div aria-busy="true" className="flex flex-col gap-3" data-viec-cho-tai="">
				<Skeleton className="h-8 w-80" />
				{Array.from({ length: VIEC.soDongCho }, (_, i) => (
					<Skeleton className="h-10 w-full" key={i} />
				))}
			</div>
		);
	}
	if (q.isError) {
		return (
			<VungTaiLoi
				dangTai={q.isFetching}
				moTa={m.loi.moTa}
				onThuLai={() => void q.refetch()}
				tieuDe={m.loi.tieuDe}
			/>
		);
	}
	const du = q.data;
	const rong = du.mo.length + du.daXong.length + du.daHuy.length === 0;
	return (
		<div className="flex flex-col gap-4">
			<div className="max-w-full overflow-x-auto">
				<ToggleGroup
					onValueChange={(v) => {
						if (v) void setNhom(v as NhomViec);
					}}
					size="sm"
					type="single"
					value={nhom}
					variant="outline"
				>
					{NHOM_VIEC.map((n) => (
						<ToggleGroupItem data-nhom={n} key={n} value={n}>
							{m.nhom[n]}
							<span className="text-muted-foreground tabular-nums" data-dem="">
								{du.demNhom[n]}
							</span>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
			{rong ? (
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>{m.rong[nhom]}</EmptyTitle>
						<EmptyDescription>{m.rong.moTa}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={moGiao} variant="outline">
							{m.trang.giaoViec}
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<BangViec ds={du.mo} nhom={nhom} />
					<div className="flex flex-wrap gap-2">
						<DongGapViec nhan={dien(m.daXong, { n: du.daXong.length })} ds={du.daXong} />
						<DongGapViec nhan={dien(m.daHuy, { n: du.daHuy.length })} ds={du.daHuy} />
					</div>
				</>
			)}
		</div>
	);
}
```

`apps/app/app/(app)/[slug]/viec/page.tsx`:

```tsx
import type { Metadata } from "next";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { GiaoViec } from "@/components/viec/giao-viec";
import { getLocale } from "@/lib/locale/server";
import { viecMessages } from "@/lib/messages/viec";
import { ViecCuaToi } from "./viec-cua-toi";

export async function generateMetadata(): Promise<Metadata> {
	return { title: viecMessages(await getLocale()).trang.tieuDe };
}

export default async function ViecPage() {
	const m = viecMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<GiaoViec />
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<ViecCuaToi />
			</PageShellContent>
		</PageShell>
	);
}
```

Thanh trái, proxy, tham số — sửa như mục Files. Ca mới cho `khung-dieu-huong.spec.ts`:

```ts
	it("viec-cua-toi: muc thu hai, ngay sau Tong quan, nhan Viec cua toi/My work, khong co trong thanh trai cua vai okr", () => {
		const viec = muc("viec");
		expect(viec.href).toBe("/viec");
		expect(MUC_RAIL.indexOf(viec)).toBe(1);
		expect(nhanRail(viec, "vi")).toBe("Việc của tôi");
		expect(nhanRail(viec, "en")).toBe("My work");
		expect(mucRailChoVai("okr").some((m) => m.key === "viec")).toBe(false);
		expect(dieuHuongTheoVai("okr", "/onehub/viec")).toEqual({ toi: "/ngoai-pham-vi" });
	});
```

(import `mucRailChoVai`, `dieuHuongTheoVai` từ `@/lib/pham-vi-man`; nếu `dieuHuongTheoVai` nhận pathname không có slug thì truyền `"/viec"` — đọc `isUnder` trước khi chốt.)

- [ ] **Step 5: Chạy xanh** — hai lệnh Step 2 xanh; `cd apps/app && bun test ./test/khung-dieu-huong.spec.ts ./test/messages-guard.spec.ts` xanh. **Phá thử:** trong `viec-cua-toi.tsx` đổi `if (q.isPending) {` thành `if (false) {` → `-t vc-man-trang-thai` đỏ `vc: cho tai sai`; hoàn lại.

- [ ] **Step 6: Commit**

```bash
git add "apps/app/app/(app)/[slug]/viec/page.tsx" "apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx" apps/app/components/viec/bang-viec.tsx apps/app/components/viec/giao-viec.tsx apps/app/lib/messages/viec.ts apps/app/lib/search-param-keys.ts apps/app/lib/khung-dieu-huong.ts apps/app/lib/messages/khung-ung-dung.ts apps/app/components/app-icon-rail.tsx apps/app/lib/pham-vi-man.ts apps/app/test/khung-dieu-huong.spec.ts apps/app/test/viec-cua-toi.dom.tsx
git commit -m "feat(viec-chung): màn Việc của tôi ba nhóm, mục thứ hai thanh trái, chặn vai chỉ OKR"
```

---

## Task 12: Giao diện — khung việc, lịch sử, nút trạng thái, Xoá; dòng việc ở Tổng quan

**Files:**
- Create: `apps/app/components/viec/khung-viec.tsx`, `apps/app/components/viec/lich-su-viec.tsx`, `apps/app/components/viec/dong-viec-tong-quan.tsx`
- Modify: `apps/app/components/crm/record-sheet/record-sheet-host.tsx` (import; một nhánh `shown?.kind === "viec"` sau nhánh `soan`, dòng 66–72)
- Modify: `apps/app/lib/record-href.ts` (`DanhSachBanGhi` thêm `"/viec"`, `kind` thêm `"viec"`)
- Modify: `apps/app/app/(app)/[slug]/dashboard-summary.tsx` dòng 160–186 (thêm dòng `viecChung`), 191–192 (`dangHienQuaHan` cộng `viecQuaHan.length`), nhánh dựng dòng (dòng 297–340)
- Modify: `apps/app/lib/messages/viec.ts` (thêm `nut`, `khung`, `lichSu`, `xoa`)
- Test: `apps/app/test/viec-khung.dom.tsx`

**Interfaces:**
- Consumes: `trpc.viec.get|lichSu|doiTrangThai|sua|doiNguoiThucHien|go|theoDoi|boTheoDoi|xoa`; `RecordSheetFrame`, `lyDoLoi`, `useRecordSheetView`, `useRecordStack`, `RecordLink`.
- Produces: `KhungViec({ viecId })`, `LichSuViec({ viecId })`, `DongViecTongQuan({ viec })`.
- Phục vụ evals: E4b (và bước 2 của E13)
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/app/test/viec-khung.dom.tsx`; khung mock như `viec-o-soan.dom.tsx`, nhưng `sonner` ghi lại toast lỗi:

```tsx
const toastLoi: string[] = [];
mock.module("sonner", () => ({
	toast: { error: (m: string) => toastLoi.push(m), success: () => {} },
}));

const { RecordSheetHost } = await import("@/components/crm/record-sheet/record-sheet-host");
const { viecMessages } = await import("@/lib/messages/viec");
const V = viecMessages("vi");

const nguoi = (id: string, name: string) => ({ id, name, image: null });
function chiTiet(trangThai: string, quyen: string[], xoa: boolean, coLichSu: boolean) {
	return {
		id: "v1",
		tieuDe: "Gọi xác nhận lịch đào tạo",
		trangThai,
		hanNgay: "2026-10-14",
		quaHan: false,
		nguoiGiao: nguoi("u-a", "Lê Quang Vinh"),
		nguoiThucHien: nguoi("u-b", "Phạm Thu Hà"),
		banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
		moTa: null,
		nguoiTheoDoi: [nguoi("u-w", "Nguyễn Hải Yến")],
		coLichSu,
		quyen: { trangThai: quyen, sua: quyen.length > 0, doiNguoi: false, gan: quyen.length > 0, theoDoiKhac: false, dangTheoDoi: false, xoa },
	};
}
const VET = [
	{ id: "e3", luc: "2026-10-13T03:00:00.000Z", nguon: "zalo", loai: "doi-trang-thai", nguoi: { id: "u-b", name: "Phạm Thu Hà" }, vet: { loai: "doi-trang-thai", truoc: { trangThai: "CHUA_LAM" }, sau: { trangThai: "DANG_LAM" } } },
	{ id: "e2", luc: "2026-10-12T03:00:00.000Z", nguon: "web", loai: "doi-trang-thai", nguoi: { id: "u-a", name: "Lê Quang Vinh" }, vet: { loai: "doi-trang-thai", truoc: { trangThai: "DANG_LAM" }, sau: { trangThai: "CHUA_LAM" } } },
	{ id: "e1", luc: "2026-10-11T03:00:00.000Z", nguon: "web", loai: "tao", nguoi: { id: "u-a", name: "Lê Quang Vinh" }, vet: { loai: "tao", truoc: null, sau: { tieuDe: "Gọi xác nhận lịch đào tạo", nguoiThucHien: { id: "u-b", ten: "Phạm Thu Hà" }, hanNgay: "2026-10-14", banGhi: [], nguoiTheoDoi: [] } } },
];

async function moKhung(du: unknown) {
	traLoi.set("viec.get", () => du);
	traLoi.set("viec.lichSu", () => VET);
	traLoi.set("onboarding.nguoiNhanViec", () => []);
	traLoi.set("users.me", () => nguoi("u-b", "Phạm Thu Hà"));
	await mo(<RecordSheetHost />, "?record=viec:v1");
	await cho(() => (document.body.textContent ?? "").includes("Gọi xác nhận lịch đào tạo"), "khung viec");
}

const nutTrangThai = () => [...document.querySelectorAll("[data-nut-trang-thai] button")].map((b) => (b.textContent ?? "").trim());

describe("vc-man-khung", () => {
	test("vc-man-khung: thẻ Lịch sử ba dòng mới nhất trước, dòng Zalo ghi «qua Zalo»", async () => {
		await moKhung(chiTiet("DANG_LAM", ["CHUA_LAM", "CHO_DANH_GIA", "XONG"], false, true));
		const tab = [...document.querySelectorAll('[role="tab"]')].find((t) => (t.textContent ?? "").includes(V.khung.tabLichSu)) ?? null;
		await bam(tab);
		await cho(() => document.querySelectorAll("[data-lich-su-viec] [data-vet]").length === 3, "lich su");
		const dong = [...document.querySelectorAll("[data-lich-su-viec] [data-vet]")];
		if (dong.map((d) => d.getAttribute("data-vet-id")).join(",") !== "e3,e2,e1" || !(dong[0]?.textContent ?? "").includes("qua Zalo")) {
			throw new Error("vc: khung lich su sai");
		}
	});

	test.each([
		["nguoi-thuc-hien", "DANG_LAM", ["CHUA_LAM", "CHO_DANH_GIA", "XONG"], ["Gửi đánh giá", "Xong"]],
		["nguoi-giao-cho-danh-gia", "CHO_DANH_GIA", ["DANG_LAM", "XONG", "HUY"], ["Xong", "Làm lại", "Huỷ"]],
		["nguoi-theo-doi", "DANG_LAM", [], []],
	] as const)("vc-man-khung: nút trạng thái — %s", async (ca, trangThai, quyen, mong) => {
		await moKhung(chiTiet(trangThai, [...quyen], false, true));
		await nhip();
		const co = nutTrangThai();
		const chiXem = document.querySelector("[data-chi-xem]")?.textContent ?? "";
		const dung = JSON.stringify(co) === JSON.stringify(mong) && (mong.length > 0 || chiXem === V.khung.chiXem);
		if (!dung) throw new Error(`vc: nut trang thai sai ${ca}`);
	});

	test("vc-man-khung: bấm Xong gọi doiTrangThai một lần; bị từ chối thì nhãn giữ cũ và toast lời máy chủ", async () => {
		traLoi.set("viec.doiTrangThai", () => {
			throw new Error("Chỉ người giao được đánh dấu xong.");
		});
		await moKhung(chiTiet("DANG_LAM", ["CHUA_LAM", "CHO_DANH_GIA", "XONG"], false, true));
		const xong = [...document.querySelectorAll("[data-nut-trang-thai] button")].find((b) => b.textContent === V.nut.xong) ?? null;
		await bam(xong);
		await cho(() => toastLoi.length > 0, "toast");
		const goi = daGoi.filter((g) => g.path === "viec.doiTrangThai");
		const nhan = document.querySelector("[data-trang-thai-viec]")?.textContent ?? "";
		if (goi.length !== 1 || (goi[0]?.input as { den?: string })?.den !== "XONG" || !nhan.includes(V.trangThai.DANG_LAM) || toastLoi[0] !== "Chỉ người giao được đánh dấu xong.") {
			throw new Error("vc: khung khong lui khi bi tu choi");
		}
	});

	test("vc-man-khung: Xoá chỉ hiện khi chưa có lịch sử, qua hộp hỏi lại, gọi viec.xoa một lần", async () => {
		traLoi.set("viec.xoa", () => ({ id: "v1" }));
		await moKhung(chiTiet("CHUA_LAM", ["DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"], true, false));
		const nutXoa = [...document.querySelectorAll("button")].find((b) => b.textContent === V.nut.xoa) ?? null;
		await bam(nutXoa);
		await cho(() => [...document.querySelectorAll("button")].some((b) => b.textContent === V.xoa.nut), "hop hoi lai");
		await bam([...document.querySelectorAll("button")].find((b) => b.textContent === V.xoa.nut) ?? null);
		await cho(() => daGoi.some((g) => g.path === "viec.xoa"), "goi xoa");
		if (daGoi.filter((g) => g.path === "viec.xoa").length !== 1) throw new Error("vc: xoa khong qua hoi lai");
	});

	test("vc-man-khung: việc đã có lịch sử thì không có nút Xoá", async () => {
		await moKhung(chiTiet("DANG_LAM", ["CHO_DANH_GIA", "XONG", "HUY"], false, true));
		if ([...document.querySelectorAll("button")].some((b) => b.textContent === V.nut.xoa)) {
			throw new Error("vc: nut xoa hien khi co lich su");
		}
	});
});
```

`mo(man, searchParams)` của tệp này truyền `searchParams` vào `<NuqsTestingAdapter hasMemory searchParams={searchParams}>`; `afterEach` dọn thêm `toastLoi.length = 0`.

- [ ] **Step 2: Chạy thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-khung.dom.tsx` → đỏ.

- [ ] **Step 3: Kho chuỗi** — thêm vào `en`:

```ts
	nut: {
		batDau: "Start",
		guiDanhGia: "Send for review",
		xong: "Done",
		lamLai: "Rework",
		huy: "Cancel work",
		moLai: "Reopen",
		xoa: "Delete",
		go: "Unlink",
	},
	khung: {
		tabChiTiet: "Details",
		tabLichSu: "History",
		moTa: "Description",
		khongMoTa: "No description",
		han: "Due",
		nguoiGiao: "Assigned by",
		nguoiThucHien: "Assignee",
		nguoiTheoDoi: "Followers",
		ganVoi: "Linked to",
		rieng: "Private — only the people on it can see it",
		chiXem: "Only the assigner and the assignee can change the status",
		daXong: "Done",
		daHuy: "Cancelled",
		tuTheoDoi: "Follow",
		boTheoDoi: "Unfollow",
		loiLichSu: "Couldn't load the history",
	},
	lichSu: {
		heThong: "System",
		nguon: {
			web: "in the app",
			zalo: "replied on Zalo",
			api: "by the system",
			"chuyen-viec": "through a handover",
		},
		loai: {
			tao: "created the work",
			"doi-trang-thai": "moved it to «{den}»",
			"doi-nguoi-thuc-hien": "reassigned it to {ten}",
			"doi-han": "set the due date to {han}",
			"doi-noi-dung": "edited the content",
			gan: "linked {ten}",
			go: "unlinked {ten}",
			"theo-doi": "added {ten} as a follower",
			"bo-theo-doi": "removed {ten} as a follower",
			"chuyen-viec": "handed it over",
			"go-do-ban-ghi-xoa": "unlinked {ten} because the record was deleted",
		},
	},
	xoa: {
		tieuDe: "Delete this work?",
		than: "It has no history yet. Deleting removes it for good; there is no undo.",
		nut: "Delete work",
		thoi: "Keep it",
	},
```

và `vi`:

```ts
	nut: {
		batDau: "Bắt đầu",
		guiDanhGia: "Gửi đánh giá",
		xong: "Xong",
		lamLai: "Làm lại",
		huy: "Huỷ",
		moLai: "Mở lại",
		xoa: "Xoá",
		go: "Gỡ",
	},
	khung: {
		tabChiTiet: "Chi tiết",
		tabLichSu: "Lịch sử",
		moTa: "Mô tả",
		khongMoTa: "Chưa có mô tả",
		han: "Hạn",
		nguoiGiao: "Người giao",
		nguoiThucHien: "Người thực hiện",
		nguoiTheoDoi: "Người theo dõi",
		ganVoi: "Gắn với",
		rieng: "Việc riêng — chỉ người trong cuộc thấy",
		chiXem: "Chỉ người giao và người thực hiện đổi được trạng thái",
		daXong: "Đã xong",
		daHuy: "Đã huỷ",
		tuTheoDoi: "Theo dõi",
		boTheoDoi: "Bỏ theo dõi",
		loiLichSu: "Không tải được lịch sử",
	},
	lichSu: {
		heThong: "Hệ thống",
		nguon: {
			web: "trên màn",
			zalo: "trả lời qua Zalo",
			api: "do hệ thống",
			"chuyen-viec": "qua Chuyển việc",
		},
		loai: {
			tao: "tạo việc",
			"doi-trang-thai": "chuyển sang «{den}»",
			"doi-nguoi-thuc-hien": "giao lại cho {ten}",
			"doi-han": "đổi hạn sang {han}",
			"doi-noi-dung": "sửa nội dung",
			gan: "gắn {ten}",
			go: "gỡ {ten}",
			"theo-doi": "thêm {ten} vào người theo dõi",
			"bo-theo-doi": "bỏ {ten} khỏi người theo dõi",
			"chuyen-viec": "chuyển việc từ người nghỉ",
			"go-do-ban-ghi-xoa": "gỡ {ten} vì bản ghi đã bị xoá",
		},
	},
	xoa: {
		tieuDe: "Xoá việc này?",
		than: "Việc chưa có lịch sử nào. Xoá là mất hẳn, không hoàn tác.",
		nut: "Xoá việc",
		thoi: "Giữ lại",
	},
```

- [ ] **Step 4: Thành phần.** `apps/app/components/viec/lich-su-viec.tsx`:

```tsx
"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { dateFormat, formatDay } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { VIEC } from "@crm/validation/viec";
import { useQuery } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { DetailSheetBody, DetailSheetSection } from "@/components/detail-sheet";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type DongVet = RouterOutputs["viec"]["lichSu"][number];

const LUC = { dateStyle: "short", timeStyle: "short", timeZone: VIEC.muiGio } as const;

function moTaVet(m: ViecMessages, vet: DongVet["vet"], locale: Locale): string {
	const l = m.lichSu.loai;
	switch (vet.loai) {
		case "tao":
			return l.tao;
		case "doi-trang-thai":
			return dien(l["doi-trang-thai"], { den: m.trangThai[vet.sau.trangThai] });
		case "doi-nguoi-thuc-hien":
			return dien(l["doi-nguoi-thuc-hien"], { ten: vet.sau.ten });
		case "doi-han":
			return dien(l["doi-han"], {
				han: vet.sau.hanNgay ? formatDay(vet.sau.hanNgay, locale) : m.khongHan,
			});
		case "doi-noi-dung":
			return l["doi-noi-dung"];
		case "gan":
			return dien(l.gan, { ten: vet.sau.ten });
		case "go":
			return dien(l.go, { ten: vet.truoc.ten });
		case "theo-doi":
			return dien(l["theo-doi"], { ten: vet.sau.ten });
		case "bo-theo-doi":
			return dien(l["bo-theo-doi"], { ten: vet.truoc.ten });
		case "chuyen-viec":
			return l["chuyen-viec"];
		case "go-do-ban-ghi-xoa":
			return dien(l["go-do-ban-ghi-xoa"], { ten: vet.sau.ten });
	}
}

export function LichSuViec({ viecId }: { viecId: string }) {
	const locale = useLocale();
	const m = viecMessages(locale);
	const trpc = useTRPC();
	const q = useQuery(trpc.viec.lichSu.queryOptions({ id: viecId }));
	if (q.isPending) {
		return (
			<DetailSheetBody>
				<DetailSheetSection>
					<Skeleton className="h-10 w-full" />
				</DetailSheetSection>
			</DetailSheetBody>
		);
	}
	if (q.isError) {
		return (
			<DetailSheetBody>
				<VungTaiLoi
					dangTai={q.isFetching}
					moTa={m.loi.moTa}
					onThuLai={() => void q.refetch()}
					tieuDe={m.khung.loiLichSu}
				/>
			</DetailSheetBody>
		);
	}
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<ItemGroup data-lich-su-viec="">
					{q.data.map((d) => (
						<Item data-vet={d.loai} data-vet-id={d.id} key={d.id} size="sm">
							<ItemContent>
								<ItemTitle>
									<span>
										<span translate="no">{d.nguoi?.name ?? m.lichSu.heThong}</span>{" "}
										{moTaVet(m, d.vet, locale)}
									</span>
								</ItemTitle>
								<ItemDescription>
									{dateFormat(locale, LUC).format(new Date(d.luc))} ·{" "}
									{m.lichSu.nguon[d.nguon]}
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}
```

`apps/app/components/viec/khung-viec.tsx`:

```tsx
"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import { lyDoLoi, RecordSheetFrame } from "@/components/crm/record-sheet/record-parts";
import { useRecordSheetView, useRecordStack } from "@/components/crm/record-sheet/record-stack";
import {
	DetailSheetBody,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { LichSuViec } from "./lich-su-viec";
import { HanViec, type TrangThaiViec, TrangThaiViecNhan } from "./trang-thai-viec";

function ganCua(b: { loai: "company" | "contact" | "deal" | "plan"; id: string }) {
	switch (b.loai) {
		case "company":
			return { companyId: b.id };
		case "contact":
			return { contactId: b.id };
		case "deal":
			return { dealId: b.id };
		case "plan":
			return { planId: b.id };
	}
}

const THU_TU_NUT: Record<TrangThaiViec, readonly TrangThaiViec[]> = {
	CHUA_LAM: ["DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"],
	DANG_LAM: ["CHO_DANH_GIA", "XONG", "HUY"],
	CHO_DANH_GIA: ["XONG", "DANG_LAM", "HUY"],
	XONG: ["DANG_LAM"],
	HUY: ["CHUA_LAM"],
};

function nhanNut(m: ViecMessages, nguon: TrangThaiViec, den: TrangThaiViec): string {
	if (den === "HUY") return m.nut.huy;
	if (den === "XONG") return m.nut.xong;
	if (den === "CHO_DANH_GIA") return m.nut.guiDanhGia;
	if (den === "CHUA_LAM") return m.nut.moLai;
	return nguon === "CHUA_LAM" ? m.nut.batDau : m.nut.lamLai;
}

export function KhungViec({ viecId }: { viecId: string }) {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { close } = useRecordStack();
	const { tab, setTab } = useRecordSheetView("chi-tiet");
	const [hoiXoa, setHoiXoa] = useState(false);
	const q = useQuery(trpc.viec.get.queryOptions({ id: viecId }));
	const dsNguoi = useQuery(trpc.onboarding.nguoiNhanViec.queryOptions());
	const xong = {
		onSuccess: () => void cache.viec(),
		onError: (e: { message: string }) => toast.error(e.message),
	};
	const doi = useMutation(trpc.viec.doiTrangThai.mutationOptions(xong));
	const sua = useMutation(trpc.viec.sua.mutationOptions(xong));
	const doiNguoi = useMutation(trpc.viec.doiNguoiThucHien.mutationOptions(xong));
	const go = useMutation(trpc.viec.go.mutationOptions(xong));
	const theo = useMutation(trpc.viec.theoDoi.mutationOptions(xong));
	const boTheo = useMutation(trpc.viec.boTheoDoi.mutationOptions(xong));
	const xoa = useMutation(
		trpc.viec.xoa.mutationOptions({
			onSuccess: async () => {
				setHoiXoa(false);
				close();
				await cache.viec();
			},
			onError: (e) => toast.error(e.message),
		}),
	);
	const v = q.data;
	const daKhep = v?.trangThai === "XONG" || v?.trangThai === "HUY";
	const nut = v ? THU_TU_NUT[v.trangThai].filter((d) => v.quyen.trangThai.includes(d)) : [];

	const chiTiet = v ? (
		<DetailSheetBody>
			<DetailSheetSection>
				<DetailSheetProperties>
					<DetailSheetProperty label={m.cot.trangThai}>
						<span data-trang-thai-viec="">
							<TrangThaiViecNhan trangThai={v.trangThai} />
						</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.han}>
						{v.quyen.sua && !daKhep ? (
							<DatePicker
								onChange={(han) => sua.mutate({ id: v.id, hanNgay: han })}
								placeholder={m.oSoan.chonHan}
								value={v.hanNgay}
							/>
						) : (
							<HanViec viec={v} />
						)}
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.nguoiGiao}>
						<span translate="no">{v.nguoiGiao.name}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.nguoiThucHien}>
						{v.quyen.doiNguoi ? (
							<Combobox
								aria-label={m.khung.nguoiThucHien}
								empty={m.oSoan.khongAi}
								onValueChange={(id) => doiNguoi.mutate({ id: v.id, nguoiThucHienId: id })}
								options={(dsNguoi.data ?? []).map((u) => ({ value: u.id, label: u.name }))}
								searchPlaceholder={m.oSoan.timNguoi}
								selectedOption={{ value: v.nguoiThucHien.id, label: v.nguoiThucHien.name }}
								translate="no"
								value={v.nguoiThucHien.id}
							/>
						) : (
							<span translate="no">{v.nguoiThucHien.name}</span>
						)}
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.nguoiTheoDoi}>
						<span translate="no">
							{v.nguoiTheoDoi.map((n) => n.name).join(", ") || m.oSoan.khongTheoDoi}
						</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.ganVoi}>
						{v.banGhi.length === 0 ? (
							<span className="text-muted-foreground">{m.khung.rieng}</span>
						) : (
							<span className="flex flex-col gap-1">
								{v.banGhi.map((b) => (
									<span className="flex items-center gap-2" key={`${b.loai}:${b.id}`}>
										<RecordLink id={b.id} kind={b.loai}>
											<span translate="no">{b.ten}</span>
										</RecordLink>
										{v.quyen.gan ? (
											<Button
												onClick={() => go.mutate({ id: v.id, ...ganCua(b) })}
												size="xs"
												variant="ghost"
											>
												{m.nut.go}
											</Button>
										) : null}
									</span>
								))}
							</span>
						)}
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
			<DetailSheetSection title={m.khung.moTa}>
				<p className="whitespace-pre-wrap text-sm" translate="no">
					{v.moTa ?? m.khung.khongMoTa}
				</p>
			</DetailSheetSection>
			{nut.length === 0 && !daKhep ? (
				<DetailSheetSection>
					<p className="text-muted-foreground text-sm" data-chi-xem="">
						{m.khung.chiXem}
					</p>
				</DetailSheetSection>
			) : null}
		</DetailSheetBody>
	) : null;

	return (
		<>
			<RecordSheetFrame
				actions={
					v ? (
						<span className="flex flex-wrap items-center gap-2">
							<span className="flex flex-wrap gap-2" data-nut-trang-thai="">
								{nut.map((den) => (
									<Button
										disabled={doi.isPending}
										key={den}
										onClick={() => doi.mutate({ id: v.id, den })}
										size="sm"
										variant={den === "XONG" ? "default" : "outline"}
									>
										{nhanNut(m, v.trangThai, den)}
									</Button>
								))}
							</span>
							<Button
								disabled={theo.isPending || boTheo.isPending}
								onClick={() =>
									v.quyen.dangTheoDoi ? boTheo.mutate({ id: v.id }) : theo.mutate({ id: v.id })
								}
								size="sm"
								variant="ghost"
							>
								{v.quyen.dangTheoDoi ? m.khung.boTheoDoi : m.khung.tuTheoDoi}
							</Button>
							{v.quyen.xoa ? (
								<Button onClick={() => setHoiXoa(true)} size="sm" variant="outline">
									{m.nut.xoa}
								</Button>
							) : null}
						</span>
					) : null
				}
				description={v ? <span translate="no">{v.banGhi[0]?.ten ?? m.khung.rieng}</span> : undefined}
				error={q.error?.message ?? null}
				loading={q.isPending}
				lyDo={lyDoLoi(q.error)}
				note={
					daKhep && v ? (
						<Badge variant="secondary">
							{v.trangThai === "XONG" ? m.khung.daXong : m.khung.daHuy}
						</Badge>
					) : null
				}
				onRetry={() => void q.refetch()}
				onTabChange={setTab}
				tab={tab}
				tabs={
					v
						? [
								{ value: "chi-tiet", label: m.khung.tabChiTiet, content: chiTiet },
								{ value: "lich-su", label: m.khung.tabLichSu, content: <LichSuViec viecId={viecId} /> },
							]
						: []
				}
				title={v ? <span translate="no">{v.tieuDe}</span> : m.khoi.tieuDe}
			/>
			<ConfirmDialog
				nut={m.xoa.nut}
				onConfirm={() => {
					if (v && !xoa.isPending) xoa.mutate({ id: v.id });
				}}
				onOpenChange={(mo) => {
					if (!mo && !xoa.isPending) setHoiXoa(false);
				}}
				open={hoiXoa}
				pending={xoa.isPending}
				than={m.xoa.than}
				thoi={m.xoa.thoi}
				tieuDe={m.xoa.tieuDe}
			/>
		</>
	);
}
```

`apps/app/components/viec/dong-viec-tong-quan.tsx`:

```tsx
"use client";

import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import type { RouterOutputs } from "@/lib/trpc/types";
import { HanViec } from "./trang-thai-viec";

type ViecQuaHan = RouterOutputs["dashboard"]["summary"]["viecQuaHan"][number];

const CELL = "px-3 py-2.5 align-middle";

export function DongViecTongQuan({ viec }: { viec: ViecQuaHan }) {
	return (
		<SimpleTableRow data-viec-chung={viec.id}>
			<TableCell className={CELL} />
			<TableCell className={CELL}>
				<span className="flex min-w-0 flex-col">
					<RecordLink className="text-foreground" id={viec.id} kind="viec">
						<span translate="no">{viec.tieuDe}</span>
					</RecordLink>
					{viec.banGhi ? (
						<RecordLink id={viec.banGhi.id} kind={viec.banGhi.loai}>
							<span translate="no">{viec.banGhi.ten}</span>
						</RecordLink>
					) : null}
				</span>
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<HanViec viec={{ hanNgay: viec.hanNgay, quaHan: true }} />
			</TableCell>
		</SimpleTableRow>
	);
}
```

`dashboard-summary.tsx`: lấy thêm `viecQuaHan` trong phần destructure; thêm vào `theoHan` một nhánh `...viecQuaHan.map((viec) => ({ loai: "viecChung" as const, id: viec.id, han: Date.parse(\`${viec.hanNgay}T00:00:00\`), viec }))`; `dangHienQuaHan` cộng `viecQuaHan.length`; trong nhánh dựng dòng, trước nhánh cuối (việc cần làm cũ) thêm `d.loai === "viecChung" ? <DongViecTongQuan key={d.id} viec={d.viec} /> :`. `record-sheet-host.tsx`: import `KhungViec` từ `@/components/viec/khung-viec` và nhánh `{shown?.kind === "viec" ? <KhungViec key={recordKey(shown)} viecId={shown.id} /> : null}`. `record-href.ts`: thêm `| "/viec"` và `| "viec"`.

- [ ] **Step 5: Chạy xanh** — lệnh Step 2 xanh; `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/han-viec.dom.tsx ./test/dieu-phoi-va.dom.tsx ./test/may-nhac.dom.tsx ./test/messages-guard.spec.ts` xanh. **Phá thử:** trong `khung-viec.tsx` đổi `const nut = v ? THU_TU_NUT[v.trangThai].filter((d) => v.quyen.trangThai.includes(d)) : [];` thành `const nut = v ? [...THU_TU_NUT[v.trangThai]] : [];` → đỏ `vc: nut trang thai sai nguoi-thuc-hien`; hoàn lại.

- [ ] **Step 6: Commit**

```bash
git add apps/app/components/viec/khung-viec.tsx apps/app/components/viec/lich-su-viec.tsx apps/app/components/viec/dong-viec-tong-quan.tsx apps/app/components/crm/record-sheet/record-sheet-host.tsx apps/app/lib/record-href.ts "apps/app/app/(app)/[slug]/dashboard-summary.tsx" apps/app/lib/messages/viec.ts apps/app/test/viec-khung.dom.tsx
git commit -m "feat(viec-chung): khung việc với lịch sử, nút trạng thái theo quyền, xoá khi chưa có lịch sử"
```

---

## Task 13: Dữ liệu mẫu qua đường ghi thật, từ chối production

**Files:**
- Create: `packages/db/src/kho-cuc-bo.ts`
- Modify: `packages/db/scripts/require-local-db.ts` (dòng 5–11 `LOCAL_HOSTS`, 27–58 lời, 101–107 `hostOf` dời sang `kho-cuc-bo.ts`)
- Create: `packages/db/src/viec-gieo.ts`
- Modify: `packages/db/prisma/seed.ts` dòng 1–14 (import), 1126–1139 (`main`)
- Test: `packages/db/test/viec-gieo.spec.ts`

**Interfaces:**
- Produces: `laKhoCucBo(url: string): boolean`, `loiKhoXa(command: string, url: string, from: string): string` (`@crm/db/kho-cuc-bo` — dùng nội bộ, không cần export trong package.json); `gieoViecMau(db: Db, chon: { databaseUrl: string; nguon: string; now: Date }): Promise<{ soViec: number }>`, `TIEU_DE_MAU: readonly string[]`.
- Phục vụ evals: E14b
- independent: false

- [ ] **Step 1: Viết test đỏ** — `packages/db/test/viec-gieo.spec.ts`:

```ts
import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "../src/client";
import { loiKhoXa } from "../src/kho-cuc-bo";
import { gieoViecMau, TIEU_DE_MAU } from "../src/viec-gieo";
import { WORKSPACE_ID } from "../src/workspace";

const MA = `vgieo${Date.now().toString(36)}`;
const URL_PROD = "postgresql://u:p@ep-prod-123.ap-southeast-1.aws.neon.tech/crm";
const nguoi = [`${MA}-a`, `${MA}-b`];

beforeAll(async () => {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: new Date() },
	});
	for (const id of nguoi) {
		await db.user.create({ data: { id, name: id, email: `${id}@thu.test` } });
		await db.member.create({
			data: { id: `m-${id}`, organizationId: WORKSPACE_ID, userId: id, role: "member", createdAt: new Date(0) },
		});
	}
	const congTy = await db.company.create({ data: { name: `${MA} cty` } });
	await db.deal.create({ data: { name: `${MA} deal`, companyId: congTy.id, ownerId: nguoi[0] ?? "" } });
});

afterAll(async () => {
	await db.viec.deleteMany({ where: { taoBoiId: { in: nguoi } } });
	await db.company.deleteMany({ where: { name: { startsWith: MA } } });
	await db.member.deleteMany({ where: { userId: { in: nguoi } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
});

describe("vc-gieo", () => {
	test("vc-gieo: DATABASE_URL production thì ném lời của require-local-db, không ghi hàng nào", async () => {
		const truoc = await db.viec.count();
		let loi = "";
		try {
			await gieoViecMau(db, { databaseUrl: URL_PROD, nguon: "DATABASE_URL", now: new Date() });
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (loi !== loiKhoXa("db:seed", URL_PROD, "DATABASE_URL") || (await db.viec.count()) !== truoc) {
			throw new Error("vc: gieo chay tren production");
		}
	});

	test("vc-gieo: mọi việc mẫu có vết tạo, đủ năm trạng thái và một việc quá hạn", async () => {
		const now = new Date();
		await gieoViecMau(db, { databaseUrl: process.env.TEST_DATABASE_URL ?? "", nguon: "TEST_DATABASE_URL", now });
		const ds = await db.viec.findMany({
			where: { tieuDe: { in: [...TIEU_DE_MAU] } },
			include: { vet: true },
		});
		if (ds.length === 0 || ds.some((v) => !v.vet.some((e) => e.loai === "tao"))) {
			throw new Error("vc: gieo khong qua duong ghi");
		}
		for (const tt of ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"]) {
			if (!ds.some((v) => v.trangThai === tt)) throw new Error(`vc: gieo thieu ca ${tt}`);
		}
		const dauHomNay = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
		const quaHan = ds.some(
			(v) => v.hanNgay !== null && v.hanNgay < dauHomNay && ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA"].includes(v.trangThai),
		);
		if (!quaHan) throw new Error("vc: gieo thieu ca qua-han");
	});
});
```

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd packages/db && bun test test/viec-gieo.spec.ts"` → đỏ (module chưa có).

- [ ] **Step 3: Mã tối thiểu.** `packages/db/src/kho-cuc-bo.ts` (lời chép nguyên từ `require-local-db.ts` dòng 34–57):

```ts
const LOCAL_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"::1",
	"[::1]",
	"0.0.0.0",
]);

export function hostCua(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

export function laKhoCucBo(url: string): boolean {
	return LOCAL_HOSTS.has(hostCua(url));
}

export function loiKhoXa(command: string, url: string, from: string): string {
	const host = hostCua(url);
	return [
		"",
		`  Refusing to run ${command} against ${host}.`,
		"",
		`  That is not a local database, and ${command} can rewrite or drop`,
		`  schemas. The value came from ${from}.`,
		"",
		from.endsWith(".env.local")
			? [
					"  `.env.local` overrides `.env`, and `vercel env pull` writes",
					"  production credentials into it. Either remove DATABASE_URL from",
					"  that file, or pull Vercel's environment somewhere inert:",
					"",
					"    vercel env pull .env.vercel",
				].join("\n")
			: "  Check which file is winning:  grep -m1 DATABASE_URL .env .env.local",
		"",
		"  To do this deliberately anyway:",
		"",
		`    ALLOW_REMOTE_DB=1 bun run ${command}`,
		"",
	].join("\n");
}
```

`require-local-db.ts`: xoá `LOCAL_HOSTS` và `hostOf`, import `{ hostCua, laKhoCucBo, loiKhoXa } from "../src/kho-cuc-bo"`; thân giữ thứ tự cũ: `const host = hostCua(resolved.url); if (laKhoCucBo(resolved.url)) process.exit(0); if (process.env.ALLOW_REMOTE_DB === "1") { console.warn(\`\n  ⚠ ${command} is running against ${host} — not local.\n\`); process.exit(0); } console.error(loiKhoXa(command, resolved.url, resolved.from)); process.exit(1);`. Kiểm hành vi không đổi: `DATABASE_URL=postgresql://u:p@ep-x.neon.tech/crm bun packages/db/scripts/require-local-db.ts db:seed; echo $?` in đúng lời cũ, mã 1 (chạy trong thư mục không có `.env` cục bộ hoặc đặt tạm biến; không chạm `.env` thật).

`packages/db/src/viec-gieo.ts`:

```ts
import type { Db } from "./client";
import { TrangThaiViec } from "./generated/prisma/enums";
import { laKhoCucBo, loiKhoXa } from "./kho-cuc-bo";
import { docDuocDoiTac } from "./vai-doi-tac";
import type { BanGhiGan } from "./viec";
import { doiTrangThai, taoViec } from "./viec-ghi";
import { WORKSPACE_ID } from "./workspace";

const NGAY_MS = 24 * 60 * 60 * 1000;

type Mau = {
	tieuDe: string;
	hanSauNgay: number | null;
	tuGiao: boolean;
	buoc: { ai: "giao" | "lam"; den: TrangThaiViec }[];
};

const MAU: readonly Mau[] = [
	{ tieuDe: "Gửi bảng phí mới cho đại lý", hanSauNgay: -1, tuGiao: false, buoc: [] },
	{ tieuDe: "Gọi xác nhận lịch đào tạo tuần đầu", hanSauNgay: 0, tuGiao: false, buoc: [{ ai: "lam", den: TrangThaiViec.DANG_LAM }] },
	{ tieuDe: "Kiểm hồ sơ pháp lý bản cuối", hanSauNgay: 3, tuGiao: false, buoc: [{ ai: "lam", den: TrangThaiViec.CHO_DANH_GIA }] },
	{ tieuDe: "Chốt danh sách môi giới tháng này", hanSauNgay: -5, tuGiao: false, buoc: [{ ai: "lam", den: TrangThaiViec.XONG }] },
	{ tieuDe: "Đọc lại ghi chú buổi gặp quý trước", hanSauNgay: null, tuGiao: true, buoc: [] },
	{ tieuDe: "Soạn thư chào đối tác mới", hanSauNgay: 5, tuGiao: false, buoc: [{ ai: "giao", den: TrangThaiViec.DANG_LAM }] },
	{ tieuDe: "Hẹn lịch thăm văn phòng chi nhánh", hanSauNgay: 7, tuGiao: false, buoc: [{ ai: "giao", den: TrangThaiViec.HUY }] },
];

export const TIEU_DE_MAU: readonly string[] = MAU.map((m) => m.tieuDe);

function hanTu(now: Date, sauNgay: number | null): Date | null {
	if (sauNgay === null) return null;
	const ngay = new Date(now.getTime() + sauNgay * NGAY_MS).toISOString().slice(0, 10);
	return new Date(`${ngay}T00:00:00.000Z`);
}

export async function gieoViecMau(
	db: Db,
	chon: { databaseUrl: string; nguon: string; now: Date },
): Promise<{ soViec: number }> {
	if (!laKhoCucBo(chon.databaseUrl) && process.env.ALLOW_REMOTE_DB !== "1") {
		throw new Error(loiKhoXa("db:seed", chon.databaseUrl, chon.nguon));
	}
	if ((await db.viec.count({ where: { tieuDe: { in: [...TIEU_DE_MAU] } } })) > 0) {
		return { soViec: 0 };
	}
	const thanhVien = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		orderBy: { createdAt: "asc" },
		select: { userId: true, role: true },
	});
	const [giao, lam] = thanhVien.filter((m) => docDuocDoiTac(m.role)).map((m) => m.userId);
	if (!giao || !lam) return { soViec: 0 };
	const deal = await db.deal.findFirst({
		where: { archivedAt: null },
		orderBy: { createdAt: "asc" },
		select: { id: true },
	});
	const gan: BanGhiGan[] = deal ? [{ loai: "deal", id: deal.id }] : [];
	for (const mau of MAU) {
		await db.$transaction(async (tx) => {
			const v = await taoViec(tx, {
				nguoiId: giao,
				tieuDe: mau.tieuDe,
				hanNgay: hanTu(chon.now, mau.hanSauNgay),
				nguoiThucHienId: mau.tuGiao ? giao : lam,
				gan,
				nguon: "api",
				now: chon.now,
			});
			for (const b of mau.buoc) {
				await doiTrangThai(tx, {
					viecId: v.id,
					nguoiId: b.ai === "giao" ? giao : lam,
					den: b.den,
					nguon: "api",
					now: chon.now,
				});
			}
		});
	}
	return { soViec: MAU.length };
}
```

`seed.ts`: import `import { gieoViecMau } from "../src/viec-gieo";`; trong `main`, sau `await seedOnboarded();` của nhánh đầy đủ: `const viec = await gieoViecMau(db, { databaseUrl: process.env.DATABASE_URL ?? "", nguon: "DATABASE_URL", now: new Date() });` và thêm `${viec.soViec} việc mẫu` vào dòng `console.log` cuối.

- [ ] **Step 4: Chạy xanh** — lệnh Step 2 xanh. **Phá thử:** trong `viec-gieo.ts` đổi `if (!laKhoCucBo(chon.databaseUrl) && process.env.ALLOW_REMOTE_DB !== "1") {` thành `if (false) {` → đỏ `vc: gieo chay tren production`; hoàn lại (và xoá hàng mẫu nếu lần phá đã ghi — kho thử của lượt tự drop sau `bun run test`).

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/kho-cuc-bo.ts packages/db/scripts/require-local-db.ts packages/db/src/viec-gieo.ts packages/db/prisma/seed.ts packages/db/test/viec-gieo.spec.ts
git commit -m "feat(viec-chung): việc mẫu qua viec-ghi, từ chối kho xa bằng cùng lời của require-local-db"
```

---

## Task 14: Thước `do-nguong.mjs` — hai số của Cổng Đáng

**Files:**
- Create: `_acceptance/viec-chung/rang/do-nguong.mjs`
- Test: `apps/api/test/viec-do-nguong.spec.ts`

**Interfaces:**
- Produces: CLI `node _acceptance/viec-chung/rang/do-nguong.mjs --tu YYYY-MM-DD --den YYYY-MM-DD [--trong <userId,…>]`; in JSON `{ luc, cuaSo: { tu, den, muiGio }, viecGiaoNguoiKhac: { tong, roiChuaLamDungHan, tiLe }, viecDoiTacTaiVaiChiOkr, luuY }`; mã thoát 0, hoặc 2 khi `viecDoiTacTaiVaiChiOkr > 0` hay không đo được.
- Phục vụ evals: E14 (chiều đỏ ở E16 j, l)
- independent: false

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/viec-do-nguong.spec.ts`:

```ts
import { afterAll, beforeAll, describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, type TrangThaiViec } from "@crm/db";
import { doiTrangThai, taoViec } from "@crm/db/viec-ghi";
import { doiVai, donDep, gieoCongTy, moXuong } from "./support/ke-hoach-gieo";
import { donViec, nguoi } from "./support/viec-gieo";

const THUOC = join(import.meta.dir, "..", "..", "..", "_acceptance", "viec-chung", "rang", "do-nguong.mjs");
const TU = "2026-03-02";
const DEN = "2026-03-15";
const vn = (luc: string) => new Date(`${luc}+07:00`);
const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

beforeAll(moXuong);
afterAll(async () => {
	await donViec();
	await donDep();
});

function chay(trong: string[]) {
	const r = spawnSync("node", [THUOC, "--tu", TU, "--den", DEN, "--trong", trong.join(",")], {
		env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
		encoding: "utf8",
	});
	return { ma: r.status, json: r.status === 0 || r.status === 2 ? JSON.parse(r.stdout || "{}") : null, ra: `${r.stdout}\n${r.stderr}` };
}

async function vanTay(ids: string[]): Promise<string> {
	const hang = await db.$queryRaw<{ v: string | null }[]>`
		SELECT md5(
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM viec t WHERE t."taoBoiId" = ANY(${ids})), '') ||
			coalesce((SELECT string_agg(e::text, '' ORDER BY e.id) FROM "viecVet" e JOIN viec t ON t.id = e."viecId" WHERE t."taoBoiId" = ANY(${ids})), '')
		) AS v`;
	return hang[0]?.v ?? "";
}

describe("vc-thuoc", () => {
	test("vc-thuoc: đếm đúng đáp án viết trước, thấy vai okr cài trực tiếp, bỏ việc đã khép, chỉ đọc", async () => {
		const src = readFileSync(THUOC, "utf8");
		if (!src.includes("import.meta.url") || /\/Users\/|\/home\//.test(src)) throw new Error("vc: thuoc ghi cung goc kho");
		const a = await nguoi("vc-th-a", "member");
		const b = await nguoi("vc-th-b", "member");
		const w = await nguoi("vc-th-w", "member");
		const congTy = await gieoCongTy();
		const deal = await db.deal.create({ data: { name: "vc-th deal", companyId: congTy.id, ownerId: a.id } });
		const gan = [{ loai: "deal" as const, id: deal.id }];
		const tao = (tieuDe: string, lam: string, hanNgay: Date | null, luc = vn("2026-03-03T10:00:00")) =>
			db.$transaction((tx) => taoViec(tx, { nguoiId: a.id, tieuDe, nguoiThucHienId: lam, hanNgay, gan, nguon: "web", now: luc }));
		const doi = (viecId: string, ai: string, den: TrangThaiViec, luc: Date) =>
			db.$transaction((tx) => doiTrangThai(tx, { viecId, nguoiId: ai, den, nguon: "web", now: luc }));
		const t1 = await tao("vc-th truoc han 1", b.id, han("2026-03-10"));
		await doi(t1.id, b.id, "DANG_LAM", vn("2026-03-05T09:00:00"));
		const t2 = await tao("vc-th truoc han 2", b.id, han("2026-03-12"));
		await doi(t2.id, b.id, "XONG", vn("2026-03-06T09:00:00"));
		const t3 = await tao("vc-th dung ngay 23h", b.id, han("2026-03-10"));
		await doi(t3.id, b.id, "DANG_LAM", vn("2026-03-10T23:00:00"));
		const t4 = await tao("vc-th sau han", b.id, han("2026-03-10"));
		await doi(t4.id, b.id, "DANG_LAM", vn("2026-03-11T10:00:00"));
		const t5 = await tao("vc-th chua chuyen", b.id, han("2026-03-10"));
		const t6 = await tao("vc-th khong han", b.id, null);
		await doi(t6.id, b.id, "DANG_LAM", vn("2026-03-08T09:00:00"));
		const t7 = await tao("vc-th giao bat dau", b.id, han("2026-03-12"));
		await doi(t7.id, a.id, "DANG_LAM", vn("2026-03-05T09:00:00"));
		const t8 = await tao("vc-th giao huy", b.id, han("2026-03-12"));
		await doi(t8.id, a.id, "HUY", vn("2026-03-05T09:00:00"));
		await tao("vc-th tu giao 1", a.id, han("2026-03-10"));
		await tao("vc-th tu giao 2", a.id, null);
		await tao("vc-th ngoai cua so", b.id, han("2026-02-25"), vn("2026-02-20T10:00:00"));
		const truoc = await vanTay([a.id]);
		const k0 = chay([a.id]);
		const g = k0.json?.viecGiaoNguoiKhac;
		if (k0.ma !== 0 || g?.tong !== 7 || g?.roiChuaLamDungHan !== 4 || g?.tiLe !== 0.5714) {
			throw new Error(`vc: thuoc dem sai dung han ${JSON.stringify(k0.json)} ${k0.ra.slice(-400)}`);
		}
		if (k0.json?.viecDoiTacTaiVaiChiOkr !== 0) throw new Error("vc: thuoc khong thay vai okr doi chung");
		await db.viecTheoDoi.create({ data: { viecId: t2.id, userId: w.id } });
		await doiVai(w.id, "okr");
		const kKhep = chay([a.id]);
		if (kKhep.json?.viecDoiTacTaiVaiChiOkr !== 0 || kKhep.ma !== 0) throw new Error("vc: thuoc dem viec da khep");
		await db.viecTheoDoi.create({ data: { viecId: t5.id, userId: w.id } });
		const k1 = chay([a.id]);
		if (k1.json?.viecDoiTacTaiVaiChiOkr !== 1 || k1.ma !== 2) throw new Error("vc: thuoc khong thay vai okr");
		const sau = await vanTay([a.id]);
		if (truoc !== sau) throw new Error("vc: thuoc ghi vao kho");
	}, 120_000);
});
```

(Vân tay lấy sau khi cài theo dõi thì sẽ khác vì `viecTheoDoi` không nằm trong vân tay — vân tay chỉ đọc `viec` và `viecVet`, hai bảng mà thước có thể chạm.)

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/api && bun test test/viec-do-nguong.spec.ts"` → đỏ (thước chưa có).

- [ ] **Step 3: Viết thước** — `_acceptance/viec-chung/rang/do-nguong.mjs`:

```js
#!/usr/bin/env node
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const MUI_GIO = "Asia/Ho_Chi_Minh";
const VAI_CHI_OKR = "okr";
const WORKSPACE_ID = "workspace";
const TRANG_THAI_MO = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA"];
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const CHU_SO_TI_LE = 4;
const MA_KHONG_DO = 2;
const MA_VAI_OKR = 2;

const SQL = {
	giaoNguoiKhac: `WITH cua AS (
			SELECT (($1::date)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS tu,
				((($2::date) + 1)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS den
		)
		SELECT count(*)::int AS tong,
			count(*) FILTER (WHERE v."roiChuaLamLuc" IS NOT NULL AND (
				(v."hanNgay" IS NOT NULL AND v."roiChuaLamLuc" < ((((((v."hanNgay" AT TIME ZONE 'UTC') AT TIME ZONE $3)::date + 1)::timestamp) AT TIME ZONE $3) AT TIME ZONE 'UTC'))
				OR (v."hanNgay" IS NULL AND v."roiChuaLamLuc" >= cua.tu AND v."roiChuaLamLuc" < cua.den)
			))::int AS dung
		FROM viec v, cua
		WHERE v."taoLuc" >= cua.tu AND v."taoLuc" < cua.den
			AND v."nguoiThucHienId" <> v."taoBoiId"
			AND NOT (v."trangThai" = 'HUY' AND v."roiChuaLamLuc" IS NULL)
			AND ($4::text[] IS NULL OR v."taoBoiId" = ANY($4))`,
	vaiChiOkr: `SELECT count(DISTINCT v.id)::int AS so FROM viec v
		WHERE v."trangThai"::text = ANY($3)
			AND EXISTS (SELECT 1 FROM "viecGan" g WHERE g."viecId" = v.id)
			AND EXISTS (SELECT 1 FROM "member" m WHERE m."organizationId" = $1 AND m.role = $2
				AND (m."userId" = v."nguoiThucHienId"
					OR m."userId" IN (SELECT t."userId" FROM "viecTheoDoi" t WHERE t."viecId" = v.id)))
			AND ($4::text[] IS NULL OR v."taoBoiId" = ANY($4))`,
};

function doc(argv, ten) {
	const i = argv.indexOf(ten);
	return i === -1 ? null : (argv[i + 1] ?? "");
}

function khongDo(cau) {
	console.error(`do-nguong: ${cau}`);
	process.exit(MA_KHONG_DO);
}

async function main() {
	const argv = process.argv.slice(2);
	const tu = doc(argv, "--tu");
	const den = doc(argv, "--den");
	if (!tu || !den || !NGAY.test(tu) || !NGAY.test(den)) {
		khongDo("can --tu va --den dang YYYY-MM-DD (ngay gio VN)");
	}
	const trongChu = doc(argv, "--trong");
	const trong = trongChu === null ? null : trongChu.split(",").filter((m) => m !== "");
	const url = process.env.DATABASE_URL;
	if (!url) khongDo("thieu DATABASE_URL trong moi truong");
	const client = new pg.Client({
		connectionString: url,
		options: "-c default_transaction_read_only=on",
	});
	await client.connect();
	try {
		await client.query("BEGIN READ ONLY");
		const giao = await client.query(SQL.giaoNguoiKhac, [tu, den, MUI_GIO, trong]);
		const vai = await client.query(SQL.vaiChiOkr, [WORKSPACE_ID, VAI_CHI_OKR, TRANG_THAI_MO, trong]);
		await client.query("ROLLBACK");
		const tong = giao.rows[0]?.tong ?? 0;
		const dung = giao.rows[0]?.dung ?? 0;
		const ket = {
			luc: new Date().toISOString(),
			cuaSo: { tu, den, muiGio: MUI_GIO },
			viecGiaoNguoiKhac: {
				tong,
				roiChuaLamDungHan: dung,
				tiLe: tong === 0 ? null : Number((dung / tong).toFixed(CHU_SO_TI_LE)),
			},
			viecDoiTacTaiVaiChiOkr: vai.rows[0]?.so ?? 0,
			luuY: "tong bo viec nguoi giao Huy khi roiChuaLamLuc con trong; vai doc o thoi diem chay",
		};
		console.log(JSON.stringify(ket, null, 2));
		process.exit(ket.viecDoiTacTaiVaiChiOkr === 0 ? 0 : MA_VAI_OKR);
	} finally {
		await client.end();
	}
}

main().catch((loi) => khongDo(loi.message));
```

Chuỗi `AT TIME ZONE $3)::date + 1)` chỉ có ở vế hạn (vế cửa sổ viết `(($2::date) + 1)`), để răng (j) thay đúng một chỗ.

- [ ] **Step 4: Chạy xanh** — lệnh Step 2 xanh. **Phá thử (E16 j):** đổi `AT TIME ZONE $3)::date + 1)` thành `AT TIME ZONE $3)::date + 2)` → đỏ `vc: thuoc dem sai dung han` (ca «sau hạn» lọt vào); hoàn lại.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/viec-chung/rang/do-nguong.mjs apps/api/test/viec-do-nguong.spec.ts
git commit -m "test(viec-chung): thước chỉ đọc cho tỉ lệ rời Chưa làm đúng hạn và việc đối tác tới vai chỉ OKR"
```

---

## Task 15: Phép đo màn trên bản chạy thật và sàn thiết kế

**Files:**
- Create: `_acceptance/viec-chung/rang/man.mjs`
- Phục vụ evals: E13, E13b
- independent: false

**Interfaces:**
- Consumes: `moDo`, `chieuDo`, `chay`, `RONG` của `_acceptance/kho-tai-lieu/rang/man-lib.mjs`; `taoViec` của `packages/db/src/viec-ghi.ts`; kho chuỗi `apps/app/lib/messages/viec.ts`.
- Produces: in `viec-chung man: dat` và bốn ảnh `vc-viec-cua-toi-1280.png`, `vc-khung-viec-1280.png`, `vc-o-soan-1280.png`, `vc-viec-cua-toi-375.png` vào `BANG_CHUNG`.

- [ ] **Step 1: Viết phép đo** — `_acceptance/viec-chung/rang/man.mjs`:

```js
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "viec-chung";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const NGAY_MS = 24 * 60 * 60 * 1000;

const CAY_DO = {
	nhan: "ban sao an the Lich su bang CSS",
	tenCay: "vc-man-chieu-do",
	chiBuoc: "2",
	tep: "packages/ui/src/styles/globals.css",
	cam: (s) => `${s}\n[role="tab"][id$="-trigger-lich-su"]{display:none!important}\n`,
	dauVet: '[role="tab"][id$="-trigger-lich-su"]{display:none!important}',
	ghim: /vc man: thieu lich su/,
};

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (process.argv.includes("--chieu-do")) await lib.chieuDo(TEP_NAY, CAY_DO);

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { viecMessages } = await import(join(GOC, "apps/app/lib/messages/viec.ts"));
const { taoViec } = await import(join(GOC, "packages/db/src/viec-ghi.ts"));
const V = viecMessages("vi");
const d = await lib.moDo();
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

function ngayHan(soNgay) {
	const vn = new Date(Date.now() + 7 * 60 * 60 * 1000 + soNgay * NGAY_MS);
	return new Date(`${vn.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`vc man: khong thay ${moTa}`);
	}
}

async function bamChu(t, chu, goc = "body") {
	const nut = await t.evaluateHandle(
		(c, g) =>
			[...document.querySelectorAll(`${g} button, ${g} [role="tab"], ${g} [role="option"]`)].find(
				(b) => (b.textContent ?? "").trim() === c && b.offsetParent !== null,
			) ?? null,
		chu,
		goc,
	);
	if (!(await nut.evaluate((x) => Boolean(x)))) return false;
	await nut.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await nut.click();
	await cho(300);
	return true;
}

try {
	const chu = await d.nguoiMoi("vcm", "member", "Phạm Thu Hà");
	const giao = await d.nguoiMoi("vcg", "member", "Lê Quang Vinh");
	await d.batTrinhDuyet(chu.cookie);
	const congTy = await d.db.company.create({ data: { name: `Công ty An Phát ${lib.MA}` } });
	const deal = await d.db.deal.create({
		data: { name: `Thoả thuận An Phát ${lib.MA}`, companyId: congTy.id, ownerId: chu.id },
	});
	const gan = [{ loai: "deal", id: deal.id }];
	for (const [tieuDe, soNgay] of [
		[`Gửi bảng phí ${lib.MA}`, -2],
		[`Gọi xác nhận ${lib.MA}`, 0],
	]) {
		await d.db.$transaction((tx) =>
			taoViec(tx, {
				nguoiId: giao.id,
				tieuDe,
				nguoiThucHienId: chu.id,
				hanNgay: ngayHan(soNgay),
				gan,
				nguon: "web",
				now: new Date(),
			}),
		);
	}

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, "/viec");
			await choThay(t, () => document.querySelectorAll("[data-nhom] [data-dem]").length === 3, null, "ba chip co so");
			const doDo = await t.evaluate(() => document.querySelector('tr[data-viec] [data-tone="error"]') !== null);
			if (!doDo) loi.push("dong qua han khong co data-tone=error");
			await d.chup(t, "vc-viec-cua-toi-1280.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, "/viec");
			await choThay(t, () => document.querySelector("tr[data-viec]") !== null, null, "dong viec");
			await t.click("tr[data-viec]");
			await choThay(t, () => decodeURIComponent(location.search).includes("record=viec:"), null, "khung viec tren duong dan");
			if (!(await bamChu(t, V.nut.batDau))) loi.push("khong co nut Bat dau");
			await choThay(t, (c) => (document.querySelector("[data-trang-thai-viec]")?.textContent ?? "").includes(c), V.trangThai.DANG_LAM, "nhan Dang lam");
			if (!(await bamChu(t, V.khung.tabLichSu))) {
				loi.push("vc man: thieu lich su");
			} else {
				await choThay(t, () => document.querySelector('[data-lich-su-viec] [data-vet="doi-trang-thai"]') !== null, null, "dong doi trang thai");
			}
			await d.chup(t, "vc-khung-viec-1280.png");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const tieuDe = `Gửi hồ sơ cho ${lib.MA}`;
			const t = await d.moTrang(chu.cookie, KHO_RONG, `/deals?record=deal:${deal.id}&tab=activity`);
			await choThay(t, (c) => document.querySelector(`[aria-label="${c}"]`) !== null, V.oSoan.loai, "loai Viec");
			await t.click(`[aria-label="${V.oSoan.loai}"]`);
			await choThay(t, () => document.querySelector("[data-o-soan-viec] input") !== null, null, "o soan viec");
			await t.type("[data-o-soan-viec] input", tieuDe);
			await t.click(`[role="combobox"][aria-label="${V.oSoan.nguoiThucHien}"]`);
			if (!(await bamChu(t, giao.ten))) loi.push("khong chon duoc nguoi thuc hien");
			if (!(await bamChu(t, V.oSoan.giao))) loi.push("khong co nut Giao viec");
			await choThay(t, (c) => (document.querySelector("[data-khoi-viec]")?.textContent ?? "").includes(c), tieuDe, "khoi Viec co viec vua giao");
			await d.chup(t, "vc-o-soan-1280.png");
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_HEP, "/viec");
			await choThay(t, () => document.querySelectorAll('[data-slot="item"][data-viec]').length >= 2, null, "the dong");
			const tran = await t.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
			if (tran > 0) loi.push(`cuon ngang ${tran}px`);
			await d.chup(t, "vc-viec-cua-toi-375.png");
			await t.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
```

(Nếu `d.moTrang` của `man-lib.mjs` nhận đường không có slug và tự ghép — như `vong-doi-mot-cach-cat/rang/man.mjs` gọi `/deals?...` — giữ nguyên; `d.chup`, `d.nguoiMoi`, `d.batTrinhDuyet`, `d.chayBuoc`, `d.dat`, `d.ket`, `d.khongDoDuoc` là API sẵn của thư viện.)

- [ ] **Step 2: Chạy** — `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/viec-chung/rang/man.mjs"` → in `viec-chung man: dat`, mã 0, bốn ảnh trong `.acceptance-runs/viec-chung/evidence/`. Xem tận mắt bốn ảnh trước khi đi tiếp.

- [ ] **Step 3: Chiều đỏ (MEASURE-BIRTH)** — `bun _acceptance/viec-chung/rang/man.mjs --chieu-do` → bản sao ẩn thẻ «Lịch sử» bằng CSS, bước 2 đỏ, thư viện in `chieu do: DO DUNG GHIM: ma 1, in «vc man: thieu lich su»` và thoát 0.

- [ ] **Step 4: Sàn thiết kế (E13b)** — chạy nguyên văn lệnh `vc_san_thiet_ke` của `_acceptance/config.yaml` dòng 2472 (vòng `git ls-files` qua các `.tsx` của `viec`, `components/viec`, `activity-composer.tsx`, `timeline.tsx` rồi `design-gate.mjs --mode static`) → mã 0. Tệp nào vi phạm thì sửa theo bảng «Dấu hiệu vẽ tay», không tắt luật. **Chiều đỏ:** `git worktree add --detach /private/tmp/vc-san-do HEAD`, trong bản sao tạo `apps/app/components/viec/thu-san.tsx` chứa `export function ThuSan() { return <div className="rounded-[7px]" />; }`, `git -C /private/tmp/vc-san-do add apps/app/components/viec/thu-san.tsx`, chạy cùng lệnh với `cwd` là bản sao → mã khác 0 nêu `thu-san.tsx`; `git worktree remove --force /private/tmp/vc-san-do`.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/viec-chung/rang/man.mjs
git commit -m "test(viec-chung): phép đo màn Việc của tôi, khung việc, ô soạn ở 1280 và 375"
```

---

## Task 16: Răng đột biến — 13 cặp

**Files:**
- Create: `_acceptance/viec-chung/rang/dot-bien.mjs`
- Phục vụ evals: E16
- independent: false

**Interfaces:**
- Consumes: `dungBanSao`, `goBanSao`, `thayMotLan`, `KhongDo`, `GOC` của `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs`; mười hai lệnh `vc_*` (Task 2–14).

- [ ] **Step 1: Viết răng** — `_acceptance/viec-chung/rang/dot-bien.mjs`:

```js
import { spawnSync } from "node:child_process";
import { lstatSync, mkdirSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 13;
const TRAN_MS = 900_000;
const API = (tep, t) => `bun run test -- "cd apps/api && bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const AGENT = (t) =>
	`bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/nhac-viec.integration.spec.ts -t ${t}"`;
const VC = {
	tao: API("viec-ghi.spec.ts", "vc-tao"),
	gan: API("viec-ghi.spec.ts", "vc-gan"),
	trangThai: API("viec-ghi.spec.ts", "vc-trang-thai"),
	vongDoi: API("viec-ghi.spec.ts", "vc-vong-doi"),
	vaiOkr: API("viec-quyen.spec.ts", "vc-vai-okr"),
	xem: API("viec-quyen.spec.ts", "vc-xem"),
	chuyen: API("viec-chuyen.spec.ts"),
	thuoc: API("viec-do-nguong.spec.ts"),
	nhacVaiOkr: AGENT("vc-nhac-vai-okr"),
	xongN: AGENT("vc-xong-n"),
};
const GHI = "packages/db/src/viec-ghi.ts";
const LUAT = "packages/db/src/viec.ts";
const GOM = "packages/db/src/onboarding-nhac.ts";
const TRA_LOI = "apps/agent/agent/lib/tra-loi-nhac.ts";
const THUOC = "_acceptance/viec-chung/rang/do-nguong.mjs";

const CAP = [
	["a bo hang ViecGan khi tao", GHI, "for (const b of ganDung) {", "for (const b of []) {", [[VC.tao, "vc: gan sai"]]],
	["b bo loc trung o khoi cong ty", LUAT, "return [...new Map(hang.map((h) => [h.viec.id, h.viec])).values()];", "return hang.map((h) => h.viec);", [[VC.gan, "vc: cong ty hien viec"]]],
	["c bo kiem quyen nguoi theo doi", LUAT, 'if (!duoc) return "khong-quyen";', 'if (!duoc && !vai.theoDoi) return "khong-quyen";', [[VC.trangThai, "vc: o khong lot"]]],
	["d bo ve vai o kiemNguoiNhanViec", GHI, "if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {", "if (false) {", [[VC.vaiOkr, "vc: giao cho vai okr khong bi chan"]]],
	["e bo dieu kien viec rieng", LUAT, "{ gan: { some: {} } },", "{},", [[VC.xem, "vc: viec rieng lo"]]],
	["f bo cong vai nguon viec", GOM, "guiViec(v, tapDoiTac, chon.now)", "guiViec(v, tap, chon.now)", [[VC.nhacVaiOkr, "vc: bo gom co viec doi tac cho vai okr"]]],
	["g bo kiem nguoi nhan xong n", TRA_LOI, "if (!dungNguoiNhan(m, v, input.userId)) {", "if (false) {", [[VC.xongN, "vc: xong n nguoi la lot"]]],
	["h bo chuyen nguoi giao", GHI, "v.nguoiGiaoId === input.tuId ? input.den.id : v.nguoiGiaoId", "v.nguoiGiaoId", [[VC.chuyen, "vc: chuyen viec bo sot nguoi giao"]]],
	["i bo kiem chua co lich su", GHI, "if (await coLichSu(tx, viec.id)) {", "if (false) {", [[VC.vongDoi, "vc: xoa viec co lich su"]]],
	["j thuoc so han sang ngay hom sau", THUOC, "AT TIME ZONE $3)::date + 1)", "AT TIME ZONE $3)::date + 2)", [[VC.thuoc, "vc: thuoc dem sai dung han"]]],
	["k bo chan theo doi o CHO_DANH_GIA-XONG", LUAT, 'const duoc = o === "G" ? vai.giao : vai.giao || vai.thucHien;', 'const duoc = (o === "G" ? vai.giao : vai.giao || vai.thucHien) || (nguon === "CHO_DANH_GIA" && den === "XONG" && vai.theoDoi);', [[VC.trangThai, "vc: o khong lot"]]],
	["l bo ve nguoi doi la nguoi thuc hien", GHI, "\t\tviec.nguoiThucHienId === input.nguoiId &&\n", "", [[VC.trangThai, "vc: roiChuaLamLuc ghi boi nguoi giao"], [VC.thuoc, "vc: thuoc dem sai dung han"]]],
	["m bo kiem lai o nhanh mo lai", GHI, "await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);", "", [[VC.vaiOkr, "vc: giao cho vai okr khong bi chan"]]],
];

function goiCuaBanSao(banSao, nhom, ten) {
	const nm = join(banSao, nhom, ten, "node_modules");
	if (!lstatSync(nm).isSymbolicLink()) return;
	rmSync(nm);
	mkdirSync(join(nm, "@crm"), { recursive: true });
	const goc = join(GOC, nhom, ten, "node_modules");
	for (const muc of readdirSync(goc)) {
		if (muc !== "@crm") symlinkSync(join(goc, muc), join(nm, muc));
	}
	for (const goi of readdirSync(join(goc, "@crm"))) {
		symlinkSync(join(banSao, "packages", goi), join(nm, "@crm", goi));
	}
}

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

const banSao = dungBanSao("vc");
for (const [nhom, ten] of [
	["apps", "api"],
	["apps", "agent"],
	["packages", "validation"],
]) {
	goiCuaBanSao(banSao, nhom, ten);
}
const xanh = new Map();
let daChay = 0;
const hong = [];
try {
	for (const [ten, tep, cu, moi, kiem] of CAP) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = thayMotLan(banSao, tep, cu, moi);
		const sau = [];
		try {
			for (const [cmd, ghim] of kiem) sau.push({ cmd, ghim, ...lenh(banSao, cmd) });
		} finally {
			traLai();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			const dung = truoc.ma === 0 && s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`);
			if (!dung) hong.push({ ten, truoc: truoc.ra.slice(-1200), sau: s.ra.slice(-1200) });
		}
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
for (const h of hong) console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`dot-bien: ${SO_CAP_KHAI - new Set(hong.map((h) => h.ten)).size}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
```

- [ ] **Step 2: Chạy** — `node _acceptance/viec-chung/rang/dot-bien.mjs` → mỗi cặp in `xanh=0 do=1 ghim=ok`, dòng cuối `dot-bien: 13/13 cap dat`, mã 0. Cặp nào in `moc trong … xuat hien n lan, can 1` (mã 2) thì chuỗi trong mã đã trôi khỏi kế hoạch: sửa mã cho chuỗi xuất hiện đúng một lần, không sửa răng cho vừa mã. Chạy lại răng DA0a `node _acceptance/va-lo-ro-vai-chi-okr/rang/dot-bien.mjs` → `9/9 cap dat` (chứng các chuỗi của DA0a còn nguyên).

- [ ] **Step 3: Commit**

```bash
git add _acceptance/viec-chung/rang/dot-bien.mjs
git commit -m "test(viec-chung): răng đột biến 13 cặp trên bản sao lành"
```

---

## Task 17: Từ điển và tài liệu

**Files:**
- Modify: `CONTEXT.md` dòng 160–171 (mục «Việc»), 194–199 («Chuyển việc 30 ngày» → «Chuyển việc»), 254–259 («Nhắc buổi sáng»); thêm sáu mục ngay sau «Việc»
- Modify: `docs/api.md` — gạch đầu dòng đổi vai (dòng 100–107), gạch đầu dòng `kiemNguoiNhanViec` (dòng 266–276), mục mới `## Việc` sau mục «Deleting a record is archive first, purge later» (sau dòng 474)
- Modify: `docs/agent.md` mục «Nhắc buổi sáng» (thêm hai gạch đầu dòng sau gạch «Việc kế hoạch chỉ gom cho người đọc được dữ liệu đối tác», dòng ~370–378)
- Phục vụ evals: E15
- independent: true

- [ ] **Step 1: `CONTEXT.md`.** Thay mục «Việc» bằng:

```markdown
**Việc**: một đầu việc có **người giao**, đúng một **người thực hiện**, không hay nhiều **người theo
dõi**, có thể có hạn; gắn được vào một hay nhiều bản ghi — thoả thuận, công ty, cá nhân, kế hoạch 30
ngày — mà vẫn là một việc (không nhân bản), và hiện ở khối «Việc» đầu thẻ Hoạt động của từng bản ghi đó.
Trạng thái là một trong năm: Chưa làm · Đang làm · Chờ đánh giá · Xong · Huỷ. Người giao và người thực
hiện đổi trạng thái theo bảng của `docs/api.md` mục «Việc»; người theo dõi, thành viên khác, quản trị
không đổi. Việc gắn ít nhất một bản ghi đối tác thì ai đọc được dữ liệu đối tác cũng thấy; việc không gắn
gì là việc riêng, chỉ ba vai người trong cuộc thấy. Lượt này người vai «chỉ OKR» chưa dùng Việc (kể cả
việc riêng). Thay dần «việc cần làm» trên dòng thời gian (hàng DA1b) và Việc (KR) (lượt V5); bước của kế
hoạch 30 ngày vẫn là bước. Chủ kho mở mục 2026-10-07; chốt 2026-10-13 (hàng DA1).
_Avoid_: task, nhiệm vụ, đầu việc
Vì sao: khảo sát 05/10 thấy mọi hãng tách hai loại việc đều phải vá — «việc của
tôi» nằm hai chỗ, quyền theo hai luật. Một chữ cho một loại việc chung cả CRM.

**Việc của tôi**: màn liệt kê việc của một người theo ba nhóm — Giao cho tôi (tôi là người thực hiện),
Tôi giao (tôi giao cho người khác), Đang theo dõi — mặc định chỉ việc đang mở, xếp theo hạn; Xong và Huỷ ở
hai dòng gập cuối danh sách. Mục thứ hai của thanh trái. Đặt 2026-10-13 (hàng DA1).
_Avoid_: hộp việc, my tasks
Vì sao: «Việc của bạn» đã là thẻ của OKR; màn này là của chính người đang đứng ở đó.

**Người giao (việc)**: người tạo ra và chịu trách nhiệm đóng một việc — duy nhất được huỷ, mở lại, trả
lại việc đang chờ đánh giá, đổi người thực hiện và xoá việc chưa có lịch sử. Đặt 2026-10-13.
_Avoid_: owner, chủ việc
Vì sao: «chủ» lẫn với người phụ trách thoả thuận.

**Người thực hiện (việc)**: người duy nhất phải làm một việc; mặc định là người giao khi không chọn ai.
Chỉ người thực hiện rời «Chưa làm» mới tính vào ngưỡng đo nhịp nhận việc. Đặt 2026-10-13.
_Avoid_: assignee, người được giao
Vì sao: «Người được giao» đã là chữ của bước kế hoạch 30 ngày.

**Người theo dõi (việc)**: người được thêm vào một việc để nắm tình hình; không đổi được trạng thái, tự bỏ
theo dõi được. Lượt này không nhận nhắc buổi sáng. Đặt 2026-10-13.
_Avoid_: watcher, người quan sát
Vì sao: cùng chữ với Theo dõi (kế hoạch), cùng nghĩa «nắm tin, không làm».

**Chờ đánh giá**: trạng thái người thực hiện chọn khi muốn người giao xem lại trước khi xong; việc ở đây
chỉ người giao đóng (Xong), trả lại (Làm lại) hay huỷ. Người thực hiện vẫn được bấm Xong thẳng từ Chưa làm
hay Đang làm. Đặt 2026-10-13.
_Avoid_: chờ duyệt, review
Vì sao: «chờ duyệt» là chữ của mục tiêu OKR, có bước duyệt bắt buộc; ở Việc đây là lựa chọn.

**Làm lại**: thao tác của người giao đưa việc đang Chờ đánh giá hay đã Xong về Đang làm. Việc gắn đối tác
mà người thực hiện đã sang vai «chỉ OKR» thì không làm lại được. Đặt 2026-10-13.
_Avoid_: mở lại (dành cho việc đã Huỷ), reopen
Vì sao: «Mở lại» đưa việc đã Huỷ về Chưa làm; hai nút khác nhau thì hai chữ khác nhau.
```

Mục «Chuyển việc 30 ngày» đổi thành:

```markdown
**Chuyển việc**: thao tác của quản trị ở màn Thành viên, chuyển mọi kế hoạch đang chạy mà một người cầm
trịch, mọi bước chưa xong đang giao cho họ, và mọi việc đang mở họ thực hiện hay giao, sang một người
khác — một lần, một giao dịch, mỗi dòng đổi để lại một vết. Việc đã Xong hay Huỷ giữ tên người cũ. Số việc
hộp xem trước nêu bằng đúng số mà lời từ chối đổi sang vai «chỉ OKR» nêu. Chốt 2026-09-22, thêm Việc
2026-10-13; tên cũ «Chuyển việc 30 ngày» (nhãn trên màn chưa đổi).
_Avoid_: transfer, bàn giao tài khoản
Vì sao: thao tác không đụng công ty, cá nhân hay thoả thuận của người đó — gọi
là "bàn giao tài khoản" thì người dùng tưởng nó chuyển hết.
```

Mục «Nhắc buổi sáng»: câu đầu thành «…gom mọi bước quá hạn, bước sắp hạn, kế hoạch im, mốc ngày, việc quá hạn và việc sắp hạn người đó thực hiện, việc đang chờ người đó đánh giá…»; giữ phần còn lại.

- [ ] **Step 2: `docs/api.md`.** Gạch đầu dòng đổi vai (dòng 100–107) thay `demViecDangGiu` … `conViecKeHoach` bằng: «đếm kế hoạch mở người đó cầm trịch, bước chưa xong của kế hoạch mở người đó làm, và việc đang mở (Chưa làm, Đang làm, Chờ đánh giá) người đó thực hiện hay giao (`demViecDangGiu`; phần việc là `demViecMoCua` của `@crm/db/viec`, cùng hàm hộp «Chuyển việc» dùng): lớn hơn 0 thì 409 `WORKSPACE_CONFIG.messages.conViec`, nêu các con số và chỉ sang «Chuyển việc», vai không đổi; bằng 0 thì xoá mọi lượt theo dõi kế hoạch và việc (mở lẫn đã khép) trong cùng giao dịch, mỗi lượt theo dõi việc để một vết `bo-theo-doi`.» Gạch đầu dòng `kiemNguoiNhanViec` (dòng 266–276) thêm câu cuối: «Việc có bản riêng cùng tên ở `@crm/db/viec-ghi`, cùng luật `docDuocDoiTac`, cho mọi đường đặt người vào việc (người thực hiện, người theo dõi, mở lại việc gắn đối tác).» Mục mới:

```markdown
## Việc

Router `viec` (`apps/api/src/viec`), `PhamViDoiTacMiddleware`: người vai «chỉ OKR» bị chặn ở cửa,
kể cả việc riêng. Luật ở `@crm/db/viec`, mọi lệnh ghi ở `@crm/db/viec-ghi` — API, Tác nhân («xong n»)
và bộ gieo mẫu cùng gọi một hàm. Mỗi hàm ghi nhận `tx`, ghi đúng một dòng `viecVet` mỗi thay đổi và ném
`LoiViec` có `ma`; service đổi `ma` sang `NotFoundException`, `BadRequestException`,
`ForbiddenException`, `ConflictException`.

- **Ai thấy (P3 thu hẹp).** `dieuKienXemViec(userId)` đứng ở mọi lời đọc (một việc, lịch sử, Việc của
  tôi, khối của bản ghi, Tổng quan cả hai phạm vi) và là bước đầu của mọi lệnh ghi. Việc gắn ít nhất một
  bản ghi đối tác thì ai qua được cửa router cũng thấy; việc không gắn gì chỉ người giao, người thực hiện,
  người theo dõi thấy — quản trị không thấy. Mã không thấy và mã không có trả cùng 404
  «Không có việc nào mang mã <id>.».
- **Thứ tự kiểm khi đổi trạng thái.** (1) không thấy → 404; (2) cặp không có trong `DO_THI` → 400
  «Không chuyển được việc từ «…» sang «…».» cho mọi người; (3) không quyền → 403 «Chỉ người giao được …»
  hay «Chỉ người giao và người thực hiện được …»; (4) ba cặp mở lại (Chờ đánh giá → Đang làm, Xong → Đang
  làm, Huỷ → Chưa làm) của việc gắn đối tác gọi lại `kiemNguoiNhanViec` cho người thực hiện hiện tại.
  Người theo dõi, thành viên khác, quản trị không đổi trạng thái — đường của quản trị là «Chuyển việc».
- **Cột đo `roiChuaLamLuc`** ghi một lần, khi chính người thực hiện đưa việc từ Chưa làm sang Đang làm,
  Chờ đánh giá hay Xong. Người giao tự bấm hay Huỷ không ghi.
- **Sửa, gắn, theo dõi.** Sửa tiêu đề, mô tả, hạn; gắn, gỡ bản ghi; thêm, bỏ người theo dõi khác: người
  giao và người thực hiện. Đổi người thực hiện: chỉ người giao. Ai thấy việc cũng tự theo dõi, tự bỏ được.
- **Vòng đời.** Xoá chỉ khi việc chưa có vết nào ngoài «tạo» (`coLichSu`, kiểm lại trong giao dịch xoá;
  có lịch sử → 409), và chỉ người giao; dòng log `viec.xoa` ghi lại. Còn lại khép bằng Xong hay Huỷ và mở
  lại được. Xoá vĩnh viễn một thoả thuận, cá nhân hay công ty (kế hoạch 30 ngày đi theo công ty của nó) ghi
  `go-do-ban-ghi-xoa` mang tên bản ghi vào mọi việc gắn nó, trong giao dịch `purge`, trước lệnh xoá; hàng
  gắn đi theo cascade, việc còn; việc mất hết bản ghi gắn thành việc riêng.
- **Chuyển việc** (`onboarding.transferPreview`/`transferWork`) chuyển cả việc đang mở người rời thực hiện
  hay giao, một giao dịch với kế hoạch và bước, mỗi việc một vết `chuyen-viec`.
- **Tổng quan**: `viecQuaHan` (việc quá hạn tôi thực hiện ở «của tôi», việc quá hạn tôi thấy ở «mọi
  người»); `quaHan.viec` cộng thêm số đó.
```

- [ ] **Step 3: `docs/agent.md`** — thêm sau gạch «Việc kế hoạch chỉ gom cho người đọc được dữ liệu đối tác»:

```markdown
- **Việc vào nhắc buổi sáng, ba loại, cùng cổng vai.** `viecCanNhac` gom thêm `viec-qua-han` (việc đang
  mở hạn trước hôm nay, gửi người thực hiện), `viec-sap-han` (Chưa làm hay Đang làm, hạn trong
  `NHAC.sapHanNgay` ngày, gửi người thực hiện), `viec-cho-danh-gia` (gửi người giao khác người thực hiện).
  Nguồn việc lọc bằng chính `tapDoiTac` của bốn loại kế hoạch — người vai «chỉ OKR» không có dòng việc
  nào, dù dữ liệu cũ còn đặt họ trong việc. Dòng tin: tiêu đề · hạn · tên bản ghi gắn đầu tiên; đường mở
  `<APP_URL>/<slug>/viec?record=viec:<id>`. Mục `mucNhac` của việc là `{loai, viecId}`. Người theo dõi
  việc không nhận nhắc. `lenLichNhac` mã hoá từng mục riêng: một mục không mã hoá được bị bỏ và ghi log,
  hàng của người khác trong cùng phút vẫn được ghi.
- **«xong n» trên dòng việc** đi qua `doiTrangThai` của `@crm/db/viec-ghi` với `nguon: "zalo"` — cùng hàm
  của màn. Dòng quá hạn, sắp hạn chỉ người thực hiện đóng được; dòng chờ đánh giá chỉ người giao. Người
  nhắn sai vai của dòng (kể cả người giao cầm tin chuyển tiếp của người thực hiện) nhận lời «việc của người
  khác», không ghi gì; việc đã khép trả «đã xong từ trước».
```

- [ ] **Step 4: Kiểm** — đọc lại ba tệp như người mới với sáu câu hỏi của E15; mọi chữ kỹ thuật mới (`bộ gom`, `cổng vai`) hoặc đã có mục trong `CONTEXT.md` hoặc là tên mã trong backtick. Không có test máy cho task này (E15 là phán xét).

- [ ] **Step 5: Commit**

```bash
git add CONTEXT.md docs/api.md docs/agent.md
git commit -m "docs(viec-chung): từ điển Việc, luật router viec, nhắc việc và xong n"
```

---

## Task 18: Năm lệnh chứng và kiểm mốc migration

**Files:** không tạo; sửa bất cứ tệp nào năm lệnh chỉ ra, trong phạm vi các task trên.

- Phục vụ evals: mọi eval (cổng trước Gate 2)
- independent: false

- [ ] **Step 1:** `bun run check-types` → 0 lỗi (bắt `THU_TU_DU` thiếu loại, `generated/server.ts` cũ, kiểu `RouterOutputs["viec"]`).
- [ ] **Step 2:** `bun run lint` và `bun run lint:slop` → sạch (không chú thích trong mã, không số rời).
- [ ] **Step 3:** `bun run test` → xanh toàn bộ, gồm các spec cũ dễ va: `vai-chi-okr.spec.ts` (tập thủ tục vai okr gọi được không đổi; mọi thủ tục `viec.*` bị chặn), `vai-chi-okr-ke-hoach.spec.ts`, `luu-tru-chat.spec.ts`, `nhac-vai-chi-okr.integration.spec.ts`, `messages-guard.spec.ts`, `khung-dieu-huong.spec.ts`, các DOM test Tổng quan.
- [ ] **Step 4:** `bun run build` → xanh.
- [ ] **Step 5:** Chạy lại toàn bộ lệnh `vc_*` của `_acceptance/config.yaml` dòng 1561–1579, `vc_man`, `vc_san_thiet_ke`, `vc_dot_bien` — mỗi lệnh mã 0.
- [ ] **Step 6: Mốc migration** — `git fetch origin onehub && git ls-tree --name-only origin/onehub packages/db/prisma/migrations/ | tail -3`. Nếu có thư mục mốc lớn hơn `<UTC>_viec_chung`: `git mv packages/db/prisma/migrations/<UTC>_viec_chung packages/db/prisma/migrations/$(date -u +%Y%m%d%H%M%S)_viec_chung`, chạy `bun run db:reset` trên kho dev cục bộ rồi lại Step 3, commit `chore(viec-chung): đặt lại mốc migration sau <tên migration mới>`. Lặp bước này ngay trước mỗi lần đẩy.
- [ ] **Step 7: Commit** (nếu có sửa) — `git add <tệp cụ thể>`; `git commit -m "fix(viec-chung): <điều năm lệnh chỉ ra>"`.

---

## Tự soát

### Tiêu chí → task

| AC | Task |
| --- | --- |
| AC-1 | 2 (API, vết tạo, khối D và C), 10 (ô soạn, khối đầu thẻ, lỗi giữ chữ) |
| AC-2 | 2 (gắn kế hoạch, gỡ thoả thuận, khối công ty khử trùng) |
| AC-3 | 1 (đồ thị, `quyenDoi`), 3 (ma trận 100 ô, `roiChuaLamLuc`) |
| AC-4 | 4 (sửa, đổi người, theo dõi, lịch sử), 12 (thẻ Lịch sử, nút theo quyền, Xoá) |
| AC-5 | 5 (bảy đường, router, ô chọn, đổi vai), 7 (đường chuyển việc tới vai okr do API DA0a chặn) |
| AC-6 | 5 (ma trận 70 ô), 6 (ô Tổng quan) |
| AC-7 | 6 (API Việc của tôi, Tổng quan), 11 (màn, ba trạng thái tải) |
| AC-8 | 9 (bộ gom, tin Zalo/Slack của vai okr, luật DA0a) |
| AC-9 | 9 (ba loại, tin hai kênh, cách ly) |
| AC-10 | 9 («xong n», người lạ, đã khép) |
| AC-11 | 7 (xem trước, chuyển, nguyên tử, hộp) |
| AC-12 | 8 (xoá, 409, huỷ–mở lại, xoá vĩnh viễn bốn loại), 12 (nút Xoá qua hỏi lại) |
| AC-13 | 10, 11, 12 (giao diện), 15 (đo trên bản chạy thật, sàn thiết kế) |
| AC-14 | 13 (gieo mẫu, từ chối production), 14 (thước) |
| AC-15 | 17 |

### Phép đo → task

| Eval | Task | Eval | Task |
| --- | --- | --- | --- |
| E1 | 2 | E8 | 9 |
| E1b | 10 | E9 | 9 |
| E2 | 2 | E10 | 9 |
| E3 | 3 | E11 | 7 |
| E4 | 4 | E11b | 7 |
| E4b | 12 | E12 | 8 |
| E5 | 5 | E13 | 15 |
| E6 | 5 (đọc–ghi), 6 (ô Tổng quan) | E13b | 15 |
| E7 | 6 | E14 | 14 |
| E7b | 11 | E14b | 13 |
| E7c | 11 | E15 | 17 |
| E16 | 16 (13 cặp; chiều đỏ của từng cặp đã thử tay ở task sở hữu: a, b — 2; c, k, l — 3; d, e, m — 5; h — 7; i — 8; f, g — 9; j, l — 14) | | |

### Lệch nhỏ giữa thiết kế và mã thật (nêu, không tự đổi phạm vi)

1. **`kiemNguoiNhanViec` «chuyển sang `packages/db`» va với «không đụng `kiemNguoiNhanViec`».** Thiết kế mục «Quyền xem» và mục «Rủi ro» nói dời hàm này sang `packages/db`; mục «Chuyển việc khi nghỉ» và ràng buộc của lượt nói không chạm nó (vùng DA0b). Kế hoạch giữ bản API nguyên chỗ và viết **bản riêng cùng tên** trong `viec-ghi.ts` (cùng luật `docDuocDoiTac`, chỉ lặp truy vấn). Lời từ chối của Việc là lời riêng có tên người và «chỉ OKR» (lời DA0a nói «việc của kế hoạch đối tác» — sai nghĩa cho Việc). Sau DA0b có thể gộp hai bản.
2. **Khuôn Zod của vết không thể «ở `packages/validation/src/viec.ts`»** như thiết kế ghi: `packages/db` (nơi `viec-ghi.ts` ghi vết) không phụ thuộc được `@crm/validation` (chiều ngược đã có). Khuôn sống ở `packages/db/src/viec.ts`; `packages/validation/src/viec.ts` chỉ tái xuất.
3. **Kế hoạch 30 ngày không có đường xoá vĩnh viễn riêng** (không có `onboardingPlan.delete` nào ngoài test). E12 «xoá vĩnh viễn P theo đường xoá thật» được hiện thực bằng xoá vĩnh viễn công ty của P (cascade); vì thế `companies.purge` ghi `go-do-ban-ghi-xoa` cho cả thoả thuận và kế hoạch của công ty. Spec dựng P ở một công ty riêng để thứ tự D → K → P → C của E12 giữ được.
4. **`purge` không biết ai bấm** (router gọi `purge(id)`, lịch dọn không có người) → `ViecVet.nguoiId` cho phép rỗng; vết `go-do-ban-ghi-xoa` và vết bỏ theo dõi khi đổi vai mang `nguoiId = null`, `nguon = "api"`, hiện «Hệ thống».
5. **Đổi tên «Chuyển việc 30 ngày» trên màn sẽ làm đỏ phép đo đã ký** `cap-nhat-tuan-okr` E23 (`man-cap-nhat.mjs:69` ghim nhãn menu). Kế hoạch chỉ đổi mục từ điển; nhãn menu và tiêu đề hộp giữ nguyên — cần người quyết có mở lại hồ sơ đó không.
6. **Răng DA0a ghim chuỗi trong `workspace.service.ts`** (`if (viec.keHoach > 0 || viec.buoc > 0) {`): giữ nguyên chuỗi, thêm nhánh thứ hai cho việc; `conViec(k, b, 0)` bằng nguyên văn `conViecKeHoach(k, b)` để spec DA0a còn xanh. `demViecDangGiu`, `xoaTheoDoiCua` nằm ở `onboarding-ghi.ts`, không ở `workspace` như câu thiết kế.
7. **Tổng quan đã có biến `viecQuaHan` và số `quaHan.viec`** cho việc cần làm cũ. Kế hoạch thêm trường ra `viecQuaHan` (đổi tên biến cục bộ cũ) và cộng số việc vào `quaHan.viec`; không đổi hình `overdueTasks` vì kênh agent `crm.ts` và năm tệp test đang đọc nó.
8. **E3 viết `VIEC.thongDiep.chiNguoiGiao(viec)`**; mã thật nhận cụm hành động: `chiNguoiGiao(hanhDong(nguon, dich))`. Lời ra vẫn đúng khuôn «Chỉ người giao được <làm>.».
9. **Nút trạng thái «kế tiếp» bỏ ô Đang làm → Chưa làm** dù đồ thị cho phép (E4b đòi đúng hai nút cho người thực hiện ở Đang làm). API vẫn nhận cặp đó.
10. **Ô soạn chọn tối đa một người theo dõi** (bản mẫu đã duyệt không có ô này; bảng trạng thái có). **Khung việc chưa có ô «gắn thêm bản ghi»** (không có bộ chọn nào phủ cả bốn loại; `viec.gan` có ở API, khung có «Gỡ») và **tiêu đề, mô tả chỉ đọc trên khung** (sửa được qua `viec.sua`; hạn và người thực hiện sửa được trên khung). Ba điều này cần người quyết: nhận cho lượt này hay thêm hàng.
11. **Nhắc đọc việc theo người trong cuộc** (người thực hiện, người giao) thay vì `dieuKienXemViec` — tương đương vì người nhận luôn là người trong cuộc; cổng vai là `tapDoiTac`.
12. **Thước thêm `--trong`** (như thước DA0a) để đếm cô lập trên kho thử dùng chung; mã thoát 2 vừa cho «vai chỉ OKR > 0» vừa cho «không đo được» như thiết kế ghi.
13. **«Người lạ» của E10 là người giao của việc B** — một người ngoài hẳn đã bị `viec-ghi` chặn, nên chiều đỏ (g) sẽ không đo được gì nếu dùng người ngoài.
14. **`lenLichNhac` nhận bộ gom làm tham số** (mặc định `viecCanNhac`) để E9 cài mục loại lạ; cách ly theo từng mục.
15. **Kho chuỗi**: nút «Xong» không dấu cần thêm `"nut.xong"` vào `KHONG_DAU` của `messages-guard.spec.ts`; bỏ «Việc cần làm» khỏi ô soạn buộc xoá ba khoá `composer.task|dueDate|addTask` (luật «khoa chet»).
16. **Đường REST**: `GET /viec/{id}` (E6 ghim) đụng mọi `GET /viec/<chữ>`, nên «Việc của tôi» là `GET /viec` và khối của bản ghi là `GET /viec-theo-ban-ghi`.
17. **`VIEC.muiGio` lặp giá trị `NHAC.muiGio`**: app không nhập được `onboarding-nhac` phía trình duyệt; giữ hai chỗ cùng giá trị, cùng nguồn `Asia/Ho_Chi_Minh`.
