# `hd` phải theo danh sách, không theo domain đầu tiên

> Hồ sơ nghiệm thu: `_acceptance/hd-theo-danh-sach/`
> Hạng **T3** — chạm `packages/auth/**`.

## Lỗi, nói gọn

`ALLOWED_SIGN_IN` nhận hai loại mục: **domain** và **địa chỉ lẻ**. Kho công bố dạng
trộn ở hai chỗ độc lập:

`.env.example`:

```
ALLOWED_SIGN_IN="acme.com,contractor@gmail.com"  …plus one outsider
```

`apps/api/test/workspace.spec.ts` — một ca đang **XANH**:

```ts
it("mixes a domain with individual outsiders", () => {
  process.env.ALLOWED_SIGN_IN = "acme.com, contractor@gmail.com";
  expect(isWorkspaceEmail("contractor@gmail.com")).toBe(true);
});
```

Và `isWorkspaceEmail` — cửa phân quyền thật — làm đúng như hứa.

Nhưng `packages/auth/src/auth.ts:49` đặt tham số `hd` của Google **vô điều kiện**:

```ts
const hostedDomain = primaryWorkspaceDomain();
if (hostedDomain) google.hd = hostedDomain;
```

`hd` bảo Google chỉ cho phép tài khoản thuộc domain ấy. Nên với danh sách trộn,
Google chặn người ngoài **trước khi CRM kịp xét** — vế «plus one outsider» chết ở
đường Google, đúng cái mà tài liệu và test đều nói là chạy được.

## `hd` là bộ lọc trước, không phải ranh giới

Ranh giới phân quyền là `auth.ts:269` và nó chạy dù có `hd` hay không:

```ts
if (!isWorkspaceEmail(user.email)) {
  throw new APIError("FORBIDDEN", { message: … });
}
```

Câu từ chối **đã viết sẵn cho cả hai ca** — có domain thì «Sign in with your @domain
account», không có thì «That address is not on the allow-list». Tức mã vốn được
thiết kế cho trường hợp không đặt `hd`; chỉ dòng 49 là vô điều kiện.

## Cách sửa

Đặt `hd` **chỉ khi danh sách không có địa chỉ lẻ nào**:

| `ALLOWED_SIGN_IN` | `hd` | Ai bị chặn ở đâu |
| --- | --- | --- |
| `onemount.com` | `onemount.com` | Google chặn ở màn chọn tài khoản |
| `onemount.com,phanlemanh@gmail.com` | *không đặt* | CRM từ chối ở callback, bằng câu đã có |
| `phanlemanh@gmail.com` | *không đặt* | như trên |

Quyết định ấy là một **hàm thuần đọc từ danh sách**, đặt cạnh `primaryWorkspaceDomain`
trong `workspace.ts`, chứ không nằm trong thân dựng provider — thân ấy chạy một lần
lúc nạp module nên không đo được nếu không nạp lại.

`primaryWorkspaceDomain()` **giữ nguyên**: câu từ chối vẫn nên nêu domain của công ty
cho người lạ.

## Cái giá, nói thẳng

Bỏ `hd` thì người ngoài bị từ chối **sau** khi đã chọn tài khoản, thay vì không thấy
nút. Trải nghiệm bị từ chối xấu hơn.

Phân quyền **không yếu đi một chút nào**: `isWorkspaceEmail` là cửa duy nhất và không
đổi một dòng. Vòng này chứng điều đó bằng cách bắt bộ test có sẵn của nó phải còn
xanh **nguyên vẹn, không sửa một ký tự** — nếu phải sửa test cũ để vòng này xanh thì
đó là dấu hiệu phân quyền đã đổi, và tiêu chí sẽ đỏ.

## Sẽ KHÔNG làm

- **Không đổi câu từ chối.** Nó đã đúng cho cả hai ca.
- **Không đụng `isWorkspaceEmail`.** Cửa phân quyền không nằm trong phạm vi.
- **Không thêm cách đăng nhập nào** (Microsoft, SSO) — đó là việc khác.
- **Không sửa hành vi cho Microsoft.** Chỉ Google có tham số `hd`; `grep` toàn kho cho
  thấy `hd` chỉ xuất hiện đúng một chỗ.

## Gửi ngược lên hãng

`CLAUDE.md`: *«Sửa được ở hãng thì gửi lên hãng, đừng vá riêng — phí bản rẽ là chi phí
dài hạn lớn nhất ở đây.»* Đây là mã của hãng phá vỡ hợp đồng do chính hãng công bố
trong `.env.example` và khẳng định trong test của hãng. Vá ở bản rẽ để không chặn lộ
trình triển khai, **rồi gửi ngược lên hãng** — không giữ riêng.
