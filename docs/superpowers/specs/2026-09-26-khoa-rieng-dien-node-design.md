# Khoá riêng cho từng đoạn của `dienNode` — thiết kế

Ngày: 2026-09-26 · Hồ sơ: `_acceptance/khoa-rieng-dien-node/` · Hạng: T2

## Vấn đề

Hộp «Chuyển việc 30 ngày» (`apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx`,
hồ sơ `moi-phia-deu-thay-ke-hoach`) ghép câu từ mẫu tin nhắn bằng `dienNode(mau, gia)`: tách mẫu
bằng `mau.split(/(\{\w+\})/)` rồi bọc mỗi đoạn trong một `<Fragment>` có khoá là vị trí ký tự
bắt đầu của đoạn.

`split` với nhóm bắt sinh đoạn rỗng ở hai đầu và giữa hai chỗ trống liền nhau. Mẫu bắt đầu bằng
chỗ trống — `"{ten} đang cầm trịch …"`, `"{ten} không cầm trịch …"`, và cả hai bản tiếng Anh — cho
đoạn rỗng ở vị trí 0 rồi đoạn `{ten}` cũng ở vị trí 0. Hai con cùng khoá `0`, nên React in
«Encountered two children with the same key, `0`» mỗi lần vẽ mô tả của hộp. Đo 26/09: chạy
`apps/app/test/lam-moi-chuyen-viec.dom.tsx` in 12 lần cảnh báo đó trong 3 ca.

Hai chỗ trống liền nhau (`"{a}{b}"`) cũng trùng khoá theo cùng cách. Chưa mẫu thật nào có dạng
đó, nhưng mẫu là dữ liệu tin nhắn, không phải mã, nên ai thêm một mẫu như vậy sẽ gặp lại lỗi.

Người dùng không thấy gì trên màn hôm nay. Rủi ro là React không bảo đảm thứ tự khi khoá trùng:
khi mô tả đổi giữa «có việc» và «không việc», một đoạn có thể bị lặp hoặc mất.

## Cách sửa

Bỏ đoạn rỗng trước khi bọc: `mau.split(…).filter((phan) => phan !== "")`. Mỗi đoạn còn lại dài ít
nhất một ký tự, nên vị trí bắt đầu của các đoạn khác nhau từng đôi. Khoá theo vị trí giữ nguyên và
thành duy nhất. Đoạn rỗng không vẽ gì, nên chữ trên màn không đổi.

`dienNode` được `export` để test đo thẳng ma trận mẫu. Hàm vẫn sống trong tệp của hộp, vì chỉ
có một chỗ dùng.

Phương án đã loại: khoá theo chỉ số mảng (`key={i}`). Cách này cũng duy nhất, nhưng khoá chỉ số
là mẫu lint hay cấm. Nó cũng không nói gì về đoạn, còn khoá vị trí gắn với chỗ đứng của đoạn trong
mẫu.

## Phép đo

- **Hộp với mẫu thật** — hai ngôn ngữ (vi, en) × hai trạng thái xem trước (có việc 2/3, không
  việc 0/0), tức bốn ca. Test DOM mở hộp thật, bắt `console.error` và chờ phần xem trước về. Test
  khẳng định không lời gọi nào chứa «same key», và chữ tiêu đề cùng mô tả đúng bằng mẫu đã điền.
  Tên người đi nằm trong `span[translate="no"]`.
- **Ma trận mẫu của `dienNode`** — mười mẫu viết trước: chỗ trống ở đầu, ở cuối, ở giữa, hai chỗ
  liền nhau, chỉ một chỗ, không chỗ nào, mẫu rỗng, một chỗ lặp hai lần, khoá lạ, ba chỗ liền nhau.
  Với mỗi mẫu, khoá của các phần tử trả về khác nhau từng đôi và chữ khi vẽ đúng bằng chữ đã viết
  trước.
- **Bộ bắt còn sống** — cùng tệp, cùng bộ bắt: vẽ hai `Fragment` cố ý cùng khoá, và bộ bắt phải
  thấy «same key». Không có ca này thì một bộ bắt gắn nhầm chỗ sẽ làm hai phép đo trên xanh mãi.
- **Không làm đỏ hồ sơ đã ký** — máy rút mọi eval `test`/`script` của hồ sơ
  `signed-off`/`machine-cleared` có `paths` khớp tệp của vòng. Lệnh nào đỏ ở HEAD thì phải cũng đỏ
  ở `merge-base`.

## Ngoài phạm vi

- Chuyển `dienNode` sang `packages/ui` hay `plan-copy.ts` — chỉ có một chỗ dùng.
- Hai mục «mở hợp đồng mới» của hồ sơ `lam-moi-chuyen-viec-qua-loi-chung` (E5 neo `merge-base`
  trôi; bộ ghi `invalidateQueries` chỉ ghi lời gọi có `queryKey`).
- Sửa `apps/app/test/lam-moi-chuyen-viec.dom.tsx` hay `moi-phia-ke-hoach.dom.tsx` — hai tệp đó tự
  hết cảnh báo sau vòng này, không cần đổi.
