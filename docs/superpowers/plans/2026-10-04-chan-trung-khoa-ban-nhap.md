# Chặn bản nháp OKR trùng khoá — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Schema `banNhap` từ chối bản nháp có hai Mục tiêu trùng `khoa` hay hai KR trùng `khoa` dưới cùng một Mục tiêu, ở biên công cụ `nop_ban_nhap`.

**Architecture:** `superRefine(chanKhoaTrung)` trên `banNhap` sinh một issue cho mỗi lần một khoá lặp lại, tại đúng ô. AI SDK (qua eve) kiểm `inputSchema` trước `execute` và trả `error-text` cho model. `nopBanNhap` không đổi.

**Tech Stack:** Zod 4, AI SDK 7 (`ai/test` `MockLanguageModelV4`), bun test, Prisma.

**Spec:** `docs/superpowers/specs/2026-10-04-chan-trung-khoa-ban-nhap-design.md` · hợp đồng `_acceptance/chan-trung-khoa-ban-nhap/contract.md` · evals `_acceptance/chan-trung-khoa-ban-nhap/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Thông điệp nằm trong hằng `BAN_NHAP_LOI` cạnh `BAN_NHAP_TRAN`, không viết chuỗi rời.
- Không sửa `nopBanNhap`, `chanTrungKhoa`, `docDaQuyet`; không sửa `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts` (PR #244 đang sửa).
- Bài tích hợp chạy qua `bun run test --` (CSDL riêng mỗi lượt).
- Bản sao của răng nằm ở `.acceptance-runs/chan-trung-khoa-ban-nhap/`, xoá trong `finally`; đường dẫn suy từ vị trí script.

## Review Focus

- Hai KR cùng khoá dưới hai Mục tiêu khác nhau phải được nhận (refine so trong từng Mục tiêu) — ca (e) Task 1.
- Khoá chỉ khác khoảng trắng đầu/cuối là trùng (so sau `trim`) — ca (b) Task 1.
- Khoá khác hoa/thường là khác (khớp `khoaModel`) — ca (g) Task 1.
- Nhiều chỗ trùng cùng lúc phải báo đủ, không dừng ở chỗ đầu — ca (d) Task 1.
- Bản nháp bị từ chối không ghi dòng nào vào `okrDeXuat` — đếm CSDL ở Task 2.

---

### Task 1: refine trong schema `banNhap` (phục vụ E1; independent: false)

**Files:**
- Modify: `packages/validation/src/okr-cuoc-soan.ts`
- Test: `packages/validation/test/okr-cuoc-soan.spec.ts`

**Interfaces:**
- Produces: `BAN_NHAP_LOI: { mucTieuTrungKhoa: "khoa Mục tiêu trùng"; krTrungKhoa: "khoa KR trùng trong cùng Mục tiêu" }`; `banNhap` (cùng tên, nay mang `.superRefine(chanKhoaTrung)` — chuỗi này là mốc của răng Task 3).

- [ ] **Step 1: Viết bài kiểm đỏ** — thêm `BAN_NHAP_LOI` vào import và khối cuối tệp:

```ts
describe("trung-khoa", () => {
	const loi = (v: unknown) => {
		const r = banNhap.safeParse(v);
		if (r.success) throw new Error("ban nhap trung khoa lot qua schema");
		return r.error.issues.map(({ path, message }) => ({ path, message }));
	};
	const MT = BAN_NHAP_LOI.mucTieuTrungKhoa;
	const KR = BAN_NHAP_LOI.krTrungKhoa;

	test("trung-khoa (a) hai Mục tiêu cùng khoá → một issue ở Mục tiêu lặp lại", () => {
		expect(loi({ mucTieu: [mucTieu(1), { ...mucTieu(2), khoa: "mt-1" }] })).toEqual([
			{ path: ["mucTieu", 1, "khoa"], message: `${MT}: mt-1` },
		]);
	});
	test("trung-khoa (b) khoá chỉ khác khoảng trắng đầu/cuối là trùng", () => {
		expect(loi({ mucTieu: [mucTieu(1), { ...mucTieu(2), khoa: " mt-1 " }] })).toEqual([
			{ path: ["mucTieu", 1, "khoa"], message: `${MT}: mt-1` },
		]);
	});
	test("trung-khoa (c) hai KR cùng khoá dưới một Mục tiêu → một issue ở KR lặp lại", () => {
		const m = { ...mucTieu(1), kr: [kr(10), { ...kr(11), khoa: "kr-10" }] };
		expect(loi({ mucTieu: [m, mucTieu(2)] })).toEqual([
			{ path: ["mucTieu", 0, "kr", 1, "khoa"], message: `${KR}: kr-10` },
		]);
	});
	test("trung-khoa (d) nhiều chỗ trùng cùng lúc → mỗi lần lặp một issue", () => {
		const m0 = { ...mucTieu(1), kr: [kr(10), { ...kr(11), khoa: "kr-10" }] };
		const ra = loi({
			mucTieu: [m0, { ...mucTieu(2), khoa: "mt-1" }, { ...mucTieu(3), khoa: "mt-1" }],
		});
		expect(ra).toHaveLength(3);
		expect(ra).toEqual(
			expect.arrayContaining([
				{ path: ["mucTieu", 1, "khoa"], message: `${MT}: mt-1` },
				{ path: ["mucTieu", 2, "khoa"], message: `${MT}: mt-1` },
				{ path: ["mucTieu", 0, "kr", 1, "khoa"], message: `${KR}: kr-10` },
			]),
		);
	});
	test("trung-khoa (e) KR cùng khoá dưới hai Mục tiêu khác nhau vẫn nhận", () => {
		const v = {
			mucTieu: [
				{ ...mucTieu(1), kr: [kr(1), kr(2)] },
				{ ...mucTieu(2), kr: [kr(1), kr(2)] },
			],
		};
		expect(banNhap.parse(v)).toEqual(v);
	});
	test("trung-khoa (f) KR mang khoá của một Mục tiêu vẫn nhận", () => {
		const v = { mucTieu: [{ ...mucTieu(1), kr: [{ ...kr(1), khoa: "mt-1" }, kr(2)] }, mucTieu(2)] };
		expect(banNhap.parse(v)).toEqual(v);
	});
	test("trung-khoa (g) khoá khác hoa/thường là hai khoá", () => {
		const v = { mucTieu: [mucTieu(1), { ...mucTieu(2), khoa: "MT-1" }] };
		expect(banNhap.parse(v)).toEqual(v);
	});
});
```

- [ ] **Step 2: Chạy đỏ** — `cd packages/validation && bun test test/okr-cuoc-soan.spec.ts -t trung-khoa`. Kỳ vọng: lỗi import `BAN_NHAP_LOI` (chưa có); sau khi thêm riêng hằng thì (a)–(d) fail «ban nhap trung khoa lot qua schema», (e)–(g) pass.

- [ ] **Step 3: Cài** — trong `okr-cuoc-soan.ts`:

```ts
export const BAN_NHAP_LOI = {
	mucTieuTrungKhoa: "khoa Mục tiêu trùng",
	krTrungKhoa: "khoa KR trùng trong cùng Mục tiêu",
} as const;

function lapLai(khoa: readonly string[]): { i: number; khoa: string }[] {
	return khoa.flatMap((k, i) => (khoa.indexOf(k) < i ? [{ i, khoa: k }] : []));
}

function chanKhoaTrung(
	b: { mucTieu: MucTieuNhap[] },
	ctx: z.RefinementCtx,
): void {
	for (const { i, khoa } of lapLai(b.mucTieu.map((m) => m.khoa)))
		ctx.addIssue({
			code: "custom",
			path: ["mucTieu", i, "khoa"],
			message: `${BAN_NHAP_LOI.mucTieuTrungKhoa}: ${khoa}`,
		});
	b.mucTieu.forEach((m, i) => {
		for (const { i: j, khoa } of lapLai(m.kr.map((k) => k.khoa)))
			ctx.addIssue({
				code: "custom",
				path: ["mucTieu", i, "kr", j, "khoa"],
				message: `${BAN_NHAP_LOI.krTrungKhoa}: ${khoa}`,
			});
	});
}

export const banNhap = z
	.object({
		mucTieu: z
			.array(mucTieuNhap)
			.min(BAN_NHAP_TRAN.mucTieu.min)
			.max(BAN_NHAP_TRAN.mucTieu.max),
	})
	.superRefine(chanKhoaTrung);
```

- [ ] **Step 4: Chạy xanh** — cùng lệnh: `7 pass, 0 fail`; rồi cả tệp `bun test test/okr-cuoc-soan.spec.ts` xanh.
- [ ] **Step 5: Commit** — `feat(validation): banNhap từ chối khoá Mục tiêu/KR trùng`.

### Task 2: bài tích hợp qua AI SDK + mô tả công cụ (phục vụ E2, E5; independent: false — cần Task 1 để xanh)

**Files:**
- Create: `apps/agent-okr/test/ban-nhap-trung-khoa.integration.spec.ts`
- Modify: `apps/agent-okr/agent/tools/nop_ban_nhap.ts` (một vế trong `description`)

**Interfaces:**
- Consumes: `banNhap`, `BAN_NHAP_LOI` (Task 1); `gieoCanhGoi`, `moXuong`, `donDep` (`test/support`); `capNhatPhien`; `khoaModel`; `dongSoanTuHang`.
- Produces: ba ca `cong-cu-dung-banNhap`, `trung-khoa-muc-tieu`, `trung-khoa-kr`; đúng MỘT dòng import từ `@crm/validation/okr-cuoc-soan` (mốc của răng Task 3); thông điệp expect `"execute chay o buoc mot"`.

- [ ] **Step 1: Viết bài kiểm** — cấu trúc:
  - `nguCanh(sessionId, userId, cuocSoanId)` như tệp `nop-ban-nhap.integration.spec.ts`; `beforeAll`: `moXuong`, `gieoCanhGoi({ vaiNguoiMo: "member" })`, `capNhatPhien(db, canh.cuocSoanId, PHIEN)`, tăng `soLuot` một lần; `afterAll(donDep)`.
  - `chayLuot(sai: BanNhap, dung: BanNhap)`: `MockLanguageModelV4` với `doGenerate` theo bước — bước 1 `tool-call` `nop_ban_nhap` với `sai`; bước 2 ghi lại `soLanSauBuoc1`, `soDongSauBuoc1` (count `okrDeXuat` theo `cuocSoanId`) và tool-result cuối của `vao.prompt`, rồi `tool-call` với `dung`; bước 3 `text`. `generateText({ model, prompt, stopWhen: stepCountIs(4), tools: { nop_ban_nhap: tool({ inputSchema: banNhap, execute: (input) => { soLan += 1; return congCu.execute(input, ctx); } }) } })`.
  - `issueCua(ketQua)`: lấy `output.value` khi `output.type === "error-text"`, cắt phần sau `"Error message: "`, `JSON.parse`, map `{ path, message }`.
  - Ca `trung-khoa-muc-tieu`: `sai` = hai Mục tiêu `m1`; `dung` = khoá thứ hai `m2`. Kỳ vọng theo thứ tự: `expect(soLanSauBuoc1, "execute chay o buoc mot").toBe(0)`; `soDongSauBuoc1` bằng số trước lượt; `issueCua` `toEqual([{ path: ["mucTieu", 1, "khoa"], message: "khoa Mục tiêu trùng: m1" }])`; `soLan` 1; kết quả `da-ghi`; các dòng `inputHash = lanNopMoiNhat` đọc qua `dongSoanTuHang`, `new Set(khoaModel)` có size bằng số dòng và chứa `muc-tieu-moi:m1`, `muc-tieu-moi:m2`.
  - Ca `trung-khoa-kr`: `sai` có hai KR `k1` dưới `m1`; `dung` đổi KR thứ hai thành `k2`; issue `{ path: ["mucTieu", 0, "kr", 1, "khoa"], message: "khoa KR trùng trong cùng Mục tiêu: k1" }`.
  - Ca `cong-cu-dung-banNhap`: `expect(congCu.inputSchema).toBe(banNhap)`.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/ban-nhap-trung-khoa.integration.spec.ts"` trên cây CHƯA có Task 1 (stash bản vá vào commit tạm hoặc chạy trước Task 1): hai ca `trung-khoa-*` đỏ với «execute chay o buoc mot».
- [ ] **Step 3: Mô tả công cụ** — nối sau câu «keeping the khoa of unchanged lines.»: ` Each khoa is unique among the Mục tiêu, and among the KR of one Mục tiêu; two Mục tiêu may each have a KR with the same khoa.`
- [ ] **Step 4: Chạy xanh** — cùng lệnh: `3 pass, 0 fail`.
- [ ] **Step 5: Commit** — `test(agent-okr): công cụ nop_ban_nhap từ chối bản nháp trùng khoá trước khi ghi`.

### Task 3: răng phá-thử `rang/pha-thu.mjs` (phục vụ E3, E4; independent: false)

**Files:**
- Create: `_acceptance/chan-trung-khoa-ban-nhap/rang/pha-thu.mjs`

**Interfaces:**
- Consumes: mốc `.superRefine(chanKhoaTrung)` (Task 1), import `"../src/okr-cuoc-soan"` (tệp kiểm đơn vị), import `"@crm/validation/okr-cuoc-soan"` (tệp tích hợp, Task 2).

- [ ] **Step 1: Viết răng** — `GOC` suy từ `import.meta.dirname`; đối số `xanh|do`. Với mỗi chế độ:
  1. Thư mục `.acceptance-runs/chan-trung-khoa-ban-nhap/sao-<che-do>-<pid>/`; chép `okr-cuoc-soan.ts` vào `sao/okr-cuoc-soan.ts`, đổi `from "./okr-kr"` thành đường tuyệt đối tới `packages/validation/src/okr-kr.ts` (mốc phải có đúng một lần). Chế độ `do`: gỡ `.superRefine(chanKhoaTrung)` (đúng một lần) — không thì «KHONG DO DUOC».
  2. Tệp đơn vị: chép `packages/validation/test/okr-cuoc-soan.spec.ts` vào `sao/don-vi/`, đổi `from "../src/okr-cuoc-soan"` → bản sao (đúng một lần); symlink `sao/don-vi/node_modules` → `packages/validation/node_modules`; chạy `bun test ./okr-cuoc-soan.spec.ts -t trung-khoa` (cwd thư mục đó).
  3. Tệp tích hợp: chép vào `sao/tich-hop/`, đổi `from "@crm/validation/okr-cuoc-soan"` → bản sao, `from "../agent/` và `from "./support/` → đường tuyệt đối (như răng `dao-thu-tu.mjs` của PR #244); symlink `node_modules` → `apps/agent-okr/node_modules`; chạy `bun run test -- "cd <dir> && CRM_TELEMETRY_DISABLED=1 bun test ./x.spec.ts -t trung-khoa"` từ `GOC`.
  4. Đọc dòng `(pass)`/`(fail)` của bun. `xanh`: đơn vị 7 pass 0 fail, tích hợp 2 pass 0 fail → mã 0. `do`: đơn vị đúng bốn `(fail)` (a)–(d) và đúng ba `(pass)` (e)–(g); tích hợp đúng hai `(fail)`, 0 pass, và ra chứa `execute chay o buoc mot` → mã 0. Lệch → mã 1 kèm 1200 ký tự cuối. Mốc vắng → mã 2.
  5. `finally`: xoá thư mục bản sao.
- [ ] **Step 2: Chạy hai chiều** — `node _acceptance/chan-trung-khoa-ban-nhap/rang/pha-thu.mjs xanh` → 0; `... do` → 0. Phá-thử của chính răng: tạm đổi tên ca (e) trong bản sao không phải việc của răng — thay vào đó kiểm chế độ `do` thoát 1 nếu tạm bỏ dòng gỡ refine (chạy tay một lần, ghi kết quả vào sổ).
- [ ] **Step 3: Commit** — `test(acceptance): răng phá-thử chan-trung-khoa-ban-nhap`.

### Cuối S3

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh; đặt contract `status: implemented`.
