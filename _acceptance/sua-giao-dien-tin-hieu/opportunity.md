---
schema_version: 1
slug: sua-giao-dien-tin-hieu
feature: Người gửi tín hiệu đọc rõ hộp gửi và trang Tín hiệu đã gửi ở mọi khổ màn và mọi ngôn ngữ, thấy lỗi báo đúng chỗ, và đóng biên nhận không bị hỏi lại
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-14T08:00:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH6
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

> Mở 14/10/2026 từ hàng TH6 của «OKR» (`docs/plan/lo-trinh-okr.json`, đợt `vong-tin-hieu-1410`) bằng
> `lo-trinh.mjs --mo-o` (kit 2.28.0 giải nén, vì crm nhận kit 2.30 ở lô 10:00Z). Nhánh
> `fix/sua-giao-dien-tin-hieu` cắt từ `origin/onehub` `1997da85b`. Chủ kho gật mở vòng ~08:10Z qua phiên
> điều phối MacBook Pro. Phạm vi: U1–U8 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`; U9 (lớp phủ hộp
> thoại ở bộ giao diện chung) ngoài vòng.

## Vấn đề & ai gặp

Người gặp: **người gửi tín hiệu** — nhân viên và trưởng phòng ban, người dùng CRM thật từ 14/10, không dùng
git. Họ mở hộp «Gửi tín hiệu» ở đầu mọi màn và trang «Tín hiệu đã gửi» để theo dõi.

Bằng chứng: lượt rà giao diện «Gửi tín hiệu» trên production 14/10 (phiên LT2) thấy tám lỗi. Năm lỗi đầu đã
gửi thành tín hiệu thật crm-1 đến crm-5 bằng chính cửa này; ba lỗi sau soạn sẵn, chưa gửi.

Soát trên mã `1997da85b` (14/10), mỗi lỗi có chỗ đứng rõ, đều nằm trong ứng dụng web, không cần sửa bộ
giao diện chung:

| Mã | Điều người gửi gặp | Chỗ đứng trên mã |
|---|---|---|
| U1 (crm-1) | Ở khổ 768–1100px cột «Điều đã kể» còn khoảng 80px, chữ vỡ dòng từng từ | Bảng khai bốn cột bề rộng cố định (2 × `w-32`, `w-[36%]`, `w-12`), cột kể nhận phần còn lại |
| U2 (crm-2) | Lỗi «quá trần ngày» và lỗi máy chủ tô đỏ ô thứ hai như thể người gõ sai ô đó; quá trần rồi vẫn bấm Gửi được | Lỗi gắn vào ô «Điều gì xảy ra»; nút Gửi chỉ khoá khi trống |
| U3 (crm-3) | Giờ gửi luôn theo kiểu Việt dù chọn tiếng Anh; cột «Gửi lúc» lệch lề so với tiêu đề | Bộ định dạng giờ đóng cứng `vi-VN`; ô giờ căn phải kiểu số, tiêu đề căn trái |
| U4 (crm-4) | Biên nhận nói «Đã nhận tín hiệu crm-N» nhưng danh sách không hiện crm-N; hộp xoá chỉ nêu mã, không nêu điều đã kể | Mã chỉ có trong nhãn ẩn của nút ⋮ |
| U5 (crm-5) | Xoá xong tiêu điểm nhảy về đầu trang; nút ⋮ 24×24 trên điện thoại (dưới mức chạm 44); nút Gửi khoá mà không nói vì sao | Nút cỡ `icon-xs`; không trả tiêu điểm sau xoá; không dòng lý do |
| U6 | Gửi xong, bấm «Đóng» biên nhận vẫn hỏi «Bỏ những gì vừa nhập?» | Hộp thoại chung giữ cờ «đã nhập» từ lúc soạn. Hộp thoại đã có sẵn hai nút điều khiển việc hỏi lại (`coThayDoi`, `dongNgay`), ứng dụng chưa dùng |
| U7 | «Gửi từ màn» và cột «Màn» hiện đường dẫn thô (`/okr/abc123/...`) | Ghi và hiện nguyên đường dẫn; thanh điều hướng đã có sẵn bảng tên màn theo hai ngôn ngữ |
| U8 | Chữ trạng thái lặp ý giữa nhãn và câu, dùng từ nội bộ «gom»; tín hiệu đã lấy về thì mất nút xoá mà không nói vì sao | Câu trạng thái và nhãn viết riêng hai nơi; không có dòng giải thích khi hết xoá được |

**Đụng việc đang mở:** TH4 «Mọi tín hiệu cho quản trị» (PR #403, sẵn sàng gộp) sửa cùng ba tệp của vòng này
(danh sách, hộp gửi, câu trạng thái) và thêm câu báo trước Q3 vào hộp gửi. Vòng này dựng trên đỉnh onehub
SAU khi TH4 gộp; nếu TH4 chưa gộp lúc tới bước viết mã, máy gộp onehub mới nhất vào nhánh trước bước đó.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Cả tám lỗi sửa được trong ứng dụng web, không chạm bộ giao diện chung (luật tệp chung trên #375) | Phải mở việc ở bộ giao diện chung, vòng tách hai | Đọc mã từng lỗi | **Đạt 14/10** — U6 dùng hai nút hỏi-lại sẵn có của hộp thoại; U5 cỡ nút có sẵn biến thể lớn hơn |
| 2 | Tên màn đọc được từ bảng tên của thanh điều hướng, cả cho tín hiệu cũ đã lưu đường dẫn thô | Tín hiệu cũ (crm-1..5) vẫn hiện đường dẫn | Đường dẫn cũ đều bắt đầu bằng một mục của thanh điều hướng | Hướng làm: suy tên khi hiện, không đổi dữ liệu đã lưu — chốt ở S1 |
| 3 | Đổi câu trạng thái không làm lệch câu kit viết | Người gửi đọc hai giọng khác nhau | Câu sau gom vẫn đọc nguyên văn của kit (`cau_nguoi_gui`); chỉ sửa câu CRM tự viết và nhãn | Hướng làm, chốt ở S1 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người gửi tín hiệu trên production còn gặp lỗi nào trong tám lỗi U1–U8 không?
- Kết quả nào là SỐNG: lượt rà lại trên production, ở ba khổ 375 · 768–1100 · 1280 và hai ngôn ngữ, không còn lỗi nào trong tám lỗi; năm tín hiệu crm-1..5 được đánh dấu đã giao.
- Kết quả nào là CHẾT: còn từ một lỗi trở lên trong tám sau lượt rà → lặp một vòng sửa; còn sau vòng lặp thứ hai → dừng, đưa lỗi còn lại về bản phạm vi kế.
- Timebox: lượt rà lại trong 2 ngày kể từ ngày lên production.

## Kết quả prototype

Chưa dựng. Vòng chạm màn hình: bản bấm được làm ở nghi thức thiết kế cuối S1, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Câu trạng thái sau gom của từng tín hiệu | kit `scripts/tin-hieu.mjs` (`cau_nguoi_gui`) qua khối dữ liệu `LO-TRINH.html` | triết-lý/logic | có — đọc nguyên văn, không viết lại | |
| Bản phạm vi U1–U8 | `docs/plan/pham-vi-vong-tin-hieu-1410.md` (trong kho) | triết-lý/logic | có — là đề bài | |

## Cổng 0

- **decision = build** Căn cứ: chủ kho gõ trong phiên 14/10 «Cổng Đáng sua-giao-dien-tin-hieu: build ; ngưỡng: như đề xuất», trên khuyến nghị của máy bên dưới.
- **disposition = —** Căn cứ: không có bản mẫu dựng trước Cổng Đáng.
- **Ngưỡng UAT chốt cùng lúc ký:** bốn dòng của mục «Ngưỡng chết / ngưỡng UAT» như máy đề xuất, đã gỡ tiền tố đề xuất.

**Máy khuyến nghị:** `build`, một vòng T2 khoảng 10 tiêu chí (tám lỗi, cộng một tiêu chí khổ màn × ngôn ngữ
và một tiêu chí không đổi dữ liệu đã lưu), ngưỡng như đề xuất. Lỗi đã thấy, có người thật gặp, sửa rẻ và
đảo được; vòng không thêm bảng hay đường T3 nào.

## Thước đo thành công → ứng viên criterion

1. U1 — ở 768, 900 và 1100px cột «Điều đã kể» rộng nhất bảng, không chữ nào vỡ từng từ.
2. U2 — lỗi quá trần và lỗi máy chủ hiện dưới cả hộp (không ở ô nào); quá trần thì nút Gửi khoá kèm lý do; chữ đã gõ giữ nguyên.
3. U3 — giờ gửi theo ngôn ngữ đang chọn; cột «Gửi lúc» cùng lề với tiêu đề.
4. U4 — mỗi dòng danh sách hiện mã crm-N; hộp xoá nêu mã và điều đã kể.
5. U5 — xoá xong tiêu điểm về chỗ hợp lý trong danh sách; nút ⋮ trên điện thoại ≥ 44×44; nút Gửi khoá có dòng nói vì sao.
6. U6 — gửi xong, Đóng / Esc / bấm ra ngoài biên nhận đóng ngay, không hỏi lại; đang soạn có chữ thì vẫn hỏi.
7. U7 — «Gửi từ màn» và cột «Màn» hiện tên màn theo ngôn ngữ đang chọn, cả cho tín hiệu cũ.
8. U8 — nhãn và câu trạng thái không lặp ý, không dùng từ nội bộ; tín hiệu không xoá được thì nói vì sao.
9. Khổ màn × ngôn ngữ — hộp gửi và trang ở 375 / 768 / 1280, tiếng Việt và tiếng Anh, không tràn, không cắt chữ.

## Out of scope từ khám phá

- U9 — lớp phủ sau hộp thoại ở nền tối đen đặc: thuộc bộ giao diện chung, đi hàng riêng (chân trời TH7).
- Trang «Mọi tín hiệu» cho quản trị và câu báo trước Q3 — vòng TH4 (#403).
- Đổi khuôn hay câu trạng thái kit viết — thuộc kit; cần đổi thì báo phiên điều phối.
- Ghi lại đường dẫn của tín hiệu đã lưu thành tên màn — dữ liệu đã lưu giữ nguyên, tên suy lúc hiện.
- Thông báo cho người gửi khi tín hiệu đổi chỗ — S2 của bản phạm vi.
