# Khung Kara trong ngăn bản ghi — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ngăn cá nhân, công ty, thoả thuận gặp cùng một Kara như OKR — tab Kara tiếng Việt với trạng thái và «Thử lại», đề xuất thông tin liên hệ neo tại chỗ có biên nhận và Hoàn tác (lệnh hoàn tác mới ở API), khung tải lỗi có «Thử lại», nút tra cứu mang dấu Kara, ngăn thêm nhanh hỏi lại khi lỡ đóng.

**Architecture:** Lớp trình bày của tab Kara đổi sang các khối Kara có sẵn trong `packages/ui/src/components/kara/`, cơ chế hội thoại (`useEveAgent`, snapshot, `MessageScroller`) giữ nguyên. Hoàn tác là một thủ tục tRPC mới `contacts.undoFactDecision` trong `contacts.service.ts`; màn gửi giá trị trước khi nhận. Biên nhận sống trong trạng thái của `ContactOverview` tới khi ngăn đóng. Mọi chữ mới đi qua tệp chữ `apps/app/lib/messages/kara-ban-ghi.ts`.

**Tech Stack:** Next 16 App Router (client components), React 19, tRPC qua nestjs-trpc, Prisma/Postgres, bun test (jsdom qua `packages/ui/test/setup-dom.ts`), puppeteer-core cho phép đo màn.

**Spec:** `docs/superpowers/specs/2026-10-07-khung-ban-ghi-kara-design.md` · hợp đồng `_acceptance/khung-ban-ghi-kara/contract.md` · evals `_acceptance/khung-ban-ghi-kara/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `packages/ui` là nguồn duy nhất của giao diện; không `className` đổi màu/góc/khoảng cách của component `@crm/ui` (docs/design.md).
- Mọi chữ hiển thị qua `lib/messages`; tệp chữ dùng chung chỉ THÊM dòng (luật 7 của đợt) — `record-sheet.ts` thuộc ranh giới K4 nên được sửa dòng `tabs.agent`.
- Dữ liệu người nhập mang `translate="no"`.
- Không `Spinner` trần, không `MagicWand`, không logo OneHub trong bề mặt Kara (ai-ux §2, §7).
- `apps/api/src/generated/server.ts` chỉ sinh bằng `cd apps/api && bun run trpc:generate`, rồi commit.
- Chỉ sửa tệp trong ranh giới K4 cộng các tệp giám sát đã duyệt (P2-2, P2-3, P2-4, P2-5); `deal-sheet.tsx` chỉ thêm dòng.
- Không tạo worktree phụ (luật đợt) — mọi task chạy tuần tự trong worktree của phiên, `independent: false`.
- Năm lệnh chứng minh ở gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

1. Hoàn tác khi trường trống trước lần nhận → cột về `null`, không về chuỗi rỗng (Task 1 ghim ca githubUrl).
2. Hoàn tác bấm hai lần liên tiếp (mạng chậm) → lần hai bị từ chối CONFLICT, không phá dữ liệu (Task 1 thêm ca «hoàn tác lại»; Task 4 khoá nút khi đang gửi).
3. Đề xuất nhận xong rồi Kara ghi một đề xuất mới cho cùng trường trước khi người bấm Hoàn tác → biên nhận vẫn trỏ fact cũ, hoàn tác đúng fact cũ (Task 4 khoá biên nhận theo `factId`, không theo trường).
4. Tác nhân không với tới ngay lúc mở tab (offline) → đọc lưu trữ, ô soạn vẫn gõ được, không trạng thái lỗi (Task 3 giữ nhánh `offlineThread`, ca DOM «offline vẫn gõ»).
5. Biểu mẫu thêm nhanh chỉ có ô chọn (gắn người vào thoả thuận) — đổi lựa chọn cũng phải tính là «có chữ» (Task 7 khai theo state của biểu mẫu, không theo `input.value`).

---

### Task 1: Lệnh hoàn tác ở API

**Phục vụ:** E9, E10 (phần API), E11 · AC-7, AC-8, AC-9 · `independent: false`

**Files:**
- Modify: `apps/api/src/contacts/contacts.contracts.ts` (thêm `undoFactDecisionInput`, `undoFactDecisionOutput`)
- Modify: `apps/api/src/contacts/contacts.service.ts` (`decideFact` dùng một mốc `at`; thêm `undoFactDecision`)
- Modify: `apps/api/src/contacts/contacts.router.ts` (thủ tục `undoFactDecision`)
- Regenerate: `apps/api/src/generated/server.ts`
- Create: `apps/api/test/hoan-tac-thong-tin.spec.ts`
- Modify: `_acceptance/config.yaml` (chỉ thêm `kbk_api_nhan`, `kbk_api_bo_qua`, `kbk_api_chan`)

**Interfaces:**
- Produces: `undoFactDecisionInput = z.object({ factId: z.string(), truoc: z.union([z.object({ value: z.string().nullable() }), z.object({ firstName: z.string(), lastName: z.string().nullable() })]) })`; `export type UndoFactDecisionInput`; output `{ contactId: string; field: string }`; tRPC `contacts.undoFactDecision` (mutation, REST `POST /contacts/undo-fact-decision`).

- [ ] **Step 1: Viết bài kiểm đỏ** `apps/api/test/hoan-tac-thong-tin.spec.ts` dùng `dungSan()`, `goi()`, `phien` của `./okr-san` (khởi `AppModule` thật, hai thành viên `quan` và `thuong`). Gieo một công ty + một contact (title «Trưởng phòng», githubUrl null, firstName «Hà», lastName «Nguyễn») và các `contactFact` PROPOSED (band VERIFIED, score 0.9, evidence `[{ detail: "LinkedIn" }]`, method `"thu"`). Ca:
  - `nhan`: ma trận viết trước 3 trường (`title` → «Giám đốc kinh doanh», `githubUrl` → «https://github.com/ha», `name` → «Thu Hà Nguyễn»), `expect(ca.length).toBe(3)`; mỗi ca: `goi("contacts.decideFact", {factId, decision:"accept"}, "quan")` → đọc lại cột = giá trị fact; `goi("contacts.undoFactDecision", {factId, truoc}, "quan")` với `truoc` đúng giá trị cũ → cột về giá trị cũ (title cũ; githubUrl `null`; firstName/lastName cũ), fact `PROPOSED`, `decidedById` và `decidedAt` null; gọi hoàn tác lần hai → status 409.
  - `bo-qua`: dismiss → fact DISMISSED, cột không đổi (so mọi cột của `FACT_COLUMNS` + firstName/lastName); hoàn tác → PROPOSED, cột vẫn không đổi.
  - `chan`: ma trận viết trước 3 ca `[["truong-da-doi",409],["nguoi-khac",403],["chua-quyet",409]]`, `expect(ca.length).toBe(3)`; mỗi ca chụp `contact` + mọi `contactFact` của contact trước/sau, `expect(sau).toEqual(truoc)`.
  - `chan` ca phục hồi: fact W `SUPERSEDED` ở mốc t0 (gieo trực tiếp), X `APPLIED` (cột = X), Y `PROPOSED`; nhận Z → X, Y SUPERSEDED cùng `supersededAt` = `decidedAt` của Z; hoàn tác với `truoc = {value: X}` → X APPLIED, Y PROPOSED, cả hai `supersededAt` null, cột = X; W vẫn SUPERSEDED với `supersededAt` = t0.
  - Thông điệp ghim cho chiều đỏ: `"nhan: title khong ve gia tri cu"`, `"bo-qua: cot doi"`, `"chan: nguoi khac hoan tac duoc"`, `"chan: phuc hoi fact cua lan nhan khac"` — dùng `if (...) throw new Error("<thông điệp>")` trước `expect` tương ứng.
  - `afterAll`: xoá contact, company, fact theo tiền tố `TIEN_TO`.

- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts"` → FAIL (thủ tục `contacts.undoFactDecision` 404).

- [ ] **Step 3: Contracts**

```ts
export const undoFactDecisionInput = z.object({
	factId: z.string(),
	truoc: z.union([
		z.object({ value: z.string().nullable() }),
		z.object({ firstName: z.string(), lastName: z.string().nullable() }),
	]),
});

export type UndoFactDecisionInput = z.infer<typeof undoFactDecisionInput>;

export const undoFactDecisionOutput = z.object({
	contactId: z.string(),
	field: z.string(),
});
```

- [ ] **Step 4: Service** — trong `decideFact` thay hai `new Date()` bằng một `const at = new Date()` dùng cho `supersededAt` và `decidedAt`. Thêm:

```ts
async undoFactDecision(input: UndoFactDecisionInput, userId: string) {
	const fact = await this.db.contactFact.findUnique({
		where: { id: input.factId },
		select: { id: true, contactId: true, field: true, value: true, status: true, decidedById: true, decidedAt: true },
	});
	if (!fact) throw new NotFoundException(`No fact with id ${input.factId}.`);
	if (fact.status !== FactStatus.APPLIED && fact.status !== FactStatus.DISMISSED)
		throw new ConflictException("That suggestion has not been decided.");
	if (fact.decidedById !== userId)
		throw new ForbiddenException("Only the person who decided can undo it.");

	const column = FACT_COLUMNS[fact.field];
	const laTen = fact.field === "name";

	await this.db.$transaction(async (tx) => {
		if (fact.status === FactStatus.APPLIED) {
			const contact = await tx.contact.findUniqueOrThrow({
				where: { id: fact.contactId },
				select: { firstName: true, lastName: true, title: true, seniority: true, function: true, linkedinUrl: true, twitterUrl: true, githubUrl: true },
			});
			const hienTai = laTen
				? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
				: column ? contact[column] : null;
			if (hienTai !== fact.value)
				throw new ConflictException("The field changed after the suggestion was accepted.");
			const giaTriCu = "value" in input.truoc ? input.truoc.value : [input.truoc.firstName, input.truoc.lastName].filter(Boolean).join(" ");
			if (laTen && "firstName" in input.truoc)
				await tx.contact.update({ where: { id: fact.contactId }, data: { firstName: input.truoc.firstName, lastName: input.truoc.lastName } });
			else if (column)
				await tx.contact.update({ where: { id: fact.contactId }, data: { [column]: giaTriCu } });
			const biThay = await tx.contactFact.findMany({
				where: { contactId: fact.contactId, field: fact.field, status: FactStatus.SUPERSEDED, supersededAt: fact.decidedAt },
				select: { id: true, value: true },
			});
			for (const f of biThay)
				await tx.contactFact.update({
					where: { id: f.id },
					data: { status: f.value === giaTriCu ? FactStatus.APPLIED : FactStatus.PROPOSED, supersededAt: null },
				});
		}
		await tx.contactFact.update({
			where: { id: fact.id },
			data: { status: FactStatus.PROPOSED, decidedById: null, decidedAt: null },
		});
	});

	this.logger.log({ message: "Fact decision undone", factId: fact.id, contactId: fact.contactId, field: fact.field });
	return { contactId: fact.contactId, field: fact.field };
}
```

  (`ForbiddenException` nhập từ `@nestjs/common` cùng chỗ với `ConflictException`. Trường `name` bắt buộc `truoc` dạng tên; dạng `value` cho `name` → `BadRequestException`.)

- [ ] **Step 5: Router**

```ts
@Mutation({
	input: undoFactDecisionInput,
	output: undoFactDecisionOutput,
	meta: restMeta("POST", "/contacts/undo-fact-decision", ["Contacts"]),
})
async undoFactDecision(
	@Ctx() ctx: AuthedTrpcContext,
	@Input() input: z.infer<typeof undoFactDecisionInput>,
) {
	return this.contacts.undoFactDecision(input, ctx.user.id);
}
```

- [ ] **Step 6: Sinh router** — `cd apps/api && bun run trpc:generate`; kiểm `git diff --stat apps/api/src/generated/server.ts` chỉ thêm thủ tục mới.
- [ ] **Step 7: Chạy, thấy xanh** — lệnh ở Step 2 → PASS; chạy thêm `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"` (vai `okr` phải bị từ chối thủ tục mới) → PASS.
- [ ] **Step 8: Phá-thử** trong bản sao (`.sao-kbk/` ngoài gói, theo trí nhớ «bản sao đột biến ở thư mục ẩn») cho từng thông điệp ghim; xác nhận đỏ đúng thông điệp; xoá bản sao.
- [ ] **Step 9: Khai lệnh** — thêm vào `executors.test` của `_acceptance/config.yaml`:

```yaml
    kbk_api_nhan: 'bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts -t nhan"'
    kbk_api_bo_qua: 'bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts -t bo-qua" && cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi-de-xuat.dom.tsx -t bo-qua'
    kbk_api_chan: 'bun run test -- "cd apps/api && bun test test/hoan-tac-thong-tin.spec.ts -t chan"'
```

- [ ] **Step 10: Commit** — `feat(contacts): hoàn tác quyết định của người trên đề xuất thông tin`.

### Task 2: Tệp chữ Kara của ngăn bản ghi

**Phục vụ:** E1, E3, E5, E6 · AC-1, AC-3, AC-5 · `independent: false`

**Files:**
- Create: `apps/app/lib/messages/kara-ban-ghi.ts`
- Modify: `apps/app/lib/agent-record.ts` (bỏ chữ cứng, giữ `header`, `field`)
- Modify: `apps/app/lib/messages/record-sheet.ts` (`tabs.agent` vi «Kara», en «Kara»)

**Interfaces:**
- Produces: `karaBanGhiMessages(locale: Locale): KaraBanGhiMessages` với nhóm:
  - `tab.theoLoai[kind]: { tieuDe, moTa, choNhap, goiY: [string, string, string] }` cho `contact | company | deal`
  - `tab.dangMo`, `tab.dangGui`, `tab.chuaTraLoi` («trả lời»), `tab.loiVang`, `tab.loiKhac`, `tab.chuaBat`, `tab.ban`, `tab.ketThuc`, `tab.batDauMoi`, `tab.nhanGoiY`, `tab.nhanO`
  - `hoiLai: { tieuDe, guiTraLoi, dangGui, choNhap, nhanKhac, nhanTraLoi, goiYChon, goiYTuDo, loiGui }`
  - `hoiThoai: { moi, chuaCo, chuaDatTen, daXoa, nhanXoa }`
  - `deXuat: { nhan(n), viSao, them, thay, boQua, daThem, daBo, hoanTacLoi, loiQuyet }`
  - `khung: { loiTieuDe, loiMoTa }`
  - `traCuu: { nhoKara, dangChay, lai, tomTat, loi }`
  - `themNhanh: {}` không cần (dùng `msg.dialog.boThayDoi` của `packages/ui`).
- `agent-record.ts` giữ `recordHeader`, `recordFilter`; `recordCopy(kind)` bị gỡ — `agent-panel.tsx` đọc `karaBanGhiMessages(locale).tab.theoLoai[kind]`.

- [ ] **Step 1:** Viết `kara-ban-ghi.ts` theo khuôn `ke-hoach-noi.ts` (`const en`, `const vi: KaraBanGhiMessages`, `BANG satisfies Record<Locale, …>`). Chữ vi đúng bảng trạng thái của design doc («Kara đang mở cuộc trò chuyện…», «Kara vẫn đang trả lời câu trước. Câu tiếp theo gửi được khi xong.», «Cuộc trò chuyện này đã kết thúc.», «Bắt đầu cuộc mới», «Không tải được bản ghi này», «Kiểm tra kết nối rồi thử lại.», «Thêm vào hồ sơ», «Thay giá trị hiện có», «Bỏ qua», «Đã thêm theo Kara», «Đã bỏ qua», «Trường này đã đổi sau khi nhận — không hoàn tác được», «Kara đang tra cứu…»); gợi ý theo loại như design doc mục 1.
- [ ] **Step 2:** Gỡ `COPY` chữ khỏi `agent-record.ts`, giữ map `header`/`field`.
- [ ] **Step 3:** Chạy bài canh tệp chữ của kho (`cd apps/app && bun test test/messages*`) — thêm khoá mới vào danh sách ghim nếu bài đòi (trí nhớ «messages-guard ghim hàm mới»).
- [ ] **Step 4:** `cd apps/app && bun run check-types` sau `bunx next typegen` → chỉ còn lỗi ở `agent-panel.tsx` (Task 3 sửa).
- [ ] **Step 5:** Commit cùng Task 3 (tệp chữ không đứng một mình được vì `agent-panel.tsx` đọc nó).

### Task 3: Tab Kara

**Phục vụ:** E1, E2, E3, E4, E6 · AC-1…AC-5 · `independent: false`

**Files:**
- Modify: `apps/app/components/crm/agent-panel.tsx`
- Modify: `apps/app/components/crm/agent-conversations.tsx`
- Modify: `apps/app/components/agent-clarification-composer.tsx`
- Create: `apps/app/test/kara-ban-ghi.dom.tsx`
- Modify: `apps/app/test/agent-session.spec.ts` (bỏ kỳ vọng chữ tiếng Anh cũ, kỳ vọng chữ tiếng Việt từ tệp chữ)
- Modify: `_acceptance/logo-onehub/evals.yaml` (E14: thêm `status: not-run`, `superseded_by: khung-ban-ghi-kara#AC-1`)
- Modify: `_acceptance/config.yaml` (thêm `kbk_tab_rong`, `kbk_dang_lam`, `kbk_loi`, `kbk_khoa`, `kbk_hoi_lai`)

**Interfaces:**
- Consumes: `karaBanGhiMessages` (Task 2); `KaraTurn`, `KaraSteps`, `KaraState`, `KaraComposer` từ `@crm/ui/components/kara/*`; `KaraMark` từ `@crm/ui/components/kara`.
- Produces: `AgentPanel({ record })` giữ nguyên chữ ký.

- [ ] **Step 1: Bài DOM đỏ** `kara-ban-ghi.dom.tsx`: `mock.module("eve/react", () => ({ useEveAgent: () => gia }))` với `gia` điều khiển được (`status`, `error`, `data.messages`, `send`), tRPC giả qua `./khung-gop-y` (`dat`, `datMacDinh`, `mo`, `cho`, `goiCua`). Ca theo evals.yaml: `tab-rong` (ma trận 18 ô viết trước), `dang-lam` (3 ca, đồng hồ giả của bài — đếm `[data-slot=spinner]` = 0), `loi` (3 lỗi giả + danh sách cấm 6 chuỗi + Thử lại gửi lại câu cuối), `khoa` (working, ended với bộ chuyển nuqs thử của kho — sau khi bấm «Bắt đầu cuộc mới» textarea hết disabled), `hoi-lai` (11 chữ viết trước). Tên ca mở đầu đúng các nhãn `-t` ở config.
- [ ] **Step 2:** Chạy `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx` → đỏ.
- [ ] **Step 3: Sửa `agent-panel.tsx`:**
  - `Loading` → `<KaraState kind="working" label={t.tab.dangMo} />` bọc trong khung căn giữa có sẵn.
  - `Idle` → `Empty` với `EmptyMedia` chứa `<KaraMark />` (bỏ `Logo`), tiêu đề/mô tả từ `t.tab.theoLoai[kind]`; gợi ý chuyển vào `KaraComposer suggestions`.
  - `Item` `said` → `<KaraTurn from={item.mine ? "user" : "kara"}>{item.text}</KaraTurn>`; bỏ `AgentAvatar`.
  - `Item` `asked` → `<KaraTurn from="kara">{item.question.prompt}</KaraTurn>`.
  - dải `did` liền nhau gom thành một `<KaraSteps steps={…} />` (`pending` → `running`, `tone` bất kỳ đã xong → `done`), nguồn của dải giữ `Sources` (thẻ đính kèm) ngay dưới; viết hàm thuần `gomBuoc(items)` trong `agent-panel.tsx`.
  - ô soạn: `<KaraComposer onSubmit={ask} status={busy ? "busy" : "ready"} placeholder={kieu.choNhap} label={t.tab.nhanO} suggestions={rong ? kieu.goiY : undefined} suggestionsLabel={t.tab.nhanGoiY} onSuggestion={ask} lockedReason={lyDoKhoa} />`; `lyDoKhoa` = `t.tab.ban` khi `thread.status === "working" && !busy`, `t.tab.ketThuc` khi `ended`, `undefined` còn lại; ended thêm nút «Bắt đầu cuộc mới» trên ô soạn.
  - `Failure` → `KaraState`: lỗi chứa «not configured» → `kind="unconfigured" description={t.tab.chuaBat}`; còn lại → `kind="error" what={t.tab.chuaTraLoi} description={laVang ? t.tab.loiVang : t.tab.loiKhac} onRetry={() => ask(cauCuoi)}`; `cauCuoi` = lời cuối của người trong `messages` (hàm thuần `cauHoiCuoi(messages)`).
  - bỏ import `Logo`, `Spinner`, `MessageAvatar`, `Message*` không còn dùng.
- [ ] **Step 4: `agent-conversations.tsx`, `agent-clarification-composer.tsx`** — thay mọi chuỗi cứng bằng `karaBanGhiMessages(useLocale())`; toast xoá dùng `t.hoiThoai.daXoa`.
- [ ] **Step 5:** Chạy lại bài DOM → xanh; chạy `cd apps/app && bun test test/agent-session.spec.ts` sau khi sửa kỳ vọng → xanh.
- [ ] **Step 6: Phá-thử** từng thông điệp ghim (`tab-rong: con logo OneHub`, `tab-rong: deal goi y 2`, `dang-lam: spinner tran`, `loi: lo chuoi cam not reachable`, `khoa: ket thuc van go duoc`, `khoa: cuoc moi van khoa`, `hoi-lai: nut gui`) trên bản sao, ghi lệnh và kết quả vào nhật ký task.
- [ ] **Step 7:** `_acceptance/logo-onehub/evals.yaml` E14 thêm hai dòng `status: not-run` và `superseded_by: khung-ban-ghi-kara#AC-1` ngay dưới `- id: E14`; thêm năm khoá `kbk_*` (lệnh `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-ban-ghi.dom.tsx -t <nhãn>`).
- [ ] **Step 8: Commit** — `feat(app): tab Kara của ngăn bản ghi nói tiếng Việt, dùng khối Kara`.

### Task 4: Đề xuất thông tin liên hệ — neo tại chỗ, biên nhận, Hoàn tác

**Phục vụ:** E7, E8, E10 (phần màn), E12 · AC-6, AC-7, AC-8, AC-9 · `independent: false`

**Files:**
- Modify: `apps/app/components/crm/facts.tsx`
- Modify: `apps/app/lib/contact-facts.ts` (thêm `type FactReceipt`, `giaTriTruoc(contact, field)`)
- Modify: `apps/app/components/crm/record-sheet/contact-sheet.tsx` (`ContactOverview` giữ biên nhận, nhãn nhóm)
- Create: `apps/app/test/kara-ban-ghi-de-xuat.dom.tsx`
- Modify: `apps/app/test/the-gop-y-okr.dom.tsx` (gỡ đúng khối `thong-tin` — chuyển sang tệp mới; không chạm ca OKR)
- Modify: `apps/app/test/nen-kara-man-cu.dom.tsx` (gỡ đúng ca «man-cu: thông tin liên hệ vẫn là thẻ»)
- Modify: `_acceptance/the-gop-y-okr/evals.yaml` (E10: `status: not-run`, `superseded_by: khung-ban-ghi-kara#AC-6`)
- Modify: `_acceptance/config.yaml` (thêm `kbk_de_xuat_cho`, `kbk_ui_nhan`, `kbk_ui_hoan_tac_loi`)

**Interfaces:**
- Consumes: `contacts.undoFactDecision`, `undoFactDecisionInput` (Task 1); `KaraProposal`, `KaraLabel`; `karaBanGhiMessages().deXuat`.
- Produces:

```ts
export type FactTruoc = UndoFactDecisionInput["truoc"];
export type FactReceipt = {
	fact: ContactFact;
	decision: "accept" | "dismiss";
	truoc: FactTruoc;
	loi: boolean;
};
export function FactSuggestion(props: {
	fact: ContactFact;
	contactId: string;
	current: string | null;
	truoc: FactTruoc;
	receipt: FactReceipt | undefined;
	onReceipt: (next: FactReceipt | undefined) => void;
}): JSX.Element;
export function FactGroupLabel(props: { facts: ContactFact[] }): JSX.Element | null;
```

  (`FactTruoc` nhập kiểu từ `apps/api/src/contacts/contacts.contracts` như các bài DOM đang làm với `factDecisionInput` — chỉ kiểu, không nhập mã chạy vào client.)

- [ ] **Step 1: Bài DOM đỏ** `kara-ban-ghi-de-xuat.dom.tsx` theo evals E7, E8, E10 phần màn, E12: `cho` (2 ô trống/có giá trị, nhãn nhóm «Kara · 2 đề xuất» đúng 1 lần), `nhan-hoan-tac` (payload parse bằng `undoFactDecisionInput` thật; focus về nút chính), `bo-qua`, `hoan-tac-loi`. Chuyển hai ca `thong-tin` cũ của `the-gop-y-okr.dom.tsx` vào đây dưới hình dạng mới (không còn «Nhận/Bác»).
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3: `facts.tsx`** — `FactSuggestion` dựng `KaraProposal density="inline" kind="compact"`; `value` bọc `<span translate="no">`; action chính `current ? t.deXuat.thay : t.deXuat.them`; «Bỏ qua» `tone: "quiet"`; quyết xong `onReceipt({ fact, decision, truoc, loi: false })` rồi `cache.contact(contactId, { settle: "record" })`; không toast thành công; lỗi quyết → `toast.error(t.deXuat.loiQuyet)`. Có `receipt` → `decided = { decision: receipt.decision === "accept" ? "accepted" : "dismissed", text: …, onUndo: receipt.loi ? undefined : hoanTac }`; `receipt.loi` → thay biên nhận bằng dòng lỗi `t.deXuat.hoanTacLoi`. `hoanTac` gọi `undoFactDecision.mutate({ factId: receipt.fact.id, truoc: receipt.truoc })`; thành công → `flushSync(() => onReceipt(undefined))`, focus `ref.current?.querySelector('button[data-variant="default"]')`, rồi `cache.contact(...)`; lỗi → `onReceipt({ ...receipt, loi: true })`. `FactGroupLabel` → `KaraLabel scope={t.deXuat.nhan(n)} reason={t.deXuat.viSao} readAt={ngày observedAt mới nhất}`; n = 0 → `null`.
- [ ] **Step 4: `contact-sheet.tsx`** — `ContactOverview` thêm `const [bienNhan, datBienNhan] = useState<Record<string, FactReceipt>>({})`; `agentProps(field, current)` lấy `fact = proposed.get(field)` hoặc `bienNhan[field]?.fact`; truyền `current`, `truoc = giaTriTruoc(contact, field)`, `receipt`, `onReceipt`. Section «Chi tiết» `action` = `FactGroupLabel` (đề xuất đang chờ của bốn trường có `agentProps`) cạnh `FieldsCog`.
- [ ] **Step 5:** Chạy bài DOM → xanh; `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/the-gop-y-okr.dom.tsx ./test/nen-kara-man-cu.dom.tsx` → xanh.
- [ ] **Step 6:** `_acceptance/the-gop-y-okr/evals.yaml` E10 thêm `status: not-run`, `superseded_by: khung-ban-ghi-kara#AC-6`; chạy `node _acceptance/gop-y-dung-cho/rang/thay-the.mjs` — đỏ thì đọc thông điệp và báo giám sát (yêu cầu `khac`) trước khi sửa gì của hồ sơ đó.
- [ ] **Step 7: Phá-thử** `de-xuat: con khung the`, `de-xuat: nhan lap 2 lan`, `nhan: truoc sai gia tri`, `bo-qua: cot doi` (phần màn), `hoan-tac-loi: con nut`.
- [ ] **Step 8:** Thêm ba khoá `kbk_*`; commit — `feat(app): đề xuất thông tin liên hệ neo tại chỗ, có biên nhận và Hoàn tác`.

### Task 5: Khung bản ghi và tab kế hoạch tải lỗi

**Phục vụ:** E13 · AC-10 · `independent: false`

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-parts.tsx` (`RecordSheetFrame` nhận `onRetry?: () => void`; xuất `KhungTaiLoi({ onRetry })`)
- Modify: `apps/app/components/crm/record-sheet/contact-sheet.tsx`, `company-sheet.tsx` (truyền `onRetry={() => query.refetch()}`)
- Modify (chỉ thêm dòng): `apps/app/components/crm/record-sheet/deal-sheet.tsx` (`onRetry={() => query.refetch()}`)
- Modify: `apps/app/components/crm/record-sheet/company-plans.tsx` (lỗi → `<KhungTaiLoi onRetry={() => query.refetch()} />`; lúc chờ giữ khối `aria-live` như cũ vì tải kế hoạch không phải lời của Kara)
- Test: thêm ca `khung-loi` vào `apps/app/test/kara-ban-ghi.dom.tsx`; khoá `kbk_khung_loi`

**Interfaces:**
- Produces: `export function KhungTaiLoi({ onRetry }: { onRetry: () => void }): JSX.Element` — `Empty border="solid" size="compact"` + `EmptyTitle` `t.khung.loiTieuDe` + `EmptyDescription` `t.khung.loiMoTa` + `KaraRetry onClick={onRetry}`.

- [ ] **Step 1:** Ca DOM đỏ `khung-loi`: ma trận 3 ngăn (byId lỗi «Lỗi máy chủ 500 chi tiết» lần đầu, thành công lần hai); CompanyPlans lỗi dùng `[data-slot=kara-retry]`.
- [ ] **Step 2:** Sửa `record-parts.tsx`: nhánh `error && !errorView` → `<KhungTaiLoi onRetry={onRetry ?? (() => {})} />`; không in `error`.
- [ ] **Step 3:** Ba ngăn truyền `onRetry`; `company-plans.tsx` dùng `KhungTaiLoi`.
- [ ] **Step 4:** Chạy → xanh; phá-thử `khung-loi: lo thong diep tho`; thêm khoá; commit — `feat(app): khung bản ghi tải lỗi có Thử lại`.

### Task 6: Nút gọi Kara dùng chung và nút tra cứu

**Phục vụ:** E14 · AC-11 · `independent: false`

**Files:**
- Create: `packages/ui/src/components/kara/ban-ghi.tsx` (xuất `NutKara`)
- Modify: `apps/app/components/crm/enrichment-actions.tsx`
- Test: ca `tra-cuu` trong `apps/app/test/kara-ban-ghi.dom.tsx`; khoá `kbk_tra_cuu`

**Interfaces:**
- Produces:

```tsx
export type NutKaraProps = Omit<ComponentProps<typeof Button>, "children"> & {
	nhan: string;
	dangChay?: string | null;
};
export function NutKara({ nhan, dangChay, disabled, ...props }: NutKaraProps) {
	return (
		<Button variant="outline" size="sm" data-slot="nut-kara" disabled={disabled || Boolean(dangChay)} {...props}>
			{dangChay ? null : <Icon icon={AiGenerate} data-icon="inline-start" />}
			{dangChay ?? nhan}
		</Button>
	);
}
```

- [ ] **Step 1:** Ca DOM đỏ `tra-cuu` (ma trận 3 trạng thái × 2 nút, đếm MagicWand theo đường vẽ rút từ `@carbon/icons-react/es/MagicWand` lúc chạy, đối chứng dương).
- [ ] **Step 2:** Tạo `ban-ghi.tsx`; sửa `enrichment-actions.tsx`: nút «research» của công ty và nút tra cứu của cá nhân → `NutKara` (`dangChay={pending ? t.traCuu.dangChay : null}`); nút «Tra cứu lại» của công ty giữ icon `Renew`, đang chạy đổi chữ thành `t.traCuu.dangChay` thay `Spinner`; `onError` → `toast.error(t.traCuu.loi)`.
- [ ] **Step 3:** Chạy → xanh; phá-thử `tra-cuu: con MagicWand`, `tra-cuu: MagicWand con o dang chay`; thêm khoá; commit — `feat(ui): nút gọi Kara dùng chung; nút tra cứu mang dấu Kara`.

### Task 7: Ngăn thêm nhanh hỏi lại khi lỡ đóng

**Phục vụ:** E15 · AC-12 · `independent: false`

**Files:**
- Modify: `apps/app/components/crm/record-sheet/quick-add.tsx`
- Modify: `apps/app/test/ngan-ban-ghi-giu.dom.tsx` (ca `them-nhanh`)
- Modify (nếu cần): `packages/ui/src/components/sheet.tsx` — chỉ khi `useKhaiThayDoi` không với tới `DetailSheet`
- `_acceptance/config.yaml`: `kbk_them_nhanh`

**Interfaces:**
- `QuickAddForm` thêm prop `dirty: boolean`; mỗi biểu mẫu tính `dirty` từ state của nó (mọi ô chữ khác rỗng, hoặc lựa chọn khác mặc định).

- [ ] **Step 1:** Ca DOM đỏ `them-nhanh` (18 ô viết trước) với `DetailSheet` thật bọc ba biểu mẫu thật.
- [ ] **Step 2:** `QuickAddForm`: `const khai = useKhaiThayDoi()`; mỗi `setX` trong biểu mẫu đi qua một hàm `doi(next)` gọi `khai(laDirty(next))` (không `useEffect` — `.agents/skills/no-use-effect`); nút Huỷ: `dirty` → mở `ConfirmDialog` (`tieuDe/than/nut/thoi` từ `useMessages().dialog.boThayDoi`), xác nhận → `khai(false); onCancel()`; trống → `onCancel()`. Lưu xong → `khai(false)` trước `onDone()`.
- [ ] **Step 3:** Chạy → xanh, năm ca cũ `ngan-ban-ghi:` vẫn xanh; phá-thử `them-nhanh: QuickAddDeal Esc mat chu`; thêm khoá; commit — `feat(app): ngăn thêm nhanh hỏi lại khi lỡ đóng`.

### Task 8: Răng chữ cứng và phép đo màn

**Phục vụ:** E5, E16 (E17 đọc ảnh của E16) · AC-5, AC-13 · `independent: false`

**Files:**
- Create: `_acceptance/khung-ban-ghi-kara/rang/chu-cung.mjs`
- Create: `_acceptance/khung-ban-ghi-kara/rang/man.mjs`
- `_acceptance/config.yaml`: `kbk_chu_cung: "node _acceptance/khung-ban-ghi-kara/rang/chu-cung.mjs"`, `kbk_man: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-ban-ghi-kara/rang/man.mjs"'`

- [ ] **Step 1:** `chu-cung.mjs` suy gốc kho từ vị trí tệp; danh sách viết trước 9 tệp; lượt 1 gọi `chu-cung-jsx.mjs` (kiểm nó không tự loại `agent-*.tsx` — nếu có, gọi trực tiếp hàm quét qua tham số tệp); lượt 2 quét mọi chuỗi literal bằng TypeScript AST với 5 mục cấm → 45 phép kiểm; in đếm; mã 0/1/2.
- [ ] **Step 2:** Phá-thử hai chiều đỏ của E5 trên bản sao.
- [ ] **Step 3:** `man.mjs` theo khuôn `_acceptance/chat-an-toan-truoc-r1/rang/man-bi-go.mjs` (đòi `PHIEN_DO`, dùng `man-lib.mjs` `moDo`, `chup`): gieo công ty, cá nhân, fact PROPOSED, thoả thuận bằng Prisma; bốn bước của E16; ảnh vào `.acceptance-runs/khung-ban-ghi-kara/evidence/` và chép sang `_acceptance/khung-ban-ghi-kara/evidence/`; `--chieu-do` bấm Hoàn tác hai lần.
- [ ] **Step 4:** Chạy `bun run do:man --chay "bun _acceptance/khung-ban-ghi-kara/rang/man.mjs"` một lần để chắc nó chạy (không phải chấm); commit — `test(acceptance): khung-ban-ghi-kara — răng chữ cứng và phép đo màn`.

### Task 9: Chứng minh toàn kho và chuyển sang chấm

- [ ] **Step 1:** Ở gốc kho, lần lượt: `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test` (ghi ra tệp, đọc đuôi — trí nhớ «S4 suite đọc qua tệp»), `bun run build`. Mọi lệnh xanh.
- [ ] **Step 2:** `git status` sạch ngoài `_acceptance/`; đặt `status: implemented` trong contract; commit `chore(acceptance): khung-ban-ghi-kara — implemented`.
- [ ] **Step 3:** Xin khoá `s4` của đợt rồi chạy S4 theo feature-loop.
