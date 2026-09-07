---
schema_version: 2
feature_slug: gieo-rai-deu-danh-ba
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7645026ecacfc137ff56fb1d5e954379cc2d79f9
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
  run_id: gieo-rai-deu-danh-ba-E1-20260907T150039Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:00:39Z
  output: |
    test_mau_trai_khap_dai (test_seed.RaiDeu.test_mau_trai_khap_dai) ... ok
    test_moi_phan_tu_dai_deu_gop_mau (test_seed.RaiDeu.test_moi_phan_tu_dai_deu_gop_mau) ... ok
    test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot (test_seed.RaiDeu.test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot) ... ok
    test_mau_cham_ca_trang_cuoi (test_seed.GieoTuDanhBa.test_mau_cham_ca_trang_cuoi) ... ok
    Ran 40 tests in 0.061s
    OK

- eval: E2
  run_id: gieo-rai-deu-danh-ba-E2-20260907T150039Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:00:39Z
  output: |
    test_it_hon_tran_thi_tra_nguyen (test_seed.RaiDeu.test_it_hon_tran_thi_tra_nguyen) ... ok
    test_bang_dung_tran_thi_tra_nguyen (test_seed.RaiDeu.test_bang_dung_tran_thi_tra_nguyen) ... ok
    Ran 40 tests in 0.061s
    OK

- eval: E3
  run_id: gieo-rai-deu-danh-ba-E3-20260907T150039Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:00:39Z
  output: |
    test_dung_so_luong_khong_lap (test_seed.RaiDeu.test_dung_so_luong_khong_lap) ... ok
    Ran 40 tests in 0.061s
    OK

- eval: E4
  run_id: gieo-rai-deu-danh-ba-E4-20260907T150039Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:00:39Z
  output: |
    test_hai_luot_cho_cung_ket_qua (test_seed.RaiDeu.test_hai_luot_cho_cung_ket_qua) ... ok
    Ran 40 tests in 0.061s
    OK

- eval: E5
  run_id: gieo-rai-deu-danh-ba-E5-20260907T150039Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:00:39Z
  output: |
    test_khong_tran_thi_tra_het (test_seed.RaiDeu.test_khong_tran_thi_tra_het) ... ok
    test_khong_tran_thi_tra_het (test_seed.GieoTuDanhBa.test_khong_tran_thi_tra_het) ... ok
    Ran 40 tests in 0.061s
    OK

- eval: E6
  run_id: gieo-rai-deu-danh-ba-E6-20260907T150039Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T15:00:39Z
  output: |
    test_doc_het_tran_trang_khong_dung_som (test_seed.GieoTuDanhBa.test_doc_het_tran_trang_khong_dung_som) ... ok
    Ran 40 tests in 0.061s
    OK

## Known limits

- Giới hạn thước AC-1 mà vòng 1 nêu đã **bịt**: hai bài mới
  (`test_moi_phan_tu_dai_deu_gop_mau`, `test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot`)
  đo độ đều thật, và khuôn giả «19 đầu bảng + 1 cuối» nay bị bắt. Ghi lại ở đây
  cho người đọc hồ sơ biết mục này đã đóng, không phải bị bỏ quên.
- `evals.yaml` chưa theo kịp bộ kiểm: dòng `expected` của E1 vẫn chỉ tả bài cũ
  («khẳng định có địa chỉ thuộc một phần tư CUỐI dải»), không nhắc hai bài đo độ
  đều. Ai đọc riêng `evals.yaml` sẽ tưởng thước AC-1 vẫn là thước lỏng của vòng 1.
  Bộ kiểm mạnh hơn lời khai của nó, không phải ngược lại — nhưng lệch vẫn là lệch.
- E5 đòi bài «không trần thì trả hết» ở cả hàm rải lẫn vòng gieo, và cả hai bài
  đều có. Nhưng bài ở tầng vòng gieo (`GieoTuDanhBa.test_khong_tran_thi_tra_het`)
  chỉ đếm 80 địa chỉ, không so từng địa chỉ với dải đã đọc; bài ở tầng hàm thuần
  thì so nguyên danh sách.
- AC-4 chứng bằng hai lượt gọi trong **cùng một tiến trình**. Đủ đúng lời tiêu chí
  («rải hai lần cho cùng kết quả»), nhưng không đo tính ổn định giữa hai tiến trình
  khác nhau; hàm hiện không đọc nguồn ngẫu nhiên nào nên rủi ro này thấp.

## Ngoài hợp đồng

- Lệnh executor chạy `unittest discover` trọn thư mục `tests`: 40 bài, trong đó
  chỉ 12 bài thuộc `test_seed.py` và 11 trong số đó gắn với AC-1..AC-6. 28 bài
  còn lại (`test_parse`, `test_redact`, `test_batches`, `test_tiers`,
  `test_schema_ratchet`) chạy kèm như hồi quy, không chứng minh tiêu chí nào của
  hồ sơ này.
- Hợp đồng để **đường gieo từ sơ đồ site** ngoài phạm vi, và đúng là không bài nào
  chạm nó. Hệ quả cần biết khi đọc: cũng không có bài nào **canh** cho đường sơ đồ
  giữ nguyên hành vi cắt-đầu — nếu ai đó sau này gọi `sample_across` cho cả nhánh
  sơ đồ thì bộ kiểm hiện tại vẫn xanh.
- `test_dai_rong_thi_tra_rong` (dải rỗng) xanh nhưng không gắn AC nào trong
  `evals.yaml`; đây là bài phòng thủ thêm của người viết mã.

## Analyst

E2, E3, E4, E5 — xanh trên cả nhánh lẫn diffBase (khuôn cắt đầu bảng), nên chúng
chứng minh bộ kiểm chứ không chứng minh tính năng: `urls[:limit]` cũng trả đúng số
lượng, không lặp, ổn định giữa hai lượt, và trả hết khi không có trần. Vòng 2 kiểm
tay lại và khẳng định điều đó: cả hai khuôn giả đều để bốn phép đo này xanh. Chúng
là rào hồi quy hợp lệ, không phải thước phân biệt.

Hai phép đo phân biệt thật vẫn là E1 và E6, và vòng 2 đo được chúng phân biệt với
khuôn nào: E1 đỏ ở **cả hai** khuôn giả (cắt-đầu và đầu-cộng-đuôi); E6 đỏ ở khuôn
cắt-đầu, xanh ở khuôn đầu-cộng-đuôi — đúng như thiết kế, vì khuôn thứ hai không
đụng vòng đọc trang. Trong lòng E1, chỉ `test_moi_phan_tu_dai_deu_gop_mau` bắt được
cả hai khuôn; `test_mau_trai_khap_dai` và `test_mau_cham_ca_trang_cuoi` bắt khuôn
cắt-đầu nhưng xanh ở khuôn đầu-cộng-đuôi, còn bài đo bước rải bắt khuôn
đầu-cộng-đuôi nhưng xanh ở khuôn cắt-đầu (một lát cắt liền nhau có bước đều tuyệt
đối). AC-1 kín là nhờ ba bài cộng lại, không nhờ bài nào một mình.

## Variance

none — không có phép đo nhiều lượt trong hồ sơ này

## Iterations

Round 1: cả sáu phép đo đạt ngay lượt đầu, nhưng lượt chấm nêu một giới hạn thật —
thước AC-1 chỉ đòi ≥1 địa chỉ ở phần tư cuối dải, nên một hàm trả «19 đầu bảng +
1 cuối» vẫn qua; không bài nào đo độ đều của bước rải.
Round 2: người thi công thêm hai bài đo độ đều (`7645026`), bộ kiểm lên 40 bài, cả
sáu phép đo đạt lại trên cây mới; khuôn giả đầu-cộng-đuôi nay bị bắt, giới hạn
thước AC-1 của vòng 1 đóng lại.

## Notes

Chiều đỏ vòng 2 kiểm tay với **hai** khuôn giả, mỗi khuôn chạy lại lệnh executor
rồi khôi phục bằng `git checkout -- tools/listing-crawl`.

Khuôn a — cắt-đầu (`sample_across` trả `urls[:limit] if limit is not None else
list(urls)`, cộng hai dòng dừng-sớm `if limit is not None and len(found) >= limit:`
+ `break` ở đầu vòng đọc trang danh bạ trong `__main__.py`). Lệnh executor báo đỏ,
bốn bài đỏ:

- `test_seed.RaiDeu.test_mau_trai_khap_dai` — «mẫu không chạm phần tư cuối dải —
  vẫn đang cắt đầu bảng»
- `test_seed.RaiDeu.test_moi_phan_tu_dai_deu_gop_mau` — «20 != 5 : phần tư thứ 1
  của dải không góp đúng 5 địa chỉ — mẫu dồn về một phía»
- `test_seed.GieoTuDanhBa.test_mau_cham_ca_trang_cuoi` — «không địa chỉ nào của
  trang danh bạ cuối lọt vào mẫu»
- `test_seed.GieoTuDanhBa.test_doc_het_tran_trang_khong_dung_som` — «2 != 8»: đọc
  được 2 trang danh bạ trong khi trần trang là 8

36 bài còn lại giữ màu xanh ở khuôn a — trong đó có
`test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot`, vì một lát cắt liền
nhau có bước rải đều tuyệt đối.

Khuôn b — đầu-cộng-đuôi (`sample_across` trả `urls[: limit - 1] + [urls[-1]]`, giữ
nhánh `limit is None or len(urls) <= limit` trả `list(urls)`; `__main__.py` để
nguyên). Lệnh executor báo đỏ, đúng hai bài mới của vòng 2 đỏ:

- `test_seed.RaiDeu.test_moi_phan_tu_dai_deu_gop_mau` — «19 != 5 : phần tư thứ 1
  của dải không góp đúng 5 địa chỉ — mẫu dồn về một phía»
- `test_seed.RaiDeu.test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot` —
  «67 not less than or equal to 1 : bước rải không đều: [1, 68]»

38 bài còn lại xanh ở khuôn b, kể cả `test_mau_trai_khap_dai` và
`test_mau_cham_ca_trang_cuoi` — đây chính là lỗ thước mà vòng 1 nêu, và là bằng
chứng hai bài mới bịt đúng chỗ.

Sau cả hai khuôn: `git status --short` sạch ở phần mã (chỉ hồ sơ `_acceptance`
đổi), và lượt chạy lại cho toàn bộ 40 bài xanh.
