---
slug: auto-pr-thoi-do-o-ban-re
at: 2026-09-07T02:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — auto-pr-thoi-do-o-ban-re

Một phiên tươi, chỉ đọc năm tệp: design doc · contract · evals · sổ quyết định · bài
học từ feature trước (claim-scan, 5.5 KB). Không đọc mã kho, không chạy lệnh.

Cả năm finding đã sửa trong artifact và trong chân đo trước khi trình Cổng 1. Không
chạy lại phản biện (one-pass).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract + evals | Trục B khai bốn hình dạng khoá nhưng E2 chỉ viết ba lượt (1 xanh + 2 đỏ). Ô «nhiều dòng `if`» không lượt nào assert, trong khi Coverage khai bốn giá trị đã phủ — số học không khớp | Một lượt kéo bản mới của hãng thêm dòng `if` thứ hai ở tầng job. Chân thấy dòng đúng chuỗi mong đợi và trả mã 0; điều kiện chồng nhau khiến không đọc được bằng mắt job chạy ở đâu — đúng thứ AC-2 tự nhận là chặn. Người ở Cổng 1 duyệt vì tin ô Coverage nói bốn giá trị đã có lưới, trong khi lưới chỉ ba mắt. Cùng lớp ma-trận-thiếu-dòng của [chan-lai-component-ra-man#F1] | E2 thêm lượt đỏ thứ ba: bản sao có hai dòng `if` → mã 1, in ra CẢ HAI dòng. Coverage sửa lại đúng số lượt đã chạy | fixed: lượt 4 của E2 đã chạy, in ra cả hai dòng; Coverage nay ghi «bốn giá trị, bốn lượt» |
| P1 | evals | E1 chiều xanh dùng `--sha` mặc định là HEAD — mốc di động — trong khi chiều đỏ ghim cứng `5ac85ef`. Design doc ghim commit xanh là `c042478` nhưng evals không ghim | Ở S4, HEAD là commit hồ sơ mới, chưa đẩy hoặc workflow chưa chạy xong, nên chân trả mã 2 và cả cổng bằng chứng đứng vì một lý do không liên quan. Ca ngược còn tệ hơn: HEAD đã đẩy và xanh, nhưng số đọc được không phải số hồ sơ ghi, người ký không đối chiếu được | E1 ghim chiều xanh bằng sha nguyên văn, đối xứng chiều đỏ, cộng assert sha ấy là tổ tiên của HEAD và tệp tại đó có dòng `if` | fixed: mặc định `--sha` nay là `c042478`; thêm hai vế đối chiếu tổ tiên và tệp-không-đổi |
| P1 | evals | Vế «kho tại chỗ khác kho hãng» của AC-2 là vế tự chặn màu xanh dối, nhưng cả hai chiều đỏ đều đột biến TỆP workflow, không chiều nào đột biến remote. Assertion âm tính không có đối chứng | Nếu phép so là so nguyên URL remote với slug `trycompai/crm` thì hai vế không bao giờ bằng nhau kể cả khi chạy TRONG kho hãng — vế guard thành hằng đúng, xanh vĩnh viễn, sinh ra đúng màu xanh dối nó sinh ra để chặn. Không lượt nào chạy nên không ai biết. Cùng lớp đối-chứng-tự-so-với-chính-mình của [chan-lai-component-ra-man#F2] | E2 thêm lượt bơm remote giả `--remote https://github.com/trycompai/crm.git` → mã 1. `expected` ghim rõ phép so là rút `owner/repo` rồi so | fixed: thêm tham số `--remote`, lượt 5 của E2 đã chạy và đỏ. Mã thật vốn đã rút `owner/repo` — phê bình đúng ở tầng artifact: `expected` không khai điều đó và chiều đỏ chưa từng chạy |
| P1 | contract + evals | AC-3 và E3 đo một CON SỐ (+1/−0) trong khi lời hứa là một QUAN HỆ: dòng thêm phải chính là dòng `if` ở tầng job. Tiền đề «origin/release khớp upstream/HEAD» nằm ở văn xuôi, không assert nào giữ | Một lượt kéo bản mới đặt lên `origin/release` một auto-pr.yml khác. Nền so đổi, E3 vẫn chỉ đếm: một dòng trống, một dòng `env`, hay `if` đặt nhầm ở tầng step đều cho +1/−0. Chân xanh, hồ sơ khai «lệch đúng một dòng», lệch thật với hãng đã khác. Người ký mua lời hứa phí-bản-rẽ bằng con số không nói về nội dung | E3 assert nội dung dòng thêm bằng đúng dòng khoá và nằm ở tầng job (in độ thụt), và `git diff upstream/HEAD` cũng +1/−0 — tiền đề thành phép đo | fixed: chân nay so nguyên văn dòng thêm kèm bốn dấu cách, và đối chiếu `upstream/HEAD` khi remote ấy giải được. Chiều đỏ dòng-trống đã chạy |
| P2 | contract | Trục C khai ba giá trị, giá trị ba là «ngoài `.github/`», Coverage khai «cả ba phủ bởi AC-3 + AC-4». Nhưng AC-4 tự giới hạn ở «tệp đổi DƯỚI `.github/`», AC-3 chỉ nhìn một tệp. Không AC nào nhìn ra ngoài `.github/` | Vòng sửa lây một tệp ngoài `.github/` — một dòng trong `.env.example` hay một tệp dưới `packages/` — mọi chân vẫn xanh vì không chân nào nhìn tới đó, và AC-5 chỉ nói bốn lệnh chứng mã 0. Người ở Cổng 1 đọc Coverage tưởng phạm vi có lưới ba tầng, ký cho một vòng đã rò phạm vi | AC-4 đổi từ «tệp dưới `.github/`» sang toàn bộ diff so với `origin/onehub`, đối chiếu danh sách cho phép ghim tên; tên ngoài danh sách thì đỏ và in ra | fixed: AC-4 nay quét toàn bộ diff theo danh sách ghim tên. Chiều đỏ đã chạy: nền `origin/release` → 897 tệp ngoài danh sách |

## Ghi chú

Bốn finding đúng hoàn toàn ở cả tầng artifact lẫn tầng mã. Finding thứ ba (hằng đúng)
đúng ở tầng artifact: mã thật vốn đã rút `owner/repo` từ URL nên phép so không phải
hằng đúng — nhưng `expected` không khai điều đó, và vế ấy chưa từng có một lượt đỏ, nên
phê bình vẫn đứng và bản sửa vẫn cần. Bên phản biện không được đọc mã theo đúng thiết
kế; nó phán artifact, và artifact thì thiếu thật.
