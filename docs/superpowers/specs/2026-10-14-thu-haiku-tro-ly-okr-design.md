# Thử Haiku 5.5 cho Trợ lý OKR, và kho đo thôi chạy GLM 5.2 Fast — thiết kế

Hồ sơ: `_acceptance/thu-haiku-tro-ly-okr/`. Hạng T2 (không chạm `packages/db/prisma`). Đọc trước khi viết:
`CLAUDE.md`, `AGENTS.md`, `docs/agent.md` (mục model, mục 5 về ZDR của Trợ lý OKR, mục 6 về khuôn đệ quy),
`docs/environment.md` (ba nhà của một biến), `docs/setup.md` («Screen measurements»).

## Bài toán

Một lượt so hai model cho Trợ lý OKR hôm 14/10 phải sửa hằng tại chỗ giữa hai nhánh, chạy trần token chỉnh
cho Gemini lên Haiku, và đo Tác nhân trên GLM 5.2 Fast vì kho đo để trống ô model. Kết quả: số của Haiku không
dùng được để quyết (11/20 lượt bị cắt ở trần), và không có số nào cho Tác nhân. Vòng này dựng đủ đồ để lượt so
sau chạy được không sửa mã, rồi chạy lượt so đó khi thước E22/E24 của `tro-ly-okr-de-xuat` đã sửa.

## Ba phần

### 1. Chọn model của Trợ lý OKR bằng một biến chỉ dành cho phép đo

- Biến `TRO_LY_OKR_MO_HINH`, cùng khuôn `TRO_LY_OKR_BO_DE`: chỉ đọc khi `NODE_ENV` khác `production`, chỉ
  `apps/agent` đọc, khai ở `.env.example` và `docs/environment.md`. Không vào `turbo.json`: phép đo dựng eve
  trực tiếp, không qua turbo — như `TRO_LY_OKR_BO_DE`.
- Danh sách cho phép là một đối tượng trong `lib/okr/config.ts`, mỗi model một mục: mã model, trần ra mỗi lời
  gọi việc góp ý, cửa sổ ngữ cảnh.
  - `google/gemini-3.8-flash` — mặc định; trần 2 000, cửa sổ 1 048 576 (giữ y số hôm nay).
  - `anthropic/claude-haiku-5.5` — trần 4 000, cửa sổ 1 000 000 (danh mục Gateway).
- Biến được đọc và kiểm bằng Zod ở MỘT chỗ (`lib/okr/mo-hinh-thu.ts`), lúc nạp mô-đun. Vắng hoặc đang ở
  production → mục mặc định. Giá trị ngoài danh sách → ném lỗi gọi tên biến, giá trị và danh sách: agent không
  khởi động. Không lùi lặng về Gemini — một lượt đo tưởng đang đo Haiku mà thật ra đo Gemini là lỗi tệ hơn
  một agent không lên.
- Mọi chỗ đang đọc `TRO_LY_OKR.model` hay `TRO_LY_OKR.tranRaMoiLoiGoi` để GỌI model đọc mục đã chọn: model của
  `tro_ly_okr`, model tóm tắt tuần, model phiên gốc `okr` (cả `session.started` lẫn `step.started`), mã ghi ở
  `ghiModelPhien`, trần của `kepTranRaMoiLoiGoi`. Trần tóm tắt 8 000 không đổi theo model. `moHinhZdr` liệt cả
  hai model. `TRO_LY_OKR.model` vẫn là mã mặc định — các bài kiểm đã ký ghim nó.
- Lease việc góp ý giữ 30 s (gia hạn ở mỗi bước). Trần 4 000 có thể làm một lời gọi dài hơn lease; khi đó lượt
  đóng `hong:het-lease` và E24 đếm nó là lượt hỏng — Haiku tự trượt ngưỡng, không ai phải đoán.

### 2. Không thêm tuỳ chọn suy nghĩ cho Anthropic

`packages/ai-okr` (`tuyChonZdr`) chỉ gửi mức suy nghĩ cho `google` và `vertex` («low»). Lượt 14/10 đo Haiku
trong đúng điều kiện đó (không khoá `anthropic`, 0 token suy nghĩ ở ca thử nhỏ), và con số 1 958 token của Hỏi-2
đo trong điều kiện ấy. Thêm suy nghĩ adaptive lúc này đổi một biến giữa hai lần đo, nên lượt so không quy được
Haiku trượt vì trần hay vì suy nghĩ. Gỡ ở phản biện S1 (gap-probe P1); `packages/ai-okr` không đổi.

### 3. Kho đo gieo model, thôi rơi về GLM 5.2 Fast

- `MEASURE_DATABASE` (`packages/db/src/measure-database.ts`) thêm mục model đo: `google/gemini-3.8-flash`,
  cửa sổ 1 048 576. Giá trị này là câu hỏi cho chủ kho (Hỏi-1): phương án B đã duyệt là «kho đo chạy đúng model
  production», mà máy không đọc được Cài đặt production.
- Dựng mẫu kho đo (`buildTemplate` của `packages/db/scripts/measure-db.ts`) chạy thêm một bước sau seed:
  `bun scripts/gieo-model-do.ts` với `DATABASE_URL` của mẫu, gọi `writeAgentModel` — đường ghi thật của Cài đặt
  → Model, không chèn thẳng bảng. Kho đo nhân bản từ mẫu nên mang sẵn ô model.
- Dấu vân tay nguồn của mẫu thêm mã model đo: đổi model đo thì mẫu dựng lại, kho cũ không mang model cũ.
- Kho dev `crm` và kho test `crm_<id>_test` không đổi. `DEFAULT_AGENT_MODEL` không đổi (phương án A để sau).

## Thước so hai model (vật của hồ sơ)

`_acceptance/thu-haiku-tro-ly-okr/rang/`:

- `doc-so.mjs` — đọc số từ đầu ra của ba lệnh có sẵn: `do-tre.mjs` (dòng `N. … ms — hong (…)`, dòng `p50`),
  `eval-gop-y.mjs` (dòng `DUNG`/`SAI`, `khongGopY nhung co`, `ma: n/30 · judge: x`, `chi: x USD`,
  `khong co ban ghi`), `eve eval agent-builder` (dòng `✓`/`✗`). Lượt mất kho hay `KHONG DO DUOC` → kết quả
  «không đo được», không thành số. `NGUONG` là một đối tượng chép đúng mục «SỐNG» của ô cơ hội; bài kiểm
  ghim từng giá trị và thử biên hai phía. `ketLuan(so, NGUONG)` áp ngưỡng cho từng vai. Kết quả bộ dựng đọc
  bằng `docKetQuaEval(text, id)` — dòng `✓`/`✗` của đúng id eval trong đầu ra `eve eval`.
- `doc-so.test.ts` — đọc chính nhật ký đo thật ngày 14/10 (chép vào `rang/mau/`, tức đầu ra của bên viết thật):
  E24 Haiku ra 11 lượt hỏng, E24 Gemini ra 0, E22 Haiku ra 20/30 và 3 ca góp ý thừa, E22 Gemini mất kho ra
  «không đo được». Chiều đỏ: sửa một số trong bản sao của mẫu thì kết luận lật.
- `so-mo-hinh.mjs` — chạy tuần tự trên cây hiện tại: đọc số dư Gateway (≤ 0 → mã 2); với Gemini rồi Haiku:
  E24 (`do-tre.mjs --lan 20`) và E22 (`eval-gop-y.mjs`) với `TRO_LY_OKR_MO_HINH` của nhánh; rồi bộ dựng Tác nhân
  ba lượt mỗi model trên kho đo riêng của cây, ô model ghi bằng `writeAgentModel`. Mỗi nhánh đọc lại mã model đã
  thật sự chạy (sự kiện `model.phien-chon` của lượt Trợ lý OKR; `readAgentModel` của kho đo ở nhánh Tác nhân);
  lệch model của nhánh → mã 2 — chặn đúng lỗi biến không tới nơi mà nhánh Haiku âm thầm chạy Gemini. Bảng in
  thêm số lượt theo từng kết cục (`da-nop`, `hong:het-lease`, `hong:turn-failed`…) để quy được nguyên nhân khi
  Haiku trượt. In bảng, kết luận từng vai,
  ghi nhật ký vào `.acceptance-runs/thu-haiku-tro-ly-okr/so-mo-hinh/<run>/`. Mọi nhánh đo được → mã 0, dù Haiku
  đạt hay trượt; một nhánh không đo được → mã 2. GLM 5.2 Fast không nằm trong danh sách (chủ kho, 14/10).

Lượt so chạy SAU khi việc sửa thước E22/E24 gộp (kho E22 theo cây, E24 thoát 2 khi hỏng hết) — trước đó kho
`crm_tdx_e22_do` còn dùng chung giữa các cây.

## Không làm

- Đổi model Trợ lý OKR trên production — ship ra người dùng thật; người quyết theo số của lượt so.
- Đổi `DEFAULT_AGENT_MODEL`, gieo kho test, lease theo model, Soạn OKR, Kho tài liệu, bộ chấm GLM.

## Đặc tả UX

Không chạm màn nào — bỏ bằng dòng sổ `descope`.
