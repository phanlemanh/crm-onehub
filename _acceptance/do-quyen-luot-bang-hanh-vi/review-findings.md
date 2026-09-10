# Review Findings: do-quyen-luot-bang-hanh-vi (round 4)

## Trong hợp đồng

### tenKhoa() bỏ qua computed key không phải string literal — chỗ ghi commandType leo quyền tàng hình với cả hai răng, cổng vẫn thoát 0
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/ast.mjs:80`
- severity: high
- source: bugs
- AC: AC-2, AC-3

tenKhoa() chỉ giải được ComputedPropertyName khi biểu thức bên trong là StringLiteral hoặc NoSubstitutionTemplateLiteral; mọi computed key khác trả null, nên laKhoa() coi node đó KHÔNG mang khoá commandType. Hệ quả: node biến mất khỏi dân số, không bị đếm, không làm lệch ma trận đã ghim, không in ra đâu cả.

Đã chạy hai probe, cả hai đều thoát 0:

1) nguon-ghi.mjs (AC-3, tuyên "MA TRAN TOAN PHAN" trên apps/api/src). Chép apps/api/src sang cây thử, thêm apps/api/src/leo/leo.ts:

    const KHOA = "commandType" as const;
    db.agentConversationSubmission.create({
      data: { conversationId: id, [KHOA]: "CREATE_AGENT" },
    });

   `node rang/nguon-ghi.mjs --goc <cây thử>` → in đúng 9 phần tử cũ, "khop dung danh sach da ghim", EXIT=0. Một chỗ ghi thẳng CREATE_AGENT ghim cứng không xuất hiện ở đâu.

2) khong-cam-tin-nhan.mjs (AC-2 điểm 3, tuyên: tại MỌI lời gọi builderSessionAttributes, initializer của commandType phải là truy cập thuộc tính trần). Chép apps/agent/agent sang cây thử, thêm lib/leo-quyen.ts gọi builderSessionAttributes lần thứ hai với

    const KHOA = "commandType" as const;
    builderSessionAttributes({
      [KHOA]: JSON.stringify(row.message).includes("agent") ? "CREATE_AGENT" : row.commandType,
      ...
    });

   → "khong-cam-tin-nhan: 123 tep, 2 cho goi builderSessionAttributes, ma tran 6 khoa — sach", EXIT=0. Đúng luật suy quyền từ hình dạng tin nhắn mà AC-2 sinh ra để cấm, đi qua sạch.

Ghi chú: ở apps/agent, việc THAY một khoá đã ghim bằng computed key thì bị bắt (ma trận 6→5), nhưng THÊM một chỗ mới thì lọt — và thêm mới mới là đường leo quyền thật.

Sửa: trong tenKhoa(), khi ComputedPropertyName có expression không phải literal, đừng trả null im lặng — trả một sentinel để laKhoa()/ma trận bắt buộc phải khai báo nó, hoặc báo lỗi "khoá tính toán không đọc được" ngay tại chỗ.

Rationale (map AC): Đã chứng minh bằng hai probe cụ thể: một chỗ ghi commandType qua computed key không phải literal lọt qua cả phép đo của AC-3 (ma trận toàn phần trên apps/api/src) lẫn điều 4 của AC-2 (ma trận khoá apps/agent), đúng hình dạng mà cả hai AC nêu tường minh phải bắt được ('kể cả... computed key').

### Kiểm "thông điệp chứa chuỗi ghim" của khai-sinh.mjs là vô hiệu với E2/E5: chính răng in sẵn chuỗi ghim ra băng-rôn bất kể kết quả
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs:91`
- severity: low
- source: bugs
- AC: AC-7

E8 điểm 3 tuyên: mỗi dòng khai phải có "thong diep (stdout + stderr) CHUA nguyen van chuoi `ghim`" — lớp kiểm độc lập thứ hai xác nhận cái đỏ đúng là cái đã hứa. khai-sinh.mjs:91 thực hiện bằng `r.chu.includes(dong.ghim)`.

Với các dòng E2 (cong-quyen-do.mjs) và E5 (mang-theo-do.mjs), `ghim` là tên bài test ("suy-dien: hang khai CHAT thi cong dong", "ke-thua: doc duoc ca hai chieu tren cung khuon"). Nhưng cong-quyen-do.mjs:90-98 và mang-theo-do.mjs:58-66 in băng-rôn chẩn đoán chứa NGUYÊN VĂN chuỗi đó ra stdout, không điều kiện, TRƯỚC mọi nhánh phán xử:

    `  bai mang loi hua "${BAI_PHAI_DO}": ${coBai ? "CO DO" : "KHONG DO"}`

Và `chay()` (chung.mjs:236) gộp stdout + stderr vào `chu`. Nên `includes(dong.ghim)` luôn đúng, kể cả khi băng-rôn ghi "KHONG DO". Lớp kiểm thứ hai của E8 không phân biệt được gì cả với hai eval này; nó chỉ còn dựa vào so mã thoát.

Sửa: đặt `ghim` cho các dòng E2/E5 là một chuỗi chỉ xuất hiện khi bài đúng tên đó đỏ (ví dụ dòng `(fail)` của bun), hoặc để răng thôi in nguyên văn tên bài trong băng-rôn thành công.

Rationale (map AC): AC-7 đòi tường minh lớp kiểm độc lập thứ hai — thông điệp chứa nguyên văn chuỗi ghim — và đã chứng minh lớp kiểm này luôn đúng với E2/E5 bất kể kết quả thật, nên tiêu chí này thất bại trên hai dòng khai đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **tu-kiem-khung.mjs ghi đè tệp nguồn có theo dõi trong cây làm việc thật, và không nằm trong sổ executor**
  Người dùng thấy gì: Nếu quá trình kiểm tra tự động bị dừng đột ngột giữa chừng (ví dụ bấm Ctrl-C), một file mã nguồn thật trong nhánh làm việc có thể bị để lại ở trạng thái đã sửa mà không được khôi phục lại, ảnh hưởng tới người làm việc tiếp trên cùng nhánh.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **BuilderAuthRow bắt buộc trường message nhưng builderSessionAuthFromRow không bao giờ đọc**
  Người dùng thấy gì: Một mục dữ liệu không còn thực sự cần thiết vẫn buộc phải khai khi dựng thông tin xác thực cho một lượt, khiến việc viết thêm kịch bản thử nghiệm sau này phải bịa ra dữ liệu giả không mang ý nghĩa gì.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Executor dq_mang_theo_do khai trong config nhưng không eval nào trỏ tới**
  Người dùng thấy gì: Một mục cấu hình cũ không còn được dùng vẫn nằm trong sổ đăng ký, có thể gây nhầm lẫn cho người đọc sổ này sau này nhưng không ảnh hưởng gì tới người dùng sản phẩm.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **don() nuốt lỗi `git worktree remove` bằng catch rỗng — đăng ký worktree rác tích lại trong git dir dùng chung, không ai được báo**
  Người dùng thấy gì: Việc dọn các bản sao tạm dùng để chạy kiểm tra có thể thất bại âm thầm, để lại rác tích tụ dần trong hạ tầng dùng chung mà không có cảnh báo nào cho người vận hành.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **giuKhoa() phá khoá của tiến trình còn sống sau 120s, rồi chủ cũ xoá tiếp khoá của chủ mới — loại trừ lẫn nhau quanh `git worktree add` mất tác dụng, im lặng**
  Người dùng thấy gì: Khi nhiều lượt kiểm tra chạy đồng thời, một lượt có thể bị chiếm mất tài nguyên tạm đang dùng dở mà không có cảnh báo, khiến kết quả của các lượt chạy song song khó tin cậy hoàn toàn trong một số trường hợp hiếm.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính không ghim thông điệp, trong khi hàm có hai đường ném khác nhau**
  Người dùng thấy gì: Bài kiểm tra này vẫn báo đúng ngay cả khi lý do từ chối thật sự thay đổi, nên nếu cổng chặn dựng tác nhân bị nới lỏng nhầm trong tương lai, bài kiểm tra có thể không phát hiện ra.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Ba luật của E6 chỉ có một vecto, và vecto đó kích hoạt hai luật cùng lúc**
  Người dùng thấy gì: Một trong ba điều kiện mà bài kiểm tự nhận là đã bảo vệ thật ra chưa từng được thử nghiệm riêng lẻ, nên nếu chỉ riêng điều kiện đó bị phá vỡ sau này, hệ thống kiểm tra có thể không phát hiện ra.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

### Tuyên quét LỚP nhưng chỉ có điểm-case: ma trận E4 không phân biệt được nguồn của giá trị ghi
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:49`
- severity: high
- source: measurement

loaiCua() xếp loại `khai` cho BẤT KỲ initializer nào là PropertyAccessExpression có tên cuối là `commandType` (dòng 48-54): chỉ kiểm `ts.isPropertyAccessExpression(dau) && dau.name.text === "commandType"`, không ràng buộc `dau.expression` phải là một định danh trần. Khoá ma trận lại là `<file> :: <hàm bao> :: <loại>` với số dòng bị cắt (dòng 80: `vt.replace(/:\d+$/, "")`), nên một chỗ ghi suy quyền từ tin nhắn vẫn giữ nguyên khoá và ma trận vẫn khớp DA_GHIM.

Đã chứng minh trên bản sao apps/api/src: đổi `conversations.service.ts:424` từ `commandType: input.commandType,` thành `commandType: doanQuyen(input.message).commandType,` → `node rang/nguon-ghi.mjs --goc <bản sao>` in "9 cho viet khoa commandType, khop dung danh sach da ghim" và thoát 0. Đổi thành `commandType: input.message.commandType,` cũng thoát 0. Đúng hai hình dạng mà AC-3 tồn tại để cấm.

Đây chính là bài học mà chan-đo anh em đã ghi thành mã: rang/khong-cam-tin-nhan.mjs dùng laTruyCapTran() (dòng 40-47) bắt buộc `ts.isIdentifier(dau.expression)`, và E3 điểm 3 nói thẳng "'La mot PropertyAccessExpression' la khong du: `row.message.commandType` cung la PropertyAccessExpression". nguon-ghi.mjs không mang ràng buộc đó. Tám vecto khai của E4 đều không đi qua lỗ này ("ghim-cung" → string literal, "bien-trung-gian" → CallExpression trần, cả hai rơi vào `khac`), nên chiều đỏ của E4 chỉ chứng minh được đúng các điểm-case mà vecto chạm tới, không chứng minh được lớp "mọi chỗ ghi đều lấy từ hai nguồn đã đặt tên" như expected tuyên.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).