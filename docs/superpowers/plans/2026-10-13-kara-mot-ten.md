# Kara một tên (K6a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 118 chuỗi người dùng thấy đang gọi AI bằng tên khác đổi thành «Kara», và một luật máy chặn tên cũ quay lại.

**Architecture:** Chỉ đổi giá trị chữ trong kho chữ `apps/app/lib/messages`, `packages/ui`, và các chuỗi trả về ở `packages/validation`, `apps/api`, `apps/agent`. Danh sách phải đổi là `_acceptance/kara-mot-ten/kiem-ke.json` (đã commit trước mọi sửa mã). Luật quét sống ở `apps/app/test/kara-mot-ten-luat.ts` + `kara-mot-ten.spec.ts`; ghim chữ mới theo bề mặt sống ở `messages-guard.spec.ts`.

**Tech Stack:** Bun test, TypeScript, biome, oxlint slop rules.

**Spec:** `docs/superpowers/specs/2026-10-13-kara-mot-ten-design.md` · hợp đồng `_acceptance/kara-mot-ten/contract.md` · `evals.yaml` · `kiem-ke.json`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Tệp chữ chung chỉ đổi GIÁ TRỊ, không đổi hay xoá tên khoá (cham-tep P1-2).
- Dạng «Kara · <phần>» chỉ ở tên trang cài đặt, nhóm sổ chi phí, tiêu đề nhóm tin nhắc; mọi câu khác gọi «Kara».
- Phạm vi: «Kara · OKR», «Kara · hồ sơ» (en «Kara · records»), «Kara · Tài liệu» (en «Kara · Docs»).
- Giữ nguyên 8 mục `giu` và 7 mục `mien` của kiem-ke.json; mô-đun `agent-builder-*.ts`, `settings-ket-noi.ts` không đụng.
- `kiem-ke.json` không sửa nữa (E15 d).
- Bài kiểm có sẵn: đổi khẳng định, không xoá, không `.skip`/`.only`/`.todo` (E12).
- Test apps/app chạy trần `cd apps/app && bun test …`; apps/agent, apps/api qua `bun run test -- "cd apps/x && bun test …"`.

## Review Focus

1. Hàm chữ có đối số (`(ten) => …`) — đổi chữ mà làm hỏng chỗ chèn đối số; E1–E6 gọi hàm với đối số mẫu và luật soát chuỗi ra.
2. en viết hoa đầu câu «Kara» cạnh mạo từ cũ («the Kara», «Kara's assistant») — E13 chấm, tự soát bằng `rg -n "the Kara|Kara's Kara"` trước commit.
3. Bài DOM tìm nút theo tên cũ (`getByRole('button', {name: /Trợ lý/})`) — chạy trọn E10 sau mỗi bề mặt.
4. Chuỗi en bị bỏ quên khi chỉ vi trúng (hoặc ngược lại) — soát cặp vi/en cùng khoá khi đổi.
5. Chữ «Kara · OKR» lọt vào câu — E13 (4); tự soát `rg -n "Kara · OKR [a-zà-ỹ]" apps/app/lib/messages`.

---

### Task 1: Luật một tên (bài đỏ trước)

**Files:** Create `apps/app/test/kara-mot-ten-luat.ts`, `apps/app/test/kara-mot-ten.spec.ts`
**Evals:** E7, E9 · **independent:** false (Task 4–8 làm nó xanh)

**Interfaces — Produces:**
- `export const CAM_VI: readonly string[]` (13), `CAM_EN: readonly string[]` (3, so chữ thường).
- `export const MO_DUN_VAT: (ten: string) => boolean` — `agent-builder-*`, `settings-ket-noi`.
- `export type MucChu = { tep: string; khoa: string; nn: "vi" | "en"; giaTri: string }`.
- `export type LoiChu = { tep: string; khoa: string; nn: string; cum: string }`.
- `export function soatMotTen(muc: readonly MucChu[], vatDoiDung: ReadonlySet<string>): LoiChu[]` — khoá vật là `"<tệp>#<khoá>"`; mô-đun vật miễn trọn.
- `export function docKiemKe(): KiemKe` — parse zod `_acceptance/kara-mot-ten/kiem-ke.json` (đường suy từ `import.meta.dir`).

- [ ] Step 1: viết `kara-mot-ten-luat.ts` (CAM, zod kiem-ke, `soatMotTen`, `phangKho(locale)` nạp mọi `apps/app/lib/messages/*.ts` như messages-guard và `@crm/ui/lib/messages`).
- [ ] Step 2: viết `kara-mot-ten.spec.ts`: `describe("kmt-luat")` với bốn `it` (a) kho chữ, (b) chữ cứng (quét `*.ts`/`*.tsx` dưới `apps/app/app` trừ `proto`, `apps/app/components`, `apps/api/src`, `apps/agent/agent`, `packages/validation/src`; miễn dòng chứa chuỗi cũ của mục `mien`), (c) 19 mục giả chiều đỏ, (d) VAT_DOI_DUNG = mục `giu`; `describe("kmt-giu")` 6 mục ghim + round-trip `git show 4abc05e07:<tệp>`.
- [ ] Step 3: `cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-luat` → ĐỎ ở (a),(b) liệt đúng các mục `doi`; (c),(d) xanh. `-t kmt-giu` xanh.
- [ ] Step 4: commit `test(kara-mot-ten): luật một tên, đỏ trên chữ cũ`.

### Task 2: Ghim chữ mới theo bề mặt trong messages-guard

**Files:** Modify `apps/app/test/messages-guard.spec.ts` (thêm khối cuối tệp)
**Evals:** E1–E6 · **independent:** false

- [ ] Step 1: thêm `describe("kmt-ban-ghi" | "kmt-tom-tat" | "kmt-soan" | "kmt-cai-dat" | "kmt-tai-lieu" | "kmt-dung-chung")`, mỗi khối đọc `docKiemKe()` lọc `be_mat` + `hanh_dong === "doi"`, assert số mục (17/8/24/25/43/1), rồi với mỗi mục: kho chữ → giá trị hiện tại chứa «Kara» và không trúng CAM; tệp nguồn → chuỗi cũ không còn trong tệp. Ghim riêng: `troLy.tieuDe` = «Kara · OKR», `so.nhom.tro-ly-ai` = «Kara · hồ sơ», `so.nhom.tro-ly-okr` = «Kara · OKR», `roleAssistant` = «Kara», `buoc.agent` chứa «Kara» và «trợ tác», câu hết hạn mức chứa «Kara».
- [ ] Step 2: `cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-` → đỏ ở mọi bề mặt.
- [ ] Step 3: commit `test(kara-mot-ten): ghim chữ Kara theo bề mặt`.

### Task 3: Răng đo của hồ sơ

**Files:** Create `_acceptance/kara-mot-ten/rang/{kiem-ke,bang-chu,bai-cu,khong-go-bai,dot-bien,chup}.mjs`
**Evals:** E8, E10, E11, E12, E14, E15, E16 · **independent:** true

- [ ] `kiem-ke.mjs`: (a) đếm 133/118/8/7 theo bề mặt; (b) round-trip `git show 4abc05e07:<tệp>`; (c) chạy `bun test ./test/kara-mot-ten.spec.ts -t kmt-luat` trên `git worktree` tạm ở 4abc05e07 có `kara-mot-ten-luat.ts` chép vào, mọi lỗi (a) phải có mục kiểm kê; (d) `git log --format=%H -- kiem-ke.json` và commit đầu chạm `apps/**|packages/**` trên `merge-base..HEAD`.
- [ ] `bang-chu.mjs`: ghi `evidence/bang-chu.md` (bề mặt, tệp#khoá, nn, cũ, mới — mới đọc bằng bun eval kho chữ hoặc dòng nguồn).
- [ ] `bai-cu.mjs --app|--may`: `git grep -l` CAM/«tác nhân» trên merge-base trong thư mục test, chạy từng nhóm.
- [ ] `khong-go-bai.mjs`: so số `test(`/`it(`, cấm xoá tệp và `.skip/.only/.todo/test.if(false)`; ghi `evidence/ho-so-bai-doi.md` (tệp bài đổi → hồ sơ đã ký có eval cmd nhắc tệp đó).
- [ ] `dot-bien.mjs`: bảy cặp E8 trên `ban-sao.mjs` của `ca-chap-chon-cach-ly`.
- [ ] `chup.mjs`: theo khuôn `_acceptance/zalo-gui-hong-ghi-ly-do/rang/chup.mjs` (cảnh cây, đăng nhập phiên đo), dòng `E14 …`.
- [ ] commit `test(kara-mot-ten): răng đo`.

### Task 4: Tab bản ghi, CRM, onboarding, trang giới thiệu, dùng chung (17 + 1)

**Files:** `apps/app/lib/messages/{crm,record-sheet,companies,khung-ung-dung,auth,kara-ban-ghi}.ts`, `apps/app/components/landing/product-shot/{company-sheet,product-shot}.tsx`, `packages/ui/src/lib/messages.ts`
**Evals:** E1, E6 · **independent:** true

Chữ mới (vi / en):
- `enrichment.agentResearching`: «Kara đang tra cứu» / «Kara is researching»
- `fields.agentLabel`: «Để Kara điền giúp» / «Let Kara fill this»
- `fields.agentsPickUp`: «Kara sẽ dùng trường này.» / «Kara will pick this up.»
- `fields.createHint`: «Tạo trường động để Kara tra cứu và điền sẵn.» / «Create dynamic fields that Kara can research and pre-fill.»
- `fields.keyHint`: «Tên mà API và Kara gọi. …» / «What the API and Kara call it. …» (giữ phần sau)
- `fields.agentHint` (vi): «Kara đề xuất giá trị kèm nguồn, và không bao giờ ghi đè giá trị của bạn.»
- `fields.emptyHint`: «Để trống thì Kara chỉ dựa vào nhãn và kiểu.» / «Leave it empty and Kara works from the label and type alone.»
- `enrichment.emptyBody`: «… trong lúc Kara tra cứu về họ.» / «… while Kara looks them up.»
- `nav.mobileChat` (en): «Navigation and Kara chats»
- `contact.deleteWarning`: «Ghi chú, hội thoại với Kara và mọi thứ Kara tìm được …» / «Their notes, Kara conversations and everything Kara found …»
- `deal.deleteWarning`: «… ghi chú và hội thoại với Kara đều mất theo. …» / «… notes and Kara conversations go too. …»
- `companies create.description`: «… Kara sẽ tự điền logo, …» / «… Kara fills in the logo, …»
- `auth onboarding.description`: «… website là cách Kara biết bạn bán gì.» / «… the website is how Kara learns what you sell.»
- `auth research.description`: «Cắm Context cho Kara, để Kara tra mọi công ty được thêm vào OneHub Center.» / «Power Kara with Context to research every company added to OneHub Center.»
- `kara-ban-ghi tab.buoc.okr-chi-tro-ly` (en): «Kept the OKR session to Kara · OKR»
- landing `company-sheet.tsx` nhãn tab «Agent» → «Kara»; `product-shot.tsx` aria-label «… open on its Kara tab».
- `roleAssistant`: «Kara» / «Kara».

- [ ] đổi chữ → `cd apps/app && bun test ./test/messages-guard.spec.ts -t "kmt-ban-ghi|kmt-dung-chung"` xanh → commit `feat(kara-mot-ten): tab bản ghi và phần dùng chung gọi Kara`.

### Task 5: Tóm tắt tuần và tin nhắc (8)

**Files:** `apps/app/lib/messages/{okr-toan-canh,nhac-qua-zalo}.ts`, `apps/agent/agent/lib/tin-nhac.ts`, Create `apps/agent/test/kara-mot-ten.spec.ts`
**Evals:** E2, E2b · **independent:** true

- `nhac-qua-zalo troLy.tieuDe`: «Kara · OKR» / «Kara · OKR»; `troLy.dongTomTat`: «Dòng Tóm tắt tuần của Kara» / «Kara's weekly summary line»
- `okr-toan-canh tomTat.tieuDe`: «Tóm tắt tuần của Kara» / «Kara's weekly summary»; `dongNguon`: «Kara tóm tắt từ X lần cập nhật · tuần Y» / «Kara summarised X updates · week of Y»; `chuaCapNhatMoTa`: «Kara tóm tắt sáng hôm sau …» / «Kara summarises the morning after …»
- `tin-nhac.ts TIEU_DE["okr-tom-tat"]`: «Kara · OKR»; `noiDungAi`: «Kara đã chạm trần tháng (…) — tạm nghỉ tới …», «Kara đã dùng 80% trần tháng (…)»
- [ ] viết `apps/agent/test/kara-mot-ten.spec.ts` `describe("kmt-tin-nhac")` (dungTin khuôn `tron`/`slack`, việc `okr-tom-tat`, `ai-tran` 80/100, đối chứng `okr-cap-nhat` → «Cập nhật tuần»; dựng `ViecNhac` theo khuôn có sẵn ở `apps/agent/test/tra-loi-tin-nhac.integration.spec.ts`) → đỏ → đổi chữ → `bun run test -- "cd apps/agent && bun test test/kara-mot-ten.spec.ts -t kmt-tin-nhac"` và `-t kmt-tom-tat` xanh → commit.

### Task 6: Soạn OKR (24)

**Files:** `apps/app/lib/messages/{okr-soan,to-chuc}.ts`, `apps/api/src/okr/okr-config.ts`
**Evals:** E3 · **independent:** true

- `nut.soan`, `soDo.tieuDe`: «Soạn OKR cùng Kara» / «Draft OKRs with Kara» (`soDo.tieuDe` en «Drafting OKRs with Kara»)
- `nut.tamNghi`: «Kara tạm nghỉ tới X» / «Kara is paused until X»; `lyDo.het-tran-thang`, `lyDoLuot.het-tran-thang`: «Kara tạm nghỉ tới đầu tháng sau» / «Kara is paused until next month»
- `hoiThoai.nhan`: «Trò chuyện với Kara» / «Conversation with Kara»; `moDau`: «Kara đang đọc bối cảnh của đơn vị…» / «Kara is reading the unit's context…»; `dangSoan`: «Kara đang soạn…» / «Kara is drafting…»; `khoaKhiSoan`: «Ô soạn mở lại khi Kara trả lời xong.» / «The box reopens when Kara finishes.»; `loi`: «Kara chưa trả lời được» / «Kara did not answer»
- `lyDoHong.*`: «Không nối được tới Kara.» / «Could not reach Kara.»; «Kara không trả lời kịp.» / «Kara did not respond in time.»; «Kara từ chối lượt này.» / «Kara refused this turn.»; «Kara đang gặp lỗi.» / «Kara ran into an error.»
- `thieuBoiCanh`: «… — Kara soạn với ít bối cảnh hơn» / «… — Kara drafts with less context»; `thieuBoiCanhMoTa`: «…; cuộc sau Kara sẽ đọc.»
- `banNhap.rongMoTa`: «Trả lời Kara trong khung trò chuyện; …» / «Answer Kara in the conversation; …»
- `cuoc.tieuDe`: «Cuộc soạn cùng Kara · X» / «Drafting sessions with Kara · X»
- `soDo.maLoai.dich-khong-trong`: «Kara ghi số đích»
- `buoc.agent`: «Kara nhờ một trợ tác làm một phần việc»
- `to-chuc donVi.moTaGoiY`: «Kara đọc mô tả này khi soạn» / «Kara reads this when drafting»
- `okr-config`: «Dòng này thuộc bản nháp cũ — Kara đã nộp bản mới hơn.», «Chưa có khoá model cho Kara · OKR.», «Ô này đã đổi từ lúc Kara đề xuất — tải lại danh sách góp ý.»
- [ ] đổi → `-t kmt-soan` xanh → commit.

### Task 7: Cài đặt (25)

**Files:** `apps/app/lib/messages/{tro-ly-okr,settings}.ts`
**Evals:** E4, E14 · **independent:** true

- `troLy.tieuDe`, `so.troLyOkr`, `so.nhom.tro-ly-okr`: «Kara · OKR» / «Kara · OKR»; `so.nhom.tro-ly-ai`: «Kara · hồ sơ» / «Kara · records»
- `troLy.daLuu`: «Đã lưu Kara · OKR.» / «Kara · OKR saved.»; `troLy.bat`: «Bật Kara» / «Turn on Kara»
- `viec.de-xuat.moTa`: «Người sửa được một Mục tiêu nhờ Kara góp ý …» / «Anyone who can edit an objective can ask Kara for feedback …»; `moTaAn`: «Kara góp ý khi Mục tiêu được lưu; …»
- `viec.tom-tat-tuan.moTaAn`: «Kara tóm tắt sau ngày cập nhật; …»
- `viec.soan.moTa`: «… mở «Soạn OKR cùng Kara» …» / «… opens “Draft OKRs with Kara” …»
- `hop.moTa`: «Kara chỉ chạy cho Mục tiêu …» / «Kara runs only for objectives …»; `hop.moTaAn`: «Kara chạy ở chế độ ẩn cho …»
- `tranMoTa`: «Chạm trần thì Kara tạm nghỉ …» / «At the cap Kara pauses …»
- `sanSangNguon.khoa-rieng`: «Sẵn sàng · khoá riêng của Kara · OKR» / «Ready · Kara · OKR's own key»
- `so.thanh`: «Kara · OKR đã dùng trên trần tháng» / «Kara · OKR spend against the monthly cap»; `so.rongMoTa`: «Trần của Kara · OKR: X.» / «Kara · OKR cap: X.»; `soDo.tieuDe`: «Góp ý của Kara — tháng này» / «Kara feedback — this month»
- `settings chung.moTa`: «OneHub là ai, và Kara nghĩ bằng model nào.» / «Who you are, and the model Kara thinks with.»; `model.tieuDe`: «Kara · hồ sơ» / «Kara · records»; `model.moTa`: «Model Kara dùng để nghĩ, …» / «The model Kara thinks with, …»; `khongVoiToi`: «… Kara vẫn đang chạy X.» / «… Kara is still running X.»; `daLuu`: «Kara sẽ dùng model này từ lượt chạy sau.» / «Kara will use this model from its next session.»; `biGo`: «… — Kara đang chạy model mặc định. …» / «… — Kara is running the default model. …»; `khongDuQuyen` (en): «Only an owner or an admin can change Kara's model.»; `nghienCuu.moTa`: «Nhập khoá API Context để Kara nghiên cứu được mọi công ty …» / «Enter your Context API key so Kara can research every company …»
- [ ] đổi → `-t kmt-cai-dat` xanh → commit.

### Task 8: Kho tài liệu (43)

**Files:** `apps/app/lib/messages/tai-lieu.ts`, `packages/validation/src/{tai-lieu-nguon,tai-lieu-hoi}.ts`, `apps/api/src/tai-lieu/tai-lieu-config.ts`, `apps/agent/agent/lib/{tai-lieu-config,tai-lieu-phien,tai-lieu-hoi-phien}.ts`
**Evals:** E5 · **independent:** true

- «Trợ lý AI»/«trợ lý AI»/«AI assistant»/«the assistant» → «Kara»; «Trợ lý OKR» → «Kara»; «máy soạn»/«Máy soạn»/«the composer»/«Composer» → «Kara»; «bản máy soạn» → «bản Kara soạn» (en «Kara's draft»); «Máy đang soạn» → «Kara đang soạn» (en «Kara is drafting»); «máy không đọc được chữ» → «Kara không đọc được chữ» (en «Kara cannot read its text»).
- `hoi.nhanTraLoi`: «Kara · theo bản đang dùng» / «Kara · from the version in use»; `hetTran`: «Kara tạm dừng vì hết hạn mức tháng.»; agent `title`: «Kara đọc kho», «Kara soạn bản đề xuất»; câu đóng việc «Đã mở phiên Kara đọc kho.», «Không mở được phiên Kara đọc kho.»; `loiGui`: «Chưa soạn được — không mở được phiên Kara soạn.»; `choSoan`: «Đã đọc chữ, chờ Kara soạn.»
- [ ] đổi → `-t kmt-tai-lieu` xanh → commit.

### Task 9: Bài có sẵn khẳng định chữ mới

**Files:** các bài trong danh sách `rang/bai-cu.mjs --app|--may` in ra
**Evals:** E10, E11, E12 · **independent:** false (sau Task 4–8)

- [ ] `node _acceptance/kara-mot-ten/rang/bai-cu.mjs --app` → sửa từng khẳng định chữ cũ sang chữ mới (giữ số `it`) → xanh.
- [ ] `node _acceptance/kara-mot-ten/rang/bai-cu.mjs --may` → tương tự → xanh.
- [ ] `node _acceptance/kara-mot-ten/rang/khong-go-bai.mjs` → 0 vi phạm; commit.

### Task 10: Khép

**Files:** `docs/ai-ux.md` (thêm dòng `kara-mot-ten` vào bảng «Lộ trình áp luật»)
**Evals:** E7, E15, E16 · **independent:** false

- [ ] `-t kmt-luat` xanh trọn; `kiem-ke.mjs`, `bang-chu.mjs`, `dot-bien.mjs` xanh.
- [ ] `bun run check-types && bun run lint && bun run lint:slop && bun run test && bun run build`.
- [ ] commit; contract `status: implemented`.
