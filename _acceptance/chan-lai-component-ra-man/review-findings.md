# Review findings — chan-lai-component-ra-man

## Trong hợp đồng — máy đã sửa

- **Ma trận tối thiểu bắt ca hỏng mount-một-trạng-thái.** Mount ở trạng thái đóng thì
  năm ví dụ đầu bài rơi sang nhóm kỹ thuật mà tổng vẫn đủ. Đã thêm bước lái: bấm thật
  từng nút mở được, rồi gom lại. Kết quả 10 → 12 chỗ chữ-người-đọc.
- **`conversation.tsx` được vá nửa vời** — thân hàm đổi mà hai giá trị mặc định còn
  nguyên, nên `??` không bao giờ chạy. Con số lệch là bên phát hiện.
- **Cặp hai chiều từng XANH GIẢ** — lượt cấy đọc dân số cũ nên bộ vẽ không vẽ file đã
  vá. S4 vòng một REJECT đúng chỗ đó; đã sửa để dựng lại dân số mỗi lượt.
- **Chân không-chép-thước có chiều đỏ không nổ ở lần thử đầu** — khối cấy còn dưới 12
  dòng sau khi lọc. Cấy lại một khối đặc thì nó bắt đúng cả hai file kèm số dòng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy
không tự sửa.

- **Vòng này sửa bốn con số neo của một hồ sơ NGƯỜI ĐÃ KÝ**
  Người dùng thấy gì: không thấy gì trên màn — nhưng hồ sơ `chu-mac-dinh-thu-vien-ngoai`
  anh ký sáng nay có ba chân đỏ trên cây hôm nay, vì vòng này vá năm component nên chúng
  rời khỏi nhóm bọc-mà-không-đọc. Máy đã sửa `doc_kho` 16→21, bảng 29→26, bảng giới hạn
  10→9, và ghi một dòng vào phần hạn chế đã biết của hồ sơ ấy. Phạm vi hợp đồng đó không
  đổi; chỉ số đếm đổi.
  file: `_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/khai-sinh.mjs`
  severity: P1
  Đề xuất: known-limits — sửa số đếm cho khớp cây là việc bảo trì, và chính sổ quyết định của hồ sơ ấy đã hai lần làm đúng thế với cùng lý do; nhưng đây là artifact người đã ký nên người phê hay veto

- **Văn xuôi của hợp đồng đã ký còn ghi con số cũ**
  Người dùng thấy gì: đọc hợp đồng `chu-mac-dinh-thu-vien-ngoai` thì AC-2 vẫn viết «16 đọc
  kho chuỗi» và AC-3 vẫn viết «29 component», trong khi chân của nó nay neo 21 và 26.
  Phần Notes đã ghi bản đính chính, nên hai chỗ nói khác nhau trong cùng một file.
  file: `_acceptance/chu-mac-dinh-thu-vien-ngoai/contract.md`
  severity: P2
  Đề xuất: known-limits — chữ trong AC là bản ghi đã ký tại thời điểm ký, và bản đính chính ở Notes nói rõ số nào đã đổi vì sao; sửa thẳng chữ trong AC là viết lại điều người đã ký

- **Năm giá trị mặc định không vẽ được nên không ai biết chúng có phải chữ người đọc không**
  Người dùng thấy gì: năm chỗ — `chain-of-thought` · `shimmer` · `stage-change` và hai file
  không phải component — máy không dựng ra màn được, nên phép đo không trả lời được câu
  hỏi «chuỗi này có đến mắt người không». Cả năm trông đều như tên kỹ thuật, nhưng đó là
  mắt người nhìn chứ không phải phép đo.
  file: `_acceptance/chan-lai-component-ra-man/evidence/phan-nhom.json`
  severity: P2
  Đề xuất: known-limits — ba trong năm cần bộ điều hợp riêng (nuqs, ngữ cảnh của app) và hai cái còn lại không phải component nên không bao giờ vẽ; khai giới hạn rẻ hơn dựng ngữ cảnh app trong bộ vẽ của thư viện giao diện
