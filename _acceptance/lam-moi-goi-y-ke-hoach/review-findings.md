# Review findings: lam-moi-goi-y-ke-hoach (round 1)

## Trong hợp đồng

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): ô settle record của gy-lm-cache chỉ đếm lần gọi, không đo thứ tự «đọc lại trước khi lời gọi xong»**
  file: `apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx:313`
  severity: medium
  AC: AC-4
  source: measurement
  detail: AC-4 hứa một quan hệ thứ tự: với cache.deal("d-1", { settle: "record" }) thì goiYCuaDeal của d-1 được đọc lại TRƯỚC KHI promise xong, tức nó phải nằm trong danh sách được await (record), không nằm trong danh sách chạy nền (rest). Dòng 313 và 317-318 (`const len1 = demDoc("d-1") > truoc1` rồi `chot(len1, "gy-lm: settle record khong cho goi y")`) chỉ hỏi bộ đếm có tăng hay không. Bộ đếm đó tăng ngay khi queryFn được gọi: `doc()` trong khung-gop-y.tsx đẩy vào trangThai.daGoi lúc queryFn bắt đầu chứ không phải lúc nó xong. Trong run() của cache.ts, các khoá ở `behind` cũng được `void queryClient.invalidateQueries(...)` nên refetch vẫn khởi chạy đồng bộ. Ngoài ra lời gọi được bọc trong `await act(async () => { await o.goi(c); })`, mà act xả hết microtask trước khi trả về, nên câu «không thêm nhịp» của eval không đúng như viết. Hệ quả: đưa khoá goiYCuaDeal sang danh sách rest (chạy nền, không await) thì ô này vẫn xanh. Ô chỉ đỏ khi khoá bị gỡ hẳn, mà trường hợp đó ô deal-d1 đã bắt. E5 (dot-bien.mjs) cũng không có cặp đột biến «chuyển khoá sang rest» cho ô này, nên chưa từng thấy nó đỏ đúng lý do.
  rationale: AC-4 hứa đích danh với settle record thì goiYCuaDeal của d-1 được đọc lại trước khi lời gọi xong, nhưng bài kiểm chỉ đếm lần gọi nên không đo được quan hệ thứ tự đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **man.mjs giữ treo yêu cầu goiYCuaDeal, trong khi bước E6 của evals.yaml ghi là chặn (abort)**
  Người dùng thấy gì: Phép đo trên màn hình vẫn báo đỏ đúng khi thẻ gợi ý không tự làm mới. Chỉ có điều cách đo thật hơi khác với lời mô tả trong hồ sơ, nên người chấm đọc theo chữ có thể thấy lệch.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **E6 tự mâu thuẫn: lượt tự thử bắt buộc in dòng «E6 … KHONG DAT», nhưng bước chấm lại đòi mọi dòng «E6 …» phải đạt**
  Người dùng thấy gì: Người chấm làm theo từng chữ có thể thấy một dòng ghi «không đạt» ở lượt tự thử và nhầm là phép đo hỏng, dù tính năng vẫn chạy đúng.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): gy-lm-roi chỉ đòi thẻ vắng mặt sau thao tác, không có mỏ neo dương nào sau thao tác**
  Người dùng thấy gì: Bài kiểm có thể xanh trong trường hợp thẻ biến mất vì cả khung chi tiết deal bị đóng chứ không phải vì gợi ý được làm mới đúng. Hiện chưa thấy lỗi thật nào ngoài người dùng.
  file: `apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng bộ dò chỉ bắt một cách viết): duong-doi-giai-doan.mjs nói đo «mọi lời gọi deals.setStage» nhưng chỉ khớp đúng chuỗi `.mutationOptions(`**
  Người dùng thấy gì: Nếu sau này ai thêm một đường đổi giai đoạn viết theo kiểu khác, phép quét có thể bỏ sót và thẻ gợi ý kế hoạch sẽ không tự làm mới ở đường đó. Hiện chưa có đường nào như vậy.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
