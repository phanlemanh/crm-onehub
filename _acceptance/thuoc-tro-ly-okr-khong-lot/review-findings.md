# Review findings: thuoc-tro-ly-okr-khong-lot (vòng 1)

## Trong hợp đồng

- **soDuGateway ép kiểu balance bằng Number() thay vì parse ở biên: balance null hoặc chuỗi rỗng thành số dư 0 và chặn oan**
  file: `_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs:116`
  severity: medium
  AC: AC-1
  source: conventions
  detail: Phản hồi của GET /v1/credits là dữ liệu ngoài, đi vào qua dòng `const so = Number((await r.json())?.balance); return Number.isFinite(so) ? { soDu: so } : { khongDoc: "balance khong phai so" };`. Vì Number(null) === 0, Number("") === 0 và Number(" ") === 0, một thân như {"balance": null} hay {"balance": ""} không bị coi là «balance khong phai so». Nó thành { soDu: 0 }, rồi chanSoDu trả về «so du AI Gateway 0 USD — nap tin dung truoc khi do», và do-tre.mjs cùng eval-gop-y.mjs thoát 2. AC-1 hứa ngược lại: balance không phải số thì in cảnh báo và đo tiếp. AGENTS.md («Parse at the boundary») đòi phản hồi API phải parse bằng Zod ngay lúc vào tiến trình, theo đúng khuôn thật đang lưu (credits-that.json cho thấy balance là chuỗi số thập phân). Script cùng khu là eval-tom-tat.mjs đã nạp zod qua createRequire, nên đã có mẫu để theo. Ma trận E1 chỉ thử 'khong-phai-so', không có ô null hay chuỗi rỗng, nên lỗi này lọt qua.
  lý do thuộc hợp đồng: AC-1 hứa balance không phải số thì chỉ cảnh báo và đo tiếp; null hoặc chuỗi rỗng không phải số nhưng bị đổi thành 0 và thoát 2, đúng điều AC-1 cấm.

- **soDuGateway ép kiểu bằng Number(): balance null hoặc rỗng thành 0 và bị chặn nhầm vì «hết tín dụng»**
  file: `_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs:117`
  severity: low
  AC: AC-1
  source: bugs
  detail: `const so = Number((await r.json())?.balance)`: Number(null), Number("") và Number(" ") đều ra 0. 0 là số hữu hạn nên qua được kiểm Number.isFinite, rồi chanSoDu chặn với câu 'so du AI Gateway 0 USD — nap tin dung truoc khi do'. AC-1 nói balance không phải số thì phải cảnh báo 'khong doc duoc so du AI Gateway (...) — van do' và đo tiếp. Vậy một phản hồi 200 có balance null hoặc rỗng (không đọc được số dư) sẽ dừng phép đo với lý do sai, thay vì cảnh báo rồi đo tiếp. Bài kiểm chỉ thử chuỗi 'khong-phai-so' (ra NaN), nên không bắt được trường hợp này. Cách sửa: chỉ nhận balance là number, hoặc chuỗi khớp một mẫu số, trước khi đổi sang số.
  lý do thuộc hợp đồng: cùng lỗi với mục trên: balance null hoặc rỗng không phải số, AC-1 yêu cầu cảnh báo và đo tiếp nhưng mã lại chặn với lý do hết số dư.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **hongHet nuốt lỗi đọc nhật ký tác tử và báo nhầm thành «không có dòng lỗi model»**
  Người dùng thấy gì: Khi tệp nhật ký của tác tử không đọc được, báo cáo đo độ trễ vẫn viết là nhật ký không có dòng lỗi model. Người đọc có thể hiểu nhầm nguyên nhân lượt hỏng, dù kết luận chung là phép đo không đo được vẫn đúng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đổi taoKho/xoaKho dùng chung cũng đổi kho của tro-ly-okr-tom-tat (E17), nhưng hợp đồng và Hỏi-3 chỉ kể bo-ca-mau-quy-4**
  Người dùng thấy gì: Thay đổi này cũng làm phép đo tóm tắt OKR dùng kho riêng theo từng cây, nhưng phần mô tả đã trình chủ kho chỉ nhắc một hồ sơ khác. Không gây lỗi cho người dùng, chỉ là mô tả phạm vi chưa đầy đủ.
  file: `_acceptance/tro-ly-okr-tom-tat/rang/eval-tom-tat.mjs`
  severity: low
  Đề xuất: known-limits

- **hongHet bỏ qua lỗi đọc nhật ký và báo «không có dòng lỗi model» như thể đã đọc được**
  Người dùng thấy gì: Nếu không mở được nhật ký tác tử, báo cáo vẫn nói là không có dòng lỗi model thay vì nói là không đọc được nhật ký. Người xem có thể tìm nguyên nhân sai hướng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» thay cho quan hệ): E3 kiểm dòng lỗi model ở bất kỳ đâu trong đầu ra, không kiểm nó nằm trong câu KHONG DO DUOC**
  Người dùng thấy gì: Bài kiểm tra bản sửa có thể báo đạt trong một tình huống hiếm khi dòng lỗi model xuất hiện ở chỗ khác với câu kết luận. Người dùng không bị ảnh hưởng, chỉ là độ chặt của bài kiểm.
  file: `_acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
