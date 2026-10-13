# Mở lại không trả việc cho người «chỉ OKR» — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mở lại kế hoạch đã đóng và bỏ «xong» một bước đi qua điều kiện nhận việc của giao bước, để người vai «chỉ OKR» hay đã rời không nhận lại việc mở nào.

**Architecture:** Thêm vào `apps/api/src/onboarding/onboarding-ghi.ts` một hàm đọc chung `docNguoiNhan` và ba hàm sửa
(`traCamTrich`, `traBuocKhongNhan`, `goTheoDoiKhongNhan`), gọi từ `datDong` khi mở lại và từ `setStepDone` khi bỏ
xong, trong cùng giao dịch. `datBuocXong` (`packages/db`) và `kiemNguoiNhanViec` không đổi thân.

**Tech Stack:** NestJS + Prisma (Postgres), `bun test` qua `bun run test` (cơ sở dữ liệu thử riêng mỗi lượt).

**Spec:** `docs/superpowers/specs/2026-10-13-mo-lai-khong-tra-viec-chi-okr-design.md` · hợp đồng
`_acceptance/mo-lai-khong-tra-viec-chi-okr/contract.md` · đo `_acceptance/mo-lai-khong-tra-viec-chi-okr/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Giữ nguyên văn dòng `if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {` trong `kiemNguoiNhanViec` —
  phép phá-thử (a) của hồ sơ đã ký `va-lo-ro-vai-chi-okr` thay đúng chuỗi đó.
- Không đổi `packages/db/src/onboarding-buoc.ts` (agent dùng chung, chỉ `done: true`).
- Lời từ chối dùng hằng có sẵn `ONBOARDING.thongDiep.vaiChiOkr` / `khongPhaiThanhVien`; không thêm chữ mới.
- Dữ liệu thử qua đường ghi thật; chỉ ca «dữ liệu cũ» đặt vai thẳng bằng `doiVai`.
- Không mốc giờ cố định gây bom giờ: hạn bước tính từ `ngayCach` hoặc ngày cố định quá khứ, không phụ thuộc giờ chạy.

## Review Focus

- Người được giao là user đã bị xoá hẳn (không còn hàng `user`) → coi là không nhận được việc, tên trong vết rơi về mã.
- Kế hoạch không có bước nào chưa xong và không ai theo dõi → mở lại chỉ ghi vết mở lại (AC-2 phủ).
- Người bấm mở lại chính là người cầm trịch cũ đã sang «chỉ OKR» (gọi thẳng dịch vụ) → 400, kế hoạch vẫn đóng (AC-4 phủ).
- Bỏ xong một bước chưa giao (`assigneeId` null) → không thêm vết giao (ca trong Task 1, `mlk-bo-xong`).
- Bỏ xong lần hai trên bước đã mở → `khong-doi`, không vết mới, không gỡ người (ca trong Task 1, `mlk-bo-xong`).

---

### Task 1: Bài kiểm đỏ trước (E1–E7)

**Files:**
- Create: `apps/api/test/mo-lai-vai-chi-okr.spec.ts`
- Đã có: khoá `mlk_mo_lai`, `mlk_bo_xong`, `mlk_thuoc` trong `_acceptance/config.yaml`

**Interfaces:**
- Consumes: `OnboardingService` (`createFromTemplate`, `closePlan`, `reopenPlan`, `setStepDone`, `addStep`, `assignStep`),
  `OnboardingGhi.datDong(id, dong, actingUserId)`, `OnboardingTheoDoi.bat({planId}, userId)`,
  `WorkspaceService(db, {workspaceChanged} as AgentTriggerService)` `.setMemberRole(qt, {memberId, role})`,
  `.removeMember(qt, {memberId})`; trợ thủ `support/ke-hoach-gieo.ts` (`gieoThanhVien`, `gieoNguoiNgoai`, `doiVai`,
  `gieoBoPhan`, `gieoCongTy`, `dichVu`, `moXuong`, `donDep`).
- Produces: ba nhóm `describe` mang tiền tố `mlk-mo-lai`, `mlk-bo-xong`, `mlk-thuoc` (khớp `-t` của config).

- [ ] **Step 1: Viết tệp bài kiểm.** Mỗi ca đúng như `expected` của E1–E7 trong `evals.yaml`: dựng qua đường thật, chốt
  dựng `mlk: dung sai <khoá>`, thao tác, rồi ném đúng các thông điệp ghim. Vết mới = `activity` của kế hoạch có id
  không nằm trong tập id chụp trước thao tác; so `kind` (`meta.kind`) sắp theo chữ. Thêm hai ca của Review Focus:
  «bỏ xong bước chưa giao» (vết mới đúng `['buoc.boXong']`, ném `'mlk: bo xong buoc chua giao co vet giao'`) và «bỏ
  xong lần hai» (không vết mới, ném `'mlk: bo xong lan hai co vet'`). E7 tính `THUOC` bằng
  `join(import.meta.dir, "..", "..", "..", "_acceptance", "va-lo-ro-vai-chi-okr", "rang", "ro-vai-chi-okr.mjs")`, kiểm
  `existsSync` trước, chạy `spawnSync("node", [THUOC, "--trong", id], {env: {...process.env, DATABASE_URL:
  process.env.TEST_DATABASE_URL}})`.
- [ ] **Step 2: Chạy, xác nhận đỏ đúng chỗ.**
  Run: `bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts"`
  Expected: FAIL — E1 «chỉ OKR» ném `mlk: cam trich chua doi sang nguoi mo lai`, E5 ném `mlk: bo xong tra buoc ve vai okr`,
  E7 «sau mở lại» thoát 1; E2, E6, E7 «đường cũ» và hai ca Review Focus xanh (đối chứng chạy được trước phần sửa).
- [ ] **Step 3: Commit** `test(mo-lai-khong-tra-viec-chi-okr): bài kiểm đỏ trước cho mở lại và bỏ xong`.

### Task 2: Mở lại và bỏ xong đi qua điều kiện nhận việc

**Files:**
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` (thêm sau `kiemNguoiNhanViec`; sửa `setStepDone`, `datDong`)

**Interfaces:**
- Produces (nội bộ tệp): `docNguoiNhan(tx, userIds) → Map<string, NguoiNhan>`, `nhanDuoc(map, id) → boolean`,
  `traCamTrich(tx, plan, actingUserId) → KeHoachGoc`, `traBuocKhongNhan(tx, plan, buoc[], actingUserId) → void`,
  `goTheoDoiKhongNhan(tx, planId) → void`.

- [ ] **Step 1: Thêm hàm đọc và ba hàm sửa.**

```ts
type NguoiNhan = { id: string; name: string; nhanDuoc: boolean };

async function docNguoiNhan(
	tx: Tx,
	userIds: string[],
): Promise<Map<string, NguoiNhan>> {
	const ds = await tx.user.findMany({
		where: { id: { in: [...new Set(userIds)] } },
		select: {
			id: true,
			name: true,
			members: {
				where: { organizationId: WORKSPACE_ID },
				select: { role: true },
			},
		},
	});
	return new Map(
		ds.map((n) => [
			n.id,
			{
				id: n.id,
				name: n.name,
				nhanDuoc: n.members.some((m) => docDuocDoiTac(m.role)),
			},
		]),
	);
}

function nhanDuoc(nguoi: Map<string, NguoiNhan>, id: string): boolean {
	return nguoi.get(id)?.nhanDuoc === true;
}

async function traCamTrich(
	tx: Tx,
	plan: KeHoachGoc,
	actingUserId: string,
): Promise<KeHoachGoc> {
	const nguoi = await docNguoiNhan(tx, [plan.ownerId]);
	if (nhanDuoc(nguoi, plan.ownerId)) return plan;
	const moi = await kiemNguoiNhanViec(tx, actingUserId);
	const sau = await tx.onboardingPlan.update({
		where: { id: plan.id },
		data: { ownerId: moi.id },
	});
	await ghiVet(
		tx,
		plan,
		vet.keHoachDoiCamTrich({
			tu: plan.ownerId,
			tuTen: nguoi.get(plan.ownerId)?.name ?? plan.ownerId,
			den: moi.id,
			denTen: moi.name,
		}),
		actingUserId,
	);
	return sau;
}

type BuocGiu = { id: string; label: string; assigneeId: string | null };

async function traBuocKhongNhan(
	tx: Tx,
	plan: { id: string; companyId: string },
	buoc: BuocGiu[],
	actingUserId: string,
): Promise<void> {
	const giu = buoc.flatMap((b) =>
		b.assigneeId === null ? [] : [{ ...b, assigneeId: b.assigneeId }],
	);
	if (giu.length === 0) return;
	const nguoi = await docNguoiNhan(
		tx,
		giu.map((b) => b.assigneeId),
	);
	for (const b of giu) {
		if (nhanDuoc(nguoi, b.assigneeId)) continue;
		await tx.onboardingStep.update({
			where: { id: b.id },
			data: { assigneeId: null },
		});
		await ghiVet(
			tx,
			plan,
			vet.buocGiao({
				stepId: b.id,
				nhan: b.label,
				tu: b.assigneeId,
				tuTen: nguoi.get(b.assigneeId)?.name ?? b.assigneeId,
				den: null,
				denTen: null,
			}),
			actingUserId,
		);
	}
}

async function goTheoDoiKhongNhan(tx: Tx, planId: string): Promise<void> {
	const ds = await tx.onboardingWatch.findMany({
		where: { planId },
		select: { userId: true },
	});
	const nguoi = await docNguoiNhan(
		tx,
		ds.map((w) => w.userId),
	);
	const bo = ds.map((w) => w.userId).filter((id) => !nhanDuoc(nguoi, id));
	if (bo.length === 0) return;
	await tx.onboardingWatch.deleteMany({
		where: { planId, userId: { in: bo } },
	});
}
```

- [ ] **Step 2: Gọi từ `datDong` khi mở lại** — sau `ghiVet(... keHoachMoLai ...)`:

```ts
			if (dong) return keHoachRa(sau);
			const camTrich = await traCamTrich(tx, sau, actingUserId);
			await traBuocKhongNhan(tx, sau, await buocChuaXong(tx, sau.id), actingUserId);
			await goTheoDoiKhongNhan(tx, sau.id);
			return keHoachRa(camTrich);
```

với `buocChuaXong(tx, planId)` = `tx.onboardingStep.findMany({ where: { planId, completedAt: null }, select: { id: true, label: true, assigneeId: true }, orderBy: { position: "asc" } })`.

- [ ] **Step 3: Gọi từ `setStepDone` khi bỏ xong** — sau hai nhánh ném lỗi, trước khi đọc lại bước:

```ts
			if (!input.done && ket.ket === "da-doi") {
				const plan = await tx.onboardingPlan.findUniqueOrThrow({
					where: { id: ket.buoc.planId },
					select: { id: true, companyId: true },
				});
				await traBuocKhongNhan(tx, plan, [ket.buoc], actingUserId);
			}
```

- [ ] **Step 4: Chạy, xác nhận xanh.**
  Run: `bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts"` → PASS.
  Run: `bun run test -- "cd apps/api && bun test test/vai-chi-okr-ke-hoach.spec.ts"` → PASS (DA0a không hồi quy).
  Run: `bun run check-types` và `bun run lint` → PASS.
- [ ] **Step 5: Commit** `fix(mo-lai-khong-tra-viec-chi-okr): mở lại và bỏ xong đi qua điều kiện nhận việc`.

### Task 3: Phép phá-thử (E8)

**Files:**
- Create: `_acceptance/mo-lai-khong-tra-viec-chi-okr/rang/dot-bien.mjs` (khuôn `va-lo-ro-vai-chi-okr/rang/dot-bien.mjs`,
  dùng `ban-sao.mjs` của `ca-chap-chon-cach-ly`)

- [ ] **Step 1: Sáu cặp**, mỗi cặp `[tên, lệnh, tệp, chuỗi vật, chuỗi thay, thông điệp ghim]`, tệp đều là `onboarding-ghi.ts`:
  (a) `const camTrich = await traCamTrich(tx, sau, actingUserId);` → `const camTrich = sau;` → E1
  `mlk: cam trich chua doi sang nguoi mo lai`; (b) xoá dòng `await traBuocKhongNhan(tx, sau, await buocChuaXong(...` →
  E1 `mlk: buoc mo con trong tay vai okr`; (c) xoá dòng `await goTheoDoiKhongNhan(tx, sau.id);` → E1
  `mlk: cam trich doc duoc ma vai okr con theo doi`; (d) `if (!input.done && ket.ket === "da-doi") {` →
  `if (false) {` → E5 `mlk: bo xong tra buoc ve vai okr`; (e) `nhanDuoc: n.members.some((m) => docDuocDoiTac(m.role)),`
  → `nhanDuoc: n.members.length > 0,` → E5 `mlk: bo xong tra buoc ve vai okr`; (f) tiền tố
  `if (camTrich.ownerId !== sau.ownerId) ` trước dòng gọi `traBuocKhongNhan` của `datDong` → E1
  `mlk: cam trich doc duoc ma buoc con trong tay vai okr`. `SO_CAP_KHAI = 6`, in `dot-bien: 6/6 cap dat`.
- [ ] **Step 2: Chạy** `node _acceptance/mo-lai-khong-tra-viec-chi-okr/rang/dot-bien.mjs` → in `dot-bien: 6/6 cap dat`,
  thoát 0; `git diff --quiet apps/api/src/onboarding/onboarding-ghi.ts` → 0.
- [ ] **Step 3: Commit** `test(mo-lai-khong-tra-viec-chi-okr): phép phá-thử sáu cặp`.

### Task 4: Tài liệu (E9)

**Files:**
- Modify: `docs/api.md` — gạch đầu dòng «Kế hoạch 30 ngày không giao việc cho người không đọc được dữ liệu đối tác»

- [ ] **Step 1:** Thêm câu: mở lại kế hoạch (`datDong`) và bỏ «xong» (`setStepDone`) đi qua cùng điều kiện nhận việc —
  bước chưa xong của người không nhận được việc thành chưa giao và lượt theo dõi kế hoạch của họ bị gỡ, bước đã xong
  giữ người làm; người cầm trịch không nhận được việc bị thay bằng người bấm mở lại; mỗi đổi người có vết; người bấm
  cũng không nhận được việc thì 400 và kế hoạch vẫn đóng.
- [ ] **Step 2:** `bun run lint:slop` → PASS. Commit `docs(api): mở lại đi qua điều kiện nhận việc`.

Cả bốn task `independent: false` — Task 2 cần bài kiểm của Task 1, Task 3 thay chuỗi của Task 2, Task 4 tả hành vi của
Task 2. Thực thi tuần tự trong phiên chính.
