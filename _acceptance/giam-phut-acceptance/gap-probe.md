---
slug: giam-phut-acceptance
at: 2026-10-09T16:27:06Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | E2 so đa tập mọi lệnh run, mà gộp job phải bỏ bước bun install trùng | Làm đúng thiết kế thì E2 đỏ «mất lệnh bun install»; lối xanh duy nhất là giữ bước cài trùng | Hai lớp lệnh viết trước: KIEM so đa tập, CHUAN BI so tập | fixed: E2 viết lại hai lớp, thêm chiều đỏ nhân đôi luật kho |
| P1 | evals, contract | Lời hứa cho push chỉ có điều kiện âm; không đọc khối on:; push release không có ngữ cảnh | Xoá push khỏi on: thì E1, E2, E3 vẫn xanh | E2 (a) on: bằng merge-base; (c) push onehub và release bằng đúng đa tập lệnh kiểm của các job giữ | fixed: E2 (a) và (c), chiều đỏ xoá push |
| P1 | design, contract | Gộp job mất tên check luật kho và điều phối; chưa kiểm check bắt buộc của onehub | Ruleset bắt buộc «luật kho» làm mọi PR kẹt ở Waiting for status | gh api rules và protection; tập bắt buộc nằm trong tên job HEAD | fixed: đo 09/10 onehub không có rules, Branch not protected; thêm AC-7, E5; grep scripts và .githooks không trúng tên cũ |
| P1 | design, contract | Giả định cây sau gộp trùng cây đầu PR chưa đo | Hai PR gộp sát nhau, lỗi dựng nằm im trên onehub vì push không còn build | So tree của commit gộp với tree đầu PR 7 ngày | human-gate1: đo 09/10 26/107 commit gộp lệch cây; push onehub đỏ 7 lần trong 10 ngày, 5 lần ở lệnh dựng. Máy đề xuất giữ build khi push, ngưỡng push nâng từ 4 lên 8 — anh chốt ở Cổng 1 |
| P2 | evals | E4 tính lượt bị huỷ vào trung vị PR | Nhiều lượt huỷ ở phút 1–3 kéo trung vị xuống, ngưỡng SỐNG nhờ phép huỷ | Tách lượt cancelled khỏi trung vị, đếm riêng | fixed: E4 tách lượt huỷ, chiều đỏ 5 lượt 11 phút + 6 lượt huỷ |
