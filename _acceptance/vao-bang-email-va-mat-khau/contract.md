---
schema_version: 1
feature: Vào được CRM từ mạng đang chặn Google — đăng nhập bằng email và mật khẩu
slug: vao-bang-email-va-mat-khau
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-19-vao-bang-email-va-mat-khau-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-19
---

# Acceptance Contract: vao-bang-email-va-mat-khau

## Context

Nhân viên kinh doanh dùng Gmail cá nhân; ở một số mạng nội bộ và mạng doanh
nghiệp khách hàng, Google không vào được, nên cả ba cửa đăng nhập hiện có đều
chết cùng lúc — cả ba đều phải đi ra một nhà cung cấp bên ngoài. Vòng này mở cửa
thứ tư, cửa duy nhất không gọi ra ngoài: email và mật khẩu.

Mật khẩu đầu tiên tới tay người dùng bằng một liên kết dùng một lần, có hạn, do
quản trị phát và gửi qua Zalo. Quản trị không bao giờ nhìn thấy mật khẩu của ai.

Source input: prompt (buổi khai thác 2026-09-18/19) · hồ sơ cơ hội
`_acceptance/vao-bang-email-va-mat-khau/opportunity.md`, Cổng Đáng ký 2026-09-19.

## Criteria

- AC-1: Given một người đã có tài khoản và đang là thành viên, When quản trị phát liên kết đặt mật khẩu cho người đó, Then hệ thống trả về một liên kết kèm mốc hết hạn, và một hàng token tương ứng tồn tại ở nơi thư viện xác thực đọc. (cross-layer)
- AC-2: Given một địa chỉ nằm trong danh sách được vào nhưng chưa từng đăng nhập nên chưa có hàng người dùng, When quản trị phát liên kết đặt mật khẩu cho địa chỉ đó, Then hệ thống tạo hàng người dùng rồi trả liên kết, và hàng người dùng đó đi qua đúng cổng chặn người lạ đang có. (cross-layer)
- AC-3: Given một liên kết vừa phát còn hạn, When người dùng mở liên kết và đặt mật khẩu mới, Then mật khẩu được lưu và người đó đăng nhập được bằng email và mật khẩu vừa đặt. (cross-layer)
- AC-4: Given một liên kết đã được dùng để đặt mật khẩu, When có người dùng lại chính liên kết đó lần thứ hai, Then hệ thống từ chối và mật khẩu hiện tại không đổi.
- AC-5: Given một liên kết đã quá hạn, When có người mở và thử đặt mật khẩu, Then hệ thống từ chối và mật khẩu hiện tại không đổi.
- AC-6: Given một người đăng nhập với vai thành viên thường, When người đó gọi thủ tục phát liên kết đặt mật khẩu, Then hệ thống từ chối; và trên màn Thành viên nút phát liên kết ở trạng thái tắt. (cross-layer)
- AC-7: Given cửa mật khẩu đã bật, When bất kỳ ai gọi đường tự đăng ký bằng email và mật khẩu — kể cả với một địa chỉ đang nằm trong danh sách được vào, Then hệ thống từ chối và không tạo hàng người dùng nào.
- AC-8: Given người dùng đang ở trang đặt mật khẩu với liên kết hợp lệ, When người đó nhập một mật khẩu ngắn hơn mức tối thiểu đã khai, hoặc một mật khẩu nằm trong danh sách mật khẩu đã lộ, Then hệ thống từ chối và nêu lý do thuộc về ca nào, ngay cạnh ô gây lỗi, và chữ đã gõ ở ô kia không mất. (cross-layer)
- AC-9: Given một người chưa đăng nhập mở màn đăng nhập, When màn hiện ra, Then ô email và ô mật khẩu hiện cùng màn với nút Google, và cửa Google vẫn đăng nhập được như trước. (cross-layer)
- AC-10: Given một người chưa đăng nhập cầm liên kết đặt mật khẩu, When người đó mở liên kết, Then trang đặt mật khẩu hiện ra chứ không bị đẩy về màn đăng nhập. (cross-layer)
- AC-11: Given quản trị đã phát liên kết cho một người, When quản trị mở lại màn Thành viên, Then màn cho biết ai đã phát liên kết cho người đó và phát lúc nào. (cross-layer)
- AC-13: Given một người đã đặt mật khẩu bằng một liên kết trước đó rồi quên mật khẩu, When quản trị phát cho chính người đó một liên kết thứ hai và người đó đặt mật khẩu mới, Then mật khẩu mới dùng được, mật khẩu cũ hết dùng được, liên kết thứ nhất vẫn bị từ chối, và không còn token treo lại cho người đó. (cross-layer)
- AC-12: Given hai màn mới — hộp thoại liên kết và trang đặt mật khẩu, When một nhân viên kinh doanh người Việt đọc chúng, Then nhãn và câu lỗi đọc tự nhiên, mang đúng phần ngữ cảnh chưa cấp theo luật nhãn của CONTEXT.md, và không có thuật ngữ kỹ thuật tự đúc. (judgment)

## Coverage

Quét bằng lưới chống sót (`morphological-scan`), preset test-matrix, 2026-09-19.
Ba trục, tám ô Core thành AC-1 tới AC-8; bốn AC còn lại là lớp cắt ngang.

- Trục A — chặng của một chìa khoá: phát liên kết | đặt mật khẩu lần đầu | đăng nhập bằng mật khẩu | phát lại khi quên | thu hồi [thước CE: ngành NIST SP 800-63B Rev 4, vòng đời credential]
- Trục B — ai đang đứng: chủ/quản trị | thành viên thường | người trong danh sách chưa có tài khoản | người ngoài danh sách | kẻ cầm liên kết không phải chủ [thước CE: SUY-TỪ-REPO packages/auth/src/roles.ts + luật quyền docs/api.md]
- Trục C — trạng thái của chìa: hợp lệ | hết hạn | đã dùng | không tồn tại [thước CE: SUY-TỪ-REPO cơ chế verification của thư viện xác thực đã cài]
- Lớp cắt ngang phủ bởi AC-9 tới AC-12: cửa Google sống song song · trang đặt mật khẩu ngoài cổng proxy · ghi vết ai phát cho ai · nhãn tiếng Việt.
- Mặt tiếp xúc (auth-core / api / màn hình) cố ý KHÔNG làm trục: trục theo cấu trúc mã là nguồn sót cross-cutting, lưới cảnh báo đích danh.
- Ô Core số 8 (sàng mật khẩu đã lộ) đến từ chân ngành `[NGÀNH: NIST SP 800-63B Rev 4]`, không phải từ yêu cầu của chủ kho — chủ kho giữ lại 2026-09-19.
- Ô bị cắt vẫn để vết ở mục Out of scope, không biến mất câm.

## Đường đo

- Thước: số ca "không vào được vì mạng chặn Google" sau khi bật · số từ: đếm tay từ lời báo của đội · bảo đảm bởi: đã có sẵn: không cần nguồn sinh mới
- Thước: số người đã đặt mật khẩu và số lượt vào bằng cửa mật khẩu trong 30 ngày · số từ: truy vấn bảng tài khoản theo cột nhà cung cấp và cột mật khẩu · bảo đảm bởi: AC-3 (mật khẩu được lưu thật nên hàng tài khoản tồn tại để đếm)
- Thước: số ca phải nhờ người mở cơ sở dữ liệu mới vào lại được · số từ: đếm tay từ lời báo của đội, đối chiếu với vết phát liên kết trên màn Thành viên · bảo đảm bởi: AC-13 (đường phát lại tồn tại nên không ai phải đụng cơ sở dữ liệu)
- Thước: người ở trong mạng chặn Google vào được và làm được việc · số từ: phiên nghiệm thu chạy từ chính mạng đó · bảo đảm bởi: AC-3 và AC-9

## Out of scope

- Gửi thư ra ngoài — thư mời, thư đặt lại mật khẩu. Kho chưa có một dòng nào; ô cơ hội riêng.
- Người dùng tự đổi mật khẩu khi đang đăng nhập — chủ kho cắt 2026-09-19; ba ca mới/quên/đổi đi chung một cơ chế xin liên kết.
- Báo cho người dùng khi mật khẩu bị đổi — OWASP ASVS đòi, kho KHÔNG làm được vì không gửi được thư. Phần làm được là ghi vết cho quản trị, đã thành AC-11.
- Xác thực hai bước.
- Thu hồi một liên kết đã phát trước khi nó hết hạn — hạn ngắn che phần lớn; thêm nút thu hồi là một mặt màn nữa.
- Bắt đổi mật khẩu định kỳ — NIST Rev 4 cấm; thêm vào là đi ngược chuẩn.
- Câu hỏi bí mật để lấy lại mật khẩu — ASVS cấm thẳng.
- Đăng nhập bằng Zalo — thêm một nhà cung cấp ngoài, không gỡ được chỗ đau "mạng chặn dịch vụ ngoài".
- Chống dò mật khẩu hàng loạt bằng cơ chế riêng — giả định 5 của hồ sơ cơ hội còn ở trạng thái «chưa thử». Vòng này dựa vào bộ giới hạn tần suất sẵn có của thư viện xác thực và không đo nó; nếu giả định 5 đỏ thì mở ô riêng.
- Gỡ hay làm yếu cửa Google — cửa cũ giữ nguyên, không ai bị buộc đặt mật khẩu.

## Notes

- Ràng buộc kiến trúc: token đúc tay dựa vào tiền tố định danh của thư viện xác thực. Đây là chỗ dính chi tiết bên trong, cố ý nhận, và được canh bằng chiều đỏ của phép đo vòng tròn ở AC-3.
- Giới hạn đã biết: không có kênh báo cho người dùng khi thông tin đăng nhập đổi.
- Giới hạn đã biết, phát hiện ở vòng soi cuối: thủ tục phát liên kết mở qua cầu REST, và chìa API của quản trị đi qua nó như một phiên thường. Nên bán kính nổ của một chìa API bị rò nay gồm cả việc chiếm tài khoản người khác — phát chìa cho địa chỉ của chủ kho, tự đặt mật khẩu, rồi đăng nhập với tư cách đó. Hợp đồng CÓ trao quyền phát chìa cho chủ và quản trị nên đây không phải chỗ hụt tiêu chí; nó là một mặt tiếp xúc vừa lớn lên mà bản đầu không khai. Cái canh duy nhất là hàng ghi vết trên màn Thành viên, và không ai báo cho người bị chiếm (kho không gửi được thư).
- Giới hạn đã biết, đánh đổi cố ý của vòng sửa sau soi cuối: phép sàng mật khẩu chạy ở `hooks.before`, tức TRƯỚC khi phiên hoặc token được kiểm. Đó là điều kiện cần — sàng phải đứng trước bước tiêu thụ token, nếu không mỗi lần từ chối là đốt liên kết. Hệ quả: người chưa đăng nhập có thể dùng máy chủ của ta làm cầu hỏi dịch vụ danh sách đã lộ. Nó không tiết lộ gì về bất kỳ tài khoản nào, và bộ giới hạn tần suất của thư viện đang bật.
- Giới hạn đã biết, phát hiện ở vòng soi lại đợt sửa cuối: khoá huỷ-phiên-cũ xoá hàng phiên ngay khi đặt lại mật khẩu, nhưng kho bật cache bánh phiên 5 phút và đường đọc phiên trả kết quả từ bánh đã ký mà không chạm cơ sở dữ liệu. Nên một phiên mở TRƯỚC lúc đặt lại mật khẩu vẫn dùng được tới 5 phút sau. Hệ quả: đổi mật khẩu cắt kẻ trộm trong vòng không quá 5 phút, KHÔNG tức thì. Hạ mốc đó là chuyện cấu hình toàn kho, ngoài phạm vi vòng này.
- Ba khoá cấu hình không thương lượng: bật cửa mật khẩu, CHẶN tự đăng ký, huỷ phiên cũ khi đặt lại mật khẩu. AC-7 canh khoá thứ hai.
- Giới hạn đã biết, phát hiện ĐÚNG lúc ký và chủ kho ký qua bằng bypass (2026-09-19): ba tiêu chí lớp màn hình — AC-6 (E12), AC-9 (E13), AC-8 phần màn (E17) — KHÔNG có verifier máy nào thực sự chạy. Ba eval đó khai `cmd: config:executors.design.ui_check`, nhưng `design-scan.js` là payload tiêm vào trình duyệt (`window.__IMPECCABLE_CONFIG__`), chạy bằng node là `ReferenceError`, và `run-log.jsonl` không có dòng nào cho E12/E13/E17 ở cả ba vòng — trong khi các khối của chúng vẫn ghi `exit_code: 0`. Nền thật của ba khẳng định đó là ảnh chụp trong `evidence/` cộng lời tường thuật của phiên đo, không phải một lượt chạy máy. Verdict `PASS` do đó ghi được nhờ `ACCEPTANCE_GATE_BYPASS=1`, và `bypass_ack: Phan Le Manh 2026-09-19` là dấu khai việc đó. Hệ quả: một hồi quy ở ba mặt màn hình này sẽ KHÔNG có phép đo nào bắt được cho tới khi ba eval đổi sang một chân đo chạy được — kho đã có khuôn (`scripts/lan-do/tien-de.mjs --chay "node _acceptance/<hồ-sơ>/rang/<x>.mjs"`, mẫu `man-xin-quyen-co-rang`).
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 từ khối ngoài hợp đồng (mục Ngoài-3, 2026-09-19): người mở màn đăng nhập hoặc trang đặt mật khẩu từ một trình duyệt chưa từng chọn ngôn ngữ sẽ thấy toàn bộ nhãn bằng tiếng Anh, không phải tiếng Việt. Cơ chế `resolveLocale` có sẵn từ trước vòng này và vẫn tôn trọng cookie `lang=vi` hay header `Accept-Language` khi có, nên đây không phải hồi quy của vòng này; đổi mặc định là chuyện toàn kho, ngoài phạm vi vòng này. Mọi ảnh trong `evidence/` chụp với cookie `lang=vi` đặt tay đúng vì lý do đó.
