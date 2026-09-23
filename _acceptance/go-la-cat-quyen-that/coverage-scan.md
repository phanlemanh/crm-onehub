# Quét độ phủ — go-la-cat-quyen-that

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub, một workspace, vai owner/admin/member — chân sản phẩm: đào repo [SUY-TỪ-REPO: docs/api.md], [SUY-TỪ-REPO: packages/auth/src/auth.ts] · chân ngành: OWASP ASVS (kiểm soát truy cập chặn-mặc-định; quản lý phiên — phiên và thông tin đăng nhập mất hiệu lực khi tài khoản mất quyền), OWASP Top 10 A01 Broken Access Control [NGÀNH: OWASP ASVS, OWASP Top 10].

## Trục

- **A — cửa vào:** phiên mới (đăng nhập lại) | cookie bộ đệm phiên | khoá API cũ | khoá API mới | đường nối trợ lý | phiên cũ chỉ mang token  [thước CE: ba cách dựng người dùng của Better Auth trong `packages/auth/src/auth.ts` + route đúc danh tính `apps/app/app/eve/v1/[...path]/route.ts`; [NGÀNH: OWASP ASVS] mục thông tin đăng nhập dài hạn (khoá API) phải thu hồi khi mất quyền]
- **B — lối gọi:** tRPC query | tRPC mutation | cầu REST `/rest` | endpoint `/api-key/*` Better Auth | route Next | controller REST Nest  [thước CE: `apps/api/src/create-app.ts`, danh sách `@Controller` đã soát]
- **C — người:** đã bị gỡ | thành viên | được cho phép lại  [thước CE: ba nhánh của `ensureWorkspaceMembership`]
- **D — tập thủ tục:** toàn bộ router đang chạy | tập ngoại lệ khai  [thước CE: `AppRouterHost` lúc chạy]

## Không gian (lát theo trục A, ô có nghĩa)

| Cửa \ lối | tRPC | REST | Better Auth `/api-key/*` | route Next |
|---|---|---|---|---|
| phiên mới | Core (AC-1, AC-2) | qua cùng middleware — mẫu ở AC-5 | Core (AC-7) | Core (AC-8) |
| cookie bộ đệm | Core (AC-4) | cùng middleware | — (cùng móc AC-7) | cùng phép kiểm AC-8 |
| khoá cũ | Core (AC-5) | Core (AC-5) | bật lại: Core (AC-7) | không áp — route đòi cookie |
| khoá mới | Core (AC-7) | — | Core (AC-7) | không áp |
| phiên cũ chỉ token | Never — đã ký | Never | Never | Never |

Trục C cắt ngang: thành viên = AC-3 (đối chứng), được cho phép lại = AC-9, lượt gỡ tắt khoá = AC-6.

## Core

1. Phiên mới × toàn bộ tRPC — cửa lớn nhất, chứng đỏ 23/09.
2. Ngoại lệ đúng bằng tập khai — giữ proxy sống và chặn ngoại lệ lậu.
3. Thành viên không bị chặn oan — đối chứng dương.
4. Cookie bộ đệm — cửa phép đo cũ bỏ sót.
5. Khoá cũ × tRPC + REST — chứng đỏ 23/09.
6. Lượt gỡ tắt khoá — thu hồi ở gốc, đo độc lập với middleware.
7. Khoá mới / bật lại qua hai lối — chứng đỏ 23/09.
8. Đường nối trợ lý — cửa thứ tư, chứng đỏ 23/09.
9. Được cho phép lại — không khoá nhầm người vĩnh viễn.

## Later

- Controller REST tải tệp đính kèm hội thoại — chỉ tệp của chính người đó.
- Endpoint Better Auth khác (`/sso/register`, plugin organization) cho mọi người có phiên — hồ sơ riêng.
- Trợ lý tự hỏi tư cách khi nhận token cầu nối (đóng khe 120 giây).

## Never

- Phiên cũ chỉ mang token — đã ký ở `go-thanh-vien-phai-giu-duoc` (E2), dòng phiên bị xoá.
- Người chưa từng là thành viên như một giá trị riêng — cùng vị từ «không có dòng member».
- Tắt bộ đệm phiên — kiểm tư cách tươi đã đủ.

## Cross-cutting áp mọi ô Core

- Từ chối tư cách mang một thông điệp có tên, để phép đo phân biệt với 403 theo vai.
- Mọi dựng cảnh đi đường sản phẩm thật (removeMember, signInEmail, allowEmail), không ghi tay dòng member.
