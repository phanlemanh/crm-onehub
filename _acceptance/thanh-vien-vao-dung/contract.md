---
schema_version: 1
feature: "Thành viên vào đúng — quản trị đặt được tên miền nội bộ; cho phép một người đã là thành viên không sinh dòng treo; nút «Cho phép một địa chỉ» không mất sau lỗi; dựng lại thành viên theo luật «có dòng còn hiệu lực thì cho»"
slug: thanh-vien-vao-dung
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-04T07:08:02Z
design_doc: docs/superpowers/specs/2026-10-04-thanh-vien-vao-dung-design.md
---

# Acceptance Contract: thanh-vien-vao-dung

## Context

Cả công ty đã được nhập trên production ngày 04/10. Hàng R1b giữ cho người được thêm sau và
cho lần cho phép lại, qua bốn lỗi đã tìm ra nguồn: #28 tên miền nội bộ (`staffEmailDomains`)
không có đường ghi, #29 cho phép một người đã là thành viên để lại dòng `pending` treo, #43 nút
«Cho phép một địa chỉ» biến mất sau một lỗi `workspace.get`, #44 đoạn dựng lại thành viên coi
«từng có lời cho phép đã kết thúc» là «đang bị gỡ». Dữ liệu production chỉ đọc.

Source input: `docs/plan/lo-trinh-okr.json` hàng R1b; `_acceptance/thanh-vien-vao-dung/opportunity.md`
(Cổng Đáng `build`, 04/10); thiết kế `docs/superpowers/specs/2026-10-04-thanh-vien-vao-dung-design.md`.

«Quản trị» trong hợp đồng này là vai chủ sở hữu hoặc quản trị của không gian làm việc
(`isWorkspaceAdmin`); «thành viên thường» là vai `member`; «người ngoài» là người có phiên mà
không có dòng `member`. «Thẻ tên miền» là section có tiêu đề «Tên miền nội bộ» trên trang
`/<slug>/settings/members`.

## Criteria

- AC-1 (cross-layer): Given quản trị ở trang Thành viên và chưa có tên miền nội bộ nào, When họ gõ `  @OneHub.Center, onehub.vn, onehub.center ` vào ô của thẻ tên miền và bấm «Lưu», Then `appSetting.staffEmailDomains` là `onehub.center,onehub.vn`, `workspace.staffDomains` trả `["onehub.center","onehub.vn"]`, ô hiện `onehub.center, onehub.vn`, và nút «Lưu» tắt lại.
- AC-2: Given tên miền nội bộ là `onehub.center,onehub.vn` (đặt qua `workspace.setStaffDomains`), When một biểu mẫu theo dõi gửi từ `khach@onehub.vn` được lập hồ sơ và hộp thư dựng danh tính nội bộ, Then lập hồ sơ bỏ qua bài nộp với lý do «One of our own addresses», và tập tên miền nội bộ của hộp thư có `onehub.vn` dù không người dùng nào mang địa chỉ `@onehub.vn`.
- AC-3 (cross-layer): Given tên miền nội bộ đang là `onehub.center`, When quản trị lưu một danh sách có một mục sai — lần lượt `khong phai ten mien`, `ai@onehub.vn`, `gmail.com` — Then API trả 400 với thông điệp gọi đúng mục sai, `staffEmailDomains` vẫn là `onehub.center`, và trên màn lỗi hiện dưới ô, chữ đã gõ còn nguyên.
- AC-4 (cross-layer): Given tên miền nội bộ đang là `onehub.center`, When quản trị xoá trắng ô và lưu, Then `staffEmailDomains` là `null`, hai đường đọc (`staffEmailDomains(db)` của tracking và hộp thư) trả danh sách rỗng, và thẻ hiện câu rỗng «Chưa có tên miền nội bộ».
- AC-5 (cross-layer): Given một thành viên thường và một người ngoài, When mỗi người gọi `workspace.staffDomains` và `workspace.setStaffDomains`, Then thành viên thường đọc được với `canEdit: false` và bị 403 khi ghi, người ngoài bị 403 `NOT_A_MEMBER` ở cả hai, `staffEmailDomains` không đổi; và trên màn thành viên thường thấy thẻ tên miền với ô và nút «Lưu» bị khoá cùng dòng «Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ.».
- AC-6 (cross-layer): Given một người đã là thành viên, When quản trị cho phép địa chỉ của họ (viết hoa khác đi, có khoảng trắng hai đầu) từ hộp «Cho phép một địa chỉ», Then API trả 400 `That person is already a member. Change their role in the members table.`, không dòng `invitation` nào được tạo, hộp giữ mở với thông điệp đó, và tiêu đề «Được phép vào · M» không đổi.
- AC-7 (cross-layer): Given một thành viên hiện tại có sẵn một dòng `pending` (dòng treo sinh trước vòng này), When quản trị đọc `workspace.allowances` và mở trang Thành viên, Then dòng đó trả về với `status: "accepted"`, khối «Được phép vào» không liệt địa chỉ đó và số đếm của khối không tính nó, còn dòng trong cơ sở dữ liệu vẫn là `pending` (không ghi gì).
- AC-8: Given một người từng bị gỡ (không còn dòng `member`, lời cho phép cũ `canceled`), When quản trị cho phép lại địa chỉ đó rồi người đó đăng nhập, Then lời cho phép mới là `pending` cho tới lúc đăng nhập, người đó thành thành viên với vai trò lời cho phép ghi, và lời cho phép thành `accepted`.
- AC-9 (cross-layer): Given quản trị mở trang Thành viên và truy vấn `workspace.get` lỗi ở lần đầu, When truy vấn phía trình duyệt thành công sau đó, Then nút «Cho phép một địa chỉ» hiện ở đầu trang mà không tải lại trang — kể cả khi lỗi xảy ra ở lần prefetch của máy chủ và trạng thái đó được hydrate xuống trình duyệt; với dữ liệu của thành viên thường thì không có nút; và khi truy vấn vẫn lỗi sau lượt thử lại thì nút vẫn hiện, còn thành viên thường gọi `workspace.allowEmail` nhận 403, không dòng `invitation` nào được tạo, và hộp giữ mở với thông điệp 403.
- AC-10: Given bảng thành viên rỗng và ba người dùng — A có một lời cho phép `canceled` và một `pending`, B chỉ có `canceled`, C không có lời cho phép nào, D chỉ có một dòng mang trạng thái không đọc được, When một người đăng nhập và `ensureWorkspaceMembership` dựng lại bảng, Then A và C thành thành viên, B và D không (D theo đúng cách `decideSignIn` đọc trạng thái không đọc được: không phải dòng còn hiệu lực), và `console.error` nhận một dòng gọi tên trạng thái không đọc được.
- AC-11: Given lệnh soi `apps/api/scripts/soi-thanh-vien.ts` và một cơ sở dữ liệu có một dòng treo, một người bị bỏ sót và một trạng thái không đọc được, When chạy lệnh, Then nó in bốn số đếm `ten-mien`, `treo`, `bo-sot`, `khong-doc-duoc` đúng với dữ liệu gieo — `bo-sot` chỉ đếm người không phải thành viên có dòng đã kết thúc, dòng còn hiệu lực, **và** một phiên đăng nhập tạo sau dòng còn hiệu lực mới nhất (đã thử vào mà không thành thành viên); người được cho phép lại mà chưa đăng nhập không bị đếm — không in một địa chỉ thư nào, chạy trong giao dịch `READ ONLY` (một câu ghi chèn vào giữa bị Postgres từ chối), và kết quả chạy trên production ghi ở `_acceptance/thanh-vien-vao-dung/evidence/soi-production.txt` kèm tên máy chủ cơ sở dữ liệu.
- AC-12: Given bàn đo trên cây đang xét, When người xem mở ảnh thẻ tên miền của quản trị (có tên miền, lỗi nhập) và của thành viên thường (khoá) ở 1440×900 và 375×812, cùng ảnh hộp «Cho phép một địa chỉ» báo người đã là thành viên, Then nhìn thấy thẻ theo khuôn section của Cài đặt — tiêu đề, mô tả, ô xếp dọc, «Lưu» ở góc thẻ — không tràn ngang, lỗi nằm dưới ô và trong hộp, dòng lý do của thành viên thường đọc được.
- AC-13: Given cây sau vòng này, When chạy lại các thước đã ký chạm cùng vùng — `tvhk_do_khoi` và `tvhk_ttv_do_bang` (`thanh-vien-hai-khoi-cung-khuon`), cùng `domain-nha-tach.spec.ts`, `workspace-thanh-vien.spec.ts`, `go-thanh-vien.spec.ts` — Then mỗi thước đạt trọn như lúc ký.
- AC-14: Given từ điển và chuỗi giao diện, When đọc `CONTEXT.md`, `apps/app/lib/messages/settings-thanh-vien.ts`, `docs/api.md` và `docs/environment.md`, Then `CONTEXT.md` có mục «Tên miền nội bộ» kèm `_Avoid_` và «Vì sao»; mọi chuỗi mới có cả bản `vi` lẫn `en` và được `messages-guard` ghim; `docs/api.md` nói việc từ chối người đã là thành viên, việc đọc dòng treo thành `accepted` và đường ghi tên miền nội bộ; `docs/environment.md` nói tên miền nội bộ đặt ở Cài đặt › Thành viên.

## Coverage

Quét bằng morphological-scan (preset test-matrix), bốn trục:

- Trục vật: tên miền nội bộ (#28) | lời cho phép (#29) | nút đầu trang (#43) | dựng lại thành viên (#44) [thước CE: bốn mục của hàng R1b trong `docs/plan/lo-trinh-okr.json` — SUY-TỪ-REPO; nguồn gốc ở `cho-phep-ai-vao-o-man-hinh` (Ngoài-7/18/20), `thanh-vien-hai-khoi-cung-khuon` (review r1), `go-thanh-vien-phai-giu-duoc` (review)]
- Trục đầu vào: hợp lệ | sai dạng | tên miền thư công cộng | địa chỉ thay cho tên miền | rỗng | trùng/khác hoa | trạng thái không đọc được [thước CE: `normalizeDomain`, `FREE_EMAIL_DOMAINS` ở `apps/api/src/companies/domain.ts`; `docTrangThai` ở `packages/validation` — SUY-TỪ-REPO]
- Trục vai: quản trị | thành viên thường | người ngoài [thước CE: `PhamViChungMiddleware` + `isWorkspaceAdmin`, `docs/api.md` mục AuthMiddleware — SUY-TỪ-REPO]
- Trục lớp: API và cơ sở dữ liệu | màn hình | dữ liệu production chỉ đọc [thước CE: ràng buộc «production chỉ đọc» của hàng R1b — SUY-TỪ-REPO]
- Đối chiếu ngành: Slack «Approved domains» và GitHub Organization «Verified domains» đặt danh sách tên miền ở trang quản trị thành viên [NGÀNH: Slack, GitHub]; GitHub từ chối mời một người đã là thành viên của tổ chức [NGÀNH: GitHub].

Core: ghi hợp lệ hai lớp (AC-1) · hai đường đọc hưởng (AC-2) · từ chối đầu vào sai hai lớp (AC-3) · rỗng (AC-4) · ba vai (AC-5) · từ chối người đã là thành viên (AC-6) · đọc dòng treo cũ (AC-7) · không hồi quy cho phép lại (AC-8) · nút sau lỗi (AC-9) · luật dựng lại (AC-10) · soi chỉ đọc (AC-11) · nhìn thấy (AC-12) · thước đã ký (AC-13) · từ điển và tài liệu (AC-14).

Later: tự lành dòng treo lúc đăng nhập · Việt hoá thông điệp lỗi API của hộp cho phép · thành viên thường thấy nút đầu trang ở dạng khoá (đợt 4 của `docs/settings.md`).

Never: dọn dòng treo trên production bằng migration — trái ràng buộc «production chỉ đọc» của hàng này · cho tên miền nội bộ quyết ai được đăng nhập — việc đó là của danh sách cho phép (`docs/environment.md` đã tách hai việc).

[GIẢ ĐỊNH] Thông điệp từ chối ở AC-6 giữ tiếng Anh như «That address is already on the list.» đang có trong cùng hộp — người gạch ở cổng nếu muốn tiếng Việt ngay vòng này.

[GIẢ ĐỊNH] Đọc dòng treo thành `accepted` (AC-7) thay cho ghi; ngưỡng «0 thành viên đang hiệu lực mà vẫn có lời cho phép `pending`» ở `opportunity.md` vì thế đo bằng số `treo` của lệnh soi sau giao: dòng treo cũ còn trong cơ sở dữ liệu, nên ngưỡng chỉ về 0 nếu người duyệt cho một lần ghi dọn — xem mục Đường đo.

## Đường đo

- Thước: tên miền nội bộ đặt qua màn hình · số từ: số `ten-mien` của lệnh soi trên production sau giao (> 0 và không ai sửa CSDL tay) · bảo đảm bởi: AC-1, AC-11
- Thước: thành viên bị liệt «chưa vào» sai · số từ: số `treo` của lệnh soi (dòng `pending` thuộc thành viên hiện tại) đo hai lần — ngày giao và sau lần cho phép lại kế tiếp; dòng treo mới sinh sau giao phải là 0, dòng cũ không còn hiện trên màn · bảo đảm bởi: AC-6, AC-7, AC-11
- Thước: người bị coi nhầm «đang bị gỡ» · số từ: số `bo-sot` của lệnh soi (người không phải thành viên có dòng kết thúc, dòng còn hiệu lực và một phiên tạo sau dòng còn hiệu lực — đã thử vào mà không thành thành viên) · bảo đảm bởi: AC-10, AC-11

## Out of scope

- Ghi dữ liệu production, kể cả dọn dòng treo cũ — dòng cũ thôi hiện nhờ AC-7, vẫn nằm trong cơ sở dữ liệu.
- Tự lành dòng treo lúc đăng nhập (`ensureWorkspaceMembership` đổi `pending` → `accepted` cho thành viên có sẵn) — chủ kho chọn «từ chối, báo rõ» trong brainstorm 04/10.
- Việt hoá thông điệp lỗi của API trong hộp «Cho phép một địa chỉ».
- Thành viên thường thấy nút «Cho phép một địa chỉ» và khối «Được phép vào» ở dạng khoá — đợt 4 của `docs/settings.md`; đổi là chạm AC-10 đã ký của `thanh-vien-hai-khoi-cung-khuon`.
- Nhánh dựng lại đặt người cũ nhất làm chủ sở hữu bất kể vai trò của lời cho phép — `docs/api.md` đã khai, không phải lỗi #44.
- Tên miền nội bộ quyết ai được đăng nhập — việc của danh sách cho phép.

## Notes

- Không migration: cột `appSetting.staffEmailDomains` có từ `20260916025034_staff_email_domains`.
- `apps/api/src/companies/domain.ts` nằm ngoài ranh giới P3; vòng này chỉ THÊM một hàm xuất `isFreeEmailDomain`, không sửa dòng có sẵn.
- Lệnh soi production lấy chuỗi kết nối bằng `vercel env pull` vào tệp tạm ngoài kho, chạy, xoá tệp; tệp kết quả chỉ chứa số đếm và tên máy chủ.
