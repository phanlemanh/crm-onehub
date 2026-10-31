---
schema_version: 1
slug: phan-tich-cau-hinh-bo-cao
feature: Phân tích cấu hình bộ cào ở biên, thay vì chuyền dict thô từ TOML xuống chỗ dùng
owner: omre.cnsp4@onemount.com
stage: decided
decision: park
decided_by: Phan Le Manh
decided_at: 2026-10-31T09:52:29Z
---

## Vấn đề & ai gặp

`config()` trong `listing_crawl/tiers.py` trả thẳng `tomllib.load` thành dict
thô. Mọi khoá đi từ đó xuống chỗ dùng không qua một lần kiểm nào.

Ca cụ thể Cổng Bằng chứng nêu (`d-ntt-ngoai-2`): `phone_reveal_tiers` chuyền qua
`gieo_va_cao` xuống `reveal_phones` — và `tiers` là tham số DUY NHẤT của hàm đó
không có chú kiểu. Gõ nhầm một tên mức, hoặc khai danh sách rỗng, thì tập đủ
điều kiện rỗng, hàm trả về sớm, **lượt cào 45 phút kết thúc xanh với
`co_so_dien_thoai: 0` và không một dòng log nào nói vì sao.**

Bộ từ vựng hợp lệ là thứ `tiers.tier_of` sinh ra. Chỗ duy nhất đối chiếu hai bên
hiện nay là một bài kiểm ghim nội dung `config.toml` đang ship — tức ghim tệp,
không phải lan can lúc chạy.

**Người trả giá:** người chạy lượt cào. Một lỗi gõ trong tệp cấu hình cho ra một
lượt chạy trông thành công mà không mang về số điện thoại nào.

`AGENTS.md` của kho đặt luật này thành một mục riêng: dữ liệu không kiểu vào tiến
trình thì phân tích thành kiểu miền NGAY TẠI BIÊN, và «parse failure là lỗi thật
với thông điệp thật».

## Ngả làm (chưa quyết)

1. Một hàm phân tích ở `tiers.py` trả về kiểu miền cho cả khối `[crawl]`, ném lỗi
   có tên khi một khoá thiếu hoặc sai giá trị. Mọi chỗ dùng nhận kiểu đã phân
   tích.
2. Hẹp hơn: chỉ phân tích `phone_reveal_tiers` đối chiếu với tập `tier_of` sinh
   ra, còn lại giữ nguyên. Rẻ, nhưng để nguyên lớp lỗi cho khoá kế tiếp.
3. Gộp với `d-ntt-ngoai-4` (bốn tên mức viết cứng ở ba nơi): nếu `tiers.py` sở
   hữu bộ từ vựng và phát ra nó, thì cả phép phân tích lẫn bảng đếm bốn mức đều
   dẫn xuất từ một nguồn.

## Quyết định Cổng Đáng 31/10

Xếp lại sau — Bộ cào tools/listing-crawl không có hàng nào trên lộ trình hiện tại; mở lại khi lộ trình có hàng cho bộ cào. Chủ kho 31/10 «Đồng ý theo khuyên» cho B9 của docs/plan/don-dep-3110.md (bác hoặc xếp lại hồ sơ treo ngoài kế hoạch), qua phiên giám sát Mac Studio; máy chọn từng hồ sơ.
