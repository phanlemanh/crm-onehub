# Review findings: dieu-phoi-hai-tang (round 3)

## Trong hợp đồng

- **Two viec-phu requests that arrive in the same tick get merged into each other, so neither reaches the supervisor**
  file: scripts/dieu-phoi/yeu-cau.mjs:51
  severity: high
  AC: AC-9
  source: bugs
  detail: This comes from the HEAD fix (phat-lich.mjs:135 now builds yeuCauGanDay with `id: y._ten` for every request less than 24 h old). The candidate list holds every pending request, including ones not judged yet. The time check `luc - Date.parse(c.luc) < MOT_NGAY_MS` also passes when c is newer than yc, because the difference is negative. So when A and B both land in yeu-cau/ before one tick (same kho, same normalized tieu_de or a shared tep), A matches B and B matches A. Both get ket_qua 'gop' with boi 'may', tra-loi/ is written for both, and no can_phan event is emitted. The side task disappears with nobody escalated. I reproduced it: calling xetYeuCau(A, {yeuCauGanDay:[A,B]}) returns {ket_qua:'gop', voi:'P2-1'}, and xetYeuCau(B, …) returns {ket_qua:'gop', voi:'P1-1'}. Fix: only merge into a request that is older (Date.parse(c.luc) < luc, with the id as tiebreak) or into one that has already been processed (has a tra-loi entry or is in daBao).
  rationale: AC-9(a) hứa viec-phu trùng thì gop với voi là id cũ; hai yêu cầu cùng nhịp gộp vào nhau (voi trỏ tới yêu cầu mới hơn) và không sinh can_phan, nên làm AC-9 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **nhanhMo turns gh/git failures into an empty map, so the machine approves cham-tep requests**
  Người dùng thấy gì: Khi công cụ kiểm tra nhánh đang mở bị lỗi (mất mạng, hết đăng nhập, cấu hình nhánh chính sai), hệ thống vẫn tự duyệt yêu cầu sửa tệp mà không báo ai. Hai phiên có thể cùng sửa một tệp và đụng nhau về sau.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: high
  Đề xuất: new-contract

- **tienDoCua cannot tell a missing ref from a missing contract, so dependent rows can wait forever with no event**
  Người dùng thấy gì: Nếu tên nhánh chính trong cấu hình đặt sai, các việc phụ thuộc việc khác sẽ chờ mãi mà không ai được báo. Người giám sát chỉ thấy hàng không nhúc nhích.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: known-limits

- **The new test suite is outside the gate: pre-push and CI never run test:dieu-phoi**
  Người dùng thấy gì: Bộ kiểm tra của công cụ điều phối chỉ chạy khi có người gọi tay. Một lỗi mới trong các hook chạy ở mọi phiên vẫn có thể qua cổng đẩy và CI mà không ai thấy.
  file: `package.json`
  severity: medium
  Đề xuất: new-contract

- **The dieu-phoi config files are read with no shape check, even though this round added boundary checks for xin/ and yeu-cau/**
  Người dùng thấy gì: Nếu người giám sát sửa tay tệp cấu hình và thiếu một khoá, bộ phát lịch có thể cấp khoá rồi lỗi, lặp lại mỗi phút mà chỉ báo lỗi chung chung. Phiên thợ có thể bị cấp lượt rồi thu lại liên tục.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: low
  Đề xuất: known-limits

- **hook-nhip and hook-cho-nguoi swallow errors with an empty catch even when a run is active**
  Người dùng thấy gì: Khi hook báo nhịp của một phiên thợ bị lỗi, không ai biết vì sao. Rồi lượt của thợ bị thu hồi vì nhịp cũ mà không để lại dấu vết lý do.
  file: `scripts/dieu-phoi/hook-nhip.mjs`
  severity: low
  Đề xuất: known-limits

- **phat-lich hard-codes the threshold '60″' next to the constant NHIP.khoaTrongMs**
  Người dùng thấy gì: Nếu ai đổi thời gian chờ cho khoá trống, câu giải thích hiển thị cho người giám sát vẫn ghi con số cũ. Chỉ gây hiểu nhầm nhẹ, không ảnh hưởng việc cấp lượt.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: low
  Đề xuất: known-limits

- **scripts/dieu-phoi does not follow the repo's Biome formatting (tabs, double quotes, sorted imports)**
  Người dùng thấy gì: Mã của công cụ điều phối trình bày khác quy ước chung của kho (thụt lề, nháy). Không đổi hành vi nào, chỉ làm mã nhìn lệch.
  file: `scripts/dieu-phoi/lich.mjs`
  severity: low
  Đề xuất: wont-fix

- **Open-branch check in cham-tep fails open: a gh/git failure, a branch not fetched yet, or more than 30 PRs all lead to machine approval**
  Người dùng thấy gì: Khi chưa kiểm tra được nhánh nào đang mở (lỗi mạng, nhánh mới chưa tải về, hơn 30 PR), hệ thống vẫn tự duyệt yêu cầu sửa tệp. Hai phiên có thể sửa trùng một tệp mà không ai được báo.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: high
  Đề xuất: new-contract

- **The «cần người» event repeats on every 0.1 GB change in the largest process's RSS**
  Người dùng thấy gì: Khi một tiến trình ngốn bộ nhớ cứ dao động, người giám sát bị báo lại liên tục, mỗi lần chỉ khác vài chục MB. Thông báo ồn làm người đọc dễ bỏ qua cảnh báo thật.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **A dangling dieu-phoi-hien-tai symlink blocks both `mo` and `dong` with confusing errors**
  Người dùng thấy gì: Nếu thư mục của đợt bị xoá tay, không thể mở đợt mới cũng không đóng được đợt cũ. Người dùng phải tự xoá liên kết thừa mới làm tiếp được.
  file: `scripts/dieu-phoi/dieu-phoi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ca 'ba ca đỏ' của yeu-cau.test.mjs vẫn khớp cả câu DUYỆT, mà E13 vẫn dẫn nó làm bằng chứng**
  Người dùng thấy gì: Một phép kiểm tra cũ vẫn xanh dù luật bảo vệ tệp bị gỡ, nhưng luật đó đã có phép kiểm tra đúng ở chỗ khác. Hành vi cho người dùng không sai.
  file: `scripts/dieu-phoi/test/yeu-cau.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assert âm tính tự đúng, không chạy luật cũ): nửa 'luật cũ không cấp ai' ở lich.test.mjs vẫn là hằng đúng, mà E3 vẫn ghi là đã đo**
  Người dùng thấy gì: Một phép kiểm tra so sánh với luật cũ luôn xanh vì không thật sự chạy luật cũ. Việc cấp lượt thực tế của công cụ vẫn được kiểm đúng ở chỗ khác.
  file: `scripts/dieu-phoi/test/lich.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
