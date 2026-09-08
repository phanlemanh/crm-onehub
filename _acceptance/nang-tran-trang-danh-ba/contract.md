---
schema_version: 1
feature: Bộ gieo đọc danh bạ tới khi cạn thay vì tới một trần đoán, và lộ số điện thoại theo danh sách tầng khai trong cấu hình
slug: nang-tran-trang-danh-ba
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [cli]
design_doc: docs/superpowers/specs/2026-09-08-nang-tran-trang-danh-ba-design.md
status: verified
approved_by: Mạnh
approved_at: 2026-09-08
veto_state: mo
veto_opened_at: 2026-09-08T01:35:48Z
---

# Acceptance Contract: nang-tran-trang-danh-ba

## Context

Vòng `gieo-rai-deu-danh-ba` dạy bộ gieo rải mẫu đều qua các trang danh bạ,
nhưng ở `directory_max_pages = 8` cả danh bạ đọc được chỉ ra 88 người, đều ở
đầu bảng — không có gì để rải. Mức «Thấp» và «Ngủ» vẫn rỗng.

Chủ sản phẩm chốt ở Cổng Đáng: đội tiếp thị cần môi giới sản lượng thấp cho CẢ
HAI việc — gọi tuyển họ, và để thước phân khúc chia đủ bốn mức. Vế gọi tuyển kéo
theo số điện thoại, mà `reveal_phones` hiện chỉ lộ số cho mức «cao».

Năm lượt dò danh bạ thật ở S1 (dùng đúng bộ nạp và nhịp của bộ cào) lật ngửa ba
điều:

| Số đo | Giá trị | Cách đo |
| --- | --- | --- |
| Thẻ mỗi trang | 11, đều qua mọi trang đọc được | 74 trang đọc được ở bốn lượt dò |
| Tin hiện có, trang 1 | 83 đến 458 | lượt dò 1–40 |
| Tin hiện có, trang 93 | 1 | lượt dò 45–130 |
| Trang sâu nhất còn người | **93, và vẫn đầy 11 thẻ** | lượt dò 45–130 |
| Đáy danh bạ | **CHƯA ĐO ĐƯỢC** — lượt dò dừng vì chuỗi trang không tải được, không vì hết người | — |
| Trang hỏng, vùng trang 1–40 | 3 trên 40 (7,5%) | lượt dò 1 |
| Trang hỏng, vùng trang 45–93 | 12 trên 49 (24%) | lượt dò 4 |

**Một trang rỗng KHÔNG phải dấu hiệu hết danh bạ**: trang 44 trả về 0 thẻ ở cả
hai lần đo, không mang dấu hiệu chặn, mà trang 45 lại có đủ 11 thẻ.

**Trang hỏng cũng «không ra người mới»**, và ở vùng sâu cứ bốn trang có một
trang hỏng. Nên phép đếm để dừng đọc PHẢI phân biệt trang-đọc-được-mà-rỗng với
trang-không-đọc-được; gộp hai thứ đó là tái tạo đúng lớp lỗi vòng này sinh ra để
chữa, mà lần này im lặng hơn vì chưa chạm trần nên không cờ nào bật.

Nên trần trang là chính sách sai chỗ: số đúng hôm nay là số sai tháng sau. Trần
phải thành lan can, chính sách phải là «đọc tới khi cạn».

Source input: `_acceptance/nang-tran-trang-danh-ba/opportunity.md` · sổ quyết
định `d-gieo-ngoai-1` của vòng trước · thiết kế S1 ở `design_doc`

## Criteria

- AC-1: Given một danh bạ mà trang thứ k không ra người mới nhưng trang k+1 có, When gieo, Then bộ gieo KHÔNG dừng ở trang k — nó đọc tiếp, và người ở trang k+1 vào được mẫu.
- AC-2: Given danh bạ đã cạn thật — `directory_stop_after_empty` trang LIÊN TIẾP ĐỌC ĐƯỢC mà không ra người mới, When gieo, Then bộ gieo dừng ngay tại đó, KHÔNG đọc nốt tới trần, và cờ bị-trần-cắt TẮT.
- AC-3 (cross-layer): Given một chuỗi trang danh bạ KHÔNG TẢI ĐƯỢC dài bằng hoặc hơn `directory_stop_after_empty`, rồi sau đó là trang còn người, When gieo, Then bộ gieo KHÔNG dừng ở chuỗi đó — trang hỏng không được tính vào phép đếm dừng, và người ở trang sau vẫn vào mẫu.
- AC-4 (cross-layer): Given danh bạ còn người khi đã chạm `directory_max_pages`, When gieo, Then bộ gieo dừng ở trần, và bản tổng kết mà lệnh IN RA mang cờ bị-trần-cắt BẬT.
- AC-5: Given `phone_reveal_tiers` khai gồm cả mức thấp, When lộ số, Then hồ sơ mức «thấp» và «ngủ» cũng được lộ số — không chỉ mức «cao».
- AC-6: Given số hồ sơ đủ điều kiện lộ số vượt `phone_reveal_cap`, When lộ số, Then số lượt lộ số bằng ĐÚNG trần, và tập được lộ TRẢI KHẮP lô chứ không phải phần đầu — số hồ sơ mức «thấp» cộng «ngủ» được lộ số lớn hơn 0 kể cả khi mọi hồ sơ mức «cao» xếp đầu lô.
- AC-7 (cross-layer): Given một hoặc nhiều trang danh bạ tải hỏng giữa lượt, When kết thúc, Then bản tổng kết mà lệnh IN RA khai đúng số trang danh bạ đã đọc, số trang hỏng, và bảng đếm hồ sơ theo bốn mức Sản lượng.
- AC-9: Given bộ dựng sẵn là phân bố tin-hiện-có ĐO ĐƯỢC từ danh bạ thật (`tests/fixtures/phan-bo-danh-ba.json`, 407 người, 9 tới 458 tin, đã bỏ tên và địa chỉ), When rải mẫu 200 người qua cả dải, Then mẫu CHẠM TỚI ĐÁY dải — người ít tin nhất trong mẫu đúng bằng người ít tin nhất của cả danh bạ — và mẫu chứa người có tin hiện có dưới ngưỡng «vừa». Đối chứng: khuôn cắt-đầu trên cùng bộ dựng sẵn KHÔNG chạm đáy.
- AC-8: Given cấu hình đang ship, When đọc `config.toml`, Then `directory_max_pages` bằng ĐÚNG 120, `directory_stop_after_empty` bằng ĐÚNG 3, và `phone_reveal_tiers` khai đủ bốn tên mức mà `tiers.tier_of` sinh ra.

## Coverage

- Trục A — núm đổi: trần trang (AC-4, AC-8) | điều kiện dừng đọc (AC-1, AC-2, AC-3) | danh sách tầng lộ số (AC-5, AC-8) | trần lộ số (AC-6) [thước CE: bốn khoá điều khiển đường đi trong `config.toml`, đếm được từ mã]
- Trục B — tầng sản lượng đích: Cao | Vừa | Thấp (AC-5, AC-9) | Ngủ (AC-5) [thước CE: `CONTEXT.md` mục **Sản lượng** khai đóng đúng bốn mức]
- Trục C — cách hỏng: trang bị chặn (AC-3 chi phối vòng dừng, AC-7 khai ra) | trang rỗng giữa danh bạ (AC-1) | danh bạ cạn trước trần (AC-2) | chạm trần khi danh bạ còn (AC-4) | lộ số thất bại [thước CE: bốn cái đầu đo được từ năm lượt dò danh bạ thật ở S1; cái cuối đã có nhánh `continue` sẵn trong `reveal_phones`, không đổi ở vòng này]
- Chân ngành [NGÀNH: Apollo.io, ZoomInfo]: sàn dữ liệu người-mua-tiềm-năng tách «tìm được người» khỏi «lộ số điện thoại» và đặt hạn mức riêng cho vế sau — vào đây thành AC-5, trần lộ số là núm riêng không suy ra từ trần người.

## Out of scope

- Đổi ngưỡng tầng 60/20/1 — số đó thuộc định nghĩa **Sản lượng** trong `CONTEXT.md`, không thuộc vòng này.
- Rải mẫu có trọng số theo tầng (lấy nhiều người mức thấp hơn mức cao) — bộ rải giữ nguyên bước đều của vòng trước.
- Thử lại trang danh bạ bị chặn. Vòng này chỉ KHAI ra số trang hỏng; chữa nó là việc riêng, và cách chữa (thử lại, đổi nhịp, đổi đường ra) chưa ai cân.
- Đọc danh bạ tỉnh khác — cấu hình hiện khai đúng một đường dẫn TP Hồ Chí Minh.
- Bỏ trần lộ số. Nới tầng mà bỏ trần là mở một đường chi phí không đáy trên dữ liệu cá nhân của người thật.
- Đường gieo từ sơ đồ site — vẫn chết ở sàn này, giữ nguyên như vòng trước đã chốt.

## Đường đo

Ngưỡng ở `opportunity.md` là «hai mức Thấp và Ngủ vẫn rỗng». Vòng này đo được
phần chứng minh bằng nguồn, và để lại đúng một ô cho Cổng Giá trị:

| Ngưỡng | Số từ đâu | AC nào bảo đảm |
| --- | --- | --- |
| Mẫu chạm được người KHÔNG THỂ là mức Cao hay Vừa | 262 trên 407 người đo được ở lượt dò có tin hiện có dưới 20; AC-9 khẳng định bộ rải đưa họ vào mẫu | AC-9 |
| Bộ gieo không phụ thuộc một con số trần đoán | Danh bạ sâu ít nhất 93 trang, đáy chưa chạm; AC-2 và AC-3 làm chính sách dừng độc lập với trần | AC-2, AC-3 |
| Gọi được người mức thấp | Người chốt ở Cổng Đáng: cần gọi tuyển; AC-5 và AC-6 đưa số điện thoại của họ về | AC-5, AC-6 |
| **Mức Thấp và Ngủ THẬT SỰ có người sau một lượt nạp** | **CHƯA ĐO** — cần một lượt cào thật với cấu hình đang ship. Đo ở phiên nghiệm thu, không phải ở vòng này | AC-7 in ra bảng đếm bốn mức để phiên đó có số mà đọc |

**Mức «Ngủ» có thể rỗng vì nguồn, không phải vì bộ cào.** Trang sâu nhất đo được
(93) vẫn còn người có 1 tin hiện có, tức vẫn là mức «Thấp». Không lượt dò nào
bắt gặp hồ sơ 0 tin. Bốn mức là bốn NGĂN của trục Sản lượng, không phải bốn lời
hứa rằng ngăn nào cũng có người.

## Notes

- Đổi lấy — con số, không phải cảm giác: mỗi trang danh bạ tốn khoảng 5,5 giây (`request_delay_seconds` 1,5 cộng `render_wait_seconds` 4,0). Danh bạ sâu ít nhất 93 trang, nên phần đọc danh bạ đi từ 44 giây (trần 8) lên khoảng 9 phút. Phần lộ số nay chạm tới `phone_reveal_cap` = 200 người thay vì chỉ số ít người mức cao, mỗi lượt lộ số là một lượt tải trang nữa, tức thêm khoảng 18 phút. Một lượt nạp trọn ở `--limit 200` rơi vào khoảng 45 phút. Đây là việc chạy theo đợt nên đắt về thời gian chấp nhận được; cái không chấp nhận được là đắt mà im, nên AC-7 nằm trong phạm vi.
- AC-7 kéo mục **Ngoài-2** của vòng `gieo-rai-deu-danh-ba` từ «hạn chế đã biết» vào phạm vi. Lý do: ở trần 8 trang một trang chặn mất 11 người ở cùng một chỗ trong dải; ở trần 45 trang với mẫu rải đều, một trang chặn lấy mất một lát của cả dải, và im lặng thì không ai biết mẫu đã hỏng.
- `directory_max_pages = 120` là lan can, không phải chính sách. Đáy danh bạ CHƯA đo được (lượt dò dừng ở trang 93 vì chuỗi trang không tải được, không vì hết người), nên 120 chọn theo chi phí: 120 trang là khoảng 11 phút đọc, và nếu danh bạ dài hơn thế thì cờ bị-trần-cắt của AC-4 bật để người biết mà nâng.
- Chênh số cần nói rõ: `opportunity.md` ghi «khoảng 98 hồ sơ» ở trần 8, lượt dò 08/09 đo được 11 thẻ mỗi trang tức 88. 98 là số hồ sơ NẠP ĐƯỢC của lượt cào thật ngày 05/09, chạy trước khi bộ gieo được sửa và với số trang đọc được khác. Con số dùng cho mọi phép nhân trong hồ sơ này là **11 thẻ mỗi trang, đo được**.
- Số điện thoại là dữ liệu cá nhân của người thật. Bằng chứng của vòng này dùng `--redact`; lượt nạp thật thì không.
