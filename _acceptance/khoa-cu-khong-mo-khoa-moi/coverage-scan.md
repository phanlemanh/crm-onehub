# Quét độ phủ — khoa-cu-khong-mo-khoa-moi

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub, một workspace; khoá API của người dùng dựng ra
  phiên cho mọi endpoint của Better Auth (`enableSessionForAPIKeys: true`) —
  chân sản phẩm: đào repo [SUY-TỪ-REPO: packages/auth/src/auth.ts],
  [SUY-TỪ-REPO: packages/auth/src/canh-khoa-api.ts], [SUY-TỪ-REPO: docs/api.md]
  · chân ngành: OWASP ASVS (kiểm soát truy cập chặn-mặc-định, kiểm ở tầng dịch vụ
  tin cậy trên đúng danh tính thực thi), OWASP API Security Top 10 2023 — API5
  Broken Function Level Authorization [NGÀNH: OWASP ASVS, OWASP API Security Top 10].

## Trục

- **A — danh tính mà endpoint sẽ dùng:** chỉ cookie phiên | chỉ header khoá |
  cookie + header (header thắng) | không gì (lời gọi phía máy chủ)
  [thước CE: `getHooks` trong `better-auth/dist/api/dispatch.mjs` 1.6.25 — móc
  người dùng chạy trước móc plugin; móc của plugin `api-key` gán
  `ctx.context.session` từ header khi có; `getSessionFromCtx` trả phiên đó trước
  khi đọc cookie. Bốn giá trị là mọi tổ hợp có/không của hai nguồn]
- **B — người sở hữu danh tính đó:** ngoài kho (không có dòng `member`, khoá còn
  bật) | thành viên  [thước CE: vị từ `workspaceRoleOf` — hai nhánh]
- **C — thao tác trên `/api-key/*`:** tạo | sửa (bật lại khoá khác, đổi thuộc tính
  khoá của chính mình) | đọc/xoá (`list`, `get`, `delete`)
  [thước CE: các route của `@better-auth/api-key` 1.6.25]
- **D — lượt dọn một lần:** bảng thành viên có người | rỗng · trạng thái khoá
  `true` | `null` | `false` · chủ khoá thành viên | ngoài kho
  [thước CE: cột `enabled Boolean? @default(true)` trong `schema.prisma`; nhánh
  `enrolled === 0` của `ensureWorkspaceMembership`]

## Không gian A × B × C (ô có nghĩa)

| Danh tính \ thao tác | tạo | sửa | đọc/xoá |
|---|---|---|---|
| cookie · ngoài kho | đã có (E7 hồ sơ nguồn) — siết thông điệp: Core | đã có — siết + đối chứng: Core | Later |
| header · ngoài kho | **Core — lỗ đo đỏ 23/09** | **Core — lỗ đo đỏ 23/09** | Later |
| cookie thành viên + header ngoài kho | **Core** — header thắng | cùng móc — mẫu ở ô tạo | Later |
| cookie ngoài kho + header thành viên | Never | Never | Never |
| header · thành viên | Core — đối chứng dương | Core — đối chứng dương | Later |
| không gì · máy chủ | Core — đối chứng (tạo khoá phía máy chủ) | Later | Later |

## Không gian D (lượt dọn)

| Bảng thành viên \ khoá | ngoài kho `true` | ngoài kho `null` | thành viên `true` | `false` bất kỳ |
|---|---|---|---|---|
| có người | Core → tắt | Core → tắt | Core → giữ | hiển nhiên giữ |
| rỗng | Core → giữ | cùng vị từ | cùng vị từ | hiển nhiên giữ |

## Core

1. Header khoá của người ngoài kho × tạo — lỗ chính, đo đỏ: 200, thêm 1 dòng.
2. Header khoá của người ngoài kho × sửa (bật lại khoá khác, đổi tên khoá mình) —
   đo đỏ: 200, khoá đã tắt bật lại.
3. Cookie thành viên + header ngoài kho × tạo — phép kiểm phải hỏi danh tính
   endpoint thực thi, không phải cookie; đo đỏ: 200.
4. Header thành viên × tạo và sửa, cộng tạo phía máy chủ — đối chứng dương, một bản
   vá chặn mọi header khoá sẽ đỏ ở đây.
5. Lượt dọn: có người × ngoài kho `true`/`null` → tắt; thành viên giữ; số dòng giữ.
6. Lượt dọn: bảng rỗng → không tắt gì.
7. Siết E6 hồ sơ nguồn: khoá đã tắt bị từ chối ở tầng khoá (401, `KEY_DISABLED`),
   tách được khỏi từ chối tư cách (403).
8. Siết E7 hồ sơ nguồn: ba lời từ chối ghim đúng `NOT_A_MEMBER`, và thành viên bật
   lại được khoá của chính mình qua cùng endpoint.

## Later

- Đọc/xoá khoá qua `/api-key/list|get|delete` bằng danh tính ngoài kho — móc chặn
  theo tiền tố nên đã bị chặn, nhưng không đo riêng: đọc danh sách khoá của chính
  mình và xoá khoá của chính mình không trao quyền mới.
- Máy chủ sửa khoá không kèm phiên — không lối nào trong kho gọi.

## Never

- Cookie ngoài kho + header thành viên — endpoint thực thi như thành viên, khoá
  được ghi cho thành viên; không phải lối leo quyền.

## Cross-cutting áp mọi ô Core

- Thông điệp từ chối là đúng hằng `NOT_A_MEMBER` của `@crm/auth`, không chỉ mã 403.
- Mọi vế «không ghi» đo bằng đếm dòng trong cơ sở dữ liệu, không suy từ mã HTTP.
