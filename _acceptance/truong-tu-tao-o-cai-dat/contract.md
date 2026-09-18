---
schema_version: 1
feature: Người quản trị tìm thấy trường tự tạo ở Cài đặt và được gợi ý bộ trường của môi giới Việt
slug: truong-tu-tao-o-cai-dat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-18-truong-tu-tao-o-cai-dat-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-18T01:45:00Z
---

# Acceptance Contract: truong-tu-tao-o-cai-dat

## Context

Kho đã có trường tự tạo từ 2026-08-06: ba bảng dữ liệu, mười kiểu trường, mười
một điểm cuối API, một màn quản trị đã Việt hoá. Chủ kho không biết nó có, vì
màn đó chỉ mở được từ trong thẻ hồ sơ và trang Cài đặt không có mục nào cho
trường. Bộ gợi ý trường lại là của một CRM Mỹ, còn Cá nhân và Thoả thuận không
có gợi ý nào.

Vòng này không xây lại tính năng. Nó mở đường vào từ trang Cài đặt và thay bộ
gợi ý bằng bộ trường của môi giới tài chính và bất động sản Việt. Người dùng là
người quản trị CRM, giai đoạn này là chủ kho hoặc một nhân viên quan hệ đối tác
được giao dựng cấu trúc dữ liệu cho cả đội.

Source input: prompt (buổi khai thác 2026-09-18, Cổng Đáng ký `build` cùng ngày)

## Criteria

- AC-1: Given nhân viên đang ở trang Cài đặt, When họ đọc thanh bên, Then một mục mang nhãn «Trường» có mặt, đứng ngay sau mục Tiền tệ, và nhãn đó theo đúng tiếng đang chọn.
- AC-2: Given nhân viên đang ở trang Cài đặt, When họ bấm mục Trường, Then trang quản trị trường mở ra với tiêu đề và mô tả bằng tiếng đang chọn, không phải một trang trống.
- AC-3: Given trang Trường vừa mở, When nhân viên chưa bấm gì, Then ba thẻ Công ty, Cá nhân, Thoả thuận có mặt với nhãn tiếng Việt, và thẻ Công ty là thẻ đang mở.
- AC-4: Given nhân viên đang mở thẻ Cá nhân, When họ tải lại trang, Then thẻ Cá nhân vẫn là thẻ đang mở, vì thẻ được giữ trên địa chỉ.
- AC-5: Given khay trượt quản trị trường được lắp ở bố cục chung của khu làm việc, When nhân viên mở trang Cài đặt › Trường, Then khay trượt KHÔNG hiện trên màn, vì trang dùng nhóm khoá tham số riêng.
- AC-6: Given bộ gợi ý trường, When đọc nhóm Công ty, Then không còn gợi ý nào của bộ cũ (vùng bán hàng AMER, EMEA, APAC; phân khúc Enterprise, Mid-Market, SMB; giai đoạn Lead, MQL, SQL), và mọi nhãn mới mang dấu tiếng Việt.
- AC-7: Given bộ gợi ý trường, When đọc cả ba nhóm Công ty, Cá nhân, Thoả thuận, Then mỗi nhóm có ít nhất bốn gợi ý, và mọi nhãn cùng mọi lựa chọn mang dấu tiếng Việt.
- AC-8: Given vòng tiếp thị tuyển đối tác đã gieo chín trường trên Cá nhân với khoá cố định, When đối chiếu bộ gợi ý Cá nhân với chín khoá đó, Then không khoá nào trùng, và phép đo gọi tên đúng khoá trùng nếu có.
- AC-9: Given nhân viên đang ở trang Trường, thẻ Thoả thuận, When họ bấm một gợi ý, Then trường tồn tại qua API với đúng nhãn, đúng kiểu và đúng bộ lựa chọn của gợi ý đó, và nó hiện trong nhóm trường đang dùng. (cross-layer)
- AC-10: Given nhân viên đang ở trang Trường, When họ tạo một trường từ đầu rồi sửa nhãn của nó rồi lưu trữ nó, Then cả ba việc thành công trên trang, không phải chỉ trong khay trượt. (cross-layer)
- AC-11: Given đường vào cũ từ thẻ hồ sơ, When nhân viên mở khay trượt quản trị trường như trước, Then khay vẫn làm được đúng sáu việc của trục việc-người-quản-trị, mỗi việc xác nhận ở tầng sau: xem danh sách, tạo từ gợi ý, tạo từ đầu, sửa nhãn, xếp lại thứ tự, lưu trữ. (cross-layer)
- AC-12: Given thực thể đang mở chưa có trường tự tạo nào, When trang hiện danh sách, Then trạng thái rỗng hiện lời «Chưa có trường tự tạo nào» kèm khối gợi ý; và khi danh sách tải lỗi, trang hiện lời lỗi kèm nút thử lại.
- AC-13: Given chữ «Trường» là từ mới trên màn hình, When đọc từ điển sản phẩm, Then nó có một mục nêu nghĩa và nêu các từ cần tránh.
- AC-14: Given thực thể đang mở đã có trường, When trang hiện danh sách, Then nhóm trường chuẩn của hệ thống và nhóm trường đang dùng đều có mặt với tiêu đề đọc được, nhóm chuẩn có ít nhất một phần tử, và trên thẻ Cá nhân mọi trường mà tầng sau trả về đều hiện trên màn, kể cả trường do bộ cào gieo; và khi người quản trị lưu trữ một trường, nhóm trường đã lưu trữ xuất hiện mang đúng trường đó, còn nhóm đang dùng thôi mang nó. (cross-layer)
- AC-15: Given bảng mười lăm gợi ý mà người ký đã chốt tại buổi thiết kế, When đối chiếu bộ gợi ý trong sản phẩm với bảng đó, Then khớp từng dòng: đúng mười lăm gợi ý, mỗi dòng đúng thực thể, đúng nhãn nguyên văn, đúng kiểu, và với kiểu một-trong-danh-sách thì đúng bộ lựa chọn cả về số lượng lẫn thứ tự; không dòng nào ngoài bảng.
- AC-16: Given một nhãn trường bằng tiếng Việt có dấu, When hệ thống sinh khoá máy cho trường đó, Then khoá bỏ dấu mà giữ đủ chữ — «Loại hình» thành `loai_hinh`, «Đất nền» thành `dat_nen`, «Địa bàn» thành đúng `dia_ban` là khoá bộ cào khai tay — nên khoá đọc được và phép đối chiếu trùng khoá ở AC-8 mới có nghĩa.
- AC-17: Given từ điển sản phẩm liệt một số cụm từ vào danh sách cần tránh, When đối chiếu mọi nhãn và mọi lựa chọn của bộ gợi ý với danh sách đó, Then không nhãn nào và không lựa chọn nào chứa một cụm bị tránh, và phép đo đọc danh sách trực tiếp từ từ điển chứ không chép tay.
- AC-18: Given chữ «Phân khúc» đã có mục trong từ điển với nghĩa là nhóm cá nhân do một bộ lọc đã lưu chọn ra, When đọc bộ gợi ý, Then không gợi ý nào dùng lại chữ đó cho một nghĩa khác, và trường nói về loại bất động sản mang nhãn nói đúng thứ nó chứa.
- AC-19: Given địa chỉ mang tham số thực thể, ví dụ thẻ Cá nhân, When trang được dựng ở phía máy chủ, Then máy chủ nạp trước danh sách trường của ĐÚNG thực thể đó, nên mở lại hoặc chia sẻ đường dẫn không phải chờ một lượt tải thứ hai; và cả trang máy chủ lẫn thành phần trình duyệt đọc cùng một khai báo tham số. (cross-layer)
- AC-20: Given đặc tả giao diện khai ba hành vi bàn phím và khổ hẹp, When người quản trị dùng trang bằng bàn phím ở khổ rộng và mở trang ở khổ 375, Then trang không tràn ngang và ba thẻ bấm được ở cả hai khổ; mũi tên đổi được thẻ và thẻ đang focus có vòng focus thấy được; và Esc đóng ô sửa.

## Coverage

Quét bằng skill `morphological-scan`, preset entity-feature, 2026-09-18. Chân
sản phẩm từ kho; chân ngành là HubSpot `Settings › Properties` và Salesforce
`Setup › Object Manager`, tên xác minh bằng tra web cùng ngày.

- Trục A — đường vào màn trường: Cài đặt (mới, AC-1 AC-2) | thẻ hồ sơ qua khay (đã có, AC-11) | địa chỉ dán trực tiếp (AC-4 AC-5) [thước CE: hành trình người quản trị + HubSpot có cả hai đường, một ở Settings một ở ngay trên hồ sơ]
- Trục B — thực thể mang trường: Công ty | Cá nhân | Thoả thuận (AC-3 AC-7 AC-9) [thước CE: enum `FieldEntity` trong lược đồ dữ liệu, đóng, đúng ba giá trị]
- Trục C — nguồn gốc trường: chuẩn hệ thống | máy gieo | người tạo (AC-8 AC-12 AC-14) [thước CE: `STANDARD_FIELDS` cho chuẩn, `LISTING.fields` chín khoá cho máy gieo, phần còn lại là người tạo — AC-14 canh cả ba nấc cùng hiện trên trang]
- Trục D — việc của người quản trị: xem | tạo từ gợi ý | tạo từ đầu | sửa | xếp lại | lưu trữ (AC-9 AC-10 AC-11 AC-14) [thước CE: mười một điểm cuối API đã có, mỗi việc có đúng một điểm cuối; AC-11 neo đúng sáu việc này cho đường vào cũ]
- Cross-cutting áp mọi ô Core: trạng thái rỗng, đang tải, lỗi (AC-12) · nhãn theo luật nhãn của từ điển và mục từ điển cho từ mới (AC-13) · bàn phím và khổ hẹp (đặc tả UX mục 4).
- Không có dữ liệu cá nhân mới: trang này quản trị định nghĩa trường, không chạm giá trị trường, nên khung dữ liệu cá nhân không áp thêm gì so với hiện trạng.

## Đường đo

- Thước: người lạ tạo xong một trường trên Cá nhân trong ba phút, không cần chỉ dẫn · số từ: phiên nghiệm thu bấm đồng hồ trên sản phẩm thật · bảo đảm bởi: AC-1 AC-2 AC-3 (đường vào phải tồn tại mới bấm được đồng hồ)
- Thước: người lạ dùng ít nhất một gợi ý tiếng Việt thay vì gõ từ đầu · số từ: phiên nghiệm thu quan sát · bảo đảm bởi: AC-7 AC-9
- Thước: sau bốn tuần có ít nhất ba trường tự tạo do người quản trị tạo, không phải máy gieo · số từ: đếm trên bảng `fieldDefinition`, trừ chín khoá khai trong bảng cấu hình bộ cào, trừ trường do thước đo để lại (nhãn mang tiền tố `ZZ thu ` theo AC-9 và AC-10) · bảo đảm bởi: AC-8 và AC-9 và AC-10 (chín khoá là danh sách loại trừ đã có sẵn; tiền tố nhãn là dấu để loại trường rác của thước)

**Giới hạn đã khai của thước thứ ba, người ký cần biết trước khi ký.** Bảng
`fieldDefinition` KHÔNG có cột ghi ai tạo trường. Nên phép đếm trên là **xấp xỉ
bằng phép loại trừ**, không phải một dấu phân biệt thật. Nó đúng khi chỉ có hai
nguồn gieo đang biết: bộ cào và thước đo. Ngày đội phát triển gieo một bộ trường
mới từ một vòng khác, số đếm sẽ lẫn và thước mất nghĩa. Thêm cột ghi ai tạo là
việc chạm lược đồ dữ liệu, tức đường T3 và một cổng duyệt kế hoạch nữa, nên vòng
này không làm — quyết định ghi trong sổ.

## Out of scope

- Sửa khay trượt quản trị trường — đang chạy, đã Việt hoá; vòng này chỉ thêm đường vào, và AC-11 canh nó không hồi quy.
- Chặn quyền sửa trường theo vai trò — ô riêng; chạm xác thực nên là T3.
- Kiểu tiền tệ, kiểu nhiều lựa chọn, trường tính toán — ô riêng, chờ có người đòi.
- Tìm kiếm trường, lọc theo người tạo, gom nhóm trường — HubSpot có, ta chưa cần: mỗi thực thể dưới hai mươi trường.
- Soi danh sách cần tránh của từ điển cho MỌI chữ trên màn — AC-17 chỉ soi bộ gợi ý của vòng này; một bộ soi cho cả sản phẩm là việc riêng.
- Xoá cứng trường từ giao diện — cố ý không có; giao diện chỉ cho lưu trữ mềm, giá trị được giữ.
- Trường cho thực thể ngoài Công ty, Cá nhân, Thoả thuận — mô hình dữ liệu chỉ có ba.
- Dịch nhãn của trường người đã tạo — dữ liệu người nhập không dịch, theo luật kho.
- Nhập trường từ HubSpot hay tệp bảng tính — đã bác ở hồ sơ cơ hội.

## Notes

### Known limits — người ký chấp nhận tại Cổng Bằng chứng 2026-09-18

- **Hàng ba thẻ không cuộn ngang được.** Hôm nay ở khổ điện thoại ba thẻ vẫn
  thấy đủ vì hàng thẻ rộng 201 điểm. Ngày nhãn dài hơn hoặc thêm một thực thể
  thứ tư, thẻ cuối rơi ra ngoài mà không có đường cuộn để với tới. Sửa đúng chỗ
  là ở thành phần thẻ của `packages/ui`.
- **Skill chuẩn giao diện kho khai là bộ soi lấy luật từ mạng, không phải từ
  vựng token.** Hệ quả: mỗi phiên thiết kế chạy trên token đọc từ mã, nên hai
  phiên khác nhau có thể rút ra hai chuẩn khác nhau.
- **Trang chỉ được soi ở một chủ đề màu.** Bản sáng của trang Trường chưa ai
  nhìn. Nếu nó lệch, người dùng chủ đề sáng là người phát hiện.

### Ghi chú

- Chín khoá bộ cào đã gieo trên Cá nhân, là danh sách loại trừ của AC-8:
  `san_luong` · `tin_dang` · `tin_moi_30_ngay` · `dia_ban` · `hinh_thai` ·
  `chung_chi` · `ten_chuyen_trang` · `trang_nhatot` · `san_cap_nhat_luc`
  (`apps/api/src/listings/listings-config.ts`).
- Giả định 2 của hồ sơ cơ hội đã được trả lời và nó SAI: kho đã có chín trường
  thật. Chúng do máy gieo nên ngưỡng nghiệm thu vẫn đo được, với điều kiện phép
  đếm loại đúng chín khoá đó.
- Bộ gợi ý dùng đúng ba kiểu mà khuôn trường hiện cho: một-trong-danh-sách, người
  trong nhóm, số. Không mở rộng kiểu ở vòng này.
- Skill chuẩn giao diện kho khai (`web-design-guidelines`) là bộ soi code giao
  diện, nó lấy luật từ nguồn trên mạng lúc chạy. Sẽ nạp ở bước viết code, không
  phải bây giờ.
- **AC-14 đối chứng màn với tầng sau, không đòi đủ chín khoá bộ cào.** Chín khoá
  chỉ tồn tại sau khi bộ cào chạy một lô tiếp nhận; cơ sở dữ liệu dev 2026-09-18
  chỉ có ba. Đòi đủ chín là đòi một điều kiện của vòng khác, nên phép đo sẽ đỏ vì
  lý do không phải lỗi của vòng này. Thước đo thứ vòng này chịu: mọi trường tầng
  sau trả về đều hiện trên màn.
- **Nhóm trường đã lưu trữ chỉ hiện khi có trường đã lưu trữ.** Đo trên bản
  đang chạy 2026-09-18: thẻ Cá nhân không có trường lưu trữ nào thì danh sách
  chỉ hiện hai nhóm. Nên AC-14 nói hai nhóm luôn có mặt, và nhóm thứ ba xuất
  hiện sau khi lưu trữ. Bản đầu của AC-14 đòi ba nhóm luôn có mặt, tức đòi một
  hành vi sản phẩm không có; sửa lại trước khi viết thước cho nó.
- Bàn phím và khổ hẹp khai ở đặc tả UX mục 4, **không** thành tiêu chí riêng:
  ba thẻ và thanh cuộn ngang dùng nguyên nếp thanh bên Cài đặt đã chạy, nên chỗ
  này không có hình thái mới. Người duyệt soi bằng mắt tại cổng; không có phép đo
  máy nào cho nó ở vòng này.
- Ảnh chụp mà các phép đo đòi là **bằng chứng cho người**, không phải phép đo.
  Riêng phép đo ba thẻ có thêm khẳng định hình học: mỗi thẻ phải có hộp khác
  không và nằm trong khung nhìn, để một trang dựng ra mà thẻ bị đè không đi qua
  được.
- Vòng này thay trọn bộ gợi ý, và **khay trượt cũng đọc bộ gợi ý đó**. Nên khay
  không bất động: nội dung nó hiện sẽ đổi. AC-11 vì thế đo sáu việc ở tầng sau
  chứ không chỉ đo khay còn mở được.
- **AC-17, AC-18 và AC-19 là phạm vi NÂNG THÊM sau vòng nghiệm thu máy thứ
  nhất.** Ba điều này ban đầu là lỗi ngoài hợp đồng do phiên soi độc lập tìm ra,
  và người ký chọn lối «nâng phạm vi sửa ngay» ngày 2026-09-18 thay vì ghi vào
  giới hạn đã biết. Lý do từng điều: một lựa chọn của bộ gợi ý dùng đúng cụm từ
  mà từ điển sản phẩm liệt vào danh sách cần tránh, và nó sẽ thành dữ liệu trên
  màn mà đổi tên sau không sửa được hồ sơ đã tạo; chữ «Phân khúc» bị dùng lại
  cho một nghĩa khác nghĩa đã có mục; và trang máy chủ nạp trước cứng một thực
  thể nên mọi đường dẫn tới thẻ khác phải tải lại từ đầu.
- **AC-16 là phạm vi nới thêm ở bước viết mã, không có trong bản người ký đọc
  lúc chốt phạm vi.** Lý do: hàm sinh khoá máy bỏ mọi ký tự ngoài chữ La Mã
  không dấu, nên nhãn tiếng Việt sinh ra khoá rác (`lo_i_h_nh`), và nhãn «Địa
  bàn» sinh `a_b_n` chứ không phải `dia_ban`. Hệ quả: AC-8 sẽ xanh mà không
  chứng được gì, vì hai tập khoá không bao giờ giao nhau. Sửa hàm là cách duy
  nhất làm AC-8 có nghĩa. Hàm nằm ở `packages/db/src/fields-shape.ts`, không
  phải lược đồ dữ liệu, nên vòng vẫn hạng T2. Trường đã tồn tại giữ khoá cũ:
  hàm chỉ được gọi lúc tạo trường mới, hai chỗ, không nơi nào sinh lại khoá để
  tra cứu.
