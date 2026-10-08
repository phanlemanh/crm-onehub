# Review findings: deal-va (round 1)

## Trong hợp đồng

- **Hình dạng 5 (thiếu ma trận toàn phần): AC-6 hứa translate="no" cho cả hai ca rơi về chữ, bài DOM chỉ kiểm ở hàng 5, không kiểm ở hàng 6**
  AC: AC-6
  file:line: `apps/app/test/deal-va-cham-mau.dom.tsx:228`
  severity: low
  source: measurement
  detail: AC-6 gộp hai ca vào cùng một kết luận: «When không có stageId và stage là một nhãn, HOẶC stageId không có trong danh sách giai đoạn, Then ô hiện đúng chữ stage, không chấm, có translate="no"». Như vậy là hai ca nhân ba thuộc tính, tức 6 khẳng định. Bài kiểm có đủ ba khẳng định cho hàng 5 (`o[4]?.tone` null, `o[4]?.chu`, `o[4]?.dich` "no"). Hàng 6 (stageId "gd-da-cat") chỉ có `expect(o[5]?.tone, "ma la van co cham").toBe(null)` và `expect(o[5]?.chu).toBe("Cũ")`, thiếu `expect(o[5]?.dich).toBe("no")`. Ma trận E6 dòng 6 trong evals.yaml cũng bỏ thuộc tính này. Vì vậy số khẳng định không bằng số phần tử của ma trận AC: nếu nhánh stageId-lạ hiện chữ mà không có translate="no", bài kiểm vẫn xanh.
  lý do xếp trong hợp đồng: AC-6 nêu rõ cả hai ca (không có stageId với nhãn, và stageId lạ) đều phải có translate="no"; bài DOM không khẳng định điều đó ở ca stageId lạ nên một vế điều kiện của AC-6 không được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Telemetry code in production now branches on GIAI_DOAN_GOC, which docs/api.md limits to seed and tests**
  Người dùng thấy gì: Số liệu ẩn danh theo giai đoạn nay dựa vào danh sách bảy giai đoạn gốc, trong khi tài liệu kỹ thuật vẫn nói danh sách đó chỉ dành cho dữ liệu mẫu và kiểm thử, và công cụ canh luật không báo gì. Người dùng không thấy khác biệt, nhưng tài liệu và công cụ canh có thể khiến người sửa sau này hiểu sai.
  file: `packages/telemetry/src/allowlist.ts`
  severity: medium
  Đề xuất: known-limits

- **Agent test imports app source to check a payload whose schema is duplicated by hand across two apps**
  Người dùng thấy gì: Hình dạng dữ liệu danh sách thoả thuận Kara trả vẫn được viết tay ở hai nơi, nên sau này sửa một nơi mà quên nơi kia thì bảng thoả thuận có thể hiện thiếu hoặc sai thông tin. Hiện tại hai nơi vẫn khớp nhau.
  file: `apps/agent/test/giai-doan-agent.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **khong-xoa-expect.mjs only sees deleted lines that contain `expect(`, so a changed matcher on a multi-line expect gets through**
  Người dùng thấy gì: Bước canh rằng các bài kiểm cũ không bị sửa lén có thể bỏ lọt một kiểu sửa, nên có thể báo xanh dù một bài kiểm cũ đã bị làm yếu đi. Chưa có bằng chứng bài kiểm nào thực sự bị sửa như vậy.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **E7 says `--tu-thu` exits 1 when it catches the fake diff, but the script exits 0**
  Người dùng thấy gì: Mô tả của một bước kiểm nói sai mã kết quả khi bước tự thử bắt được lỗi giả. Sản phẩm không bị ảnh hưởng, chỉ có nguy cơ người đọc sau này hiểu nhầm và sửa sai bước kiểm.
  file: `_acceptance/deal-va/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): rang khong-xoa-expect hứa «không expect( sẵn có nào bị xoá hay sửa» nhưng chỉ bắt dòng xoá có chứa chữ `expect(`**
  Người dùng thấy gì: Bước canh các bài kiểm cũ chỉ bắt được một phần các kiểu sửa lén, nên lời hứa «không bài kiểm cũ nào bị làm yếu đi» chưa được bảo đảm trọn vẹn. Chưa có bài kiểm nào được chỉ ra là đã bị sửa.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
