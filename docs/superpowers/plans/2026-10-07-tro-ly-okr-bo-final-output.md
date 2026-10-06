# Trợ lý OKR bỏ `final_output` — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phiên con `tro_ly_okr` thôi khai khuôn kết quả để eve không thêm tool `final_output`; tool nộp tự đóng việc; hook phiên gốc chỉ còn là lưới.

**Architecture:** Kết cục của một việc OKR do bên biết nó trước tiên ghi: tool `nop_de_xuat` / `nop_tom_tat` gọi `dongViecOkr` ngay sau khi ghi hay khi biết không làm được. `completeTask` chỉ ghi khi `finishedAt` còn null, nên hook `okr-uy-quyen` ở phiên gốc chỉ đóng những việc phiên con bỏ dở (`hong:<mã>` hoặc `hong:khong-nop`).

**Tech Stack:** eve 0.29.4, AI SDK 7, Prisma (`@crm/db`), bun test.

**Spec:** `docs/superpowers/specs/2026-10-07-tro-ly-okr-bo-final-output-design.md` · hợp đồng `_acceptance/tro-ly-okr-bo-final-output/contract.md` · bộ đo `_acceptance/tro-ly-okr-bo-final-output/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Mã đóng việc giữ đúng chuỗi hôm nay: `da-nop`, `khong-lam-duoc:<maLoi>`, `hong:<CODE>`, `hong:khong-nop` (`TRO_LY_OKR.ketThuc.khongNop`), `khong-lam-duoc:khong-nop` (`TRO_LY_OKR.ketThuc.tomTatKhongNop`).
- `ketQuaTroLy` của `@crm/validation/okr-tro-ly` giữ nguyên (màn góp ý đọc giá trị `da-nop` từ nó).
- Không đổi model, trần ra, `thinkingLevel`, lease; không đụng `apps/agent-okr`, `@crm/ai-okr`.
- Bài kiểm chạm DB chạy qua `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test …"` (không `bun test` trần — kho chung).
- Phép đo mới phải có cặp hai chiều trên cùng fixture với thông điệp ghim (MEASURE-BIRTH-CLAUSE).

## Review Focus

1. Phiên con nộp xong rồi hỏng ở câu `done` (rỗng, lỗi mạng): việc phải còn `da-nop`, không bị hook ghi đè thành `hong:` — Task 3 ô thứ hai.
2. Tool được gọi khi việc đã đóng vì hết lease: không ghi dòng/bản nào và không đổi kết cục — Task 1 ô 5, Task 2 ô 6.
3. Nộp 0 dòng góp ý là kết quả hợp lệ (`da-nop`), không phải «chưa nộp» — Task 1 ô 2.
4. Gọi nhầm tool của việc kia (góp ý gọi `nop_tom_tat` và ngược lại): không đóng việc, để lưới đóng `hong:khong-nop` — Task 1 ô 7, Task 2 ô 7.
5. Bài kiểm cũ dựa vào «phiên gốc đóng `da-nop` sau khi nộp» (`dongDaNop`): vẫn chạy được khi tool đã tự đóng — Task 1 Step 5.

---

### Task 1: `nop_de_xuat` tự đóng việc (phục vụ E3)

`independent: false` (chung tệp kiểm với Task 2, 3)

**Files:**
- Modify: `apps/agent/agent/lib/okr/nop-de-xuat.ts`
- Modify: `apps/agent/test/support/tro-ly-phien-con.ts` (`dongDaNop`)
- Create: `apps/agent/test/tro-ly-okr-dong-viec.integration.spec.ts` (describe `gop-y`)

**Interfaces:**
- Consumes: `dongViecOkr(taskId, outcome)`, `TRO_LY_OKR.ketThuc` (`lib/okr/viec.ts`, `lib/okr/config.ts`).
- Produces: `nopDeXuatVao` đóng việc; trả `KetQuaNop` như cũ.

- [ ] **Step 1: Viết bài kiểm đỏ.** Tệp mới, `describe("gop-y")`, dựng bằng `moViecDeXuat`, `gieoChuKy`, `gieoMucTieu`, `nguCanhCon` như `tro-ly-okr-nop.integration.spec.ts`. Một bảng `const O_GOP_Y = [...] as const` bảy ô `{ ten, chuan: (v) => Promise<void>, dong: DongGopY[], ketQua, outcome }`: `ghi-2-dong` → `da-ghi`/`da-nop`; `ghi-0-dong` → `da-ghi`/`da-nop`; `muc-tieu-da-xoa` → `thieu-du-lieu`/`khong-lam-duoc:thieu-du-lieu`; `payload-hong` (update payload `{}`) → `tu-choi`/`khong-lam-duoc:khuon-hong`; `viec-da-dong` (`completeTask(id,"hong:het-lease")` trước) → `tu-choi`/`hong:het-lease`; `da-nop-roi` (nộp một lần rồi gọi lại) → `tu-choi`/`da-nop`; `viec-tom-tat` (ngữ cảnh trỏ phiên gốc của một việc `okr-tom-tat-tuan`) → `tu-choi`/`null`. Một hàm `kiemO(ham)` chạy ma trận bằng `ham` và trả danh sách lệch `"tool khong dong viec: <ten>"`; test xanh `expect(await kiemO(nopDeXuatVao)).toEqual([])`, in `so o: 7`; test đỏ: một bản `nopKhongDong` (gọi `nopDeXuatVao` rồi mở lại việc bằng `db.agentTask.update({finishedAt:null,outcome:null})` khi tool vừa đóng) → `toContain("tool khong dong viec: ghi-0-dong")`.
- [ ] **Step 2: Chạy, xác nhận đỏ** — `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-dong-viec.integration.spec.ts -t gop-y"`; kỳ vọng: ô `ghi-2-dong` lệch (finishedAt null).
- [ ] **Step 3: Sửa `nopDeXuatVao`.** Payload hỏng → `await dongViecOkr(hang.id, "khong-lam-duoc:khuon-hong")` rồi trả `khongGhi("tu-choi", …)`; thiếu gói → `dongViecOkr(hang.id, "khong-lam-duoc:thieu-du-lieu")` rồi trả `thieu-du-lieu`; sau `createMany` → `dongViecOkr(hang.id, "da-nop")`. Các nhánh từ chối khác không đóng. Mã `khong-lam-duoc:` dựng từ `MA_LOI_TRO_LY` (`@crm/validation/okr-tro-ly`) qua một hàm `maKhongLamDuoc(ma)` đặt ở `lib/okr/viec.ts`, không chép chuỗi.
- [ ] **Step 4: Chạy lại, xác nhận xanh.**
- [ ] **Step 5: Sửa `dongDaNop`.** `completeTask` trả null thì đọc hàng; outcome `da-nop` là đạt, khác thì ném như cũ. Chạy `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-nop.integration.spec.ts test/tro-ly-okr-duong-do.integration.spec.ts test/tro-ly-okr-nhanh-can-chinh.integration.spec.ts"` — xanh.
- [ ] **Step 6: Commit** `fix(agent): nop_de_xuat tu dong viec voi ket cuc`.

### Task 2: `nop_tom_tat` tự đóng việc (phục vụ E4)

`independent: false`

**Files:**
- Modify: `apps/agent/agent/lib/okr/nop-tom-tat.ts`
- Modify: `apps/agent/test/tro-ly-okr-dong-viec.integration.spec.ts` (describe `tom-tat`)

**Interfaces:** Consumes `dongViecOkr`, `ketThucCuaViec`, `maKhongLamDuoc` (Task 1).

- [ ] **Step 1: Bài kiểm đỏ.** `describe("tom-tat")`, dựng việc tóm tắt như `tro-ly-okr-nop-tom-tat.integration.spec.ts` (đọc tệp đó để lấy hàm gieo). Bảng bảy ô: `co-ban` (một câu hợp lệ trích id có thật) → `da-ghi`/`da-nop`; `moi-cau-bi-bo` → `da-ghi`/`TRO_LY_OKR.ketThuc.tomTatKhongNop`; `phong-luu-tru` → `thieu-du-lieu`/`khong-lam-duoc:thieu-du-lieu`; `payload-hong` → `tu-choi`/`khong-lam-duoc:khuon-hong`; `da-co-ban` → `tu-choi`/`da-nop`; `viec-da-dong` (`hong:het-lease` trước) → `tu-choi`/`hong:het-lease` và `db.okrTomTat.count({where:{taskId}})` = 0; `viec-gop-y` → `tu-choi`/`null`. Cặp đỏ như Task 1 với thông điệp `tool khong dong viec: co-ban`.
- [ ] **Step 2: Chạy, xác nhận đỏ** (`-t tom-tat`).
- [ ] **Step 3: Sửa `nopTomTatVao`.** `viecTomTatCua` null mà `hang.kind` là tóm tắt → `dongViecOkr(hang.id, maKhongLamDuoc("khuon-hong"))`; ghi xong → `dongViecOkr(hang.id, await ketThucCuaViec(hang.id, "da-nop"))`; `PhongKhongTomTatDuoc` → `dongViecOkr(hang.id, maKhongLamDuoc("thieu-du-lieu"))`.
- [ ] **Step 4: Xanh**, rồi chạy `tro-ly-okr-nop-tom-tat.integration.spec.ts` — ca `ket-thuc*` dựa vào khuôn cũ sẽ đỏ, sửa ở Task 3.
- [ ] **Step 5: Commit** `fix(agent): nop_tom_tat tu dong viec voi ket cuc`.

### Task 3: hook phiên gốc thành lưới (phục vụ E5)

`independent: false`

**Files:**
- Modify: `apps/agent/agent/lib/okr/uy-quyen.ts` (`ketThucTuKetQua`)
- Modify: `apps/agent/agent/hooks/okr-uy-quyen.ts`
- Modify: `apps/agent/test/tro-ly-okr-dong-viec.integration.spec.ts` (describe `luoi`)
- Modify: `apps/agent/test/tro-ly-okr-nop.integration.spec.ts`, `tro-ly-okr-nop-tom-tat.integration.spec.ts`, và mọi bài khác dựng `subagent-result` với output `ketQuaTroLy` (`tro-ly-okr-giu-viec`, `tro-ly-okr-viec`, `okr-uy-quyen.spec.ts`).

**Interfaces:** Produces `ketThucTuKetQua(r: KetQuaCon): string | null` — không phải `tro_ly_okr` → null; `isError` → `hong:<code>`; còn lại → `TRO_LY_OKR.ketThuc.khongNop`.

- [ ] **Step 1: Bài kiểm đỏ** `describe("luoi")`: năm ô `{da-dong+khong-loi → da-nop, da-dong+loi SUBAGENT_EXECUTION_FAILED → da-nop, mo+loi MODEL_CALL_FAILED → hong:MODEL_CALL_FAILED, mo+khong-loi (output "done") → TRO_LY_OKR.ketThuc.khongNop, subagent khac → null}`, gọi `hookGoc.events["action.result"]` với `nguCanhGoc`. Cặp đỏ: hàm kết cục cũ (bản chép trong bài, đọc `ketQuaTroLy` từ output) chạy qua cùng ma trận → ô `mo+khong-loi` ra `hong:ket-qua-hong`, ghim `luoi doc khuon ket qua cu`.
- [ ] **Step 2: Đỏ** (`-t luoi`).
- [ ] **Step 3: Sửa** `ketThucTuKetQua` như Interfaces; hook gọi `dongViecOkr(taskId, ketThuc)` thẳng, bỏ `ketThucCuaViec` khỏi hook; bỏ import `ketQuaTroLy` khỏi `uy-quyen.ts`.
- [ ] **Step 4: Xanh**; sửa các bài cũ: ca «phiên con báo khong-lam-duoc:thieu-du-lieu» nay kỳ vọng tool đã đóng trước hook; ca «ket-thuc» tóm tắt nay kiểm việc đóng `da-nop` từ tool và hook không đổi nó; ca «ket-thuc-khong-ban» chuyển sang Task 2 ô `moi-cau-bi-bo`. Chạy `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-nop.integration.spec.ts test/tro-ly-okr-nop-tom-tat.integration.spec.ts test/tro-ly-okr-giu-viec.integration.spec.ts test/tro-ly-okr-viec.integration.spec.ts test/okr-uy-quyen.spec.ts"`.
- [ ] **Step 5: Commit** `fix(agent): hook uy quyen OKR chi con la luoi`.

### Task 4: phiên con bỏ khuôn kết quả, chỉ dẫn kết bằng `done` (phục vụ E1, E2)

`independent: false` (đổi xong Task 1–3 mới an toàn: không còn ai đóng `da-nop` nếu thiếu tool đóng)

**Files:**
- Modify: `apps/agent/agent/subagents/tro_ly_okr/agent.ts` (bỏ `outputSchema`, bỏ import `ketQuaTroLy`)
- Modify: `apps/agent/agent/subagents/tro_ly_okr/instructions.md` (đoạn «Then finish with …» → «Then reply `done`.»)
- Modify: `apps/agent/agent/lib/okr/chi-dan-tom-tat.ts` (đoạn «Then finish. When …» → «Then reply \`done\`.»)
- Create: `apps/agent/test/tro-ly-okr-khong-khuon-ra.spec.ts`
- Modify (nếu đỏ): `apps/agent/test/okr-chi-dan-tom-tat.spec.ts`

- [ ] **Step 1: Bài kiểm đỏ.** Hàm `loiPhienCon(dinhNghia: object): string[]` trả `["phien con khai outputSchema"]` khi `"outputSchema" in dinhNghia`; `loiChiDan(chu: string): string[]` trả `["chi dan doi khuon ket qua"]` khi chữ chứa `trangThai` hay `final_output`, và `["chi dan khong ket bang done"]` khi không có `` `done` ``. Xanh: `loiPhienCon(agentTroLy)` = [], `loiChiDan(readFileSync(instructions.md))` = [], `loiChiDan(MUC_TOM_TAT)` = []. Đỏ: `loiPhienCon(defineAgent({ description: "x", outputSchema: ketQuaTroLy }))` chứa thông điệp ghim; `loiChiDan('finish with {"trangThai":"da-nop"}')` chứa thông điệp ghim.
- [ ] **Step 2: Đỏ** — `cd apps/agent && bun test test/tro-ly-okr-khong-khuon-ra.spec.ts`.
- [ ] **Step 3: Sửa ba tệp.**
- [ ] **Step 4: Xanh**; chạy `cd apps/agent && bun test test/okr-chi-dan-tom-tat.spec.ts test/tro-ly-okr-cach-ly.spec.ts test/khuon-di-dong.spec.ts`, sửa kỳ vọng còn trỏ câu cũ.
- [ ] **Step 5: Commit** `fix(agent): phien con Tro ly OKR khong khai khuon ket qua`.

### Task 5: thước đo model `do-mo-hinh.mjs` (phục vụ E6, E7, E8)

`independent: true`

**Files:**
- Create: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
- Create: `_acceptance/tro-ly-okr-bo-final-output/rang/mau-0710/` (segment OTLP chép nguyên từ trace lượt `repin-20261006T220643Z-23148`, một span `ai.toolCall` gọi `tro_ly_okr` chép rồi thêm khoá `outputSchema` vào `gen_ai.tool.call.arguments`, đoạn `eve.log` thật có dòng «empty model response», một đầu ra mẫu của `do-tre.mjs` có `1 luot hong` và p90 dưới ngưỡng)

- [ ] **Step 1: Bộ đếm thuần** `demCuaSo(thuMuc, tuNs, denNs)` → `{ n_dau, het_tran, final_output, output_schema }` (đọc mọi `*/segments/*.otlp.json`, nối cha–con theo `parentSpanId`, như phép đọc trong chẩn đoán 07/10); `demLog(tep[])` → số dòng «empty model response»; `docLuotHong(chu)` → số trong `/(\d+) luot hong/` hoặc null.
- [ ] **Step 2: Phần `[tu-kiem]`** chạy ba hàm trên `mau-0710` với cửa sổ mở: đòi `het_tran ≥ 1`, `final_output ≥ 1`, `output_schema ≥ 1`, log ≥ 1, `docLuotHong(mẫu) = 1`; ô nào không đạt → in `tu kiem khong bat duoc <ô>`, mã 3.
- [ ] **Step 3: Phần `[e22]`, `[e17]`, `[e24]`** chạy tuần tự bằng `spawnSync` từ gốc kho (suy từ `import.meta.url`), mỗi phần ghi mốc `process.hrtime`/`Date.now()*1e6` đầu và cuối; đếm theo Step 1; ngưỡng theo `evals.yaml` E6–E8; in một dòng mỗi phần; `[e24]` in `os.loadavg()` trước. Mã 0 chỉ khi bốn phần đạt.
- [ ] **Step 4: Tự chạy `[tu-kiem]`** bằng `node do-mo-hinh.mjs --chi-tu-kiem` → mã 0; phá thử: chạy với `--mau` trỏ một thư mục rỗng → mã 3 `tu kiem khong bat duoc het_tran`.
- [ ] **Step 5: Commit** `test(acceptance): thuoc do model cho tro-ly-okr-bo-final-output`.

### Task 6: sửa `docs/agent.md` mục 9a (phục vụ E9)

`independent: true`

**Files:** Modify `docs/agent.md` (gạch «Gemini 3.8 Flash có lúc suy nghĩ tới trần … đưa về 0/24» trong mục «Chỗ rẽ: Trợ lý OKR (lượt 9a)»).

- [ ] **Step 1:** Viết lại gạch đó: gốc là `final_output` eve thêm khi phiên con khai khuôn kết quả, đá với lệnh «câu đầu là `nop_de_xuat`»; số đo 07/10 (17/88 lời gọi đầu rỗng; đầu vào khó: chỉ `nop_de_xuat` 0/22, thêm `final_output` 5/8); bản sửa bỏ khuôn kết quả, tool nộp tự đóng việc. Bỏ khẳng định «Act at once đưa về 0/24».
- [ ] **Step 2: Commit** `docs(agent): goc that cua loi Gemini tra rong o Tro ly OKR`.

## Sau Task 6

Chạy bộ năm lệnh từ gốc kho (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) qua `scripts/chay-nang.sh` nếu có; đặt hợp đồng `status: implemented`; vào S4.
