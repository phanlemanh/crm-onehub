---
schema_version: 1
slug: hop-thong-bao-tren-web
feature: Người dùng CRM thấy mọi điều CRM muốn báo ở chuông trên đầu trang, biết số chưa đọc và bấm vào là tới đúng chỗ cần làm
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-14T02:34:36Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TB1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

> Mở 14/10/2026 từ hàng TB1 của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng `lo-trinh.mjs --mo-o` (kit
> v2.28.0, giải nén theo tag), nhánh `feat/hop-thong-bao-tren-web` cắt từ `origin/onehub` `762acca38`.
> Chủ kho duyệt hàng 14/10 trong phiên LT2 (đợt «vòng tín hiệu tự chạy», bản phạm vi
> `docs/plan/pham-vi-vong-tin-hieu-1410.md`, mã N1 và N2). Hàng là gốc của TB2, TH2, TH3. Máy MacBook Pro
> giữ hàng, đã khai ở phanlemanh/crm-onehub#375 lúc 02:03Z.

## Vấn đề & ai gặp

«Người dùng CRM thấy mọi điều CRM muốn báo ở chuông trên đầu trang, biết số chưa đọc và bấm vào là tới đúng chỗ cần làm»

**Người gặp:**

- **Người chưa nối Zalo hay Slack.** CRM tính sẵn mỗi sáng những gì cần nhắc người đó — bước onboarding quá
  hạn, việc chờ họ đánh giá, KR im, OKR bị trả lại, tài liệu chờ duyệt… — rồi **bỏ đi**: lượt nhắc của họ
  đóng với kết quả «không có kênh», không lưu ở đâu, không hiện ở đâu. Từ 14/10 người dùng phòng ban vào CRM
  thật; phần lớn chưa nối Zalo.
- **Người đã nối.** Nhắc tới qua Zalo hay Slack, trôi trong chat; không có chỗ trong CRM để xem lại hôm qua đã
  được nhắc gì, đã xử cái nào.
- **Chủ kho và quản trị.** Không có hàng đợi «việc cần tôi quyết» trong CRM. TH2 («Có n tín hiệu mới») và TH3
  (người gửi biết tín hiệu đổi chỗ) cần một chỗ để báo — hàng này là chỗ đó.

**Đo 14/10 (đọc mã trên `762acca38`):**

| Phép đo | Kết quả |
|---|---|
| Kênh báo trong CRM | **Không có.** Ba kênh là Zalo, Slack, và thư (chỉ đặt lại mật khẩu). Không bảng nào lưu điều đã báo cho từng người, không có khái niệm đã đọc |
| Điều CRM muốn báo hôm nay | Một nguồn: lượt nhắc buổi sáng 08:30 gom ~20 loại mục — onboarding (bước quá hạn, sắp hạn, kế hoạch im, mốc ngày), Việc (quá hạn, sắp hạn, chờ đánh giá), OKR (10 loại: cập nhật tuần, chờ duyệt, trả lại, hỏi ý, KR im, được giao, nhắc tên, ghi nhận, theo dõi), tài liệu chờ duyệt, tóm tắt OKR cho trưởng phòng, cảnh báo trần AI cho quản trị |
| Người không có kênh | Lượt nhắc đóng `khong-khop` / `khong-slack`: toàn bộ mục bị bỏ, không lưu |
| Dẫn tới đúng chỗ | Tin Zalo đã mang đường dẫn, nhưng một số chỉ tới trang danh sách (tài liệu chờ duyệt, cài đặt OKR), chưa tới bản ghi |
| Mẫu có sẵn trên đầu trang | Nút «Hàng làm giàu» có số đếm + ô bật ra + hỏi lại định kỳ (3 giây khi bận, 30 giây khi rảnh) — cùng dáng chuông cần. Không có websocket; mọi chỗ cập nhật trong app dùng hỏi lại định kỳ |
| Từ điển | `CONTEXT.md` mục «Nhắc buổi sáng» cấm chữ «thông báo» với lý do «kho không có bảng thông báo; gọi là thông báo thì người dùng đi tìm chuông trong app» — hàng này làm lý do đó hết đúng, phải sửa mục và thêm mục «Thông báo» |

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người chưa nối kênh có mở CRM đều đặn, nên chuông là đủ để họ biết việc | Thông báo nằm trong chuông mà không ai mở; người vẫn không biết có việc | Đếm số ngày đăng nhập của người không có kênh trong 2 tuần đầu từ 14/10 | Chưa thử — đo ở Cổng Giá trị |
| 2 | Nhắc buổi sáng là đủ làm nguồn đầu tiên: «mọi điều CRM muốn báo» hôm nay đều đi qua nó | Chuông thiếu những thứ người dùng mong (vd «có người vừa giao việc cho bạn» ngay lúc giao) | Liệt kê lúc S1: mỗi loại mục nhắc có một loại thông báo; sự kiện tức thời ghi thành ứng viên vòng sau | Đọc mã 14/10: đúng một nguồn |
| 3 | Mục lặp mỗi sáng (bước quá hạn nhiều ngày, KR im) không làm chuông thành rác | Chuông có hàng chục dòng giống nhau, người thôi đọc | Luật gộp ở S1: một thông báo cho mỗi (người, loại, bản ghi) còn mở; mục hết rồi quay lại mới ghi lại | Hướng làm, chốt ở S1 |
| 4 | Ghi thêm một hàng mỗi mục mỗi người mỗi ngày không nặng | Bảng phình, đầu trang chậm | Ước theo số người × số mục trung bình; giữ 90 ngày | Chốt ở S1 |
| 5 | TB2 rẽ Zalo/Slack từ cùng bản ghi mà không phải đổi khuôn của TB1 | TB2 phải viết lại bảng | Khuôn bản ghi có sẵn ô «loại», «mức», «dẫn tới» mà TB2 cần; TB1 không gửi kênh nào | Hướng làm, chốt ở S1 |

## Câu hỏi lớn: chuông nhận gì ở vòng này

Ràng buộc chung: hàng thêm một bảng dữ liệu nên chạy T3; TB2 (một thông báo nhiều kênh, cài đặt loại × kênh)
là vòng riêng, nên ở vòng này Zalo và Slack **không đổi gì**.

| | **Lối 1 — Ghi từ lượt nhắc buổi sáng** *(máy khuyên)* | Lối 2 — Ghi ngay lúc sự kiện xảy ra | Lối 3 — Chỉ dựng chuông, nguồn là dữ liệu mẫu |
|---|---|---|---|
| Nguồn | Cùng phép tính nhắc buổi sáng, chạy cho **mọi người** bất kể kênh; mỗi mục thành một thông báo | Mỗi chỗ trong API sinh sự kiện (giao việc, trả lại OKR, nhắc tên…) tự ghi thông báo | Bộ nạp mẫu; nguồn thật để TB2 |
| Người không có kênh | Nhận đủ mọi mục từ sáng mai | Nhận sự kiện tức thời; mục kiểu «quá hạn», «KR im» không có sự kiện nên vẫn thiếu | Không nhận gì trên production |
| Kịp thời | Một lần mỗi sáng 08:30, như Zalo | Ngay lúc xảy ra | — |
| Chi phí | Một chỗ ghi; mỗi loại mục cần một đường dẫn tới đúng bản ghi | Sửa nhiều module API, có module đường T3; hai phép tính «điều cần báo» song song với nhắc buổi sáng sẽ lệch nhau | Rẻ nhất |
| Ngưỡng đo được không | Được: đối chiếu lượt nhắc với bảng thông báo | Không đo «mọi thông báo» được vì nhắc buổi sáng vẫn không vào chuông | Không — chuông rỗng |
| Đảo ngược | **Rẻ** — thêm nguồn tức thời sau không đổi bảng | Rẻ về dữ liệu, đắt về mã | Rẻ |

Máy khuyên **Lối 1**: một nguồn, đúng chỗ người không có kênh đang mất việc, ngưỡng đo được bằng đối chiếu.
Cái giá là thông báo tới mỗi sáng chứ chưa tới tức thì; sự kiện tức thời là ứng viên vòng sau, đi chung với
TB2.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người không nối Zalo hay Slack có nhận đủ điều CRM muốn báo trên web, và người dùng có dùng chuông để tới chỗ cần làm không?
- Kết quả nào là SỐNG: trong 30 ngày kể từ ngày lên production: mọi mục nhắc buổi sáng CRM tính cho người không có kênh đều có thông báo tương ứng trong chuông (đối chiếu lượt nhắc với bảng thông báo theo ngày: 0 mục mất); và ít nhất một nửa số người có thông báo đã bấm mở ít nhất một thông báo.
- Kết quả nào là CHẾT: có mục nhắc không vào chuông mà không ai biết vì sao; hoặc hết 30 ngày mà dưới một phần tư số người có thông báo từng bấm mở một thông báo. Giữa hai ngưỡng → lặp.
- Timebox: 30 ngày kể từ ngày lên production.

## Kết quả prototype

Chưa dựng. Vòng chạm màn hình: bản bấm được làm ở nghi thức thiết kế cuối S1, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Phép tính «điều cần nhắc» | `packages/db/src/onboarding-nhac.ts` (`viecCanNhac`) và các nguồn OKR, tài liệu, AI, Việc | triết-lý/logic | có — chuông đọc đúng phép tính này, không tính lần hai | |
| Đường dẫn trong tin Zalo | `apps/agent/agent/lib/nhac-ke-hoach.ts` (`duongMo`) | triết-lý/logic | có — làm sâu thêm tới bản ghi khi đang chỉ tới trang danh sách | |
| Dáng nút đếm + ô bật ra trên đầu trang | `apps/app/components/enrichment-queue.tsx` | ngôn-ngữ-thiết-kế/hình-thái | có — dựng bằng `packages/ui` theo `docs/design.md` | |
| Mẫu hộp thông báo thị trường | tra ở S1 (Mobbin) | ngôn-ngữ-thiết-kế/hình-thái | không — chỉ rút cách xếp | |

## Cổng 0

- **decision = build** Căn cứ: chủ kho gõ trong phiên 14/10 «Cổng Đáng hop-thong-bao-tren-web: build ; chuông nhận: lối 1 ; ngưỡng: như đề xuất», trên khuyến nghị của máy bên dưới.
- **disposition = —** Căn cứ: không có bản mẫu dựng trước Cổng Đáng.
- **Ngưỡng UAT chốt cùng lúc ký:** bốn dòng của mục «Ngưỡng chết / ngưỡng UAT» như máy đề xuất, đã gỡ tiền tố đề xuất.
- **Chuông nhận gì ở vòng này chốt cùng lúc ký: Lối 1** — ghi từ lượt nhắc buổi sáng cho mọi người bất kể kênh; Zalo và Slack không đổi. Đổi lối là một Cổng Đáng mới.

**Máy khuyến nghị:** `build`, **Lối 1**, một vòng khoảng 10 tiêu chí, hạng T3 (bảng mới — thêm cổng duyệt kế
hoạch). Vượt 13 tiêu chí thì máy tự tách trang lịch sử thành vòng hai, không hỏi lại. Bảng mới đi kèm
migration chỉ thêm bảng, không đổi dữ liệu có sẵn; máy vẫn báo trước ở #375 theo luật 5.

## Thước đo thành công → ứng viên criterion

Bản ghi:

1. Mỗi sáng, mỗi mục nhắc của mỗi người thành một thông báo: người nhận, chuyện gì, dẫn tới đâu, lúc nào, đã đọc chưa — kể cả người không có kênh.
2. Mục lặp không sinh dòng mới khi thông báo cũ của cùng bản ghi còn chưa xong; mục hết rồi quay lại thì ghi lại.
3. Lượt nhắc Zalo/Slack giữ nguyên hành vi; ghi thông báo hỏng không làm hỏng lượt gửi Zalo/Slack và ngược lại.

Chuông:

4. Chuông trên đầu trang ở mọi màn, có số chưa đọc; 0 thì không có số; quá 99 thì «99+».
5. Bấm chuông mở danh sách chia «Hôm nay» và «Trước đó», mới nhất trên cùng.
6. Bấm một thông báo là tới đúng bản ghi hay đúng chỗ cần làm, và thông báo thành đã đọc.
7. «Đánh dấu tất cả đã đọc»; số chưa đọc về 0 ngay.
8. Trang lịch sử xem mọi thông báo cũ, lọc chưa đọc.
9. Người chỉ thấy thông báo của mình; thông báo dẫn tới bản ghi người đó không còn quyền xem thì nói rõ, không mở trang lỗi.

Đường đo:

10. Đếm theo ngày: mục nhắc đã tính và thông báo đã ghi, cho người có và không có kênh; số người đã bấm mở thông báo — số cho ngưỡng ở trên.
11. `CONTEXT.md` có mục «Thông báo»; mục «Nhắc buổi sáng» bỏ lý do đã hết đúng.

## Out of scope từ khám phá

- Zalo và Slack rẽ từ bản ghi thông báo; cài đặt loại × kênh, mức Cần làm / Để biết — TB2 (N3, N4).
- «Có n tín hiệu mới» cho quản trị — TH2 (N5). Người gửi nhận thông báo khi tín hiệu đổi chỗ — TH3 (S2).
- Thông báo tức thời lúc sự kiện xảy ra (giao việc, nhắc tên) — ứng viên vòng sau, nếu chủ kho chọn Lối 1.
- Đẩy qua trình duyệt, thư, ứng dụng điện thoại.
- Cập nhật tức thời bằng websocket — dùng hỏi lại định kỳ như các chỗ khác trong app.
- Xoá, ẩn hay tạm tắt từng thông báo; nhóm thông báo theo bản ghi.
