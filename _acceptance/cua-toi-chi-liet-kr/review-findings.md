# Review findings: cua-toi-chi-liet-kr (round 2)

## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E7 hứa ma trận 2 người × 2 kênh, bài chỉ đo 2 trong 4 ô**
  AC: AC-4
  file: `apps/agent/test/ctlk-nhac-dong.integration.spec.ts:94`
  severity: medium
  source: measurement
  detail: Expected của E7 (_acceptance/cua-toi-chi-liet-kr/evals.yaml) hứa: tin Zalo của A chứa `${APP_URL}/<slug>/okr/kr/<id>`, tin Zalo của B chứa `${APP_URL}/<slug>/okr` và không có "tu=", và tin Slack cùng đích với nhãn «mở KR» (một KR) / «mở Của tôi» (nhiều KR). Bài lại chỉ nối Zalo cho A (`noiZalo(A.id, "ZA")`, dòng 94) và chỉ nối Slack cho B (`noiSlack(B.id)`, `khopSlack(B.id, ...)`, dòng 95-96). Vì vậy chỉ có hai ô được khẳng định: Zalo của A (dòng 148-152) và Slack của B (dòng 154-161). Không có ô nào khẳng định tin Zalo của trường hợp nhiều KR trỏ /okr, cũng không có ô nào khẳng định tin Slack của trường hợp một KR mang `<…/okr/kr/<id>|mở KR>` trên đường gửi thật. Đột biến duy nhất (`duong-tu-nhac`) chỉ được bắt ở dòng thông báo web của B. Ngoài ra số dòng thông báo của B (`tbB`) không được ghim bằng 1 như của A, bài chỉ đọc `tbB[0]`.
  rationale: AC-4 đòi liên kết đúng trên cả Zalo, Slack và hộp thông báo web cho cả một KR lẫn nhiều KR, nhưng bài đo chỉ khẳng định hai trong bốn ô kênh x số KR nên AC-4 chưa được chứng minh đủ.

- **Hình dạng 4 (đối chứng dương không được cưỡng chế): ctlk-dong-kr bọc «dòng 2 trỏ bộ của đơn vị dòng 2» trong `if (id === "b")` mà không ghim số dòng**
  AC: AC-2
  file: `apps/app/test/cua-toi-chi-liet-kr.dom.tsx:251`
  severity: low
  source: measurement
  detail: E3 khai «DOI CHUNG DUONG: dong 2 tro bo cua don vi dong 2». Trong bài, phép so `url.searchParams.get("donOkr") === "bp:bp-1"` chỉ chạy khi vòng lặp gặp `id === "b"`. Nhóm `ctlk-dong-kr` (chạy riêng bằng `-t ctlk-dong-kr` qua hai-chieu.mjs) không khẳng định `dongKr().length === 3`, cũng không khẳng định dòng `b` có mặt. Nếu dòng của đơn vị thứ hai (b) không render, vòng lặp chỉ đi qua a và c, đều cùng đơn vị pb. Khi đó nhánh đối chứng của đơn vị khác bị bỏ qua lặng lẽ, `dong[1]` là c, và nhóm vẫn xanh. Đối chứng dương lẽ ra phải là một khẳng định chắc chắn chạy, không phải một nhánh có điều kiện.
  rationale: AC-2 đòi bấm dòng KR tới đúng bộ của đơn vị chứa KR đó, nhưng phép đối chứng sang đơn vị thứ hai là nhánh có điều kiện có thể bị bỏ qua lặng lẽ khi dòng đó không hiện, nên bài xanh mà chưa chứng minh được AC-2.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **okr.viTriKr đọc theo id nhưng trả null (200) thay vì 404, và docs/api.md không được cập nhật**
  Người dùng thấy gì: Người dùng không thấy khác biệt: bấm vào KR không còn hay không xem được vẫn đưa về Của tôi và báo không thấy KR. Chỉ tài liệu kỹ thuật của hệ thống chưa ghi trường hợp ngoại lệ này.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là tài liệu nội bộ lệch, bổ sung lúc nào cũng được với chi phí rất thấp.
  file: `apps/api/src/okr/okr-cap-nhat.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hằng đường dẫn khai trùng: DUONG_CUA_TOI có hai bản, DUONG_BO_OKR chép lại DUONG của tab-okr.ts, và dựng record=kr:id bằng tay thay vì dùng recordHref**
  Người dùng thấy gì: Người dùng không thấy gì khác: các liên kết vẫn đưa tới đúng chỗ. Rủi ro là về sau nếu đổi đường dẫn mà chỉ sửa một nơi thì liên kết có thể lệch.
  Căn cứ: Hiện không gây lỗi cho người dùng; chỉ làm việc sửa sau này dễ sót, và dọn gọn lúc nào cũng được.
  file: `apps/app/lib/okr-duong-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **giaiDichKr nuốt mọi lỗi của okr.viTriKr thành «không thấy KR», không ghi log**
  Người dùng thấy gì: Khi hệ thống gặp sự cố tạm thời lúc bấm vào một KR, người dùng bị đưa về Của tôi và thấy báo không thấy KR dù KR vẫn còn. Mở lại KR sau đó là xem được bình thường.
  Căn cứ: Chỉ xảy ra khi có sự cố tạm thời, không mất dữ liệu, người dùng tự thử lại được; hiếm gặp nên chấp nhận ghi lại là hạn chế đã biết.
  file: `apps/app/lib/okr-duong-kr.ts`
  severity: low
  Đề xuất: known-limits

- **ngayVN chép nguyên từ cap-nhat-tuan.tsx, kèm múi giờ viết thẳng**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: ngày hiển thị vẫn theo giờ Việt Nam như cũ.
  Căn cứ: Không có hậu quả nào cho người dùng; chi phí dọn không đáng so với lợi ích, và đoạn mã này sẽ được dọn cùng việc gỡ phần cập nhật hàng loạt cũ.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: low
  Đề xuất: wont-fix

- **giaiDichKr nuốt mọi lỗi của okr.viTriKr, không log, lặng lẽ đổi đích sang Của tôi**
  Người dùng thấy gì: Khi hệ thống trục trặc tạm thời, bấm vào KR có thể bị đưa về Của tôi kèm báo không thấy KR sai sự thật, và sự cố không để lại dấu vết cho đội kỹ thuật. Người dùng thử lại sau là được.
  Căn cứ: Không mất dữ liệu và người dùng tự khắc phục bằng cách thử lại; chỉ xảy ra lúc có sự cố nên mức ảnh hưởng nhẹ.
  file: `apps/app/lib/okr-duong-kr.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
