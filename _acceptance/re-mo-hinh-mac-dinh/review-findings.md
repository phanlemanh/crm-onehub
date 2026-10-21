# Review findings: re-mo-hinh-mac-dinh (round 1)

## Trong hợp đồng

- **Hình dạng 1, đo chỉ dẫn thay vì đầu ra: E5 lấy «model Gateway trả cho phiên gốc Zalo» từ một lệnh gọi thăm dò đọc thẳng hằng DEFAULT_AGENT_MODEL, không từ phiên gốc Zalo thật**
  AC: AC-5
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts:386`
  severity: medium
  source: measurement
  detail: Dòng 385-391 của kiemE5 so `modelGocTu(traLoi)` với `ke.tac_nhan.model` và `modelKhoTu(traLoi)` với `kh.model`. Hai hàm này (do-kho.ts:26-29, regex DK.modelKho/DK.modelGoc) bóc chữ «model `X` (Gateway trả)» trong cham-bo-do-mau.md. Câu đó do _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:622 viết từ `quyet.modelIds`. Mà `modelIds` (cham-bo-do.ts:149-156) lại đến từ một lần `generateText({ prompt: "ok", maxOutputTokens: 1 })` riêng, gọi trên `createGateway()(DEFAULT_AGENT_MODEL.id)` cho vai gốc và trên `modelTaiLieu("hoi").model` cho vai kho. Lần thăm dò này đi vòng qua đường giải model của phiên gốc Zalo (modelChoPhienGoc → modelTheoVai("tro-ly") cùng ô Cài đặt): nó chỉ hỏi Gateway đúng cái id đã đặt trong code, nên kết quả chỉ lặp lại E1 chứ không đo đầu ra của phiên. Không có đối chứng nào khác: cả 553 dòng aichiphi.json và 106 dòng aichiphi-goc.json đều mang `modelId: null`, và E5 không đọc agentEvent của phiên Zalo như E4 đọc của phiên con agent_builder. Hệ quả: nếu phiên gốc Zalo thật chạy một model khác, E5 vẫn in «model goc zai/glm-5.3-flash». Chiều đỏ «doi model goc Zalo» (so-mh2.ts:449-465) cũng chỉ sửa chữ trong cham-bo-do-mau.md và tom-tat.json, nên không chứng minh được thước đọc đúng model thật.
  rationale: AC-5 đòi bằng chứng ghi «model Gateway trả cho phiên gốc Zalo» là model Tác nhân mới, nhưng con số này đến từ lệnh thăm dò riêng chứ không từ phiên Zalo thật, nên không chứng minh được điều AC-5 hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mốc chi phí Trợ lý kho (E8) tính mọi token vào theo giá đầy đủ, bỏ qua cacheReadTokens, nên mốc bị thổi lên khoảng 2,3 lần**
  Người dùng thấy gì: Con số «rẻ hơn Trợ lý kho cũ 96,4%» sẽ lên thẻ Cổng Giá trị bị cao hơn thực tế; tính lại cho đúng thì khoảng 91,7%. Kết luận «rẻ hơn rõ rệt» vẫn đúng, nhưng người ký sẽ đọc một con số đẹp hơn sự thật.
  Căn cứ: Hậu quả nhẹ vì kết luận không đổi và không mất dữ liệu; chỉ cần ghi chú con số là cận trên, sửa sau cũng rẻ.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4, đối chứng dương không ghim thông điệp: «re hon tro-ly-kho» là chuỗi con của «khong re hon tro-ly-kho», nên chiều đối chứng E8 xanh dù kết luận là gì**
  Người dùng thấy gì: Nếu sau này Trợ lý kho hoá ra không rẻ hơn, bài tự kiểm của bộ so vẫn báo xanh, nên có thể không phát hiện ra bộ so đã đọc sai. Với số liệu hiện tại thì kết quả hiển thị vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng cuối và kết quả hiện tại đúng; đây chỉ là lưới an toàn của phép đo yếu đi, sửa lúc nào cũng được.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/so-mh2.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3, chỉ kiểm tập modelId mà bỏ quan hệ phiên: E4 không buộc sessionId của sự kiện chọn model vào phiên con agent_builder của lượt**
  Người dùng thấy gì: Nếu có người ghép nhầm tệp bằng chứng của một phiên khác vào, bộ so vẫn cho qua. Bằng chứng đang nộp thì đúng nên người dùng không thấy gì khác.
  Căn cứ: Rủi ro chỉ xảy ra khi có thao tác nhầm hiếm gặp, bằng chứng hiện tại đã đúng, và có thể bổ sung kiểm tra sau mà không ảnh hưởng ai.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/kiem.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

