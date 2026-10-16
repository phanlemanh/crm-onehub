# Kế hoạch — thu-haiku-tro-ly-okr

Hồ sơ `_acceptance/thu-haiku-tro-ly-okr/`, design `docs/superpowers/specs/2026-10-14-thu-haiku-tro-ly-okr-design.md`.
Luật kho áp mọi task: không chú thích trong mã, hằng gom về module cấu hình của khu, parse ở biên bằng Zod.
Mỗi phép đo mới đi kèm lượt phá-thử trên bản sao (MEASURE-BIRTH): thước xanh trên vật lành, đỏ với thông điệp
ghim khi phá. Lượt phá chạy trên bản sao trong scratchpad, không `git checkout` sau phá tại chỗ.

| Task | Việc | Tệp | Phục vụ | Độc lập |
|---|---|---|---|---|
| T1 | Danh sách model và biến chọn của Trợ lý OKR | `apps/agent/agent/lib/okr/config.ts`, `lib/okr/mo-hinh-thu.ts` (mới), `lib/okr/mo-hinh.ts`, `lib/model.ts`, `subagents/tro_ly_okr/agent.ts`, `test/tro-ly-okr-mo-hinh-thu.integration.spec.ts` (mới), `test/support/mo-hinh-thu-moi.ts` (mới) | E1–E4 | có |
| T2 | Kho đo gieo ô model | `packages/db/src/measure-database.ts`, `scripts/measure-db.ts`, `scripts/gieo-model-do.ts` (mới), `test/measure-db-model.spec.ts` (mới) | E5 | có |
| T3 | Bộ đọc số và ngưỡng | `_acceptance/thu-haiku-tro-ly-okr/rang/doc-so.mjs`, `doc-so.test.ts`, `rang/mau/*` | E6 | có |
| T4 | Thước so hai model | `_acceptance/thu-haiku-tro-ly-okr/rang/so-mo-hinh.mjs` | E7 | không (sau T1, T2, T3) |
| T5 | Tài liệu | `.env.example`, `docs/environment.md`, `docs/agent.md`, `docs/setup.md` | E8 | không (sau T1, T2) |

## T1

1. `config.ts`: `TRO_LY_OKR.moHinhThu` — biến `TRO_LY_OKR_MO_HINH`, danh sách hai mục `{ ma, tranRaMoiLoiGoi, cuaSoNguCanh }`
   (Gemini 2 000 / 1 048 576, Haiku 4 000 / 1 000 000). `TRO_LY_OKR.model`, `tranRaMoiLoiGoi`, `cuaSoNguCanh` giữ giá trị
   Gemini. `moHinhZdr` thêm mã Haiku.
2. `mo-hinh-thu.ts`: `chonMoHinhTroLyOkr(env)` — production → mục mặc định; vắng → mặc định; có → `z.enum` của các mã,
   lỗi ném `Error` nêu tên biến, giá trị, danh sách. Xuất `MO_HINH_DANG_CHAY = chonMoHinhTroLyOkr(process.env)`.
3. `mo-hinh.ts`: `kepTranRaMoiLoiGoi` dùng `MO_HINH_DANG_CHAY.tranRaMoiLoiGoi`; `moHinhTroLyOkr` nhận mục chọn
   (mặc định `MO_HINH_DANG_CHAY`) cho `nha(<mã>)` và `modelId`.
4. `model.ts`: `modelChoPhienGoc` và `modelChoBuocGoc` dùng mã và cửa sổ của mục chọn. `agent.ts`: `ghiModelPhien` ghi mã của mục chọn.
5. Spec: bốn nhóm `-t thk-mac-dinh|thk-haiku|thk-gia-tri-la|thk-production` theo `expected` của E1–E4; tệp mồi
   tiến trình con in JSON mã của bốn vai.
Verify: `bun run test -- "cd apps/agent && bun test test/tro-ly-okr-mo-hinh-thu.integration.spec.ts test/mo-hinh-khoa.spec.ts test/tro-ly-okr-cach-ly.spec.ts"` · `bun run check-types`.
Phá-thử: bản sao `mo-hinh-thu.ts` đổi `parse` thành `safeParse` lùi mặc định → E3 đỏ với `thk: gia tri la lui lang`.

## T2

1. `measure-database.ts`: `MEASURE_DATABASE.agentModel = { id: "google/gemini-3.8-flash", contextWindowTokens: 1_048_576 }`.
2. `gieo-model-do.ts`: nạp `@crm/db` với `DATABASE_URL` của mẫu, gọi `writeAgentModel(db, MEASURE_DATABASE.agentModel)`.
3. `measure-db.ts`: `buildTemplate` chạy `bun scripts/gieo-model-do.ts` sau seed, trong cùng khối `try`; `sourceFingerprint`
   băm thêm `agentModel.id`.
4. Spec theo `expected` của E5.
Verify: `bun run test -- "cd packages/db && bun test test/measure-db-model.spec.ts test/measure-database.spec.ts"`.
Phá-thử: bản sao `buildTemplate` bỏ bước gieo → `thk: kho do khong mang model`.

## T3

`doc-so.mjs` xuất `docE24`, `docE22`, `docKetQuaEval`, `NGUONG`, `ketLuan`; `doc-so.test.ts` theo `expected` của E6 trên
năm mẫu thật. Verify: `bun test ./_acceptance/thu-haiku-tro-ly-okr/rang/doc-so.test.ts`. Phá-thử: bản sao mẫu sửa số
cho vừa ngưỡng → kết luận lật; `NGUONG.e22Dung` đổi 25 → `thk: nguong lech o co hoi`.

## T4

`so-mo-hinh.mjs` theo design và `expected` của E7. KHÔNG chạy lượt thật ở S3 (giám sát: không đo E22/E24 tới khi việc
(a) gộp). Verify ở S3: `node --check`, và chạy với `AI_GATEWAY_API_KEY` rỗng → mã 2 `KHONG DO DUOC` (không gọi model).

## T5

Bốn tệp tài liệu trả lời đủ năm ý của E8. `.env.example` chỉ thêm dòng (luật 7 của đợt).
