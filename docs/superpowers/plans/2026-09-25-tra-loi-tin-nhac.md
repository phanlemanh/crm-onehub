# Trả lời tin nhắc bằng chữ — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người nhận tin nhắc qua Zalo gõ «xong 2» thì bước mục 2 của tin hôm nay được đánh dấu xong bằng thủ tục ghi dùng chung với màn kế hoạch, bot xác nhận một dòng.

**Architecture:** Bốn lớp — `datBuocXong` trong `@crm/db/onboarding-buoc` (API và tác tử cùng gọi), `docLenh` (hàm thuần), `xongTheoTinNhac` (kiểm và làm, trong giao dịch của `ZaloUpdateSeen`), và một nhánh mới trong `xuLyDb` của `zalo-nhan.ts`. Tin nhắc Zalo đánh số dòng.

**Tech Stack:** Bun 1.3.12, TypeScript, Prisma, Zod, NestJS (API), eve (tác tử), `bun:test` với DB thật theo lượt (`bun run test`).

**Spec:** `docs/superpowers/specs/2026-09-25-tra-loi-tin-nhac-design.md` · hợp đồng `_acceptance/tra-loi-tin-nhac/contract.md` · evals `_acceptance/tra-loi-tin-nhac/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng số chỉnh được nằm trong module config của khu: câu trả lời và mốc trong `ZALO.loi`/`ZALO.lenh` của `apps/agent/agent/lib/zalo-config.ts`.
- Không tệp nào dưới `apps/agent/agent/` import từ `apps/api` (AC-11).
- Mọi hàng tin nhắc trong test dựng bằng `lenLichNhac` + `chayNhac` thật; đọc `payload` bằng `parseNhacPayload` (contract, Context).
- «Hôm nay» = `ngayVN(now)` của `@crm/db/onboarding-nhac`.
- Nội dung tin không vào DB, không vào log (AC-12).
- Năm spec Zalo đã ký không được sửa: `nhac-qua-zalo`, `nhac-ke-hoach`, `zalo-qua-webhook`, `noi-zalo-cho-nguoi-moi`, `zalo-webhook-doc-khuon-that` (`*.integration.spec.ts`).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, phá vật trong bản sao thì đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE). Ghi mỗi lượt phá-thử vào `_acceptance/tra-loi-tin-nhac/pha-thu.md`; phá-thử làm trên bản đã commit, khôi phục bằng `git checkout -- <tệp>` chỉ sau khi đã commit (bộ nhớ «phá-thử tại chỗ mất thay đổi»).
- Lệnh chạy test agent/api dùng dạng của `_acceptance/config.yaml` (`bun run test -- "cd apps/agent && bun test test/<tệp> -t <tên>"`).

## Review Focus

1. Tin «xong 2» tới đúng lúc `chayNhac` đang ghi `daGui` (hàng chưa có `kenh`) → phải trả «chưa có tin nhắc», không ném. Test: ca (d) của E8 dựng hàng bằng `lenLichNhac` mà chưa `chayNhac`.
2. Số rất lớn (`xong 99999999999999999999`) hay nhiều hơn 20 số → `docLenh` không ném mà trả `null` (tin rơi về câu mặc định); số lớn vừa phải (`xong 999`) trả `{so:[999]}` và lớp 3 báo ngoài dải. Ba ô biên nằm trong `test("doc-lenh: bien")`, ngoài 14 ô của E4.
3. Người nhắn có tin nhắc hôm nay mà bước mục n thuộc kế hoạch người khác đã đóng giữa chừng → AC-6(c), Task 4.
4. Khoảng trắng Unicode (NBSP) và dấu phẩy toàn góc trong tin gõ từ điện thoại → `docLenh` chuẩn hoá `\s` và ` `; test ô 17 `xong 1`.
5. Câu xác nhận dài vượt `ZALO.tranKyTu` khi 10 mục tên dài → cắt bằng cùng trần, test ở Task 4 (`xong 1 2 3 4 5 6 7 8 9 10` trên fixture mười hai việc tên dài) — độ dài ≤ `ZALO.tranKyTu`.

---

### Task 1: Thủ tục ghi dùng chung `datBuocXong` (independent: true)

Phục vụ E13 (lõi dùng chung giữ hành vi API), nền của E2, E7, E12.

**Files:**
- Create: `packages/db/src/onboarding-buoc.ts`
- Modify: `packages/db/package.json` (exports `./onboarding-buoc`)
- Modify: `packages/validation/src/onboarding-activity.ts` (`buoc.xong` thêm `source: z.literal("zalo").optional()`)
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` (`setStepDone`, `ghiVet` giữ nguyên chữ ký)
- Test: `apps/api/test/tra-loi-tin-nhac.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export type VetBuocXong = {
    xong: (b: { stepId: string; nhan: string; giaoLucXong: string | null }) => Prisma.InputJsonValue;
    boXong: (b: { stepId: string; nhan: string }) => Prisma.InputJsonValue;
    coCongTy: (meta: Prisma.InputJsonValue) => boolean;
  };
  export type KetBuocXong =
    | { ket: "da-doi"; buoc: HangBuocXong }
    | { ket: "khong-doi"; buoc: HangBuocXong }
    | { ket: "khong-co-buoc" }
    | { ket: "ke-hoach-dong"; buoc: HangBuocXong };
  export type HangBuocXong = { id: string; planId: string; label: string; assigneeId: string | null; completedAt: Date | null; companyName: string };
  export async function datBuocXong(
    tx: DbGhi,
    input: { stepId: string; done: boolean; nguoiId: string; now: Date },
    vet: VetBuocXong,
  ): Promise<KetBuocXong>
  ```
  `DbGhi` lấy từ `@crm/db/zalo-lien-ket` (cùng kiểu `Db | TransactionClient`).

- [ ] **Step 1: Test đỏ ở API** — `apps/api/test/tra-loi-tin-nhac.spec.ts`, bốn ô `chua-xong`, `da-xong`, `khong-co`, `dong`, cùng một `describe("loi-chung-api")`, dùng seeding của `apps/api/test/support/ke-hoach-gieo.ts`. Ô `chua-xong` thêm `spyOn(ob, "datBuocXong")` với `import * as ob from "@crm/db/onboarding-buoc"` và kỳ vọng gọi đúng 1 lần; kỳ vọng `Object.keys(meta)` không chứa `"source"`.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/tra-loi-tin-nhac.spec.ts"` → FAIL (module `@crm/db/onboarding-buoc` không có).
- [ ] **Step 3: Viết lõi.** `datBuocXong`: `findUnique` bước (select `id, planId, label, assigneeId, completedAt, plan: { select: { closedAt, companyId, company: { select: { name } } } }`); không có → `khong-co-buoc`; `plan.closedAt` khác null → `ke-hoach-dong`; `(completedAt !== null) === done` → `khong-doi`; còn lại `update completedAt = done ? now : null` rồi `activity.create({ type: "PLAN_CHANGE", occurredAt: now, planId, companyId: vet.coCongTy(meta) ? companyId : null, createdById: nguoiId, meta })` với `meta = done ? vet.xong({ stepId, nhan: label, giaoLucXong: assigneeId }) : vet.boXong({ stepId, nhan: label })`; trả `da-doi`.
- [ ] **Step 4: API gọi lõi.** `setStepDone` trong `$transaction`: gọi `datBuocXong(tx, { ...input, nguoiId: actingUserId, now: new Date() }, VET_API)` với `VET_API = { xong: vet.buocXong, boXong: vet.buocBoXong, coCongTy: vetCoCongTy }`; `khong-co-buoc` → `NotFoundException(ONBOARDING.thongDiep.khongCoBuoc(stepId))`; `ke-hoach-dong` → `ConflictException(ONBOARDING.thongDiep.keHoachDaDong)`; hai ca còn lại đọc lại bằng `CHON_BUOC` và trả `buocRa`.
- [ ] **Step 5: Schema.** `buoc.xong` thêm `source: z.literal("zalo").optional()`.
- [ ] **Step 6: Chạy** `bun run test -- "cd apps/api && bun test test/tra-loi-tin-nhac.spec.ts test/ke-hoach-ban-ghi.spec.ts test/moi-phia-ke-hoach.spec.ts"` → PASS; `bun run check-types` → 0.
- [ ] **Step 7: Commit** `feat(tra-loi-tin-nhac): thủ tục đánh dấu bước xong dùng chung ở @crm/db`.
- [ ] **Step 8: Phá-thử E13** trên cây đã commit: cho `setStepDone` giữ bản cũ (không gọi lõi) → ô spy đỏ với «setStepDone di qua datBuocXong»; khôi phục; ghi `pha-thu.md`.

### Task 2: Đọc lệnh `docLenh` (independent: true)

Phục vụ E4.

**Files:**
- Create: `apps/agent/agent/lib/zalo-lenh.ts`
- Modify: `apps/agent/agent/lib/zalo-config.ts` (`ZALO.lenh = { tu: ["xong", "done"], toiDaSo: 20 }`)
- Test: `apps/agent/test/zalo-lenh.spec.ts`

**Interfaces:**
- Produces: `export type Lenh = { lenh: "xong"; so: number[] } | { lenh: "xong-thieu-so" }; export function docLenh(text: string): Lenh | null` — `so` tăng dần, không trùng.

- [ ] **Step 1: Test đỏ** — bảng 14 ô của E4 trong `test("doc-lenh: bang 14 o", …)` (dùng `test.each` hoặc vòng lặp có tên ô trong thông điệp), cộng ba ô Review Focus (số rất lớn → `{lenh:"xong", so:[…]}` không ném và giữ số dạng `Number` vượt dải an toàn thì trả `null`; 25 số → `null`; `xong 1` → `{so:[1]}`) trong `test("doc-lenh: bien", …)`.
- [ ] **Step 2: Chạy** `cd apps/agent && bun test test/zalo-lenh.spec.ts -t doc-lenh` → FAIL.
- [ ] **Step 3: Viết** — chuẩn hoá ` `→space, trim, lower-case; khớp `^(xong|done)(?:\s+(.*))?$`; phần sau rỗng → `xong-thieu-so`; tách theo `[\s,]+`, mỗi mảnh phải khớp `^[1-9]\d*$` và `Number.isSafeInteger`, số mảnh ≤ `ZALO.lenh.toiDaSo`, sai một mảnh → `null`; dedupe + sort.
- [ ] **Step 4: Chạy** → PASS.
- [ ] **Step 5: Commit** `feat(tra-loi-tin-nhac): đọc lệnh xong`.
- [ ] **Step 6: Phá-thử E4**: regex nhận `0` → ô «xong 0» đỏ; khôi phục; ghi `pha-thu.md`.

### Task 3: Tin nhắc Zalo đánh số (independent: true)

Phục vụ E1.

**Files:**
- Modify: `apps/agent/agent/lib/tin-nhac.ts` (khuôn `tron`: `n. ` thay `• `, dòng gợi ý cuối)
- Modify: `apps/agent/agent/lib/zalo-config.ts` (`ZALO.loi.goiY: 'Trả lời "xong 2" để đánh dấu mục 2 xong.'`)
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (truyền `goiY` vào `dungTin` cho Zalo)
- Test: `apps/agent/test/tra-loi-tin-nhac.integration.spec.ts` (`describe("danh-so")`), `apps/agent/test/support/tra-loi-gieo.ts`

**Interfaces:**
- Produces: `dungTin(ten, viec, lienKet, khuon = "slack", tranKyTu = Infinity, cuoi: string | null = null)` — `cuoi` là dòng thêm cuối tin, tính vào trần. Số thứ tự tính trên `daGui` (chỉ số trong mảng sau cắt + 1), vẽ theo nhóm như cũ.
- Produces (support): `gieoBonLoai(ten?: string)` trả `{ A, goc, ke: { quaHan, sapHan, im, moc } }` — bốn kế hoạch cho A: bước quá hạn giao A; bước sắp hạn giao A; kế hoạch im (A cầm trịch, `imTu = goc - NHAC.imSauNgay`); kế hoạch mốc ngày (`batDau` sao cho `soNgayVN(batDau, goc) + 1 === NHAC.moc[0]`). `guiQuaZaloHomNay(A.id, zaloUserId, goc, { appUrl })` gọi `noiZalo`, `batBot`, `lenLichNhac(goc)`, `chayNhac(hang, { zaloFetcher, appUrl })` với `voiToken` và trả `{ daGui, text, z }` (đọc `daGui` bằng `parseNhacPayload`).

- [ ] **Step 1: Test đỏ** ba ô E1 (`zalo-bon`, `zalo-muoi-hai`, `slack`), đếm ô trong test.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/agent && bun test test/tra-loi-tin-nhac.integration.spec.ts -t danh-so"` → FAIL.
- [ ] **Step 3: Viết** — trong `ve(daGui)`, chỉ số lấy từ `daGui.indexOf(v) + 1` cho khuôn `tron`; `cuoi` nối sau dòng «và N việc nữa».
- [ ] **Step 4: Chạy** E1 → PASS; chạy `nhac-qua-zalo.integration.spec.ts` và `nhac-ke-hoach.integration.spec.ts` → PASS.
- [ ] **Step 5: Commit** `feat(tra-loi-tin-nhac): tin nhắc Zalo đánh số dòng`.
- [ ] **Step 6: Phá-thử E1**: đánh số theo `LOAI_NHAC` đảo → «dong n thuoc daGui[n-1]» đỏ; bỏ `cuoi` khỏi phép tính trần → «khong vuot tran» đỏ; khôi phục; ghi `pha-thu.md`.

### Task 4: Kiểm và làm theo tin nhắc, định tuyến trong `zalo-nhan.ts` (independent: false — cần Task 1–3)

Phục vụ E2, E3, E5, E6, E7, E8, E9, E10, E12, E15.

**Files:**
- Create: `apps/agent/agent/lib/tra-loi-nhac.ts`
- Modify: `apps/agent/agent/lib/zalo-nhan.ts` (nhánh lệnh sau nhánh mã; câu mặc định thêm dòng gợi ý)
- Modify: `apps/agent/agent/lib/zalo-config.ts` (câu trả lời mới trong `ZALO.loi`)
- Modify: `apps/agent/test/tra-loi-tin-nhac.integration.spec.ts`, `apps/agent/test/support/tra-loi-gieo.ts`

**Interfaces:**
- Consumes: `datBuocXong`, `docLenh`, `gieoBonLoai`, `guiQuaZaloHomNay`.
- Produces:
  ```ts
  export type KetTraLoi =
    | { loai: "khong-quyen" }
    | { loai: "chua-co-tin" }
    | { loai: "ngoai-dai"; sai: number[]; tran: number }
    | { loai: "khong-phai-buoc"; muc: { so: number; loai: LoaiNhac; url: string | null }[] }
    | { loai: "buoc-doi"; muc: { so: number; lyDo: "khong-co-buoc" | "ke-hoach-dong" }[] }
    | { loai: "xong"; vua: { so: number; nhan: string; congTy: string }[]; truoc: { so: number; nhan: string; congTy: string }[] };
  export async function xongTheoTinNhac(
    tx: DbGhi,
    input: { userId: string; so: number[]; now: Date; lienKet: (planId: string) => string | null },
  ): Promise<KetTraLoi>
  export function cauTraLoi(ket: KetTraLoi): string
  ```
  `ZALO.loi` thêm: `khongQuyen`, `chuaCoTin(gio)`, `ngoaiDai(sai, tran)`, `khongPhaiBuoc(...)`, `buocDoi(...)`, `xong(vua, truoc)` với mốc phần sau là hằng `ZALO.loi.mocDaXongTruoc = " — đã xong từ trước: "`, `thieuSo`, `goiY`. `cauTraLoi` luôn một dòng và cắt ở `ZALO.tranKyTu`.

- [ ] **Step 1: Test đỏ**, mỗi `describe` một eval, tên ô theo `-t` của config: `xong-mot` (E2 kèm cross-layer: `new ActivitiesService(db, new ActivityStampService(db)).timeline({ planId, limit: 50 })` đọc qua thư mục API như `support/nhac-gieo.ts` đang làm với `OnboardingGhi`), `nhieu-so` (E3), `ngoai-dai` (E5), `khong-phai-buoc` (E6), `trang-thai-buoc` (E7), `tin-hom-nay` (E8), `nguoi-nhan` (E9), `khong-lenh` (E10), `trung-va-loi` (E12, tiêm lỗi bằng `spyOn` trên `tx.onboardingStep.update` lần 2 thông qua `spyOn(db, "$transaction")` bọc tx), `khong-luu-chu` (E15), cùng ô Review Focus 1 và 5. Mọi tin gửi qua `nhanWebhook(yeuCauWebhook(JSON.stringify(thanWebhook(...)), khoa).request, { fetcher, now: () => luc, env })`.
- [ ] **Step 2: Chạy** từng `-t` → FAIL.
- [ ] **Step 3: Viết `xongTheoTinNhac`** theo sáu bước của design «Luật xử lý (lớp 3)»: `tx.member.findFirst({ where: { userId } })` null hay `toWorkspaceRole(role) === "okr"` → `khong-quyen`; `tx.agentTask.findUnique({ where: { kind_subject? } })` — dùng `findFirst({ where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(userId, now) } })`, `parseNhacPayload`, cần `kenh === "zalo"` và `daGui` khác rỗng; kiểm dải; kiểm `stepId`; gọi `datBuocXong` từng bước với `VET_ZALO = { xong: (b) => vet.buocXong({ ...b, source: "zalo" }), boXong: vet.buocBoXong, coCongTy: vetCoCongTy }`; gặp `khong-co-buoc`/`ke-hoach-dong` thì ném `BuocDoi` (lớp lỗi riêng mang danh sách mục) để giao dịch lùi.
- [ ] **Step 4: Viết định tuyến** trong `xuLyDb`: sau nhánh mã, nếu có `ZaloLink` cho `tin.from.id` và `docLenh(text)` khác null → `thieuSo` hoặc `xongTheoTinNhac`. Bắt `BuocDoi` ở `xuLyTinDen`: chạy lại một giao dịch chỉ ghi `ZaloUpdateSeen` rồi gửi `cauTraLoi({ loai: "buoc-doi", … })`. Câu mặc định cho người đã nối = `daNoiRoi(...) + " " + goiY`.
- [ ] **Step 5: Chạy** mười `-t` → PASS; chạy năm spec đã ký → PASS; `bun run check-types`, `bun run lint`, `bun run lint:slop` → 0.
- [ ] **Step 6: Commit** `feat(tra-loi-tin-nhac): trả lời «xong n» đánh dấu bước theo tin nhắc hôm nay`.
- [ ] **Step 7: Phá-thử** từng chiều đỏ trong `expected` của E2, E3, E5–E10, E12, E15; ghi `pha-thu.md`.

### Task 5: Thước trong `rang/` (independent: false — cần Task 1, 4)

Phục vụ E11, E14, E16, E17.

**Files:**
- Create: `_acceptance/tra-loi-tin-nhac/rang/nguong.ts` (xuất `doNguong(db, { tu, den })` và CLI `--tu --den`, import `@crm/db` qua đường tương đối tới `packages/db/src` như các `rang/` khác)
- Create: `apps/agent/test/tra-loi-tin-nhac-nguong.integration.spec.ts`
- Create: `_acceptance/tra-loi-tin-nhac/rang/khong-import-api.mjs`
- Create: `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs`
- Create: `_acceptance/tra-loi-tin-nhac/rang/tai-lieu.mjs`

- [ ] **Step 1:** `nguong.ts` — hàng `nhac-ke-hoach` có `createdAt` hay `dueAt` trong [tu, den], `parseNhacPayload`, `kenh === "zalo"` là mẫu số; tử số là hàng có ít nhất một `Activity` `PLAN_CHANGE` `meta.kind = "buoc.xong"`, `meta.source = "zalo"`, `createdById` = người của hàng, `ngayVN(occurredAt)` = ngày của subject, `stepId` ∈ `daGui`; dấu vết nguồn Zalo mà `stepId` ∉ `daGui` cùng người cùng ngày là «đánh dấu nhầm». In `ti_le_co_xong: a/b`, `danh_dau_nham: n` và từng id.
- [ ] **Step 2:** test E16 gieo R1/R2/R3 bằng `guiQuaZaloHomNay` và đường Slack thật; tạo dấu vết nhầm bằng `datBuocXong` với `VET_ZALO`; chạy CLI bằng `Bun.spawn` với `DATABASE_URL` của lượt → PASS; phá-thử «mau so chi tin Zalo».
- [ ] **Step 3:** `khong-import-api.mjs` (E14), gốc kho suy từ `import.meta.url`; phá-thử trên bản sao ở `.acceptance-runs/tra-loi-tin-nhac/` (bộ nhớ «bản sao đột biến ở thư mục ẩn»).
- [ ] **Step 4:** `ho-so-cham.mjs` (E11) theo `expected`; gọi `repin-lane.mjs` qua `node scripts/resolve-plugin.mjs --plugin feature-loop --require scripts/repin-lane.mjs`; không `--write`. Chạy thật một lượt, ghi thời gian chạy vào `pha-thu.md`.
- [ ] **Step 5:** `tai-lieu.mjs` (E17) — đọc bản nhánh và bản `merge-base` bằng `git show`; biến `TTN_REF` để chạy chiều đỏ trên `merge-base`.
- [ ] **Step 6: Commit** `test(tra-loi-tin-nhac): thước ngưỡng, không import API, hồ sơ đã ký bị chạm, tài liệu`.

### Task 6: Tài liệu (independent: false — nội dung theo Task 4)

Phục vụ E17.

**Files:**
- Modify: `CONTEXT.md` (mục **Bot Zalo**: thêm «đánh dấu bước xong khi người trả lời `xong` kèm số»; giữ _Avoid_)
- Modify: `docs/agent.md` (mục Nhắc buổi sáng: dòng đánh số và dòng gợi ý; mục Zalo: đoạn «Trả lời tin nhắc» nêu lệnh `xong`/`done`, được cả hoặc không, chỉ tin hôm nay theo giờ VN, `source: "zalo"`, `@crm/db/onboarding-buoc`)
- Modify: `docs/plan/lo-trinh-zalo.md` (mục 7 dòng 3: Trạng thái `đang dựng`, Ngày 2026-09-25, Ghi chú nối thêm «mở sớm theo lời chủ kho 25/09 trước ba điều kiện; Cổng Phạm vi duyệt 25/09»)

- [ ] **Step 1:** sửa ba tệp; chạy `node _acceptance/tra-loi-tin-nhac/rang/tai-lieu.mjs` → exit 0; `TTN_REF=$(git merge-base HEAD origin/onehub) node …` → exit 1 ghim tên mốc.
- [ ] **Step 2: Commit** `docs(tra-loi-tin-nhac): từ điển, tài liệu tác tử, lộ trình Zalo`.

### Task 7: Đóng S3

- [ ] **Step 1:** Chạy năm lệnh chứng của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → mọi lệnh 0.
- [ ] **Step 2:** `pha-thu.md` có một dòng cho mỗi eval máy (E1–E17 trừ E11 là lượt chạy thật) — tên eval, cách phá, thông điệp đỏ đã thấy.
- [ ] **Step 3:** Đặt `status: implemented` trong `contract.md`; commit `chore(tra-loi-tin-nhac): hồ sơ sang implemented`.
