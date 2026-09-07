# Review findings — hd-theo-danh-sach

## Trong hợp đồng — máy đã sửa

- **Bảng của AC-4 là bản chép từ phản biện, chưa từng đo** — `primaryWorkspaceDomain()` trả domain bất kể danh sách có địa chỉ lẻ hay không, nên danh sách trộn nhận câu-nêu-domain chứ không phải câu allow-list. Đã đo lại rồi sửa cả hợp đồng, phép đo lẫn thuộc.
- **Chân E2 bắt oan mã đúng** — `google.hd = hostedDomain` với `hostedDomain = googleHostedDomain()` bị coi là tính tại chỗ. Đã thêm một bước lần theo hằng cục bộ.
- **Chân E3 chỉ hứng stdout** — `bun test` viết ra stderr nên phần đếm ca luôn rỗng. Đã gộp `2>&1`.
- **Chiều đỏ của E3 không nổ** — `git diff SHA..HEAD` so hai commit nên không thấy sửa chưa commit. Đã đổi sang `git diff SHA` (so với cây làm việc).

## Ngoài hợp đồng — người quyết ở Gate 2

- **Bộ test của gói auth xanh nhờ may, không nhờ thiết kế**
  Người dùng thấy gì: `packages/auth/src/env.ts` chốt `API_URL` đúng một lần lúc nạp module. `test/sso.spec.ts` đặt biến ấy rồi mới nạp — nên nó chỉ đúng khi tình cờ là file ĐẦU TIÊN chạm `src/env`. Vòng này thêm hai thuộc phải với tới hook thật của better-auth, tức phải nạp `src/auth` → `src/env`, và hai câu khẳng định của `sso.spec.ts` đỏ ngay. Đo thêm: bun nạp file theo thứ tự thư mục chứ không theo bảng chữ cái, nên đổi tên file không cứu được.
  Máy đã vá bằng một `bunfig.toml` riêng cho gói auth ghim sẵn `API_URL` trước khi bất kỳ module nào nạp — không sửa một ký tự nào của `sso.spec.ts`. Cả hai chiều đã đo: bỏ preload thì 2 ca đỏ trở lại; phá `ssoCallbackBase()` thì 2 ca ấy vẫn đỏ, tức chúng còn răng.
  file: `packages/auth/src/env.ts`
  severity: P2
  Đề xuất: new-contract — cái vá làm bộ test hết phụ thuộc thứ tự, nhưng gốc vẫn là mã sản xuất của hãng đọc môi trường một lần lúc nạp; sửa nó là đổi mã sản xuất T3 ngoài phạm vi vòng này

- **Bản vá `hd` chưa gửi ngược lên hãng**
  Người dùng thấy gì: `CLAUDE.md` nói sửa được ở hãng thì gửi lên hãng. Đây đúng là mã của hãng phá hợp đồng do chính hãng công bố trong `.env.example` và khẳng định trong test của hãng, nhưng vòng này mới chỉ vá ở bản rẽ.
  file: `packages/auth/src/auth.ts`
  severity: P2
  Đề xuất: new-contract — gửi ngược lên hãng là một việc riêng có nhịp riêng, không chặn lộ trình triển khai
