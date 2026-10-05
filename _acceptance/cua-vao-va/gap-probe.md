---
slug: cua-vao-va
at: 2026-10-04T21:35:32Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-11 bắt soi-ma xanh ở clone nông nhưng đòi danh sách rút từ cặp sha d864d529 — clone nông không có đối tượng đó; không nói danh sách lấy thế nào | Cài theo nghĩa đen thì nơi clone nông thoát «bad object», E13 đỏ dù cài đúng; ghi tay danh sách thì không phép đo nào kiểm nó bằng diff thật, chép sót một tệp thì vạch (a) mù đúng tệp đó | Danh sách đóng băng commit trong hồ sơ; E13 so tập với git diff của merge ở nơi đủ lịch sử, in hiệu hai chiều; chiều đỏ xoá một dòng | fixed: AC-11 khai tệp đóng băng tep-vong.txt + vế so tập + chiều đỏ xoá dòng; E13 thêm dòng so tập; design mục Nợ thước sửa theo |
| P1 | evals | Ma trận E2 viết tay ba lớp; E8 chỉ gọi thật workspace.get, không gọi thủ tục research mà proxy cũng hỏi | Một thủ tục dùng middleware riêng hoặc tự kiểm phiên vẫn trả 401 khi CSDL lỗi; proxy đá người về /sign-in qua cổng research; E1–E3, E4, E7 vẫn xanh | E2 quét mọi thủ tục trả 401 khi null rồi đòi 503 khi ném, so hai tập; E8 gọi thật thủ tục research | fixed: AC-2 thêm vế «không thủ tục nào sót»; E2 thêm ca quet-het rút từ router thật (tập A = tập B, &#124;A&#124; > 3); E8 thêm settings.researchKey 503 |
| P1 | evals | AC-13 hứa không className đổi màu/góc/khoảng cách trên component @crm/ui nhưng E15 chỉ chạy design-gate, vốn không bắt rounded-[7px]/bg-[#hex] | Button className rounded-[7px] bg-[#006B4F] px-6 trong trang-loi-tam.tsx: design-gate 0 P0, E15 xanh, AC-13 ký đạt dù đúng mẫu docs/design.md trả lại | Quét JSX năm tệp: phần tử nhập từ @crm/ui không mang lớp màu/góc/khoảng cách; ma trận đỏ ba ô | fixed: AC-13 viết lại theo quét JSX; E15 thêm rang/khong-ghi-de.mjs, đối chứng dương năm tệp = 0, chiều đỏ ba ô rounded-[7px] / bg-[#ff0000] / px-6 |
| P2 | evals | E5, E6 dựng error.tsx rời; E7 chấp nhận «đầu trang hoặc khung con tuỳ cấp» nên không phép đo nào kiểm cấp nào bắt lỗi trên màn thật | [slug]/error.tsx đặt sai cấp hoặc (app)/error.tsx không bao được layout [slug]; E5, E6, E7 vẫn xanh; Cổng 2 ký «đầu trang còn» không bằng chứng | Ghim trước cấp bắt lỗi cho từng cảnh, đo có/không phần tử đầu trang, mỗi cấp một dòng | fixed: AC-5/AC-6 ghim tình huống của từng cấp; E7 hai cảnh csdl-loi → (app)/error.tsx không đầu trang, api-503 → [slug]/error.tsx có đầu trang, mỗi cảnh một dòng DUNG/SAI |
| P2 | evals | E10 thiếu ô «đã gửi» ở 1440 (3/4 ô); E11 chỉ đo hàm với chuỗi hằng, không đo chuỗi ba nơi gọi truyền vào | Logo sai chỗ ở «đã gửi» 1440 không ai bắt; một nơi gọi truyền error.message hoặc chuỗi en thì người vẫn đọc tiếng Anh, E11 vẫn xanh | E10 đủ 4 ô + dòng đếm; ma trận ba nơi gọi có chiều đỏ | fixed: E10 ma trận 4 ô + dòng đếm 4/4; thêm E16 (AC-9) quét AST ba nơi gọi signOutAndRedirect — không .message, truy về khoá messages có bản vi; chiều đỏ app-header đổi sang error.message |
