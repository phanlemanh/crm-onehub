---
schema_version: 1
slug: lo-trinh-doc-ban-chup
feature: Trưởng phòng ban mở trang Lộ trình và thấy đúng lộ trình mới nhất của nhánh chính, kèm giờ lấy, mà trang không phải chờ một bản dựng production
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT1c
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

> Mở 14/10/2026 từ hàng LT1c của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng `lo-trinh.mjs --mo-o` (kit
> 2.28.0 giải nén, crm nhận 2.30 ở lô 12:00Z), nhánh `feat/lo-trinh-doc-ban-chup` cắt từ `origin/onehub`
> `1997da85b`. Chủ kho duyệt hàng 14/10 (PR #397) và gật mở vòng qua phiên điều phối MacBook Pro. Hàng đứng
> trên LT1 (trang Lộ trình, đã gộp #329); LT3 (lộ trình nhiều sản phẩm) và TH3 (trạng thái tín hiệu) đứng trên
> hàng này.

## Vấn đề & ai gặp

Mở từ hàng LT1c của «OKR» (`docs/plan/lo-trinh-okr.json`).

Trưởng phòng ban mở trang Lộ trình và thấy đúng lộ trình mới nhất của nhánh chính, kèm giờ lấy, mà trang không phải chờ một bản dựng production

Vì sao: Trang hôm nay đọc tệp đóng gói lúc dựng, nên chỉ đọc được đúng một kho. Với riêng kho CRM, đọc bản chụp chỉ bớt được vài phút dựng và tách trang khỏi cửa sổ gộp; giá trị chính là làm nền cho lộ trình nhiều sản phẩm (LT3).

**Người gặp:** trưởng phòng ban và nhân viên xem trang Lộ trình (người dùng CRM thật từ 14/10); chủ kho, người
sẽ đọc lộ trình của sản phẩm khác trên cùng trang (LT3); người gửi tín hiệu, người sẽ đọc trạng thái tín hiệu
của mình từ cùng bản chụp (TH3).

**Đo 14/10:**

| Phép đo | Kết quả |
|---|---|
| Trang hôm nay đọc gì | Tệp `LO-TRINH.html` đóng gói vào bản dựng app; không nói giờ lấy. Chỉ đọc được đúng kho CRM |
| Từ lúc gộp vào nhánh chính tới khi production chạy bản mới (12 lần gộp gần nhất, 13–14/10) | **1–2 phút** mọi lần, 12/12 bản dựng thành công |
| Lộ trình đổi bao nhiêu lần | 127 trên 175 lần gộp trong 14 ngày (73%) đổi `LO-TRINH.html` |
| Cỡ tệp | 337 KB, khối dữ liệu là một phần của nó |
| Hệ quả | Với riêng CRM, trang đã theo kịp nhánh chính trong vài phút — ngưỡng «10 phút» ở dưới **đã đạt bằng cách làm hôm nay**. Thứ hàng này thêm cho người xem CRM là **giờ lấy** và việc trang **không đứng yên khi một bản dựng hỏng**. Giá trị chính nằm ở LT3 và TH3 |

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một bản chụp lấy ngoài bản dựng là nền đúng cho LT3: sản phẩm khác không nằm trong bản dựng CRM nên chỉ đọc được qua bản chụp | LT3 phải dựng lại đường lấy, hàng này thành việc thừa | Đọc hình «Đích» của LT3 (14/10): CRM rơi về tệp đóng gói, sản phẩm khác đọc bản chụp | Khớp ghi chú hàng LT3 |
| 2 | Bản chụp không bao giờ cũ hơn bản đang chạy | Người xem thấy lộ trình lùi sau một lần gộp | Ca đo: bản chụp cũ hơn tệp đóng gói thì trang đọc tệp đóng gói | Chốt ở Cổng Phạm vi |
| 3 | Lấy bản chụp không cần khoá cá nhân (LT3 cấm khoá cá nhân) | Phải dùng khoá của chủ kho, LT3 làm lại | Đường đẩy từ GitHub Actions bằng khoá máy của CRM, như khoá chỉ-kéo của TH1 | Chốt ở Cổng Phạm vi |

## Câu hỏi lớn — chốt ở Cổng Phạm vi, không ở cổng này

- **Lưu ở đâu:** bảng dữ liệu (T3, có migration) hay kho tệp Vercel Blob (đã có cho logo và tài liệu).
- **Lấy bằng đường nào:** GitHub Actions đẩy khối dữ liệu sang CRM mỗi lần nhánh chính đổi lộ trình (đụng
  `.github/workflows/*`, báo trước trên #375), hay CRM tự kéo theo nhịp. Máy sẽ khuyên đường đẩy: không cần khoá
  cá nhân, và LT3 thay người đẩy bằng ứng dụng GitHub.

## Hai lối ở cổng này (ước lượng, chưa đo)

| Lối | Phút máy | Lượt gọi chủ kho | Đổi lại |
|---|---|---|---|
| **Làm ngay** (build) | ~4–6 giờ máy cho một vòng T3 (S1 ~1 giờ, S3 ~2 giờ, S4 ~1 giờ mỗi lượt chấm), trong đó ~1–2 giờ giữ khoá máy cho việc nặng | 3 lượt nữa: Cổng Phạm vi · duyệt kế hoạch · Cổng Bằng chứng | LT3 nhỏ lại, chỉ còn danh bạ, ứng dụng GitHub và bộ chọn; riêng CRM được giờ lấy và không phụ thuộc bản dựng |
| **Hoãn — gộp vào LT3 khi LT3 mở** (park) | 0 bây giờ; LT3 nặng thêm khoảng chừng ấy và chấm một vòng to hơn | 0 bây giờ; LT3 vẫn là T3 nên không thêm cổng, nhưng thêm một PR lộ trình nhỏ để bỏ hàng LT1c và nối LT3 | TH3 đọc trạng thái tín hiệu từ tệp đóng gói (đã kịp trong 1–2 phút) cho tới LT3; vòng LT3 to hơn thì dễ cần thêm lượt chấm |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Hai tuần sau khi giao, mọi lần đổi lộ trình trên nhánh chính hiện trên trang trong vòng 10 phút, không lần nào trang đứng ở bản cũ quá một giờ (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa?
- Kết quả nào là SỐNG: [đề xuất] Hai tuần sau khi giao, mọi lần đổi lộ trình trên nhánh chính hiện trên trang trong vòng 10 phút, không lần nào trang đứng ở bản cũ quá một giờ (ngưỡng đề xuất — chốt ở Cổng Đáng)
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Hai tuần sau khi giao, mọi lần đổi lộ trình trên nhánh chính hiện trên trang trong vòng 10 phút, không lần nào trang đứng ở bản cũ quá một giờ (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox
- Timebox: [đề xuất] một vòng, nhắm lô gộp trong ngày 15/10. Ghi chú: ngưỡng trên đã đạt bằng cách làm hôm nay với riêng CRM, nên nó chỉ canh không-thụt-lùi; quyết «có đáng» thật của nền này nằm ở Cổng Giá trị của LT3.
