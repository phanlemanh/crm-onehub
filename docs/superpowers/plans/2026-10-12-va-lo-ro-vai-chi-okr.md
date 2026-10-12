# Vá lỗ rò vai «chỉ OKR» — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người vai `okr` không giữ được bước, kế hoạch hay lượt theo dõi của kế hoạch 30 ngày, và không nhận tên đối tác qua tin nhắc buổi sáng.

**Architecture:** Một hàm `docDuocDoiTac(role)` ở `@crm/validation/vai-workspace`; năm chỗ gọi nó: đường ghi của kế hoạch (`onboarding-ghi.ts`), tạo từ khuôn (`onboarding.service.ts`), đổi vai (`workspace.service.ts`), bộ gom nhắc dùng chung (`packages/db/src/onboarding-nhac.ts`), thủ tục danh sách cho ô chọn (`onboarding.nguoiNhanViec`).

**Tech Stack:** NestJS + nestjs-trpc, Prisma (Postgres), eve agent, Next.js app, bun test.

**Spec:** `docs/superpowers/specs/2026-10-12-va-lo-ro-vai-chi-okr-design.md` · hợp đồng `_acceptance/va-lo-ro-vai-chi-okr/contract.md` · evals `_acceptance/va-lo-ro-vai-chi-okr/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã — mã mới lẫn mã sửa (`AGENTS.md`).
- Trí khôn sống ở `apps/agent`; API chỉ chặn và ghi (`docs/api.md`). Luật vai là kiểm quyền, không phải trí khôn.
- Không so chuỗi `"okr"` ở chỗ gọi; mọi chỗ gọi `docDuocDoiTac`.
- Thông điệp người đọc bằng tiếng Việt, sống trong tệp cấu hình của khu (`ONBOARDING.thongDiep`, `WORKSPACE_CONFIG.messages`).
- Bài kiểm chạy qua `bun run test -- "<lệnh>"` (kho thử riêng mỗi lượt); khoá lệnh ở `_acceptance/config.yaml` mục `vlr_*`.
- `apps/api/src/generated/server.ts` sinh bằng `cd apps/api && bun run trpc:generate` và commit; `build` không sinh nó.
- Ô chọn đổi nguồn dữ liệu, không đổi hình; `packages/ui` không đổi.
- Không `--no-verify`. Không gửi tin Zalo thật — mọi bài kiểm dùng `zaloGia`/`slackGia`.

## Review Focus

1. Vai lạ trong bảng `member` (chữ hoa, chuỗi cũ) → đọc như `member`, đúng như cửa tRPC (`toWorkspaceRole`). Bài: Task 1.
2. Người đã rời workspace (mất hàng `member`) vẫn là người làm một bước cũ → bộ gom không gom gì cho họ, ô chọn không liệt họ. Bài: Task 5 (`vlr-gom`, người `vlr-gom-roi`), Task 3.
3. Quản trị tự đổi vai chính mình sang «chỉ OKR» khi còn việc → 409 như với người khác. Bài: Task 4.
4. Đổi vai với `memberId` không thuộc workspace → 404 như cũ, không lượt theo dõi của ai bị xoá. Bài: Task 4.
5. Danh sách người nhận việc xếp theo tên rồi email như `users.list` → ô chọn giữ thứ tự quen. Bài: Task 3.

Giới hạn biết trước, không có bài: đổi vai và giao bước chạy chồng nhau (hai giao dịch READ COMMITTED) có thể lọt một bước giao trước khi vai đổi. Thước `ro-vai-chi-okr.mjs` bắt được hàng đó sau gộp. Ghi vào Known limits ở Cổng 2.

## Thứ tự và độc lập

Mọi task `independent: false` — Task 2, 3, 4, 6 cùng ghi `apps/api/test/vai-chi-okr-ke-hoach.spec.ts`; Task 7 cần kiểu sinh từ Task 3; Task 9 cần mã của mọi task. Chạy tuần tự trong vòng chính.

---

### Task 1: Hàm `docDuocDoiTac`

**Phục vụ:** E1–E9 (nền chung) · **independent:** false

**Files:**
- Modify: `packages/validation/src/vai-workspace.ts`
- Test: `packages/validation/test/vai-workspace.spec.ts`

**Interfaces:**
- Produces: `docDuocDoiTac(role: string): boolean` từ `@crm/validation/vai-workspace`.

- [ ] **Step 1: Viết bài đỏ** — thêm vào cuối `packages/validation/test/vai-workspace.spec.ts`:

```ts
describe("docDuocDoiTac", () => {
	test("docDuocDoiTac: ba vai thường đọc được, vai okr không, vai lạ đọc như member", () => {
		const ket = ["owner", "admin", "member", "okr", "Member", "khach"].map(
			(vai) => `${vai}=${docDuocDoiTac(vai)}`,
		);
		expect(ket).toEqual([
			"owner=true",
			"admin=true",
			"member=true",
			"okr=false",
			"Member=true",
			"khach=true",
		]);
	});
});
```
Thêm `docDuocDoiTac` vào dòng import `@crm/validation/vai-workspace` (hoặc `../src/vai-workspace`, theo import sẵn có của tệp).

- [ ] **Step 2: Chạy, phải đỏ**

Run: `cd packages/validation && bun test ./test/vai-workspace.spec.ts -t docDuocDoiTac`
Expected: FAIL — `docDuocDoiTac` không được export.

- [ ] **Step 3: Viết hàm** — cuối `packages/validation/src/vai-workspace.ts`:

```ts
export function docDuocDoiTac(role: string): boolean {
	return docDuocPhamVi(toWorkspaceRole(role), "doi-tac");
}
```

- [ ] **Step 4: Chạy, phải xanh** — cùng lệnh Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/validation/src/vai-workspace.ts packages/validation/test/vai-workspace.spec.ts
git commit -m "feat(va-lo-ro-vai-chi-okr): một hàm docDuocDoiTac cho mọi chỗ hỏi vai có nhận việc đối tác"
```

---

### Task 2: Đường ghi của kế hoạch và tạo từ khuôn

**Phục vụ:** E1, E2, E3, E4 · **independent:** false

**Files:**
- Modify: `apps/api/src/onboarding/onboarding-config.ts` (thêm `thongDiep.vaiChiOkr`)
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` (`thanhVien` → `kiemNguoiNhanViec`, export; export `demViecDangGiu`, `xoaTheoDoiCua`)
- Modify: `apps/api/src/onboarding/onboarding.service.ts` (`createFromTemplate`)
- Modify: `apps/api/test/support/ke-hoach-gieo.ts` (`gieoThanhVien` nhận `"owner" | "admin" | "member" | "okr"`; thêm `doiVai(userId, vai)`)
- Create: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts`

**Interfaces:**
- Consumes: `docDuocDoiTac` (Task 1).
- Produces (từ `onboarding-ghi.ts`):
  - `kiemNguoiNhanViec(tx: Prisma.TransactionClient, userId: string): Promise<{ id: string; name: string }>`
  - `demViecDangGiu(tx: Prisma.TransactionClient, userId: string): Promise<{ keHoach: number; buoc: number }>`
  - `xoaTheoDoiCua(tx: Prisma.TransactionClient, userId: string): Promise<number>`
  - `ONBOARDING.thongDiep.vaiChiOkr(ten: string): string`
- Produces (test support): `gieoThanhVien(ten?, vaiTro?: "owner" | "admin" | "member" | "okr")`, `doiVai(userId: string, vai: string): Promise<void>`.

- [ ] **Step 1: Mở rộng hàm gieo** — trong `ke-hoach-gieo.ts` đổi kiểu `vaiTro` thành `"owner" | "admin" | "member" | "okr"` và thêm:

```ts
export async function doiVai(userId: string, vai: string): Promise<void> {
	await db.member.update({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		data: { role: vai },
	});
}
```

- [ ] **Step 2: Viết bài đỏ** — `apps/api/test/vai-chi-okr-ke-hoach.spec.ts`:

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import {
	batHttp,
	dichVu,
	doiVai,
	donDep,
	gieoBoPhan,
	gieoCongTy,
	gieoKeHoach,
	gieoNguoiNgoai,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";

beforeAll(moXuong);
afterAll(donDep);

const ghi = () => new OnboardingGhi(db);

async function nem(goi: () => Promise<unknown>, ten: string): Promise<string> {
	try {
		await goi();
	} catch (loi) {
		return loi instanceof Error ? loi.message : String(loi);
	}
	throw new Error(ten);
}

async function gieoKhuon() {
	const bp = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: [{ label: "Buoc mot", departmentId: bp.id, position: 0, offsetDays: 0 }],
	});
	return { khuon, bp };
}

async function dung() {
	const okr = await gieoThanhVien("Người OKR VLR", "okr");
	const thuong = await gieoThanhVien("Người Thường VLR", "member");
	const quanTri = await gieoThanhVien("Quản Trị VLR", "admin");
	const { khuon, bp } = await gieoKhuon();
	const congTy = await gieoCongTy();
	const plan = await dichVu().createFromTemplate({
		companyId: congTy.id,
		templateId: khuon.id,
		startedAt: new Date("2026-10-12T00:00:00.000Z"),
		ownerId: thuong.id,
	});
	const buoc = await db.onboardingStep.findFirstOrThrow({ where: { planId: plan.id } });
	return { okr, thuong, quanTri, khuon, bp, congTy, plan, buoc };
}

describe("vlr-ghi", () => {
	test("vlr-ghi: giao bước cho vai okr bị chặn, không vết; giao cho member được", async () => {
		const f = await dung();
		const vetTruoc = await db.activity.count({ where: { planId: f.plan.id } });
		const loi = await nem(
			() => ghi().assignStep({ stepId: f.buoc.id, assigneeId: f.okr.id }, f.quanTri.id),
			"vlr: giao buoc cho vai okr khong bi chan",
		);
		if (!loi.includes("Người OKR VLR") || !loi.includes("chỉ OKR")) {
			throw new Error(`vlr: giao buoc cho vai okr khong bi chan ${loi}`);
		}
		const sau = await db.onboardingStep.findUniqueOrThrow({ where: { id: f.buoc.id } });
		if (sau.assigneeId !== null) throw new Error("vlr: buoc da doi nguoi");
		if ((await db.activity.count({ where: { planId: f.plan.id } })) !== vetTruoc) {
			throw new Error("vlr: co vet khi bi chan");
		}
		const duoc = await ghi().assignStep({ stepId: f.buoc.id, assigneeId: f.thuong.id }, f.quanTri.id);
		if (duoc.assigneeId !== f.thuong.id) throw new Error("vlr: giao cho member hong");
	});

	test("vlr-ghi: thêm bước và đổi cầm trịch sang vai okr bị chặn", async () => {
		const f = await dung();
		const dem = () => db.onboardingStep.count({ where: { planId: f.plan.id } });
		const truoc = await dem();
		const them = {
			planId: f.plan.id,
			label: "Buoc them",
			departmentId: f.bp.id,
			dueAt: new Date("2026-10-20T00:00:00.000Z"),
		};
		const loiThem = await nem(
			() => ghi().addStep({ ...them, assigneeId: f.okr.id }, f.quanTri.id),
			"vlr: them buoc cho vai okr khong bi chan",
		);
		if (!loiThem.includes("chỉ OKR") || (await dem()) !== truoc) {
			throw new Error(`vlr: them buoc cho vai okr khong bi chan ${loiThem}`);
		}
		const loiCam = await nem(
			() => ghi().setPlanOwner({ planId: f.plan.id, ownerId: f.okr.id }, f.quanTri.id),
			"vlr: cam trich cho vai okr khong bi chan",
		);
		const plan = await db.onboardingPlan.findUniqueOrThrow({ where: { id: f.plan.id } });
		if (!loiCam.includes("chỉ OKR") || plan.ownerId !== f.thuong.id) {
			throw new Error(`vlr: cam trich cho vai okr khong bi chan ${loiCam}`);
		}
		await ghi().addStep({ ...them, assigneeId: f.thuong.id }, f.quanTri.id);
		expect(await dem()).toBe(truoc + 1);
	});
});

describe("vlr-khuon", () => {
	test("vlr-khuon: tạo từ khuôn chặn cầm trịch vai okr và người ngoài; member được", async () => {
		const f = await dung();
		const ngoai = await gieoNguoiNgoai("vlr-ngoai");
		const congTy = await gieoCongTy();
		const dem = () => db.onboardingPlan.count({ where: { companyId: congTy.id } });
		const vao = (ownerId: string) => ({
			companyId: congTy.id,
			templateId: f.khuon.id,
			startedAt: new Date("2026-10-12T00:00:00.000Z"),
			ownerId,
		});
		const loiOkr = await nem(
			() => dichVu().createFromTemplate(vao(f.okr.id)),
			"vlr: tao tu khuon cho vai okr khong bi chan",
		);
		if (!loiOkr.includes("chỉ OKR") || (await dem()) !== 0) {
			throw new Error(`vlr: tao tu khuon cho vai okr khong bi chan ${loiOkr}`);
		}
		const loiNgoai = await nem(
			() => dichVu().createFromTemplate(vao(ngoai.id)),
			"vlr: tao tu khuon cho nguoi ngoai khong bi chan",
		);
		if (loiNgoai !== ONBOARDING.thongDiep.khongPhaiThanhVien(ngoai.id) || (await dem()) !== 0) {
			throw new Error(`vlr: tao tu khuon cho nguoi ngoai khong bi chan ${loiNgoai}`);
		}
		await dichVu().createFromTemplate(vao(f.thuong.id));
		expect(await dem()).toBe(1);
	});
});

describe("vlr-chuyen", () => {
	test("vlr-chuyen: chuyển việc sang vai okr bị chặn", async () => {
		const f = await dung();
		await ghi().assignStep({ stepId: f.buoc.id, assigneeId: f.thuong.id }, f.quanTri.id);
		const loi = await nem(
			() => ghi().transferWork({ fromUserId: f.thuong.id, toUserId: f.okr.id }, f.quanTri.id),
			"vlr: chuyen viec sang vai okr khong bi chan",
		);
		const plan = await db.onboardingPlan.findUniqueOrThrow({ where: { id: f.plan.id } });
		const buoc = await db.onboardingStep.findUniqueOrThrow({ where: { id: f.buoc.id } });
		if (!loi.includes("chỉ OKR") || plan.ownerId !== f.thuong.id || buoc.assigneeId !== f.thuong.id) {
			throw new Error(`vlr: chuyen viec sang vai okr khong bi chan ${loi}`);
		}
	});

	test("vlr-chuyen: chuyển việc từ người vai okr (dữ liệu cũ) sang member được", async () => {
		const f = await dung();
		const cu = await gieoThanhVien("Người Cũ VLR", "member");
		const { plan } = await gieoKeHoach({ camTrich: cu.id, buoc: [{ nhan: "B", boPhanId: f.bp.id, giao: cu.id }] });
		await doiVai(cu.id, "okr");
		const ket = await ghi().transferWork({ fromUserId: cu.id, toUserId: f.thuong.id }, f.quanTri.id);
		const sauPlan = await db.onboardingPlan.findUniqueOrThrow({ where: { id: plan.id } });
		const sauBuoc = await db.onboardingStep.findFirstOrThrow({ where: { planId: plan.id } });
		if (ket.keHoach !== 1 || ket.buoc !== 1 || sauPlan.ownerId !== f.thuong.id || sauBuoc.assigneeId !== f.thuong.id) {
			throw new Error(`vlr: khong chuyen duoc tu vai okr ${JSON.stringify(ket)}`);
		}
	});
});
```
(Giữ dòng tối đa theo biome; chạy `bun run lint` sẽ định dạng lại.)

- [ ] **Step 3: Chạy, phải đỏ**

Run: `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t 'vlr-ghi|vlr-khuon|vlr-chuyen'"`
Expected: FAIL với `vlr: giao buoc cho vai okr khong bi chan`, `vlr: tao tu khuon cho vai okr khong bi chan`, `vlr: chuyen viec sang vai okr khong bi chan`; ca «từ người vai okr» xanh sẵn.

- [ ] **Step 4: Thêm thông điệp** — `onboarding-config.ts`, trong `thongDiep`, ngay sau `khongPhaiThanhVien`:

```ts
		vaiChiOkr: (ten: string) =>
			`${ten} mang vai «chỉ OKR» — không nhận được việc của kế hoạch đối tác.`,
```

- [ ] **Step 5: Thay `thanhVien` bằng `kiemNguoiNhanViec`** — `onboarding-ghi.ts`: thêm import `import { WORKSPACE_ID } from "@crm/db/workspace";` và `import { docDuocDoiTac } from "@crm/validation/vai-workspace";`; thay toàn bộ hàm `thanhVien` bằng:

```ts
export async function kiemNguoiNhanViec(
	tx: Tx,
	userId: string,
): Promise<{ id: string; name: string }> {
	const nguoi = await tx.user.findFirst({
		where: { id: userId, members: { some: { organizationId: WORKSPACE_ID } } },
		select: {
			id: true,
			name: true,
			members: { where: { organizationId: WORKSPACE_ID }, select: { role: true } },
		},
	});
	if (nguoi === null) {
		throw new BadRequestException(
			ONBOARDING.thongDiep.khongPhaiThanhVien(userId),
		);
	}
	if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {
		throw new BadRequestException(ONBOARDING.thongDiep.vaiChiOkr(nguoi.name));
	}
	return { id: nguoi.id, name: nguoi.name };
}

export async function demViecDangGiu(
	tx: Tx,
	userId: string,
): Promise<{ keHoach: number; buoc: number }> {
	const dk = dieuKienChuyen(userId);
	const [keHoach, buoc] = await Promise.all([
		tx.onboardingPlan.count({ where: dk.keHoach }),
		tx.onboardingStep.count({ where: dk.buoc }),
	]);
	return { keHoach, buoc };
}

export async function xoaTheoDoiCua(tx: Tx, userId: string): Promise<number> {
	const { count } = await tx.onboardingWatch.deleteMany({ where: { userId } });
	return count;
}
```
Đổi bốn lời gọi `thanhVien(tx, …)` (`assignStep`, `addStep`, `setPlanOwner`, `transferWork`) thành `kiemNguoiNhanViec(tx, …)`. `demViecDangGiu` đặt SAU `dieuKienChuyen` trong tệp.

- [ ] **Step 6: Tạo từ khuôn** — `onboarding.service.ts`: import `kiemNguoiNhanViec` cùng dòng import `./onboarding-ghi`; trong `createFromTemplate`, dòng đầu của callback `$transaction`:

```ts
			await kiemNguoiNhanViec(tx, input.ownerId);
```

- [ ] **Step 7: Chạy, phải xanh** — cùng lệnh Step 3. Expected: PASS cả năm ca. Chạy thêm bài cũ của khu: `bun run test -- "cd apps/api && bun test test/onboarding-giong-deals.spec.ts test/go-thanh-vien.spec.ts"` — Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/onboarding apps/api/test/vai-chi-okr-ke-hoach.spec.ts apps/api/test/support/ke-hoach-gieo.ts
git commit -m "fix(va-lo-ro-vai-chi-okr): đường ghi kế hoạch và tạo từ khuôn từ chối người vai «chỉ OKR»"
```

---

### Task 3: Thủ tục `onboarding.nguoiNhanViec`

**Phục vụ:** E9 · **independent:** false

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts` (thêm `nguoiNhanViecOutput`)
- Modify: `apps/api/src/onboarding/onboarding.service.ts` (thêm `nguoiNhanViec()`)
- Modify: `apps/api/src/onboarding/onboarding.router.ts` (thêm query)
- Modify: `apps/api/src/generated/server.ts` (sinh lại)
- Test: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts` (describe `vlr-danh-sach`)

**Interfaces:**
- Consumes: `docDuocDoiTac` (Task 1).
- Produces: `trpc.onboarding.nguoiNhanViec` — query không input, trả `{ id: string; name: string; email: string; image: string | null }[]`, xếp `name asc, email asc`.

- [ ] **Step 1: Viết bài đỏ** — thêm vào spec:

```ts
describe("vlr-danh-sach", () => {
	test("vlr-danh-sach: chỉ owner, admin, member; xếp theo tên rồi email", async () => {
		const chu = await gieoThanhVien("VLR DS A Chủ", "owner");
		const qt = await gieoThanhVien("VLR DS B Quản trị", "admin");
		const tv = await gieoThanhVien("VLR DS C Thành viên", "member");
		const okr = await gieoThanhVien("VLR DS D OKR", "okr");
		const ngoai = await gieoNguoiNgoai("VLR DS E Ngoài");
		const ma = new Set([chu.id, qt.id, tv.id, okr.id, ngoai.id]);
		const ds = (await dichVu().nguoiNhanViec()).filter((u) => ma.has(u.id));
		const thay = ds.map((u) => u.id);
		if (JSON.stringify(thay) !== JSON.stringify([chu.id, qt.id, tv.id])) {
			throw new Error(`vlr: danh sach nguoi nhan viec sai ${JSON.stringify(thay)}`);
		}
		expect(ds.map((u) => Object.keys(u).sort().join(","))).toEqual(
			Array(3).fill("email,id,image,name"),
		);
	});
});
```

- [ ] **Step 2: Chạy, phải đỏ** — `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t vlr-danh-sach"` → FAIL (`nguoiNhanViec is not a function`).

- [ ] **Step 3: Khuôn đầu ra** — `onboarding.contracts.ts`:

```ts
export const nguoiNhanViecOutput = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
		image: z.string().nullable(),
	}),
);

export type NguoiNhanViecOutput = z.infer<typeof nguoiNhanViecOutput>;
```

- [ ] **Step 4: Dịch vụ** — `onboarding.service.ts` (import `WORKSPACE_ID` từ `@crm/db/workspace` nếu chưa có, `docDuocDoiTac`, `NguoiNhanViecOutput`):

```ts
	async nguoiNhanViec(): Promise<NguoiNhanViecOutput> {
		const hang = await this.db.user.findMany({
			where: { members: { some: { organizationId: WORKSPACE_ID } } },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				members: { where: { organizationId: WORKSPACE_ID }, select: { role: true } },
			},
			orderBy: [{ name: "asc" }, { email: "asc" }],
		});
		return hang
			.filter((u) => u.members.some((m) => docDuocDoiTac(m.role)))
			.map(({ id, name, email, image }) => ({ id, name, email, image }));
	}
```

- [ ] **Step 5: Router** — `onboarding.router.ts`, cạnh `access`:

```ts
	@Query({
		output: nguoiNhanViecOutput,
		meta: restMeta("GET", "/onboarding/nguoi-nhan-viec", TAG),
	})
	nguoiNhanViec() {
		return this.onboarding.nguoiNhanViec();
	}
```

- [ ] **Step 6: Sinh lại kiểu** — `cd apps/api && bun run trpc:generate`; kiểm `git diff --stat apps/api/src/generated/server.ts` có dòng `nguoiNhanViec`.

- [ ] **Step 7: Chạy, phải xanh** — lệnh Step 2 → PASS. Chạy `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"` — thủ tục mới thuộc phạm vi đối tác nên danh sách vai `okr` không đổi. Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/onboarding apps/api/src/generated/server.ts apps/api/test/vai-chi-okr-ke-hoach.spec.ts
git commit -m "feat(va-lo-ro-vai-chi-okr): thủ tục danh sách người nhận được việc đối tác"
```

---

### Task 4: Đổi vai sang «chỉ OKR»

**Phục vụ:** E5, E6 · **independent:** false · **T3** (`apps/api/src/workspace`)

**Files:**
- Modify: `apps/api/src/workspace/workspace-config.ts` (thêm `messages.conViecKeHoach`)
- Modify: `apps/api/src/workspace/workspace.service.ts` (`setMemberRole`)
- Test: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts` (describe `vlr-doi-vai`)

**Interfaces:**
- Consumes: `docDuocDoiTac` (Task 1); `demViecDangGiu`, `xoaTheoDoiCua` (Task 2).
- Produces: `WORKSPACE_CONFIG.messages.conViecKeHoach(keHoach: number, buoc: number): string`.

- [ ] **Step 1: Viết bài đỏ** — thêm vào spec (import `WorkspaceService`, `AgentTriggerService` type, `WORKSPACE_CONFIG`, `OnboardingTheoDoi`):

```ts
const workspace = () =>
	new WorkspaceService(db, { workspaceChanged: async () => undefined } as unknown as AgentTriggerService);

async function maMember(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).id;
}

async function vaiCua(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).role;
}

const demTheoDoi = (userId: string) => db.onboardingWatch.count({ where: { userId } });

describe("vlr-doi-vai", () => {
	test.each([
		["chi-ke-hoach", 1, 0],
		["chi-buoc", 0, 1],
		["hai-ba", 2, 3],
	])("vlr-doi-vai: còn việc %s → 409 nguyên văn, vai và theo dõi giữ nguyên", async (bien, soKeHoach, soBuoc) => {
		const qt = await gieoThanhVien("QT VLR", "admin");
		const a = await gieoThanhVien(`A VLR ${bien}`, "member");
		const khac = await gieoThanhVien("Khác VLR", "member");
		const bp = await gieoBoPhan();
		for (let i = 0; i < soKeHoach; i += 1) await gieoKeHoach({ camTrich: a.id, buoc: [] });
		await gieoKeHoach({
			camTrich: khac.id,
			buoc: [
				...Array.from({ length: soBuoc }, () => ({ nhan: "B", boPhanId: bp.id, giao: a.id })),
				{ nhan: "Xong", boPhanId: bp.id, giao: a.id, xong: true },
			],
		});
		await gieoKeHoach({ camTrich: a.id, buoc: [{ nhan: "D", boPhanId: bp.id, giao: a.id }], dong: true });
		const { plan: theo } = await gieoKeHoach({ camTrich: khac.id, buoc: [] });
		await db.onboardingWatch.create({ data: { planId: theo.id, userId: a.id } });
		const theoTruoc = await demTheoDoi(a.id);
		let loi = "";
		try {
			await workspace().setMemberRole(qt.id, { memberId: await maMember(a.id), role: "okr" });
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (loi === "") throw new Error(`vlr: doi vai khi con viec khong bi chan ${bien}`);
		if (loi !== WORKSPACE_CONFIG.messages.conViecKeHoach(soKeHoach, soBuoc)) {
			throw new Error(`vlr: loi doi vai sai ${loi}`);
		}
		if (!loi.includes("Chuyển việc")) throw new Error("vlr: loi doi vai khong chi chuyen viec");
		if ((await vaiCua(a.id)) !== "member") throw new Error("vlr: vai da doi khi bi chan");
		if ((await demTheoDoi(a.id)) !== theoTruoc) throw new Error("vlr: theo doi bi xoa khi bi chan");
	});

	test("vlr-doi-vai: chỉ theo dõi → đổi được, xoá hết theo dõi; về member giữ theo dõi; lưu lại okr dọn theo dõi", async () => {
		const qt = await gieoThanhVien("QT2 VLR", "admin");
		const a = await gieoThanhVien("A2 VLR", "member");
		const khac = await gieoThanhVien("Khác2 VLR", "member");
		const { plan: mo } = await gieoKeHoach({ camTrich: khac.id, buoc: [] });
		const { plan: dong } = await gieoKeHoach({ camTrich: khac.id, buoc: [], dong: true });
		await db.onboardingWatch.createMany({ data: [{ planId: mo.id, userId: a.id }, { planId: dong.id, userId: a.id }] });
		expect(await demTheoDoi(a.id)).toBe(2);
		await workspace().setMemberRole(qt.id, { memberId: await maMember(a.id), role: "okr" });
		if ((await vaiCua(a.id)) !== "okr") throw new Error("vlr: doi vai khong xong");
		const con = await demTheoDoi(a.id);
		if (con !== 0) throw new Error(`vlr: con theo doi sau doi vai ${con}`);

		const c = await gieoThanhVien("C VLR", "okr");
		await db.onboardingWatch.create({ data: { planId: mo.id, userId: c.id } });
		await workspace().setMemberRole(qt.id, { memberId: await maMember(c.id), role: "member" });
		if ((await demTheoDoi(c.id)) !== 1) throw new Error("vlr: xoa theo doi khi doi sang vai doc doi tac");

		const d = await gieoThanhVien("D VLR", "okr");
		await db.onboardingWatch.create({ data: { planId: mo.id, userId: d.id } });
		await workspace().setMemberRole(qt.id, { memberId: await maMember(d.id), role: "okr" });
		if ((await demTheoDoi(d.id)) !== 0) throw new Error("vlr: luu lai vai okr khong don theo doi");
		const bp = await gieoBoPhan();
		await gieoKeHoach({ camTrich: khac.id, buoc: [{ nhan: "B", boPhanId: bp.id, giao: d.id }] });
		let loi = "";
		try {
			await workspace().setMemberRole(qt.id, { memberId: await maMember(d.id), role: "okr" });
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (loi !== WORKSPACE_CONFIG.messages.conViecKeHoach(0, 1)) {
			throw new Error(`vlr: luu lai vai okr khi con viec khong bi chan ${loi}`);
		}
	});

	test("vlr-doi-vai: quản trị tự đổi mình khi còn việc → 409; memberId lạ → 404, không xoá theo dõi", async () => {
		const qt = await gieoThanhVien("QT3 VLR", "admin");
		await gieoKeHoach({ camTrich: qt.id, buoc: [] });
		const ma = await maMember(qt.id);
		const loiTu = await nem(
			() => workspace().setMemberRole(qt.id, { memberId: ma, role: "okr" }),
			"vlr: tu doi vai khi con viec khong bi chan",
		);
		expect(loiTu).toBe(WORKSPACE_CONFIG.messages.conViecKeHoach(1, 0));
		const tongTheoDoi = await db.onboardingWatch.count();
		const loiLa = await nem(
			() => workspace().setMemberRole(qt.id, { memberId: "vlr-khong-co", role: "okr" }),
			"vlr: member la khong bi chan",
		);
		expect(loiLa).toBe("That person is not in this workspace.");
		expect(await db.onboardingWatch.count()).toBe(tongTheoDoi);
	});
});
```

- [ ] **Step 2: Chạy, phải đỏ** — `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t vlr-doi-vai"` → FAIL `vlr: doi vai khi con viec khong bi chan chi-ke-hoach`.

- [ ] **Step 3: Thông điệp** — `workspace-config.ts`, trong `messages`:

```ts
		conViecKeHoach: (keHoach: number, buoc: number) =>
			`Người này còn cầm trịch ${keHoach} kế hoạch và làm ${buoc} bước đang mở. Chuyển việc ở màn Thành viên trước, rồi mới đổi sang vai «chỉ OKR».`,
```

- [ ] **Step 4: Chặn trong giao dịch** — `workspace.service.ts`: import `ConflictException` (cùng dòng `@nestjs/common`), `docDuocDoiTac` từ `@crm/validation/vai-workspace`, `demViecDangGiu`, `xoaTheoDoiCua` từ `../onboarding/onboarding-ghi`. Trong `setMemberRole`, `select` của `target` thêm `userId: true`; ngay trước `return tx.member.update(...)`:

```ts
			let theoDoiDaXoa = 0;
			if (!docDuocDoiTac(input.role)) {
				const viec = await demViecDangGiu(tx, target.userId);
				if (viec.keHoach > 0 || viec.buoc > 0) {
					throw new ConflictException(
						WORKSPACE_CONFIG.messages.conViecKeHoach(viec.keHoach, viec.buoc),
					);
				}
				theoDoiDaXoa = await xoaTheoDoiCua(tx, target.userId);
			}
```
Đổi callback trả `{ member: await tx.member.update(...), theoDoiDaXoa }`; sau giao dịch đọc `updated.member` và thêm `theoDoiDaXoa` vào `logger.log` «Workspace role changed». Khối kiểm owner cuối cùng giữ nguyên vị trí (đứng trước).

- [ ] **Step 5: Chạy, phải xanh** — lệnh Step 2 → PASS. Chạy `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts test/vai-chi-okr.spec.ts"` → PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/workspace apps/api/test/vai-chi-okr-ke-hoach.spec.ts
git commit -m "fix(va-lo-ro-vai-chi-okr): đổi sang vai «chỉ OKR» từ chối khi còn việc, xoá lượt theo dõi khi không"
```

---

### Task 5: Bộ gom nhắc lọc vai

**Phục vụ:** E7, E8 · **independent:** false

**Files:**
- Modify: `packages/db/src/onboarding-nhac.ts` (`viecCanNhac`)
- Create: `apps/agent/test/nhac-vai-chi-okr.integration.spec.ts`

**Interfaces:**
- Consumes: `docDuocDoiTac` (Task 1). Kiểm `packages/db/package.json` có `@crm/validation` trong `dependencies` (bộ gom OKR đã dùng); thiếu thì thêm `"@crm/validation": "workspace:*"` và `bun install`.
- Produces: không đổi chữ ký `viecCanNhac`.

- [ ] **Step 1: Viết bài đỏ** — `apps/agent/test/nhac-vai-chi-okr.integration.spec.ts`. Dựng theo khuôn `okr-nhac.integration.spec.ts` (chu kỳ, mục tiêu, KR bằng `support/okr-gieo.ts`) và `nhac-qua-zalo.integration.spec.ts` (`zaloGia`, `slackGia`, `noiZalo`, `batBot`, `voiToken`, `TOKEN`, `APP_URL` từ `support/tra-loi-gieo.ts`; `gieoNguoi`, `gieoKeHoach`, `noiSlack`, `khopSlack`, `donDep`, `moXuong` từ `support/nhac-gieo.ts`; `hangCua` từ `support/nhac-gui-gieo.ts`). Ghim giờ `setSystemTime(new Date("2026-10-14T03:00:00.000Z"))` (thứ Tư 10:00 giờ VN — ngày `okr-cap-nhat` có mặt, theo `okr-nhac.integration.spec.ts` ca `nhac-cap-nhat`).

  Hàm dựng `dungNguoi(ten, vai)` cho một người: (1) một kế hoạch do người khác cầm trịch với một bước hạn `now + 2 ngày` giao cho họ (`buoc-sap-han`); (2) một kế hoạch họ cầm trịch, `imTu` 8 ngày trước (`ke-hoach-im`); (3) một kế hoạch `batDau` 6 ngày trước họ theo dõi (`moc-ngay`, ngày 7); (4) một KR đang chạy họ làm chủ cần cập nhật tuần, tên `KR VLR <ten>`; tên công ty `Cong Ty VLR <ten> <n>`; sau khi dựng, đặt `member.role = vai`.

```ts
const LOAI_KE_HOACH = ["buoc-qua-han", "buoc-sap-han", "ke-hoach-im", "moc-ngay"];

describe("vlr-gom", () => {
	test("vlr-gom: vai okr không có việc kế hoạch ở cả hai cửa sổ, vẫn có việc OKR; member đủ ba loại; người đã rời không có gì", async () => {
		const okr = await dungNguoi("vlr-gom-okr", "okr");
		const thuong = await dungNguoi("vlr-gom-member", "member");
		const roi = await dungNguoi("vlr-gom-roi", "member");
		await db.member.deleteMany({ where: { userId: roi.id } });
		for (const cuaSo of ["buoi-sang", "truc-tiep"] as const) {
			const kq = await viecCanNhac(db, { now: new Date(), cuaSo });
			const cuaOkr = kq.get(okr.id) ?? [];
			const lo = cuaOkr.find((v) => LOAI_KE_HOACH.includes(v.loai));
			if (lo) throw new Error(`vlr: bo gom con viec ke hoach cho vai okr ${lo.loai} ${cuaSo}`);
			if (!cuaOkr.some((v) => v.loai === "okr-cap-nhat")) throw new Error(`vlr: bo gom mat viec okr ${cuaSo}`);
			const cuaThuong = (kq.get(thuong.id) ?? []).map((v) => v.loai);
			for (const loai of ["buoc-sap-han", "ke-hoach-im", "moc-ngay"]) {
				if (!cuaThuong.includes(loai)) throw new Error(`vlr: doi chung thieu ${loai} ${cuaSo}`);
			}
			expect(kq.has(roi.id)).toBe(false);
		}
	});
});

describe("vlr-tin", () => {
	test.each(["zalo", "slack"] as const)("vlr-tin: tin %s tới vai okr có việc OKR, không tên công ty", async (kenh) => {
		const nguoi = await dungNguoi(`vlr-tin-${kenh}`, "okr");
		const z = zaloGia();
		const s = slackGia();
		if (kenh === "zalo") {
			await noiZalo(nguoi.id, `Z-${nguoi.id}`);
			await batBot();
		} else {
			await noiSlack(nguoi.id);
			await khopSlack(nguoi.id, `S-${nguoi.id}`);
			await db.notificationPreference.create({ data: { userId: nguoi.id, kenh: "SLACK" } });
		}
		await lenLichNhac(new Date());
		const hang = await hangCua(nguoi.id);
		await voiToken(() => chayNhac(hang, { fetcher: s.fetcher, zaloFetcher: z.fetcher, appUrl: APP_URL }));
		const tin =
			kenh === "zalo"
				? z.guiToi(`Z-${nguoi.id}`).map((g) => g.body.text ?? "")
				: s.goi.filter((g) => g.url.endsWith("chat.postMessage")).map((g) => g.body.text ?? "");
		if (tin.length !== 1) throw new Error(`vlr: ${kenh} khong gui dung mot tin ${tin.length}`);
		if (!tin[0]?.includes(`KR VLR vlr-tin-${kenh}`)) throw new Error(`vlr: tin ${kenh} thieu viec okr`);
		if (tin[0]?.includes("Cong Ty VLR")) throw new Error(`vlr: tin ${kenh} mang ten doi tac`);
		const payload = parseNhacPayload((await db.agentTask.findUniqueOrThrow({ where: { id: hang.id } })).payload);
		if ((payload.daGui ?? []).some((m) => LOAI_KE_HOACH.includes(m.loai))) throw new Error("vlr: daGui co viec ke hoach");
	});

	test("vlr-tin: vai okr chỉ có việc kế hoạch → không hàng, không tin; member cùng khuôn có hàng", async () => {
		const bp = await db.department.create({ data: { name: `${TIEN_TO}bp-vlr`, position: 0 } });
		const okr = await gieoNguoi("vlr-chi-ke-hoach");
		const thuong = await gieoNguoi("vlr-chi-ke-hoach-member");
		const cam = await gieoNguoi("vlr-cam");
		for (const n of [okr, thuong]) {
			await gieoKeHoach({ camTrich: cam.id, batDau: new Date(), buoc: [{ nhan: "B", han: new Date(Date.now() + 2 * DAY_MS), giao: n.id }] });
		}
		await db.member.updateMany({ where: { userId: okr.id }, data: { role: "okr" } });
		await noiZalo(okr.id, `Z-${okr.id}`);
		await batBot();
		await lenLichNhac(new Date());
		const theoTienTo = (id: string) => db.agentTask.count({ where: { kind: "nhac-ke-hoach", subject: { startsWith: `user:${id}:` } } });
		if ((await theoTienTo(thuong.id)) === 0) throw new Error("vlr: doi chung chi ke hoach khong co hang");
		if ((await theoTienTo(okr.id)) !== 0) throw new Error("vlr: ghi hang nhac cho vai okr chi co ke hoach");
		const z = zaloGia();
		for (const h of await db.agentTask.findMany({ where: { kind: "nhac-ke-hoach", finishedAt: null } })) {
			await voiToken(() => chayNhac(h, { zaloFetcher: z.fetcher, appUrl: APP_URL })).catch(() => undefined);
		}
		if (z.guiToi(`Z-${okr.id}`).length > 0) throw new Error("vlr: gui tin cho vai okr chi co ke hoach");
	});
});
```
Khi viết, khớp chữ ký thật của `gieoKeHoach`/`BuocGieo` ở `support/nhac-gieo.ts` (tên trường `han`, `giao`), của `noiZalo` ở `support/tra-loi-gieo.ts`, và trường kênh của `notificationPreference` theo `packages/db/prisma/schema.prisma`. Đối chứng dương «tin của member chứa tên công ty của chính họ» thêm vào ca `zalo`: dựng `vlr-tin-member` cùng khuôn, nối Zalo, chạy, khẳng định tin có `Cong Ty VLR vlr-tin-member`.

- [ ] **Step 2: Chạy, phải đỏ** — `bun run test -- "cd apps/agent && bun test test/nhac-vai-chi-okr.integration.spec.ts"` → FAIL `vlr: bo gom con viec ke hoach cho vai okr buoc-sap-han buoi-sang` và `vlr: tin zalo mang ten doi tac`.

- [ ] **Step 3: Lọc trong bộ gom** — `packages/db/src/onboarding-nhac.ts`: import `docDuocDoiTac` từ `@crm/validation/vai-workspace`; trong `viecCanNhac`, `select` của `member.findMany` thành `{ userId: true, role: true }`, rồi thay hai dòng cuối:

```ts
	const tap = new Set(thanhVien.map((m) => m.userId));
	const tapDoiTac = new Set(
		thanhVien.filter((m) => docDuocDoiTac(m.role)).map((m) => m.userId),
	);
	return gop(
		gom(keHoach.flatMap((k) => guiCua(k, tapDoiTac, chon.now))),
		okr,
		taiLieu,
		tomTat,
		ai,
		tap,
	);
```

- [ ] **Step 4: Chạy, phải xanh** — lệnh Step 2 → PASS. Chạy bộ nhắc cũ: `bun run test -- "cd apps/agent && bun test test/nhac-ke-hoach.integration.spec.ts test/nhac-qua-zalo.integration.spec.ts test/okr-nhac.integration.spec.ts test/tra-loi-tin-nhac.integration.spec.ts"` → PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/onboarding-nhac.ts apps/agent/test/nhac-vai-chi-okr.integration.spec.ts
git commit -m "fix(va-lo-ro-vai-chi-okr): bộ gom nhắc chỉ gom việc kế hoạch cho người đọc được dữ liệu đối tác"
```

---

### Task 6: «Việc của bạn» và Tổng quan qua cửa thật

**Phục vụ:** E7b · **independent:** false

**Files:**
- Test: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts` (describe `vlr-viec-cua-toi`)

**Interfaces:**
- Consumes: Task 5 (bộ gom đã lọc); `createApp` (`../src/create-app`), `goiTrpc`, `dangNhap`, `datMatKhau` (`./ma-tran-thu`), `BackfillService` (spy `auto`, như `vai-chi-okr.spec.ts`).

- [ ] **Step 1: Viết bài** — thêm vào spec một `describe("vlr-viec-cua-toi")` có `beforeAll` dựng `app = await createApp()` và `spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false })`, `afterAll` đóng app. Dựng `vlr-vct-okr` (giao một bước sắp hạn qua `OnboardingGhi.assignStep` khi còn `member`, làm chủ một KR đang chạy theo `apps/api/test/okr-*` khuôn sẵn có, rồi `doiVai(id, "okr")`) và `vlr-vct-member` (một bước sắp hạn). `datMatKhau` cho cả hai, `dangNhap` lấy cookie.

```ts
		const viec = await goiTrpc(app, "okr.viecCuaToi", "query", undefined, { cookie: cookieOkr });
		const than = JSON.stringify(viec.body);
		const ds = viec.body?.result?.data?.viec ?? [];
		if (ds.some((m: { loai: string }) => LOAI_KE_HOACH.includes(m.loai))) {
			throw new Error("vlr: viec cua toi co ke hoach cho vai okr");
		}
		if (than.includes(tenCongTyOkr)) throw new Error("vlr: viec cua toi mang ten doi tac");
		const tq = await goiTrpc(app, "dashboard.get", "query", undefined, { cookie: cookieOkr });
		if (tq.status !== 403 || !JSON.stringify(tq.body).includes(KHONG_TRONG_PHAM_VI)) {
			throw new Error("vlr: tong quan mo cho vai okr");
		}
		const tqThuong = await goiTrpc(app, "dashboard.get", "query", undefined, { cookie: cookieThuong });
		const buoc = tqThuong.body?.result?.data?.mySteps ?? [];
		if (!buoc.some((b: { id: string }) => b.id === buocThuong.id)) {
			throw new Error("vlr: doi chung tong quan thieu buoc");
		}
```
Tên thủ tục Tổng quan khớp router thật (`grep -n "@Query" apps/api/src/dashboard/dashboard.router.ts`); đọc khuôn thân trả lời tRPC như `vai-chi-okr.spec.ts` đọc.

- [ ] **Step 2: Chạy** — `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t vlr-viec-cua-toi"` → PASS. Ca này giữ một cửa đã kín (`okr.viecCuaToi` lọc `laViecOkr`, Tổng quan chặn ở cửa), nên nó xanh cả trước Task 5. Chiều đỏ đo tay một lần trên cây: bỏ `.filter(laViecOkr)` ở `apps/api/src/okr/okr-trao-doi.service.ts` → phải đỏ `vlr: viec cua toi co ke hoach cho vai okr`; hoàn lại bằng `git checkout -- apps/api/src/okr/okr-trao-doi.service.ts` SAU khi đã commit phần việc của task (bài học «phá-thử tại chỗ mất thay đổi»), kiểm `git diff --quiet`.

- [ ] **Step 3: Commit**

```bash
git add apps/api/test/vai-chi-okr-ke-hoach.spec.ts
git commit -m "test(va-lo-ro-vai-chi-okr): thẻ Việc của bạn và Tổng quan không lộ việc kế hoạch cho vai «chỉ OKR»"
```

---

### Task 7: Ba ô chọn người đọc danh sách mới

**Phục vụ:** E9b · **independent:** false

**Files:**
- Modify: `apps/app/components/crm/record-sheet/plan-steps.tsx` (dòng ~390 `users.list` → `onboarding.nguoiNhanViec`; giữ người đang giữ bước trong tuỳ chọn)
- Modify: `apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx` (dòng ~69)
- Modify: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx` (dòng ~48)
- Create: `apps/app/test/nguoi-nhan-viec.dom.tsx`

**Interfaces:**
- Consumes: `trpc.onboarding.nguoiNhanViec` (Task 3).

- [ ] **Step 1: Viết bài đỏ** — `apps/app/test/nguoi-nhan-viec.dom.tsx` theo khuôn `apps/app/test/lam-moi-chuyen-viec.dom.tsx` (`linkGia`, `traLoi`, `mock.module("@/lib/trpc/client", …)`). `traLoi.set("onboarding.nguoiNhanViec", () => BA)` với `BA` = Chủ, Quản trị, Thành viên; `traLoi.set("users.list", () => NAM)` với thêm «Người OKR», «Người Ngoài». Ba ca `vlr-o-chon`: render `PlanSteps` (props theo `onboarding-giong-deals.dom.tsx` hoặc test sẵn có của nó), `TaoKeHoach` mở hộp, `ChuyenViecDialog` mở; mở ô chọn (click nút combobox/select), đọc tên trong danh sách bằng `document.querySelectorAll('[role="option"]')`; so tập với `BA` — lệch thì `throw new Error(\`vlr: o chon ${o} liet ke sai ${ten}\`)`. Ca «đang giữ»: bước có `assigneeId: "u-okr"`, `assignee: { id: "u-okr", name: "Người OKR", image: null }` → nút ô người làm có chữ «Người OKR», không thì `throw new Error("vlr: o chon mat ten nguoi dang giu")`.

- [ ] **Step 2: Chạy, phải đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/nguoi-nhan-viec.dom.tsx -t vlr-o-chon` → FAIL `vlr: o chon ... liet ke sai Người OKR`.

- [ ] **Step 3: Đổi nguồn** — ở cả ba tệp thay `trpc.users.list.queryOptions()` bằng `trpc.onboarding.nguoiNhanViec.queryOptions()` (giữ `enabled` sẵn có). Trong `plan-steps.tsx`, nơi dựng tuỳ chọn cho Combobox của một bước:

```tsx
	const nguoiCuaBuoc =
		buoc.assignee && !nguoi.some((n) => n.value === buoc.assignee?.id)
			? [...nguoi, { value: buoc.assignee.id, label: buoc.assignee.name }]
			: nguoi;
```
và truyền `nguoiCuaBuoc` thay `nguoi` vào Combobox của bước đó (đọc khối dòng 150–180 để đặt đúng chỗ; `nguoi` hiện là prop truyền từ dòng 406).

- [ ] **Step 4: Chạy, phải xanh** — lệnh Step 2 → PASS. Chạy các bài DOM của ba màn: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-chuyen-viec.dom.tsx ./test/onboarding-giong-deals.dom.tsx` — bài nào mock `users.list` cho ô chọn thì thêm `onboarding.nguoiNhanViec` vào mock của nó. Expected: PASS. Chạy `bun run check-types`.

- [ ] **Step 5: Commit**

```bash
git add apps/app/components/crm/record-sheet/plan-steps.tsx "apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx" "apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx" apps/app/test
git commit -m "fix(va-lo-ro-vai-chi-okr): ba ô chọn người của kế hoạch chỉ liệt kê người nhận được việc"
```

---

### Task 8: Thước đếm rò — cờ `--trong` và bài kiểm

**Phục vụ:** E10 · **independent:** false

**Files:**
- Modify: `_acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs`
- Create: `apps/api/test/ro-vai-chi-okr.spec.ts`

- [ ] **Step 1: Viết bài đỏ** — `apps/api/test/ro-vai-chi-okr.spec.ts`: dựng `vlr-thuoc-okr` qua `OnboardingGhi` khi còn `member` (bước mở, kế hoạch mở họ cầm trịch, theo dõi kế hoạch mở) cộng bốn vật đã khép (bước đã xong ở kế hoạch mở; kế hoạch đã đóng họ cầm trịch có một bước chưa xong giao họ; theo dõi kế hoạch đã đóng); một `agentTask` `nhac-ke-hoach` subject `user:<id>:<ngayVN(now)>`, outcome `da-gui:1`, payload `{ muc: [...], daGui: [{ loai: "buoc-sap-han", planId, stepId }], kenh: "zalo" }`; rồi `doiVai(id, "okr")`. Vân tay: `md5(string_agg(t::text, '' ORDER BY id))` cho từng bảng lọc theo người. Chạy thước bằng `spawnSync("node", [THUOC, ...co], { env: { ...process.env, DATABASE_URL } })` với `THUOC` suy từ `import.meta.dir`.

```ts
const ket = chay([]);
if (ket.status !== 1) throw new Error(`vlr: thuoc khong do ${ket.status}`);
const j = JSON.parse(ket.stdout);
for (const khoa of ["buocMo", "keHoachMo", "theoDoiMo", "nhacDaMangKeHoach"]) {
	const so = j[khoa].theoNguoi[id];
	if (so !== 1) throw new Error(`vlr: thuoc dem sai ${khoa} ${so}`);
}
if ((await vanTay(id)) !== truoc) throw new Error("vlr: thuoc ghi vao kho");
if (chay(["--trong", id]).status !== 1) throw new Error("vlr: co --trong khong do");
await ghi().transferWork({ fromUserId: id, toUserId: thuong.id }, quanTri.id);
await db.onboardingWatch.deleteMany({ where: { userId: id, plan: { closedAt: null } } });
const sach = chay(["--trong", id]);
if (sach.status !== 0) throw new Error(`vlr: thuoc khong ve 0 khi sach ${sach.status}`);
const thieu = spawnSync("node", [THUOC], { env: { PATH: process.env.PATH } });
if (thieu.status !== 2) throw new Error("vlr: thuoc khong tu choi khi thieu bien");
```
(Lưu ý: sau `transferWork` người đó không còn cầm kế hoạch mở; kế hoạch đã đóng không tính.)

- [ ] **Step 2: Chạy, phải đỏ** — `bun run test -- "cd apps/api && bun test test/ro-vai-chi-okr.spec.ts"` → FAIL `vlr: co --trong khong do` (thước chưa biết cờ, tính cả kho).

- [ ] **Step 3: Cờ `--trong`** — trong `ro-vai-chi-okr.mjs`: đọc `process.argv` lấy giá trị sau `--trong` (tách dấu phẩy) thành `trong: string[] | null`; mỗi câu SQL thêm `AND ($5::text[] IS NULL OR <cột người> = ANY($5))` (cột: `m."userId"`), truyền `trong` làm tham số thứ năm ở mọi lời gọi (đổi số thứ tự tham số của `nhac` cho khớp). Không đổi đầu ra JSON.

- [ ] **Step 4: Chạy, phải xanh** — lệnh Step 2 → PASS. Chạy thước trên CSDL dev: `(set -a; . ./.env; set +a; node _acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs)` → thoát 0.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs apps/api/test/ro-vai-chi-okr.spec.ts
git commit -m "test(va-lo-ro-vai-chi-okr): thước đếm rò chỉ đọc có bài kiểm hai chiều và cờ --trong"
```

---

### Task 9: Phép đo đột biến

**Phục vụ:** E11 · **independent:** false

**Files:**
- Create: `_acceptance/va-lo-ro-vai-chi-okr/rang/dot-bien.mjs`

- [ ] **Step 1: Viết script** theo khuôn `_acceptance/okr-mau-xoa-cau-hinh/rang/dot-bien.mjs` (import `dungBanSao`, `goBanSao`, `KhongDo`, `thayMotLan` từ `../../ca-chap-chon-cach-ly/rang/ban-sao.mjs`; `SO_CAP_KHAI = 9`; mỗi cặp `[tên, lệnh, tệp, chuỗi cũ, chuỗi mới, thông điệp ghim]`). Chín cặp — chuỗi cũ chép NGUYÊN VĂN từ mã đã commit ở Task 2–5, 8:

| Cặp | Tệp | Phá | Lệnh | Thông điệp ghim |
| --- | --- | --- | --- | --- |
| a | `apps/api/src/onboarding/onboarding-ghi.ts` | `!nguoi.members.some((m) => docDuocDoiTac(m.role))` → `false` | `vlr-ghi` | `vlr: giao buoc cho vai okr khong bi chan` |
| b | `apps/api/src/onboarding/onboarding.service.ts` | xoá `await kiemNguoiNhanViec(tx, input.ownerId);` | `vlr-khuon` | `vlr: tao tu khuon cho vai okr khong bi chan` |
| c | `apps/api/src/workspace/workspace.service.ts` | `viec.keHoach > 0 \|\| viec.buoc > 0` → `false` | `vlr-doi-vai` | `vlr: doi vai khi con viec khong bi chan` |
| d | `apps/api/src/workspace/workspace.service.ts` | `theoDoiDaXoa = await xoaTheoDoiCua(tx, target.userId);` → `theoDoiDaXoa = 0;` | `vlr-doi-vai` | `vlr: con theo doi sau doi vai` |
| e | `packages/db/src/onboarding-nhac.ts` | `guiCua(k, tapDoiTac, chon.now)` → `guiCua(k, tap, chon.now)` | `vlr-gom` | `vlr: bo gom con viec ke hoach cho vai okr` |
| e2 | như e | như e | `vlr-tin` | `vlr: tin zalo mang ten doi tac` |
| f | `apps/api/src/onboarding/onboarding.service.ts` | `.filter((u) => u.members.some((m) => docDuocDoiTac(m.role)))` → `.filter(() => true)` | `vlr-danh-sach` | `vlr: danh sach nguoi nhan viec sai` |
| g | `_acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs` | trong câu `buoc`: `AND s."completedAt" IS NULL AND p."closedAt" IS NULL` → chuỗi rỗng | `ro-vai-chi-okr.spec.ts` | `vlr: thuoc dem sai` |
| h | `apps/api/src/workspace/workspace.service.ts` | `if (!docDuocDoiTac(input.role)) {` → `if (!docDuocDoiTac(input.role) && target.role !== input.role) {` | `vlr-doi-vai` | `vlr: luu lai vai okr khong don theo doi` |

Lệnh của mỗi cặp: `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts -t <tag>"` (agent: `cd apps/agent && bun test test/nhac-vai-chi-okr.integration.spec.ts -t <tag>`; g: `cd apps/api && bun test test/ro-vai-chi-okr.spec.ts`). Cuối script in `dot-bien: <đạt>/9 cap dat`, thoát 1 khi đạt khác 9; sau lượt `git diff --quiet -- <các tệp vật>` phải sạch.

- [ ] **Step 2: Chạy** — `node _acceptance/va-lo-ro-vai-chi-okr/rang/dot-bien.mjs` → in `dot-bien: 9/9 cap dat`, thoát 0. Một cặp không đỏ → phép đo của nó hằng đúng: sửa bài kiểm, không sửa script.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/va-lo-ro-vai-chi-okr/rang/dot-bien.mjs
git commit -m "test(va-lo-ro-vai-chi-okr): chín cặp đột biến chứng mọi phép đo bắt lỗi"
```

---

### Task 10: Tài liệu

**Phục vụ:** E12 · **independent:** false

**Files:**
- Modify: `docs/api.md` (mục «tRPC is the data surface»: một gạch đầu dòng về đường ghi kế hoạch 30 ngày; mục «One organization»: một gạch đầu dòng về đổi sang vai «chỉ OKR»)
- Modify: `docs/agent.md` (mục «Nhắc buổi sáng»: một gạch đầu dòng về lọc vai ở bộ gom)

- [ ] **Step 1: `docs/api.md`** — sau gạch đầu dòng «**The `okr` role is the fourth workspace role**»:

```markdown
- **Kế hoạch 30 ngày không giao việc cho người không đọc được dữ liệu đối tác.**
  Giao bước, thêm bước có người làm, đổi người cầm trịch, tạo kế hoạch từ khuôn và
  chuyển việc 30 ngày đều qua `kiemNguoiNhanViec` (`onboarding-ghi.ts`): không có hàng
  `member` → 400 «không phải thành viên»; vai không đọc được dữ liệu đối tác → 400
  `ONBOARDING.thongDiep.vaiChiOkr`. Ba ô chọn người đọc `onboarding.nguoiNhanViec`,
  cùng luật. Luật là một hàm, `docDuocDoiTac` (`@crm/validation/vai-workspace`).
```
và trong «One organization», sau gạch đầu dòng «**Permissions come from `@crm/auth`**»:

```markdown
- **Đổi sang vai «chỉ OKR» không để lại việc đối tác.** `setMemberRole` sang một vai
  `!docDuocDoiTac` — kể cả lưu lại đúng vai đó — đếm kế hoạch mở người đó cầm trịch và
  bước chưa xong của kế hoạch mở người đó làm: lớn hơn 0 thì 409
  `WORKSPACE_CONFIG.messages.conViecKeHoach` chỉ sang «Chuyển việc»; bằng 0 thì xoá mọi
  lượt theo dõi của họ trong cùng giao dịch.
```

- [ ] **Step 2: `docs/agent.md`** — trong «Nhắc buổi sáng», sau gạch đầu dòng «**Việc OKR đi chung một tin.**»:

```markdown
- **Việc kế hoạch chỉ gom cho người đọc được dữ liệu đối tác.** `viecCanNhac` dựng
  `tapDoiTac` bằng `docDuocDoiTac` (`@crm/validation/vai-workspace`) và chỉ gom bốn loại
  kế hoạch (mang tên công ty) cho người trong tập đó; mục OKR, Kho tài liệu, Tóm tắt
  tuần, ngân sách AI vẫn gom cho mọi thành viên. Người vai «chỉ OKR» chỉ có việc kế
  hoạch thì không có hàng nhắc nào. Lọc ở gói dùng chung nên tin nhắc, thẻ «Việc của
  bạn» và Tổng quan cùng một luật.
```

- [ ] **Step 3: Kiểm** — `bun run lint` (biome cho markdown nếu có) và đọc lại hai mục.

- [ ] **Step 4: Commit**

```bash
git add docs/api.md docs/agent.md
git commit -m "docs(va-lo-ro-vai-chi-okr): luật vai «chỉ OKR» ở kế hoạch 30 ngày, đổi vai và bộ gom nhắc"
```

---

## Cuối S3

- `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test -- --filter=api`, `bun run test -- --filter=agent --filter=@crm/db`, `bun run test -- --filter=app` xanh.
- Contract `status: implemented`, rồi xin khoá `s4` ở giám sát trước lượt S4.
