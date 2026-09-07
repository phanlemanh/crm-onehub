---
schema_version: 1
feature: Mọi ổ cắm trong _acceptance/config.yaml phải giải ra một lệnh chạy được — hiện 16 ổ cắm giải ra lệnh lỗi cú pháp bash, và hai dòng làm cả file không parse được bằng YAML
slug: o-cam-chay-duoc-that
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [acceptance]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-07T10:37:13Z
design_doc: docs/superpowers/specs/2026-09-07-o-cam-chay-duoc-that-design.md
---

# Acceptance Contract: o-cam-chay-duoc-that

## Bối cảnh

`_acceptance/config.yaml` có hai trình đọc không đồng ý nhau. Bộ kit đọc theo
dòng bằng `resolveConfigKey`, bóc đúng một ngoặc ở mỗi đầu và cắt sau ` #`.
Giá trị viết dạng `bun run test -- "…"` bị bóc mất dấu nháy cuối, nên lệnh giải
ra thiếu ngoặc đóng và đổ ngay ở `bash -n`.

Hai dòng `apr_lech_noi_dung` và `apr_lech_noi_dung_do` còn chứa `: ` ngoài
ngoặc, làm cả file không parse được bằng trình đọc YAML thật — và hai chân đo của
hồ sơ **đã ký** `lenh-dung-do-khong-ai-thay` dùng `Bun.YAML.parse` nay crash.

## Mốc ghim

SHA cố định của cây TRƯỚC vòng này:

```
632aee6a3dde3e070f4dcaa7c61af21a9e6d2618
```

Bốn con số neo, đo tại SHA ấy bằng **chính hàm `resolveConfigKey` của bộ kit**
cộng `bash -n`:

| Neo | Số |
| --- | --- |
| ổ cắm giải được **tại SHA ghim** | 227 |
| ổ cắm vòng này THÊM (tám chân đo của chính nó) | 8 |
| ổ cắm giải được **ở HEAD sau vòng** | **235** |
| giải ra lệnh không hợp lệ cú pháp bash | **16** |
| trong 16: hình dạng A — không chứa nháy đơn, sửa bằng bọc nháy | 11 |
| trong 16: hình dạng B — có chứa nháy đơn, sửa bằng file script | 5 |
| dòng làm cả file không parse được bằng YAML | 2 |
| file `evidence-report*.md` | 25 |
| khoá `verifier:` distinct trong các file ấy | 222 |

**Mười sáu ổ cắm phải sửa, ghim nguyên văn** — hình dạng B in đậm:

`test.tt_api` · `test.go_khoa_api` · `test.go_khoa_app` · `script.rang_suite_sach` ·
`script.rang_suite_thu_tu` · `script.rang_microsoft_duong` · `script.rang_microsoft_do` ·
`script.rang_microsoft_nguon_env` · `script.rang_microsoft_hinh_thuc` ·
`script.tt_crawl_to_ingest` · `script.apr_lech_so_dong_do` ·
**`script.apr_check_run`** · **`script.apr_lech_so_dong`** · **`script.apr_lech_noi_dung`** ·
**`script.apr_check_run_do`** · **`script.apr_lech_noi_dung_do`**

**Tám ổ cắm vòng này thêm, ghim nguyên văn:** `oc_moi_o_cam_chay_duoc` ·
`oc_yaml_doc_duoc` · `oc_hai_trinh_doc_bang_nhau` · `oc_khoa_khong_doi` ·
`oc_verifier_con_giai_duoc` · `oc_lenh_van_lam_dung_viec` ·
`oc_chan_ho_so_da_ky_chay_lai` · `oc_ham_kit_chua_doi` · `oc_nam_lenh_chung`

## Acceptance criteria

**AC-1 — Mọi ổ cắm giải ra một lệnh hợp lệ cú pháp.**
Given `_acceptance/config.yaml`,
When với **mỗi** ổ cắm dưới `executors.*`, gọi `resolveConfigKey` của bộ kit rồi
đưa chuỗi trả về qua `bash -n -c`,
Then **không ổ cắm nào** trả mã khác 0.
Dân số phải bằng neo **235** (227 kế thừa + 8 ổ cắm vòng này thêm); lệch là mã 2 —
một phép đo tự chọn dân số thì không bao giờ đỏ.
**Và `bash -n` chỉ chứng CÚ PHÁP.** Nên thêm một chặng: mọi đường dẫn file mà một
giá trị ổ cắm trỏ tới phải **tồn tại, khác rỗng, đọc được** — nếu không, một file
script quên `git add` vẫn cho lệnh hợp lệ cú pháp tuyệt đối mà chết khi chạy.
Chiều đỏ: bỏ dấu nháy đóng của một ổ cắm trong bản sao → mã 1, nêu tên ổ cắm và
thông điệp của bash.

**AC-2 — File parse được bằng trình đọc YAML thật.**
Given `_acceptance/config.yaml`,
When nạp bằng một trình đọc YAML đúng chuẩn (`Bun.YAML.parse`),
Then không ném lỗi, và đọc ra được `executors.script`, `executors.test`,
`feature_loop.suite_keys`.
Chiều đỏ: cấy lại một giá trị chứa `: ` ngoài ngoặc → phải ném lỗi.

**AC-3 — Hai trình đọc trả về CÙNG một chuỗi.**
Given cùng một ổ cắm,
When đọc bằng `resolveConfigKey` của bộ kit và bằng trình đọc YAML,
Then hai chuỗi **trùng từng ký tự**, với **mọi** ổ cắm trong dân số 235.
Đây là bất biến thật của vòng: AC-1 và AC-2 mỗi cái chỉ canh một trình đọc; chỉ
tiêu chí này bắt được ca hai bên cùng «đọc được» mà đọc ra hai thứ khác nhau.
Một ổ cắm lệch → mã 1, in cả hai chuỗi.

**AC-4 — Không khoá ổ cắm CŨ nào đổi; khoá thêm chỉ được là tám cái đã khai.**
Given tập khoá dưới `executors.*` tại SHA ghim,
When so với tập khoá ở HEAD,
Then **mọi khoá cũ còn nguyên** — không bớt, không đổi tên — và mọi khoá thêm phải
nằm trong danh sách **tám tên `oc_*`** ghim ở mục Mốc ghim. Thêm một khoá ngoài
danh sách ấy là mã 1.
Vì sao không phải «giống hệt»: chính vòng này phải thêm tám ổ cắm cho tám chân đo
của nó, nên luật «giống hệt» sẽ đỏ oan và cách duy nhất làm nó xanh là xoá chân đo
của chính vòng.
Vì sao: 16 khoá ấy đang bị các `evidence-report.md` đã ký trích ở dòng
`verifier:`; đổi khoá là làm `recheck-evidence` của hồ sơ đã ký đỏ.
Chiều đỏ: đổi tên một khoá trong bản sao → mã 1, nêu khoá.

**AC-5 — Mọi dòng `verifier:` của mọi evidence-report vẫn giải được.**
Given mọi `_acceptance/*/evidence-report*.md`,
When rút từng `verifier: config:<khoá>` rồi giải bằng `resolveConfigKey`,
Then mỗi khoá đều giải ra một giá trị khác rỗng.
Số dòng `verifier:` soi được phải > 0; tập rỗng là mã 2.
Ghi chú giới hạn: `lenh-chung-khong-an-cache-doi/evals.yaml` đã trỏ tới ổ cắm
`api_khong_cache` không tồn tại **từ trước vòng này**; tiêu chí này soi
`evidence-report`, không soi `evals.yaml`, nên nó không bắt ca đó — và vòng này
không nhận sửa nó.

**AC-6 — Lệnh của năm hồ sơ bị chạm vẫn LÀM đúng việc cũ.**
Given **cả 16 ổ cắm đã sửa**, ghim tên nguyên văn ở mục Mốc ghim,
When chạy từng lệnh sau khi sửa,
Then mỗi lệnh trả mã 0.
Không lấy «năm cái đại diện»: năm đại diện có thể rơi trúng năm ổ cắm hình dạng A
vốn đã lành, để lọt cả năm ổ cắm hình dạng B — chính nhóm phải đưa vào file script
và do đó dễ sai đường dẫn nhất.
Số lệnh chạy phải bằng **16**; lệch là mã 2.
Đây là đối chứng dương của cả vòng: sửa cách viết mà làm hỏng việc lệnh đang làm
thì mọi tiêu chí trên vẫn xanh.
Một lệnh khác 0 → mã 1, nêu tên ổ cắm và mã.

**AC-7 — Hai chân đo của hồ sơ đã ký chạy lại được.**
Given hai chân đo của `lenh-dung-do-khong-ai-thay` dùng `Bun.YAML.parse`,
When chạy chúng,
Then cả hai trả mã 0 — chúng đang crash trước vòng này.
Chiều đỏ có sẵn: tại SHA ghim chúng crash; đó là chứng cứ vòng này sửa thứ có thật.

**AC-9 — Hàm của bộ kit chưa đổi hành vi.**
Given `resolveConfigKey` nạp từ plugin **ngoài kho**,
When cho nó ba chuỗi mẫu đã biết trước — một giá trị trần, một bọc nháy kép, một
kết thúc bằng nháy kép không bọc,
Then đầu ra khớp **từng ký tự** với luật đã khai trong thiết kế: cắt sau ` #`, bóc
đúng một ngoặc mỗi đầu.
Lệch → **mã 2** kèm câu «hàm của bộ kit đã đổi, mọi neo của vòng này hết hiệu lực».
Chân phải in ra **đường dẫn `evidence-core.cjs` nó đã nạp**.
Vì sao bắt buộc: cả bộ đo đứng trên hàm ấy, mà chính thiết kế của vòng lại đề nghị
mở chip sửa nó. Nếu chip kia xong trước, hàm mới dùng YAML thật thì E1 và E3 xanh
với **mọi** ổ cắm kể cả chưa sửa — hồ sơ tuyên một điều nó không còn đo.

**AC-8 — Năm lệnh chứng còn xanh.**
Given HEAD của vòng này,
When chạy `bun run test`, `check-types`, `lint`, `lint:slop`, `build`,
Then cả năm mã 0, và `apps/app` về đúng ba cảnh báo lint có sẵn.

## Coverage

Bỏ quét không gian AC — xem entry `descope` mở đầu `"bỏ coverage-scan"` trong
`decisions.jsonl`. Bài toán một chiều: một file, một luật đọc, và dân số đã đếm
xong bằng chính hàm của bộ kit trước khi mở vòng.

Thước CE: **hàm `resolveConfigKey` của bộ kit cộng `bash -n`** — không phải suy
luận về YAML, mà là chạy đúng trình đọc đang dùng rồi hỏi shell xem chuỗi ấy có
phải một lệnh hay không.

## Out of scope

- **Không đổi khoá ổ cắm nào.**
- **Không sửa `resolveConfigKey` của bộ kit** — lỗi bộ kit đi chip riêng.
- **Không đổi ý nghĩa của lệnh nào** — chỉ đổi cách viết.
- **Không sửa `api_khong_cache`** của `lenh-chung-khong-an-cache-doi`: đó là một
  ref hỏng trong `evals.yaml` có từ trước, thuộc lớp khác (khoá không tồn tại,
  không phải giá trị đọc lệch).
- **Không đụng bảy ổ cắm chết** đã gỡ ở lượt dọn trước.

## Ghi chú kỹ thuật cho chiều đỏ

`resolveConfigKey(configText, khoá)` nhận **văn bản**, không nhận đường dẫn. Nên
mọi chiều đỏ của vòng này bẻ hỏng một **bản sao trong bộ nhớ** rồi truyền vào —
không chân đo nào cần ghi đè `_acceptance/config.yaml` thật.

Chân nào buộc phải ghi ra đĩa (ví dụ E7 dựng lại bản config tại SHA ghim) thì ghi
vào **thư mục tạm**, không đụng file thật. Và mọi chân phải kết bằng một chặng so
`sha256` của `_acceptance/config.yaml` với lúc bắt đầu — lệch là **mã 2** kèm câu
«chân đã để lại rác».

## Notes
