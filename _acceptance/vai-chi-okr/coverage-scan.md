# Quét độ phủ AC — vai-chi-okr

Preset: entity-feature + test-matrix (skill `morphological-scan`, 24/09/2026).

## Ngữ cảnh

- Sản phẩm: CRM của OneHub — chân sản phẩm: đào repo (`docs/api.md`, `packages/auth/src/roles.ts`, `apps/api/src/*/*.router.ts`, `apps/app/proxy.ts`, `apps/app/app/eve/v1/[...path]/route.ts`, `CONTEXT.md` mục «Vai «chỉ OKR»») · chân ngành: OWASP ASVS chương kiểm soát truy cập (chặn mặc định) [NGÀNH: OWASP ASVS]; giấy phép «đăng nhập được mà không thấy đối tượng CRM» [NGÀNH: Salesforce Chatter Free] — đối chiếu hình dạng vai, không kế thừa.

## Trục

- Trục A — cửa vào: màn (proxy + rail) | tRPC bằng phiên | cầu REST | khoá API | trợ lý AI: đường nối | trợ lý AI: kênh của trợ lý AI | tường xin quyền hộp thư | đường HTTP ngoài router (controller Nest, Better Auth)  [thước CE: bộ định tuyến của máy chủ lúc chạy; `create-app.ts` dựng tRPC và REST từ một router; ba cách Better Auth dựng người dùng (`auth.ts`: phiên, bộ đệm phiên, `enableSessionForAPIKeys`); route `eve/v1`; `repFromCrm`; `requireMailboxAccess`]
  - Vì sao độc lập: đổi cửa không ép đổi phạm vi dữ liệu hay người.
- Trục B — phạm vi dữ liệu: đối tác | tổ chức | OKR (chưa có router) | chung | chưa khai  [thước CE: sổ router lúc chạy, 25 router — bảng khai trong design doc]
- Trục C — người: chỉ OKR | thành viên | quản trị/chủ sở hữu | không phải thành viên  [thước CE: `WORKSPACE_ROLES`; người ngoài kho đo ở `go-la-cat-quyen-that`]
- Trục D — cách vào vai: đổi vai ở màn Thành viên | lời mời mang vai | đăng nhập tạo dòng từ lời mời | vai lạ trong bảng  [thước CE: `setMemberRole`, `allowEmail`, `ensureWorkspaceMembership`, `toWorkspaceRole`]

Trục "trạng thái dữ liệu" và "mạng" của preset test-matrix không thành trục riêng: phép đo phạm vi không phụ thuộc dữ liệu có bao nhiêu dòng (ma trận gọi với đầu vào rỗng) và không có lời gọi ra ngoài.

## Không gian (A × B × C, lát theo C = chỉ OKR — 7 × 5 = 35 ô; C ≠ chỉ OKR gộp thành đối chứng)

| Cửa \ Phạm vi | đối tác | tổ chức | OKR | chung | chưa khai |
|---|---|---|---|---|---|
| màn | Core AC-5, AC-9 | Later (lượt 3 có màn) | Later | Core AC-9 | — |
| tRPC phiên | Core AC-1 | Core AC-1 | Later (chưa router) | Core AC-1 | Core AC-4 |
| cầu REST | Core AC-2 | Core AC-2 | Later | Core AC-2 | (cùng lớp AC-4) |
| khoá API | Core AC-2 | Core AC-2 | Later | Core AC-2 | (cùng lớp AC-4) |
| trợ lý AI: đường nối | Core AC-6 | — | — | — | — |
| trợ lý AI: kênh | Core AC-6 | — | — | — | — |
| tường hộp thư | Core AC-8 | — | — | — | — |
| đường HTTP ngoài router | Core AC-13 | — | — | Core AC-13 | Core AC-13 (tập 2xx khai trước) |

Đối chứng (C = thành viên, quản trị): AC-3 (ma trận không mang thông điệp phạm vi), AC-8 (vẫn dựng tường), AC-9 (tám mục rail).

Trục D (cách vào vai): AC-7 phủ bốn giá trị; AC-10 phủ giá trị «đổi vai ở màn Thành viên» qua mắt và qua cơ sở dữ liệu.

## Core

1. Ma trận tRPC cho vai chỉ OKR, tập cho phép so bằng — AC-1.
2. Cùng ma trận qua khoá API và cầu REST — AC-2.
3. Đối chứng thành viên/quản trị — AC-3.
4. Router chưa khai phạm vi bị chặn ở lớp nền — AC-4.
5. Proxy chuyển đường dẫn khu đối tác tới «ngoài phạm vi», vẫn đọc được tư cách — AC-5.
6. Trợ lý AI: đường nối và kênh — AC-6.
7. Gán vai qua bốn đường — AC-7.
8. Tường hộp thư không áp cho vai này — AC-8.
9. Rail, Cài đặt, Tổng quan, trang ngoài phạm vi — AC-9.
10. Màn Thành viên gán vai + cột trong cơ sở dữ liệu — AC-10.
11. Nhật ký mang vai và phạm vi — đường đo — AC-11.
12. Thủ tục ghi của phạm vi chung với đầu vào hợp lệ: tập tự phục vụ so bằng — AC-12 (gap-probe F3).
13. Đường HTTP ngoài router: tập 2xx so bằng — AC-13 (gap-probe F4).

## Later

- Router `okr.*` và màn OKR — lượt 3 khai phạm vi `okr`.
- Nhắc OKR qua Zalo/Slack cho vai này — lượt 5.
- Quyền xem theo đơn vị cho dữ liệu đối tác — chưa ai đòi.

## Never

- Kênh nội bộ của trợ lý AI (`channels/crm.ts`) và kênh Zalo — không mang danh tính người dùng, không có ô «chỉ OKR».
- Xoá tài khoản hay dòng thành viên cho vai này — vai là một giá trị, không phải một trạng thái tồn tại.
- Chặn ở service từng mô-đun (`assertMember` kiểu Zalo) — mở mặc định, đã loại ở hồ sơ trước.

## Cross-cutting áp mọi ô Core

- Thông điệp từ chối là MỘT hằng, phép đo ghim đúng câu, phân biệt với tư cách và với 403 theo vai quản trị.
- Chiều đỏ trên cùng dựng cảnh cho từng phép đo (khuôn measure-birth).
- Ma trận rút lúc chạy, sàn số thủ tục/đường chống ma trận rỗng xanh câm.
