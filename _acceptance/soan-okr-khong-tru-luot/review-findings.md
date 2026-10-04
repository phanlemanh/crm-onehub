# Review findings: soan-okr-khong-tru-luot (round 1)

## Trong hợp đồng

- **Shape 5 (claims the gate-code table is pulled from CUA_OKR.loi at runtime but only lists point cases): soan-okr-ly-do-loi.spec.ts never enumerates CUA_OKR.loi**
  file: `apps/app/test/soan-okr-ly-do-loi.spec.ts:46`
  severity: low
  AC: AC-7
  source: measurement
  detail: E7 states that the pre-written table 'pulls gate codes from CUA_OKR.loi and CUA_OKR.trangThaiTuChoiLuot at runtime'. Only trangThaiTuChoiLuot is actually expanded at runtime (Object.entries at line 116). The CUA_OKR.loi codes are typed in by hand, row by row, through haiChieu and the individual rows (11 of 16 keys). The completeness check at lines 148-159 compares only the set of OUTPUT codes (MA_LY_DO_HONG) and never the set of INPUT codes. Four codes the route can actually return go through lyDoHong without any row: thieuCuoc (400), duongKhongPhucVu (404), cuocKhongThuocBan (403) and phienKhongThuocCuoc (403). They fall through to maTheoStatus → 'tro-ly-tu-choi' with no pinned assertion. A new code added to CUA_OKR.loi would not add a row and would not turn anything red. The sweep should iterate Object.values(CUA_OKR.loi), with a pre-written expected result for each code.
  lý do vào hợp đồng: AC-7 đòi bảng viết trước gồm mọi lỗi của phiên soạn, và mục Coverage ghi thước CE đọc tập mã từ CUA_OKR.loi lúc chạy, không chép tay; bài hiện bỏ sót bốn mã nên AC-7 không được chứng minh đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 30-second refund timer also cuts the NDJSON stream route**
  Người dùng thấy gì: Khi Kara soạn một lượt kéo dài hơn 30 giây, kết nối nhận câu trả lời có thể bị cắt giữa chừng và màn soạn báo mất mạng dù mạng vẫn tốt, trong khi lượt đó vẫn bị tính.
  file: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts`
  severity: high
  Đề xuất: new-contract

- **The 500 server-error cutoff is duplicated inline instead of living in CUA_OKR**
  Người dùng thấy gì: Người dùng không thấy gì khác đi; chỉ là sau này nếu ngưỡng phân biệt lỗi máy chủ đổi ở một nơi mà quên nơi kia thì thông báo lỗi có thể lệch nhau.
  file: `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts`
  severity: low
  Đề xuất: known-limits

- **The 30 s gateway timeout also cuts every NDJSON stream, not just a POST that hangs**
  Người dùng thấy gì: Kara đang trả lời dở một lượt soạn dài thì cuộc trò chuyện có thể đứt đúng ở giây thứ 30, người dùng thấy báo mất mạng giữa chừng và lượt đó không được hoàn.
  file: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts`
  severity: high
  Đề xuất: new-contract

- **A failed turn (session.failed) is labelled network lost instead of stopped part way**
  Người dùng thấy gì: Khi Kara hỏng giữa chừng vì lỗi bên trong (ví dụ hết ngân sách mô hình), màn soạn bảo người dùng kiểm tra mạng dù mạng không có vấn đề, nên họ đi sửa nhầm chỗ.
  file: `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts`
  severity: medium
  Đề xuất: new-contract

- **After one retry, every later send flashes the error banner with a stale reason**
  Người dùng thấy gì: Sau khi đã bấm Thử lại một lần, mỗi lần gửi tin bình thường về sau có thể làm hiện lại khung báo lỗi cũ trong chốc lát, khiến người dùng tưởng vừa có lỗi mới.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 5 (claims a full-matrix sweep but the floor counts itself): the floor in soan-okr-thu-lai.dom.tsx can never fail**
  Người dùng thấy gì: Sản phẩm chạy đúng, nhưng bài kiểm tự động sẽ không báo đỏ nếu sau này ai đó lỡ xoá bớt một tình huống thử lại, nên việc lỡ tay đó có thể lọt qua mà không ai biết.
  file: `apps/app/test/soan-okr-thu-lai.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3/4 (the 'different from the sentence before clicking' relation is checked as an inequality on a container that always differs): the moTa() check in kiemCau is vacuous**
  Người dùng thấy gì: Nếu màn soạn lỡ hiện cả câu lỗi chung lẫn câu lý do cụ thể cạnh nhau, bài kiểm tự động vẫn báo xanh, nên lỗi hiển thị kiểu đó có thể không bị bắt.
  file: `apps/app/test/soan-okr-thu-lai.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
