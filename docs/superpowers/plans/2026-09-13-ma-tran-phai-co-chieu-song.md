# Ma trận phải có chiều sống — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi lời tuyên «đã quét hai biến thể» của phép đo quyền thành một bất biến đo được, và dựng chiều đỏ cắm vào đúng chỗ hai sàn AST của hồ sơ trước đều mù.

**Architecture:** Không đổi mã sản phẩm. Sửa một tệp đo (`apps/agent/test/quyen-luot.spec.ts`) và dựng ba răng mới trong `_acceptance/ma-tran-phai-co-chieu-song/rang/`. Ba răng dùng lại khung cây sao của hồ sơ trước (`_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs` và `ast.mjs`) thay vì chép lại ~350 dòng — coupling này có chủ ý và được E5 canh: E5 chạy lại chín lệnh của hai hồ sơ cũ, nên khung gãy thì vòng này đỏ.

**Tech Stack:** Bun test · TypeScript compiler API (đọc AST) · git worktree (cây sao) · Node ESM scripts.

**Spec:** `docs/superpowers/specs/2026-09-12-ma-tran-phai-co-chieu-song-design.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa.
- **Cấm tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật** — giữ nguyên `diff`, `sha`, `AST`, `worktree`.
- **Ba mã thoát cho mọi răng:** `0` xanh · `2` bất biến bị vi phạm · `3` giàn đo hỏng. Dùng `hong()` cho mã 2 và `hongGian()` cho mã 3 từ `chung.mjs`.
- **Mọi phép đo mới phải có cặp hai chiều trên cùng fixture kèm thông điệp ghim** — vật lành thì xanh, phá vật thật trong bản sao thì đỏ với thông điệp gọi tên bất biến.
- **Đường dẫn trong răng suy từ vị trí script**, không ghim cứng gốc kho.
- **Không sửa `apps/api`, `apps/app`, hay bất kỳ hồ sơ nghiệm thu đã ký nào.** Răng của AC-6 **đọc** `apps/api/src` — đọc không phải sửa.
- Verify của kho là năm lệnh từ gốc: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `apps/agent/test/quyen-luot.spec.ts` (sửa) | Khối `describe("bat-bien")` mới cho AC-1; khối `describe("suy-dien")` giữ tên, bỏ hình dạng ghim-số-lượng-rồi-lặp |
| `_acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs` (tạo) | AC-4 — sàn AST chặn hình dạng cũ mọc lại, ba vectơ |
| `_acceptance/ma-tran-phai-co-chieu-song/rang/dot-bien-hai-tep.mjs` (tạo) | AC-3 — vectơ đột biến hai tệp, bốn điều |
| `_acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs` (tạo) | AC-6 — sàn dân số neo tập biến thể vào writer thật |
| `_acceptance/ma-tran-phai-co-chieu-song/rang/ho-so-cu-con-chay.sh` (tạo) | AC-5 — chạy lại chín lệnh của hai hồ sơ đã ký |

---

### Task 1: Đổi bài đo — bất biến thay cho vòng lặp giả vờ quét

**Files:**
- Modify: `apps/agent/test/quyen-luot.spec.ts:80-125`

**Interfaces:**
- Consumes: `builderSessionAuthFromRow(row, conversationId)` và `hangSubmission(commandType, inputResponse)` đã có sẵn trong tệp.
- Produces: khối `describe("bat-bien")` với hai bài; khối `describe("suy-dien")` giữ đúng tên, hai bài, mỗi bài mang một phép so chéo hai lượt. Hằng `KHOA_DA_GHIM` dùng bởi bài thứ hai của `bat-bien`.

- [ ] **Step 1: Viết bài đo mới cho bất biến, chạy để thấy nó ĐỎ trước khi có gì đỡ**

Thêm ngay sau hằng `BIEN_THE`:

```ts
const KHOA_DA_GHIM = [
	"commandType",
	"conversationId",
	"needsTitle",
	"purpose",
	"submissionId",
	"userId",
];

const khoiThuocTinh = (commandType: string, inputResponse: Record<string, string>) =>
	builderSessionAuthFromRow(hangSubmission(commandType, inputResponse), "conv_1")
		.attributes;

describe("bat-bien", () => {
	it("bat-bien: doi inputResponse thi khoi thuoc tinh khong doi mot byte", () => {
		const [mot, hai] = BIEN_THE.map((ir) => khoiThuocTinh("CHAT", ir));
		expect(mot).toEqual(hai);
	});

	it("bat-bien: tap khoa cua khoi thuoc tinh bang dung tap da ghim", () => {
		expect(Object.keys(khoiThuocTinh("CHAT", BIEN_THE[0])).sort()).toEqual(
			KHOA_DA_GHIM,
		);
	});
});
```

- [ ] **Step 2: Chạy để xác nhận bài mới XANH trên mã lành**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t bat-bien`
Expected: PASS, 2 bài.

Xanh ở đây chưa chứng minh gì — Task 3 mới là chỗ chứng minh nó đỏ được.

- [ ] **Step 3: Bỏ hình dạng ghim-số-lượng-rồi-lặp khỏi khối `suy-dien`**

Thay hai bài của `describe("suy-dien")` bằng:

```ts
describe("suy-dien", () => {
	it("suy-dien: hang khai CHAT thi cong dong, du tin nhan dung khuon xin dung tac nhan", () => {
		const luot = BIEN_THE.map((ir) => chamCong("CHAT", ir));
		expect(luot[0].cham).toEqual(luot[1].cham);
		for (const { ctx, cham } of luot) {
			expect(cham).toEqual({ type: "denied", reason: BUILDER_DENIED_REASON });
			expect(() => requireBuilderAttribute(ctx, "conversationId")).toThrow();
		}
	});

	it("suy-dien: doi DUNG MOT truong commandType cua hang thi cong mo", () => {
		const luot = BIEN_THE.map((ir) => chamCong("CREATE_AGENT", ir));
		expect(luot[0].cham).toEqual(luot[1].cham);
		for (const { ctx, cham } of luot) {
			expect(cham).toBe("not-applicable");
			expect(requireBuilderAttribute(ctx, "conversationId")).toBe("conv_1");
		}
	});
});
```

`expect(BIEN_THE).toHaveLength(2)` biến mất khỏi cả hai bài; chỗ của nó là phép so chéo `luot[0]` với `luot[1]` — thứ thật sự nói lên điều bài đo tuyên.

- [ ] **Step 4: Chạy cả tệp, và chạy lại phép đo của hồ sơ cũ soi chính tệp này**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts`
Expected: PASS, mọi khối.

Run: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs`
Expected: exit 0 — khối `describe("suy-dien")` vẫn còn đúng tên.

Run: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`
Expected: exit 0 — 23 dòng khai vẫn đúng mã; hai vectơ của nó dùng bài trong khối `suy-dien`.

- [ ] **Step 5: Commit**

```bash
git add apps/agent/test/quyen-luot.spec.ts
git commit -m "test(quyen-luot): bat bien thay cho vong lap gia vo quet"
```

---

### Task 2: Răng AC-4 — hình dạng cũ không mọc lại, ba cách viết

**Files:**
- Create: `_acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs`

**Interfaces:**
- Consumes: `chay`, `chayRang`, `coCo`, `GOC`, `hong`, `hongGian`, `RANG`, `voiCaySao` từ `../../do-quyen-luot-bang-hanh-vi/rang/chung.mjs`; `duyet`, `nap`, `quetTs`, `ts`, `viTri` từ `../../do-quyen-luot-bang-hanh-vi/rang/ast.mjs`.
- Produces: script nhận `--goc <đường dẫn>` (chấm một cây bất kỳ) và `--vecto <tên>` (chạy một chiều đỏ). Ba tên vectơ: `cay-lai-for-of`, `cay-lai-foreach`, `cay-lai-it-each`.

- [ ] **Step 1: Viết sàn — bắt QUAN HỆ, không bắt một cách viết**

Điều 1: trong khối `describe("suy-dien")`, tìm mọi lời gọi `expect(X).toHaveLength(n)` mà trong **cùng một bài** có một phép duyệt trên chính `X` — nhận cả ba dạng: `for (… of X)`, `X.forEach(…)`, `it.each(X)`/`describe.each(X)` — và thân phép duyệt ấy **không** chứa một `toEqual`/`toStrictEqual` nào so hai giá trị lấy từ hai lượt khác nhau. Vi phạm → `hong()` với thông điệp ghim `hinh dang ghim so luong ma khong ghim khac biet` kèm `file:dòng`.

Điều 2: khối `describe("suy-dien")` phải còn tồn tại với đúng tên và có ít nhất một bài bên trong; mất → `hong()` cùng thông điệp ghim.

Sàn dân số: không tìm thấy khối `describe("suy-dien")` nào trong tệp → `hongGian()`.

- [ ] **Step 2: Viết ba vectơ, mỗi vectơ cấy lại hình dạng cũ bằng một cách viết**

`cay-lai-for-of` cấy vào bản sao:

```ts
	it("suy-dien: hinh dang cu for-of", () => {
		expect(BIEN_THE).toHaveLength(2);
		for (const ir of BIEN_THE) {
			expect(chamCong("CHAT", ir).cham).toEqual({
				type: "denied",
				reason: BUILDER_DENIED_REASON,
			});
		}
	});
```

`cay-lai-foreach` cấy cùng nội dung nhưng thân là `BIEN_THE.forEach((ir) => { … })`.

`cay-lai-it-each` cấy `expect(BIEN_THE).toHaveLength(2);` ngay trước `it.each(BIEN_THE)("suy-dien: hinh dang cu it-each %o", (ir) => { … })`.

- [ ] **Step 3: Chạy sàn trên cây lành**

Run: `node _acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs`
Expected: exit 0.

- [ ] **Step 4: Chạy cả ba vectơ, cả ba phải mã 2**

Run: `node _acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs --vecto cay-lai-for-of`
Expected: exit 2, output chứa `hinh dang ghim so luong ma khong ghim khac biet` và một `apps/agent/test/quyen-luot.spec.ts:<dòng>`.

Lặp lại với `--vecto cay-lai-foreach` và `--vecto cay-lai-it-each`. Vectơ nào ra 0 → sàn chỉ bắt một cách viết, quay lại Step 1.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs
git commit -m "rang(ma-tran): san chan hinh dang cu, bat ca ba cach viet"
```

---

### Task 3: Răng AC-3 — vectơ đột biến hai tệp, bốn điều

**Files:**
- Create: `_acceptance/ma-tran-phai-co-chieu-song/rang/dot-bien-hai-tep.mjs`

**Interfaces:**
- Consumes: cùng bộ import của Task 2, thêm `readFileSync`/`writeFileSync`.
- Produces: script nhận `--vecto khoa-moi-o-cong`. In ra đường tuyệt đối của bản sao và của hai sàn đã chạy.

- [ ] **Step 1: Viết đối chứng đường — bản sao chưa đột biến phải XANH**

Dựng cây sao bằng `voiCaySao`. Chạy `cd <sao>/apps/agent && bun test test/quyen-luot.spec.ts -t bat-bien` và `-t suy-dien`; cả hai khác 0 → `hongGian("doi chung duong hong: cay sao chua dot bien da do")`.

- [ ] **Step 2: Cắm đột biến hai tệp**

Tệp 1 — `apps/agent/agent/lib/custom-agent-dispatch.ts`: thêm khoá mới vào kiểu và vào hàm dựng thuộc tính, rồi truyền giá trị suy từ có mặt `optionId`:

```ts
	coOptionId: string;
```

trong `BuilderSessionAttributes`, và trong thân `builderSessionAttributes`:

```ts
		coOptionId: input.coOptionId,
```

thêm `coOptionId: string;` vào khối tham số, và tại `builderSessionAuthFromRow`:

```ts
			coOptionId: String(
				Boolean(
					(row.message as { inputResponse?: { optionId?: string } })
						?.inputResponse?.optionId,
				),
			),
```

Tệp 2 — `apps/agent/agent/lib/session-purpose.ts`, trong `builderTurnAuthorized`:

```ts
	return (
		purposeOf(ctx) === "builder" &&
		(attribute(ctx, "commandType") === "CREATE_AGENT" ||
			attribute(ctx, "coOptionId") === "true")
	);
```

Không tìm thấy mốc ở một trong hai tệp → `hongGian()` in tên tệp.

- [ ] **Step 3: Đòi ba điều đầu**

Điều 1: `-t bat-bien` phải khác 0 — hai khối thuộc tính thôi bằng nhau.
Điều 2: `-t suy-dien` phải khác 0 — biến thể mang `optionId` mở được cổng.
Điều 3: chạy `node <RANG hồ sơ trước>/khong-cam-tin-nhan.mjs --goc <sao>` và `node <RANG hồ sơ trước>/nguon-ghi.mjs --goc <sao>`; **cả hai phải thoát 0**. Đường tới hai sàn suy từ `RANG` của `chung.mjs`, không ghim cứng. In ra đường tuyệt đối đã chạy và gốc bản sao.

Thiếu điều nào → `hong()` với thông điệp ghim `dot bien hai tep khong do dung cho` kèm tên điều trượt.

- [ ] **Step 4: Đòi điều 4 — đối chứng dương cho điều 3**

Trên chính bản sao ấy, cắm thêm hình dạng cũ vào chỗ gọi `builderSessionAttributes`:

```ts
			commandType: JSON.stringify(row.message).includes("agent")
				? "CREATE_AGENT"
				: row.commandType,
```

rồi chạy lại hai sàn: **cả hai phải thoát khác 0**. Vẫn thoát 0 → `hongGian("hai san doc nham cay: doi chung duong cua dieu 3 khong do")`.

- [ ] **Step 5: Chạy vectơ, xác nhận mã 2**

Run: `node _acceptance/ma-tran-phai-co-chieu-song/rang/dot-bien-hai-tep.mjs --vecto khoa-moi-o-cong`
Expected: exit 0 khi CẢ bốn điều đúng (đây là răng chạy một lượt trọn vẹn, không phải sàn chấm cây lành).

Run: `node _acceptance/ma-tran-phai-co-chieu-song/rang/dot-bien-hai-tep.mjs`
Expected: exit 0 — chế độ trần chạy đúng vectơ duy nhất ấy.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/ma-tran-phai-co-chieu-song/rang/dot-bien-hai-tep.mjs
git commit -m "rang(ma-tran): vecto dot bien hai tep, kem doi chung duong cho assert am tinh"
```

---

### Task 4: Răng AC-6 — neo tập biến thể vào writer thật

**Files:**
- Create: `_acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs`

**Interfaces:**
- Consumes: cùng bộ import của Task 2.
- Produces: script nhận `--goc` và `--vecto them-nhanh-thu-ba`.

- [ ] **Step 1: Viết sàn dân số**

Đọc `apps/api/src/conversations/conversations.service.ts` bằng AST, tìm `VariableDeclaration` tên `inputResponse` có initializer là `ConditionalExpression`, đếm số nhánh (đếm đệ quy: mỗi `ConditionalExpression` lồng thêm một nhánh). Không tìm thấy → `hongGian("khong tim thay bieu thuc sinh inputResponse")`.

Đọc `apps/agent/test/quyen-luot.spec.ts` bằng AST, tìm `VariableDeclaration` tên `BIEN_THE` có initializer là `ArrayLiteralExpression`, đếm số phần tử. Không tìm thấy → `hongGian()`.

Hai con số phải bằng nhau và bằng hằng `SO_DA_GHIM = 2` trong chính răng. Lệch → `hong()` với thông điệp ghim `so nhanh sinh inputResponse lech so hang bai do dung` kèm cả hai con số và `file:dòng`.

- [ ] **Step 2: Chạy trên cây lành**

Run: `node _acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs`
Expected: exit 0, in `2` và `2`.

- [ ] **Step 3: Viết vectơ — cấy nhánh thứ ba vào bản sao**

Trong bản sao, đổi biểu thức ở `conversations.service.ts` thành ba nhánh:

```ts
		const inputResponse = input.optionId
			? { requestId: input.requestId, optionId: input.optionId }
			: input.text
				? { requestId: input.requestId, text: input.text }
				: { requestId: input.requestId };
```

- [ ] **Step 4: Chạy vectơ, xác nhận mã 2**

Run: `node _acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs --vecto them-nhanh-thu-ba`
Expected: exit 2, output chứa `so nhanh sinh inputResponse lech so hang bai do dung`, `3` và `2`.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs
git commit -m "rang(ma-tran): neo tap bien the vao noi may chu sinh ra chung"
```

---

### Task 5: Script AC-5 — chín lệnh của hai hồ sơ đã ký

**Files:**
- Create: `_acceptance/ma-tran-phai-co-chieu-song/rang/ho-so-cu-con-chay.sh`

**Interfaces:**
- Consumes: `_acceptance/config.yaml` (chỉ để tra lệnh khi viết; script ghim lệnh nguyên văn).
- Produces: script bash chạy chín lệnh, in tên lệnh trước mỗi lượt, thoát bằng mã của lệnh đầu tiên khác 0.

- [ ] **Step 1: Viết script**

Gốc kho suy từ vị trí script: `GOC="$(cd "$(dirname "$0")/../../.." && pwd)"`. Chín lệnh, mỗi lệnh chạy từ `$GOC`:

```
dq_cong_quyen          cd apps/agent && bun test test/quyen-luot.spec.ts
dq_khong_cam_tin_nhan  node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs
dq_nguon_ghi           node _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs
dq_bo_do_grep          node _acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs
dq_khai_sinh           node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs
dq_ho_so_cu_con_chay   bash _acceptance/do-quyen-luot-bang-hanh-vi/rang/ho-so-cu-con-chay.sh
ql_quyen_ke_thua       cd apps/agent && bun test test/quyen-luot.spec.ts -t ke-thua
ql_khong_suy_dien      cd apps/agent && bun test test/quyen-luot.spec.ts -t suy-dien
ql_api_doc_ban_ghi     cd apps/api && bun test test/quyen-luot.spec.ts
```

Bắt mã thoát **trực tiếp**, không qua `if ! …; then ma=$?` — trong nhánh phủ định `$?` là mã của phép phủ định, không phải của lệnh (lỗi đã đo ở hồ sơ trước).

- [ ] **Step 2: Chạy, cả chín phải thoát 0**

Run: `bash _acceptance/ma-tran-phai-co-chieu-song/rang/ho-so-cu-con-chay.sh`
Expected: exit 0, in đủ chín tên lệnh.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/ma-tran-phai-co-chieu-song/rang/ho-so-cu-con-chay.sh
git commit -m "rang(ma-tran): chay lai chin lenh cua hai ho so da ky"
```

---

### Task 6: Năm cổng kho, rồi giao S4

**Files:** không tệp mới.

- [ ] **Step 1: Chạy năm lệnh chứng của kho từ gốc**

Run: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`
Expected: cả năm exit 0.

- [ ] **Step 2: Trả `_acceptance/chan-lai-component-ra-man/evidence/ve-that.json` về nguyên trạng nếu `bun run test` làm bẩn nó**

Run: `git checkout -- _acceptance/chan-lai-component-ra-man/evidence/ve-that.json`

Tệp bằng chứng của một vòng đã ký mang nhãn ngày hệ thống nên tự đổi mỗi lượt chạy test; đây là lỗ đã có chip riêng, không phải việc của vòng này.

- [ ] **Step 3: Đặt hợp đồng sang `implemented` và giao S4**

Sửa frontmatter `_acceptance/ma-tran-phai-co-chieu-song/contract.md` thành `status: implemented`, commit, rồi dispatch S4 bằng `s4-args.mjs` + workflow `acceptance-verify.js`.

## Thứ tự và tính độc lập

Task 1 phải xong trước — bốn task còn lại đo chính hình dạng nó dựng.

Task 2, 3, 4, 5 **không** chạy song song (`independent: false`), dù chúng không đọc lẫn nhau: cả bốn đều dựng cây sao trên cùng một `git-common-dir`, và đó đúng là đường đua đã đốt ba vòng chấm của hồ sơ trước (`git stash create` ghi vào chỉ mục dùng chung · khoá không có chủ). Khung nay đã vá cả hai, nhưng vòng này không có lý do gì để cược lại vào đúng chỗ ấy để tiết kiệm vài phút.
