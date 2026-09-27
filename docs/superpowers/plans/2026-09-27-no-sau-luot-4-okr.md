# Nợ sau lượt 4 OKR — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tin nhắc sáng lấy sự kiện theo cửa sổ neo mốc 08:30 và chào theo giờ gửi; sheet dùng quyền máy chủ; lô cập nhật tuần từ chối KR trùng; bộ nhắc đọc vết bằng khuôn và ném khi hỏng; mục nhắc OKR một khuôn, không loại nào rơi im.

**Architecture:** `@crm/db` nhận `zod` để giữ hai khuôn nó phải đọc (vết OKR, mục nhắc OKR); `@crm/validation` tái xuất. `viecCanNhac` nhận lựa chọn cửa sổ bắt buộc (`"buoi-sang"` cho nhịp nhắc, `"truc-tiep"` cho màn sống). Luật «người phụ trách KR hoặc sửa được đơn vị» gom về một hàm ở `OkrAccessService`.

**Tech Stack:** Bun, TypeScript, Zod 4, Prisma 7, NestJS + tRPC, eve (agent), React (apps/app), bun test.

**Spec:** `docs/superpowers/specs/2026-09-27-no-sau-luot-4-okr-design.md` · hợp đồng `_acceptance/no-sau-luot-4-okr/contract.md` · bộ đo `_acceptance/no-sau-luot-4-okr/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã, kể cả mã sửa.
- Không migration, không đổi `packages/db/prisma/**`.
- Hằng tinh chỉnh được vào đối tượng cấu hình của khu: mốc trưa là `NHAC.trua = { gio: 12, phut: 0 }` trong `packages/db/src/onboarding-nhac.ts`; không viết `12` tại chỗ.
- Phân tích ở biên: JSON của `OkrTrail.after` chỉ đọc qua `parseOkrVet`; không `jsonObject`/`jsonText` cho vết.
- Lựa chọn cửa sổ của `viecCanNhac` là trường **bắt buộc**, không mặc định.
- Câu lỗi mới nguyên văn: «Mỗi KR chỉ gửi một lần trong một lần cập nhật.» và «Vết OKR <id> không đọc được: <chi tiết>».
- Câu chào: «Chào <tên>, sáng nay có …» trước 12:00 giờ VN; «Chào <tên>, hôm nay có …» từ 12:00. Giờ VN tính bằng `Intl` múi `Asia/Ho_Chi_Minh`, không `getHours()`.
- Node ≥ 24 cho mọi lệnh chứng (eve đòi). Năm lệnh chứng ở gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Mọi phép đo mới có cặp hai chiều trên cùng dữ liệu mẫu, thông điệp đỏ ghim đúng như `evals.yaml`. Bản gương đột biến chỉ ở tmpdir, không ghi vào cây.

## Review Focus

- Sự kiện đúng 08:30:00.000 giờ VN — thuộc tin sáng hôm đó (cửa sổ đóng phải); ca này ở Task 4 (E4).
- Máy chủ chạy giờ UTC — cả mốc 08:30 lẫn mốc 12:00 phải tính theo giờ VN; mọi bài agent có giờ chạy `TZ=UTC` (Task 4, Task 5).
- Dòng vết có `after = null` (hành động không có ảnh sau) — `parseOkrVet(null)` trả `null`, không ném, và dòng `tao`/`tao-kr` vẫn rơi về người phụ trách hiện tại như hôm nay (Task 3).
- Lượt 9a đã lên `onehub` trước S3 — `THU_TU_NHAC`, `TIEU_DE`, `mucNhac`, `maViec`, `dong` đã có `ai-tran`, `ai-doi-soat-lech`; kiểm đủ ở kiểu phải phủ cả hai và E15(d) thêm ca `ai-tran` (Task 2).
- Bài kiểm cũ gọi `viecCanNhac(db, { now })` của hồ sơ đã ký — đổi cơ học sang khai cửa sổ, không đổi kỳ vọng; `su-kien` và `mot-tin` của lượt 4 giữ nghĩa «24 giờ» bằng `cuaSo: "truc-tiep"` (Task 4).

---

## Bước 0 — trước S3 (khi chủ kho dán «được viết mã, kéo onehub về trước»)

- [ ] `git fetch origin onehub && git merge origin/onehub` trong cây `no-sau-luot-4-okr`.
- [ ] `bun install` rồi `cd packages/db && bun run db:generate`.
- [ ] Soát lại kế hoạch với mã mới: `git diff bcf7b752..HEAD --stat -- packages/db/src/onboarding-nhac.ts packages/db/src/okr-nhac.ts packages/validation/src/nhac-ke-hoach.ts apps/agent/agent/lib/nhac-ke-hoach.ts apps/agent/agent/lib/tin-nhac.ts apps/api/src/okr`. Có thay đổi → ghi một dòng sổ `fix` stage `S3` nêu task nào chỉnh gì, trước khi code.

### Task 1: `zod` vào `@crm/db`, khuôn vết dời về `@crm/db/okr-vet`

**independent:** false (nền của Task 2, 3) · **phục vụ:** E12 (một hàm), E15(a)

**Files:**
- Modify: `packages/db/package.json` (thêm `"zod"` cùng phiên bản `packages/validation/package.json` vào `dependencies`; thêm export `"./okr-vet": "./src/okr-vet.ts"`)
- Create: `packages/db/src/okr-vet.ts`
- Modify: `packages/validation/src/okr-vet.ts` (thành tái xuất)
- Modify: `bun.lock` (do `bun install`)

**Interfaces:**
- Produces: `HANH_DONG_VET`, `HanhDongVet`, `okrVetSnapshot`, `OkrVetSnapshot`, `parseOkrVet(value: unknown): OkrVetSnapshot | null` từ `@crm/db/okr-vet`; `@crm/validation/okr-vet` tái xuất đúng các tên đó.

- [ ] **Step 1: Chuyển nguyên văn nội dung `packages/validation/src/okr-vet.ts` sang `packages/db/src/okr-vet.ts`**, giữ `import { z } from "zod";`.
- [ ] **Step 2: Thay `packages/validation/src/okr-vet.ts` bằng**

```ts
export {
	HANH_DONG_VET,
	type HanhDongVet,
	type OkrVetSnapshot,
	okrVetSnapshot,
	parseOkrVet,
} from "@crm/db/okr-vet";
```

- [ ] **Step 3:** `bun install` · `bun run check-types` → mã 0.
- [ ] **Step 4:** `bun run test -- "cd apps/api && bun test test/okr.spec.ts test/okr-nguon.spec.ts"` → xanh (mọi chỗ nhập cũ còn chạy).
- [ ] **Step 5: Commit** `no-sau-luot-4-okr: khuôn vết OKR sống ở @crm/db, @crm/validation tái xuất`.

### Task 2: Một khuôn mục nhắc OKR, không loại nào rơi im

**independent:** false · **phục vụ:** E13, E14, E15

**Files:**
- Modify: `packages/db/src/okr-nhac.ts` (khuôn `viecOkr`, `KHOA_MUC_OKR`)
- Modify: `packages/db/src/onboarding-nhac.ts` (`THU_TU_NHAC` kiểm đủ)
- Modify: `packages/validation/src/nhac-ke-hoach.ts` (nhánh OKR suy từ khuôn, tái xuất `viecOkr`)
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (`maViec`)
- Modify: `apps/agent/agent/lib/tin-nhac.ts` (`dungTin` ném loại lạ)
- Modify: `apps/api/src/okr/okr.contracts.ts` (`viecCuaToiOutput` dùng `viecOkr`)
- Create: `apps/agent/test/muc-nhac-okr.spec.ts` (ca `loai-la`), `apps/agent/test/muc-nhac-okr.integration.spec.ts` (ca `du-duong`)
- Create: `_acceptance/no-sau-luot-4-okr/rang/mot-khuon.mjs`
- Modify: `apps/api/test/no-sau-luot-4-okr.spec.ts` (ca `du-duong` nửa API; tạo tệp ở task này)

**Interfaces:**
- Produces: `viecOkr` (Zod discriminated union trên `loai`), `ViecOkr = z.infer<typeof viecOkr>`, `KHOA_MUC_OKR: { readonly [K in LoaiNhacOkr]: readonly (keyof Extract<ViecOkr, { loai: K }>)[] }` từ `@crm/db/okr-nhac`; `viecOkr` tái xuất ở `@crm/validation/nhac-ke-hoach`.

- [ ] **Step 1: Viết bài đỏ trước** — `apps/agent/test/muc-nhac-okr.spec.ts`, ca `loai-la`:

```ts
import { describe, expect, test } from "bun:test";
import type { ViecNhac } from "@crm/db/onboarding-nhac";
import { dungTin } from "../agent/lib/tin-nhac";

const im: ViecNhac = {
	loai: "okr-kr-im",
	keyResultId: "kr-1",
	objectiveId: "mt-1",
	nhan: "Doanh thu",
	soNgay: 15,
	chuTen: null,
};

describe("loai-la", () => {
	test("loai-la: muc loai okr-moi lam dungTin nem, neu ten loai", () => {
		const la = { ...im, loai: "okr-moi" } as unknown as ViecNhac;
		expect(() => dungTin("An", [im, la], () => null)).toThrow("okr-moi");
	});
	test("loai-la: doi chung bo muc la -> dung mot dong KR im", () => {
		const { text } = dungTin("An", [im], () => null);
		expect(text.split("\n").filter((d) => d.includes("«Doanh thu» im 15 ngày"))).toHaveLength(1);
	});
});
```

Chạy `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/muc-nhac-okr.spec.ts -t loai-la` → ca đầu ĐỎ («không ném»).

- [ ] **Step 2: Khuôn `viecOkr` trong `packages/db/src/okr-nhac.ts`** — thay kiểu viết tay:

```ts
import { z } from "zod";

const ma = z.string().min(1);

export const viecOkr = z.discriminatedUnion("loai", [
	z.object({ loai: z.literal("okr-cap-nhat"), krIds: z.array(ma).min(1), nhan: z.string(), soKr: z.number() }),
	z.object({ loai: z.literal("okr-kr-im"), keyResultId: ma, objectiveId: ma, nhan: z.string(), soNgay: z.number(), chuTen: z.string().nullable() }),
	z.object({ loai: z.literal("okr-duoc-giao"), objectiveId: ma, keyResultId: ma.optional(), nhan: z.string() }),
	z.object({ loai: z.literal("okr-nhac-ten"), commentId: ma, objectiveId: ma, nhan: z.string(), nguoiTen: z.string() }),
	z.object({ loai: z.literal("okr-theo-doi"), objectiveId: ma, nhan: z.string(), capNhat: z.number(), binhLuan: z.number() }),
]);

export type ViecOkr = z.infer<typeof viecOkr>;

export const LOAI_NHAC_OKR = viecOkr.options.map((o) => o.shape.loai.value);

export type LoaiNhacOkr = ViecOkr["loai"];

export const KHOA_MUC_OKR = {
	"okr-cap-nhat": ["krIds"],
	"okr-kr-im": ["keyResultId"],
	"okr-duoc-giao": ["objectiveId", "keyResultId"],
	"okr-nhac-ten": ["commentId"],
	"okr-theo-doi": ["objectiveId"],
} as const satisfies { [K in LoaiNhacOkr]: readonly (keyof Extract<ViecOkr, { loai: K }>)[] };
```

(`LOAI_NHAC_OKR` phải giữ kiểu tuple hằng; nếu `options.map` làm rộng kiểu thì giữ mảng hằng cũ và thêm `satisfies readonly LoaiNhacOkr[]` cùng kiểm hai chiều ở Step 4.)

- [ ] **Step 3: `packages/validation/src/nhac-ke-hoach.ts`** — nhánh OKR suy từ khuôn:

```ts
import { KHOA_MUC_OKR, viecOkr } from "@crm/db/okr-nhac";

export { viecOkr } from "@crm/db/okr-nhac";

const nhanhOkr = viecOkr.options.map((o) =>
	o.pick({ loai: true, ...Object.fromEntries(KHOA_MUC_OKR[o.shape.loai.value].map((k) => [k, true])) }).strict(),
);

export const mucNhac = z.union([
	z.object({ loai: z.enum(LOAI_NHAC), planId: ma, stepId: ma.optional() }).strict(),
	...nhanhOkr,
]);
```

Nếu kiểu suy ra của `pick` với khoá động không đủ hẹp cho `MucNhac`, viết `nhanhOkr` thành bộ năm phần tử bằng hàm `khoaCua<K extends LoaiNhacOkr>(loai: K)` trả `.pick` có kiểu — thứ tự giữ như `viecOkr.options`. Nhánh AI của 9a (nếu đã lên) giữ nguyên.

- [ ] **Step 4: `THU_TU_NHAC` kiểm đủ** trong `onboarding-nhac.ts`:

```ts
type LoaiViec = ViecNhac["loai"];
type ThieuThuTu = Exclude<LoaiViec, (typeof THU_TU_NHAC)[number]>;
export const THU_TU_DU: [ThieuThuTu] extends [never] ? true : ThieuThuTu = true;
```

(`ViecNhac` khai trước `THU_TU_NHAC` nếu cần; thiếu một loại thì `check-types` báo tên loại ở `THU_TU_DU`.)

- [ ] **Step 5: `dungTin` ném loại lạ** (`tin-nhac.ts`) — thay lọc theo thứ tự:

```ts
const la = viec.find((v) => !(THU_TU_NHAC as readonly string[]).includes(v.loai));
if (la) throw new Error(`loại nhắc không có thứ tự trong tin: ${la.loai}`);
```

đặt đầu `dungTin`, trước `theoThuTu`.

- [ ] **Step 6: `maViec` rút mã bằng bảng** (`nhac-ke-hoach.ts`):

```ts
function maViec(v: ViecNhac): MucNhac {
	if ("planId" in v) return mucNhac.parse({ loai: v.loai, planId: v.planId, stepId: v.stepId });
	if (laViecOkr(v)) {
		const khoa = KHOA_MUC_OKR[v.loai] as readonly string[];
		return mucNhac.parse(Object.fromEntries([["loai", v.loai], ...khoa.flatMap((k) => (k in v ? [[k, v[k as keyof typeof v]]] : []))]));
	}
	return maViecAi(v);
}
```

(`maViecAi` là nhánh `ai-*` của 9a, tách thành hàm; chưa có 9a thì bỏ dòng đó. `laViecOkr` dùng `LOAI_NHAC_OKR`.)

- [ ] **Step 7: `okr.contracts.ts`** — xoá `viecOkrOutput` viết tay, dùng:

```ts
import { viecOkr } from "@crm/validation/nhac-ke-hoach";

export const viecCuaToiOutput = z.object({ viec: z.array(viecOkr), lienQuanOkr: z.boolean() });
export type ViecOkrOutput = z.infer<typeof viecOkr>;
```

- [ ] **Step 8: Bài `du-duong`** — nửa API trong `apps/api/test/no-sau-luot-4-okr.spec.ts` (tạo X có đủ năm loại qua `okr.createKeyResult`, `okr.updateKeyResult` đổi người phụ trách, `okr.addComment` nhắc tên, `okr.follow` + `okr.guiCapNhat` của người khác, KR im 15 ngày bằng `startLockedAt` lùi; gọi `okr.viecCuaToi` với `now` qua service, khẳng định tập `loai` bằng `new Set(LOAI_NHAC_OKR)` và `viecCuaToiOutput.parse` không ném); nửa agent trong `apps/agent/test/muc-nhac-okr.integration.spec.ts` (gieo bằng `support/okr-gieo.ts`, `lenLichNhac(lucVN(...))`, `parseNhacPayload`, bảng khoá viết tay đúng như E13, `chayNhac` với `fetcher` và `zaloFetcher` giả, đếm dòng dưới tiêu đề). Chiều đỏ: bản gương tmpdir của `onboarding-nhac.ts` bỏ `okr-theo-doi` bằng ép kiểu → dựng tin ném, bài in «du-duong: okr-theo-doi».
- [ ] **Step 9: `rang/mot-khuon.mjs`** — suy gốc từ `import.meta.url`; (a) nhập `viecCuaToiOutput` và so `===`; (b) duyệt `mucNhac.options`, lọc `loai ∈ LOAI_NHAC_OKR`, so tập khoá; (c) đọc `okr.contracts.ts` bằng `typescript` AST, không `z.literal("okr-…")`; (d) chép `packages/db` + `packages/typescript-config` sang `mkdtempSync`, đột biến `THU_TU_NHAC`, chạy `tsc --noEmit -p <bản sao>/tsconfig.json`, đối chứng bản sao không đột biến mã 0; ca `ai-tran` khi có. Thông điệp «mot-khuon: a|b|c|d».
- [ ] **Step 10:** chạy E13, E14, E15 (lệnh ở `_acceptance/config.yaml`, khoá `n4_du_duong`, `n4_loai_la`, `n4_mot_khuon`) → xanh; lượt phá-thử từng ca → đỏ đúng thông điệp. `bun run check-types`.
- [ ] **Step 11: Commit** `no-sau-luot-4-okr: một khuôn mục nhắc OKR, loại lạ làm dựng tin ném`.

### Task 3: Bộ nhắc đọc vết bằng khuôn, ném khi hỏng

**independent:** false (sau Task 1) · **phục vụ:** E12

**Files:**
- Modify: `packages/db/src/okr-nhac.ts` (`viecGiao`)
- Modify: `apps/api/test/no-sau-luot-4-okr.spec.ts` (ca `vet-khuon`)
- Modify: `apps/agent/test/muc-nhac-okr.integration.spec.ts` (ca `vet-khuon`)

- [ ] **Step 1: Bài đỏ** — API: `okr.updateKeyResult` (quản trị) đổi `ownerUserId` K1 → X lúc 07:00 D; đọc dòng `okrTrail` `sua-kr` mới nhất của K1; `viecCanNhac(db, { now: 08:31 D, userId: X, cuaSo: "buoi-sang" })` có `okr-duoc-giao`; ba đột biến `db.okrTrail.update({ where: { id }, data: { after: … } })` (`{ ownerUserId: 123 }`, `"x"`, `[1]`) → `expect(...).rejects.toThrow(\`Vết OKR ${id} không đọc được\`)`; `{ title: "t" }` không ném; tRPC `okr.viecCuaToi` của X và Z trả lỗi; `dashboard.summary` của Z trả lỗi. Agent: dòng hỏng trong cơ sở dữ liệu của lượt, `expect(lenLichNhac(lucVN(D, 1))).rejects.toThrow("Vết OKR")`, đếm hàng `nhac-ke-hoach` = 0.
- [ ] **Step 2: Sửa `viecGiao`:**

```ts
function sauCua(v: { id: string; after: unknown }): string | null {
	try {
		const sau = parseOkrVet(v.after);
		const nguoi = sau?.ownerUserId;
		if (nguoi === undefined || nguoi === null) return null;
		if (typeof nguoi !== "string") throw new Error("ownerUserId không phải chuỗi");
		return nguoi;
	} catch (e) {
		throw new Error(`Vết OKR ${v.id} không đọc được: ${e instanceof Error ? e.message : String(e)}`);
	}
}
```

`select` thêm `id: true`; `nguoiSau = sauCua(v) ?? (VET_TAO.includes(v.action) ? dich.ownerUserId : null)`. Bỏ `jsonObject`, `jsonText` khỏi dòng nhập.

- [ ] **Step 3:** chạy `n4_vet_khuon` → xanh; phá-thử hai chiều (bản gương đọc JSON thô; bản gương `lenLichNhac` bắt lỗi) → đỏ «vet-khuon: vet hong bi nuot», «vet-khuon: loi bi bat».
- [ ] **Step 4: Commit** `no-sau-luot-4-okr: nhắc OKR đọc vết bằng khuôn, vết hỏng nêu mã dòng`.

### Task 4: Cửa sổ sự kiện neo mốc 08:30

**independent:** false · **phục vụ:** E1, E2, E3, E4, E5, E7

**Files:**
- Modify: `packages/db/src/onboarding-nhac.ts` (`mocNhac`, `CuaSoNhac`, `viecCanNhac` nhận `cuaSo`)
- Modify: `packages/db/src/okr-nhac.ts` (`viecOkrCanNhac` nhận `cuaSo`)
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (`lenLichNhac`, `chayNhac` dùng `"buoi-sang"`)
- Modify: `apps/api/src/okr/okr-trao-doi.service.ts`, `apps/api/src/dashboard/dashboard.service.ts` (dùng `"truc-tiep"`)
- Modify (cơ học): `apps/agent/test/okr-nhac.integration.spec.ts`, `nhac-ke-hoach.integration.spec.ts`, `tra-loi-tin-nhac.integration.spec.ts`, `apps/api/test/okr-cap-nhat.spec.ts`
- Create: `apps/agent/test/nhac-moc-sang.integration.spec.ts` (ca `giua-ngay`, `sang-sau`, `da-co-tin`, `moc-bien`, `gui-muon`)
- Modify: `apps/api/test/no-sau-luot-4-okr.spec.ts` (ca `the-truc-tiep`)

**Interfaces:**
- Produces: `export type CuaSoNhac = "buoi-sang" | "truc-tiep";` · `export function mocNhac(now: Date): Date` (08:30 giờ VN của ngày VN chứa `now`) · `viecCanNhac(db, chon: { now: Date; userId?: string; cuaSo: CuaSoNhac })`.

- [ ] **Step 1: Bài đỏ** `nhac-moc-sang.integration.spec.ts` theo đúng ma trận E1–E5 (giờ dựng bằng `new Date("2026-10-13T14:00:00+07:00")`, D là thứ Ba 13/10/2026; mốc kỳ vọng tính trong bài bằng chuỗi `+07:00`, không gọi `mocNhac`). Chạy `TZ=UTC` → đỏ ở `giua-ngay` (nhịp 14:01 tạo hàng).
- [ ] **Step 2: `mocNhac` và cửa sổ:**

```ts
export type CuaSoNhac = "buoi-sang" | "truc-tiep";

export function mocNhac(now: Date): Date {
	return new Date(dauNgayVN(now).getTime() + (NHAC.gio.gio * PHUT_MOI_GIO + NHAC.gio.phut) * PHUT_MS);
}
```

Trong `okr-nhac.ts`:

```ts
function cuaSoSuKien(now: Date, cuaSo: CuaSoNhac): { gt: Date; lte: Date } {
	const den = cuaSo === "buoi-sang" ? mocNhac(now) : now;
	return { gt: new Date(den.getTime() - OKR_NHAC.suKienGio * GIO_MS), lte: den };
}
```

`viecOkrCanNhac(db, chon: { now: Date; userId?: string; cuaSo: CuaSoNhac })` dùng `cuaSoSuKien(chon.now, chon.cuaSo)`. `viecCanNhac` chuyển `cuaSo` xuống.

- [ ] **Step 3: Chỗ gọi:** `lenLichNhac` → `viecCanNhac(db, { now, cuaSo: "buoi-sang" })`; `chayNhac` → `{ now: new Date(), userId, cuaSo: "buoi-sang" }`; `viecCuaToi` và `keHoachCanDeY` → `cuaSo: "truc-tiep"`.
- [ ] **Step 4: Bài cũ** — thêm `cuaSo: "truc-tiep"` ở mọi `viecCanNhac(db, { now … })` trong bốn tệp đã kê; không đổi kỳ vọng. Chạy `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts test/nhac-ke-hoach.integration.spec.ts test/tra-loi-tin-nhac.integration.spec.ts"` và `bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts"` → xanh.
- [ ] **Step 5:** chạy `n4_giua_ngay`, `n4_sang_sau`, `n4_da_co_tin`, `n4_moc_bien`, `n4_gui_muon`, `n4_the_truc_tiep` → xanh; phá-thử mỗi ca bằng bản gương tmpdir đúng đột biến trong `evals.yaml` → đỏ đúng thông điệp.
- [ ] **Step 6: Commit** `no-sau-luot-4-okr: tin sáng lấy sự kiện trong cửa sổ neo mốc 08:30`.

### Task 5: Câu chào theo giờ gửi

**independent:** false (sau Task 4, cùng `tin-nhac.ts`) · **phục vụ:** E6, E16

**Files:**
- Modify: `packages/db/src/onboarding-nhac.ts` (`NHAC.trua`, `laBuoiSang(luc: Date): boolean`)
- Modify: `apps/agent/agent/lib/tin-nhac.ts` (`dungTin` nhận `luc: Date` ở vị trí thứ hai)
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (`guiQuaZalo`, `guiQuaSlack` truyền `new Date()` lúc dựng)
- Modify: mọi chỗ gọi `dungTin` (`apps/agent/test/okr-nhac.integration.spec.ts`, `tra-loi-tin-nhac.integration.spec.ts`, `apps/app/app/proto/_modules/may-nhac-truoc-nguoi/du-lieu.ts`)
- Modify: `apps/agent/test/muc-nhac-okr.spec.ts` (ca `cau-chao`), `apps/agent/test/nhac-moc-sang.integration.spec.ts` (ca `cau-chao-gui`)

- [ ] **Step 1: Bài đỏ** — ma trận 16 ô E6 và 3 ô E16, chạy `TZ=UTC`.
- [ ] **Step 2:**

```ts
export const NHAC = { gio: { gio: 8, phut: 30 }, trua: { gio: 12, phut: 0 }, … } as const;

export function laBuoiSang(luc: Date): boolean {
	const phan = dinhGio.formatToParts(luc);
	const so = (loai: "hour" | "minute") => Number(phan.find((p) => p.type === loai)?.value ?? 0);
	return so("hour") * PHUT_MOI_GIO + so("minute") < NHAC.trua.gio * PHUT_MOI_GIO + NHAC.trua.phut;
}
```

`dungTin(ten, luc, viec, lienKet, khuon, tranKyTu, dongCuoi)`; `const buoi = laBuoiSang(luc) ? "sáng nay" : "hôm nay";` thay chữ «sáng nay» cố định ở hai câu chào. `daToiGioNhac` dùng chung phần đọc giờ với `laBuoiSang` (một hàm `phutTrongNgayVN(luc)`), không viết lại.

- [ ] **Step 3:** cập nhật chỗ gọi: tin thật truyền `new Date()` tại lúc dựng; bài cũ truyền giờ sáng cố định (`lucVN(NGAY_NHAC, 1)`) để kỳ vọng «sáng nay» giữ nguyên; bản mẫu `/proto` truyền một giờ sáng hằng.
- [ ] **Step 4:** chạy `n4_cau_chao`, `n4_cau_chao_gui` → xanh; phá-thử (câu cố định; `createdAt` thay giờ gửi; `getHours()`) → đỏ «cau-chao…».
- [ ] **Step 5: Commit** `no-sau-luot-4-okr: tin nhắc chào theo giờ gửi`.

### Task 6: Một luật quyền ghi KR, sheet theo máy chủ

**independent:** true (không chạm tệp của Task 1–5) · **phục vụ:** E8, E9, E10

**Files:**
- Modify: `apps/api/src/okr/okr-access.service.ts` (`ghiDuocKr`)
- Modify: `apps/api/src/okr/okr.service.ts` (`canEditKr`)
- Modify: `apps/api/src/okr/okr-cap-nhat.service.ts` (`guiCapNhat`)
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx:213`
- Create: `apps/app/test/sheet-quyen-cap-nhat.dom.tsx`
- Modify: `apps/api/test/no-sau-luot-4-okr.spec.ts` (ca `mot-luat-ghi`)

**Interfaces:**
- Produces: `OkrAccessService.ghiDuocKr(q: Quyen, userId: string, kr: { ownerUserId: string; objective: DonViCuaMucTieu }): boolean`.

- [ ] **Step 1: Bài đỏ** — DOM sáu ô E8 (menu mở bằng `userEvent.click` nút «…» của K1, đếm `[data-muc='cap-nhat-kr']`); API 15 ô E10 với bảng viết sẵn. Chạy → ô DOM (true,false,không) đỏ.
- [ ] **Step 2:**

```ts
ghiDuocKr(q: Quyen, userId: string, kr: { ownerUserId: string; objective: DonViCuaMucTieu }): boolean {
	return kr.ownerUserId === userId || this.suaDuocDonVi(q, userId, kr.objective);
}
```

`assertSuaKr`: giữ lối tắt người phụ trách (không gọi `quyen` khi không cần), phần còn lại `if (!this.ghiDuocKr(q, userId, { ownerUserId: kr.ownerUserId, objective }))`. `guiCapNhat`: `const chu = kr.ownerUserId === userId; if (!this.quyenOkr.ghiDuocKr(q, userId, { ownerUserId: kr.ownerUserId, objective: donViCua(kr.objective) })) throw …`. `okr.service.ts:1432`: `canEditKr: mt.keyResults.filter((k) => this.quyenOkr.ghiDuocKr(q, userId, { ownerUserId: k.ownerUserId, objective: dv })).map((k) => k.id)` (dùng `q` và `dv` đã có trong hàm; thiếu thì đọc như chỗ `canEdit`).
- [ ] **Step 3:** `objective-sheet.tsx`: `const capNhatDuoc = kr.hienTaiQuaCapNhat && mt.canEditKr.includes(kr.id);`
- [ ] **Step 4:** chạy `n4_sheet_quyen`, `n4_mot_luat_ghi`, `tco_san_thiet_ke` → xanh; phá-thử (sheet giữ luật cũ; `guiCapNhat` bỏ nhánh người phụ trách) → đỏ đúng thông điệp.
- [ ] **Step 5: Commit** `no-sau-luot-4-okr: một luật quyền ghi KR, sheet dùng canEditKr`.

### Task 7: Lô cập nhật tuần từ chối KR trùng

**independent:** true · **phục vụ:** E11

**Files:**
- Modify: `packages/validation/src/okr-cap-nhat.ts`
- Modify: `apps/api/test/no-sau-luot-4-okr.spec.ts` (ca `kr-trung`)

- [ ] **Step 1: Bài đỏ** — tRPC lô [K1, K1] → phải 400; bốn lô khuôn; đối chứng [K1, K2] → 200.
- [ ] **Step 2:**

```ts
export const LOI_KHUON_CAP_NHAT = {
	…,
	trungKr: "Mỗi KR chỉ gửi một lần trong một lần cập nhật.",
} as const;

export const guiCapNhatInput = z
	.object({ sessionId: ma, items: z.array(mucCapNhat).min(1).max(50) })
	.strict()
	.refine((v) => new Set(v.items.map((m) => m.keyResultId)).size === v.items.length, {
		error: LOI_KHUON_CAP_NHAT.trungKr,
		path: ["items"],
	});
```

- [ ] **Step 3:** chạy `n4_kr_trung` và `cnt_khuon` (khuôn lượt 4) → xanh; phá-thử bỏ `refine` → đỏ «kr-trung: lo [K1,K1] lot khuon».
- [ ] **Step 4: Commit** `no-sau-luot-4-okr: một lần gửi mỗi KR một lần`.

### Task 8: Tài liệu và sổ theo dõi

**independent:** false (cuối cùng) · **phục vụ:** không eval (T1)

**Files:**
- Modify: `docs/agent.md` (mục nhắc buổi sáng: cửa sổ neo mốc cho tin, 24 giờ trượt cho màn sống, câu chào theo giờ gửi, vết hỏng làm nhịp ném)
- Modify: `docs/api.md` (khuôn vết sống ở `@crm/db/okr-vet`, tái xuất; `viecCuaToiOutput` dùng `viecOkr`; `ghiDuocKr` là luật duy nhất cho sửa KR, cập nhật tuần, `canEditKr`; lô cập nhật tuần không nhận KR trùng)
- Modify: `docs/plan/lo-trinh-okr.md` dòng `4n` mục 10 (cột Trạng thái/Ngày/PR ghi lần đổi mới nhất, Ghi chú chỉ nối thêm)

- [ ] **Step 1:** sửa ba tệp; `bun run lint` · `bun run lint:slop`.
- [ ] **Step 2: Commit** `no-sau-luot-4-okr: tài liệu nhắc buổi sáng, vết và quyền ghi KR`.

### Kết S3

- [ ] Năm lệnh chứng ở gốc với Node 24 → mã 0.
- [ ] Contract `status: implemented`, dispatch S4 bằng Workflow với `s4-args` sinh `--diff-base origin/onehub`.
