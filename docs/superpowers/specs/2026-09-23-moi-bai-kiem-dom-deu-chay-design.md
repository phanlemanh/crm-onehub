# Mọi bài kiểm DOM đều chạy trong `bun run test` — thiết kế

Hồ sơ nghiệm thu: `_acceptance/moi-bai-kiem-dom-deu-chay/`. Hạng T2, không chạm giao diện.

## Vì sao

Bun chỉ tự nhặt tệp `*.test.*` và `*.spec.*`. Các bài kiểm DOM (`*.dom.tsx`) chạy
được là nhờ được liệt kê tay trong script: `apps/app` liệt kê 14 trong 16 tệp ở
`test:dom`, còn `packages/ui` không liệt kê gì. Đo ngày 23/09: `keo-tha-thoa-thuan.dom.tsx`
(28 bài), `may-nhac.dom.tsx` (10 bài) và `packages/ui/test/board-giu-nguyen.dom.tsx`
(2 bài) không bao giờ chạy trong `bun run test`, nên pre-push và CI không thấy hồi
quy ở ba tính năng đó. Danh sách tay là lớp lỗi: mỗi tệp mới đều có thể bị quên.
Đây là Known limits Ngoài-1 của hồ sơ `keo-tha-thoa-thuan`.

## Thiết kế

`test:dom` của `apps/app` và `test` của `packages/ui` thôi liệt kê tay: cả hai gọi
một bộ chạy chung `packages/ui/test/chay-tung-tep-dom.ts`. Bộ chạy liệt kê mọi
`test/*.dom.tsx` của thư mục đang đứng (sắp theo tên), in `chay-dom: test/<tệp>`
trước mỗi tệp, chạy **từng tệp trong một tiến trình `bun test` riêng** với các cờ
nhận được (`--preload …`), và dừng ở tệp đỏ đầu tiên với mã thoát của tệp đó.

Dòng `chay-dom:` là cần thiết: chạy một tệp thì Bun chỉ in «Ran N tests across 1
file», không in tên tệp — thiếu dòng này thì không ai đọc đầu ra biết tệp nào đã
chạy.

Chạy từng tệp riêng chứ không chạy chung là kết quả đo, không phải sở thích: chạy
cả 16 tệp của app trong một tiến trình làm 8 bài đỏ, vì `mock.module` của tệp này
rò sang tệp kia (hai tệp giả `@/lib/trpc/client` theo hai cách khác nhau). Chạy
riêng: 16/16 tệp xanh, 164 bài, 17 giây.

`TZ=Asia/Ho_Chi_Minh` giữ nguyên cho bài kiểm DOM của app, như script cũ.

Phương án bị loại:
- Đổi tên thành `*.spec.tsx` để Bun tự nhặt — Bun vẫn chạy chung một tiến trình, lỗi rò mock y hệt.
- Giữ danh sách tay, thêm tệp còn thiếu — chữa triệu chứng, tệp mới lại sót.
