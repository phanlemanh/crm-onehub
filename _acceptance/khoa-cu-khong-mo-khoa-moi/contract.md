---
schema_version: 1
feature: Khoá cũ không mở được khoá mới — người không còn là thành viên không dùng khoá API còn bật để tạo, sửa hay bật lại khoá qua endpoint của Better Auth; khoá còn bật của họ được tắt một lần
slug: khoa-cu-khong-mo-khoa-moi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [auth, api, db]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-23
design_doc: docs/superpowers/specs/2026-09-23-khoa-cu-khong-mo-khoa-moi-design.md
---

# Acceptance Contract: khoa-cu-khong-mo-khoa-moi

## Context

Hồ sơ `go-la-cat-quyen-that` (PR #97) hứa người ngoài kho không tạo, không sửa,
không bật lại được khoá API qua `/api/auth/api-key/*`. Phép kiểm của nó chạy trước
khi Better Auth dựng phiên từ header khoá, nên chỉ thấy phiên cookie. Chạy thật
23/09: một người ngoài kho còn giữ khoá bật, gọi chỉ bằng header khoá, tạo được khoá
mới (200, thêm 1 dòng), bật lại được khoá đã tắt, đổi được tên khoá; cookie của một
thành viên đi kèm cũng không cứu được. Bảng số đo nằm trong design doc.

Nhóm bị ảnh hưởng: người bị gỡ trước ngày có bản vá nguồn mà khoá vẫn bật. Không đọc
được dữ liệu — `AuthMiddleware` chặn mọi lối dữ liệu — nhưng giữ được một thông tin
đăng nhập sống.

Hồ sơ này dời phép kiểm ra sau lúc danh tính khoá được dựng, tắt một lần các khoá còn
bật của người ngoài kho, và siết hai hạn chế Cổng 2 của hồ sơ nguồn đã ghi.

Source input: prompt (phiên 23/09), Cổng 2 của `go-la-cat-quyen-that`, quyết định
`d-20260923T141901Z-14` «Ngoài-1: mở hợp đồng mới».

## Criteria

- AC-1: Given một người không còn dòng `member` nhưng khoá API của họ vẫn bật, và khoá đó được khẳng định còn bật ngay trước lời gọi, When họ gọi `POST /api/auth/api-key/create` chỉ bằng header khoá, không cookie, Then lời gọi trả 403 với đúng thông điệp `NOT_A_MEMBER` và số dòng khoá của họ không đổi.
- AC-2: Given cùng người ở AC-1, có thêm một khoá đã tắt, When họ gọi `POST /api/auth/api-key/update` chỉ bằng header khoá — một lần bật lại khoá đã tắt, một lần đổi tên chính khoá đang dùng — Then cả hai trả 403 với `NOT_A_MEMBER`, khoá đã tắt vẫn tắt, và tên khoá không đổi.
- AC-3: Given cùng người ở AC-1 và một thành viên còn trong kho đang đăng nhập, When một lời gọi `POST /api/auth/api-key/create` mang cookie của thành viên VÀ header khoá của người ngoài kho, Then lời gọi trả 403 với `NOT_A_MEMBER` và không dòng khoá nào được ghi cho ai trong hai người — phép kiểm hỏi danh tính mà endpoint sẽ thực thi, không phải cookie.
- AC-4: Given một thành viên còn trong kho có một khoá bật và một khoá đã tắt, When họ gọi `POST /api/auth/api-key/create` và `POST /api/auth/api-key/update` (bật lại khoá đã tắt) chỉ bằng header khoá, và hệ thống tạo khoá phía máy chủ cho họ không kèm phiên, Then cả ba thành công: tạo trả 200 và thêm đúng 1 dòng, bật lại trả 200 và khoá bật, tạo phía máy chủ thêm đúng 1 dòng. Đây là đối chứng dương: một bản vá chặn mọi header khoá vẫn đỏ ở đây.
- AC-5: Given cơ sở dữ liệu có ít nhất một thành viên; một người ngoài kho có ba khoá tạo bằng lối tạo khoá thật — một `enabled = true`, một `enabled = null`, một đã tắt từ trước với thời điểm sửa ở quá khứ —; và một thành viên có hai khoá, một bật, một `enabled = null`; và trước lượt dọn, cột chủ khoá của cả năm khoá khớp đúng người tạo, When lượt dọn một lần chạy, Then hai khoá còn bật của người ngoài kho chuyển sang `false`; khoá đã tắt giữ nguyên cả trạng thái lẫn thời điểm sửa; hai khoá của thành viên giữ nguyên (`true`, `null`); số dòng khoá không đổi; và lượt dọn là một `migration` mà `migrate deploy` đã áp lên cơ sở dữ liệu của lượt kiểm, không chỉ là một tệp SQL đọc được.
- AC-6: Given bảng thành viên rỗng — bản cài chưa ai ghi danh —, với khoá `true` và `null` của nhiều người, When lượt dọn chạy, Then không khoá nào đổi trạng thái, vì lần ghi danh đầu tiên sẽ đưa mọi người dùng cũ vào kho.
- AC-7: Given một người có khoá API bị gỡ bằng lượt gỡ thật, When họ gọi `contacts.list` bằng khoá đó, Then lời gọi trả 401 — không phải 403 tư cách — và `auth.api.verifyApiKey` báo mã `KEY_DISABLED`, nên lời từ chối đến từ tầng khoá, tách được khỏi phép kiểm tư cách. Đối chứng: khoá của một thành viên khác vẫn đọc được `contacts.list` (200).
- AC-8: Given một người đã bị gỡ rồi đăng nhập lại bằng mật khẩu, When họ tạo khoá qua thủ tục `apiKeys.create` của API, tạo khoá qua `/api/auth/api-key/create`, và bật lại khoá cũ đã tắt qua `/api/auth/api-key/update`, Then mỗi lời gọi trả 403 với đúng `NOT_A_MEMBER`, không dòng nào được ghi và khoá cũ vẫn tắt. Đối chứng dương cho lời bật lại: một thành viên bật lại khoá đã tắt của chính mình qua cùng endpoint bằng cookie → 200 và khoá bật.
- AC-9: Given lượt dọn là việc ghi dữ liệu thật khi phát hành, When người ký Cổng 2 chạy lệnh xem trước chỉ-đọc trên một cơ sở dữ liệu, Then lệnh in số khoá sẽ bị tắt, số chủ khoá khác nhau và số khoá có lời gọi trong 30 ngày qua, rút mệnh đề lọc từ CHÍNH tệp `migration` chứ không chép tay; lệnh chạy trong giao dịch chỉ-đọc, chỉ nhận địa chỉ cơ sở dữ liệu qua một biến riêng (không đọc `DATABASE_URL`) và in tên máy đang đếm. Trên cơ sở dữ liệu lượt kiểm, số khoá lệnh đếm bằng đúng số dòng lượt dọn đổi, và đếm lại sau lượt dọn ra 0.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — danh tính endpoint dùng:** chỉ cookie · chỉ header khoá · cookie + header (header thắng) · không gì (máy chủ)  [thước CE: `getHooks` trong `better-auth/dist/api/dispatch.mjs` 1.6.25 và móc của plugin `@better-auth/api-key` 1.6.25 gán `ctx.context.session` từ header; chân ngành: OWASP ASVS — kiểm quyền trên đúng danh tính thực thi, chặn mặc định]
- **Trục B — người:** ngoài kho còn khoá bật · thành viên  [thước CE: hai nhánh của `workspaceRoleOf`]
- **Trục C — thao tác trên `/api-key/*`:** tạo · sửa · đọc/xoá  [thước CE: route của `@better-auth/api-key` 1.6.25; đọc/xoá ở Later — móc chặn theo tiền tố, không trao quyền mới]
- **Trục D — lượt dọn:** bảng thành viên có người · rỗng × khoá `true` · `null` · `false` × chủ khoá thành viên · ngoài kho  [thước CE: cột `enabled Boolean? @default(true)` trong `schema.prisma`, nhánh `enrolled === 0` của `ensureWorkspaceMembership`]

Cookie của người ngoài kho kèm header khoá của thành viên ở Never: endpoint thực thi
như thành viên và ghi khoá cho thành viên — không phải lối leo quyền.

## Out of scope

- **Các endpoint khác của Better Auth nhận phiên dựng từ khoá** — `/sso/register`, plugin organization, `/get-session`. Cùng lý do hồ sơ nguồn đã để ngoài: mối lo áp cho mọi người có phiên, là một hồ sơ riêng.
- **Đo riêng `/api-key/list`, `/api-key/get`, `/api-key/delete` bằng danh tính ngoài kho** — móc chặn theo tiền tố nên đã bị chặn; đọc hay xoá khoá của chính mình không trao quyền mới.
- **Sửa hồ sơ đã ký `go-la-cat-quyen-that`** — hai hạn chế Cổng 2 của nó đóng ở hồ sơ này; contract và Known limits bên đó giữ nguyên.
- **Ghi lại danh sách từng khoá mà lượt dọn đã tắt** — `migration` không có chỗ in. Người ký thấy con số trước khi phát hành qua lệnh xem trước ở AC-9; khoá của người ngoài kho đằng nào cũng không đọc được dữ liệu.
- **Token cầu nối trợ lý đúc trước lượt gỡ** — Known limits của hồ sơ nguồn, không liên quan tới khoá.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `docs/api.md` (tRPC, workspace, khoá API), `docs/setup.md` (migration chạy ở lượt dựng production), `AGENTS.md` (không chú thích, một `.env`), `CLAUDE.md` của kho. Skill kho đã đọc: `.agents/skills/better-auth-best-practices` (móc `hooks.before`, `ctx.context.session`, plugin — không nói thứ tự móc người dùng với móc plugin) và `.agents/skills/prisma-database-setup` (không có mục migration dữ liệu); thứ tự móc đọc thẳng từ mã `better-auth` 1.6.25 và `@better-auth/api-key` 1.6.25.
- Hạng T3: chạm `packages/auth` và `packages/db/prisma`. Kế hoạch viết xong trước Cổng 1 nên cổng duyệt kế hoạch ngồi cùng lượt.
- Lượt dọn ghi dữ liệu thật ở lượt dựng production — việc khó đảo, nên Cổng 2 dừng chờ người dù bằng chứng xanh. Máy không với tới cơ sở dữ liệu production; con số thật do người ký chạy lệnh xem trước ở Cổng 2: `XEM_TRUOC_DATABASE_URL=<địa chỉ chỉ-đọc> bun packages/db/scripts/xem-truoc-luot-don.ts`.
