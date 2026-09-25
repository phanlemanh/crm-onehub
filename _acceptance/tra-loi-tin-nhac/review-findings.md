
# Review Findings: tra-loi-tin-nhac (round 1)

## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình): ho-so-cham.mjs thoát 0 khi làn đỏ nhưng không rút ra được eval đỏ nào**
  file: `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs:132`
  severity: medium
  AC: AC-9
  Nếu `lan.status !== 0` và các suite đều 0, script lọc các dòng khớp `DONG = /^\[lane\] (\S+) (E\w+): (.*) → exit (\d+) \(/` có mã khác 0. Khi lọc ra rỗng thì `if (doHead.length === 0) process.exit(0)`. Nhưng repin-lane còn đặt `red = true` vì những lý do không sinh ra dòng như thế. Thứ nhất là `cham.length > 0`: executor chạm vào hồ sơ đã thông Cổng Bằng chứng (repin-lane.mjs khoảng dòng 419). Thứ hai là eval có `expected_exit` khác 0 mà trả sai mã. Một đổi khuôn log bất kỳ của repin-lane cũng dẫn tới đó. Script không đối chiếu «làn đỏ» với «tập đỏ đã rút», nên một làn đỏ bị đọc thành «không eval nào đỏ» và E11 xanh.
  Vì sao thuộc AC-9: lời hứa «không làm đỏ thêm eval nào» của AC-9 không được kiểm chứng đúng khi làn ghim lại đỏ vì lý do không khớp mẫu dòng log.
  (nguồn: measurement)

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): «không làm đỏ thêm» chỉ kiểm mã thoát ở merge-base khác 0, không so mã**
  file: `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs:161`
  severity: medium
  AC: AC-9
  Lời hứa của E11/AC-9 là một quan hệ giữa kết quả ở HEAD và ở merge-base: eval đỏ ở HEAD thì đỏ theo cùng cách ở merge-base (số liệu S3 trong evals.yaml ghi «cả 46 đỏ cùng mã»). Code chỉ có `if (maLai === 0) chapChon…; else if (maGoc === 0) moi.push(…)`. Nó không so `maGoc` với `d.ma` hay `maLai`, cũng không so với `expected_exit` của eval. Ví dụ: ở HEAD một eval đỏ mã 1 vì hồi quy thật, còn ở cây merge-base nó đỏ mã 2 vì hạ tầng (canh-cay thoát 2, không dựng được cây). Script tính trường hợp đó là «không đỏ thêm». Tương tự, một eval có `expected_exit: N` chuyển từ N (xanh theo làn) ở merge-base sang M≠N ở HEAD cũng lọt qua.
  Vì sao thuộc AC-9: AC-9 hứa eval đỏ ở HEAD phải đỏ theo cùng cách (cùng mã) ở merge-base, nhưng script chỉ kiểm merge-base có khác 0 hay không mà không so mã, nên quan hệ mà AC-9 hứa chưa được kiểm đúng.
  (nguồn: measurement)

- **Hình dạng 6 (đo cây khác cây đang xét): lượt chạy lại trên cây merge-base của các eval đo qua URL vẫn đo máy chủ dev**
  file: `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs:152`
  severity: medium
  AC: AC-9
  `spawnSync("bash", ["-c", d.lenh], { cwd: cayGoc })` chạy lại đúng lệnh config trong worktree tạm `.acceptance-runs/tra-loi-tin-nhac/goc`, nhưng không đặt `APP_URL` hay `API_URL`. Khoảng 100 lệnh trong `_acceptance/config.yaml` có `APP_URL=${APP_URL:-http://localhost:3000}`, nên phía merge-base của các eval đó đo máy chủ dev đang nghe ở 3000, là máy chủ của checkout khác chứ không phải `cayGoc`. Cũng có thể canh-cay thoát 2 ở cả hai phía. Kết quả so HEAD với merge-base cho nhóm này vì thế luôn là «đỏ cả hai», và không bao giờ báo được một eval màn hình bị vòng này làm đỏ. Hợp đồng ghi rằng trong 46 eval đỏ có những eval «đo màn hình qua máy chủ dev», nên nhóm này nằm trong `doHead` thật.
  Vì sao thuộc AC-9: không đặt APP_URL/API_URL khi chạy lại ở cây merge-base khiến các eval đo qua máy chủ dev ngoài cây đang xét, nên phép so sánh HEAD với merge-base mà AC-9 hứa không phản ánh đúng cây merge-base.
  (nguồn: measurement)

- **Hình dạng 2 (dựng tay đúng khuôn bên đọc): ô «trần sát» gọi thẳng dungTin với ZALO.loi.goiY truyền tay, không qua đường gửi Zalo**
  file: `apps/agent/test/tra-loi-tin-nhac.integration.spec.ts:168`
  severity: medium
  AC: AC-1
  AC-1 hứa «văn bản gửi đi không vượt ZALO.tranKyTu kể cả dòng gợi ý». Ô duy nhất đo văn bản gửi đi thật (zalo-muoi-hai, dòng 127) theo pha-thu.md thì KHÔNG đỏ khi bỏ dòng gợi ý khỏi phép tính trần, vì tin hiếm khi sát trần. Ô được thêm để bù (dòng 153-175) tự gọi `dungTin("Sat", viec, khongLienKet, "tron", tran, ZALO.loi.goiY)` với `dongCuoi` do test truyền vào, rồi đo đầu ra của chính lời gọi đó. Nó không đi qua `guiQuaZalo`/`chayNhac`, là nơi quyết định có truyền `ZALO.loi.goiY` vào `dungTin` hay nối dòng gợi ý vào sau. Nếu `guiQuaZalo` thôi truyền `dongCuoi` và tự nối gợi ý sau khi cắt, ô này vẫn xanh.
  Vì sao thuộc AC-1: AC-1 hứa văn bản gửi đi không vượt trần kể cả dòng gợi ý, nhưng ô đo trực tiếp không đỏ và ô bù lại không đi qua guiQuaZalo/chayNhac thật, nên phần trần-kể-cả-gợi-ý của AC-1 chưa được đo qua đường gửi thật.
  (nguồn: measurement)

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): ô da-xoa và ke-hoach-dong chỉ ghim «Mục 2», không ghim lý do theo từng ô**
  file: `apps/agent/test/tra-loi-tin-nhac.integration.spec.ts:409`
  severity: low
  AC: AC-6
  AC-6 (b)(c) hứa câu trả lời «nêu 2 và lý do», và mỗi ô có lý do riêng: `ZALO.loi.buocDoi(so, "khong-co-buoc" | "ke-hoach-dong")`. Assert duy nhất về câu trả lời là `expect(motTraLoi(tra)).toContain("Mục 2")`, dùng chung cho cả hai ô. Đảo hay gộp hai lý do (bước bị xoá mà trả «kế hoạch đã đóng», hoặc ngược lại) thì cả hai ô vẫn xanh. Quan hệ ô → lý do không được đo.
  Vì sao thuộc AC-6: AC-6 (b)(c) hứa câu trả lời nêu số và đúng lý do tương ứng, nhưng assert chỉ kiểm chuỗi «Mục 2» dùng chung cho cả hai ô nên quan hệ ô-lý do mà AC-6 hứa chưa được kiểm.
  (nguồn: measurement)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The Zalo path writes its own permission check instead of using the rule the onboarding API uses**
    Người dùng thấy gì: Nếu sau này có người sửa danh sách quyền của vai trò okr, người trả lời qua Zalo và người thao tác trên màn hình kế hoạch có thể được cấp quyền đánh dấu xong khác nhau mà không ai nhận ra ngay.
    file: `apps/agent/agent/lib/tra-loi-nhac.ts`
    severity: low
    Đề xuất: known-limits

- **`datBuocXong` repeats the activity-row write that `ghiVet` already does in the API**
    Người dùng thấy gì: Nếu sau này có người chỉ sửa cách ghi lại lịch sử đánh dấu xong việc ở một trong hai chỗ mà quên chỗ còn lại, một số bản ghi lịch sử có thể thiếu thông tin mà không ai để ý ngay.
    file: `packages/db/src/onboarding-buoc.ts`
    severity: low
    Đề xuất: known-limits

- **nguong.ts: the activity window runs 24h past --den but the reminder window stops at --den, so correct Zalo 'xong' replies get counted as wrong marks**
    Người dùng thấy gì: Khi dùng script này để đo tỉ lệ trả lời đúng trên dữ liệu thật sau này, những lần trả lời đúng vào cuối ngày đo có thể bị tính nhầm thành đánh dấu sai, làm con số báo cáo không đáng tin.
    file: `_acceptance/tra-loi-tin-nhac/rang/nguong.ts`
    severity: medium
    Đề xuất: known-limits

- **ho-so-cham.mjs: process.exit inside the try skips the finally, so the merge-base worktree is not removed**
    Người dùng thấy gì: Khi lượt kiểm tra gặp lỗi cài đặt hoặc phát hiện phần nào đó bị hỏng, một bản sao tạm của kho có thể bị bỏ quên trên máy, chiếm dung lượng ổ đĩa cho tới lượt kiểm tra sau.
    file: `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho giá trị đúng): script ngưỡng được kiểm bằng toContain chuỗi con thay vì đúng dòng**
    Người dùng thấy gì: Bài kiểm để bảo đảm số liệu tỷ lệ hoàn thành và số lần đánh dấu nhầm hiển thị đúng có một kẽ hở nhỏ: nó có thể bỏ lọt một số trường hợp đếm sai lệch (ví dụ lệch thêm một chữ số), nghĩa là một lỗi đếm tương lai có thể không bị phát hiện ngay.
    file: `apps/agent/test/tra-loi-tin-nhac-nguong.integration.spec.ts`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
