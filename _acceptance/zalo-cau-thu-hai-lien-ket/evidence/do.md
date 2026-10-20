# Đo câu Zalo thứ hai trên eve thật

Lượt chạy bằng `eve eval tro-ly-kho/cau-thu-hai` trên kho đo dùng-một-lần, model mặc định của nhánh.
Tám người đã nối Zalo, mỗi người ba câu kho liên tiếp qua `/zalo/webhook` (Zalo giả nhận trả lời); câu sau gửi khi câu trước ra khỏi `dang-hoi` và đã lắng.
Mỗi câu ghi các tin Zalo giả nhận trong khoảng từ lúc gửi câu đó tới lúc gửi câu kế, cạnh câu trả lời dựng từ hàng TaiLieuHoi của chính câu (`cauKhoChoZalo` → `locTraLoi`).
Thư mục lượt: `.acceptance-runs/zalo-cau-thu-hai-lien-ket/2026-10-19T18-03-04-067Z`; mã thoát eve eval: 0.
Ngưỡng: câu lỗi model tối đa 1, trần 2 USD.

chi phi usd: 0.7217

| người | câu | mã | phiên gốc | ZaloHoi | TaiLieuHoi | tin Zalo | lỗi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| n1 | 1 | m01 | wrun_01M5ANA26ESSGP79TY9G5HE9B0 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n1 | 2 | m02 | wrun_01M5ANA26ESSGP79TY9G5HE9B0 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n1 | 3 | m03 | wrun_01M5ANA26ESSGP79TY9G5HE9B0 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n2 | 1 | m04 | wrun_01M5ANA26GJBP3VQWME1M6NKV1 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n2 | 2 | m05 | wrun_01M5ANA26GJBP3VQWME1M6NKV1 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n2 | 3 | m06 | wrun_01M5ANA26GJBP3VQWME1M6NKV1 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n3 | 1 | m07 | wrun_01M5ANA26JYV3SJR58HA4W4KA1 | dang-hoi | TRA_LOI | 0 tin lệch | het-cho |
| n3 | 2 | m08 | — | dang-ban | — | 1 tin lệch |  |
| n3 | 3 | m09 | — | dang-ban | — | 1 tin lệch |  |
| n4 | 1 | m10 | wrun_01M5ANA271YYGTE8K97CXHTDSR | dang-hoi | TRA_LOI | 0 tin lệch | het-cho |
| n4 | 2 | m11 | — | dang-ban | — | 1 tin lệch |  |
| n4 | 3 | m12 | — | dang-ban | — | 1 tin lệch |  |
| n5 | 1 | m13 | wrun_01M5ANA272KYDRHPHQKQ4VCTSF | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n5 | 2 | m14 | wrun_01M5ANA272KYDRHPHQKQ4VCTSF | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n5 | 3 | m15 | wrun_01M5ANA272KYDRHPHQKQ4VCTSF | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n6 | 1 | m16 | wrun_01M5ANA273K5RRPMYVK71AQ0BA | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n6 | 2 | m17 | wrun_01M5ANA273K5RRPMYVK71AQ0BA | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n6 | 3 | m18 | wrun_01M5ANA273K5RRPMYVK71AQ0BA | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n7 | 1 | m19 | wrun_01M5ANA274XQG2GH0XZ0FMDH2X | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n7 | 2 | m20 | wrun_01M5ANA274XQG2GH0XZ0FMDH2X | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n7 | 3 | m37 | wrun_01M5ANA274XQG2GH0XZ0FMDH2X | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n8 | 1 | m38 | wrun_01M5ANA273K5RRPMYVK71AQ0B9 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n8 | 2 | m39 | wrun_01M5ANA273K5RRPMYVK71AQ0B9 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
| n8 | 3 | m40 | wrun_01M5ANA273K5RRPMYVK71AQ0B9 | da-tra-loi | TRA_LOI | 1 tin khớp |  |
