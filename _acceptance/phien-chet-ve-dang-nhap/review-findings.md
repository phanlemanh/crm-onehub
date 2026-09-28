## Trong hợp đồng

Không có phát hiện nào map được vào AC nào của vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **An API database error now sends live users to /sign-in, because the API also answers 401 when it cannot read the session**
    Người dùng thấy gì: Nếu máy chủ API tự gặp sự cố khi đọc phiên (ví dụ lỗi cơ sở dữ liệu), một người vẫn đang đăng nhập hợp lệ có thể bị đưa oan về màn hình đăng nhập.
    file: `apps/app/lib/onboarding.ts:45`
    severity: medium
    Đề xuất: known-limits

- **/het-quyen checks the session by hand instead of using the existing requireSession()**
    Người dùng thấy gì: Nếu quy tắc chuyển hướng khi hết phiên thay đổi sau này ở nơi khác, trang «hết quyền» có thể không tự động theo kịp, nhưng hiện tại người dùng không thấy khác biệt gì.
    file: `apps/app/app/(landing)/het-quyen/page.tsx:15`
    severity: low
    Đề xuất: wont-fix

- **A test feeds workspace.get a null slug, which cannot happen under the output schema, and trang-goc.ts adds a check for it**
    Người dùng thấy gì: Bài kiểm tự động dùng một dữ liệu giả không đúng với thực tế hệ thống, điều này không ảnh hưởng tới trải nghiệm của người dùng thật nhưng có thể gây nhầm lẫn khi ai đó bảo trì bài kiểm sau này.
    file: `apps/app/test/phien-chet-trang-goc.dom.tsx:110`
    severity: low
    Đề xuất: known-limits

- **Proxy now treats a 401 from workspace.get as proof the session is dead, but the API also returns 401 when its own session lookup fails**
    Người dùng thấy gì: Khi máy chủ API gặp trục trặc nội bộ lúc đọc phiên, một người dùng còn phiên hợp lệ có thể bị lặp đi lặp lại giữa trang chính và màn đăng nhập cho tới khi trình duyệt báo lỗi.
    file: `apps/app/proxy.ts:72`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): E10 kiểm «thân không chứa NEXT_REDIRECT» trên một thân luôn rỗng**
    Người dùng thấy gì: Bài đo tự động cho vòng này có một phép kiểm không thể phát hiện sai sót thật sự trong một số trường hợp, nên một lỗi ở đó có thể không bị bắt lại ở lần đo sau, dù chưa có bằng chứng người dùng thật đang bị ảnh hưởng.
    file: `_acceptance/phien-chet-ve-dang-nhap/rang/do-man.mjs:125`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): lệnh của E2 `-t giu-mo` chỉ chạy các assert «không chuyển hướng», không có đối chứng dương**
    Người dùng thấy gì: Bài kiểm tự động cho trường hợp này chỉ chạy phần khẳng định «không chuyển hướng» mà thiếu phần đối chứng «có chuyển hướng đúng lúc», nên nếu về sau có lỗi khiến trang không còn chuyển hướng khi cần, bài kiểm có thể không phát hiện ra.
    file: `apps/app/test/onboarding-gate.spec.ts:633`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).