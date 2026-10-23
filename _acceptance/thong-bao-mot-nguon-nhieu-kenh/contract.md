---
schema_version: 1
feature: Người dùng CRM thấy thông báo nhận qua Zalo cũng nằm trong chuông, và tự chọn loại nào được đẩy qua kênh nào
slug: thong-bao-mot-nguon-nhieu-kenh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: implemented
approved_by: Manh Phan
approved_at: 2026-10-23T02:51:55Z
design_doc: docs/superpowers/specs/2026-10-23-thong-bao-mot-nguon-nhieu-kenh-design.md
---

# Acceptance Contract: thong-bao-mot-nguon-nhieu-kenh

## Context

TB1 ghi mỗi mục nhắc buổi sáng thành một thông báo trong chuông, nhưng tin Zalo hay Slack vẫn đi đường riêng, và
thông báo của tác nhân dựng hay tín hiệu đổi chỗ không bao giờ ra Zalo/Slack. Vòng này làm thông báo thành nguồn duy
nhất: Zalo hay Slack chỉ chuyển tiếp các loại người dùng cho phép, chuông luôn nhận đủ; người dùng chọn theo từng loại,
chia hai mức Cần làm và Để biết. Ai chưa đổi gì thì nhận đúng như hôm nay.

Source input: `_acceptance/thong-bao-mot-nguon-nhieu-kenh/opportunity.md` (Cổng Đáng `build`, 2026-10-19T13:18:56Z;
hàng TB2 của `docs/plan/lo-trinh-okr.json`, mã N3 và N4 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`).

## Criteria

- AC-1: Given bảng loại thông báo, When đọc mức và mặc định kênh ngoài của mọi loại, Then mỗi loại có đúng một mức (Cần làm hoặc Để biết) theo bảng mức của bản thiết kế, có tên loại cả tiếng Việt lẫn tiếng Anh, và có mặc định kênh ngoài — bật cho mọi loại của nhắc buổi sáng, tắt cho bốn loại sự kiện (tác nhân xong, tác nhân cần trả lời, tác nhân hỏng, tín hiệu đổi chỗ); thêm một loại mà không khai mức hay mặc định thì kiểm tra kiểu đỏ gọi tên loại đó, thiếu tên thì bài kiểm đỏ gọi tên loại đó.
- AC-2: (cross-layer) Given người có Zalo, người có Slack và người không kênh, chưa ai đổi cài đặt loại thông báo, When lượt nhắc buổi sáng chạy và có thông báo sự kiện mới (tác nhân dựng xong, tín hiệu đổi chỗ) cho họ, Then tin Zalo/Slack buổi sáng giống từng chữ và từng đường dẫn bản chụp tin trước vòng cho mọi loại mục nhắc, mỗi mục vẫn có thông báo trong chuông, và không tin nào về thông báo sự kiện được gửi qua Zalo hay Slack.
- AC-3: (cross-layer) Given người có kênh đã tắt kênh ngoài cho một số loại, When lượt nhắc buổi sáng chạy, Then tin họ nhận không có mục của các loại đã tắt và giữ nguyên chữ của các mục còn lại, mọi mục (kể cả mục đã tắt) vẫn có thông báo trong chuông, và hàng lượt nhắc ghi khoá thông báo của đúng các mục đã gửi; Given mọi mục hôm nay của họ thuộc loại đã tắt, Then không tin nào được gửi và lượt đóng với kết quả «đã tắt hết»; Given họ bật lại, Then lượt sáng sau có lại mục đó.
- AC-4: (cross-layer) Given người có kênh đã bật kênh ngoài cho một loại sự kiện, When một thông báo loại đó được ghi cho họ (từ tác nhân dựng hay từ tín hiệu đổi chỗ), Then trong vòng hai nhịp của tác nhân họ nhận đúng một tin qua kênh đang dùng (Zalo hay Slack theo lựa chọn kênh hiện có), mang câu chuông hiện bằng tiếng Việt cho chính thông báo đó (tin qua Zalo/Slack chỉ có tiếng Việt, như tin nhắc sáng hôm nay) và đường dẫn tới cùng chỗ; Given thông báo được ghi trước lúc họ bật loại đó hoặc đã quá 30 phút, Then không gửi; Given họ không có kênh nào dùng được, Then không gửi và không lỗi; thông báo trong chuông không đổi trong mọi ca.
- AC-5: (cross-layer) Given một thông báo sự kiện đủ điều kiện đẩy, When hai nhịp chạy chồng nhau hoặc nhịp chạy lại, Then tin được gửi đúng một lần; Given gửi qua Zalo hỏng, Then không đổi sang Slack, lỗi được ghi trên thông báo, nhịp sau thử lại, và sau ba lần hỏng thì thôi; thông báo trong chuông không bị xoá hay đổi đã đọc trong mọi ca.
- AC-6: (cross-layer) Given hai người cùng có cài đặt, When một người gọi thủ tục đọc và lưu cài đặt loại thông báo, Then đọc trả mọi loại theo mức, trạng thái kênh ngoài hiệu lực của từng loại (đã lưu hay mặc định) và kênh họ đang dùng (Zalo, Slack, hay không có kèm lý do); lưu chỉ đổi cài đặt của chính họ và có hiệu lực ở lượt đẩy kế; lưu một loại không tồn tại bị từ chối; không có cách nào tắt chuông; người chưa đăng nhập bị từ chối; người vai chỉ OKR đọc và lưu được; một hàng cài đặt mang loại không còn tồn tại không làm hỏng thủ tục đọc hay lượt đẩy.
- AC-7: Given người đã đăng nhập ở 1280 px và 375 px, When họ mở chuông và bấm «Cài đặt thông báo», Then họ tới mục «Loại thông báo» trên trang Nhắc buổi sáng, thấy hai nhóm Cần làm và Để biết, mỗi loại một dòng với cột Chuông bật và khoá và cột mang tên kênh đang dùng; bật hay tắt một công tắc lưu ngay và báo đã lưu; lưu hỏng thì công tắc trở về giá trị cũ và báo chưa lưu được; không có kênh nào thì mọi công tắc cột kênh khoá và một dòng nói vì sao; chờ tải, lỗi tải hiện đúng như bảng trạng thái của bản thiết kế; trang không cuộn ngang.
- AC-8: Given lượt nhắc và thông báo sự kiện đã đẩy qua Zalo và Slack trong nhiều ngày, When chủ kho chạy lệnh đối chiếu cho một khoảng ngày, Then lệnh in theo từng ngày số mục nhắc đã gửi qua Zalo và qua Slack, số thông báo sự kiện đã đẩy, số có thông báo tương ứng trong chuông, số lệch kèm mã, và số người có cài đặt khác mặc định; có lệch thì thoát mã 1 gọi tên mục; các số khớp dữ liệu trong kho.
- AC-9: (judgment) Given từ điển `CONTEXT.md`, When người đọc các mục về thông báo, Then có mục «Cần làm» và «Để biết» nói đó là mức của thông báo và khác «việc cần làm» đã cấm ở đâu, và mục «Thông báo» nói Zalo hay Slack chỉ chuyển tiếp thông báo theo cài đặt của người nhận, chuông luôn nhận đủ.

## Coverage

- Trục A — Nguồn × mức của loại: nhắc sáng · Cần làm | nhắc sáng · Để biết | sự kiện · Cần làm | sự kiện · Để biết [thước CE: `LOAI_THONG_BAO` × `THONG_BAO.nguon`] → AC-1, AC-2, AC-3, AC-4
- Trục B — Kênh người nhận: không kênh | Zalo | Slack | lệch kênh | Zalo chưa bật cho xưởng [thước CE: `chonKenh` của `packages/db/src/kenh-thong-bao.ts`] → AC-2, AC-4, AC-6, AC-7
- Trục C — Cài đặt của loại: mặc định | tắt | bật loại mặc định tắt | tắt hết | loại lạ [thước CE: NGÀNH: GitHub, Linear — mỗi loại một lựa chọn kênh, có mặc định] → AC-2, AC-3, AC-4, AC-6
- Trục D — Thời điểm đẩy: lượt sáng | sự kiện mới | sự kiện cũ | chạy lại/chồng | hỏng rồi thử lại | hết lượt thử [thước CE: `docs/agent.md` «Zalo lỗi thì ném»] → AC-3, AC-4, AC-5
- Cắt ngang: chỉ của mình; song ngữ; 1280/375; chờ/lỗi/lưu hỏng → AC-6, AC-7
- Quét đầy đủ (Core / Later / Never): `_acceptance/thong-bao-mot-nguon-nhieu-kenh/coverage-scan.md`

## Vòng đời

Vòng này không thêm bản ghi người dùng xoá hay lưu trữ được: hàng cài đặt là lựa chọn của người, đổi lại bằng chính
công tắc (trùng mặc định thì máy xoá hàng); người bị xoá thì cài đặt đi theo (`Cascade`). Thông báo giữ vòng đời của TB1.

## Đường đo

- Thước: mọi thông báo đi qua Zalo (và Slack) trong hai tuần đều có bản tương ứng trong chuông · số từ: lệnh đối chiếu
  chạy trên production ở ngày đo · bảo đảm bởi: AC-3 (hàng lượt nhắc ghi khoá các mục đã gửi), AC-4 (thông báo sự kiện
  ghi lúc đẩy), AC-8 (đếm và gọi tên lệch).
- Thước: hành vi Zalo hiện có không đổi · số từ: bản chụp tin trước vòng và số người có cài đặt khác mặc định trong
  lệnh đối chiếu · bảo đảm bởi: AC-2, AC-8.

## Out of scope

- Công tắc cả mức (tắt hết một mức qua Zalo); gom nhiều thông báo sự kiện thành một tin; giờ yên lặng.
- Hiện mức Cần làm / Để biết trên chuông hay trang Thông báo.
- Chọn Zalo và Slack cùng lúc cho một loại — cột kênh là kênh người đang dùng (Hỏi-2).
- Gộp công tắc «Dòng Trợ lý OKR» vào bảng loại thông báo; đổi tên trang «Nhắc buổi sáng».
- Tắt chuông theo loại; đẩy qua thư, trình duyệt, ứng dụng điện thoại.
- Thông báo tức thời cho sự kiện chưa có thông báo (giao việc, nhắc tên lúc xảy ra) — nguồn mới là việc riêng; khi có,
  nó đi qua cùng đường đẩy của vòng này.
- Sửa mã kênh trong `apps/agent/agent/channels` (vùng của làn Mac Studio, luật 21 của đợt).

## Notes

- Hạng T3: bảng `CaiDatThongBao` mới và bốn cột thêm vào `ThongBao`; migration chỉ thêm (`packages/db/prisma`).
- Hằng số (30 phút, 3 lần thử) sống ở `THONG_BAO` của `@crm/validation/thong-bao`; tiêu chí đo theo hằng số.
- Hai câu chờ chủ kho ở Cổng Phạm vi: Hỏi-2 (một cột kênh hay hai cột Zalo và Slack — L5), Hỏi-1 (luật chia và bảng
  mức — L2). Câu trả lời khác khuyến nghị thì máy sửa AC-1, AC-6, AC-7 rồi trình lại.
- Tệp chạm ngoài vùng của làn: `apps/app/app/(app)/[slug]/reminders/page.tsx` (thêm một mục), `nhac-ke-hoach.ts`,
  `schedules/dispatch.ts` (thêm một bước) — đăng ở phanlemanh/crm-onehub#375 qua giám sát trước S3.
