---
schema_version: 1
feature: Màn Cài đặt nói tiếng Việt — cụm General và Currencies đọc đúng tiếng của người quản trị, kể cả ở những trạng thái màn hình không tự mở ra
slug: man-cai-dat-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: signed-off
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

Đợt này khoanh mười file: cụm gốc (8) và cụm currencies (2). 75 chuỗi người đọc
thấy — 54 trong JSX, 12 trong `toast.*()`, 9 tiêu đề tab và nhãn thanh bên. 33
file còn lại đi vòng sau.

Con số toast sửa từ 11 lên 12 khi bảng đóng được kê từ chính mã: lượt đếm đầu
đếm chuỗi khớp mẫu, không đếm chỗ gọi, nên bỏ sót một `chuoi-mau`.

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
- AC-2: Given BẢNG ĐÓNG **mười hai** lời gọi `toast.*()` mang chữ — mỗi dòng khai file, số dòng, và HÌNH DẠNG lời gọi — When phép đo đọc mã của mười file, Then tập lời gọi phép đo NHẬN RA BẰNG tập bảng khai theo CẢ HAI CHIỀU — thiếu một mục hoặc thừa một mục đều là TỪ CHỐI ĐO, thoát mã 2 và gọi tên mục đó. Bảng ghim `(file, khoá kho chuỗi)`, KHÔNG ghim số dòng hay hình dạng cú pháp: cả hai là tính chất của cây CHƯA dịch. Dịch xong thì cả mười hai lời gọi đều đọc `t.x.y` nên chỉ còn MỘT hình dạng — mọi câu nói về sự đa dạng hình dạng đều tả một cái cây không còn tồn tại. Và mỗi câu đó đọc từ kho chuỗi, có bản tiếng Việt có dấu. Đếm số vật nhận ra, không chỉ số file đã mở: một chân đo mở đủ mười file mà nhận ra mười hai mục SAI vẫn cho ra đúng con số mười hai.
- AC-3: Given chín ô `title` của lát (`export const metadata` và mảng khai thanh bên), When phép đo đọc mã, Then số ô nhận ra BẰNG chín — lệch là thoát mã 2; tám nhãn dịch được đều đọc từ kho chuỗi và có bản tiếng Việt có dấu; và mỗi ô nhãn thanh bên phải GIẢI ĐƯỢC qua nhóm `thanhBen` của kho chuỗi — một ô mang chuỗi viết thẳng làm chân ĐỎ. `SSO` giữ nguyên văn, và nó được canh ở HAI chỗ khác chứ không ở đây: dòng `SSO` của bảng không-dịch (AC-6, đối chiếu hai chiều trên màn thật) và miễn trừ có tên `thanhBen.sso` của bộ canh kho chuỗi. Lát này KHÔNG có tên thương hiệu nào trong ô `title`.
- AC-4: Given hai câu giải thích vì sao ô bị khoá — chỉ hiện với người không phải chủ sở hữu và không phải quản trị — When phép đo đọc CÂY CÚ PHÁP của hai file chứa chúng, Then mỗi file còn MỘT NÚT đọc đúng khoá kho chuỗi đã khai, và bản tiếng Việt của khoá đó mang dấu. Xoá hẳn khối điều kiện đi làm chân ĐỎ — đây là ô duy nhất không có phép đo nào khác đỡ, nên nó phải bắt được cả việc MẤT câu, không chỉ việc câu bị đổi. **Giới hạn đã khai:** không phép đo nào của vòng này DỰNG RA trạng thái đó — kho chưa có hạ tầng dựng component trong test, và phiên phát triển đăng nhập bằng chủ sở hữu nên trình duyệt không bao giờ vẽ hai câu này. Điều được chứng là chuỗi đã nằm đúng chỗ, KHÔNG phải là màn hiện đúng.
- AC-5: Given ba trạng thái rỗng của lát — chưa có tỷ giá nào, chưa deal nào có số tiền, không model nào khớp ô tìm — When mỗi trạng thái được dựng, Then câu của nó hiện bằng tiếng Việt có dấu. Phép đo phải MỞ được từng trạng thái chứ không suy từ mã. **Giới hạn đã khai, phát hiện ở S3:** chỉ ô thứ ba đo được — gõ một chuỗi không khớp vào ô tìm model, màn trả *"Không model nào khớp."* Hai ô đầu KHÔNG dựng được: kho này chạy **một workspace duy nhất**, không thủ tục tRPC nào tạo workspace mới và không điều khiển nào trên màn làm việc đó. Không có workspace mới thì không có màn *"chưa có tỷ giá nào"* và *"chưa deal nào có số tiền"*. Phép đo TỪ CHỐI ĐO (thoát mã 2) và gọi tên hai ô thiếu — nó KHÔNG hạ xuống đọc mã rồi ghi đạt. Điều được chứng là một trong ba ô, KHÔNG phải cả ba.
- AC-6: Given các giá trị không được dịch của lát — tên thương hiệu và mã tiền tệ — When màn dựng ở cả hai thứ tiếng, Then tập ứng viên SINH TỪ MÀN THẬT (mọi phần tử mang `translate="no"`, hợp với mọi chuỗi hiện giống hệt nhau ở hai lượt) BẰNG bảng khai **theo cả hai chiều**: thiếu một dòng của bảng là thoát mã 2 và gọi tên dòng thiếu; và thừa một giá trị trên màn mà bảng không khai CŨNG là thoát mã 2 và gọi tên giá trị đó. Một bảng chỉ khớp với chính nó thì không đo được cái nó sinh ra để đo.
- AC-6b: Given tên workspace do người nhập — giá trị đổi theo từng workspace nên không đóng thành bảng được — When màn dựng, Then phần tử chứa nó mang `translate="no"`. Đo bằng luật, không đếm dòng.
- AC-7: Given chân đo mới cho chữ nằm ngoài JSX, When một câu tiếng Anh được cắm lại vào một bản sao của lát, Then chân đo ĐỎ và thông điệp gọi tên file cùng nguyên văn chuỗi bị cắm; và When lát ở trạng thái lành, Then chân đo XANH. Thiếu một trong hai chiều thì chân đo coi như CHƯA XONG — một thước chưa từng đỏ không phân biệt được "sạch" với "chưa chạy".
- AC-8: Given chân đo mới và chân ③a cùng chạy trên lát, When cả hai báo cáo, Then HAI HÀNG số cùng khớp. Hàng FILE: số file mỗi chân đọc được BẰNG dân số sinh từ đĩa. Hàng VẬT: số lời gọi toast chân mới nhận ra BẰNG số dòng bảng đóng AC-2, và số ô tiêu đề nhận ra BẰNG chín. Hàng vật là cái hàng file KHÔNG bắt được — một chân mở đủ mười file mà nhận ra 0 vật vẫn cho ba con số file bằng nhau. Lệch bất kỳ cặp nào là TỪ CHỐI ĐO — thoát mã 2 và in cả hai hàng kèm tên chân lệch.
- AC-9: Given dân số file của lát, When chân đo dựng danh sách, Then danh sách sinh từ việc quét thư mục trên đĩa, KHÔNG đọc từ một danh sách gõ tay. Thêm một file .tsx mới vào thư mục của lát thì lượt chạy kế phải tự thấy nó.
- AC-10b: Given chân đo bề rộng, When một nhãn tiếng Việt dài được cắm vào kho chuỗi trên một phần tử KHÔNG cho xuống dòng, Then chân ĐỎ ở đúng chiều nó sinh ra để bắt — lượt `vi` tràn trong khi lượt `en` vừa — và in cả hai cặp số. Và cây làm việc trở về đúng trạng thái trước khi chạy. Một thước chưa từng đỏ ở CHIỀU CỦA NÓ thì không phân biệt được "bản dịch vừa" với "phép đo mù"; chân bề rộng xanh suốt cho tới khi tiêu chí này ép nó đỏ.
- AC-11: Given mười file của lát, When phép đo lấy MỌI chuỗi trong chúng rồi TRỪ theo luật có tên — chuỗi nhập khẩu, chỉ thị, thuộc tính kỹ thuật, hàm kỹ thuật, và bản khai giữ-nguyên — Then không chuỗi nào còn lại là tiếng Anh. Dân số sinh bằng cách quét CẢ file, KHÔNG bằng cách liệt kê từng chỗ nấp: lối liệt kê đã bỏ sót ba lần liên tiếp trong chính vòng này (chữ trong JSX, rồi toast, rồi tiêu đề, rồi chuỗi trong toán tử ba ngôi), nên cái phải chặn là LỚP, không phải từng thể hiện. Quét ra 0 chuỗi là TỪ CHỐI ĐO — bộ quét hỏng chứ không phải lát sạch. Mỗi dòng giữ-nguyên phải còn đối tượng thật; dòng chết làm chân ĐỎ.
- AC-10: Given bản tiếng Việt dài hơn bản tiếng Anh chừng một phần tư, When hai màn dựng ở tiếng Việt tại bề rộng **360 pixel** (bề rộng hẹp nhất kho hỗ trợ), Then với MỌI phần tử mang nhãn dịch được: `scrollWidth` KHÔNG lớn hơn `clientWidth`. Lớn hơn là ĐỎ, kèm tên nhãn và hai con số — **không có miễn trừ cho `truncate` cố ý**, vì thiết kế bắt mọi vùng chứa nhãn phải mang `truncate`, nên một miễn trừ như thế phủ đúng tập cần bắt. Cùng phép đo chạy ở lượt tiếng Anh làm ĐỐI CHỨNG DƯƠNG: chỉ chỗ nào lượt `en` vừa mà lượt `vi` tràn mới là lỗi của bản dịch. Cột số của bảng tỷ giá giữ `tabular-nums`. Số phần tử đo được phải lớn hơn 0 — tập rỗng là thoát mã 2.

  **Giới hạn của chính phép đo, đo được ở S3:** `scrollWidth > clientWidth` chỉ bắt chỗ chữ bị CẮT — vùng chứa cho xuống dòng thì nó nở ra và không bao giờ tràn ngang, nên phép đo mù với chúng. Đã kiểm bằng cách cắm một nhãn tiếng Việt dài gấp ba vào kho chuỗi: nhãn lên tới màn thật mà chân vẫn báo 0. Thêm chiều dọc (`scrollHeight > clientHeight`) cũng không đổi, vì vùng chứa không có chiều cao cố định. Kết luận: trên hai màn này nhãn dài KHÔNG làm vỡ bố cục, nhưng điều phép đo chứng được chỉ là **không có chỗ nào bị cắt**, không phải "mọi nhãn đều vừa mắt".

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

### Known limits

- **Hai trong ba ô rỗng của màn Currencies chưa ai nhìn thấy trên màn thật.** Kho chạy một workspace duy nhất, không thủ tục nào tạo workspace mới. Phép đo từ chối đo (thoát mã 2) và gọi tên hai ô — nó không hạ xuống đọc mã rồi ghi đạt. Đo được 1/3 ô.
- **Trạng thái không đủ quyền đo ở mức mã, không ở mức màn.** Kho chưa có hạ tầng dựng component trong test, và phiên phát triển đăng nhập bằng chủ sở hữu. Điều được chứng: mỗi ô còn một nút đọc đúng khoá kho chuỗi, và bản tiếng Việt của khoá đó mang dấu — xoá hẳn khối điều kiện đi thì chân ĐỎ, và nó là chân DUY NHẤT đỏ vì đó. Điều KHÔNG được chứng: màn hiện đúng cho người không đủ quyền.
- **Phép đo bề rộng chỉ bắt chỗ chữ bị CẮT.** Vùng chứa cho xuống dòng thì nở ra, nên nhãn dài không làm nó đỏ — đã kiểm bằng cách cắm một nhãn dài gấp ba và xác nhận nhãn lên tới màn thật. Trên hai màn này nhãn dài không làm vỡ bố cục, nhưng điều chứng được chỉ là "không có chỗ nào bị cắt".
- **Hàng FILE của phép đối chiếu không thể lệch.** Bộ quét ③a vọng lại danh sách đầu vào thay vì đếm file nó thật sự mở, nên bốn ô của hàng đó là cùng một số theo đại số. Hàng VẬT thì thật và đối chiếu theo tập. Sửa bộ quét ③a là chạm vào thước của một hồ sơ đã ký, nên ghi thành nợ có tên, trả trước khi mở đợt 33 file.
- **Bộ thước của vòng chỉ được nửa cái thước.** `_acceptance/**/*.mjs` không nằm trong `lint` — biome chạy theo workspace và `_acceptance` không thuộc workspace nào. Nhưng `lint:slop` CÓ quét nó: oxlint chạy từ gốc và `.oxlintrc.json` không loại trừ `_acceptance`.
