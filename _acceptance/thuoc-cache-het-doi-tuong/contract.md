---
schema_version: 1
feature: Thước cache hết đối tượng — gỡ hai tiêu chí không còn vật để đo, gỡ một bản khai vô tác dụng, và thay bằng một bất biến sống sót cả hai cách vá
slug: thuoc-cache-het-doi-tuong
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: draft
design_doc: docs/superpowers/specs/2026-09-07-thuoc-cache-het-doi-tuong-design.md
---

# Acceptance Contract: thuoc-cache-het-doi-tuong

## Bối cảnh

Hồ sơ `lenh-chung-khong-an-cache-doi` ký 07/09 và hỏng ngay khi hợp nhất: chủ kho đã
vá cùng lỗ ấy lúc 06/09 15:38 bằng `cache: false` cho task `test` (`6f581bb`), nên hai
chân đo cache của hồ sơ mất tiền đề. Chi tiết và số đo ở design doc.

## Acceptance Criteria

### AC-1 — Trạng thái đệm của từng task đọc từ CẤU HÌNH ĐÃ GIẢI, không gõ tay

**Given** `turbo.json` ở gốc và `turbo.json` của từng gói (có `extends`)
**When** chân đọc trạng thái đệm hiệu lực của một task trong một gói
**Then** nó giải theo đúng thứ tự turbo giải — cấu hình gói đè cấu hình gốc — và in ra
bảng `(gói, task, đệm)` cho mọi task mà lệnh chứng của cổng chạm tới.
**Đỏ khi** chân kết luận bằng một danh sách tên task gõ tay.
**Mã 2 khi** không đọc được `turbo.json` nào.

Neo đo ngày 07/09: `test` **cache tắt** · `check-types` · `lint` · `build` **còn đệm**.

### AC-2 — Bất biến: không đường thứ ba

**Given** mọi task mà một lệnh chứng trong `feature_loop.suite_keys` chạy
**When** chân soi từng task
**Then** mỗi task phải **hoặc** khai `cache: false`, **hoặc** được lệnh ấy ép `--force`.
**Đỏ khi** một task không thoả cả hai — nêu tên gói, tên task, tên ô cắm, và thiếu vế
nào.

**Dân số viết TRƯỚC, và chân phải IN SỐ DÒNG:** mỗi ô cắm trong `suite_keys` × mỗi
task nó chạy, một dòng, cột `(ô cắm, gói, task, đệm hiệu lực, có --force, thoả)`. Số
dòng phải bằng số cặp giải được từ cấu hình. Đo 07/09: **4 ô cắm · 10 gói · 30 cặp
(gói, task) còn đệm**.

Dân số hẹp là ca hỏng thật: nếu chân chỉ soi ô cắm test, bất biến còn đúng một phần tử
vốn đã `cache: false`, nên nó xanh vĩnh viễn bất kể ai thêm một suite mới — đúng cái
AC-2 tự nhận là chặn.

**Cặp hai chiều trên cùng một vật:**
- chiều xanh — cây thật: mọi task thoả, mã 0;
- chiều đỏ — trong bản sao, bật lại đệm cho `test` (bỏ `cache: false`) **và** bỏ
  `--force` khỏi ô cắm test: chân phải mã 1, gọi đúng tên task `test`.

Bất biến này thay AC-3 và AC-4 của hồ sơ cũ vì nó đúng với **cả hai** cách vá — của chủ
kho (`cache: false`) và của vòng trước (`--force`) — nên nó không hết đối tượng khi một
trong hai đổi.

### AC-3 — Không bản khai `inputs` nào nằm trên một task không đệm

**Given** mọi `turbo.json` trong kho
**When** chân soi từng khai `inputs`
**Then** task mang khai ấy phải thật sự đệm — một `inputs` trên task `cache: false` là
**bản khai vô tác dụng**: trông như bảo đảm, đọc như bảo đảm, không bảo đảm gì.
**Đỏ khi** tìm thấy một khai như thế — nêu `file · gói · task`.

**Chiều đỏ đã có sẵn trên cây trước khi sửa:** `packages/ui/turbo.json` khai `inputs`
cho task `test`, mà `test` là `cache: false`. Chân phải bắt đúng nó. Sau khi gỡ, chiều
đỏ tái lập được bằng cách cấy lại khai ấy vào bản sao.

### AC-4 — Hai tiêu chí hết đối tượng được gỡ với TIỀN ĐỀ ĐO ĐƯỢC

**Given** AC-3 và AC-4 của `lenh-chung-khong-an-cache-doi`
**When** vòng này gỡ chúng khỏi `evals.yaml` của hồ sơ ấy
**Then** lý do phải là một phép đo TRÊN TOÀN KHO, không phải một lời khai và không phải
một gói: danh sách gói lấy từ `workspaces` của `package.json` gốc, và chân in bảng
`(gói, task còn đệm, có đọc file ngoài đồ thị không)`.
**Đỏ khi** bảng có một dòng vừa đệm vừa đọc ngoài đồ thị mà hai tiêu chí vẫn bị gỡ.
**Mã 2 khi** bảng rỗng, hoặc số gói quét được NHỎ HƠN số gói khai trong `workspaces`.

**Đối chứng dương, ghim tên** — bắt buộc, vì «cả bảng đều không đọc» vừa có thể là sự
thật vừa có thể là triệu chứng của một phép chạm hỏng: cặp
`packages/ui#test` × `_acceptance/chan-lai-component-ra-man/rang/da-tim-thay.json` đã
biết là CÓ đọc; phép chạm ấy **phải** làm task ấy chạy lại. Đối chứng dương không nổ →
mã 2, không phải mã 0. Nội dung chạm là chuỗi chưa từng có và phải in ra log.

Đo 07/09 trên toàn kho: **10 gói · 30 task còn đệm**, và **đúng 2 file** trong mọi gói
trỏ ra ngoài đồ thị workspace — `apps/api/test/listing-fixture-batch.spec.ts` và
`packages/ui/test/lai-ra-man.spec.tsx` — **cả hai nằm trong `test/`**, task duy nhất
khai `cache: false`.

### AC-5 — Hồ sơ đã sửa chạy lại XANH trọn vẹn

**Given** `_acceptance/lenh-chung-khong-an-cache-doi/evals.yaml` sau khi gỡ hai eval
**When** chạy lại **mọi** eval script còn lại của hồ sơ ấy trên cây hôm nay
**Then** tất cả mã 0, và **danh sách mã eval đã chạy khớp ĐÚNG danh sách ghim ở đây**:
`E1 · E2 · E5 · E6 · E7 · E8` (tức bộ cũ trừ E3 và E4).
**Đỏ khi** một eval đỏ, hoặc danh sách lệch — nêu tên thừa và tên thiếu.
**Mã 2 khi** không eval script nào còn lại.

Ghim danh sách chứ không ghim số: hai vế rút từ cùng một file thì gỡ nhầm ba eval vẫn
cho «số chạy bằng số khai» và vẫn xanh.

Đây là tiêu chí chứng rằng vòng SỬA thật sự sửa: hồ sơ cũ phải dựng lại được, không chỉ
được khai là đã sửa.

### AC-8 — Ô cắm test của cổng phải đi qua ĐÚNG cửa chạy test của kho

**Given** `scripts.test` của kho nay là `bun packages/db/scripts/test-run.ts`, và
`test-run.ts` đúc một cơ sở dữ liệu RIÊNG cho mỗi lượt (`TEST_RUN_ID`, một
`TEST_DATABASE_URL` riêng) trước khi gọi turbo
**When** chân soi ô cắm test trong `feature_loop.suite_keys`
**Then** chân đo **QUAN HỆ chứ không đo chuỗi**: chạy ô cắm test HAI lượt liên tiếp,
đọc tên cơ sở dữ liệu hiệu lực của mỗi lượt, và hai tên phải **KHÁC NHAU** và mỗi tên
phải mang mã lượt. Việc ô cắm chứa chuỗi `bun run test` chỉ là điều kiện phụ, in kèm.
**Đỏ khi** hai lượt dùng chung một cơ sở dữ liệu — khi đó cổng chạy test trên nền dùng
chung trong khi kho đã chuyển sang nền theo lượt; nêu tên ô cắm, thân lệnh, và cả hai
tên cơ sở dữ liệu.

Đo bằng quan hệ vì đo bằng chuỗi thì hết đối tượng đúng kiểu vừa giết hồ sơ hôm qua:
ai đó đổi `scripts.test` về `turbo run test` thì ô cắm vẫn chứa nguyên chuỗi và thước
vẫn xanh.

**Chiều đỏ có sẵn trên cây trước khi sửa:** `api_khong_cache` =
`bun run db:test && bunx turbo run test --force --concurrency=1` đi vòng qua
`test-run.ts`. Chân phải bắt đúng nó. Sau khi sửa, chiều đỏ tái lập bằng cách cấy lại
ô cắm ấy vào bản sao config.

Đây là lỗi vòng trước tự gây ra: nó dựng một ô cắm riêng để ép chạy lại, mà cửa chạy
test của kho đã đổi ngay trước đó.

### AC-6 — Không chép thước

**Given** thư mục `rang/` của bảy hồ sơ trước
**When** so sánh
**Then** không khối nào từ 12 dòng trở lên trùng.

### AC-7 — Lời khai giới hạn có đọc được cho vòng sau không (judgment)

**Given** phần Known limits ghi vào hồ sơ cũ
**When** một người mở hồ sơ ấy sáu tháng sau
**Then** họ hiểu được vì sao hai tiêu chí biến mất, ai vá bằng cách nào, và commit nào.

## Coverage

Quét bằng preset **test-matrix**. Chân sản phẩm: `CLAUDE.md` mục «Cách chứng minh nó
chạy» sau khi hợp nhất + `turbo.json` `[SUY-TỪ-REPO]`. Chân ngành:
`[NGÀNH: Turborepo cache semantics]`.

- **Trục A — vì sao một phép đo mất giá trị:** vật bị xoá | vật đổi cơ chế | tiền đề bị
  người khác vá mất | phép đo vốn đã sai. [thước CE: giá trị thứ ba vừa xảy ra thật, đo
  được bằng `6f581bb` và hai chân đỏ] → AC-4, AC-5
- **Trục B — một bản khai có tác dụng không:** khai đúng chỗ | khai sai chỗ (task không
  đệm) | không khai. [thước CE: `packages/ui/turbo.json` là ca thật của giá trị thứ
  hai] → AC-3
- **Trục C — bất biến được viết ở mức nào:** mức một cách vá | mức cả hai cách vá | mức
  không đo được. [thước CE: hồ sơ cũ viết ở mức một cách vá nên chết khi cách kia thắng]
  → AC-2
- **Cross-cutting:** dân số từ cấu hình đã giải chứ không gõ tay · cặp hai chiều cho
  mỗi phép đo mới · tập rỗng thoát mã 2 · không chép thước → AC-1, AC-2, AC-3, AC-6

Ô Core: 3 trên không gian 24 ô. Ô Later: quét bản khai vô tác dụng ngoài `turbo.json` ·
chạy lại eval của MỌI hồ sơ đã ký sau mỗi lần hợp nhất. Ô Never: bật lại đệm cho task
`test` · viết lại tiêu chí trong hợp đồng đã ký.

## Out of scope

- **Vá lỗ re-pin của bộ kit** — nghi thức re-pin chỉ chạy bốn lệnh chứng chứ không chạy
  lại eval, nên bằng chứng hỏng lọt qua CI. Lỗi của bộ kit đi chip riêng sang
  `~/dev/acceptance-gate-kit` theo `CLAUDE.md`, không sửa tại chỗ.
- **Bật lại đệm cho task `test`** — cách vá của chủ kho đúng và triệt để hơn.
- **Viết lại tiêu chí trong hợp đồng đã ký** — gỡ một tiêu chí hết đối tượng và khai lý
  do là đủ; sửa chữ trong thứ người đã ký thì không.
- **Chạy lại eval của mọi hồ sơ đã ký sau mỗi lần hợp nhất** — đắt, và là việc của bộ
  kit chứ không của một vòng tính năng.

## Notes

### Known limits

- **Vòng này chỉ chứng cho MỘT hồ sơ.** AC-5 chạy lại eval của
  `lenh-chung-khong-an-cache-doi`. Sáu hồ sơ đã ký khác không được chạy lại ở đây; nếu
  một trong số chúng cũng mất tiền đề sau lần hợp nhất, vòng này không thấy.
