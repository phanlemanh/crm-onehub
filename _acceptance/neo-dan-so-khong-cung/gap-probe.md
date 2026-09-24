---
slug: neo-dan-so-khong-cung
at: 2026-09-24T01:17:03Z
verdict: findings
p0: 2
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Không nói phía git lọc LOAI_TRU bằng hằng dùng chung hay độc lập | Dùng chung LOAI_TRU thì tiêm «lib» làm cả hai phía cùng mất tệp, quan hệ vẫn đúng, E3 không đỏ | Nói rõ nguồn lọc của phía git; E3 khẳng định số tệp bộ duyệt giảm | fixed: phía git KHÔNG lọc LOAI_TRU, chỉ lọc đuôi và bốn gốc (đo 24/09: 0 tệp theo dõi trong thư mục bị loại, git 478 = bộ duyệt 478); E3 thêm khẳng định số tệp giảm |
| P0 | contract | Không phủ ca git rỗng hoặc gốc git là kho khác | Bản sao không git init nằm trong thư mục bị ignore của kho cha: ls-files rỗng, quan hệ đúng trống rỗng, xanh im | Toplevel khác gốc hoặc git rỗng khi bộ duyệt có tệp thì mã 2; ca E5(c) | fixed: AC-5 và design thêm hai điều kiện mã 2; E5 thêm ca (c) trong .acceptance-runs/, ca (a) đặt ở thư mục tạm hệ thống và kiểm rev-parse thất bại trước |
| P1 | contract | Mục tiêu «hồ sơ gốc hết bị chặn» và dòng revisit không có AC | Sửa lai-ra-man.mjs làm hồ sơ gốc hoá cũ; eval đã ký có thể đỏ; không có con trỏ revisit | AC mới: làn hồ sơ gốc xanh ở HEAD + dòng revisit hợp lệ | fixed: thêm AC-8 và E8 (ndk_ho_so_goc) với đối chứng âm cho con trỏ |
| P2 | evals | E1 thiếu đối chứng dương cho bản gốc và không ghim hai con số; vế bản gốc của E3 là khẳng định vắng mặt | Bản gốc đỏ sẵn vì lý do khác mà E1 vẫn xanh; vế E3 xanh bất kể | Bản gốc trên bản sao nguyên vẹn thoát 0; ghim đúng hai số; vế E3 thành khẳng định dương | fixed: E1 thêm đối chứng + ghim số; E3 đổi vế bản gốc thành thoát 1 với DO: neo file |
| P2 | evals | E4 không chứng bộ duyệt đã thấy tệp chưa theo dõi và không có chiều đỏ | Tệp ghi sai chỗ, bản sửa vẫn thoát 0 | Số tệp = nguyên vẹn + 1; chiều đỏ bản gốc | fixed: E4 khẳng định số tệp + 1 và bản gốc thoát 1 với DO: neo file |
