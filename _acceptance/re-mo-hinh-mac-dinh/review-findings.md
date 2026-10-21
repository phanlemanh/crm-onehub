# Review findings: re-mo-hinh-mac-dinh (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hằng số TOI_DA_IN đặt cạnh chỗ dùng đầu tiên, không nằm trong object cấu hình MH2**
  Người dùng thấy gì: Một con số chỉnh được (trần số phiên in ra khi báo lỗi) nằm sai chỗ so với quy ước của kho. Người dùng cuối không thấy gì khác; chỉ người sửa sau này phải tìm con số ở chỗ lạ.
  Căn cứ: Hậu quả chỉ là khó tìm khi chỉnh, không ảnh hưởng kết quả đo hay dữ liệu, và sửa sau rất rẻ.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: low
  Đề xuất: wont-fix

- **khuonKhoTom để su_kien và so_phien là optional, lỏng hơn dữ liệu thật đang lưu**
  Người dùng thấy gì: Phần kiểm tra bằng chứng chấp nhận thiếu hai trường mà lẽ ra luôn phải có, nên một tóm tắt cũ thiếu trường có thể lọt qua thay vì báo lỗi ngay. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm bộ kiểm tra dễ tính hơn mức cần ở một trường hợp hiếm (hồ sơ cũ), dữ liệu thật vẫn luôn ghi đủ và sửa sau rất rẻ.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/khuon.ts`
  severity: low
  Đề xuất: known-limits

- **kiemSuKienKho đọc lại kết xuất aiChiPhi vô điều kiện sau khi đã ghi nhận nó vắng, nên ném ENOENT thay vì báo đỏ**
  Người dùng thấy gì: Khi một tệp chi phí bị mất, phép kiểm báo lỗi trần thay vì liệt kê đủ chỗ hỏng. Kết quả vẫn là không đạt, chỉ khó đọc nguyên nhân hơn.
  Căn cứ: Không làm mất cổng hay cho qua nhầm, chỉ làm thông báo lỗi kém rõ trong tình huống hiếm; sửa sau rẻ.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: low
  Đề xuất: known-limits

- **kiemSuKienKho vẫn đọc lại tệp kết xuất sau khi đã biết tệp đó vắng, nên E5 sập thay vì in dòng «thieu ket xuat»**
  Người dùng thấy gì: Khi tệp chi phí vắng, phép kiểm sập với lỗi đọc tệp thay vì in danh sách chỗ hỏng. Kết quả vẫn là không đạt nên không ai bị báo xanh nhầm.
  Căn cứ: Chỉ mất thông tin chẩn đoán trong tình huống hiếm, không cho qua nhầm, và sửa sau rẻ.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: low
  Đề xuất: known-limits

- **Mốc chi phí Trợ lý kho (E8) tính mọi token vào theo giá đầy đủ, bỏ qua cacheReadTokens, nên mốc bị thổi lên khoảng 2,3 lần (r1 · tệp đã đổi)**
  Người dùng thấy gì: Con số «rẻ hơn Trợ lý kho cũ 96,4%» sẽ lên thẻ Cổng Giá trị bị cao hơn thực tế; tính lại cho đúng thì khoảng 91,7%. Kết luận «rẻ hơn rõ rệt» vẫn đúng, nhưng người ký sẽ đọc một con số đẹp hơn sự thật.
  Căn cứ: Hậu quả nhẹ vì kết luận không đổi và không mất dữ liệu; chỉ cần ghi chú con số là cận trên, sửa sau cũng rẻ.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4, đối chứng dương không ghim thông điệp: «re hon tro-ly-kho» là chuỗi con của «khong re hon tro-ly-kho», nên chiều đối chứng E8 xanh dù kết luận là gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này Trợ lý kho hoá ra không rẻ hơn, bài tự kiểm của bộ so vẫn báo xanh, nên có thể không phát hiện ra bộ so đã đọc sai. Với số liệu hiện tại thì kết quả hiển thị vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng cuối và kết quả hiện tại đúng; đây chỉ là lưới an toàn của phép đo yếu đi, sửa lúc nào cũng được.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/so-mh2.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3, chỉ kiểm tập modelId mà bỏ quan hệ phiên: E4 không buộc sessionId của sự kiện chọn model vào phiên con agent_builder của lượt (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu có người ghép nhầm tệp bằng chứng của một phiên khác vào, bộ so vẫn cho qua. Bằng chứng đang nộp thì đúng nên người dùng không thấy gì khác.
  Căn cứ: Rủi ro chỉ xảy ra khi có thao tác nhầm hiếm gặp, bằng chứng hiện tại đã đúng, và có thể bổ sung kiểm tra sau mà không ảnh hưởng ai.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

