---
schema_version: 1
feature: «Thử lại» sau khi Trợ lý im quá 45 giây phải gửi lại thật hoặc nói vì sao không
slug: thu-lai-sau-45-giay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-05
design_doc: docs/superpowers/specs/2026-10-04-thu-lai-sau-45-giay-design.md
---

# Acceptance Contract: thu-lai-sau-45-giay

## Context

Ngoài-3 round 2 của `soan-okr-khong-tru-luot` (R1h, PR #251): khi Trợ lý im quá 45 giây và người
dùng bấm «Thử lại», màn dừng lượt đang chạy nhưng không gửi lại tin (eve ném «already processing a
turn», lỗi bị nuốt), rồi chỗ báo lỗi biến mất không nói gì — đúng điều kiện CHẾT «Thử lại vẫn có
một đường im lặng» của R1h. Lượt này: huỷ lượt đang chạy qua cửa, dừng luồng, chờ lượt cũ khép rồi
mới gửi lại; gửi lại không được thì nói ra.

Source input: chủ kho chọn «mở hợp đồng mới» cho Ngoài-3 ở Cổng Bằng chứng round 2 của R1h (04/10),
`_acceptance/soan-okr-khong-tru-luot/decisions.jsonl`.

## Criteria

- AC-1: Given màn soạn có một lượt đang chạy (phiên `streaming`, có `continuationToken`, tin cuối đã gửi, và sau sự kiện `message.received` cuối có `turn.started` mang `turnId` T) và đã quá `SOAN_UI.hanKhongSuKienMs` không có sự kiện nên chỗ báo lỗi hiện câu «Quá 45 giây…», When bấm «Thử lại», Then màn gửi đúng một yêu cầu `POST <OKR_SOAN_CUA.host>/eve/v1/session/<phiên>/cancel` mang mã cuộc và thân `{ "turnId": T }` (một `turn.started` đứng TRƯỚC `message.received` cuối không được dùng; không có T thì thân rỗng), KHÔNG gọi dừng luồng phía trình duyệt (`stop`), và KHÔNG gửi lại tin cuối trước khi lượt cũ khép.
- AC-2: Given đã bấm «Thử lại» như AC-1, When eve gọi `onFinish` với các sự kiện mới từ lúc bấm có `turn.cancelled` (của T nếu có T) rồi `session.waiting`, VÀ yêu cầu huỷ đã trả 2xx với thân `{ ok: true, sessionId: <phiên>, status: "accepted" | "no_active_turn" }` — theo bất kỳ thứ tự nào — Then tin cuối được gửi lại đúng một lần với đúng nội dung, ngay khi điều thứ hai xong; chỉ một trong hai xong thì chưa gửi; một lần khép nữa sau đó không gửi thêm. Nếu lượt cũ khép mà KHÔNG có `turn.cancelled` (lượt tự xong) thì không gửi lại và chỗ báo lỗi tắt; nếu `onFinish` tới mà không có mốc khép (lỗi luồng, `session.failed`) thì không gửi lại và chỗ báo lỗi chuyển sang câu «Chưa gửi lại được…». Và với store eve thật (0.29.4): sau yêu cầu huỷ mà không `stop`, `onFinish` chỉ chạy sau `session.waiting` của lượt cũ (không sớm hơn), lần gửi lại trong `onFinish` mang `continuationToken` của `session.waiting` đó, và luồng của lần gửi lại đọc được câu trả lời của lượt mới; đối chứng dương cùng fixture: cách của bản 1 (`stop` rồi gửi lại khi có hồi âm huỷ) cho luồng gửi lại dừng ở mốc khép của lượt cũ và không có câu trả lời mới.
- AC-3: Given đã bấm «Thử lại» như AC-1 và chưa gửi lại, When nhìn chỗ báo lỗi, Then nó vẫn hiện, nút «Thử lại» khoá, có dòng «Đã thử lại 1 lần», và câu lý do vẫn là câu «Quá 45 giây…» của lúc bấm; quá trần `SOAN_UI.choKhepMs` mà chưa gửi lại được thì màn dừng luồng phía trình duyệt (lối thoát duy nhất được gọi `stop`), bỏ tin chờ, chỗ báo lỗi chuyển sang câu «Chưa gửi lại được…» và nút mở lại; bấm tiếp thì gửi thẳng, không lặp vòng huỷ–chờ.
- AC-4: Given lần gửi lại bị từ chối (eve ném trước khi gửi), HOẶC yêu cầu huỷ hỏng (status không 2xx, thân không khớp khuôn trên, hay lỗi mạng), When chỗ báo lỗi hiện lại, Then nó mang câu «Chưa gửi lại được — lượt trước chưa dừng hẳn. Thử lại sau ít phút.» và «Đã thử lại N lần», nút mở lại, và khi huỷ hỏng thì KHÔNG có lần gửi lại nào; bấm tiếp thì đi theo trạng thái thật của phiên — phiên bận: lại đúng AC-1 (huỷ, chờ); phiên rảnh: gửi thẳng, không yêu cầu huỷ; một lần gửi lại thành công sau đó tắt câu này; và lượt mở đầu bị eve từ chối (gửi đôi lúc mở màn) KHÔNG bật câu này.
- AC-5: Given một cuộc `dang` đã có phiên eve và `soLuot = n`, When cửa nhận `POST session/<phiên>/cancel` mang thân `{ "turnId": T }` của chính người mở cuộc, Then Trợ lý nhận đúng một yêu cầu trên đúng đường đó với đúng thân đó; cửa trả status và thân bằng đúng status và thân Trợ lý đã trả cho chính yêu cầu ấy, với ba cặp khác nhau (202 `accepted`, 202 `no_active_turn`, 500 `{ ok: false, error }`); và `soLuot` của cuộc vẫn bằng n (huỷ không phải lượt). (cross-layer)
- AC-6: Given «Thử lại» khi phiên không bận (lỗi HTTP có tên, mất mạng, mở lại cuộc), When bấm, Then hành vi giữ đúng như R1h: `soan-okr-thu-lai.dom.tsx` xanh mà không sửa dòng nào, và `soan-okr-hong.dom.tsx` xanh với diff chỉ nằm trong khối «hong — Thu lai roi van im» — ca duy nhất khẳng định hành vi lỗi cũ (dừng rồi gửi lại ngay trên một `send` giả không bao giờ ném); khối đó sau khi sửa khẳng định: không gọi `stop` (`daDung` = 0), đúng một POST huỷ, chưa gửi lại trước khi lượt cũ khép vì huỷ, rồi gửi lại đúng tin cuối trên cùng phiên (lời hứa AC-12c của `soan-okr-cung-tro-ly`: không gọi `soanMo`), không còn báo lỗi, và hẹn giờ 45 s đặt lại.
- AC-7: Given màn thật trong phiên đo riêng với một Trợ lý giả trả mã như eve thật (mở phiên 202, gửi tiếp 200, huỷ 202) có sổ sự kiện theo phiên; nhận lượt thì phát `message.received`, `turn.started` (mang `turnId`) rồi giữ luồng im; nhận yêu cầu huỷ thì trả `accepted` ngay nhưng chỉ ghi `turn.cancelled` rồi `session.waiting` (mang token MỚI) lên sổ sau 3 giây (mốc đỗ); POST gửi tiếp trước mốc đỗ hay mang token cũ bị trả 409; lần gửi lại hợp lệ được phát một lượt mới có câu trả lời riêng, When trưởng phòng ban mở màn soạn ở 1440 và 390, chờ câu «Quá 45 giây…», rồi bấm «Thử lại», Then Trợ lý giả nhận đúng một yêu cầu huỷ mang `turnId` của lượt đang chạy; luồng của lượt cũ KHÔNG bị trình duyệt đóng trước mốc đỗ (đối chứng dương trong cùng lượt đo: một luồng mở qua cửa rồi bị đóng thì Trợ lý giả ghi được lúc đóng); có đúng một POST gửi lại được trả 200, sau mốc đỗ và mang token mới; câu trả lời của lượt mới hiện trên màn và chỗ báo lỗi biến mất; trong khoảng giữa bấm và lần gửi lại chỗ báo lỗi luôn hiện (ít nhất 3 mẫu lấy cách nhau 200 ms); không tràn ngang.
- AC-8: Given khoá chữ mới `hoiThoai.chuaGuiLai`, When chạy bài ghim chữ và sàn thiết kế, Then câu có ở `vi` và `en`, `messages-guard` xanh, và sàn thiết kế tĩnh không có lỗi P0 trên `hoi-thoai-soan.tsx`.

## Coverage

- Bỏ coverage-scan — bài toán một chiều (một đường «Thử lại» khi phiên bận, ba pha: bấm · chờ khép · gửi lại/từ chối) và các đường còn lại đã có thước của R1h (AC-6 giữ chúng); xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`.

## Out of scope

- Hoàn lượt cho lượt bị huỷ: lượt đã tới Trợ lý nên vẫn tính, đúng luật của R1h.
- Đổi thời hạn 45 giây hay cách đo «im» (`SOAN_UI.hanKhongSuKienMs`).
- Hoàn tác hay báo riêng cho lượt cũ bị huỷ (Trợ lý có thể đã viết một phần trả lời trước khi huỷ; phần đó giữ nguyên trên luồng như eve làm).
- Lượt Trợ lý nhận rồi hỏng trong luồng (`turn.failed`) — vòng riêng ở `apps/agent-okr` (Out of scope của R1h).
- Đo thời gian huỷ thật của `apps/agent-okr` (từ lệnh huỷ tới `turn.cancelled` khi một bước mô hình đang chạy): cần gọi mô hình thật; `SOAN_UI.choKhepMs` 15 giây là giá đoán, chỉnh ở `cau-hinh.ts`.
- Sau lối thoát quá trần (luồng phía trình duyệt đã cắt), nếu máy chủ khép lượt cũ muộn hơn thì lần gửi kế có thể không hiện câu trả lời tới khi tải lại cuộc — dựng lại phiên từ máy chủ là vòng riêng.
- Giữ dòng «Đã thử lại N lần» khi lần gửi lại bị Trợ lý từ chối bằng mã HTTP (màn đi đường lỗi có tên của R1h và đếm lại).
- Sửa khung kiểm dùng chung `khung-soan-okr.tsx` hay tệp kiểm của hồ sơ đã ký — trừ đúng khối «hong — Thu lai roi van im» của `soan-okr-hong.dom.tsx` (AC-6).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry
> `descope` trong `decisions.jsonl`.

## Notes

- Phản biện context sạch (gap-probe) thêm: chờ cả hồi âm huỷ (AC-2), bài store eve thật (AC-2), E4 theo trạng thái thật của phiên (AC-4), trần chờ khép (AC-3), Trợ lý giả đỗ trễ 3 giây và sàn số mẫu (AC-7).
- Duyệt lại Cổng 1 lần hai (05/10, sau S4 round 1): đổi khuôn theo tài liệu eve 0.29.4 — bỏ `stop()`, giữ luồng tới mốc khép, huỷ mang `turnId` và parse hồi âm ở biên; S4 round 1 (REJECT) chỉ ra bản 1 có thể làm câu trả lời mới không hiện. Xem `decisions.jsonl`.
- Duyệt lại Cổng 1 (04/10, S3): bản duyệt đầu hứa AC-6 «không sửa dòng nào» ở cả hai tệp đã ký, nhưng một ca của `soan-okr-hong.dom.tsx` khẳng định đúng hành vi AC-1 cấm; AC-1 và AC-6 cũ không thể cùng xanh. Phản biện S1 sót chỗ này.
- Ranh giới P5: `okr/soan/**` trừ `nut-soan.tsx`; `lib/messages/okr-soan.ts` chỉ thêm khoá.
