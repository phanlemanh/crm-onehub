# Thêm bước báo đúng (E6b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phòng ban không có thật trả cùng một lỗi ở mọi đường; form thêm bước nói ra lỗi tải danh sách phòng ban; dòng «và N việc quá hạn nữa» đếm theo ngày Việt Nam ở cả hai phía.

**Architecture:** Một hàm kiểm phòng ban xuất từ `onboarding-ghi.ts`, dùng cho `addStep` và ba đường khuôn. `PlanSteps` truyền trạng thái truy vấn danh sách phòng ban xuống `ThemBuoc`, lỗi thì đặt `VungTaiLoi` vào chỗ ô chọn. Mô-đun thuần `@crm/validation/ngay-vn` so chuỗi ngày `dueAt` với ngày VN của `now`; `dong-buoc.tsx` và bài kiểm khứ hồi phía API cùng gọi nó.

**Tech Stack:** NestJS + Prisma (apps/api), Next.js + TanStack Query (apps/app), bun:test (jsdom preload cho `.dom.tsx`), puppeteer-core cho thước màn.

**Spec:** `docs/superpowers/specs/2026-10-13-them-buoc-bao-dung-design.md` · hợp đồng `_acceptance/them-buoc-bao-dung/contract.md` · eval `_acceptance/them-buoc-bao-dung/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Chữ trên màn: «phòng ban» (`CONTEXT.md`); thông điệp API dùng `TO_CHUC.thongDiep.khongCoPhongBan` và `ONBOARDING.thongDiep.boPhanDaLuuTru`.
- Tệp chữ dùng chung (`apps/app/lib/messages/*.ts`, `_acceptance/config.yaml`) chỉ thêm dòng (luật 7 của đợt).
- Thành phần UI chỉ từ `@crm/ui`; lỗi tải là `VungTaiLoi` (`docs/design.md`).
- Bài kiểm DOM chạy với `TZ=Asia/Ho_Chi_Minh` trừ hai describe múi giờ (`qua-han-lui` Los_Angeles, `qua-han-tien` Kiritimati).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, chiều đỏ có thông điệp ghim (MEASURE-BIRTH-CLAUSE).
- Cổng 3000/3001 là của anh; thước màn đi qua `mot-luot.sh` → `tien-de.mjs`.

## Review Focus

1. Mã phòng ban trùng trong một khuôn (hai bước cùng phòng ban lạ) — câu lỗi nêu mã một lần, không «a, a». Ghim ở Task 1 (ca `createTemplate` hai bước cùng `maLa`).
2. Truy vấn danh sách phòng ban lỗi rồi thử lại vẫn lỗi — vùng lỗi còn, nút thử lại không kẹt «đang tải». Ghim ở Task 2 (ca thử lại hai lần lỗi).
3. Đồng hồ đúng nửa đêm VN (00:00:00) — bước hạn hôm qua là quá hạn, hạn hôm nay chưa. Ghim ở Task 3 (ca biên trong `ngay-vn.spec.ts`).
4. Bước của «Bước của tôi» mà `dueAt` đã là chuỗi ngày — không được `new Date(dueAt)` (UTC nửa đêm) ở đâu nữa. Ghim ở Task 3 (E6/E7).
5. Kế hoạch đã đóng — không form thêm bước nào, kể cả khi danh sách lỗi. Ghim ở Task 2 (ca `closedAt`).

---

### Task 1: Một hàm kiểm phòng ban (API) — phục vụ E1, E2, E8 · independent: false (chung `apps/api/test/them-buoc-bao-dung.spec.ts` với Task 3)

**Files:**
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts:134-149` (thay `boPhanDangDung`), `:307`
- Modify: `apps/api/src/onboarding/onboarding.service.ts:287,303,335,702-725` (bỏ `kiemBoPhanDangDung`)
- Modify: `apps/api/test/dieu-phoi-va.spec.ts:205` (`toBe(400)` → `toBe(404)`, đã được anh duyệt — Hỏi-1)
- Create: `apps/api/test/them-buoc-bao-dung.spec.ts`

**Interfaces:**
- Produces: `export async function kiemPhongBanDangDung(db: Pick<Tx, "department">, ids: readonly string[]): Promise<void>` trong `onboarding-ghi.ts`.

- [ ] **Step 1: Viết bài kiểm đỏ** — `apps/api/test/them-buoc-bao-dung.spec.ts`:

```ts
import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { HttpException } from "@nestjs/common";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ToChucService } from "../src/to-chuc/to-chuc.service";
import { donGieo, gieoBoPhan, gieoKeHoach } from "./dieu-phoi-gieo";

let dem = 0;
const khuonDaTao: string[] = [];

function maMoi(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

async function loiCua(chay: Promise<unknown>): Promise<HttpException> {
	try {
		await chay;
	} catch (loi) {
		return loi as HttpException;
	}
	throw new Error("mong doi mot loi, nhung lenh chay tron ven");
}

function buocKhuon(departmentId: string, position = 0) {
	return { label: `Buoc ${position}`, departmentId, position, offsetDays: 0 };
}

async function khuonSong(service: OnboardingService, departmentId: string) {
	const k = await service.createTemplate({
		name: maMoi("Khuon"),
		partnerType: null,
		steps: [buocKhuon(departmentId)],
	});
	khuonDaTao.push(k.id);
	return k;
}

afterAll(async () => {
	await db.onboardingTemplate.deleteMany({ where: { id: { in: khuonDaTao } } });
	await donGieo();
});

describe("phong-ban-khong-co", () => {
	test("addStep, tao khuon, sua khuon tra cung loi voi org.*", async () => {
		const service = new OnboardingService(db);
		const plan = await gieoKeHoach();
		const song = await gieoBoPhan();
		const khuon = await khuonSong(service, song.id);
		const maLa = maMoi("pb-khong-co");
		const soBuoc = await db.onboardingStep.count({ where: { planId: plan.id } });
		const soKhuon = await db.onboardingTemplate.count();

		const thamChieu = await loiCua(
			new ToChucService(db).luuTruXemTruoc({ id: maLa }),
		);
		expect(thamChieu.getStatus(), "cot tham chieu org.* rong").toBe(404);
		expect(thamChieu.message).toContain(maLa);

		const duong = {
			addStep: await loiCua(
				service.addStep(
					{ planId: plan.id, label: "A", departmentId: maLa, dueAt: new Date() },
					plan.ownerId,
				),
			),
			createTemplate: await loiCua(
				service.createTemplate({
					name: maMoi("Khuon la"),
					partnerType: null,
					steps: [buocKhuon(maLa, 0), buocKhuon(maLa, 1)],
				}),
			),
			updateTemplate: await loiCua(
				service.updateTemplate({ id: khuon.id, steps: [buocKhuon(maLa)] }),
			),
		};
		for (const [ten, loi] of Object.entries(duong)) {
			expect(loi.getStatus(), `${ten} tra loi khac org.* cho phong ban khong co`).toBe(
				thamChieu.getStatus(),
			);
			expect(loi.message, `${ten} tra cau khac org.* cho phong ban khong co`).toBe(
				thamChieu.message,
			);
		}
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(soBuoc);
		expect(await db.onboardingTemplate.count()).toBe(soKhuon);
		const sau = await db.onboardingTemplate.findUniqueOrThrow({ where: { id: khuon.id } });
		expect(sau.steps).toEqual([buocKhuon(song.id)]);
	});
});

describe("phong-ban-luu-tru", () => {
	test("addStep, tao khuon, sua khuon cung mot cau cho phong ban da luu tru", async () => {
		const service = new OnboardingService(db);
		const plan = await gieoKeHoach();
		const song = await gieoBoPhan();
		const khuon = await khuonSong(service, song.id);
		const cat = await gieoBoPhan();
		await db.department.update({ where: { id: cat.id }, data: { archivedAt: new Date() } });
		const soBuoc = await db.onboardingStep.count({ where: { planId: plan.id } });
		const soKhuon = await db.onboardingTemplate.count();

		const a = await loiCua(
			service.addStep(
				{ planId: plan.id, label: "A", departmentId: cat.id, dueAt: new Date() },
				plan.ownerId,
			),
		);
		const b = await loiCua(
			service.createTemplate({ name: maMoi("Khuon cat"), partnerType: null, steps: [buocKhuon(cat.id)] }),
		);
		const c = await loiCua(service.updateTemplate({ id: khuon.id, steps: [buocKhuon(cat.id)] }));
		expect(a.getStatus(), "addStep ghi buoc vao phong ban da luu tru").toBe(400);
		expect(a.message).toContain(cat.name);
		expect(b.getStatus()).toBe(400);
		expect(b.message).toBe(a.message);
		expect(c.getStatus()).toBe(400);
		expect(c.message).toBe(a.message);
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(soBuoc);
		expect(await db.onboardingTemplate.count()).toBe(soKhuon);

		await service.addStep(
			{ planId: plan.id, label: "B", departmentId: song.id, dueAt: new Date() },
			plan.ownerId,
		);
		await khuonSong(service, song.id);
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(soBuoc + 1);
		expect(await db.onboardingTemplate.count()).toBe(soKhuon + 1);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && bun test test/them-buoc-bao-dung.spec.ts"` → FAIL «addStep tra loi khac org.* cho phong ban khong co» (400 ≠ 404).

- [ ] **Step 3: Hàm kiểm chung** — `onboarding-ghi.ts`, thay `boPhanDangDung`:

```ts
export async function kiemPhongBanDangDung(
	db: Pick<Tx, "department">,
	ids: readonly string[],
): Promise<void> {
	const ma = [...new Set(ids)];
	const phongBan = await db.department.findMany({
		where: { id: { in: ma } },
		select: { id: true, name: true, archivedAt: true },
	});
	const thieu = ma.filter((id) => !phongBan.some((pb) => pb.id === id));
	if (thieu.length > 0) {
		throw new NotFoundException(
			TO_CHUC.thongDiep.khongCoPhongBan(thieu.join(", ")),
		);
	}
	const daLuuTru = phongBan
		.filter((pb) => pb.archivedAt !== null)
		.map((pb) => pb.name);
	if (daLuuTru.length > 0) {
		throw new BadRequestException(ONBOARDING.thongDiep.boPhanDaLuuTru(daLuuTru));
	}
}
```

`addStep`: `await kiemPhongBanDangDung(tx, [input.departmentId]);`. `onboarding.service.ts`: ba chỗ gọi đổi thành `await kiemPhongBanDangDung(this.db, steps.map((buoc) => buoc.departmentId));` (với `hien.steps` ở khôi phục), xoá phương thức riêng `kiemBoPhanDangDung`, nhập hàm từ `./onboarding-ghi`.

- [ ] **Step 4: Sửa đúng một khẳng định đã duyệt** — `apps/api/test/dieu-phoi-va.spec.ts:205`: `expect(khongCo.getStatus()).toBe(404);`.

- [ ] **Step 5: Xanh + phá-thử** — chạy lại Step 2 → PASS; `bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t bo-phan-hong"` → PASS. Phá-thử (commit trước, rồi sửa tạm): đổi `NotFoundException` của `kiemPhongBanDangDung` sang `BadRequestException(TO_CHUC.thongDiep.khongCoBoPhan(...))` → E1 đỏ với «addStep tra loi khac org.*…»; bỏ nhánh lưu trữ → E2 đỏ với «addStep ghi buoc vao phong ban da luu tru». Hoàn bằng `git checkout -- <tệp>` sau khi đã commit bản đúng.

- [ ] **Step 6: Commit** — `fix(them-buoc-bao-dung): phòng ban không có thật trả cùng một lỗi ở mọi đường`.

### Task 2: Form thêm bước nói ra lỗi tải danh sách phòng ban — phục vụ E3, E4, E5 · independent: false (chung tệp DOM với Task 3)

**Files:**
- Modify: `apps/app/components/crm/record-sheet/plan-steps.tsx` (`ThemBuoc`, `PlanSteps`)
- Modify: `apps/app/lib/messages/onboarding.ts` (thêm `loiPhongBan` ở kiểu, `en`, `vi` — chỉ thêm dòng)
- Create: `apps/app/test/them-buoc-bao-dung.dom.tsx` (describe `phong-ban-loi`)

**Interfaces:**
- Produces: `type DanhSachPhongBan = { chon: BoPhanChon[]; loi: boolean; dangTai: boolean; thuLai: () => void }`, prop `danhSach?: DanhSachPhongBan` của `ThemBuoc` (thay `boPhan?: BoPhanChon[]`).
- Message: `sheet.loiPhongBan` — vi «Không tải được danh sách phòng ban», en «Couldn't load departments».

- [ ] **Step 1: Bài kiểm đỏ** — tệp DOM chép khung giả tRPC/`mo`/`cho`/`bam`/`nut` của `apps/app/test/dieu-phoi-va.dom.tsx` (dòng 1–330, cùng `mock.module`); thêm:

```tsx
function vungLoi(): HTMLElement | null {
	return form()?.querySelector<HTMLElement>("[data-vung-tai-loi]") ?? null;
}

describe("phong-ban-loi", () => {
	test("ke hoach rong: loi tai danh sach thanh vung loi, khong o chon trong", async () => {
		dat("onboarding.listSteps", () => ({ rows: [] }));
		dat("onboarding.listDepartments", () => {
			throw new Error("mat ket noi");
		});
		await mo(<DetailSheet><PlanSteps plan={keHoach()} /></DetailSheet>);
		await bam(nut(m.addStep));
		await cho(() => vungLoi() !== null, "vung loi phong ban");
		expect(vungLoi() !== null, "loi tai danh sach phong ban thanh o chon trong").toBe(true);
		expect(vungLoi()?.querySelector('[data-slot="empty-title"]')?.textContent).toBe("Không tải được danh sách phòng ban");
		expect(vungLoi()?.textContent).toContain("Kiểm tra kết nối rồi thử lại.");
		expect(vungLoi()?.querySelector('[data-slot="kara-retry"]') !== null).toBe(true);
		expect(form()?.querySelector(`[aria-label="${m.pickDepartment}"]`)).toBeNull();
		expect(nut(m.save).disabled).toBe(true);
	});
});
```

Thêm các ca: đối chứng (danh sách trả `BO_PHAN` → không vùng lỗi, có combobox); «thử lại» (lần 1 lỗi, lần 2 trả `[P1, P2]` → số lần gọi 1→2, vùng lỗi mất, options đúng `[P1, P2]`, chọn P2 + gõ tên → `addStep` nhận `{ planId: "kh-1", departmentId: "P2", label, dueAt }`; chiều đỏ ghim «thu lai khong tai lai danh sach phong ban»); «thử lại vẫn lỗi» (vùng lỗi còn, nút thử lại không disabled sau khi xong); «kế hoạch có bước» (bước ở A, danh sách lỗi → nút «Thêm bước ở phòng ban khác» có, mở ra có vùng lỗi; form trong nhóm A lưu được với `departmentId: "bp-a"`; đối chứng danh sách `[A]` → nút không có; ghim «nut them o phong ban khac bien mat khi danh sach loi»); «kế hoạch đã đóng» (lỗi + `closedAt` → không nút thêm nào).

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi` → FAIL «loi tai danh sach phong ban thanh o chon trong».

- [ ] **Step 3: Cài** — trong `PlanSteps`:

```tsx
const danhSach: DanhSachPhongBan = {
	chon: (boPhan.data ?? []).map((b) => ({ id: b.id, name: b.name })),
	loi: boPhan.isError,
	dangTai: boPhan.isFetching,
	thuLai: () => void boPhan.refetch(),
};
const coBuoc = new Set(hang.map((b) => b.departmentId));
const khac = { ...danhSach, chon: danhSach.chon.filter((b) => !coBuoc.has(b.id)) };
```

Kế hoạch rỗng: `<ThemBuoc danhSach={danhSach} … />`. Nút «ở phòng ban khác» hiện khi `!khoa && hang.length > 0 && (khac.loi || khac.chon.length > 0)`, truyền `danhSach={khac}`. Trong `ThemBuoc`, khi `chonBoPhan && danhSach?.loi`:

```tsx
<VungTaiLoi
	tieuDe={m.loiPhongBan}
	moTa={crmMessages(locale).vungCon.loiMoTa}
	onThuLai={danhSach.thuLai}
	dangTai={danhSach.dangTai}
/>
```

thay cho `Select`; giữ `Input` tên, hạn, nút. Nhập `VungTaiLoi` từ `@crm/ui/components/vung-tai-loi`, `crmMessages` từ `@/lib/messages/crm`.

- [ ] **Step 4: Xanh + phá-thử** — chạy lại → PASS; phá-thử `loi: false` cứng → đỏ đúng câu ghim; bỏ `khac.loi ||` → đỏ «nut them o phong ban khac bien mat…».

- [ ] **Step 5: Commit** — `fix(them-buoc-bao-dung): form thêm bước nói ra lỗi tải danh sách phòng ban`.

### Task 3: Quá hạn của bước theo một ngày — phục vụ E6, E7, E9 · independent: false

**Files:**
- Create: `packages/validation/src/ngay-vn.ts`, `packages/validation/test/ngay-vn.spec.ts`
- Modify: `packages/validation/package.json` (`"./ngay-vn": "./src/ngay-vn.ts"`)
- Modify: `apps/app/app/(app)/[slug]/dong-buoc.tsx:25-27`
- Modify: `apps/app/test/them-buoc-bao-dung.dom.tsx` (describe `qua-han-lui`, `qua-han-tien`)
- Modify: `apps/api/test/them-buoc-bao-dung.spec.ts` (describe `qua-han-khu-hoi`)

**Interfaces:**
- Produces: `export function homNayVN(now: Date): string` (YYYY-MM-DD), `export function quaHanTheoNgayVN(hanNgay: string, now: Date): boolean`.

- [ ] **Step 1: Mô-đun + bài kiểm biên đỏ trước**

```ts
export const NGAY_VN = { muiGio: "Asia/Ho_Chi_Minh" } as const;

const dinhNgay = new Intl.DateTimeFormat("en-CA", {
	timeZone: NGAY_VN.muiGio,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function homNayVN(now: Date): string {
	return dinhNgay.format(now);
}

export function quaHanTheoNgayVN(hanNgay: string, now: Date): boolean {
	return hanNgay < homNayVN(now);
}
```

`ngay-vn.spec.ts`: bảng viết trước — `2026-10-12T17:00:00Z` (VN 00:00 ngày 13): hạn `2026-10-12` → true, `2026-10-13` → false; `2026-10-12T16:59:59Z`: hạn `2026-10-12` → false, `2026-10-11` → true.

- [ ] **Step 2: Bài kiểm DOM đỏ** — `qua-han-lui` (khẳng định đầu: `Intl.DateTimeFormat().resolvedOptions().timeZone === "America/Los_Angeles"`, ghim «lenh khong chay o mui gio lui»; `setSystemTime(new Date("2026-10-12T17:30:00Z"))`; `mySteps` một bước `dueAt "2026-10-12"`, `overdueTasks []`, `quaHan {viec:0, buoc:1}`; khẳng định `[data-buoc] [data-slot="status-indicator"]` có `data-tone="error"`, không `[data-con-sot]` — ghim «buoc qua han theo ngay VN bi dem them vao con sot»; đối chứng `quaHan.viec 1` → `[data-con-sot="1"]`). `qua-han-tien` (múi giờ Kiritimati, `2026-10-12T12:00:00Z`, `quaHan {viec:1, buoc:0}`, bước `dueAt "2026-10-12"` → `data-tone="neutral"`, `[data-con-sot="1"]`, chữ «và 1 việc quá hạn nữa» — ghim «buoc chua qua han theo ngay VN bi tru khoi con sot»; đối chứng bước `2026-10-11` → `data-tone="error"`). Mỗi describe `afterEach(() => setSystemTime())`.

- [ ] **Step 3: Bài kiểm khứ hồi** — `describe.if(process.env.TBD_KHU_HOI === "1")("qua-han-khu-hoi", …)`: khẳng định múi giờ ≠ VN và bằng `process.env.TZ`; hai đồng hồ `2026-10-12T17:05:00Z`, `2026-10-12T16:55:00Z`; mỗi đồng hồ `setSystemTime`, gieo người + kế hoạch + phòng ban, hai `OnboardingStep` giao người đó (`dauNgayVN(dongHo) - DAY_MS`, `dauNgayVN(dongHo) + GIO_MS`), gọi `new DashboardService(db, new ConversionService(db)).summary(nguoi.id, { scope: "me" })`; khẳng định `quaHan.buoc === 1` (đối chứng) và `mySteps.filter((b) => quaHanTheoNgayVN(b.dueAt, dongHo)).length === quaHan.buoc` với thông điệp «app va may chu dem qua han theo hai ngay khac nhau — <iso> <tz>».

- [ ] **Step 4: Chạy, thấy đỏ** — ba lệnh `tbd_qua_han_lui`, `tbd_qua_han_tien` (đỏ ở câu ghim), `tbd_khu_hoi` (xanh — chưa có bản sao phá; chiều đỏ đo ở Step 6).

- [ ] **Step 5: Cài** — `dong-buoc.tsx`:

```ts
export function buocQuaHan(buoc: BuocCuaToi, now: Date): boolean {
	return quaHanTheoNgayVN(buoc.dueAt, now);
}
```

nhập từ `@crm/validation/ngay-vn`; bỏ nhập `quaHan` nếu không còn dùng.

- [ ] **Step 6: Xanh + phá-thử** — ba lệnh xanh; phá-thử `quaHanTheoNgayVN` thành `toDay(new Date(nam, thang-1, ngay)) < toDay(now)` (ngày địa phương) → `qua-han-lui`, `qua-han-tien`, `qua-han-khu-hoi` đỏ đúng câu ghim. Commit trước khi phá.

- [ ] **Step 7: Commit** — `fix(them-buoc-bao-dung): quá hạn của bước đếm theo ngày Việt Nam ở cả hai phía`.

### Task 4: Thước màn — phục vụ E10, E11 · independent: false (cần Task 2, 3)

**Files:**
- Create: `_acceptance/them-buoc-bao-dung/rang/man.mjs` (khuôn `_acceptance/dieu-phoi-va/rang/man.mjs`: `canhCay`, `phien`, `suySlug`, `trang`, `choChu`, `kiem`, `MA_TRAN`, dọn gieo ở `finally`)

- [ ] **Step 1:** `MA_TRAN` = `them-buoc-loi-phong-ban-{1440,390}`, `them-buoc-khac-loi-phong-ban-{1440,390}`, `them-buoc-thu-lai-xong-{1440,390}`, `qua-han-con-sot-{1440,390}`. Chặn: `await p.setRequestInterception(true)`; với `req.url()` chứa `onboarding.listDepartments` khi cờ `chan` bật → tự `fetch` lô thật bằng cookie phiên, thay phần tử ứng với `onboarding.listDepartments` bằng `{ error: … }` đúng khuôn lỗi của lô tRPC rồi `req.respond`; còn lại `req.continue()`. Mỗi trạng thái khẳng định vùng lỗi thấy được, nút thử lại trong khung nhìn (`getBoundingClientRect` trong `innerWidth/innerHeight`), `scrollWidth <= clientWidth`; chụp ảnh vào `_acceptance/them-buoc-bao-dung/evidence/`.
- [ ] **Step 2:** Tổng quan: chọn múi giờ theo `homNayVN`/giờ VN lúc đo (VN < 18:00 → `Pacific/Pago_Pago`, bước hạn hôm qua VN; ngược lại `Pacific/Kiritimati`, bước hạn hôm nay VN + một việc quá hạn), `page.emulateTimezone`, khẳng định `data-tone` của dòng bước và có/vắng `[data-con-sot]` theo AC-6/AC-7, chụp hai khổ.
- [ ] **Step 3:** Chạy `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/them-buoc-bao-dung/rang/man.mjs"` → exit 0, 8 ảnh, mỗi mã in `dat`. Phá-thử: chạy trên commit trước Task 2 → `them-buoc-loi-phong-ban` SAI.
- [ ] **Step 4: Commit** — `test(them-buoc-bao-dung): thước màn lỗi tải phòng ban và quá hạn theo ngày VN`.

### Task 5: Không hồi quy và năm lệnh chứng — phục vụ E8

- [ ] **Step 1:** `bun _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs --tu-thu && bun _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs --moc 3a2783409` → «khong expect san co nao bi xoa hay sua».
- [ ] **Step 2:** Lệnh `tbd_hoi_quy` đầy đủ → exit 0.
- [ ] **Step 3:** `bun run check-types && bun run lint && bun run lint:slop` → exit 0 (`bun run test`, `bun run build` chạy ở làn S4).
- [ ] **Step 4:** Đặt `status: implemented` trong hợp đồng, commit.
