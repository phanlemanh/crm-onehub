---
schema_version: 1
feature: «Người gửi tín hiệu hôm nay thì sáng mai thấy trang của mình đã đổi sang Đội sản phẩm đã nhận, mà không ai phải chạy lệnh»
slug: tin-hieu-tu-ve-kho
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, ci]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-14T03:06:12Z
design_doc: docs/superpowers/specs/2026-10-14-tin-hieu-tu-ve-kho-design.md
---

# Acceptance Contract: tin-hieu-tu-ve-kho

## Context

Mỗi đêm một lịch chạy của kho gọi thủ tục kéo về của LT2 bằng một khoá API chỉ làm được đúng việc đó. Thủ tục đóng
dấu tín hiệu nên sáng hôm sau người gửi thấy «Chờ gom» thay cho «Chờ lấy về». Tệp kéo về đi lên một nhánh hàng chờ
và một PR đứng mở, gộp theo lô như mọi PR (lối A, Cổng Đáng 14/10). Khoá chỉ-kéo thuộc một cấu hình khoá riêng của
thư viện xác thực nên không mở được phiên đăng nhập ở bất kỳ đâu.

Source input: `_acceptance/tin-hieu-tu-ve-kho/opportunity.md` (Cổng Đáng `build` 14/10, hàng TH1 của
`docs/plan/lo-trinh-okr.json`, mã K1 · K2 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`).

## Criteria

- AC-1: Given một owner hoặc admin mở Cài đặt → Khoá API, When họ bấm «Tạo khoá», Then tờ tạo khoá có mục «Khoá dùng để» với hai lựa chọn «Mọi việc bạn làm được» (mặc định) và «Chỉ kéo tín hiệu về kho», mỗi lựa chọn một dòng mô tả; tạo khoá loại sau thì hộp khoá vừa tạo hiện khoá một lần kèm câu nói khoá chỉ kéo được tín hiệu và nên đặt vào bí mật của lịch chạy, và danh sách hiện dòng khoá đó với nhãn «Chỉ kéo tín hiệu»; Given một thành viên thường hay vai chỉ OKR, Then tờ tạo khoá không có mục đó và giống hệt hôm nay.
- AC-2: (cross-layer) Given người gọi `apiKeys.create` với loại «chỉ kéo tín hiệu», When người gọi là owner hoặc admin, Then máy chủ cất một khoá thuộc cấu hình khoá chỉ-kéo mang đúng quyền kéo tín hiệu, và `apiKeys.list` trả loại đó; When người gọi là thành viên thường hay vai chỉ OKR, Then máy chủ từ chối và không cất hàng khoá nào; When loại vắng hay «toàn quyền», Then khoá tạo ra giống hệt khoá hôm nay (cấu hình mặc định, không mang quyền riêng).
- AC-3: Given khoá chỉ-kéo của một owner hoặc admin, When gọi `POST /rest/tin-hieu/lich/keo-ve`, Then máy chủ trả mọi tín hiệu còn lại theo số — kể cả tín hiệu đã đóng dấu ở lượt trước, cùng byte — đúng như thủ tục kéo về của LT2 và đóng dấu tín hiệu chưa dấu trong cùng giao dịch, kèm lúc đóng dấu của lượt (vắng khi không đóng dấu gì) và lúc đóng dấu của từng tín hiệu; nhật ký ghi mã khoá và chủ khoá, không ghi khoá hay nội dung tín hiệu.
- AC-4: Given một khoá chỉ-kéo hợp lệ, When nó đi trong đầu `x-api-key` tới bất kỳ đường nào khác — một thủ tục tRPC khác qua cầu REST (`tinHieu.cuaToi`, `tinHieu.keoVe`, `contacts.list`, `apiKeys.list`), đọc phiên của thư viện xác thực (`/api/auth/get-session`), các đường khoá của thư viện (`/api/auth/api-key/create`, `list`, `update`, `delete`), tRPC gốc (`/trpc/contacts.list`), hàm đọc phiên của trang web và cầu tác nhân (`apps/app/lib/session.ts`), và mọi chỗ đọc khoá khác mà phép liệt kê bằng máy tìm được trong `apps/api`, `apps/app`, `apps/agent` — Then mỗi đường đối xử như không có phiên (401, hay phiên rỗng) và không ghi hàng nào.
- AC-5: Given đường kéo theo lịch, When khoá là khoá thường (toàn quyền) của một quản trị, khoá chỉ-kéo đã thu hồi, khoá chỉ-kéo hết hạn, chuỗi khoá sai, hay không có khoá, Then máy chủ trả 401 và không đóng dấu; When khoá chỉ-kéo hợp lệ nhưng chủ khoá nay là thành viên thường, vai chỉ OKR hay đã rời không gian làm việc, Then máy chủ trả 403 và không đóng dấu — vai đọc lại ở mỗi lượt.
- AC-6: Given khoá thường đã có trước vòng này, When dùng như hôm nay (thủ tục kéo về của LT2 với khoá quản trị, `contacts.list` với khoá thành viên), Then kết quả giống hệt trước vòng — khoá thường vẫn mở phiên, `lastRequest` vẫn chỉ ghi tối đa mỗi phút một lần.
- AC-7: Given lệnh kéo về, When đặt `CRM_KHOA_KEO_TIN_HIEU`, Then lệnh gọi đường kéo theo lịch; When chỉ đặt `CRM_API_KEY`, Then lệnh gọi đường của LT2 như cũ; When thiếu cả hai, Then thoát mã 2 gọi tên cả hai biến và không ghi tệp; khoá không bao giờ xuất hiện trong đầu ra; dòng tổng kết thêm «đóng dấu lượt này: n · chờ lâu nhất: x giờ» tính từ lúc gửi tới lúc đóng dấu của các tín hiệu vừa đóng dấu.
- AC-8: Given đỉnh nhánh chính và tín hiệu trên CRM, When lượt lịch chạy, Then lượt dựng nhánh hàng chờ bằng đỉnh nhánh chính cộng đúng một commit chỉ chạm thư mục nguồn tín hiệu, chứa mọi tệp tín hiệu chưa có ở nhánh chính — kể cả tệp đã nằm trên nhánh hàng chờ của lượt trước mà nhánh chính chưa gộp, không tệp nào rơi; lượt chỉ đẩy khi cây đó khác cây của nhánh hàng chờ đang có; không có tệp nào mới thì không commit và không đẩy; tệp đẩy lên đọc được bằng bộ đọc tín hiệu của kit, 0 lỗi.
- AC-9: Given một lượt lịch xanh, When nhánh hàng chờ trên origin khác nhánh chính — dù lượt này vừa đẩy hay cây trùng nên không đẩy — và chưa có PR mở từ nhánh đó (chưa từng có, hoặc PR trước đã đóng mà không gộp), Then lượt mở đúng một PR «Tín hiệu kéo về» vào nhánh chính; When đã có PR mở, Then lượt không mở thêm; When kho cấm tác vụ mở PR, Then lượt kết thúc đỏ với câu gọi tên quyền còn thiếu, nhánh vẫn đã đẩy; không đường nào của lượt gộp PR.
- AC-10: Given lượt lịch, When thiếu bí mật, CRM trả lỗi hay không tới được, hoặc một tệp đã có mà khác byte, Then lượt kết thúc đỏ, không commit, không đẩy, không mở PR, và nhật ký gọi tên nguyên nhân; Given tệp lịch chạy của kho, Then nó chạy mỗi ngày hai lần, 21:00 và 09:00 UTC, và chạy tay được, chỉ xin quyền ghi nội dung và PR, một lượt một lúc, và không có bước gộp.
- AC-11: Given PR chỉ chạm thư mục nguồn tín hiệu, When bộ phân loại PR và bước kiểm trước gộp chạy, Then PR được xếp T1 và không bị đòi hồ sơ nghiệm thu; Given `docs/api.md`, `CONTEXT.md` và `.env.example`, Then chúng nói khoá chỉ-kéo làm được gì, đường kéo theo lịch, biến `CRM_KHOA_KEO_TIN_HIEU`, và ba việc cài một lần của chủ kho. (judgment)

## Coverage

- Trục A — Vòng đời khoá chỉ-kéo: tạo | dùng đúng việc | dùng việc khác | chủ khoá mất quyền quản trị hay rời | thu hồi | hết hạn [thước CE: luật phiên-từ-khoá của `@better-auth/api-key` 1.6.25; bảng phạm vi router `docs/api.md`; [NGÀNH: Stripe restricted API keys]] → AC-2, AC-3, AC-4, AC-5
- Trục B — Người tạo khoá: owner | admin | member | okr [thước CE: `WORKSPACE_ROLES`, `laQuanTriWorkspace`] → AC-1, AC-2, AC-5
- Trục C — Một lượt chạy theo lịch: có mới | không mới | thiếu bí mật | CRM lỗi | tệp lệch byte | nhánh hàng chờ đã có | PR đã gộp hay chưa có | kho cấm mở PR | chạy tay [thước CE: AC-8 của LT2; [NGÀNH: Renovate] một PR đứng, dựng lại trên nhánh gốc] → AC-7, AC-8, AC-9, AC-10
- Trục D — Ai thấy gì: người gửi | quản trị | chủ kho | điều phối [thước CE: câu giao hàng TH1; luật cửa sổ gộp #375] → AC-1, AC-3, AC-7, AC-11
- Cắt ngang: khoá không vào nhật ký hay tệp; tệp không mang danh tính người gửi; khoá thường không đổi → AC-3, AC-6, AC-7, AC-8
- Quét đầy đủ (Core / Later / Never): `_acceptance/tin-hieu-tu-ve-kho/coverage-scan.md`

## Đường đo

- Thước: hai tuần liền mỗi ngày một lượt kéo thành công · số từ: lịch sử lượt chạy của tệp lịch `tin-hieu-keo-ve.yml` trên GitHub Actions · bảo đảm bởi: AC-10 (lịch hằng ngày, lượt hỏng là đỏ), AC-9
- Thước: không tín hiệu nào ở «Chờ lấy về» quá một ngày · số từ: truy vấn CSDL lúc đo trên MỌI tín hiệu gửi trong khung hai tuần, kể cả tín hiệu chưa dấu: lớn nhất của (lúc đóng dấu, hoặc lúc đo nếu chưa dấu) trừ lúc gửi; dòng «chờ lâu nhất» của từng lượt là số theo dõi hằng ngày. Lịch chạy hai lần mỗi ngày nên lúc chờ dài nhất khi hệ thống chạy đúng là khoảng 12 giờ cộng độ trễ lịch của GitHub — ngưỡng một ngày còn dư · bảo đảm bởi: AC-3 (lúc đóng dấu trong phản hồi), AC-7 (dòng tổng kết), AC-10 (hai lượt mỗi ngày)
- Thước (vế CHẾT): khoá của lịch chạy gọi được một đường ngoài kéo về · số từ: ca đo của AC-4 trên mọi đường đọc phiên · bảo đảm bởi: AC-4, AC-5

## Out of scope

- Bot tự gộp PR hàng chờ (lối B) — Cổng Đáng 14/10 chọn lối A.
- Khoá nhiều phạm vi tuỳ chọn — vòng này chỉ một kiểu khoá hẹp.
- Gom nhóm tự chạy, PR «Đợt tín hiệu» — hàng TH2.
- Trạng thái sau gom đọc từ nguồn sống — hàng TH3.
- Báo tin cho người gửi khi chữ đổi — hàng TB1/S2.
- Quản trị gỡ tín hiệu rác trước khi kéo — hàng TH5.
- Trang Cài đặt hiện lượt kéo gần nhất của lịch chạy.
- Ba việc cài một lần trên production và GitHub (tạo khoá, đặt bí mật, bật quyền mở PR) — chủ kho làm sau khi gộp.

## Notes

- Mọi hàng `apikey` hiện có mang `configId = 'default'` (cột `NOT NULL DEFAULT 'default'` từ migration `20260820152910_add_api_keys`); thư viện coi `default` và rỗng là cấu hình mặc định — khoá cũ không cần migration.
- Thủ tục `tinHieu.keoVe` và đường `POST /rest/tin-hieu/keo-ve` của LT2 giữ nguyên; hồ sơ LT2 không đổi.
- PR do tác vụ mở bằng `GITHUB_TOKEN` không kích hoạt CI — giới hạn đã biết, ghi ở `docs/api.md`.
- Known limits — anh chọn ở Cổng Bằng chứng 2026-10-14, từ S4 vòng 2 và 3:
  - Ngoài-1: Mỗi sáng PR hàng chờ tín hiệu vẫn mở và chạy đúng, nhưng nhánh và tiêu đề của nó mang một cái tên khác với tên của việc này trong lộ trình. Người tra lộ trình có thể không nhận ra PR đó là của việc nào.
  - Ngoài-2: Hiện khoá chỉ-kéo vẫn bị từ chối ở mọi đường khác đúng như hứa. Nhưng nếu sau này ai đó bớt một đường khỏi danh sách kiểm, bài kiểm vẫn xanh và không ai biết đường đó thôi được kiểm nữa.
  - Ngoài-3: Đường kéo tín hiệu theo lịch đã được kiểm là từ chối người dùng vai chỉ OKR đang đăng nhập, nhưng chưa được kiểm với chủ hay quản trị đăng nhập bằng trình duyệt. Nếu có lỗi riêng ở trường hợp đó thì bài kiểm hiện tại sẽ không báo.
  - Ngoài-4: Lịch chạy không tự gộp PR và điều đó đang đúng. Chỉ có điều bài kiểm khẳng định việc này có thể xanh ngay cả khi nó không quan sát được gì, nên lời bảo đảm yếu hơn vẻ ngoài.
  - Ngoài-5: Thành viên thường và vai chỉ OKR đúng là không thấy lựa chọn loại khoá. Nhưng bài kiểm cho hai vai này không chứng minh tờ tạo khoá đã mở ra, nên nếu tờ đó hỏng riêng cho họ thì bài kiểm vẫn báo xanh.
  - Ngoài-6: PR tín hiệu mà lịch đêm tự mở sẽ không tự chạy kiểm tra. Người điều phối phải đóng rồi mở lại PR đó thì kiểm tra mới chạy.
  - Ngoài-7: Thành viên thường không thấy lựa chọn loại khoá, thay vì thấy nó bị khoá kèm lý do. Hành vi đúng điều đã duyệt, nhưng luật trang Cài đặt chưa ghi ngoại lệ này nên màn sau có thể lấy làm tiền lệ để ẩn.
  - Ngoài-9: Trong nhật ký, các lượt kéo theo lịch hiện vai trống nên không thể thống kê các lượt này theo vai. Hoạt động của lịch không bị ảnh hưởng.
  - Ngoài-11: Nếu công cụ GitHub trả về kết quả có hình dạng bất thường, lượt lịch có thể tưởng chưa có PR và mở thêm một PR thứ hai thay vì dừng đỏ. Trường hợp này hiếm.
  - Ngoài-12: Khi cơ sở dữ liệu tạm hỏng đúng lúc lịch đêm chạy, lượt kéo báo khoá không hợp lệ chứ không báo hệ thống đang lỗi. Chủ kho có thể đổi một khoá vẫn còn dùng được.
  - Ngoài-13: Phép kiểm việc PR tín hiệu được xếp loại nhẹ chưa đi qua đúng đường mà hệ thống kiểm tra thật dùng. Nếu cách lấy danh sách tệp ở đó hỏng thì phép kiểm này không báo đỏ.
  - Ngoài-14: Bài kiểm tra xác nhận hộp khoá vừa tạo của khoá toàn quyền không có câu chỉ-kéo, nhưng chưa xác nhận hộp đó có hiện ra. Nếu hộp không hiện thì bài kiểm tra vẫn xanh.
