---
schema_version: 1
feature: «Thử lại» sau khi Trợ lý im quá 45 giây phải gửi lại thật hoặc nói vì sao không
slug: thu-lai-sau-45-giay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
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

- AC-1: Given màn soạn có một lượt đang chạy (phiên `streaming`, có `continuationToken`, tin cuối đã gửi) và đã quá `SOAN_UI.hanKhongSuKienMs` không có sự kiện nên chỗ báo lỗi hiện câu «Quá 45 giây…», When bấm «Thử lại», Then màn gửi đúng một yêu cầu `POST <OKR_SOAN_CUA.host>/eve/v1/session/<phiên>/cancel` mang mã cuộc, gọi dừng luồng phía trình duyệt, và KHÔNG gửi lại tin cuối trước khi lượt cũ khép.
- AC-2: Given đã bấm «Thử lại» như AC-1, When lượt cũ khép (eve gọi `onFinish`) VÀ yêu cầu huỷ đã có hồi âm — theo bất kỳ thứ tự nào — Then tin cuối được gửi lại đúng một lần với đúng nội dung, ngay khi điều thứ hai xong; chỉ một trong hai xong thì chưa gửi; một lần khép nữa sau đó không gửi thêm. Và store eve thật (0.29.4) gọi `onFinish` sau khi đã đặt trạng thái `ready` khi lượt bị huỷ.
- AC-3: Given đã bấm «Thử lại» như AC-1 và chưa gửi lại, When nhìn chỗ báo lỗi, Then nó vẫn hiện, nút «Thử lại» khoá, có dòng «Đã thử lại 1 lần», và câu lý do vẫn là câu «Quá 45 giây…» của lúc bấm; quá trần `SOAN_UI.choKhepMs` mà chưa gửi lại được thì chỗ báo lỗi chuyển sang câu «Chưa gửi lại được…» và nút mở lại.
- AC-4: Given lần gửi lại bị từ chối (eve ném trước khi gửi), When chỗ báo lỗi hiện lại, Then nó mang câu «Chưa gửi lại được — lượt trước chưa dừng hẳn. Thử lại sau ít phút.» và «Đã thử lại N lần», nút mở lại; bấm tiếp thì đi theo trạng thái thật của phiên — phiên bận: lại đúng AC-1 (huỷ, dừng, chờ); phiên rảnh: gửi thẳng, không yêu cầu huỷ; và một lần gửi thành công sau đó tắt câu này.
- AC-5: Given một cuộc `dang` đã có phiên eve và `soLuot = n`, When cửa nhận `POST session/<phiên>/cancel` của chính người mở cuộc, Then Trợ lý nhận đúng một yêu cầu huỷ trên đúng đường đó, cửa trả nguyên status và thân của Trợ lý, và `soLuot` của cuộc vẫn bằng n (huỷ không phải lượt). (cross-layer)
- AC-6: Given «Thử lại» khi phiên không bận (lỗi HTTP có tên, mất mạng, mở lại cuộc), When bấm, Then hành vi giữ đúng như R1h: hai tệp kiểm đã ký `soan-okr-thu-lai.dom.tsx` và `soan-okr-hong.dom.tsx` xanh mà không sửa dòng nào.
- AC-7: Given màn thật trong phiên đo riêng với một Trợ lý giả nhận lượt rồi giữ luồng im, và chỉ trả hồi âm huỷ sau 3 giây (lượt cũ đỗ lại đúng lúc đó; POST session trước mốc đỗ bị trả 409), When trưởng phòng ban mở màn soạn ở 1440 và 390, chờ câu «Quá 45 giây…», rồi bấm «Thử lại», Then Trợ lý giả nhận yêu cầu huỷ, rồi một POST gửi lại SAU mốc đỗ và được trả 202; trong khoảng giữa bấm và lần gửi lại chỗ báo lỗi luôn hiện (ít nhất 3 mẫu lấy cách nhau 200 ms); không tràn ngang.
- AC-8: Given khoá chữ mới `hoiThoai.chuaGuiLai`, When chạy bài ghim chữ và sàn thiết kế, Then câu có ở `vi` và `en`, `messages-guard` xanh, và sàn thiết kế tĩnh không có lỗi P0 trên `hoi-thoai-soan.tsx`.

## Coverage

- Bỏ coverage-scan — bài toán một chiều (một đường «Thử lại» khi phiên bận, ba pha: bấm · chờ khép · gửi lại/từ chối) và các đường còn lại đã có thước của R1h (AC-6 giữ chúng); xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`.

## Out of scope

- Hoàn lượt cho lượt bị huỷ: lượt đã tới Trợ lý nên vẫn tính, đúng luật của R1h.
- Đổi thời hạn 45 giây hay cách đo «im» (`SOAN_UI.hanKhongSuKienMs`).
- Hoàn tác hay báo riêng cho lượt cũ bị huỷ (Trợ lý có thể đã viết một phần trả lời trước khi huỷ; phần đó giữ nguyên trên luồng như eve làm).
- Lượt Trợ lý nhận rồi hỏng trong luồng (`turn.failed`) — vòng riêng ở `apps/agent-okr` (Out of scope của R1h).
- Sửa khung kiểm dùng chung `khung-soan-okr.tsx` hay tệp kiểm của hồ sơ đã ký.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry
> `descope` trong `decisions.jsonl`.

## Notes

- Phản biện context sạch (gap-probe) thêm: chờ cả hồi âm huỷ (AC-2), bài store eve thật (AC-2), E4 theo trạng thái thật của phiên (AC-4), trần chờ khép (AC-3), Trợ lý giả đỗ trễ 3 giây và sàn số mẫu (AC-7).
- Ranh giới P5: `okr/soan/**` trừ `nut-soan.tsx`; `lib/messages/okr-soan.ts` chỉ thêm khoá.
