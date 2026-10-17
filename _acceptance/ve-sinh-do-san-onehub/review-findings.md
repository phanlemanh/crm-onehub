# Review findings: ve-sinh-do-san-onehub (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **hydrat-record tự ghép lại URL theo-don-vi và cài cứng mã chu kỳ «quy4» ngay trong mã, bỏ qua duongDonVi và đối tượng DO**
  Người dùng thấy gì: Phép đo tự viết lại đường dẫn tới trang Theo đơn vị thay vì dùng chung với các phép đo khác. Hôm nay vẫn mở đúng trang. Nếu sau này đường dẫn trang đó đổi, phép đo này có thể mở nhầm trang mà không báo lỗi.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs`
  severity: low
  Đề xuất: wont-fix

- **ghim-xanh bỏ qua lỗi đọc expected_exit (errs), nên xử khác kit khi evals.yaml khai sai**
  Người dùng thấy gì: Nếu một hồ sơ nghiệm thu khai sai mã thoát mong đợi, công cụ kiểm tra ghim lại sẽ lặng lẽ bỏ qua lỗi khai đó và vẫn báo xanh, trong khi cổng chính thức của bộ kit coi là đỏ. Hiện cả bảy hồ sơ đều khai đúng nên chưa ảnh hưởng ai.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): phép so cây ngoài _acceptance vừa sửa pathspec mà không có đối chứng nào chứng minh nó bắt được khác biệt**
  Người dùng thấy gì: Phần kiểm tra rằng mã nguồn ngoài thư mục nghiệm thu không bị đổi sau khi ghim lại chưa có ca thử chứng minh nó thật sự báo đỏ khi có khác biệt. Lần chạy thật cho thấy nó không báo nhầm, nhưng chưa ai thấy nó bắt được lỗi thật.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Thêm chú thích code mới (JSDoc), trái luật «Never add code comments» (r1)**
  Người dùng thấy gì: Có một dòng chú thích thừa trong mã tính ngày của chu kỳ OKR. Người dùng không thấy khác biệt nào, chỉ là mã không đúng quy ước của kho.
  file: `apps/app/lib/okr-chu-ky-nhan.ts`
  severity: medium
  Đề xuất: wont-fix

- **Chuỗi đường dẫn `/chat/${id}` vừa là dữ liệu ghi bên agent vừa là khoá lọc bên API, khai riêng ở hai package (r1)**
  Người dùng thấy gì: Nếu sau này đổi địa chỉ trang trò chuyện ở một phía mà quên phía kia, thông báo về cuộc trò chuyện sẽ không tự chuyển sang đã đọc khi người dùng mở nó. Hiện tại chưa hỏng.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: medium
  Đề xuất: new-contract

- **pre-push nay bỏ test/build khi lần đẩy chỉ có tệp T1, nhưng CONTRIBUTING.md và CLAUDE.md vẫn ghi là hook chạy mọi bước (r1)**
  Người dùng thấy gì: Tài liệu cho người làm việc trong kho còn ghi bước kiểm trước khi đẩy chạy đủ mọi lệnh, trong khi thực tế lần đẩy chỉ sửa tài liệu thì được bỏ bớt. Người đọc có thể hiểu sai cổng đang làm gì.
  file: `.githooks/pre-push`
  severity: low
  Đề xuất: known-limits

- **TheDangDung ghi đè khoảng cách của Card/CardContent/CardFooter/CardAction bằng className (r1)**
  Người dùng thấy gì: Thẻ «Đang dựng» có khoảng cách hơi khác các thẻ còn lại trong ứng dụng. Giao diện vẫn dùng được, chỉ lệch chút so với nếp chung.
  file: `apps/app/components/agent-builder/the-dang-dung.tsx`
  severity: low
  Đề xuất: known-limits

- **NapSanKhiMoNgan bọc có điều kiện làm RecordSheetHost bị gỡ ra rồi gắn lại mỗi lần mở hoặc đóng ngăn (r1)**
  Người dùng thấy gì: Khi đóng một bản ghi, ngăn bên phải có thể biến mất đột ngột thay vì trượt ra. Mỗi lần mở bản ghi cũng có thể chậm thêm một chút.
  file: `apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx`
  severity: medium
  Đề xuất: known-limits

- **ghim-xanh bỏ qua mã thoát của pre-merge-check: lưới hỏng nội tại (mã 2) vẫn báo «pre-merge sach» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu công cụ kiểm trước khi gộp tự hỏng, bước kiểm vẫn có thể báo là sạch. Người duyệt có thể tin nhầm rằng đã kiểm xong.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **usePhienCuoc: users.me lỗi thì người mở cuộc soạn bị coi im lặng là người xem, luồng không bao giờ tải (r1)**
  Người dùng thấy gì: Nếu việc tải thông tin người dùng bị lỗi, người đã mở cuộc soạn sẽ bị đối xử như người xem và không thấy cuộc trò chuyện. Màn hình không báo lỗi hay có nút thử lại.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: low
  Đề xuất: known-limits

- **tac-nhan-hong chỉ ghi khi lượt gửi cuối là CREATE_AGENT: hỏng sau khi trả lời câu hỏi giữa lúc dựng thì không báo (r1)**
  Người dùng thấy gì: Nếu việc dựng tác nhân hỏng sau khi người dùng đã trả lời một câu hỏi giữa chừng, họ có thể không nhận được thông báo lỗi dù thẻ «Đang dựng» đã hứa sẽ báo.
  file: `apps/agent/agent/lib/thong-bao-tac-nhan.ts`
  severity: low
  Đề xuất: new-contract

- **Hình 4 (âm tính một mình): ghim-xanh coi «không có dòng VIOLATION» là pre-merge sạch mà không xét mã thoát của pre-merge-check.sh (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm trước khi gộp chưa có ca thử chứng minh nó thật sự bắt được vi phạm. Nếu bản thân công cụ hỏng, kết quả vẫn có thể hiện là sạch.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): ghim-xanh cho qua dòng repin thiếu suites_exit hoặc có evals_exit rỗng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một hồ sơ ghim lại có dòng ghi kết quả rỗng vẫn có thể bị coi là xanh. Người duyệt có thể tin nhầm rằng các kiểm tra đã chạy và đạt.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (chuỗi có mặt thay quan hệ): khong-noi coi hunk JSON là đã khai khi nhãn nằm ở bất kỳ đâu trong tệp, không xét khoảng 12 dòng (r1)**
  Người dùng thấy gì: Trong các tệp cấu hình dạng JSON, một thay đổi không được khai riêng vẫn có thể lọt qua phép kiểm nếu tệp đó đã có nhãn khai ở chỗ khác. Người duyệt có thể bỏ sót thay đổi không được báo.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/khong-noi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 3/1 (đo chữ trong mã thay hành vi): «đọc lại model lệch thì ném lỗi, datModel trước eval» được đo bằng indexOf trên mã nguồn (r1)**
  Người dùng thấy gì: Phép kiểm cho việc đặt đúng mô hình AI chỉ dò chữ trong mã chứ không chạy thử. Mã có thể qua kiểm mà vẫn không chặn được lúc chạy thật.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 2 (fixture dựng từ chính danh sách đang đo, không qua đường ghi thật): trạng thái của ranh giới trang được dựng từ khoaNapSan, nên chiều đỏ E4 đỏ vì trang thiếu dữ liệu chứ không vì thứ tự ngăn/trang (r1)**
  Người dùng thấy gì: Bài kiểm thứ tự tải của ngăn bản ghi và trang đỏ khi thiếu dữ liệu, nhưng chưa chứng minh nó bắt đúng lỗi thứ tự gốc. Lỗi cũ có thể quay lại mà bài kiểm không nhận ra.
  file: `apps/app/test/ngan-ban-ghi-nap-san.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (chặn đếm ma trận không thể nổ): «số đường đã mở != 8» so mảng khai với hằng số trong cùng tệp, không so số lần mở thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép đo không tự kiểm số lần mở trang thật có đủ như đã khai hay không. Nếu một số lần mở bị bỏ sót, kết quả vẫn hiện như đủ.
  file: `_acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
