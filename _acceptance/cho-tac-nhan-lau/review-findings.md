# Review findings: cho-tac-nhan-lau (round 1)

## Trong hợp đồng

- **Chặn trùng thông báo chỉ có hiệu lực trong một ngày VN, nên một lượt vẫn có thể nhận hai thông báo**
  file: `apps/agent/agent/lib/thong-bao-tac-nhan.ts:81`
  severity: medium
  AC: AC-4
  source: bugs
  detail: Chặn trùng dựa vào skipDuplicates trên ràng buộc unique @@unique([nguoiNhanId, khoa, ngayDau]) (packages/db/prisma/schema.prisma:3110), với ngayDau = ngayVN(now) lấy lúc sự kiện tới. Khoá là `${loai}:${luotId}` (packages/validation/src/thong-bao.ts). Vì vậy hai sự kiện của cùng một lượt rơi vào hai ngày VN khác nhau sẽ ghi hai hàng, trái AC-4 («cùng một lượt gửi nhận sự kiện lần hai không sinh thông báo thứ hai»). Ví dụ: turn.failed lúc 23:59:59 rồi session.failed sau 00:00 (giờ VN), hoặc session.waiting được phát lại cho cùng một lượt vào ngày sau. Ca kiểm «turn.failed rồi session.failed cùng lượt -> 1» chỉ chạy trong một ngày nên không bắt được. Với nguồn tac-nhan, ngayDau nên là một giá trị cố định theo lượt (ví dụ ngayVN của luot.createdAt), hoặc kiểm hàng đã có theo khoa trước khi ghi.

- **Phần translate="no" bọc nhầm chỗ khi tên tác nhân trùng một chữ đứng trước trong câu mẫu**
  file: `apps/app/components/thong-bao/dong-thong-bao.tsx:86`
  severity: low
  AC: AC-5
  source: bugs
  detail: CauDong dùng cau.indexOf(khongDich), tức lần xuất hiện đầu tiên của tên trong cả câu đã điền. Câu mẫu đều mở đầu bằng «Kara …», bản en còn có các chữ «finished building», «open it», «keep building». Nếu tác nhân tên «Kara», «building» hay «it» (hoặc tên là chuỗi con của phần đứng trước «{ten}»), span translate="no" sẽ bọc vào chữ của câu mẫu. Tên thật (dữ liệu người dùng) lại nằm ngoài span nên trình duyệt vẫn có thể dịch nó, trái AC-5. Nên tìm vị trí theo dấu «…» bao quanh tên, hoặc trả về các mảnh câu từ cauThongBao thay vì dò lại chuỗi.

- **Hình dạng 4 (âm tính một mình): ô «turn.cancelled roi waiting -> khong bao» xanh bất kể có chặn huỷ hay không**
  file: `apps/agent/test/cho-tac-nhan-lau.integration.spec.ts:189`
  severity: high
  AC: AC-4
  source: measurement
  detail: Ô ma trận chỉ chạy `gui(id); phat("turn.cancelled"); phat("session.waiting")` rồi kỳ vọng `loai: []`, và không gọi `luuBanNhap(id)`. Với nhánh «cho» không có câu hỏi chờ, `noiDungTacNhan` trả null khi không có `agentVersion` mới (`if (!banMoi) return null`), nên ô này cho 0 dòng chỉ vì thiếu bản nháp, không phải vì người dùng đã huỷ. Handler `turn.cancelled` trong crm.ts và bộ ghi không có logic nào nhớ lượt đã huỷ, nên nếu một lượt lưu bản nháp rồi mới bị huỷ thì lần `session.waiting` sau đó vẫn ghi `tac-nhan-xong`. Lời hứa «người dùng tự dừng không sinh thông báo» của AC-4/E4 vì thế chưa được đo. Ô này thiếu đối chứng dương: chạy cùng chuỗi đó nhưng có bản nháp, rồi kỳ vọng 0 dòng.

- **Hình dạng 3 (quan hệ đo thành hai sự kiện có mặt riêng): ca ghi-hong không đo «vòng đời vẫn ghi KHI bộ ghi hỏng»**
  file: `apps/agent/test/cho-tac-nhan-lau.integration.spec.ts:303`
  severity: medium
  AC: AC-7
  source: measurement
  detail: E7 hứa: thay bộ ghi bằng hàm ném lỗi thì `session.waiting` và `session.failed` vẫn cập nhật `continuationToken` và `lastAssistantAt`, và không ném ra ngoài. Test chỉ gọi thẳng `baoTacNhan(id, "cho", async () => { throw ... })`, không đi qua `crmEvents`, nên đường thật của handler không bao giờ gặp bộ ghi hỏng. Sau đó test chạy `phat("session.waiting", ...)` với bộ ghi THẬT rồi mới kiểm `continuationToken` (dòng «vong doi van ghi»). Như vậy «bộ ghi nuốt lỗi» và «vòng đời có ghi» được đo ở hai lượt khác nhau, không đo cùng một sự kiện. Ngoài ra `session.failed` khi bộ ghi hỏng không được chạy, và `lastAssistantAt` không được kiểm ở ca này.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca gan-muon dùng batDauLuc viết tay thay vì createdAt của hàng gửi thật**
  file: `apps/app/test/cho-tac-nhan-lau.dom.tsx:9`
  severity: medium
  AC: AC-1
  source: measurement
  detail: E1 ghi rõ ca «gan-muon» phải lấy startedAt từ createdAt của submission do builderById trả về, «khong viet tay». Test lại render thẳng `<TheDangDung batDauLuc={BAT_DAU} />` với hằng `BAT_DAU = "2026-10-16T03:00:00.000Z"` (dòng 9 và dòng 52), nên chỉ đo bên đọc (`daTroiTuLucGui`). Chỗ nối thật `startedAt={submissions.at(-1)?.createdAt ?? null}` ở agent-builder-chat.tsx:506 không có trong phép đo. Nếu dòng đó đổi sang một mốc lấy lúc gắn thẻ, ca này vẫn xanh.

- **Hình dạng 4 (âm tính không thể đỏ): «khong tu dung» đếm lượt bấm vào nút do chính test dựng**
  file: `apps/app/test/cho-tac-nhan-lau.dom.tsx:158`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Ở ca qua-nguong, `expect(daBam, "qua nguong — khong tu dung").toBe(0)` đếm số lần gọi `onDung` của một `<button>` do test truyền vào qua prop `nutDung`. `TheDangDung` chỉ nhận `ReactNode` và không có tham chiếu nào tới hàm huỷ. Nếu có tự huỷ khi quá ngưỡng thì nó sẽ nằm ở `BuildingAgentCard`/`stop.run()` trong agent-builder-chat.tsx, ngoài phạm vi render của test. Vì vậy assert âm này không thể đỏ dù có cài tự huỷ, nên lời hứa «lượt dựng không bị tự huỷ» của AC-3 chưa được đo.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): hai-ngon-ngu liệt kê tay 3 khoá, thiếu chiều chuông và chiều ngược**
  file: `apps/app/test/cho-tac-nhan-lau.dom.tsx:170`
  severity: medium
  AC: AC-8
  source: measurement
  detail: E8 hứa «mọi khoá messages vòng này thêm có cả vi và en ... kiểu hàm giống nhau; render thẻ đang dựng VÀ dòng chuông ở locale en không còn chữ tiếng Việt và ngược lại». Test chỉ có danh sách viết tay `[roiTrang, lauHon, daTroi]`, không rút từ diff hay từ object messages. Các khoá vòng này cũng thêm vào lib/messages/thong-bao.ts (`chuong.tacNhanKhongTen`, `cau["tac-nhan-xong"|"tac-nhan-can-tra-loi"|"tac-nhan-hong"]`) nằm ngoài ma trận, và kiểu hàm không được so. Phần render chỉ dựng thẻ ở locale en (`veThe("en", ...)`): không dựng dòng chuông, không có chiều vi không lẫn chữ en. Lệnh `ctnl_the_dung` chỉ chạy tệp này nên các phép đo khác không bù vào E8.

- **Hình dạng 5 (thiếu ma trận toàn phần): thước màn E9 không có trạng thái dưới ngưỡng và không có «mở từ chuông» ở 375**
  file: `_acceptance/cho-tac-nhan-lau/rang/do-man.mjs:27`
  severity: medium
  AC: AC-9
  source: measurement
  detail: AC-9/E9 cần 4 trạng thái (dưới ngưỡng, trên ngưỡng, chuông có «xong», mở cuộc trò chuyện từ chuông) × 2 khổ (375, 1280) = 8 ô. `MA_TRAN` khai 5 ô: the-1280, the-375, chuong-1280, mo-tu-chuong-1280, chuong-375. Script chỉ gieo một cuộc đang dựng với `createdAt = now - DA_CHO_MS`, trong đó `DA_CHO_MS = CHO_TAC_NHAN.nguongLauMs + 50_000` (dòng 24, 135), tức luôn ở TRÊN ngưỡng. Mục (1) của E9 («dưới ngưỡng có dòng thời gian và lời hứa, không có dòng quá ngưỡng») vì thế không được đo trên màn thật. Ảnh ST-duoi-nguong-* trong evidence là ảnh design-pass của bản mẫu proto, không phải đầu ra của thước này. Ô mở-từ-chuông ở 375 cũng không có. Đây cũng là nguyên nhân E9 đỏ ở round này.

- **Hình dạng 3 (quan hệ không phân biệt được): nguoiNhanId = người mở cuộc trò chuyện, nhưng dữ liệu cho người mở trùng người gửi**
  file: `apps/agent/test/cho-tac-nhan-lau.integration.spec.ts:62`
  severity: low
  AC: AC-4
  source: measurement
  detail: E4 hứa «nguoiNhanId = người mở cuộc trò chuyện». Trong mọi ô, `taoHoiThoai` đặt `userId: nguoi` và `gui` đặt `submittedById: nguoi`, rồi `dong()` lọc theo `nguoiNhanId: nguoi`. Vì người mở và người gửi là cùng một giá trị, nếu bộ ghi đổi sang `submittedById` thì test vẫn xanh. Quan hệ «người nhận = chủ cuộc trò chuyện» chỉ được đo khi hai giá trị khác nhau.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **markRead làm mới thongBao bằng khoá liệt kê tại chỗ gọi, bỏ qua cache.thongBao() và không làm mới thongBao.danhSach**
  Người dùng thấy gì: Sau khi mở một cuộc trò chuyện, số trên chuông giảm đúng, nhưng trang Thông báo có thể vẫn hiện các dòng đó là chưa đọc cho tới khi tải lại trang.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: medium
  Đề xuất: known-limits

- **className đổi khoảng cách của CardAction và CardFooter từ @crm/ui**
  Người dùng thấy gì: Khoảng cách và cỡ chữ ở thẻ Đang dựng được chỉnh riêng thay vì dùng kiểu chung của ứng dụng, nên có thể lệch nhẹ so với các màn khác sau này.
  file: `apps/app/components/agent-builder/the-dang-dung.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu «quá 3 phút» viết cứng, lệch khỏi ngưỡng có thể chỉnh CHO_TAC_NHAN.nguongLauMs (200 s); đơn vị giây khai lại lần nữa**
  Người dùng thấy gì: Nếu sau này đổi thời gian chờ lâu, dòng báo trên thẻ vẫn ghi «quá 3 phút» và sẽ không khớp con số mới.
  file: `apps/app/lib/messages/agent-builder-tro-chuyen.ts`
  severity: low
  Đề xuất: known-limits

- **Thông báo tác nhân kẹt «chưa đọc» khi người dùng xem kết quả ngay trên màn chat rồi gửi tiếp**
  Người dùng thấy gì: Nếu bạn ngồi chờ ngay trên màn chat, thấy kết quả rồi gõ tiếp, chuông có thể vẫn đếm một thông báo «xong» hoặc «cần trả lời» của chính cuộc trò chuyện đó.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
