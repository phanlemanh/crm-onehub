---
schema_version: 2
feature_slug: gieo-rai-deu-danh-ba
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 74184833e7229c7f248f925eddd1adb56ee4b2a1
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
  run_id: gieo-rai-deu-danh-ba-E1-20260907T145616Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T14:56:16Z
  output: |
    test_mau_trai_khap_dai (test_seed.RaiDeu.test_mau_trai_khap_dai) ... ok
    test_mau_cham_ca_trang_cuoi (test_seed.GieoTuDanhBa.test_mau_cham_ca_trang_cuoi) ... ok
    Ran 38 tests in 0.061s
    OK

- eval: E2
  run_id: gieo-rai-deu-danh-ba-E2-20260907T145616Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T14:56:16Z
  output: |
    test_it_hon_tran_thi_tra_nguyen (test_seed.RaiDeu.test_it_hon_tran_thi_tra_nguyen) ... ok
    test_bang_dung_tran_thi_tra_nguyen (test_seed.RaiDeu.test_bang_dung_tran_thi_tra_nguyen) ... ok
    Ran 38 tests in 0.061s
    OK

- eval: E3
  run_id: gieo-rai-deu-danh-ba-E3-20260907T145616Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T14:56:16Z
  output: |
    test_dung_so_luong_khong_lap (test_seed.RaiDeu.test_dung_so_luong_khong_lap) ... ok
    Ran 38 tests in 0.061s
    OK

- eval: E4
  run_id: gieo-rai-deu-danh-ba-E4-20260907T145616Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T14:56:16Z
  output: |
    test_hai_luot_cho_cung_ket_qua (test_seed.RaiDeu.test_hai_luot_cho_cung_ket_qua) ... ok
    Ran 38 tests in 0.061s
    OK

- eval: E5
  run_id: gieo-rai-deu-danh-ba-E5-20260907T145616Z
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T14:56:16Z
  output: |
    test_khong_tran_thi_tra_het (test_seed.RaiDeu.test_khong_tran_thi_tra_het) ... ok
    test_khong_tran_thi_tra_het (test_seed.GieoTuDanhBa.test_khong_tran_thi_tra_het) ... ok
    Ran 38 tests in 0.061s
    OK

- eval: E6
  run_id: gieo-rai-deu-danh-ba-E6-20260907T145616Z
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gieo_rai_test
  verified_at: 2026-09-07T14:56:16Z
  output: |
    test_doc_het_tran_trang_khong_dung_som (test_seed.GieoTuDanhBa.test_doc_het_tran_trang_khong_dung_som) ... ok
    Ran 38 tests in 0.061s
    OK

## Known limits

- AC-1 nói «trải khắp dải», nhưng bài chứng minh chỉ khẳng định **có ít nhất một**
  địa chỉ thuộc phần tư cuối (`test_mau_trai_khap_dai`, `test_mau_cham_ca_trang_cuoi`).
  Không bài nào đo **độ đều** của bước rải. Một hàm trả 19 địa chỉ đầu bảng cộng
  1 địa chỉ cuối vẫn qua được cả hai bài. Mục Notes của hợp đồng hứa «rải đều theo
  bước cố định» — lời hứa đó rộng hơn thước đang có.
- E5 đòi bài «không trần thì trả hết» ở cả hàm rải lẫn vòng gieo, và cả hai bài
  đều có. Nhưng bài ở tầng vòng gieo (`GieoTuDanhBa.test_khong_tran_thi_tra_het`)
  chỉ đếm 80 địa chỉ, không so từng địa chỉ với dải đã đọc; bài ở tầng hàm thuần
  thì so nguyên danh sách.
- AC-4 chứng bằng hai lượt gọi trong **cùng một tiến trình**. Đủ đúng lời tiêu chí
  («rải hai lần cho cùng kết quả»), nhưng không đo tính ổn định giữa hai tiến trình
  khác nhau; hàm hiện không đọc nguồn ngẫu nhiên nào nên rủi ro này thấp.

## Ngoài hợp đồng

- Lệnh executor chạy `unittest discover` trọn thư mục `tests`: 38 bài, trong đó
  chỉ 10 bài thuộc `test_seed.py` gắn với AC-1..AC-6. 28 bài còn lại
  (`test_parse`, `test_redact`, `test_batches`, `test_tiers`, `test_schema_ratchet`)
  chạy kèm như hồi quy, không chứng minh tiêu chí nào của hồ sơ này.
- Hợp đồng để **đường gieo từ sơ đồ site** ngoài phạm vi, và đúng là không bài nào
  chạm nó. Hệ quả cần biết khi đọc: cũng không có bài nào **canh** cho đường sơ đồ
  giữ nguyên hành vi cắt-đầu — nếu ai đó sau này gọi `sample_across` cho cả nhánh
  sơ đồ thì bộ kiểm hiện tại vẫn xanh.
- `test_dai_rong_thi_tra_rong` (dải rỗng) xanh nhưng không gắn AC nào trong
  `evals.yaml`; đây là bài phòng thủ thêm của người viết mã.

## Analyst

E2, E3, E4, E5 — xanh trên cả nhánh lẫn khuôn cũ (cắt đầu bảng), nên chúng chứng
minh bộ kiểm chứ không chứng minh tính năng: `urls[:limit]` cũng trả đúng số
lượng, không lặp, ổn định giữa hai lượt, và trả hết khi không có trần. Bốn phép
đo này là rào hồi quy hợp lệ, không phải thước phân biệt. Hai phép đo phân biệt
thật là E1 và E6.

## Variance

none — không có phép đo nhiều lượt trong hồ sơ này

## Iterations

Round 1: cả sáu phép đo đạt ngay lượt đầu; không phải trả về khâu viết mã.

## Notes

Chiều đỏ của cặp đo (luật khai-sinh-thước) đã kiểm tay trong vòng này: tạm đổi
`sample_across` về `return urls[:limit] if limit is not None else list(urls)` và
chèn lại hai dòng dừng-sớm (`if limit is not None and len(found) >= limit: break`)
vào đầu vòng đọc trang danh bạ trong `__main__.py`, rồi chạy lại lệnh executor.

Ba bài đỏ, đúng ba bài mang thước mới:

- `test_seed.RaiDeu.test_mau_trai_khap_dai` — thông báo ghim: «mẫu không chạm phần
  tư cuối dải — vẫn đang cắt đầu bảng»
- `test_seed.GieoTuDanhBa.test_mau_cham_ca_trang_cuoi` — thông báo ghim: «không địa
  chỉ nào của trang danh bạ cuối lọt vào mẫu»
- `test_seed.GieoTuDanhBa.test_doc_het_tran_trang_khong_dung_som` — khẳng định số
  trang danh bạ đã đọc: đọc được 2 trang trong khi trần trang là 8

35 bài còn lại giữ nguyên màu xanh ở khuôn cũ. Sau đó khôi phục bằng
`git checkout -- tools/listing-crawl`, `git status --short` sạch ở phần mã, và
lượt chạy lại cho toàn bộ 38 bài xanh.
