# Hoàn thiện Hỏi CRM qua Zalo — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trên Zalo, trợ lý không ghi được gì dù eve bỏ qua lớp ẩn công cụ; tin không chữ nhận một câu báo; số tiền lớn không bị che; bộ đo của hồ sơ `hoi-crm-qua-zalo` thôi xanh giả.

**Architecture:** Một hàm chặn `assertNotZaloQuestion(ctx)` trong `lib/session-purpose.ts`, gọi ở dòng đầu `execute` của 19 công cụ ghi và của bản bọc tĩnh `tools/web_fetch.ts`. Bộ giải `tools/zalo-chi-doc.ts` chuyển sang `step.started` và chỉ còn làm lớp ẩn. `khongMa` có thêm một nhánh cho tin không chữ; `che` của `zalo-loc.ts` tách đoạn dạng số tiền trước khi che số điện thoại. Bảy ca test cũ được siết theo Ngoài-8, 10..15.

**Tech Stack:** Bun 1.3.12 (`bun:test`), eve (`eve/tools`, `eve/tools/defaults`), Prisma (`@crm/db`), Zod.

**Spec:** `docs/superpowers/specs/2026-09-26-hoan-thien-hoi-crm-qua-zalo-design.md` · hợp đồng `_acceptance/hoan-thien-hoi-crm-qua-zalo/contract.md` · evals `_acceptance/hoan-thien-hoi-crm-qua-zalo/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md «Never add code comments»).
- Chạy test qua `bun run test -- "<lệnh>"` từ gốc kho (mỗi lượt có DB riêng); lệnh test agent đặt `TZ=Asia/Ho_Chi_Minh`.
- Bun trên PATH phải là 1.3.12: `export PATH="/opt/homebrew/opt/bun@1.3.12/bin:$PATH"`.
- Hằng số và câu chữ Zalo sống trong `ZALO` của `apps/agent/agent/lib/zalo-config.ts`; không đặt hằng tại chỗ dùng.
- Câu Zalo mới: một dòng, có dấu, không chứa «trợ lý», không chứa «thông báo», dưới `ZALO.tranKyTu`.
- Không migration, không biến môi trường mới, không đổi ranh giới dữ liệu A, trần 20/3/1.500, telemetry.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, phá vật trong bản sao đỏ với thông điệp ghim. Phá-thử làm trên bản sao hoặc sau khi commit (ghi nhớ «phá-thử tại chỗ mất thay đổi»).
- Tệp test của hồ sơ đã ký (`hoi-crm-qua-zalo*.spec.ts`, `zalo-chi-doc.spec.ts`, `zalo-loc.spec.ts`) bị chạm → hồ sơ `hoi-crm-qua-zalo` phải ghim lại ở cuối vòng.

## Review Focus

- Phiên con uỷ thác của một phiên Zalo: `purpose` nằm ở `initiator`, không ở `current` — `attribute()` đọc cả hai, nên chặn vẫn bắn; Task 1 thêm một ca `ctx` chỉ có `initiator.attributes.purpose = "zalo"`.
- Tin chỉ gồm emoji («👍») là tin chữ, đi `hoiTacTu` như câu hỏi, không nhận `chiDocChu` — Task 3 thêm ca đối chứng.
- Số tiền có phần lẻ «1.000.000.000.000,50 đ» và dính chữ «1.000.000.000.000đ» — giữ nguyên — Task 4 thêm vào ma trận số tiền.
- Số điện thoại có mã nước «+84 912 345 678» và số bàn «(028) 3823 4567» vẫn bị che sau khi tách số tiền — Task 4 thêm vào ma trận che.
- Công cụ ghi gọi với `ctx` web nhưng đầu vào rỗng không được ghi rác vào DB thật của lượt test — ma trận đối chứng của Task 1 chỉ khẳng định «không bị từ chối bằng câu Zalo», và chạy trên DB riêng của lượt.

---

### Task 1: Chặn ghi trong công cụ (AC-1, AC-2, AC-3)

**Files:**
- Modify: `apps/agent/agent/lib/session-purpose.ts` (thêm `assertNotZaloQuestion`)
- Modify: `apps/agent/agent/lib/zalo-config.ts` (`congCu.ghi` thêm `web_fetch`; `coSanChan` bỏ `web_fetch`)
- Create: `apps/agent/agent/tools/web_fetch.ts`
- Modify: 19 tệp `apps/agent/agent/tools/{archive_field,enrich_company,fetch_contact_photo,find_contact_socials,get_contact_work_history,get_linkedin_profile,identify_contact,manage_fields,record_fact,record_job_change,research_company,research_person,resolve_linkedin_profile,schedule_recheck,set_chat_title,set_contact_socials,set_field_value,write_brief,write_workspace_profile}.ts`
- Modify: `packages/telemetry/src/allowlist.ts` (`AGENT_TOOLS` thêm `web_fetch` — test allowlist đòi mọi tệp `tools/`)
- Create: `apps/agent/test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts` (ca `chan-ghi`, `ghi-that`, `web-fetch`)
- Modify: `_acceptance/config.yaml` không đổi thêm (khoá `hth_*` đã có từ Cổng 1)

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts -t 'chan-ghi|ghi-that|web-fetch'"` · phục vụ E1, E2, E3 · `independent: false`

**Interfaces:**
- Produces: `assertNotZaloQuestion(ctx: PurposeContext): void` — ném `new Error(ZALO.hoi.tuChoiGhi)` khi `purposeOf(ctx) === "zalo"`.
- Produces: helper test `phienTuSend(eve, i)` trả `CtxPhien` rút từ `eve.send[i].auth` — Task 7 dùng lại cùng khuôn.

- [ ] **Step 1: Viết test đỏ** — tệp mới, ba `describe`:

```ts
const GHI_20 = [
	"archive_field", "enrich_company", "fetch_contact_photo", "find_contact_socials",
	"get_contact_work_history", "get_linkedin_profile", "identify_contact", "manage_fields",
	"record_fact", "record_job_change", "research_company", "research_person",
	"resolve_linkedin_profile", "schedule_recheck", "set_chat_title", "set_contact_socials",
	"set_field_value", "web_fetch", "write_brief", "write_workspace_profile",
];

function tapGhi(): string[] {
	const { doc, tat } = ZALO.hoi.congCu;
	return readdirSync(resolve(import.meta.dir, "../agent/tools"))
		.filter((f) => f.endsWith(".ts"))
		.map((f) => f.replace(/\.ts$/, ""))
		.filter((t) => !doc.includes(t) && !tat.includes(t))
		.sort();
}

async function ctxZaloThat(): Promise<CtxPhien> {
	const A = await gieoVai("Hth", "member");
	await noiZalo(A.id, "ZH");
	const eve = eveGia();
	await guiWebhook("ZH", "Thoả thuận nào sắp hạn?", eve);
	await eve.xong();
	return phienTuSend(eve, 0);
}

function phienTuSend(eve: Eve, i: number): CtxPhien {
	const goi = eve.send[i];
	if (!goi) throw new Error(`eve gia chua co send ${i}`);
	const auth = goiAuth.parse(goi.auth);
	return { session: { id: `ses-gia-${i + 1}`, auth: { current: { attributes: auth.attributes }, initiator: null } } };
}

function ctxMucDich(attributes: Record<string, string>): CtxPhien {
	return { session: { id: "ses-hth", auth: { current: { attributes }, initiator: null } } };
}

async function goi(ten: string, ctx: CtxPhien): Promise<string | null> {
	const mod = await import(`../agent/tools/${ten}.ts`);
	try {
		await mod.default.execute({}, ctx);
		return null;
	} catch (loi) {
		return loi instanceof Error ? loi.message : String(loi);
	}
}

describe("chan-ghi", () => {
	test("chan-ghi: tap cong cu ghi dung 20 ten viet truoc", () => {
		expect(tapGhi()).toEqual([...GHI_20].sort());
	});
	test("chan-ghi: moi cong cu ghi tu choi o phien Zalo that, khong chan nham muc dich khac", async () => {
		const zalo = await ctxZaloThat();
		let soZalo = 0;
		for (const ten of GHI_20) {
			expect(await goi(ten, zalo), `${ten} tu choi tren Zalo`).toBe(ZALO.hoi.tuChoiGhi);
			soZalo += 1;
		}
		expect(soZalo).toBe(20);
		let soKhac = 0;
		for (const [nhan, attributes] of [["web", {}], ["builder", { purpose: "builder" }], ["team-agent", { purpose: "team-agent" }]] as const) {
			for (const ten of GHI_20) {
				expect(await goi(ten, ctxMucDich(attributes)), `${ten} khong tu choi o phien ${nhan}`).not.toBe(ZALO.hoi.tuChoiGhi);
				soKhac += 1;
			}
		}
		expect(soKhac).toBe(60);
	});
	test("chan-ghi: phien con uy thac mang purpose zalo o initiator van bi chan", async () => {
		const ctx = { session: { id: "ses-con", auth: { current: { attributes: {} }, initiator: { attributes: { purpose: "zalo" } } } } };
		expect(await goi("set_field_value", ctx as unknown as CtxPhien)).toBe(ZALO.hoi.tuChoiGhi);
	});
});
```

`goiAuth` là schema Zod trong tệp test: `z.object({ attributes: z.record(z.string(), z.string()) })` — parse `auth` mà eve giả ghi, không ép kiểu. `guiWebhook(fromId, text, eve)` chép khuôn của `hoi-crm-qua-zalo.integration.spec.ts` (dòng 401–439), dùng `thanWebhook`, `yeuCauWebhook`, `DU_BIEN`, `zaloGia`.

`ghi-that`:

```ts
describe("ghi-that", () => {
	test("ghi-that: set_field_value va record_fact that khong ghi tren Zalo, ghi o web", async () => {
		const zalo = await ctxZaloThat();
		const web = ctxMucDich({});
		const C = await db.contact.create({ data: { firstName: `${TIEN_TO}hth` } });
		await db.fieldDefinition.create({ data: { entity: "CONTACT", key: KHOA_HTH, label: "Hth", type: "TEXT", position: 9_998 } });
		await writeField({ entity: "CONTACT", recordId: C.id, key: KHOA_HTH, value: "truoc" });
		const R = { contactId: C.id, field: "title", value: "CFO", evidence: [{ kind: "linkedin.employer-and-name", detail: "Hồ sơ ghi CFO" }], method: "web" };
		const demFact = () => db.contactFact.count({ where: { contactId: C.id } });
		const truoc = await demFact();
		const sfv = (await import("../agent/tools/set_field_value.ts")).default;
		const rf = (await import("../agent/tools/record_fact.ts")).default;
		await expect(sfv.execute({ entity: "CONTACT", recordId: C.id, key: KHOA_HTH, value: "zalo" }, zalo)).rejects.toThrow(ZALO.hoi.tuChoiGhi);
		await expect(rf.execute(R, zalo)).rejects.toThrow(ZALO.hoi.tuChoiGhi);
		expect(await giaTri(C.id), "gia tri giu nguyen tren Zalo").toBe("truoc");
		expect(await demFact(), "record_fact khong ghi tren Zalo").toBe(truoc);
		await sfv.execute({ entity: "CONTACT", recordId: C.id, key: KHOA_HTH, value: "web" }, web);
		await rf.execute(R, web);
		expect(await giaTri(C.id), "web ghi duoc").toBe("web");
		expect(await demFact(), "web ghi duoc mot fact").toBe(truoc + 1);
	});
});
```

`giaTri(contactId)` đọc `db.fieldValue.findFirst({ where: { contactId, field: { key: KHOA_HTH } } })?.text`. Kind evidence lấy từ `Object.keys(WEIGHTS)` nếu `linkedin.employer-and-name` không tồn tại — chọn kind đầu tiên có trong `WEIGHTS`.

`web-fetch`:

```ts
describe("web-fetch", () => {
	test("web-fetch: phien Zalo khong goi mang, phien web tai duoc trang", async () => {
		const dau = `hth-web-fetch-${crypto.randomUUID()}`;
		let dem = 0;
		const mayChu = Bun.serve({ port: 0, fetch: () => { dem += 1; return new Response(dau, { headers: { "content-type": "text/plain" } }); } });
		try {
			const wf = (await import("../agent/tools/web_fetch.ts")).default;
			const url = `http://127.0.0.1:${mayChu.port}/x`;
			await expect(wf.execute({ url }, await ctxZaloThat())).rejects.toThrow(ZALO.hoi.tuChoiGhi);
			expect(dem, "web_fetch khong goi mang tren Zalo").toBe(0);
			const ra = await wf.execute({ url }, ctxMucDich({}));
			expect(dem, "web_fetch web van tai trang").toBe(1);
			expect(JSON.stringify(ra)).toContain(dau);
		} finally {
			mayChu.stop(true);
		}
	});
});
```

Nếu `webFetch` mặc định từ chối địa chỉ nội bộ hay cần `ctx` đầy đủ hơn, đổi đối chứng sang `Bun.serve` với tên máy `localhost` và ghi lý do vào sổ (`fix`).

- [ ] **Step 2: Chạy, thấy đỏ** — lệnh Verify. Kỳ vọng: `chan-ghi` đỏ ở tập 20 tên (chưa có `web_fetch.ts`) và ở `archive_field tu choi tren Zalo`; `web-fetch` đỏ vì không nạp được tệp.

- [ ] **Step 3: Cài chặn**

`lib/session-purpose.ts`:

```ts
import { ZALO } from "./zalo-config";

export function assertNotZaloQuestion(ctx: PurposeContext): void {
	if (purposeOf(ctx) === "zalo") throw new Error(ZALO.hoi.tuChoiGhi);
}
```

Mỗi công cụ trong 19 tệp: `execute` nhận `(input, ctx)` (đổi `({ ... })` thành `({ ... }, ctx)` khi cần) và dòng đầu là `assertNotZaloQuestion(ctx);` — đứng TRƯỚC `assertResearchPurpose`/`purposeOf` sẵn có.

`tools/web_fetch.ts`:

```ts
import { defineTool } from "eve/tools";
import { webFetch } from "eve/tools/defaults";
import { assertNotZaloQuestion } from "../lib/session-purpose";

export default defineTool({
	...webFetch,
	async execute(input, ctx) {
		assertNotZaloQuestion(ctx);
		return webFetch.execute(input, ctx);
	},
});
```

`zalo-config.ts`: `ghi` thêm `"web_fetch"` (giữ thứ tự chữ cái), `coSanChan` còn `["web_search", "ask_question"]`. `packages/telemetry/src/allowlist.ts`: `AGENT_TOOLS` thêm `"web_fetch"`.

- [ ] **Step 4: Chạy, thấy xanh** — lệnh Verify; thêm `bun run test -- "cd packages/telemetry && bun test test/allowlist.spec.ts"` và `bun run test -- "cd apps/app && bun test test/agent-transcript.spec.ts"`.

- [ ] **Step 5: Commit** — `feat(hoan-thien-hoi-crm-qua-zalo): chặn ghi trên Zalo nằm trong chính công cụ`.

- [ ] **Step 6: Phá-thử trên cây đã commit** (hoàn lại bằng `git checkout -- <tệp>` sau mỗi lượt):
  - bỏ dòng chặn khỏi `set_field_value.ts` → `chan-ghi` đỏ «set_field_value tu choi tren Zalo», `ghi-that` đỏ «gia tri giu nguyen tren Zalo»;
  - đổi chặn thành `purposeOf(ctx) !== "research"` → đỏ «set_chat_title khong tu choi o phien builder»;
  - chuyển `get_linkedin_profile` sang `doc` → đỏ ở tập 20 tên;
  - bỏ chặn khỏi `record_fact.ts` và `assertResearchPurpose` → đỏ «record_fact khong ghi tren Zalo»;
  - bỏ chặn khỏi `web_fetch.ts` → đỏ «web_fetch khong goi mang tren Zalo».
  Ghi thông điệp đỏ thật vào `_acceptance/hoan-thien-hoi-crm-qua-zalo/pha-thu.md`.

### Task 2: Lớp ẩn ở `step.started` (AC-4)

**Files:**
- Modify: `apps/agent/agent/tools/zalo-chi-doc.ts` (khoá sự kiện `"session.started"` → `"step.started"`)
- Modify: `apps/agent/test/zalo-chi-doc.spec.ts` (hàm `giai` đọc `step.started`; thêm ca «không còn session.started»; tập kỳ vọng `ghi ∪ coSanChan`)
- Modify: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` chỗ nào gọi `chiDoc.events["session.started"]`

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/zalo-chi-doc.spec.ts"` · phục vụ E4 · `independent: false` (phụ thuộc danh sách của Task 1)

- [ ] **Step 1: Test đỏ** — trong `zalo-chi-doc.spec.ts`:

```ts
async function giai(purpose: string) {
	const moc = chiDoc.events["step.started"] as unknown as GiaiCongCu;
	return (await moc({}, phien(purpose))) ?? null;
}

test("chi-doc: bo giai chay o step.started, khong con session.started", () => {
	expect(chiDoc.events["step.started"], "co step.started").toBeInstanceOf(Function);
	expect((chiDoc.events as Record<string, unknown>)["session.started"], "khong con session.started").toBeUndefined();
});
```

và `expect(await giai("research")).toBeNull()` cùng `giai("builder")`.
- [ ] **Step 2: Chạy, thấy đỏ** «khong con session.started».
- [ ] **Step 3: Đổi khoá sự kiện** trong `zalo-chi-doc.ts` (thân hàm giữ nguyên).
- [ ] **Step 4: Chạy xanh**; chạy lại `hoi-crm-qua-zalo.integration.spec.ts -t 'cai-lenh|chi-dan'`.
- [ ] **Step 5: Commit** — `feat(hoan-thien-hoi-crm-qua-zalo): lớp ẩn công cụ chạy ở step.started`.
- [ ] **Step 6: Phá-thử** — trả lại `session.started` → đỏ ghim «khong con session.started»; bỏ `web_fetch` khỏi `ghi` → bánh cóc đỏ.

### Task 3: Tin không chữ (AC-5)

**Files:**
- Modify: `apps/agent/agent/lib/zalo-config.ts` (`ZALO.loi.chiDocChu: "Tôi chỉ đọc được tin chữ. Gõ câu hỏi của bạn ở đây nhé."`)
- Modify: `apps/agent/agent/lib/zalo-nhan.ts` (`khongMa`: sau nhánh `moi`, trước `hoiTacTu`: `if (!text.trim()) return gui(ZALO.loi.chiDocChu);`)
- Modify: `apps/agent/test/support/zalo-tin.ts` (`ChonTin` thêm `eventName?: string`, `sticker?: string`, `photoUrl?: string`, `caption?: string`; `thanWebhook` đặt `event_name` theo `eventName`)
- Modify: `apps/agent/test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts` (ca `khong-chu`)

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts -t khong-chu"` · phục vụ E5 · `independent: false`

- [ ] **Step 1: Test đỏ**:

```ts
const KHONG_CHU = [
	{ ten: "sticker", chon: { eventName: "message.sticker.received", text: null, sticker: "stk-1" } },
	{ ten: "anh", chon: { eventName: "message.image.received", text: null, photoUrl: "https://example.test/a.jpg" } },
	{ ten: "anh chu thich rong", chon: { eventName: "message.image.received", text: null, photoUrl: "https://example.test/b.jpg", caption: "" } },
	{ ten: "chu toan khoang trang", chon: { eventName: "message.text.received", text: "   " } },
] as const;

describe("khong-chu", () => {
	test("khong-chu: moi tin khong chu nhan chiDocChu, khong mo phien, khong them hang", async () => {
		const A = await gieoVai("Kc", "member");
		await noiZalo(A.id, "ZK");
		const eve = eveGia();
		let dem = 0;
		for (const { ten, chon } of KHONG_CHU) {
			const truoc = await db.zaloHoi.count({ where: { crmUserId: A.id } });
			const w = await guiTho("ZK", chon, eve);
			expect(w.res.status, `${ten} 200`).toBe(200);
			expect(w.tra(), `${ten} nhan chiDocChu`).toEqual([ZALO.loi.chiDocChu]);
			expect(eve.send.length, `${ten} khong mo phien`).toBe(0);
			expect(await db.zaloHoi.count({ where: { crmUserId: A.id } }), `${ten} khong them hang`).toBe(truoc);
			dem += 1;
		}
		expect(dem).toBe(4);
		const cau = await guiTho("ZK", { text: "Thoả thuận nào sắp hạn?" }, eve);
		await eve.xong();
		expect(eve.send.length, "cau chu mo phien").toBe(1);
		expect((await db.zaloHoi.findUnique({ where: { messageId: cau.messageId } }))?.ketQua).toBe("dang-hoi");
		const emoji = await guiTho("ZK", { text: "👍" }, eveGia());
		expect(emoji.tra(), "emoji la tin chu").not.toEqual([ZALO.loi.chiDocChu]);
	});
	test("khong-chu: chua noi va duong luat cu giu nguyen", async () => {
		const B = await guiTho("ZB", KHONG_CHU[0].chon, eveGia());
		expect(B.tra()).toEqual([ZALO.loi.huongDan]);
		const A = await gieoVai("Kd", "member");
		await noiZalo(A.id, "ZD");
		const cu = await guiTho("ZD", KHONG_CHU[0].chon, null);
		expect(cu.tra()[0], "luat cu tra daNoiRoi").toStartWith(ZALO.loi.daNoiRoi(A.name, "").split(".")[0] ?? "");
	});
});
```

`guiTho(fromId, chon, eve | null)` là `guiWebhook` nhận `ChonTin` thay vì chuỗi; `eve === null` thì không truyền `hoi`. Ca luật cũ so bằng `ZALO.loi.daNoiRoi(tên, gioNhac())` nếu `gioNhac` xuất được từ `lib/zalo-nhan.ts`; không thì so đúng phần đầu câu và ghi lý do trong sổ.

- [ ] **Step 2: Chạy đỏ** — «sticker nhan chiDocChu» (nhận không có gì hay câu khác).
- [ ] **Step 3: Cài** câu mới và nhánh trong `khongMa`.
- [ ] **Step 4: Chạy xanh**; chạy lại `hoi-crm-qua-zalo.integration.spec.ts -t 'luat-cu|cung-phien'`.
- [ ] **Step 5: Commit** — `feat(hoan-thien-hoi-crm-qua-zalo): tin không chữ nhận một câu báo`.
- [ ] **Step 6: Phá-thử** — bỏ nhánh → đỏ «sticker khong mo phien»; chèn `if (eventName !== "message.text.received") return` ở `nhanWebhook` → đỏ «sticker nhan chiDocChu».

### Task 4: Số tiền không bị che (AC-6)

**Files:**
- Modify: `apps/agent/agent/lib/zalo-loc.ts` (thêm `SO_TIEN`, đổi `che`)
- Modify: `apps/agent/test/zalo-loc.spec.ts` (ca `so-tien`)

**Verify:** `bun run test -- "cd apps/agent && bun test test/zalo-loc.spec.ts -t \"loc-che|so-tien\""` · phục vụ E6 · `independent: true`

- [ ] **Step 1: Test đỏ**:

```ts
const SO_TIEN = [
	"1.000.000.000.000 đ", "1,000,000,000,000 VND", "2.500.000.000.000",
	"12.345.678.901.234 đ", "Doanh thu 3.200.000.000.000 đ trong quý",
	"1.000.000.000.000,50 đ", "1.000.000.000.000đ",
];
const DIEN_THOAI_LIEN = [
	{ cau: "0912345678,0987654321", so: 2 },
	{ cau: "0912345678 0987654321", so: 2 },
	{ cau: "0912345678-0987654321", so: 2 },
	{ cau: "Hạn 2.000.000 đ, gọi 0912345678", so: 1 },
	{ cau: "Gọi +84 912 345 678", so: 1 },
	{ cau: "Bàn (028) 3823 4567", so: 1 },
];

test("so-tien: so tien lon giu nguyen", () => {
	let dem = 0;
	for (const so of SO_TIEN) {
		const ra = locTraLoi(`Giá trị: ${so}`);
		expect(ra.length).toBe(1);
		expect(ra[0], so).toContain(so);
		expect(ra[0], so).not.toContain(ZALO.hoi.an);
		dem += 1;
	}
	expect(dem).toBe(SO_TIEN.length);
});

test("so-tien: so dien thoai lien sau so khac van bi che", () => {
	let dem = 0;
	for (const { cau, so } of DIEN_THOAI_LIEN) {
		const ra = locTraLoi(cau).join("\n");
		expect(ra.split(ZALO.hoi.an).length - 1, cau).toBe(so);
		expect(ra, cau).not.toMatch(/\d{3}[\s.-]?\d{3}[\s.-]?\d{3,4}/u);
		dem += 1;
	}
	expect(dem).toBe(DIEN_THOAI_LIEN.length);
});
```

Riêng phần tử «Hạn 2.000.000 đ, gọi 0912345678»: khẳng định âm tính dùng `ra.replace("2.000.000", "")` trước khi so regex, vì 2.000.000 là số tiền giữ lại.
- [ ] **Step 2: Chạy đỏ** ở «1.000.000.000.000 đ».
- [ ] **Step 3: Cài**:

```ts
const SO_TIEN = /(?<![\d+])[1-9]\d{0,2}([.,])\d{3}(?:\1\d{3})+(?!\d)/gu;

function cheSo(text: string): string {
	return text.replace(SO_DIEN_THOAI, (khop) => (laSoDienThoai(khop) ? ZALO.hoi.an : khop));
}

function che(text: string): string {
	let ra = "";
	let tu = 0;
	for (const khop of text.matchAll(SO_TIEN)) {
		ra += cheSo(text.slice(tu, khop.index)) + khop[0];
		tu = khop.index + khop[0].length;
	}
	return (ra + cheSo(text.slice(tu))).replace(THU, ZALO.hoi.an);
}
```
- [ ] **Step 4: Chạy xanh** (cả `loc-che` và `loc-cat`).
- [ ] **Step 5: Commit** — `fix(hoan-thien-hoi-crm-qua-zalo): không che nhầm số tiền lớn`.
- [ ] **Step 6: Phá-thử** — trả `che` cũ → đỏ «1.000.000.000.000 đ»; thay bằng nhìn lùi `(?<![\d+]|\d[\s.,-])` → đỏ «0912345678,0987654321».

### Task 5: Siết bài đo ngưỡng (AC-7, Ngoài-8)

**Files:**
- Modify: `apps/agent/test/hoi-crm-qua-zalo-nguong.integration.spec.ts`, `apps/agent/test/support/hoi-nguong-gieo.ts`

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoi-crm-qua-zalo-nguong.integration.spec.ts"` · phục vụ E7 · `independent: false`

- [ ] **Step 1:** Đọc ca `nguong`; thay mọi `db.zaloHoi.create(...)` cho `tu-choi-tran-ngay` và `dang-ban` bằng lời gọi `db.$transaction((tx) => hoiTacTu(tx, tin, userId, luc))` thật: 20 câu trong ngày (đóng từng câu bằng `dongHoi` thành `da-tra-loi` để không vướng `dang-ban`) rồi câu 21 → `tu-choi-tran-ngay`; một câu còn `dang-hoi` rồi câu kế trong hạn → `dang-ban`. Thêm assert đọc chính tệp spec và `hoi-nguong-gieo.ts`: không còn `zaloHoi.create`.
- [ ] **Step 2:** Chạy — bảng mười dòng phải khớp kỳ vọng cũ; lệch thì sửa số trong kỳ vọng CHỈ khi số mới đúng theo đường thật và ghi `fix` vào sổ.
- [ ] **Step 3: Commit** — `test(hoi-crm-qua-zalo): ngưỡng sinh hàng từ chối bằng đường hỏi thật`.
- [ ] **Step 4: Phá-thử** — nâng `ZALO.hoi.tran.ngay` lên 21 trong bản sao → đỏ «tu-choi-tran-ngay 1».

### Task 6: Siết `cai-lenh` và «trả lời muộn» (AC-8, Ngoài-10, 14)

**Files:** Modify `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` (ca `cai-lenh` dòng ~740, ca `dang-ban` «tra loi muon» dòng ~946)

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoi-crm-qua-zalo.integration.spec.ts -t \"cai-lenh|dang-ban\""` · phục vụ E8 · `independent: false`

- [ ] **Step 1:** `cai-lenh`: trước khẳng định «không có số», thêm `const gui = guiMayChu("Z…"); expect(gui.length, "da co tin gui di").toBe(1); expect(gui[0]).toContain(ZALO.hoi.an);`.
- [ ] **Step 2:** «trả lời muộn»: thay `if (cu.loai === "hoi") { … }` bằng `expect(cu.loai, "loai hoi").toBe("hoi"); if (cu.loai !== "hoi") return;` rồi phần còn lại không bọc; log ghim `toContain` đúng một chuỗi (chuỗi mà mã thật in — đọc từ `lib/zalo-tra-loi.ts`).
- [ ] **Step 3:** Chạy xanh; commit — `test(hoi-crm-qua-zalo): cai-lenh chứng có tin gửi, trả lời muộn không bỏ qua`.
- [ ] **Step 4: Phá-thử** — `traLoiVe` return sớm không gửi → đỏ «da co tin gui di»; cho câu thứ hai của ca muộn chạm trần phút → đỏ «loai hoi».

### Task 7: Token và ngữ cảnh rút từ lời gọi `send` (AC-9, Ngoài-11, 12)

**Files:** Modify `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` (hàm `ctxZalo`, `suKien`, các ca `cung-phien`, `duong-chinh`)

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoi-crm-qua-zalo.integration.spec.ts -t \"cung-phien|duong-chinh\""` · phục vụ E9 · `independent: false`

**Interfaces:** Consumes khuôn `phienTuSend` của Task 1 (chép vào tệp này — hai tệp test không import lẫn nhau).

- [ ] **Step 1:** Thêm `phienTuSend(eve, i)` và `tokenTuSend(eve, i) = eve.send[i].continuationToken`; `suKien(ten, data, token, ctx)` nhận token thay vì chatId. Mọi lời gọi `suKien(..., "ZA", ctxZalo(...))` trong `cung-phien` và `duong-chinh` đổi sang `suKien(..., tokenTuSend(eve, i), phienTuSend(eve, i))`. Ca nào không có `eve` (gieo hàng trực tiếp) giữ `ctxZalo` nhưng không thuộc hai describe này.
- [ ] **Step 2:** Ca `input.requested`: `expect(tokenMoi, "token bo dung hoiId").toBe(ZALO.hoi.tienToBo + hang.id)`.
- [ ] **Step 3:** Thêm assert đọc tệp spec: trong khối `cung-phien`/`duong-chinh` không còn chuỗi `continuationToken: \`zalo:chat:` dựng tay.
- [ ] **Step 4:** Chạy xanh; commit — `test(hoi-crm-qua-zalo): sự kiện kênh lấy địa chỉ từ lời gọi send`.
- [ ] **Step 5: Phá-thử** — `canHoiLai` đặt `"bo:x"` → đỏ «token bo dung hoiId».

### Task 8: `luat-cu` ô (c) đọc bước trong DB (AC-10, Ngoài-13)

**Files:** Modify `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` (ca `luat-cu`, dòng ~643)

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoi-crm-qua-zalo.integration.spec.ts -t luat-cu"` · phục vụ E10 · `independent: false`

- [ ] **Step 1:** Ô (c): sau «xong 1», `const buoc = buocCuaMuc(daGui, 1); expect(await buocXongLuc(buoc), "buoc da xong trong DB").not.toBeNull();` (dùng `buocCuaMuc`, `buocXongLuc` của `support/tra-loi-gieo.ts`, gieo tin nhắc bằng `gieoNhac`/`guiNhac`).
- [ ] **Step 2:** Chạy xanh; commit — `test(hoi-crm-qua-zalo): luat-cu đọc bước đã xong trong DB`.
- [ ] **Step 3: Phá-thử** — `xongTheoTinNhac` bỏ ghi `completedAt` (bản sao) → đỏ «buoc da xong trong DB».

### Task 9: Cổng vai đo bằng hành vi ở cả hai lối vào (AC-11, Ngoài-15)

**Files:** Modify `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` (ca `tu-choi-vai` dòng 81–89)

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoi-crm-qua-zalo.integration.spec.ts -t tu-choi-vai"` · phục vụ E11 · `independent: false`

- [ ] **Step 1:** Thay ca grep bằng ma trận 3 × 2: ba người (`gieoVai(..., "member")`, `gieoVai(..., "okr")`, `gieoVai(...)` + `boThanhVien`) × hai lối vào (`repFromCrm(BI_MAT)(request)` với JWT HS256 ký bằng mẫu của `test/kenh-chi-okr.spec.ts`, và `hoi(chatId, userId, now)`). Kỳ vọng: web `principal`/`null`/`null`, Zalo `hoi`/`tu-choi-vai`/`tu-choi-vai`; đếm 6. Bỏ `readFileSync(... "agent/channels/eve.ts")`.
- [ ] **Step 2:** Chạy xanh; commit — `test(hoi-crm-qua-zalo): cổng vai đo bằng hành vi ở web và Zalo`.
- [ ] **Step 3: Phá-thử** — `repFromCrm` bỏ `thanhVienPrincipal` (trả principal cho mọi userId) → đỏ «okr bi tu choi o web».

### Task 10: Tài liệu

**Files:**
- Modify: `docs/agent.md` (đoạn Zalo: chặn ghi nằm trong công cụ qua `assertNotZaloQuestion`, `web_fetch` bọc tĩnh, `zalo-chi-doc` ở `step.started` là lớp ẩn; tin không chữ nhận `chiDocChu`)
- Modify: `docs/plan/lo-trinh-zalo.md` (dòng 3 «đã lên onehub #144»; dòng 4 bỏ «production chưa có `ZALO_*`, chưa db:deploy», ghi lên production 26/09 20:48 qua tự triển khai, thêm vòng `hoan-thien-hoi-crm-qua-zalo`)
- Modify: `_acceptance/hoi-crm-qua-zalo/opportunity.md` (ngưỡng tính từ 26/09 — build API tự `migrate deploy`)
- Modify: `CONTEXT.md` mục Bot Zalo nếu mô tả chỉ-đọc cần câu mới

**Verify:** `bun run lint:slop` và `bun _acceptance/hoi-crm-qua-zalo/rang/tai-lieu.mjs` · `independent: false` (phản ánh Task 1–4)

- [ ] **Step 1:** Sửa bốn tệp. Chạy verify.
- [ ] **Step 2:** Commit — `docs(hoan-thien-hoi-crm-qua-zalo): chặn ghi, lớp ẩn, lộ trình Zalo`.

### Task 11: Cổng năm lệnh

**Verify:** `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` (chạy nền, ghi ra tệp, đọc đuôi) · `independent: false`

- [ ] **Step 1:** Chạy năm lệnh; đỏ thì sửa, ghi `fix` vào sổ nếu đổi hướng.
- [ ] **Step 2:** Đặt contract `status: implemented`, commit.
