---
schema_version: 1
feature: Lệnh chứng không được ăn cache dối — bắt bốn lệnh chứng của cổng nói thật, và bắt khoá cache của bộ vẽ khai đủ file nó đọc ngoài gói
slug: lenh-chung-khong-an-cache-doi
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: draft
design_doc: docs/superpowers/specs/2026-09-06-lenh-chung-khong-an-cache-doi-design.md
---

# Acceptance Contract: lenh-chung-khong-an-cache-doi

## Bối cảnh

Ngày 06/09, bốn lệnh chứng trả mã 0 và cả bốn là **FULL TURBO** — bản phát lại. Chạy
cưỡng bức thì lộ một màu đỏ mà bản phát lại đang che. Hai lỗ, cả hai đã đo, chi tiết ở
design doc.

## Acceptance Criteria

### AC-1 — Không lệnh chứng nào của cổng có thể trả về một màu xanh phát lại

**Given** danh sách `feature_loop.suite_keys` trong `_acceptance/config.yaml`
**When** chân soi từng ô cắm, **giải tên script qua `package.json` trước khi kết luận**
**Then** không lệnh nào đi qua `turbo run` mà thiếu `--force`; **và** ô cắm test của
cổng phải giữ CẢ HAI vế — bước dựng lại cơ sở dữ liệu test (`db:test`) LẪN cờ
`--force`. Chân in ra **số lệnh đã soi**, phải bằng số phần tử của `suite_keys`.
**Đỏ khi** một lệnh còn ăn cache, hoặc ô cắm test thiếu một trong hai vế — nêu đúng
tên ô cắm, thân lệnh sau khi giải, và vế nào thiếu.
**Mã 2 khi** config không khai `suite_keys` (không có gì để soi thì không được xanh).

Vế `db:test` có mặt trong tiêu chí vì trục A khai ba nguồn dối, và nguồn thứ ba là
**trạng thái cơ sở dữ liệu nằm ngoài khoá cache**. `--force` một mình không chạm tới
nó: rút vế `db:test` thì `agent#test` sẽ đỏ ở `retireExhausted` vì hàng `AgentTask`
sót lại — đúng cái bẫy `CLAUDE.md` đã ghi — mà không chân nào chỉ được nguyên nhân.

Việc **giải tên script** là bắt buộc chứ không phải tinh tế thừa: đoán theo tên đã cho
một báo động giả ngay lần chạy đầu — `bun run lint:slop` trông như một lệnh lint nhưng
giải ra là `oxlint` chạy thẳng, không qua turbo.

### AC-2 — Dân số lấy từ config, không gõ tay

**Given** `suite_keys` có thể dài ra hay ngắn đi
**When** chân chạy
**Then** nó đọc danh sách TỪ config và soi hết, in ra số lệnh đã soi.
**Đỏ khi** thêm một ô cắm ăn cache vào `suite_keys` mà chân vẫn xanh.

Chiều đỏ phải gọi **CHÍNH chân của AC-1**, trỏ vào một bản sao config qua tham số
`--config <đường dẫn>`, rồi khẳng định cả mã thoát lẫn tên ô cắm vừa cấy có trong đầu
ra. Lý do: chiều đỏ của AC-1 là một lượt chạy LỊCH SỬ trên cây trước khi sửa, không
tái lập được sau khi vòng đóng — nếu AC-2 dùng một chân khác thì cả hai cùng xanh
trong khi năng lực bắt lỗi đã mất.

### AC-3 — Cache của bộ vẽ nói thật về file nó đọc NGOÀI gói

**Given** bộ vẽ có **HAI loại** phụ thuộc ngoài gói, và turbo vá chúng bằng **hai cơ
chế khác nhau** — bảng viết TRƯỚC khi chân chạy:

| # | file thật | loại phụ thuộc | turbo vá bằng |
| --- | --- | --- | --- |
| 1 | `_acceptance/chan-lai-component-ra-man/rang/da-tim-thay.json` | ĐỌC lúc chạy | `inputs` của task |
| 2 | `apps/app/components/agent-builder/chat-chips.tsx` | NHẬP như mô-đun | cạnh phụ thuộc gói |

**When** chân chạy, với **từng dòng**, đúng BA lượt theo thứ tự:
1. **mồi** — chạy một lượt cho cache ấm;
2. **chiều dương** — không đổi gì → phải **trúng cache** (`cached == total`);
3. **chiều đỏ** — đổi một byte trong file của dòng ấy → phải **bể cache** (`cached < total`).

**Then** cả hai dòng đúng cả ba lượt; chân in đủ sáu con số mỗi dòng, tự trả file về
nguyên trạng kể cả khi hỏng, và `git status` trước/sau bằng nhau. Số dòng chạy phải
BẰNG số dòng bảng khai.
**Đỏ khi** một lượt sai — nêu tên file đã đụng và cặp số nhận được.
**Mã 2 khi** `total == 0` ở bất kỳ lượt nào, hoặc không đọc được trạng thái cache từ
đầu ra turbo.

Bước **mồi** và ngưỡng `total ≥ 1` là bắt buộc: trên một cache lạnh — máy mới, CI, vừa
xoá `.turbo`, hoặc ngay sau một lượt `--force` — chiều đỏ sẽ bể cache vì KHÔNG CÓ
cache chứ không vì bản khai đúng, còn chiều dương thoả «0 bằng 0» một cách rỗng. Khi
đó cặp hai chiều xanh mà không chứng gì.

### AC-4 — Đo HÀNH VI, không đo bản khai

**Given** cám dỗ soi danh sách `inputs` trong `turbo.json`
**When** chân của AC-4 tự dựng một trạng thái cache, hỏi chân AC-3 cặp số nó dùng để
kết luận, rồi **TỰ chạy một lượt turbo độc lập**
**Then** hai cặp số phải KHỚP — đó là bằng chứng chân AC-3 đang đọc đầu ra thật của
công cụ chứ không phải một bản khai.
**Đỏ khi** hai cặp số lệch — nêu cả hai cặp.
**Mã 2 khi** chân AC-3 không in ra cặp số nó dựa vào.

Tiêu chí này KHÔNG được đo bằng cách tìm chuỗi `turbo.json` trong mã nguồn chân AC-3:
đó là đo chỉ dẫn chứ không đo đầu ra, và nó hỏng cả hai chiều — chân đọc bản khai gián
tiếp thì lọt, còn chân chỉ in tên file ấy trong một thông điệp lỗi thì đỏ oan.

### AC-5 — Người viết code vẫn giữ vòng lặp nhanh

**Given** `bun run test` là lệnh người viết code chạy hằng ngày
**When** vòng này đóng
**Then** script gốc ấy **KHÔNG** bị thêm `--force`; chỉ ô cắm CỦA CỔNG mới cưỡng bức.
**Đỏ khi** `scripts.test` trong `package.json` gốc chứa `--force`.

### AC-6 — Bốn lệnh chứng còn xanh sau khi đổi

**Given** ô cắm mới và bản khai input mới
**When** chạy trọn bốn lệnh chứng
**Then** cả bốn mã 0, và `apps/app` về đúng ba cảnh báo lint có sẵn.

### AC-7 — Không chép thước

**Given** thư mục `rang/` của sáu hồ sơ trước
**When** so sánh
**Then** không khối nào từ 12 dòng trở lên trùng.

### AC-8 — Cái giá của việc ép chạy lại có chấp nhận được không (judgment)

**Given** ép `--force` nghĩa là mỗi lượt chấm của cổng chạy lại toàn bộ bộ test
**When** người đọc con số thời gian đo được
**Then** người quyết cái giá ấy có đáng đổi lấy một màu xanh có nghĩa không.

## Coverage

Quét bằng preset **test-matrix**. Chân sản phẩm: `CLAUDE.md` mục «Cách chứng minh nó
chạy» + `_acceptance/config.yaml` `[SUY-TỪ-REPO]`. Chân ngành:
`[NGÀNH: Turborepo — inputs & cache correctness]` · `[NGÀNH: Bazel hermeticity]`.

- **Trục A — nguồn dối của một màu xanh:** lệnh không chạy (phát lại) | lệnh chạy nhưng
  khoá cache thiếu input | lệnh chạy đủ nhưng trạng thái ngoài không nằm trong khoá
  (cơ sở dữ liệu). [thước CE: cả ba đã đo thật ngày 06/09 trên chính kho này] → AC-1,
  AC-3
- **Trục B — ai chịu cái giá:** cổng (chấp nhận chậm để có sự thật) | người viết code
  (cần nhanh) | CI. [thước CE: CLAUDE.md khai bốn lệnh chứng là hợp đồng với người
  viết code] → AC-5, AC-8
- **Trục C — đo bằng gì:** đọc bản khai | đọc đầu ra thật của công cụ | đo hành vi hai
  chiều. [thước CE: năm vòng đã ký đều trả giá cho lớp «đo bản khai thay vì đo vật»] →
  AC-3, AC-4
- **Cross-cutting:** dân số từ config chứ không gõ tay · cặp hai chiều cho mỗi phép đo
  mới · tập rỗng thoát mã 2 · không chép thước → AC-2, AC-3, AC-7

Ô Core: 3 trên không gian 27 ô. Ô Later: khoá cache cho trạng thái cơ sở dữ liệu ·
kiểm cache của CI từ xa. Ô Never: tắt hẳn cache turbo · ép `--force` cho lệnh hằng ngày.

## Out of scope

- **Ép `--force` cho lệnh hằng ngày của người viết code** — vòng lặp nhanh là thứ họ
  cần; cổng mới là chỗ cần sự thật.
- **Tắt cache của turbo** — cache đúng là tài sản; vòng này chỉ bắt nó khai thật.
- **Đưa trạng thái cơ sở dữ liệu vào khoá cache** — không công cụ nào ở đây làm được;
  `--force` là cách rẻ nhất để vô hiệu hoá vấn đề.
- **Dời bộ vẽ ra khỏi `packages/ui`** — nó cần bộ nạp DOM giả của chính gói ấy.

## Notes

### Known limits

- **`--force` không làm khoá cache trung thực, nó chỉ bỏ qua khoá.** Sau vòng này, cổng
  không bao giờ đọc một bản phát lại nữa — nhưng khoá cache của các task khác vẫn có
  thể thiếu input mà không ai biết. Chỉ `@crm/ui#test` được đo hai chiều ở đây.
