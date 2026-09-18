---
schema_version: 2
feature_slug: truong-tu-tao-o-cai-dat
verdict: PASS
failed_evals: []
reason: ""
verified_by: mot agent context sach, chay tuan tu tung lenh
enforcement_mode: strict
bypass_used: false
verified_commit: ec4ba0c0a3322860a0bfe63fbbaccad499d65fa0
run_id: r2-tuan-tu-20260918T050907Z
human_signoff:
---

# Hồ sơ bằng chứng: truong-tu-tao-o-cai-dat

Vòng chấm 2, làn **tuần tự**. Hai mươi mốt thước và bốn lệnh cổng, tổng hai
mươi lăm lệnh, tất cả mã thoát 0. Không lệnh nào bị công cụ ngắt.

## Vì sao làn tuần tự, không phải bầy song song

Vòng 1 chạy bầy song song hai lần, ba mươi lăm rồi hai mươi chín agent, cả hai
lần đều **BLOCKED**: các agent không lái được trình duyệt trong môi trường của
chúng (MCP mất kết nối, script treo ở bước dựng phiên dev). Điều khoản
`CLASSIFIER-FALLBACK` của kho cấm tung lại lần thứ ba cùng một cách và buộc
lượt kế đi verify độc lập, lệnh chạy tuần tự.

Tuần tự còn đúng về bản chất, không chỉ là đường lùi: bốn thước trong bộ này tạo
rồi xoá trường trên **cùng một** cơ sở dữ liệu. Chạy song song thì chúng đụng
nhau. Đó là lý do thật của một chỗ đỏ ở vòng 1, khi một thước thấy trên API một
trường mà thước khác vừa tạo và chưa dọn.

## Bảng kết quả

| Thước | Tiêu chí | Loại | Kết quả |
|---|---|---|---|
| E1 | AC-6 | script | PASS |
| E2 | AC-7 | script | PASS |
| E3 | AC-8 | script | PASS |
| E4 | AC-13 | script | PASS |
| E5 | AC-1 | ui-check | PASS |
| E6 | AC-3 | ui-check | PASS |
| E7 | AC-4 | script | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-9 | script (tầng sau) | PASS |
| E10 | AC-10 | script (tầng sau) | PASS |
| E11 | AC-11 | script (tầng sau) | PASS |
| E12 | AC-12 | ui-check | PASS |
| E13 | AC-5 | test | PASS |
| E14 | AC-2 | ui-check | PASS |
| E15 | AC-14 | script (tầng sau) | PASS |
| E16 | AC-15 | script | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-15 | script | PASS, 14/14 ca phá thử |
| E19 | AC-17 | script | PASS |
| E20 | AC-18 | script | PASS |
| E21 | AC-19 | script (tầng sau) | PASS |

Bốn lệnh cổng của kho: `bun run test` (288 bài, 11 gói) · `turbo run lint --force`
(9 gói) · `bun run lint:slop` (0 cảnh báo, 0 lỗi) · `turbo run build --force`
(4 gói). Tất cả thoát 0.

## Giới hạn đã khai, người ký cần biết trước khi ký

1. **Làn tuần tự do một agent context sạch chạy, không phải bầy chấm song song.**
   Agent đó không viết mã này, nên điều kiện doer khác grader được giữ. Nhưng nó
   chạy trên cùng máy và cùng máy chủ dev với phiên viết mã.
2. **Bàn phím và khổ hẹp không có phép đo máy nào.** Đặc tả UX mục 4 khai ba
   hành vi: ba thẻ cuộn ngang ở khổ hẹp, ba thẻ đi được bằng mũi tên, ô sửa đóng
   bằng Esc. Không thước nào trong hai mươi mốt thước đo ba điều đó. Bốn thước
   dạng kiểm giao diện đều chạy ở một khổ duy nhất, 1280 nhân 900.
3. **Phiên thiết kế bị bỏ bằng một dòng quyết định, và dòng đó chưa ai đọc.**
   Dòng `d-20260918T012859Z-7` bỏ nghi thức S1-D với lý do trang mới không sinh
   hình thái mới. Cổng Phạm vi lại chốt ở đường máy đi tiếp nên không thẻ nào
   được trình, tức không mắt người nào đọc dòng đó. Trạng thái rỗng và trạng
   thái lỗi có ảnh trong `evidence/`, nhưng chưa ai duyệt chúng như một quyết
   định thiết kế.
4. **Phép đếm ngưỡng bốn tuần là xấp xỉ bằng loại trừ**, vì bảng dữ liệu không
   có cột ghi ai tạo trường. Chi tiết ở mục Đường đo của hợp đồng.
5. **Bốn tiêu chí là phạm vi nới thêm sau khi chốt phạm vi**: AC-16 ở bước viết
   mã, và AC-17 AC-18 AC-19 theo quyết định nâng phạm vi của người ký.

## Ngoài hợp đồng

Ba mục ngoài hợp đồng của vòng 1 đã được người ký quyết lối «nâng phạm vi sửa
ngay» và đã sửa, mỗi mục thành một tiêu chí có thước: AC-17, AC-18, AC-19.

Lượt chấm này không sinh mục ngoài hợp đồng mới.

## Iterations

Vòng 1, bầy song song, hai lượt: BLOCKED cả hai. Lượt một bắt năm phép đo rỗng
của chính bộ đo (lệnh khai bằng `node` khi thước cần `bun`; một thước hứa sáu
việc mà làm hai; một thước bỏ nửa phép đo rồi báo đạt; một thước khẳng định yếu
hơn điều đã khai; một thước để lại rác mang đúng nhãn gợi ý thật). Lượt hai bắt
phép đo rỗng thứ sáu (hàm đọc mô tả trang bắt cả tiêu đề) và ba mục ngoài hợp
đồng. Tất cả đã sửa.

Vòng 2, làn tuần tự: 25/25 mã thoát 0.
