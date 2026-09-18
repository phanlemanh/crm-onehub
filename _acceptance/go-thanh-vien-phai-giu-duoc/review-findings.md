# Review findings: go-thanh-vien-phai-giu-duoc — vòng 1

Ba làn soi chạy context sạch: `conventions` (t1-t7) · `bugs` (t8-t11) · `measurement` (t12-t16).
Trùng lặp GIỮA các làn được giữ nguyên, không gộp: hai làn độc lập cùng chỉ một chỗ là bằng chứng mạnh hơn, không phải nhiễu.

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bootstrap dùng luật "có dòng kết thúc thì loại", trái với luật "có dòng còn hiệu lực thì cho" của decideSignIn**
    Người dùng thấy gì: Nếu một người từng bị gỡ rồi được mời lại, một lượt dựng lại danh sách thành viên từ đầu (ví dụ sau khi phục hồi dữ liệu) có thể bỏ sót người đó dù lời mời của họ vẫn còn hiệu lực, và quyền chủ sở hữu workspace có thể bị chuyển nhầm sang một tài khoản cũ khác.
    file: `packages/auth/src/organization.ts`
    severity: high
    Đề xuất: new-contract

- **Nuốt lỗi đọc status của invitation ở đường kết nạp mồi**
    Người dùng thấy gì: Nếu một bản ghi lời mời cũ mang một giá trị trạng thái mà hệ thống không còn nhận ra, người liên quan có thể bị âm thầm loại khỏi lượt dựng lại danh sách thành viên mà không có gì ghi lại lý do.
    file: `packages/auth/src/organization.ts`
    severity: medium
    Đề xuất: known-limits

- **Cast thô `as TrangThaiLoiMoi` trên giá trị đọc từ DB, thay vì docTrangThai**
    Người dùng thấy gì: Một lỗi trong tương lai ở quy trình gỡ thành viên có thể không bị phát hiện bởi phép kiểm này, vì cách kiểm hiện tại không phân biệt rõ giữa "không có gì xảy ra" và "lời mời đã thực sự kết thúc đúng cách".
    file: `apps/api/test/go-thanh-vien.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Chép lại logic ký cookie và tên cookie thay vì dùng hằng đã xuất**
    Người dùng thấy gì: Bài kiểm chứng dùng để xác nhận một phiên đăng nhập thử nghiệm khớp với cách đăng nhập thật có thể vẫn báo đạt ngay cả khi cách đăng nhập thật đã thay đổi, tạo cảm giác an tâm giả về việc đăng nhập vẫn hoạt động đúng.
    file: `apps/api/test/go-thanh-vien.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Hai executor mồ côi trong config.yaml trỏ vào tên bài không tồn tại**
    Người dùng thấy gì: Một số mục cấu hình đo lường trỏ vào các bài kiểm tra không tồn tại, nên nếu sau này có ai dựa vào chúng sẽ nhận kết quả "đạt" giả mà không có gì thực sự được kiểm tra.
    file: `_acceptance/config.yaml`
    severity: medium
    Đề xuất: known-limits

- **Thẻ Cổng 1 cảnh báo «CE chưa kiểm chứng» trong khi hợp đồng khai ngược lại**
    Người dùng thấy gì: Màn hình duyệt trình cho người ký hiện một cảnh báo nói rằng độ phủ kiểm tra của thay đổi này chưa được xác nhận, trong khi thực tế đã được xác nhận đầy đủ, có thể khiến người duyệt nghi ngờ một thay đổi đã được kiểm chứng đúng cách hoặc mất thời gian truy tìm một vấn đề không có thật.
    file: `_acceptance/go-thanh-vien-phai-giu-duoc/card.html`
    severity: low
    Đề xuất: new-contract

- **Test xoá và dựng lại toàn bộ bảng member của workspace dùng chung**
    Người dùng thấy gì: Chạy một số lệnh kiểm tra theo một cách nhất định có thể xoá sạch và sắp xếp lại dữ liệu thành viên nhóm mà các bài kiểm tra khác để lại, kể cả việc gán nhầm quyền chủ sở hữu workspace cho một tài khoản không liên quan, trong môi trường kiểm tra dùng chung.
    file: `apps/api/test/go-thanh-vien.spec.ts`
    severity: low
    Đề xuất: known-limits

- **Backfill treats "ever had an ended invitation" as "currently removed", so a re-invited person is silently excluded**
    Người dùng thấy gì: Một đồng nghiệp từng bị gỡ rồi được mời lại có thể bị âm thầm bỏ sót khi danh sách thành viên được dựng lại từ đầu, và một người khác có thể trở thành chủ sở hữu workspace mới thay vì họ, cho tới khi người bị bỏ sót tự đăng nhập lại.
    file: `packages/auth/src/organization.ts`
    severity: high
    Đề xuất: new-contract

- **Unreadable invitation status is swallowed here, while both other call sites log it**
    Người dùng thấy gì: Một giá trị trạng thái lời mời cũ hoặc không đọc được có thể khiến một người bị coi như đã bị loại và bị bỏ sót khi danh sách thành viên được dựng lại, mà không có dấu vết nào để phân biệt đó là lỗi dữ liệu hay một lượt gỡ có chủ đích.
    file: `packages/auth/src/organization.ts`
    severity: medium
    Đề xuất: known-limits

- **dev-grant-needed.ts still calls ensureWorkspaceMembership without the email — the twin of the bug this round fixed**
    Người dùng thấy gì: Một công cụ hỗ trợ dành cho lập trình viên để cấp quyền truy cập thử nghiệm có thể âm thầm không thêm được người dùng vào workspace trong khi vẫn báo thành công, khiến màn hình mà nó dùng để dựng sẵn không thể truy cập được.
    file: `apps/api/scripts/dev-grant-needed.ts`
    severity: medium
    Đề xuất: known-limits

- **Two acceptance executors point at test names that do not exist**
    Người dùng thấy gì: Một số mục cấu hình đo lường trỏ vào các bài kiểm tra không tồn tại, nên nếu sau này có ai dựa vào chúng sẽ nhận kết quả "đạt" giả mà không có gì thực sự được kiểm tra.
    file: `_acceptance/config.yaml`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 5 — E3 tuyên quét LỚP «mọi trạng thái kết thúc» nhưng số hàng suy từ runtime, không có ma trận viết-trước ghim số**
    Người dùng thấy gì: Bài kiểm chứng dùng để xác nhận mọi loại lời mời đã kết thúc đều bị chặn có thể vẫn báo đạt ngay cả khi danh sách trạng thái bị chặn bị thu hẹp lại trong tương lai, tạo cảm giác an tâm giả rằng mọi lời mời đã kết thúc vẫn được xử lý đúng.
    file: `apps/api/test/go-thanh-vien.spec.ts`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 2 — E2 chép tay bộ mint phiên của dev-session.ts thay vì round-trip qua chính nó; bản vá một dòng của dev-session.ts trong diff không có phép đo nào chạm**
    Người dùng thấy gì: Bài kiểm chứng dùng để xác nhận phiên đăng nhập thử nghiệm được tạo giống hệt công cụ đăng nhập thật không thực sự chạy qua công cụ đó, nên một lỗi thật trong cách tạo phiên thử nghiệm có thể không bị phát hiện.
    file: `apps/api/test/go-thanh-vien.spec.ts`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 4 — ma trận trạng thái của E3 là khẳng định âm-tính-một-mình, trong khi hàm bị đo nuốt mọi lỗi và trả undefined**
    Người dùng thấy gì: Bài kiểm chứng dùng để xác nhận các lời mời đã kết thúc bị loại đúng cách chỉ kiểm tra ai bị loại, không kiểm tra ai lẽ ra vẫn phải được vào — nên nếu toàn bộ quy trình dựng lại danh sách thành viên âm thầm hỏng, bài kiểm vẫn có thể báo đạt.
    file: `apps/api/test/go-thanh-vien.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Hai executor đo trong config.yaml trỏ vào tên bài không tồn tại — nếu được nối vào eval sẽ xanh rỗng**
    Người dùng thấy gì: Một số mục cấu hình đo lường trỏ vào các bài kiểm tra không tồn tại, nên nếu sau này có ai dựa vào chúng sẽ nhận kết quả "đạt" giả mà không có gì thực sự được kiểm tra.
    file: `_acceptance/config.yaml`
    severity: medium
    Đề xuất: known-limits

- **Thẻ trình cho người ký xếp AC-1 và AC-3 vào khối «sẽ KHÔNG làm», trong khi cả hai đều nằm trong Criteria và đều có eval**
    Người dùng thấy gì: Màn hình trình cho người duyệt ký xếp hai trong ba điều thực sự đã được làm và kiểm chứng vào nhóm "sẽ KHÔNG làm", có thể khiến người duyệt bỏ qua đúng những phần đáng xem xét kỹ nhất.
    file: `_acceptance/go-thanh-vien-phai-giu-duoc/card-plain.json`
    severity: medium
    Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 6/16 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/go-thanh-vien-phai-giu-duoc/card.html, apps/api/scripts/dev-grant-needed.ts, _acceptance/go-thanh-vien-phai-giu-duoc/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
