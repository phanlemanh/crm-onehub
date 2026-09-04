---
schema_version: 1
feature: Màn Cài đặt nói tiếng Việt — cụm General và Currencies đọc đúng tiếng của người quản trị, kể cả ở những trạng thái màn hình không tự mở ra
slug: man-cai-dat-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-04T10:05:46Z
design_doc: docs/superpowers/specs/2026-09-04-man-cai-dat-noi-tieng-viet-design.md
---

# Acceptance Contract: man-cai-dat-noi-tieng-viet

## Context

Đội OneHub sắp dùng CRM này hằng ngày. Cài đặt là cụm một người quản trị phải mở
trong tuần đầu: đặt tên công ty, chọn model cho tác nhân, đặt hạn lưu trữ, cắm
khoá nghiên cứu, và xem mọi con số quy về đồng Việt Nam. Màn Currencies vừa đổi
sang VND tuần này — số đã là tiếng Việt, chữ quanh nó thì chưa.

Đợt này khoanh mười file: cụm gốc (8) và cụm currencies (2). 74 chuỗi người đọc
thấy — 54 trong JSX, 11 trong `toast.*()`, 9 tiêu đề tab và nhãn thanh bên. 33
file còn lại đi vòng sau.

**Lớp lỗi phải chặn, và nó đã ăn ba vòng liên tiếp: thước mù cho ra màu xanh
sai.** Bộ quét `chu-cung-jsx.mjs` của vòng ③a chỉ đi qua cây JSX, nên 20 trong
74 chuỗi ở đây nằm ngoài tầm nó. Vòng ③a từng đạt 16/16 tiêu chí máy mà còn 18
chỗ tiếng Anh. Vòng cửa vào từng có một phép đo báo xanh suốt vì nó quét đúng
cái file danh sách chứ không quét mã, và một phép đo khác đo nhầm màn vì đi theo
lệnh chuyển hướng.

Hai trạng thái trong lát này **màn hình không tự vẽ ra**, và chúng đi hai đường
khác nhau. Câu cho danh sách rỗng MỞ ĐƯỢC — một workspace mới chưa có tỷ giá và
chưa có deal nào, nên dựng ra được trên máy chủ thật. Câu dành cho người không
đủ quyền thì KHÔNG: phiên phát triển đăng nhập bằng chủ sở hữu, và kho chưa có
hạ tầng dựng component trong test. Nó đo ở mức mã, và giới hạn đó khai thẳng
trong AC-4 — ngay tại cổng, không để tới vòng chấm mới lộ ra.

Source input: prompt của chủ kho ("Đi tiếp 3b") · `_acceptance/handoff.md` ·
kiểm kê 74 chuỗi ngày 04/09 · Web Interface Guidelines (chữ dài ra, `translate`)

## Criteria

- AC-1: Given màn General và màn Currencies dựng trên máy chủ thật HAI LẦN — một lượt `vi`, một lượt `en` — When phép đo đọc chữ NGƯỜI ĐỌC THẤY của từng lượt (không đọc mã nguồn), Then ba vế cùng đúng: số chuỗi quan sát được ở hai lượt BẰNG nhau; mỗi cặp chuỗi cùng vị trí KHÁC nhau, trừ các giá trị của bảng miễn trừ AC-6; và mọi chuỗi của lượt `vi` mang dấu tiếng Việt. Tập quan sát rỗng là TỪ CHỐI ĐO — thoát mã 2, không phải một lượt đạt. Đây là tiêu chí bắt được lỗi mà đọc mã không bắt được: một trang server quên `await getLocale()` thì kho chuỗi vẫn đủ dấu và không còn chuỗi viết thẳng, nhưng cả màn hiện sai tiếng.
- AC-1b: Given mười file thuộc lát, When phép đo đọc mã, Then không còn chuỗi người-đọc-thấy nào viết thẳng trong JSX, ngoài các dòng miễn trừ có tên; và mọi dòng miễn trừ đều còn đối tượng thật.
- AC-2: Given BẢNG ĐÓNG mười một lời gọi `toast.*()` mang chuỗi viết thẳng — mỗi dòng khai file, số dòng, và HÌNH DẠNG lời gọi — When phép đo đọc mã của mười file, Then số lời gọi phép đo NHẬN RA BẰNG mười một; thiếu một dòng là TỪ CHỐI ĐO, thoát mã 2 và gọi tên dòng thiếu. Và mỗi câu đó đọc từ kho chuỗi, có bản tiếng Việt có dấu. Đếm số vật nhận ra, không chỉ số file đã mở: một chân đo mở đủ mười file mà chỉ nhận ra sáu trong mười một hình dạng vẫn cho ra ba con số file bằng nhau.
- AC-3: Given chín tiêu đề tab và nhãn thanh bên của lát (`export const metadata` và mảng khai thanh bên), When phép đo đọc mã, Then bảy nhãn dịch được đều đọc từ kho chuỗi và có bản tiếng Việt có dấu; hai tên thương hiệu giữ nguyên. Đây cũng là lớp bộ quét JSX không nhìn thấy.
- AC-4: Given hai câu giải thích vì sao ô bị khoá — chỉ hiện với người không phải chủ sở hữu và không phải quản trị — When phép đo đọc mã của hai file chứa chúng, Then cả hai câu đọc từ kho chuỗi (không viết thẳng) và bản tiếng Việt của chúng có dấu. **Giới hạn đã khai:** không phép đo nào của vòng này DỰNG RA trạng thái đó — kho chưa có hạ tầng dựng component trong test, và phiên phát triển đăng nhập bằng chủ sở hữu nên trình duyệt không bao giờ vẽ hai câu này. Điều được chứng là chuỗi đã nằm đúng chỗ, KHÔNG phải là màn hiện đúng.
- AC-5: Given ba trạng thái rỗng của lát — chưa có tỷ giá nào, chưa deal nào có số tiền, không model nào khớp ô tìm — When mỗi trạng thái được dựng, Then câu của nó hiện bằng tiếng Việt có dấu. Phép đo phải MỞ được từng trạng thái chứ không suy từ mã. **Bước gieo đã khai:** hai trạng thái đầu mở bằng cách tạo một workspace MỚI qua đúng luồng người dùng — workspace mới chưa có tỷ giá và chưa có deal nào; trạng thái thứ ba mở bằng cách gõ một chuỗi không khớp vào ô tìm model. Không cần chạm cơ sở dữ liệu.
- AC-6: Given các giá trị không được dịch của lát — tên thương hiệu và mã tiền tệ — When màn dựng ở cả hai thứ tiếng, Then tập ứng viên SINH TỪ MÀN THẬT (mọi phần tử mang `translate="no"`, hợp với mọi chuỗi hiện giống hệt nhau ở hai lượt) BẰNG bảng khai **theo cả hai chiều**: thiếu một dòng của bảng là thoát mã 2 và gọi tên dòng thiếu; và thừa một giá trị trên màn mà bảng không khai CŨNG là thoát mã 2 và gọi tên giá trị đó. Một bảng chỉ khớp với chính nó thì không đo được cái nó sinh ra để đo.
- AC-6b: Given tên workspace do người nhập — giá trị đổi theo từng workspace nên không đóng thành bảng được — When màn dựng, Then phần tử chứa nó mang `translate="no"`. Đo bằng luật, không đếm dòng.
- AC-7: Given chân đo mới cho chữ nằm ngoài JSX, When một câu tiếng Anh được cắm lại vào một bản sao của lát, Then chân đo ĐỎ và thông điệp gọi tên file cùng nguyên văn chuỗi bị cắm; và When lát ở trạng thái lành, Then chân đo XANH. Thiếu một trong hai chiều thì chân đo coi như CHƯA XONG — một thước chưa từng đỏ không phân biệt được "sạch" với "chưa chạy".
- AC-8: Given chân đo mới và chân ③a cùng chạy trên lát, When cả hai báo cáo, Then HAI HÀNG số cùng khớp. Hàng FILE: số file mỗi chân đọc được BẰNG dân số sinh từ đĩa. Hàng VẬT: số lời gọi toast chân mới nhận ra BẰNG số dòng bảng đóng AC-2, và số ô tiêu đề nhận ra BẰNG chín. Hàng vật là cái hàng file KHÔNG bắt được — một chân mở đủ mười file mà nhận ra 0 vật vẫn cho ba con số file bằng nhau. Lệch bất kỳ cặp nào là TỪ CHỐI ĐO — thoát mã 2 và in cả hai hàng kèm tên chân lệch.
- AC-9: Given dân số file của lát, When chân đo dựng danh sách, Then danh sách sinh từ việc quét thư mục trên đĩa, KHÔNG đọc từ một danh sách gõ tay. Thêm một file .tsx mới vào thư mục của lát thì lượt chạy kế phải tự thấy nó.
- AC-10: Given bản tiếng Việt dài hơn bản tiếng Anh chừng một phần tư, When hai màn dựng ở tiếng Việt tại bề rộng **360 pixel** (bề rộng hẹp nhất kho hỗ trợ), Then với MỌI phần tử mang nhãn dịch được: `scrollWidth` KHÔNG lớn hơn `clientWidth`. Lớn hơn là ĐỎ, kèm tên nhãn và hai con số — **không có miễn trừ cho `truncate` cố ý**, vì thiết kế bắt mọi vùng chứa nhãn phải mang `truncate`, nên một miễn trừ như thế phủ đúng tập cần bắt. Cùng phép đo chạy ở lượt tiếng Anh làm ĐỐI CHỨNG DƯƠNG: chỉ chỗ nào lượt `en` vừa mà lượt `vi` tràn mới là lỗi của bản dịch. Cột số của bảng tỷ giá giữ `tabular-nums`. Số phần tử đo được phải lớn hơn 0 — tập rỗng là thoát mã 2.

## Coverage

Quét theo khuôn ma trận kiểm thử. Ba trục, 100 ô, quét theo cặp.

- **Trục A — chữ sống ở đâu trong mã:** con trong JSX | thuộc tính JSX | toast | mảng metadata/thanh bên | thông điệp kiểm tra dữ liệu
  [thước CE: bộ quét `chu-cung-jsx.mjs` + kiểm kê 74 chuỗi ngày 04/09]
- **Trục B — màn đang ở trạng thái nào:** thường | không đủ quyền | đang gửi | rỗng/chưa cấu hình | lỗi
  [thước CE: `cua_vao_trang_thai_tam`, `cua_vao_dang_gui`, `cua_vao_loi_mang`; `canManage` tại `currency-settings.tsx:126` và `workspace-form.tsx:155`]
- **Trục C — hạng của chữ:** nhãn dịch được | tên thương hiệu | dữ liệu người nhập | định danh kỹ thuật
  [thước CE: `rang_du_lieu_khong_dich`, `cua_vao_khong_dich`; luật `translate="no"`]

Ô Core → AC: A=JSX×B=thường → AC-1 · A=toast → AC-2 · A=metadata → AC-3 ·
B=không đủ quyền → AC-4 · B=rỗng → AC-5 · C=không dịch → AC-6.
Cross-cutting: chữ dài ra → AC-10 · dấu tiếng Việt → nằm trong AC-1..AC-5 ·
thước phải từng đỏ → AC-7, AC-8, AC-9.

Giá trị trục A "thông điệp kiểm tra dữ liệu" đưa sang Later: lát này không có
schema zod nào mang chữ người đọc thấy. Không dòng `[GIẢ ĐỊNH]` nào — cả ba
trục đều truy được về vật có thật trong kho.

## Out of scope

- 33 file còn lại của cụm Cài đặt: tracking, connections, api-keys, members, sso — 135 chuỗi trong JSX. Đi vòng sau, chạy bằng thước vòng này dựng.
- 39 lời gọi toast chuyển tiếp `error.message` từ API. Câu chữ sinh ở `apps/api/src/{sso,api-keys,workspace,tracking,users}` — nằm trong `t3_paths`, kéo vào là đổi hạng vòng và thêm một cổng duyệt kế hoạch.
- Đổi bố cục, đổi component, đổi luồng. Vòng này chỉ đổi chữ.
- Dịch tên thương hiệu (Google Workspace, Microsoft 365, Slack) và mã tiền tệ.

## Notes
