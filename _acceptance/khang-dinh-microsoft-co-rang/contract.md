---
schema_version: 1
feature: Cho khẳng định về đăng nhập Microsoft có răng, thay vì tự tính kỳ vọng từ chính môi trường nó đo
slug: khang-dinh-microsoft-co-rang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-01
veto_state: mo
veto_opened_at: 2026-09-01T02:04:58Z
---

# Acceptance Contract: khang-dinh-microsoft-co-rang

## Context

Trang đăng nhập hỏi máy chủ nó được phép mời người dùng vào bằng lối nào. Máy
chủ trả lời có Google không, có Microsoft không. Bài kiểm cho câu trả lời đó
hiện tự tính kỳ vọng phần Microsoft từ **chính hai biến môi trường mà máy chủ
đọc để trả lời**. Hai vế luôn bằng nhau, nên khẳng định đó không bao giờ đỏ
được — nó đọc như một cái khoá, thật ra là một cái vòng.

Vế Google thì có răng thật: bộ nạp trước đặt sẵn khoá giả, nên máy chủ phải
báo "có Google" mới xanh. Vòng này làm vế Microsoft đối xứng theo chiều ngược:
bộ nạp trước gỡ sạch hai biến Microsoft, nên máy chủ phải báo "không có
Microsoft" mới xanh. Một hàm, hai đầu vào khác nhau, hai câu trả lời khác nhau
— đó mới là đo.

Source input: prompt

## Criteria

- AC-1: Given máy người chạy có khai hai khoá Microsoft — ở shell hoặc trong `.env` gốc, When bộ kiểm `apps/api` chạy, Then cấu hình xác thực vẫn đọc ra "chưa khai Microsoft".
- AC-2: Given file `apps/api/test/auth.e2e.spec.ts`, When đọc nó, Then không còn chỗ nào đọc `process.env`; kỳ vọng là hằng số viết thẳng.
- AC-3: Given môi trường sạch, When chạy bài kiểm đăng nhập, Then máy chủ báo có Google và KHÔNG có Microsoft, và bài kiểm xanh.
- AC-4: Given một bộ nạp trước dựng sẵn CÓ khai hai khoá Microsoft, When chạy đúng bài kiểm đó với bộ nạp ấy, Then bài kiểm ĐỎ — đây là chiều đỏ chứng minh khẳng định có răng.
- AC-5: Given môi trường sạch không export gì từ `.env` gốc, When chạy toàn bộ bộ kiểm của `apps/api`, Then mọi bài xanh và số bài không nhỏ hơn 381.
- AC-6: Given cây làm việc, When chạy tác vụ lint và tác vụ kiểm kiểu, Then cả hai xanh.
- AC-7: Given bộ nạp trước dựng sẵn của chiều đỏ, When so nó với bộ nạp trước thật, Then chỉ đúng hai dòng khác nhau — đột biến tối thiểu, không lẫn thay đổi nào khác.

## Coverage

Hai trục. Không quét hình thái: không gian là một khẳng định trong một file,
đã đếm hết được.

- Trục chiều đo: chiều dương — khai khoá ở shell hay ở `.env` gốc thì vẫn phải báo không có (AC-1, AC-3) | chiều đỏ — bộ nạp trước khai khoá thì bài kiểm phải đỏ (AC-4) | chiều hình thức — kỳ vọng phải là hằng (AC-2), và đột biến phải tối thiểu (AC-7) [thước CE: bốn chân của bộ răng]
- Trục phạm vi ảnh hưởng: một bài kiểm (AC-3, AC-4) | cả bộ kiểm `apps/api` (AC-5) | cả cây (AC-6) [thước CE: số bài đếm được trong lượt chạy sạch]

## Out of scope

- Không cấp khoá Microsoft thật. Vòng này làm bài kiểm có răng, không bật thêm lối đăng nhập.
- Không đụng vế Google. Vế đó đã có răng từ vòng `sua-test-do-thu-tu-nap`.
- Không quét cả kho tìm những khẳng định tự-tính khác. Đây là một vòng một chỗ; quét rộng là việc riêng.
- Không đổi cách máy chủ quyết định có Microsoft hay không. Chỉ bài kiểm đổi.
- Không sửa bài kiểm phập phù của `apps/agent`. Nó vẫn nằm ngoài, như hai vòng trước.

## Notes

Hợp đồng này viết TRƯỚC khi sửa mã, khác hai vòng trước trong ngày. Bộ tiêu chí
vì thế không thể tự uốn theo thứ đã dựng.

Ràng buộc kỹ thuật đã kiểm trước khi viết: cấu hình xác thực chốt giá trị **một
lần lúc nạp module** (`packages/auth/src/env.ts`, `env` là hằng ở mức module).
Nên đổi biến giữa chừng bài kiểm không có tác dụng — chiều đỏ phải đi bằng một
bộ nạp trước khác, không bằng cách đặt biến trong thân bài.

Không bài kiểm nào khác trong `apps/api` đọc hai biến Microsoft từ môi trường;
chúng chỉ dùng hằng số. Gỡ hai biến trong bộ nạp trước vì thế không ảnh hưởng
bài nào khác.

**AC-1 bị viết lại sau vòng chấm 1.** Người chấm tìm ra một lỗ tôi không thấy,
và bản ghi cũ của AC-1 là một lời hứa sai.

Cách cũ `delete process.env[...]` KHÔNG giữ được. Bộ nạp `.env` gốc điền lại mọi
khoá đang `undefined`, mà xoá thì đúng là `undefined`. Tôi dựng một kho giả để
đo chứ không suy: khai khoá trong `.env` của kho giả, xoá biến, gọi bộ nạp —
biến trở lại với giá trị lấy từ file. Hôm nay bộ kiểm xanh chỉ vì hai dòng
Microsoft trong `.env` thật đang bị chú thích; ai bỏ chú thích là bài kiểm đỏ.

Nay bộ nạp trước đặt **chuỗi rỗng** thay vì xoá. Chuỗi rỗng không phải
`undefined` nên bộ nạp `.env` bỏ qua, và hàm đọc khoá của lớp xác thực coi
chuỗi rỗng là chưa khai. Chân `nguon-env` đo cả hai chiều: cách mới sống qua bộ
nạp, cách cũ bị điền lại.

**AC-7 là tiêu chí THÊM sau vòng chấm 1**, cũng từ phát hiện của người chấm: bộ
nạp dựng sẵn cũ khác bộ nạp thật ở hai chỗ, nên cái đỏ không quy được về một
nguyên nhân. Nay nó sinh ra từ chính bộ nạp thật bằng một phép thay, và bộ răng
đếm số dòng lệch, khác 2 là kêu.

**Vòng chấm 2 PASS nhưng bắt tiếp một chỗ mỏng, đã sửa trước vòng 3.** Chân
`nguon-env` cũ tự chép lại cơ chế — nó tự đặt chuỗi rỗng và tự mang một bản sao
của hàm đọc khoá, nên nó đo một bản mô phỏng chứ không đo sản phẩm. Quay bộ nạp
trước về cách xoá thì chân đó vẫn xanh.

Nay chân này chạy **chính bộ nạp trước thật** và chính bài kiểm thật, với một
`.env.local` dựng sẵn ở gốc kho khai hai khoá Microsoft — đúng ca đã suýt lọt.
Chiều đỏ là một đột biến tối thiểu đưa bộ nạp về cách xoá, lệch đúng một dòng.
Răng từ chối chạy nếu gốc kho đã có `.env.local`, để không bao giờ ghi đè file
của người, và xoá file dựng sẵn khi thoát.

**Vòng chấm 3 PASS, và người chấm PHÁ ĐƯỢC hai lời hứa an toàn của bộ răng.**
Ba chỗ vá dưới đây rơi vào SAU vòng 3, nên chúng chỉ có phép thử tấn công của
tôi, KHÔNG có một vòng chấm ngữ-cảnh-sạch nào phủ. Người ký cần biết đúng điều
đó.

- Lưới chặn ghi đè dùng `[ -e ]`, mà `[ -e ]` là sai với một liên kết hỏng. Người
  chấm dựng đúng ca đó: lưới cho qua, lệnh ghi đi theo liên kết và tạo ra file ở
  đầu kia. Nay lưới kiểm cả `[ -L ]`. Thử lại: thoát 2, liên kết còn nguyên,
  không file nào được tạo.
- Bẫy dọn khi thoát KHÔNG chạy với một cú giết cứng. Người chấm giết đúng lúc
  file dựng sẵn vừa sinh ra và nó ở lại gốc kho. Nó đo tiếp bán kính thiệt hại
  thay vì đoán: các chân đo vẫn an toàn, nhưng một tiến trình chạy không qua bộ
  nạp trước sẽ đọc nhầm hai khoá đó, và git bỏ qua file nên không ai thấy. Nay
  bộ răng quét dọn file này lúc khởi động, CHỈ khi nội dung khớp y nguyên fixture.
  Thử lại: file sót bị dọn, file `.env.local` của người thì còn nguyên.
- Lệnh dọn file đột biến quét toàn thư mục, nên hai lượt chấm chạy song song xoá
  của nhau. Nay chỉ dọn file cũ hơn 60 phút.
