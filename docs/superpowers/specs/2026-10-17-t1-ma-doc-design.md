# t1-ma-doc — tệp T1 mà mã đọc thì CI và pre-push chạy đủ

Gốc: `_acceptance/pre-push-t1/` (S4 r1–r2, mục ngoài hợp đồng Ngoài-1 mức cao, Ngoài-3 mức vừa). Ô cơ hội:
`_acceptance/t1-ma-doc/opportunity.md`, chủ kho ký Cổng Đáng «build» 17/10.

## Ý định

`risk_tiers.t1_skip_globs` trả lời câu «việc này có cần hồ sơ nghiệm thu không». Từ `giam-phut-ci-nhap-t1` và
`pre-push-t1` nó còn trả lời câu thứ hai: «PR/lần đẩy này có cần chạy test và build không». Hai câu khác nhau. Một tệp
tài liệu mà bài kiểm hay runtime đọc vẫn không cần hồ sơ khi sửa, nhưng phải chạy bài kiểm đọc nó. Vòng này tách câu
thứ hai ra: một danh sách `risk_tiers.t1_ma_doc` trong `_acceptance/config.yaml` — tệp nằm trong đó thì CI và
pre-push coi là nặng, dù vẫn khớp `t1_skip_globs`.

## Mục tiêu

1. PR sẵn sàng hay lần đẩy chỉ chạm một tệp của `t1_ma_doc` → nặng: CI chạy đủ job, pre-push chạy đủ năm lệnh.
2. PR hay lần đẩy chỉ chạm tài liệu không ai đọc (vd `docs/api.md`, `docs/plan/lo-trinh-okr.json`) → nhẹ như hôm nay.
3. Một nguồn luật: `docGlobT1` đọc cả hai khoá, `tepT1` trừ phần `t1_ma_doc`; CI (`phanLoai`) và pre-push
   (`scripts/pre-push-t1.mjs`) đều đi qua hai hàm đó, nên không bên nào lách được.
4. Danh sách tìm bằng lệnh và được giữ đủ bằng lệnh: một bộ quét (`.github/scripts/t1-ma-doc.mjs`) chạy trong
   `bun run test`; thêm bài kiểm đọc một tệp T1 mới mà không khai là đỏ, gọi tên tệp và bên đọc.
5. Câu `vi_sao` của khối `t1Only` (`.githooks/gate-shape.json`) và câu tương ứng trong `CLAUDE.md` nói đúng sự thật.

## Không làm

- Không đổi `t1_skip_globs`. Cổng nghiệm thu của kit (hồ sơ bắt buộc, hoá cũ bằng chứng) đọc nó như cũ: sửa
  `docs/design.md` vẫn không cần hồ sơ (`CLAUDE.md`: «T1 (chỉ chạm `docs/**`, `**/*.md`) thoát ở S0, làm thẳng»).
  Cho kit hiểu `t1_ma_doc` là chip riêng sang `~/dev/acceptance-gate-kit`.
- Không sửa bộ cổng chép từ kit (`scripts/pre-merge-check.sh`, `lib/*.cjs`): dùng nguyên `match_globs`.
- Không đổi `.githooks/pre-push` (sáu răng đã ký ghim byte của nó).
- Không quét mã dưới `scripts/**` mà `bun run test` không chạy (`scripts/kiem-cheo`, `scripts/tin-hieu`): CI không
  chạy chúng, không có chiều đỏ để mất.

## Thiết kế

### Luật (`.github/scripts/phan-loai.mjs`)

- `docGlobT1(goc)` trả `[...t1_skip_globs, ...t1_ma_doc.map(g => "!" + g)]`. `t1_ma_doc` rỗng hay vắng → ném
  `t1_ma_doc rong` (CI ra nặng kèm `loi:`, pre-push chạy đủ năm lệnh kèm dòng «không phân loại được»): gỡ khoá là
  mọi thứ nặng, không phải mọi thứ nhẹ.
- `tachT1(globs, tep)` → `{ t1, maDoc }`: `t1` = khớp một glob dương và không khớp glob `!` nào; `maDoc` = khớp glob
  dương và khớp một glob `!`. Cả hai lượt khớp đi qua cùng `match_globs` rút từ `scripts/pre-merge-check.sh`.
- `tepT1(globs, tep)` = `tachT1(...).t1` — chữ ký không đổi, nên `scripts/pre-push-t1.mjs` không đổi một byte.
- `quyetDinh` nhận thêm `laMaDoc` (tuỳ chọn): mọi tệp là T1 hoặc maDoc và có ít nhất một maDoc → `{nang: true,
  lyDo: "t1-ma-doc"}`. Thiếu `laMaDoc` thì như cũ (`co-tep-nang`). `phanLoai` truyền `laMaDoc`, nên tóm tắt bước CI
  nói «nặng — t1-ma-doc» thay vì để người đọc tưởng PR có mã.

### Pre-push (`scripts/pre-push-t1.mjs`) — theo khuyến nghị Hỏi-2

Thêm `tachT1` vào import (giữ `docGlobT1`, `tepT1`, `quyetDinh` mà răng `mot-nguon` đòi) và truyền `laMaDoc` cho
`quyetDinh`. Kết cục `t1-ma-doc` → stdout rỗng (hook chạy đủ năm lệnh) và stderr đúng một dòng
`pre-push: có tệp T1 mà mã đọc (<tối đa 3 tệp, cách nhau ", "><" +n" nếu nhiều hơn>) — chạy đủ năm bước.`
Mọi kết cục khác giữ nguyên AC-1 của `pre-push-t1`. Nếu chủ kho chọn lối kia ở Hỏi-2: bỏ mục này, tệp không đổi.

### Danh sách (`_acceptance/config.yaml`, `risk_tiers.t1_ma_doc`)

| Glob | Bên đọc |
|---|---|
| `apps/**`, `packages/**` (theo khuyến nghị Hỏi-1) | mọi tệp T1 trong cây mã: prompt agent eve nạp theo quy ước (`instructions.md`), fixture `.md` của bài kiểm, README gói |
| `CONTEXT.md`, `docs/setup.md` | `apps/api/test/okr-mau-chan.spec.ts` |
| `docs/design.md` | `packages/ui/test/status-tone.spec.ts`, răng `mau-ban-kinh` (chạy trong `@crm/ui#test`) |
| `docs/environment.md` | `apps/agent/test/zalo-qua-webhook.integration.spec.ts` |
| `docs/telemetry.md` | `packages/telemetry/test/allowlist.spec.ts` |
| 5 spec `docs/superpowers/specs/*-design.md` | 8 bài kiểm `.dom.tsx`/`.spec.ts` của app, api |
| `LO-TRINH.html` | `apps/app/lib/lo-trinh/doc-tep.ts` (runtime) và 6 bài kiểm |
| `_acceptance/soan-okr-cung-tro-ly/rang/ma-tran-quyen.md` | `apps/api/test/soan-okr-quyen.spec.ts` |
| `scripts/pre-merge-check.sh`, `lib/workspace-record.cjs`, `lib/evidence-core.cjs`, `lib/eval-yaml.cjs` | bộ phân loại CI và `packages/ui/test/pre-push-t1.spec.ts` (chép vào kho tạm) |

Danh sách cuối cùng là đầu ra của bộ quét trên cây lúc commit, không phải bảng này.

### Bộ quét (`.github/scripts/t1-ma-doc.mjs`)

Luật đọc, tất định:

1. **Nguồn**: mọi tệp mã (`.ts .tsx .mts .cts .js .jsx .mjs .cjs .sh`) được theo dõi, không khớp T1, dưới `apps/`,
   `packages/` (bỏ `node_modules`); cộng **một bậc cầu**: tệp mã ngoài hai gốc đó mà một nguồn gốc có lời gọi đọc/chạy
   nhắc tên; cộng các script mà khối `rang` của `.githooks/gate-shape.json` khai (chúng chạy trong `@crm/ui#test`).
   Tệp cầu phải KHÔNG khớp T1: bộ cổng chép từ kit (`scripts/pre-merge-check.sh`, `lib/*.cjs`) là đích, không là nguồn —
   chúng nhắc tên hàng chục tệp trong chú thích lịch sử (đo 17/10: 22 dương tính giả khi để chúng làm cầu).
   Bộ quét không tự làm nguồn (nó là thước; bảng miễn của nó nhắc tên tệp như dữ liệu). Fixture của bài kiểm
   dùng tên tệp không có trong kho, để chính bài kiểm không thành bên đọc giả.
   Cầu chỉ một bậc và chỉ từ mã: đi qua dữ liệu JSON (fixture bản mẫu, `package.json`) cho hàng chục dương tính giả
   (đo 17/10: bản bắc cầu không giới hạn ra `docs/plan/*`, `README.md`, 20 `contract.md`, 22 giây).
2. **Lời gọi đọc**: tệp nguồn chứa một trong `readFileSync readFile( existsSync Bun.file( createReadStream
   copyFileSync cpSync spawnSync execSync execFileSync spawn( import(`.
3. **Nhắc tên**: tên tệp đích đứng như một từ (trước là khoảng trắng, nháy, `/`, `(`; với tệp ở gốc kho thì không
   tính `/` đứng trước) và mọi đoạn thư mục của nó đứng như một từ trong cùng tệp nguồn. Bắt được cả
   `join(GOC, "docs", "design.md")` lẫn `"docs/design.md"`.
4. **Đích**: tệp khớp `t1_skip_globs`, ngoài `apps/` `packages/` (hai gốc đã có glob nguyên khối), được nguồn nhắc tên.
5. **Phán**: mỗi cặp (đích, nguồn) phải có đích khớp `t1_ma_doc`, hoặc có đúng CẶP đó trong bảng miễn `MIEN` của bộ
   quét kèm lý do (nguồn nhắc tên mà không đọc: viết tệp cùng tên vào kho tạm, ghi kết quả). Miễn khoá theo cặp, không
   theo đích: một nguồn đọc thật mới của tệp đã miễn vẫn đỏ. Thiếu → đỏ, in `thieu-khai <đích> ← <nguồn>` mỗi cặp.
   Cặp miễn mà bộ quét không còn thấy → đỏ `mien-thua <đích> ← <nguồn>`. Glob `t1_ma_doc` không khớp tệp nào được theo dõi → đỏ
   `glob-chet`.
6. Chỉ phân loại T1 cho các ứng viên được nhắc tên (vài chục tệp), không phân loại cả kho (18 giây với bộ khớp bash).

Miễn đã biết (đo trên cây `2022895bd`), mỗi mục một cặp: `AGENTS.md`, `CLAUDE.md`, `.github/workflows/ci.yml` ←
`packages/ui/test/pre-push-t1.spec.ts` (viết tệp cùng tên trong kho tạm); `_acceptance/hoi-dap-okr/evidence/do-hoi-dap.md`
← `_acceptance/hoi-dap-okr/rang/do-hoi-dap.mjs` (ghi kết quả vào đó, không đọc).

Giới hạn khai: tên ghép lúc chạy (`${slug}-design.md`) và đường đọc qua nhiều bậc cầu thì bộ quét không thấy.

### Bài kiểm

- `.github/scripts/test/phan-loai.test.mjs` (chạy ở job phân loại của CI cho MỌI PR): ma trận `tachT1`, `quyetDinh`
  với `laMaDoc`, CLI trên kho tạm (PR chỉ `docs/design.md` → nặng `t1-ma-doc`; chỉ `docs/api.md` → nhẹ; khoá vắng →
  nặng `loi:`).
- `packages/ui/test/t1-ma-doc.spec.ts` (`@crm/ui#test`, cạnh `pre-push-t1.spec.ts`): bộ quét trên cây thật xanh và
  thấy đủ các bên đọc đã biết; bộ quét trên kho tạm đỏ đúng thông điệp; bộ phân loại pre-push trên kho tạm có remote
  ra rỗng cho lần đẩy chỉ `docs/design.md`.
- `_acceptance/t1-ma-doc/rang/dot-bien.mjs`: phá vật thật trong bản sao, thước phải đỏ đúng tên ca.
- `_acceptance/t1-ma-doc/rang/khai.mjs` (chỉ chạy ở eval, không trong `bun run test`): so byte với nhánh gốc
  `origin/chore/pre-push-t1` và đối chứng câu `vi_sao` cũ. Bài kiểm trong `bun run test` không được phụ thuộc một ref
  nhánh sẽ biến mất sau gộp, và không đọc tệp T1 nào ngoài danh sách (vd không đọc `CLAUDE.md`).
- Đầu ra thật (gap-probe P1): `turbo.json` khai `test` là `cache: false`, pre-push đặt `TURBO_FORCE=true`, nên bài kiểm
  đọc tài liệu chạy lại thật mỗi lần. Phép đo ghim cả hai sự thật đó và, trên bản sao, sửa lệch một dòng bảng màu của
  `docs/design.md` thì `packages/ui/test/status-tone.spec.ts` đỏ với `bang mau lech docs/design.md`.

## Hồ sơ đã ký bị chạm

`phan-loai.mjs` và `gate-shape.json` nằm trong `paths` của `giam-phut-ci-nhap-t1` và `pre-push-t1`: hai hồ sơ đó cần
ghim lại trong PR này (làn M5). Răng `mot-nguon` của `pre-push-t1` đòi `scripts/pre-push-t1.mjs` import đúng
`docGlobT1`, `tepT1`, `quyetDinh` — giữ được vì tệp đó không đổi.

## Để lại cho người dựng

- Tên hàm, tên ca bài kiểm, câu chữ thông điệp ngoài các chuỗi hợp đồng ghim.
- Thứ tự mục trong `t1_ma_doc`.
