---
schema_version: 1
slug: cap-nhat-tuan-okr
feature: Cập nhật tuần OKR — màn «Cập nhật tuần của tôi» gom mọi KR tôi phụ trách, điền sẵn số tuần trước, ghi giá trị · mức tự tin · một dòng ghi chú; nhắc buổi sáng và thẻ «việc của tôi» dẫn thẳng vào màn; bình luận và nhắc tên trên mục tiêu và KR; chuyển KR khi người nghỉ
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
decided_at: 2026-09-25T14:34:49Z
prototype:
  base_commit: 47b7f00cee56915725680b0707614cfd2e9f1e45
  disposition: keep
---

## Vấn đề & ai gặp

Lộ trình OKR (`docs/plan/lo-trinh-okr.md` mục 5 «Lượt 4», mục 6) đưa mọi phòng ban
vào CRM từ 2026-10-26 và hẹn **cập nhật hằng tuần** từ 2026-11-02. Lượt 3 (#140,
`739c8701`) cho đặt và công bố OKR, nhưng sau khi công bố thì con số của KR chỉ
đổi được bằng cách mở hộp thoại sửa KR từng cái một: không có lần cập nhật nào
được ghi lại, không có mức tự tin, không có ghi chú, không ai được nhắc, và không
ai biết KR nào đã im ba tuần. OKR mà không cập nhật tuần thì đến cuối quý là bảng
tính đặt một lần rồi quên — đúng thứ lộ trình muốn thay.

**Người gặp:** người phụ trách KR (mỗi thứ Hai phải đi tìm từng KR của mình qua
nhiều mục tiêu, nhiều đơn vị); trưởng đơn vị (không biết KR nào trong đơn vị
đang im, không có chỗ hỏi lại ngay trên KR); người mang vai «chỉ OKR» (không thấy
thẻ «việc của tôi» ở Tổng quan vì thẻ đó đọc dữ liệu đối tác — họ đang có một
trang Tổng quan riêng chỉ có hai nút); quản trị (khi một người nghỉ, KR và mục
tiêu của họ kẹt lại vì hộp «Chuyển việc 30 ngày» chỉ chuyển kế hoạch).

Vật liệu nền: mục 5 «Lượt 4» của lộ trình (phủ CI-01..04, NH-01..04, XEM-01,
XEM-10, QT-05); từ điển `CONTEXT.md` (Cập nhật tuần, Mức tự tin, Người phụ trách
(OKR), Nhắc buổi sáng, Trưởng đơn vị, Phạm vi dữ liệu); bản mẫu đã duyệt
`/proto/ban-mau-okr` màn «Cập nhật tuần» với tám trạng thái
(`_acceptance/ban-mau-okr/design-pass.md`, mức tự tin ba bậc Cao · Vừa · Thấp chốt
2026-09-24); hạ tầng nhắc buổi sáng của Điều phối 30 ngày và Zalo vòng 1–2
(#105, #118, #122, #125, #130).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người phụ trách cập nhật khi được nhắc đúng ngày cập nhật của chu kỳ (ô «ngày cập nhật trong tuần» của lượt 3, mặc định thứ Hai) qua **cùng một tin buổi sáng** đang nhắc kế hoạch 30 ngày — không cần tin thứ hai | Tỷ lệ cập nhật thấp vì tin bị chìm giữa việc 30 ngày đầu; phải tách tin, trái luật đã chốt | Đếm lần cập nhật trong ngày nhắc so với các ngày khác, ba tuần đầu (từ bảng lần cập nhật · cột kênh) | Chưa thử — đo sau ship |
| 2 | Mọi người phụ trách KR đã nối Zalo hoặc Slack trước 2026-10-26 (mục 6 lộ trình: «mỗi người nối kênh nhắc») | Nhắc không tới người chưa nối; chỉ còn thẻ trong CRM, mà người không mở CRM thì không thấy | Màn này hiện rõ «bạn chưa nối kênh nhắc» cho người phụ trách chưa nối; màn sức khoẻ chương trình đếm (lượt 5) | Không phải việc của vòng này (Cổng Đáng 2026-09-25); hợp đồng ghi rõ: màn cập nhật tuần và thẻ «việc của tôi» chạy đầy đủ cho người chưa nối kênh — nhắc qua kênh chỉ là lối vào thêm |
| 3 | Báo «được giao KR» và «được nhắc tên» đi trong tin buổi sáng hôm sau (chậm tới một ngày) là đủ cho nhịp OKR hằng tuần | Người bị nhắc tên trong bình luận trả lời chậm một ngày, bình luận thành chỗ chết | Đếm khoảng từ lúc nhắc tên tới lúc người đó trả lời hoặc cập nhật, ba tuần đầu | Chấp nhận độ trễ — báo tức thì trong chat là lượt 10 |
| 4 | Người mang vai «chỉ OKR» thấy thẻ «việc của tôi» (phần OKR) ở trang Tổng quan riêng của họ mà không mở phạm vi đối tác | Nửa công ty không có thẻ dẫn vào màn cập nhật; hoặc phải nới lớp chặn của lượt 2 | Thẻ OKR đọc qua cụm thủ tục khai phạm vi `okr`, không qua `dashboard` (khai phạm vi đối tác) | Đã đọc mã: `dashboard.router` khai `PhamViDoiTacMiddleware`; vai «chỉ OKR» thấy `TongQuanChiOkr`. Thành việc trong phạm vi có phép đo (Cổng Đáng 2026-09-25) |
| 5 | Một bảng lần cập nhật chỉ thêm (người ghi, ghi hộ, kênh, số giây mở→gửi đo ở máy chủ) đủ để đo cả hai ngưỡng dưới đây mà không cần công cụ phân tích ngoài | Không đo được ngưỡng tại Cổng Giá trị | Truy vấn đọc thẳng bảng đó; là AC đọc lại từ DB ở S1 | Thiết kế ở S1 |
| 6 | Hộp «Chuyển việc 30 ngày» ở màn Thành viên là đúng chỗ để chuyển KR và mục tiêu của người nghỉ | Quản trị không tìm thấy, KR mồ côi vẫn nhắc người đã nghỉ | Hộp đã có luồng xem-trước-rồi-chuyển cho kế hoạch và bước; thêm hai con số KR · mục tiêu | Chốt ở lộ trình mục 5 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi OKR quý 4 được công bố, người phụ trách có cập nhật KR của mình mỗi tuần, nhanh, mà không cần ai đi hỏi không?
- Kết quả nào là SỐNG: trên mọi phòng ban, ≥ 80% KR đang chạy có ít nhất một lần cập nhật trong mỗi tuần, ba tuần liền (tuần bắt đầu 2026-11-02, 11-09, 11-16); và trung vị số giây từ mở màn tới gửi của một lần cập nhật < 60 giây — cả hai đếm từ bảng lần cập nhật.
- Kết quả nào là CHẾT: < 60% KR có cập nhật ở tuần thứ ba; hoặc trung vị > 120 giây; hoặc phải sửa cơ sở dữ liệu tay để ghi, chuyển hay gỡ một lần cập nhật; hoặc ≥ 1 người phụ trách đã nối kênh mà không nhận tin nhắc vào ngày cập nhật vì công cụ.
- Timebox: đo ba tuần 2026-11-02 → 2026-11-22, đọc số 2026-11-23; phiên nghiệm thu R1 2026-11-13 đọc trước tuần đầu và trung vị thời gian.

## Kết quả prototype

Bản mẫu «Cập nhật tuần» đã duyệt 2026-09-24 (PR #113, `_acceptance/ban-mau-okr`,
tám trạng thái: đang điền · số không hợp lệ · đang gửi · lỗi gửi · đã gửi · đang tải
· rỗng · lỗi; 1440 và 390; nấc phản ứng nac-1). Mức tự tin ba bậc Cao · Vừa · Thấp
chốt tại đó. Lượt này dựng theo bản mẫu; không dựng lại thẩm mỹ. Bình luận, nhắc
tên, theo dõi mục tiêu và phần OKR trong hộp chuyển việc **chưa có bản mẫu** —
chúng mới ở lượt này.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Màn «Cập nhật tuần» — bố cục, tám trạng thái, chữ | `apps/app/app/proto/_modules/ban-mau-okr/cap-nhat-tuan.tsx` (trong kho) | ngôn-ngữ-thiết-kế/hình-thái đã duyệt ở design-pass | có | Manh Phan 2026-09-24 (duyệt bản mẫu) |
| Luật nhắc buổi sáng (một tin, giờ, trần việc, trần ký tự Zalo, gom theo người) | `packages/db/src/onboarding-nhac.ts`, `apps/agent/agent/lib/nhac-ke-hoach.ts`, `tin-nhac.ts` (trong kho) | triết-lý/logic | có | — |
| Hộp chuyển việc xem-trước-rồi-chuyển | `settings/members/chuyen-viec-dialog.tsx` (trong kho) | triết-lý/logic | có | — |
| Nhịp cập nhật tuần: giá trị + mức tự tin + ghi chú, điền sẵn tuần trước | Thực hành OKR phổ biến ở công cụ cùng loại (Perdoo, Weekdone, Lattice check-in) | triết-lý/logic | có | — |

Không có vật liệu ngôn-ngữ-thiết-kế nào ngoài kho.

## Cổng 0

- **decision = build.** Căn cứ: lộ trình mục 6 hẹn cập nhật hằng tuần từ 2026-11-02 cho mọi phòng ban; mục 7 ghi «lùi theo tuần, không cắt lượt 4»; lượt 3 đã lên `onehub` (#140) nên dữ liệu thật để đứng lên đã có.
- **disposition = keep.** Căn cứ: bản mẫu `/proto/ban-mau-okr` ở lại kho vĩnh viễn theo `docs/proto.md`; lượt này đọc hình và chữ từ nó, không xoá.
- **Ngưỡng UAT chốt cùng lúc ký:** SỐNG ≥ 80% KR đang chạy có cập nhật mỗi tuần ba tuần liền (tuần 2026-11-02, 11-09, 11-16) và trung vị mở→gửi < 60 giây; CHẾT < 60% ở tuần thứ ba, hoặc trung vị > 120 giây, hoặc sửa DB tay, hoặc người đã nối kênh không nhận nhắc vì công cụ; đo 2026-11-02 → 11-22, đọc 2026-11-23 — chốt tại Cổng Đáng 2026-09-25, Manh Phan — uỷ quyền phiên điều phối 2026-09-24.

## Thước đo thành công → ứng viên criterion

- Tỷ lệ KR có lần cập nhật mỗi tuần → AC: mỗi lần gửi ghi một dòng vào bảng lần cập nhật (đọc lại từ DB), gồm KR, tuần, người ghi, kênh.
- Trung vị giây mở→gửi → AC: máy chủ ghi mốc mở màn và tính số giây lúc gửi; máy khách không tự khai.
- Nhắc tới được người phụ trách vào ngày cập nhật → AC: loại việc OKR trong nhắc buổi sáng, cùng luật với thẻ «việc của tôi», không tin thứ hai; KR im quá N ngày nhắc người phụ trách rồi trưởng đơn vị.
- Không phải sửa DB tay → AC: chuyển KR và mục tiêu của người nghỉ bằng hộp chuyển việc; lần cập nhật không sửa được, chỉ thêm.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/ban-mau-okr/cap-nhat-tuan.tsx` | Dựng lại thành màn thật trong khu `okr/` của app | không | Bản mẫu giữ nguyên làm phòng trưng bày |
| `apps/app/app/proto/_modules/ban-mau-okr/phan-chung.tsx` (`NHAN_TU_TIN`, `TONE_TU_TIN`) | Dựng lại trong khu `okr/`; cặp thành phần dùng chung trong `packages/ui` là việc lượt 5 | không | — |
| `apps/app/app/proto/_modules/ban-mau-okr/du-lieu.ts` (`MucTuTin`) | Giữ; khuôn Zod thật ở `packages/validation/src/okr-*.ts` | không | — |

## Out of scope từ khám phá

- Toàn cảnh, heatmap, bảng họp tuần xếp theo thứ đáng bàn (lượt 5) — lượt này chỉ ghi dữ liệu mà các màn đó sẽ đọc.
- Số tự chảy từ CRM vào KR (lượt 6) — lượt này mọi giá trị do người ghi.
- Cập nhật ngay trong Slack hoặc Zalo bằng trả lời tin, và cảnh báo KR đang trượt (lượt 10) — tin nhắc lượt này chỉ dẫn vào màn.
- Tin thứ hai, hay báo tức thì khi được nhắc tên — trái luật một tin buổi sáng đã chốt; báo đi trong tin sáng hôm sau và thẻ «việc của tôi».
- Máy ghi số hay mức tự tin thay người (NG-05) — đã quyết không làm.
- Sửa hay xoá một lần cập nhật đã gửi — lần cập nhật chỉ thêm (từ điển «Cập nhật tuần»).
