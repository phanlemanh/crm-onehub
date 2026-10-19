# Câu Zalo thứ hai vẫn có chỉ dẫn kho — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (thi công tuần tự trong phiên chính). Steps dùng `- [ ]`.

**Goal:** Câu Zalo thứ hai, thứ ba trong ngày được gắn vào phiên gốc ở `turn.started`, nên phiên con `tro_ly_kho` nhận
chỉ dẫn kho mang đúng câu đó.

**Architecture:** Hook `apps/agent/agent/hooks/lien-ket-hoi.ts` nghe thêm `turn.started`, gọi `lienKetPhienGoc(ctx)`
như `session.started`. `lib/tai-lieu-lien-ket.ts` không đổi. Bằng chứng: một tệp bài kiểm Postgres mới cho AC-1–AC-4, một
eval eve thật cho AC-5 cùng bộ so lượt đo trong `rang/`.

**Tech Stack:** Bun test + Postgres `_test`, eve hooks/dynamic instructions, `eve eval` qua `mot-luot.sh` trên kho đo.

**Spec:** `design.md` · `contract.md` · `evals.yaml` (cùng thư mục).

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Hằng điều chỉnh được vào một config theo khu: ngưỡng và trần của lượt đo ở `rang/nguong.json`; hằng của eval trong
  một object `as const` đầu tệp eval, như `evals/tro-ly-kho/cham-bo-do.eval.ts`.
- Không chạm `apps/agent/agent/channels/**` (luật 21 của đợt), không chạm bài kiểm của l6.
- Phân tích ở biên bằng Zod: dòng `ket-qua.jsonl` đọc qua một schema duy nhất ở `rang/khuon.ts`.
- Lượt đo chỉ chạy trên kho `crm_<cây>_do` (`KHO_DO` như `cham-bo-do.ts`); từ chối kho khác.
- Ngưỡng Hỏi-2 đã duyệt: câu lỗi gọi model ≤ 1, trần 2 USD mỗi lượt đo, quá trần không chạy lại tự động.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, thông điệp đỏ ghim (MEASURE-BIRTH-CLAUSE).

## Review Focus

- Ngữ cảnh `turn.started` thật có `auth.current` mà KHÔNG có `initiator` khớp — hook phải đọc `current` trước (E1 ca
  thiếu current là chiều đỏ; ca chính đặt initiator = câu đầu).
- `moPhien` thắng cuộc đua — hook vẫn in dòng (E1 ca `mophien-truoc`).
- Câu đầu chạy hook hai lần — không ghi đè, không đổi hàng khác (E2).
- Câu hai mà hàng `TaiLieuHoi` câu đầu đã `TRA_LOI` — bộ nạp không được trả câu đầu (E4 khẳng định không chứa mã câu
  đầu).
- Lượt đo có câu lỗi model — không lẫn với câu nhận chỉ dẫn dừng (E5 tách hai đếm).

---

### Task 1: Hook nghe `turn.started` (E1, E2, E3)

independent: false

**Files:**
- Modify: `apps/agent/agent/hooks/lien-ket-hoi.ts`
- Create: `apps/agent/test/zch-cau-thu-hai.integration.spec.ts`

**Interfaces:**
- Produces: `lienKetHoi.events["turn.started"]: (event, ctx) => Promise<void>` cùng chữ ký với `"session.started"`.
- Consumes: `hoiTacTu`, `dongHoi` (`lib/zalo-hoi.ts`), `moPhien` (`lib/zalo-tra-loi.ts`), `guiHoiKho`
  (`lib/tai-lieu-hoi-phien.ts`), `lienKetPhienGoc` (`lib/tai-lieu-lien-ket.ts`), `gieoNguoi`, `ma`, `donTroLyKho`
  (`test/support/tro-ly-kho-gia.ts`), `TaiLieuHoiService` như `zkd-lien-ket`.

- [ ] **Step 1: Viết bài kiểm (đỏ trên cây hiện tại).** `describe("zch-lien-ket")`, các ca:
  - `zch-lien-ket: cau-hai` — một người, một `chatId`, `hoiTacTu` câu đầu → hook `session.started` gắn `goc`; `dongHoi`
    câu đầu `{ketQua:"da-tra-loi"}`; `hoiTacTu` câu hai cùng chat cùng ngày → `expect(y2.continuationToken).toBe(y1.continuationToken)`;
    `expect(typeof events["turn.started"], "hook thieu turn.started").toBe("function")`; ngữ cảnh
    `{session:{id:goc, auth:{current:{attributes:y2.auth.attributes}, initiator:{attributes:y1.auth.attributes}}}}`;
    sau hook `sessionId` câu hai = `goc`, câu đầu `toEqual` ảnh chụp trước, đúng một dòng
    `${LK.dong} zalo ${y2.hoiId} -> ${goc}`; `moPhien(y2, {hoi: async () => ({id: goc}), …})` → đếm
    `zaloHoi.count({where:{sessionId:goc}})` = 2.
  - `zch-lien-ket: cau-ba` — như trên thêm câu ba, đếm = 3.
  - `zch-lien-ket: mophien-truoc` — câu hai: `moPhien` trước (deps.hoi trả `goc`, không gọi hook), rồi hook
    `turn.started` → hàng `toEqual` ảnh sau `moPhien`, đúng một dòng info.
  - `zch-lien-ket: cau-hai chieu do` — câu hai, ngữ cảnh `current: null`, initiator = câu đầu → `sessionId` câu hai vẫn
    `null` (`expect(…, "doc hoiId cua cau dau").toBeNull()`), câu đầu không đổi.
  - `zch-lien-ket: mot-dong-zalo` — câu đầu: `session.started` rồi `turn.started` cùng ngữ cảnh → ảnh bảng ZaloHoi sau
    lần hai `toEqual` sau lần một, đếm hàng có `sessionId = goc` = 1.
  - `zch-lien-ket: mot-dong-kho` — `TaiLieuHoiService.hoi` tạo câu CRM; `guiHoiKho(hoiId, send)` với send giả chạy hai
    sự kiện bằng `auth.attributes` nhận được, trả `{id: goc}` → `phienId = goc`, ảnh sau lần hai bằng sau lần một,
    promise resolve, `trangThai = DANG_HOI`.
  - `zch-lien-ket: mot-dong chieu do` — hook lần hai với `hoiId` của hàng đã gắn phiên khác → không đổi, không dòng
    info mới, thông điệp ghim «ghi de phien khac».
  - `zch-lien-ket: bang-khong-doi` — bảng ca viết trước (purpose `okr`, `builder`, `may-soan`, `team-agent`,
    `research`, vắng × hoiId hợp lệ; zalo thiếu hoiId; zalo hàng đã gắn phiên khác; zalo hàng `da-tra-loi`; kho hàng có
    `phienId` thật), mỗi ca chụp hai bảng trước/sau `toEqual`, 0 dòng `[lien-ket-hoi]`,
    `expect(daChay).toBe(BANG.length)`.
  - `zch-lien-ket: loi-db` — gọi thẳng `lienKetPhienGoc(ctxCauHai, {db: dbNem})` (hook không nhận deps) với ngữ
    cảnh `turn.started` của câu hai và db ném → promise resolve, `console.warn` đúng một lần với `LK.canhBao`.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `cd apps/agent && bun test test/zch-cau-thu-hai.integration.spec.ts -t zch-lien-ket`
  → FAIL ở «hook thieu turn.started».
- [ ] **Step 3: Thêm `async "turn.started"(_event, ctx) { await lienKetPhienGoc(ctx); }` vào `defineHook` của
  `hooks/lien-ket-hoi.ts`.**
- [ ] **Step 4: Chạy lại** lệnh `config:executors.test.zch_lien_ket` → PASS; chạy cả `zkd_lien_ket`, `zkd_chi_dan` → PASS.
- [ ] **Step 5: Commit** hai tệp.

### Task 2: Phiên con nhận đúng câu hai (E4)

independent: false (cùng tệp bài kiểm, dùng hook Task 1)

**Files:**
- Modify: `apps/agent/test/zch-cau-thu-hai.integration.spec.ts` (thêm `describe("zch-chi-dan")`)

**Interfaces:**
- Consumes: `loiDan.events["session.started"]` (`subagents/tro_ly_kho/instructions.ts`), `ctxBatDauThat`
  (`test/support/tro-ly-kho-gia.ts`), `ghiKetQuaHoi` (`@crm/db/tai-lieu-hoi`), hook Task 1.

- [ ] **Step 1: Viết ca** `zch-chi-dan: cau-hai`: câu đầu đi trọn (hook gắn, bộ giải phiên con trả mã `t1`, đóng
  `ZaloHoi` `da-tra-loi` và `TaiLieuHoi` `t1` `TRA_LOI` qua `ghiKetQuaHoi`); câu hai `hoiTacTu` + hook `turn.started`;
  bộ giải phiên con mới → `t2 = taiLieuHoi.findUnique({where:{zaloHoiId:y2.hoiId}})`, markdown chứa
  `Question id: ${t2.id}`, không chứa `t1`, `ms < HOI.timHoi.cachMs`.
- [ ] **Step 2: Viết ca** `zch-chi-dan: cau-hai chieu do`: như trên nhưng không chạy hook ở câu hai, ghi `sessionId`
  sau `soLan × cachMs` → markdown = `HOI.dungLai.chiDan`, thông điệp ghim «chi dan dung o cau hai».
- [ ] **Step 3: Chạy** `config:executors.test.zch_chi_dan` → PASS (Task 1 đã có hook). Đối chứng: tạm bỏ dòng
  `turn.started` trong bản sao cây (`git stash create`, không sửa cây chính) → ca `cau-hai` đỏ.
- [ ] **Step 4: Commit.**

### Task 3: Bộ so lượt đo (E5)

independent: true

**Files:**
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/khuon.ts` — `dongKetQua` (Zod) và `type DongKetQua`:
  `{nguoi: string, thuTu: 1|2|3, maCau: string, zaloHoiId: string|null, sessionId: string|null, ketQua: string|null,
  tlhId: string|null, tlhZaloHoiId: string|null, tlhTrangThai: string|null, tlhLyDo: string|null, daGuiZalo: boolean,
  loi: string|null}`; `docKetQua(chu: string): DongKetQua[]`.
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/chuoi.json` — `{bamBoMau, chuoi: [{nguoi, cau: [maCau×3]}]×8}`
  từ 24 câu đầu theo mã của tầng S1, S2, S7 trong `bo-mau.json`.
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/nguong.json` — `{loiModelToiDa: 1, tranUsd: 2}`.
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts` — `soDo(thuMuc: string): {loi: string[]}`; CLI đọc
  `evidence/` của hồ sơ, in từng lỗi, exit 1 khi có lỗi; `--tu-do` chạy bảy ca đỏ trên bản sao trong `mkdtemp`.
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/bang-chung.ts` — `ghiBangChung(thuMuc: string, v: {ketQua: DongKetQua[],
  eveLog: string, chiPhiUsd: number}): void` ghi bốn tệp bằng chứng và dòng băm; Task 4 ghi bằng chính hàm này.
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.test.ts` — dựng thư mục bằng chứng lành từ `chuoi.json`
  qua `ghiBangChung`, khẳng định `soDo` → `[]`; bảy ca đỏ khẳng định thông điệp ghim.

**Interfaces:**
- Produces: `dongKetQua`, `docKetQua`, `ghiBangChung`, `soDo`; tên tệp bằng chứng `ket-qua.jsonl`, `eve.log`, `eve-log.txt`
  (`<sha256>  <tên>` mỗi dòng), `do.md` (dòng `chi phi usd: <số>`).

- [ ] **Step 1: Viết `so-do.test.ts`** với bảy ca đỏ của E5 (thông điệp: mã zaloHoi, «sai cho», «khac phien»,
  «lech cau», «thieu cau», «bam eve.log», «qua tran loi model») và một ca «qua tran chi».
- [ ] **Step 2: Chạy, xác nhận đỏ** (`bun test _acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.test.ts`).
- [ ] **Step 3: Viết `khuon.ts`, `bang-chung.ts`, `chuoi.json`, `nguong.json`, `so-do.ts`.** Đường suy từ `import.meta.dir`, không
  hardcode gốc. Băm `bo-mau.json` khớp `chuoi.json.bamBoMau`.
- [ ] **Step 4: Chạy lại → PASS.** Commit.

### Task 4: Eval eve thật ba câu liên tiếp + lệnh chạy

independent: false (dùng khuôn Task 3)

**Files:**
- Create: `apps/agent/evals/tro-ly-kho/cau-thu-hai.eval.ts` — `defineEval`, bỏ qua khi `DATABASE_URL` không phải kho
  đo hoặc thiếu biến `ZCH_KE_HOACH`, `ZCH_KET_QUA`; mỗi chuỗi: gửi ba tin qua `ZALO.webhook.duong` tuần tự, chờ câu trước
  ra khỏi `dang-hoi` (tối đa `4 * MINUTE_MS`) rồi gửi câu sau; ghi một dòng `DongKetQua` mỗi câu. Tám chuỗi chạy song
  song.
- Create: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts` — gieo trang mẫu (như `cham-bo-do.ts`: `gieoNguoi`,
  `trangDaDuyet`), tám người nối Zalo, kế hoạch từ `chuoi.json`, đọc chi phí Gateway trước/sau bằng
  `scripts/lan-do/chi-phi-gateway.mjs`, chạy `eve eval evals/tro-ly-kho/cau-thu-hai.eval.ts` trong `apps/agent`, chép
  bằng chứng vào `evidence/` qua `ghiBangChung` của Task 3.
  Lệnh: `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts"`.

- [ ] **Step 1: Viết hai tệp.**
- [ ] **Step 2: Chạy thử khô** `bun _acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts --kho` (không gọi eve) → in kế
  hoạch 24 câu, từ chối khi `DATABASE_URL` không phải kho đo.
- [ ] **Step 3: Commit.**

### Task 5: Lượt đo và năm lệnh của kho

independent: false (cuối)

- [ ] **Step 1: Chạy lượt đo** bằng lệnh của Task 4 (nền, bọc `giu-nhip.mjs` nếu đang giữ khoá đợt). Quá trần 2 USD
  hay hơn 1 câu lỗi model → dừng, báo, không chạy lại tự động.
- [ ] **Step 2: `bun _acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts`** → exit 0. Commit `evidence/`.
- [ ] **Step 3: Năm lệnh từ gốc kho:** `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`,
  `bun run build` → xanh.
- [ ] **Step 4:** Hợp đồng `status: implemented`, sang S4.
