# Review findings: hop-cap-nhat-lan-truoc (round 1)

## Trong hợp đồng

- **Hình dạng 3 (và 2): hct-sau-gui đo «chuỗi có mặt» từ hằng của tRPC giả chứ không đo quan hệ giữa giá trị vừa nhập và khối «Lần cập nhật trước»**
  AC: AC-4
  file:line: `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx:546`
  severity: medium
  source: measurement
  detail: AC-4 hứa rằng khối là lần vừa gửi (số, mức tự tin, ghi chú vừa nhập), tức là một quan hệ giữa đầu vào và đầu ra. Bộ ghi giả `kho.ghiRieng.set("okr.guiCapNhat", async (vao) => { guiCapNhatInput.parse(vao); daGui = true; kho.chiTiet = () => mtMoi; ... })` chỉ kiểm hình dạng của `vao` rồi bỏ nó đi. `mtMoi` (dòng 535-538, vết `vet("v2", id, lucMoi, 60, "thap")`) và điểm của okr.dienBien (dòng 541-543, `ghiChu: "Moi"`) đều là hằng viết tay, không lấy từ `vao.items[0]`. Vì vậy assert cuối (dòng 596-609: `thay === "Moi"`, `so: giaTri(k, 60)`, `tuTin: mucTuTin.thap`) vẫn xanh nếu hộp gửi sai ghi chú, sai mức tự tin hay sai số. Thêm nữa, dòng 564-565 `if (g) await u.type(g, "Moi")` lặng lẽ bỏ qua bước nhập khi không tìm thấy ô ghi chú. Bài này chỉ chứng minh hộp có làm mới và đọc lại dữ liệu; nó không chứng minh khối hiện «lần vừa gửi». Lối sửa: dựng vết và điểm của tRPC giả từ `vao` (lấy từ bên ghi, đọc bằng bên đọc), hoặc assert `vao.items[0]` bằng (60, "thap", "Moi").

- **Hình dạng 4: tràn ngang của [data-hop-cap-nhat-kr] chỉ được assert âm tính, đối chứng 4000px chỉ chạy ở cấp trang**
  AC: AC-7
  file:line: `_acceptance/hop-cap-nhat-lan-truoc/rang/man.mjs:183`
  severity: low
  source: measurement
  detail: Bước của E7 ghi: đo tràn của trang VÀ của [data-hop-cap-nhat-kr] (scrollWidth <= clientWidth + 1), có đối chứng bằng một khối rộng 4000px. Trong man.mjs, `doTran` (dòng 43-54) chèn khối 4000px vào `document.body` và chỉ đọc `document.scrollingElement`, nên đối chứng dương (`t.doiChung === true`, dòng 191-194) chỉ chứng minh thước bắt được tràn ở cấp trang. Ba phép đo hop/khối/ghi chú (`hopTran`, `khoiTran`, `gcTran`, dòng 168-174 và 183-187) chỉ được assert `=== false` và không có ca nào cho thấy chúng từng ra `true` khi phần tử bên trong hộp bị tràn. Hộp nằm trong lớp phủ của dialog, có thể có vùng cuộn riêng, nên thước có thể không bao giờ đỏ mà không ai biết.

- **Hình dạng 4: hct-rong assert «hộp không chứa tiêu đề Lần cập nhật trước» mà không ca nào ghim tiêu đề đó xuất hiện khi có khối**
  AC: AC-1
  file:line: `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx:332`
  severity: low
  source: measurement
  detail: Ô (a) của E2 đòi hộp không chứa chuỗi okrLanTruocMessages("vi").tieuDe: `chu: hop()?.textContent?.includes(ml.tieuDe) ?? true`, kỳ vọng `chu: false` (dòng 378). Không ô nào của hct-rong, hct-khoi, hct-tai hay hct-sau-gui assert `ml.tieuDe` có mặt khi khối hiện; hct-khoi chỉ kiểm `[data-slot="item-title"]` chứa "15/10, 09:30" (dòng 259-263). Vì vậy nửa «không có câu thay khối» của assert này không có đối chứng dương, và cũng không bài nào đo được chữ «Lần cập nhật trước» mà AC-1 hứa ở đầu hộp. Nếu tiêu đề không bao giờ được vẽ, `chu: false` vẫn xanh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tuanVN chép lại dauTuanVN của máy chủ trong apps/app thay vì dùng chung một hàm ở packages/validation**
  Người dùng thấy gì: Hai chỗ trong sản phẩm cùng tính tuần theo giờ Việt Nam. Nếu sau này một chỗ bị sửa mà chỗ kia không, khối «Lần cập nhật trước» có thể mất ghi chú mà không báo gì. Hiện tại hai chỗ vẫn khớp.
  Căn cứ: Hiện chưa gây sai cho người dùng và các ca sát nửa đêm đã được kiểm; rủi ro chỉ đến khi có người sửa một bản, và sửa sau không đắt hơn bây giờ.
  file: `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **lanTruocTuVet tính lại lần cập nhật cuối của KR mà krCapNhatTuSheet đã tính, và hai bản chọn khác nhau khi trùng giờ**
  Người dùng thấy gì: Hiếm khi hai lần cập nhật của một KR trùng đúng giây. Nếu xảy ra, nhãn lần cập nhật và khối «Lần cập nhật trước» trong cùng hộp có thể nói về hai lần gửi khác nhau.
  Căn cứ: Chỉ xảy ra khi hai lần gửi trùng đúng thời điểm nên cực hiếm, hậu quả chỉ là một nhãn lệch, không mất dữ liệu; người dùng mở lại hộp sau khi có lần gửi mới là hết.
  file: `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **Dùng className đổi bố cục và khoảng cách của ItemDescription, trái docs/design.md và kế hoạch của chính vòng này**
  Người dùng thấy gì: Khối «Lần cập nhật trước» chỉnh khoảng cách bằng cách vá tại chỗ thay vì dùng thành phần chung, nên giao diện có thể lệch nhẹ so với các màn khác nếu thành phần chung đổi sau này. Người dùng hiện không thấy sai gì.
  Căn cứ: Chỉ là lệch quy ước thiết kế, không ảnh hưởng chức năng hay dữ liệu; sửa lúc nào cũng được khi thành phần chung được dựng.
  file: `apps/app/app/(app)/[slug]/okr/khoi-lan-truoc.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

