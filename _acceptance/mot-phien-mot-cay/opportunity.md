---
schema_version: 1
slug: mot-phien-mot-cay
feature: Mỗi phiên làm việc đứng một cây riêng, để hai phiên thôi đè lên nhau
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Người đau là chính anh, ở khâu chạy nhiều phiên cùng lúc trên một kho.

Hôm nay 2026-09-01 có ba vết, cùng một nguyên nhân:

- Lúc 07:21:00 một tiến trình ngoài phiên này gỡ một khoá trong cấu hình cổng
  nghiệm thu. Phiên đang làm không hay biết, và phát hiện ra sau 40 giây chỉ vì
  tình cờ chạy lại một phép đo.
- Commit `602a87d` gộp việc vẽ bản đồ của phiên này vào commit của phiên kia.
  Thông điệp commit không nói ai làm phần nào.
- Phiên kia trả lời anh rằng khoá đó "chưa từng xuất hiện ở bất kỳ commit nào",
  rồi gỡ chính khoá đó đi. Hai câu không thể cùng đúng. Nó tra bằng đường dẫn
  khoá có dấu chấm, thứ không bao giờ nằm trong một file YAML lồng nhau, nên
  phép tra trả về rỗng cho mọi khoá — có hay không cũng vậy.

Vết thứ ba là cái đắt nhất: một phiên tự tin sai không chỉ làm hỏng việc của
nó, nó còn nói cho anh một câu sai để anh quyết theo.

Kho đã có sẵn chỗ cho lối thoát: `.gitignore` dòng 41 chừa `.claude/worktrees/`.
Cổng nghiệm thu cũng đã chứng minh chạy được trong cây phụ — bộ răng T1 hôm nay
dựng một cây phụ rồi chạy nguyên lưới tiền-merge trong đó.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Hai phiên hôm nay thật sự đứng chung một cây, không phải hai bản sao | Cả cơ hội này vô nghĩa — vấn đề nằm chỗ khác | `git worktree list` trong lúc hai phiên cùng chạy | Đã thử — chỉ một cây, `4463d5a [onehub]` |
| 2 | Cổng nghiệm thu chạy đủ trong cây phụ, không cần cây chính | Tách cây làm gãy cổng, phải bỏ hướng này | Chạy `pre-merge-check` trong cây phụ | Đã thử — bộ răng T1 làm đúng việc đó, xanh |
| 3 | Va chạm sẽ lặp lại, không phải xui một lần | Không đáng dựng gì, chỉ cần nhắc nhau | Đếm số lần trong hai tuần tới | Chưa thử |
| 4 | Người vận hành chịu được phí mở cây phụ mỗi phiên | Nghi thức đúng nhưng không ai theo, thành luật chết | Đo số giây từ lúc mở phiên tới lúc gõ được lệnh đầu | Chưa thử |
| 5 | Tách cây không làm hỏng thứ nằm ngoài git — `.env`, `node_modules`, cache dựng | Mỗi cây phụ tốn một lần cài đặt, phí vượt lợi | Mở một cây phụ rồi chạy thử một lệnh cần `.env` | Chưa thử |

Giả định 5 là cái tôi nghi nhất. Kho này để đúng một `.env` ở gốc, và cây phụ
không có nó.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Sau khi có nghi thức một-phiên-một-cây, còn phiên nào ghi đè lên việc của phiên khác nữa không?
- Kết quả nào là SỐNG: [đề xuất] Trong bốn tuần chạy nhiều phiên, không lần nào một phiên sửa file mà phiên khác đang sửa, và không commit nào gộp việc của hai phiên.
- Kết quả nào là CHẾT: [đề xuất] Vẫn còn va chạm, hoặc nghi thức bị bỏ qua quá một nửa số phiên vì mở cây phụ quá phiền.
- Timebox: [đề xuất] Bốn giờ dựng. Quá bốn giờ nghĩa là đang xây sản phẩm, không phải đang thử một ý.

## Kết quả prototype

Chưa dựng gì. Buổi này chỉ mở ô.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Nếp cây phụ của bộ công cụ phiên | `.gitignore` dòng 41 và cấu hình `worktree` trong `.claude/settings.json` | triết-lý/logic | có | — |
| Cách dựng cây phụ đã chạy thật | `_acceptance/sua-test-do-thu-tu-nap/rang-t1-escape.sh` dòng 12 | triết-lý/logic | có | — |

Không có vật liệu hình thái nào. Vòng này không chạm giao diện.

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Số lần một phiên ghi đè việc của phiên khác, đếm theo tuần.
- Số commit gộp việc của hai phiên, đếm theo tuần.
- Số giây từ lúc mở phiên tới lúc gõ được lệnh đầu tiên trong cây riêng.

## Out of scope từ khám phá

- Không khoá kho lại để chỉ một phiên chạy được. Chạy nhiều phiên là thứ anh muốn giữ, không phải thứ cần bỏ.
- Không sửa hai commit đã đẩy mang đuôi đồng-tác-giả. Viết lại lịch sử đã đẩy là việc của người, và nó là hệ quả chứ không phải nguyên nhân.
- Không dựng khoá liên-tiến-trình trên từng file. Đắt, và nó chữa triệu chứng chứ không chữa việc hai phiên cùng đứng một chỗ.
- Không đổi cách bộ công cụ phiên chạy nền. Cơ hội này nói về nếp làm việc của người, không về cấu hình của công cụ.
