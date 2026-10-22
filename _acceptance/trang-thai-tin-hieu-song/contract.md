---
schema_version: 1
feature: Người gửi tín hiệu được báo trong ngày khi tín hiệu của mình đổi chỗ, và mở ra thấy câu dễ hiểu
slug: trang-thai-tin-hieu-song
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: verified
veto_state: mo
veto_opened_at: 2026-10-22T05:36:00Z
design_doc: docs/superpowers/specs/2026-10-22-trang-thai-tin-hieu-song-design.md
approved_by:
approved_at:
---

# Acceptance Contract: trang-thai-tin-hieu-song

## Context

Trang «Tín hiệu đã gửi» và thẻ «Tất cả» đọc chỗ của tín hiệu từ `LO-TRINH.html` đóng gói vào bản dựng app, nên
chỗ mới chỉ hiện khi bản dựng production kế tiếp chạy xong, và không ai báo người gửi. Việc này cho hai trang đọc
bản chụp lộ trình mới nhất mà LT1c đã giữ (kể cả danh sách tín hiệu) theo cùng luật chọn nguồn của trang Lộ trình,
và khi CRM nhận một bản chụp mới thì so chỗ cũ với chỗ mới của từng tín hiệu rồi ghi một thông báo trong chuông
cho người gửi của mỗi tín hiệu đổi chỗ, trong cùng giao dịch với bản chụp. Dựng trên LT1c (bản chụp), TB1 (chuông)
và TH1 (tín hiệu về kho).

Source input: hàng TH3 `docs/plan/lo-trinh-okr.json` · `_acceptance/trang-thai-tin-hieu-song/opportunity.md` (Cổng
Đáng: build, Phan Le Manh 19/10) · thiết kế `docs/superpowers/specs/2026-10-22-trang-thai-tin-hieu-song-design.md`.

## Criteria

- AC-1: Given bản dựng đang chạy mang chỗ cũ của một tín hiệu và CRM vừa nhận bản chụp của một commit sau giờ bắt đầu dựng mang chỗ mới của nó, When người gửi mở «Tín hiệu đã gửi» và quản trị mở thẻ «Tất cả», Then cả hai hiện nhãn và câu theo bản chụp trong vòng một nhịp làm mới mà không cần dựng lại app. (cross-layer)
- AC-2: Given một bản dựng đang chạy và các ca của bản chụp — cùng sha, commit sau giờ dựng, commit cũ hơn, ca mơ hồ, bản Preview, chưa có bản chụp, kho dữ liệu lỗi, hàng lưu không đọc được — When hai trang tín hiệu chọn nguồn, Then chúng chọn đúng như trang Lộ trình chọn cho cùng ca (bản chụp ở hai ca đầu, tệp đóng gói ở mọi ca còn lại), không bao giờ hiện chỗ cũ hơn bản đang chạy, và ca lỗi không có màn lỗi mới.
- AC-3: Given CRM đang giữ một bản chụp, When nó nhận bản chụp mới hơn, Then mỗi tín hiệu mà nhãn hay nơi người gửi thấy đổi so với bản trước sinh đúng một thông báo cho người gửi mang chỗ mới, theo ma trận chuyển viết trước — vắng → «Đang xem xét» không báo; «Đang xem xét» → «Đã vào nhóm», «Không thành việc», «Đã có việc», «Để sau»; nhóm này → nhóm khác; nhóm → việc «Chưa bắt đầu»; «Chưa bắt đầu» → «Đang làm»; «Đang làm» → «Đã giao»; việc này → việc khác — mỗi ô báo, và tín hiệu không đổi không báo. (cross-layer)
- AC-4: Given các ca không có người nhận hợp lệ — tín hiệu đã lưu trữ, tín hiệu không còn người gửi, người gửi không còn trong không gian làm việc, mã trong bản chụp mà CRM không có — các ca lượt không mới — cùng sha gửi lại, bản chụp cũ hơn, bản chụp đầu tiên khi chưa có bản trước, hai lượt chạy đua cùng một bản chụp — và các ca danh sách tín hiệu không đọc được — vắng hay hỏng ở bản đang lưu, vắng hay hỏng ở bản mới — When CRM nhận bản chụp, Then không thông báo nào sinh ra cho các ca ấy, bản chụp hợp lệ vẫn được nhận như LT1c, ca danh sách hỏng để lại một dòng cảnh báo trong nhật ký, và hai lượt chạy đua vẫn chỉ sinh một thông báo mỗi lần đổi.
- AC-5: Given ghi thông báo thất bại giữa lượt nhận một bản chụp đổi chỗ (lỗi kho dữ liệu — phần so chỗ không ném vì dữ liệu, xem AC-4), When thủ tục đẩy bản chụp chạy, Then thủ tục trả lỗi, bản chụp đang lưu không đổi và không thông báo nào được ghi; chạy lại lượt đó khi hết lỗi thì bản chụp và đủ thông báo cùng vào.
- AC-6: Given mỗi chỗ mà một thông báo đổi chỗ có thể mang, tiếng Việt và tiếng Anh, When chuông và trang Thông báo dựng câu, Then câu là «Tín hiệu «<tiêu đề>» của bạn: <nhãn>» (bản tiếng Anh tương ứng), nhãn trùng đúng nhãn trang «Tín hiệu đã gửi» hiện cho cùng chỗ, tiêu đề do người gửi viết được đánh dấu không dịch, câu không mang mã nội bộ (mã tín hiệu, sha, chữ «gom»), và bấm vào tới trang «Tín hiệu đã gửi».
- AC-7: Given người gửi đã đăng nhập ở 1280 px và 375 px, When CRM nhận một bản chụp đổi chỗ tín hiệu của họ, Then trong vòng một nhịp hỏi lại họ thấy chuông có số chưa đọc và dòng thông báo với câu của AC-6, tiêu đề dài không làm trang cuộn ngang, và bấm dòng đó tới «Tín hiệu đã gửi» thấy nhãn và câu mới của chính tín hiệu ấy. (cross-layer)
- AC-8: Given một tháng sau khi giao, When chủ kho chạy lệnh đo, Then lệnh in mỗi lần một tín hiệu có người nhận hợp lệ đổi chỗ trên nhánh chính một dòng — mã, chỗ mới, giờ commit, giờ thông báo, độ trễ — coi lần đổi có lượt đẩy bị lượt mới hơn thế chỗ là được phủ bởi thông báo của lượt ấy, đánh cờ lần thiếu thông báo và lần trễ quá một ngày, và in một dòng kết luận đạt hay không đạt theo ngưỡng của Cổng Đáng (mọi lần đổi chỗ có thông báo trong vòng một ngày).

## Coverage

- Ngữ cảnh: chân sản phẩm đào từ repo [SUY-TỪ-REPO: docs/plan/pham-vi-vong-tin-hieu-1410.md] [SUY-TỪ-REPO: apps/app/lib/tin-hieu/trang-thai.ts] [SUY-TỪ-REPO: packages/db/src/ban-chup-lo-trinh.ts] · chân ngành [NGÀNH: Canny — cổng góp ý báo người đã bầu khi bài đổi trạng thái] [NGÀNH: UserVoice — thư báo người ủng hộ khi ý tưởng đổi trạng thái].
- Trục A — chặng: nhận bản chụp | so chỗ | ghi thông báo | đọc trang | hiện chuông [thước CE: sơ đồ kiến trúc của design doc, mỗi mũi tên một chặng].
- Trục B — chuyển chỗ: vắng→chờ | chờ→nhóm/lẻ/đã phủ/để sau | nhóm→nhóm | nhóm→việc | việc đổi trạng thái | việc→việc | không đổi [thước CE: tập khoá đóng `CHO_TIN_HIEU` × `nhom_trang_thai` của `@crm/validation/tin-hieu`, đúng các nhánh của `theoKit`].
- Trục C — lượt nhận và người nhận: mới | trùng | cũ hơn | đầu tiên | chạy đua | danh sách cũ hỏng | danh sách mới hỏng | ghi lỗi × người gửi hợp lệ | lưu trữ | không người gửi | rời không gian | mã lạ [thước CE: kết quả `nhan/trung/cu-hon` của `ghiBanChupLoTrinh` + các trường rỗng được của `TinHieu`].
- Lớp cắt ngang: tiếng Việt | tiếng Anh · 1280 | 375 px.
- Core (8 ô): đọc×bản chụp mới → AC-1 · đọc×mọi ca nguồn → AC-2 · so×ma trận chuyển → AC-3 · ghi×người nhận và lượt không mới → AC-4 · ghi×lỗi → AC-5 · hiện×câu → AC-6 · đầu-cuối×khổ → AC-7 · đường đo → AC-8.
- Later: Zalo và Slack, cài đặt loại × kênh (TB2) · báo khi đội sản phẩm lấy tín hiệu về («Đã nhận» → «Đang xem xét») · neo thông báo tới đúng dòng · gom nhiều lần đổi thành một thông báo · báo quản trị · tín hiệu của sản phẩm khác (L6, LT3).
- Never: tác nhân quét theo nhịp để phát hiện đổi chỗ — cần cột nhớ chỗ đã báo, mà bản chụp đã cho sẵn bản trước lúc nhận · bỏ thông báo khi ghi lỗi mà vẫn nhận bản chụp — mất câm, trái ngưỡng «mọi lần».
- Chỗ của tín hiệu chỉ đổi qua một commit đổi `LO-TRINH.html` trên `onehub`: CI chặn mọi PR mà tệp không khớp đầu vào gom và lộ trình, nên lượt đẩy bản chụp là điểm duy nhất cần nghe [SUY-TỪ-REPO: .github/workflows/acceptance.yml] (bước `product-map.mjs --check`).
- Bí mật `CRM_KHOA_DAY_LO_TRINH` và `CRM_API_URL` đã đặt trên kho từ 16/10 (đọc `gh secret list` 22/10); thiếu thì không có bản chụp, trang chạy như hôm nay và không ai được báo [SUY-TỪ-REPO: .github/workflows/ban-chup-lo-trinh.yml].

## Đường đo

- Thước: tỉ lệ lần đổi chỗ có thông báo trong vòng một ngày (ngưỡng: mọi lần) · số từ: lịch sử first-parent của
  `onehub` đổi `LO-TRINH.html` (git) ghép các dòng thông báo loại đổi chỗ trong CRM, theo mã tín hiệu và sha · bảo
  đảm bởi: AC-8 (lệnh đo), AC-3 và AC-5 (mỗi lần đổi một thông báo, không mất câm).
- Thước: độ trễ từ commit tới thông báo · số từ: cùng bảng, giờ thông báo trừ giờ commit · bảo đảm bởi: AC-8.

## Out of scope

- Zalo, Slack và cài đặt loại × kênh — TB2 (N3, N4).
- Báo khi đội sản phẩm vừa lấy tín hiệu về («Đã nhận» → «Đang xem xét»): CRM đổi nhãn đó lúc kéo về, không phải
  đổi chỗ do đội sản phẩm xếp.
- Neo thông báo tới đúng dòng của tín hiệu trên trang; bấm vào mở trang «Tín hiệu đã gửi».
- Gom nhiều lần đổi của một người thành một thông báo; báo cho quản trị.
- Tín hiệu của sản phẩm khác — L6, LT3.
- Sửa bộ vẽ `LO-TRINH.html`, bộ đọc chép từ kit, hay đường đẩy của LT1c.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Ba câu vòng đời (`docs/vong-doi.md`): thông báo loại mới theo vòng đời thông báo của TB1 (dọn sau 90 ngày, không
  xoá tay); không thêm bản ghi hay nút xoá nào.
- API lần đầu ghi `ThongBao` (trước nay chỉ tác nhân ghi): luật tất định trong giao dịch, cùng nếp `sinhGoiYKeHoach`
  (DA3b); ghi vào `docs/api.md` mục «Tín hiệu».
- Tệp chung (luật 7 của đợt, chỉ thêm dòng): `_acceptance/config.yaml` (khoá executors), `apps/app/lib/messages/
  thong-bao.ts`, `apps/app/lib/messages/tin-hieu.ts` nếu cần. Không migration.
