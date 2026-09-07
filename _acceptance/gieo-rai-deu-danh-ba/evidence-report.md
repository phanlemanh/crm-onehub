---
schema_version: 2
feature_slug: gieo-rai-deu-danh-ba
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d3f5b6ce68dcb58272100c19646f89fddb61242
human_signoff:
---

# Evidence Report: gieo-rai-deu-danh-ba

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: gieo-rai-deu-danh-ba-E1-20260907T151438Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:14:38Z
  output: |
    test_mau_trai_khap_dai (test_seed.RaiDeu.test_mau_trai_khap_dai) ... ok
    test_moi_phan_tu_dai_deu_gop_mau (test_seed.RaiDeu.test_moi_phan_tu_dai_deu_gop_mau) ... ok
    test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot (test_seed.RaiDeu.test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot) ... ok
    test_mau_cham_ca_trang_cuoi (test_seed.GieoTuDanhBa.test_mau_cham_ca_trang_cuoi) ... ok
    Ran 43 tests in 0.069s
    OK

- eval: E2
  run_id: gieo-rai-deu-danh-ba-E2-20260907T151438Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:14:38Z
  output: |
    test_it_hon_tran_thi_tra_nguyen (test_seed.RaiDeu.test_it_hon_tran_thi_tra_nguyen) ... ok
    test_bang_dung_tran_thi_tra_nguyen (test_seed.RaiDeu.test_bang_dung_tran_thi_tra_nguyen) ... ok
    Ran 43 tests in 0.069s
    OK

- eval: E3
  run_id: gieo-rai-deu-danh-ba-E3-20260907T151438Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:14:38Z
  output: |
    test_dung_so_luong_khong_lap (test_seed.RaiDeu.test_dung_so_luong_khong_lap) ... ok
    test_the_trung_trong_cung_mot_trang_chi_gieo_mot_lan (test_seed.GieoTuDanhBa.test_the_trung_trong_cung_mot_trang_chi_gieo_mot_lan) ... ok
    test_tran_khong_duong_thi_bao_loi_chu_khong_no (test_seed.RaiDeu.test_tran_khong_duong_thi_bao_loi_chu_khong_no) ... ok
    Ran 43 tests in 0.069s
    OK

- eval: E4
  run_id: gieo-rai-deu-danh-ba-E4-20260907T151438Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:14:38Z
  output: |
    test_hai_luot_cho_cung_ket_qua (test_seed.RaiDeu.test_hai_luot_cho_cung_ket_qua) ... ok
    Ran 43 tests in 0.069s
    OK

- eval: E5
  run_id: gieo-rai-deu-danh-ba-E5-20260907T151438Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:14:38Z
  output: |
    test_khong_tran_thi_tra_het (test_seed.RaiDeu.test_khong_tran_thi_tra_het) ... ok
    test_khong_tran_thi_tra_het (test_seed.GieoTuDanhBa.test_khong_tran_thi_tra_het) ... ok
    Ran 43 tests in 0.069s
    OK

- eval: E6
  run_id: gieo-rai-deu-danh-ba-E6-20260907T151438Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:14:38Z
  output: |
    test_doc_het_tran_trang_khong_dung_som (test_seed.GieoTuDanhBa.test_doc_het_tran_trang_khong_dung_som) ... ok
    test_mot_trang_lap_giua_chung_khong_cat_luot_doc (test_seed.GieoTuDanhBa.test_mot_trang_lap_giua_chung_khong_cat_luot_doc) ... ok
    Ran 43 tests in 0.069s
    OK

## Xác minh độc lập hai mục nặng của làn phản biện

Không tin lời khai của người thi công, cũng không dùng bộ dựng sẵn trong
`test_seed.py`. Lượt chấm này viết bộ dựng riêng, dựng lại đúng hai ca mà làn
phản biện mô tả, gọi thẳng `seed_urls` trên cây đang xét.

**Ca 1 — danh bạ 8 trang, trang 3 lặp y hệt trang 2** (mỗi trang 12 thẻ):

- số trang danh bạ đã tải: **8/8** (làn phản biện đo được 3/8 trên cây cũ)
- mẫu trần 20 trả về 20 địa chỉ, không địa chỉ nào lặp
- dải đã đọc là 84 địa chỉ nằm ở chỉ số 0..23 và 36..95; mẫu trả về chỉ số
  `[0, 4, 8, 12, 16, 21, 37, 41, 45, 49, 54, 58, 62, 66, 70, 75, 79, 83, 87, 91]`
- mẫu **chạm trang cuối**: chỉ số 91 nằm trong trang thứ 8 (84..95)

Khoảng trống 21 → 37 trong mẫu là lỗ của **dữ liệu**, không phải của phép rải:
trang 3 lặp lại trang 2 nên 12 hồ sơ ở chỉ số 24..35 chưa từng xuất hiện trong
danh bạ. Bước rải trên dải thật vẫn đều.

**Ca 2 — thẻ trùng trỏ cùng một địa chỉ**:

- mỗi trang liệt mỗi hồ sơ hai thẻ, 8 trang, dải thật 48 người: trần 8 trả về 8
  địa chỉ, **8 địa chỉ khác nhau**; không trần trả về 48, **48 khác nhau**
- một trang liệt 5 thẻ cho 3 người (`a, b, a, c, b`) trả về đúng `['/moi-gioi-a',
  '/moi-gioi-b', '/moi-gioi-c']`, giữ thứ tự xuất hiện đầu tiên

Cả hai mục nặng **đã đóng thật**, và mỗi mục có một bài canh cửa riêng (khuôn giả
c và d dưới đây làm đúng bài đó đỏ).

## Known limits

- **AC-1 (thước độ đều) — đã đóng ở vòng 2.** Hai bài
  `test_moi_phan_tu_dai_deu_gop_mau` và
  `test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot` đo độ đều thật;
  khuôn giả «19 đầu bảng + 1 cuối» bị bắt. Giữ dòng này để người đọc biết mục đã
  đóng, không phải bị bỏ quên.
- **`evals.yaml` lệch bộ kiểm — đã đóng ở vòng 3.** Commit `4d3f5b6` viết lại
  `expected` của E1, E3, E6 cho khớp tên bài thật. Đối chiếu tay: mọi tên bài
  nêu trong `expected` đều tồn tại trong `test_seed.py` và đều xanh ở lượt này.
- **`sample_across` tự nó không lọc trùng.** Đo tay:
  `sample_across(['/a']*20 + ['/b','/c'], 4)` trả `['/a','/a','/a','/a']`. AC-3
  đứng trên **đường gieo từ danh bạ** vì vòng `seed_urls` đã lọc trùng trước khi
  gọi hàm rải — không phải vì hàm rải bảo đảm điều đó. Ai gọi `sample_across`
  với một dải chưa lọc (đường sơ đồ site, hoặc một chỗ gọi mới) sẽ nhận bản trùng
  mà bộ kiểm hiện tại vẫn xanh.
- **E5 ở tầng vòng gieo chỉ đếm, không so.**
  `GieoTuDanhBa.test_khong_tran_thi_tra_het` khẳng định 80 địa chỉ, không so từng
  địa chỉ với dải đã đọc. Bài ở tầng hàm thuần thì so nguyên danh sách.
- **AC-4 chứng trong cùng một tiến trình.** Hai lượt gọi nằm chung tiến trình,
  đủ đúng lời tiêu chí nhưng không đo tính ổn định giữa hai tiến trình khác nhau.
  Hàm không đọc nguồn ngẫu nhiên nào nên rủi ro thấp.
- **Mẫu tụt về đầu bảng khi danh bạ bị chặn giữa chừng, và bản tổng kết không
  nói.** Cloudflare chặn trang 3..8 thì lượt cào vẫn in `gieo: 20` như một lượt
  khoẻ, nhưng toàn bộ mẫu là phần đầu bảng. Có tín hiệu gián tiếp
  (`lan_thu_hong`, mỗi trang hỏng một dòng cảnh báo), không có con số nào nói
  «mẫu không trải hết dải». Vòng này không chữa; ghi lại để người ký biết.
  Ca trang-lặp đã đóng dùng chung đường mã nhưng **không** phủ ca trang-hỏng:
  trang hỏng rơi vào nhánh `not page.success` ở trên, và nhánh đó vốn đã
  `continue` từ trước.
- **Số điện thoại trong lô sẽ giảm sau vòng này.** `reveal_phones` chỉ lộ số cho
  hồ sơ mức `cao`. Mẫu rải đều mang về nhiều hồ sơ mức thấp hơn, nên cột
  `co_so_dien_thoai` tụt. Xem con số đo lại ở mục Ngoài hợp đồng.
- **README khai hành vi cũ.** `README.md` vẫn viết bộ gieo lật trang danh bạ
  «cho đủ `--limit`», tức vẫn tả cú dừng sớm đã bỏ. Ba commit của vòng sửa không
  chạm tệp này.
- **Mục Notes của hợp đồng tả một cấu hình không tồn tại.** «Trần 30 trang, nhịp
  1,5 giây, thêm khoảng 40 giây mỗi lượt»: `config.toml` khai
  `directory_max_pages = 8`, và mỗi lượt tải tốn `request_delay_seconds = 1.5`
  cộng `render_wait_seconds = 4.0`. Không con số nào trong câu ấy là con số đang
  chạy. Sửa được bằng một vòng hợp đồng, không bằng mã.

## Ngoài hợp đồng

- **Cổng Giá trị — ở cấu hình đang ship, vòng sửa này không đổi một địa chỉ nào
  cho lệnh chạy thật.** Lượt chấm này tự đo lại, không lấy lại số của làn phản
  biện. Dựng dải 98 hồ sơ (đúng con số hợp đồng nêu ở mục Context cho
  `directory_max_pages = 8`), so khuôn cũ `found[:limit]` với `sample_across`:

  | trần | khuôn cũ | khuôn mới | giống hệt từng địa chỉ |
  |---|---|---|---|
  | 50 | 50 | 50 | **không** |
  | 98 | 98 | 98 | **có** |
  | 200 | 98 | 98 | **có** |
  | không trần | 98 | 98 | **có** |

  README dòng 28 khai lệnh chạy thật là `--limit 200`. Ở đúng lệnh đó, kết quả
  hai khuôn **giống hệt nhau**. Chỉ `--limit 50` — lệnh khói ở README dòng 27 —
  mới khác, và khác thật: giả lập danh bạ xếp giảm dần với ngưỡng thật
  (`cao=60, vua=20, thap=1`), `--limit 50` cho khuôn cũ **50 `cao` · 0 `vua` ·
  0 `thap`**, khuôn mới **37 `cao` · 10 `vua` · 3 `thap`**. Ở trần 98 và 200 thì
  hai khuôn cho cùng một phân bố `71 cao · 20 vua · 7 thap`.

  Đọc ra: hai mức «Thấp» và «Ngủ» của trục Sản lượng rỗng **không phải vì cú cắt
  `found[:limit]`** — cú cắt đó chưa từng nổ trên lượt sinh ra bộ 98 hồ sơ. Nó
  rỗng vì `directory_max_pages = 8` chỉ đọc tới 98 người, mà người thấp nhất
  trong 98 người đó vẫn có 36 tin. Nâng trần trang là việc hợp đồng **để ngoài
  phạm vi** một cách có chủ ý.

  **Đây là việc người quyết ở Cổng Giá trị, không phải khuyết tật mã.** Sáu tiêu
  chí của hợp đồng đều đứng; nhưng nếu mục tiêu thật là làm đầy hai mức «Thấp» và
  «Ngủ», vòng này một mình chưa tới đích và cần một quyết định về
  `directory_max_pages`. Lượt chấm không chạm `config.toml`.

- Lệnh executor chạy `unittest discover` trọn thư mục `tests`: **43 bài**, trong
  đó 15 bài thuộc `test_seed.py` và 14 trong số đó gắn với AC-1..AC-6. 28 bài còn
  lại (`test_parse`, `test_redact`, `test_batches`, `test_tiers`,
  `test_schema_ratchet`) chạy kèm như hồi quy, không chứng minh tiêu chí nào của
  hồ sơ này.
- Hợp đồng để **đường gieo từ sơ đồ site** ngoài phạm vi, và đúng là không bài
  nào chạm nó. Hệ quả cần biết khi đọc: cũng không có bài nào **canh** cho đường
  sơ đồ giữ nguyên hành vi cắt-đầu — nếu ai đó sau này gọi `sample_across` cho cả
  nhánh sơ đồ thì bộ kiểm hiện tại vẫn xanh, và mục «`sample_across` tự nó không
  lọc trùng» ở Known limits sẽ nổ ngay tại đó.
- `test_dai_rong_thi_tra_rong` (dải rỗng) xanh nhưng không gắn AC nào trong
  `evals.yaml`; đây là bài phòng thủ thêm của người viết mã.

## Analyst

Sau ba vòng, sáu phép đo chia thành hai nhóm rõ ràng.

**Nhóm phân biệt** — E1, E3, E6. Vòng 3 đo lại bằng bốn khuôn giả và mỗi khuôn
đều bị bắt bởi đúng phép đo đáng ra phải bắt nó:

| khuôn giả | phép đo báo đỏ | bài đỏ |
|---|---|---|
| a — cắt-đầu | E1, E6 | 5 bài |
| b — đầu-cộng-đuôi | E1 | 2 bài |
| c — dừng-ở-trang-lặp | E6 | 1 bài |
| d — không-lọc-trùng-nội-trang | E3 | 1 bài |

E3 chuyển từ «rào hồi quy» ở vòng 2 sang **phép đo phân biệt** ở vòng 3: khuôn d
làm nó đỏ. Đó là thay đổi thật của hồ sơ, đến từ bài mới
`test_the_trung_trong_cung_mot_trang_chi_gieo_mot_lan`.

**Nhóm rào hồi quy** — E2, E4, E5. Xanh trên cả bốn khuôn giả, nên chúng canh cho
bộ kiểm chứ không phân biệt bản đúng với bản hỏng trong họ khuôn đã dựng.

**Phân xử lại nhận định vòng 2 về AC-4.** Vòng 2 gọi E4 là «rào hồi quy hợp lệ»;
làn phản biện phản đối, gọi nó là «mệnh đề luôn đúng» — một tiêu chí không khuôn
hỏng nào làm đỏ được. Lượt chấm này đứng **giữa hai bên, nghiêng về vòng 2**, và
có số để đứng:

- Làn phản biện **đúng ở phạm vi họ khảo sát**: mọi khuôn *cắt danh sách* viết
  được — cắt đầu, đầu-cộng-đuôi, cắt đuôi, bước cố định sai — đều qua
  `test_hai_luot_cho_cung_ket_qua`. Bốn khuôn giả của vòng 3 đều để E4 xanh, đúng
  như họ tiên đoán.
- Nhưng «không khuôn hỏng nào» là lời quá rộng. Lượt chấm dựng thêm một khuôn thứ
  năm — `sorted(random.sample(urls, limit), key=urls.index)` — và
  `test_hai_luot_cho_cung_ket_qua` **báo đỏ**. Khuôn đó không phải khuôn bịa: mục
  Out of scope của hợp đồng viết thẳng «rải mẫu có trọng số hay **ngẫu nhiên có
  hạt giống**» là nhánh thiết kế bị loại, tức đó là con đường người viết mã thật
  sự có thể đã đi.

Kết luận: AC-4 **có thể bị làm sai**, nên nó không phải mệnh đề luôn đúng; nhưng
nó chỉ canh một trục — trục xác định — mà không trục nào trong bốn khuôn giả của
hồ sơ này chạm tới. Cách gọi đúng là **rào một trục hẹp**: hợp lệ, đã có bằng
chứng làm đỏ được, và yếu hơn hẳn E1, E3, E6. Chữ «rào hồi quy hợp lệ» của vòng 2
giữ nguyên hiệu lực, chỉ nên đọc kèm đúng độ hẹp đó. Người đọc câu «sáu tiêu chí
đều xanh» cần nhớ: sức nặng nằm ở ba phép đo, không chia đều cho sáu.

## Variance

none — không có phép đo nhiều lượt trong hồ sơ này

## Iterations

Round 1: cả sáu phép đo đạt ngay lượt đầu, nhưng lượt chấm nêu một giới hạn thật —
thước AC-1 chỉ đòi ≥1 địa chỉ ở phần tư cuối dải, nên một hàm trả «19 đầu bảng +
1 cuối» vẫn qua; không bài nào đo độ đều của bước rải.

Round 2: người thi công thêm hai bài đo độ đều (`7645026`), bộ kiểm lên 40 bài, cả
sáu phép đo đạt lại trên cây mới; khuôn giả đầu-cộng-đuôi nay bị bắt, giới hạn
thước AC-1 của vòng 1 đóng lại. Lượt chấm ghi nhận E2..E5 xanh trên cả hai khuôn
giả và gọi chúng là rào hồi quy.

Round 3: làn phản biện nêu hai khuyết tật mã mà bộ kiểm vòng 2 không thấy — cú
dừng sớm thứ hai ở vòng đọc danh bạ (AC-6) và thẻ trùng trong cùng một trang
(AC-3). Người thi công sửa cả hai cộng lỗi chia-cho-không của `sample_across`
(`4d3f5b6`), thêm ba bài, bộ kiểm lên 43 bài; `evals.yaml` sửa `expected` của E1,
E3, E6 cho khớp bộ kiểm thật. Lượt chấm dựng lại độc lập hai ca của làn phản biện
và xác nhận **đã đóng**; kiểm chiều đỏ bằng bốn khuôn giả, mỗi khuyết tật mới có
một khuôn canh riêng; phân xử lại nhận định vòng 2 về AC-4. Mục nặng còn lại —
vòng sửa không đổi kết quả ở lệnh chạy thật `--limit 200` — được đo lại và ghi
vào Ngoài hợp đồng như một câu hỏi cho Cổng Giá trị, không phải khuyết tật mã.

## Notes

Chiều đỏ vòng 3 kiểm tay với **bốn** khuôn giả, mỗi khuôn chạy lại lệnh executor
rồi khôi phục bằng `git checkout -- tools/listing-crawl`. Cả bốn khuôn đều giữ
nguyên dòng canh trần không dương (`raise ValueError`) để phép đo cô lập đúng
hành vi cần thử.

**Khuôn a — cắt-đầu.** `sample_across` trả `urls[:limit] if limit is not None else
list(urls)`, cộng hai dòng dừng-sớm `if limit is not None and len(found) >= limit:`
+ `break` ở đầu vòng đọc trang danh bạ trong `__main__.py`. Lệnh executor báo đỏ,
**5 bài** đỏ:

- `test_seed.RaiDeu.test_mau_trai_khap_dai` — «mẫu không chạm phần tư cuối dải —
  vẫn đang cắt đầu bảng»
- `test_seed.RaiDeu.test_moi_phan_tu_dai_deu_gop_mau` — «20 != 5 : phần tư thứ 1
  của dải không góp đúng 5 địa chỉ — mẫu dồn về một phía»
- `test_seed.GieoTuDanhBa.test_mau_cham_ca_trang_cuoi` — «không địa chỉ nào của
  trang danh bạ cuối lọt vào mẫu»
- `test_seed.GieoTuDanhBa.test_doc_het_tran_trang_khong_dung_som` — «2 != 8»
- `test_seed.GieoTuDanhBa.test_mot_trang_lap_giua_chung_khong_cat_luot_doc` —
  «2 != 8 : một trang danh bạ lặp lại giữa chừng đã cắt cụt lượt đọc»

38 bài còn lại xanh, trong đó có
`test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot`, vì một lát cắt liền
nhau có bước rải đều tuyệt đối.

**Khuôn b — đầu-cộng-đuôi.** `sample_across` trả `urls[: limit - 1] + [urls[-1]]`,
giữ nhánh `limit is None or len(urls) <= limit` trả `list(urls)`; `__main__.py`
để nguyên. Lệnh executor báo đỏ, đúng **2 bài** — hai bài đo độ đều của vòng 2:

- `test_seed.RaiDeu.test_moi_phan_tu_dai_deu_gop_mau` — «19 != 5 : phần tư thứ 1
  của dải không góp đúng 5 địa chỉ — mẫu dồn về một phía»
- `test_seed.RaiDeu.test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot` —
  «67 not less than or equal to 1 : bước rải không đều: [1, 68]»

41 bài còn lại xanh, kể cả `test_mau_trai_khap_dai` và `test_mau_cham_ca_trang_cuoi`
— đây là lỗ thước mà vòng 1 nêu, và là bằng chứng hai bài của vòng 2 bịt đúng chỗ.

**Khuôn c — dừng-ở-trang-lặp.** Đổi hai dòng
`LOGGER.warning("trang danh bạ %s không có địa chỉ mới", number)` + `continue`
thành `break`, tức trả `__main__.py` về đúng khuyết tật làn phản biện tìm ra. Lệnh
executor báo đỏ, đúng **1 bài**:

- `test_seed.GieoTuDanhBa.test_mot_trang_lap_giua_chung_khong_cat_luot_doc` —
  «3 != 8 : một trang danh bạ lặp lại giữa chừng đã cắt cụt lượt đọc»

42 bài còn lại xanh — kể cả `test_doc_het_tran_trang_khong_dung_som`, đúng như
làn phản biện chẩn đoán: bộ dựng cũ không bao giờ trả trang lặp nên bài cũ mù với
khuyết tật này. Đây là bằng chứng bài mới bịt đúng chỗ mù đó.

**Khuôn d — không-lọc-trùng-nội-trang.** Bỏ hai dòng `if url in seen:` +
`continue` trong vòng `for url in fresh:`. Lệnh executor báo đỏ, đúng **1 bài**:

- `test_seed.GieoTuDanhBa.test_the_trung_trong_cung_mot_trang_chi_gieo_mot_lan` —
  «80 != 40 : một người bị gieo hai lần vì thẻ trùng trong cùng một trang»

42 bài còn lại xanh, kể cả `test_dung_so_luong_khong_lap` — bài đó chỉ nạp dải
toàn địa chỉ khác nhau nên không thấy được khuyết tật này, đúng như làn phản biện
nêu.

**Khuôn thăm dò thứ năm — ngẫu nhiên** (dựng để phân xử AC-4, không thuộc bốn
khuôn bắt buộc). `sample_across` trả `sorted(random.sample(urls, limit),
key=urls.index)`. Lệnh executor báo đỏ, 3 bài: hai bài đo độ đều cộng
`test_seed.RaiDeu.test_hai_luot_cho_cung_ket_qua`. Kết quả này là cơ sở cho phần
phân xử AC-4 ở mục Analyst.

Sau cả năm khuôn: `git checkout -- tools/listing-crawl` khôi phục sạch,
`git status --short` không còn dòng nào ở phần mã, và lượt chạy lại cho toàn bộ
43 bài xanh.
