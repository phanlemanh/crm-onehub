## Trong hợp đồng

### AC-9 guard checks where the token comes from, but not where the session ctx comes from
- file: apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts:715
- severity: low
- AC: AC-9
- detail: AC-9 promises that every channel event in the `cung-phien` and `duong-chinh` blocks uses a `continuationToken` **and** session attributes (ctx) taken from the `send` call recorded by the fake eve (`không chuỗi token hay ctx nào dựng tay`). The round-1 fix does three things: it bans the substrings `ctxZalo(`, `suKien(`, `suKienVoi(`, `"zalo:` and `` `zalo: ``; it forces every `continuationToken:` line to start with `tokenTuSend(`; and it requires at least one such line. Nothing checks the third argument (ctx) of a channel handler call. The `input.requested` case at line ~1224 already calls `zaloEvents[...]` directly. A call in the same form with a hand-built ctx literal passes the guard. Example: `{ session: { id: "x", auth: { current: { attributes: { purpose: ZALO.hoi.purpose, hoiId, zaloChatId: "ZA" } }, initiator: null } } }` contains no banned substring, and its token line still starts with `tokenTuSend(`. The same goes for a token passed as a shorthand `{ continuationToken }` from a variable, which the `continuationToken:` regex never sees. The current code is correct: every ctx comes from `phienTuSend`. But the guard that measures AC-9 covers only the token half of the promise, which is the same class of hole as the round-1 finding (a ban on names, not on what the promise names). A fix would be to require every direct `xuLy`/handler call in these blocks to take `phienTuSend(` as its ctx argument, or to allow only `suKienTuSend(` as the way to raise a channel event.
- source: bugs
- rationale: AC-9 hứa rõ mọi sự kiện kênh dùng continuationToken VÀ thuộc tính phiên (ctx) rút từ lời gọi send, không dựng tay; finding chỉ ra vế ctx của đúng lời hứa này không có gì chặn.

### Hình dạng 5 — tuyên quét LỚP «mọi sự kiện kênh rút từ send» nhưng số assert không bằng số điểm phát sự kiện
- file: apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts:720
- severity: medium
- AC: AC-9
- detail: Test «cung-phien: su kien kenh trong cung-phien va duong-chinh rut tu send» (dòng 706–733) đo AC-9/E9. Lời hứa là: MỌI sự kiện kênh trong năm khối lấy continuationToken VÀ attributes từ eveGia.send[i]. Nhưng phép quét không liệt kê các điểm phát sự kiện. (a) Regex `dongToken = /continuationToken:\s*[^,\n]+/g` chỉ khớp dạng có dấu hai chấm. Trong năm khối có đúng 1 dòng như vậy (dòng 1230, `continuationToken: tokenTuSend(eve, 0)`), trong khi có 8 điểm phát sự kiện (7 lời gọi `suKienTuSend(` ở các dòng 689, 744, 759, 1178, 1189, 1273, 1291 cộng một lời gọi `xuLy?.(` trực tiếp ở dòng 1226). Chốt cuối chỉ là `expect(soToken).toBeGreaterThan(0)` chứ không phải `toBe(8)`. Thêm một điểm phát sự kiện mới thì không assert nào tăng theo. (b) Dạng viết tắt `{ continuationToken }` (chính dạng mà `suKienVoi` dùng ở dòng 545) không khớp regex, nên một lời gọi `xuLy(data, { continuationToken }, ctx)` với token dựng tay trong khối lọt qua mà không bị đếm. (c) Phần attributes của lời hứa chỉ được rào bằng danh sách cấm theo tên hàm (`cam` ở dòng 715: `ctxZalo(`, `suKien(`, `suKienVoi(`, `"zalo:`, `` `zalo: ``). Một ctx viết tay dạng `{ session: { auth: { current: { attributes: { purpose: "zalo", hoiId } } } } }`, hay một helper tên khác, đều không vi phạm. Nói gọn: không có ma trận viết trước kiểu «mỗi điểm phát sự kiện phải đi qua suKienTuSend/tokenTuSend+phienTuSend», số assert không bằng số phần tử, và đây là danh sách cấm chứ không phải danh sách trắng như commit 14f290d6 mô tả.
- source: measurement
- rationale: Đúng lời hứa «mọi sự kiện kênh» của AC-9; finding cho thấy phép quét không phủ hết số điểm phát sự kiện nên lời hứa «mọi» chưa được đo đủ.

### Hình dạng 2 — tokenTuSend tự dựng tay tiền tố kênh `zalo:` thay vì lấy qua đường ghi thật của eve
- file: apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts:578
- severity: low
- AC: AC-9
- detail: `tokenTuSend` trả về `` `zalo:${goi.continuationToken}` ``. Đây chính là mẫu `` `zalo: `` mà phép quét ở dòng 715–718 cấm trong năm khối. Nó lọt vì helper nằm ngoài vùng quét, mà mọi lời gọi suKienTuSend trong năm khối đều đi qua helper này. Token ở phía kênh trong production do `createSendFn` của eve dựng (`` `${channelName}:${continuationToken}` `` trong node_modules/eve/dist/src/channel/send.js). eveGia thì bắt `y.continuationToken` trước bước ghép đó, nên test chép tay phép biến đổi của eve cho đúng khuôn mà bên đọc chờ, chứ không đi vòng qua bộ ghi thật. Tên kênh hay cách eve ghép token mà đổi thì test vẫn xanh. Lời hứa E9 «lay continuationToken tu loi goi send that» vì vậy mới đúng một nửa: phần thân lấy từ send, còn phần tiền tố là dựng tay.
- source: measurement
- rationale: AC-9 cấm chuỗi token dựng tay; helper dùng trong đúng hai ca cung-phien/duong-chinh tự ghép tiền tố `zalo:` thay vì lấy nguyên từ send thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chặn Zalo trong execute không tới được ở hai công cụ có approval (archive_field, record_job_change) (r1)**
  Người dùng thấy gì: Với các thao tác cần duyệt trước khi ghi (như lưu trữ trường hay ghi nhận đổi việc), người hỏi qua Zalo có thể bị kẹt ở bước hỏi lại thay vì nhận được câu trả lời tiếp theo, dù không có dữ liệu nào bị ghi nhầm.
  file: `apps/agent/agent/tools/archive_field.ts`
  severity: medium
  Đề xuất: known-limits

- **assertNotZaloQuestion so với chuỗi "zalo" viết tay, trong khi lớp ẩn dùng ZALO.hoi.purpose (r1)**
  Người dùng thấy gì: Hiện chưa ảnh hưởng gì tới người dùng vì hai cách viết đang cho cùng một giá trị; nhưng nếu sau này có người đổi một chỗ mà quên chỗ còn lại, ranh giới bảo vệ dữ liệu khi hỏi qua Zalo có thể lặng lẽ hỏng mà không ai biết.
  file: `apps/agent/agent/lib/session-purpose.ts`
  severity: low
  Đề xuất: known-limits

- **SO_TIEN exemption unmasks international phone numbers written with dot groups (PII leak regression) (r1)**
  Người dùng thấy gì: Một số số điện thoại quốc tế viết theo nhóm ba số cách nhau bằng dấu chấm (ví dụ dạng +84 912.345.678) có thể bị lộ nguyên văn trong câu trả lời trên Zalo thay vì được ẩn đi như các số điện thoại khác.
  file: `apps/agent/agent/lib/zalo-loc.ts`
  severity: high
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
