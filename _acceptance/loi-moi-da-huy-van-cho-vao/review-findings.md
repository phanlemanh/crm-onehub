# Review Findings: loi-moi-da-huy-van-cho-vao (round 6)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tập trạng thái "còn hiệu lực" vẫn gõ tay trong hai truy vấn của workspace.service, trong khi CON_HIEU_LUC được đẻ ra đúng cho việc đó và không có nơi nào dùng**
    Người dùng thấy gì: Khi một thành viên bị gỡ, lời mời cũ của họ có thể vẫn còn hiệu lực, nên người vừa bị gỡ có nguy cơ đăng nhập lại được.
    file: `apps/api/src/workspace/workspace.service.ts`
    severity: high
    Đề xuất: known-limits

- **Fixture `cong-vao.integration.spec.ts` vẫn gieo "cancelled" — eval đã ký cp_rut_khong_dung_da_vao nay đo nhánh unknown chứ không đo nhánh thu hồi**
    Người dùng thấy gì: Một bài kiểm tra tự động vẫn dùng dữ liệu kiểu cũ, nên phép đo liên quan không còn phản ánh đúng cách hệ thống hoạt động hiện tại dù kết quả cuối vẫn hiện đạt.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: high
    Đề xuất: known-limits

- **E2 trong evals.yaml khai một assert bảo vệ mà bài test không có, và cả E1/E2/E4 khai "in chuỗi thật ra output" trong khi bài không in gì**
    Người dùng thấy gì: Tài liệu mô tả phép đo ghi nhầm một số nội dung không khớp với bài kiểm tra thật, có thể khiến người đọc hiểu sai mức đã được kiểm chứng.
    file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
    severity: medium
    Đề xuất: known-limits

- **ALLOWANCE_STATUSES chép tay lại từ vựng mà packages/validation đã sở hữu**
    Người dùng thấy gì: Danh sách trạng thái hiển thị cho màn thành viên được chép tay ở một nơi riêng, nên nếu sau này có thêm một trạng thái mới, cả màn danh sách thành viên có thể lỗi không tải được.
    file: `apps/api/src/workspace/workspace.contracts.ts`
    severity: medium
    Đề xuất: known-limits

- **Lộ trình gia nhập trong organization.ts vẫn gõ tay "pending"/"accepted" sau khi từ vựng có tên đã tồn tại**
    Người dùng thấy gì: Một bước xử lý khi lời mời được chấp nhận vẫn viết trạng thái bằng chữ tay, nên nếu sau này từ vựng trạng thái đổi, lời mời có thể bị kẹt ở trạng thái chờ thay vì chuyển thành thành viên.
    file: `packages/auth/src/organization.ts`
    severity: medium
    Đề xuất: known-limits

- **Assert bằng-nhau ở mức kiểu (BangNhau/_KHOP) là pattern tự đặt riêng cho một file, nằm trong mã sản phẩm**
    Người dùng thấy gì: Một đoạn kiểm tra kỹ thuật nội bộ dùng cách viết riêng biệt so với phần còn lại của mã nguồn; điều này không ảnh hưởng tới người dùng cuối.
    file: `packages/auth/src/invitation-status.ts`
    severity: low
    Đề xuất: known-limits

- **evidence-page.html vẫn là bản vòng 2: badge PASS, 9 eval, thiếu E10 — trong khi evidence-report.md ở HEAD là REJECT với 10 eval**
    Người dùng thấy gì: Trang bằng chứng liên kết từ thẻ quyết định vẫn hiển thị kết quả cũ là đạt toàn phần, trong khi báo cáo mới nhất thực ra là từ chối, nên người đọc có thể thấy thông tin đã lỗi thời.
    file: `_acceptance/loi-moi-da-huy-van-cho-vao/evidence-page.html`
    severity: high
    Đề xuất: known-limits

- **card.html nói với người ký «9/9 phép kiểm máy đều đạt · bằng chứng đủ, không lỗi» trong khi hồ sơ đang REJECT**
    Người dùng thấy gì: Thẻ tóm tắt gửi cho người ký ghi rằng mọi phép kiểm đều đạt và không có lỗi, trong khi hồ sơ thực tế đang bị từ chối, có thể khiến người ký nhầm mà duyệt một hồ sơ chưa đạt.
    file: `_acceptance/loi-moi-da-huy-van-cho-vao/card.html`
    severity: high
    Đề xuất: known-limits

- **ALLOWANCE_STATUSES chép tay lại từ vựng thay vì dẫn xuất từ @crm/validation — lệch một giá trị là màn thành viên 500 chứ không phải hiện sai**
    Người dùng thấy gì: Danh sách trạng thái hiển thị cho màn thành viên được chép tay riêng, nên nếu sau này better-auth thêm một trạng thái mới, cả màn danh sách thành viên có thể lỗi không tải được thay vì chỉ hiện sai một dòng.
    file: `apps/api/src/workspace/workspace.contracts.ts`
    severity: medium
    Đề xuất: known-limits

- **Không có migration cho dòng "cancelled" cũ, và CANCELLED_CU không được dùng ở mã sản phẩm — giá trị cũ đã biết bị báo y hệt dữ liệu rác**
    Người dùng thấy gì: Dữ liệu trạng thái cũ còn sót lại sẽ khiến nhật ký hệ thống ghi lỗi lặp lại mỗi lần người liên quan đăng nhập hoặc admin mở màn thành viên, dù quyết định cho vào hay từ chối vẫn đúng.
    file: `packages/auth/src/allow-list.ts`
    severity: medium
    Đề xuất: known-limits

- **cong-vao.integration.spec.ts vẫn gieo chuỗi "cancelled" đã nghỉ hưu, nên eval cp_rut_khong_dung_da_vao hết round-trip với vế ghi**
    Người dùng thấy gì: Một bài kiểm tra tự động vẫn dùng giá trị trạng thái cũ mà hệ thống không còn tạo ra, nên phép đo liên quan không còn phản ánh đúng cách ghi dữ liệu hiện tại dù kết quả vẫn hiện đạt.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: low
    Đề xuất: known-limits

- **allowEmail và removeMember vẫn gõ tay ["pending","accepted"] thay vì CON_HIEU_LUC — tập «còn hiệu lực» có hai nguồn sự thật**
    Người dùng thấy gì: Khi gỡ một thành viên hoặc mời lại một địa chỉ đã có lời mời, hệ thống dùng một danh sách trạng thái viết tay riêng, nên người vừa bị gỡ có nguy cơ vẫn đăng nhập lại được.
    file: `apps/api/src/workspace/workspace.service.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 2 + 4 — E2 (`tu-choi-loi-moi`): một assert âm tính đơn độc trên cữ liệu gõ tay không neo về phía writer**
    Người dùng thấy gì: Bài kiểm tự động cho trường hợp lời mời bị từ chối không thực sự đối chiếu với chuỗi thật do gói bên ngoài ghi ra, nên một lỗi đúng chỗ này có thể trôi qua mà không ai phát hiện, dù hệ thống hiện vẫn hoạt động đúng.
    file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 2 + 4 — E4 (`du-lieu-cu`): cữ liệu dữ-liệu-cũ `CANCELLED_CU` là hằng gõ tay chưa bao giờ được ghim, và ô `cancelled-cu` của E8 thu về đúng ô `rac`**
    Người dùng thấy gì: Bài kiểm tự động cho dữ liệu cũ đã huỷ không thực sự đối chiếu với chuỗi từng được ghi trước đây, nên một lỗi đúng chỗ này có thể trôi qua mà không ai phát hiện, dù hệ thống hiện vẫn hoạt động đúng.
    file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
    severity: high
    Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/14 lỗi rơi vào file không bộ đo nào phủ (packages/auth/test/cong-vao.integration.spec.ts, _acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml, apps/api/src/workspace/workspace.contracts.ts, _acceptance/loi-moi-da-huy-van-cho-vao/evidence-page.html, _acceptance/loi-moi-da-huy-van-cho-vao/card.html) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.